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


def test_reading_extras_present():
    """追加の指標：読解区間の行に、焦点のカードへの注視と注視の並びが入る。"""
    info, table, qa = run("UI_B")
    r = table[table.toi == "reading"]
    assert {"target_card", "gaze_sequence", "card_dwell_1"} <= set(r.columns), list(r.columns)
    assert r.gaze_sequence.astype(str).str.len().gt(0).all()


def _rewrite_tsv(src, dst, *, unit=None, values_ms=False, encoding="utf-8", sensor=False, lower=False, comma=False):
    """合成 TSV を、Pro Lab の版や設定の違いで起こりうる形に書き換える。"""
    import pandas as pd
    df = pd.read_csv(src, sep="\t", low_memory=False)
    if values_ms:
        df["Recording timestamp"] = df["Recording timestamp"] / 1000.0
    if sensor:
        df.insert(1, "Sensor", ["Mouse" if str(e) == "MouseEvent" else "Eye Tracker" for e in df["Event"]])
    if comma:
        for c in ("Fixation point X", "Fixation point Y"):
            df[c] = df[c].map(lambda v: "" if pd.isna(v) else str(float(v)).replace(".", ","))
    rename = {}
    if unit:
        rename.update({"Recording timestamp": f"Recording timestamp [{unit}]", "Gaze event duration": "Gaze event duration [ms]",
                       "Fixation point X": "Fixation point X [DACS px]", "Fixation point Y": "Fixation point Y [DACS px]",
                       "Gaze point X": "Gaze point X [DACS px]", "Gaze point Y": "Gaze point Y [DACS px]"})
    df = df.rename(columns=rename)
    if lower:
        df.columns = [c.lower() for c in df.columns]
    df.to_csv(dst, sep="\t", index=False, encoding=encoding)


def test_prolab_export_variants_give_same_result():
    """列名の単位、時刻の単位、文字コード、Sensor 列、小数点のコンマが違っても、同じ結果になる。"""
    import tempfile
    from pathlib import Path
    from eyetools import synth
    from eyetools.gaze import load_prolab_tsv
    from eyetools.pipeline import process_files
    d = Path(tempfile.mkdtemp())
    info = synth.make(str(d), condition="UI_B", start_time_error=2.0)
    base, qa0 = process_files(info["session"], info["tsv"])
    want = base[base.toi == "reading"].set_index("turn").ans_panel_transitions.to_dict()
    assert qa0["gaze"]["timestamp_unit"] == "us" and qa0["gaze"]["timestamp_unit_from"] == "interval"
    cases = {
        "unit_ms": dict(unit="ms", values_ms=True),
        "unit_us": dict(unit="μs"),
        "bare_ms": dict(values_ms=True),
        "bom": dict(encoding="utf-8-sig"),
        "utf16": dict(encoding="utf-16", unit="ms", values_ms=True),
        "sensor": dict(sensor=True),
        "lower": dict(lower=True),
        "comma": dict(comma=True),
    }
    for name, kw in cases.items():
        out = d / f"{name}.tsv"
        _rewrite_tsv(info["tsv"], out, **kw)
        table, qa = process_files(info["session"], out)
        got = table[table.toi == "reading"].set_index("turn").ans_panel_transitions.to_dict()
        assert got == want, (name, got, want)
        assert qa["sync"]["ok"], name
        assert abs(qa["sync"]["offset"] - qa0["sync"]["offset"]) < 0.01, name
        g = qa["gaze"]
        assert g["timestamp_unit"] == ("ms" if kw.get("values_ms") else "us"), (name, g)
        if kw.get("unit"):
            assert g["timestamp_unit_from"] == "header", (name, g)
        if kw.get("sensor"):  # マウスの行は視線サンプルに数えない
            assert g["n_samples"] < g["n_rows"] and load_prolab_tsv(out).samples.valid.all()


