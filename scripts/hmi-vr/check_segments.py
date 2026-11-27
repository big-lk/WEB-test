#!/usr/bin/env python3
"""检查三段式。用法：python3 check_segments.py 数据目录 被试编号"""
import csv, glob, json, sys
d, pid = sys.argv[1], sys.argv[2]
rd = lambda k: list(csv.DictReader(open(sorted(glob.glob(f'{d}/{pid}_*_{k}.csv'))[-1], encoding='utf-8')))
meta = json.load(open(sorted(glob.glob(f'{d}/{pid}_*_meta.json'))[-1], encoding='utf-8'))
ev, fr = rd('events'), [f for f in rd('frames') if f['phase'] == 'drive']
ok = True
def check(name, c, detail=''):
    global ok; ok &= bool(c); print(('  通过 ' if c else '  失败 ') + name + (f'  [{detail}]' if detail else ''))
segs = [(float(e['t_sim']), e['value'], e['note']) for e in ev if e['type'] == 'segment']
print(f"== {pid} cond={meta['cond']} 总时长设定 {meta['durMin']} 分钟")
check('依次进入 1 → 2 → 3 段', [s[1] for s in segs] == ['1', '2', '3'], ' | '.join(f'{t:.0f}s 段{v} {n}' for t, v, n in segs))
check('第二段按 cond，第一、三段无提示', 'cond=' + meta['cond'] in segs[1][2] and 'cond=A' in segs[0][2] and 'cond=A' in segs[2][2])
end = float([e for e in ev if e['type'] == 'session_end'][0]['t_sim'])
dur = [segs[1][0] - segs[0][0], segs[2][0] - segs[1][0], end - segs[2][0]]
want = [m * meta['durMin'] / sum(meta['config']['segmentsMin']) for m in meta['config']['segmentsMin']]
check('各段时长约为设定值（减速会略长）', all(w * 60 <= x <= w * 60 * 1.08 + 20 for x, w in zip(dur, want)), ' / '.join(f'{x/60:.1f} 分（设定 {w:g}）' for x, w in zip(dur, want)))
for t, v, _ in segs[1:]:
    near = [float(f['speed_kmh']) for f in fr if abs(float(f['t_sim']) - t) < 5]
    check(f'进入第 {v} 段前后 5 秒不停车', near and min(near) > 35, f'{min(near):.0f}–{max(near):.0f} km/h')
    other = [e['type'] for e in ev if abs(float(e['t_sim']) - t) < 0.5 and e['type'] not in ('segment', 'dms', 'cue_look', 'distractor')]
    check(f'进入第 {v} 段时没有其他提示或事件', not other, ','.join(other))
check('frames.csv 有 segment 列且与里程一致', all((f['segment'] == '1') == (float(f['s_m']) < meta['segBounds'][0]) for f in fr[::50]))
print('结果：' + ('全部通过' if ok else '有失败项')); sys.exit(0 if ok else 1)
