"""モデルの切り替え（gpt-6-luna / claude-haiku-5-5）の検証。実際の API には接続しない（通信を偽の応答に置き換える）。

  python tests/aitest/test_model_switch.py
"""
import io
import json
import os
import sys
import urllib.error
from pathlib import Path

os.environ["OPENAI_API_KEY"] = "test-key"
os.environ["ANTHROPIC_API_KEY"] = "test-key"
for name in ("EXPERIMENT_ENGINE", "EXPERIMENT_DIALOGUE_MODEL", "EXPERIMENT_ANALYSIS_MODEL",
             "OPENAI_DIALOGUE_MODEL", "OPENAI_ANALYSIS_MODEL", "EXPERIMENT_TEST_MODELS"):
    os.environ.pop(name, None)
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from api.aitest import core  # noqa: E402

FAILS = []


def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok else f" :: {detail}"))
    if not ok:
        FAILS.append(name)


ANCHOR = {"scenarioId": "busy", "scenarioLabel": "相手は最近忙しく、少し疲れている", "freeText": "疲れている友達が、気を使わずにくつろげる夜にしたい"}
USER = "あと、料理は簡単な鍋でいいです。"
PAD = ("料理は温かい鍋を中心にして、切って入れるだけの具材にします。飲み物は温かいお茶を用意して、席に着いたらすぐ食べ始められるようにします。"
       "食卓は普段どおりにして、片づけも軽く済む形にします。")
