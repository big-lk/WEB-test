/*
 * aitest 練習（操作の予行）パッチ practice.js v1（2026-11-22）
 * 読み込み順：app.js → logging_patch.js → practice.js
 *
 * 目的：計画書の「練習」段階で、本番と同じ画面配置のまま操作を一度試す。
 *   UI A：AIの回答と右側「AIが読み取ったこと」を見比べ、一言送ってみる。
 *   UI B：上に加えて、ボタンを1枚変え、例文を一度作ってみる（例文はそのまま使わなくてよい）。
 * 追加の案内文は出さない（本番の各回の案内は変えない）。
 *
 * 視線計測（Tobii Pro Lab）への配慮
 *   - 本番と同じ app-shell を使う → AOI の位置は本番と同じ。
 *   - 画面の縁に橙色の枠、ヘッダー中央に「練習」の札を重ねる（レイアウトは変えない）→ 録画で練習区間を判別できる。
 *   - 練習の開始（「6回の対話を開始する」）と終了（「本番を始める」）はクリックで区切る → TOI の境界に使える。
 *   - practice_* イベントに ISO 時刻と perfNow を記録し、AOI 矩形も phase:"practice" で残す。
 *   - AI へは送信しない（固定文）。全員が同じ練習を受ける。
 */
(function () {
  "use strict";
  const PRACTICE_VERSION = "practice-v1";
  if (typeof startTask !== "function" || typeof session === "undefined") {
    console.warn("[practice] app.js が先に読み込まれていません");
    return;
  }

  const P = {
    kicker: "練習",
    title: "画面の使い方を一度ためします（本番とは関係ありません）",
    guideA: "例題は「平日の昼ごはん」です。左のAIの回答と、右の「AIが読み取ったこと」を見比べてから、入力欄に一言書いて送信してください。",
    guideB: "例題は「平日の昼ごはん」です。左のAIの回答と、右の「AIが読み取ったこと」を見比べてください。右のカードのどれか1枚でボタンを選び、「次に伝える短い例文を作る」を一度押してから、入力欄に一言書いて送信してください。例文はそのまま使わなくてかまいません。",
    user: "平日の昼ごはんを、短い時間で軽く済ませたい。",
    ai: "昼休みが短いので、15分ほどで食べ終えられるよう、コンビニのおにぎりとサラダを中心にした案にします。飲み物は温かいお茶にして、午後も眠くなりにくい軽さにします。次は、食べる場所や一緒に食べる人について書いてください。",
    cards: [
      { id: "p1", title: "短い時間で食べられる", meaning: "昼休みが短いので、15分ほどで食べ終えられる昼食にする。", priority: "中心" },
      { id: "p2", title: "コンビニで買う", meaning: "お店は、近くのコンビニで買うことにする。", priority: "維持" },
      { id: "p3", title: "午後に眠くならない", meaning: "食べすぎず、午後も眠くなりにくい軽さにする。", priority: "未確定" }
    ],
    reply: "練習の回答です。本番では、ここにAIの回答が出て、右側の「AIが読み取ったこと」も毎回新しくなります。"
  };
  const PRIORITY = { "中心": "AIの優先度：高い", "維持": "AIの優先度：維持", "未確定": "AIの優先度：未確定" };
  const LABELS = [["ai", "AIに提案してもらう"], ["consult", "一緒に考える"], ["self", "自分で決める"]];

  let active = false;
  let state = null;
  const $ = (s) => document.querySelector(s);
  const now = () => (typeof isoNow === "function" ? isoNow() : new Date().toISOString());
  const perf = () => Math.round(performance.now() * 10) / 10;

  function log(type, data = {}) {
    if (!session) return;
    session.events.push({ time: now(), type, turn: 0, phase: "practice", perfNow: perf(), ...data });
    if (typeof saveSession === "function") saveSession();
  }

  // ---- 画面上端の帯（レイアウトに影響しない固定表示） ---------------------------
  function ensureBanner() {
    let b = $("#practiceBanner");
    if (!b) {
      b = document.createElement("div");
      b.id = "practiceBanner";
      b.setAttribute("aria-hidden", "true");
      document.body.append(b);
    }
    let tag = $(".practice-tag");
    if (!tag) {
      tag = document.createElement("div");
      tag.className = "practice-tag";
      tag.setAttribute("role", "status");
      tag.innerHTML = "<b>練習</b><span>本番とは関係ありません</span>";
      $(".app-header")?.append(tag);
    }
    const both = { classList: { add: (c) => { b.classList.add(c); tag.classList.add(c); }, remove: (c) => { b.classList.remove(c); tag.classList.remove(c); } } };
    return both;
  }

  // ---- 練習用の表示 ---------------------------------------------------------
  function message(kind, speaker, text) {
    const article = document.createElement("article");
    article.className = `message ${kind} current practice-item`;
    article.dataset.aoi = kind === "ai" ? "AOI_AI_Answer" : "AOI_Left_Context";
    article.innerHTML = `<div class="message-avatar">${kind === "ai" ? "AI" : "YOU"}</div>`;
    const body = document.createElement("div");
    body.className = "message-body";
    const meta = document.createElement("p");
    meta.className = "message-meta";
    meta.innerHTML = `<span>${speaker} · 練習</span><time></time>`;
    const bubble = document.createElement("p");
    bubble.className = "message-bubble";
    bubble.textContent = text;
    body.append(meta, bubble);
    article.append(body);
    return article;
  }

  function card(c) {
    const el = document.createElement("article");
    el.className = `criterion-card practice-item${c.priority === "中心" ? " focus" : ""}`;
    el.dataset.key = c.id;
    el.innerHTML = `<div class="criterion-title"><h3></h3></div><div class="criterion-tags"><span></span></div>`
      + `<p class="criterion-label">AIはこう受け取っています</p><p class="criterion-interpretation"></p>`;
    el.querySelector("h3").textContent = c.title;
    el.querySelector(".criterion-tags span").textContent = PRIORITY[c.priority];
    el.querySelector(".criterion-interpretation").textContent = c.meaning;
    if (session.condition === "UI_B") {
      const block = document.createElement("div");
      block.className = "delegation-block";
      const control = document.createElement("div");
      control.className = "delegation-control";
      control.dataset.aoi = "AOI_Right_Delegation_Control";
      control.setAttribute("role", "group");
      LABELS.forEach(([value, label]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.value = value;
        b.textContent = label;
        b.classList.toggle("selected", value === "consult");
        b.setAttribute("aria-pressed", value === "consult" ? "true" : "false");
        b.addEventListener("click", () => {
          const from = state.delegation[c.id] || "consult";
          state.delegation[c.id] = value;
          state.touched[c.id] = true;
          control.querySelectorAll("button").forEach((x) => {
            x.classList.toggle("selected", x === b);
            x.setAttribute("aria-pressed", x === b ? "true" : "false");
          });
          log("practice_delegation_changed", { criterion: c.id, from, to: value });
          if (typeof showToast === "function") showToast(`「${label}」を選びました。下の「例文を作る」で、次に伝える文に反映できます。`);
        });
        control.append(b);
      });
      block.append(control);
      el.append(block);
    }
    return el;
  }

  function layout() {
    const r = (el) => {
      if (!el || el.classList.contains("hidden")) return null;
      const b = el.getBoundingClientRect();
      return b.width && b.height ? [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] : null;
    };
    const cards = [...els.criteriaList.querySelectorAll(".criterion-card")].map(r);
    const rects = {
      AI_LATEST: r(els.chatStage.querySelector(".message.ai .message-bubble")), HISTORY: r(els.chatStage),
      INPUT: r(els.composer), GUIDE: r(els.turnPrompt), HELP: r(els.insightHelp),
      CARD_1: cards[0], CARD_2: cards[1], CARD_3: cards[2],
      EXAMPLE: session.condition === "UI_B" ? r(els.exampleAssist) : null
    };
    Object.keys(rects).forEach((k) => { if (!rects[k]) delete rects[k]; });
    session.events.push({ time: now(), type: "aoi_layout", phase: "practice", turn: 0, perfNow: perf(), reason: "practice",
      fullscreen: Boolean(document.fullscreenElement), dpr: devicePixelRatio, viewport: [innerWidth, innerHeight], rects });
  }

  function enterPractice() {
    active = true;
    state = { delegation: {}, touched: {}, buttonsChanged: false, exampleMade: false, sent: false };
    session.status = "practice";
    session.practice = { version: PRACTICE_VERSION, startedAt: now() };
    log("practice_started", { condition: session.condition });

    els.appShell.dataset.condition = session.condition;
    els.appShell.classList.add("practice-mode");
    els.insightHelp.textContent = session.condition === "UI_B"
      ? "本文はAIの解釈、タグはAIが置いた優先度です。ボタンは例文づくりのためのもので、カードはAIの読み取りとして毎回更新されます。AIに伝わるのは、あなたが送信した文章です。"
      : "本文はAIの解釈、タグはAIが置いた優先度を表します。";
    els.turnLabel.textContent = "練習";
    els.turnCount.textContent = "練習";
    els.promptKicker.textContent = P.kicker;
    els.promptText.textContent = P.title;
    els.guideText.textContent = session.condition === "UI_B" ? P.guideB : P.guideA;
    els.turnAnchor.classList.add("hidden");

    els.chatStage.querySelectorAll(".message, .completion-card, .practice-item").forEach((el) => el.remove());
    els.emptyConversation.classList.add("hidden");
    els.chatStage.append(message("user", "あなた", P.user), message("ai", "AI", P.ai));

    els.criteriaList.replaceChildren(...P.cards.map(card));
    const b = session.condition === "UI_B";
    els.exampleAssist.classList.toggle("hidden", !b);
    els.createExample.disabled = !b;
    els.exampleGuide.classList.add("hidden");
    els.exampleGuideText.textContent = "";

    els.messageInput.disabled = false;
    els.sendButton.disabled = false;
    els.messageInput.value = "";
    els.messageInput.placeholder = "練習です。一言だけ書いて送信してください。";
    els.inputHint.textContent = "練習：一言書いて送信";

    ensureBanner().classList.remove("hidden");
    showOnly(els.appShell);
    requestAnimationFrame(() => requestAnimationFrame(layout));
  }

  function makeExample() {
    const r = buildDelegationExample(P.cards, state.delegation, state.touched);
    const text = r.text || "（どれか1枚のボタンを選ぶと、その内容が例文に入ります）";
    els.exampleGuideText.textContent = text;
    els.exampleGuide.classList.remove("hidden");
    state.exampleMade = Boolean(r.text);
    log("practice_example", { text, fromButtons: Boolean(r.text) });
  }

  function practiceSend() {
    const text = els.messageInput.value.trim();
    if (state.sent) return;
    if (session.condition === "UI_B" && (!Object.keys(state.touched).length || !state.exampleMade)) {
      showToast("練習では、右のカードのボタンを1枚選び、「次に伝える短い例文を作る」を一度押してから送信してください。");
      return;
    }
    if (!text) { showToast("練習です。一言書いて送信してください。"); els.messageInput.focus(); return; }
    state.sent = true;
    log("practice_sent", { textLength: text.length, usedExampleVerbatim: text === els.exampleGuideText.textContent });
    els.chatStage.append(message("user", "あなた", text), message("ai", "AI", P.reply));
    els.chatStage.scrollTop = els.chatStage.scrollHeight;
    els.messageInput.value = "";
    els.messageInput.disabled = true;
    els.sendButton.disabled = true;
    setTimeout(showTransition, 1200);
  }

  // ---- 練習から本番への区切り（クリックで本番開始 → TOI の境界） ----------------
  function showTransition() {
    let t = $("#practiceTransition");
    if (!t) {
      t = document.createElement("div");
      t.id = "practiceTransition";
      t.innerHTML = `<div class="practice-transition-card"><p class="eyebrow">練習は以上です</p>`
        + `<h2>ここから本番の6回の対話を始めます</h2>`
        + `<p>本番では、AIの回答と右側の「AIが読み取ったこと」が毎回新しくなります。正解はありません。</p>`
        + `<button type="button" class="primary-button" id="practiceDone">本番を始める</button></div>`;
      document.body.append(t);
      t.querySelector("#practiceDone").addEventListener("click", finishPractice);
    }
    t.classList.remove("hidden");
    log("practice_transition_shown");
  }

  function finishPractice() {
    if (!active) return;
    log("practice_ended", { buttonsChanged: Object.keys(state.touched).length, exampleMade: state.exampleMade });
    session.practice.endedAt = now();
    active = false;
    $("#practiceTransition")?.classList.add("hidden");
    ensureBanner().classList.add("hidden");
    els.appShell.classList.remove("practice-mode");
    els.chatStage.querySelectorAll(".practice-item").forEach((el) => el.remove());
    els.criteriaList.replaceChildren();
    els.messageInput.disabled = false;
    els.sendButton.disabled = false;
    session.status = "instructions";  // startTask が running にする
    originalStartTask(false);
  }

  // ---- 本番開始のボタンに練習を挟む ---------------------------------------------
  const originalStartTask = startTask;
  window.startTask = function (resuming = false) {
    if (resuming && session?.status === "practice") {  // 練習中の再読み込み：説明画面から再開する
      session.status = "instructions";
      if (typeof prepareInstructions === "function") return prepareInstructions();
    }
    return originalStartTask(resuming);
  };
  els.startTask.addEventListener("click", (event) => {
    if (!session || session.practice?.endedAt) return;  // 練習済みなら通常どおり
    if (typeof readAnchor === "function" && !readAnchor()) { event.stopImmediatePropagation(); return; }
    event.stopImmediatePropagation();
    enterPractice();
  }, { capture: true });

  // 練習中は送信・例文作成を練習用に差し替える（AI へは送らない）
  document.addEventListener("submit", (event) => {
    if (active && event.target === els.composer) { event.preventDefault(); event.stopImmediatePropagation(); practiceSend(); }
  }, { capture: true });
  document.addEventListener("keydown", (event) => {
    if (active && event.target === els.messageInput && event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault(); event.stopImmediatePropagation(); practiceSend();
    }
  }, { capture: true });
  document.addEventListener("click", (event) => {
    if (active && event.target.closest?.("#createExample")) { event.stopImmediatePropagation(); makeExample(); }
  }, { capture: true });
  document.addEventListener("pointerdown", (event) => {
    if (!active && !$("#practiceTransition:not(.hidden)")) return;
    const target = event.target.closest?.("[data-aoi], .criterion-card, #composer, button");
    session.events.push({ time: now(), type: "pointer_down", phase: "practice", turn: 0, perfNow: perf(),
      x: Math.round(event.screenX), y: Math.round(event.screenY),
      target: target ? (target.dataset?.aoi || target.id || target.className || target.tagName) : null });
  }, { capture: true, passive: true });

  console.info(`[practice] ${PRACTICE_VERSION} loaded`);
})();
