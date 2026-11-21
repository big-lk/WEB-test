"""第二実験（視線計測実験）の分析スクリプト（シンプル版）

使い方（v2：主要仮説を「判断分担行動が生じたか」に合わせた版、2026-11-22）
  1) コーディング表を作る（条件は伏せ、順番はランダム）
       python analyze.py division-template --json-dir input/json --out input/division_template.csv --key input/division_key.csv
         … 第2〜6回の入力 1 文ずつ。判定：分担の表明（div 0/1）。key は判定後に結合するための対応表（判定者には渡さない）
       python analyze.py template --json-dir input/json --out input/coding_template.csv
         … 第3・4回のずれへの修正（e1/e2 0/1）。操作チェック・記述統計用
  2) 判定済みの表と Tobii の AOI 指標を置いて分析する
       python analyze.py run --json-dir input/json --division input/division.csv --division-key input/division_key.csv \
           --coding input/coding.csv --tobii input/tobii_metrics.csv --out output

主要仮説（いずれも参加者1人につき1つの値、UI A と UI B の独立2群、Welch の t 検定、両側 α=.05、Holm 補正後 p 併記）
  H1 判断分担行動：第2〜6回の入力のうち、「誰が決めるか・考えるか」を明示した回数（0〜5）は、UI B の方が多い
  H2 分け方の意識（主観）：「AIに考えてもらいたいこと」と「自分で決めたいこと」の分け方を意識した（1〜5）は、UI B の方が高い
  H3 視線：第4・5回の入力前に、カード本文の領域（ボタンを除く）を訪れた回数（2回の平均）は、UI B の方が多い
ずれへの気づき・修正（両 UI に共通するパネルが主に支える過程）は、操作チェック・記述統計として示す。

tobii_metrics.csv の形式（Tobii Pro Lab の Metrics 出力から、この4列に整える）
  participant_id, turn, aoi, visit_count
  aoi は "panel_text"（カード本文。UI B のボタン領域は含めない）, "panel_buttons"（UI B のみ）, "answer"（AIの回答）。
  turn は TOI（AI回答の表示完了〜入力欄クリック）の回。
"""
from __future__ import annotations

import argparse
import csv
import json
import random
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

TEST_PREFIXES = ("SIMTEST", "PREVIEW")
PANEL_AOI = "panel_text"  # v2: ボタン領域を含めない（UI B だけ面積が広くなる混同を避ける）
DIVISION_TURNS = (2, 3, 4, 5, 6)
EYE_TURNS = (4, 5)


# ------------------------------------------------------------------ 読み込み
def load_sessions(json_dir: Path, include_test: bool = False) -> list[dict]:
    sessions = []
    for path in sorted(json_dir.glob("*.json")):
        s = json.loads(path.read_text(encoding="utf-8"))
        pid = str(s.get("participantId", ""))
        if not include_test and (pid.startswith(TEST_PREFIXES) or str(s.get("sessionId", "")).startswith(TEST_PREFIXES)):
            continue
        s["_file"] = path.name
        sessions.append(s)
    return sessions


def round_of(s: dict, turn: int) -> dict:
    return next((r for r in s.get("rounds", []) if r.get("turn") == turn), {})


def reflection_item(s: dict, turn: int, key: str):
    for r in (s.get("reflection") or {}).get("rounds", []):
        if r.get("turn") == turn:
            return r.get(key)
    return None


# ------------------------------------------------------------------ 1) コーディング表
def make_template(sessions: list[dict], out: Path, seed: int = 1) -> None:
    rows = []
    for s in sessions:
        r3, r4, r5 = round_of(s, 3), round_of(s, 4), round_of(s, 5)
        rows.append({
            "code_id": "",  # 後で振る
            "participant_id": s.get("participantId", ""),
            "e1_deviation_by_ai": (r3.get("aiMeta") or {}).get("requiredControlSentence", ""),
            "e1_participant_next_input": r4.get("userText", ""),
            "e2_deviation_by_ai": (r4.get("aiMeta") or {}).get("requiredControlSentence", ""),
            "e2_participant_next_input": r5.get("userText", ""),
            "e1_coder1": "", "e1_coder2": "", "e2_coder1": "", "e2_coder2": "",
            "e1_final": "", "e2_final": "", "note": "",
        })
    random.Random(seed).shuffle(rows)  # 条件の並びが分からないように順番を混ぜる（条件の列は入れない）
    for i, row in enumerate(rows, 1):
        row["code_id"] = f"C{i:02d}"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"コーディング表を書き出しました：{out}（{len(rows)}名、条件は伏せています）")


