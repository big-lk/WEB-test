"""オフライン版の総当たり・乱数テスト。参加者の発話を部品から組み立て、何千セッションも流して
例外・検証コード・品質チェック（quality.py）・再現性（同じ入力→同じ出力）を確かめる。
python fuzz.py --n 2000 --seed 1"""
from __future__ import annotations
import argparse, collections, json, random, sys, traceback
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from api.aitest.offline_engine import run_offline  # noqa: E402
from api.aitest import offline_corpus as OC  # noqa: E402
from quality import check_session  # noqa: E402

ANCHORS = {
    "busy": ["仕事で疲れている恋人が、気をつかわずにくつろげて、食後に少し元気になっている夜にしたい。",
             "最近忙しい友達が、静かに休めるだけじゃなくて、くだらない話で笑って帰れる夜にしたい。",
             "疲れている母に、気を遣わせずにゆっくりしてもらいたい。", "忙しい姉と、のんびりご飯を食べたい。"],
    "reunion": ["久しぶりに幼なじみとご飯。気取らずに昔みたいに話せる夜にしたい。",
                "久しぶりに会う大学の友達と、時間を気にせずゆっくり話して、また会おうと思える夜にしたい。",
                "半年ぶりに会う兄と、自然に話せる夜にしたい。", "久しぶりの友達と気まずくならずに過ごしたい。"],
    "milestone": ["付き合って1年。特別すぎず、いつもの二人のまま少しだけ記念日っぽさがある夜にしたい。",
                  "両親の結婚記念日を家で家族で祝う。大げさにせず、二人がうれしく感じる夜にしたい。",
                  "就職が決まった友達を、さりげなく祝いたい。", "誕生日を大げさにしないで祝いたい。"],
    "gratitude": ["いつも支えてくれる母に、重くならずに感謝が伝わる夕食にしたい。",
                  "家事を多めにやってくれているルームメイトに、さらっとお礼が伝わる夜にしたい。",
                  "お世話になった先輩に、気楽な感じでお礼をしたい。", "祖母に感謝を伝えたいけど、重くしたくない。"],
}
T1 = ["{who}に気楽に過ごしてほしい。食後にほっとしてたらいいな。", "笑って話せて、帰るときに楽しかったって思ってほしいです。",
      "気をつかわずにだらっとくつろげる感じにしたい。", "いつも通りの雰囲気で、少しだけ特別な感じがいいです。",
      "ゆっくり話せて、また会いたいなって思える夜にしたいです。", "重くならずに、ありがとうが伝わる感じ。",
      "食べ終わったあと元気になっててほしい。", "普通に楽しく食べたいです。"]
T2 = ["あと、二人で一緒に作る感じも大事にしたい。", "料理は簡単でいいので、気楽さを大事にしたいです。",
      "かしこまった空気は避けたい。照れくさいので。", "相手の好物を出したいです。", "時間を気にせず長居できる感じがいい。",
      "スマホは見ないで話に集中したい。", "あと、しんみりした空気は避けたいです。", "お金はかけたくない。安いものでいい。"]
T3 = ["食事中はだらだら話して、テレビ見ながらでもいい。", "くだらない話で笑い合える距離感がいい。",
      "会話は近況とか普通の雑談でいい。", "静かすぎるのは嫌で、わいわいしたい。", "仕事の話はしないで、気楽に話したい。",
      "乾杯の挨拶とかはなしで、普通に食べたい。", "ソファでだらっと食べたい。", "特に考えてないです。"]
T4_CORR = ["ちょっと違う。{key}はいらないです。{pos}", "{key}は違います。{pos}", "待って、{key}は頼んでないです。{pos}",
           "{key}はなしで。{pos}"]
T4_OK = ["二人で台所に立って適当に作りながら笑ってる感じ。", "ポテトとかカップ麺をつまみながらだらだら話してる。",
         "鍋をつつきながら近況を話してる感じです。", "いつもの家ごはんで、テレビ見ながら笑ってる。", "好物を一緒に食べて、普通に話してる。"]
POS = ["二人で一緒に作るのがいいです。", "いつも通りで十分です。", "笑って話せればそれでいい。", "料理は簡単でいい。",
       "好物を一緒に食べるだけでいい。", ""]
T5_CORR = ["{key}を優先とは言ってないです。{pos}", "{key}は要らないです。{flow}", "それより{alt}のほうが先です。{flow}"]
T5_OK = ["最初に乾杯して、食べながら話して、食後はお茶でゆっくり。", "作りながら食べて、片付けも一緒にやる流れで。",
         "料理は一度に出して、あとはずっと話していたい。", "普通に食べて、片付けて終わり。", "食後はコンビニでアイス買う感じ。"]
