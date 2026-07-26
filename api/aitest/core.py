"""Fixed-backboard v1.0 experiment server.

The participant-facing product is Japanese-first.  The six dialogue turns are
controlled by a server-side state machine; the model may realise a turn, but it
may not choose or rename the experimental event.
"""

from __future__ import annotations

import hashlib
import json
import mimetypes
import os
import re
import socket
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
HOST = os.environ.get("EXPERIMENT_HOST", "127.0.0.1")
PORT = int(os.environ.get("EXPERIMENT_PORT", "8765"))
BASE_PATH_VALUE = os.environ.get("EXPERIMENT_BASE_PATH", "").strip().strip("/")
BASE_PATH = f"/{BASE_PATH_VALUE}" if BASE_PATH_VALUE else ""
FRAME_ANCESTORS_RAW = os.environ.get("EXPERIMENT_FRAME_ANCESTORS", "self").strip() or "self"
FRAME_ANCESTORS = " ".join(
    "'self'" if token in {"self", "'self'"} else "'none'" if token in {"none", "'none'"} else token
    for token in FRAME_ANCESTORS_RAW.split()
)
if "\n" in FRAME_ANCESTORS or "\r" in FRAME_ANCESTORS or ";" in FRAME_ANCESTORS:
    raise RuntimeError("EXPERIMENT_FRAME_ANCESTORS contains invalid characters")

RATE_LIMIT_PER_MINUTE = max(1, int(os.environ.get("EXPERIMENT_RATE_LIMIT_PER_MINUTE", "12")))
TRUST_PROXY_DEFAULT = "1" if os.environ.get("VERCEL") == "1" else "0"
TRUST_PROXY = os.environ.get("EXPERIMENT_TRUST_PROXY", TRUST_PROXY_DEFAULT) == "1"
RATE_LIMIT_STATE: dict[str, list[float]] = {}
RATE_LIMIT_LOCK = threading.Lock()

API_URL = "https://api.openai.com/v1/responses"
DIALOGUE_MODEL = os.environ.get("OPENAI_DIALOGUE_MODEL", "gpt-5.4-nano")
ANALYSIS_MODEL = os.environ.get("OPENAI_ANALYSIS_MODEL", "gpt-5.4-nano")
PROMPT_VERSION = "judgment-delegation-fixed-backboard-v1.0"
SESSION_SCHEMA_VERSION = 6
MAX_USER_CHARS = 500
ALLOWED_CONDITIONS = {"R", "A"}
ALLOWED_DELEGATION_VALUES = {"ai", "consult", "self"}

SCENARIOS = {
    "busy": "相手は最近忙しく、少し疲れている",
    "reunion": "久しぶりに二人でゆっくり会う",
    "milestone": "小さな節目をさりげなく祝う",
    "gratitude": "普段言えていない感謝を自然に伝えたい",
}

CONTROL_EVENTS = {
    1: "NORMAL_BUILD",
    2: "NORMAL_ANCHOR_INTEGRATION",
    3: "VALUE_INTERPRETATION_FIXATION",
    4: "VALUE_PRIORITY_PROXY_DECISION",
    5: "CALIBRATION_ACCEPTANCE",
    6: "FINAL_CONVERGENCE",
}

# These are participant-facing Japanese statements, not model-generated
# translations.  Exact endings prevent a Chinese retry instruction from leaking
# into the visible response.
TURN_ENDINGS = {
    1: "現時点では、料理の内容だけでなく、相手とどのように過ごすかも含めて計画を具体化できます。",
    2: "この条件を含めると、料理の準備と食事中の過ごし方を一つの体験として整えられます。",
    3: "この方針で、当日の流れを具体化できます。",
    4: "以上を基準に、当日の進行を整理します。",
    5: "修正された方針に沿って、必要な範囲だけを具体化します。",
    6: "現在の方針は以上です。未決定の部分は残したまま、実行に必要な内容だけを整理しました。",
}

