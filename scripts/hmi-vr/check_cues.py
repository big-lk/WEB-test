#!/usr/bin/env python3
"""检查一次会话的线索数据是否符合规格。用法：python3 check_cues.py 数据目录 被试编号 [--stage N]"""
import csv, glob, json, sys, collections
d, pid = sys.argv[1], sys.argv[2]
stage = int(sys.argv[sys.argv.index('--stage') + 1]) if '--stage' in sys.argv else 9
def rd(kind):
    return list(csv.DictReader(open(sorted(glob.glob(f'{d}/{pid}_*_{kind}.csv'))[-1], encoding='utf-8')))
meta = json.load(open(sorted(glob.glob(f'{d}/{pid}_*_meta.json'))[-1], encoding='utf-8'))
ev, cues = rd('events'), rd('cues')
cfg = meta['config']; C = cfg['cue']; cond = meta['cond']
ok = True
def check(name, cond_, detail=''):
    global ok
    ok &= bool(cond_)
    print(('  通过 ' if cond_ else '  失败 ') + name + (f'  [{detail}]' if detail else ''))
print(f'== {pid} cond={cond} 线索 {len(cues)} 行')
# 第 1 项：定义
check('配置无警告', not [e for e in ev if e['type'] == 'cue_config_warning'], '; '.join(e['value'] for e in ev if e['type'] == 'cue_config_warning')[:200])
check('方位都偏离正前方 ≥ 20°', all(abs(C['bearings'][c['side']]) >= 20 for c in cfg['cues']))
types = sorted({c['type'] for c in cfg['cues']})
check('六种类型', len(types) == 6, ','.join(types))
bySeg = collections.defaultdict(collections.Counter)
for c in cues: bySeg[c['segment']][c['type']] += 1
check('每段六种线索各至少一次', all(len(bySeg[s]) == 6 for s in '123'), ' / '.join(f"段{s}:{sum(bySeg[s].values())}个" for s in '123'))
check('cues.csv 行数 = 配置的线索数', len(cues) == len(cfg['cues']), f"{len(cues)} vs {len(cfg['cues'])}")
check('四个方位都用到', len({c['side'] for c in cues}) == 4, ','.join(sorted({c['side'] for c in cues})))
arr = {e['hazard_id']: float(e['t_sim']) for e in ev if e['type'] == 'cue_arrive'}
win = {e['hazard_id']: float(e['t_sim']) for e in ev if e['type'] == 'cue_window'}
clean_ids = {c['cue_id'] for c in cues if c['hazard_overlap'] == '0'}
lead = [arr[k] - win[k] for k in arr if k in win and k in clean_ids]
check('时间窗在到达前约 6 秒打开（不含与危险事件重叠的线索）', lead and min(lead) > 5.7 and max(lead) < 7.6, f'{min(lead):.2f}–{max(lead):.2f}s' if lead else '')
if stage >= 2:
    # 第 2 项：预防动作
    act = {e['hazard_id']: e for e in ev if e['type'] == 'cue_action'}
    check('每个线索都执行了预防动作（与是否看向无关）', len(act) == len(cues), f'{len(act)}/{len(cues)}')
    al = [arr[k] - float(act[k]['t_sim']) for k in arr if k in act and k in clean_ids]
    check('动作在到达前约 3 秒开始', al and min(al) > 2.7 and max(al) < 4.6, f'{min(al):.2f}–{max(al):.2f}s' if al else '')
    fr = rd('frames')
    by = collections.defaultdict(list)
    for f in fr:
        if f['phase'] == 'drive' and f['cue_id']: by[f['cue_id']].append(f)
    clean = [c for c in cues if c['hazard_overlap'] == '0']
    slow = [c for c in clean if c['action'] == 'slow']
    lat = [c for c in clean if c['action'] in ('left', 'right')]
    drops = [50 - min(float(f['speed_kmh']) for f in by[c['cue_id']]) for c in slow if by[c['cue_id']]]
    check('减速约 8 km/h', drops and min(drops) > 7 and max(drops) < 9, f'{min(drops):.1f}–{max(drops):.1f}' if drops else '')
    offs = []
    for c in lat:
        xs = [float(f['ego_x']) for f in by[c['cue_id']]]
        offs.append((min(xs) if c['action'] == 'left' else max(xs), c['action']))
    check('横向让出约 0.4 m（left 为负，right 为正）', offs and all((-0.42 <= v <= -0.38) if a == 'left' else (0.38 <= v <= 0.42) for v, a in offs), ' '.join(f'{v:+.2f}' for v, a in offs))
    seen = [c for c in clean if c['looked'] == '1']; unseen = [c for c in clean if c['looked'] == '0']
    check('看过和没看过的线索都有动作', all(c['cue_id'] in act for c in seen + unseen), f'看过 {len(seen)} 没看 {len(unseen)}')
    # 恢复：两个线索之间车速回到 50、横向回到 0
    rec = [f for f in fr if f['phase'] == 'drive' and not f['cue_id'] and not f['hazard_id'] and f['driver_state'] not in ('mitigate',)]
    share = sum(1 for f in rec if abs(float(f['speed_kmh']) - 50) < 0.6 and abs(float(f['ego_x'])) < 0.02) / max(1, len(rec))
    check('过后恢复原车速和位置', share > 0.8, f'线索之外 {share:.0%} 的时间在 50 km/h、车道中央')
