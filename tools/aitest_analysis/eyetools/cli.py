"""コマンドライン：

  # 1) ログだけを検証する（視線データなしで使える。実験直後のチェック用）
  python -m eyetools.cli check  P001_complete.json [P002_complete.json ...]

  # 2) 1 名分を処理する（ログ＋Pro Lab TSV → 指標表 CSV と品質 JSON）
  python -m eyetools.cli process P001_complete.json P001_prolab.tsv --out out/

  # 3) フォルダ内の全員をまとめる（sessions/*.json と gaze/<参加者>.tsv）
  python -m eyetools.cli batch sessions/ gaze/ --out out/

  # 4) 合成データで動作確認（冒烟テスト）
  python -m eyetools.cli selftest

  # 5) 配置の比較：本文とボタンの視線がどれだけ分けて数えられるか（ログと TSV を 2 つずつ並べる）
  #    --script-turn 6 … 第 6 回の読解区間で「カード1本文→カード1ボタン→カード2本文→…」の順に見た試し録りを照合する
  python -m eyetools.cli separation TEST-02.json TEST-02.tsv TEST-03.json TEST-03.tsv --script-turn 6 --out out/
"""
from __future__ import annotations

import argparse
import json
import sys
import tempfile
from pathlib import Path

import pandas as pd

from .pipeline import participant_summary, process_files
from .session import build_tois, is_test_id, load_session, session_settings, validate


def cmd_check(paths: list[str], variant: str | None = None) -> int:
    worst = 0
    seen: dict[str, list[str]] = {}
    for p in paths:
        s = load_session(p)
        issues = validate(s, variant)
        tois = build_tois(s)
        errs = [i for i in issues if i.level == "error"]
        worst = max(worst, 1 if errs else 0)
        st = session_settings(s)
        seen.setdefault(_setting_label(st), []).append(s.participant)
        print(f"\n=== {Path(p).name}  参加者={s.participant} 条件={s.condition} 読解区間={sum(t.kind == 'reading' for t in tois)}/5")
        print(f"    設定：{_setting_label(st)}")
        for i in issues:
            mark = "✗" if i.level == "error" else "!"
            print(f"  {mark} [{i.code}] 第{i.turn}回 {i.message}" if i.turn else f"  {mark} [{i.code}] {i.message}")
        for t in tois:
            if t.kind == "reading":
                print(f"    読解区間 第{t.turn}回 {t.duration:6.1f} 秒（始点：{t.start_source}）")
        if not issues:
            print("  問題なし")
    formal = {k: [x for x in v if not is_test_id(x)] for k, v in seen.items()}
    formal = {k: v for k, v in formal.items() if v}
    if len(formal) > 1:  # 正式データの中で設定が混ざっていないか
        worst = 1
        print("\n✗ [S11_MIXED_SETTING] 設定が参加者によって違います：")
        for k, v in formal.items():
            print(f"    {k}: {', '.join(v)}")
    return worst


def _setting_label(st: dict) -> str:
    names = {"variant": "刺激", "layout": "配置", "dialogueModel": "会話AI", "analysisModel": "分析AI",
             "analysisPrompt": "分析の指示文", "closingMode": "末尾", "inviteMode": "入力の案内", "lengthMode": "長さ"}
    return " / ".join(f"{names.get(k, k)}={v}" for k, v in st.items())


def cmd_process(session_json: str, tsv: str, out: str, variant: str | None = None) -> None:
    table, qa = process_files(session_json, tsv, variant)
    o = Path(out)
    o.mkdir(parents=True, exist_ok=True)
    pid = qa["participant"] or Path(session_json).stem
    table.to_csv(o / f"{pid}_toi_metrics.csv", index=False, encoding="utf-8-sig")
    qa["summary"] = participant_summary(table)
    (o / f"{pid}_qa.json").write_text(json.dumps(qa, ensure_ascii=False, indent=1), encoding="utf-8")
    g = qa.get("gaze") or {}
    print(json.dumps({"participant": pid, "variant": qa.get("variant"), "layout": qa.get("layout"),
                      "gaze": {k: g.get(k) for k in ("encoding", "timestamp_column", "timestamp_unit", "timestamp_unit_from",
                                                     "n_samples", "n_fixations", "n_mouse_down", "columns_missing")},
                      "sync": qa["sync"], "summary": qa["summary"],
                      "errors": [i for i in qa["issues"] if i["level"] == "error"]}, ensure_ascii=False, indent=1))


