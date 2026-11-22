"""Tobii Pro Lab のデータエクスポート（TSV）から注視（fixation）表を作る。

Pro Lab の列名は版や言語設定で少し変わるため、候補名で探す。
必要な列：Recording timestamp, Eye movement type, Eye movement type index,
Gaze event duration, Fixation point X/Y。
任意の列：Recording start time, Recording date（壁時計への換算）、Event / Event value（マウス操作）、
Validity left/right（追跡率）。

実データ取得後に、列名が想定どおりかを必ず確認すること（未確認事項）。
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import pandas as pd

CANDIDATES = {
    "rec_ts": ["Recording timestamp", "Recording timestamp [μs]", "Recording timestamp [ms]"],
    "comp_ts": ["Computer timestamp", "Computer timestamp [μs]"],
    "start_time": ["Recording start time", "Recording start time UTC"],
    "date": ["Recording date", "Recording date UTC"],
    "type": ["Eye movement type"],
    "index": ["Eye movement type index"],
    "dur": ["Gaze event duration", "Gaze event duration [ms]"],
    "fx": ["Fixation point X", "Fixation point X [DACS px]"],
    "fy": ["Fixation point Y", "Fixation point Y [DACS px]"],
    "gx": ["Gaze point X", "Gaze point X [DACS px]"],
    "gy": ["Gaze point Y", "Gaze point Y [DACS px]"],
    "event": ["Event"],
    "event_value": ["Event value"],
    "valid_l": ["Validity left"],
    "valid_r": ["Validity right"],
}


def _pick(df: pd.DataFrame, key: str, required: bool = True) -> str | None:
    for name in CANDIDATES[key]:
        if name in df.columns:
            return name
    if required:
        raise KeyError(f"列 {CANDIDATES[key]} が見つかりません。実際の列: {list(df.columns)[:40]}")
    return None


@dataclass
class GazeExport:
    samples: pd.DataFrame       # t（秒、記録開始からの相対）、gx、gy、valid
    fixations: pd.DataFrame     # start、end、x、y（秒は記録開始からの相対）
    mouse_events: pd.DataFrame  # t、value
    recording_start_wall: float | None  # 記録開始の壁時計（UNIX 秒）、取れない場合 None


def load_prolab_tsv(path: str | Path) -> GazeExport:
    df = pd.read_csv(path, sep="\t", low_memory=False)
    rec = _pick(df, "rec_ts")
    scale = 1e3 if "[ms]" in rec else 1e6
    t = df[rec].astype(float) / scale
    gx, gy = _pick(df, "gx", False), _pick(df, "gy", False)
    vl, vr = _pick(df, "valid_l", False), _pick(df, "valid_r", False)
    valid = pd.Series(True, index=df.index)
    if vl and vr:
        valid = (df[vl].astype(str).str.lower() == "valid") | (df[vr].astype(str).str.lower() == "valid")
    samples = pd.DataFrame({"t": t, "gx": df[gx] if gx else float("nan"),
                            "gy": df[gy] if gy else float("nan"), "valid": valid})

    typ, idx = _pick(df, "type"), _pick(df, "index")
    fx, fy = _pick(df, "fx"), _pick(df, "fy")
    fix_rows = df[df[typ].astype(str).str.lower() == "fixation"].copy()
    fix_rows["_t"] = t[fix_rows.index]
    fixations = (fix_rows.groupby(idx)
                 .agg(start=("_t", "min"), end=("_t", "max"), x=(fx, "first"), y=(fy, "first"))
                 .reset_index(drop=True).sort_values("start"))

    ev, evv = _pick(df, "event", False), _pick(df, "event_value", False)
    mouse = pd.DataFrame(columns=["t", "value"])
    if ev:
        m = df[df[ev].astype(str).str.contains("Mouse", case=False, na=False)]
        mouse = pd.DataFrame({"t": t[m.index], "value": m[evv] if evv else m[ev]})

    start_wall = None
    st, dt = _pick(df, "start_time", False), _pick(df, "date", False)
    if st and dt:
        try:
            start_wall = datetime.strptime(f"{df[dt].iloc[0]} {df[st].iloc[0]}", "%d/%m/%Y %H:%M:%S.%f").timestamp()
        except ValueError:
            try:
                start_wall = pd.to_datetime(f"{df[dt].iloc[0]} {df[st].iloc[0]}").timestamp()
            except Exception:
                start_wall = None
    return GazeExport(samples, fixations, mouse, start_wall)


def tracking_ratio(samples: pd.DataFrame, start: float, end: float) -> float:
    w = samples[(samples.t >= start) & (samples.t < end)]
    return float(w.valid.mean()) if len(w) else 0.0
