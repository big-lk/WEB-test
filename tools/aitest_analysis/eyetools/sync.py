"""実験アプリの時刻（ブラウザの壁時計）と Pro Lab 記録の時刻を合わせる。

方法：両方に残る「マウスのクリック」を突き合わせる。
- アプリ側：input_first_focus、delegation_changed、example_generated、（パッチ版）pointer_down
- Pro Lab 側：画面録画の Mouse イベント（押下）
全組み合わせの差を候補にし、許容誤差内で最も多く一致する差（offset）を採用、一致ペアの中央値で精緻化する。

offset の意味：アプリの壁時計 − Pro Lab の記録相対時刻（秒）。
→ Pro Lab 時刻 = アプリ時刻 − offset
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass
class SyncResult:
    offset: float
    n_matched: int
    n_web: int
    n_tobii: int
    residual_sd_ms: float
    ok: bool
    note: str


def estimate_offset(web_times: list[float], tobii_times: list[float], tol: float = 0.15,
                    prior: float | None = None, prior_window: float = 30.0,
                    min_matches: int = 4) -> SyncResult:
    w = np.sort(np.asarray(web_times, float))
    g = np.sort(np.asarray(tobii_times, float))
    if len(w) == 0 or len(g) == 0:
        return SyncResult(float("nan"), 0, len(w), len(g), float("nan"), False, "クリックが記録されていない")
    cands = (w[:, None] - g[None, :]).ravel()
    if prior is not None:
        cands = cands[np.abs(cands - prior) <= prior_window]
        if len(cands) == 0:
            return SyncResult(float("nan"), 0, len(w), len(g), float("nan"), False, "事前推定の近くに候補がない")
    best, best_n = None, -1
    for c in cands:
        n = int(np.sum(np.min(np.abs((w[:, None] - c) - g[None, :]), axis=1) <= tol))
        if n > best_n:
            best, best_n = c, n
    # 精緻化
    shifted = w - best
    j = np.argmin(np.abs(shifted[:, None] - g[None, :]), axis=1)
    diffs = w - g[j]
    keep = np.abs(diffs - best) <= tol
    offset = float(np.median(diffs[keep]))
    sd = float(np.std((diffs[keep] - offset) * 1000)) if keep.sum() > 1 else float("nan")
    ok = best_n >= min_matches and best_n >= 0.6 * min(len(w), len(g))
    note = "OK" if ok else "一致したクリックが少ない：同期を目視確認すること"
    return SyncResult(offset, int(keep.sum()), len(w), len(g), sd, ok, note)
