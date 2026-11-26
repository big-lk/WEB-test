"""AI の回答とカードの「自動で判定できる項目」をセッション JSON から数える。

  python quality_check.py SESSION.json [SESSION2.json ...] [--md out.md]

基準は claude.ai プロジェクトの「第二実験_AI応答_改善基準と達成度評価」に対応する。
ここで出すのは機械的に数えられる項目だけで、自然さ・共創感・刺激の成立などは盲評が必要。
標準ライブラリだけで動く。日本語の分かち書きはせず、文字 2-gram の重なりで近さを測る。
"""
from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
from pathlib import Path

# api/aitest/core.py の設定と同じ値（変えたらここも合わせる）
LENGTH_TARGET = {1: (220, 360), 2: (220, 360), 3: (240, 380), 4: (240, 380), 5: (140, 230), 6: (180, 300)}
FIXED_ENDINGS = {
    1: "次は、この目標と同時に大切にしたい別の気持ちや雰囲気を一つ加えてください。",
    2: "次は、食事中の会話や距離感など、料理以外でどんな時間にしたいかを書いてください。",
    3: "次は、この案の食卓で二人がどう過ごしているとよいかを書いてください。",
    4: "次は、食べ始めから食後まで、二人にとって自然な流れを書いてください。",
    5: "最後に、この夕食で大切にしたいことや避けたいことを、自分の言葉でまとめてください。",
}
MEANING_MAX, TITLE_MAX = 84, 18          # 新しい配置で本文 3 行以内
CARD_SAME = 0.34                          # カード同士の 2-gram Jaccard がこれ以上なら「ほぼ同じ文」。
                                          # 言い換えによる同義（例：くつろげる／ほっとできる）は文字の重なりでは拾えないので、C1 は盲評で判定する
CORRECTION = re.compile(r"違|ではなく|じゃなく|いらない|要らない|しなくていい|やめ|なくていい|ではありません|優先しなくて")
CONCRETE = re.compile(r"[ァ-ヶー]{3,}|[一-龥]{2,}[ァ-ヶー]{2,}|[ァ-ヶー]{2,}[一-龥]{2,}")


def grams(text: str) -> set[str]:
    t = re.sub(r"[\s、。「」『』“”\"'（）()・：:！？!?]", "", text or "")
    return {t[i:i + 2] for i in range(len(t) - 1)}


def jaccard(a: str, b: str) -> float:
    ga, gb = grams(a), grams(b)
    return len(ga & gb) / len(ga | gb) if ga and gb else 0.0


def sentences(text: str) -> list[str]:
    return [s for s in re.split(r"(?<=[。！？])", (text or "").replace("\n", "")) if s.strip()]


def content_words(text: str) -> set[str]:
    """利用者の入力から、具体物を表しそうな語（カタカナ 2 字以上・漢字 2 字以上）を拾う。"""
    return set(re.findall(r"[ァ-ヶー]{2,}|[一-龥]{2,}", text or ""))