# ------------------------------------------------------------------ 2) 参加者ごとの表
def participant_table(sessions: list[dict]) -> pd.DataFrame:
    rows = []
    for s in sessions:
        ref = s.get("reflection") or {}
        r3, r4 = round_of(s, 3), round_of(s, 4)
        events = s.get("events", [])
        rows.append({
            "participant_id": s.get("participantId", ""),
            "condition": s.get("condition", ""),
            "scenario": (s.get("pretaskAnchor") or {}).get("scenarioId", ""),
            "experiment_variant": s.get("experimentVariant", "standard"),
            "completed_turns": sum(1 for r in s.get("rounds", []) if r.get("aiText")),
            "noticeGap": ref.get("noticeGap"),
            "understanding": ref.get("understanding"),
            "nextInput": ref.get("nextInput"),
            "delegationBoundary": ref.get("delegationBoundary"),
            "t3_partialUptake": reflection_item(s, 3, "partialUptake"),
            "t4_proxyPriority": reflection_item(s, 4, "proxyPriority"),
            "button_changes": sum(1 for e in events if e.get("type") == "delegation_changed"),
            "examples_generated": sum(1 for e in events if e.get("type") == "example_generated"),
            "analysis_fallbacks": sum(1 for r in s.get("rounds", []) if (r.get("aiMeta") or {}).get("validationStatus") == "analysis_fallback"),
            "e1_target_button": ((r3.get("aiMeta") or {}).get("eventTarget") or {}).get("buttonState"),
            "e2_target_button": ((r4.get("aiMeta") or {}).get("eventTarget") or {}).get("buttonState"),
        })
    return pd.DataFrame(rows)


def make_division_template(sessions: list[dict], out: Path, key_out: Path, seed: int = 2) -> None:
    rows = []
    for s in sessions:
        for r in s.get("rounds", []):
            if r.get("turn") in DIVISION_TURNS:
                rows.append({"participant_id": s.get("participantId", ""), "turn": r.get("turn"), "text": r.get("userText", "")})
    random.Random(seed).shuffle(rows)
    for i, row in enumerate(rows, 1):
        row["id"] = f"U{i:03d}"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "text", "div_coder1", "div_coder2", "div_final", "note"])
        w.writeheader()
        w.writerows({"id": r["id"], "text": r["text"], "div_coder1": "", "div_coder2": "", "div_final": "", "note": ""} for r in rows)
    with key_out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "participant_id", "turn"])
        w.writeheader()
        w.writerows({"id": r["id"], "participant_id": r["participant_id"], "turn": r["turn"]} for r in rows)
    print(f"分担表明の判定表：{out}（{len(rows)}文）／対応表：{key_out}（判定者には渡さない）")


def add_division(df: pd.DataFrame, div_path: Path, key_path: Path) -> tuple[pd.DataFrame, tuple[int, float]]:
    d = pd.read_csv(div_path, encoding="utf-8-sig")
    k = pd.read_csv(key_path, encoding="utf-8-sig")
    both = d[["div_coder1", "div_coder2"]].dropna() if {"div_coder1", "div_coder2"} <= set(d.columns) else pd.DataFrame()
    agree = (len(both), float((both["div_coder1"] == both["div_coder2"]).mean())) if len(both) else (0, float("nan"))
    m = k.merge(d[["id", "div_final"]], on="id", how="left")
    m["div_final"] = m["div_final"].fillna(0).astype(float)
    per = m.groupby("participant_id")["div_final"].sum().rename("division_statements").reset_index()
    df = df.drop(columns=["division_statements"], errors="ignore").merge(per, on="participant_id", how="left")
    df["division_statements"] = df["division_statements"].fillna(0)  # 判定表に1文も無い人は 0 回
    return df, agree


def add_coding(df: pd.DataFrame, coding_path: Path) -> tuple[pd.DataFrame, dict]:
    c = pd.read_csv(coding_path, encoding="utf-8-sig")
    agree = {}
    for e in ("e1", "e2"):
        both = c[[f"{e}_coder1", f"{e}_coder2"]].dropna()
        agree[e] = (len(both), float((both[f"{e}_coder1"] == both[f"{e}_coder2"]).mean()) if len(both) else float("nan"))
    c["corrections"] = c["e1_final"].astype(float) + c["e2_final"].astype(float)
    df = df.drop(columns=[x for x in ("e1_final", "e2_final", "corrections") if x in df], errors="ignore")
    return df.merge(c[["participant_id", "e1_final", "e2_final", "corrections"]], on="participant_id", how="left"), agree


