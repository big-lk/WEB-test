"""オフライン版の自動品質チェック（replay の結果に対して）。
Q01 同じ回答の中で同じ文が2回出る          Q02 同じ参加者に、前の回と同じ文を再び出す
Q03 参加者が「なし」とした項目・料理を、後の回で肯定的に出す（刺激文と「はなし／やめ／入れません」の文を除く）
Q04 訂正された刺激（E1/E2）が後の回の回答に残る   Q05 第6回の参加者の強調した型が最終回答に入っていない
Q06 カードが3件でない・idの重複・第2回以降にidが変わる   Q07 関わり方の指定に応答していない
Q08 回答の中に参加者を代弁する「私は」等   Q09 刺激文が第2文になっていない（第3・4回）
Q10 オンライン版の検証コード（dialogue/analysis）"""
from __future__ import annotations
import re, sys, collections
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from api.aitest import offline_corpus as C  # noqa: E402
from api.aitest.offline_engine import analyze, sentences  # noqa: E402

SAFE = re.compile(r"なし|やめ|入れません|しません|替え|控え|置かない|取りやめ|使わ")


def check_session(row, res):
    issues = []
    add = lambda k, code, msg: issues.append((k, code, msg))
    seen_prev = []
    neg_items, neg_dishes = set(), set()
    e_texts = {}
    ids_t2 = None
    for k, r in enumerate(res, start=1):
        text = r["dialogue"]
        tr = r["meta"]["offlineTrace"]
        req = r["meta"]["requiredControlSentence"] or ""
        ss = [s.strip() for s in sentences(text)]
        dup = [s for s, n in collections.Counter(ss).items() if n > 1]
        if dup:
            add(k, "Q01", dup[0])
        for s in ss:
            if s in seen_prev and s not in C.FILLERS.get(k, []) and len(s) > 12:
                add(k, "Q02", s)
        for s in ss:
            if s == req or SAFE.search(s):
                continue
            cur = row["inputs"][k - 1]
            for it in neg_items | neg_dishes:
                if it == "デザート" and re.search(r"デザート|アイス|プリン|ケーキ", cur) and it not in analyze(cur).items_neg:
                    continue
                if it in cur and it not in analyze(cur).items_neg and it not in analyze(cur).dishes_neg:
                    continue
                if it in s and not (k >= 6 and s.startswith("料理は") and it not in neg_dishes):
                    add(k, "Q03", f"{it} :: {s}")
        if k in (3, 4) and req:
            e_texts[k] = req
            if len(ss) < 2 or ss[1] != req:
                add(k, "Q09", ss[:2])
        e1, e2 = tr.get("e1"), tr.get("e2")
        if e1 and e1["correctedAt"] and k > e1["correctedAt"] and e_texts.get(3) and e_texts[3] in text:
            add(k, "Q04", "E1 残存")
        if e2 and e2["correctedAt"] and k > e2["correctedAt"] and e_texts.get(4) and e_texts[4] in text:
            add(k, "Q04", "E2 残存")
        cards = r["analysis"]["criteria"]
        ids = [c["id"] for c in cards]
        if len(cards) != 3 or len(set(ids)) != 3:
            add(k, "Q06", ids)
        if k == 2:
            ids_t2 = ids
        elif k > 2 and ids_t2 and ids != ids_t2:
            add(k, "Q06", f"id変化 {ids_t2}->{ids}")
        f = analyze(row["inputs"][k - 1])
        if f.delegations and not any(x in text for x, _, _ in f.delegations) and "「" not in text:
            add(k, "Q07", f.delegations)
        if re.search(r"(^|。)(私は|わたしは|自分は)", text):
            add(k, "Q08", text[:40])
        if k == 6:
            want = [t for t in f.tags if t not in ("NO_STAGING", "NO_GLOOM")][:2]
            for t in want:
                group = C.CASUAL_CLUSTER if t in C.CASUAL_CLUSTER else {t}
                if not any(C.TAGS[g]["final"] in text for g in group):
                    add(k, "Q05", t)
        for c in tr["dialogueCodes"] + tr["analysisCodes"]:
            add(k, "Q10", c)
        seen_prev += ss
        neg_items |= set(f.items_neg)
        neg_dishes |= {d for d in f.dishes_neg}
    return issues


if __name__ == "__main__":
    import argparse, json
    from replay import load, run_session  # noqa: E402
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", nargs="+", default=[str(ROOT / "tools/offline/data/sim_inputs.tsv")])
    ap.add_argument("--variants", nargs="+", default=["generic_unranked", "generic_embedded", "mixed_e1explicit", "mixed_e1content"])
    ap.add_argument("-v", action="store_true")
    a = ap.parse_args()
    tally, n = collections.Counter(), 0
    for path in a.data:
        for row in load(path):
            for v in a.variants:
                for cond in ("UI_A", "UI_B"):
                    res = run_session(row, v, cond, sid=f"{row['id']}-{v}-{cond}")
                    n += 1
                    for k, code, msg in check_session(row, res):
                        tally[code] += 1
                        if a.v:
                            print(f"{row['id']} {v} {cond} T{k} {code} {msg}")
    print(f"sessions={n}", dict(sorted(tally.items())) or "clean")
