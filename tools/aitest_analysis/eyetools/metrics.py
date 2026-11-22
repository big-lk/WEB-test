"""TOI ごとの視線指標。

主要指標（分析計画書 H2）：
  ans_panel_transitions … 読解区間内の注視列で、ANSWER と PANEL の間を行き来した回数
    （ANSWER/PANEL 以外の注視は無視し、同じまとまりの連続は 1 つにまとめる。カード間の移動は数えない）
副指標：
  dwell_share_<group> … 区間内の注視時間に占める各まとまりの割合（面積差があるため群間比較には使わない）
  first_panel_s       … 区間開始から最初に PANEL に入るまでの秒
  panel_visits        … PANEL（カード本文。UI B のボタン行は含めない）への訪問回数 ＝ 分析計画 H3
  button_visits       … UI B のボタン行（PANEL_BUTTONS）への訪問回数（記述統計用）
  tracking_ratio      … 区間内の有効サンプル率
"""
from __future__ import annotations

from collections import defaultdict

import pandas as pd

from .aoi import GROUP, LayoutTimeline, hit


def assign_aoi(fix: pd.DataFrame, timeline: LayoutTimeline, margin: float = 0.0) -> pd.DataFrame:
    out = fix.copy()
    out["aoi"] = [hit(x, y, timeline.at(s), margin) if pd.notna(x) else "NA"
                  for s, x, y in zip(out.start, out.x, out.y)]
    out["group"] = out.aoi.map(lambda a: GROUP.get(a, a))
    return out


def collapse(seq: list[str]) -> list[str]:
    res: list[str] = []
    for g in seq:
        if not res or res[-1] != g:
            res.append(g)
    return res


def transitions(groups: list[str], a: str = "ANSWER", b: str = "PANEL") -> int:
    seq = collapse([g for g in groups if g in (a, b)])
    return max(len(seq) - 1, 0)


def toi_metrics(fix_aoi: pd.DataFrame, start: float, end: float, samples: pd.DataFrame | None = None) -> dict:
    w = fix_aoi[(fix_aoi.start >= start) & (fix_aoi.start < end)]
    groups = list(w.group)
    dur = (w.end - w.start).clip(lower=0)
    total = float(dur.sum())
    share = defaultdict(float)
    for g, d in zip(groups, dur):
        share[g] += float(d)
    res = {
        "n_fix": int(len(w)),
        "ans_panel_transitions": transitions(groups),
        "panel_visits": sum(1 for g in collapse(groups) if g == "PANEL"),
        "button_visits": sum(1 for g in collapse(groups) if g == "PANEL_BUTTONS"),
        "first_panel_s": (float(w[w.group == "PANEL"].start.min() - start) if (w.group == "PANEL").any() else None),
        "fix_time_s": total,
    }
    for g in ("ANSWER", "HISTORY", "PANEL", "PANEL_BUTTONS", "INPUT", "GUIDE", "EXAMPLE_B", "OTHER"):
        res[f"dwell_share_{g}"] = (share[g] / total) if total else None
    if samples is not None:
        s = samples[(samples.t >= start) & (samples.t < end)]
        res["tracking_ratio"] = float(s.valid.mean()) if len(s) else 0.0
    return res
