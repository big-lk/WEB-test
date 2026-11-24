"""オフライン応答エンジン（生成AIを呼ばない・完全に再現可能）。

run_offline(body) は core.run_two_ais(body) と同じ形の応答を返す。
- 左側の回答：offline_corpus に登録した文だけを組み立てる。どの文（節点）を使ったかは meta.offlineTrace.nodes に残る。
- 右側のカード：参加者の事前の一文と各回の入力から、登録した「希望の型」を規則で読み取って作る。
- 第3・4回の刺激文：core.generate_generic_stimulus（登録候補から決定的に選ぶ）をそのまま使う。オンライン版と同じ文になる。
- 状態は毎回、送られてきた履歴全体から作り直す（サーバーに状態を持たない）。同じ入力と sessionId なら必ず同じ出力。
"""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field
from typing import Any

from . import core
from . import offline_corpus as C

ENGINE_NAME = "offline-tree"
SUPPORTED_VARIANTS = set(core.UNRANKED_VARIANTS)

SENT_SPLIT = re.compile(r"(?<=[。！!\n])")
LENGTH_TARGET = {1: (150, 330), 2: (130, 330), 3: (150, 360), 4: (150, 360), 5: (102, 220), 6: (150, 340)}
SCENE_FALLBACK = {  # 事前の一文から型が読み取れないときの、場面カード由来の項目
    "busy": ("v-scene", "疲れている相手を気づかうこと", "最近疲れている相手が、無理せず過ごせる夜にしたい。"),
    "reunion": ("v-scene", "久しぶりの時間を楽しむこと", "久しぶりに会う相手と、ゆっくり過ごせる夜にしたい。"),
    "milestone": ("v-scene", "節目をさりげなく祝うこと", "小さな節目を、大げさにせずに祝いたい。"),
    "gratitude": ("v-scene", "日頃の感謝を伝えること", "普段言えていない感謝が、自然に伝わる夜にしたい。"),
}


# ================================================================= 読み取り（規則）
def _compile(p: str) -> re.Pattern:
    return re.compile(p)


TAG_RX = {tag: [(_compile(p), need) for p, need in spec["patterns"]] for tag, spec in C.TAGS.items()}
DISH_RX = [(name, _compile(p), kind) for name, p, kind in C.DISHES]
ITEM_RX = [(name, _compile(p)) for name, p in C.NEG_ITEMS]
DETAIL_RX = [(key, _compile(p), pos, neg) for key, p, pos, neg in C.DETAILS]
FREE_DELEGATION = [
    (re.compile(r"([^\s。、「」『』！!]{1,14}?)(?:は|も)(?:自分で|私が|僕が|俺が|こっちで|自分たちで)(?:決め|やる|考え)"), "USER_DECIDE"),
    (re.compile(r"([^\s。、「」『』！!]{1,14}?)(?:は|も)(?:触らないで|そのままにして|変えないで)"), "USER_DECIDE"),
    (re.compile(r"([^\s。、「」『』！!]{1,14}?)(?:は|も)(?:まあ)?(?:任せ|お任せ|提案して|案を出して)"), "AI_PROPOSE"),
    (re.compile(r"([^\s。、「」『』！!]{1,14}?)(?:は|も)(?:一緒に考え|まだ決めず|相談しながら)"), "CO_DECIDE"),
]
QUOTED_DELEGATION = [
    (re.compile(r"[「『]([^」』]{2,30})[」』](?:は|を)?[^。「」『』]{0,12}(?:自分で決め|自分で決める|変えないで|そのままにして|固定して|触らないで)"), "USER_DECIDE"),
    (re.compile(r"[「『]([^」』]{2,30})[」』](?:は|を)?[^。「」『』]{0,12}(?:案を一つ|案を出して|提案して|決めてください|任せ)"), "AI_PROPOSE"),
    (re.compile(r"[「『]([^」』]{2,30})[」』](?:は|を)?[^。「」『』]{0,12}(?:まだ決めず|考える材料|一緒に考え)"), "CO_DECIDE"),
]


def sentences(text: str) -> list[str]:
    return [s for s in SENT_SPLIT.split(text) if s.strip()]


def prefix_negated(text: str, start: int) -> bool:
    """「避けたいのは、A や B」のように、同じ文の前半で否定してから並べた語か。"""
    head = re.split(r"[。！!\n？?]", text[:start])[-1]
    return any(m in head for m in C.PREFIX_NEG)


def negated(text: str, end: int, window: int = C.NEG_WINDOW, start: int | None = None) -> bool:
    """語の直後（同じ文の中、window 字以内）に否定の手がかりがあり、その前に肯定の言い切りが無ければ否定とみなす。"""
    if start is not None and prefix_negated(text, start):
        return True
    tail = text[end:end + window]
    if re.search(r"(とまでは|とは)(言って|思って|考えて)", re.split(r"[。！!\n？?]", text[end:end + 24])[0]):
        return False  # 「控えるとまでは言ってない」＝その項目を否定したのではない
    if re.match(r"(は|を)?消さな", tail):
        return False
    tail = re.split(r"[。！!\n？?]", tail)[0]
    first_neg = min((tail.find(m) for m in C.NEG_MARKERS if m in tail), default=-1)
    first_pos = min((tail.find(m) for m in C.POS_BREAKERS if m in tail), default=10 ** 6)
    if first_neg >= 0 and first_neg < first_pos:
        return True
    # 並べた語の後ろでまとめて否定する文（「AとBは避けたい」）：同じ文の30字以内の強い否定
    far = re.split(r"[。！!\n？?]", text[end:end + 30])[0]
    strong = min((far.find(m) for m in ("避け", "嫌", "なし", "無し", "いらな", "要らな", "苦手", "やめ") if m in far), default=-1)
    first_pos_far = min((far.find(m) for m in C.POS_BREAKERS if m in far), default=10 ** 6)
    if strong < 0 or strong >= first_pos_far:
        return False
    # 並べた名詞の列（「ケーキもメッセージも写真も」）のあとの否定だけを拾う。動詞や目的語をはさむ場合は別の話とみなす
    between = far[:strong]
    return not re.search(r"を|て、|して|たい|ながら|けど|ので|から", between)