if stage >= 3:
    seg2 = [c for c in cues if c['segment'] == '2']; other = [c for c in cues if c['segment'] != '2']
    shown = [c for c in cues if c['hint_shown'] == '1' or c['check_shown'] == '1' or c['faded'] == '1']
    check('第一、三段没有任何提示', not [c for c in other if c in shown])
    hints = {e['hazard_id']: e for e in ev if e['type'] == 'cue_hint'}
    if cond in ('B', 'C'):
        check(f'{cond}：第二段出现了提示（图形 / 对勾 / 已撤）', any(c in shown for c in seg2), f"图形 {sum(c['hint_shown']=='1' for c in seg2)} 对勾 {sum(c['check_shown']=='1' for c in seg2)} 已撤 {sum(c['faded']=='1' for c in seg2)}")
        hl = [arr[k] - float(hints[k]['t_sim']) for k in arr if k in hints and k in clean_ids]
        check('提示判定在动作前 1 秒（到达前约 4 秒）', hl and min(hl) > 3.9 and max(hl) < 4.6, f'{min(hl):.2f}–{max(hl):.2f}s' if hl else '')
    if cond == 'B':                                   # B 解释说明：每条有效线索都解释，从不对勾、从不退场
        miss = [c['cue_id'] for c in seg2 if c['hazard_overlap'] == '0' and c['hint_shown'] != '1']
        check('B：每条有效线索都给解释（包括已先看到的）', not miss, ','.join(miss))
        check('B：没有对勾、没有退场', not [c for c in seg2 if c['check_shown'] == '1' or c['faded'] == '1'])
    if cond == 'C':
        bad = [c for c in seg2 if c['hazard_overlap'] == '0' and c['faded'] == '0' and ((c['anticipated'] == '1') != (c['check_shown'] == '1') or (c['anticipated'] == '0') != (c['hint_shown'] == '1'))]
        check('先看到 → 只给对勾；没先看到 → 图形', not bad, ','.join(c['cue_id'] for c in bad))
        # 连续 3 次 anticipated 后该类型不再提示（只有 C）
        streak = collections.Counter(); faded = set(); wrong = []
        for c in seg2:
            if c['hazard_overlap'] == '1' and c not in shown: continue   # 提示时刻已与危险事件重叠的线索不显示、也不计数
            t = c['type']
            if (t in faded) != (c['faded'] == '1'): wrong.append(c['cue_id'])
            if t in faded: continue
            streak[t] = streak[t] + 1 if c['anticipated'] == '1' else 0
            if streak[t] >= C['fadeAfter']: faded.add(t)
        check('连续 3 次先看到后该类型不再提示', not wrong, f"已撤类型 {sorted(faded)} 不符 {wrong}")
    if cond not in ('B', 'C'):
        check(f'{cond}：全程没有线索提示', not shown)
    check('anticipated 的线索首次看向都早于提示时刻', all(float(c['first_look_rel_s']) < -(C['actionLeadSec'] + C['hintLeadSec']) + 0.6 for c in cues if c['anticipated'] == '1' and c['first_look_rel_s']))
    check('driver_state、on_phone 有记录', all(c['driver_state'] for c in cues) and {c['on_phone'] for c in cues} <= {'0', '1'}, str(collections.Counter(c['driver_state'] for c in cues)))
    looked = [c for c in cues if c['looked'] == '1']
    check('首次看向时刻在时间窗内', all(-C['windowBeforeSec'] - 3.5 <= float(c['first_look_rel_s']) <= 2 for c in looked), f"{min((float(c['first_look_rel_s']) for c in looked), default=0):.1f}–{max((float(c['first_look_rel_s']) for c in looked), default=0):.1f}s")
print('结果：' + ('全部通过' if ok else '有失败项'))
sys.exit(0 if ok else 1)
