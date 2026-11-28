"""dialogueStyle="open"（?layout=flow2 が送る）と、分析AI の指示文 v7 の検証。OpenAI には接続しない（偽の応答）。

  python tests/aitest/test_open_style.py

確かめるのは、指定したときだけ効くこと・指示が正しく組み立てられること・検査の基準だけである。
回答やカードの質は偽の応答では分からない。実際のモデルでの結果はプロジェクト文書の早報を見ること。
"""
import json
import os
import sys
from pathlib import Path

os.environ.setdefault("OPENAI_API_KEY", "test-key")
os.environ.pop("EXPERIMENT_ENGINE", None)
os.environ.pop("EXPERIMENT_ANALYSIS_PROMPT", None)
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from api.aitest import core  # noqa: E402

FAILS = []


def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok else f" :: {detail}"))
    if not ok:
        FAILS.append(name)


ANCHOR = {"scenarioId": "busy", "scenarioLabel": "相手は最近忙しく、少し疲れている", "freeText": "疲れている友達が、気を使わずにくつろげる夜にしたい"}
CARDS = [
    {"id": "relax", "title": "友達のくつろぎ方", "meaning": "友達に気を使わせず、疲れをほどいてもらう夜にしたい、と受け取っています。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [0, 1], "focus": True},
    {"id": "easy", "title": "料理の手間", "meaning": "料理には手間をかけなくてよい、と受け取っています。何を作るかはまだ決めていません。", "priority": "未確定",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [1], "focus": False},
    {"id": "pending-meaning", "title": "未確定", "meaning": "未確定", "priority": "未確定",
     "delegationState": "CO_DECIDE", "source": "AI_INFERENCE", "evidenceTurns": [0], "focus": False},
]
ANALYSIS = json.dumps({"summary": "夕食の方針。", "criteria": CARDS}, ensure_ascii=False)
PAD = "料理は温かい鍋を中心にして、切って入れるだけの具材にします。飲み物は温かいお茶を用意して、席に着いたらすぐ食べ始められるようにします。"
CLOSE_NARADE = "次は、この目標と同時に大切にしたい別の気持ちや雰囲気を、お二人ならではの場面や習慣も交えて二つ三つ書いてください。"
SEEN = []


def fake(dialogue_text, analysis_text):
    def call(payload):
        SEEN.append(payload)
        if payload["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]):
            return dialogue_text, {"id": "d"}, 10.0
        return analysis_text, {"id": "a"}, 10.0
    return call


def run(user_text, dialogue_text, turn=1, session="SIMTEST-open", analysis_text=None, **extra):
    SEEN.clear()
    core.call_openai = fake(dialogue_text, analysis_text or ANALYSIS)
    rows = []
    for _ in range(1, turn):
        rows += [{"role": "user", "content": "友達がほっとして、笑って帰れる夜にしたい"}, {"role": "assistant", "content": "ほっとできる夜にします。"}]
    body = {"sessionId": session, "condition": "UI_B", "experimentVariant": "generic_unranked", "turn": turn, "userText": user_text,
            "history": rows, "pretaskAnchor": ANCHOR, "delegation": {}, "delegationSourceCriteria": [], "previousCriteria": [],
            "closingMode": "personal", **extra}
    out = core.run_two_ais(body)
    dialogue = next(p for p in SEEN if p["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]))
    analysis = next(p for p in SEEN if not p["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]))
    return out, dialogue, analysis


USER = "友達がほっとして、笑って帰れる夜にしたい。あの人は遠慮しがちなので、いつもの調子で話せるとうれしい。"
REPLY = "ほっとして笑って帰れる夜にしたいのですね。" + PAD + CLOSE_NARADE

# 1) 指定しなければ従来どおり
out, d, a = run(USER, "わかりました。" + PAD + "次は、「笑って帰れる夜」と同時に大切にしたい別の気持ちや雰囲気を書いてください。")
check("default: old instructions, low verbosity, style recorded as default",
      d["instructions"] == core.DIALOGUE_INSTRUCTIONS and d["text"]["verbosity"] == "low" and out["meta"]["dialogueStyle"] == "default"
      and out["meta"]["inputLevel"] == "normal")
check("default: analysis prompt stays v1 without the environment variable", a["instructions"] == core.ANALYSIS_PROMPTS["v1"] and out["meta"]["analysisPrompt"] == "v1")
check("default: a closing without a participant quote is rejected (falls back to the fixed ending)",
      run(USER, REPLY)[0]["meta"]["closingFallback"] is True)

# 2) open：指示文・長さ・末尾
out, d, a = run(USER, REPLY, dialogueStyle="open", analysisPrompt="v7")
check("open: open instructions and medium verbosity", d["instructions"] == core.DIALOGUE_INSTRUCTIONS_OPEN and d["text"]["verbosity"] == "medium")
check("open: body minimum and the 'ならでは' request are in the input", "は250字以上" in d["input"] and "320〜440字" in d["input"]
      and "お二人ならではの" in d["input"] and "二つ三つ" in d["input"] and out["meta"]["bodyMin"] == 250, d["input"][:200])
# 入力が長いほど、本文の下限が上がる（入力の約 2.2 倍、上限あり）
long_user = "父は無口で、ほめられると新聞に目を落とす人です。晩酌は日本酒を一合だけと決めています。母が亡くなってからは、二人で食卓を囲むのは月に一度になりました。" * 2
out_l, d_l, _ = run(long_user, REPLY, dialogueStyle="open")
n = out_l["meta"]["inputChars"]
check("open: a long input raises the body minimum in proportion", n > 120 and out_l["meta"]["bodyMin"] == min(int(n * 2.2), 560)
      and f"は{out_l['meta']['bodyMin']}字以上" in d_l["input"] and "要素ごとに応じる" in d_l["input"], str((n, out_l["meta"]["bodyMin"])))
very_long = "ほっとして笑って帰れる夜にしたいのですね。" + PAD * 11 + CLOSE_NARADE
check("open: with a 300-character input, an 800-character reply is accepted; with a short input it is too long",
      run(long_user * 2, very_long, dialogueStyle="open")[0]["meta"]["validationStatus"] == "passed"
      and "R03_TOO_LONG" in json.dumps(run(USER, very_long, dialogueStyle="open")[0]["meta"]["dialogueAttempts"]), str(len(very_long)))
check("default: no proportional directive", "要素ごとに応じる" not in run(long_user, REPLY)[1]["input"])
check("open: a closing with 'ならでは' passes without a quote", out["meta"]["closingFallback"] is False and out["dialogue"].endswith(CLOSE_NARADE), out["dialogue"][-60:])
check("open: meta records the style and the input level", out["meta"]["dialogueStyle"] == "open" and out["meta"]["inputLevel"] == "normal" and out["meta"]["inputChars"] > 30)
check("v7: selectable for a test id; analysis payload uses it", a["instructions"] == core.ANALYSIS_PROMPTS["v7"] and out["meta"]["analysisPrompt"] == "v7")
check("v7: the prompt asks for the AI's reading and a topic title", "と受け取っています" in core.ANALYSIS_PROMPTS["v7"] and "名詞句" in core.ANALYSIS_PROMPTS["v7"]
      and "と受け取っています" not in core.ANALYSIS_PROMPTS["v6"])
check("placeholder card text is normalised to the registered wording", [c["id"] for c in out["analysis"]["criteria"]][2] == "pending-meaning"
      and out["analysis"]["criteria"][2]["title"] == "まだ決めていないこと")
long_reply = "ほっとして笑って帰れる夜にしたいのですね。" + PAD * 8 + CLOSE_NARADE
check("open: a 600-character reply is accepted; without open it is too long",
      run(USER, long_reply, dialogueStyle="open")[0]["meta"]["validationStatus"] == "passed"
      and "R03_TOO_LONG" in json.dumps(run(USER, long_reply.replace(CLOSE_NARADE, "次は、「笑って帰れる夜」と同時に大切にしたい別の気持ちや雰囲気を書いてください。"))[0]["meta"]["dialogueAttempts"]))

alt_close = "次は、この目標と同時に大切にしたい別の気持ちや雰囲気を、お二人のいつもの過ごし方や口ぐせも交えて二つ三つ書いてください。"
out, d, a = run(USER, REPLY.replace(CLOSE_NARADE, alt_close), dialogueStyle="open")
check("open: a closing asking for habits / usual ways (without the word ならでは) also passes", out["meta"]["closingFallback"] is False
      and out["meta"]["validationStatus"] == "passed", json.dumps(out["meta"]["dialogueAttempts"], ensure_ascii=False)[:200])
plain_close = "次は、この目標と同時に大切にしたい別の気持ちや雰囲気を、二つ三つ書いてください。"
check("open: a closing with neither a quote nor a request for personal detail is still rejected",
      run(USER, REPLY.replace(CLOSE_NARADE, plain_close), dialogueStyle="open")[0]["meta"]["closingFallback"] is True)

# 3) open：入力がごく短いとき
thin_reply = "「友達が」というところまで受け取りました。最初に書いた目標からは、疲れている友達がくつろげる夜にしたいと分かります。どんな場面を思い浮かべているかが分かると、案を具体的にできます。" + CLOSE_NARADE
out, d, a = run("友達が", thin_reply, dialogueStyle="open")
check("open, turn 1, 3 characters: no-plan directive and a short target", out["meta"]["inputLevel"] == "very_thin" and out["meta"]["inputChars"] == 3
      and "案を出さない" in d["input"] and "120〜200字" in d["input"] and "最初に書いた目標" in d["input"])
check("open, turn 1, 3 characters: the short reply is accepted", out["meta"]["validationStatus"] == "passed", json.dumps(out["meta"]["dialogueAttempts"], ensure_ascii=False)[:300])
out, d, a = run("和食がいい", REPLY, turn=2, dialogueStyle="open")
check("open, turn 2, 5 characters: 'short' (one provisional idea), not 'no plan'", out["meta"]["inputLevel"] == "short" and "案を出さない" not in d["input"]
      and "一文だけの暫定" in d["input"])
out, d, a = run("あと、料理は簡単なものでいい", REPLY, turn=2, dialogueStyle="open")
check("open, turn 2, 13 characters: short", out["meta"]["inputLevel"] == "short" and out["meta"]["inputChars"] == 13)
out, d, a = run("友達が", thin_reply)
check("default: thin input adds no directive", out["meta"]["inputLevel"] == "normal" and "案を出さない" not in d["input"])

# 3b) v7：「中心」（画面の「AIの優先度：高い」）は、第4回に AI が決めた優先の項目だけ
central = json.dumps({"summary": "夕食の方針。", "criteria": [dict(CARDS[0], priority="中心"), CARDS[1], CARDS[2]]}, ensure_ascii=False)
out, d, a = run(USER, REPLY, analysis_text=central, dialogueStyle="open", analysisPrompt="v7")
check("v7: an ordinary card marked 中心 at turn 1 is reset to 維持", out["analysis"]["criteria"][0]["priority"] == "維持"
      and any(x.startswith("priority_reset:") for x in out["meta"]["analysisRepairs"]), json.dumps(out["meta"]["analysisRepairs"]))
out, d, a = run(USER, REPLY, analysis_text=central, dialogueStyle="open", analysisPrompt="v6")
check("v6: priority is left as the model returned it", out["analysis"]["criteria"][0]["priority"] == "中心")

# 4) v7 は試験用の番号でなければリクエストからは選べない（正式な番号は環境変数で決める）
out, d, a = run(USER, REPLY, session="P001", dialogueStyle="open", analysisPrompt="v7")
check("formal id: analysisPrompt in the request is ignored; dialogueStyle still applies",
      out["meta"]["analysisPrompt"] == "v1" and out["meta"]["dialogueStyle"] == "open")

print("\nALL PASSED" if not FAILS else f"\n{len(FAILS)} FAILED: {FAILS}")
sys.exit(1 if FAILS else 0)
