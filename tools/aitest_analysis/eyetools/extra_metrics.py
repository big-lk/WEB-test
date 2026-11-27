"""読解区間ごとの追加の視線指標（記述・探索用。分析計画の主要指標ではない）。

読解区間 k（第 k−1 回の回答が表示されてから、第 k 回の入力を始めるまで）について：
  target_card            … 第 k−1 回の分析で focus=true だったカードの位置（1〜3）。第3・4回の事象カードはここに入る
  target_dwell_s         … そのカードの本文（TEXT_n。古いログでは CARD_n）への注視時間の合計
  others_mean_dwell_s    … ほかの 2 枚の本文への注視時間の平均
  target_minus_others_s  … 上の差（正なら、焦点のカードを他より長く見ている）
  target_first_fix_s     … 区間の開始から、そのカードの本文を最初に見るまでの秒（見ていなければ空）
  target_visits          … そのカードの本文への訪問回数（続けて見た分は 1 回）
  gaze_sequence          … 注視の並びを記号にしたもの（A=最新の回答、H=履歴、P1〜P3=カード本文、B1〜B3=ボタン、E=例文、I=入力欄、G=案内）
  saw_target             … そのカードの本文を合計 SAW_MIN_S 秒以上見たか
  said_target            … 続く第 k 回の入力が、そのカードの内容に触れたか（下の規則による機械的な判定。**人の確認が必要**）
  said_kind              … "corrects"（否定・修正の言い回しがある）/ "mentions"（カードの語を使っている）/ ""
  saw_said               … "saw+said" / "saw+silent" / "unseen+said" / "unseen+silent"
"""
from __future__ import annotations

import re

import pandas as pd

SAW_MIN_S = 0.2
CORRECTION = re.compile(r"違|ちが|ではなく|じゃなく|しなくて|なくていい|いらない|要らない|不要|やめ|そうではな|それより")
TOKEN = {"AI_LATEST": "A", "ANSWER": "A", "HISTORY": "H", "INPUT": "I", "GUIDE": "G", "HELP": "G", "EXAMPLE_TEXT": "E", "EXAMPLE": "E"}


def _token(aoi: str) -> str:
    m = re.fullmatch(r"(CARD|TEXT|BTN)_(\d)", aoi)
    if m:
        return ("B" if m.group(1) == "BTN" else "P") + m.group(2)
    return TOKEN.get(aoi, "")


def _mentions(card_text: str, user_text: str, earlier_user_text: str) -> bool:
    """カードの文面にあって、それ以前の参加者の発話には無かった 3 字以上の語（漢字・カタカナを含む）を、入力が使っているか。"""
    compact = re.sub(r"[\s、。「」『』（）()・]", "", card_text)
    for i in range(len(compact) - 2):
        piece = compact[i:i + 3]
        if re.search(r"[゠-ヿ一-鿿]", piece) and piece in user_text and piece not in earlier_user_text:
            return True
    return False


def reading_extras(session, fix_aoi: pd.DataFrame, toi, to_tobii) -> dict:
    k = toi.turn
    rounds = session.rounds
    prev, cur = rounds[k - 2], rounds[k - 1]
    cards = (prev.get("analysis") or {}).get("criteria") or []
    target = next((i + 1 for i, c in enumerate(cards) if c.get("focus")), None)
    start, end = to_tobii(toi.start), to_tobii(toi.end)
    w = fix_aoi[(fix_aoi.start >= start) & (fix_aoi.start < end)].sort_values("start")
    dur = (w.end - w.start).clip(lower=0)
    tokens = [_token(a) for a in w.aoi]
    dwell = {n: float(dur[[t == f"P{n}" for t in tokens]].sum()) for n in (1, 2, 3)}
    seq: list[str] = []
    for t in tokens:
        if t and (not seq or seq[-1] != t):
            seq.append(t)
    out = {"target_card": target, "gaze_sequence": ">".join(seq[:80]), "card_dwell_1": dwell[1], "card_dwell_2": dwell[2], "card_dwell_3": dwell[3]}
    if target is None:
        return out
    others = [dwell[n] for n in (1, 2, 3) if n != target]
    hits = w[[t == f"P{target}" for t in tokens]]
    user_text = cur.get("userText") or ""
    earlier = "".join((r.get("userText") or "") for r in rounds[: k - 1]) + str((session.raw.get("pretaskAnchor") or {}).get("freeText", ""))
    card = cards[target - 1]
    kind = "corrects" if CORRECTION.search(user_text) else (
        "mentions" if _mentions(str(card.get("title", "")) + str(card.get("meaning", "")), user_text, earlier) else "")
    saw = dwell[target] >= SAW_MIN_S
    out.update({
        "target_dwell_s": dwell[target], "others_mean_dwell_s": sum(others) / len(others),
        "target_minus_others_s": dwell[target] - sum(others) / len(others),
        "target_first_fix_s": float(hits.start.min() - start) if len(hits) else None,
        "target_visits": sum(1 for i, t in enumerate(seq) if t == f"P{target}"),
        "saw_target": saw, "said_target": bool(kind), "said_kind": kind,
        "saw_said": ("saw" if saw else "unseen") + "+" + ("said" if kind else "silent"),
    })
    return out
