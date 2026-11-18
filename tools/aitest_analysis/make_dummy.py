"""分析の流れを確かめるための架空データ（DUMMY-）を作る。実験データではない。
  python make_dummy.py --out dummy --n 16 --seed 7
"""
from __future__ import annotations

import argparse
import csv
import json
import random
from pathlib import Path

E1 = {"busy": "「気をつかわず」は、準備の手間を見せず、すべてこちらで用意することとして整えます。",
      "milestone": "「特別すぎず」は、前菜から主菜まで、少しだけコース仕立てにすることとして整えます。"}
E2 = {"busy": "今回は食卓を少し特別に整えることを優先して、いつもより一品多くして、器も少し良いものにします。",
      "milestone": "今回は節目らしさを形に残すことを優先して、食後に二人で写真を一枚撮る時間をつくります。"}
CORRECT = {"e1": "準備を全部やってほしいという意味ではなく、一緒に台所に立ちたいです。",
           "e2": "器や品数を増やすより、いつも通りの気楽さを優先してほしいです。"}
PLAIN = {"e1": "テーブルでは並んで座って、テレビを見ながらつまむ感じがいい。",
         "e2": "最初に温かいスープ、そのあと好きなものをつまんで、最後に甘いもので締めたい。"}


def clip(x, lo, hi):
    return max(lo, min(hi, x))


def make(out: Path, n: int, seed: int) -> None:
    rnd = random.Random(seed)
    (out / "json").mkdir(parents=True, exist_ok=True)
    coding, tobii = [], []
    pid = 0
    for cond in ("UI_A", "UI_B"):
        for _ in range(n):
            pid += 1
            p = f"DUMMY-{pid:02d}"
            sc = rnd.choice(["busy", "milestone"])
            pc = 0.35 if cond == "UI_A" else 0.6  # 修正する確率（架空の効果）
            e1, e2 = int(rnd.random() < pc), int(rnd.random() < pc)
            rounds = []
            for t in range(1, 7):
                txt = f"第{t}回の入力（架空）"
                if t == 4:
                    txt = CORRECT["e1"] if e1 else PLAIN["e1"]
                if t == 5:
                    txt = CORRECT["e2"] if e2 else PLAIN["e2"]
                meta = {"validationStatus": "passed", "requiredControlSentence": E1[sc] if t == 3 else E2[sc] if t == 4 else None}
                if t in (3, 4):
                    meta["eventTarget"] = {"buttonState": rnd.choice(["self", "self", "consult", "ai"]) if cond == "UI_B" else None}
                rounds.append({"turn": t, "userText": txt, "aiText": "（架空の回答）", "aiMeta": meta})
            base = 3.0 if cond == "UI_A" else 3.6
            refl = {"rounds": [{"turn": t, "reflected": 4, "partialUptake": clip(round(rnd.gauss(3, 1)), 1, 5),
                                "proxyPriority": clip(round(rnd.gauss(3.2 if t == 4 else 2.5, 1)), 1, 5),
                                "easyNext": 3, "needRevision": 3} for t in (2, 3, 4, 6)],
                    "understanding": clip(round(rnd.gauss(base + 0.3, 0.9)), 1, 5),
                    "noticeGap": clip(round(rnd.gauss(base, 0.9)), 1, 5),
                    "nextInput": clip(round(rnd.gauss(base, 0.9)), 1, 5),
                    "delegationBoundary": clip(round(rnd.gauss(base - 0.2, 1.0)), 1, 5)}
            events = []
            if cond == "UI_B":
                events += [{"type": "delegation_changed"}] * rnd.randint(0, 5) + [{"type": "example_generated"}] * rnd.randint(0, 3)
            s = {"participantId": p, "sessionId": f"{p}-session", "condition": cond, "experimentVariant": "generic_unranked",
                 "pretaskAnchor": {"scenarioId": sc}, "rounds": rounds, "reflection": refl, "events": events}
            (out / "json" / f"{p}.json").write_text(json.dumps(s, ensure_ascii=False, indent=1), encoding="utf-8")
            # 2人目のコーダーは 1割ほど判断が分かれる
            c2 = lambda v: v if rnd.random() > 0.1 else 1 - v
            coding.append({"participant_id": p, "e1_coder1": e1, "e1_coder2": c2(e1), "e2_coder1": e2, "e2_coder2": c2(e2),
                           "e1_final": e1, "e2_final": e2})
            for t in (4, 5):
                mu = 3.0 if cond == "UI_A" else 4.2
                tobii.append({"participant_id": p, "turn": t, "aoi": "panel", "visit_count": max(0, round(rnd.gauss(mu, 1.4)))})
                tobii.append({"participant_id": p, "turn": t, "aoi": "answer", "visit_count": max(1, round(rnd.gauss(5, 1.5)))})
    for name, rows in (("coding.csv", coding), ("tobii_metrics.csv", tobii)):
        with (out / name).open("w", encoding="utf-8-sig", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
    print(f"架空データ：{2 * n}名 → {out}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="dummy")
    ap.add_argument("--n", type=int, default=16)
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    make(Path(a.out), a.n, a.seed)
