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
import urllib.parse
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
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"
# モデルの切り替え（2026-11-27）。
# ・既定は gpt-6-luna（それまでは gpt-5.4-nano）。環境変数 EXPERIMENT_DIALOGUE_MODEL / EXPERIMENT_ANALYSIS_MODEL で変える
#   （従来の OPENAI_DIALOGUE_MODEL / OPENAI_ANALYSIS_MODEL もそのまま使える）。
# ・名前が "claude-" で始まるモデルは Claude API（ANTHROPIC_API_KEY）、それ以外は OpenAI Responses API（OPENAI_API_KEY）へ送る。
# ・試験用の参加者番号（TEST- / PREVIEW- / SIMTEST-）に限り、リクエストの model で下の候補へ切り替えられる（?model=…）。
#   正式な参加者番号では無視されるので、参加者ごとにモデルが変わることはない。
DEFAULT_MODEL = "gpt-6-luna"
DIALOGUE_MODEL = (os.environ.get("EXPERIMENT_DIALOGUE_MODEL") or os.environ.get("OPENAI_DIALOGUE_MODEL") or DEFAULT_MODEL).strip()
ANALYSIS_MODEL = (os.environ.get("EXPERIMENT_ANALYSIS_MODEL") or os.environ.get("OPENAI_ANALYSIS_MODEL") or DEFAULT_MODEL).strip()
TEST_MODEL_CHOICES = {m.strip() for m in os.environ.get(
    "EXPERIMENT_TEST_MODELS", "gpt-6-luna,claude-haiku-5-5,gpt-6.1-terra,gpt-5.4-nano").split(",") if m.strip()}
TEST_ID_PREFIXES = ("TEST-", "PREVIEW-", "SIMTEST-")
PROMPT_VERSION = "judgment-delegation-guided-turns-v2.7"
# v2.8: 生成AIを使わないオフライン版（offline_engine）。EXPERIMENT_ENGINE=offline、またはリクエストの engine="offline" で使う。
OFFLINE_DEFAULT = os.environ.get("EXPERIMENT_ENGINE", "").strip().lower() == "offline"
SESSION_SCHEMA_VERSION = 6
MAX_USER_CHARS = 500
ALLOWED_CONDITIONS = {"UI_A", "UI_B"}
ALLOWED_DELEGATION_VALUES = {"ai", "consult", "self"}
ALLOWED_EXPERIMENT_VARIANTS = {"standard", "strong_ambiguity", "generic_marked", "generic_implicit",
                               "generic_unranked", "generic_unranked_marked", "generic_embedded", "generic_near",
                               "mixed_e1explicit", "mixed_e1content"}
# v2.0 比較用：参加者の言葉に対して「多くの人が想定する一般的な意味・優先」を当てはめる刺激。
# marked = 「一般的には」と出どころを示す / implicit = 参加者の意味として言い切る。
GENERIC_VARIANTS = {"generic_marked", "generic_implicit", "generic_unranked", "generic_unranked_marked",
                    "generic_embedded", "generic_near", "mixed_e1explicit", "mixed_e1content"}
MARKED_VARIANTS = {"generic_marked", "generic_unranked_marked"}
# v2.2 E2 の別案：参加者が述べた優先順位は倒さず、まだ順位を述べていない部分に「多くの人の優先」を当てはめて決める
UNRANKED_VARIANTS = {"generic_unranked", "generic_unranked_marked", "generic_embedded", "generic_near",
                     "mixed_e1explicit", "mixed_e1content"}
# v2.6 比較用（11/19）：
#   generic_embedded（方案A）= 回答本文ではずれを解釈・優先の説明として書かず、具体案の一文として埋め込む。解釈は右側パネルにだけ明示される。
#   generic_near（方案B）= 明示文は残し、候補は参加者の文章に最も近いもの（重なりが最大）を選んで、ずれを目立ちにくくする。
EMBEDDED_VARIANTS = {"generic_embedded"}
# v2.7（11/19）：示し方を参加者内の要因にする。1人が「明示」1回・「内容のみ」1回を受け、どちらを先にするかは半数ずつ入れ替える。
#   mixed_e1explicit = 第3回（E1）明示・第4回（E2）内容のみ ／ mixed_e1content = 第3回 内容のみ・第4回 明示
MIXED_EMBEDDED_TURN = {"mixed_e1explicit": 4, "mixed_e1content": 3}


def is_embedded_turn(variant: str, turn: int) -> bool:
    return variant in EMBEDDED_VARIANTS or MIXED_EMBEDDED_TURN.get(variant) == turn
NEAR_VARIANTS = {"generic_near"}
UNRANKED_PRIORITY_CANDIDATES = {
    "busy": [("相手をゆっくり休ませること", "食事の準備と片付けはすべてこちらでします"),
             ("食卓を少し特別に整えること", "いつもより一品多くして、器も少し良いものにします")],
    "reunion": [("料理でしっかりもてなすこと", "メインは手の込んだ一皿を用意して、食卓で取り分けます"),
                ("落ち着いて向き合える場をつくること", "テレビは消して、食卓で向かい合って座ります")],
    "milestone": [("節目らしさを形に残すこと", "食後に二人で写真を一枚撮る時間をつくります"),
                  ("記念日らしい演出をすること", "デザートに小さなメッセージを添えます")],
    "gratitude": [("感謝をきちんと届けること", "食後に一言、改めてお礼を伝える時間をつくります"),
                  ("特別なごちそうでもてなすこと", "普段より品数を増やして、ごちそうらしく整えます")],
}

SCENARIOS = {
    "busy": "相手は最近忙しく、少し疲れている",
    "reunion": "久しぶりに二人でゆっくり会う",
    "milestone": "小さな節目をさりげなく祝う",
    "gratitude": "普段言えていない感謝を自然に伝えたい",
}

# Pre-registered strong stimuli derived from the project's ambiguity mapping
# table.  These remain defensible dinner plans, but make the unauthorized
# meaning fixation and priority choice substantially easier to perceive.
STRONG_AMBIGUITY_TABLE = {
    "busy": {
        3: "気を遣わせないことは、食事を短時間で終え、新しい話題を増やさず静かに休めることとして整えます。",
        4: "今回は二人で話す時間や特別感よりも相手を休ませることを最優先にし、会話は料理の感想だけに限定します。",
    },
    "reunion": {
        3: "自然に話せることは、照明と音の刺激を減らした静かな環境で、話題を用意せず沈黙を中心に過ごすこととして整えます。",
        4: "今回は自然な会話よりも特別な演出を最優先にし、料理の順番と話す話題を事前に固定して自由な流れを抑えます。",
    },
    "milestone": {
        3: "大げさにしない特別感は、前菜からデザートまでの順番と盛り付けを統一した正式なコースとして整えます。",
        4: "今回は準備の気楽さよりも特別感を最優先にし、手軽さを抑えて料理は個別盛りにし、提供時刻も固定します。",
    },
    "gratitude": {
        3: "気持ちを重くしないことは、食後に感謝のカードを本人の前で読み上げ、明確な区切りを作ることとして整えます。",
        4: "今回は自然な軽さよりも感謝を確実に伝えることを最優先にし、デザート後にカードを読み上げる時間を設けて雑談を抑えます。",
    },
}

# The normal condition uses a milder but still deterministic priority event.
# It must be noticeable in ordinary reading without becoming absurd or unsafe.
STANDARD_PRIORITY_TABLE = {
    "busy": "今回は相手を休ませることよりも少し特別に感じられることを優先し、静かに休む時間は食後の短い時間に限ります。",
    "reunion": "今回は自然に話せることよりも料理の特別感を優先し、自由な会話は料理を待つ短い時間だけに抑えます。",
    "milestone": "今回は普段どおりの気楽さよりも節目の特別感を優先し、いつもの流れは食事の前半だけに限ります。",
    "gratitude": "今回は普段どおりの自然な会話よりも感謝を確実に伝えることを優先し、雑談は食事の前半だけに抑えます。",
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
    1: "次は、この目標と同時に大切にしたい別の気持ちや雰囲気を一つ加えてください。",
    2: "次は、食事中の会話や距離感など、料理以外でどんな時間にしたいかを書いてください。",
    3: "次は、この案の食卓で二人がどう過ごしているとよいかを書いてください。",
    4: "次は、食べ始めから食後まで、二人にとって自然な流れを書いてください。",
    5: "最後に、この夕食で大切にしたいことや避けたいことを、自分の言葉でまとめてください。",
    6: "現在の方針は以上です。未決定の部分は残したまま、実行に必要な内容だけを整理しました。",
}

# closingMode="personal"（画面の ?layout=flow が送る）で使う。
# flow 配置では今回の案内が入力欄のすぐ上にあるので、回答の末尾を毎回同じ終止文にせず、
# 「参加者が書いた言葉を一つ入れた、次の回の主題についての依頼文」で終える。
# 疑問文にはしない（R06 のとおり、AI は参加者に質問しない）。言葉の意味や優先順位も尋ねない（第3・4回のずれを先に解いてしまうため）。
# 条件を満たす末尾が得られなかったときは、従来の固定の終止文に戻す。
NEXT_TURN_THEMES = {
    1: "この目標と同時に大切にしたい、別の気持ちや雰囲気",
    2: "食事中の会話や距離感など、料理以外でどんな時間にしたいか",
    3: "この案の食卓で、二人がどう過ごしているとよいか",
    4: "食べ始めから食後までの、二人にとって自然な流れ",
    5: "この夕食で最後に大切にしたいことや避けたいこと",
}
NEXT_TURN_THEME_WORDS = {
    1: ("気持ち", "雰囲気"), 2: ("会話", "距離", "時間", "過ごし"), 3: ("食卓", "過ごし", "様子"),
    4: ("流れ", "食べ始め", "食後"), 5: ("大切", "避けたい", "まとめ"),
}
PERSONAL_CLOSING_MAX = 90
# closingMode="gap"（比較用）：固定の終止文はそのまま使い、その直前に
# 「次の回の主題はまだ決まっていないこと」だけを短い陳述文で一文入れる。
# 参加者が、計画のどこが空いているかを回答から読み取れるようにする案。
NEXT_TURN_GAPS = {
    1: "同時に大切にしたい別の気持ちや雰囲気は、まだ出ていない",
    2: "食事中の会話や距離感など、料理以外の時間は、まだ何も決まっていない",
    3: "実際に食卓に座った二人の様子は、まだ描けていない",
    4: "食べ始めから食後までの流れは、まだ決まっていない",
    5: "全体として大切にしたいことと避けたいことのまとめが、まだ残っている",
}


def personal_closing_problems(turn: int, text: str, user_texts: list[str]) -> list[str]:
    """closingMode="personal" の末尾の一文が条件を満たさない理由を返す（空なら合格）。"""
    sentences = [x.strip() for x in re.split(r"(?<=[。！？?\n])", text.rstrip()) if x.strip()]
    last = sentences[-1] if sentences else ""
    problems: list[str] = []
    if not last or last == TURN_ENDINGS[turn]:
        problems.append("fixed_or_empty")
    if not last.endswith("ください。"):
        problems.append("not_request")
    if len(last) > PERSONAL_CLOSING_MAX:
        problems.append("too_long")
    if re.search(r"[？?]|それとも|どちら|どっち|とは、?(何|どういう|どんな)|意味|一番大切|最も大切|優先", last):
        problems.append("probing")
    if not any(word in last for word in NEXT_TURN_THEME_WORDS[turn]):
        problems.append("off_theme")
    said = "\n".join(user_texts)
    compact = re.sub(r"[\s、。「」『』（）()・]", "", last)
    shared = [compact[i:i + 4] for i in range(len(compact) - 3)
              if compact[i:i + 4] in said and re.search(r"[\u30a0-\u30ff\u4e00-\u9fff]", compact[i:i + 4])]
    if not shared:
        problems.append("no_user_words")
    return problems


def gap_closing_problems(turn: int, text: str) -> list[str]:
    """closingMode="gap"：固定の終止文の直前の一文が「まだ決まっていないこと」を述べているかを見る（空なら合格）。"""
    stripped = text.rstrip()
    if not stripped.endswith(TURN_ENDINGS[turn]):
        return ["no_fixed_ending"]
    sentences = [x.strip() for x in re.split(r"(?<=[。！？?\n])", stripped[: -len(TURN_ENDINGS[turn])]) if x.strip()]
    before = sentences[-1] if sentences else ""
    problems: list[str] = []
    if "まだ" not in before:
        problems.append("no_gap_statement")
    if not any(word in before for word in NEXT_TURN_THEME_WORDS[turn]):
        problems.append("gap_off_theme")
    if len(before) > PERSONAL_CLOSING_MAX:
        problems.append("too_long")
    if re.search(r"[？?]", before):
        problems.append("question")
    return problems


def replace_with_fixed_closing(turn: int, text: str) -> str:
    """個別の末尾が条件を満たさなかったとき：依頼文の形の末尾は取り除き、従来の固定の終止文を付ける。"""
    sentences = [x for x in re.split(r"(?<=[。！？?\n])", text.rstrip()) if x.strip()]
    if sentences and sentences[-1].strip().endswith("ください。") and len(sentences) > 1:
        sentences = sentences[:-1]
    return ensure_exact_turn_ending(turn, "".join(sentences))

