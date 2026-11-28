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


CHOICE_INSTRUCTIONS = """あなたは、ある調査の参加者の役を演じます。下に書かれた人物本人として、選択肢から二つを選びます。
出力は、選んだ番号を大切な順にカンマで区切ったものだけにする（例：3,1）。説明は付けない。"""


def build_choice_payload(body: dict[str, Any], model: str) -> dict[str, Any]:
    """第0回（試作 prechoice）：対話の前に、決まった選択肢から「大切にしたいこと」を二つ選ぶ。"""
    persona = body["persona"]
    anchor = body.get("pretaskAnchor") or {}
    options = body.get("options") or []
    text = (
        f"【人物】\n性格：{persona.get('character', '')}\n"
        f"この夕食で望んでいること（本人だけが知っている）：{persona.get('needs', '')}\n"
        f"AIへの態度：{persona.get('attitude', '')}\n\n"
        f"【場面】{anchor.get('scenarioLabel', '')}\n【最初に書いた目標】{anchor.get('freeText', '')}\n\n"
        "【質問】この夕食で大切にしたいことに近いものを、次の中から二つ選んでください。\n"
        + "\n".join(f"{i + 1}. {o.get('label', '')}" for i, o in enumerate(options))
    )
    return {"model": model, "instructions": CHOICE_INSTRUCTIONS, "input": text, "reasoning": {"effort": "low"},
            "text": {"verbosity": "low"}, "max_output_tokens": 300, "store": False}


TALK_INSTRUCTIONS = """あなたは、ある調査の参加者の役を演じます。下に書かれた人物本人として、二つの質問に答えます。
出力は、質問1の番号と質問2の番号をカンマで区切ったものだけにする（例：2,1）。説明は付けない。"""


def build_talk_payload(body: dict[str, Any], model: str) -> dict[str, Any]:
    """第0回（試作 smalltalk）：対話の前の「ふだんの食事について」の質問のうち、鍵になる二つに答える。"""
    persona = body["persona"]
    questions = body.get("questions") or []
    text = (
        f"【人物】\n性格：{persona.get('character', '')}\n"
        f"この夕食で望んでいること（本人だけが知っている）：{persona.get('needs', '')}\n"
        f"AIへの態度：{persona.get('attitude', '')}\n\n"
        + "\n\n".join(f"【質問{i + 1}】{q.get('question', '')}\n" + "\n".join(f"{j + 1}. {o.get('label', '')}" for j, o in enumerate(q.get("options") or []))
                        for i, q in enumerate(questions))
    )
    return {"model": model, "instructions": TALK_INSTRUCTIONS, "input": text, "reasoning": {"effort": "low"},
            "text": {"verbosity": "low"}, "max_output_tokens": 300, "store": False}


def parse_talk(text: str, questions: list[dict[str, Any]]) -> dict[str, str]:
    import re
    nums = [int(n) for n in re.findall(r"\d+", text or "")]
    if len(nums) < len(questions):
        raise ValueError(f"答えを読み取れませんでした：{(text or '')[:60]}")
    out = {}
    for q, n in zip(questions, nums):
        options = q.get("options") or []
        if not 1 <= n <= len(options):
            raise ValueError(f"答えを読み取れませんでした：{(text or '')[:60]}")
        out[q["name"]] = options[n - 1]["id"]
    return out


CONCERN_CHIPS = [("prep", "準備の進め方"), ("serve", "料理の出し方"), ("share", "料理の並べ方"), ("tidy", "食後の片付け"),
                 ("light", "部屋の明るさ"), ("sound", "食事中の音"), ("seat", "座る位置"), ("drink", "飲み物の出し方"), ("ware", "使う器"),
                 ("after", "食後の過ごし方"), ("other", "その他（自分で書く）"), ("none", "特にない")]