def cmd_batch(sess_dir: str, gaze_dir: str, out: str, variant: str | None = None) -> None:
    tables, qas = [], []
    for sj in sorted(Path(sess_dir).glob("*.json")):
        s = load_session(sj)
        tsv = Path(gaze_dir) / f"{s.participant}.tsv"
        if not tsv.exists():
            print(f"skip {s.participant}: {tsv} がない")
            continue
        t, qa = process_files(sj, tsv, variant)
        tables.append(t)
        qa["summary"] = participant_summary(t)
        qas.append(qa)
    o = Path(out)
    o.mkdir(parents=True, exist_ok=True)
    if tables:
        all_t = pd.concat(tables)
        all_t.to_csv(o / "all_toi_metrics.csv", index=False, encoding="utf-8-sig")
        rows = [{"participant": q["participant"], "condition": q["condition"], **(q.get("settings") or {}),
                 "sync_ok": q["sync"]["ok"],
                 "sync_matches": q["sync"]["n_matched"], "n_errors": sum(i["level"] == "error" for i in q["issues"]),
                 **q["summary"]} for q in qas]
        pd.DataFrame(rows).to_csv(o / "participant_summary.csv", index=False, encoding="utf-8-sig")
        print(pd.DataFrame(rows).to_string(index=False))
        kinds: dict[str, list[str]] = {}
        for q in qas:
            if not is_test_id(q["participant"]):
                kinds.setdefault(_setting_label(q.get("settings") or {}), []).append(q["participant"])
        if len(kinds) > 1:
            print("\n✗ [S11_MIXED_SETTING] 設定が参加者によって違います：")
            for k, v in kinds.items():
                print(f"    {k}: {', '.join(v)}")


def cmd_separation(files: list[str], out: str, script_turn: int | None, radius_deg: float) -> int:
    from .gaze import load_prolab_tsv
    from .separation import analyse, report
    if len(files) % 2:
        print("ログ（.json）と視線（.tsv）を 2 つずつ並べてください。")
        return 2
    rows = []
    for j, t in zip(files[0::2], files[1::2]):
        sess = load_session(j)
        rows.append(analyse(sess, load_prolab_tsv(t, recording=sess.participant), script_turn=script_turn, radius_deg=radius_deg))
    text = report(rows)
    o = Path(out)
    o.mkdir(parents=True, exist_ok=True)
    (o / "separation.md").write_text(text + "\n", encoding="utf-8")
    (o / "separation.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    print(text)
    return 0


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
    # Windows のコマンド画面（CP932）では「✗」などが表示できずに止まることがある。表示できない字は「?」にして続ける。
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(errors="replace")
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(prog="eyetools")
    sub = ap.add_subparsers(dest="cmd", required=True)
    vhelp = "正式に使う刺激を 1 つに固定して確かめる（例：standard、generic_unranked）。省くと候補のどちらも通す"
    c = sub.add_parser("check"); c.add_argument("paths", nargs="+"); c.add_argument("--variant", help=vhelp)
    p = sub.add_parser("process"); p.add_argument("session_json"); p.add_argument("tsv"); p.add_argument("--out", default="out")
    p.add_argument("--variant", help=vhelp)
    b = sub.add_parser("batch"); b.add_argument("sess_dir"); b.add_argument("gaze_dir"); b.add_argument("--out", default="out")
    b.add_argument("--variant", help=vhelp)
    v = sub.add_parser("convert", help="Pro Lab プロジェクト内の生の記録を TSV に直す（管線の確認用。正式な分析には Pro Lab のエクスポートを使う）")
    v.add_argument("rec_dir"); v.add_argument("out_tsv"); v.add_argument("--utc-offset", type=float, default=9.0)
    sp = sub.add_parser("separation", help="配置の比較：本文とボタンの視線がどれだけ分けて数えられるか")
    sp.add_argument("files", nargs="+", help="ログ.json 視線.tsv の組を並べる")
    sp.add_argument("--out", default="out"); sp.add_argument("--script-turn", type=int, default=None)
    sp.add_argument("--radius-deg", type=float, default=0.5)
    sub.add_parser("selftest")
    a = ap.parse_args(argv)
    if a.cmd == "check":
        return cmd_check(a.paths, a.variant)
    if a.cmd == "process":
        cmd_process(a.session_json, a.tsv, a.out, a.variant); return 0
    if a.cmd == "convert":
        from .prolab_raw import convert
        print(json.dumps(convert(a.rec_dir, a.out_tsv, a.utc_offset), ensure_ascii=False, indent=1)); return 0
    if a.cmd == "separation":
        return cmd_separation(a.files, a.out, a.script_turn, a.radius_deg)
    if a.cmd == "batch":
        cmd_batch(a.sess_dir, a.gaze_dir, a.out, a.variant); return 0
    return cmd_selftest()


if __name__ == "__main__":
    sys.exit(main())
