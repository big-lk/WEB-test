import tempfile
from eyetools import synth
from eyetools.pipeline import process_files, participant_summary

def run(cond, **kw):
    d = tempfile.mkdtemp()
    info = synth.make(d, condition=cond, **kw)
    table, qa = process_files(info["session"], info["tsv"])
    return info, table, qa

def test_transitions_recovered_both_ui():
    for cond in ("UI_A", "UI_B"):
        info, table, qa = run(cond)
        assert qa["sync"]["ok"], qa["sync"]
        r = table[table.toi == "reading"].set_index("turn")
        for k, v in info["truth_transitions"].items():
            assert r.loc[k, "ans_panel_transitions"] == v, (cond, k, r.loc[k, "ans_panel_transitions"], v)

def test_sync_recovers_offset_despite_start_time_error():
    info, table, qa = run("UI_B", start_time_error=2.5)
    assert abs(qa["sync"]["offset"] - info["true_offset"]) < 0.05, qa["sync"]

def test_validation_flags_static_layout_and_no_errors():
    info, table, qa = run("UI_A")
    codes = {i["code"] for i in qa["issues"] if i["level"] == "error"}
    assert not codes, codes

def test_summary():
    info, table, qa = run("UI_B")
    s = participant_summary(table)
    assert s["n_base"] == 2 and s["n_post"] == 2 and s["delta_log_transitions"] > 0

def test_patched_dynamic_layout():
    for cond in ("UI_A", "UI_B"):
        info, table, qa = run(cond, patched=True)
        r = table[table.toi == "reading"].set_index("turn")
        assert all(r.start_source == "ai_visible")
        for k, v in info["truth_transitions"].items():
            assert r.loc[k, "ans_panel_transitions"] == v
        assert not [i for i in qa["issues"] if i["level"] == "error"], qa["issues"]

def test_buttons_are_not_panel_text():
    # v0.2：UI B のボタン行への注視は PANEL（カード本文）ではなく PANEL_BUTTONS に入る
    from eyetools.aoi import STATIC, GROUP, hit
    rects = STATIC["UI_B"]
    assert GROUP[hit(1500, 200, rects)] == "PANEL"           # カード1 の本文
    assert GROUP[hit(1500, 320, rects)] == "PANEL_BUTTONS"   # カード1 のボタン行


def test_prolab_raw_convert_roundtrip():
    """生の記録の形式で書いた合成データ：2 か所を順に見る＋クリック 2 回 → TSV → 読み込み。"""
    import numpy as np
    from pathlib import Path
    from eyetools import prolab_raw
    from eyetools.gaze import load_prolab_tsv
    d = Path(tempfile.mkdtemp()) / "REC1"
    d.mkdir()
    n, t0 = 240, 5_000_000
    g = np.zeros(n, dtype=prolab_raw.GAZE_DTYPE)
    g["ts"] = t0 + (np.arange(n) * 16667)
    target = np.where(np.arange(n) < 120, 0.25, 0.75)           # 前半は画面の左、後半は右
    for eye, dx in (("L", -30.0), ("R", 30.0)):
        g[eye][:, 0] = (target - 0.5) * 380.7                   # 注視点 3D（mm）
        g[eye][:, 3], g[eye][:, 5] = dx, 600.0                  # 目の位置：画面から 60 cm
        g[eye][:, 7], g[eye][:, 8] = target, 0.5                # 注視点 2D（割合）
    g["vl"][60:63] = 4                                           # 片目だけの短い欠損
    g["vl"][200:230] = g["vr"][200:230] = 4                      # 両目の長い欠損
    g.tofile(d / "Eyetracker.data")
    m = np.zeros(4, dtype=prolab_raw.MOUSE_DTYPE)
    m["ts"] = t0 + np.array([1_000_000, 1_080_000, 3_000_000, 3_090_000])
    m["event"] = [1, 2, 1, 2]
    m["x"], m["y"] = [480, 480, 1440, 1440], 540
    m.tofile(d / "Mouse.data")
    (d.parent / "REC1.rec").write_text(
        "<R><StartDateTimeUtcInTicks>639312782504409237</StartDateTimeUtcInTicks></R>", encoding="utf-8")
    info = prolab_raw.convert(d, d.parent / "out.tsv")
    assert info["mouse_downs"] == 2 and info["start_utc"].startswith("2026-11-26T08:24:10"), info
    gaze = load_prolab_tsv(d.parent / "out.tsv")
    fx = gaze.fixations
    # 左（片目の短い欠損では切れない）→ 右 → 両目の長い欠損のあと、同じ場所でもう一度
    assert len(fx) == 3, fx
    assert abs(fx.x.iloc[0] - 480) <= 2 and abs(fx.x.iloc[1] - 1440) <= 2 and abs(fx.x.iloc[2] - 1440) <= 2, fx
    assert fx.end.iloc[0] - fx.start.iloc[0] > 1.9, fx
    assert list(gaze.mouse_events.t.round(2)) == [1.0, 3.0], gaze.mouse_events         # 押した時刻だけ
    assert abs(gaze.recording_start_wall - 1795681450.44) < 0.01, gaze.recording_start_wall  # UTC として読む
    assert 0.85 < gaze.samples.valid.mean() < 0.9