@dataclass
class Features:
    text: str
    tags: list[str] = field(default_factory=list)          # 肯定として数えた型（出現順）
    tag_pos: dict[str, int] = field(default_factory=dict)  # 型 → 最初の位置
    dishes_pos: list[str] = field(default_factory=list)
    dishes_neg: list[str] = field(default_factory=list)
    items_neg: list[str] = field(default_factory=list)
    details: list[tuple[str, bool]] = field(default_factory=list)  # (key, negated)
    correction: bool = False
    delegations: list[tuple[str, str, bool]] = field(default_factory=list)  # (対象, 状態, 引用か)
    detail_m: dict[str, str] = field(default_factory=dict)
    items_allow: dict[str, str] = field(default_factory=dict)  # 条件つきで残す項目 → 量（一輪 など）
    topics_avoid: list[str] = field(default_factory=list)
    emphasis: bool = False

    def summary(self) -> dict[str, Any]:
        return {"tags": self.tags, "dishesPos": self.dishes_pos, "dishesNeg": self.dishes_neg, "itemsNeg": self.items_neg,
                "details": [k + ("-" if n else "+") for k, n in self.details], "correction": self.correction,
                "delegations": [[x, s] for x, s, _ in self.delegations]}


def analyze(text: str) -> Features:
    f = Features(text=text)
    hits: list[tuple[int, str]] = []
    for tag, rxs in TAG_RX.items():
        best = None
        for rx, need in rxs:
            for m in rx.finditer(text):
                neg = negated(text, m.end(), start=m.start())
                if need is None or need == neg:
                    best = m.start() if best is None else min(best, m.start())
                    break
        if best is not None:
            hits.append((best, tag))
    hits.sort()
    f.tags = [t for _, t in hits]
    f.tag_pos = {t: p for p, t in hits}
    for name, rx, _ in DISH_RX:
        for m in rx.finditer(text):
            (f.dishes_neg if negated(text, m.end(), start=m.start()) else f.dishes_pos).append(name)
            break
    known = {n for n, _, _ in C.DISHES}
    for m in re.finditer(C.UNKNOWN_DISH_RX, text):
        w = m.group(1)
        if w in C.NON_FOOD_KATAKANA or w in known or any(w in d or d in w for d in f.dishes_pos + f.dishes_neg):
            continue
        C_KIND.setdefault(w, "homey")
        (f.dishes_neg if negated(text, m.end(1), start=m.start()) else f.dishes_pos).append(w)
    for name, rx in ITEM_RX:
        m = rx.search(text)
        if m and negated(text, m.end(), C.ITEM_WINDOW, start=m.start()) and name not in f.items_neg:
            f.items_neg.append(name)
    if "メッセージカード" in f.items_neg and "メッセージ" in f.items_neg:
        f.items_neg.remove("メッセージ")
    for name, rx in ITEM_RX:
        for m in rx.finditer(text):
            near = re.split(r"[。！!\n？?]", text[m.end():m.end() + 16])[0]
            around = text[max(0, m.start() - 6):m.end() + 16]
            hit = re.search(C.ALLOW_RX, near) or re.search(C.ALLOW_RX_Q, around)
            if hit:
                q = re.search(r"一輪|一言|一つ|少し|小さい|小さな|軽く", text[max(0, m.start() - 6):m.end() + 16])
                f.items_allow[name] = q.group(0) if q else ""
                if name in f.items_neg:
                    f.items_neg.remove(name)
                break
    for m in re.finditer(C.TOPIC_AVOID_RX, text):
        x = m.group(1)
        if x not in ("仕事", "お礼", "感謝", "会") and x not in f.topics_avoid:
            f.topics_avoid.append(x)
    for key, rx, pos, neg in DETAIL_RX:
        m = rx.search(text)
        if m:
            if key in C.DETAIL_POS_RX and re.search(C.DETAIL_POS_RX[key], text):
                negd = False
            elif key in C.DETAIL_NEG_RX:
                negd = bool(re.search(C.DETAIL_NEG_RX[key], text)) or prefix_negated(text, m.start())
            else:
                negd = negated(text, m.end(), start=m.start())
            f.details.append((key, negd))
            f.detail_m[key] = m.group(0)
    if "NO_WORDS" in f.tags and "ONE_WORD_THANKS" in f.tags:
        f.tags.remove("NO_WORDS")
    f.correction = any(m in text for m in C.CORRECTION_MARKERS)
    f.emphasis = bool(re.search(r"一番|最優先|が先|優先したい|大事なのは|大切なのは", text))
    seen: set[str] = set()
    for rx, state in QUOTED_DELEGATION:
        for m in rx.finditer(text):
            if m.group(1) not in seen:
                f.delegations.append((m.group(1), state, True))
                seen.add(m.group(1))
    for rx, state in FREE_DELEGATION:
        for m in rx.finditer(text):
            x = re.sub(r"^(あと|でも|ただ|それと|なので|まあ|あ|で)", "", m.group(1)).strip()
            if x in ("そこ", "それ", "ここ", "これ", "あれ", "そっち", "こっち"):
                continue
            if len(x) >= 2 and x not in seen and not any(x in q for q in seen):
                f.delegations.append((x, state, False))
                seen.add(x)
    return f


def event_touched(text: str, keys: list[str]) -> bool:
    """登録刺激の語に触れ、かつその文か前後の文に否定・訂正がある（＝参加者が直した）か。
    例：「ちょっと違う。全部用意して座らせとくと…」は、訂正（前の文）＋刺激の語（次の文）で直したとみなす。"""
    ss = sentences(text)
    flag = [any(m in s for m in C.CORRECTION_MARKERS) or any(m in s for m in C.NEG_MARKERS) for s in ss]
    for i, s in enumerate(ss):
        if any(k in s for k in keys) and any(flag[j] for j in (i - 1, i, i + 1) if 0 <= j < len(ss)):
            return True
    return False


# ================================================================= 決定的な選択
class Picker:
    def __init__(self, session_id: str, used_text: str):
        self.sid = session_id
        self.used = used_text
        self.nodes: list[str] = []
        self.covered: set[str] = set()
        self.dish: str | None = None
        self.acked: set[str] = set()

    def pick(self, node: str, pool: list[str]) -> str:
        fresh = [i for i, s in enumerate(pool) if s not in self.used] or list(range(len(pool)))
        h = int(hashlib.sha256(f"{self.sid}|{node}".encode()).hexdigest(), 16)
        i = fresh[h % len(fresh)]
        self.nodes.append(f"{node}#{i}")
        return pool[i]

    def fresh(self, pool: list[str]) -> bool:
        return any(s not in self.used for s in pool)

    def note(self, node: str) -> None:
        self.nodes.append(node)


def compact_len(text: str) -> int:
    return len(re.sub(r"\s+", "", text))


# ================================================================= 状態（毎回、履歴から作り直す）
@dataclass
class Card:
    id: str
    tag: str | None
    title: str
    meaning: str
    source: str
    evidence: list[int]
    delegation: str = "CO_DECIDE"
    priority: str = "維持"
    event: str | None = None  # "E1" / "E2" / None

    def as_dict(self, focus: bool) -> dict[str, Any]:
        return {"id": self.id, "title": self.title[:18], "meaning": self.meaning[:100], "priority": self.priority,
                "delegationState": self.delegation, "source": self.source,
                "evidenceTurns": sorted(set(self.evidence)) or [0], "focus": focus}