def check(session: dict) -> dict:
    rounds = [r for r in session.get("rounds", []) if r.get("aiText")]
    out: dict = {"session": session.get("sessionId"), "condition": session.get("condition"),
                 "variant": session.get("experimentVariant"), "engine": (session.get("aiModels") or {}).get("engine"),
                 "layout": (session.get("environment") or {}).get("layoutVariant", "default"), "turns": []}
    prev_closing, seen_concrete, negated_at, user_words = "", {}, {}, set()
    for r in rounds:
        t, ai, user = r["turn"], r["aiText"], r.get("userText", "")
        sents = sentences(ai)
        closing = sents[-1] if sents else ""
        lo, hi = LENGTH_TARGET.get(t, (0, 10 ** 6))
        cards = (r.get("analysis") or {}).get("criteria", [])
        pair = max((jaccard(a["title"] + a["meaning"], b["title"] + b["meaning"])
                    for i, a in enumerate(cards) for b in cards[i + 1:]), default=0.0)
        required = (r.get("aiMeta") or {}).get("requiredControlSentence")
        example = r.get("exampleText") or ""
        own = user.replace(example, "") if example and example in user else user
        # 具体物：回答に出た語を覚えておき、利用者が否定した後にまた出たら候補として挙げる
        user_words |= set(CONCRETE.findall(user))
        concrete_now = {w for w in CONCRETE.findall(ai) if w not in user_words}   # 利用者自身が使った語は対象外
        stale = sorted(w for w in concrete_now if w in negated_at and negated_at[w] < t)
        if CORRECTION.search(user):
            for w, first in seen_concrete.items():
                if w not in user and first < t and w not in concrete_now:
                    negated_at.setdefault(w, t)   # 修正の回で回答から消えた具体物＝置き換えられたとみなす
        for w in concrete_now:
            seen_concrete.setdefault(w, t)
        out["turns"].append({
            "turn": t, "aiLength": len(ai), "lengthOk": lo <= len(ai) <= hi, "lengthTarget": f"{lo}-{hi}",
            "closing": closing, "closingIsFixed": closing.strip() == FIXED_ENDINGS.get(t, "\0"),
            "closingVsPrevious": round(jaccard(closing, prev_closing), 2) if prev_closing else None,
            "cardMaxOverlap": round(pair, 2), "cardLiteralDuplicate": pair >= CARD_SAME,
            "cardTooLong": [c["id"] for c in cards if len(c["meaning"]) > MEANING_MAX or len(c["title"]) > TITLE_MAX],
            "stimulusVerbatim": (required in ai and ai.index(required) + len(required) <= 200) if required else None,
            "userLength": len(user), "userOwnLength": len(own.strip()), "usedExampleVerbatim": bool(example and example in user),
            "staleAfterCorrection": stale, "analysisFallback": bool((r.get("aiMeta") or {}).get("analysisFallback")),
            "closingMode": (r.get("aiMeta") or {}).get("closingMode", "fixed"),
            "closingFallback": bool((r.get("aiMeta") or {}).get("closingFallback")),
        })
        prev_closing = closing
    # 利用者が書いた語が、最後のカードに残っているか（撤回した語も含むので、目安として読む）
    if rounds:
        said = set().union(*(content_words(r.get("userText", "")) for r in rounds))
        last_cards = (rounds[-1].get("analysis") or {}).get("criteria", [])
        final = "".join(c["title"] + c["meaning"] for c in last_cards)
        kept = {w for w in said if w in final}
        out["coverage"] = {"said": len(said), "kept": len(kept), "ratio": round(len(kept) / len(said), 2) if said else None,
                           "missing": sorted(said - kept)}
        # 同じ id のカードが別の内容に入れ替わった回数（カードの意味のずれ）
        drift, before = 0, {}
        for r in rounds:
            for c in (r.get("analysis") or {}).get("criteria", []):
                if c["id"] in before and jaccard(before[c["id"]], c["title"]) < 0.2:
                    drift += 1
                before[c["id"]] = c["title"]
        out["cardIdentityChanges"] = drift
    turns = out["turns"]
    own_lengths = [x["userOwnLength"] for x in turns]
    out["summary"] = {
        "R3_lengthOk": f"{sum(x['lengthOk'] for x in turns)}/{len(turns)}",
        "R4_fixedClosings": f"{sum(x['closingIsFixed'] for x in turns)}/{len([x for x in turns if x['turn'] in FIXED_ENDINGS])}",
        "R2_staleCandidates": sum(len(x["staleAfterCorrection"]) for x in turns),
        "C1_literalDuplicateTurns": sum(x["cardLiteralDuplicate"] for x in turns),
        "C6_tooLongCards": sum(len(x["cardTooLong"]) for x in turns),
        "S3_stimulusVerbatim": f"{sum(1 for x in turns if x['stimulusVerbatim'])}/{sum(1 for x in turns if x['stimulusVerbatim'] is not None)}",
        "G3_medianOwnInput": statistics.median(own_lengths) if own_lengths else None,
        "exampleVerbatim": sum(x["usedExampleVerbatim"] for x in turns),
        "analysisFallbacks": sum(x["analysisFallback"] for x in turns),
        "closingFallbacks": f"{sum(x['closingFallback'] for x in turns)}/{sum(1 for x in turns if x['closingMode'] == 'personal')}",
        "C5_coverage": (out.get("coverage") or {}).get("ratio"),
        "cardIdentityChanges": out.get("cardIdentityChanges"),
    }
    # 自動で付けられる得点（0〜2）。残りの項目は盲評で付ける
    s = out["summary"]
    n_len = sum(not x["lengthOk"] for x in turns)
    n_fixed = sum(x["closingIsFixed"] for x in turns)
    cov = s["C5_coverage"] or 0
    out["autoScore"] = {
        "R3": 2 if n_len == 0 else 1 if n_len == 1 else 0,
        "R4": 0 if n_fixed >= 2 else 1 if n_fixed == 1 else 2,
        "C5_rough": 2 if cov >= 0.8 else 1 if cov >= 0.6 else 0,   # 語の一致による目安。最終判定は盲評
    }
    # R2 は候補を挙げるだけ（一般的な語も混ざる）。矛盾かどうかは人が確かめる
    out["veto"] = {"S3_stimulus": s["S3_stimulusVerbatim"].split("/")[0] == s["S3_stimulusVerbatim"].split("/")[1],
                   "R2_candidatesToReview": s["R2_staleCandidates"]}
    return out


def to_markdown(results: list[dict]) -> str:
    keys = ["R3_lengthOk", "R4_fixedClosings", "R2_staleCandidates", "C1_literalDuplicateTurns", "C6_tooLongCards", "S3_stimulusVerbatim",
            "G3_medianOwnInput", "exampleVerbatim", "C5_coverage", "cardIdentityChanges", "analysisFallbacks", "closingFallbacks"]
    lines = ["| session | UI | layout | " + " | ".join(keys) + " | auto R3/R4/C5 |", "|" + "---|" * (len(keys) + 4)]
    for r in results:
        a = r["autoScore"]
        lines.append(f"| {r['session']} | {r['condition']} | {r['layout']} | " + " | ".join(str(r["summary"][k]) for k in keys)
                     + f" | {a['R3']}/{a['R4']}/{a['C5_rough']} |")
    return "\n".join(lines) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("sessions", nargs="+")
    ap.add_argument("--md")
    ap.add_argument("--json")
    args = ap.parse_args()
    results = [check(json.loads(Path(p).read_text(encoding="utf-8"))) for p in args.sessions]
    md = to_markdown(results)
    sys.stdout.write(md)
    for r in results:
        for x in r["turns"]:
            flags = [k for k in ("closingIsFixed", "cardLiteralDuplicate") if x[k]] + ([] if x["lengthOk"] else [f"length {x['aiLength']} not in {x['lengthTarget']}"])
            if x["staleAfterCorrection"]:
                flags.append("check (reappeared after a correction): " + "、".join(x["staleAfterCorrection"]))
            sys.stdout.write(f"  {r['session']} T{x['turn']}: " + ("; ".join(flags) or "ok") + "\n")
    if args.md:
        Path(args.md).write_text(md, encoding="utf-8")
    if args.json:
        Path(args.json).write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
