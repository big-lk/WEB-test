"""v1.7 安定化のオフライン検証（OpenAI を呼ばない）。

python3 tests/aitest/test_v17_offline.py
"""
from __future__ import annotations

import json
import re
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

# 5) 重大コード（直接質問など）の候補は、その文を除いて採用（v2.1.1。以前は 502）
hard = core.ensure_exact_turn_ending(4, "あなたは何を一番大切にしたいですか？" + sentence + PAD)
core.call_openai = fake_by_stage([hard] * 3, [analysis_json(GENERIC_CARDS)] * 2)
r5 = core.run_two_ais(body(4, scenario))
check("hard-code sentence removed, rest accepted", "？" not in r5["dialogue"] and sentence in r5["dialogue"])

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

# 11) 第4回の優先関係：実際の線上出力（2026-11-17）で判定が意図どおりか
LIVE_T4 = [  # (scenario, title, meaning, relation_ok, title_ok)
    ("busy", "家で特別感を両方同時に", "相手を長く休ませるより、食べ始めから鶏もも肉のハーブ焼きの香りで“少し特別”を感じてもらうことを優先する。静けさは食後の短い時間に限定する。", True, False),
    ("reunion", "家で夕食を一緒に作る", "主菜の香りを楽しむ特別感を優先し、前菜と温かいスープは最初にまとめて出す。鶏もも肉は焼き上がりごとに一言添えて取り分ける。", False, False),
    ("milestone", "落ち着いた特別感を普段に混ぜる", "張りつめず大げさにしない特別感を食事全体の軸にし、いつもの気楽さは前半だけに限って後半は節目仕様として差を出す。", False, False),
    ("gratitude", "気負わず話せる食卓にしたい", "普段どおりの自然な会話を最優先にし、感謝を確実に伝えることは優先しない。会話は食事の前半だけ雑談として抑える。", False, False),
    ("busy", "家で少し特別な夕食体験", "相手を休ませることより「少し特別」と感じられることを優先し、温かな前菜と香りのメインを中心に自然に仕上げる。", True, False),
    ("reunion", "家で夕食を一緒に楽しむ", "ローストチキン等を一品ずつ出して料理の特別感を優先する夕食にする。会話は相づち中心で、自由な会話は料理待ちの短い時間に寄せる。", True, False),
    ("milestone", "控えめに段取りを変えて特別感", "普段の流れは保ったまま、前菜から主菜への切り替えで節目らしさを足し、控えめな短いコースにする。", False, False),
    ("gratitude", "感謝を自然に伝える", "感謝を確実に伝えることを優先し、雑談は食事の前半だけに抑えて、食後のカードで自然に受け渡す。", True, False),
]
for sc, title, meaning, rel, tit in LIVE_T4:
    check(f"relation judge [{sc}] {title}", core.priority_relation_ok(meaning, sc) == rel and core.priority_title_ok(title) == tit,
          f"rel={core.priority_relation_ok(meaning, sc)} title={core.priority_title_ok(title)}")
for sc in ANCHORS:
    check(f"standard event card passes relation [{sc}]",
          core.priority_relation_ok(core.event_card_meaning(4, core.controlled_priority_sentence(sc)), sc)
          and core.priority_title_ok(core.EVENT_CARD_TITLES[(4, sc)]))

