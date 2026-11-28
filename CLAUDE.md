# このリポジトリでの作業メモ（Claude Code 用・引き継ぎ）

使用者：孔維鵬（札幌市立大学大学院 デザイン研究科 柿山研究室）。返答は簡体字中国語、結論を先に。
このリポジトリは個人サイト lkdesigner.top（Vercel）。研究で触るのは **第二実験（視線計測、UI A / UI B）** の部分だけ。
ほかのページ（ポートフォリオなど）は触らない。

## 第二実験の場所
- 実験画面：`public/aitest/`（index.html, app.js, practice.js, logging_patch.js, styles.css）
- サーバー：`api/aitest/core.py`（オンライン版・OpenAI）、`offline_engine.py` + `offline_corpus.py`（オフライン版・生成AIなし）
- オフライン版ローカルサーバー：`tools/offline/serve.py` → http://127.0.0.1:8765/aitest/
- 分析：`tools/aitest_analysis/analyze.py`、視線：`tools/aitest_analysis/eyetools/`
- テスト：`python tests/aitest/test_offline_engine.py`、`python tests/aitest/test_v17_offline.py`、`python tests/aitest/test_model_switch.py`、`node tests/aitest/example_sentence_test.mjs`、`node tests/aitest/setup_preset_test.mjs`、`python tests/aitest/test_personal_closing.py`、`python tests/aitest/test_open_style.py`
- 公開版：https://www.lkdesigner.top/aitest/ （オフライン版で試す：`?engine=offline`）
- 変更を push するときは `main` と `aitest-v1.7-stability` の両方へ。

## 画面の配置（2026-11-26 追加、ブランチ aitest-layout-side）
- URL に何も付けなければ従来の配置（公開版と同じ）。`?layout=side`＝間隔だけ広げた版、`?layout=flow`＝部品を一本の流れに並べ直した版。
  どちらも右側パネル 760px、ボタンは本文の右に縦並び、カード位置は UI A / UI B で同じ、例文の場所は確保済み。
- side / flow の本番では、ボタンを押した後のトースト（例文作成へ誘導する表示）を出さない。練習では出す。
- flow は `closingMode: "personal"` をサーバーに送る：第1〜5回の回答の末尾を、固定の終止文ではなく「参加者の言葉を一つ入れた、次の回の主題についての依頼文」にする。
  疑問文にはしない（R06 は従来どおり）。条件を満たさなければ固定の終止文に戻し、`meta.closingFallback` に残す。オフライン版は固定の終止文のまま。
  検証：`python tests/aitest/test_personal_closing.py`（偽の応答による。オンラインの実際の出力は未確認）。
- 末尾の方式は `?closing=fixed|personal|gap` で切り替えられる（比較用）。gap＝固定の終止文の直前に「次の主題はまだ決まっていない」ことを短い陳述文で入れる。
  同じ台本で 3 方式を並べる：`python tools/aitest_analysis/closing_compare.py`（`--engine online` は OPENAI_API_KEY が必要）。
  オフライン版の personal / gap の文面は試作（`offline_engine.py` の PERSONAL_CLOSINGS / GAP_STATEMENTS）。正式に使う前に使用者の確認が必要。
- ログは logging-patch-v3：`TEXT_1〜3`（カード本文）、`EXAMPLE_TEXT`、`layout`、例文作成後とパネルスクロール時の `aoi_layout`。
- 回答とカードの自動チェック：`python tools/aitest_analysis/quality_check.py SESSION.json`（基準はプロジェクト文書「第二実験_AI応答_改善基準と達成度評価」）。
- 配置の検証は Linux の Chrome（Noto フォント）で行った。実験機（Windows）での見え方と視線の分離は未確認。

