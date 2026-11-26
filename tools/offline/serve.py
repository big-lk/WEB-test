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

    def do_GET(self) -> None:
        raw = self.path.split("?", 1)[0]
        if raw in ("/", "/aitest"):
            self.send_response(302)
            self.send_header("Location", "/aitest/")
            self.end_headers()
            return
        super().do_GET()


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