# 12) 逆転した焦点カード＋別カードの「最優先」→ 修復後は登録文どおりの関係になり、二重の優先が消える
for sc, title, meaning, _, _ in LIVE_T4[:4]:
    cards = [dict(c) for c in GENERIC_CARDS]
    cards[1].update({"title": title, "meaning": meaning, "focus": True, "source": "AI_INFERENCE", "priority": "中心"})
    cards[0].update({"meaning": "自然な会話を最優先にして過ごす。", "focus": False})
    sentence = core.controlled_priority_sentence(sc)
    core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(4, "わかりました。" + sentence + PAD)] * 3,
                                     [analysis_json(cards)] * 2)
    result = core.run_two_ais(body(4, sc))
    crit = result["analysis"]["criteria"]
    focus = [c for c in crit if c["focus"]]
    others = " ".join(c["title"] + c["meaning"] for c in crit if not c["focus"])
    check(f"turn4 relation repaired [{sc}]", len(focus) == 1 and core.priority_relation_ok(focus[0]["meaning"], sc)
          and core.priority_title_ok(focus[0]["title"]) and "優先" not in others
          and result["analysis"]["criteria"][1]["id"] == GENERIC_CARDS[1]["id"]
          and len(result["meta"]["analysisAttempts"]) == 1,
          f"{focus} | {others} | {result['meta']['analysisRepairs']}")

# 13) strong_ambiguity では第4回の厳格判定をかけない（別の登録文のため）
cards = [dict(c) for c in GENERIC_CARDS]
core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(4, "わかりました。" + core.strong_ambiguity_sentence("busy", 4) + PAD)] * 3,
                                 [analysis_json(cards)] * 2)
b = body(4, "busy"); b["experimentVariant"] = "strong_ambiguity"
result = core.run_two_ais(b)
check("strong variant skips strict relation", not any(r.startswith("relation_") for r in result["meta"]["analysisRepairs"]),
      str(result["meta"]["analysisRepairs"]))