## モデルの切り替え（2026-11-27 追加、ブランチ aitest-layout-side）
- 既定のモデルを `gpt-5.4-nano` から `gpt-6-luna` に変えた（使用者の指示。料金は Claude Haiku 5.5 と同じ 0.10 / 0.50 USD）。環境変数 `EXPERIMENT_DIALOGUE_MODEL` / `EXPERIMENT_ANALYSIS_MODEL` で変えられる
  （従来の `OPENAI_DIALOGUE_MODEL` / `OPENAI_ANALYSIS_MODEL` も有効）。
- 名前が `claude-` で始まるモデル（`claude-haiku-5-5`）は Claude API へ送る。鍵は `ANTHROPIC_API_KEY`。OpenAI は従来どおり `OPENAI_API_KEY`。
- 試験用の参加者番号（`TEST-` / `PREVIEW-` / `SIMTEST-`）に限り、URL の `?model=gpt-6-luna|claude-haiku-5-5|gpt-6.1-terra|gpt-5.4-nano` で切り替えられる。
  正式な参加者番号では無視される。使ったモデル・トークン数は各回の `meta`（dialogueModel, modelOverride, dialogueUsage など）に残る。
- 手元で実際のモデルを試す：`.env.example` を `.env` に複製して鍵を書く（鍵は使用者が自分で書く。Claude に鍵を扱わせない）→
  `python tools/aitest_analysis/model_compare.py --check`（接続確認）→ `python tools/aitest_analysis/model_compare.py`（台本3本×6回の比較）。
  画面で試す：`python tools/offline/serve.py --online --open`。
- 検証：`python tests/aitest/test_model_switch.py`（偽の通信による。**実際の API での動作は未確認**）。
- 正式実験で Claude を使う場合は、研究計画書の「OpenAI Responses API」の記載と外部送信先の説明が変わるので、先に指導教員へ報告する。

## 実際のモデルで確かめた結果と、切り替えられる項目（2026-11-27 追加）
詳しい数字はプロジェクト文書「第二実験_早報_2026-11-27」。以下はどれも **既定の動作を変えない**（指定したときだけ効く）。
- 分析AI の指示文の版：`ANALYSIS_PROMPTS`（v1＝従来。v2〜v6 は gpt-6-luna の実際の出力を見て直したもの）。既定は v1。
  環境変数 `EXPERIMENT_ANALYSIS_PROMPT=v6` で切り替える（試験用の参加者番号はリクエストの `analysisPrompt` でも選べる）。
  gpt-6-luna では v1 だとカードがほとんど更新されない（新しい入力がカードに入ったのは 10/17）。v6 は 17/17、調整に使っていない台本でも 17〜18/18。
  指示文はモデルに合わせて調整したものなので、**モデルを変えたら調整し直す**（claude-haiku-5-5 では v5 より v2 の方が良かった）。
  v2 以降では、第3・4回の事象カードの文面を必ず登録済みのものに置き換える（`enforce_generic_panel(force_registered=True)`）。
- 末尾の方式：`?closing=fixed|gap|gap2|personal`。実際の出力では personal（参加者の言葉を引用）と gap が安定。gap2 は試作（やり直しが多い）。
  第5回で gap / personal が必ず失敗する不具合（末尾の文が代筆の除去に巻き込まれる）は修正済み。
