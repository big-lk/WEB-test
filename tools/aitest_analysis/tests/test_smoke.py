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