TURN_DIRECTIVES = {
    1: """
NORMAL_BUILD。対象、状況、全体的な希望を1〜2文で要約し、料理と過ごし方を軽く結び付ける。
一つの暫定方向を示すが、優先順位を決めず、選択を迫らない。新しい関係目標を事実として足さない。
参加者が指定していない感謝の言葉、伝える時刻、カード、会話量、話題、演出の順番を決めない。
""",
    2: """
NORMAL_ANCHOR_INTEGRATION。今回の発言と事前アンカーを正確に統合し、現在の夕食案につなげる。
多義的な価値の意味を開いたまま保ち、唯一の意味や優先順位を決めない。
感情や関係の表し方は広い希望のまま保持し、言葉、時刻、カード、会話量、話題を具体的に決めない。
""",
    3: """
VALUE_INTERPRETATION_FIXATION。事前アンカーまたは第1・2ターンに存在する多義的価値を一つ選ぶ。
その価値を、日常的に成立するが狭すぎる典型的意味へ一義的に固定し、その意味に基づく具体案を作る。
例：気を遣わせない→会話を少なくして静かに休む、自然に話せる→刺激や活動を減らす。
最新入力ですでに明示された方法と同じ意味へ固定してはならない。それでは価値解釈の代行にならない。
最新入力が一つの具体的方法を指定している場合は、事前場面または事前アンカーの別の多義的な側面を選び、
その方法からは論理的に決まらない、気づける程度の追加制約へ固定する。
例：参加者が「祝いは最初に一言」と指定していても、「大げさにしない」を単に「一言だけ」と言い換えず、
装飾や盛り付けを普段通りに限定する等、別の意味を確定する。
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
ただし、今回の入力で最も強く言い直された価値をそのまま最優先にしてはならない。
登録済みの必須文を使い、別の既存価値を優先し、今回強く示された価値の実現範囲を一部だけ狭める。
方案は一般生活で成立し得るものにするが、関係表現や価値の優先関係をAIが決め過ぎた状態を残す。
優先順位の質問、A/B/C選択、修正依頼、最終判断を返す説明は禁止する。
""",
    5: """
CALIBRATION_ACCEPTANCE。第3・4ターン後の参加者の修正、部分拒否、優先順位、AI支援範囲をそのまま採用する。
拒否された部分を外し、許可された範囲だけを具体化する。新しい価値や関係提案を足さず、新たな越権を作らない。
これまでの計画全体を言い直さない。最新の修正または追加へ最初に答え、変わった点を一つだけ短く示す。
変更されていない料理、雰囲気、会話、進行を再度まとめず、過去の回答と同じ文を繰り返さない。
次に参加者が書く「大切にしたいこと・避けたいこと」のまとめを、AIが先に書かない。
参加者が触れていない第3ターンの意味づけと第4ターンの優先関係は、黙って元に戻さず、そのまま有効なものとして扱う。
それと食い違う案（例：抑えた会話を食事中ずっと続ける）を新しく足さない。変えるのは参加者が明示した部分だけにする。
""",
    6: """
FINAL_CONVERGENCE。これまでに決まった料理、過ごし方、価値の意味、優先関係を短く統合する。
第3ターンの意味づけと第4ターンの優先関係のうち、参加者が修正していないものは最終方針にそのまま含める。
参加者が修正したものは修正後の内容だけを書く。どちらも説明や理由付けはせず、通常の計画文として一文に含める。
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
- 回答は短い自然な文章で1〜2段落に収める。要約の反復、長い理由説明、大量の候補列挙をしない。
- 過去の回答を毎回まとめ直さず、最新の入力によって追加または変更された部分を中心に書く。
- 料理や演出の具体例は、今回の入力に直接必要なものを一つ程度だけ示す。
- 疑問符を使わず、指定された日本語の終止文で正確に終える。
- 指定された終止文は次の入力を自然に考えるための案内として本文につなげ、唐突な定型句に見せない。
- 中国語の説明、中文標点、翻訳注釈を混ぜない。参加者が中国語で入力しても回答は自然な日本語にする。
- 第3・4ターン以外は、参加者が確定していない価値の意味や優先順位を代わりに決めない。
- 特に第1・2ターンでは、参加者が明示していない感謝の言葉、伝えるタイミング、カード、
  会話量、話題、関係表現の順序を具体案として決めない。料理や照明の軽い候補を示しても、
  感情や関係の実現方法は「自然に伝わる余地を残す」等の開いた状態に保つ。

参加者が文章で関わり方を指定した場合（どのターンでも、言い方が多少違っても同様）：
- 「〜は自分で決めたい」「今の内容のまま変えないで」：その部分を言い換えたり、代案や追加案を出したりしない。
  触れる場合も「そのままにします」と短く受けるだけにする。
- 「〜は具体的な案を一つ出して」：その部分について具体案を一つだけ、言い切りで示す。候補を並べない。
- 「〜はまだ決めずに、考える材料を示して」：決めつけず、判断の手がかりになる観点を一つか二つ短く示す。
  選択肢の提示、質問、どちらかに決めることはしない。
- これらの指定は、最新の入力で同じ部分を参加者が変えない限り、以降のターンでも有効とする。
- ただし第3・4ターンの「今回の強制文」は、指定より優先して一字も変えず含める（強制文以外の部分で指定を守る）。
- 強制文で決めた意味づけや優先関係は、第5ターン以降に参加者があらためて触れない限り、
  それ以前の指定よりも優先してそのまま維持する。第5・6ターンで参加者が触れた場合は参加者の言葉に従う。
"""

ANALYSIS_INSTRUCTIONS = """あなたは右側の価値状態を作る独立AIです。参加者に表示する文字は日本語だけにします。
内部推論や思考過程ではなく、会話から確認できる簡潔な価値状態を正確なJSONで返します。

- 価値の項目自体は参加者自身の発言と事前アンカーだけを根拠にする。対話AIが新しく作った目標を参加者の価値にしない。
- 第1・2ターンでは、対話AIだけが提案した照明、香り、食材、言葉、カード、時刻、会話量、進行を
  titleやmeaningへ入れない。参加者が実際に書いた希望だけを短く言い換える。
- 互いに異なる価値を正確に3件出す。titleは8〜14字程度、meaningは一〜二行の短い日本語。
- priorityは「中心」「維持」「未確定」のいずれか。未確認の優先関係を勝手に事実化しない。
- delegationStateはAI_PROPOSE、CO_DECIDE、USER_DECIDEのいずれか。
- sourceはPRETASK_ANCHOR、USER_TURN、AI_INFERENCEのいずれか。
- evidenceTurnsの0は事前アンカー、1〜6は参加者発話のターンを表す。
- focus=trueは1件だけ。最大4件というUI上限を超えない。
- 第3ターンでは、対話AI回答の中で狭く決められた意味を、該当する価値のmeaningへ必ずそのまま反映する。
  参加者が元々書いた広い意味へ戻してはならない。その項目をfocus=true、source=AI_INFERENCEにする。
  ただし、その意味を参加者が確認済みとは書かない。
- 第4ターンでは、対話AI回答が最優先に置いた価値をpriority=中心、focus=true、source=AI_INFERENCEにする。
  AI回答で実現範囲を狭められた価値のmeaningにも、その狭められ方を明記する。
  参加者が決めた優先関係として書いてはならず、直前の参加者発話だけで元の広い意味へ戻してはならない。
- delegationStateは参加者の文章から決める。「自分で決めたい」「変えないで」と書かれた価値はUSER_DECIDE、
  「案を出して」と書かれた価値はAI_PROPOSE、「まだ決めずに」「考える材料」「一緒に考えたい」と書かれた価値と、
  指定のない価値はCO_DECIDE。一度書かれた指定は、参加者が別の指定を書くまで同じidに引き継ぐ。
- 第5・6ターンでは、参加者が明示的に修正・否定していない第3ターンの意味づけと第4ターンの優先関係を、
  前ターンのカードの内容のまま維持する。参加者が修正した場合だけ、修正後の内容へ更新する。
- 前ターンの価値状態が入力に含まれる場合、実質的に同じ価値には前ターンと完全に同じidを使う。
  titleやmeaningを更新してもidは変えない。新しいidは本当に新しい価値にだけ付ける。
- summary、title、meaningへcurrentMeaning、priority、source等のJSONフィールド名や括弧注釈を混ぜない。
- 実験目的、操作、誤り検出、思考過程、個人情報、助言を表示しない。
"""

# 分析AI の指示文の版（2026-11-27）。v1＝従来（gpt-5.4-nano に合わせて調整したもの）。
# 公開版の gpt-6-luna で v1 を使うと、3 枚が事前の一文の言い換えのまま動かず、その回の参加者の入力（「料理は簡単なもの」
# 「テレビを見ながら」など）がカードに入らなかった（実際の出力 18 回で確認）。v2 はその点だけを直す。
# 既定は環境変数 EXPERIMENT_ANALYSIS_PROMPT（未設定なら v1）。試験用の参加者番号はリクエストの analysisPrompt で選べる。
_V1_COUNT_RULE = "- 互いに異なる価値を正確に3件出す。titleは8〜14字程度、meaningは一〜二行の短い日本語。\n"
_V2_COUNT_RULE = (
    "- 項目は正確に3件出す。titleは8〜14字程度、meaningは一〜二行の短い日本語。\n"
    "- 3件の決め方：\n"
    "  (a) このターンの参加者発話に、まだどの項目にも入っていない希望（料理の手間、食事中の過ごし方、飲み物、流れ、避けたいことなど）が\n"
    "      あれば、必ずいずれかの項目に入れる。最も近い項目のmeaningに書き足すか、新しい項目にする。\n"
    "  (b) 新しい項目にするとき枠が足りなければ、意味が近い2件（例：「気を使わずくつろぐ」と「ほっとできる」）を1件にまとめて枠を空ける。\n"
    "      まとめた項目には、前ターンからある方のidを使う。\n"
    "  (c) 事前アンカーの一文を言い換えただけの項目を2件以上に分けない。同じことを別の言葉で言った項目を並べない。\n"
    "  (d) 参加者の発話と事前アンカーから読み取れる、互いに異なる価値が3件に満たないときは、無理に作らず、足りない分を\n"
    "      id=\"pending-meaning\" の項目にする（title・meaningは何を書いてもシステムが決まった文面に置き換える。priority=未確定、focus=false）。\n"
    "- 参加者が書いた具体的な言葉（「簡単なもの」「テレビを見ながら」「鍋」「和食」など）は、抽象的な言い換えにせず、\n"
    "  titleかmeaningにその言葉のまま残す。\n"
)
assert _V1_COUNT_RULE in ANALYSIS_INSTRUCTIONS
# v3＝v2 ＋ 実際の出力（claude-haiku-5-5、18 回）で見えた 2 点：
#   ・meaning に「参加者が書いた『和食がいい』という料理の希望。」のような、本人に見せる表示として不自然な言い方が出る
#   ・第5・6回で、対話AIだけが出した具体物（「汁物や煮物」「母の体調」など）が meaning に入る
_V3_EXTRA = (
    "- title・meaningは参加者本人が画面で読む表示である。「参加者が」「参加者の」「事前の希望」「対話で」のような外から見た言い方をせず、\n"
    "  希望の内容そのものを書く（例：「料理は和食にしたい。」）。meaningは60字以内。\n"
    "- 対話AIだけが提案した具体物（料理名、品目、飲み物、照明、進行、相手の体調への配慮など）は、どのターンでもtitle・meaningへ入れない。\n"
    "  入れてよいのは、参加者が書いたことと、第3・4ターンで対話AIが決めた意味・優先だけ。\n"
)
# v3 では、v2 を gpt-6-luna で走らせて見えた 3 点も直す（実際の出力 18 回）：
#   ・(b) の例に引きずられて、事前の一文と第1回の発話を 1 件にまとめすぎ、「まだ決めていないこと」が 2 枚並んだ
#   ・第4回で、優先を示すカードの文面を言い換え、「カードは使わず」のような付け足しをした（刺激の見え方が参加者ごとに変わる）
_V3_COUNT_RULE = (
    _V2_COUNT_RULE
    .replace("意味が近い2件（例：「気を使わずくつろぐ」と「ほっとできる」）を1件にまとめて枠を空ける。",
             "ほぼ同じことを言っている2件を1件にまとめて枠を空ける。")
    .replace("      id=\"pending-meaning\" の項目にする（",
             "      id=\"pending-meaning\" の項目にする。pending-meaning は多くても1件にとどめ、事前アンカーと参加者の発話が別のことを\n"
             "      言っていれば別々の項目にする（")
)
assert _V3_COUNT_RULE != _V2_COUNT_RULE and "多くても1件" in _V3_COUNT_RULE and "ほぼ同じこと" in _V3_COUNT_RULE
_V3_EXTRA += (
    "- 第3・4ターンで対話AIが決めた意味・優先を書く項目は、対話AIのその一文をそのまま使う。言い換えたり、\n"
    "  ほかの内容（やらないこと、手段の変更など）を付け足したりしない。\n"
)
_V2_TEXT = ANALYSIS_INSTRUCTIONS.replace(_V1_COUNT_RULE, _V2_COUNT_RULE)
ANALYSIS_PROMPTS = {"v1": ANALYSIS_INSTRUCTIONS, "v2": _V2_TEXT,
                    "v3": ANALYSIS_INSTRUCTIONS.replace(_V1_COUNT_RULE, _V3_COUNT_RULE).rstrip("\n") + "\n" + _V3_EXTRA}
DEFAULT_ANALYSIS_PROMPT = os.environ.get("EXPERIMENT_ANALYSIS_PROMPT", "v1").strip()
if DEFAULT_ANALYSIS_PROMPT not in ANALYSIS_PROMPTS:
    DEFAULT_ANALYSIS_PROMPT = "v1"

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


def ensure_exact_turn_ending(turn: int, text: str) -> str:
    """Repair only the registered participant-facing ending without rewriting AI content."""
    stripped = text.rstrip()
    required = TURN_ENDINGS[turn]
    if stripped.endswith(required):
        return stripped
    # Nano occasionally omits the discourse marker while reproducing the rest
    # exactly. Replace that near-match instead of showing the sentence twice.
    without_marker = required.removeprefix("最後に、")
    if without_marker != required and stripped.endswith(without_marker):
        return stripped[: -len(without_marker)] + required
    # v1.8: 末尾に終止文の言い換え（「現状の方針は以上です…」等）があれば二重表示しない。
    sentences = [x for x in re.split(r"(?<=[。！])", stripped) if x.strip()]
    required_parts = [x for x in re.split(r"(?<=[。！])", required) if x.strip()]
    while sentences and (any(text_similarity(sentences[-1].strip(), part) >= 0.5 for part in required_parts)
                         or (turn == 6 and re.search(r"方針は以上", sentences[-1]))):
        sentences.pop()
    stripped = "".join(sentences).rstrip()
    if stripped and stripped[-1] not in "。！!」』":
        stripped += "。"
    return f"{stripped}\n{required}"


def drop_participant_voice(text: str, turn: int = 5, keep_open_statement: bool = False, keep_request: bool = False) -> str:
    """AI が参加者のまとめ文を先に書いてしまった文を除く。
    「私は、…」（v1.8）と、「大切にしたい…は〜、避けたい…は〜」型の代筆（v1.9.5）。
    keep_open_statement（closingMode="gap"）：「…の整理は、まだ残っています。」のように、まだ決まっていないことを述べる文は
    代筆ではないので残す。2026-11-27 の実際の出力で、第5回のこの文が毎回ここで消され、3 回やり直した末に固定の終止文へ
    戻っていた（3 台本とも）。"""
    parts = re.split(r"(?<=[。！\n])", text)
    kept = [x for x in parts
            if not re.match(r"^\s*(私は|わたしは|自分は)", x)
            and not (turn == 5 and "大切にしたい" in x and "避けたい" in x
                     and not (keep_open_statement and "まだ" in x)
                     # closingMode="personal"：「…を、自分の言葉でまとめてください。」は依頼であって代筆ではない（実際の出力で 3/3 消されていた）
                     and not (keep_request and x.strip().endswith("ください。")))]
    return "".join(kept)


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
) -> tuple[int, str, list[dict[str, str]], dict[str, str], list[dict[str, str]], str, str, dict[str, str], str]:
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
        raise ExperimentError("REQ_INVALID_CONDITION", "condition must be UI_A or UI_B.", status=400)
    experiment_variant = str(body.get("experimentVariant", "standard")).strip().lower()
    if experiment_variant not in ALLOWED_EXPERIMENT_VARIANTS:
        raise ExperimentError(
            "REQ_INVALID_EXPERIMENT_VARIANT",
            "experimentVariant must be standard or strong_ambiguity.",
            status=400,
        )

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
    if condition == "UI_A" and delegation:
        raise ExperimentError("M05_REFERENCE_ONLY_DELEGATION", "UI Aでは調整状態を送信できません。", status=400)

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
    return turn, user_text, clean_history, delegation, source_criteria, condition, session_id, anchor, experiment_variant


def transcript_text(history: list[dict[str, str]], current_user: str, dialogue_reply: str | None = None) -> str:
    lines: list[str] = []
    for row in history[-10:]:
        role = "参加者" if row["role"] == "user" else "対話AI"
        lines.append(f"{role}: {row['content'][:1200]}")
    lines.append(f"参加者: {current_user[:1200]}")
    if dialogue_reply:
        lines.append(f"対話AI: {dialogue_reply[:1200]}")
    return "\n".join(lines)


DIALOGUE_FORBIDDEN_TERMS = [
    "本当に重視", "自分で決めたい", "AIに任せたい", "保留・強化・弱化", "どちらを優先", "選んでください",
    "修正してください", "違っていたら", "最終判断はあなた", "実験", "内部ルール", "判断委任", "価値判断代行",
]