CONCERN_TALK_INSTRUCTIONS = """あなたは、ある調査の参加者の役を演じます。下に書かれた人物本人として、画面の質問に答えます。
その人物に本当に「自分なりのやり方」があるものだけを選ぶ（多く選びすぎない）。
いちばんのこだわりが選択肢に無い事柄なら、「その他」を選んで自分の言葉で書く。こだわりが特に無い人物は「特にない」だけを選ぶ。
出力は五行にする。説明は付けない。
一行目：選んだ番号をカンマで区切ったもの（例：2,6）
二行目：その中で、こだわりがいちばん強いものの番号
三行目：その次の番号（一つしか選んでいなければ 0）
四行目：いちばんのこだわりを、どんなふうにしたいか（40字以内。「特にない」を選んだら「なし」）
五行目：「その他」を選んだ場合だけ、「何について｜どうしたい」（何について＝12字以内、どうしたい＝30字以内）。選んでいなければ「なし」"""


def build_concern_talk_payload(body: dict[str, Any], model: str) -> dict[str, Any]:
    """第0回（試作 concern）：対話の前の雑談に答える。人物には、どの話題が後で使われるかを知らせない。"""
    persona = body["persona"]
    text = (
        f"【人物】\n性格：{persona.get('character', '')}\n"
        f"この夕食で望んでいること・ふだんの様子（本人だけが知っている）：{persona.get('needs', '')}\n\n"
        "【質問】誰かと家で食事をするとき、「ここは自分なりのやり方がある」と思うものを選んでください（いくつでも）。\n"
        + "\n".join(f"{i + 1}. {label}" for i, (_, label) in enumerate(CONCERN_CHIPS))
    )
    return {"model": model, "instructions": CONCERN_TALK_INSTRUCTIONS, "input": text, "reasoning": {"effort": "low"},
            "text": {"verbosity": "low"}, "max_output_tokens": 400, "store": False}


def parse_concern_talk(text: str) -> dict[str, Any]:
    import re
    lines = [x.strip() for x in (text or "").strip().splitlines() if x.strip()]
    if len(lines) < 3:
        raise ValueError(f"答えを読み取れませんでした：{(text or '')[:60]}")
    ids = [k for k, _ in CONCERN_CHIPS]
    labels = dict(CONCERN_CHIPS)

    def pick(line: str) -> list[str]:
        return [ids[int(n) - 1] for n in re.findall(r"\d+", line) if 1 <= int(n) <= len(ids)]

    picked = list(dict.fromkeys(pick(lines[0])))
    if not picked or picked == ["none"]:
        return {"picked": [], "top": "none", "second": None, "note": "", "labels": {"top": "特にない", "second": ""}}
    picked = [k for k in picked if k != "none"]
    top = next((k for k in pick(lines[1]) if k in picked), picked[0])
    second = next((k for k in pick(lines[2]) if k in picked and k != top), None)
    if second is None and len(picked) >= 2:
        second = next(k for k in picked if k != top)
    out: dict[str, Any] = {"picked": picked, "top": top, "second": second, "note": "" if len(lines) < 4 or lines[3].startswith("なし") else lines[3][:40]}
    if "other" in picked:
        raw = lines[4] if len(lines) > 4 else ""
        what, _, how = raw.partition("｜") if "｜" in raw else raw.partition("|")
        out["other"] = {"what": what.strip()[:12], "how": how.strip()[:30]}
        labels = dict(labels, other=out["other"]["what"] or "その他")
    out["labels"] = {"top": labels[top], "second": labels[second] if second else ""}
    return out


PROBE_INSTRUCTIONS = """あなたは、ある調査の参加者の役を演じます。AIとの6回のやり取りを終えたところです。
下に書かれた人物本人として、三つの質問に答えます。出力は三行にする。
一行目：質問1の数字（1〜5）。二行目：質問2の数字（1〜5）。三行目：そう感じた理由を、その人物の言葉で一文（60字以内）。"""