- 回答の長さ：`lengthMode: "target"`（試験用の番号だけ）。やり直しが増えるので採用は勧めない。
- 空の枠：分析AI が中身のない項目を返したら、「まだ決めていないこと」「最初に選んだ場面」（従来からある文面）に置き換える。
- 手元で指示文を直しながら実際の出力を確かめる：`python tools/offline/serve.py --online`（`api/aitest/*.py` を書き換えると自動で再起動）。
- 視線：`eyetools/extra_metrics.py`（焦点のカードへの注視、最初に見るまでの時間、注視の並び、見た／書いたの分類）。記述・探索用。
  「書いた」の判定は語の一致による機械的なもので、人の確認が必要。

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
6. （2026-11-27 追加）Pro Lab から TSV を書き出す前でも、プロジェクト内の生の記録から管線を通せる：
   `python -m eyetools.cli convert <プロジェクト>/Data/Recordings/<ID> TEST-01.tsv` → あとは 4 と同じ。
   注視の判定は I-VT の近似なので、**正式な分析には Pro Lab のエクスポートを使う**。TEST-01 の実データで確認済み
   （同期：クリック 36/36 一致、残差 0.7 ms。第 2〜6 回の reading 行あり、ボタンへの訪問は別に数えられる）。
   Pro Lab の実際のエクスポートの列名はまだ未確認。書き出すときは列に `Recording date`（できれば `Recording date UTC` と
   `Recording start time UTC` も）を足す：記録開始の時刻が読めると同期の探索範囲が狭まる。

## 試し録り TEST-02 / TEST-03（2026-11-27 追加）
使用者が実験機で、従来の配置（TEST-02）と `?layout=flow`（TEST-03）を UI B・「一般的な受け取り（明示）」で録る。
手順はプロジェクト文書「第二実験_実験機チェックリスト_2026-11-27」。第 5 回の回答の後、第 6 回の入力欄を押す前に、
カード1本文→カード1ボタン→カード2本文→カード2ボタン→カード3本文→カード3ボタンの順に各 2 秒ほど見てもらう。
- 比較：`python -m eyetools.cli separation TEST-02.json TEST-02.tsv TEST-03.json TEST-03.tsv --script-turn 6 --out out/`
- TSV の読み取りは、列名の単位・時刻の単位・文字コード・Sensor 列の違いを吸収するようにした（合成データで確認。**正式なエクスポートでは未確認**）。
  読めなければ `<参加者>_qa.json` の `gaze.columns_used` と実際の列名を見比べ、`eyetools/gaze.py` の CANDIDATES に足す。
- `check` / `batch` は各参加者の設定（刺激・配置・モデル・分析の指示文・末尾）を表示し、正式データの中で違えばエラーにする。
  刺激は `standard` と `generic_unranked` の両方を通す（未決のため）。決まったら `--variant` で固定する。
- 参考：TEST-01（従来の配置、古いログで本文の矩形は近似）では、本文／ボタンへの注視のうち境目から 0.5° 以内が約 34%（注視時間で約 39%）、
  1° 以内が約 68%。小さい標的を押す直前 1 秒で最も近い注視点までの距離は、下位 25% が 0.75°、中央値が 1.10°（誤差の上限寄りの目安）。
- 設定画面の事前選択（ブランチ aitest-layout-side、**main には未反映**）：URL に `?condition=UI_A|UI_B`、`?variant=generic_unranked` などを付けると、
  設定画面の「画面タイプ」「解釈のずれ」があらかじめ選ばれる。付けなければ従来どおり。使った場合はログに `setup_preset` が残る。
  正式実験では UI ごとのブックマークを作る想定（例：`…/aitest/?layout=flow&condition=UI_B&variant=generic_unranked`）。
- 本番の事前確認（11/27 15:52〜15:55、flow の構成＝UI B・generic_unranked・末尾 personal、台本 A/B/C × 6 回）：18 回すべて成功、
  末尾の差し戻しなし、各回 6〜13 秒、meta は gpt-6-luna / v6。台本 B の第 4 回で、その回の入力（「仕上げは二人で台所に」）がカードに入らなかった（第 6 回で入る）。

## 試し録りの結果（2026-11-27 夕方、実験機。記録名 AI1＝従来の配置、AI2＝flow。どちらも UI B・generic_unranked）
- **Pro Lab（25.7.1400）の正式なエクスポートは読めた。** 列名に単位は付かない（`Recording timestamp` はマイクロ秒、間隔から判定）。
  継続時間の列は `Eye movement event duration`。`Sensor`、`Recording date UTC`、`Recording start time UTC` あり。
  1 つのファイルに複数の記録が入る（`Recording name` で分かれる）ので、読み取りは参加者番号と同じ名前の記録だけを使う。
