"""オフライン版の一括再生テスト：参加者の入力（TSV）を 6 回分順に送り、検証コードと全文を出す。
python tools/offline/replay.py [--variant generic_unranked] [--show ID] [--json out.json]"""
from __future__ import annotations
import argparse, json, sys, collections
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from api.aitest.offline_engine import run_offline  # noqa: E402


def load(path):
    rows = []
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        c = line.split("\t")
        rows.append({"id": c[0], "condition": c[1], "scenario": c[2], "anchor": c[3], "inputs": c[4:10]})
    return rows


def run_session(row, variant, cond=None, sid=None):
    history, out = [], []
    criteria_prev = []
    for k, text in enumerate(row["inputs"], start=1):
        body = {"sessionId": sid or f"{row['id']}-{variant}", "condition": cond or row["condition"], "experimentVariant": variant,
                "turn": k, "userText": text, "history": history,
                "pretaskAnchor": {"scenarioId": row["scenario"], "freeText": row["anchor"]},
                "delegation": {}, "delegationSourceCriteria": [], "previousCriteria": criteria_prev}
        res = run_offline(body)
        out.append(res)
        history = history + [{"role": "user", "content": text}, {"role": "assistant", "content": res["dialogue"]}]
        criteria_prev = res["analysis"]["criteria"]
    return out


def show(row, res):
    print(f"\n######## {row['id']} {row['scenario']} 事前：{row['anchor']}")
    for k, (t, r) in enumerate(zip(row["inputs"], res), start=1):
        tr = r["meta"]["offlineTrace"]
        print(f"\n--- 第{k}回 参加者：{t}")
        print(f"AI：{r['dialogue']}")
        print("カード：" + " / ".join(f"[{c['id']}{'*' if c['focus'] else ''}{c['priority']}] {c['title']}：{c['meaning']}" for c in r["analysis"]["criteria"]))
        print(f"codes={tr['dialogueCodes']}{tr['analysisCodes']} feats={tr['features']['tags']} neg={tr['features']['itemsNeg']} e1={tr['e1']} e2={tr['e2']}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=str(ROOT / "tools/offline/data/sim_inputs.tsv"))
    ap.add_argument("--variant", default="generic_unranked")
    ap.add_argument("--show", nargs="*", default=[])
    ap.add_argument("--json")
    a = ap.parse_args()
    rows = load(a.data)
    tally = collections.Counter()
    lens = collections.defaultdict(list)
    dump = []
    for row in rows:
        res = run_session(row, a.variant)
        for k, r in enumerate(res, start=1):
            tr = r["meta"]["offlineTrace"]
            for c in tr["dialogueCodes"] + tr["analysisCodes"]:
                tally[f"T{k}:{c}"] += 1
            lens[k].append(len(r["dialogue"]))
        if row["id"] in a.show or "all" in a.show:
            show(row, res)
        dump.append({"row": row, "res": res})
    print("\n== codes", dict(tally) or "none")
    print("== length min/avg/max", {k: (min(v), sum(v) // len(v), max(v)) for k, v in lens.items()})
    if a.json:
        Path(a.json).write_text(json.dumps(dump, ensure_ascii=False, indent=1), encoding="utf-8")