# 14) 修復対象は「優先された価値」のカード。「縮められた価値」のカードは id も内容も残る
cards = [
    {"id": "talk", "title": "自然に話せる時間", "meaning": "会話が途切れても気まずくならず自然に話せるようにする。", "priority": "中心",
     "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [0, 3], "focus": True},
    {"id": "dish", "title": "料理を少し凝る", "meaning": "料理を少し凝って特別感を出す。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [2], "focus": False},
    {"id": "mild", "title": "優しい味の料理", "meaning": "辛いものを避けて優しい味にする。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [4], "focus": False},
]
core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(4, "わかりました。" + core.controlled_priority_sentence("reunion") + PAD)] * 3,
                                 [analysis_json(cards)] * 2)
crit = core.run_two_ais(body(4, "reunion"))["analysis"]["criteria"]
by_id = {c["id"]: c for c in crit}
check("repair targets prioritized-value card", by_id["dish"]["focus"] and by_id["dish"]["title"] == "料理の特別感を優先"
      and by_id["talk"]["title"] == "自然に話せる時間" and not by_id["talk"]["focus"] and by_id["talk"]["priority"] == "維持",
      str(crit))

# 15) v1.8 終止文の二重表示（2026-11-17 線上 UI_A gratitude t6）
dup = "食後、お茶を注ぎながら「いつもありがとう」と短く添えてそこで終えます。現状の方針は以上です。未決定の部分は残したまま、実行に必要な内容だけを整理しました。"
fixed = core.ensure_exact_turn_ending(6, dup)
check("near-duplicate ending removed", fixed.count("方針は以上です") == 1 and fixed.endswith(core.TURN_ENDINGS[6]), fixed)
nopunct = core.ensure_exact_turn_ending(5, "相手が休める流れにします。気を遣わせることは避けたいです")
check("missing 。 added before ending", "避けたいです。\n" in nopunct, nopunct)

dup2 = "今日いちばん嬉しかったことだけを共有します。現行方針は以上です。"
fixed2 = core.ensure_exact_turn_ending(6, dup2)
check("near-duplicate ending removed (現行)", fixed2.count("方針は以上") == 1, fixed2)

# 16) v1.8 参加者の一人称まとめ文を除く（線上 UI_A busy t5）
t5 = ("特別感は控えめにして、相手がゆっくり休める流れを最優先にします。私は、この夕食で相手の負担を減らして安心して休めることを大切にし、"
      "気を遣わせたり急かしたりすることは避けたいです\n最後に、この夕食で大切にしたいことや避けたいことを、自分の言葉でまとめてください。")
out = core.ensure_exact_turn_ending(5, core.drop_participant_voice(t5))
check("participant-voice summary removed", "私は" not in out and out.endswith(core.TURN_ENDINGS[5]) and "最優先にします。" in out, out)

# 17) v1.8 第3回の焦点カード（線上の実例）
s_busy = core.controlled_fixation_sentence(ANCHORS["busy"], [], "x")
s_reu = core.controlled_fixation_sentence(ANCHORS["reunion"], [], "x")
judge = [
    (s_busy, "準備の負担を見せない工夫", "準備が大変そうに見えない形にして、会話は少なめで静かに休める形に寄せる。", ["A16_FIXATION_UNCLEAR", "A17_FIXATION_TITLE_UNCLEAR"]),
    # v1.9.6: 参加者の言葉のタイトル（価値名を含む）は残す
    (s_reu, "気負わず会話が続く時間", "自然に話せることを、照明や音の刺激を減らした静かな環境として扱う。", []),
    (s_busy, "静かに休める時間", "気を遣わせないことを、会話を少なくして静かに休めることとして扱う。", []),
]
for sentence, title, meaning, expect in judge:
    v = {"criteria": [{"title": title, "meaning": meaning, "focus": True}]}
    got = core.turn3_fixation_codes(v, sentence)
    check(f"turn3 judge {title}", got == expect, str(got))
for sc in ANCHORS:
    s = core.controlled_fixation_sentence(ANCHORS[sc], [], "x")
    a, n, tt, std = core.fixation_terms(s)
    v = {"criteria": [{"title": std, "meaning": core.event_card_meaning(3, s), "focus": True}]}
    check(f"turn3 standard card passes [{sc}]", core.turn3_fixation_codes(v, s) == [])
s_alt = "控えめな特別感は、追加の装飾を使わず一皿の盛り付けだけで伝えることとして整えます。"
v = {"criteria": [{"title": core.fixation_terms(s_alt)[3], "meaning": core.event_card_meaning(3, s_alt), "focus": True}]}
check("turn3 milestone alt sentence passes", core.turn3_fixation_codes(v, s_alt) == [])

# 18) 第3回：汎用カードは修復され、焦点はアンカー価値のカードに置かれる
for sc in ANCHORS:
    sentence = core.controlled_fixation_sentence(ANCHORS[sc], history(3), "静かで落ち着いた夕食にしたいです。")
    core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(3, "わかりました。" + sentence + PAD)] * 3, [analysis_json(GENERIC_CARDS)] * 2)
    r = core.run_two_ais(body(3, sc))
    focus = [c for c in r["analysis"]["criteria"] if c["focus"]]
    check(f"turn3 repaired to readable fixation [{sc}]", len(focus) == 1 and core.turn3_fixation_codes(r["analysis"], sentence) == []
          and len(r["meta"]["analysisAttempts"]) == 1, str(focus))

# 19) UI B：事象の対象カードに付いていた調整値をログに残す
src = [{"id": "talk", "title": "自然に話せる時間", "meaning": "会話を楽しむ。"},
       {"id": "dish", "title": "料理を少し凝る", "meaning": "料理の特別感を出す。"},
       {"id": "mild", "title": "優しい味", "meaning": "辛いものを避ける。"}]
b = body(4, "reunion", condition="UI_B")
b["delegationSourceCriteria"] = src
b["delegation"] = {"talk": "self", "dish": "ai", "mild": "consult"}
core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(4, "わかりました。" + core.controlled_priority_sentence("reunion") + PAD)] * 3,
                                 [analysis_json(GENERIC_CARDS)] * 2)
ed = core.run_two_ais(b)["meta"]["eventDelegation"]
check("event delegation logged", ed and ed["compressed"]["state"] == "self" and ed["prioritized"]["state"] == "ai", str(ed))

