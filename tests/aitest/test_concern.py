"""試作 stimulusRule="concern"（その人のこだわりの話題を、一般的なやり方で扱う）の検証。

偽の応答を使う（組み立てと決まりごとだけを確かめる。実際のモデルの出力はここでは確かめない）。
実行：python tests/aitest/test_concern.py
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


def run(turn, user=None, talk=None, prev=None, analysis=None, rule="concern"):
    base.SEEN.clear()
    core.call_openai = base.fake(base.REPLY, analysis or base.ANALYSIS)
    rows = []
    for _ in range(1, turn):
        rows += [{"role": "user", "content": "友達がほっとして、笑って帰れる夜にしたい"}, {"role": "assistant", "content": "ほっとできる夜にします。"}]
    body = {"sessionId": "SIMTEST-concern", "condition": "UI_B", "experimentVariant": "generic_unranked", "turn": turn, "userText": user or base.USER,
            "history": rows, "pretaskAnchor": base.ANCHOR, "delegation": {}, "delegationSourceCriteria": [], "previousCriteria": prev or [],
            "closingMode": "personal", "dialogueStyle": "open", "analysisPrompt": "v7"}
    if rule:
        body["stimulusRule"] = rule
        body["smallTalk"] = talk if talk is not None else {"top": "serve", "second": "tidy"}
    out = core.run_two_ais(body)
    dialogue = next(p for p in base.SEEN if p["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]))
    analysis_ = next(p for p in base.SEEN if not p["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]))
    return out, dialogue, analysis_


def cards(out):
    return {c["id"]: c for c in out["analysis"]["criteria"]}


def prev_of(out):
    return [{k: c[k] for k in ("id", "title", "meaning", "priority")} for c in out["analysis"]["criteria"]]


S3 = "料理の出し方は、一般的なやり方に合わせて、前菜から順に、決まった間隔で出す形で整えます。"
S4 = "こうした夕食では見栄えよく整った食卓にすることを大切にする方が多いので、今回もそれを優先して、食後の片付けには手をかけずに済ませます。"

out, d, a = run(3, rule=None)
check("no stimulusRule: the old rule is used", out["meta"]["stimulusRule"] == "default")

out1, d1, a1 = run(1)
leak = [w for w in ("serve", "tidy", "こだわり") if w in d1["input"] + a1["input"]]
check("turn 1: the answers are not passed to either AI", not leak, str(leak))
out3, _, _ = run(3)
check("turn 3: the top concern is handled 'the general way' (second sentence of the reply)",
      out3["meta"]["requiredControlSentence"] == S3 and out3["dialogue"].split("。", 1)[1].startswith(S3), out3["dialogue"][:90])
out4, _, _ = run(4, prev=prev_of(out3))
check("turn 4: 'what most people value' is preferred over the second concern", out4["meta"]["requiredControlSentence"] == S4 and S4 in out4["dialogue"],
      out4["meta"]["requiredControlSentence"])
check("the sentences say that the handling is general", "一般的なやり方" in S3 and "方が多いので" in S4)
long_in, _, _ = run(3, user="父は無口で、ほめられると新聞に目を落とす人です。晩酌は一合だけです。" * 3)
check("the sentence does not depend on the dialogue; turn 3 does not scale with input length",
      long_in["meta"]["requiredControlSentence"] == S3 and long_in["meta"]["bodyMin"] == 270)

# 登録文：話題ごとに 1 つ、長さがそろっている
t3 = [core.concern_sentence(3, {"top": k, "second": "x"}) for k in core.CONCERN_TOPICS]
t4 = [core.concern_sentence(4, {"top": "x", "second": k}) for k in core.CONCERN_TOPICS]
check("registered sentences: 4 + 4, lengths within 8 characters of each other",
      len(set(t3)) == 4 and len(set(t4)) == 4 and max(map(len, t3)) - min(map(len, t3)) <= 8 and max(map(len, t4)) - min(map(len, t4)) <= 8,
      str([len(x) for x in t3 + t4]))

# カード
ids3 = [c["id"] for c in out3["analysis"]["criteria"]]
check("turn 3: the event card is card 3 with the registered text", ids3[2] == "event-t3"
      and cards(out3)["event-t3"]["meaning"] == "料理の出し方を、一般的なやり方に合わせて、前菜から順に、決まった間隔で出すこととして扱う。",
      json.dumps(out3["analysis"]["criteria"][2], ensure_ascii=False))
an4 = json.loads(base.ANALYSIS); an4["criteria"][2]["id"] = "event-t3"
out4, _, _ = run(4, prev=prev_of(out3), analysis=json.dumps(an4, ensure_ascii=False))
check("turn 4: card 2 = this turn's event (marked), card 3 = turn 3's event (unchanged while untouched)",
      [c["id"] for c in out4["analysis"]["criteria"]][1:] == ["event-t4", "event-t3"] and cards(out4)["event-t4"]["priority"] == "中心"
      and cards(out4)["event-t4"]["meaning"] == "見栄えよく整った食卓にすることを優先し、食後の片付けには手をかけずに済ませます。"
      and cards(out4)["event-t3"]["meaning"].startswith("料理の出し方を、一般的なやり方に合わせて"))
stale = json.loads(json.dumps(an4)); stale["criteria"][2].update({"title": "料理の出し方について", "meaning": cards(out3)["event-t3"]["meaning"]})
tou4, _, _ = run(4, prev=prev_of(out3), analysis=json.dumps(stale, ensure_ascii=False), user="決まった間隔で出すのは違います。祖母の箸の進み方を見てから次を出したいです。")
check("turn 4, the participant rejects it: the event text does not stay, and the pre-answer is not shown",
      tou4["meta"]["smallTalkStates"]["top"] == "touched" and cards(tou4)["event-t3"]["meaning"] == "料理をどう出すかは、まだ決めていません。",
      cards(tou4)["event-t3"]["meaning"])
an5 = json.loads(base.ANALYSIS); an5["criteria"][2]["id"] = "event-t3"; an5["criteria"][1]["id"] = "event-t4"
un5, _, _ = run(5, prev=prev_of(out4), analysis=json.dumps(an5, ensure_ascii=False), user="食べて飲んで、あとはゆっくり話したい。")
check("turn 5, no correction: card 2 keeps the registered priority and its mark",
      cards(un5)["event-t4"]["meaning"].startswith("見栄えよく整った食卓にすることを優先し") and cards(un5)["event-t4"]["priority"] == "中心")
to5, _, _ = run(5, prev=prev_of(out4), analysis=json.dumps(an5, ensure_ascii=False), user="見栄えを優先するのは違います。片付けは二人で並んでしたいです。")
check("turn 5, rejected: card 2 loses the mark and follows what was written in the dialogue",
      to5["meta"]["smallTalkStates"]["second"] == "touched" and cards(to5)["event-t4"]["priority"] != "中心")

S = core.concern_state
for topic, text, pr, want in [
    ("serve", "決まった間隔で出すのは違います。", False, "touched"),
    ("serve", "祖母がゆっくり食べられるといいです。", False, "untouched"),
    ("serve", "できたてを出したいです。", False, "untouched"),
    ("tidy", "片付けに手をかけないのは嫌です。", True, "touched"),
    ("tidy", "見栄えを優先とは思っていません。", True, "touched"),
    ("tidy", "洗い物は少なくていいです。", False, "untouched"),
    ("tidy", "見栄えを優先するのは違います。", True, "touched"),
    ("prep", "段取りどおりではなく、一緒に作りたい。", False, "touched"),
    ("tidy", "でも食器を絞ることより、食後に二人で並んで片付けるのが大事です。", False, "touched"),
    ("tidy", "見栄えより、急がず過ごせることを大切にしたいです。", True, "touched"),
    ("prep", "いつもより丁寧に準備したいです。", False, "untouched"),
    ("tidy", "食後は私がすぐ片付ける。", False, "untouched"),
]:
    check(f"state: {text[:18]}… -> {want}", S(topic, [text], priority=pr) == want, S(topic, [text], priority=pr))

for bad in ({"top": "serve"}, {"top": "serve", "second": "serve"}, {"top": "x", "second": "tidy"}):
    try:
        run(1, talk=bad)
        check(f"invalid answers {bad} are rejected", False)
    except core.ExperimentError as exc:
        check(f"invalid answers {bad} are rejected", exc.code == "P06_INVALID_CONCERN")

print("\nALL PASSED" if not FAILS else f"\n{len(FAILS)} FAILED: {FAILS}")
sys.exit(1 if FAILS else 0)