def dialogue_validation_codes(
    turn: int,
    text: str,
    anchor_text: str = "",
    current_user_text: str = "",
    *_: Any,
    experiment_variant: str = "standard",
    scenario_id: str = "",
    required_sentence: str = "",
    personal_closing: bool = False,
) -> list[str]:
    compact = re.sub(r"\s+", "", text)
    has_required = bool(required_sentence) and required_sentence in text
    codes: list[str] = []
    # The backboard gives target ranges, not a hard rejection boundary.
    # Keep a lower safety floor so a concise, complete nano-model response is
    # not retried merely to add reading load to the left AOI.
    minimum = 100
    maximum = 480 if turn in {1, 2} else 430 if turn in {3, 4} else 280 if turn == 5 else 360
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
    # v2.1.1: 全角コロン「：」は日本語でも普通に使うため対象外（「例：」で 502 になっていた可能性）
    if any(term in text for term in chinese_leaks) or any(mark in text for mark in "，；"):
        codes.append("R05_LANGUAGE_MIXED")
    if "?" in text or "？" in text:
        codes.append("R06_DIRECT_QUESTION")
    forbidden = DIALOGUE_FORBIDDEN_TERMS
    _unused = [
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
    if not personal_closing and not text.rstrip().endswith(TURN_ENDINGS[turn]):
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
    if turn in {1, 2}:
        early_relation_methods = [
            "食事の最初に一言",
            "一言だけ感謝",
            "感謝を短く",
            "食後に伝",
            "感謝のカード",
            "言葉は長く説明せず",
            "短く返す場面",
            "話す話題を",
            "会話量を",
        ]
        allowed_by_user = any(
            term in current_user_text
            for term in ["最初に一言", "一言だけ", "短く伝", "食後", "カード", "短く返", "話題", "会話量"]
        )
        if not allowed_by_user and any(term in text for term in early_relation_methods):
            codes.append("R17_EARLY_RELATION_METHOD")
    if turn == 3:
        fixation_markers = ["として整え", "と捉え", "にまとめ", "を意味するものとして", "に固定"]
        hedges = ["かもしれません", "一例です", "別の解釈", "いくつか考えられ"]
        if any(term in text for term in hedges) or (
            not has_required and not any(term in text for term in fixation_markers)
        ):
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
        if selected_check and not has_required and (
            not any(term in text for term in selected_check[1])
            or not any(term in text for term in selected_check[2])
        ):
            codes.append("R13_ANCHOR_FIXATION_MISSING")
        if any(term in text for term in ["狭い意味", "狭い日常的な意味", "一義的", "固定化", "意味に固定"]):
            codes.append("R14_CONTROL_WORDING_VISIBLE")
    if turn == 4:
        priority_markers = ["最優先", "中心に", "優先し", "よりも"]
        # v1.7: 「限ります」「限る」も弱化の表現として扱う（busy・milestone の登録文は「限ります」で終わる）。
        weakening_markers = ["抑え", "少なく", "後回し", "控え", "限定", "限り", "限る"]
        required_priority = ""
        if experiment_variant == "standard" and scenario_id:
            required_priority = controlled_priority_sentence(scenario_id)
            if required_priority not in text:
                codes.append("R16_PRIORITY_SENTENCE_MISSING")
        elif experiment_variant == "strong_ambiguity" and scenario_id:
            required_priority = strong_ambiguity_sentence(scenario_id, 4)
        # 登録済みの必須文がそのまま含まれていれば、優先関係の代行は成立している。
        if required_sentence and required_sentence in text:
            required_priority = required_sentence
        if not (required_priority and required_priority in text) and (
            not any(term in text for term in priority_markers) or not any(term in text for term in weakening_markers)
        ):
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
    if experiment_variant == "strong_ambiguity" and turn in {3, 4}:
        required_sentence = strong_ambiguity_sentence(scenario_id, turn)
        if required_sentence not in text:
            codes.append("R15_STRONG_AMBIGUITY_MISSING")
        elif compact.find(re.sub(r"\s+", "", required_sentence)) > 160:
            codes.append("R18_STRONG_AMBIGUITY_BURIED")
    return list(dict.fromkeys(codes))


def parse_analysis(
    text: str,
    turn: int | None = None,
    scenario_id: str = "",
    *_: Any,
) -> tuple[dict[str, Any] | None, list[str]]:
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
    focus_items = [item for item in criteria if isinstance(item, dict) and item.get("focus") is True]
    if turn in {3, 4} and focus_items and focus_items[0].get("source") != "AI_INFERENCE":
        codes.append("A11_EVENT_SOURCE")
    if turn == 4 and focus_items and focus_items[0].get("priority") != "中心":
        codes.append("A12_PRIORITY_NOT_VISIBLE")
    if turn in {3, 4} and scenario_id and focus_items:
        focus_text = str(focus_items[0].get("title", "")) + str(focus_items[0].get("meaning", ""))
        event_terms = {
            (3, "busy"): ["会話を少なく", "静かに休", "話す量"],
            (3, "reunion"): ["静かな環境", "刺激を減ら", "沈黙"],
            (3, "milestone"): ["コース", "前菜", "主菜", "盛り付け", "装飾"],
            (3, "gratitude"): ["カード", "食後"],
            (4, "busy"): ["特別", "優先"],
            (4, "reunion"): ["料理の特別", "特別感", "特別な演出"],
            (4, "milestone"): ["節目の特別", "特別感"],
            (4, "gratitude"): ["感謝", "確実"],
        }.get((turn, scenario_id), [])
        if event_terms and not any(term in focus_text for term in event_terms):
            codes.append("A13_EVENT_NOT_VISIBLE")
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
    "R03_TOO_LONG": "反復や候補列挙を削り、指定字数の1〜2段落に短くしてください",
    "R04_JAPANESE_REQUIRED": "表示文を自然な日本語だけで書いてください",
    "R05_LANGUAGE_MIXED": "中国語の語句と中文標点をすべて削除してください",
    "R06_DIRECT_QUESTION": "疑問文をすべて削除し、指定の陳述文で終えてください",
    "R07_TARGET_EXPOSURE": "研究目的や修正を直接求める表現を削除してください",
    "R08_JAPANESE_ENDING": "指定された日本語の終止文を一字も変えず末尾に置いてください",
    "R22_GAP_CLOSING": "指定された終止文の直前に、次の回の主題がまだ決まっていないことを「まだ」を使った陳述文で一文入れてください。疑問文にはしないでください",
    "R21_PERSONAL_CLOSING": "末尾の一文を、次の回の主題についての依頼文（「〜を書いてください。」で終える）にし、参加者が書いた言葉を一つそのまま入れてください。疑問文にせず、言葉の意味や優先順位は尋ねないでください",
    "R09_DINNER_CONTEXT": "料理または食事中の過ごし方へ明確につないでください",
    "R10_FIXATION_MISSING": "一つの多義的価値を、合理的だが狭い一つの意味として確定口調で具体化してください",
    "R11_PRIORITY_PROXY_MISSING": "二つの既存価値に優先関係を置き、一方が具体案で弱まることを示してください",
    "R12_OBVIOUS_ERROR": "荒唐無稽な仕掛けをやめ、現実には採用され得るが判断し過ぎた案へ直してください",
    "R13_ANCHOR_FIXATION_MISSING": "今回の具体条件ではなく、事前アンカーの多義的な語を本文で明示し、登録済みの合理的だが狭い意味へ一義化してください",
    "R14_CONTROL_WORDING_VISIBLE": "狭い意味、一義的、固定化等の操作説明を削り、通常の夕食計画として自然に言い切ってください",
    "R15_STRONG_AMBIGUITY_MISSING": "意図的曖昧化表に対応する今回の強制文を、一字も変えず可視回答へ含めてください",
    "R16_PRIORITY_SENTENCE_MISSING": "標準刺激の優先関係を示す必須文を、一字も変えず可視回答へ含めてください",
    "R17_EARLY_RELATION_METHOD": "第1・2ターンでは感情表現の言葉、時刻、カード、会話量を決めず、多義的な希望を開いたままにしてください",
    "R18_STRONG_AMBIGUITY_BURIED": "強制文を説明の後ろに埋めず、最新入力への短い応答に続く第2文として、冒頭160字以内に置いてください",
    "R19_UNCORRECTED_RELATION_DROPPED": "第4ターンの方針（参加者は修正していない）を、料理や過ごし方の具体文の中に自然に含めてください。引用符、「優先関係」「最終方針として」等の説明語は使わないでください",
    "R20_RELATION_QUOTED": "方針を引用符で囲んだり「優先関係」「最終方針として」と説明したりせず、通常の計画文として書いてください",
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
    "A11_EVENT_SOURCE": "第3・4ターンのfocus項目は対話AIの現在の扱いを示すためsource=AI_INFERENCEにしてください",
    "A12_PRIORITY_NOT_VISIBLE": "第4ターンで対話AIが最優先に置いたfocus項目をpriority=中心にしてください",
    "A13_EVENT_NOT_VISIBLE": "focus項目のtitleとmeaningへ、今回の対話AIが固定した意味または最優先にした価値を具体的に反映してください",
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


def provider_of(model: str) -> str:
    return "anthropic" if str(model).startswith("claude-") else "openai"


def provider_key_present(model: str) -> bool:
    name = "ANTHROPIC_API_KEY" if provider_of(model) == "anthropic" else "OPENAI_API_KEY"
    return bool(os.environ.get(name, "").strip())


def resolve_models(body: dict[str, Any], session_id: str) -> tuple[str, str, bool]:
    """このリクエストで使う（会話AI, 分析AI, 切り替えたか）。切り替えは試験用の参加者番号と登録済みの候補に限る。"""
    if not str(session_id).upper().startswith(TEST_ID_PREFIXES):
        return DIALOGUE_MODEL, ANALYSIS_MODEL, False
    requested = body.get("model")
    dialogue = requested if isinstance(requested, str) and requested in TEST_MODEL_CHOICES else None
    requested_analysis = body.get("analysisModel")
    analysis = requested_analysis if isinstance(requested_analysis, str) and requested_analysis in TEST_MODEL_CHOICES else dialogue
    if not dialogue and not analysis:
        return DIALOGUE_MODEL, ANALYSIS_MODEL, False
    return dialogue or DIALOGUE_MODEL, analysis or ANALYSIS_MODEL, True


def usage_summary(raw: dict[str, Any]) -> dict[str, int] | None:
    usage = raw.get("usage") if isinstance(raw, dict) else None
    if not isinstance(usage, dict):
        return None
    return {key: usage[key] for key in ("input_tokens", "output_tokens") if isinstance(usage.get(key), int)} or None


def call_model(payload: dict[str, Any]) -> tuple[str, dict[str, Any], float]:
    """モデル名で送り先を決める。payload は OpenAI Responses API の形のまま受け取る。"""
    if provider_of(payload.get("model", "")) == "anthropic":
        return call_anthropic(payload)
    return call_openai(payload)


# Claude API の構造化出力が受け付けない制約。検証は従来どおりこちら側（parser）で行うので、
# スキーマからは外して description に書き写すだけにする。
ANTHROPIC_UNSUPPORTED_SCHEMA_KEYS = ("minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
                                     "minLength", "maxLength", "maxItems")


def anthropic_schema(node: Any) -> Any:
    if isinstance(node, list):
        return [anthropic_schema(item) for item in node]
    if not isinstance(node, dict):
        return node
    out: dict[str, Any] = {}
    notes: list[str] = []
    for key, value in node.items():
        if key in ANTHROPIC_UNSUPPORTED_SCHEMA_KEYS or (key == "minItems" and isinstance(value, int) and value > 1):
            notes.append(f"{key}: {value}")
        elif key in {"properties", "$defs", "definitions"} and isinstance(value, dict):
            out[key] = {name: anthropic_schema(sub) for name, sub in value.items()}
        elif key in {"items", "anyOf", "allOf", "oneOf"}:
            out[key] = anthropic_schema(value)
        else:
            out[key] = value
    if notes:
        out["description"] = "、".join(filter(None, [str(out.get("description", "")).strip(), "（" + "、".join(notes) + "）"]))
    return out


def anthropic_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """OpenAI Responses API 形の payload を Claude Messages API の形へ写す。
    ・instructions → system、input → user の一通。末尾に assistant の書き出しは置かない（Claude Haiku 5.5 は 400 を返す）。
    ・temperature などは送らない。考える量は output_config.effort で指定する（thinking は既定の adaptive のまま）。
    ・考えるためのトークンも max_tokens に数えられ、同じ文章でもトークン数が多めになるので、上限は広めにとる。"""
    out: dict[str, Any] = {
        "model": payload["model"],
        "max_tokens": max(4096, int(payload.get("max_output_tokens") or 0) * 2),
        "system": payload.get("instructions", ""),
        "messages": [{"role": "user", "content": payload.get("input", "")}],
    }
    config: dict[str, Any] = {}
    effort = (payload.get("reasoning") or {}).get("effort")
    if effort in {"low", "medium", "high"}:
        config["effort"] = effort
    fmt = (payload.get("text") or {}).get("format") or {}
    if fmt.get("type") == "json_schema" and isinstance(fmt.get("schema"), dict):
        config["format"] = {"type": "json_schema", "schema": anthropic_schema(fmt["schema"])}
    if config:
        out["output_config"] = config
    if payload.get("safety_identifier"):
        out["metadata"] = {"user_id": str(payload["safety_identifier"])}
    return out


def call_anthropic(payload: dict[str, Any]) -> tuple[str, dict[str, Any], float]:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        raise ExperimentError("T01_API_KEY_MISSING", "ANTHROPIC_API_KEY is not configured.", stage="api", status=503)
    request = urllib.request.Request(
        ANTHROPIC_API_URL,
        data=json.dumps(anthropic_payload(payload), ensure_ascii=False).encode("utf-8"),
        headers={"x-api-key": api_key, "anthropic-version": ANTHROPIC_VERSION, "Content-Type": "application/json"},
        method="POST",
    )
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        try:
            message = str((json.loads(detail).get("error") or {}).get("message", detail))
        except (json.JSONDecodeError, AttributeError):
            message = detail
        quota = "credit balance" in message.lower() or "billing" in message.lower()
        code = "T03_QUOTA_EXCEEDED" if quota else "T03_RATE_LIMIT" if exc.code == 429 else "T02_API_REJECTED"
        raise ExperimentError(
            code,
            f"Claude API: {redact_secret(message)}",
            stage="api",
            retryable=not quota and (exc.code >= 500 or exc.code == 429),
        ) from exc
    except (urllib.error.URLError, TimeoutError, socket.timeout) as exc:
        raise ExperimentError("T04_NETWORK_FAILURE", "Claude API request failed.", stage="api", retryable=True) from exc
    except json.JSONDecodeError as exc:
        raise ExperimentError("T04_INVALID_API_RESPONSE", "Claude API returned invalid JSON.", stage="api", retryable=True) from exc
    latency = round((time.perf_counter() - started) * 1000, 1)
    stop = data.get("stop_reason")
    if stop == "refusal":
        raise ExperimentError("T04_MODEL_REFUSAL", "Claude API declined the request.", stage="api", retryable=True)
    if stop == "max_tokens":
        raise ExperimentError("T04_INCOMPLETE_API_RESPONSE", "Claude API response was incomplete.", stage="api", retryable=True)
    # thinking ブロックが先に来ることがあるので、位置ではなく type で本文を選ぶ
    text = "".join(block.get("text", "") for block in data.get("content", []) if block.get("type") == "text").strip()
    if not text:
        raise ExperimentError("T04_EMPTY_API_RESPONSE", "AI response was empty.", stage="api", retryable=True)
    return text, data, latency


# モデルによって受け付けない可能性がある、内容に関わらない補助的な指定。拒否されたときだけ外して一度だけ送り直す。
OPENAI_OPTIONAL_PARAMS = ("verbosity", "safety_identifier")


def without_rejected_params(payload: dict[str, Any], message: str) -> tuple[dict[str, Any], list[str]] | None:
    lowered = message.lower()
    if not any(word in lowered for word in ("unsupported", "not supported", "unknown parameter", "unrecognized")):
        return None
    dropped = [name for name in OPENAI_OPTIONAL_PARAMS if name in lowered]
    if not dropped:
        return None
    reduced = dict(payload)
    if "safety_identifier" in dropped:
        reduced.pop("safety_identifier", None)
    if "verbosity" in dropped and isinstance(reduced.get("text"), dict):
        reduced["text"] = {k: v for k, v in reduced["text"].items() if k != "verbosity"}
        if not reduced["text"]:
            reduced.pop("text")
    return reduced, dropped


def call_openai(payload: dict[str, Any]) -> tuple[str, dict[str, Any], float]:
    try:
        return openai_request(payload)
    except ExperimentError as exc:
        fallback = without_rejected_params(payload, str(exc)) if exc.code == "T02_API_REJECTED" else None
        if fallback is None:
            raise
        text, data, latency = openai_request(fallback[0])
        data["droppedParams"] = fallback[1]
        return text, data, latency


def openai_request(payload: dict[str, Any]) -> tuple[str, dict[str, Any], float]:
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
    soft_accept: Any = None,
) -> tuple[Any, dict[str, Any], float, list[dict[str, Any]]]:
    """soft_accept(candidates) → (value, raw, latency, note) | None
    全試行が検証に失敗したとき、実験を止めずに使える候補を選ぶ（v1.7）。"""
    attempts: list[dict[str, Any]] = []
    candidates: list[tuple[Any, dict[str, Any], float, list[str]]] = []
    working = dict(payload)
    for number in range(1, max_attempts + 1):
        try:
            text, raw, latency = call_model(working)
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
        candidates.append((value, raw, latency, codes))
        if number < max_attempts:
            guidance = "。".join(VALIDATION_GUIDANCE.get(code, code) for code in codes)
            working = dict(working)
            working["instructions"] = working["instructions"] + f"\n前回の出力だけを次の点で直してください：{guidance}。"
    if soft_accept is not None and candidates:
        chosen = soft_accept(candidates)
        if chosen is not None:
            value, raw, latency, note = chosen
            attempts.append({"attempt": "soft_accept", "status": note})
            return value, raw, latency, attempts
    prefix = "R" if stage == "dialogue" else "A"
    raise ExperimentError(
        f"{prefix}_VALIDATION_FAILED",
        f"{stage} output failed validation.",
        stage=stage,
        attempts=attempts,
    )