# 20) v1.9 隔離：UI A と UI B で会話AI・分析AIへの入力が同一（ボタン状態・条件名が入らない）
def capture_inputs(b):
    seen = []
    def call(payload):
        seen.append(payload)
        if payload["instructions"].startswith(core.DIALOGUE_INSTRUCTIONS[:40]):
            return fake_response(core.ensure_exact_turn_ending(b["turn"], "わかりました。" + core.controlled_priority_sentence("reunion") + PAD), "d")
        return fake_response(analysis_json(GENERIC_CARDS), "a")
    core.call_openai = call
    core.run_two_ais(b)
    return seen
ba = body(4, "reunion", condition="UI_A", previous=prev3)
bb = body(4, "reunion", condition="UI_B", previous=prev3)
bb["delegationSourceCriteria"] = prev3
bb["delegation"] = {c["id"]: "self" for c in prev3}
ia, ib = capture_inputs(ba), capture_inputs(bb)
check("dialogue input identical across UIs", ia[0]["input"] == ib[0]["input"] and ia[0]["instructions"] == ib[0]["instructions"]
      and "UI_B" not in ib[0]["input"] and "self" not in ib[0]["input"])
check("analysis input identical across UIs", ia[-1]["input"] == ib[-1]["input"] and "UI_B" not in ib[-1]["input"])

# 21) v1.9 未修正の優先関係は第5回の面板で維持、修正があれば維持を強制しない
e2_prev = [{"id": "dish", "title": "料理の特別感を優先", "priority": "中心",
            "meaning": core.event_card_meaning(4, core.controlled_priority_sentence("reunion"))},
           {"id": "talk", "title": "自然に話せる時間", "meaning": "会話を楽しむ。", "priority": "維持"},
           {"id": "mild", "title": "優しい味", "meaning": "辛いものを避ける。", "priority": "維持"}]
drifted = [
    {"id": "dish", "title": "優しい味の特別感", "meaning": "料理は少し凝って優しい味にする。", "priority": "中心",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [4], "focus": True},
    {"id": "talk", "title": "会話時間をちゃんと取る", "meaning": "話す時間をしっかり確保する。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [2], "focus": False},
    {"id": "mild", "title": "優しい味", "meaning": "辛いものを避けて優しい味にする。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [4], "focus": False},
]
for text, expect_kept in [("最初に軽くつまめるものを出して、メインは一緒に取り分けたいです。", True),
                          ("会話を料理待ちの時間だけにするのは違います。食べながらずっと話したいです。", False)]:
    b = body(5, "reunion", previous=e2_prev); b["userText"] = text
    core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(5, "わかりました。" + PAD[:120])] * 3, [analysis_json(drifted)] * 2)
    r = core.run_two_ais(b)
    kept = any(x.startswith("relation_kept") for x in r["meta"]["analysisRepairs"])
    dish = next(c for c in r["analysis"]["criteria"] if c["id"] == "dish")
    check(f"turn5 relation kept={expect_kept}", kept == expect_kept and
          (core.priority_relation_ok(dish["meaning"], "reunion") == expect_kept), str(r["meta"]["analysisRepairs"]))

# 22) v1.9.1 第6回：未修正なら最終方針に優先関係が残るまで再生成、修正済みなら要求しない
def hist6(t5_text):
    h = history(6)
    h[8] = {"role": "user", "content": t5_text}
    return h
final_no = core.ensure_exact_turn_ending(6, "わかりました。" + PAD)
final_yes = core.ensure_exact_turn_ending(6, "わかりました。自由な会話は料理を待つ短い時間を中心にします。" + PAD)
for t5_text, dialogues, expect_attempts in [
    ("最初に軽くつまめるものを出したいです。", [final_no], 1),
    ("会話を料理待ちの時間だけにするのは違います。", [final_no], 1),
]:
    b = body(6, "reunion", previous=e2_prev); b["history"] = hist6(t5_text); b["userText"] = "二人とも楽しかったと思える夜にしたいです。"
    core.call_openai = fake_by_stage(dialogues * 3, [analysis_json(drifted)] * 2)
    r = core.run_two_ais(b)
    n = len([a for a in r["meta"]["dialogueAttempts"] if isinstance(a.get("attempt"), int)])
    kept = any(x.startswith("relation_kept") for x in r["meta"]["analysisRepairs"])
    untouched = "料理待ち" not in t5_text
    inserted = r["meta"]["finalRelationInserted"]
    check(f"turn6 relation retention untouched={untouched}", n == 1 and inserted == untouched and kept == untouched
          and (core.compression_clause("reunion") in r["dialogue"]) == untouched and r["dialogue"].endswith(core.TURN_ENDINGS[6]),
          f"attempts={n} kept={kept} inserted={inserted} {r['dialogue'][-120:]}")