- 同期：AI1 24/24、AI2 28/28（残差 0.8 ms）。両方とも本番は全画面 1920×1080。
- 本文／ボタンへの注視のうち、反対側の矩形から 0.5° 以内：従来 19.5% → flow 0.0%。1° 以内：従来 65.9% → flow 2.0%。
- 検証時の正確度（Pro Lab の値）：AI1 0.92°（精度 SD 0.97°）、AI2 1.14°（SD 0.60°）。同じ日の別の記録（aitest1）は 0.59°（SD 0.14°）。
  使用者が現場で追加で確かめたこと（口頭の報告）：眼鏡ありの使用者は校正し直しても 1° 前後（最良 0.79°）、
  眼鏡なしの 2 名は約 0.5°、使用者も眼鏡なしなら約 0.5°。ずれの主な原因は眼鏡で、機器そのものは公称（0.45°）に近い。
  **校正の基準（使用者、11/27）：検証の正確度が 1° 以下なら受け入れる。** 眼鏡の参加者は 1° 前後になる前提で設計する。
  詳しくはプロジェクト文書「第二実験_試し録り結果_2026-11-27」。
- 読解区間の追跡率は 0.69〜0.84。入力中は 0.50〜0.78（キーボードを見るため）。
- 「決めた順に見る」区間は記録の中で特定できなかった（比較は境目の割合で行った）。
- AI1 / AI2 は番号が TEST- で始まらないので、道具は正式データとして扱う。試し録りとして手で除くこと。
- データはリポジトリに入れていない。

## ?layout=flow2（2026-11-28 追加、ブランチ aitest-layout-side。**main には未反映**）
使用者が実験機で通して挙げた 9 点をまとめて入れた試作。既定・side・flow の動作と文言は変えていない。詳しくはプロジェクト文書「第二実験_早報_2026-11-28」。
- 画面（`public/aitest/app.js` の `FLOW2`、`styles.css` の `html[data-flow2]`）：
  送信ボタンを押すと入力欄の上の行に確認（「この内容で送信しますか。」「送信する」「書き足す」）。Enter は改行。
  中身のない枠（pending-meaning、anchor-context）は見出しだけの短い帯（ボタンなし）。
  例文は、書き方の型（破線）とボタンの選択から作った文（実線）を見分け、作り直しで変わった文に色、もとになったボタンに同じ色の縁。
  事前の状態は眠気と緊張だけ（confidence / familiarity は null）。完了時に視線計測の停止を求めない。
  入力の案内は ?invite=rich の文言＋第1回に「3文くらいを目安に」「お二人ならではのこと」。
- サーバー：`dialogueStyle: "open"`（flow2 が送る。`?style=open|default`）＝回答を長めにし、入力の具体さに合わせる。
  第1回の入力が 8 字未満なら案を出さず、受け取った範囲と足りない点を述べる（`meta.inputLevel`）。末尾は「お二人ならではの…を二つ三つ」。
  分析AI の指示文 v7（title＝項目名の名詞句、meaning＝AI の言葉で「〜と受け取っています。」）。試験用の番号では flow2 が v7 を送る（`?prompt=v1〜v7`）。
  **正式な番号では環境変数 `EXPERIMENT_ANALYSIS_PROMPT=v7` が必要**（いまの本番は v6）。v7 では「中心」を第4回の優先の項目だけに限る。
