#!/usr/bin/env python3
"""驾驶 HMI 实验 · 数据汇总。

用法：python3 analyze.py [数据目录] [--out 输出目录]
读取 <被试>_<会话>_frames.csv / _events.csv / _cues.csv / _meta.json，输出：
  summary_events.csv   危险事件（请接管）：按被试 × 段，提前发现率、按键反应
  summary_load.csv     注意力分配：按被试 × 段，各视线区域的时间占比、驾驶员监测触发次数
  summary_risk.csv     按被试 × 段 × 风险高低：看路比例、看手机比例
  summary_learning.csv 每人一行：三段各自「看向线索比例」、第三段减第一段的差值、按线索类型的分项
只依赖 Python 标准库。
"""
import argparse, csv, glob, json, os, statistics
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROAD = {'road_ahead', 'hud'}
AOI_GROUPS = {
    'road': ROAD, 'mirror': {'rear_mirror', 'mirror_left', 'mirror_right'}, 'cluster': {'cluster'},
    'phone': {'phone'}, 'center_screen': {'center_screen'}, 'side': {'left_side', 'right_side'},
}
SEGS = ['1', '2', '3']
CUE_TYPES = ['parked_front', 'bus_stop', 'blind_junction', 'door_zone', 'cyclist', 'lead_brake']