# 23) v1.9.2 方針の引用・説明語（線上 B milestone t6）は再生成対象
quoted = core.ensure_exact_turn_ending(6, "わかりました。優先関係は「今回は普段どおりの気楽さよりも節目の特別感を優先し」とします。" + PAD)
natural = core.ensure_exact_turn_ending(6, "わかりました。いつもの流れは食事の前半だけにして、後半は主菜の香りを主役にします。" + PAD)
b = body(6, "milestone", previous=e2_prev); b["history"] = hist6("前菜を食べながら乾杯したいです。"); b["userText"] = "記憶に残る夕食にしたいです。"
core.call_openai = fake_by_stage([quoted, natural, natural], [analysis_json(drifted)] * 2)
r = core.run_two_ais(b)
check("quoted relation regenerated", r["dialogue"] == natural and "R20_RELATION_QUOTED" in str(r["meta"]["dialogueAttempts"]), r["dialogue"][:60])

# 24) v1.9.5 文章からの関わり方指定（例文の型と言い換え）
reqs = core.delegation_requests("「静かに休める時間」は自分で決めたいので、今の内容のまま変えないでください。"
                                "「少し特別な感じ」は具体的な案を一つ出してください。「感謝の伝え方」はまだ決めずに、考える材料を示してください。"
                                "「料理」を任せたいです。")
check("text delegation patterns", reqs == [("静かに休める時間", "USER_DECIDE"), ("少し特別な感じ", "AI_PROPOSE"), ("料理", "AI_PROPOSE"),
                                          ("感謝の伝え方", "CO_DECIDE")], str(reqs))
b = body(3, "busy", previous=[{"id": "rest", "title": "静かに休める時間", "meaning": "x", "priority": "維持"},
                               {"id": "light-special", "title": "さりげない特別感", "meaning": "y", "priority": "維持"},
                               {"id": "no-burden", "title": "負担をかけない", "meaning": "z", "priority": "維持"}])
b["userText"] = "「さりげない特別感」は具体的な案を一つ出してください。会話は少なめでいいです。"
sentence = core.controlled_fixation_sentence(ANCHORS["busy"], history(3), b["userText"])
core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(3, "わかりました。" + sentence + PAD)] * 3, [analysis_json(GENERIC_CARDS)] * 2)
r = core.run_two_ais(b)
ls = next(c for c in r["analysis"]["criteria"] if c["id"] == "light-special")
check("text delegation applied to same id", ls["delegationState"] == "AI_PROPOSE" and r["meta"]["delegationFromText"] == ["light-special=AI_PROPOSE"],
      str(r["meta"]["delegationFromText"]))

# 25) v1.9.5 第5回：参加者のまとめの代筆を除く（線上 gratitude t5）
t5b = "食後にお茶を出すとき短く添えます。最後にこの夕食で大切にしたいことは自然に感謝を届けること、避けたいことは改まって重くしすぎることです。"
out = core.drop_participant_voice(t5b)
check("summary pre-writing removed", "避けたい" not in out and "短く添えます。" in out, out)

