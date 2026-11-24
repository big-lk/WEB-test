"""登録文の「木」を Markdown で書き出す（どの回のどの枠に、どの文が入りうるか）。
python3 tools/offline/export_tree.py > tools/offline/offline_tree.md"""
from __future__ import annotations
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from api.aitest import core, offline_corpus as C  # noqa: E402

out = [f"# オフライン版 応答の木（{C.CORPUS_VERSION}）", "",
       "各回の回答は、下の「枠」を上から順に埋めて作る。枠に入る文はすべてこの表にある（参加者の語は料理名・項目名などの登録語だけ差し込む）。",
       "応答ごとに、通った節点の ID が meta.offlineTrace.nodes に残る。", ""]
out += ["## 回ごとの枠", "",
        "| 回 | 枠（上から順） | 終わりの文（固定） |", "|---|---|---|"]
frames = {
    1: "書き出し（場面別）→ 受け止め（希望の型 1〜2）→［関わり方の指定への応答］→ 暫定の料理 → 細部への応答 → 保留の文",
    2: "事前の一文と今回の希望をつなぐ文 →［別の型の受け止め］→［関わり方］→「なし」の項目 → 料理／細部 → 保留の文",
    3: "受け止め（刺激と食い違う型は除く）→ **E1 刺激文（第2文）** → E1 の続きの文 →［関わり方］→ 細部・料理・別の受け止め",
    4: "E1 の訂正の受け止め（あれば）／受け止め → **E2 刺激文（第2文）** → E2 の続きの文 →［関わり方］→ 料理・細部・「なし」",
    5: "E1/E2 の訂正の受け止め（あれば）→「なし」の項目 →［関わり方］→ 変わった点一つ（料理か細部）→ 受け止め",
    6: "まとめの書き出し → 料理 → 大切にすること（最終回の言葉を優先）→ 直されていない E1/E2 → 当日の具体 → 入れない項目",
}
for k in range(1, 7):
    out.append(f"| {k} | {frames[k]} | {core.TURN_ENDINGS[k]} |")
out += ["", "## 希望の型（右側カードの項目にもなる）", ""]
for tag, spec in C.TAGS.items():
    out.append(f"### {tag}：{spec['title']}")
    out.append(f"- カード本文：{spec['meaning']}")
    out.append(f"- 受け止め：" + " ／ ".join(spec["ack"]))
    out.append(f"- まとめ句：{spec['final']}")
    out.append(f"- 「案を一つ」への応答：{spec['propose']}")
    out.append(f"- 「考える材料」への応答：{spec['viewpoint']}")
    out.append("")
out += ["## 第3回 E1（登録候補ごと）", ""]
for g, spec in C.E1.items():
    out += [f"- **{g}**", f"  - 続き：{spec['follow']}", f"  - 直されたとき：{spec['undo']}、…", f"  - 検出語：{'・'.join(spec['keys'])}"]
out += ["", "## 第4回 E2（登録候補ごと）", ""]
for g, spec in C.E2.items():
    out += [f"- **{g}**", f"  - 続き：{spec['follow']}", f"  - 直されたとき：{spec['undo']}、…", f"  - 検出語：{'・'.join(spec['keys'])}"]
out += ["", "## 細部への応答", "", "| キー | 肯定のとき | 否定のとき |", "|---|---|---|"]
for key, _, pos, neg in C.DETAILS:
    out.append(f"| {key} | {pos or '—'} | {neg or '—'} |")
out += ["", "## 回ごとの文", ""]
for name in ("OPENINGS", "HOLD_OPEN", "INTEGRATE", "FALLBACK_ACK", "FILLERS", "ACCEPT_GENERAL", "FINAL_LEAD", "DELEGATION_REPLY", "DELEGATION_AGAIN"):
    v = getattr(C, name)
    out.append(f"### {name}")
    items = v.items() if isinstance(v, dict) else enumerate(v)
    for k, x in items:
        out.append(f"- {k}：{' ／ '.join(x) if isinstance(x, list) else x}")
    out.append("")
out.append(f"料理語彙 {len(C.DISHES)} 語、「なし」項目 {len(C.NEG_ITEMS)} 種、希望の型 {len(C.TAGS)} 種。")
print("\n".join(out))
