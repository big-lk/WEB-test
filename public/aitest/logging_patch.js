/*
 * aitest 実験画面 ログ強化パッチ（logging_patch.js） v2（v2: UI B のボタン行を BTN_1〜3 として記録）
 * 対象：app.js v5.0.18（SESSION_SCHEMA_VERSION 8）
 *
 * 使い方：index.html の app.js の <script> の直後に 1 行追加するだけ。
 *   <script src="./logging_patch.js?v=1"></script>
 * app.js 本体は変更しない。外せば元の動作に戻る。参加者の操作・負担は変わらない。
 *
 * 追加される記録（session.events）
 *   ai_visible   … ローディング表示が消え、回答が画面に描画された後（2 フレーム後）の時刻＝読解区間の始点
 *   aoi_layout   … 描画・スクロール・リサイズのたびの AOI 矩形（画面座標 px）
 *   chat_scroll  … 左側の対話エリアのスクロール位置
 *   pointer_down … すべてのクリック位置（Pro Lab の録画のマウス記録と時刻を合わせるため）
 * 各イベントに perfNow（performance.now、ms）と perfOrigin を付ける。
 * 画面上の「UI A / UI B」の表示を隠す（条件名を参加者に見せない）。
 * 振り返り後の「説明を確認した（実験者）」押下時に、完全ログ JSON と CSV を自動で書き出す。
 */
