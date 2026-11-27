"""カード本文とボタンの視線が、どれだけ分けて数えられるか（画面の配置を比べるための記述。分析計画の指標ではない）。

3 つの見方：
1. 形（視線を使わない）：各カードで、本文の矩形とボタンの矩形がどれだけ離れているか。
2. 境目に近い注視：本文またはボタンに割り当てた注視のうち、反対側の矩形から radius 以内にあるものの割合。
   視線の誤差（Tobii Pro Spark の公称の正確度は約 0.45°）で入れ替わりうる注視の目安になる。
3. 決めた順に見た区間の照合：試し録りで「カード1本文→カード1ボタン→カード2本文→…」の順に見てもらった区間について、
   注視の並びを決めた順に当てはめ、当てはまらなかった注視時間の割合を出す。
   当てはめは「合う時間が最も長くなるように」行い、区間の前後の自然な注視は除くので、**外れの割合は下限**である。

角度と px の換算：既定は 画面幅 380.7 mm（TEST-01 の記録にあった実験機の値）・1920 px・視距離 600 mm で、1° ≈ 52.8 px。
"""
from __future__ import annotations

import math
import re

import pandas as pd

from .aoi import LayoutTimeline, Rect
from .extra_metrics import _token

SCRIPT = ["P1", "B1", "P2", "B2", "P3", "B3"]
STEP_MIN_S = 0.2  # その段を「見た」とみなす最小の合計注視時間


def px_per_degree(screen_mm: float = 380.7, screen_px: float = 1920, distance_mm: float = 600) -> float:
    return distance_mm * math.tan(math.radians(1.0)) / (screen_mm / screen_px)


def rect_gap(a: Rect, b: Rect) -> float:
    """2 つの矩形の縁どうしの最短距離（重なっていれば 0）。"""
    dx = max(b[0] - (a[0] + a[2]), a[0] - (b[0] + b[2]), 0.0)
    dy = max(b[1] - (a[1] + a[3]), a[1] - (b[1] + b[3]), 0.0)
    return math.hypot(dx, dy)


def point_gap(x: float, y: float, r: Rect) -> float:
    dx = max(r[0] - x, x - (r[0] + r[2]), 0.0)
    dy = max(r[1] - y, y - (r[1] + r[3]), 0.0)
    return math.hypot(dx, dy)


def text_rect(rects: dict[str, Rect], n: int) -> Rect | None:
    """カード n の本文の矩形。v3 のログでは TEXT_n。古いログでは、カードのうちボタンの行より上の部分で近似する。"""
    if f"TEXT_{n}" in rects:
        return rects[f"TEXT_{n}"]
    card, btn = rects.get(f"CARD_{n}"), rects.get(f"BTN_{n}")
    if card is None:
        return None
    if btn is None:
        return card
    return (card[0], card[1], card[2], max(btn[1] - card[1], 0.0))


def geometry(timeline: LayoutTimeline) -> dict:
    """本文とボタンの間隔（px）。3 枚のカードとボタンがそろっている記録だけを使う。"""
    gaps, text_h, beside = [], [], []
    for rects in timeline.layouts:
        for n in (1, 2, 3):
            t, b = text_rect(rects, n), rects.get(f"BTN_{n}")
            if t is None or b is None or t[2] <= 0 or t[3] <= 0:
                continue
            gaps.append(rect_gap(t, b))
            text_h.append(t[3])
            beside.append(b[0] >= t[0] + t[2] - 1)  # ボタンの左端が本文の右端より右にあれば「横」
    if not gaps:
        return {"n_layouts": len(timeline.layouts), "text_btn_gap_min_px": None, "text_btn_gap_median_px": None}
    s = pd.Series(gaps)
    side = sum(beside) / len(beside)
    return {"n_layouts": len(timeline.layouts), "text_btn_gap_min_px": float(s.min()), "text_btn_gap_median_px": float(s.median()),
            "text_height_median_px": float(pd.Series(text_h).median()),
            "buttons": "本文の横（縦並び）" if side > 0.5 else "本文の下（横並び）", "has_text_rect": any("TEXT_1" in r for r in timeline.layouts)}