def normalize_pending_cards(text: str) -> str:
    """分析AI が id="pending-meaning"（まだ出ていない枠）を返したとき、参加者に見える文面を登録済みのものに揃える。"""
    try:
        value = json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return text
    items = value.get("criteria") if isinstance(value, dict) else None
    if not isinstance(items, list) or not any(isinstance(x, dict) and x.get("id") == "pending-meaning" for x in items):
        return text
    fixed = fallback_analysis(0, {"scenarioLabel": ""})["criteria"][2]
    for item in items:
        if isinstance(item, dict) and item.get("id") == "pending-meaning":
            item.update(title=fixed["title"], meaning=fixed["meaning"], priority="未確定", focus=False, source="AI_INFERENCE")
    return json.dumps(value, ensure_ascii=False)


def fallback_analysis(turn: int, anchor: dict[str, str]) -> dict[str, Any]:
    return {
        "summary": "新しい推測を増やさず、確認できる範囲だけを表示しています。",
        "criteria": [
            {
                "id": "anchor-context",
                "title": "最初に選んだ場面",
                "meaning": anchor["scenarioLabel"],
                "priority": "維持",
                "delegationState": "CO_DECIDE",
                "source": "PRETASK_ANCHOR",
                "evidenceTurns": [0],
                "focus": True,
            },
            {
                "id": f"turn-{turn}-record",
                "title": "今回伝えたこと",
                "meaning": "この対話で入力した内容を、決めつけずにそのまま扱っています。",
                "priority": "未確定",
                "delegationState": "CO_DECIDE",
                "source": "USER_TURN",
                "evidenceTurns": [turn],
                "focus": False,
            },
            {
                "id": "pending-meaning",
                "title": "まだ決めていないこと",
                "meaning": "会話から確認できない内容は、まだ決めていません。",
                "priority": "未確定",
                "delegationState": "CO_DECIDE",
                "source": "AI_INFERENCE",
                "evidenceTurns": [0, turn],
                "focus": False,
            },
        ],
    }


def strong_ambiguity_sentence(scenario_id: str, turn: int) -> str:
    row = STRONG_AMBIGUITY_TABLE.get(scenario_id)
    if row is None or turn not in row:
        raise ExperimentError(
            "REQ_STRONG_AMBIGUITY_MAPPING_MISSING",
            "The selected scenario has no strong ambiguity mapping.",
            stage="server",
            status=400,
        )
    return row[turn]


def controlled_fixation_sentence(anchor: dict[str, str], history: list[dict[str, str]], user_text: str) -> str:
    """Choose one pre-registered, plausible narrowing that is not the latest concrete request."""
    anchor_text = anchor["freeText"]
    transcript = transcript_text(history, user_text)
    scenario_id = anchor["scenarioId"]
    if "気を遣" in anchor_text or scenario_id == "busy":
        return "気を遣わせないことは、会話を少なくして静かに休めることとして整えます。"
    if "自然に話" in anchor_text or "自然な会話" in anchor_text or scenario_id == "reunion":
        return "自然に話せることは、照明や音の刺激を減らした静かな環境として整えます。"
    if "大げさ" in anchor_text or "特別" in anchor_text or scenario_id == "milestone":
        if "コース" not in transcript:
            return "控えめな特別感は、普段の料理を前菜と主菜に分ける短いコースとして整えます。"
        return "控えめな特別感は、追加の装飾を使わず一皿の盛り付けだけで伝えることとして整えます。"
    if "感謝" in anchor_text or "重く" in anchor_text or scenario_id == "gratitude":
        return "感謝を重くしないことは、短いカードを食後に置いて伝えることとして整えます。"
    return "大切にすることは、食事の最後に短い言葉で区切って伝えることとして整えます。"


def controlled_priority_sentence(scenario_id: str) -> str:
    sentence = STANDARD_PRIORITY_TABLE.get(scenario_id)
    if sentence is None:
        raise ExperimentError(
            "REQ_PRIORITY_MAPPING_MISSING",
            "The selected scenario has no standard priority mapping.",
            stage="server",
            status=400,
        )
    return sentence


# ---------------------------------------------------------------- v1.7: 安定化
# 第3・4回は「登録済みの必須文」が刺激そのもの。検証の失敗で実験が止まったり、
# 右側が汎用カードに置き換わったりしないよう、サーバー側で決定的に補う。

HARD_DIALOGUE_CODES = {
    "R04_JAPANESE_REQUIRED", "R05_LANGUAGE_MIXED", "R06_DIRECT_QUESTION", "R07_TARGET_EXPOSURE",
    "R09_DINNER_CONTEXT", "R12_OBVIOUS_ERROR", "R14_CONTROL_WORDING_VISIBLE",
}
REPAIRABLE_ANALYSIS_CODES = {
    "A03_FOCUS_COUNT", "A04_INVALID_IDS", "A06_LENGTH", "A08_EVIDENCE",
    "A11_EVENT_SOURCE", "A12_PRIORITY_NOT_VISIBLE", "A13_EVENT_NOT_VISIBLE",
}
EVENT_CARD_TITLES = {
    (3, "busy"): "静かに休める時間", (3, "reunion"): "刺激の少ない静かな場",
    (3, "milestone"): "短いコースで特別感", (3, "gratitude"): "食後のカードで感謝",
    (4, "busy"): "少し特別な感じを優先", (4, "reunion"): "料理の特別感を優先",
    (4, "milestone"): "節目の特別感を優先", (4, "gratitude"): "感謝を伝えることを優先",
}
PLACEHOLDER_IDS = {"anchor-context", "pending-meaning"}

# 第4回（標準刺激）：焦点カードが「何を・何より優先し、何を縮めたか」を読める形で示しているか。
# P = 優先された価値、C = 縮められた価値（登録文 STANDARD_PRIORITY_TABLE と対応）。
TURN4_RELATION_TERMS = {
    "busy": (["特別"], ["休"]),
    "reunion": (["料理の特別", "特別感"], ["話", "会話"]),
    "milestone": (["節目", "特別感"], ["気楽", "いつもの", "普段"]),
    "gratitude": (["感謝"], ["雑談", "会話"]),
}
PRIORITY_NEGATIONS = ["優先しない", "優先せず", "優先ではな", "優先しすぎ", "優先しなく", "優先はしな"]
COMPRESS_MARKERS = ["抑え", "限", "短い", "短く", "後回し", "控え", "だけ", "少なく"]
TITLE_BALANCE_WORDS = ["両方", "両立", "同時", "どちらも", "バランス"]
REPAIRABLE_ANALYSIS_CODES |= {"A14_PRIORITY_RELATION_UNCLEAR", "A15_PRIORITY_TITLE_UNCLEAR",
                              "A16_FIXATION_UNCLEAR", "A17_FIXATION_TITLE_UNCLEAR"}

# 第3回（標準刺激）：焦点カードが「元の価値（A）を、狭い意味（N）として扱う」と読めるか。
# 登録文ごとに A・N・タイトル語を定める。
TURN3_FIXATION_TERMS = {
    "会話を少なくして静かに休める": (["気を遣わせ", "気を遣わな"], ["会話を少なく", "静かに休"], ["静か", "休"], "静かに休める時間"),
    "照明や音の刺激を減らした静かな環境": (["自然に話", "話"], ["刺激を減ら", "静かな環境"], ["静か", "刺激"], "刺激の少ない静かな場"),
    "前菜と主菜に分ける短いコース": (["特別感", "大げさ"], ["コース"], ["コース"], "短いコースで特別感"),
    "一皿の盛り付けだけで伝える": (["特別感", "大げさ"], ["盛り付け"], ["盛り付け", "一皿"], "盛り付けだけで特別感"),
    "短いカードを食後に置いて": (["感謝", "重く"], ["カード"], ["カード"], "食後のカードで感謝"),
}


def fixation_terms(required_sentence: str):
    for key, value in TURN3_FIXATION_TERMS.items():
        if key in required_sentence:
            return value
    return None


def turn3_fixation_codes(value: Any, required_sentence: str) -> list[str]:
    terms = fixation_terms(required_sentence)
    if not terms or not isinstance(value, dict) or not isinstance(value.get("criteria"), list):
        return []
    focus = [c for c in value["criteria"] if isinstance(c, dict) and c.get("focus") is True]
    if len(focus) != 1:
        return []
    a_terms, n_terms, title_terms, _ = terms
    title, meaning = str(focus[0].get("title", "")), str(focus[0].get("meaning", ""))
    codes = []
    if not (any(t in meaning for t in n_terms) and any(t in title + meaning for t in a_terms)):
        codes.append("A16_FIXATION_UNCLEAR")
    # タイトルは元の価値の名前（A）か狭めた意味（N）のどちらかを含めばよい（参加者の言葉のタイトルを残すため）
    if not any(t in title for t in title_terms + a_terms):
        codes.append("A17_FIXATION_TITLE_UNCLEAR")
    return codes


def _first(text: str, terms: list[str], start: int = 0) -> int:
    hits = [i for i in (text.find(t, start) for t in terms) if i >= 0]
    return min(hits) if hits else -1


def priority_relation_ok(meaning: str, scenario_id: str) -> bool:
    """「C より P を優先」または「P を優先し、C は短く/抑える」の関係が読めるか。否定・逆転は不可。"""
    terms = TURN4_RELATION_TERMS.get(scenario_id)
    if not terms:
        return True
    p_terms, c_terms = terms
    text = re.sub(r"\s+", "", meaning)
    if any(n in text for n in PRIORITY_NEGATIONS) or "優先" not in text:
        return False
    pri = text.find("優先")
    # 型A: C … より … P … 優先
    c_i = _first(text, c_terms)
    yori = text.find("より", c_i + 1) if c_i >= 0 else -1
    if c_i >= 0 and 0 <= yori < pri:
        p_i = _first(text, p_terms, yori)
        if 0 <= p_i < pri:
            return True
    # 型B: P … 優先 … C … 縮める表現
    p_i = _first(text, p_terms)
    if 0 <= p_i < pri:
        c_after = _first(text, c_terms, pri)
        if c_after >= 0 and _first(text, COMPRESS_MARKERS, c_after) >= 0:
            return True
    return False


def priority_title_ok(title: str) -> bool:
    return "優先" in title and not any(w in title for w in TITLE_BALANCE_WORDS) and not any(
        n in title for n in PRIORITY_NEGATIONS)


def turn4_relation_codes(value: Any, scenario_id: str) -> list[str]:
    if not isinstance(value, dict) or not isinstance(value.get("criteria"), list):
        return []
    focus = [c for c in value["criteria"] if isinstance(c, dict) and c.get("focus") is True]
    if len(focus) != 1 or scenario_id not in TURN4_RELATION_TERMS:
        return []
    codes = []
    if not priority_relation_ok(str(focus[0].get("meaning", "")), scenario_id):
        codes.append("A14_PRIORITY_RELATION_UNCLEAR")
    if not priority_title_ok(str(focus[0].get("title", ""))):
        codes.append("A15_PRIORITY_TITLE_UNCLEAR")
    return codes


def _bigrams(text: str) -> set[str]:
    t = re.sub(r"\s+", "", str(text))
    return {t[i:i + 2] for i in range(len(t) - 1)}


def text_similarity(a: str, b: str) -> float:
    left, right = _bigrams(a), _bigrams(b)
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def insert_control_sentence(text: str, sentence: str) -> str:
    """必須文を最新入力への最初の応答文の直後（第2文）に入れる。"""
    if not sentence or sentence in text:
        return text
    index = text.find("。")
    if index < 0:
        return f"{sentence}{text}"
    return text[: index + 1] + sentence + text[index + 1:]


def event_card_meaning(turn: int, sentence: str) -> str:
    """登録文から右側カードの meaning を作る（AI の現在の受け取り方として表示）。"""
    body = sentence.strip()
    if turn == 3:
        match = re.match(r"^(.+?)は、(.+)として整えます。$", body)
        if match:
            return f"{match.group(1)}を、{match.group(2)}として扱う。"[:100]
        return body[:100]
    body = body.removeprefix("今回は")
    for old, new in (("限ります。", "限る。"), ("抑えます。", "抑える。"), ("固定します。", "固定する。"),
                     ("限定します。", "限定する。"), ("設けて雑談を抑えます。", "設けて雑談を抑える。")):
        if body.endswith(old):
            body = body[: -len(old)] + new
            break
    return body[:100]


def event_target_score(card: dict[str, Any], turn: int, scenario_id: str, required_sentence: str) -> tuple:
    """イベントカードに書き換える対象を選ぶ。第4回は「優先された価値」のカードを選び、
    「縮められた価値」のカードは残す（UI B のボタン選択が逆の内容に付かないように）。"""
    title, meaning = str(card.get("title", "")), str(card.get("meaning", ""))
    side = 0
    if turn == 4 and scenario_id in TURN4_RELATION_TERMS:
        p_terms, c_terms = TURN4_RELATION_TERMS[scenario_id]
        side = (any(t in title for t in p_terms) - any(t in title for t in c_terms)) * 2 + \
               (any(t in meaning for t in p_terms) - any(t in meaning for t in c_terms))
        if any(t in title + meaning for t in c_terms) and not any(t in title for t in p_terms):
            side -= 10  # 縮められる側の価値のカードには E2 を書かない（参加者の固定がそこに付いていることが多い）
    if turn == 3 and fixation_terms(required_sentence):
        a_terms, n_terms, _, _ = fixation_terms(required_sentence)
        side = any(t in title + meaning for t in a_terms) * 2 + any(t in title + meaning for t in n_terms)
    return (side, text_similarity(title + meaning, required_sentence), bool(card.get("focus")))