- ログ：`layout: "flow2"`、`SEND_CONFIRM`、空の帯は `EMPTY_n`（eyetools では PANEL に数えない）、`send_confirm_shown / cancelled`。
- 実際の出力（gpt-6-luna、使用者の Mac の手元サーバー、12 巡・約 390 回。台本 9 本のうち 3 本は調整に使っていない）。
  従来（v6、36 回）→ 最終版（60 回）：カードの本文が入力の写し 27/88 → 1/143、title が本文の縮約 38/88 → 16/143、
  回答の長さは通常の入力で 191〜233 字 → 260〜308 字（第5回 141 → 227）、末尾が固定の終止文に戻った回 2/30 → 0/50、
  回答のやり直し 4/36 → 1/60、第4回より前に「中心」が付いた回 6/18 → 0/30。画面を通した実際の 6 回も確認済み。
  open の末尾は決まった形（「次は、<主題>を、お二人ならではの<例>も交えて二つ三つ書いてください。」）。引用は任意。
  第5回は、修正を受けたあと参加者が書いた内容を二〜三文で具体的に描く。
  1 回あたりの待ち時間（手元サーバー、1 セッションだけを順に実行）：7.0 / 8.2 / 14.2 / 16.8 / 10.6 / 8.9 秒。
  刺激 `standard` でも open＋v7 は通る（4 台本×6 回、失敗・差し戻しなし）。ただし「中心」を第4回の項目だけに限る処理は generic 系の刺激だけに入れてある
  （standard では第4回より前に「中心」が付いた回が 4 回あった）。
- （11/28 午後、使用者の指摘：「100 字書いた人に 100 字ほどの回答では言い直しと変わらない」「模擬には性格と必要の違う人を入れる」）
  open では、回答の本文（末尾の依頼文を除く）の下限を入力の字数から決める：`max(回ごとの基準, 入力の字数×2.2)`、上限 500 字（第5回 440 字。
  1920×1080 で回答が対話欄に収まるのは 720 字ほどまで）。入力の一文ごとに具体化を二文ずつ書き、言い直しは冒頭の一文までにする。
  入力が長くて下限が基準を超えたときだけ、下限の 85% に届かない回答をやり直す。`meta.bodyMin` に下限が残る。
  模擬参加者：`tools/offline/sim_user.py`（手元の `serve.py --online` の `/api/aitest/_simuser`、SIMTEST- の番号だけ）。
  人物設定は `tools/offline/personas.json`（8 名：長文で自分で決めたい人、一言だけの人、遠慮がちな人、批判的な人、脱線する人、条件を並べる人、
  急いでいる人、感情が先に立つ人）。AI の実際の回答と右側の表示を見て次の入力を書く。**AI による模擬であり、人の代わりにはならない。**
  同じ入力での比較（長文の 3 名、各 6 回）：本文／入力 1.5〜2.0 倍 → 2.2〜2.6 倍、本文のうち入力の言い直し 22〜32% → 6〜16%。
- **未確認**：実験機（Windows）での見え方、人の参加者、所要時間（回答と入力が長くなる分）。
- **参加者に見える新しい文言は候補**。資料 4・5 との対応と、事前の状態を 4 項目から 2 項目にすることは、使用者と指導教員の確認が要る。
- 検証：`python tests/aitest/test_open_style.py`（偽の応答。組み立てと基準だけ）。
- 手元で試す：`python tools/offline/serve.py --online` → `http://127.0.0.1:8765/aitest/?layout=flow2&condition=UI_B&variant=generic_unranked`（番号は TEST- で始める）。

## 未決事項（使用者と相談中）
- 正式に使う刺激（推奨：generic_unranked 単一）。例文をそのまま送った場合の H1 の数え方。H1 変更の教授確認。
- オフライン版は予備（盲評で自然さ 2/5、オンライン版は約 3.2/5）。正式に使うなら倫理書類の「生成AI」の書き方を確認。
- 研究室内の人による試運転（各 UI 2 名程度）。

## 関連文書（claude.ai プロジェクト「设计实验相关」にある）
研究計画書_倫理審査申請_要点 / 第二実験_分析計画（簡略版）/ 視線計測実験_システム変更記録 / 第二実験_オフライン版_設計と検証 / Tobii 操作手冊