# 26) v1.9.6 E2 は縮められる側（会話）のカードに書かない（模擬参加者 P2 で発生）
cards = [
    {"id": "calm", "title": "刺激の少ない静かな場", "meaning": "自然に話せることを、照明や音の刺激を減らした静かな環境として扱う。", "priority": "中心",
     "delegationState": "USER_DECIDE", "source": "AI_INFERENCE", "evidenceTurns": [3], "focus": True},
    {"id": "glad", "title": "来てよかったと感じてほしい", "meaning": "相手に来てよかったと感じてもらう。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [1], "focus": False},
    {"id": "again", "title": "食後に自然な「また会おう」", "meaning": "食後に自然にまた会おうと言える。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [1], "focus": False},
]
core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(4, "わかりました。" + core.controlled_priority_sentence("reunion") + PAD)] * 3,
                                 [analysis_json(cards)] * 2)
crit = core.run_two_ais(body(4, "reunion"))["analysis"]["criteria"]
calm = next(c for c in crit if c["id"] == "calm")
check("E2 not written onto compressed-value card", "優先" not in calm["title"] and not calm["focus"], str(crit))

# 27) v1.9.6 「変えないで」と書かれたカードは（第3・4回以外）文言を保つ
prev_lock = [{"id": "calm", "title": "落ち着いた雰囲気でじっくり話す", "meaning": "落ち着いた雰囲気で、じっくり話せる時間にする。", "priority": "中心"},
             {"id": "glad", "title": "来てよかったと感じてほしい", "meaning": "相手に来てよかったと感じてもらう。", "priority": "維持"},
             {"id": "again", "title": "食後に自然な「また会おう」", "meaning": "食後に自然にまた会おうと言える。", "priority": "維持"}]
changed = [dict(c, delegationState="CO_DECIDE", source="USER_TURN", evidenceTurns=[2], focus=(c["id"] == "calm")) for c in prev_lock]
changed[0]["meaning"] = "落ち着いた雰囲気でじっくり話し、気楽に昔話も近況も話せるようにする。"
b = body(2, "reunion", previous=prev_lock); b["userText"] = "「落ち着いた雰囲気でじっくり話す」はこのまま変えないでください。気楽に話せることも大切です。"
core.call_openai = fake_by_stage([core.ensure_exact_turn_ending(2, "わかりました。" + PAD)] * 3, [analysis_json(changed)] * 2)
r = core.run_two_ais(b)
calm = next(c for c in r["analysis"]["criteria"] if c["id"] == "calm")
check("locked card wording kept", calm["meaning"] == prev_lock[0]["meaning"] and calm["delegationState"] == "USER_DECIDE"
      and "user_lock_kept:calm" in r["meta"]["analysisRepairs"], str(calm))

# 28) v2.1 一般的解釈の置換刺激（登録候補から、参加者の記述と最も重ならないものを選ぶ）
def router(extract_json, dialogue_fn, analysis_text):
    seen = []
    def call(payload):
        seen.append(payload)
        ins = payload["instructions"]
        if ins.startswith(core.GENERIC_EXTRACT_INSTRUCTIONS[:20]):
            return fake_response(extract_json, "x")
        if ins.startswith(core.DIALOGUE_INSTRUCTIONS[:40]):
            return fake_response(dialogue_fn(payload), "d")
        return fake_response(analysis_text, "a")
    return call, seen
def sent_from(payload):
    return re.search(r"今回の強制文（一字も変えず、可視回答に正確に含める）: (.+)", payload["input"]).group(1).strip()
busy_hist = history(3)
busy_hist[2] = {"role": "user", "content": "気を遣わせないで、いつも通り二人で台所に立って作りたいです。"}
for variant, marker in [("generic_marked", "一般的には"), ("generic_implicit", None)]:
    b = body(3, "busy"); b["experimentVariant"] = variant; b["history"] = busy_hist
    call, seen = router("{}", lambda p: core.ensure_exact_turn_ending(3, "わかりました。" + sent_from(p) + PAD), analysis_json(GENERIC_CARDS))
    core.call_openai = call
    r = core.run_two_ais(b)
    sent = r["meta"]["requiredControlSentence"]
    focus = [c for c in r["analysis"]["criteria"] if c["focus"]][0]
    check(f"{variant} t3 registered generic sentence", sent and "「気を遣わせない」" in sent and sent in r["dialogue"]
          and ((marker in sent) if marker else ("一般的" not in sent))
          and r["meta"]["genericStimulus"]["parts"]["generic"] in core.GENERIC_MEANING_CANDIDATES["busy"], sent)
    check(f"{variant} t3 panel event card", "気を遣わせない" in focus["title"] + focus["meaning"], str(focus))