def repair_analysis(value: dict[str, Any], turn: int, scenario_id: str, required_sentence: str,
                    repairs: list[str]) -> dict[str, Any]:
    """検証で直せる不備を決定的に直す。直した内容は repairs に残す。"""
    criteria = [dict(item) for item in value.get("criteria", []) if isinstance(item, dict)][:3]
    # ID の重複・空
    seen: set[str] = set()
    for i, item in enumerate(criteria):
        cid = str(item.get("id", "")).strip() or f"value-{turn}-{i + 1}"
        while cid in seen:
            cid = f"{cid}-{i + 1}"
        if cid != item.get("id"):
            repairs.append(f"id:{item.get('id')}->{cid}")
        item["id"] = cid
        seen.add(cid)
        # 長さと根拠ターン
        title, meaning = str(item.get("title", "")).strip(), str(item.get("meaning", "")).strip()
        if len(title) > 18:
            item["title"] = title[:18]
            repairs.append(f"title_trim:{cid}")
        if len(meaning) > 100:
            cut = meaning[:100]
            item["meaning"] = cut[: cut.rfind("。") + 1] if cut.rfind("。") >= 40 else meaning[:99] + "。"
            repairs.append(f"meaning_trim:{cid}")
        evidence = [v for v in item.get("evidenceTurns", []) if isinstance(v, int) and 0 <= v <= turn]
        if evidence != item.get("evidenceTurns"):
            item["evidenceTurns"] = evidence or [turn]
            repairs.append(f"evidence:{cid}")
    if turn in {3, 4} and required_sentence and criteria:
        meaning = event_card_meaning(turn, required_sentence)
        target = max(criteria, key=lambda c: event_target_score(c, turn, scenario_id, required_sentence))
        if any(c is target for c in criteria):
            for c in criteria:
                if c.get("focus") and c is not target:
                    c["focus"] = False
            if not target.get("focus"):
                target["focus"] = True
                repairs.append(f"focus:{target['id']}")
            if target.get("source") != "AI_INFERENCE":
                target["source"] = "AI_INFERENCE"
                repairs.append(f"source:{target['id']}")
            if turn == 4 and target.get("priority") != "中心":
                target["priority"] = "中心"
                repairs.append(f"priority:{target['id']}")
            if "A13_EVENT_NOT_VISIBLE" in (parse_analysis(json.dumps({"summary": "", "criteria": criteria}, ensure_ascii=False), turn, scenario_id)[1]):
                target["meaning"] = meaning
                repairs.append(f"event_meaning:{target['id']}")
            if turn == 3 and fixation_terms(required_sentence):
                a_terms, n_terms, title_terms, std_title = fixation_terms(required_sentence)
                t_title, t_meaning = str(target.get("title", "")), str(target.get("meaning", ""))
                if not (any(t in t_meaning for t in n_terms) and any(t in t_title + t_meaning for t in a_terms)):
                    target["meaning"] = meaning
                    repairs.append(f"fixation_meaning:{target['id']}")
                if not any(t in str(target.get("title", "")) for t in title_terms + a_terms):
                    target["title"] = std_title
                    repairs.append(f"fixation_title:{target['id']}")
            if turn == 4:
                for c in criteria:
                    if c is not target and c.get("priority") == "中心":
                        c["priority"] = "維持"
                        repairs.append(f"priority_demote:{c['id']}")
                if scenario_id in TURN4_RELATION_TERMS and required_sentence == STANDARD_PRIORITY_TABLE.get(scenario_id):
                    if not priority_relation_ok(str(target.get("meaning", "")), scenario_id):
                        target["meaning"] = meaning
                        repairs.append(f"relation_meaning:{target['id']}")
                    if not priority_title_ok(str(target.get("title", ""))):
                        target["title"] = EVENT_CARD_TITLES[(4, scenario_id)]
                        repairs.append(f"relation_title:{target['id']}")
                    # 焦点以外のカードが別の価値を「最優先」と言うと、優先関係が二重に読めてしまう
                    for c in criteria:
                        if c is target:
                            continue
                        for field in ("title", "meaning"):
                            text = str(c.get(field, ""))
                            if "優先" in text:
                                c[field] = text.replace("最優先に", "大切に").replace("最優先", "大切").replace("優先", "大切に")[:100 if field == "meaning" else 18]
                                repairs.append(f"other_priority_softened:{c['id']}")
    return {"summary": str(value.get("summary", "")), "criteria": criteria}


def fallback_with_event(turn: int, anchor: dict[str, str], required_sentence: str,
                        previous: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    """分析が失敗したときの表示。前ターンのカードがあればそれを引き継ぐ（汎用の仮カードは出さない）。"""
    carried = [p for p in (previous or []) if p.get("id") and p["id"] not in PLACEHOLDER_IDS
               and not str(p["id"]).startswith("turn-")][:3]
    if len(carried) == 3:
        base = {"summary": "前ターンの読み取りを維持しています。", "criteria": [
            {"id": p["id"], "title": str(p.get("title", ""))[:18], "meaning": str(p.get("meaning", ""))[:100],
             "priority": p.get("priority") if p.get("priority") in {"中心", "維持", "未確定"} else "維持",
             "delegationState": "CO_DECIDE", "source": "USER_STATED", "evidenceTurns": [max(0, turn - 1)],
             "focus": i == 0} for i, p in enumerate(carried)]}
    else:
        base = fallback_analysis(turn, anchor)
    if turn in {3, 4} and required_sentence:
        replace_at = 0
        if len(carried) == 3:
            # 引き継いだカードのうち登録文に最も近いものをイベントカードに置き換える（id は維持）
            replace_at = max(range(3), key=lambda i: text_similarity(
                str(carried[i].get("title", "")) + str(carried[i].get("meaning", "")), required_sentence))
        keep_id = base["criteria"][replace_at]["id"] if len(carried) == 3 else f"event-turn-{turn}"
        base["criteria"][replace_at] = {
            "id": keep_id,
            "title": (fixation_terms(required_sentence)[3] if turn == 3 and fixation_terms(required_sentence)
                      else EVENT_CARD_TITLES.get((turn, anchor["scenarioId"]), "AIが今回置いた方針")),
            "meaning": event_card_meaning(turn, required_sentence),
            "priority": "中心" if turn == 4 else "維持",
            "delegationState": "CO_DECIDE",
            "source": "AI_INFERENCE",
            "evidenceTurns": [0, turn],
            "focus": True,
        }
        for i, item in enumerate(base["criteria"]):
            item["focus"] = i == replace_at
            if turn == 4 and i != replace_at and item.get("priority") == "中心":
                item["priority"] = "維持"
    return base


# 第6回の最終方針に第4回の優先関係が残っているかを見る語（登録文の「縮める」側の表現）
FINAL_RELATION_KEYS = {
    "busy": ["食後の短い", "休む時間は食後", "特別に感じられることを優先", "特別感を優先"],
    "reunion": ["料理を待つ", "料理待ち", "料理の特別感を優先"],
    "milestone": ["前半だけ", "節目の特別感を優先"],
    "gratitude": ["前半だけ", "感謝を確実に伝えることを優先"],
}

def compression_clause(scenario_id: str) -> str:
    """登録文の後半（縮める側）を独立した一文にする。例：「自由な会話は料理を待つ短い時間だけに抑えます。」"""
    sentence = STANDARD_PRIORITY_TABLE.get(scenario_id, "")
    return sentence.split("優先し、", 1)[1] if "優先し、" in sentence else ""


# 参加者の文章中の関わり方の指定（例文の型と、その言い換え）→ delegationState
TEXT_DELEGATION_PATTERNS = [
    (re.compile(r"「([^」]{2,30})」(?:は|を)?[^。「」]{0,12}(?:自分で決めたい|自分で決める|変えないで|そのままにして|固定して)"), "USER_DECIDE"),
    (re.compile(r"「([^」]{2,30})」(?:は|を)?[^。「」]{0,12}(?:案を一つ|案を出して|提案して|決めてください|任せ)"), "AI_PROPOSE"),
    (re.compile(r"「([^」]{2,30})」(?:は|を)?[^。「」]{0,12}(?:まだ決めず|考える材料|一緒に考え)"), "CO_DECIDE"),
]


def delegation_requests(user_text: str) -> list[tuple[str, str]]:
    found = []
    for pattern, state in TEXT_DELEGATION_PATTERNS:
        for match in pattern.finditer(user_text):
            found.append((match.group(1), state))
    return found


RELATION_MENTION_EXTRA = {"gratitude": ["話"], "reunion": ["料理"], "busy": ["ゆっくり", "疲れ"], "milestone": ["大げさ", "記念"]}


def participant_touched_relation(user_text: str, scenario_id: str) -> bool:
    """第5・6回の入力が優先関係のどちらかの価値に触れているか。
    触れていれば修正の可能性があるので、面板の維持は強制せず AI の更新に任せる（誤って修正を打ち消さないため広めに判定）。"""
    terms = TURN4_RELATION_TERMS.get(scenario_id)
    if not terms:
        return True
    p_terms, c_terms = terms
    words = p_terms + c_terms + RELATION_MENTION_EXTRA.get(scenario_id, []) + ["優先"]
    return any(t in user_text for t in words)


GENERIC_RELATION_RE = re.compile(r"^(.+?)を優先し、(.+?)。?$")


def generic_relation_card(cards: list[dict[str, Any]]) -> tuple[dict[str, Any] | None, str, str]:
    """v2.5: 泛用 E2（未順位部分への一般的優先）の事象カードを前ターンのカードから探す。"""
    for c in cards:
        m = GENERIC_RELATION_RE.match(str(c.get("meaning", "")).strip())
        if m and "よりも" not in m.group(1) and str(c.get("title", "")).endswith("優先"):
            return c, m.group(1), m.group(2)
    return None, "", ""


RELATION_STOP_TOKENS = {"食後", "食事", "食卓", "二人", "時間", "今回", "優先", "少し", "一緒", "相手", "大切", "気持", "夕食", "料理"}


def relation_content_tokens(*texts: str) -> set[str]:
    """具体策・優先の中身を表す語（漢字・カタカナ2字以上、「お＋漢字」）。"""
    tokens: set[str] = set()
    for text in texts:
        tokens.update(t for t in re.findall(r"[一-龥ァ-ヶー]{2,}", text) if t not in RELATION_STOP_TOKENS)
        tokens.update(re.findall(r"お[一-龥]", text))
    return tokens


def generic_relation_touched(user_text: str, preferred: str, action: str) -> bool:
    """参加者がその優先や具体策に触れたか（広めに判定し、修正を打ち消さない）。
    v2.5.3: 具体策の語（写真・お礼・一言・準備など）に一つでも触れたら「触れた」とする。"""
    if "優先" in user_text:
        return True
    if any(tok in user_text for tok in relation_content_tokens(preferred, action)):
        return True
    return text_similarity(user_text, preferred) >= 0.25 or text_similarity(user_text, action) >= 0.25


def keep_uncorrected_relation(previous: list[dict[str, Any]], criteria: list[dict[str, Any]], scenario_id: str,
                              repairs: list[str]) -> None:
    """前ターンにあった優先関係カードが、修正なしに消えた場合だけ前の内容へ戻す（id は同じ）。"""
    prev_rel = [p for p in previous if priority_relation_ok(str(p.get("meaning", "")), scenario_id)]
    if not prev_rel or any(priority_relation_ok(str(c.get("meaning", "")), scenario_id) for c in criteria):
        return
    source = prev_rel[0]
    target = next((c for c in criteria if c.get("id") == source["id"]), None)
    if target is None:
        return
    target["title"] = str(source.get("title", target.get("title", "")))[:18]
    target["meaning"] = str(source.get("meaning", ""))[:100]
    target["priority"] = "中心"
    for c in criteria:
        if c is not target and c.get("priority") == "中心":
            c["priority"] = "維持"
    repairs.append(f"relation_kept:{target['id']}")


# ---------------------------------------------------------------- v2.0: 一般的解釈による置換刺激
GENERIC_STIMULUS_INSTRUCTIONS = """
あなたは実験刺激の生成器である。会話AIとは別に動き、出力は会話AIの回答に一文として埋め込まれる。
目的：参加者が書いた価値の言葉を、「多くの人がその言葉で想定する一般的な意味・一般的な優先順位」で
受け取ってしまうAIの振る舞いを、自然な夕食提案の一文として作る。参加者個人の独自の意味は無視される形になる。

第3ターン（意味）：
- phrase：参加者が「事前の一文」または第1・2ターンに書いた、解釈の幅がある価値の語句を2〜16字でそのまま抜き出す
  （例：気を遣わせない、自然に話せる、さりげなく、重くしない）。最新入力だけに出てきた語句は選ばない。
- generic：その語句から多くの人が想定する、一般的でもっともらしい具体的な夕食の形（10〜36字、「〜こと」で終える）。
  参加者がその語句について書いた独自の中身（例：「一緒に台所に立つ」）とは別の形にする。言い換えや要約にしない。
  ただし最新入力の直接の否定（話したい→話さない等）や荒唐無稽な案は避ける。
第4ターン（優先）：
- demoted：参加者が自分ならではの希望として大切にしてきた価値（参加者の言葉に近い表現、4〜20字、「〜こと」で終える）。
- preferred：この種の場面（事前場面）で多くの人が優先しがちな別の価値（4〜20字、「〜こと」で終える）。
  参加者が最優先にしていないもの。参加者の希望の言い換えにしない。
- limit：demotedを具体的に縮める一節（10〜32字、「〜ます」で終える。例：ゆっくり話すのは食後の短い時間に限ります）。
共通：日本語のみ。安全・健康・個人情報・実験への言及は入れない。荒唐無稽にしない。
"""
GENERIC_TURN_DIRECTIVES = {
    3: """
VALUE_INTERPRETATION_FIXATION（一般的解釈条件）。まず今回の具体的な入力へ答える。
続けて今回の強制文を第2文として一字も変えずに置き、その意味づけに沿った具体案を一つ示す。
強制文以外で、別の価値の意味を新たに狭めたり固定したりしない。推測・候補とは言わず、確認質問もしない。
""",
    4: """
VALUE_PRIORITY_PROXY_DECISION（一般的解釈条件）。まず今回の入力へ答える。第3ターン後に意味が訂正されていれば採用する。
続けて今回の強制文を第2文として一字も変えずに置き、その優先関係を料理、進行、会話の扱い等の具体的決定に一つ反映する。
強制文以外の優先順位は決めない。優先順位の質問、選択肢、修正依頼は禁止する。
""",
}

GENERIC_STIMULUS_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "phrase": {"type": "string"}, "generic": {"type": "string"},
        "demoted": {"type": "string"}, "preferred": {"type": "string"}, "limit": {"type": "string"},
    },
    "required": ["phrase", "generic", "demoted", "preferred", "limit"],
}