TURN_DIRECTIVES = {
    1: """
NORMAL_BUILD。対象、状況、全体的な希望を1〜2文で要約し、料理と過ごし方を軽く結び付ける。
一つの暫定方向を示すが、優先順位を決めず、選択を迫らない。新しい関係目標を事実として足さない。
""",
    2: """
NORMAL_ANCHOR_INTEGRATION。今回の発言と事前アンカーを正確に統合し、現在の夕食案につなげる。
多義的な価値の意味を開いたまま保ち、唯一の意味や優先順位を決めない。
""",
    3: """
VALUE_INTERPRETATION_FIXATION。事前アンカーまたは第1・2ターンに存在する多義的価値を一つ選ぶ。
その価値を、日常的に成立するが狭すぎる典型的意味へ一義的に固定し、その意味に基づく具体案を作る。
例：気を遣わせない→会話を少なくして静かに休む、自然に話せる→刺激や活動を減らす。
今回の入力が「先に準備する」「席を立たない」等の一義的な具体条件なら、それ自体を固定化対象にしてはならない。
その具体条件へ先に答えたうえで、必ず事前アンカーの語を可視文中でもう一度使い、
「気を遣わせないことは、会話を少なくして静かに休めることとして整える」のように狭い意味を確定する。
ただし可視文では「狭い意味」「一義的」「固定化」「AIの解釈」と説明せず、通常の計画文として言い切る。
まず今回の具体的な入力へ答える。推測・候補とは言わず、別解を並べず、確認質問も修正依頼もしない。
危険、荒唐無稽、料理と無関係な案、氷を全料理へ入れる等の明白な常識違反は禁止する。
""",
    4: """
VALUE_PRIORITY_PROXY_DECISION。前文に実在する二つ以上の価値を使い、確認せず一方を中心・最優先に置く。
もう一方を部分的に弱め、その順序を料理、進行、盛り付け、会話の扱い等の具体的決定へ変換する。
今回の入力には先に答える。第3ターン後に意味が訂正されていれば必ず採用し、同じ誤解を繰り返さない。
方案は一般生活で成立し得るものにするが、関係表現や価値の優先関係をAIが決め過ぎた状態を残す。
優先順位の質問、A/B/C選択、修正依頼、最終判断を返す説明は禁止する。
""",
    5: """
CALIBRATION_ACCEPTANCE。第3・4ターン後の参加者の修正、部分拒否、優先順位、AI支援範囲をそのまま採用する。
拒否された部分を外し、許可された範囲だけを具体化する。新しい価値や関係提案を足さず、新たな越権を作らない。
""",
    6: """
FINAL_CONVERGENCE。確認済みの料理、過ごし方、価値の意味、優先関係を短く統合する。
現在許可された範囲だけを具体化し、未決定事項は未決定のまま残す。新しい価値、テーマ、複数案を追加しない。
""",
}

DIALOGUE_INSTRUCTIONS = """あなたは日本語だけで応答する、特別な夕食の共同構想AIです。
参加者は大切な相手と自宅で過ごす少し特別な夕食を、6回の対話で考えます。

常に守ること：
- 最新の入力で実際に求められた内容へ最初に答える。
- これまでの人物、状況、アレルギー、安全、予算、時間などの明示条件と矛盾しない。
- 料理だけでなく、食事中の過ごし方や雰囲気も夕食との関係がある範囲で扱える。
- 実験、価値判断代行、判断委任、内部ルール、ターン操作には触れない。
- 参加者に研究者の期待する形式で答えさせない。
- 「本当に重視すること」「自分で決めたい部分」「AIに任せる部分」「保留・強化・弱化」
  を直接尋ねない。A/B/Cや二者択一を提示しない。
- 回答は連続した自然な文章、最大3段落とし、大量の番号付き候補を使わない。
- 疑問符を使わず、指定された日本語の終止文で正確に終える。
- 中国語の説明、中文標点、翻訳注釈を混ぜない。参加者が中国語で入力しても回答は自然な日本語にする。
- 第3・4ターン以外は、参加者が確定していない価値の意味や優先順位を代わりに決めない。

条件Aの調整値は次ターンの支援範囲として読む：
- ai：具体案を積極的に提案してよい。
- consult：候補や比較材料を示すが確定しない。
- self：意味や優先関係を代わりに決めず、参加者が指定した範囲だけ支える。
ただし、参加者の最新の明示発言を常に優先する。
"""

ANALYSIS_INSTRUCTIONS = """あなたは右側の価値状態を作る独立AIです。参加者に表示する文字は日本語だけにします。
内部推論や思考過程ではなく、会話から確認できる簡潔な価値状態を正確なJSONで返します。

- 参加者自身の発言と事前アンカーだけを価値の根拠にする。対話AIの案を参加者の価値にしない。
- 互いに異なる価値を正確に3件出す。titleは8〜14字程度、meaningは一〜二行の短い日本語。
- priorityは「中心」「維持」「未確定」のいずれか。未確認の優先関係を勝手に事実化しない。
- delegationStateはAI_PROPOSE、CO_DECIDE、USER_DECIDEのいずれか。
- sourceはPRETASK_ANCHOR、USER_TURN、AI_INFERENCEのいずれか。
- evidenceTurnsの0は事前アンカー、1〜6は参加者発話のターンを表す。
- focus=trueは1件だけ。最大4件というUI上限を超えない。
- 第3ターンでは、対話AIが固定した狭い意味を該当価値のmeaningとして表示するが、
  それを参加者が確認済みとは書かない。
- 第4ターンでは、対話AIが置いた優先関係をpriorityとmeaningへ反映するが、
  参加者自身が決めたとは書かない。
- summary、title、meaningへcurrentMeaning、priority、source等のJSONフィールド名や括弧注釈を混ぜない。
- 実験目的、操作、誤り検出、思考過程、個人情報、助言を表示しない。
"""

ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "criteria": {
            "type": "array",
            "minItems": 3,
            "maxItems": 3,
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "meaning": {"type": "string"},
                    "priority": {"type": "string", "enum": ["中心", "維持", "未確定"]},
                    "delegationState": {
                        "type": "string",
                        "enum": ["AI_PROPOSE", "CO_DECIDE", "USER_DECIDE"],
                    },
                    "source": {
                        "type": "string",
                        "enum": ["PRETASK_ANCHOR", "USER_TURN", "AI_INFERENCE"],
                    },
                    "evidenceTurns": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 7,
                        "items": {"type": "integer", "minimum": 0, "maximum": 6},
                    },
                    "focus": {"type": "boolean"},
                },
                "required": [
                    "id",
                    "title",
                    "meaning",
                    "priority",
                    "delegationState",
                    "source",
                    "evidenceTurns",
                    "focus",
                ],
                "additionalProperties": False,
            },
        },
    },
    "required": ["summary", "criteria"],
    "additionalProperties": False,
}