# 参加者の記述と重なる候補（静かに・休む）は選ばれない
quiet_text = "相手には何もさせず休んでいてほしい。静かに過ごしたい。"
pick = core.least_overlapping(core.GENERIC_MEANING_CANDIDATES["busy"], quiet_text)
check("least-overlapping candidate avoids participant's own meaning", pick == "準備の手間を見せず、すべてこちらで用意すること", pick)
busy_hist4 = history(4)
busy_hist4[2] = busy_hist[2]
b = body(4, "busy"); b["experimentVariant"] = "generic_implicit"; b["history"] = busy_hist4
call, seen = router('{"demoted":"二人で台所に立つこと"}', lambda p: core.ensure_exact_turn_ending(4, "わかりました。" + sent_from(p) + PAD),
                    analysis_json(GENERIC_CARDS))
core.call_openai = call
r = core.run_two_ais(b)
focus = [c for c in r["analysis"]["criteria"] if c["focus"]][0]
check("generic t4 sentence + panel", r["meta"]["requiredControlSentence"] ==
      "今回は二人で台所に立つことよりも相手をゆっくり休ませることを優先し、二人で台所に立つのは短い時間だけにします。"
      and r["meta"]["requiredControlSentence"] in r["dialogue"] and "優先" in focus["title"] and focus["priority"] == "中心", str(focus))
call, seen = router('{"demoted":"x"}', lambda p: core.ensure_exact_turn_ending(4, "わかりました。" + sent_from(p) + PAD), analysis_json(GENERIC_CARDS))
core.call_openai = call
r = core.run_two_ais(b)
check("generic t4 falls back when extraction invalid", r["meta"]["genericStimulus"]["source"] == "fallback_standard"
      and r["meta"]["requiredControlSentence"] == core.controlled_priority_sentence("busy"))
check("extractor input has no UI info", all("UI_B" not in p["input"] for p in seen))

# 29) v2.1.1 「例：」は言語混在扱いにしない／質問文・禁止語は文ごと除いて 502 を避ける
colon = core.ensure_exact_turn_ending(2, "わかりました。例：温かい汁物を一品足します。" + PAD)
check("full-width colon allowed", "R05_LANGUAGE_MIXED" not in core.dialogue_validation_codes(2, colon))
sentence = core.controlled_priority_sentence("reunion")
bad_q = core.ensure_exact_turn_ending(4, "わかりました。" + sentence + "自分で決めたいとのことなので、そこは触れません。料理は何がいいですか？" + PAD)
core.call_openai = fake_by_stage([bad_q] * 3, [analysis_json(GENERIC_CARDS)] * 2)
r = core.run_two_ais(body(4, "reunion"))
check("hard-code candidate sanitized instead of 502", sentence in r["dialogue"] and "？" not in r["dialogue"]
      and "自分で決めたい" not in r["dialogue"], r["dialogue"][:120])

