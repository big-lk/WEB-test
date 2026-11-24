"""オフライン版を、参加者役（人またはAI）が端末から操作するための簡易クライアント。状態は --dir の JSON に保存。
  start KEY UI_A|UI_B scenario "事前の一文" [--variant v]
  send KEY "入力文"         → AIの回答と次の課題
  panel KEY                 → 右側「AIが読み取ったこと」（UI B はボタン状態と例文）
  button KEY 番号 ai|consult|self   （UI B のみ。右側カードのボタン。AIの回答には影響しない）
  example KEY               （UI B のみ。ボタン状態から作った例文）
  log KEY                   → 全記録"""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from api.aitest.offline_engine import run_offline  # noqa: E402
from api.aitest import core  # noqa: E402

TASKS = {1: "相手との夕食で、食べ終わったあとにどんな気持ちになっていてほしいかを書いてください。",
         2: "その目標と同時に大切にしたい、別の気持ちや雰囲気を一つ書いてください。",
         3: "食事中の会話や距離感など、料理以外でどんな時間にしたいかを書いてください。",
         4: "この案の食卓で、二人がどう過ごしているとよいかを書いてください。",
         5: "食べ始めから食後まで、二人にとって自然な流れを書いてください。",
         6: "この夕食で大切にしたいことや避けたいことを、自分の言葉でまとめてください。"}
LABEL = {"ai": "AIに提案してもらう", "consult": "一緒に考える", "self": "自分で決める"}
EX = {"self": "「{t}」は自分で決めたいので、AIからは案を出さないでください。", "ai": "「{t}」は具体的な案を一つ出してください。",
      "consult": "「{t}」はまだ決めずに、考える材料を示してください。"}


def path(d, key):
    return Path(d) / f"{key}.json"


def load(d, key):
    return json.loads(path(d, key).read_text(encoding="utf-8"))


def save(d, key, s):
    path(d, key).write_text(json.dumps(s, ensure_ascii=False, indent=1), encoding="utf-8")


def panel_text(s):
    if not s["rounds"]:
        return "（まだ表示はありません）"
    crit = s["rounds"][-1]["analysis"]["criteria"]
    lines = ["【AIが読み取ったこと】"]
    for i, c in enumerate(crit, start=1):
        mark = "（注目）" if c["focus"] else ""
        lines.append(f"{i}. {c['title']}{mark}：{c['meaning']}")
        if s["condition"] == "UI_B":
            st = s["delegation"].get(c["id"], "consult")
            lines.append("   ボタン：" + " / ".join(("●" if k == st else "○") + v for k, v in LABEL.items()))
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd")
    ap.add_argument("key")
    ap.add_argument("args", nargs="*")
    ap.add_argument("--variant", default="generic_unranked")
    ap.add_argument("--dir", default="/home/claude/offsim")
    a = ap.parse_args()
    Path(a.dir).mkdir(parents=True, exist_ok=True)
    if a.cmd == "start":
        cond, scen, anchor = a.args
        s = {"key": a.key, "condition": cond, "scenario": scen, "anchor": anchor, "variant": a.variant,
             "rounds": [], "delegation": {}, "panelViews": [0] * 7, "events": []}
        save(a.dir, a.key, s)
        print(f"開始しました（{cond}）。場面：{core.SCENARIOS[scen]}\n第1回の課題：{TASKS[1]}")
        return
    s = load(a.dir, a.key)
    turn = len(s["rounds"]) + 1
    if a.cmd == "send":
        if turn > 6:
            print("6回の対話は終わっています。")
            return
        text = " ".join(a.args).strip()
        history = []
        for r in s["rounds"]:
            history += [{"role": "user", "content": r["user"]}, {"role": "assistant", "content": r["ai"]}]
        prev = s["rounds"][-1]["analysis"]["criteria"] if s["rounds"] else []
        deleg = {k: v for k, v in s["delegation"].items() if any(c["id"] == k for c in prev)} if s["condition"] == "UI_B" else {}
        body = {"sessionId": f"SIMTEST-OFF-{a.key}", "condition": s["condition"], "experimentVariant": s["variant"], "turn": turn,
                "userText": text, "history": history, "pretaskAnchor": {"scenarioId": s["scenario"], "freeText": s["anchor"]},
                "delegation": deleg, "delegationSourceCriteria": prev if s["condition"] == "UI_B" else [],
                "previousCriteria": prev}
        res = run_offline(body)
        s["rounds"].append({"turn": turn, "user": text, "ai": res["dialogue"], "analysis": res["analysis"],
                            "trace": res["meta"]["offlineTrace"], "delegationAtSend": deleg,
                            "required": res["meta"]["requiredControlSentence"]})
        save(a.dir, a.key, s)
        print(f"【AIの回答（第{turn}回）】\n{res['dialogue']}")
        if turn < 6:
            print(f"\n第{turn + 1}回の課題：{TASKS[turn + 1]}")
        else:
            print("\n6回の対話が終わりました。")
    elif a.cmd == "panel":
        s["panelViews"][min(len(s["rounds"]), 6)] += 1
        save(a.dir, a.key, s)
        print(panel_text(s))
    elif a.cmd == "button":
        if s["condition"] != "UI_B":
            print("UI A にはボタンはありません。")
            return
        idx, state = int(a.args[0]), a.args[1]
        crit = s["rounds"][-1]["analysis"]["criteria"]
        cid = crit[idx - 1]["id"]
        s["delegation"][cid] = state
        s["events"].append({"turn": turn, "button": cid, "state": state})
        save(a.dir, a.key, s)
        print(f"「{crit[idx - 1]['title']}」を「{LABEL[state]}」にしました。")
    elif a.cmd == "example":
        crit = s["rounds"][-1]["analysis"]["criteria"] if s["rounds"] else []
        lines = [EX[s["delegation"].get(c["id"], "consult")].format(t=c["title"]) for c in crit
                 if s["delegation"].get(c["id"], "consult") != "consult" or c["id"] in s["delegation"]]
        s["events"].append({"turn": turn, "example": True})
        save(a.dir, a.key, s)
        print("例文：" + ("".join(lines) if lines else "（ボタンを変えたカードがありません）"))
    elif a.cmd == "log":
        for r in s["rounds"]:
            print(f"--- 第{r['turn']}回 参加者：{r['user']}\nAI：{r['ai']}")
            print("カード：" + " / ".join(f"{c['title']}：{c['meaning']}" for c in r["analysis"]["criteria"]))


if __name__ == "__main__":
    main()
