"""第二実験（視線計測実験）の分析スクリプト（シンプル版）

使い方
  1) 修正行動のコーディング表を作る（条件は伏せ、順番はランダム）
       python analyze.py template --json-dir input/json --out input/coding_template.csv
  2) 2名がコーディングした表（e1_coder1, e1_coder2, e2_coder1, e2_coder2, e1_final, e2_final）と
     Tobii の AOI 指標（tobii_metrics.csv）を置いて分析する
       python analyze.py run --json-dir input/json --coding input/coding.csv --tobii input/tobii_metrics.csv --out output

主要仮説（いずれも参加者1人につき1つの値、UI A と UI B の独立2群、Welch の t 検定、両側 α=.05）
  H1 修正行動：第3・4回のずれに対する修正の数（0〜2）は、UI B の方が多い
  H2 ずれへの気づき（主観）：「AIが読み取ったこと」と自分の意図とのずれに気づきやすかった（1〜5）は、UI B の方が高い
  H3 視線：第4・5回の入力前に「AIが読み取ったこと」領域を訪れた回数（2回の平均）は、UI B の方が多い
3つの検定には Holm の補正後の p も併記する。それ以外の指標は記述統計のみ。

tobii_metrics.csv の形式（Tobii Pro Lab の Metrics 出力から、この4列に整える）
  participant_id, turn, aoi, visit_count
  aoi は "panel"（AIが読み取ったこと）, "answer"（AIの回答）などの名前。turn は TOI（AI回答の表示完了〜入力欄クリック）の回。
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
PANEL_AOI = "panel"
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
    panel = t.groupby("participant_id")["visit_count"].mean().rename("panel_visits_t45").reset_index()
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
    ("H1", "修正行動（第3・4回のずれへの修正数, 0–2）", "corrections"),
    ("H2", "ずれへの気づき（主観, 1–5）", "noticeGap"),
    ("H3", "視線：第4・5回入力前の「AIが読み取ったこと」訪問回数", "panel_visits_t45"),
]
DESCRIPTIVE = [
    ("確認しやすさ（1–5）", "understanding"),
    ("次の入力に役立った（1–5）", "nextInput"),
    ("分け方を意識した（1–5）", "delegationBoundary"),
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
    if args.coding:
        df, agree = add_coding(df, Path(args.coding))
    if args.tobii:
        df = add_tobii(df, Path(args.tobii))
    elif "panel_visits_t45" not in df:
        df["panel_visits_t45"] = np.nan
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
    r.add_argument("--coding")
    r.add_argument("--tobii")
    r.add_argument("--out", required=True)
    r.add_argument("--include-test", action="store_true")
    args = ap.parse_args()
    if args.cmd == "template":
        make_template(load_sessions(Path(args.json_dir), args.include_test), Path(args.out))
    else:
        run(args)


if __name__ == "__main__":
    main()