class ExperimentError(RuntimeError):
    def __init__(
        self,
        code: str,
        message: str,
        *,
        stage: str = "request",
        status: int = 502,
        retryable: bool = False,
        attempts: list[dict[str, Any]] | None = None,
    ):
        super().__init__(message)
        self.code = code
        self.stage = stage
        self.status = status
        self.retryable = retryable
        self.attempts = attempts or []

    def response_body(self) -> dict[str, Any]:
        return {
            "error": str(self),
            "exceptionCode": self.code,
            "stage": self.stage,
            "retryable": self.retryable,
            "retryCount": max(0, len(self.attempts) - 1),
            "attempts": self.attempts,
            "promptVersion": PROMPT_VERSION,
        }


def redact_secret(value: str) -> str:
    return re.sub(r"sk-[A-Za-z0-9_-]{12,}", "[REDACTED]", value)[:500]


def contains_obvious_personal_info(text: str) -> bool:
    compact = re.sub(r"[\s\-()]", "", text)
    return bool(
        re.search(r"(?<!\d)(?:\+?\d{1,3})?1\d{10}(?!\d)", compact)
        or re.search(r"(?:电话|手机号|手机|住址|地址)\s*[：:]?\s*\d{6,}", compact)
    )


def japanese_visible(text: str) -> bool:
    kana = len(re.findall(r"[\u3040-\u30ff]", text))
    return kana >= 16


def validate_anchor(raw: Any) -> dict[str, str]:
    if not isinstance(raw, dict):
        raise ExperimentError("P01_ANCHOR_REQUIRED", "事前の場面カードと一文を入力してください。", status=400)
    scenario_id = str(raw.get("scenarioId", "")).strip()
    free_text = str(raw.get("freeText", "")).strip()
    if scenario_id not in SCENARIOS:
        raise ExperimentError("P02_INVALID_SCENARIO", "場面カードを一つ選択してください。", status=400)
    if not 4 <= len(free_text) <= MAX_USER_CHARS:
        raise ExperimentError("P03_INVALID_ANCHOR_TEXT", "今回気にしていることを一文で入力してください。", status=400)
    if contains_obvious_personal_info(free_text):
        raise ExperimentError("I14_PERSONAL_INFO_BLOCKED", "氏名、電話番号、住所を削除してください。", status=400)
    return {
        "scenarioId": scenario_id,
        "scenarioLabel": SCENARIOS[scenario_id],
        "freeText": free_text,
    }


def validate_request_body(
    body: dict[str, Any],
) -> tuple[int, str, list[dict[str, str]], dict[str, str], list[dict[str, str]], str, str, dict[str, str]]:
    if not isinstance(body, dict):
        raise ExperimentError("REQ_NOT_OBJECT", "Request body must be an object.", status=400)
    try:
        turn = int(body.get("turn"))
    except (TypeError, ValueError) as exc:
        raise ExperimentError("REQ_INVALID_TURN", "turn must be 1–6.", status=400) from exc
    if turn not in CONTROL_EVENTS:
        raise ExperimentError("REQ_INVALID_TURN", "turn must be 1–6.", status=400)
    user_text = str(body.get("userText", "")).strip()
    if not 1 <= len(user_text) <= MAX_USER_CHARS:
        raise ExperimentError("REQ_INVALID_USER_TEXT", "入力は1〜500文字です。", status=400)
    if contains_obvious_personal_info(user_text):
        raise ExperimentError("I14_PERSONAL_INFO_BLOCKED", "氏名、電話番号、住所を削除してください。", status=400)

    history = body.get("history")
    if not isinstance(history, list) or len(history) != (turn - 1) * 2:
        raise ExperimentError("M01_HISTORY_COUNT", "対話履歴の件数が一致しません。", status=400)
    clean_history: list[dict[str, str]] = []
    for index, row in enumerate(history):
        expected = "user" if index % 2 == 0 else "assistant"
        if not isinstance(row, dict) or row.get("role") != expected:
            raise ExperimentError("M01_HISTORY_ROLE", "対話履歴の順序が不正です。", status=400)
        content = str(row.get("content", "")).strip()
        if not content or len(content) > 1200:
            raise ExperimentError("M01_HISTORY_CONTENT", "対話履歴の内容が不正です。", status=400)
        clean_history.append({"role": expected, "content": content})

    condition = str(body.get("condition", "")).upper()
    if condition not in ALLOWED_CONDITIONS:
        raise ExperimentError("REQ_INVALID_CONDITION", "condition must be R or A.", status=400)

    delegation_raw = body.get("delegation", {})
    if not isinstance(delegation_raw, dict):
        raise ExperimentError("M07_INVALID_DELEGATION", "delegation must be an object.", status=400)
    delegation = {
        str(key).strip(): str(value).strip()
        for key, value in delegation_raw.items()
        if str(key).strip()
    }
    if any(value not in ALLOWED_DELEGATION_VALUES for value in delegation.values()):
        raise ExperimentError("M07_INVALID_DELEGATION", "delegation contains an invalid value.", status=400)
    if condition == "R" and delegation:
        raise ExperimentError("M05_REFERENCE_ONLY_DELEGATION", "条件Rでは状態を変更できません。", status=400)

    source_raw = body.get("delegationSourceCriteria", [])
    if not isinstance(source_raw, list) or len(source_raw) > 4:
        raise ExperimentError("M07_INVALID_SOURCE_CRITERIA", "参照状態が不正です。", status=400)
    source_criteria: list[dict[str, str]] = []
    source_ids: set[str] = set()
    for item in source_raw:
        if not isinstance(item, dict):
            raise ExperimentError("M07_INVALID_SOURCE_CRITERIA", "参照状態が不正です。", status=400)
        item_id = str(item.get("id", "")).strip()
        if not item_id:
            raise ExperimentError("M07_INVALID_SOURCE_CRITERIA", "参照状態のIDがありません。", status=400)
        source_ids.add(item_id)
        source_criteria.append(
            {
                "id": item_id,
                "title": str(item.get("title", ""))[:80],
                "meaning": str(item.get("meaning", item.get("description", "")))[:240],
            }
        )
    if delegation and (turn == 1 or not set(delegation).issubset(source_ids)):
        raise ExperimentError("M09_DELEGATION_SOURCE_MISMATCH", "調整状態の参照元が一致しません。", status=400)

    session_id = str(body.get("sessionId", "anonymous"))[:200]
    anchor = validate_anchor(body.get("pretaskAnchor"))
    return turn, user_text, clean_history, delegation, source_criteria, condition, session_id, anchor