def build_probe_payload(body: dict[str, Any], model: str) -> dict[str, Any]:
    """対話のあとの感想（模擬）：自分が大切にしていることを AI が分かっていたと感じたか。"""
    persona = body["persona"]
    rows = body.get("history") or []
    talk = "\n".join(("参加者（あなた）" if r.get("role") == "user" else "AI") + "：" + str(r.get("content", "")) for r in rows)
    text = (
        f"【人物】\n性格：{persona.get('character', '')}\n"
        f"この夕食で望んでいること・ふだんの様子：{persona.get('needs', '')}\n読み方：{persona.get('reading', '')}\n\n"
        f"【AIとのやり取り】\n{talk}\n\n"
        + ("いま、AIの最後の回答を読み終えたところです。その最後の回答だけについて答えてください。\n"
           "【質問1】この回答は、あなたがこの夕食で特に大切にしていることを分かって書かれていると思いますか。（1 全く分かっていない 〜 5 よく分かっている）\n"
           "【質問2】この回答は、あなた個人に向けたものだと感じましたか。（1 誰にでも当てはまる内容だった 〜 5 自分に向けた内容だった）\n"
           "【質問3】そう感じた理由"
           if body.get("latestOnly") else
           "【質問1】AIは、あなたがこの夕食で特に大切にしていることを分かっていたと思いますか。（1 全く分かっていなかった 〜 5 よく分かっていた）\n"
           "【質問2】AIの回答は、あなた個人に向けたものだと感じましたか。（1 誰にでも当てはまる内容だった 〜 5 自分に向けた内容だった）\n"
           "【質問3】そう感じた理由")
    )
    instructions = PROBE_INSTRUCTIONS.replace("AIとの6回のやり取りを終えたところです。", "AIとのやり取りの途中です。") if body.get("latestOnly") else PROBE_INSTRUCTIONS
    return {"model": model, "instructions": instructions, "input": text, "reasoning": {"effort": "low"},
            "text": {"verbosity": "low"}, "max_output_tokens": 400, "store": False}


def parse_probe(text: str) -> dict[str, Any]:
    import re
    lines = [x.strip() for x in (text or "").strip().splitlines() if x.strip()]
    nums = [int(m.group(0)) for m in (re.search(r"[1-5]", x) for x in lines[:2]) if m]
    if len(nums) < 2:
        raise ValueError(f"感想を読み取れませんでした：{(text or '')[:60]}")
    return {"understood": nums[0], "personal": nums[1], "reason": (lines[2] if len(lines) > 2 else "")[:120]}


def parse_choice(text: str, options: list[dict[str, Any]]) -> list[str]:
    import re
    picked: list[str] = []
    for n in re.findall(r"\d+", text or ""):
        i = int(n) - 1
        if 0 <= i < len(options) and options[i].get("id") not in picked:
            picked.append(options[i].get("id"))
    if len(picked) < 2:
        raise ValueError(f"選択を読み取れませんでした：{(text or '')[:60]}")
    return picked[:2]


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
        f"【最初に書いた目標】{anchor.get('freeText', '')}\n"
        + (f"【対話の前に自分で選んだ、大切にしたいこと】{'、'.join(body.get('chosenLabels') or [])}\n" if body.get("chosenLabels") else "")
        + (f"【この人がふだんから当たり前だと思っていること】{'。'.join(body.get('beliefs') or [])}。\n" if body.get("beliefs") else "")
        + f"\n【これまでの対話】\n{talk}\n\n"
        f"【画面の右側に出ている「AIが読み取ったこと」】\n{cards}\n\n"
        f"【今回（第{turn}回）の案内】{GUIDES[turn]}\n\n"
        "この人物として、今回の入力を書いてください。"
    )
    return {"model": model, "instructions": INSTRUCTIONS, "input": text, "reasoning": {"effort": "low"},
            "text": {"verbosity": "low"}, "max_output_tokens": 900, "store": False}


def clean(text: str) -> str:
    out = (text or "").strip().strip("「」\"'").strip()
    return out[:480]