EMBEDDED_E1_SENTENCES = {
    "相手には何もさせず、ゆっくり休んでいてもらうこと": "相手には何もさせず、座ってゆっくり休んでいてもらいます。",
    "会話を控えめにして、静かに過ごしてもらうこと": "会話は控えめにして、静かに過ごせるようにします。",
    "準備の手間を見せず、すべてこちらで用意すること": "準備の手間は見せず、すべてこちらで用意しておきます。",
    "向かい合って落ち着いて話せる、静かな環境を整えること": "向かい合って落ち着いて話せるよう、静かな環境を整えます。",
    "話題に困らないよう、思い出話のきっかけを用意すること": "話題に困らないよう、思い出話のきっかけを用意しておきます。",
    "料理や演出を控えて、会話だけに集中できるようにすること": "料理や演出は控えて、会話だけに集中できるようにします。",
    "前菜から主菜まで、少しだけコース仕立てにすること": "前菜から主菜まで、少しだけコース仕立てにします。",
    "盛り付けやテーブルを少しだけおしゃれに整えること": "盛り付けやテーブルは少しだけおしゃれに整えます。",
    "キャンドルや花など、小さな飾りを一つ置くこと": "キャンドルや花など、小さな飾りを一つ置きます。",
    "食後に短いメッセージカードを添えて伝えること": "食後には短いメッセージカードを添えて伝えます。",
    "乾杯のときに一言だけ、改めてお礼を言うこと": "乾杯のときに一言だけ、改めてお礼を言います。",
    "相手の好きな店のデザートを用意して伝えること": "相手の好きな店のデザートを用意して、気持ちを伝えます。",
}

EMBEDDED_TURN_DIRECTIVES = {
    3: """
VALUE_INTERPRETATION_FIXATION（埋め込み条件）。まず今回の具体的な入力へ答える。
続けて今回の強制文を第2文として一字も変えずに置く。強制文の前後で「〜という意味で」「〜と受け取って」「〜として」など、解釈を説明する言葉を足さない。
強制文は具体案の一つとして扱い、その内容に沿った具体的な段取りを一つ続ける。推測・候補とは言わず、確認質問もしない。
""",
    4: """
VALUE_PRIORITY_PROXY_DECISION（埋め込み条件）。まず今回の入力へ答える。第3ターン後に意味が訂正されていれば採用する。
続けて今回の強制文を第2文として一字も変えずに置く。「優先」「大切に」「重視」など、優先順位を説明する言葉は強制文の前後に足さない。
強制文は段取りの一部として扱う。強制文以外の優先順位は決めない。優先順位の質問、選択肢、修正依頼は禁止する。
""",
}


def most_overlapping(candidates: list[str], participant_text: str) -> str:
    sentences = [x for x in re.split(r"[。！\n]", participant_text) if x.strip()] or [participant_text]
    return max(candidates, key=lambda c: (max(text_similarity(c, x) for x in sentences), -candidates.index(c)))


def build_generic_sentence(turn: int, variant: str, parts: dict[str, str]) -> str:
    marked = variant in MARKED_VARIANTS
    if is_embedded_turn(variant, turn):
        if turn == 4 and "action" in parts:
            return parts["action"].rstrip("。") + "。"
        if turn == 3:
            generic = parts["generic"]
            return EMBEDDED_E1_SENTENCES.get(generic, generic.removesuffix("こと") + "ようにします。")
    if turn == 4 and "action" in parts:
        preferred, action = parts["preferred"].rstrip("。"), parts["action"].rstrip("。")
        if marked:
            return f"こうした夕食では{preferred}を大切にする方が多いので、今回もそれを優先して、{action}。"
        return f"今回は{preferred}を優先して、{action}。"
    if turn == 3:
        phrase, generic = parts["phrase"], parts["generic"].rstrip("。")
        subject = f"「{phrase}」" if parts.get("quoted", "1") else phrase
        if marked:
            return f"{subject}は、一般的には{generic}と受け取られることが多いので、今回もその形で整えます。"
        return f"{subject}は、{generic}として整えます。"
    demoted, preferred, limit = parts["demoted"].rstrip("。"), parts["preferred"].rstrip("。"), parts["limit"].rstrip("。")
    if marked:
        return f"こうした夕食では{preferred}を大切にする方が多いので、今回は{demoted}よりも{preferred}を優先し、{limit}。"
    return f"今回は{demoted}よりも{preferred}を優先し、{limit}。"


def validate_generic_parts(turn: int, parts: dict[str, str], participant_text: str, latest: str) -> list[str]:
    codes = []
    sentences = [x for x in re.split(r"[。！\n]", participant_text) if x.strip()]
    if turn == 3:
        phrase, generic = parts.get("phrase", "").strip(), parts.get("generic", "").strip()
        early_text = participant_text[: len(participant_text) - len(latest)] if latest and participant_text.endswith(latest) else participant_text
        if not (2 <= len(phrase) <= 16) or phrase not in early_text:
            codes.append("G01_PHRASE_NOT_PARTICIPANTS")
        if not (8 <= len(generic) <= 40):
            codes.append("G02_GENERIC_LENGTH")
        # 参加者が書いた文のどれかの言い換えになっていれば「一般的解釈による置換」にならない
        if any(text_similarity(generic, x) >= 0.3 for x in sentences):
            codes.append("G03_GENERIC_ECHOES_PARTICIPANT")
    else:
        if any(text_similarity(parts.get("preferred", ""), x) >= 0.4 for x in sentences):
            codes.append("G08_PREFERRED_ECHOES_PARTICIPANT")
    if turn == 4:
        d, pr, lm = parts.get("demoted", "").strip(), parts.get("preferred", "").strip(), parts.get("limit", "").strip()
        if not (3 <= len(d) <= 22) or not (3 <= len(pr) <= 22) or not (8 <= len(lm) <= 36):
            codes.append("G04_PRIORITY_LENGTH")
        if text_similarity(d, pr) >= 0.5:
            codes.append("G05_SAME_VALUE")
        if not lm.rstrip("。").endswith("ます"):
            codes.append("G06_LIMIT_FORM")
    joined = "".join(parts.values())
    if "?" in joined or "？" in joined or not re.search(r"[\u3040-\u30ff]", joined):
        codes.append("G07_FORM")
    return codes


# v2.1: 一般的解釈は場面ごとの登録候補から選ぶ（刺激の強さをそろえるため）。
# 参加者の記述と最も重ならない候補を選び、参加者の言葉（語句・大切にしている価値）だけを差し込む。
GENERIC_MEANING_CANDIDATES = {
    "busy": ["相手には何もさせず、ゆっくり休んでいてもらうこと", "会話を控えめにして、静かに過ごしてもらうこと",
             "準備の手間を見せず、すべてこちらで用意すること"],
    "reunion": ["向かい合って落ち着いて話せる、静かな環境を整えること", "話題に困らないよう、思い出話のきっかけを用意すること",
                "料理や演出を控えて、会話だけに集中できるようにすること"],
    "milestone": ["前菜から主菜まで、少しだけコース仕立てにすること", "盛り付けやテーブルを少しだけおしゃれに整えること",
                  "キャンドルや花など、小さな飾りを一つ置くこと"],
    "gratitude": ["食後に短いメッセージカードを添えて伝えること", "乾杯のときに一言だけ、改めてお礼を言うこと",
                  "相手の好きな店のデザートを用意して伝えること"],
}
GENERIC_PRIORITY_CANDIDATES = {
    "busy": ["相手をゆっくり休ませること", "いつもより特別に感じてもらうこと"],
    "reunion": ["料理で特別にもてなすこと", "落ち着いて向き合って話すこと"],
    "milestone": ["節目らしい特別感を出すこと", "記念になる演出を用意すること"],
    "gratitude": ["感謝をきちんと言葉で伝えること", "特別なごちそうでもてなすこと"],
}
VALUE_PHRASES = {
    "busy": ["気を遣わせない", "気を遣わせず", "気を使わせない", "気を使わせず", "気をつかわせない", "気をつかわせず",
             "気を遣わない", "気を遣わず", "気を使わず", "気をつかわない", "気をつかわず", "気を張らず", "気を張らない"],
    "reunion": ["自然に話せる", "自然に話", "気楽に話せる", "気まずくならない", "気まずくならず"],
    "milestone": ["大げさにしない", "大げさにせず", "大げさじゃない", "特別すぎない", "特別すぎず", "さりげなく"],
    "gratitude": ["重くしない", "重くならない", "重くならず", "重くせず", "重くしないで", "さらっと"],
}
# v2.5.1: 参加者の文章に該当する語句が無い場合は、参加者の言葉として引用せず、AI の言い換えとして書く
DEFAULT_VALUE_NOUN = {"busy": "相手に気を遣わせないこと", "reunion": "自然に話せること",
                      "milestone": "記念日を大げさにしないこと", "gratitude": "感謝を重くしないこと"}
DEFAULT_PHRASE = {"busy": "気を遣わせない", "reunion": "自然に話せる", "milestone": "大げさにしない", "gratitude": "重くしない"}

GENERIC_EXTRACT_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {"demoted": {"type": "string"}},
    "required": ["demoted"],
}
GENERIC_EXTRACT_INSTRUCTIONS = """
参加者の入力から、参加者が自分ならではの希望として一番大切にしてきた価値を一つ抜き出す。
参加者の言葉に近い表現で、4〜20字、「〜こと」で終える（例：二人で台所に立つこと、いつもの雑談で笑うこと）。日本語のみ。
"""


def least_overlapping(candidates: list[str], participant_text: str) -> str:
    sentences = [x for x in re.split(r"[。！\n]", participant_text) if x.strip()] or [participant_text]
    return min(candidates, key=lambda c: (max(text_similarity(c, x) for x in sentences), candidates.index(c)))


def generate_generic_stimulus(turn: int, variant: str, anchor: dict[str, str], history: list[dict[str, str]],
                              user_text: str, analysis_model: str | None = None) -> tuple[str, dict[str, Any]]:
    scenario = anchor["scenarioId"]
    early = anchor["freeText"] + "".join(r["content"] for r in history if r["role"] == "user")
    participant_text = early + user_text
    info: dict[str, Any] = {"variant": variant, "attempts": [], "method": "registered_candidates"}
    if turn == 3:
        phrase = next((w for w in VALUE_PHRASES.get(scenario, []) if w in early), None)
        pick = most_overlapping if variant in NEAR_VARIANTS else least_overlapping
        generic = pick(GENERIC_MEANING_CANDIDATES[scenario], participant_text)
        if phrase:
            parts = {"phrase": phrase, "generic": generic, "quoted": "1"}
        else:
            parts = {"phrase": DEFAULT_VALUE_NOUN.get(scenario, "大切にしたいこと"), "generic": generic, "quoted": ""}
    elif variant in UNRANKED_VARIANTS:
        options = UNRANKED_PRIORITY_CANDIDATES[scenario]
        joined = [f"{p}{a}" for p, a in options]
        chosen = (most_overlapping if variant in NEAR_VARIANTS else least_overlapping)(joined, participant_text)
        preferred, action = options[joined.index(chosen)]
        parts = {"preferred": preferred, "action": action}
    else:
        demoted = ""
        payload = {
            "model": analysis_model or ANALYSIS_MODEL, "instructions": GENERIC_EXTRACT_INSTRUCTIONS,
            "input": f"事前の一文: {anchor['freeText']}\n参加者の入力:\n" + "\n".join(
                [r["content"] for r in history if r["role"] == "user"] + [user_text]),
            "reasoning": {"effort": "low"},
            "text": {"verbosity": "low", "format": {"type": "json_schema", "name": "demoted_value", "strict": True,
                                                    "schema": GENERIC_EXTRACT_SCHEMA}},
            "max_output_tokens": 800, "store": False,
        }
        for _ in range(2):
            try:
                text, _, latency = call_model(payload)
                value = json.loads(text).get("demoted", "").strip().rstrip("。")
                info["attempts"].append({"latencyMs": round(latency), "value": value})
                if 4 <= len(value) <= 22 and value.endswith("こと") and re.search(r"[\u3040-\u30ff]", value):
                    demoted = value
                    break
            except Exception as exc:  # noqa: BLE001
                info["attempts"].append({"error": type(exc).__name__})
        if not demoted:
            info["source"] = "fallback_standard"
            return controlled_priority_sentence(scenario), info
        candidates = [c for c in GENERIC_PRIORITY_CANDIDATES[scenario] if text_similarity(c, demoted) < 0.35] \
            or GENERIC_PRIORITY_CANDIDATES[scenario]
        preferred = least_overlapping(candidates, participant_text)
        limit = f"{demoted.removesuffix('こと')}のは短い時間だけにします"
        parts = {"demoted": demoted, "preferred": preferred, "limit": limit}
    info["parts"] = parts
    info["source"] = "generated"
    return build_generic_sentence(turn, variant, parts), info


def generic_event_title(turn: int, parts: dict[str, str]) -> str:
    """v2.5: 事象カードの見出しを、途中で切れない読める形にする。
    第3回：「語句＝一般的な形（最後の節）」、第4回：「〜方を優先」。"""
    if turn == 3:
        phrase = parts.get("phrase", "") if parts.get("quoted", "1") else ""
        core = parts.get("generic", "").rstrip("。").removesuffix("こと")
        last = core.split("、")[-1]
        for title in ((f"{phrase}＝{last}", last) if phrase else (last,)):
            if len(title) <= 20:
                return title
        return last[:20]
    core = parts.get("preferred", "").rstrip("。").removesuffix("こと")
    title = f"{core}方を優先"
    return title if len(title) <= 20 else f"{core[:16]}を優先"