FLOW = ["食べ終わったらお茶で。", "片付けは後回しでいい。", "最後はデザートで。", ""]
T6 = ["大事なのは{a}こと。避けたいのは{b}。", "一番は{a}こと。{b}はなしで。", "{a}ことが大事。{b}は避けたいです。"]
A_PARTS = ["気楽に笑える", "いつも通りの空気で過ごす", "二人で作ってだらだら食べる", "時間を気にせず話せる", "好物を一緒に食べる", "重くしない"]
B_PARTS = ["かしこまった空気", "写真や飾り", "お礼の言葉", "高い料理", "静かすぎる夜", "準備に追われること"]
NOISE = ["はい", "おまかせします", "いいね！", "Sounds good, keep going.", "我想要轻松一点的晚餐。", "😊😊", "どう思いますか？",
         "天気いいですね", "あ" * 3, "すごく長い文章です。" * 40, "「", "」は自分で決めたい"]
WHO = ["相手", "母", "友達", "彼女", "ルームメイト"]


def deleg_sentence(rng, cards):
    if not cards:
        return ""
    t = rng.choice(cards)["title"]
    return rng.choice([f"「{t}」は自分で決めたいので、AIからは案を出さないでください。", f"「{t}」は具体的な案を一つ出してください。",
                       f"「{t}」はまだ決めずに、考える材料を示してください。"])


def make_input(rng, k, scenario, prev_res, noise_rate):
    if rng.random() < noise_rate:
        return rng.choice(NOISE)[:500]
    cards = prev_res["analysis"]["criteria"] if prev_res else []
    tr = prev_res["meta"]["offlineTrace"] if prev_res else {}
    if k == 1:
        s = rng.choice(T1).format(who=rng.choice(WHO))
    elif k == 2:
        s = rng.choice(T2)
    elif k == 3:
        s = rng.choice(T3)
    elif k == 4:
        e1 = (tr.get("e1") or {}).get("generic", "")
        keys = OC.E1.get(e1, {}).get("keys", ["それ"])
        s = rng.choice(T4_CORR).format(key=rng.choice(keys), pos=rng.choice(POS)) if rng.random() < 0.6 else rng.choice(T4_OK)
    elif k == 5:
        e2 = (tr.get("e2") or {}).get("preferred", "")
        keys = OC.E2.get(e2, {}).get("keys", ["それ"])
        s = rng.choice(T5_CORR).format(key=rng.choice(keys), pos=rng.choice(POS), flow=rng.choice(FLOW),
                                       alt=rng.choice(["笑うこと", "話すこと", "一緒に作ること"])) if rng.random() < 0.6 else rng.choice(T5_OK)
    else:
        s = rng.choice(T6).format(a=rng.choice(A_PARTS), b=rng.choice(B_PARTS))
    if k >= 2 and rng.random() < 0.25:
        s = s + deleg_sentence(rng, cards)
    return s or "いいです。"


def run(rng, i, variant, noise_rate):
    scenario = rng.choice(list(ANCHORS))
    anchor = rng.choice(ANCHORS[scenario])
    cond = rng.choice(["UI_A", "UI_B"])
    sid = f"FUZZ-{i}"
    history, res, inputs = [], [], []
    for k in range(1, 7):
        text = make_input(rng, k, scenario, res[-1] if res else None, noise_rate)
        inputs.append(text)
        body = {"sessionId": sid, "condition": cond, "experimentVariant": variant, "turn": k, "userText": text,
                "history": history, "pretaskAnchor": {"scenarioId": scenario, "freeText": anchor},
                "delegation": {}, "delegationSourceCriteria": []}
        r = run_offline(body)
        r2 = run_offline(json.loads(json.dumps(body)))
        if r2["dialogue"] != r["dialogue"] or r2["analysis"] != r["analysis"]:
            raise AssertionError("non-deterministic")
        res.append(r)
        history = history + [{"role": "user", "content": text}, {"role": "assistant", "content": r["dialogue"]}]
    row = {"id": sid, "condition": cond, "scenario": scenario, "anchor": anchor, "inputs": inputs}
    return row, res


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=1000)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--noise", type=float, default=0.08)
    ap.add_argument("--show", type=int, default=0, help="問題のあったセッションを何件まで表示するか")
    ap.add_argument("--dump")
    a = ap.parse_args()
    rng = random.Random(a.seed)
    variants = ["generic_unranked", "generic_embedded", "mixed_e1explicit", "mixed_e1content", "generic_near"]
    tally, crashes, shown, examples = collections.Counter(), 0, 0, collections.defaultdict(list)
    for i in range(a.n):
        v = variants[i % len(variants)]
        try:
            row, res = run(rng, i, v, a.noise)
        except Exception:  # noqa: BLE001
            crashes += 1
            if crashes <= 3:
                traceback.print_exc()
            continue
        for k, code, msg in check_session(row, res):
            tally[code] += 1
            if len(examples[code]) < 4:
                examples[code].append((row["id"], v, k, msg, row["inputs"][k - 1][:60]))
    print(f"n={a.n} crashes={crashes}", dict(sorted(tally.items())) or "clean")
    for code, ex in sorted(examples.items()):
        for e in ex:
            print(" ", code, e)