def add_tobii(df: pd.DataFrame, tobii_path: Path) -> pd.DataFrame:
    t = pd.read_csv(tobii_path, encoding="utf-8-sig")
    t = t[(t["aoi"] == PANEL_AOI) & (t["turn"].isin(EYE_TURNS))]
    panel = t.groupby("participant_id")["visit_count"].mean().rename("panel_text_visits_t45").reset_index()
    return df.merge(panel, on="participant_id", how="left")


# ------------------------------------------------------------------ 3) 検定
def welch(a: pd.Series, b: pd.Series) -> dict:
    a, b = a.dropna().astype(float), b.dropna().astype(float)
    if a.var(ddof=1) == 0 and b.var(ddof=1) == 0:  # 両群とも全員同じ値（天井・床）：検定できない
        nan = float("nan")
        return {"nA": len(a), "MA": a.mean(), "SDA": 0.0, "nB": len(b), "MB": b.mean(), "SDB": 0.0, "diff": b.mean() - a.mean(),
                "ci_low": nan, "ci_high": nan, "t": nan, "df": nan, "p": 1.0, "d": nan, "note": "両群とも分散0のため検定不可"}
    t, p = stats.ttest_ind(b, a, equal_var=False)  # B − A
    va, vb, na, nb = a.var(ddof=1), b.var(ddof=1), len(a), len(b)
    se = np.sqrt(va / na + vb / nb)
    df_w = (va / na + vb / nb) ** 2 / ((va / na) ** 2 / (na - 1) + (vb / nb) ** 2 / (nb - 1))
    diff = b.mean() - a.mean()
    q = stats.t.ppf(0.975, df_w)
    sp = np.sqrt(((na - 1) * va + (nb - 1) * vb) / (na + nb - 2))
    return {"nA": na, "MA": a.mean(), "SDA": a.std(ddof=1), "nB": nb, "MB": b.mean(), "SDB": b.std(ddof=1),
            "diff": diff, "ci_low": diff - q * se, "ci_high": diff + q * se, "t": t, "df": df_w, "p": p,
            "d": diff / sp if sp > 0 else float("nan")}


def holm(ps: list[float]) -> list[float]:
    order = np.argsort(ps)
    m, out, running = len(ps), [0.0] * len(ps), 0.0
    for rank, i in enumerate(order):
        running = max(running, min(1.0, (m - rank) * ps[i]))
        out[i] = running
    return out


HYPOTHESES = [
    ("H1", "判断分担行動（第2〜6回で分担を明示した回数, 0–5）", "division_statements"),
    ("H2", "分け方を意識した（主観, 1–5）", "delegationBoundary"),
    ("H3", "視線：第4・5回入力前のカード本文への訪問回数", "panel_text_visits_t45"),
]
DESCRIPTIVE = [
    ("操作チェック：ずれへの修正数（0–2）", "corrections"),
    ("ずれに気づきやすかった（1–5）", "noticeGap"),
    ("確認しやすさ（1–5）", "understanding"),
    ("次の入力に役立った（1–5）", "nextInput"),
    ("第3回：一部だけ取り上げた（1–5）", "t3_partialUptake"),
    ("第4回：決めていない優先順位（1–5）", "t4_proxyPriority"),
]


def fmt_p(p: float) -> str:
    return "< .001" if p < 0.001 else f"{p:.3f}".lstrip("0")


