// AI 模擬参加者用ハーネス（https://www.lkdesigner.top/aitest?sim=1 のページで実行する）
// 参加者に見える情報だけを返す。右側パネルは sim.panel() を呼んだときだけ見え、その回数を記録する（視線の代替指標）。
// 送信は sim.send() ですぐ返り、sim.wait() で回答を待つ（ツールの約45秒制限による二重送信を防ぐ）。
// 会話 ID は必ず SIMTEST- で始める（正式データから自動で除外される）。
(() => {
  const LABEL = { busy: "相手は最近忙しく、少し疲れている", reunion: "久しぶりに二人でゆっくり会う",
    milestone: "小さな節目をさりげなく祝う", gratitude: "普段言えていない感謝を自然に伝えたい" };
  const STATE_JA = { ai: "AIに提案してもらう", consult: "一緒に考える", self: "自分で決める" };
  const now = () => new Date().toISOString();
  const save = () => { try { localStorage.setItem("SIM_P", JSON.stringify(window.SP)); } catch (e) {} };
  window.SP = window.SP || JSON.parse(localStorage.getItem("SIM_P") || "{}");
  const S = (k) => { const s = window.SP[k]; if (!s) throw new Error("no session " + k); return s; };
  const ev = (s, type, extra = {}) => s.events.push({ time: now(), type, turn: s.rounds.length + 1, ...extra });
  const guideFor = (t) => TURN_PROMPTS[t - 1];

  async function post(s, text) {
    const turn = s.rounds.length + 1; const prev = s.rounds.at(-1);
    const delegation = {};
    if (s.condition === "UI_B" && prev) prev.analysis.criteria.forEach((c) => { delegation[c.id] = s.buttons[c.id] || "consult"; });
    const body = { sessionId: s.sessionId, condition: s.condition, experimentVariant: s.experimentVariant, eventCardMode: "merge",
      turn, userText: text, history: s.hist, pretaskAnchor: s.pretaskAnchor, delegation,
      delegationSourceCriteria: s.condition === "UI_B" ? (prev?.analysis.criteria || []) : [],
      previousCriteria: (prev?.analysis.criteria || []).map(({ id, title, meaning, priority }) => ({ id, title, meaning, priority })) };
    ev(s, "send_clicked");
    let res, js;
    for (let k = 0; k < 6; k++) {
      res = await fetch(location.origin + "/aitest/api/turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      js = await res.json().catch(() => ({}));
      if (res.ok) break;
      await new Promise((r) => setTimeout(r, res.status === 429 ? 30000 : 3000));
    }
    if (!res.ok) { ev(s, "ai_request_failed", { status: res.status }); save(); return "通信エラー。もう一度 sim.send を呼んでください"; }
    s.rounds.push({ turn, userText: text, aiText: js.dialogue, analysis: js.analysis, aiMeta: js.meta, delegation: { ...delegation },
      delegationTouched: { ...s.touched }, exampleText: s.lastExample?.turn === turn ? s.lastExample.text : "", submittedAt: now() });
    s.hist.push({ role: "user", content: text }, { role: "assistant", content: js.dialogue });
    const nb = {}; js.analysis.criteria.forEach((c) => { nb[c.id] = s.buttons[c.id] || "consult"; });
    s.buttons = nb; s.touched = {};
    ev(s, "ai_response_complete"); save();
    return window.sim.view(s.participantId);
  }

  window.sim = {
    start(key, cond, scenarioId, anchorText, variant = "generic_unranked") {
      if (window.SP[key]) return "すでに開始しています。sim.view(key) で現在の状態を確認してください";
      window.SP[key] = { participantId: key, sessionId: `${key}-${cond}-${variant}-${Date.now()}`, condition: cond, experimentVariant: variant,
        pretaskAnchor: { scenarioId, scenarioLabel: LABEL[scenarioId], freeText: anchorText }, rounds: [], hist: [], buttons: {}, touched: {},
        events: [], panelLooks: {}, reflection: null, startedAt: now() };
      ev(window.SP[key], "task_started"); save(); return this.view(key);
    },
    view(key) {
      const s = S(key); const turn = s.rounds.length + 1; const last = s.rounds.at(-1); const g = guideFor(turn);
      return { turn: turn > 6 ? "終了（振り返りへ）" : turn, task: turn <= 6 && g ? `${g.kicker}｜${g.title}：${g.guide}` : null,
        lastAIAnswer: last ? last.aiText : null,
        note: turn > 6 ? "sim.review(key) で振り返りへ" : last ? "右側の『AIが読み取ったこと』を見たいときは sim.panel(key) を呼ぶ" : "最初の入力をしてください" };
    },
    panel(key) {
      const s = S(key); const turn = s.rounds.length + 1; const last = s.rounds.at(-1);
      if (!last) return "まだ表示はありません";
      s.panelLooks[turn] = (s.panelLooks[turn] || 0) + 1; ev(s, "sim_panel_look"); save();
      return { heading: "AIが読み取ったこと（本文はAIの解釈、タグはAIが置いた優先度）",
        cards: last.analysis.criteria.map((c, i) => ({ no: i + 1, title: c.title, meaning: c.meaning, tag: c.priority,
          ...(s.condition === "UI_B" ? { button: STATE_JA[s.buttons[c.id] || "consult"] } : {}) })),
        ...(s.condition === "UI_B" ? { help: "各カードのボタン（AIに提案してもらう／一緒に考える／自分で決める）で、AIにどこまで考えてもらうかを選べます。ボタンは例文づくりのためのもので、カードはAIの読み取りとして毎回更新されます。AIに伝わるのは、あなたが送信した文章です。操作：sim.button(key, no, 'ai'|'consult'|'self')、sim.example(key)" } : {}) };
    },
    button(key, no, state) {
      const s = S(key); if (s.condition !== "UI_B") return "UI Bのみ";
      const c = s.rounds.at(-1)?.analysis.criteria[no - 1]; if (!c) return "カードがありません";
      s.buttons[c.id] = state; s.touched[c.id] = true; ev(s, "delegation_changed", { criterionId: c.id, value: state }); save();
      return `「${c.title}」→${STATE_JA[state]}`;
    },
    example(key) {
      const s = S(key); if (s.condition !== "UI_B") return "UI Bのみ";
      const crit = s.rounds.at(-1)?.analysis.criteria || []; const turn = s.rounds.length + 1;
      const r = buildDelegationExample(crit, s.buttons, s.touched);
      const text = r.text || "（ボタンを変えたカードがないため、空欄つきの例文：" + (guideFor(turn)?.title || "") + "）";
      s.lastExample = { turn, text }; ev(s, "example_generated", { text }); save(); return "例文：" + text;
    },
    send(key, text) {
      const s = S(key);
      if (s.pending) return "送信中です。sim.wait(key) で回答を待ってください（もう一度送らないこと）";
      if (s.rounds.length >= 6) return "6回すべて終了しています。sim.review(key) へ";
      if (s.rounds.at(-1)?.userText === text) return "直前の回と同じ文です。すでに送信済みです。sim.view(key) を確認してください";
      s.pending = { turn: s.rounds.length + 1, text, at: Date.now() };
      post(s, text).then((r) => { s.pending = null; s.lastResult = r; }).catch((e) => { s.pending = null; s.lastResult = "通信エラー：" + e; });
      return `第${s.pending.turn}回を送信しました。sim.wait("${key}") で回答を待ってください`;
    },
    async wait(key) {
      const s = S(key); const t0 = Date.now();
      while (s.pending && Date.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 1000));
      if (s.pending) return "まだAIの回答待ちです。もう一度 sim.wait(key) を呼んでください";
      return typeof s.lastResult === "string" ? s.lastResult : this.view(key);
    },
    review(key) {
      const s = S(key);
      return { instruction: "第2・3・4・6回の入力とAIの回答を見返して、各回5問（1〜5）と全体4問（1〜5）、自由記述2問に答える。sim.reflect(key, {...}) で保存",
        items: [2, 3, 4, 6].map((t) => ({ turn: t, yourInput: s.rounds[t - 1]?.userText, aiAnswer: s.rounds[t - 1]?.aiText })) };
    },
    reflect(key, obj) { const s = S(key); s.reflection = { completedAt: now(), ...obj }; ev(s, "blind_reflection_completed"); save(); return "保存しました"; },
    exportAll() { return Object.values(window.SP).map(({ hist, buttons, touched, lastExample, pending, lastResult, ...rest }) => rest); },
  };
})();
