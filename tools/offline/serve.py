"""オフライン実験サーバー（インターネット・APIキー不要。Python 3.10 以上の標準ライブラリだけで動く）。

  python3 tools/offline/serve.py            → http://127.0.0.1:8765/aitest/ を開く
  python3 tools/offline/serve.py --port 9000 --open

実験画面（public/aitest）をそのまま配信し、/api/aitest/turn と /api/aitest/health をオフライン版エンジンで答える。
画面の URL に ?engine=offline を付けなくても、このサーバーでは常にオフライン版になる。
"""
from __future__ import annotations
import argparse, os, sys, webbrowser
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
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
    a = ap.parse_args()
    import mimetypes
    mimetypes.add_type("text/javascript", ".js")
    server = ThreadingHTTPServer((a.host, a.port), OfflineHandler)
    url = f"http://{a.host}:{a.port}/aitest/"
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