def transcript_text(history: list[dict[str, str]], current_user: str, dialogue_reply: str | None = None) -> str:
    lines: list[str] = []
    for row in history[-10:]:
        role = "参加者" if row["role"] == "user" else "対話AI"
        lines.append(f"{role}: {row['content'][:1200]}")
    lines.append(f"参加者: {current_user[:1200]}")
    if dialogue_reply:
        lines.append(f"対話AI: {dialogue_reply[:1200]}")
    return "\n".join(lines)


def dialogue_validation_codes(turn: int, text: str, anchor_text: str = "", *_: Any) -> list[str]:
    compact = re.sub(r"\s+", "", text)
    codes: list[str] = []
    # The backboard gives target ranges, not a hard rejection boundary.
    # Keep a lower safety floor so a concise, complete nano-model response is
    # not retried merely to add reading load to the left AOI.
    minimum = 120
    maximum = 900 if turn in {1, 2} else 760 if turn in {3, 4} else 650
    if len(compact) < minimum:
        codes.append("R02_TOO_SHORT")
    if len(compact) > maximum:
        codes.append("R03_TOO_LONG")
    if not japanese_visible(text):
        codes.append("R04_JAPANESE_REQUIRED")
    chinese_leaks = [
        "这顿晚餐",
        "请说明",
        "由你判断",
        "当前轮次",
        "本轮",
        "用户",
        "如果不同",
        "价值要求",
        "优先顺序",
    ]
    if any(term in text for term in chinese_leaks) or any(mark in text for mark in "，；："):
        codes.append("R05_LANGUAGE_MIXED")
    if "?" in text or "？" in text:
        codes.append("R06_DIRECT_QUESTION")
    forbidden = [
        "本当に重視",
        "自分で決めたい",
        "AIに任せたい",
        "保留・強化・弱化",
        "どちらを優先",
        "選んでください",
        "修正してください",
        "違っていたら",
        "最終判断はあなた",
        "実験",
        "内部ルール",
        "判断委任",
        "価値判断代行",
    ]
    if any(term in text for term in forbidden):
        codes.append("R07_TARGET_EXPOSURE")
    if not text.rstrip().endswith(TURN_ENDINGS[turn]):
        codes.append("R08_JAPANESE_ENDING")
    dinner_terms = [
        "夕食",
        "料理",
        "献立",
        "食事",
        "味",
        "食感",
        "盛り付け",
        "飲み物",
        "会話",
        "食卓",
        "準備",
        "雰囲気",
    ]
    if not any(term in text for term in dinner_terms):
        codes.append("R09_DINNER_CONTEXT")
    if turn == 3:
        fixation_markers = ["として整え", "と捉え", "にまとめ", "を意味するものとして", "に固定"]
        hedges = ["かもしれません", "一例です", "別の解釈", "いくつか考えられ"]
        if not any(term in text for term in fixation_markers) or any(term in text for term in hedges):
            codes.append("R10_FIXATION_MISSING")
        # The four semi-open anchor families have pre-registered, plausible
        # narrowings.  This prevents a concrete request such as "do not leave
        # the table" from being mistaken for the required value fixation.
        anchor_checks: list[tuple[bool, list[str], list[str]]] = [
            (
                "気を遣" in anchor_text,
                ["気を遣"],
                ["静かに休", "会話を少なく", "話題を増やさ", "短時間で終"],
            ),
            (
                "自然に話" in anchor_text or "自然な会話" in anchor_text,
                ["自然"],
                ["静かな環境", "刺激を減ら", "活動を減ら", "会話のきっかけを減ら"],
            ),
            (
                "大げさ" in anchor_text or "特別" in anchor_text,
                ["大げさ", "特別"],
                ["コース", "装飾", "盛り付け", "高価な食材"],
            ),
            (
                "感謝" in anchor_text or "重く" in anchor_text,
                ["感謝", "重く"],
                ["カード", "言葉で伝え", "演出", "区切った時間"],
            ),
        ]
        selected_check = next((item for item in anchor_checks if item[0]), None)
        if selected_check and (
            not any(term in text for term in selected_check[1])
            or not any(term in text for term in selected_check[2])
        ):
            codes.append("R13_ANCHOR_FIXATION_MISSING")
        if any(term in text for term in ["狭い意味", "狭い日常的な意味", "一義的", "固定化", "意味に固定"]):
            codes.append("R14_CONTROL_WORDING_VISIBLE")
    if turn == 4:
        priority_markers = ["最優先", "中心に", "優先し", "よりも"]
        weakening_markers = ["抑え", "少なく", "後回し", "控え", "限定"]
        if not any(term in text for term in priority_markers) or not any(term in text for term in weakening_markers):
            codes.append("R11_PRIORITY_PROXY_MISSING")
    if turn in {3, 4}:
        obvious_nonsense = [
            "氷を直接",
            "すべてペースト",
            "食器の音を禁止",
            "答えるまで食べられ",
            "一口ごとに皿を回",
            "強い光を皿に直接",
        ]
        if any(term in text for term in obvious_nonsense):
            codes.append("R12_OBVIOUS_ERROR")
    return list(dict.fromkeys(codes))


