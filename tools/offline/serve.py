"""オフライン実験サーバー（インターネット・APIキー不要。Python 3.10 以上の標準ライブラリだけで動く）。

  python3 tools/offline/serve.py            → http://127.0.0.1:8765/aitest/ を開く
  python3 tools/offline/serve.py --port 9000 --open

実験画面（public/aitest）をそのまま配信し、/api/aitest/turn と /api/aitest/health をオフライン版エンジンで答える。
画面の URL に ?engine=offline を付けなくても、このサーバーでは常にオフライン版になる。

  python3 tools/offline/serve.py --online --open
    手元でオンライン版（実際の生成AI）を試す。鍵は環境変数、またはリポジトリ直下の .env（コミットされない）から読む：
      OPENAI_API_KEY=...      gpt-6-luna など
      ANTHROPIC_API_KEY=...   claude-haiku-5-5
    参加者番号を TEST- で始め、URL に ?model=claude-haiku-5-5 などを付けるとモデルを切り替えられる。料金がかかる。
    --online では、api/aitest/*.py を書き換えると自動で再起動する（指示文を直しながら実際の出力を確かめるため）。
"""
from __future__ import annotations
import argparse, os, sys, webbrowser
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ONLINE = "--online" in sys.argv
if ONLINE:
    os.environ.pop("EXPERIMENT_ENGINE", None)
    env_file = ROOT / ".env"
    if env_file.exists():  # 鍵の値は表示しない
        for line in env_file.read_text(encoding="utf-8").splitlines():
            key, sep, value = line.strip().partition("=")
            key = key.replace("export ", "").strip()
            if sep and key and not key.startswith("#") and not os.environ.get(key):
                os.environ[key] = value.strip().strip('"').strip("'")
else:
    os.environ["EXPERIMENT_ENGINE"] = "offline"
os.environ.setdefault("EXPERIMENT_RATE_LIMIT_PER_MINUTE", "120")
sys.path.insert(0, str(ROOT))
from api.aitest import core  # noqa: E402

PUBLIC = (ROOT / "public").resolve()


