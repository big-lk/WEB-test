"""Tobii Pro Lab のプロジェクト内の生の記録（Eyetracker.data / Mouse.data）を、データエクスポート（TSV）と同じ列の表に直す。

目的は **管線の確認だけ**：Pro Lab から TSV を書き出す前でも、記録フォルダがあれば eyetools を最後まで通せるようにする。
注視（fixation）の判定はここで実装した I-VT の近似であり、Pro Lab の「Tobii I-VT (Fixation)」と同じ値にはならない。
**正式な分析には Pro Lab のデータエクスポートを使うこと。**

  python -m eyetools.cli convert <記録フォルダ> out.tsv [--utc-offset 9]
    記録フォルダ：<プロジェクト>/Data/Recordings/<ID>/（同じ階層に <ID>.rec がある）

生データの形式は Pro Lab 25.7 の記録（Tobii Pro Spark、60 Hz）を読んで確かめたもので、公開された仕様ではない。
版が変わると読めなくなる可能性がある（読めないときは件数や値の範囲の検査で止まる）。
  Eyetracker.data：124 バイト／件。<i4 種別, <i8 時刻(µs), <i8 装置時刻, 左目 12×f4, 右目 12×f4, <i4 左の有効性, <i4 右の有効性
    各目の 12 個：注視点 3D (x,y,z mm)、目の位置 (x,y,z mm)、瞳孔径、注視点 2D（画面に対する割合 x,y）、トラックボックス内の位置 (x,y,z)
    有効性：0 が有効
  Mouse.data：40 バイト／件。<i4 種別, <i8 時刻(µs), <i4, <f8 x, <f8 y, <i4 ボタン, <i4 動作（1=押す, 2=離す, 4=移動）
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd

GAZE_DTYPE = np.dtype([("kind", "<i4"), ("ts", "<i8"), ("dts", "<i8"), ("L", "<f4", 12), ("R", "<f4", 12), ("vl", "<i4"), ("vr", "<i4")])
MOUSE_DTYPE = np.dtype([("kind", "<i4"), ("ts", "<i8"), ("q", "<i4"), ("x", "<f8"), ("y", "<f8"), ("button", "<i4"), ("event", "<i4")])

# I-VT（Pro Lab「Tobii I-VT (Fixation)」の設定に寄せた近似：欠損の補間 75 ms、3 サンプルの移動中央値、30 度/秒、
# 隣り合う注視の結合 75 ms・0.5 度、60 ms 未満は捨てる）
VELOCITY_DEG_S = 30.0
GAP_FILL_MS = 75.0
MERGE_MAX_MS = 75.0
MERGE_MAX_DEG = 0.5
MIN_FIXATION_MS = 60.0


def read_rec_info(rec_dir: Path) -> dict:
    """<ID>.rec（XML）から、記録開始の時刻（UTC）と画面の大きさを読む。無ければ既定値。"""
    info = {"start_utc": None, "px": (1920, 1080), "mm": (380.7, 214.1)}
    rec = rec_dir.with_suffix(".rec")
    if not rec.exists():
        return info
    text = rec.read_text(encoding="utf-8-sig", errors="replace")
    m = re.search(r"<StartDateTimeUtcInTicks>(\d+)</StartDateTimeUtcInTicks>", text)
    if m:  # .NET の ticks：0001-01-01 からの 100 ナノ秒
        info["start_utc"] = datetime(1, 1, 1, tzinfo=timezone.utc) + timedelta(microseconds=int(m.group(1)) // 10)

    def size(name: str) -> tuple[float, float] | None:
        block = re.search(r"<DataValue[^>]*>\s*<[^>]*Height>([\d.]+)</[^>]*Height>\s*<[^>]*Width>([\d.]+)</[^>]*Width>\s*</DataValue>\s*<Name>"
                          + name + "</Name>", text)
        return (float(block.group(2)), float(block.group(1))) if block else None

    info["px"] = tuple(int(v) for v in (size("DisplayNativeResolution") or info["px"]))
    info["mm"] = size("ScreenSize") or info["mm"]
    return info


def _runs(mask: np.ndarray) -> list[tuple[int, int]]:
    """True が続く区間の（開始, 終了の次）。"""
    edges = np.diff(np.concatenate([[0], mask.astype(np.int8), [0]]))
    return list(zip(np.flatnonzero(edges == 1), np.flatnonzero(edges == -1)))


def _angle_deg(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    na, nb = np.linalg.norm(a, axis=-1), np.linalg.norm(b, axis=-1)
    cos = np.clip(np.sum(a * b, axis=-1) / np.where(na * nb == 0, np.nan, na * nb), -1.0, 1.0)
    return np.degrees(np.arccos(cos))


def classify(t_ms: np.ndarray, valid: np.ndarray, direction: np.ndarray, px: np.ndarray) -> pd.DataFrame:
    """サンプルごとの分類（Fixation / Saccade / EyesNotFound / Unclassified）と、注視の番号・長さ・位置。"""
    n = len(t_ms)
    valid, direction, px = valid.copy(), direction.copy(), px.copy()
    # 1) 短い欠損を前後の値で直線補間する
    for a, b in _runs(~valid):
        if a == 0 or b >= n or t_ms[b] - t_ms[a - 1] > GAP_FILL_MS:
            continue
        w = ((t_ms[a:b] - t_ms[a - 1]) / (t_ms[b] - t_ms[a - 1]))[:, None]
        direction[a:b] = direction[a - 1] * (1 - w) + direction[b] * w
        px[a:b] = px[a - 1] * (1 - w) + px[b] * w
        valid[a:b] = True
    # 2) 雑音を抑える：3 サンプルの移動中央値（60 Hz では 1 サンプルの揺れだけで 30 度/秒を超えるため）
    for arr in (direction, px):
        stacked = np.stack([np.roll(arr, 1, axis=0), arr, np.roll(arr, -1, axis=0)])
        usable = np.stack([np.roll(valid, 1), valid, np.roll(valid, -1)]).all(axis=0)
        usable[[0, -1]] = False
        arr[usable] = np.median(stacked, axis=0)[usable]
    # 3) 速度（度/秒）：直前のサンプルとの角度差
    vel = np.full(n, np.nan)
    ok = valid[1:] & valid[:-1] & (np.diff(t_ms) > 0)
    vel[1:][ok] = (_angle_deg(direction[1:], direction[:-1]) / (np.diff(t_ms) / 1000.0))[ok]
    kind = np.where(~valid, "EyesNotFound", np.where(np.isnan(vel), "Unclassified", np.where(vel < VELOCITY_DEG_S, "Fixation", "Saccade")))
    # 有効な区間の先頭は速度が出せない。次のサンプルが注視なら同じ注視に入れる
    for i in np.flatnonzero(kind == "Unclassified"):
        if i + 1 < n and kind[i + 1] == "Fixation":
            kind[i] = "Fixation"
    # 4) 近くて向きも近い注視どうしをつなぐ
    fix = _runs(kind == "Fixation")
    merged: list[list[int]] = []
    for a, b in fix:
        if merged:
            pa, pb = merged[-1]
            gap_ms = t_ms[a] - t_ms[pb - 1]
            angle = float(_angle_deg(direction[pa:pb].mean(axis=0), direction[a:b].mean(axis=0)))
            if gap_ms <= MERGE_MAX_MS and angle <= MERGE_MAX_DEG:
                merged[-1][1] = b
                continue
        merged.append([a, b])
    kind_final = np.where(kind == "Fixation", "Unclassified", kind).astype(object)
    index = np.zeros(n, dtype=int)
    duration = np.full(n, np.nan)
    fx, fy = np.full(n, np.nan), np.full(n, np.nan)
    step = float(np.median(np.diff(t_ms))) if n > 1 else 16.7
    number = 0
    for a, b in merged:
        dur = t_ms[b - 1] - t_ms[a] + step
        if dur < MIN_FIXATION_MS:  # 5) 短すぎる注視は捨てる
            continue
        number += 1
        kind_final[a:b] = "Fixation"
        index[a:b] = number
        duration[a:b] = round(dur)
        inside = valid[a:b]
        fx[a:b], fy[a:b] = np.nanmean(px[a:b][inside], axis=0)
    # 注視以外にも種類ごとの通し番号を振る（Pro Lab のエクスポートと同じ持ち方）
    for name in ("Saccade", "EyesNotFound", "Unclassified"):
        for k, (a, b) in enumerate(_runs(kind_final == name), 1):
            index[a:b] = k
            duration[a:b] = round(t_ms[b - 1] - t_ms[a] + step)
    return pd.DataFrame({"type": kind_final, "index": index, "duration": duration, "fx": fx, "fy": fy})


def convert(rec_dir: str | Path, out_tsv: str | Path, utc_offset_hours: float = 9.0) -> dict:
    rec_dir = Path(rec_dir)
    raw = np.fromfile(rec_dir / "Eyetracker.data", dtype=GAZE_DTYPE)
    if len(raw) < 100 or (rec_dir / "Eyetracker.data").stat().st_size % GAZE_DTYPE.itemsize:
        raise ValueError("Eyetracker.data の形式が想定と違います（件数または大きさ）。")
    if not set(np.unique(raw["vl"])) <= {0, 4} and not np.all(np.diff(raw["ts"]) >= 0):
        raise ValueError("Eyetracker.data の内容が想定と違います（有効性または時刻）。")
    info = read_rec_info(rec_dir)
    width, height = info["px"]
    t0 = int(raw["ts"][0])
    t_us = raw["ts"] - t0
    vl, vr = raw["vl"] == 0, raw["vr"] == 0
    valid = vl | vr

    def both(lo: int, hi: int) -> np.ndarray:  # 有効な目の平均
        left, right = raw["L"][:, lo:hi].astype(float), raw["R"][:, lo:hi].astype(float)
        left[~vl], right[~vr] = np.nan, np.nan
        with np.errstate(invalid="ignore"):
            import warnings
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", RuntimeWarning)
                return np.nanmean(np.stack([left, right]), axis=0)

    norm = both(7, 9)
    if np.nanmedian(norm) < -0.5 or np.nanmedian(norm) > 1.5:
        raise ValueError("注視点（画面に対する割合）の値が想定の範囲にありません。")
    px = norm * np.array([width, height])
    # 視線の向き：画面上の注視点（mm）と、記録全体で一定とみなした目の位置から求める。
    # 片目だけ有効なサンプルで目の位置が左右にずれ、見かけの速度が出るのを避けるため、目の位置は両目の中央値で固定する。
    origin = np.nanmedian(both(3, 6), axis=0)
    distance = float(origin[2]) if np.isfinite(origin[2]) and origin[2] > 100 else 600.0
    mm = (norm - 0.5) * np.array(info["mm"])
    direction = np.column_stack([mm[:, 0], mm[:, 1], np.full(len(mm), distance)])
    cls = classify(t_us / 1000.0, valid, direction, px)

    start_utc = info["start_utc"] or datetime(1970, 1, 1, tzinfo=timezone.utc)
    local = start_utc + timedelta(hours=utc_offset_hours)
    stamp = lambda d: (d.strftime("%d/%m/%Y"), d.strftime("%H:%M:%S.") + f"{d.microsecond // 1000:03d}")  # noqa: E731
    (date_l, time_l), (date_u, time_u) = stamp(local), stamp(start_utc)
    gaze = pd.DataFrame({
        "Recording timestamp": t_us, "Computer timestamp": raw["ts"],
        "Recording date": date_l, "Recording start time": time_l, "Recording date UTC": date_u, "Recording start time UTC": time_u,
        "Sensor": "Eye Tracker",
        "Gaze point X": np.round(px[:, 0]), "Gaze point Y": np.round(px[:, 1]),
        "Validity left": np.where(vl, "Valid", "Invalid"), "Validity right": np.where(vr, "Valid", "Invalid"),
        "Eye movement type": cls["type"], "Eye movement type index": cls["index"], "Gaze event duration": cls["duration"],
        "Fixation point X": np.round(cls["fx"]), "Fixation point Y": np.round(cls["fy"]),
        "Event": "", "Event value": "",
    })
    frames = [gaze]
    mouse_file = rec_dir / "Mouse.data"
    n_down = 0
    if mouse_file.exists():
        m = np.fromfile(mouse_file, dtype=MOUSE_DTYPE)
        m = m[np.isin(m["event"], (1, 2))]
        n_down = int((m["event"] == 1).sum())
        frames.append(pd.DataFrame({
            "Recording timestamp": m["ts"] - t0, "Computer timestamp": m["ts"],
            "Recording date": date_l, "Recording start time": time_l, "Recording date UTC": date_u, "Recording start time UTC": time_u,
            "Sensor": "Mouse", "Event": "MouseEvent",
            "Event value": np.where(m["event"] == 1, "Down, Left", "Up, Left"),
            "Mouse position X": np.round(m["x"]), "Mouse position Y": np.round(m["y"]),
        }))
    table = pd.concat(frames, ignore_index=True).sort_values("Recording timestamp", kind="stable")
    table.to_csv(out_tsv, sep="\t", index=False)
    fix = cls[cls["type"] == "Fixation"].groupby("index")["duration"].first()
    return {"samples": int(len(raw)), "seconds": round(float(t_us[-1]) / 1e6, 1), "valid_ratio": round(float(valid.mean()), 3),
            "fixations": int(len(fix)), "median_fixation_ms": float(fix.median()) if len(fix) else None, "mouse_downs": n_down,
            "screen_px": [width, height], "screen_mm": [round(v, 1) for v in info["mm"]],
            "start_utc": start_utc.isoformat(), "note": "I-VT の近似による変換。正式な分析には Pro Lab のデータエクスポートを使う。"}