def test_variant_check_accepts_candidates_and_pins_one():
    import json, tempfile
    from pathlib import Path
    from eyetools import synth
    from eyetools.session import load_session, session_layout, validate
    d = Path(tempfile.mkdtemp())
    info = synth.make(str(d), condition="UI_A")
    raw = json.loads(Path(info["session"]).read_text(encoding="utf-8"))
    codes = lambda s, v=None: [i.code for i in validate(s, v) if i.level == "error"]  # noqa: E731
    s = load_session(info["session"])
    assert "S04_VARIANT" not in codes(s) and session_layout(s) == "default"
    raw["experimentVariant"] = "generic_unranked"
    raw["environment"]["layoutVariant"] = "flow"
    p = d / "g.json"
    p.write_text(json.dumps(raw, ensure_ascii=False), encoding="utf-8")
    s = load_session(p)
    assert "S04_VARIANT" not in codes(s) and session_layout(s) == "flow"
    assert "S04_VARIANT" in codes(s, "standard") and "S04_VARIANT" not in codes(s, "generic_unranked")
    raw["experimentVariant"] = "strong_ambiguity"
    p.write_text(json.dumps(raw, ensure_ascii=False), encoding="utf-8")
    assert "S04_VARIANT" in codes(load_session(p))


def _fix(rows):
    import pandas as pd
    return pd.DataFrame(rows, columns=["start", "end", "x", "y", "aoi"])


def test_scripted_alignment():
    from eyetools.separation import scripted_alignment
    # 決めた順どおり（前後に自然な注視あり）
    rows, t = [(0.0, 0.4, 0, 0, "AI_LATEST"), (0.5, 0.8, 0, 0, "TEXT_2")], 1.0
    for aoi in ("TEXT_1", "BTN_1", "TEXT_2", "BTN_2", "TEXT_3", "BTN_3"):
        for _ in range(4):
            rows.append((t, t + 0.45, 0, 0, aoi)); t += 0.5
    rows.append((t, t + 0.3, 0, 0, "INPUT"))
    r = scripted_alignment(_fix(rows), 0.0, t + 1)
    assert r["steps_seen"] == 6 and r["miss_s"] == 0 and r["observed"] == "P1>B1>P2>B2>P3>B3", r
    # ボタンを見たつもりの注視の半分が本文に入る配置：外れとして数えられる
    rows, t = [], 0.0
    for n in (1, 2, 3):
        for _ in range(4):
            rows.append((t, t + 0.45, 0, 0, f"TEXT_{n}")); t += 0.5
        for i in range(4):
            rows.append((t, t + 0.45, 0, 0, f"BTN_{n}" if i % 2 else f"TEXT_{n}")); t += 0.5
    r = scripted_alignment(_fix(rows), 0.0, t)
    assert r["steps_seen"] == 6 and 0.05 < r["miss_share"] < 0.3 and any(k.startswith("B") for k in r["confusions"]), r
    # ボタンへの注視がすべて本文に入る配置：ボタンの段が見つからない
    rows, t = [], 0.0
    for n in (1, 2, 3):
        for _ in range(8):
            rows.append((t, t + 0.45, 0, 0, f"TEXT_{n}")); t += 0.5
    r = scripted_alignment(_fix(rows), 0.0, t)
    assert r["steps_seen"] == 3, r
    assert scripted_alignment(_fix([(0.0, 0.4, 0, 0, "AI_LATEST")]), 0.0, 1.0)["steps_seen"] == 0


