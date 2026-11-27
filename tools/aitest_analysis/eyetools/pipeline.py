"""1 名分の処理：完全ログ JSON ＋ Pro Lab TSV → 同期 → TOI → 視線指標表 ＋ 品質チェック。"""
from __future__ import annotations

from dataclasses import asdict
from pathlib import Path

import pandas as pd

from .aoi import layout_from_session
from .extra_metrics import reading_extras
from .gaze import GazeExport, load_prolab_tsv
from .metrics import assign_aoi, toi_metrics
from .session import Session, build_tois, load_session, parse_ts, session_layout, session_settings, validate
from .sync import estimate_offset

CLICK_EVENTS = ("input_first_focus", "delegation_changed", "example_generated", "pointer_down")


def web_click_times(session: Session) -> list[float]:
    # pointer_down（押した瞬間）が記録されていれば、それだけを使う。ほかの 3 種はボタンを離した時に記録されるので、
    # 押した時刻と混ぜると同期の残差が数十ミリ秒に広がる（TEST-01 の実データで確認：混在 17.6 ms → pointer_down のみ 1 ms 未満）。
    kinds = ("pointer_down",) if any(e.get("type") == "pointer_down" for e in session.events) else CLICK_EVENTS
    out = []
    for e in session.events:
        if e.get("type") in kinds:
            ts = parse_ts(e.get("at") or e.get("delegationChangeAt") or e.get("time"))
            if ts:
                out.append(ts)
    return out


def process(session: Session, gaze: GazeExport, margin: float = 0.0,
            expected_variant: str | None = None) -> tuple[pd.DataFrame, dict]:
    issues = validate(session, expected_variant)
    web = web_click_times(session)
    tob = list(gaze.mouse_events.t)
    prior = None
    if gaze.recording_start_wall is not None:
        prior = 0.0 + gaze.recording_start_wall  # offset ≈ 記録開始の壁時計
    sync = estimate_offset(web, tob, prior=prior)
    if not sync.ok and prior is not None:  # 時差設定の違いなどで事前推定が外れた場合は全探索
        sync = estimate_offset(web, tob)
    to_tobii = lambda wall: wall - sync.offset
    timeline = layout_from_session(session, to_tobii)
    fix = assign_aoi(gaze.fixations, timeline, margin)
    rows = []
    for toi in build_tois(session):
        m = toi_metrics(fix, to_tobii(toi.start), to_tobii(toi.end), gaze.samples)
        if toi.kind == "reading":  # 追加の指標（記述・探索用）
            m.update(reading_extras(session, fix, toi, to_tobii))
        rows.append({"participant": session.participant, "condition": session.condition, "turn": toi.turn,
                     "toi": toi.kind, "duration_s": toi.duration, "start_source": toi.start_source,
                     "phase": "after_deviation" if toi.turn in (4, 5) else ("baseline" if toi.turn in (2, 3) else "other"),
                     **m})
    table = pd.DataFrame(rows)
    qa = {"participant": session.participant, "condition": session.condition,
          "variant": session.raw.get("experimentVariant"), "layout": session_layout(session),
          "settings": session_settings(session),
          "sync": asdict(sync), "gaze": gaze.info, "issues": [i.as_row() for i in issues],
          "n_reading_toi": int((table.toi == "reading").sum()) if len(table) else 0}
    return table, qa


def process_files(session_json: str | Path, prolab_tsv: str | Path,
                  expected_variant: str | None = None) -> tuple[pd.DataFrame, dict]:
    return process(load_session(session_json), load_prolab_tsv(prolab_tsv), expected_variant=expected_variant)


def participant_summary(table: pd.DataFrame, min_tracking: float = 0.7) -> dict:
    """H2 の参加者単位の値：ずれ後（第4・5回）の往復回数 − 基線（第2・3回）の往復回数（対数 1+x の平均差）。"""
    import numpy as np
    r = table[(table.toi == "reading") & (table.tracking_ratio >= min_tracking)]
    base = np.log1p(r[r.phase == "baseline"].ans_panel_transitions)
    post = np.log1p(r[r.phase == "after_deviation"].ans_panel_transitions)
    return {"n_base": len(base), "n_post": len(post),
            "delta_log_transitions": (float(post.mean() - base.mean()) if len(base) and len(post) else None)}