def tag_card(tag: str, source: str, evidence: list[int]) -> Card:
    spec = C.TAGS[tag]
    return Card(id="v-" + tag.lower().replace("_", "-"), tag=tag, title=spec["title"], meaning=spec["meaning"],
                source=source, evidence=list(evidence))


@dataclass
class State:
    scenario: str
    variant: str
    anchor: Features
    turns: list[Features]
    cards: list[Card] = field(default_factory=list)
    focus: str | None = None
    e1: dict[str, Any] | None = None   # {"sentence", "parts", "generic", "corrected_at"}
    e2: dict[str, Any] | None = None
    proposed_dish: str | None = None
    dish_sentence: str | None = None
    mentions: dict[str, list[int]] = field(default_factory=dict)
    neg_items: list[str] = field(default_factory=list)
    dishes_ok: list[str] = field(default_factory=list)
    dishes_ng: list[str] = field(default_factory=list)
    details_hist: dict[str, tuple[bool, str, int]] = field(default_factory=dict)
    allowed: dict[str, str] = field(default_factory=dict)
    topics_avoid: list[str] = field(default_factory=list)
    sweets: list[str] = field(default_factory=list)


def scenario_tag(scenario: str, anchor: Features) -> str | None:
    for t in C.ANCHOR_TAG_ORDER[scenario]:
        if t in anchor.tags:
            return t
    return None


def choose_dish(scenario: str, tags: set[str]) -> tuple[str, str]:
    for need, scen, name, sentence in C.DISH_PROPOSALS:
        if (scen is None or scen == scenario) and (not need or need & tags):
            return name, sentence
    return "家庭料理", C.DISH_PROPOSALS[-1][3]


def build_state(scenario: str, variant: str, anchor_text: str, user_texts: list[str],
                history: list[dict[str, str]]) -> State:
    """第1回〜最新回までの入力から、カード・刺激・料理の状態を作る。"""
    anchor = analyze(anchor_text)
    st = State(scenario=scenario, variant=variant, anchor=anchor, turns=[analyze(t) for t in user_texts])
    for t in anchor.tags:
        st.mentions.setdefault(t, []).append(0)
    anchor_full = {"scenarioId": scenario, "scenarioLabel": core.SCENARIOS[scenario], "freeText": anchor_text}
    for k, f in enumerate(st.turns, start=1):
        for t in f.tags:
            st.mentions.setdefault(t, []).append(k)
        for it in f.items_neg:
            if it in st.neg_items:
                st.neg_items.remove(it)
            st.neg_items.append(it)
        for d in f.dishes_neg:
            st.dishes_ng.append(d)
            if d in st.dishes_ok:
                st.dishes_ok.remove(d)
        for d in f.dishes_pos:
            if d not in st.dishes_ok and C_KIND.get(d) not in ("drink", "takeout", "sweet"):
                st.dishes_ok.append(d)
            if C_KIND.get(d) == "sweet" and d not in st.sweets and d != "デザート":
                st.sweets.append(d)
        for d in f.dishes_neg:
            if d in st.sweets:
                st.sweets.remove(d)
        for key, negd in f.details:
            st.details_hist[key] = (negd, f.detail_m.get(key, ""), k)
        for it, q in f.items_allow.items():
            st.allowed[it] = q
            if it in st.neg_items:
                st.neg_items.remove(it)
        for it in f.items_neg:
            st.allowed.pop(it, None)
        for x in f.topics_avoid:
            if x not in st.topics_avoid:
                st.topics_avoid.append(x)
        if k == 1:
            _cards_turn1(st)
            st.proposed_dish, st.dish_sentence = choose_dish(scenario, set(anchor.tags) | set(f.tags))
        elif k == 2:
            _cards_turn2(st)
        if k == 3:
            sentence, info = core.generate_generic_stimulus(3, variant, anchor_full, history[:4], user_texts[2])
            parts = info.get("parts", {})
            st.e1 = {"sentence": sentence, "parts": parts, "generic": parts.get("generic", ""), "corrected_at": None}
            _apply_e1(st)
        if k == 4:
            if st.e1 and _e1_corrected(st, f):
                _restore(st, "E1", k, f)
            sentence, info = core.generate_generic_stimulus(4, variant, anchor_full, history[:6], user_texts[3])
            parts = info.get("parts", {})
            st.e2 = {"sentence": sentence, "parts": parts, "preferred": parts.get("preferred", ""), "corrected_at": None}
            _apply_e2(st)
        if k >= 5:
            if st.e1 and st.e1["corrected_at"] is None and _e1_corrected(st, f):
                _restore(st, "E1", k, f)
            if st.e2 and st.e2["corrected_at"] is None and _e2_corrected(st, f):
                _restore(st, "E2", k, f)
            _refocus(st, f, k)
        for c in st.cards:
            if c.tag and c.tag in f.tags and c.event is None:
                c.evidence.append(k)
        _apply_text_delegation(st, f)
    return st


C_KIND = {name: kind for name, _, kind in C.DISHES}


def _cards_turn1(st: State) -> None:
    f1 = st.turns[0]
    main = scenario_tag(st.scenario, st.anchor) or scenario_tag(st.scenario, f1)
    cards: list[Card] = []
    if main:
        cards.append(tag_card(main, "PRETASK_ANCHOR" if main in st.anchor.tags else "USER_TURN", st.mentions.get(main, [1])))
    else:
        cid, title, meaning = SCENE_FALLBACK[st.scenario]
        cards.append(Card(cid, None, title, meaning, "PRETASK_ANCHOR", [0]))
    order = [t for t in st.anchor.tags + f1.tags if t != main]
    for t in dict.fromkeys(order):
        if len(cards) >= 3:
            break
        if t in ("NO_STAGING",) and len(order) > 3:
            continue
        cards.append(tag_card(t, "PRETASK_ANCHOR" if t in st.anchor.tags else "USER_TURN", st.mentions.get(t, [1])))
    for t in C.ANCHOR_TAG_ORDER[st.scenario] + ["RELAX", "AFTERGLOW", "EVERYDAY"]:
        if len(cards) >= 3:
            break
        if all(c.tag != t for c in cards):
            cards.append(tag_card(t, "AI_INFERENCE", [0]))
    cards[0].priority = "中心"
    st.cards = cards[:3]
    st.focus = st.cards[0].id


def _cards_turn2(st: State) -> None:
    f2 = st.turns[1]
    have = {c.tag for c in st.cards}
    new = [t for t in f2.tags if t not in have]
    if not new:
        return
    t = new[0]
    # 事前の一文のカード（先頭）は残し、裏づけの少ないカードを入れ替える
    victims = sorted(range(1, len(st.cards)), key=lambda i: (st.cards[i].source != "AI_INFERENCE", len(set(st.cards[i].evidence)), -i))
    i = victims[0]
    st.cards[i] = tag_card(t, "USER_TURN", st.mentions.get(t, [2]))
    st.focus = st.cards[i].id


