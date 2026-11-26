# このリポジトリでの作業メモ（Claude Code 用・引き継ぎ）

使用者：孔維鵬（札幌市立大学大学院 デザイン研究科 柿山研究室）。返答は簡体字中国語、結論を先に。
このリポジトリは個人サイト lkdesigner.top（Vercel）。研究で触るのは **第二実験（視線計測、UI A / UI B）** の部分だけ。
ほかのページ（ポートフォリオなど）は触らない。

## 第二実験の場所
- 実験画面：`public/aitest/`（index.html, app.js, practice.js, logging_patch.js, styles.css）
- サーバー：`api/aitest/core.py`（オンライン版・OpenAI）、`offline_engine.py` + `offline_corpus.py`（オフライン版・生成AIなし）
- オフライン版ローカルサーバー：`tools/offline/serve.py` → http://127.0.0.1:8765/aitest/
- 分析：`tools/aitest_analysis/analyze.py`、視線：`tools/aitest_analysis/eyetools/`
- テスト：`python tests/aitest/test_offline_engine.py`、`python tests/aitest/test_v17_offline.py`、`node tests/aitest/example_sentence_test.mjs`
- 公開版：https://www.lkdesigner.top/aitest/ （オフライン版で試す：`?engine=offline`）
- 変更を push するときは `main` と `aitest-v1.7-stability` の両方へ。

## 守ること
- `.env` や API キーは絶対にコミットしない。
- テスト用の参加者番号は `TEST-` / `PREVIEW-` / `SIMTEST-` で始める（正式データから自動除外される）。
- 参加者に見える文言（ボタン名、案内、振り返りの質問）は倫理審査で承認済みの資料 4・5 と対応している。変えるときは必ず先に使用者に確認。
- 研究データ（実験 JSON、Tobii の TSV・録画）はリポジトリに入れない。暗号化外付け HDD で管理（研究終了 2027-03-31 から 5 年保管）。

## 実験機（Windows + Tobii Pro Lab）での注意
- 表示倍率 100%、1920×1080、Chrome 全画面（F11）。全参加者で同じ PC を使う。
- コマンドで日本語が化ける場合：`set PYTHONUTF8=1`。Python 3.10 以上。オフライン版は標準ライブラリだけで動く。
- Windows ではまだ serve.py と eyetools を実機で動かしていない（Linux で検証済み）。

## いまやること：Tobii での試し録り（TEST-01）
目的：Pro Lab の書き出し（TSV）が eyetools で読めるか、クリック同期が取れるかを確かめる。
1. Pro Lab：Screen プロジェクト → Calibration + Screen Recording（Native）→ Record で participant/recording を `TEST-01`。
2. 校正後、Chrome（全画面）で実験画面を開き、参加者番号 `TEST-01` で 設定 → 練習 → 本番 6 回 → 振り返り まで通す。
   **録画開始より前に実験画面をクリックしない**（同期はクリックで取る）。
3. 終了後、実験画面が自動で JSON/CSV を保存する。Pro Lab：Analyze → Data export、Gaze filter は Tobii I-VT (Fixation)、
   列：Recording timestamp / Eye movement type / Eye movement type index / Gaze event duration / Fixation point X,Y /
   Validity left,right / Event / Event value / Recording start time。形式 Standard (.tsv)。
4. `cd tools/aitest_analysis` → `python -m eyetools.cli check TEST-01.json` → `python -m eyetools.cli process TEST-01.json TEST-01.tsv --out out/`
5. 確認：列名エラーなし、`sync.ok = true`・一致クリック数が 10 以上、`TEST-01_toi_metrics.csv` に第2〜6回の reading 行がある、
   UI B なら BTN（PANEL_BUTTONS）への訪問が別に数えられている。
   列名が違えば `eyetools/gaze.py` の CANDIDATES に追加。マウスイベントが無ければ書き出し時の Event 列を確認。

## 未決事項（使用者と相談中）
- 正式に使う刺激（推奨：generic_unranked 単一）。例文をそのまま送った場合の H1 の数え方。H1 変更の教授確認。
- オフライン版は予備（盲評で自然さ 2/5、オンライン版は約 3.2/5）。正式に使うなら倫理書類の「生成AI」の書き方を確認。
- 研究室内の人による試運転（各 UI 2 名程度）。

## 関連文書（claude.ai プロジェクト「设计实验相关」にある）
研究計画書_倫理審査申請_要点 / 第二実験_分析計画（簡略版）/ 視線計測実験_システム変更記録 / 第二実験_オフライン版_設計と検証 / Tobii 操作手冊