def read_csv(path):
    if not os.path.exists(path):
        return []
    with open(path, newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def fnum(v, default=None):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def ratio(a, b, nd=3):
    return '' if not b else round(a / b, nd)


def sessions(data_dir):
    for meta_path in sorted(glob.glob(os.path.join(data_dir, '*_meta.json'))):
        base = meta_path[:-len('_meta.json')]
        with open(meta_path, encoding='utf-8') as f:
            meta = json.load(f)
        if meta.get('record'):          # 录像模式的会话不进汇总
            continue
        yield {'base': base, 'pid': meta.get('pid', ''), 'sid': meta.get('sid', ''), 'cond': meta.get('cond', ''),
               'sim': int(bool(meta.get('sim'))), 'meta': meta}


def segment_timeline(events):
    """[(开始时刻, 段号)]，用来给事件定段。"""
    tl = [(fnum(e['t_sim'], 0.0), e['value']) for e in events if e['type'] == 'segment']
    return tl or [(0.0, '1')]


def seg_at(tl, t):
    seg = tl[0][1]
    for t0, s in tl:
        if t >= t0:
            seg = s
    return seg


def summarize_events(ses, events):
    tl = segment_timeline(events)
    hz = {}
    for e in events:
        hid = e.get('hazard_id')
        if not hid or not hid.startswith('H'):
            continue
        h = hz.setdefault(hid, {'type': e.get('hazard_type', '')})
        t = fnum(e['t_sim'], 0.0)
        if e['type'] == 'hmi_warn':
            h['t_warn'] = t
        elif e['type'] == 'hmi_takeover':
            h['t_take'] = t
        elif e['type'] in ('look_before_warn', 'first_look') and 't_look' not in h:
            h['t_look'] = t
        elif e['type'] == 'response':
            h['rt'] = fnum(e['value'])
    rows = []
    for seg in SEGS + ['all']:
        hs = [h for h in hz.values() if 't_take' in h and (seg == 'all' or seg_at(tl, h['t_take']) == seg)]
        early = [h for h in hs if 't_look' in h and h['t_look'] <= h['t_take']]
        rts = [h['rt'] for h in hs if h.get('rt') is not None]
        rows.append({'pid': ses['pid'], 'sid': ses['sid'], 'cond': ses['cond'], 'sim': ses['sim'], 'segment': seg,
                     'n_events': len(hs), 'n_seen_before_takeover': len(early), 'seen_before_takeover_rate': ratio(len(early), len(hs)),
                     'n_responded': len(rts), 'response_rate': ratio(len(rts), len(hs)),
                     'rt_mean_ms': round(statistics.mean(rts)) if rts else '', 'rt_median_ms': round(statistics.median(rts)) if rts else ''})
    return rows


def summarize_frames(ses, frames, events):
    load, risk = [], []
    acc = defaultdict(lambda: defaultdict(float))     # 段 → 区域组 → 秒
    racc = defaultdict(lambda: defaultdict(float))    # (段, 风险) → 指标 → 秒
    speed = defaultdict(lambda: [0.0, 0.0])
    prev_t = None
    for f in frames:
        if f.get('phase') != 'drive':
            prev_t = None
            continue
        t = fnum(f['t_sim'], 0.0)
        dt = min(0.2, t - prev_t) if prev_t is not None and t > prev_t else 1 / 30
        prev_t = t
        seg, aoi = f.get('segment') or '1', f.get('aoi_gaze') or f.get('aoi', '')   # 有眼动时按视线落点，没有时两列相同
        grp = next((g for g, s in AOI_GROUPS.items() if aoi in s), 'other')
        acc[seg]['total'] += dt
        acc[seg][grp] += dt
        speed[seg][0] += fnum(f.get('speed_kmh'), 0.0) * dt
        speed[seg][1] += dt
        lvl = 'high' if f.get('hazard_stage') in ('warn', 'takeover') else 'low'
        racc[(seg, lvl)]['total'] += dt
        racc[(seg, lvl)]['road'] += dt if aoi in ROAD else 0
        racc[(seg, lvl)]['phone'] += dt if aoi == 'phone' else 0
        if f.get('cue_id'):                          # 线索时间窗内（含提示期间）：视线离开道路、看中控屏的时间
            acc[seg]['cw_total'] += dt
            acc[seg]['cw_offroad'] += dt if aoi not in ROAD else 0
            acc[seg]['cw_center'] += dt if aoi == 'center_screen' else 0
    tl = segment_timeline(events)
    dms = defaultdict(lambda: defaultdict(int))
    for e in events:
        if e['type'] == 'dms' and e['value'] in ('remind', 'warn', 'mitigate'):
            dms[seg_at(tl, fnum(e['t_sim'], 0.0))][e['value']] += 1
    head = {'pid': ses['pid'], 'sid': ses['sid'], 'cond': ses['cond'], 'sim': ses['sim']}
    for seg in SEGS:
        a = acc.get(seg)
        if not a:
            continue
        row = dict(head, segment=seg, drive_sec=round(a['total'], 1), mean_speed_kmh=ratio(speed[seg][0], speed[seg][1], 1))
        for g in list(AOI_GROUPS) + ['other']:
            row[f'share_{g}'] = ratio(a[g], a['total'])
        for k in ('remind', 'warn', 'mitigate'):
            row[f'dms_{k}'] = dms[seg][k]
        row['cuewin_sec'] = round(a['cw_total'], 1)
        row['cuewin_offroad_share'] = ratio(a['cw_offroad'], a['cw_total'])
        row['cuewin_center_share'] = ratio(a['cw_center'], a['cw_total'])
        load.append(row)
        for lvl in ('high', 'low'):
            r = racc.get((seg, lvl))
            if r:
                risk.append(dict(head, segment=seg, risk=lvl, sec=round(r['total'], 1),
                                 road_share=ratio(r['road'], r['total']), phone_share=ratio(r['phone'], r['total'])))
    return load, risk


def summarize_learning(ses, cues):
    """每人一行。「看向线索比例」= 看向的线索数 / 有效线索数；与危险事件重叠的线索不计。"""
    valid = [c for c in cues if c.get('hazard_overlap', '0') != '1']
    row = {'pid': ses['pid'], 'sid': ses['sid'], 'cond': ses['cond'], 'sim': ses['sim'],
           'n_cues': len(cues), 'n_excluded_hazard_overlap': len(cues) - len(valid)}

    def rate(rows, key='looked'):
        return ratio(sum(r.get(key) == '1' for r in rows), len(rows))

    for seg in SEGS:
        rs = [c for c in valid if c['segment'] == seg]
        row[f'n_seg{seg}'] = len(rs)
        row[f'look_seg{seg}'] = rate(rs)
    a, b = row['look_seg1'], row['look_seg3']
    row['look_diff_3_minus_1'] = '' if a == '' or b == '' else round(b - a, 3)
    eye_rows = [c for c in valid if c.get('look_src') == 'eye']
    row['look_src_eye_share'] = ratio(len(eye_rows), len(valid))      # 多少线索是按眼动判定的
    for seg in SEGS:                                 # 两种判定各自的结果，便于对照（眼动只在有数据的线索上算）
        rs = [c for c in valid if c['segment'] == seg]
        row[f'look_head_seg{seg}'] = rate(rs, 'looked_head') if rs and 'looked_head' in rs[0] else ''
        ers = [c for c in rs if fnum(c.get('eye_valid_share'), 0) > 0.5]
        row[f'look_eye_seg{seg}'] = rate(ers, 'looked_eye')
    for seg in SEGS:                                 # 在提示时刻之前就看向的比例
        row[f'anticipated_seg{seg}'] = rate([c for c in valid if c['segment'] == seg], 'anticipated')
    a1, a3 = row['anticipated_seg1'], row['anticipated_seg3']
    row['anticipated_diff_3_minus_1'] = '' if a1 == '' or a3 == '' else round(a3 - a1, 3)   # 主指标 H1：提示撤掉后的主动看
    seg2 = [c for c in valid if c['segment'] == '2']
    row['seg2_hint_shown'] = sum(c.get('hint_shown') == '1' for c in seg2)
    row['seg2_check_shown'] = sum(c.get('check_shown') == '1' for c in seg2)
    row['seg2_faded'] = sum(c.get('faded') == '1' for c in seg2)
    row['seg2_look_after_hint'] = rate([c for c in seg2 if c.get('hint_shown') == '1'])
    for t in CUE_TYPES:                              # 按线索类型的分项
        r1 = [c for c in valid if c['type'] == t and c['segment'] == '1']
        r3 = [c for c in valid if c['type'] == t and c['segment'] == '3']
        x, y = rate(r1), rate(r3)
        row[f'{t}_seg1'], row[f'{t}_seg2'], row[f'{t}_seg3'] = x, rate([c for c in valid if c['type'] == t and c['segment'] == '2']), y
        row[f'{t}_diff'] = '' if x == '' or y == '' else round(y - x, 3)
    first = [fnum(c['first_look_rel_s']) for c in valid if c.get('looked') == '1' and c.get('first_look_rel_s')]
    row['first_look_rel_s_median'] = round(statistics.median(first), 2) if first else ''
    return row


def write(path, rows):
    if not rows:
        print(f'  {os.path.basename(path)}: 没有数据，未写出')
        return
    cols = []
    for r in rows:
        for k in r:
            if k not in cols:
                cols.append(k)
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=cols, restval='')
        w.writeheader()
        w.writerows(rows)
    print(f'  {os.path.basename(path)}: {len(rows)} 行')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('data', nargs='?', default=os.path.join(HERE, '..', '..', 'output', 'hmi-vr-data'))
    ap.add_argument('--out', default=None)
    a = ap.parse_args()
    out = a.out or a.data
    os.makedirs(out, exist_ok=True)
    ev_rows, load_rows, risk_rows, learn_rows = [], [], [], []
    n = 0
    for ses in sessions(a.data):
        n += 1
        events = read_csv(ses['base'] + '_events.csv')
        frames = read_csv(ses['base'] + '_frames.csv')
        ev_rows += summarize_events(ses, events)
        lo, ri = summarize_frames(ses, frames, events)
        load_rows += lo
        risk_rows += ri
        cues = read_csv(ses['base'] + '_cues.csv')
        if cues:
            learn_rows.append(summarize_learning(ses, cues))
    print(f'{n} 个会话')
    write(os.path.join(out, 'summary_events.csv'), ev_rows)
    write(os.path.join(out, 'summary_load.csv'), load_rows)
    write(os.path.join(out, 'summary_risk.csv'), risk_rows)
    write(os.path.join(out, 'summary_learning.csv'), learn_rows)


if __name__ == '__main__':
    main()