(function () {
  "use strict";
  const PATCH_VERSION = "logging-patch-v2";
  if (typeof logEvent !== "function" || typeof renderAll !== "function") {
    console.warn("[logging_patch] app.js が先に読み込まれていません");
    return;
  }

  // ---- 共通：イベントに高精度時刻を付ける -------------------------------------
  const originalLogEvent = logEvent;
  window.logEvent = function (type, data = {}) {
    return originalLogEvent(type, { perfNow: Math.round(performance.now() * 10) / 10, ...data });
  };
  // 保存（localStorage）を伴わない軽量な追加（スクロールなど頻度の高い記録用）
  function pushQuiet(type, data = {}) {
    if (!session) return;
    session.events.push({ time: isoNow(), type, turn: session.currentTurn,
      perfNow: Math.round(performance.now() * 10) / 10, ...data });
  }
  function markPatched() {
    if (session && !session.loggingPatch) {
      session.loggingPatch = PATCH_VERSION;
      session.perfOrigin = performance.timeOrigin;
    }
  }

  // ---- AOI 矩形 -------------------------------------------------------------
  function rect(el) {
    if (!el || el.classList?.contains("hidden")) return null;
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) return null;
    // 全画面でないときのための画面座標補正（全画面では 0）
    const ox = window.screenX + (window.outerWidth - window.innerWidth) / 2;
    const oy = window.screenY + (window.outerHeight - window.innerHeight);
    const fs = Boolean(document.fullscreenElement);
    return [Math.round(b.left + (fs ? 0 : ox)), Math.round(b.top + (fs ? 0 : oy)), Math.round(b.width), Math.round(b.height)];
  }
  function union(rs) {
    const v = rs.filter(Boolean);
    if (!v.length) return null;
    const x1 = Math.min(...v.map((r) => r[0])), y1 = Math.min(...v.map((r) => r[1]));
    const x2 = Math.max(...v.map((r) => r[0] + r[2])), y2 = Math.max(...v.map((r) => r[1] + r[3]));
    return [x1, y1, x2 - x1, y2 - y1];
  }
  function clip(r, bounds) {
    if (!r || !bounds) return r;
    const x1 = Math.max(r[0], bounds[0]), y1 = Math.max(r[1], bounds[1]);
    const x2 = Math.min(r[0] + r[2], bounds[0] + bounds[2]), y2 = Math.min(r[1] + r[3], bounds[1] + bounds[3]);
    return x2 > x1 && y2 > y1 ? [x1, y1, x2 - x1, y2 - y1] : null;
  }
  function currentLayout() {
    const stage = rect(els.chatStage);
    const answers = els.chatStage.querySelectorAll(".message.ai .message-bubble");
    const latest = clip(rect(answers[answers.length - 1]), stage);
    const cardEls = [...els.criteriaList.querySelectorAll(".criterion-card")];
    const cards = cardEls.map(rect);
    // UI B：カード内のボタン行を別の矩形として記録（小さい矩形が優先されるので、カード本文とボタンを分けて集計できる）
    const buttons = cardEls.map((c) => rect(c.querySelector(".delegation-block")));
    const rects = {
      AI_LATEST: latest,
      HISTORY: stage,  // AI_LATEST と重なる部分は、小さい矩形（AI_LATEST）が優先される
      INPUT: rect(els.composer),
      GUIDE: union([rect(els.promptKicker), rect(els.promptText), rect(els.guideText), rect(els.turnAnchor)]),
      HELP: rect(els.insightHelp),
      CARD_1: cards[0] || null, CARD_2: cards[1] || null, CARD_3: cards[2] || null,
      BTN_1: buttons[0] || null, BTN_2: buttons[1] || null, BTN_3: buttons[2] || null,
      EXAMPLE: session?.condition === "UI_B" ? rect(els.exampleAssist) : null
    };
    Object.keys(rects).forEach((k) => { if (!rects[k]) delete rects[k]; });
    return rects;
  }
  let lastLayoutJson = "";
  function logLayout(reason) {
    if (!session || session.status !== "running" && session.status !== "complete") return;
    markPatched();
    const rects = currentLayout();
    const json = JSON.stringify(rects);
    if (json === lastLayoutJson && reason === "scroll") return;
    lastLayoutJson = json;
    pushQuiet("aoi_layout", { reason, at: isoNow(), scrollTop: Math.round(els.chatStage.scrollTop),
      fullscreen: Boolean(document.fullscreenElement), dpr: devicePixelRatio,
      viewport: [innerWidth, innerHeight], rects });
  }
  const afterPaint = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  // ---- 描画のたびに AOI を記録 ------------------------------------------------
  const originalRenderAll = renderAll;
  window.renderAll = function (...args) {
    const result = originalRenderAll.apply(this, args);
    afterPaint(() => logLayout("render"));
    return result;
  };

  // ---- 回答が実際に見えた時刻（ローディング表示が消えた後） ----------------------
  const originalSubmit = submitTurn;
  window.submitTurn = async function (...args) {
    const before = session ? session.rounds.map((r) => r.aiDisplayedAt) : [];
    await originalSubmit.apply(this, args);
    if (!session) return;
    const idx = session.rounds.findIndex((r, i) => r.aiDisplayedAt && r.aiDisplayedAt !== before[i]);
    if (idx < 0) return;  // 失敗・再送待ち
    afterPaint(() => {
      markPatched();
      const at = isoNow();
      session.rounds[idx].aiVisibleAt = at;
      logEvent("ai_visible", { turn: idx + 1, at, overlayHidden: els.aiLoading.classList.contains("hidden") });
      logLayout("ai_visible");
    });
  };

  // ---- スクロール・リサイズ ---------------------------------------------------
  let scrollTimer = null;
  els.chatStage.addEventListener("scroll", () => {
    if (scrollTimer) return;
    scrollTimer = setTimeout(() => {
      scrollTimer = null;
      pushQuiet("chat_scroll", { scrollTop: Math.round(els.chatStage.scrollTop) });
      logLayout("scroll");
    }, 100);
  }, { passive: true });
  window.addEventListener("resize", () => afterPaint(() => logLayout("resize")));
  document.addEventListener("fullscreenchange", () => afterPaint(() => logLayout("fullscreen")));

  // ---- クリック位置（同期用） -------------------------------------------------
  document.addEventListener("pointerdown", (e) => {
    if (!session || session.status !== "running") return;
    const target = e.target.closest?.("[data-aoi], .criterion-card, #composer, button");
    pushQuiet("pointer_down", { at: isoNow(), x: Math.round(e.screenX), y: Math.round(e.screenY),
      clientX: Math.round(e.clientX), clientY: Math.round(e.clientY),
      target: target ? (target.dataset?.aoi || target.id || target.className || target.tagName) : null });
  }, { capture: true, passive: true });

  // ---- 条件名を画面に出さない -------------------------------------------------
  if (els.conditionBadge) els.conditionBadge.style.visibility = "hidden";

  // ---- 説明確認時に自動で書き出す（視線記録の停止後） ---------------------------
  els.acknowledgeDebrief?.addEventListener("click", () => {
    setTimeout(() => {
      if (!session) return;
      try { exportJson(); exportCsv(); } catch (err) { console.warn("[logging_patch] auto export failed", err); }
    }, 300);
  });

  console.info(`[logging_patch] ${PATCH_VERSION} loaded`);
})();