def _apply_e1(st: State) -> None:
    parts = st.e1["parts"]
    c = st.cards[0]
    st.e1["card"] = c.id
    st.e1["previousTitle"] = c.title
    st.e1["orig_tag"] = c.tag
    phrase, generic = parts.get("phrase", ""), parts.get("generic", "").rstrip("。")
    c.title = core.generic_event_title(3, parts)
    c.meaning = ((f"「{phrase}」" if parts.get("quoted", "1") else phrase) + f"を、{generic}として扱う。")[:100]
    c.source, c.event = "AI_INFERENCE", "E1"
    c.evidence = sorted(set(c.evidence + [3]))
    st.focus = c.id


def _apply_e2(st: State) -> None:
    parts = st.e2["parts"]
    preferred, action = parts.get("preferred", "").rstrip("。"), parts.get("action", "").rstrip("。")
    pool = [c for c in st.cards if c.event is None and not (st.e1 and st.e1.get("restored_now") == c.id)] \
        or [c for c in st.cards if c.event != "E1"] or st.cards
    target = max(pool, key=lambda c: (core.text_similarity(c.title + c.meaning, preferred + action), st.cards.index(c)))
    st.e2["card"] = target.id
    st.e2["previousTitle"] = target.title
    st.e2["orig_tag"] = target.tag
    target.title = core.generic_event_title(4, parts)
    target.meaning = f"{preferred}を優先し、{action}。"[:100]
    target.source, target.event, target.priority = "AI_INFERENCE", "E2", "中心"
    target.evidence = sorted(set(target.evidence + [4]))
    for c in st.cards:
        if c is not target and c.priority == "中心":
            c.priority = "維持"
    st.focus = target.id


def _conflict_reasserted(f: Features, conflict: set[str]) -> bool:
    """刺激と食い違う型を、否定・訂正の言い方といっしょに言い直したか（例：「豪華にしたくない。焼き鳥で十分」）。"""
    return bool(conflict & set(f.tags)) and (f.correction or any(m in f.text for m in ("十分", "いい", "で十分", "だけで")))  \
        and any(m in f.text for m in C.CORRECTION_MARKERS + ["避け", "いら", "要ら", "しない", "なし"])


def _e1_corrected(st: State, f: Features) -> bool:
    keys = C.E1.get(st.e1["generic"], {}).get("keys", [])
    if any(any(k in it or it in k for k in keys) for it in st.allowed) and not f.items_allow:
        # 刺激の中身を条件つきで受け入れた参加者（「カードは一言なら」）は、はっきり直したときだけ訂正とみなす
        return event_touched(f.text, [k for k in keys if not any(k in it or it in k for it in st.allowed)])
    return event_touched(f.text, keys) or _conflict_reasserted(f, C.E1_CONFLICT.get(st.e1["generic"], set()))


def _e2_corrected(st: State, f: Features) -> bool:
    keys = C.E2.get(st.e2["preferred"], {}).get("keys", [])
    return event_touched(f.text, keys) or _conflict_reasserted(f, C.E2_CONFLICT.get(st.e2["preferred"], set())) \
        or bool(re.search(r"優先(は|と|って)?(決めて|したく|しません|じゃな|ではな|してな|していま|とは)", f.text)) \
        or bool(re.search(r"より[^。]{0,16}(のほうが|の方が|が)(先|優先|大事|一番)", f.text))


def _restore(st: State, which: str, k: int, f: Features) -> None:
    ev = st.e1 if which == "E1" else st.e2
    ev["corrected_at"] = k
    card = next((c for c in st.cards if c.id == ev.get("card")), None)
    if card is None:
        return
    others = {c.tag for c in st.cards if c is not card}
    choice = next((t for t in sorted(f.tags, key=lambda t: C.TAG_RANK.get(t, 99))
                   if t not in others and t not in ("NO_STAGING",)), None) or ev.get("orig_tag")
    if choice:
        spec = C.TAGS[choice]
        card.tag, card.title, card.meaning = choice, spec["title"], spec["meaning"]
    else:
        cid, title, meaning = SCENE_FALLBACK[st.scenario]
        card.tag, card.title, card.meaning = None, title, meaning
    card.source, card.event = "USER_TURN", None
    card.evidence = sorted(set(card.evidence + [k]))
    if which == "E2":
        card.priority = "中心" if f.emphasis else "維持"
        if card.priority == "中心":
            for c in st.cards:
                if c is not card and c.priority == "中心":
                    c.priority = "維持"
    ev["restored_now"] = card.id
    st.focus = card.id


def _refocus(st: State, f: Features, k: int) -> None:
    if any((ev or {}).get("corrected_at") == k for ev in (st.e1, st.e2)):
        return
    for t in f.tags:
        c = next((c for c in st.cards if c.tag == t and c.event is None), None)
        if c:
            st.focus = c.id
            return


def _match_card(st: State, x: str, quoted: bool) -> Card | None:
    best = max(st.cards, key=lambda c: core.text_similarity(x, c.title))
    score = core.text_similarity(x, best.title)
    if x == best.title or score >= (0.5 if quoted else 0.45):
        return best
    if not quoted:
        hits = analyze(x).tags
        return next((c for c in st.cards if c.tag in hits), None)
    return None


def _apply_text_delegation(st: State, f: Features) -> None:
    for x, state, quoted in f.delegations:
        c = _match_card(st, x, quoted)
        if c:
            c.delegation = state


# ================================================================= 回答の組み立て
def _join_nouns(nouns: list[str]) -> str:
    if len(nouns) == 1:
        return nouns[0]
    if len(nouns) == 2:
        return nouns[0] + "と、" + nouns[1]
    return "、".join(nouns[:-1]) + "、そして" + nouns[-1]


def ack_sentence(p: Picker, turn: int, f: Features, st: State, prev_tags: set[str], allow_two: bool = True,
                 exclude: set[str] = frozenset(), fallback: bool = True) -> str:
    new = [t for t in f.tags if t not in prev_tags and t not in exclude]
    pool = sorted(new or [t for t in f.tags if t not in exclude], key=lambda t: (C.TAG_RANK.get(t, 99), f.tag_pos.get(t, 0)))
    pool = [t for t in pool if t != "NO_STAGING"] or pool
    if allow_two and len(pool) >= 2:
        a, b = pool[0], pool[1]
        s = f"{C.TAGS[a]['noun']}と、{C.TAGS[b]['noun']}を大切にしたいということですね。"
        if s not in p.used:
            p.note(f"T{turn}.ack2.{a}+{b}")
            return s
    for t in pool:  # まだ使っていない言い回しのある型を選ぶ（同じ文の繰り返しを避ける）
        if t in p.acked:
            continue
        if p.fresh(C.TAGS[t]["ack"]):
            p.acked.add(t)
            return p.pick(f"T{turn}.ack.{t}", C.TAGS[t]["ack"])
    if fallback and p.fresh(C.FALLBACK_ACK[turn]):
        return p.pick(f"T{turn}.ack.fallback", C.FALLBACK_ACK[turn])
    p.note(f"T{turn}.ack.none")
    return ""


