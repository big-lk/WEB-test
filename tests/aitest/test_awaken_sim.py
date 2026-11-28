"""試作 ?stimulus=concern&guide=awaken：画面の文言（app.js）と模擬参加者が読む文言（sim_user.py）がそろっていること、
模擬の答えの読み取りが版ごとに正しいことを確かめる（通信なし）。"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from tools.offline import sim_user as su  # noqa: E402

js = (ROOT / "public" / "aitest" / "app.js").read_text(encoding="utf-8")

# 1) 「よくある例」は画面と模擬で同じ
block = js[js.index("const AWAKEN_HINTS = {"):js.index("const AWAKEN_REMINDER")]
js_hints = dict(re.findall(r'(\w+): "([^"]+)"', block))
assert js_hints == su.AWAKEN_HINTS, "app.js と sim_user.py の例がずれている"
assert re.search(r'const AWAKEN_REMINDER = "([^"]+)"', js).group(1) == su.AWAKEN_REMINDER
for line in ("最近、誰かと家で食事をしたときのことを、一つ思い浮かべてください。", "「自分はいつもこうしている」「ここは人に決められるより、自分で決めたい」",
             "ほかの人に決められるといちばん引っかかるのはどれですか。", "そうするのは、何のためですか", "どのくらい決まっていますか"):
    assert line in js and line in su.awaken_screen_text("guided"), line
# 登録文（一般的なやり方）の言い回しを、例にそのまま入れていない
from api.aitest import core  # noqa: E402
for key, spec in core.CONCERN_TOPICS.items():
    assert spec["form"] not in su.AWAKEN_HINTS[key], key

# 2) 版ごとの画面
assert "かっこの中は、よくある例" not in su.awaken_screen_text("chips") and "前の日から" not in su.awaken_screen_text("chips")
assert "前の日から" in su.awaken_screen_text("hints") and "思い浮かべて" not in su.awaken_screen_text("hints")
assert "前の日から" not in su.awaken_screen_text("words") and "思い浮かべて" in su.awaken_screen_text("words")

# 3) 読み取り
t = su.parse_awaken_talk("選択：5,6,11\n一番：5\n次：6\nどうする：食卓の上の明かりだけにする\n何のため：夫がよく話すから\n強さ：2\nその他：スマホ｜食卓に置かない", "guided")
assert (t["top"], t["second"], t["strength"], t["why"]) == ("light", "sound", 2, "夫がよく話すから") and t["other"] == {"what": "スマホ", "how": "食卓に置かない"}
assert "あなたのやり方：部屋の明るさは、食卓の上の明かりだけにする。夫がよく話すから。" in su.awaken_pretalk(t)
t = su.parse_awaken_talk("選択：12\n一番：12\n次：0\nどうする：なし\n何のため：なし\n強さ：なし\nその他：なし", "chips")
assert t["top"] == "none" and "特にない" in su.awaken_pretalk(t)
t = su.parse_awaken_talk("選択：4\n一番：4\n次：0\nどうする：すぐ洗う\n何のため：なし\n強さ：3\nその他：なし", "chips")
assert t["strength"] == 0 and t["why"] == "" and "ひとこと：すぐ洗う" in su.awaken_pretalk(t)

# 4) 対話の模擬に渡る形
p = su.build_payload({"turn": 3, "persona": {}, "pretalk": "X", "reminder": su.AWAKEN_REMINDER}, "m")["input"]
assert "【対話の前の画面で、自分で答えたこと】X" in p and su.AWAKEN_REMINDER in p
assert "対話の前の画面で" not in su.build_payload({"turn": 3, "persona": {}}, "m")["input"]
print("ok test_awaken_sim")
