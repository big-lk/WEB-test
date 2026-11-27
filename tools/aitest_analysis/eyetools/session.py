"""実験アプリ（aitest v5 系、session schema v8）の完全ログ JSON を読み、検証し、TOI を作る。

TOI の定義（分析計画書 第7節）
- 読解区間 reading(k):  第 k-1 回の AI 回答が表示された時刻 → 第 k 回で入力欄に初めてフォーカスした時刻
- 入力区間 composing(k): 第 k 回で入力欄に初めてフォーカスした時刻 → 送信した時刻
k = 2..6（第1回の前には AI 回答がない）。

パッチ適用後のログ（events に "ai_visible" がある）では、ローディング表示が消えた後の
時刻を読解区間の始点として優先する。
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

MAX_TURNS = 6
EXPECTED_SCHEMA = {8}  # ログ強化パッチ適用版は session.loggingPatch を持つ
# 正式実験に使う刺激の候補。計画書の記載は「通常のずれ設定」（standard）、検討中の案は generic_unranked。
# どちらにするかは未決（使用者と相談中）なので、両方を受け付け、決まったら --variant で 1 つに固定して確かめる。
# 1 つのデータセットに 2 種類が混ざった場合は batch がエラーにする。
FORMAL_VARIANTS = {"standard", "generic_unranked"}


def parse_ts(value: str | None) -> float | None:
    """ISO 8601 文字列 → UNIX 秒（float）。None はそのまま。"""
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()


@dataclass
class Issue:
    level: str  # "error" | "warn"
    code: str
    message: str
    turn: int | None = None

    def as_row(self) -> dict[str, Any]:
        return {"level": self.level, "code": self.code, "turn": self.turn, "message": self.message}


@dataclass
class TOI:
    turn: int
    kind: str  # "reading" | "composing"
    start: float
    end: float
    start_source: str

    @property
    def duration(self) -> float:
        return self.end - self.start


@dataclass
class Session:
    raw: dict[str, Any]
    path: Path | None = None
    issues: list[Issue] = field(default_factory=list)

    @property
    def participant(self) -> str:
        return str(self.raw.get("participantId", ""))

    @property
    def condition(self) -> str:
        return str(self.raw.get("condition", ""))

    @property
    def rounds(self) -> list[dict[str, Any]]:
        return self.raw.get("rounds", [])

    @property
    def events(self) -> list[dict[str, Any]]:
        return self.raw.get("events", [])

    def events_of(self, kind: str) -> list[dict[str, Any]]:
        return [e for e in self.events if e.get("type") == kind]


def load_session(path: str | Path) -> Session:
    path = Path(path)
    return Session(json.loads(path.read_text(encoding="utf-8-sig")), path)


def session_layout(session: Session) -> str:
    """画面の配置（default / side / flow）。古いログには記録がないので default とみなす。"""
    env = session.raw.get("environment") or {}
    if env.get("layoutVariant"):
        return str(env["layoutVariant"])
    for e in session.events_of("aoi_layout"):
        if e.get("layout"):
            return str(e["layout"])
    return "default"


# 各回の meta に残る設定。正式データでは、参加者の中でも参加者の間でも同じでなければならない。
# （例：Vercel の環境変数 EXPERIMENT_ANALYSIS_PROMPT が外れると、分析AI の指示文が黙って v1 に戻る。ここで気づけるようにする）
SETTING_KEYS = ("dialogueModel", "analysisModel", "analysisPrompt", "closingMode", "inviteMode", "lengthMode", "dialogueStyle")


def session_settings(session: Session) -> dict[str, str]:
    """刺激・配置と、各回の meta に残った設定。回によって違う場合は "a/b" の形で並べる。記録がなければ "-"。"""
    out = {"variant": str(session.raw.get("experimentVariant")), "layout": session_layout(session)}
    for key in SETTING_KEYS:
        vals = []
        for r in session.rounds:
            if key == "closingMode" and (r.get("turn") or 0) >= MAX_TURNS:
                continue  # 最終回は、どの方式でも固定の終止文（"fixed"）になる
            v = (r.get("aiMeta") or {}).get(key)
            if v not in (None, ""):
                vals.append(str(v))
        out[key] = "/".join(dict.fromkeys(vals)) or "-"
    return out


def is_test_id(pid: str) -> bool:
    return str(pid).upper().startswith(("SIMTEST", "PREVIEW", "TEST"))


# ---------------------------------------------------------------- 検証

REQUIRED_ROUND_TS = ["promptShownAt", "inputFirstFocusAt", "sendClickAt", "aiDisplayedAt"]


def validate(session: Session, expected_variant: str | None = None) -> list[Issue]:
    s = session.raw
    issues: list[Issue] = []
    add = lambda lvl, code, msg, turn=None: issues.append(Issue(lvl, code, msg, turn))

    if s.get("version") not in EXPECTED_SCHEMA:
        add("warn", "S01_SCHEMA", f"session schema version {s.get('version')} は想定外（{sorted(EXPECTED_SCHEMA)}）")
    if s.get("condition") not in {"UI_A", "UI_B"}:
        add("error", "S02_CONDITION", f"condition={s.get('condition')!r}")
    if str(s.get("participantId", "")).upper().startswith(("SIMTEST", "PREVIEW", "TEST")):
        add("warn", "S03_TEST_ID", "テスト用の参加者番号です。本データに混ぜないでください")
    variant = s.get("experimentVariant")
    if expected_variant and variant != expected_variant:
        add("error", "S04_VARIANT", f"experimentVariant={variant!r}（指定は {expected_variant!r}）")
    elif not expected_variant and variant not in FORMAL_VARIANTS:
        add("error", "S04_VARIANT", f"experimentVariant={variant!r}（正式実験の候補は {sorted(FORMAL_VARIANTS)}）")
    env = s.get("environment", {})
    if env.get("viewportWidth") != 1920 or env.get("viewportHeight") != 1080:
        add("warn", "S05_VIEWPORT", f"viewport {env.get('viewportWidth')}x{env.get('viewportHeight')}（全画面 1920x1080 でない）")
    if env.get("pixelRatio") not in (1, 1.0):
        add("warn", "S06_DPR", f"devicePixelRatio={env.get('pixelRatio')}（表示倍率 100% でない可能性）")
    if s.get("status") not in {"complete", "reflection", "debrief", "finished"}:
        add("error", "S07_INCOMPLETE", f"status={s.get('status')!r}（6回が完了していない）")

    rounds = s.get("rounds", [])
    if len(rounds) != MAX_TURNS:
        add("error", "S08_ROUND_COUNT", f"rounds={len(rounds)}")
    for r in rounds:
        t = r.get("turn")
        for key in REQUIRED_ROUND_TS:
            if not r.get(key):
                add("error", "R01_MISSING_TS", f"{key} がない", t)
        if not r.get("userText"):
            add("error", "R02_NO_USER_TEXT", "入力文がない", t)
        if not r.get("aiText"):
            add("error", "R03_NO_AI_TEXT", "AI回答がない", t)
        an = r.get("analysis") or {}
        if len(an.get("criteria", [])) != 3:
            add("warn", "R04_CARD_COUNT", f"カード数 {len(an.get('criteria', []))}", t)
        if r.get("errors"):
            add("warn", "R05_API_ERRORS", f"API エラー {len(r['errors'])} 件（再送で回復）", t)
        # 時刻順
        seq = [("promptShownAt", r.get("promptShownAt")), ("inputFirstFocusAt", r.get("inputFirstFocusAt")),
               ("sendClickAt", r.get("sendClickAt")), ("aiDisplayedAt", r.get("aiDisplayedAt"))]
        vals = [(k, parse_ts(v)) for k, v in seq if v]
        for (k1, v1), (k2, v2) in zip(vals, vals[1:]):
            if v2 < v1:
                add("error", "R06_ORDER", f"{k2} < {k1}", t)
        fk, fo = parse_ts(r.get("firstKeystrokeAt")), parse_ts(r.get("inputFirstFocusAt"))
        if fk and fo and fk < fo:
            add("warn", "R07_KEY_BEFORE_FOCUS", "最初のキー入力がフォーカスより前", t)
        if r.get("aiMeta", {}) and r["aiMeta"].get("validationStatus") not in (None, "", "passed", "ok", "PASS", "pass"):
            add("warn", "R08_VALIDATION", f"validationStatus={r['aiMeta'].get('validationStatus')}", t)
    # 回をまたぐ順序：前回の表示 ≤ 今回の初回フォーカス
    for prev, cur in zip(rounds, rounds[1:]):
        a, b = parse_ts(prev.get("aiDisplayedAt")), parse_ts(cur.get("inputFirstFocusAt"))
        if a and b and b < a:
            add("error", "R09_FOCUS_BEFORE_DISPLAY", "入力欄フォーカスが前回 AI 回答の表示より前（生成中にクリック）", cur.get("turn"))
    # 第3・4回の操作条件（サーバーの controlEvent）
    for t in (3, 4):
        if len(rounds) >= t and not rounds[t - 1].get("controlEvent"):
            add("warn", "R10_NO_CONTROL_EVENT", "controlEvent がない（ずれ条件を事後に確認できない）", t)
    # 設定が回の途中で変わっていないか、試験用の切り替えが正式データに入っていないか
    changed = {k: v for k, v in session_settings(session).items() if "/" in v}
    if changed:
        add("warn", "S12_SETTING_CHANGED", "回によって設定が違う：" + "、".join(f"{k}={v}" for k, v in changed.items()))
    for r in rounds:
        meta = r.get("aiMeta") or {}
        if meta.get("modelOverride") and not is_test_id(s.get("participantId", "")):
            add("error", "S13_MODEL_OVERRIDE", f"試験用のモデル切り替えが使われている（{meta.get('dialogueModel')}）", r.get("turn"))
        if meta.get("closingFallback"):
            add("warn", "R11_CLOSING_FALLBACK", "末尾が固定の終止文に戻った", r.get("turn"))
    # スクロール・レイアウト記録（パッチ版のみ）
    if s.get("loggingPatch"):
        if not session.events_of("aoi_layout"):
            add("error", "P01_NO_LAYOUT", "AOI レイアウト記録がない")
    else:
        add("warn", "P02_NO_LAYOUT_LOG", "AOI 座標とスクロールが記録されない版（静的 AOI で近似）")
    if s.get("loggingPatch"):
        vis = {e.get("turn") for e in session.events_of("ai_visible")}
        missing = [t for t in range(1, MAX_TURNS + 1) if t not in vis]
        if missing:
            add("warn", "P03_NO_AI_VISIBLE", f"ai_visible がない回：{missing}")
        if len(session.events_of("pointer_down")) < 4:
            add("warn", "P04_FEW_CLICKS", "クリック記録が少なく、同期の確認が難しい")
    session.issues = issues
    return issues


# ---------------------------------------------------------------- TOI

def build_tois(session: Session, min_reading: float = 0.5, max_reading: float = 180.0) -> list[TOI]:
    rounds = session.rounds
    visible = {e.get("turn"): parse_ts(e.get("at") or e.get("time")) for e in session.events_of("ai_visible")}
    tois: list[TOI] = []
    for k in range(2, MAX_TURNS + 1):
        prev, cur = rounds[k - 2], rounds[k - 1]
        start_src = "ai_visible" if visible.get(k - 1) else "aiDisplayedAt"
        start = visible.get(k - 1) or parse_ts(prev.get("aiDisplayedAt"))
        focus = parse_ts(cur.get("inputFirstFocusAt"))
        send = parse_ts(cur.get("sendClickAt"))
        if start and focus and min_reading <= focus - start <= max_reading:
            tois.append(TOI(k, "reading", start, focus, start_src))
        if focus and send and send > focus:
            tois.append(TOI(k, "composing", focus, send, "inputFirstFocusAt"))
    return tois