ECHO_LEAD = re.compile(r"^(あと|あとは|それと|それから|でも|ただ|なので|もう一つは|もう一つ|まあ|えっと|うーん|というか|いや)(、|$)")


ECHO_SUFFIXES = ["でもいい", "てもいい", "せればいい", "ればいい", "たらいい", "といい", "ばいい", "ていい", "でいい", "と思います", "と思ってます", "と思う", "んです", "です", "だな", "かな", "かも", "けど", "よね", "よ", "ね", "な", "し",
                 "がいい", "が良い", "でいい", "で十分", "が一番", "が大事", "も大事", "が大切", "も大切", "にしたい", "がほしい", "が欲しい",
                 "ほしい", "したい", "たい", "感じ", "くらい", "ぐらい", "のが"]
ECHO_OK_END = re.compile(r"([一-龥ァ-ヶー]|る|う|く|す|つ|む|ぶ|ぐ|ぬ|い|た|だ|こと|時間|空気|流れ|距離感)$")


def trim_echo(q: str) -> str:
    """句の末尾の言い回し（〜がいい、〜したいです など）を外し、名詞か言い切りの形で終わる句だけを返す。"""
    changed = True
    while changed and q:
        changed = False
        for suf in ECHO_SUFFIXES:
            if q.endswith(suf) and len(q) > len(suf) + 4:
                q = q[: -len(suf)]
                changed = True
    if q.endswith("いい") or re.search(r"[をにくりっはが][一-龥]$", q) or re.search(r"[一-龥](い|き|し|ち|み|り|び)$", q) and not q.endswith(("たい", "しい", "ない", "らい", "かい", "さい", "ぐらい")):
        return ""  # 動詞の途中で切れた句（「じっくり話」「空気を吸い」）は引用しない
    return q if ECHO_OK_END.search(q) else ""


def echo_sentence(p: Picker, turn: int, f: Features, exclude: set[str] = frozenset()) -> str:
    """参加者の句をそのまま短く引用して受け止める。言い換えによる付け足しを避けるため。"""
    if turn not in C.ECHO:
        return ""
    best, best_score = "", 0
    for raw in re.split(r"[。！!？?\n、]", f.text):
        q = ECHO_LEAD.sub("", raw.strip())
        q = trim_echo(q)
        if not q or not (6 <= len(q) <= 24) or re.search(r"[「」『』？?]|決め|任せ|考える材料", q) \
                or re.match(r"^(は|を|が|に|で|と|も|や)", q):
            continue
        if any(m in q for m in C.NEG_MARKERS + ["違", "待って", "頼ん", "いら", "要ら", "なし", "なく", "たくな", "ないで"]):
            continue
        if any(t in q for t in core.DIALOGUE_FORBIDDEN_TERMS):
            continue
        sub = analyze(q)
        tags = [t for t in sub.tags if t not in exclude and t != "NO_STAGING"]
        if set(sub.tags) & exclude:
            continue
        score = len(tags) * 2 + len(sub.dishes_pos) * 2 + len(sub.details)
        if score > best_score:
            best, best_score = q, score
    if not best:
        return ""
    if re.search(r"(距離感|流れ|時間|雰囲気|場面|過ごし方|大事|大切|一番)$", best) or "大事" in best or "大切" in best:
        p.note(f"T{turn}.echo.plain")
        s = f"「{best}」、いいですね。"
    else:
        s = p.pick(f"T{turn}.echo", C.ECHO[turn]).format(q=best)
    for t in analyze(best).tags:
        p.acked.add(t)
    return s


def negitems_sentence(p: Picker, turn: int, f: Features, skip: set[str] = frozenset()) -> str:
    items = [x for x in f.items_neg if x not in skip and x not in p.covered][:3]
    p.covered.update(items)
    if not items:
        return ""
    p.note(f"T{turn}.neg." + "+".join(items))
    joined = "や".join(items) if len(items) <= 2 else "、".join(items[:-1]) + "や" + items[-1]
    return f"{joined}はなしにします。"


def detail_sentence(p: Picker, turn: int, f: Features, used: str) -> str:
    for key, negd in f.details:
        spec = next(d for d in C.DETAILS if d[0] == key)
        s = spec[3] if negd else spec[2]
        if s and "{m}" in s:
            m = re.search(spec[1], f.text)
            s = s.replace("{m}", m.group(0) if m else "")
        if key == "dessert" and negd and "デザート" in p.covered:
            continue
        if s and s not in used:
            if key == "dessert" and negd:
                p.covered.add("デザート")
            p.note(f"T{turn}.detail.{key}{'-' if negd else '+'}")
            return s
    return ""


def extra_sentences(p: Picker, turn: int, f: Features) -> list[str]:
    out = []
    for it, q in f.items_allow.items():
        if it not in p.covered:
            out.append(f"{it}は{q or '控えめに'}だけにします。")
            p.covered.add(it)
            p.note(f"T{turn}.allow.{it}")
    for x in f.topics_avoid[:1]:
        out.append(C.TOPIC_AVOID_SENT.format(x=x))
        p.note(f"T{turn}.topic")
    return out


def dish_sentence(p: Picker, turn: int, f: Features, st: State, used: str) -> str:
    """料理への短い応答：参加者が挙げた料理を受け取る／取り下げられた料理を替える。"""
    mains_neg = [d for d in f.dishes_neg if C_KIND.get(d) not in ("drink", "sweet")]
    if mains_neg:
        d = mains_neg[0]
        kind = C_KIND.get(d, "homey")
        repl = C.DISH_REPLACEMENTS.get(kind, C.DISH_REPLACEMENTS["homey"])
        if "SIMPLE_FOOD" in f.tags or "NOSTALGIA" in f.tags:
            repl = C.DISH_REPLACEMENTS["casual"]
        alt = next((x for x in f.dishes_pos if C_KIND.get(x) not in ("drink", "sweet", "takeout")), None)
        p.note(f"T{turn}.dish.replace.{d}")
        if alt:
            return f"{d}はやめて、{alt}にします。"
        return f"{d}はやめて、" + repl
    main = [x for x in f.dishes_pos if C_KIND.get(x) not in ("drink", "sweet", "takeout")]
    sweet = next((x for x in f.dishes_pos if C_KIND.get(x) == "sweet" and x != "デザート"), None)
    if sweet and not main:
        p.note(f"T{turn}.dish.sweet")
        s = f"最後に{sweet}を出す形にします。"
        return "" if s in used else s
    if main:
        main.sort(key=lambda d: f.text.find(re.sub(r"\(.*", "", d)) if d in f.text else 99)
        names = "と".join(main[:2])
        p.note(f"T{turn}.dish.accept")
        s = f"料理は{names}を中心にします。"
        return "" if s in used else s
    return ""


