# 第二実験 分析ツール（シンプル版）

主要仮説3つを、UI A／UI B の独立2群・Welch の t 検定（両側 α=.05、Holm 補正後 p 併記、効果量 d）で検証する。
詳しい分析計画は Project 文書「第二実験_分析計画（簡略版）」を参照。

## 手順
1. 実験画面の「JSON を保存」で各参加者の `*_complete.json` を `input/json/` に集める（SIMTEST・PREVIEW は自動で除外）。
2. コーディング表を作る（条件は伏せ、順番はランダム）  
   `python analyze.py template --json-dir input/json --out input/coding_template.csv`
3. 2名が `e1_coder1/2`, `e2_coder1/2` に 0/1 を記入し、話し合いで `e1_final`, `e2_final` を決めて `input/coding.csv` として保存。
4. Tobii Pro Lab で TOI（各回の AI 回答表示完了〜入力欄クリック）ごとの AOI「panel」「answer」の Visit count を出力し、
   `participant_id, turn, aoi, visit_count` の4列に整えて `input/tobii_metrics.csv` に保存。
5. 分析  
   `python analyze.py run --json-dir input/json --coding input/coding.csv --tobii input/tobii_metrics.csv --out output`  
   → `output/results.md`（結果表）と `output/participant_table.csv`（1人1行の表）

## 試運転
`python make_dummy.py --out dummy` で架空データ（DUMMY-）を作り、上の 2〜5 をそのまま実行できる。
