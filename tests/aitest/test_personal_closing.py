"""closingMode="personal"（flow 配置）の末尾の検証。OpenAI には接続しない（会話AI・分析AI を偽の応答に置き換える）。

  python tests/aitest/test_personal_closing.py
"""
import json
import os
import sys
from pathlib import Path

os.environ.setdefault("OPENAI_API_KEY", "test-key")
os.environ.pop("EXPERIMENT_ENGINE", None)
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from api.aitest import core  # noqa: E402

FAILS = []


def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok else f" :: {detail}"))
    if not ok:
        FAILS.append(name)


def fake_response(text: str, rid: str = "r") -> tuple[str, dict, float]:
    return text, {"id": rid}, 10.0


def fake_by_stage(dialogues, analyses):
    d, a = iter(dialogues), iter(analyses)

    def call(payload):
        if payload["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]):
            return fake_response(next(d), "d")
        return fake_response(next(a), "a")
    return call


ANCHOR = {"scenarioId": "busy", "scenarioLabel": "相手は最近忙しく、少し疲れている", "freeText": "疲れている友達が、気を使わずにくつろげる夜にしたい"}
USER = "あと、料理は簡単な鍋でいいです。"
PAD = ("料理は温かい鍋を中心にして、切って入れるだけの具材にします。飲み物は温かいお茶を用意して、席に着いたらすぐ食べ始められるようにします。"
       "食卓は普段どおりにして、片づけも軽く済む形にします。")
CARDS = [
    {"id": "relax", "title": "気を使わずにくつろぐ", "meaning": "相手が構えずに過ごせる時間にする。", "priority": "中心",
     "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [0, 1], "focus": True},
    {"id": "easy", "title": "料理は簡単な鍋にする", "meaning": "切って入れるだけの鍋にして、手間を抑える。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [2], "focus": False},
    {"id": "rest", "title": "疲れをためない流れ", "meaning": "片づけまで軽く済むようにする。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [1], "focus": False},
]
ANALYSIS = json.dumps({"summary": "夕食の方針。", "criteria": CARDS}, ensure_ascii=False)


def body(turn=2, mode=None):
    rows = []
    for t in range(1, turn):
        rows += [{"role": "user", "content": "友達がほっとして、笑って帰れる夜にしたい"},
                 {"role": "assistant", "content": "ほっとできる夜にします。"}]
    b = {"sessionId": "SIMTEST-closing", "condition": "UI_A", "experimentVariant": "standard", "turn": turn,
         "userText": USER, "history": rows, "pretaskAnchor": ANCHOR, "delegation": {}, "delegationSourceCriteria": [],
         "previousCriteria": []}
    if mode:
        b["closingMode"] = mode
    return b


def run(dialogue_text, turn=2, mode="personal"):
    core.call_openai = fake_by_stage([dialogue_text] * 3, [ANALYSIS] * 2)
    return core.run_two_ais(body(turn, mode))


GOOD = "わかりました。" + PAD + "次は、簡単な鍋を囲む食事中に、会話や距離感をどんな時間にしたいかを書いてください。"
FIXED2 = core.TURN_ENDINGS[2]

# 1) 条件を満たす個別の末尾はそのまま採用される
r = run(GOOD)
check("personal closing accepted", r["dialogue"].endswith("どんな時間にしたいかを書いてください。") and FIXED2 not in r["dialogue"]
      and r["meta"]["closingMode"] == "personal" and r["meta"]["closingFallback"] is False
      and r["meta"]["dialogueAttempts"][0]["status"] == "passed", r["dialogue"][-80:] + str(r["meta"]["dialogueAttempts"]))

# 2) 固定の終止文のままなら、固定文で終わり、回退として記録される
r = run("わかりました。" + PAD + FIXED2)
check("fixed ending in personal mode -> fallback recorded", r["dialogue"].endswith(FIXED2) and r["dialogue"].count(FIXED2) == 1
      and r["meta"]["closingFallback"] is True, r["dialogue"][-90:])

# 3) 疑問文の末尾は使わない（R06）。固定文に戻り、疑問符は残らない
r = run("わかりました。" + PAD + "簡単な鍋を囲むとき、会話や距離感はどんな感じがよいですか？")
check("question closing -> fixed, no question mark", r["dialogue"].endswith(FIXED2) and "？" not in r["dialogue"]
      and r["meta"]["closingFallback"] is True, r["dialogue"][-90:])

# 4) 言葉の意味を尋ねる末尾は使わない
r = run("わかりました。" + PAD + "次は、「気を使わず」とはどういう時間のことかを書いてください。")
check("meaning-probing closing -> fixed", r["dialogue"].endswith(FIXED2) and "とはどういう" not in r["dialogue"]
      and r["meta"]["closingFallback"] is True, r["dialogue"][-90:])

# 5) 参加者の言葉が入っていない末尾は使わない
r = run("わかりました。" + PAD + "次は、会話や距離感をどんな時間にしたいかを書いてください。")
check("closing without participant words -> fixed", r["dialogue"].endswith(FIXED2) and r["meta"]["closingFallback"] is True, r["dialogue"][-90:])

# 6) 次の回の主題から外れた末尾は使わない
r = run("わかりました。" + PAD + "次は、簡単な鍋に入れたい具材を書いてください。")
check("off-theme closing -> fixed", r["dialogue"].endswith(FIXED2) and "具材を書いてください" not in r["dialogue"], r["dialogue"][-90:])

# 7) 指定がなければ従来どおり（固定の終止文、回退の記録なし）
r = run(GOOD, mode=None)
check("default mode unchanged", r["dialogue"].endswith(FIXED2) and r["meta"]["closingMode"] == "fixed" and r["meta"]["closingFallback"] is False,
      r["dialogue"][-90:])

# 8) 第6回は personal を指定しても従来の終止文
r = run("ここまでの内容をまとめます。" + PAD + core.TURN_ENDINGS[6], turn=6)
check("turn 6 keeps registered ending", r["dialogue"].endswith(core.TURN_ENDINGS[6]) and r["meta"]["closingMode"] == "fixed", r["dialogue"][-90:])

# 9) 第3回：必須文があっても個別の末尾と両立する
sentence = core.controlled_fixation_sentence(ANCHOR, body(3)["history"], USER)
r = run("なるほど、簡単な鍋ですね。" + sentence + PAD + "次は、簡単な鍋を囲む食卓で、二人がどう過ごしているとよいかを書いてください。", turn=3)
check("turn 3 control sentence + personal closing", sentence in r["dialogue"] and r["dialogue"].endswith("どう過ごしているとよいかを書いてください。")
      and r["meta"]["closingFallback"] is False, r["dialogue"][-90:] + " | " + str(r["meta"]["dialogueAttempts"]))

# 10) 判定関数そのもの
P = core.personal_closing_problems
users = [USER, ANCHOR["freeText"]]
check("problems: good", P(2, GOOD, users) == [], str(P(2, GOOD, users)))
check("problems: too long", "too_long" in P(2, "次は、簡単な鍋" + "を囲んで" * 25 + "会話をどうしたいかを書いてください。", users))
check("problems: priority probing", "probing" in P(2, "次は、簡単な鍋と会話のうち優先したい時間を書いてください。", users))

# 11) gap：固定の終止文の直前に「まだ決まっていないこと」の一文があれば合格
GAP = "わかりました。" + PAD + "料理の方向は形になってきましたが、食事中の会話や距離感など、料理以外の時間は、まだ何も決まっていません。" + FIXED2
r = run(GAP, mode="gap")
check("gap closing accepted", r["dialogue"].endswith(FIXED2) and "まだ何も決まっていません。" in r["dialogue"]
      and r["meta"]["closingMode"] == "gap" and r["meta"]["closingFallback"] is False
      and r["meta"]["dialogueAttempts"][0]["status"] == "passed", r["dialogue"][-120:] + str(r["meta"]["dialogueAttempts"]))
r = run("わかりました。" + PAD + FIXED2, mode="gap")
check("gap statement missing -> fixed ending kept, fallback recorded", r["dialogue"].endswith(FIXED2) and r["meta"]["closingFallback"] is True, r["dialogue"][-90:])

# 12) オフライン版：3 つの方式とも、禁止の形（疑問文など）を出さず、指定の末尾になる
from api.aitest import offline_engine  # noqa: E402
INPUTS = ["友達がほっとして、笑って帰れる夜にしたい", "あと、料理は簡単なものでいい", "食事中はテレビをみながらだらだら話したい",
          "ちょっと違います。鍋をつつきながら笑っている感じです", "それは優先しなくていいです。普通に食べて、食後はお茶で"]
for mode in ("fixed", "personal", "gap"):
    hist, ok, detail = [], True, ""
    for t, text in enumerate(INPUTS, 1):
        b = {"sessionId": "SIMTEST-closing-off", "engine": "offline", "condition": "UI_B", "experimentVariant": "generic_unranked", "turn": t,
             "userText": text, "history": list(hist), "pretaskAnchor": ANCHOR, "delegation": {}, "delegationSourceCriteria": [],
             "previousCriteria": [], "closingMode": mode}
        r = core.run_two_ais(b)
        d, m = r["dialogue"], r["meta"]
        fixed = core.TURN_ENDINGS[t]
        good = ("？" not in d and m["closingMode"] == mode and m.get("validationStatus") != "failed"
                and (d.endswith(fixed) if mode != "personal" or m["closingFallback"] else not d.endswith(fixed))
                and (mode != "gap" or m["closingFallback"] or "まだ" in d[-len(fixed) - 70:]))
        if not good:
            ok, detail = False, f"T{t}: {d[-110:]} {m['closingFallback']}"
        hist += [{"role": "user", "content": text}, {"role": "assistant", "content": d}]
    check(f"offline engine closing mode: {mode}", ok, detail)

print(f"\n{len(FAILS)} failure(s)")
sys.exit(1 if FAILS else 0)