def boundary_risk(fix_aoi: pd.DataFrame, timeline: LayoutTimeline, windows: list[tuple[float, float]], radius_px: float) -> dict:
    """windows（Pro Lab 時刻の区間）内で、本文／ボタンに割り当てた注視のうち、反対側の矩形から radius_px 以内のもの。"""
    rows = []
    for s, e in windows:
        rows.append(fix_aoi[(fix_aoi.start >= s) & (fix_aoi.start < e)])
    w = pd.concat(rows) if rows else fix_aoi.iloc[0:0]
    out = {"text_fix": 0, "text_near_btn": 0, "btn_fix": 0, "btn_near_text": 0, "text_dwell_s": 0.0, "btn_dwell_s": 0.0,
           "near_dwell_s": 0.0}
    for start, end, x, y, aoi in zip(w.start, w.end, w.x, w.y, w.aoi):
        tok = _token(aoi)
        if not re.fullmatch(r"[PB]\d", tok):
            continue
        rects = timeline.at(start)
        dur = max(float(end - start), 0.0)
        if tok[0] == "P":
            other = [rects[k] for k in rects if k.startswith("BTN_")]
            out["text_fix"] += 1
            out["text_dwell_s"] += dur
        else:
            other = [r for r in (text_rect(rects, n) for n in (1, 2, 3)) if r is not None]
            out["btn_fix"] += 1
            out["btn_dwell_s"] += dur
        if other and min(point_gap(x, y, r) for r in other) <= radius_px:
            out["text_near_btn" if tok[0] == "P" else "btn_near_text"] += 1
            out["near_dwell_s"] += dur
    n = out["text_fix"] + out["btn_fix"]
    d = out["text_dwell_s"] + out["btn_dwell_s"]
    out["near_share_fix"] = (out["text_near_btn"] + out["btn_near_text"]) / n if n else None
    out["near_share_dwell"] = out["near_dwell_s"] / d if d else None
    return out


def scripted_alignment(fix_aoi: pd.DataFrame, start: float, end: float, script: list[str] | None = None) -> dict:
    """決めた順（script）に見た区間の照合。合う注視時間が最大になるように、注視を順に各段へ当てはめる。"""
    script = script or SCRIPT
    w = fix_aoi[(fix_aoi.start >= start) & (fix_aoi.start < end)].sort_values("start")
    seq = [(t, max(float(e - s), 0.0)) for t, s, e in ((_token(a), s, e) for a, s, e in zip(w.aoi, w.start, w.end))
           if re.fullmatch(r"[PB]\d", t)]
    k = len(script)
    if not seq:
        return {"script": ">".join(script), "observed": "", "steps_seen": 0, "match_s": 0.0, "miss_s": 0.0, "miss_share": None,
                "confusions": {}}
    # 状態 0 = 区間の前、1..k = 各段、k+1 = 区間の後。状態は戻らない。
    states = k + 2
    neg = float("-inf")
    best = [[neg] * states for _ in seq]
    back = [[0] * states for _ in seq]
    gain = lambda i, st: seq[i][1] if 1 <= st <= k and seq[i][0] == script[st - 1] else 0.0  # noqa: E731
    for st in range(states):
        best[0][st] = gain(0, st)
    for i in range(1, len(seq)):
        run, arg = neg, 0
        for st in range(states):
            if best[i - 1][st] >= run:  # 同点なら後ろの状態（＝段を進める）を選ぶ
                run, arg = best[i - 1][st], st
            best[i][st] = run + gain(i, st)
            back[i][st] = arg
    st = max(range(states), key=lambda j: (best[-1][j], -j))
    assign = [0] * len(seq)
    for i in range(len(seq) - 1, -1, -1):
        assign[i] = st
        st = back[i][st]
    match, miss, per_step, confusions = 0.0, 0.0, [0.0] * k, {}
    inside = [i for i, a in enumerate(assign) if 1 <= a <= k]
    # 合った最初の注視から最後の注視までを「決めた順に見た区間」とし、その間の外れだけを数える
    hit = [i for i in inside if seq[i][0] == script[assign[i] - 1]]
    lo, hi = (hit[0], hit[-1]) if hit else (0, -1)
    for i in range(lo, hi + 1):
        tok, dur = seq[i]
        a = min(max(assign[i], 1), k)
        if tok == script[a - 1]:
            match += dur
            per_step[a - 1] += dur
        else:
            miss += dur
            key = f"{script[a - 1]}→{tok}"
            confusions[key] = round(confusions.get(key, 0.0) + dur, 3)
    observed: list[str] = []
    for tok, _ in seq[lo:hi + 1]:
        if not observed or observed[-1] != tok:
            observed.append(tok)
    return {"script": ">".join(script), "observed": ">".join(observed),
            "steps_seen": sum(1 for d in per_step if d >= STEP_MIN_S), "step_dwell_s": [round(d, 3) for d in per_step],
            "match_s": round(match, 3), "miss_s": round(miss, 3),
            "miss_share": (miss / (match + miss)) if (match + miss) else None, "confusions": confusions}


