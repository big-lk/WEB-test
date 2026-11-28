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

## 視線データ（eyetools v0.2）
Pro Lab では「記録」と「生データの TSV 書き出し」だけを行い、AOI・TOI の設定は不要。
実験画面のログ（AOI 座標・クリック時刻）と Pro Lab の TSV を、両方に残るクリックで自動同期して指標を計算する。
```
python -m eyetools.cli selftest                     # 動作確認
python -m eyetools.cli check input/json/P001.json   # 実験直後のログ確認
python -m eyetools.cli batch input/json input/gaze --out output/gaze   # gaze/<参加者番号>.tsv
python analyze.py run --json-dir input/json --division ... --division-key ... --gaze-toi output/gaze/all_toi_metrics.csv --out output
```
H3 は第4・5回の読解区間（AI 回答の表示 → 入力欄の初回クリック）でのカード本文への訪問回数。UI B のボタン行（BTN_1〜3）は別集計。
初めて実データの TSV を得たら、列名が eyetools/gaze.py の CANDIDATES と合っているか確認すること。
読み取りは、列名の単位（`[ms]`、`[DACS px]` など）、時刻の単位（ミリ秒／マイクロ秒）、文字コード、Sensor 列の有無の違いを吸収する。
何を使ったかは `<参加者>_qa.json` の `gaze` に残る（`timestamp_unit_from` が `interval` なら、単位はサンプル間隔から決めたもの）。

`check` と `batch` は、各参加者の設定（刺激・配置・会話AI・分析AI・分析の指示文・末尾の方式）を表示する。
- 正式データの中で設定が違う参加者がいればエラー（S11_MIXED_SETTING）。試験用の番号（TEST- など）は判定に入れない。
- 1 人の中で回によって設定が変わっていれば警告（S12_SETTING_CHANGED）。
- 刺激は `standard` と `generic_unranked` を通す（どちらを正式に使うかは未決）。決まったら `--variant standard` のように固定して確かめる。

配置の比較（試し録り用。本文とボタンの視線がどれだけ分けて数えられるか）：
```
python -m eyetools.cli separation TEST-02.json TEST-02.tsv TEST-03.json TEST-03.tsv --script-turn 6 --out out/
```
`--script-turn 6` は、第 6 回の読解区間で「カード1本文→カード1ボタン→カード2本文→カード2ボタン→カード3本文→カード3ボタン」の順に
各 2 秒ほど見た記録を照合する。外れの割合は下限（当てはめは合う時間が最大になるように行う）。