def parse_analysis(text: str, turn: int | None = None, *_: Any) -> tuple[dict[str, Any] | None, list[str]]:
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        return None, ["A01_INVALID_JSON"]
    criteria = value.get("criteria") if isinstance(value, dict) else None
    if not isinstance(criteria, list) or len(criteria) != 3:
        return value, ["A02_CRITERIA_COUNT"]
    codes: list[str] = []
    if sum(item.get("focus") is True for item in criteria if isinstance(item, dict)) != 1:
        codes.append("A03_FOCUS_COUNT")
    ids = [str(item.get("id", "")).strip() for item in criteria if isinstance(item, dict)]
    if len(ids) != 3 or len(set(ids)) != 3 or any(not item for item in ids):
        codes.append("A04_INVALID_IDS")
    for item in criteria:
        if not isinstance(item, dict):
            codes.append("A05_INVALID_ITEM")
            continue
        title = str(item.get("title", "")).strip()
        meaning = str(item.get("meaning", "")).strip()
        if not 3 <= len(title) <= 18 or not 8 <= len(meaning) <= 100:
            codes.append("A06_LENGTH")
        if len(re.findall(r"[\u3040-\u30ff]", title + meaning)) < 6:
            codes.append("A07_JAPANESE_REQUIRED")
        evidence = item.get("evidenceTurns")
        if (
            not isinstance(evidence, list)
            or not evidence
            or any(not isinstance(v, int) or v < 0 or (turn is not None and v > turn) for v in evidence)
        ):
            codes.append("A08_EVIDENCE")
        if any(term in title + meaning for term in ["実験", "内部ルール", "故意", "参加者は修正すべき"]):
            codes.append("A09_DESIGN_LEAK")
        if any(term in title + meaning for term in ["currentMeaning", "priority", "delegationState", "AI_INFERENCE"]):
            codes.append("A10_METADATA_LABEL_LEAK")
    return value, list(dict.fromkeys(codes))