def run(args) -> None:
    if args.table:  # 1人1行の表を直接読む（試運転・外部集計用）
        df = pd.read_csv(args.table, encoding="utf-8-sig")
        df["completed_turns"] = df.get("completed_turns", 6)
    else:
        df = participant_table(load_sessions(Path(args.json_dir), args.include_test))
    excluded = df[df["completed_turns"] < 6]
    df = df[df["completed_turns"] >= 6].copy()
    agree = {}
    div_agree = None
    if args.division:
        df, div_agree = add_division(df, Path(args.division), Path(args.division_key))
    if args.coding:
        df, agree = add_coding(df, Path(args.coding))
    if args.tobii:
        df = add_tobii(df, Path(args.tobii))
    elif "panel_text_visits_t45" not in df:
        df["panel_text_visits_t45"] = df["panel_visits_t45"] if "panel_visits_t45" in df else np.nan
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    df.to_csv(out / "participant_table.csv", index=False, encoding="utf-8-sig")

    A, B = df[df["condition"] == "UI_A"], df[df["condition"] == "UI_B"]
    res = []
    for code, label, col in HYPOTHESES:
        if col in df and df[col].notna().sum() >= 4:
            res.append((code, label, welch(A[col], B[col])))
    adj = holm([r[2]["p"] for r in res])

    lines = ["# 第二実験 分析結果", "",
             f"参加者：UI A {len(A)}名、UI B {len(B)}名（6回の対話を終えなかった {len(excluded)}名を除外）", ""]
    if div_agree and div_agree[0]:
        lines += [f"分担表明の判定一致率：{div_agree[1]*100:.1f}%（{div_agree[0]}文）", ""]
    if agree:
        lines += ["修正行動のコーディング一致率：" + "、".join(
            f"{'E1' if k == 'e1' else 'E2'} {v[1]*100:.0f}%（{v[0]}名）" for k, v in agree.items()), ""]
    lines += ["## 主要仮説（Welch の t 検定、両側、差は B − A）", "",
              "| 仮説 | 指標 | UI A M (SD) | UI B M (SD) | 差 [95%CI] | t (df) | p | Holm p | d |",
              "|---|---|---|---|---|---|---|---|---|"]
    for (code, label, r), pa in zip(res, adj):
        if r.get("note"):
            lines.append(f"| {code} | {label} | {r['MA']:.2f} ({r['SDA']:.2f}) | {r['MB']:.2f} ({r['SDB']:.2f}) | {r['note']} | – | – | – | – |")
            continue
        lines.append(f"| {code} | {label} | {r['MA']:.2f} ({r['SDA']:.2f}) | {r['MB']:.2f} ({r['SDB']:.2f}) | "
                     f"{r['diff']:.2f} [{r['ci_low']:.2f}, {r['ci_high']:.2f}] | {r['t']:.2f} ({r['df']:.1f}) | "
                     f"{fmt_p(r['p'])} | {fmt_p(pa)} | {r['d']:.2f} |")
    lines += ["", "## 記述統計（検定しない）", "", "| 指標 | UI A M (SD) | UI B M (SD) |", "|---|---|---|"]
    for label, col in DESCRIPTIVE:
        if col not in df:
            continue
        lines.append(f"| {label} | {A[col].mean():.2f} ({A[col].std():.2f}) | {B[col].mean():.2f} ({B[col].std():.2f}) |")
    lines += ["", "UI B のみ：", f"- ボタンを変えた回数 M = {B['button_changes'].mean():.1f}、例文を作った回数 M = {B['examples_generated'].mean():.1f}"]
    for col, name in (("e1_target_button", "第3回のずれ"), ("e2_target_button", "第4回のずれ")):
        if col in B:
            counts = B[col].value_counts().to_dict()
            lines.append(f"- {name}が出たカードのボタン状態（送信時）：" + "、".join(f"{k} {v}名" for k, v in counts.items()))
    lines += [f"- 分析AIの回退が起きた回の数（全体）：{int(df['analysis_fallbacks'].sum())}"]
    (out / "results.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines))


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("template")
    t.add_argument("--json-dir", required=True)
    t.add_argument("--out", required=True)
    t.add_argument("--include-test", action="store_true")
    r = sub.add_parser("run")
    r.add_argument("--json-dir")
    r.add_argument("--table", help="participant_table 形式の CSV（--json-dir の代わり）")
    r.add_argument("--division", help="分担表明の判定表（id, div_final）")
    r.add_argument("--division-key", help="division-template が出した対応表")
    r.add_argument("--coding")
    r.add_argument("--tobii")
    r.add_argument("--out", required=True)
    r.add_argument("--include-test", action="store_true")
    dt = sub.add_parser("division-template")
    dt.add_argument("--json-dir", required=True)
    dt.add_argument("--out", required=True)
    dt.add_argument("--key", required=True)
    dt.add_argument("--include-test", action="store_true")
    args = ap.parse_args()
    if args.cmd == "division-template":
        make_division_template(load_sessions(Path(args.json_dir), args.include_test), Path(args.out), Path(args.key))
    elif args.cmd == "template":
        make_template(load_sessions(Path(args.json_dir), args.include_test), Path(args.out))
    else:
        run(args)


if __name__ == "__main__":
    main()
