"""冒烟テスト用の合成データ：既知の往復回数を埋め込んだ完全ログ JSON と Pro Lab 風 TSV を作る。"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd

from .aoi import STATIC

HZ = 60


def _iso(t: float) -> str:
    return datetime.fromtimestamp(t, tz=timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def center(r):
    x, y, w, h = r
    return x + w / 2, y + h / 2


def make(out_dir: str | Path, condition: str = "UI_B", true_offset_from_start: float = 3.0,
         start_time_error: float = 1.2, click_jitter: float = 0.02, seed: int = 0,
         patterns: dict[int, list[str]] | None = None, patched: bool = False) -> dict:
    """patterns: 読解区間 k ごとの AOI 列（STATIC のキー）。戻り値に正解の往復回数を入れる。"""
    rng = np.random.default_rng(seed)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    rects = STATIC[condition]
    patterns = patterns or {
        2: ["LEFT_CHAT", "CARD_1", "LEFT_CHAT", "INPUT"],
        3: ["LEFT_CHAT", "CARD_2", "LEFT_CHAT", "INPUT"],
        4: ["LEFT_CHAT", "CARD_1", "LEFT_CHAT", "CARD_2", "CARD_3", "LEFT_CHAT", "INPUT"],
        5: ["LEFT_CHAT", "CARD_3", "LEFT_CHAT", "CARD_1", "LEFT_CHAT", "INPUT"],
        6: ["LEFT_CHAT", "INPUT"],
    }
    wall0 = datetime(2026, 12, 2, 10, 0, 0, tzinfo=timezone.utc).timestamp()  # 記録開始（真値）
    t = wall0 + true_offset_from_start  # 実験アプリ側の最初の時刻
    rounds, events, samples, fixes, mouse = [], [], [], [], []
    fix_idx = 0

    def add_fix(start_wall, dur, aoi):
        nonlocal fix_idx
        cx, cy = center(rects[aoi])
        x, y = cx + rng.normal(0, 8), cy + rng.normal(0, 8)
        rel = start_wall - wall0
        fixes.append((fix_idx, rel, rel + dur, x, y))
        fix_idx += 1

    prev_display = None
    for k in range(1, 7):
        prompt = prev_display or t
        if k > 1:
            seq = patterns.get(k, ["LEFT_CHAT", "INPUT"])
            cur = prev_display + 0.2
            for aoi in seq[:-1]:
                d = float(rng.uniform(0.3, 0.9))
                add_fix(cur, d, aoi)
                cur += d + 0.05
            focus = cur + 0.1
        else:
            focus = prompt + 2.0
        add_fix(focus - 0.05, 0.4, "INPUT")
        mouse.append(focus - wall0 + rng.normal(0, click_jitter))
        events.append({"time": _iso(focus), "type": "input_first_focus", "turn": k, "at": _iso(focus)})
        first_key = focus + 1.0
        send = first_key + 15.0
        display = send + 8.0
        rounds.append({"turn": k, "controlEvent": "TEST", "promptShownAt": _iso(prompt), "inputFirstFocusAt": _iso(focus),
                       "firstKeystrokeAt": _iso(first_key), "lastKeystrokeAt": _iso(send - 0.5), "sendClickAt": _iso(send),
                       "submittedAt": _iso(send), "requestStartedAt": _iso(send), "aiResponseStartAt": _iso(display),
                       "aiResponseCompleteAt": _iso(display), "rightPanelUpdateAt": _iso(display), "aiDisplayedAt": _iso(display),
                       "analysisDisplayedAt": _iso(display), "userText": f"入力{k}", "aiText": f"回答{k}",
                       "analysis": {"criteria": [{"id": f"c{i}", "title": f"項目{i}"} for i in range(3)]},
                       "aiMeta": {"validationStatus": "passed"}, "delegation": {}, "delegationTouched": {}, "errors": []})
        if patched:
            vis = display + 0.05
            events.append({"time": _iso(vis), "type": "ai_visible", "turn": k, "at": _iso(vis)})
            events.append({"time": _iso(focus), "type": "pointer_down", "turn": k, "at": _iso(focus), "x": 600, "y": 1000})
        prev_display = display
    if patched:
        lay = {"AI_LATEST": rects["LEFT_CHAT"], "HISTORY": (0, 200, 1358, 740), "INPUT": rects["INPUT"],
               "GUIDE": rects["GUIDE"], **{k: v for k, v in rects.items() if k.startswith("CARD") or k == "EXAMPLE"}}
        events.insert(0, {"time": _iso(wall0 + true_offset_from_start - 1), "type": "aoi_layout", "reason": "render",
                          "at": _iso(wall0 + true_offset_from_start - 1), "rects": {k: list(v) for k, v in lay.items()}})
    session = {"version": 8, "participantId": "SYN001", "condition": condition, "experimentVariant": "standard",
               "status": "complete", "environment": {"viewportWidth": 1920, "viewportHeight": 1080, "pixelRatio": 1},
               "rounds": rounds, "events": events, **({"loggingPatch": "logging-patch-v1"} if patched else {})}
    # サンプル列（60Hz）
    end_rel = prev_display - wall0 + 5
    ts = np.arange(0, end_rel, 1 / HZ)
    rows = []
    fix_arr = sorted(fixes, key=lambda f: f[1])
    j = 0
    for s in ts:
        while j < len(fix_arr) and fix_arr[j][2] < s:
            j += 1
        if j < len(fix_arr) and fix_arr[j][1] <= s <= fix_arr[j][2]:
            f = fix_arr[j]
            rows.append([s, "Fixation", f[0], (f[2] - f[1]) * 1000, f[3], f[4], f[3], f[4], "Valid", "Valid", "", ""])
        else:
            rows.append([s, "Saccade", -1, 30, np.nan, np.nan, 960, 540, "Valid", "Valid", "", ""])
    df = pd.DataFrame(rows, columns=["Recording timestamp", "Eye movement type", "Eye movement type index",
                                     "Gaze event duration", "Fixation point X", "Fixation point Y",
                                     "Gaze point X", "Gaze point Y", "Validity left", "Validity right", "Event", "Event value"])
    df["Recording timestamp"] = (df["Recording timestamp"] * 1e6).round().astype("int64")
    for m in mouse:
        df.loc[len(df)] = [int(round(m * 1e6)), "Unclassified", -1, 0, np.nan, np.nan, np.nan, np.nan, "Valid", "Valid", "MouseEvent", "Down"]
    df = df.sort_values("Recording timestamp").reset_index(drop=True)
    start_wall_reported = wall0 + start_time_error
    st = datetime.fromtimestamp(start_wall_reported, tz=timezone.utc)
    df["Recording date"] = st.strftime("%d/%m/%Y")
    df["Recording start time"] = st.strftime("%H:%M:%S.%f")[:-3]
    (out / "session.json").write_text(json.dumps(session, ensure_ascii=False, indent=1), encoding="utf-8")
    df.to_csv(out / "prolab.tsv", sep="\t", index=False)
    truth = {k: max(len([a for a in v if a != "INPUT" and a != "GUIDE"]) - 0, 0) for k, v in patterns.items()}
    # 正解：ANSWER(LEFT_CHAT) と PANEL(CARD_*) の切り替え回数
    from .metrics import transitions
    truth = {k: transitions(["ANSWER" if a == "LEFT_CHAT" else ("PANEL" if a.startswith("CARD") else a) for a in v])
             for k, v in patterns.items()}
    return {"session": str(out / "session.json"), "tsv": str(out / "prolab.tsv"), "truth_transitions": truth,
            "true_offset": wall0}