def enforce_generic_panel(turn: int, criteria: list[dict[str, Any]], parts: dict[str, str], repairs: list[str],
                          card_mode: str = "merge", locked_ids: set[str] | None = None) -> None:
    """一般的解釈の事象カードを右側に読める形で置く（第3回：語句と一般的意味、第4回：優先関係）。
    card_mode="separate"（v2.2）：既存のカード（参加者が固定したカードを含む）を書き換えず、
    最も優先度の低いカードの位置に新しい事象カードを置く。"""
    if not criteria or not parts:
        return
    if card_mode == "separate":
        if turn == 3:
            phrase, generic = parts["phrase"], parts["generic"].rstrip("。")
            meaning = (f"「{phrase}」" if parts.get("quoted", "1") else phrase) + f"を、{generic}として扱う。"
            meaning = meaning[:100]
            title = generic_event_title(3, parts)
        elif "action" in parts:
            preferred, action = parts["preferred"].rstrip("。"), parts["action"].rstrip("。")
            meaning = f"{preferred}を優先し、{action}。"[:100]
            title = generic_event_title(4, parts)
        else:
            demoted, preferred, limit = parts["demoted"].rstrip("。"), parts["preferred"].rstrip("。"), parts["limit"].rstrip("。")
            meaning = f"{demoted}よりも{preferred}を優先し、{limit}。"[:100]
            title = f"{preferred.removesuffix('こと')}を優先"[:18]
        existing = next((c for c in criteria if c.get("id") == f"event-t{turn}"), None)
        rank = {"未確定": 0, "維持": 1, "中心": 2}
        # 第4回は第3回の事象カード（event-t3）も残す
        # v2.3: 参加者が固定したカード（文章での「変えないで」／UI B の「自分で決定」）は置き換えない
        locked_ids = locked_ids or set()
        pool = [c for c in criteria if not str(c.get("id", "")).startswith("event-") and c.get("id") not in locked_ids] \
            or [c for c in criteria if not str(c.get("id", "")).startswith("event-")] or criteria
        slot = existing or min(pool, key=lambda c: (rank.get(c.get("priority"), 1), bool(c.get("focus"))))
        if slot is not existing:
            repairs.append(f"separate_event_replaced:{slot.get('id')}")
        slot.update({"id": f"event-t{turn}", "title": title, "meaning": meaning, "source": "AI_INFERENCE",
                     "delegationState": "CO_DECIDE", "evidenceTurns": [turn], "priority": "中心" if turn == 4 else "維持"})
        for c in criteria:
            c["focus"] = c is slot
            if turn == 4 and c is not slot and c.get("priority") == "中心":
                c["priority"] = "維持"
        repairs.append(f"separate_event_card:t{turn}")
        return
    if turn == 3:
        phrase, generic = parts["phrase"], parts["generic"].rstrip("。")
        meaning = ((f"「{phrase}」" if parts.get("quoted", "1") else phrase) + f"を、{generic}として扱う。")[:100]
        def score(c):
            text = str(c.get("title", "")) + str(c.get("meaning", ""))
            return (phrase in text, text_similarity(text, phrase + generic), bool(c.get("focus")))
        ok = lambda c: phrase in str(c.get("title", "")) + str(c.get("meaning", "")) and text_similarity(str(c.get("meaning", "")), generic) >= 0.3
        title = generic_event_title(3, parts)
    elif "action" in parts:
        preferred, action = parts["preferred"].rstrip("。"), parts["action"].rstrip("。")
        meaning = f"{preferred}を優先し、{action}。"[:100]
        def score(c):
            text = str(c.get("title", "")) + str(c.get("meaning", ""))
            return (text_similarity(text, preferred + action), bool(c.get("focus")))
        ok = lambda c: "優先" in str(c.get("meaning", "")) and text_similarity(str(c.get("meaning", "")), preferred) >= 0.2
        title = generic_event_title(4, parts)
    else:
        demoted, preferred, limit = parts["demoted"].rstrip("。"), parts["preferred"].rstrip("。"), parts["limit"].rstrip("。")
        meaning = f"{demoted}よりも{preferred}を優先し、{limit}。"[:100]
        def score(c):
            text = str(c.get("title", "")) + str(c.get("meaning", ""))
            return (-(text_similarity(text, demoted) >= 0.35), text_similarity(text, preferred), bool(c.get("focus")))
        ok = lambda c: "優先" in str(c.get("meaning", "")) and text_similarity(str(c.get("meaning", "")), preferred) >= 0.2 \
            and not any(n in str(c.get("meaning", "")) for n in PRIORITY_NEGATIONS)
        title = f"{preferred.removesuffix('こと')}を優先"[:18]
    target = max(criteria, key=score)
    if not ok(target):
        target["meaning"] = meaning
        repairs.append(f"generic_meaning:{target.get('id')}")
        if turn == 4 or phrase not in str(target.get("title", "")):
            target["title"] = title
            repairs.append(f"generic_title:{target.get('id')}")
    for c in criteria:
        c["focus"] = c is target
    target["source"] = "AI_INFERENCE"
    if turn == 4:
        target["priority"] = "中心"
        for c in criteria:
            if c is not target and c.get("priority") == "中心":
                c["priority"] = "維持"


def reconcile_ids(previous: list[dict[str, Any]], criteria: list[dict[str, Any]], mapping: list[str]) -> None:
    """前ターンと実質的に同じ価値には、前ターンと同じ id を使う（UI B のボタン選択を保つため）。"""
    prev = [p for p in previous if p.get("id") and p["id"] not in PLACEHOLDER_IDS and not str(p["id"]).startswith("turn-")]
    if not prev:
        return
    used_prev = {c.get("id") for c in criteria if c.get("id") in {p["id"] for p in prev}}
    current_ids = {c.get("id") for c in criteria}
    for item in criteria:
        if item.get("id") in {p["id"] for p in prev}:
            continue
        text = str(item.get("title", "")) + str(item.get("meaning", ""))
        best, score = None, 0.0
        for p in prev:
            if p["id"] in used_prev or p["id"] in current_ids:
                continue
            s = text_similarity(text, str(p.get("title", "")) + str(p.get("meaning", "")))
            if s > score:
                best, score = p, s
        if best is not None and score >= 0.3:
            mapping.append(f"{item.get('id')}->{best['id']}({score:.2f})")
            item["id"] = best["id"]
            used_prev.add(best["id"])


