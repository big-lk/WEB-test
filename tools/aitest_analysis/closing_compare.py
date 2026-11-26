"""回答の末尾の 3 方式（fixed / personal / gap）を、同じ入力で並べて比べる。

  python tools/aitest_analysis/closing_compare.py                 # オフライン版（生成AIなし。末尾は登録した型）
  python tools/aitest_analysis/closing_compare.py --engine online # オンライン版（環境変数 OPENAI_API_KEY が必要。実際の生成文で比べる）
  オプション：--md out.md  --json out.json

入力は決まった台本（下の SCRIPTS）で、回答に応じて変えない。人が読んで自然かどうかは、出力の表を読んで判断する。
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

SCRIPTS = {
    "A_短い入力（TEST-01）": {
        "anchor": {"scenarioId": "busy", "scenarioLabel": "相手は最近忙しく、少し疲れている", "freeText": "疲れている友達が、気を使わずにくつろげる夜にしたい"},
        "inputs": ["友達がほっとして、笑って帰れる夜にしたい", "あと、料理は簡単なものでいい", "食事中はテレビをみながらだらだら話したい",
                   "ちょっと違います。鍋をつつきながら笑っている感じです", "それは優先しなくていいです。普通に食べて、食後はお茶で",
                   "大事なのは気楽に笑えること。特別な演出はやめたい。"]},
    "B_くわしく書く人": {
        "anchor": {"scenarioId": "reunion", "scenarioLabel": "久しぶりに二人でゆっくり会う", "freeText": "学生時代の友人と、昔みたいに遠慮なく話せて、帰りにまた来月も会おうと言える夜にしたい"},
        "inputs": ["お互い仕事の話ばかりにならないように、昔よく行った定食屋みたいな気取らない雰囲気にしたいです。",
                   "それと、相手はお酒を飲まないので、飲み物で気を遣わせないようにしたいです。料理は二人で取り分けられるものがいいです。",
                   "食事中は、昔の写真を見ながら、あの頃の失敗談を笑って話したいです。沈黙があっても気まずくない感じがいいです。",
                   "それは少し違って、準備を全部こちらで済ませるより、最後の仕上げは二人で台所に立つくらいがちょうどいいです。",
                   "食べ始めは軽いつまみから、主菜は取り分けながらゆっくり、食後は温かいお茶で長く話す流れがいいです。",
                   "遠慮しないこと、また会いたくなることを大切にしたいです。かしこまった演出は避けたいです。"]},
    "C_ことばが少ない人": {
        "anchor": {"scenarioId": "gratitude", "scenarioLabel": "普段言えていない感謝を自然に伝えたい", "freeText": "母にありがとうを言いたい"},
        "inputs": ["落ち着いた感じ", "和食がいい", "静かに話したい", "うーん、普通でいいです", "ゆっくり食べたい", "無理しないこと"]},
}
MODES = ("fixed", "personal", "gap")


def tail(text: str, mode: str) -> str:
    sentences = [x.strip() for x in re.split(r"(?<=[。！？?\n])", text.rstrip()) if x.strip()]
    return "".join(sentences[-2:] if mode == "gap" else sentences[-1:])


def run(engine: str) -> list[dict]:
    from api.aitest import core
    results = []
    for name, script in SCRIPTS.items():
        for mode in MODES:
            history, rounds = [], []
            for turn, text in enumerate(script["inputs"], 1):
                body = {"sessionId": f"SIMTEST-closing-{mode}", "condition": "UI_A", "experimentVariant": "generic_unranked", "turn": turn,
                        "userText": text, "history": list(history), "pretaskAnchor": script["anchor"], "delegation": {},
                        "delegationSourceCriteria": [], "previousCriteria": rounds[-1]["analysis"]["criteria"] if rounds else [],
                        "closingMode": mode}
                if engine == "offline":
                    body["engine"] = "offline"
                result = core.run_two_ais(body)
                rounds.append({"turn": turn, "userText": text, "aiText": result["dialogue"], "analysis": result["analysis"], "aiMeta": result["meta"]})
                history += [{"role": "user", "content": text}, {"role": "assistant", "content": result["dialogue"]}]
            results.append({"script": name, "mode": mode, "rounds": rounds})
    return results


def to_markdown(results: list[dict], engine: str) -> str:
    out = [f"# 回答の末尾の比較（{engine}）\n"]
    by = {(r["script"], r["mode"]): r for r in results}
    for name in SCRIPTS:
        out.append(f"\n## {name}\n")
        for turn in range(1, 6):
            out.append(f"**第{turn}回の入力**：{SCRIPTS[name]['inputs'][turn - 1]}\n")
            for mode in MODES:
                rnd = by[(name, mode)]["rounds"][turn - 1]
                mark = "（固定に回退）" if rnd["aiMeta"].get("closingFallback") else ""
                out.append(f"- {mode}{mark}：{tail(rnd['aiText'], mode)}")
            out.append("")
    out.append("\n## 集計\n\n| 方式 | 回退 | 回答の平均字数 | 末尾が前の回と同じ言い回しで始まる回数 |\n|---|---|---|---|")
    for mode in MODES:
        rows = [rnd for r in results if r["mode"] == mode for rnd in r["rounds"][:5]]
        fallback = sum(bool(x["aiMeta"].get("closingFallback")) for x in rows)
        mean = round(sum(len(x["aiText"]) for x in rows) / len(rows))
        same = 0
        for r in results:
            if r["mode"] != mode:
                continue
            starts = [tail(x["aiText"], "fixed")[:6] for x in r["rounds"][:5]]
            same += sum(a == b for a, b in zip(starts, starts[1:]))
        out.append(f"| {mode} | {fallback}/{len(rows)} | {mean} | {same} |")
    return "\n".join(out) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--engine", choices=["offline", "online"], default="offline")
    ap.add_argument("--md")
    ap.add_argument("--json")
    args = ap.parse_args()
    results = run(args.engine)
    md = to_markdown(results, args.engine)
    sys.stdout.write(md)
    if args.md:
        Path(args.md).write_text(md, encoding="utf-8")
    if args.json:
        Path(args.json).write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
