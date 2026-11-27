"""Tobii Pro Lab のデータエクスポート（TSV）から注視（fixation）表を作る。

Pro Lab の列名は版や言語設定で少し変わるため、候補名で探す。
必要な列：Recording timestamp, Eye movement type, Eye movement type index,
Gaze event duration, Fixation point X/Y。
任意の列：Recording start time, Recording date（壁時計への換算）、Event / Event value（マウス操作）、
Validity left/right（追跡率）。

実データ取得後に、列名が想定どおりかを必ず確認すること（未確認事項）。

2026-11-27：正式なエクスポートの形がまだ分からないので、読み取りを次のように緩めた。
- 列名は、角括弧の単位（[ms]、[μs]、[DACS px] など）と大文字・小文字の違いを無視して探す。
- 時刻の単位は、列名に単位があればそれに従い、無ければ視線サンプルの間隔から決める
  （30〜1200 Hz なら、ミリ秒で 0.8〜33、マイクロ秒で 833〜33333。100 を境にする）。
- 文字コードは UTF-8（BOM あり・なし）→ UTF-16 → CP932 の順に試す。
- Sensor 列があれば、追跡率は "Eye Tracker" の行だけで数える（マウスなどの行を無効サンプルに数えない）。
何を使ったかは GazeExport.info に残し、品質 JSON（qa["gaze"]）に出す。
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
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
    # 新しい版の Pro Lab では "Eye movement event duration [ms]" という名前で出る（公開されているエクスポート例による）
    "dur": ["Gaze event duration", "Gaze event duration [ms]", "Eye movement event duration"],
    "fx": ["Fixation point X", "Fixation point X [DACS px]"],
    "fy": ["Fixation point Y", "Fixation point Y [DACS px]"],
    "gx": ["Gaze point X", "Gaze point X [DACS px]"],
    "gy": ["Gaze point Y", "Gaze point Y [DACS px]"],
    "event": ["Event"],
    "event_value": ["Event value"],
    "valid_l": ["Validity left"],
    "valid_r": ["Validity right"],
}


def _norm(name: str) -> str:
    """列名から角括弧の単位と余分な空白を除き、小文字にする。"""
    return re.sub(r"\s+", " ", re.sub(r"\[.*?\]", "", str(name))).strip().lower()


def _pick(df: pd.DataFrame, key: str, required: bool = True) -> str | None:
    for name in CANDIDATES[key]:  # まず、そのままの名前
        if name in df.columns:
            return name
    wanted = [_norm(n) for n in CANDIDATES[key]]
    for want in dict.fromkeys(wanted):  # 次に、単位と大文字・小文字を無視（候補の順を保つ）
        for col in df.columns:
            if _norm(col) == want:
                return col
    if required:
        raise KeyError(f"列 {CANDIDATES[key]} が見つかりません。実際の列: {list(df.columns)[:40]}")
    return None


def _num(series: pd.Series) -> pd.Series:
    """数値の列。小数点がコンマで書き出された場合（"960,5"）も読む。"""
    if not pd.api.types.is_numeric_dtype(series):
        series = series.astype(str).str.replace(",", ".", regex=False)
    return pd.to_numeric(series, errors="coerce")


ENCODINGS = ("utf-8-sig", "utf-16", "cp932")


def _read_table(path: str | Path) -> tuple[pd.DataFrame, str]:
    last: Exception | None = None
    for enc in ENCODINGS:
        try:
            df = pd.read_csv(path, sep="\t", low_memory=False, encoding=enc)
        except (UnicodeError, pd.errors.ParserError) as e:
            last = e
            continue
        if len(df.columns) > 1:  # 文字コードが違うと 1 列にしかならないことがある
            df.columns = [str(c).strip() for c in df.columns]
            return df, enc
        last = ValueError(f"{enc} ではタブ区切りとして読めない（列が 1 つ）")
    raise ValueError(f"{path} を読めません（試した文字コード：{ENCODINGS}）。最後のエラー：{last}")


def _timestamp_scale(column: str, values: pd.Series) -> tuple[float, str, str]:
    """記録時刻を秒に直すための除数、単位、決め方（"header" / "interval" / "default"）。"""
    unit = re.search(r"\[(.*?)\]", column)
    if unit:
        u = unit.group(1).strip().lower()
        if u in ("ms", "msec", "milliseconds"):
            return 1e3, "ms", "header"
        if u in ("μs", "µs", "us", "usec", "microseconds"):
            return 1e6, "us", "header"
        if u in ("s", "sec", "seconds"):
            return 1.0, "s", "header"
    d = _num(values).sort_values().diff()
    d = d[d > 0]
    if len(d) >= 10:
        return (1e6, "us", "interval") if float(d.median()) > 100 else (1e3, "ms", "interval")
    return 1e6, "us", "default"


@dataclass
class GazeExport:
    samples: pd.DataFrame       # t（秒、記録開始からの相対）、gx、gy、valid
    fixations: pd.DataFrame     # start、end、x、y（秒は記録開始からの相対）
    mouse_events: pd.DataFrame  # t、value
    recording_start_wall: float | None  # 記録開始の壁時計（UNIX 秒）、取れない場合 None
    info: dict = field(default_factory=dict)  # 読み取りに使った列・単位・文字コード（品質 JSON に出す）


def load_prolab_tsv(path: str | Path, recording: str | None = None) -> GazeExport:
    """recording：1 つのファイルに複数の記録が入っている場合に、使う記録の名前（Recording name。大文字・小文字は無視）。"""
    df, encoding = _read_table(path)
    rec_col = next((c for c in df.columns if _norm(c) == "recording name"), None)
    recordings = [str(x) for x in df[rec_col].dropna().unique()] if rec_col else []
    if len(recordings) > 1:
        want = [r for r in recordings if recording and r.strip().lower() == str(recording).strip().lower()]
        if not want:
            raise ValueError(f"{path} には複数の記録が入っています：{recordings}。使う記録を指定してください（指定：{recording!r}）。")
        df = df[df[rec_col].astype(str) == want[0]].reset_index(drop=True)
    rec = _pick(df, "rec_ts")
    sensor = next((c for c in df.columns if _norm(c) == "sensor"), None)
    eye_rows = pd.Series(True, index=df.index)
    if sensor:
        is_eye = df[sensor].astype(str).str.lower().str.contains("eye")
        if is_eye.any():
            eye_rows = is_eye
    scale, unit, unit_source = _timestamp_scale(rec, df.loc[eye_rows, rec])
    t = _num(df[rec]) / scale
    gx, gy = _pick(df, "gx", False), _pick(df, "gy", False)
    vl, vr = _pick(df, "valid_l", False), _pick(df, "valid_r", False)
    valid = pd.Series(True, index=df.index)
    if vl and vr:
        valid = (df[vl].astype(str).str.lower() == "valid") | (df[vr].astype(str).str.lower() == "valid")
    samples = pd.DataFrame({"t": t, "gx": _num(df[gx]) if gx else float("nan"),
                            "gy": _num(df[gy]) if gy else float("nan"), "valid": valid})[eye_rows.values]

    typ, idx = _pick(df, "type"), _pick(df, "index")
    fx, fy = _pick(df, "fx"), _pick(df, "fy")
    fix_rows = df[df[typ].astype(str).str.strip().str.lower() == "fixation"].copy()
    fix_rows["_t"] = t[fix_rows.index]
    fix_rows[fx], fix_rows[fy] = _num(fix_rows[fx]), _num(fix_rows[fy])
    fixations = (fix_rows.groupby(idx)
                 .agg(start=("_t", "min"), end=("_t", "max"), x=(fx, "first"), y=(fy, "first"))
                 .reset_index(drop=True).sort_values("start"))

    ev, evv = _pick(df, "event", False), _pick(df, "event_value", False)
    mouse = pd.DataFrame(columns=["t", "value"])
    if ev:
        m = df[df[ev].astype(str).str.contains("Mouse", case=False, na=False)]
        if evv:  # 押す・離すの両方が出力される場合は、押した時刻だけを同期に使う（アプリ側の記録は押した時刻）
            down = m[evv].astype(str).str.contains("down", case=False, na=False)
            if down.any():
                m = m[down]
        mouse = pd.DataFrame({"t": t[m.index], "value": m[evv] if evv else m[ev]})

    info = {"recordings_in_file": recordings, "recording_used": (str(df[rec_col].iloc[0]) if rec_col and len(df) else None),
            "encoding": encoding, "timestamp_column": rec, "timestamp_unit": unit, "timestamp_unit_from": unit_source,
            "sensor_column": sensor, "n_rows": int(len(df)), "n_samples": int(len(samples)),
            "n_fixations": int(len(fixations)), "n_mouse_down": int(len(mouse)),
            "columns_used": {k: _pick(df, k, False) for k in CANDIDATES},
            "columns_missing": [k for k in CANDIDATES if _pick(df, k, False) is None]}
    for key, col in (("validation_accuracy_deg", "average validation accuracy (degrees)"),
                     ("validation_precision_sd_deg", "average validation precision sd (degrees)"),
                     ("calibration_accuracy_deg", "average calibration accuracy (degrees)")):
        c = next((x for x in df.columns if str(x).strip().lower() == col), None)
        v = _num(df[c]).dropna() if c else []
        info[key] = float(v.iloc[0]) if len(v) else None
    start_wall = None
    # UTC の列があればそれを優先する（解析する PC の時差設定に左右されない）
    by_norm = {_norm(c): c for c in df.columns}
    d_utc, s_utc = by_norm.get("recording date utc"), by_norm.get("recording start time utc")
    if d_utc and s_utc:
        try:
            start_wall = pd.to_datetime(f"{df[d_utc].iloc[0]} {df[s_utc].iloc[0]}",
                                        dayfirst=True, utc=True).timestamp()
        except Exception:
            start_wall = None
    st, dt = by_norm.get("recording start time"), by_norm.get("recording date")
    if start_wall is None and st and dt:
        try:
            start_wall = datetime.strptime(f"{df[dt].iloc[0]} {df[st].iloc[0]}", "%d/%m/%Y %H:%M:%S.%f").timestamp()
        except ValueError:
            try:
                start_wall = pd.to_datetime(f"{df[dt].iloc[0]} {df[st].iloc[0]}").timestamp()
            except Exception:
                start_wall = None
    info["recording_start_wall"] = start_wall
    return GazeExport(samples, fixations, mouse, start_wall, info)


def tracking_ratio(samples: pd.DataFrame, start: float, end: float) -> float:
    w = samples[(samples.t >= start) & (samples.t < end)]
    return float(w.valid.mean()) if len(w) else 0.0