# 30) v2.2 E2 別案（未順位部分への一般的優先）と、事象カードを別カードで出す方式
for variant, marker in [("generic_unranked", None), ("generic_unranked_marked", "大切にする方が多い")]:
    b = body(4, "busy"); b["experimentVariant"] = variant; b["history"] = busy_hist4; b["eventCardMode"] = "separate"
    prev_lock = [dict(c) for c in GENERIC_CARDS]
    b["previousCriteria"] = [{k: c[k] for k in ("id", "title", "meaning", "priority")} for c in prev_lock]
    call, seen = router("{}", lambda p: core.ensure_exact_turn_ending(4, "わかりました。" + sent_from(p) + PAD), analysis_json(GENERIC_CARDS))
    core.call_openai = call
    r = core.run_two_ais(b)
    sent = r["meta"]["requiredControlSentence"]
    crit = r["analysis"]["criteria"]
    ev = [c for c in crit if c["id"] == "event-t4"]
    kept_ids = {c["id"] for c in crit} - {"event-t4"}
    check(f"{variant}: no reversal of stated priority", "よりも" not in sent and "優先して" in sent
          and ((marker in sent) if marker else "一般" not in sent and "方が多い" not in sent), sent)
    check(f"{variant}: separate event card, other cards untouched", len(ev) == 1 and ev[0]["focus"] and ev[0]["priority"] == "中心"
          and all(c["title"] == next(g["title"] for g in GENERIC_CARDS if g["id"] == c["id"]) for c in crit if c["id"] in kept_ids),
          str(crit))
# 第4回でも第3回の事象カードは残る
crit3 = [dict(c) for c in GENERIC_CARDS]; crit3[0]["id"] = "event-t3"; crit3[0]["title"] = "E1"
rep = []
core.enforce_generic_panel(4, crit3, {"preferred": "相手をゆっくり休ませること", "action": "片付けはすべてこちらでします"}, rep, "separate")
check("separate mode keeps event-t3 at turn 4", any(c["id"] == "event-t3" for c in crit3) and any(c["id"] == "event-t4" for c in crit3), str(crit3))

# 31) v2.3 別カード方式：参加者が固定したカード（UI B の self／文章の「変えないで」）は置き換えない
lock_prev = [dict(c) for c in GENERIC_CARDS]
lock_prev[0]["priority"] = "未確定"  # 固定したカードが最も優先度の低い位置にある場合
b = body(3, "busy", condition="UI_B"); b["experimentVariant"] = "generic_unranked"; b["eventCardMode"] = "separate"
b["history"] = busy_hist
b["previousCriteria"] = [{k: c[k] for k in ("id", "title", "meaning", "priority")} for c in lock_prev]
b["delegationSourceCriteria"] = b["previousCriteria"]
b["delegation"] = {"calm-time": "self", "light-special": "consult", "no-burden": "consult"}
cards_now = [dict(c) for c in lock_prev]
call, seen = router("{}", lambda p: core.ensure_exact_turn_ending(3, "わかりました。" + sent_from(p) + PAD), analysis_json(cards_now))
core.call_openai = call
r = core.run_two_ais(b)
ids = [c["id"] for c in r["analysis"]["criteria"]]
check("separate mode never replaces UI B self-locked card", "calm-time" in ids and "event-t3" in ids, str(ids))
# 文章での「変えないで」も同様（UI A）、かつ第3回でも文言を保つ
b = body(3, "busy"); b["experimentVariant"] = "generic_unranked"; b["eventCardMode"] = "separate"; b["history"] = busy_hist
b["previousCriteria"] = [{k: c[k] for k in ("id", "title", "meaning", "priority")} for c in lock_prev]
b["userText"] = "「落ち着いた時間」は自分で決めたいので、今の内容のまま変えないでください。食事中は笑っていたいです。"
changed = [dict(c) for c in lock_prev]; changed[0]["meaning"] = "静かに落ち着いて食べる時間にする。"
call, seen = router("{}", lambda p: core.ensure_exact_turn_ending(3, "わかりました。" + sent_from(p) + PAD), analysis_json(changed))
core.call_openai = call
r = core.run_two_ais(b)
calm = next((c for c in r["analysis"]["criteria"] if c["id"] == "calm-time"), None)
check("text-locked card kept and wording unchanged at turn 3", calm is not None and calm["meaning"] == lock_prev[0]["meaning"], str(calm))

print(f"\n{len(failures)} failure(s)")
sys.exit(1 if failures else 0)
