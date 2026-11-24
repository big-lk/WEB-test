# オフライン版（生成AIを使わない予備の実験方式）

生成AI（OpenAI）を一切呼ばず、事前に書いて登録した文だけで「会話AI」と「AIが読み取ったこと」を作る。
インターネットも API キーも不要。同じ入力なら必ず同じ出力（再現・追跡が可能）。

## 使い方
- 研究室の PC で完全オフライン：`python3 tools/offline/serve.py --open` → http://127.0.0.1:8765/aitest/
- 公開サイトで試す：`https://lkdesigner.top/aitest/?engine=offline`（実験者画面に「offline-tree」と表示される）

## 仕組み
- `api/aitest/offline_corpus.py`：登録した文の全て（希望の型・料理語彙・細部への応答・刺激ごとの続きの文・回ごとの文）
- `api/aitest/offline_engine.py`：参加者の文を規則で読み取り（型・料理・「なし」の項目・訂正・関わり方の指定）、
  登録文を選んで組み立てる。第3・4回の刺激文はオンライン版と同じ関数（登録候補から決定的に選ぶ）を使う。
- 応答の `meta.offlineTrace.nodes` に、使った文（節点）の ID が残る。`inputHash` で同じ入力かを確かめられる。

## テスト
- `python3 tools/offline/quality.py --data data/*.tsv`：実際の模擬参加者の入力を全条件で再生し、品質チェック（Q01〜Q10）
- `python3 tools/offline/fuzz.py --n 3000`：部品から組み立てた発話で総当たり（例外・再現性・品質）
- `python3 tools/offline/sim_cli.py`：AI 参加者／人が端末から 6 回の対話を行うためのクライアント