def test_separation_geometry_and_boundary():
    from eyetools.aoi import LayoutTimeline
    from eyetools.separation import boundary_risk, geometry, px_per_degree, text_rect
    assert 50 < px_per_degree() < 56
    below = {"CARD_1": (1383, 160, 505, 218), "BTN_1": (1400, 314, 471, 48)}                      # 古いログ：ボタンは本文の下
    side = {"CARD_1": (1160, 160, 740, 150), "TEXT_1": (1180, 175, 480, 110), "BTN_1": (1720, 170, 160, 130)}  # v3：本文の横
    assert text_rect(below, 1) == (1383, 160, 505, 154)
    g1, g2 = geometry(LayoutTimeline([0.0], [below])), geometry(LayoutTimeline([0.0], [side]))
    assert g1["text_btn_gap_min_px"] == 0 and g1["buttons"].startswith("本文の下") and not g1["has_text_rect"]
    assert g2["text_btn_gap_min_px"] == 60 and g2["buttons"].startswith("本文の横") and g2["has_text_rect"]
    fix = _fix([(0.0, 0.3, 1500, 300, "CARD_1"), (0.4, 0.7, 1500, 200, "CARD_1"), (0.8, 1.1, 1500, 330, "BTN_1")])
    r = boundary_risk(fix, LayoutTimeline([0.0], [below]), [(0.0, 2.0)], 26.0)
    assert (r["text_fix"], r["text_near_btn"], r["btn_fix"], r["btn_near_text"]) == (2, 1, 1, 1), r
    fix = _fix([(0.0, 0.3, 1400, 230, "TEXT_1"), (0.4, 0.7, 1650, 230, "TEXT_1"), (0.8, 1.1, 1800, 230, "BTN_1")])
    r = boundary_risk(fix, LayoutTimeline([0.0], [side]), [(0.0, 2.0)], 26.0)
    assert (r["text_near_btn"], r["btn_near_text"]) == (0, 0) and r["near_share_fix"] == 0, r


def test_separation_command_runs_on_synthetic_recording():
    import tempfile
    from eyetools import cli, synth
    d = tempfile.mkdtemp()
    info = synth.make(d, condition="UI_B", patched=True)
    assert cli.main(["separation", info["session"], info["tsv"], "--script-turn", "6", "--out", d]) == 0


def test_settings_are_reported_and_changes_flagged():
    import json, tempfile
    from pathlib import Path
    from eyetools import cli, synth
    from eyetools.session import load_session, session_settings, validate
    d = Path(tempfile.mkdtemp())
    raw = json.loads(Path(synth.make(str(d), condition="UI_B")["session"]).read_text(encoding="utf-8"))

    def write(name, pid, prompt_by_turn, override=False):
        r = json.loads(json.dumps(raw))
        r["participantId"] = pid
        for rd in r["rounds"]:
            t = rd["turn"]
            rd["aiMeta"].update({"dialogueModel": "gpt-6-luna", "analysisModel": "gpt-6-luna", "analysisPrompt": prompt_by_turn(t),
                                 "closingMode": "personal" if t <= 5 else "fixed", "inviteMode": "default", "lengthMode": "default",
                                 "modelOverride": override, "closingFallback": t == 2})
        p = d / f"{name}.json"
        p.write_text(json.dumps(r, ensure_ascii=False), encoding="utf-8")
        return str(p)

    a = write("a", "P001", lambda t: "v6")
    st = session_settings(load_session(a))
    assert st["analysisPrompt"] == "v6" and st["closingMode"] == "personal" and st["dialogueModel"] == "gpt-6-luna", st
    codes = lambda p: [i.code for i in validate(load_session(p))]  # noqa: E731
    assert "S12_SETTING_CHANGED" not in codes(a) and codes(a).count("R11_CLOSING_FALLBACK") == 1
    b = write("b", "P002", lambda t: "v6" if t < 4 else "v1")        # 途中で指示文が v1 に戻った
    assert "S12_SETTING_CHANGED" in codes(b)
    c = write("c", "P003", lambda t: "v1")                             # 参加者によって違う
    assert cli.main(["check", a]) == 0 and cli.main(["check", a, c]) == 1
    t = write("t", "TEST-09", lambda t: "v1", override=True)           # 試験用の番号は混在の判定に入れない
    assert cli.main(["check", a, t]) == 0
    assert "S13_MODEL_OVERRIDE" in codes(write("o", "P004", lambda t: "v6", override=True))