def analyse(session, gaze, script_turn: int | None = None, radius_deg: float = 0.5, px_per_deg: float | None = None,
            script: list[str] | None = None) -> dict:
    """1 回の記録（ログ＋視線）について、上の 3 つをまとめる。"""
    from .aoi import layout_from_session
    from .metrics import assign_aoi
    from .pipeline import web_click_times
    from .session import build_tois, session_layout
    from .sync import estimate_offset

    ppd = px_per_deg or px_per_degree()
    web, tob = web_click_times(session), list(gaze.mouse_events.t)
    sync = estimate_offset(web, tob, prior=gaze.recording_start_wall) if gaze.recording_start_wall is not None else estimate_offset(web, tob)
    if not sync.ok:
        sync = estimate_offset(web, tob)
    to_tobii = lambda wall: wall - sync.offset  # noqa: E731
    timeline = layout_from_session(session, to_tobii)
    fix = assign_aoi(gaze.fixations, timeline)
    tois = build_tois(session)
    windows = [(to_tobii(t.start), to_tobii(t.end)) for t in tois]
    res = {"participant": session.participant, "condition": session.condition, "layout": session_layout(session),
           "sync_ok": sync.ok, "sync_matches": sync.n_matched, "radius_deg": radius_deg, "radius_px": round(radius_deg * ppd, 1),
           **geometry(timeline), **boundary_risk(fix, timeline, windows, radius_deg * ppd)}
    if script_turn:
        toi = next((t for t in tois if t.kind == "reading" and t.turn == script_turn), None)
        if toi is None:
            res["script_note"] = f"第{script_turn}回の読解区間がない"
        else:
            res.update({f"script_{k}": v for k, v in scripted_alignment(fix, to_tobii(toi.start), to_tobii(toi.end), script).items()})
    return res


def report(rows: list[dict]) -> str:
    """比較の表（Markdown）。"""
    pct = lambda v: "—" if v is None else f"{v * 100:.1f}%"  # noqa: E731
    num = lambda v, f="{:.0f}": "—" if v is None else f.format(v)  # noqa: E731
    lines = ["| 項目 | " + " | ".join(f"{r['participant']}（{r['layout']}）" for r in rows) + " |", "|---|" + "---|" * len(rows)]
    def add(label, fn):
        lines.append(f"| {label} | " + " | ".join(str(fn(r)) for r in rows) + " |")
    add("同期（一致クリック）", lambda r: f"{'OK' if r['sync_ok'] else 'NG'}（{r['sync_matches']}）")
    add("ボタンの位置", lambda r: r.get("buttons", "—"))
    add("本文の矩形の記録（TEXT_n）", lambda r: "あり" if r.get("has_text_rect") else "なし（カードから近似）")
    add("本文とボタンの間隔：最小 / 中央（px）", lambda r: f"{num(r.get('text_btn_gap_min_px'))} / {num(r.get('text_btn_gap_median_px'))}")
    add("本文への注視（回 / 秒）", lambda r: f"{r['text_fix']} / {r['text_dwell_s']:.1f}")
    add("ボタンへの注視（回 / 秒）", lambda r: f"{r['btn_fix']} / {r['btn_dwell_s']:.1f}")
    add(f"境目から {rows[0]['radius_deg']}°（{rows[0]['radius_px']} px）以内の注視：回数の割合", lambda r: pct(r.get("near_share_fix")))
    add("同：注視時間の割合", lambda r: pct(r.get("near_share_dwell")))
    if any("script_script" in r for r in rows):
        add("決めた順", lambda r: r.get("script_script", "—"))
        add("実際の並び", lambda r: r.get("script_observed", r.get("script_note", "—")) or "（パネルへの注視なし）")
        add("見た段の数（6 段中）", lambda r: r.get("script_steps_seen", "—"))
        add("合った注視時間 / 外れた注視時間（秒）", lambda r: f"{r.get('script_match_s', '—')} / {r.get('script_miss_s', '—')}")
        add("外れの割合（下限）", lambda r: pct(r.get("script_miss_share")))
        add("外れの内訳（決めた段→実際）", lambda r: "、".join(f"{k} {v}s" for k, v in (r.get("script_confusions") or {}).items()) or "なし")
    return "\n".join(lines)
