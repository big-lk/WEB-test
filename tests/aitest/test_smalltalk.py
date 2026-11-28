"""試作 stimulusRule="smalltalk"（事前の雑談で聞いた判断と逆の形で、第3・4回の刺激を出す）の検証。

偽の応答を使う（組み立てと決まりごとだけを確かめる。実際のモデルの出力はここでは確かめない）。
実行：python tests/aitest/test_smalltalk.py
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
        spec.loader.exec_module(base)
except SystemExit:
    pass
core = base.core
FAILS = []


def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + (f" :: {detail}" if detail and not ok else ""))
    if not ok:
        FAILS.append(name)


def run(turn, user=None, talk=None, prev=None, analysis=None, reply=None, rule="smalltalk"):
    base.SEEN.clear()
    core.call_openai = base.fake(reply or base.REPLY, analysis or base.ANALYSIS)
    rows = []
    for _ in range(1, turn):
        rows += [{"role": "user", "content": "友達がほっとして、笑って帰れる夜にしたい"}, {"role": "assistant", "content": "ほっとできる夜にします。"}]
    body = {"sessionId": "SIMTEST-talk", "condition": "UI_B", "experimentVariant": "generic_unranked", "turn": turn, "userText": user or base.USER,
            "history": rows, "pretaskAnchor": base.ANCHOR, "delegation": {}, "delegationSourceCriteria": [], "previousCriteria": prev or [],
            "closingMode": "personal", "dialogueStyle": "open", "analysisPrompt": "v7"}
    if rule:
        body["stimulusRule"] = rule
        body["smallTalk"] = talk if talk is not None else {"prep": "together", "keep": "time"}
    out = core.run_two_ais(body)
    dialogue = next(p for p in base.SEEN if p["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]))
    analysis_ = next(p for p in base.SEEN if not p["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]))
    return out, dialogue, analysis_


def cards(out):
    return {c["id"]: c for c in out["analysis"]["criteria"]}


def prev_of(out):
    return [{k: c[k] for k in ("id", "title", "meaning", "priority")} for c in out["analysis"]["criteria"]]


S3 = "夕食の準備は、相手が来る前にすべて済ませておくこととして整えます。"
S4 = "今回は料理をきちんとそろえることを優先して、品数を一品増やし、盛りつけにも時間をかけます。"

# 1) 指定しなければ従来どおり
out, d, a = run(3, rule=None)
check("no stimulusRule: the old rule is used", out["meta"]["stimulusRule"] == "default" and out["meta"]["smallTalk"] is None)

# 2) 答えと逆の側の登録文。答えは二つの AI に渡さない
out1, d1, a1 = run(1)
leak = [w for w in ("together", "一緒に仕上げ", "一緒にいる時間", "smallTalk") if w in d1["input"] + d1["instructions"] + a1["input"] + a1["instructions"]]
check("turn 1: the answers are not passed to either AI, and no card shows them", not leak
      and not any("一緒に仕上げ" in c["meaning"] for c in out1["analysis"]["criteria"]), str(leak))
check("turn 1: the dialogue AI is told not to decide the two topics yet", "こちらで決めない" in d1["input"])
out3, _, _ = run(3)
check("turn 3: answered 'together' -> the sentence fixes preparation as 'all done before'", out3["meta"]["requiredControlSentence"] == S3 and S3 in out3["dialogue"],
      out3["meta"]["requiredControlSentence"])
out4, _, _ = run(4, prev=prev_of(out3))
check("turn 4: answered 'time' -> the sentence prefers the dishes", out4["meta"]["requiredControlSentence"] == S4 and S4 in out4["dialogue"],
      out4["meta"]["requiredControlSentence"])
o3x, _, _ = run(3, talk={"prep": "before", "keep": "dishes"})
o4x, _, _ = run(4, talk={"prep": "before", "keep": "dishes"})
check("the other answers give the other registered sentences",
      o3x["meta"]["requiredControlSentence"] == "夕食の準備は、相手が来てから、仕上げを一緒にすることとして整えます。"
      and o4x["meta"]["requiredControlSentence"] == "今回は相手と一緒に過ごすことを優先して、料理は二品に減らします。")
other_text, _, _ = run(3, user="父は無口で、ほめられると新聞に目を落とす人です。晩酌は一合だけです。" * 3)
check("the sentence does not depend on the dialogue, and turn 3 does not scale with input length",
      other_text["meta"]["requiredControlSentence"] == S3 and other_text["meta"]["bodyMin"] == 270)

# 3) カードの位置：第3回の刺激は 3 枚目、第4回の刺激は 2 枚目
ids3 = [c["id"] for c in out3["analysis"]["criteria"]]
check("turn 3: the event card is card 3 with the registered text", ids3[2] == "event-t3"
      and out3["analysis"]["criteria"][2]["meaning"] == "夕食の準備を、相手が来る前にすべて済ませておくこととして扱う。"
      and out3["analysis"]["criteria"][2]["title"].startswith("準備＝"), json.dumps(out3["analysis"]["criteria"][2], ensure_ascii=False))
an4 = json.loads(base.ANALYSIS); an4["criteria"][2]["id"] = "event-t3"
out4, _, _ = run(4, prev=prev_of(out3), analysis=json.dumps(an4, ensure_ascii=False))
ids4 = [c["id"] for c in out4["analysis"]["criteria"]]
check("turn 4: card 2 = this turn's event (marked), card 3 = turn 3's event", ids4[1:] == ["event-t4", "event-t3"]
      and cards(out4)["event-t4"]["priority"] == "中心" and cards(out4)["event-t4"]["meaning"] == "料理をきちんとそろえることを優先し、品数を一品増やし、盛りつけにも時間をかけます。",
      str(ids4))
check("turn 4, nothing said about preparation: card 3 keeps the registered event text",
      cards(out4)["event-t3"]["meaning"] == "夕食の準備を、相手が来る前にすべて済ませておくこととして扱う。" and out4["meta"]["smallTalkStates"] == {"prep": "untouched"})

# 4) 訂正されたあとのカード
own4, _, _ = run(4, prev=prev_of(out3), analysis=json.dumps(an4, ensure_ascii=False), user="準備を全部済ませて待つのではなく、来てから一緒に具を混ぜたいです。")
check("turn 4, corrected in the participant's own direction: card 3 shows the registered 'received again' text",
      cards(own4)["event-t3"]["meaning"] == "夕食の準備は、相手が来てから一緒に仕上げたい、と受け取っています。" and own4["meta"]["smallTalkStates"]["prep"] == "own")
stale = json.loads(json.dumps(an4)); stale["criteria"][2].update({"title": "夕食の準備の進め方", "meaning": "夕食の準備を、相手が来る前にすべて済ませておくこととして扱う。"})
oth4, _, _ = run(4, prev=prev_of(out3), analysis=json.dumps(stale, ensure_ascii=False), user="準備を全部済ませるのは違います。")
check("turn 4, rejected without a direction: the event text does not stay; the registered 'not decided' text is shown",
      cards(oth4)["event-t3"]["meaning"] == "夕食の準備をどう進めるかは、まだ決めていません。" and oth4["meta"]["smallTalkStates"]["prep"] == "other",
      cards(oth4)["event-t3"]["meaning"])
an5 = json.loads(base.ANALYSIS); an5["criteria"][2]["id"] = "event-t3"; an5["criteria"][1]["id"] = "event-t4"
un5, _, _ = run(5, prev=prev_of(out4), analysis=json.dumps(an5, ensure_ascii=False), user="食べて飲んで片付ける。一緒に過ごす時間を楽しみたい。")
check("turn 5, no correction (ordinary words only): card 2 keeps the registered priority and its mark",
      cards(un5)["event-t4"]["meaning"].startswith("料理をきちんとそろえることを優先し") and cards(un5)["event-t4"]["priority"] == "中心"
      and un5["meta"]["smallTalkStates"]["keep"] == "untouched", json.dumps(cards(un5)["event-t4"], ensure_ascii=False))
ow5, _, _ = run(5, prev=prev_of(out4), analysis=json.dumps(an5, ensure_ascii=False), user="品数を増やすより、一緒にいる時間のほうが大事です。")
check("turn 5, corrected: card 2 shows the registered 'received again' text without the mark",
      cards(ow5)["event-t4"]["meaning"] == "料理をそろえることよりも、相手と一緒に過ごす時間を大切にしたい、と受け取っています。" and cards(ow5)["event-t4"]["priority"] != "中心")
check("card positions stay the same on turn 5", [c["id"] for c in ow5["analysis"]["criteria"]][1:] == ["event-t4", "event-t3"])

# 5) 状態の判定
S = core.smalltalk_state
for item, own, text, want in [
    ("prep", "together", "「相手が来る前にすべて済ませておく」は、私の言葉と逆である。来てから夫が野菜を切り、私が炒める。", "own"),
    ("prep", "together", "並んで座って食べたいです。来てから乾杯したい。", "untouched"),
    ("prep", "together", "済ませておくのでいいです。", "untouched"),
    ("prep", "before", "父が来る前に筑前煮と食卓の準備を済ませ、座ったら台所へ戻らずにいたいです。", "own"),
    ("keep", "time", "「料理をきちんとそろえる方を優先」は違う。時間が足りなければ一緒にいる方を選ぶ。", "own"),
    ("keep", "time", "いや、品数増やして盛りつけるのは違うんだよね。", "other"),
    ("keep", "time", "ピザ食べて新居の話して、食後もだらっとでいいや", "untouched"),
    ("keep", "dishes", "料理を二品に減らすのは嫌です。品数は減らさないでほしい。", "own"),
]:
    check(f"state: {text[:22]}… -> {want}", S(item, own, [text]) == want, S(item, own, [text]))

# 6) 入力の誤り
for bad in ({"prep": "together"}, {"prep": "x", "keep": "time"}, {}):
    try:
        run(1, talk=bad)
        check(f"invalid answers {bad} are rejected", False)
    except core.ExperimentError as exc:
        check(f"invalid answers {bad} are rejected", exc.code == "P05_INVALID_SMALLTALK")

print("\nALL PASSED" if not FAILS else f"\n{len(FAILS)} FAILED: {FAILS}")
sys.exit(1 if FAILS else 0)
