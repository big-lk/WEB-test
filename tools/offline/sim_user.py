"""模擬参加者（開発用。手元サーバー `serve.py --online` だけで動き、Vercel には載らない）。

人物設定（性格・書き方・この夕食で望んでいること・AI への態度・読み方）を渡すと、その人物として次の入力を 1 つ書く。
固定の台本と違い、AI の実際の回答と右側の表示を見てから書くので、回答に応じた入力になる。

注意：これは AI による模擬であり、人の参加者の代わりにはならない。回答の作り方が、書き方の違う相手にも通るかを
広く確かめるための道具である。試験用の参加者番号（SIMTEST-）でしか動かない。
"""
from __future__ import annotations

from typing import Any

GUIDES = {
    1: "相手にどう感じてほしいか、夕食後に二人がどうなっていたらよいかを、3文くらいを目安に書く。相手の人柄や、二人のいつもの様子など、二人ならではのことを入れる。",
    2: "最初に書いた目標と一緒にかなえたいことを、思いつくだけ書く。理由や場面を添えてもよい。",
    3: "食事中の会話、距離感、気分、避けたい空気などを、場面を思い浮かべながらいくつか書く。",
    4: "実際に二人が食卓に座っている場面を思い浮かべ、どんな様子ならこの夕食らしいと感じるかを、いくつか書く。",
    5: "食べ始めから食後まで、二人にとって自然な流れを書く。",
    6: "この夕食で最後に大切にしたいことや避けたいことを、自分の言葉でまとめる。",
}

INSTRUCTIONS = """あなたは、ある調査の参加者の役を演じます。AIとしてではなく、下に書かれた人物本人として、
チャット画面の入力欄に打ち込む文だけを出力してください。

- 出力は、入力欄に書く本文だけにする。説明、役名、かぎ括弧での囲み、絵文字、箇条書きの記号は付けない。
- 人物の「書き方」（長さ、文体、くせ）を必ず守る。長さの目安から外れない。短く書く人物は、本当に短く書く。
- 人物が知っていること（相手の人柄、二人の習慣、本当に望んでいること）は、今回の主題に関係するときに、
  その人物らしい出し方で出す。一度に全部は出さない。書き方が短い人物は、聞かれても少ししか出さない。
- AI の回答と右側の表示への反応は、人物の「読み方」と「AIへの態度」に従う。
  丁寧に読む人物は、回答や表示が自分の考えと違えば、その人物らしい言い方で指摘する。
  流し読みの人物は、違いに気づかないことがある。遠慮する人物は、気づいても強くは言わない。
- 今回の案内（今回書くこと）には、その人物なりに応じる。案内から外れる人物は、外れてよい。
- 健康状態、病気、アレルギー、実在の人名や住所は書かない。
- 前の回に自分が書いたことを、そのまま繰り返さない。
"""


def build_payload(body: dict[str, Any], model: str) -> dict[str, Any]:
    turn = int(body["turn"])
    persona = body["persona"]
    anchor = body.get("pretaskAnchor") or {}
    rows = body.get("history") or []
    talk = "\n".join(("参加者（あなた）" if r.get("role") == "user" else "AI") + "：" + str(r.get("content", "")) for r in rows) or "（まだ何も話していない）"
    cards = "\n".join(f"・{c.get('title', '')}｜{c.get('meaning', '')}" + ("（AIの優先度：高い）" if c.get("priority") == "中心" else "")
                      for c in (body.get("criteria") or [])) or "（まだ表示なし）"
    text = (
        f"【人物】\n"
        f"性格：{persona.get('character', '')}\n"
        f"書き方：{persona.get('writing', '')}\n"
        f"この夕食で望んでいること（本人だけが知っている）：{persona.get('needs', '')}\n"
        f"AIへの態度：{persona.get('attitude', '')}\n"
        f"読み方：{persona.get('reading', '')}\n\n"
        f"【場面】{anchor.get('scenarioLabel', '')}\n"
        f"【最初に書いた目標】{anchor.get('freeText', '')}\n\n"
        f"【これまでの対話】\n{talk}\n\n"
        f"【画面の右側に出ている「AIが読み取ったこと」】\n{cards}\n\n"
        f"【今回（第{turn}回）の案内】{GUIDES[turn]}\n\n"
        "この人物として、今回の入力を書いてください。"
    )
    return {"model": model, "instructions": INSTRUCTIONS, "input": text, "reasoning": {"effort": "low"},
            "text": {"verbosity": "low"}, "max_output_tokens": 900, "store": False}


def clean(text: str) -> str:
    out = (text or "").strip().strip("「」\"'").strip()
    return out[:480]
