"""v1.7 安定化のオフライン検証（OpenAI を呼ばない）。

python3 tests/aitest/test_v17_offline.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "api" / "aitest"))
import core  # noqa: E402

ANCHORS = {
    "busy": {"scenarioId": "busy", "scenarioLabel": "忙しい相手", "freeText": "相手に気を遣わせないで、少し特別に感じてほしい"},
    "reunion": {"scenarioId": "reunion", "scenarioLabel": "久しぶり", "freeText": "自然に話せる時間にしたい"},
    "milestone": {"scenarioId": "milestone", "scenarioLabel": "節目", "freeText": "大げさにしすぎず特別にしたい"},
    "gratitude": {"scenarioId": "gratitude", "scenarioLabel": "感謝", "freeText": "感謝を重くしないで伝えたい"},
}
failures: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    print(("PASS " if ok else "FAIL ") + name + (f"  {detail}" if detail and not ok else ""))
    if not ok:
        failures.append(name)


def fake_response(text: str, rid: str = "r") -> tuple[str, dict, float]:
    return text, {"id": rid}, 10.0


PAD = ("食卓には温かい汁物と、相手が普段から好きな主菜を一つ用意します。照明は少し落として、器は家にあるものの中から落ち着いた色を選びます。"
       "飲み物は相手の体調に合わせて温かいお茶も用意し、食後には甘さ控えめの果物を少しだけ出します。準備は前日に下ごしらえを済ませ、当日は温め直すだけにします。")


def fake_by_stage(dialogues, analyses):
    """会話AI/分析AI を payload で振り分ける偽 call_openai。"""
    d, a = iter(dialogues), iter(analyses)
    def call(payload):
        if payload["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]):
            return fake_response(next(d), "d")
        return fake_response(next(a), "a")
    return call


def history(turn: int) -> list[dict[str, str]]:
    rows = []
    for t in range(1, turn):
        rows += [{"role": "user", "content": f"第{t}回の入力です。夕食について考えています。"},
                 {"role": "assistant", "content": f"第{t}回の回答です。夕食の案を考えました。"}]
    return rows


def body(turn: int, scenario: str, condition: str = "UI_A", previous=None) -> dict:
    return {
        "sessionId": "SIMTEST-offline", "condition": condition, "experimentVariant": "standard", "turn": turn,
        "userText": "静かで落ち着いた夕食にしたいです。", "history": history(turn),
        "pretaskAnchor": ANCHORS[scenario], "delegation": {}, "delegationSourceCriteria": [],
        "previousCriteria": previous or [],
    }


def analysis_json(criteria) -> str:
    return json.dumps({"summary": "夕食の方針。", "criteria": criteria}, ensure_ascii=False)


GENERIC_CARDS = [
    {"id": "calm-time", "title": "落ち着いた時間", "meaning": "落ち着いて食事できる時間を大切にする。", "priority": "中心",
     "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [1, 2], "focus": False},
    {"id": "light-special", "title": "さりげない特別感", "meaning": "少しだけ特別に感じられる工夫を入れる。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [0, 1], "focus": True},
    {"id": "no-burden", "title": "負担をかけない", "meaning": "相手に準備や気遣いの負担をかけない。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [0], "focus": False},
]

# 1) R11: 登録文（「限ります」で終わる）がそのまま入っていれば第4回は R11 にならない
for scenario in ANCHORS:
    sentence = core.controlled_priority_sentence(scenario)
    text = core.ensure_exact_turn_ending(4, "わかりました。" + sentence + "料理は普段より一品だけ増やし、食卓は落ち着いた照明にします。")
    codes = core.dialogue_validation_codes(4, text, ANCHORS[scenario]["freeText"], "静かにしたい", scenario_id=scenario,
                                           required_sentence=sentence)
    check(f"R11 registered sentence accepted [{scenario}]", "R11_PRIORITY_PROXY_MISSING" not in codes and
          "R16_PRIORITY_SENTENCE_MISSING" not in codes, str(codes))

# 2) 第3回：登録文があれば R10/R13 にならない
for scenario in ANCHORS:
    sentence = core.controlled_fixation_sentence(ANCHORS[scenario], history(3), "静かにしたい")
    text = core.ensure_exact_turn_ending(3, "そうですね。" + sentence + "料理は温かい汁物を中心にします。")
    codes = core.dialogue_validation_codes(3, text, ANCHORS[scenario]["freeText"], "静かにしたい", scenario_id=scenario,
                                           required_sentence=sentence)
    check(f"turn3 registered sentence accepted [{scenario}]",
          not ({"R10_FIXATION_MISSING", "R13_ANCHOR_FIXATION_MISSING"} & set(codes)), str(codes))

# 3) 汎用カードしか返らない分析でも、第3・4回はイベントカードに修復される（フォールバックにならない）
for turn in (3, 4):
    for scenario in ANCHORS:
        if turn == 3:
            sentence = core.controlled_fixation_sentence(ANCHORS[scenario], history(3), "静かで落ち着いた夕食にしたいです。")
        else:
            sentence = core.controlled_priority_sentence(scenario)
        dialogue_text = core.ensure_exact_turn_ending(turn, "わかりました。" + sentence + PAD)
        core.call_openai = fake_by_stage([dialogue_text] * 3, [analysis_json(GENERIC_CARDS)] * 2)
        result = core.run_two_ais(body(turn, scenario))
        meta = result["meta"]
        focus = [c for c in result["analysis"]["criteria"] if c["focus"]]
        _, codes = core.parse_analysis(json.dumps(result["analysis"], ensure_ascii=False), turn, scenario)
        check(f"analysis repaired t{turn} [{scenario}]",
              not meta["analysisFallback"] and len(focus) == 1 and focus[0]["source"] == "AI_INFERENCE"
              and (turn != 4 or focus[0]["priority"] == "中心"),
              f"fallback={meta['analysisFallback']} repairs={meta['analysisRepairs']} codes={codes}")

# 4) 会話AIが3回とも必須文を落としても 502 にならず、必須文が第2文に挿入される
scenario = "busy"
sentence = core.controlled_priority_sentence(scenario)
bad = core.ensure_exact_turn_ending(4, "わかりました。今回は落ち着いた時間を大切にします。" + PAD)
core.call_openai = fake_by_stage([bad] * 3, [analysis_json(GENERIC_CARDS)] * 2)
result = core.run_two_ais(body(4, scenario))
check("dialogue soft-accept inserts control sentence", sentence in result["dialogue"]
      and result["dialogue"].index(sentence) < 160
      and result["dialogue"].endswith(core.TURN_ENDINGS[4])
      and str(result["meta"]["dialogueAttempts"][-1]["status"]).startswith("control_sentence_inserted"),
      result["dialogue"][:200])

# 5) 重大コード（直接質問など）だけの候補は従来どおりエラー
hard = core.ensure_exact_turn_ending(4, "あなたは何を一番大切にしたいですか？" + sentence + PAD)
core.call_openai = fake_by_stage([hard] * 3, [analysis_json(GENERIC_CARDS)] * 2)
try:
    core.run_two_ais(body(4, scenario))
    codes_now = core.dialogue_validation_codes(4, hard, ANCHORS[scenario]["freeText"], "x", scenario_id=scenario,
                                               required_sentence=sentence)
    check("hard-code candidate is not soft-accepted", not (set(codes_now) & core.HARD_DIALOGUE_CODES),
          f"accepted although codes={codes_now}")
except core.ExperimentError as exc:
    check("hard-code candidate is not soft-accepted", exc.code == "R_VALIDATION_FAILED", exc.code)

# 6) 分析APIが失敗してもフォールバックにイベントカードが入る
for turn in (3, 4):
    sentence = (core.controlled_fixation_sentence(ANCHORS["reunion"], history(3), "静かで落ち着いた夕食にしたいです。")
                if turn == 3 else core.controlled_priority_sentence("reunion"))
    dialogue_text = core.ensure_exact_turn_ending(turn, "わかりました。" + sentence + PAD)
    core.call_openai = fake_by_stage([dialogue_text] * 3, ["not json"] * 2)
    result = core.run_two_ais(body(turn, "reunion"))
    ev = [c for c in result["analysis"]["criteria"] if c["id"] == f"event-turn-{turn}"]
    _, codes = core.parse_analysis(json.dumps(result["analysis"], ensure_ascii=False), turn, "reunion")
    check(f"fallback contains event card t{turn}", result["meta"]["analysisFallback"] and len(ev) == 1 and ev[0]["focus"]
          and "A13_EVENT_NOT_VISIBLE" not in codes, str(codes))

# 7) ID 照合：言い換えられた同じ価値は前ターンの id を引き継ぐ
previous = [{"id": "quiet-rest", "title": "静かに休める時間", "meaning": "会話を少なくして静かに休めるようにする。", "priority": "中心"},
            {"id": "a-bit-special", "title": "少し特別な感じ", "meaning": "普段より少しだけ特別に感じられる工夫。", "priority": "維持"}]
current = [{"id": "rest-quietly", "title": "静かに休める時間", "meaning": "会話を少なめにして静かに休めるようにする。"},
           {"id": "new-thing", "title": "片付けの手間", "meaning": "食後の片付けを簡単にする。"}]
mapping: list[str] = []
core.reconcile_ids(previous, current, mapping)
check("id reconciliation keeps similar card id", current[0]["id"] == "quiet-rest" and current[1]["id"] == "new-thing", str(mapping))

# 8) previousCriteria は分析入力にだけ入り、会話入力には入らない（UI A 条件の漏れ防止）
seen = []
def capture(payload):
    seen.append(payload)
    if len(seen) == 1:
        return fake_response(core.ensure_exact_turn_ending(2, "わかりました。" + PAD), "d")
    return fake_response(analysis_json(GENERIC_CARDS), "a")
core.call_openai = capture
try:
    core.run_two_ais(body(2, "busy", previous=previous))
except core.ExperimentError:
    pass
check("previousCriteria only in analysis input", len(seen) >= 2 and "quiet-rest" not in seen[0]["input"]
      and "quiet-rest" in seen[-1]["input"])

# 9) 第5回で分析が失敗しても、前ターンのカード（同じ id）を引き継ぐ
prev3 = [{"id": c["id"], "title": c["title"], "meaning": c["meaning"], "priority": c["priority"]} for c in GENERIC_CARDS]
core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(5, "わかりました。" + PAD[:120])] * 3, ["not json"] * 2)
try:
    result = core.run_two_ais(body(5, "reunion", previous=prev3))
    ids = [c["id"] for c in result["analysis"]["criteria"]]
    _, codes = core.parse_analysis(json.dumps(result["analysis"], ensure_ascii=False), 5, "reunion")
    check("turn5 fallback carries previous cards", result["meta"]["analysisFallback"] and ids == [c["id"] for c in GENERIC_CARDS]
          and not codes, f"{ids} {codes}")
except core.ExperimentError as exc:
    check("turn5 fallback carries previous cards", False, exc.code)

# 10) 第4回フォールバック＋引き継ぎ：イベントカードは id を維持しつつ1枚だけ focus
core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(4, "わかりました。" + core.controlled_priority_sentence("busy") + PAD)] * 3,
                                 ["not json"] * 2)
result = core.run_two_ais(body(4, "busy", previous=prev3))
crit = result["analysis"]["criteria"]
_, codes = core.parse_analysis(json.dumps(result["analysis"], ensure_ascii=False), 4, "busy")
check("turn4 fallback keeps ids with one event focus", [c["id"] for c in crit] == [c["id"] for c in GENERIC_CARDS]
      and sum(c["focus"] for c in crit) == 1 and "A13_EVENT_NOT_VISIBLE" not in codes, str(codes))

print(f"\n{len(failures)} failure(s)")
sys.exit(1 if failures else 0)