def delegation_sentences(p: Picker, turn: int, f: Features, st: State) -> list[str]:
    out = []
    for x, state, quoted in f.delegations[:2]:
        c = _match_card(st, x, quoted)
        label = f"「{c.title}」" if (quoted and c) else (f"「{x}」" if quoted else x)
        if c and c.tag and not c.event:
            propose, viewpoint = C.TAGS[c.tag]["propose"], C.TAGS[c.tag]["viewpoint"]
        elif c and c.event:
            propose, viewpoint = C.EVENT_PROPOSE, C.EVENT_VIEWPOINT
        else:
            tags = analyze(x).tags
            propose = C.TAGS[tags[0]]["propose"] if tags else C.GENERIC_PROPOSE
            viewpoint = C.TAGS[tags[0]]["viewpoint"] if tags else C.GENERIC_VIEWPOINT
        s = C.DELEGATION_REPLY[state].format(x=label, propose=propose, viewpoint=viewpoint)
        if s in p.used or s.split("。")[0] in p.used:  # 同じ指定がくり返されたときは短く受ける
            s = C.DELEGATION_AGAIN[state].format(x=label)
            p.note(f"T{turn}.deleg.{state}.again")
        else:
            p.note(f"T{turn}.deleg.{state}")
        s = "".join(x for x in sentences(s) if x not in p.used and x not in "".join(out))
        if not s:
            s = f"{label}は、先ほどお伝えした形のままにします。"
        out.append(s)
    return out


def correction_sentence(p: Picker, turn: int, which: str, st: State, f: Features, also: str = "") -> str:
    ev = st.e1 if which == "E1" else st.e2
    spec = (C.E1.get(ev["generic"]) if which == "E1" else C.E2.get(ev["preferred"])) or {}
    undo = spec.get("undo", "その形はやめて")
    keys = spec.get("keys", [])
    allowed = [(it, q) for it, q in f.items_allow.items() if any(k in it or it in k for k in keys)]
    if allowed:
        it, q = allowed[0]
        p.note(f"T{turn}.undo.{which}.partial")
        p.covered.add(it)
        return f"{it}は{q or '控えめに'}だけ残して、それ以外は{undo.removesuffix('やめて').rstrip('、') and 'やめます'}。"
    if also:
        undo = f"{also}、{undo}"
    card = next((c for c in st.cards if c.id == ev.get("card")), None)
    p.note(f"T{turn}.undo.{which}")
    p.covered.update(name for name, rx in ITEM_RX if rx.search(undo))
    if card and card.tag and card.tag in f.tags:
        return f"{undo}、{C.TAGS[card.tag]['final']}を中心にします。"
    pos = sorted([t for t in f.tags if t not in ("NO_STAGING",)], key=lambda t: C.TAG_RANK.get(t, 99))
    if pos:
        return f"{undo}、{C.TAGS[pos[0]]['final']}を中心にします。"
    return f"{undo}、{C.CORRECTION_FALLBACK}"


def fit_length(p: Picker, turn: int, head: list[str], tail: list[str], optional: list[str], used: str) -> str:
    """必須の文（head＋tail）に、長さが目標に届くまで任意の文を足す。長すぎるときは任意の文から削る。"""
    lo, hi = LENGTH_TARGET[turn]
    ending = core.TURN_ENDINGS[turn]
    body = [s for s in head if s]
    extras = [s for s in optional if s and s not in body]
    fillers = [s.format(dish=p.dish) for s in C.FILLERS[turn] if p.dish or "{dish}" not in s]
    fillers = [s for s in fillers if s not in used]
    tail = [s for s in tail if s]

    def total(parts: list[str]) -> int:
        return compact_len("".join(parts) + ending)

    chosen = list(body)
    dinner = ["夕食", "料理", "献立", "食事", "味", "食感", "盛り付け", "飲み物", "会話", "食卓", "準備", "雰囲気"]
    for s in extras:
        if total(chosen + [s] + tail) <= hi:
            chosen.append(s)
    if not any(t in "".join(chosen + tail) for t in dinner) and fillers:
        chosen.append(fillers.pop(0))
        p.note(f"T{turn}.filler.dinner")
    n_fill = 0
    while fillers and (total(chosen + tail) < 102 or (total(chosen + tail) < lo and n_fill == 0)):
        s = fillers.pop(0)
        if s.startswith("料理は") and any(x.startswith("料理は") or "料理は" in x for x in chosen):
            continue
        if total(chosen + [s] + tail) <= hi + 20:
            chosen.append(s)
            n_fill += 1
            p.note(f"T{turn}.filler")
    return "".join(chosen + tail) + ending


