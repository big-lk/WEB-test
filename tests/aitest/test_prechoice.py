"""試作 stimulusRule="prechoice"（対話の前に選んだ二つの重視点から、第3・4回の刺激を決める）の検証。

偽の応答を使う（組み立てと決まりごとだけを確かめる。実際のモデルの出力はここでは確かめない）。
実行：python tests/aitest/test_prechoice.py
"""
import contextlib
import importlib.util
import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("open_style", ROOT / "tests/aitest/test_open_style.py")
base = importlib.util.module_from_spec(spec)
try:
    with contextlib.redirect_stdout(io.StringIO()):
        spec.loader.exec_module(base)       # 偽の応答の道具（fake, SEEN, ANCHOR, USER, REPLY, ANALYSIS）を借りる
except SystemExit:
    pass
core = base.core
FAILS = []


def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + (f" :: {detail}" if detail and not ok else ""))
    if not ok:
        FAILS.append(name)


def run(turn, reply=None, values=("no_burden", "natural_talk"), rule="prechoice", analysis=None, user=None, prev=None, later=None):
    base.SEEN.clear()
    core.call_openai = base.fake(reply or base.REPLY, analysis or base.ANALYSIS)
    rows = []
    for i in range(1, turn):
        rows += [{"role": "user", "content": (later if (later and i >= 5) else "友達がほっとして、笑って帰れる夜にしたい")},
                 {"role": "assistant", "content": "ほっとできる夜にします。"}]
    anchor = dict(base.ANCHOR)
    if values is not None:
        anchor["values"] = list(values)
    body = {"sessionId": "SIMTEST-pre", "condition": "UI_B", "experimentVariant": "generic_unranked", "turn": turn,
            "userText": user or base.USER, "history": rows, "pretaskAnchor": anchor, "delegation": {}, "delegationSourceCriteria": [],
            "previousCriteria": prev or [], "closingMode": "personal", "dialogueStyle": "open", "analysisPrompt": "v7"}
    if rule:
        body["stimulusRule"] = rule
    out = core.run_two_ais(body)
    dialogue = next(p for p in base.SEEN if p["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]))
    return out, dialogue


X3 = "「気を遣わせない」は、準備の手間を見せず、すべてこちらで用意することとして整えます。"
Y4 = "今回は相手に気を遣わせないことを優先して、自然に話す時間は、食後の短い間だけにします。"

# 1) 指定しなければ従来どおり（values があっても stimulusRule が無ければ使わない）
out, d = run(3, rule=None)
check("no stimulusRule: the old rule is used", out["meta"]["stimulusRule"] == "default" and out["meta"]["prechoice"] is None
      and out["meta"]["genericStimulus"]["method"] == "registered_candidates" and "事前に参加者が選んだ" not in d["input"])

# 2) 刺激は選んだ二つだけで決まる
out3, d3 = run(3)
check("turn 3: the sentence narrows X with its registered meaning", out3["meta"]["requiredControlSentence"] == X3 and X3 in out3["dialogue"],
      out3["meta"]["requiredControlSentence"])
out4, d4 = run(4)
check("turn 4: X is preferred and Y is limited, naming Y's own words", out4["meta"]["requiredControlSentence"] == Y4 and Y4 in out4["dialogue"],
      out4["meta"]["requiredControlSentence"])
other, _ = run(3, user="父は無口で、ほめられると新聞に目を落とす人です。晩酌は一合だけです。" * 3)
check("the sentence does not depend on what was written in the dialogue", other["meta"]["requiredControlSentence"] == X3)
swapped, _ = run(3, values=("natural_talk", "no_burden"))
check("the first choice is X", "「自然に話せる」は、" in swapped["meta"]["requiredControlSentence"])
check("meta records the rule and the choices", out3["meta"]["stimulusRule"] == "prechoice" and out3["meta"]["prechoice"] == ["no_burden", "natural_talk"]
      and out3["meta"]["genericStimulus"]["method"] == "prechoice")

# 3) カードの位置：1 枚目＝X、2 枚目＝Y。第3回は 1 枚目、第4回は 2 枚目に登録済みの文面
for turn, out in ((1, run(1)[0]), (3, out3), (4, out4)):
    ids = [c["id"] for c in out["analysis"]["criteria"]]
    check(f"turn {turn}: cards are pre-x, pre-y, then one from the dialogue", ids[:2] == ["pre-x", "pre-y"] and len(ids) == 3, str(ids))
c3 = out3["analysis"]["criteria"]
check("turn 3: card 1 carries the registered narrowing and is the focus",
      c3[0]["meaning"] == "「気を遣わせない」を、準備の手間を見せず、すべてこちらで用意することとして扱う。" and c3[0]["focus"] and not c3[1]["focus"], c3[0]["meaning"])
c4 = out4["analysis"]["criteria"]
check("turn 4: card 2 carries the registered priority and is marked", c4[1]["meaning"] == "相手に気を遣わせないことを優先し、自然に話す時間は、食後の短い間だけにします。"
      and c4[1]["priority"] == "中心" and c4[0]["priority"] != "中心" and c4[1]["title"].endswith("優先"), json.dumps(c4[1], ensure_ascii=False))

# 4) 第3・4回は入力の長さに合わせない
long_user = "父は無口で、ほめられると新聞に目を落とす人です。晩酌は日本酒を一合だけと決めています。母が亡くなってからは、二人で食卓を囲むのは月に一度になりました。" * 2
outl3, dl3 = run(3, user=long_user)
outl1, dl1 = run(1, user=long_user)
check("turn 3 with a long input: the body minimum stays at the base and there is no per-sentence directive",
      outl3["meta"]["bodyMin"] == 270 and "要素ごとに応じる" not in dl3["input"], str(outl3["meta"]["bodyMin"]))
check("turn 1 with the same input still scales", outl1["meta"]["bodyMin"] > 270 and "要素ごとに応じる" in dl1["input"], str(outl1["meta"]["bodyMin"]))

# 5) 登録文は第2文に置く
late = "ほっとして笑って帰れる夜にしたいのですね。" + base.PAD + Y4 + base.CLOSE_NARADE
outp, _ = run(4, reply=late)
first, rest = outp["dialogue"].split("。", 1)
check("turn 4: a registered sentence written later in the reply is moved to second position", rest.startswith(Y4), outp["dialogue"][:90])

# 6) 優先の決定は 2 枚目だけに書く
leaky = json.loads(base.ANALYSIS)
leaky["criteria"][0].update({"id": "pre-x", "meaning": "気を遣わせない夕食にしたい、と受け取っています。今回はこれを優先し、話す時間は短くします。"})
leaky["criteria"][1].update({"id": "pre-y"})
outk, _ = run(4, analysis=json.dumps(leaky, ensure_ascii=False))
check("turn 4: a priority sentence added to card 1 by the analysis AI is removed",
      "優先" not in outk["analysis"]["criteria"][0]["meaning"] and any(r.startswith("priority_leak_removed:pre-x") for r in outk["meta"]["analysisRepairs"]),
      outk["analysis"]["criteria"][0]["meaning"])

# 7) 入力の誤り
for bad in (["no_burden"], ["no_burden", "no_burden"], ["no_burden", "zzz"], None):
    try:
        run(1, values=bad)
        check(f"invalid choice {bad} is rejected", False)
    except core.ExperimentError as exc:
        check(f"invalid choice {bad} is rejected", exc.code == "P04_INVALID_PRECHOICE")

# 8) 登録した 6 つの選択肢：どの組み合わせでも文が作れ、見出しが 20 字に収まる
ok_all = True
for a in core.PRECHOICE_VALUES:
    for b in core.PRECHOICE_VALUES:
        if a == b:
            continue
        pre = [dict(core.PRECHOICE_VALUES[a], id=a), dict(core.PRECHOICE_VALUES[b], id=b)]
        for t in (3, 4):
            parts = core.prechoice_parts(t, pre)
            s = core.build_generic_sentence(t, "generic_unranked", parts)
            title = core.generic_event_title(t, parts)
            if not (s.endswith("。") and len(title) <= 20 and "？" not in s):
                ok_all = False
            if t == 4 and core.PRECHOICE_VALUES[b]["phrase"][:3] not in s:
                ok_all = False
check("all 30 ordered pairs give a sentence and a title of at most 20 characters; the turn-4 sentence names Y", ok_all)

print("\nALL PASSED" if not FAILS else f"\n{len(FAILS)} FAILED: {FAILS}")
sys.exit(1 if FAILS else 0)