VALIDATION_GUIDANCE = {
    "R02_TOO_SHORT": "指定文字数に近づけ、前文、今回の入力、具体案の関係を補ってください",
    "R03_TOO_LONG": "反復や候補列挙を削り、3段落以内に短くしてください",
    "R04_JAPANESE_REQUIRED": "表示文を自然な日本語だけで書いてください",
    "R05_LANGUAGE_MIXED": "中国語の語句と中文標点をすべて削除してください",
    "R06_DIRECT_QUESTION": "疑問文をすべて削除し、指定の陳述文で終えてください",
    "R07_TARGET_EXPOSURE": "研究目的や修正を直接求める表現を削除してください",
    "R08_JAPANESE_ENDING": "指定された日本語の終止文を一字も変えず末尾に置いてください",
    "R09_DINNER_CONTEXT": "料理または食事中の過ごし方へ明確につないでください",
    "R10_FIXATION_MISSING": "一つの多義的価値を、合理的だが狭い一つの意味として確定口調で具体化してください",
    "R11_PRIORITY_PROXY_MISSING": "二つの既存価値に優先関係を置き、一方が具体案で弱まることを示してください",
    "R12_OBVIOUS_ERROR": "荒唐無稽な仕掛けをやめ、現実には採用され得るが判断し過ぎた案へ直してください",
    "R13_ANCHOR_FIXATION_MISSING": "今回の具体条件ではなく、事前アンカーの多義的な語を本文で明示し、登録済みの合理的だが狭い意味へ一義化してください",
    "R14_CONTROL_WORDING_VISIBLE": "狭い意味、一義的、固定化等の操作説明を削り、通常の夕食計画として自然に言い切ってください",
    "A01_INVALID_JSON": "スキーマに一致するJSONだけを返してください",
    "A02_CRITERIA_COUNT": "criteriaを正確に3件にしてください",
    "A03_FOCUS_COUNT": "focus=trueを正確に1件にしてください",
    "A04_INVALID_IDS": "3件へ異なる安定IDを付けてください",
    "A05_INVALID_ITEM": "各criteriaを指定オブジェクトにしてください",
    "A06_LENGTH": "titleとmeaningを短く読みやすくしてください",
    "A07_JAPANESE_REQUIRED": "参加者に見える文字を日本語だけにしてください",
    "A08_EVIDENCE": "事前アンカーは0、発話は現在以前のターン番号で示してください",
    "A09_DESIGN_LEAK": "実験操作や内部ルールを表示内容から削除してください",
    "A10_METADATA_LABEL_LEAK": "JSONフィールド名や括弧注釈をsummary、title、meaningから削除してください",
}


def output_text(response: dict[str, Any]) -> str:
    parts: list[str] = []
    for item in response.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                parts.append(content.get("text", ""))
    text = "".join(parts).strip()
    if not text:
        raise ExperimentError("T04_EMPTY_API_RESPONSE", "AI response was empty.", stage="api", retryable=True)
    return text


def call_openai(payload: dict[str, Any]) -> tuple[str, dict[str, Any], float]:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise ExperimentError("T01_API_KEY_MISSING", "OPENAI_API_KEY is not configured.", stage="api", status=503)
    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        try:
            error = json.loads(detail).get("error", {})
            message = error.get("message", detail)
            provider_code = str(error.get("code", ""))
        except json.JSONDecodeError:
            message, provider_code = detail, ""
        quota = exc.code == 429 and (
            provider_code == "insufficient_quota"
            or "quota" in str(message).lower()
            or "billing" in str(message).lower()
        )
        code = "T03_QUOTA_EXCEEDED" if quota else "T03_RATE_LIMIT" if exc.code == 429 else "T02_API_REJECTED"
        raise ExperimentError(
            code,
            f"OpenAI API: {redact_secret(str(message))}",
            stage="api",
            retryable=exc.code >= 500 or (exc.code == 429 and not quota),
        ) from exc
    except (urllib.error.URLError, TimeoutError, socket.timeout) as exc:
        raise ExperimentError("T04_NETWORK_FAILURE", "OpenAI API request failed.", stage="api", retryable=True) from exc
    except json.JSONDecodeError as exc:
        raise ExperimentError("T04_INVALID_API_RESPONSE", "OpenAI API returned invalid JSON.", stage="api", retryable=True) from exc
    latency = round((time.perf_counter() - started) * 1000, 1)
    if data.get("status") == "incomplete":
        raise ExperimentError("T04_INCOMPLETE_API_RESPONSE", "OpenAI API response was incomplete.", stage="api", retryable=True)
    return output_text(data), data, latency


def run_validated_stage(
    stage: str,
    payload: dict[str, Any],
    parser: Any,
    *,
    max_attempts: int,
) -> tuple[Any, dict[str, Any], float, list[dict[str, Any]]]:
    attempts: list[dict[str, Any]] = []
    working = dict(payload)
    for number in range(1, max_attempts + 1):
        try:
            text, raw, latency = call_openai(working)
        except ExperimentError as exc:
            attempts.append({"attempt": number, "status": "api_error", "exceptionCode": exc.code})
            if number < max_attempts and exc.retryable:
                continue
            exc.stage = stage
            exc.attempts = attempts
            raise
        value, codes = parser(text)
        attempts.append(
            {
                "attempt": number,
                "status": "passed" if not codes else "validation_failed",
                "responseId": raw.get("id"),
                "latencyMs": latency,
                "validationCodes": codes,
                **({"outputPreview": redact_secret(text[:500])} if codes else {}),
            }
        )
        if not codes:
            return value, raw, latency, attempts
        if number < max_attempts:
            guidance = "。".join(VALIDATION_GUIDANCE.get(code, code) for code in codes)
            working = dict(working)
            working["instructions"] = working["instructions"] + f"\n前回の出力だけを次の点で直してください：{guidance}。"
    prefix = "R" if stage == "dialogue" else "A"
    raise ExperimentError(
        f"{prefix}_VALIDATION_FAILED",
        f"{stage} output failed validation.",
        stage=stage,
        attempts=attempts,
    )


