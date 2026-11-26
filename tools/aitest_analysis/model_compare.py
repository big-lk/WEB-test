"""同じ台本を複数のモデルで走らせて比べる（実際の API を呼ぶ。料金がかかる）。

  python tools/aitest_analysis/model_compare.py --check      # 接続確認だけ：各モデルで第1回を1度（数円未満）
  python tools/aitest_analysis/model_compare.py              # 台本3本 × 6回 × 各モデル
  オプション：--models gpt-6-luna,claude-haiku-5-5  --scripts A,B,C  --turns 6  --closing fixed|personal|gap  --out DIR

鍵は環境変数 OPENAI_API_KEY / ANTHROPIC_API_KEY から読む。リポジトリ直下の .env（コミットされない）に
  OPENAI_API_KEY=...
  ANTHROPIC_API_KEY=...
と書いておいてもよい。鍵の値は表示も保存もしない。鍵がないモデルは飛ばす。
出力（既定 output/model_compare/、コミットされない）：モデル×台本ごとの記録 JSON、まとめ summary.md、回答の全文 replies.md。
入力は決まった台本で、回答に応じて変えない。自然さは replies.md を人が読んで判断する。
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(Path(__file__).resolve().parent))

# 標準料金（USD / 100万トークン：入力, 出力）。2026-11-27 に各社の料金ページで確認。
PRICES = {"gpt-6-luna": (0.10, 0.50), "claude-haiku-5-5": (0.10, 0.50), "gpt-6.1-terra": (1.00, 5.00)}


def load_env_file() -> None:
    path = ROOT / ".env"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.replace("export ", "").strip()
        if key and not os.environ.get(key):
            os.environ[key] = value.strip().strip('"').strip("'")


def run_one(core, model: str, name: str, script: dict, turns: int, closing: str) -> dict:
    session_id = f"SIMTEST-model-{name[:1]}-{model}"
    history, rounds, error = [], [], None
    for turn, text in enumerate(script["inputs"][:turns], 1):
        body = {"sessionId": session_id, "condition": "UI_A", "experimentVariant": "generic_unranked", "turn": turn,
                "userText": text, "history": list(history), "pretaskAnchor": script["anchor"], "delegation": {},
                "delegationSourceCriteria": [], "previousCriteria": rounds[-1]["analysis"]["criteria"] if rounds else [],
                "closingMode": closing, "model": model}
        started = time.perf_counter()
        try:
            result = core.run_two_ais(body)
        except core.ExperimentError as exc:
            error = {"turn": turn, "code": exc.code, "stage": exc.stage, "message": str(exc)[:300],
                     "attempts": [{k: a.get(k) for k in ("attempt", "status", "exceptionCode", "validationCodes")} for a in exc.attempts]}
            break
        rounds.append({"turn": turn, "userText": text, "aiText": result["dialogue"], "analysis": result["analysis"],
                       "aiMeta": result["meta"], "wallMs": round((time.perf_counter() - started) * 1000)})
        history += [{"role": "user", "content": text}, {"role": "assistant", "content": result["dialogue"]}]
        sys.stderr.write(f"  {model} / {name} 第{turn}回 {rounds[-1]['wallMs']} ms\n")
    return {"sessionId": session_id, "condition": "UI_A", "experimentVariant": "generic_unranked", "model": model, "script": name,
            "aiModels": {"engine": "online", "dialogueModel": model, "analysisModel": model},
            "environment": {"layoutVariant": "default"}, "rounds": rounds, "error": error}


def stats(model: str, sessions: list[dict]) -> dict:
    rounds = [r for s in sessions for r in s["rounds"]]
    metas = [r["aiMeta"] for r in rounds]
    tokens_in = sum((m.get(k) or {}).get("input_tokens", 0) for m in metas for k in ("dialogueUsage", "analysisUsage"))
    tokens_out = sum((m.get(k) or {}).get("output_tokens", 0) for m in metas for k in ("dialogueUsage", "analysisUsage"))
    price = PRICES.get(model)
    codes: dict[str, int] = {}
    for m in metas:
        for a in (m.get("dialogueAttempts") or []) + (m.get("analysisAttempts") or []):
            for code in a.get("validationCodes") or ([a["exceptionCode"]] if a.get("exceptionCode") else []):
                codes[code] = codes.get(code, 0) + 1
    mean = lambda xs: round(sum(xs) / len(xs)) if xs else None  # noqa: E731
    return {
        "model": model, "turnsDone": len(rounds), "turnsPlanned": sum(s["planned"] for s in sessions),
        "errors": [f"{s['script'][:1]} 第{s['error']['turn']}回 {s['error']['code']}" for s in sessions if s["error"]],
        "meanReplyChars": mean([len(r["aiText"]) for r in rounds]),
        "meanDialogueMs": mean([m.get("dialogueLatencyMs") or 0 for m in metas]),
        "meanAnalysisMs": mean([m.get("analysisLatencyMs") or 0 for m in metas]),
        "meanTurnMs": mean([r["wallMs"] for r in rounds]),
        "retries": sum(max(0, len([a for a in (m.get("dialogueAttempts") or []) if a.get("attempt") != "soft_accept"]) - 1)
                       + max(0, len([a for a in (m.get("analysisAttempts") or []) if a.get("attempt") != "soft_accept"]) - 1) for m in metas),
        "softAccepts": sum(any(a.get("attempt") == "soft_accept" for a in (m.get("dialogueAttempts") or []) + (m.get("analysisAttempts") or []))
                           for m in metas),
        "analysisFallbacks": sum(m.get("validationStatus") == "analysis_fallback" for m in metas),
        "closingFallbacks": sum(bool(m.get("closingFallback")) for m in metas),
        "droppedParams": sorted({p for m in metas for p in m.get("droppedParams") or []}),
        "validationCodes": dict(sorted(codes.items(), key=lambda kv: -kv[1])),
        "tokensIn": tokens_in, "tokensOut": tokens_out,
        # 採用された試行の使用量だけを数えている。やり直しの分は入らないので、実際の請求はこれより多い
        "costUsdLowerBound": round(tokens_in / 1e6 * price[0] + tokens_out / 1e6 * price[1], 4) if price else None,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--models", default="gpt-6-luna,claude-haiku-5-5")
    ap.add_argument("--scripts", default="A,B,C")
    ap.add_argument("--turns", type=int, default=6)
    ap.add_argument("--closing", choices=["fixed", "personal", "gap"], default="fixed")
    ap.add_argument("--check", action="store_true", help="接続確認だけ：台本Aの第1回を各モデルで1度")
    ap.add_argument("--out", default=str(ROOT / "output" / "model_compare"))
    args = ap.parse_args()

    load_env_file()
    os.environ.pop("EXPERIMENT_ENGINE", None)
    from api.aitest import core
    from closing_compare import SCRIPTS
    from quality_check import check, to_markdown

    models = [m.strip() for m in args.models.split(",") if m.strip()]
    wanted = ["A"] if args.check else [x.strip().upper() for x in args.scripts.split(",")]
    scripts = {name: s for name, s in SCRIPTS.items() if name[:1] in wanted}
    turns = 1 if args.check else max(1, min(6, args.turns))
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    print("鍵：OpenAI " + ("あり" if os.environ.get("OPENAI_API_KEY", "").strip() else "なし")
          + " / Claude " + ("あり" if os.environ.get("ANTHROPIC_API_KEY", "").strip() else "なし"))
    all_stats, all_sessions = [], []
    for model in models:
        if model not in core.TEST_MODEL_CHOICES:
            print(f"× {model}：切り替え候補にない（EXPERIMENT_TEST_MODELS に追加する）")
            continue
        if not core.provider_key_present(model):
            print(f"× {model}：鍵がないので飛ばす（{'ANTHROPIC_API_KEY' if core.provider_of(model) == 'anthropic' else 'OPENAI_API_KEY'}）")
            continue
        sessions = []
        for name, script in scripts.items():
            session = run_one(core, model, name, script, turns, args.closing)
            session["planned"] = turns
            sessions.append(session)
            (out_dir / f"{session['sessionId']}.json").write_text(json.dumps(session, ensure_ascii=False, indent=1), encoding="utf-8")
            if session["error"]:
                e = session["error"]
                print(f"× {model} / {name} 第{e['turn']}回で停止：{e['code']}（{e['stage']}）{e['message']}")
        st = stats(model, sessions)
        all_stats.append(st)
        all_sessions += sessions
        ok = st["turnsDone"] == st["turnsPlanned"]
        print(f"{'○' if ok else '△'} {model}：{st['turnsDone']}/{st['turnsPlanned']} 回、1回あたり平均 {st['meanTurnMs']} ms、"
              f"やり直し {st['retries']}、費用の下限 {st['costUsdLowerBound']} USD")

    if not all_stats:
        print("実行できたモデルがありません。")
        sys.exit(2)
    keys = ["turnsDone", "turnsPlanned", "errors", "meanReplyChars", "meanDialogueMs", "meanAnalysisMs", "meanTurnMs", "retries", "softAccepts",
            "analysisFallbacks", "closingFallbacks", "droppedParams", "validationCodes", "tokensIn", "tokensOut", "costUsdLowerBound"]
    md = ["# モデルの比較\n", f"台本 {','.join(n[:1] for n in scripts)}、各 {turns} 回、末尾の方式 {args.closing}\n",
          "| 項目 | " + " | ".join(s["model"] for s in all_stats) + " |", "|---|" + "---|" * len(all_stats)]
    md += [f"| {k} | " + " | ".join(str(s[k]) for s in all_stats) + " |" for k in keys]
    md += ["", "## 自動チェック（quality_check と同じ基準）\n", to_markdown([check(s) for s in all_sessions if s["rounds"]])]
    (out_dir / "summary.md").write_text("\n".join(md), encoding="utf-8")
    replies = ["# 回答の全文（人が読んで比べる用）\n"]
    for name in scripts:
        replies.append(f"\n## {name}\n")
        for turn in range(1, turns + 1):
            replies.append(f"\n### 第{turn}回　入力：{scripts[name]['inputs'][turn - 1]}\n")
            for s in (x for x in all_sessions if x["script"] == name):
                r = next((x for x in s["rounds"] if x["turn"] == turn), None)
                cards = " ／ ".join(f"{c['title']}：{c['meaning']}" for c in (r["analysis"]["criteria"] if r else []))
                replies.append(f"**{s['model']}**（{len(r['aiText']) if r else 0}字）\n\n{r['aiText'] if r else '（なし）'}\n\nカード：{cards}\n")
    (out_dir / "replies.md").write_text("\n".join(replies), encoding="utf-8")
    print(f"\n保存先：{out_dir}（summary.md / replies.md / 記録 JSON）")
    sys.exit(0 if all(s["turnsDone"] == s["turnsPlanned"] for s in all_stats) else 1)


if __name__ == "__main__":
    main()