CARDS = [
    {"id": "relax", "title": "気を使わずにくつろぐ", "meaning": "相手が構えずに過ごせる時間にする。", "priority": "中心",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [0, 1], "focus": True},
    {"id": "easy", "title": "料理は簡単な鍋にする", "meaning": "切って入れるだけの鍋にして、手間を抑える。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [2], "focus": False},
    {"id": "rest", "title": "疲れをためない流れ", "meaning": "片づけまで軽く済むようにする。", "priority": "維持",
     "delegationState": "CO_DECIDE", "source": "USER_TURN", "evidenceTurns": [1], "focus": False},
]
ANALYSIS = json.dumps({"summary": "夕食の方針。", "criteria": CARDS}, ensure_ascii=False)
DIALOGUE = core.ensure_exact_turn_ending(2, "わかりました。" + PAD)


def body(session="SIMTEST-model", **extra):
    rows = [{"role": "user", "content": "友達がほっとして、笑って帰れる夜にしたい"},
            {"role": "assistant", "content": "ほっとできる夜にします。"}]
    return {"sessionId": session, "condition": "UI_A", "experimentVariant": "standard", "turn": 2, "userText": USER,
            "history": rows, "pretaskAnchor": ANCHOR, "delegation": {}, "delegationSourceCriteria": [],
            "previousCriteria": [], **extra}


class FakeHTTP:
    def __init__(self, data):
        self.data = data

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return json.dumps(self.data, ensure_ascii=False).encode("utf-8")


SENT = []


def fake_urlopen(request, timeout=None):
    """送り先と本文を記録し、送り先に合った形の応答を返す。"""
    sent = json.loads(request.data.decode("utf-8"))
    SENT.append({"url": request.full_url, "headers": {k.lower(): v for k, v in request.header_items()}, "body": sent})
    structured = "format" in sent.get("output_config", {}) or "format" in sent.get("text", {})
    text = ANALYSIS if structured else DIALOGUE
    if "anthropic.com" in request.full_url:
        return FakeHTTP({"id": "msg_test", "type": "message", "stop_reason": "end_turn",
                         "content": [{"type": "thinking", "thinking": "", "signature": "x"}, {"type": "text", "text": text}],
                         "usage": {"input_tokens": 1200, "output_tokens": 300}})
    return FakeHTTP({"id": "resp_test", "status": "completed",
                     "output": [{"type": "reasoning"}, {"type": "message", "content": [{"type": "output_text", "text": text}]}],
                     "usage": {"input_tokens": 1000, "output_tokens": 250}})


real_urlopen = core.urllib.request.urlopen
core.urllib.request.urlopen = fake_urlopen

# 1) 既定のモデルと送り先
check("既定は gpt-6-luna", core.DIALOGUE_MODEL == core.ANALYSIS_MODEL == "gpt-6-luna", f"{core.DIALOGUE_MODEL}/{core.ANALYSIS_MODEL}")
check("送り先の判定", core.provider_of("claude-haiku-5-5") == "anthropic" and core.provider_of("gpt-6-luna") == "openai")

# 2) 何も指定しなければ OpenAI の gpt-6-luna へ
SENT.clear()
r = core.run_two_ais(body())
check("指定なし：両方とも OpenAI へ", len(SENT) == 2 and all("api.openai.com" in s["url"] for s in SENT), str([s["url"] for s in SENT]))
check("指定なし：モデル名", all(s["body"]["model"] == "gpt-6-luna" for s in SENT))
check("指定なし：meta", r["meta"]["dialogueModel"] == "gpt-6-luna" and r["meta"]["modelOverride"] is False, str(r["meta"].get("modelOverride")))
check("指定なし：使用量を記録", r["meta"]["dialogueUsage"] == {"input_tokens": 1000, "output_tokens": 250}, str(r["meta"].get("dialogueUsage")))
check("指定なし：回答は従来どおり", r["dialogue"] == DIALOGUE and r["meta"]["validationStatus"] != "analysis_fallback")

# 3) 試験用の番号＋?model=claude-haiku-5-5 → Claude API
SENT.clear()
r = core.run_two_ais(body(model="claude-haiku-5-5"))
check("Claude：両方とも Claude API へ", len(SENT) == 2 and all(s["url"] == core.ANTHROPIC_API_URL for s in SENT), str([s["url"] for s in SENT]))
d, a = SENT[0], SENT[1]
check("Claude：ヘッダ", d["headers"].get("x-api-key") == "test-key" and d["headers"].get("anthropic-version") == "2023-06-01"
      and "authorization" not in d["headers"], str(d["headers"]))
check("Claude：会話AI の本文", d["body"]["model"] == "claude-haiku-5-5" and d["body"]["system"].startswith(core.DIALOGUE_INSTRUCTIONS[:40])
      and [m["role"] for m in d["body"]["messages"]] == ["user"] and d["body"]["output_config"] == {"effort": "low"},
      json.dumps(d["body"].get("output_config")))
check("Claude：受け付けない指定を送らない", not ({"temperature", "top_p", "top_k", "reasoning", "text", "store", "instructions", "input",
                                        "max_output_tokens", "safety_identifier", "thinking"} & set(d["body"])), str(sorted(d["body"])))
check("Claude：上限を広くとる", d["body"]["max_tokens"] >= 4096 and a["body"]["max_tokens"] >= 4800, f'{d["body"]["max_tokens"]}/{a["body"]["max_tokens"]}')
fmt = a["body"]["output_config"]["format"]
flat = json.dumps(fmt, ensure_ascii=False)
check("Claude：分析AI は構造化出力", fmt["type"] == "json_schema" and fmt["schema"]["additionalProperties"] is False
      and fmt["schema"]["required"] == ["summary", "criteria"])
check("Claude：スキーマから未対応の制約を外す", not any(f'"{k}":' in flat for k in ("maxItems", "minimum", "maximum", "minLength", "maxLength"))
      and '"minItems": 3' not in flat, flat[:200])
check("Claude：外した制約は説明に残す", "maxItems: 3" in fmt["schema"]["properties"]["criteria"]["description"])
check("Claude：元のスキーマは書き換えない", core.ANALYSIS_SCHEMA["properties"]["criteria"].get("maxItems") == 3)
check("Claude：thinking の後ろの本文を読む", r["dialogue"] == DIALOGUE and len(r["analysis"]["criteria"]) == 3)
check("Claude：meta", r["meta"]["dialogueModel"] == r["meta"]["analysisModel"] == "claude-haiku-5-5" and r["meta"]["modelOverride"] is True
      and r["meta"]["dialogueResponseId"] == "msg_test" and r["meta"]["analysisUsage"] == {"input_tokens": 1200, "output_tokens": 300},
      json.dumps({k: r["meta"].get(k) for k in ("dialogueModel", "modelOverride", "dialogueResponseId", "analysisUsage")}))

# 4) 正式な参加者番号では切り替えを無視する／候補にないモデルは無視する
SENT.clear()
r = core.run_two_ais(body(session="P01-UI_A-standard-1", model="claude-haiku-5-5"))
check("正式番号：切り替えを無視", all("api.openai.com" in s["url"] for s in SENT) and r["meta"]["modelOverride"] is False)
SENT.clear()
r = core.run_two_ais(body(model="gpt-9-unknown"))
check("候補外のモデル：無視", all(s["body"]["model"] == "gpt-6-luna" for s in SENT) and r["meta"]["modelOverride"] is False)
SENT.clear()
r = core.run_two_ais(body(session="test-01-UI_B-x-1", model="gpt-5.4-nano", analysisModel="claude-haiku-5-5"))
check("会話と分析を別々に切り替え", SENT[0]["body"]["model"] == "gpt-5.4-nano" and SENT[1]["url"] == core.ANTHROPIC_API_URL
      and r["meta"]["analysisModel"] == "claude-haiku-5-5")
SENT.clear()
r = core.run_two_ais(body(model="gpt-6.1-terra"))
check("候補のほかの OpenAI モデルにも切り替えられる", all(s["body"]["model"] == "gpt-6.1-terra" and "api.openai.com" in s["url"] for s in SENT)
      and r["meta"]["modelOverride"] is True)

# 5) Claude API の失敗の扱い
payload = {"model": "claude-haiku-5-5", "instructions": "s", "input": "u", "max_output_tokens": 1400, "reasoning": {"effort": "medium"}}


def raises(fn):
    try:
        fn()
    except core.ExperimentError as exc:
        return exc
    return None


def stop_with(reason, content):
    core.urllib.request.urlopen = lambda request, timeout=None: FakeHTTP({"id": "m", "stop_reason": reason, "content": content})
    return raises(lambda: core.call_anthropic(payload))


e = stop_with("max_tokens", [{"type": "thinking", "thinking": ""}])
check("Claude：途中で切れた応答はやり直し対象", e is not None and e.code == "T04_INCOMPLETE_API_RESPONSE" and e.retryable)
e = stop_with("refusal", [{"type": "text", "text": "…"}])
check("Claude：拒否は本文として使わない", e is not None and e.code == "T04_MODEL_REFUSAL")
e = stop_with("end_turn", [{"type": "thinking", "thinking": ""}])
check("Claude：本文なし", e is not None and e.code == "T04_EMPTY_API_RESPONSE")


def http_error(status, message):
    def opener(request, timeout=None):
        raise urllib.error.HTTPError(request.full_url, status, "err", None, io.BytesIO(json.dumps(
            {"type": "error", "error": {"type": "x", "message": message}}).encode("utf-8")))
    core.urllib.request.urlopen = opener
    return raises(lambda: core.call_anthropic(payload))


e = http_error(429, "rate limited")
check("Claude：429 はやり直し", e.code == "T03_RATE_LIMIT" and e.retryable)
e = http_error(529, "overloaded")
check("Claude：529 はやり直し", e.code == "T02_API_REJECTED" and e.retryable)
e = http_error(400, "Your credit balance is too low to access the Anthropic API.")
check("Claude：残高不足はやり直さない", e.code == "T03_QUOTA_EXCEEDED" and not e.retryable)
e = http_error(401, "invalid x-api-key " + "sk-" + "ant-api03-" + "X" * 16)  # 鍵に似せた偽の文字列
check("Claude：鍵を記録に残さない", e.code == "T02_API_REJECTED" and "sk-ant" not in str(e) and "[REDACTED]" in str(e), str(e))
os.environ["ANTHROPIC_API_KEY"] = ""
e = raises(lambda: core.call_anthropic(payload))
check("Claude：鍵がなければ T01", e is not None and e.code == "T01_API_KEY_MISSING" and e.status == 503)
os.environ["ANTHROPIC_API_KEY"] = "test-key"

# 6) OpenAI 側：補助的な指定を拒否されたら、それだけ外して一度送り直す
calls = []


def picky(request, timeout=None):
    sent = json.loads(request.data.decode("utf-8"))
    calls.append(sent)
    if "verbosity" in sent.get("text", {}):
        raise urllib.error.HTTPError(request.full_url, 400, "err", None, io.BytesIO(json.dumps(
            {"error": {"message": "Unsupported parameter: 'text.verbosity' is not supported with this model.", "code": "unsupported_parameter"}}).encode("utf-8")))
    return fake_urlopen(request)


core.urllib.request.urlopen = picky
r = core.run_two_ais(body())
check("OpenAI：verbosity を外して送り直す", r["dialogue"] == DIALOGUE and r["meta"]["droppedParams"] == ["verbosity"]
      and "format" in calls[-1]["text"] and "verbosity" not in calls[-1]["text"], str(r["meta"].get("droppedParams")))


def always_bad(request, timeout=None):
    raise urllib.error.HTTPError(request.full_url, 400, "err", None, io.BytesIO(json.dumps(
        {"error": {"message": "The model `gpt-6-luna` does not exist or you do not have access to it.", "code": "model_not_found"}}).encode("utf-8")))


core.urllib.request.urlopen = always_bad
e = raises(lambda: core.run_two_ais(body()))
check("OpenAI：ほかの拒否はそのまま知らせる", e is not None and e.code == "T02_API_REJECTED" and "does not exist" in str(e))

core.urllib.request.urlopen = real_urlopen
print("\n" + ("ALL PASSED" if not FAILS else f"{len(FAILS)} FAILED: {FAILS}"))
sys.exit(1 if FAILS else 0)