def fallback_analysis(turn: int, anchor: dict[str, str]) -> dict[str, Any]:
    return {
        "summary": "新しい推測を増やさず、確認できる範囲だけを表示しています。",
        "criteria": [
            {
                "id": "anchor-context",
                "title": "事前の場面",
                "meaning": anchor["scenarioLabel"],
                "priority": "維持",
                "delegationState": "CO_DECIDE",
                "source": "PRETASK_ANCHOR",
                "evidenceTurns": [0],
                "focus": True,
            },
            {
                "id": f"turn-{turn}-record",
                "title": "今回の発言",
                "meaning": "今回の入力は記録し、意味を広げずに保持しています。",
                "priority": "未確定",
                "delegationState": "CO_DECIDE",
                "source": "USER_TURN",
                "evidenceTurns": [turn],
                "focus": False,
            },
            {
                "id": "pending-meaning",
                "title": "意味の確定状態",
                "meaning": "信頼できる更新ができるまで新しい意味を追加しません。",
                "priority": "未確定",
                "delegationState": "CO_DECIDE",
                "source": "AI_INFERENCE",
                "evidenceTurns": [0, turn],
                "focus": False,
            },
        ],
    }


def run_two_ais(body: dict[str, Any]) -> dict[str, Any]:
    turn, user_text, history, delegation, source_criteria, condition, session_id, anchor = validate_request_body(body)
    safety_id = hashlib.sha256(session_id.encode("utf-8")).hexdigest()[:32]
    control_event = CONTROL_EVENTS[turn]
    delegation_context = [
        {
            "id": item["id"],
            "title": item["title"],
            "meaning": item["meaning"],
            "state": delegation.get(item["id"], "consult"),
        }
        for item in source_criteria
    ]
    dialogue_input = (
        f"ターン: {turn}/6\n"
        f"固定control_event: {control_event}\n"
        f"このターンの実現規則:\n{TURN_DIRECTIVES[turn].strip()}\n"
        f"必須の末尾: {TURN_ENDINGS[turn]}\n"
        f"UI条件: {condition}\n"
        f"事前場面: {anchor['scenarioLabel']}\n"
        f"事前の一文: {anchor['freeText']}\n"
        f"前ターンの調整状態: {json.dumps(delegation_context, ensure_ascii=False) if delegation_context else 'なし'}\n"
        f"対話:\n{transcript_text(history, user_text)}"
    )
    dialogue_payload = {
        "model": DIALOGUE_MODEL,
        "instructions": DIALOGUE_INSTRUCTIONS,
        "input": dialogue_input,
        "reasoning": {"effort": "medium" if turn in {3, 4} else "low"},
        "text": {"verbosity": "medium"},
        # More reasoning headroom on the two event turns avoids paying for
        # several incomplete retries; the visible length remains validator-bound.
        "max_output_tokens": 3000 if turn == 3 else 3200 if turn == 4 else 1400,
        "store": False,
        "safety_identifier": safety_id,
    }
    dialogue, dialogue_raw, dialogue_latency, dialogue_attempts = run_validated_stage(
        "dialogue",
        dialogue_payload,
        lambda text: (text, dialogue_validation_codes(turn, text, anchor["freeText"])),
        max_attempts=4 if turn in {3, 4} else 3,
    )

    analysis_input = (
        f"ターン: {turn}/6\n"
        f"control_event: {control_event}\n"
        f"事前場面: {anchor['scenarioLabel']}\n"
        f"事前アンカー: {anchor['freeText']}\n"
        f"UI条件と調整値: {condition} / {json.dumps(delegation_context, ensure_ascii=False)}\n"
        f"対話全文:\n{transcript_text(history, user_text, dialogue)}"
    )
    analysis_payload = {
        "model": ANALYSIS_MODEL,
        "instructions": ANALYSIS_INSTRUCTIONS,
        "input": analysis_input,
        "reasoning": {"effort": "low"},
        "text": {
            "verbosity": "low",
            "format": {
                "type": "json_schema",
                "name": "visible_value_state",
                "strict": True,
                "schema": ANALYSIS_SCHEMA,
            },
        },
        "max_output_tokens": 1000,
        "store": False,
        "safety_identifier": safety_id,
    }
    analysis_fallback = False
    analysis_error: dict[str, Any] | None = None
    try:
        analysis, analysis_raw, analysis_latency, analysis_attempts = run_validated_stage(
            "analysis",
            analysis_payload,
            lambda text: parse_analysis(text, turn),
            max_attempts=3,
        )
    except ExperimentError as exc:
        analysis_fallback = True
        analysis = fallback_analysis(turn, anchor)
        analysis_raw = {}
        analysis_latency = 0.0
        analysis_attempts = exc.attempts
        analysis_error = {"exceptionCode": exc.code, "stage": exc.stage, "retryable": exc.retryable}

    return {
        "dialogue": dialogue,
        "analysis": analysis,
        "stateMetadata": {
            "turnId": turn,
            "controlEvent": control_event,
            "usedAnchorId": anchor["scenarioId"] if turn in {2, 3, 4} else None,
            "responseFlags": {
                "askedDirectValueQuestion": False,
                "offeredForcedChoice": False,
                "obviousError": False,
            },
        },
        "meta": {
            "dialogueModel": DIALOGUE_MODEL,
            "analysisModel": ANALYSIS_MODEL,
            "dialogueResponseId": dialogue_raw.get("id"),
            "analysisResponseId": analysis_raw.get("id"),
            "dialogueLatencyMs": dialogue_latency,
            "analysisLatencyMs": analysis_latency,
            "dialogueAttempts": dialogue_attempts,
            "analysisAttempts": analysis_attempts,
            "promptVersion": PROMPT_VERSION,
            "sessionSchemaVersion": SESSION_SCHEMA_VERSION,
            "controlEvent": control_event,
            "validationStatus": "analysis_fallback" if analysis_fallback else "passed",
            "analysisFallback": analysis_fallback,
            "analysisError": analysis_error,
        },
    }