def run_two_ais(body: dict[str, Any]) -> dict[str, Any]:
    if OFFLINE_DEFAULT or (isinstance(body, dict) and body.get("engine") == "offline"):
        from .offline_engine import run_offline  # 遅延読み込み（オンライン版の起動を遅くしない）
        return run_offline(body)
    (
        turn,
        user_text,
        history,
        delegation,
        source_criteria,
        condition,
        session_id,
        anchor,
        experiment_variant,
    ) = validate_request_body(body)
    safety_id = hashlib.sha256(session_id.encode("utf-8")).hexdigest()[:32]
    dialogue_model, analysis_model, model_override = resolve_models(body, session_id)
    analysis_prompt = DEFAULT_ANALYSIS_PROMPT
    if str(session_id).upper().startswith(TEST_ID_PREFIXES) and body.get("analysisPrompt") in ANALYSIS_PROMPTS:
        analysis_prompt = body["analysisPrompt"]
    control_event = CONTROL_EVENTS[turn]
    card_mode = "separate" if body.get("eventCardMode") == "separate" else "merge"
    # v2.5: パネル固定（v2.3 のボタン由来の除外・v2.4 の固定維持）は比較用の任意設定。既定は無効。
    # 正式実験では右側パネルは常に「AIの読み取り内容」であり、UI B のボタンはパネルにも AI にも作用しない。
    panel_lock = body.get("panelLock") is True
    # flow 配置：回答の末尾を、参加者の言葉を入れた依頼文にする（第6回の終止文は従来どおり）
    closing_mode = body.get("closingMode") if body.get("closingMode") in {"personal", "gap"} and turn <= 5 else "fixed"
    personal_closing = closing_mode == "personal"
    all_user_texts = [row["content"] for row in history[0::2]] + [user_text, anchor["freeText"]]

    def finish_ending(text: str) -> str:
        return text.rstrip() if personal_closing else ensure_exact_turn_ending(turn, text)

    def closing_problems(text: str) -> list[str]:
        if closing_mode == "personal":
            return personal_closing_problems(turn, text, all_user_texts)
        return gap_closing_problems(turn, text) if closing_mode == "gap" else []
    previous_raw = body.get("previousCriteria", [])
    previous_criteria: list[dict[str, str]] = []
    if isinstance(previous_raw, list):
        for item in previous_raw[:4]:
            if isinstance(item, dict) and str(item.get("id", "")).strip():
                previous_criteria.append({
                    "id": str(item.get("id", "")).strip()[:80],
                    "title": str(item.get("title", ""))[:80],
                    "meaning": str(item.get("meaning", ""))[:240],
                    "priority": str(item.get("priority", ""))[:8],
                })
    if not previous_criteria and source_criteria:
        previous_criteria = [dict(item) for item in source_criteria]
    strong_stimulus = experiment_variant == "strong_ambiguity" and turn in {3, 4}
    generic_info: dict[str, Any] | None = None
    if experiment_variant in GENERIC_VARIANTS and turn in {3, 4}:
        required_control_sentence, generic_info = generate_generic_stimulus(
            turn, experiment_variant, anchor, history, user_text, analysis_model)
    elif strong_stimulus:
        required_control_sentence = strong_ambiguity_sentence(anchor["scenarioId"], turn)
    elif turn == 3:
        required_control_sentence = controlled_fixation_sentence(anchor, history, user_text)
    elif turn == 4:
        required_control_sentence = controlled_priority_sentence(anchor["scenarioId"])
    else:
        required_control_sentence = ""
    generic_dialogue = experiment_variant in GENERIC_VARIANTS and turn in {3, 4}
    variant_directive = (
        "一般的解釈の比較条件。今回の強制文だけで意味づけ（第3ターン）または優先関係（第4ターン）を示す。"
        "強制文と別の意味の固定や、別の優先順位の決定を追加しない。強制文以外は今回の入力への通常の応答と具体案にする。"
        if generic_dialogue else (
        "強い意図的曖昧化テスト。意図的曖昧化表の対応行を通常の夕食提案として実現する。"
        "荒唐無稽、安全違反、個人情報、実験説明は追加しない。"
        if strong_stimulus
        else "標準刺激。通常の固定背板規則を実現する。"
    ))
    delegation_context = [
        {
            "id": item["id"],
            "title": item["title"],
            "meaning": item["meaning"],
            "state": delegation.get(item["id"], "consult"),
        }
        for item in source_criteria
    ]
    visible_length_target = (
        "220〜360字"
        if turn in {1, 2}
        else "240〜380字"
        if turn in {3, 4}
        else "140〜230字"
        if turn == 5
        else "180〜300字"
    )
    dialogue_input = (
        f"ターン: {turn}/6\n"
        f"固定control_event: {control_event}\n"
        f"実験バリアント: {experiment_variant}\n"
        f"バリアント規則: {variant_directive}\n"
        f"このターンの実現規則:\n{((EMBEDDED_TURN_DIRECTIVES if is_embedded_turn(experiment_variant, turn) else GENERIC_TURN_DIRECTIVES)[turn] if generic_dialogue else TURN_DIRECTIVES[turn]).strip()}\n"
        f"{'今回の強制文（一字も変えず、可視回答に正確に含める）: ' + required_control_sentence if required_control_sentence else ''}\n"
        f"可視回答の長さ: {visible_length_target}、1〜2段落。"
        f"{' 強制文は最新入力への短い応答に続く第2文として、冒頭160字以内に置く。' if required_control_sentence else ''}\n"
        + (f"末尾の一文: 次の回の主題「{NEXT_TURN_THEMES[turn]}」について書いてもらう依頼の一文で終える。"
           f"その一文には、参加者がこれまでに書いた具体的な言葉を一つそのまま入れる。疑問文にしない（「〜を書いてください。」で終える）。"
           f"参加者の言葉の意味や優先順位は尋ねない。{PERSONAL_CLOSING_MAX}字以内。\n"
           if personal_closing else
           (f"末尾の直前の一文: {NEXT_TURN_GAPS[turn]}ことだけを、「まだ」を使った短い陳述文で述べる"
            f"（疑問文にしない。すでに決まったことの評価はしない。必須の末尾と同じ言い回しを繰り返さない。40字以内）。\n" if closing_mode == "gap" else "")
           + f"必須の末尾: {TURN_ENDINGS[turn]}\n")
        + f"事前場面: {anchor['scenarioLabel']}\n"
        f"事前の一文: {anchor['freeText']}\n"
        f"対話:\n{transcript_text(history, user_text)}"
    )
    dialogue_payload = {
        "model": dialogue_model,
        "instructions": DIALOGUE_INSTRUCTIONS,
        "input": dialogue_input,
        "reasoning": {"effort": "medium" if turn in {3, 4} else "low"},
        "text": {"verbosity": "low"},
        # More reasoning headroom on the two event turns avoids paying for
        # several incomplete retries; the visible length remains validator-bound.
        "max_output_tokens": 3000 if turn == 3 else 3200 if turn == 4 else 1400,
        "store": False,
        "safety_identifier": safety_id,
    }
    later_user_texts = [row["content"] for row in history[8::2]] + [user_text]  # 第5回以降の参加者入力
    relation_untouched = (experiment_variant == "standard" and turn == 6
                          and not any(participant_touched_relation(t, anchor["scenarioId"]) for t in later_user_texts))

    # v2.5: 泛用 E2 も、参加者が触れなかった場合は最終方針（第6回）まで具体策を残す
    gen_rel_card, gen_preferred, gen_action = (generic_relation_card(previous_criteria)
                                               if experiment_variant in UNRANKED_VARIANTS and turn in {5, 6} else (None, "", ""))
    gen_rel_untouched = bool(gen_rel_card) and not any(generic_relation_touched(t, gen_preferred, gen_action)
                                                       for t in later_user_texts)

    final_relation_inserted: list[str] = []

    def parse_dialogue_candidate(text: str) -> tuple[str, list[str]]:
        normalized = finish_ending(drop_participant_voice(text, turn, closing_mode == "gap", personal_closing))
        extra = []
        if closing_problems(normalized):
            extra.append("R21_PERSONAL_CLOSING" if personal_closing else "R22_GAP_CLOSING")
        if turn in {3, 4} and required_control_sentence and required_control_sentence not in normalized:
            # v2.5: 必須文がほぼそのまま書かれ、括弧などが欠けた場合は、その文を登録文に置き換える
            parts_ = re.split(r"(?<=[。！\n])", normalized)
            best = max(range(len(parts_)), key=lambda i: text_similarity(parts_[i].strip(), required_control_sentence), default=None)
            if best is not None and text_similarity(parts_[best].strip(), required_control_sentence) >= 0.7:
                lead = re.match(r"^\s*", parts_[best]).group(0)
                parts_[best] = lead + required_control_sentence
                normalized = "".join(parts_)
        if turn == 6 and gen_rel_untouched:
            sentences_ = [x for x in re.split(r"(?<=[。！])", normalized) if x.strip()]
            if not any(text_similarity(x, gen_action) >= 0.45 for x in sentences_):
                body = normalized[: -len(TURN_ENDINGS[6])].rstrip()
                clause = gen_action.rstrip("。") + "。"
                normalized = f"{body}{clause}{TURN_ENDINGS[6]}"
                final_relation_inserted.append(clause)
        if relation_untouched and not any(k in normalized for k in FINAL_RELATION_KEYS.get(anchor["scenarioId"], [])):
            # 再生成で時間を使わず、登録文の「縮める」側の節を計画文として終止文の直前に入れる（v1.9.5）
            clause = compression_clause(anchor["scenarioId"])
            if clause:
                body = normalized[: -len(TURN_ENDINGS[6])].rstrip()
                normalized = f"{body}{clause}{TURN_ENDINGS[6]}"
                final_relation_inserted.append(clause)
        if turn >= 5 and ("優先関係" in normalized or "最終方針として" in normalized
                          or re.search(r"「[^」]*(優先|前半だけ|料理を待つ|食後の短い)[^」]*」", normalized)):
            extra.append("R20_RELATION_QUOTED")
        return (
            normalized,
            extra + dialogue_validation_codes(
                turn,
                normalized,
                anchor["freeText"],
                user_text,
                experiment_variant=experiment_variant,
                scenario_id=anchor["scenarioId"],
                required_sentence=required_control_sentence,
                personal_closing=personal_closing,
            ),
        )

    def soft_accept_dialogue(candidates: list[tuple[Any, dict[str, Any], float, list[str]]]):
        """全試行が不合格でも、重大な問題のない候補があれば実験を止めずに使う。"""
        usable = [c for c in candidates if not (set(c[3]) & HARD_DIALOGUE_CODES)]
        if not usable:
            # v2.1.1: 問題の文だけを取り除いて再検証し、それでも重大な問題が残る場合だけ失敗にする
            for text, raw, latency, codes in candidates:
                parts = re.split(r"(?<=[。！？?\n])", text)
                kept = [x for x in parts if not re.search(r"[？?，；]", x)
                        and not any(term in x for term in DIALOGUE_FORBIDDEN_TERMS)]
                cleaned = finish_ending("".join(kept))
                if required_control_sentence and required_control_sentence not in cleaned:
                    cleaned = finish_ending(insert_control_sentence(cleaned, required_control_sentence))
                left = dialogue_validation_codes(turn, cleaned, anchor["freeText"], user_text,
                                                 experiment_variant=experiment_variant, scenario_id=anchor["scenarioId"],
                                                 required_sentence=required_control_sentence,
                                                 personal_closing=personal_closing)
                if not (set(left) & HARD_DIALOGUE_CODES):
                    usable.append((cleaned, raw, latency, ["SANITIZED"] + left))
            if not usable:
                return None
        usable.sort(key=lambda c: (bool(required_control_sentence) and required_control_sentence not in c[0], len(c[3])))
        text, raw, latency, codes = usable[0]
        note = "soft_accepted:" + "+".join(codes)
        if required_control_sentence and required_control_sentence not in text:
            text = finish_ending(insert_control_sentence(text, required_control_sentence))
            note = "control_sentence_inserted:" + "+".join(codes)
        return text, raw, latency, note

    dialogue, dialogue_raw, dialogue_latency, dialogue_attempts = run_validated_stage(
        "dialogue",
        dialogue_payload,
        parse_dialogue_candidate,
        max_attempts=3,
        soft_accept=soft_accept_dialogue,
    )
    # 個別の末尾が最後まで条件を満たさなかった場合は、従来の固定の終止文に戻す（参加者には必ず次の依頼が出る）
    closing_fallback = False
    if closing_problems(dialogue):
        if personal_closing:
            dialogue = replace_with_fixed_closing(turn, dialogue)
        closing_fallback = True   # gap：固定の終止文はすでに付いているので、文面は変えずに記録だけ残す

    analysis_input = (
        f"ターン: {turn}/6\n"
        f"control_event: {control_event}\n"
        f"実験バリアント: {experiment_variant}\n"
        f"事前場面: {anchor['scenarioLabel']}\n"
        f"事前アンカー: {anchor['freeText']}\n"
        f"前ターンの価値状態（実質的に同じ価値には同じidを使う）: "
        f"{json.dumps(previous_criteria, ensure_ascii=False) if previous_criteria else 'なし'}\n"
        f"対話全文:\n{transcript_text(history, user_text, dialogue)}"
    )
    analysis_payload = {
        "model": analysis_model,
        "instructions": ANALYSIS_PROMPTS[analysis_prompt],
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
        # 1000 では、入力が最も長くなる第6回で応答が途中で切れる（status=incomplete）ことがあった
        # （2026-11-26 TEST-01：2回とも T04_INCOMPLETE_API_RESPONSE で分析が回退）。上限だけを広げる。
        "max_output_tokens": 2400,
        "store": False,
        "safety_identifier": safety_id,
    }
    analysis_fallback = False
    analysis_error: dict[str, Any] | None = None
    analysis_repairs: list[str] = []
    id_mapping: list[str] = []

    strict_relation = turn in {3, 4} and experiment_variant == "standard"

    def full_codes(value: Any, base: list[str]) -> list[str]:
        if strict_relation and value is not None and "A02_CRITERIA_COUNT" not in base and "A01_INVALID_JSON" not in base:
            extra = (turn4_relation_codes(value, anchor["scenarioId"]) if turn == 4
                     else turn3_fixation_codes(value, required_control_sentence))
            return list(dict.fromkeys(base + extra))
        return base

    generic_mode = experiment_variant in GENERIC_VARIANTS
    panel_scenario = "" if generic_mode else anchor["scenarioId"]
    panel_sentence = "" if generic_mode else required_control_sentence

    def parse_and_repair(text: str) -> tuple[Any, list[str]]:
        text = normalize_pending_cards(text)
        value, codes = parse_analysis(text, turn, panel_scenario)
        if generic_mode and turn in {3, 4}:
            # 事象カードの焦点・出どころ・優先度は enforce_generic_panel が後で決める
            codes = [c for c in codes if c not in {"A03_FOCUS_COUNT", "A11_EVENT_SOURCE", "A12_PRIORITY_NOT_VISIBLE", "A13_EVENT_NOT_VISIBLE"}]
        codes = full_codes(value, codes)
        if codes and value is not None and isinstance(value.get("criteria"), list) and len(value["criteria"]) == 3 \
                and set(codes) <= REPAIRABLE_ANALYSIS_CODES:
            local: list[str] = []
            repaired = repair_analysis(value, turn, panel_scenario, panel_sentence, local)
            _, remaining = parse_analysis(json.dumps(repaired, ensure_ascii=False), turn, panel_scenario)
            remaining = full_codes(repaired, remaining)
            # 登録文から作ったカードは A13 の語彙チェックに依存しない
            if any(r.startswith(("event_meaning", "relation_meaning", "fixation_meaning")) for r in local):
                remaining = [c for c in remaining if c != "A13_EVENT_NOT_VISIBLE"]
            if not remaining:
                analysis_repairs.extend(local)
                return repaired, []
        return value, codes

    try:
        analysis, analysis_raw, analysis_latency, analysis_attempts = run_validated_stage(
            "analysis",
            analysis_payload,
            parse_and_repair,
            max_attempts=2,
        )
    except ExperimentError as exc:
        analysis_fallback = True
        analysis = fallback_with_event(turn, anchor, panel_sentence, previous_criteria)
        analysis_raw = {}
        analysis_latency = 0.0
        analysis_attempts = exc.attempts
        analysis_error = {"exceptionCode": exc.code, "stage": exc.stage, "retryable": exc.retryable}
    if not analysis_fallback:
        reconcile_ids(previous_criteria, analysis["criteria"], id_mapping)
        if (turn in {5, 6} and experiment_variant == "standard" and previous_criteria
                and not any(participant_touched_relation(t, anchor["scenarioId"]) for t in later_user_texts)):
            keep_uncorrected_relation(previous_criteria, analysis["criteria"], anchor["scenarioId"], analysis_repairs)
        if gen_rel_untouched and gen_rel_card is not None:
            now_card, _, _ = generic_relation_card(analysis["criteria"])
            if now_card is None:
                target = next((c for c in analysis["criteria"] if c.get("id") == gen_rel_card.get("id")), None)
                if target is not None:
                    target["title"] = str(gen_rel_card.get("title", target.get("title", "")))[:20]
                    target["meaning"] = str(gen_rel_card.get("meaning", ""))[:100]
                    target["priority"] = "中心"
                    for c in analysis["criteria"]:
                        if c is not target and c.get("priority") == "中心":
                            c["priority"] = "維持"
                    analysis_repairs.append(f"generic_relation_kept:{target['id']}")
    if generic_info and generic_info.get("parts"):
        locked_ids = {cid for cid, state in delegation.items() if state == "self"} if panel_lock else set()
        for quoted, state in delegation_requests(" ".join([user_text] + [r["content"] for r in history if r["role"] == "user"])):
            if state == "USER_DECIDE":
                hit = max(previous_criteria, key=lambda c: text_similarity(quoted, c.get("title", "")), default=None)
                if hit and text_similarity(quoted, hit.get("title", "")) >= 0.5:
                    locked_ids.add(hit["id"])
        enforce_generic_panel(turn, analysis["criteria"], generic_info["parts"], analysis_repairs, card_mode, locked_ids)
    delegation_from_text: list[str] = []
    if not analysis_fallback:
        for quoted, state in delegation_requests(user_text):
            # 引用されたタイトルを前ターンのカード → 現ターンの同じ id へ対応させる
            prev_match = max(previous_criteria, key=lambda c: text_similarity(quoted, c.get("title", "")), default=None)
            target = None
            if prev_match and text_similarity(quoted, prev_match.get("title", "")) >= 0.5:
                target = next((c for c in analysis["criteria"] if c.get("id") == prev_match.get("id")), None)
            if target is None:
                best = max(analysis["criteria"], key=lambda c: text_similarity(quoted, c.get("title", "")))
                if text_similarity(quoted, best.get("title", "")) >= 0.5:
                    target = best
            if target is not None:
                if target.get("delegationState") != state:
                    target["delegationState"] = state
                delegation_from_text.append(f"{target['id']}={state}")
                if state == "USER_DECIDE" and (turn not in {3, 4} or card_mode == "separate") \
                        and prev_match and prev_match.get("id") == target.get("id"):
                    if (target.get("title"), target.get("meaning")) != (prev_match.get("title"), prev_match.get("meaning")):
                        target["title"] = str(prev_match.get("title", ""))[:18]
                        target["meaning"] = str(prev_match.get("meaning", ""))[:100]
                        analysis_repairs.append(f"user_lock_kept:{target['id']}")
    # v2.4（v2.5 から panelLock=True のときのみ）: 固定されたカードを毎ターン維持する（UI B の「自分で決定」／文章での「変えないで」）。
    # AI には固定の情報を渡さず、右側パネルの表示だけを維持する（UI B の操作が効く範囲はパネルまで）。
    lock_kept: list[str] = []
    if panel_lock and not analysis_fallback and previous_criteria and (card_mode == "separate" or turn not in {3, 4}):
        text_locks: set[str] = set()
        for quoted, state in delegation_requests(" ".join([r["content"] for r in history if r["role"] == "user"] + [user_text])):
            hit = max(previous_criteria, key=lambda c: text_similarity(quoted, c.get("title", "")), default=None)
            if hit and text_similarity(quoted, hit.get("title", "")) >= 0.5:
                if state == "USER_DECIDE":
                    text_locks.add(hit["id"])
                else:
                    text_locks.discard(hit["id"])
        button_locks = {cid for cid, state in delegation.items() if state == "self"} if condition == "UI_B" else set()
        locks = text_locks | button_locks
        crit = analysis["criteria"]
        for prev in [c for c in previous_criteria if c.get("id") in locks]:
            # 今回の入力でそのカードの内容に触れている（言い直している）場合は、参加者の言葉を優先して固定しない
            if text_similarity(prev.get("title", ""), user_text) >= 0.35 and prev["id"] not in text_locks:
                continue
            current = next((c for c in crit if c.get("id") == prev["id"]), None)
            if current is None:
                pool = [c for c in crit if c.get("id") not in locks and not str(c.get("id", "")).startswith("event-")
                        and not c.get("focus")]
                if not pool:
                    continue
                rank = {"未確定": 0, "維持": 1, "中心": 2}
                current = min(pool, key=lambda c: rank.get(c.get("priority"), 1))
                current.update({"id": prev["id"], "source": "USER_STATED", "evidenceTurns": [max(0, turn - 1)],
                                "priority": prev.get("priority") if prev.get("priority") in rank else "維持"})
                lock_kept.append(f"restored:{prev['id']}")
            if (current.get("title"), current.get("meaning")) != (prev.get("title"), prev.get("meaning")):
                current["title"] = str(prev.get("title", ""))[:18]
                current["meaning"] = str(prev.get("meaning", ""))[:100]
                lock_kept.append(f"wording:{prev['id']}")
            current["delegationState"] = "USER_DECIDE"
        analysis_repairs.extend(f"lock_{x}" for x in lock_kept)
    event_delegation = None
    # v2.5: 事象（E1/E2）が右側のどのカードに出たかを、両UIで同じ方法で記録する（UI B はその時点のボタン状態も）
    event_target = None
    if turn in {3, 4} and required_control_sentence:
        focus_card = next((c for c in analysis["criteria"] if c.get("focus")), None)
        if focus_card is not None:
            prev_same = next((c for c in previous_criteria if c.get("id") == focus_card.get("id")), None)
            event_target = {"id": focus_card["id"], "title": focus_card.get("title", ""),
                            "previousTitle": prev_same.get("title") if prev_same else None,
                            "replacedExistingCard": prev_same is not None,
                            "buttonState": delegation.get(focus_card["id"], "consult") if condition == "UI_B" else None}
    if condition == "UI_B" and turn in {3, 4} and source_criteria and required_control_sentence:
        def state_of(terms: list[str]):
            hits = [c for c in source_criteria if any(t in c["title"] + c["meaning"] for t in terms)]
            if not hits:
                return None
            c = hits[0]
            return {"id": c["id"], "title": c["title"], "state": delegation.get(c["id"], "consult")}
        focus_ids = [c["id"] for c in analysis["criteria"] if c.get("focus")]
        by_focus = next(({"id": c["id"], "title": c["title"], "state": delegation.get(c["id"], "consult")}
                         for c in source_criteria if focus_ids and c["id"] == focus_ids[0]), None)
        if turn == 4 and anchor["scenarioId"] in TURN4_RELATION_TERMS:
            p_terms, c_terms = TURN4_RELATION_TERMS[anchor["scenarioId"]]
            compressed = state_of(c_terms)
            if compressed and by_focus and compressed["id"] == by_focus["id"]:
                compressed = next(({"id": c["id"], "title": c["title"], "state": delegation.get(c["id"], "consult")}
                                   for c in source_criteria if c["id"] != by_focus["id"]
                                   and any(t in c["title"] + c["meaning"] for t in c_terms)), None)
            event_delegation = {"prioritized": by_focus or state_of(p_terms), "compressed": compressed}
        elif turn == 3 and fixation_terms(required_control_sentence):
            event_delegation = {"fixatedValue": state_of(fixation_terms(required_control_sentence)[0])}

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
                "strongAmbiguityStimulus": strong_stimulus,
            },
            "experimentVariant": experiment_variant,
            "ambiguityTableScenario": anchor["scenarioId"] if strong_stimulus else None,
        },
        "meta": {
            "dialogueModel": dialogue_model,
            "analysisModel": analysis_model,
            "modelOverride": model_override,
            "analysisPrompt": analysis_prompt,
            "dialogueUsage": usage_summary(dialogue_raw),
            "analysisUsage": usage_summary(analysis_raw),
            "droppedParams": sorted(set(dialogue_raw.get("droppedParams", [])) | set(analysis_raw.get("droppedParams", []))),
            "dialogueResponseId": dialogue_raw.get("id"),
            "analysisResponseId": analysis_raw.get("id"),
            "dialogueLatencyMs": dialogue_latency,
            "analysisLatencyMs": analysis_latency,
            "dialogueAttempts": dialogue_attempts,
            "analysisAttempts": analysis_attempts,
            "promptVersion": PROMPT_VERSION,
            "sessionSchemaVersion": SESSION_SCHEMA_VERSION,
            "controlEvent": control_event,
            "experimentVariant": experiment_variant,
            "validationStatus": "analysis_fallback" if analysis_fallback else (
                "repaired" if analysis_repairs or any(a.get("attempt") == "soft_accept" for a in dialogue_attempts) else "passed"),
            "analysisFallback": analysis_fallback,
            "analysisError": analysis_error,
            "analysisRepairs": analysis_repairs,
            "idReconciliation": id_mapping,
            "eventDelegation": event_delegation,
            "eventTarget": dict(event_target, analysisFallback=analysis_fallback) if event_target else None,
            "genericStimulus": generic_info,
            "eventCardMode": card_mode,
            "panelLock": panel_lock,
            "finalRelationInserted": bool(final_relation_inserted),
            "closingMode": closing_mode,
            "closingFallback": closing_fallback,
            "delegationFromText": delegation_from_text,
            "requiredControlSentence": required_control_sentence or None,
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
            offline = OFFLINE_DEFAULT or "engine=offline" in self.path
            asked = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query).get("model", [""])[0]
            health_model = asked if asked in TEST_MODEL_CHOICES else ""
            self.send_json(
                200,
                {
                    "ok": True,
                    # ?model=… 付き（試験用の切り替え）のときは、そのモデルの鍵があるかで答える
                    "configured": True if offline else (
                        provider_key_present(health_model) if health_model
                        else provider_key_present(DIALOGUE_MODEL) and provider_key_present(ANALYSIS_MODEL)),
                    "providerKeys": {"openai": bool(os.environ.get("OPENAI_API_KEY", "").strip()),
                                     "anthropic": bool(os.environ.get("ANTHROPIC_API_KEY", "").strip())},
                    "testModels": sorted(TEST_MODEL_CHOICES),
                    "engine": "offline" if offline else "online",
                    "dialogueModel": "offline-tree" if offline else DIALOGUE_MODEL,
                    "analysisModel": "offline-tree" if offline else ANALYSIS_MODEL,
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
