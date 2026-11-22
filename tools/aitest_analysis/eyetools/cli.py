"""コマンドライン：

  # 1) ログだけを検証する（視線データなしで使える。実験直後のチェック用）
  python -m eyetools.cli check  P001_complete.json [P002_complete.json ...]

  # 2) 1 名分を処理する（ログ＋Pro Lab TSV → 指標表 CSV と品質 JSON）
  python -m eyetools.cli process P001_complete.json P001_prolab.tsv --out out/

  # 3) フォルダ内の全員をまとめる（sessions/*.json と gaze/<参加者>.tsv）
  python -m eyetools.cli batch sessions/ gaze/ --out out/

  # 4) 合成データで動作確認（冒烟テスト）
  python -m eyetools.cli selftest
"""
from __future__ import annotations

import argparse
import json
import sys
import tempfile
from pathlib import Path

import pandas as pd

from .pipeline import participant_summary, process_files
from .session import build_tois, load_session, validate


def cmd_check(paths: list[str]) -> int:
    worst = 0
    for p in paths:
        s = load_session(p)
        issues = validate(s)
        tois = build_tois(s)
        errs = [i for i in issues if i.level == "error"]
        worst = max(worst, 1 if errs else 0)
        print(f"\n=== {Path(p).name}  参加者={s.participant} 条件={s.condition} 読解区間={sum(t.kind == 'reading' for t in tois)}/5")
        for i in issues:
            mark = "✗" if i.level == "error" else "!"
            print(f"  {mark} [{i.code}] 第{i.turn}回 {i.message}" if i.turn else f"  {mark} [{i.code}] {i.message}")
        for t in tois:
            if t.kind == "reading":
                print(f"    読解区間 第{t.turn}回 {t.duration:6.1f} 秒（始点：{t.start_source}）")
        if not issues:
            print("  問題なし")
    return worst


def cmd_process(session_json: str, tsv: str, out: str) -> None:
    table, qa = process_files(session_json, tsv)
    o = Path(out)
    o.mkdir(parents=True, exist_ok=True)
    pid = qa["participant"] or Path(session_json).stem
    table.to_csv(o / f"{pid}_toi_metrics.csv", index=False, encoding="utf-8-sig")
    qa["summary"] = participant_summary(table)
    (o / f"{pid}_qa.json").write_text(json.dumps(qa, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({"participant": pid, "sync": qa["sync"], "summary": qa["summary"],
                      "errors": [i for i in qa["issues"] if i["level"] == "error"]}, ensure_ascii=False, indent=1))


def cmd_batch(sess_dir: str, gaze_dir: str, out: str) -> None:
    tables, qas = [], []
    for sj in sorted(Path(sess_dir).glob("*.json")):
        s = load_session(sj)
        tsv = Path(gaze_dir) / f"{s.participant}.tsv"
        if not tsv.exists():
            print(f"skip {s.participant}: {tsv} がない")
            continue
        t, qa = process_files(sj, tsv)
        tables.append(t)
        qa["summary"] = participant_summary(t)
        qas.append(qa)
    o = Path(out)
    o.mkdir(parents=True, exist_ok=True)
    if tables:
        all_t = pd.concat(tables)
        all_t.to_csv(o / "all_toi_metrics.csv", index=False, encoding="utf-8-sig")
        rows = [{"participant": q["participant"], "condition": q["condition"], "sync_ok": q["sync"]["ok"],
                 "sync_matches": q["sync"]["n_matched"], "n_errors": sum(i["level"] == "error" for i in q["issues"]),
                 **q["summary"]} for q in qas]
        pd.DataFrame(rows).to_csv(o / "participant_summary.csv", index=False, encoding="utf-8-sig")
        print(pd.DataFrame(rows).to_string(index=False))


def cmd_selftest() -> int:
    from . import synth
    ok = True
    for cond in ("UI_A", "UI_B"):
        d = tempfile.mkdtemp()
        info = synth.make(d, condition=cond, start_time_error=2.0)
        table, qa = process_files(info["session"], info["tsv"])
        got = table[table.toi == "reading"].set_index("turn").ans_panel_transitions.to_dict()
        good = got == info["truth_transitions"] and qa["sync"]["ok"] and abs(qa["sync"]["offset"] - info["true_offset"]) < 0.05
        ok &= good
        print(f"{cond}: 往復回数 正解={info['truth_transitions']} 算出={got} 同期誤差={(qa['sync']['offset'] - info['true_offset']) * 1000:.1f}ms → {'OK' if good else 'NG'}")
    return 0 if ok else 1


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="eyetools")
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check"); c.add_argument("paths", nargs="+")
    p = sub.add_parser("process"); p.add_argument("session_json"); p.add_argument("tsv"); p.add_argument("--out", default="out")
    b = sub.add_parser("batch"); b.add_argument("sess_dir"); b.add_argument("gaze_dir"); b.add_argument("--out", default="out")
    sub.add_parser("selftest")
    a = ap.parse_args(argv)
    if a.cmd == "check":
        return cmd_check(a.paths)
    if a.cmd == "process":
        cmd_process(a.session_json, a.tsv, a.out); return 0
    if a.cmd == "batch":
        cmd_batch(a.sess_dir, a.gaze_dir, a.out); return 0
    return cmd_selftest()


if __name__ == "__main__":
    sys.exit(main())