def compose(turn: int, st: State, sid: str, history: list[dict[str, str]]) -> tuple[str, list[str], str]:
    used = "".join(r["content"] for r in history if r["role"] == "assistant")
    p = Picker(sid, used)
    ok = [d for d in st.dishes_ok if d not in st.dishes_ng and C_KIND.get(d) not in ("drink", "sweet")]
    spec_ok = [d for d in ok if d not in C.DISH_CATEGORIES]
    p.dish = (spec_ok or ok)[-1] if ok else (st.proposed_dish if st.proposed_dish not in st.dishes_ng else None)
    f = st.turns[turn - 1]
    prev_tags = set(st.anchor.tags) | {t for g in st.turns[:turn - 1] for t in g.tags}
    required = ""
    deleg = delegation_sentences(p, turn, f, st)

    if turn == 1:
        head = [p.pick("T1.open." + st.scenario, C.OPENINGS[st.scenario]),
                ack_sentence(p, 1, f, st, set(), allow_two=True)]
        p.note("T1.dish." + (st.proposed_dish or ""))
        head += deleg
        holds = C.HOLD_OPEN[1] + (C.HOLD_OPEN["1g"] if st.scenario in ("gratitude", "milestone") else [])
        optional = [st.dish_sentence or "", detail_sentence(p, 1, f, used), p.pick("T1.hold", holds)]
        text = fit_length(p, 1, head, [], optional, used)
    elif turn == 2:
        main_card = st.cards[0]
        new = [t for t in f.tags if t not in prev_tags]
        a = C.TAGS[main_card.tag]["noun"] if main_card.tag else main_card.title
        b_tag = next((t for t in new if t != main_card.tag), None) or next((t for t in f.tags if t != main_card.tag), None)
        echo = echo_sentence(p, 2, f)
        if b_tag and echo:
            head = [echo, p.pick("T2.integrate.short", C.INTEGRATE_SHORT).format(a=a)]
        elif b_tag:
            head = [p.pick("T2.integrate", C.INTEGRATE).format(a=a, b=C.TAGS[b_tag]["noun"])]
            rest = [t for t in new if t not in (b_tag, main_card.tag, "NO_STAGING")]
            if rest:
                head.append(p.pick(f"T2.ack.{rest[0]}", C.TAGS[rest[0]]["ack"]))
        else:
            head = [ack_sentence(p, 2, f, st, prev_tags, allow_two=False)]
        head += deleg
        optional = extra_sentences(p, 2, f) + [negitems_sentence(p, 2, f), dish_sentence(p, 2, f, st, used) or detail_sentence(p, 2, f, used),
                            p.pick("T2.hold", C.HOLD_OPEN[2] if b_tag else C.HOLD_OPEN["2n"])]
        text = fit_length(p, 2, head, [], optional, used)
    elif turn == 3:
        required = st.e1["sentence"]
        p.note("T3.E1." + st.e1["generic"][:12])
        ex = C.E1_CONFLICT.get(st.e1["generic"], set())
        first = negitems_sentence(p, 3, f) if (f.items_neg and not [t for t in f.tags if t not in ex]) \
            else (echo_sentence(p, 3, f, ex) or ack_sentence(p, 3, f, st, prev_tags, allow_two=False, exclude=ex, fallback=False))
        if not first:
            first = dish_sentence(p, 3, f, st, used) or detail_sentence(p, 3, f, used) or p.pick("T3.ack.fallback", C.FALLBACK_ACK[3])
        follow = C.E1.get(st.e1["generic"], {}).get("follow", "")
        p.note("T3.E1.follow")
        optional = extra_sentences(p, 3, f) + [detail_sentence(p, 3, f, used), dish_sentence(p, 3, f, st, used),
                                               ack_sentence(p, 3, f, st, prev_tags, allow_two=False, exclude=ex, fallback=False)]
        text = fit_length(p, 3, [first, required, follow] + deleg, [], optional, used)
    elif turn == 4:
        required = st.e2["sentence"]
        p.note("T4.E2." + st.e2["preferred"])
        if st.e1 and st.e1["corrected_at"] == 4:
            first = correction_sentence(p, 4, "E1", st, f)
        elif f.items_neg:
            first = negitems_sentence(p, 4, f)
        else:
            ex4 = C.E2_CONFLICT.get(st.e2["preferred"], set())
            first = echo_sentence(p, 4, f, ex4) or ack_sentence(p, 4, f, st, prev_tags, allow_two=False, exclude=ex4, fallback=False)
            if not first:
                first = dish_sentence(p, 4, f, st, used) or detail_sentence(p, 4, f, used) or p.pick("T4.ack.fallback", C.FALLBACK_ACK[4])
        follow = C.E2.get(st.e2["preferred"], {}).get("follow", "")
        p.note("T4.E2.follow")
        optional = extra_sentences(p, 4, f) + [dish_sentence(p, 4, f, st, used), detail_sentence(p, 4, f, used), negitems_sentence(p, 4, f),
                                               ack_sentence(p, 4, f, st, prev_tags, allow_two=False, fallback=False,
                                                            exclude=C.E2_CONFLICT.get(st.e2["preferred"], set()))]
        text = fit_length(p, 4, [first, required, follow] + deleg, [], optional, used)
    elif turn == 5:
        head = []
        both = st.e2 and st.e2["corrected_at"] == 5 and st.e1 and st.e1["corrected_at"] == 5
        if both:
            u1 = (C.E1.get(st.e1["generic"]) or {}).get("undo", "")
            head.append(correction_sentence(p, 5, "E2", st, f, also=u1))
        elif st.e2 and st.e2["corrected_at"] == 5:
            head.append(correction_sentence(p, 5, "E2", st, f))
        elif st.e1 and st.e1["corrected_at"] == 5:
            head.append(correction_sentence(p, 5, "E1", st, f))
        neg = negitems_sentence(p, 5, f)
        if neg:
            head.append(neg)
        head += deleg
        change = dish_sentence(p, 5, f, st, used) or detail_sentence(p, 5, f, used)
        centered = {t for t in f.tags if any(C.TAGS[t]["final"] in h for h in head)}
        ack = ack_sentence(p, 5, f, st, prev_tags, allow_two=False, exclude=centered | {"NO_STAGING"}, fallback=False) if f.tags else ""
        echo = echo_sentence(p, 5, f)
        optional = ([echo] if echo else []) + extra_sentences(p, 5, f) + [x for x in (change, ack) if x and not (echo and x is ack)]
        if not head and not optional:
            head.append(p.pick("T5.accept", C.ACCEPT_GENERAL))
        text = fit_length(p, 5, head, [], optional, used)
    else:
        text = compose_final(p, st, f, deleg, used)
    return text, p.nodes, required