class OfflineHandler(core.Handler):
    def app_path(self) -> str | None:
        raw = self.path.split("?", 1)[0].split("#", 1)[0]
        if raw in ("/api/aitest/turn", "/api/turn"):
            return "/api/turn"
        if raw in ("/api/aitest/health", "/api/health"):
            return "/api/health"
        return raw or "/"

    def translate_path(self, path: str) -> str:
        raw = (self.app_path() or "/").lstrip("/")
        if raw in ("", "aitest"):
            raw = "aitest/index.html"
        if raw.endswith("/"):
            raw += "index.html"
        target = (PUBLIC / raw).resolve()
        if PUBLIC not in target.parents:
            return str(PUBLIC / "aitest" / "index.html")
        return str(target)

    def do_POST(self) -> None:
        # 模擬参加者（開発用）。--online のときだけ、試験用の番号（SIMTEST-）にだけ応じる。詳しくは sim_user.py。
        if self.path.split("?", 1)[0] == "/api/aitest/_simuser":
            import json
            from tools.offline import sim_user
            try:
                if os.environ.get("EXPERIMENT_ENGINE") == "offline":
                    raise ValueError("模擬参加者は --online のときだけ使えます。")
                size = int(self.headers.get("Content-Length", "0"))
                body = json.loads(self.rfile.read(size).decode("utf-8"))
                if not str(body.get("sessionId", "")).upper().startswith("SIMTEST-"):
                    raise ValueError("模擬参加者は SIMTEST- で始まる番号でだけ使えます。")
                if int(body.get("turn", 1)) == 0 and body.get("kind") == "smalltalk":   # 試作 smalltalk：対話の前の雑談の、鍵になる二問
                    body["questions"] = [
                        {"name": "prep", "question": "誰かを食事に招くとき、準備はどうしたいですか。",
                         "options": [{"id": "before", "label": "来る前に全部済ませておきたい"}, {"id": "together", "label": "来てから一緒に仕上げたい"}]},
                        {"name": "keep", "question": "準備の時間が足りなくなったら、どちらを取りますか。",
                         "options": [{"id": "dishes", "label": "品数や見た目をそろえる"}, {"id": "time", "label": "相手と一緒にいる時間をとる"}]}]
                    text, _raw, latency = core.call_model(sim_user.build_talk_payload(body, core.DIALOGUE_MODEL))
                    talk = sim_user.parse_talk(text, body["questions"])
                    labels = [next(o["label"] for o in q["options"] if o["id"] == talk[q["name"]]) for q in body["questions"]]
                    self.send_json(200, {"talk": talk, "labels": labels, "latencyMs": latency})
                    return
                if int(body.get("turn", 1)) == 0:   # 試作 prechoice：対話の前の選択
                    body["options"] = [{"id": k, "label": v["phrase"]} for k, v in core.PRECHOICE_VALUES.items()]
                    text, _raw, latency = core.call_model(sim_user.build_choice_payload(body, core.DIALOGUE_MODEL))
                    values = sim_user.parse_choice(text, body["options"])
                    self.send_json(200, {"values": values, "labels": [core.PRECHOICE_VALUES[v]["phrase"] for v in values], "latencyMs": latency})
                    return
                text, _raw, latency = core.call_model(sim_user.build_payload(body, core.DIALOGUE_MODEL))
                self.send_json(200, {"text": sim_user.clean(text), "latencyMs": latency})
            except Exception as exc:  # 開発用なので、理由をそのまま返す
                self.send_json(400, {"error": str(exc)[:300]})
            return
        super().do_POST()

    def do_GET(self) -> None:
        raw = self.path.split("?", 1)[0]
        if raw in ("/", "/aitest"):
            self.send_response(302)
            self.send_header("Location", "/aitest/")
            self.end_headers()
            return
        super().do_GET()


def watch_and_restart() -> None:
    """サーバー側のコードが書き換わったら、同じ引数で起動し直す（--open は二度目から外す）。"""
    import threading, time
    files = sorted((ROOT / "api" / "aitest").glob("*.py")) + [Path(__file__).resolve(), Path(__file__).resolve().with_name("sim_user.py")]
    stamp = lambda: tuple((f.stat().st_mtime_ns, f.stat().st_size) for f in files if f.exists())  # noqa: E731
    first = stamp()

    def loop() -> None:
        while True:
            time.sleep(1.0)
            try:
                changed = stamp() != first
            except OSError:
                continue
            if changed:
                time.sleep(0.5)  # 書き込みの途中で読まないよう少し待つ
                print("コードが変わったので再起動します。", flush=True)
                os.execv(sys.executable, [sys.executable] + [x for x in sys.argv if x != "--open"])

    threading.Thread(target=loop, daemon=True).start()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--open", action="store_true")
    ap.add_argument("--online", action="store_true", help="オンライン版（実際の生成AI）で動かす。鍵が必要")
    a = ap.parse_args()
    import mimetypes
    mimetypes.add_type("text/javascript", ".js")
    server = ThreadingHTTPServer((a.host, a.port), OfflineHandler)
    url = f"http://{a.host}:{a.port}/aitest/"
    if ONLINE:
        keys = "、".join(f"{label} {'あり' if os.environ.get(name, '').strip() else 'なし'}"
                        for label, name in (("OpenAI の鍵", "OPENAI_API_KEY"), ("Claude の鍵", "ANTHROPIC_API_KEY")))
        print(f"オンライン版サーバー：{url}（停止は Ctrl+C）\n  会話AI {core.DIALOGUE_MODEL} / 分析AI {core.ANALYSIS_MODEL}、{keys}")
    else:
        print(f"オフライン実験サーバー：{url}（停止は Ctrl+C）")
    if ONLINE:
        watch_and_restart()
    if a.open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