class Handler(SimpleHTTPRequestHandler):
    def request_client_key(self) -> str:
        if TRUST_PROXY:
            forwarded = self.headers.get("X-Forwarded-For", "").split(",", 1)[0].strip()
            if forwarded:
                return forwarded[:80]
        return str(self.client_address[0])

    def exceeds_rate_limit(self) -> bool:
        now = time.monotonic()
        key = self.request_client_key()
        with RATE_LIMIT_LOCK:
            recent = [stamp for stamp in RATE_LIMIT_STATE.get(key, []) if now - stamp < 60]
            limited = len(recent) >= RATE_LIMIT_PER_MINUTE
            if not limited:
                recent.append(now)
            RATE_LIMIT_STATE[key] = recent
            return limited

    def app_path(self) -> str | None:
        raw = self.path.split("?", 1)[0].split("#", 1)[0]
        if not BASE_PATH:
            return raw or "/"
        if raw == BASE_PATH:
            return "/"
        if raw.startswith(f"{BASE_PATH}/"):
            return raw[len(BASE_PATH):] or "/"
        return None

    def translate_path(self, path: str) -> str:
        app_path = self.app_path()
        clean = (app_path or "/__not_found__").lstrip("/") or "index.html"
        target = (ROOT / clean).resolve()
        if ROOT not in target.parents and target != ROOT:
            return str(ROOT / "index.html")
        return str(target)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), fullscreen=(self)")
        self.send_header(
            "Content-Security-Policy",
            f"default-src 'self'; connect-src 'self'; img-src 'self' data:; "
            f"script-src 'self'; style-src 'self'; frame-ancestors {FRAME_ANCESTORS}; "
            "base-uri 'self'; form-action 'self'",
        )
        super().end_headers()

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def send_json(self, status: int, value: dict[str, Any]) -> None:
        data = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        raw = self.path.split("?", 1)[0].split("#", 1)[0]
        if BASE_PATH and raw == BASE_PATH:
            self.send_response(308)
            self.send_header("Location", f"{BASE_PATH}/")
            self.end_headers()
            return
        app_path = self.app_path()
        if app_path is None:
            self.send_error(404)
            return
        if app_path == "/api/health":
            self.send_json(
                200,
                {
                    "ok": True,
                    "configured": bool(os.environ.get("OPENAI_API_KEY", "").strip()),
                    "dialogueModel": DIALOGUE_MODEL,
                    "analysisModel": ANALYSIS_MODEL,
                    "promptVersion": PROMPT_VERSION,
                    "sessionSchemaVersion": SESSION_SCHEMA_VERSION,
                    "language": "ja",
                },
            )
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.app_path() != "/api/turn":
            self.send_json(404, {"error": "Not found"})
            return
        if self.exceeds_rate_limit():
            self.send_json(
                429,
                {
                    "error": "送信回数が多すぎます。少し待ってから、もう一度お試しください。",
                    "exceptionCode": "T05_LOCAL_RATE_LIMIT",
                    "stage": "server",
                    "retryable": True,
                    "promptVersion": PROMPT_VERSION,
                },
            )
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if size <= 0 or size > 100_000:
                raise ValueError("Invalid request size")
            body = json.loads(self.rfile.read(size).decode("utf-8"))
            self.send_json(200, run_two_ais(body))
        except ExperimentError as exc:
            print(
                json.dumps(
                    {
                        "event": "experiment_error",
                        "exceptionCode": exc.code,
                        "stage": exc.stage,
                        "attempts": exc.attempts,
                        "promptVersion": PROMPT_VERSION,
                    },
                    ensure_ascii=False,
                )
            )
            self.send_json(exc.status, exc.response_body())
        except (ValueError, json.JSONDecodeError) as exc:
            self.send_json(400, {"error": str(exc)})
        except Exception as exc:
            self.send_json(
                502,
                {
                    "error": "Unexpected server error",
                    "exceptionCode": "T99_UNEXPECTED",
                    "stage": "server",
                    "detail": redact_secret(str(exc)),
                    "promptVersion": PROMPT_VERSION,
                },
            )


def main() -> None:
    mimetypes.add_type("text/javascript", ".js")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    public_path = f"{BASE_PATH}/" if BASE_PATH else "/"
    print(f"Fixed-backboard experiment server: http://{HOST}:{PORT}{public_path}")
    print(f"Dialogue AI: {DIALOGUE_MODEL} | Analysis AI: {ANALYSIS_MODEL}")
    if os.environ.get("EXPERIMENT_AUTO_OPEN") == "1":
        webbrowser.open(f"http://{HOST}:{PORT}{public_path}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