def compose_final(p: Picker, st: State, f: Features, deleg: list[str], used: str) -> str:
    lead = p.pick("T6.lead", C.FINAL_LEAD)
    dishes = [d for d in st.dishes_ok if d not in st.dishes_ng]
    dishes = [d for d in dishes if d not in C.DISH_CATEGORIES] or dishes
    for g in reversed(st.turns):  # いちばん最近に料理を挙げた回の料理を優先する
        recent = [d for d in g.dishes_pos if d in dishes]
        if recent:
            dishes = recent
            break
    takeout = st.details_hist.get("takeout")
    if takeout and not takeout[0]:
        dish = f"料理は作らずに、{takeout[1]}で済ませます。"
    elif dishes:
        dish = f"料理は、{'と'.join(dishes[-2:])}でまとめます。"
    elif st.proposed_dish and st.proposed_dish not in st.dishes_ng:
        name = {"家ごはん": "普段の家ごはん", "家庭料理": "相手の好きな家庭料理"}.get(st.proposed_dish, st.proposed_dish)
        dish = f"料理は、{name}でまとめます。"
    else:
        dish = "料理は普段の家ごはんに近いものにします。"
    if st.sweets:
        dish += f"最後に{st.sweets[-1]}を出します。"
    p.note("T6.dish")
    # 最後の回で参加者が書いた型を先に、次にカードの型（刺激のまま残っているカードは除く）
    order = list(f.tags) + [c.tag for c in st.cards if c.event is None and c.tag]
    finals, casual = [], 0
    for t in order:
        if not t or t in ("NO_STAGING", "NO_GLOOM") or C.TAGS[t]["final"] in finals:
            continue
        if t in C.CASUAL_CLUSTER:
            if casual >= 1:
                continue
            casual += 1
        finals.append(C.TAGS[t]["final"])
    values = f"過ごし方は、{_join_nouns(finals[:3])}を大切にします。" if finals else ""
    p.note("T6.values")
    specs = []
    for key, (negd, m, k) in sorted(st.details_hist.items(), key=lambda kv: -kv[1][2]):
        phrase = C.DETAIL_FINAL.get((key, negd))
        if phrase:
            specs.append(phrase.replace("{m}", m))
    for it, q in st.allowed.items():
        specs.insert(0, f"{it}は{q or '控えめに'}だけにすること")
    for x in st.topics_avoid[:1]:
        specs.append(C.TOPIC_AVOID_FINAL.format(x=x))
    specific = f"当日の形としては、{_join_nouns(specs[:3])}にします。" if specs else ""
    if specific:
        p.note("T6.specific")
    kept = []
    if st.e1 and st.e1["corrected_at"] is None:
        e1s = core.EMBEDDED_E1_SENTENCES.get(st.e1["generic"], st.e1["generic"].removesuffix("こと") + "ようにします。")
        kept.append(e1s if re.match(r"^[^、。]{1,8}は、", e1s) else "当日は、" + e1s)
        p.note("T6.keepE1")
    if st.e2 and st.e2["corrected_at"] is None:
        act = st.e2["parts"].get("action", "").rstrip("。") + "。"
        kept.append(("また、" if kept else ("" if re.match(r"^[^、。]{1,8}は、", act) else "当日は、")) + act)
        p.note("T6.keepE2")
    kept_text = "".join(kept)
    avoid = ""
    items = [x for x in st.neg_items if x not in kept_text][-3:]
    if items:
        avoid = ("や".join(items) if len(items) <= 2 else "、".join(items[:-1]) + "や" + items[-1]) + "は入れません。"
        p.note("T6.avoid")
    # 長さの上限を超える場合は、避ける項目→具体の順に削る（刺激の保持と料理・価値は残す）
    parts = [lead, dish, values] + kept + deleg
    optional = [specific, avoid]
    return fit_length(p, 6, parts, [], optional, used)


# ================================================================= 公開関数
def run_offline(body: dict[str, Any]) -> dict[str, Any]:
    (turn, user_text, history, delegation, source_criteria, condition, session_id, anchor,
     variant) = core.validate_request_body(body)
    if variant not in SUPPORTED_VARIANTS:
        raise core.ExperimentError("OFF01_VARIANT_UNSUPPORTED",
                                   f"オフライン版が対応する刺激は {sorted(SUPPORTED_VARIANTS)} です。", status=400)
    user_texts = [r["content"] for r in history if r["role"] == "user"] + [user_text]
    st = build_state(anchor["scenarioId"], variant, anchor["freeText"], user_texts, history)
    text, nodes, required = compose(turn, st, session_id, history)
    text = core.ensure_exact_turn_ending(turn, text)
    codes = core.dialogue_validation_codes(turn, text, anchor["freeText"], user_text, experiment_variant=variant,
                                           scenario_id=anchor["scenarioId"], required_sentence=required)
    criteria = [c.as_dict(c.id == st.focus) for c in st.cards]
    if sum(c["focus"] for c in criteria) != 1:
        for i, c in enumerate(criteria):
            c["focus"] = i == 0
    finals = [C.TAGS[c.tag]["final"] for c in st.cards if c.tag and c.event is None][:2]
    summary = (_join_nouns(finals) + "を大切にした夕食。") if finals else core.SCENARIOS[anchor["scenarioId"]] + "相手との夕食。"
    analysis = {"summary": summary, "criteria": criteria}
    a_codes = core.parse_analysis(json.dumps(analysis, ensure_ascii=False), turn, "")[1]

    event_target = None
    if turn in (3, 4):
        ev = st.e1 if turn == 3 else st.e2
        card = next((c for c in criteria if c["id"] == ev.get("card")), None)
        if card:
            event_target = {"id": card["id"], "title": card["title"], "previousTitle": ev.get("previousTitle"),
                            "replacedExistingCard": True,
                            "buttonState": delegation.get(card["id"], "consult") if condition == "UI_B" else None,
                            "analysisFallback": False}
    later_texts = user_texts[4:]
    gen_info = None
    if turn in (3, 4):
        ev = st.e1 if turn == 3 else st.e2
        gen_info = {"variant": variant, "method": "registered_candidates", "parts": ev["parts"], "source": "generated"}
    return {
        "dialogue": text,
        "analysis": analysis,
        "stateMetadata": {
            "turnId": turn, "controlEvent": core.CONTROL_EVENTS[turn],
            "usedAnchorId": anchor["scenarioId"] if turn in {2, 3, 4} else None,
            "responseFlags": {"askedDirectValueQuestion": False, "offeredForcedChoice": False, "obviousError": False,
                              "strongAmbiguityStimulus": False},
            "experimentVariant": variant, "ambiguityTableScenario": None,
        },
        "meta": {
            "engine": ENGINE_NAME, "corpusVersion": C.CORPUS_VERSION,
            "dialogueModel": ENGINE_NAME, "analysisModel": ENGINE_NAME,
            "dialogueResponseId": None, "analysisResponseId": None,
            "dialogueLatencyMs": 0, "analysisLatencyMs": 0, "dialogueAttempts": [], "analysisAttempts": [],
            "promptVersion": core.PROMPT_VERSION, "sessionSchemaVersion": core.SESSION_SCHEMA_VERSION,
            "controlEvent": core.CONTROL_EVENTS[turn], "experimentVariant": variant,
            "validationStatus": "passed" if not codes and not a_codes else "offline_flagged",
            "analysisFallback": False, "analysisError": None, "analysisRepairs": [], "idReconciliation": [],
            "eventDelegation": None, "eventTarget": event_target, "genericStimulus": gen_info,
            "eventCardMode": "merge", "panelLock": False,
            "finalRelationInserted": bool(turn == 6 and st.e2 and st.e2["corrected_at"] is None),
            "delegationFromText": [f"{x}={s}" for x, s, _ in st.turns[-1].delegations],
            "requiredControlSentence": required or None,
            "offlineTrace": {
                "nodes": nodes,
                "features": st.turns[-1].summary(),
                "anchorTags": st.anchor.tags,
                "e1": {"generic": st.e1["generic"], "correctedAt": st.e1["corrected_at"]} if st.e1 else None,
                "e2": {"preferred": st.e2["preferred"], "correctedAt": st.e2["corrected_at"]} if st.e2 else None,
                "dialogueCodes": codes, "analysisCodes": a_codes,
                "inputHash": hashlib.sha256(json.dumps([session_id, anchor, user_texts, variant], ensure_ascii=False)
                                            .encode()).hexdigest()[:16],
            },
        },
    }
