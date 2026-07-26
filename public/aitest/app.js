"use strict";

const STORAGE_KEY = "eye_ui_experiment_fixed_backboard_v6";
const MAX_TURNS = 6;
const SESSION_SCHEMA_VERSION = 6;
const FIXED_PROMPT = "AIの回答を踏まえ、計画を次に進めるために必要だと思うことを自由に入力してください。";
const QUERY = new URLSearchParams(location.search);
const PREVIEW_MODE = QUERY.get("preview") === "1";
const EMBED_MODE = QUERY.get("embed") === "1" || window.self !== window.top;
const API_HEALTH_URL = new URL("../api/aitest/health", document.baseURI);
const API_TURN_URL = new URL("../api/aitest/turn", document.baseURI);
const REVIEW_TURNS = [2, 3, 4, 6];

const $ = (selector) => document.querySelector(selector);
const els = {
  setupScreen: $("#setupScreen"), setupForm: $("#setupForm"), participantId: $("#participantId"), resumeButton: $("#resumeButton"),
  fullscreenToggle: $("#fullscreenToggle"), prepScreen: $("#prepScreen"), prepForm: $("#prepForm"),
  instructionScreen: $("#instructionScreen"), conditionInstruction: $("#conditionInstruction"), anchorForm: $("#anchorForm"),
  anchorText: $("#anchorText"), startTask: $("#startTask"), appShell: $("#appShell"), chatStage: $("#chatStage"),
  emptyConversation: $("#emptyConversation"), promptText: $("#promptText"), turnLabel: $("#turnLabel"), guideText: $("#guideText"),
  turnCount: $("#turnCount"), composer: $("#composer"), messageInput: $("#messageInput"), sendButton: $("#sendButton"),
  charCount: $("#charCount"), inputHint: $("#inputHint"), criteriaList: $("#criteriaList"), conditionBadge: $("#conditionBadge"),
  insightHelp: $("#insightHelp"), savingStatus: $("#savingStatus"), toast: $("#toast"), dialog: $("#experimenterDialog"),
  sessionSummary: $("#sessionSummary"), exportCsv: $("#exportCsv"), exportJson: $("#exportJson"),
  toggleFullscreen: $("#toggleFullscreen"), resetSession: $("#resetSession"), aiConnection: $("#aiConnection"),
  aiLoading: $("#aiLoading"), reflectionScreen: $("#reflectionScreen"), reflectionForm: $("#reflectionForm"),
  reflectionRows: $("#reflectionRows"), reflectionExport: $("#reflectionExport")
};

let session = null;
let toastTimer = null;
let apiReady = false;
let apiModels = null;
let firstFocusLoggedForTurn = false;

function isoNow() { return new Date().toISOString(); }
function clockTime(iso) { return iso ? new Date(iso).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""; }
function notifyParent(type, detail = {}) {
  if (!EMBED_MODE || window.parent === window) return;
  window.parent.postMessage({ source: "ai-dinner-experiment", type, ...detail }, "*");
}

function blankRound(turn) {
  return {
    turn,
    controlEvent: null,
    promptShownAt: null,
    inputFirstFocusAt: null,
    firstKeystrokeAt: null,
    lastKeystrokeAt: null,
    sendClickAt: null,
    submittedAt: null,
    requestStartedAt: null,
    aiResponseStartAt: null,
    aiResponseCompleteAt: null,
    rightPanelUpdateAt: null,
    aiDisplayedAt: null,
    analysisDisplayedAt: null,
    userText: "",
    aiText: "",
    analysis: null,
    stateMetadata: null,
    aiMeta: null,
    delegation: {},
    delegationTouched: {},
    errors: []
  };
}

function newSession(participantId, condition) {
  return {
    version: SESSION_SCHEMA_VERSION,
    promptVersion: apiModels?.promptVersion || "unknown",
    sessionId: `${participantId}-${condition}-${Date.now()}`,
    participantId: participantId.toUpperCase(),
    condition,
    status: "pretest",
    currentTurn: 1,
    createdAt: isoNow(),
    startedAt: null,
    completedAt: null,
    environment: {
      screenWidth: screen.width, screenHeight: screen.height, viewportWidth: innerWidth,
      viewportHeight: innerHeight, pixelRatio: devicePixelRatio, userAgent: navigator.userAgent
    },
    aiModels: apiModels,
    pretest: null,
    pretaskAnchor: null,
    reflection: null,
    rounds: Array.from({ length: MAX_TURNS }, (_, index) => blankRound(index + 1)),
    events: []
  };
}

function buildPreviewSession() {
  const preview = newSession("PREVIEW", QUERY.get("condition") === "R" ? "R" : "A");
  preview.status = "running";
  preview.currentTurn = 3;
  preview.startedAt = isoNow();
  preview.pretaskAnchor = {
    scenarioId: "busy",
    scenarioLabel: "相手は最近忙しく、少し疲れている",
    freeText: "気を遣わせず、久しぶりに自然に話せる時間にしたいです。"
  };
  const stamp = isoNow();
  const samples = [
    {
      user: "家で二人で夕食を食べたいです。少し特別にはしたいですが、準備が大変すぎるのは避けたいです。",
      ai: "自宅で無理なく準備でき、普段より少し特別に感じられる夕食を考えるということですね。料理は品数を増やすより、全体のまとまりと出し方で特別感を作る方向が合いそうです。現時点では、料理の内容だけでなく、相手とどのように過ごすかも含めて計画を具体化できます。"
    },
    {
      user: "相手は最近疲れているので、負担をかけずに話せる時間にしたいです。",
      ai: "相手に負担をかけず、久しぶりに話せる時間を作ることが大切なのですね。料理は食事中の作業を減らし、特別感は飲み物や盛り付けで控えめに加える方向で保てます。この条件を含めると、料理の準備と食事中の過ごし方を一つの体験として整えられます。"
    }
  ];
  samples.forEach((sample, index) => {
    const round = preview.rounds[index];
    Object.assign(round, {
      userText: sample.user, aiText: sample.ai, submittedAt: stamp, sendClickAt: stamp,
      aiResponseStartAt: stamp, aiResponseCompleteAt: stamp, rightPanelUpdateAt: stamp,
      aiDisplayedAt: stamp, analysisDisplayedAt: stamp, controlEvent: index ? "NORMAL_ANCHOR_INTEGRATION" : "NORMAL_BUILD",
      analysis: {
        summary: "現在の価値状態",
        criteria: [
          { id: "natural-talk", title: "自然に話せる時間", meaning: "会話が作業や演出に遮られない過ごし方", priority: "中心", delegationState: "CO_DECIDE", source: "USER_TURN", evidenceTurns: [1, 2], focus: true },
          { id: "light-burden", title: "相手への負担を抑える", meaning: "疲れていても気を遣わずに食べられる構成", priority: "維持", delegationState: "CO_DECIDE", source: "PRETASK_ANCHOR", evidenceTurns: [0, 2], focus: false },
          { id: "small-special", title: "控えめな特別感", meaning: "大げさにせず普段との違いを残す状態", priority: "未確定", delegationState: "CO_DECIDE", source: "USER_TURN", evidenceTurns: [1], focus: false }
        ]
      }
    });
  });
  preview.rounds[2].promptShownAt = stamp;
  return preview;
}

function logEvent(type, data = {}) {
  if (!session) return;
  session.events.push({ time: isoNow(), type, turn: session.currentTurn, ...data });
  saveSession();
}

function saveSession() {
  if (!session || PREVIEW_MODE) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  els.savingStatus.classList.add("visible");
  setTimeout(() => els.savingStatus.classList.remove("visible"), 500);
}

function loadStoredSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return parsed?.version === SESSION_SCHEMA_VERSION ? parsed : null;
  } catch { return null; }
}

function showOnly(target) {
  [els.setupScreen, els.prepScreen, els.instructionScreen, els.appShell, els.reflectionScreen]
    .forEach((el) => el.classList.toggle("hidden", el !== target));
}

async function checkAiHealth() {
  try {
    const response = await fetch(API_HEALTH_URL, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok || !data.configured) throw new Error("not configured");
    apiReady = true;
    apiModels = data;
    els.aiConnection.classList.add("ready");
    els.aiConnection.querySelector("b").textContent = "2つの AI に接続済み";
    els.aiConnection.querySelector("small").textContent = `対話：${data.dialogueModel} / 価値状態：${data.analysisModel}`;
  } catch {
    apiReady = false;
    els.aiConnection.classList.add("error");
    els.aiConnection.querySelector("b").textContent = "AI に接続できません";
    els.aiConnection.querySelector("small").textContent = "実験用サーバーの設定を確認してください";
    notifyParent("error", { code: "health_check_failed" });
  }
}

function prepareInstructions() {
  const adjustable = session.condition === "A";
  els.conditionInstruction.querySelector("h2").textContent = adjustable ? "参加方法を調整できる" : "同じ状態を参照する";
  els.conditionInstruction.querySelector("p").textContent = adjustable
    ? "各価値について、AIに提案してもらう、一緒に考える、自分で決める、の状態を変更できます。"
    : "各価値の参加方法は同じ位置と形式で表示されますが、この条件では変更できません。";
  if (session.pretaskAnchor) {
    const radio = els.anchorForm.querySelector(`input[value="${session.pretaskAnchor.scenarioId}"]`);
    if (radio) radio.checked = true;
    els.anchorText.value = session.pretaskAnchor.freeText || "";
  }
  showOnly(els.instructionScreen);
}

async function tryFullscreen() {
  if (document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  try { await document.documentElement.requestFullscreen(); }
  catch { showToast("全画面にできませんでした。必要に応じて F11 を押してください。"); }
}

function readAnchor() {
  const scenario = els.anchorForm.querySelector('input[name="scenario"]:checked');
  const freeText = els.anchorText.value.trim();
  if (!scenario) { showToast("場面カードを一つ選んでください。"); return null; }
  if (freeText.length < 4) { showToast("今回少し気にしていることを一文で入力してください。"); els.anchorText.focus(); return null; }
  const label = scenario.closest("label").querySelector("span").textContent;
  return { scenarioId: scenario.value, scenarioLabel: label, freeText };
}

function startTask(resuming = false) {
  if (!resuming) {
    const anchor = readAnchor();
    if (!anchor) return;
    session.pretaskAnchor = anchor;
    logEvent("pretask_anchor_recorded", { scenarioId: anchor.scenarioId, textLength: anchor.freeText.length });
  }
  session.status = session.status === "complete" ? "complete" : "running";
  if (!session.startedAt) session.startedAt = isoNow();
  const round = session.rounds[session.currentTurn - 1];
  if (!round.promptShownAt) round.promptShownAt = isoNow();
  els.appShell.dataset.condition = session.condition;
  els.conditionBadge.textContent = session.condition === "A" ? "調整できます" : "参照のみ";
  els.insightHelp.textContent = session.condition === "A"
    ? "価値の意味と優先状態を確認し、必要に応じてAIの参加方法を調整できます。"
    : "価値の意味、優先状態、AIの参加方法を同じ形式で表示します。";
  showOnly(els.appShell);
  renderAll();
  if (!resuming) logEvent("task_started", { condition: session.condition });
}

function renderAll() {
  els.chatStage.querySelectorAll(".message, .completion-card").forEach((el) => el.remove());
  const completed = session.rounds.filter((round) => round.submittedAt);
  els.emptyConversation.classList.toggle("hidden", completed.length > 0);
  completed.forEach(renderRoundMessages);
  renderTurn();
  renderCriteria();
  if (session.status === "complete") renderCompletion();
  requestAnimationFrame(() => { els.chatStage.scrollTop = els.chatStage.scrollHeight; });
}

function renderRoundMessages(round) {
  els.chatStage.append(
    createMessage("user", "あなた", round.userText, round.submittedAt, round.turn),
    createMessage("ai", "AI", round.aiText, round.aiResponseCompleteAt || round.aiDisplayedAt, round.turn)
  );
}

function createMessage(kind, speaker, text, time, turn) {
  const article = document.createElement("article");
  article.className = `message ${kind}${turn === session.currentTurn - 1 ? " current" : ""}`;
  article.dataset.aoi = kind === "ai" ? "AOI_AI_Answer" : "AOI_Left_Context";
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = kind === "ai" ? "AI" : "YOU";
  const body = document.createElement("div");
  body.className = "message-body";
  const meta = document.createElement("p");
  meta.className = "message-meta";
  meta.innerHTML = `<span>${speaker} · 対話 ${turn}</span><time>${clockTime(time)}</time>`;
  const bubble = document.createElement("p");
  bubble.className = "message-bubble";
  bubble.textContent = text;
  body.append(meta, bubble);
  article.append(avatar, body);
  return article;
}

function renderTurn() {
  const turn = Math.min(session.currentTurn, MAX_TURNS);
  const complete = session.status === "complete";
  els.turnLabel.textContent = complete ? "完了" : `対話 ${turn}`;
  els.turnCount.textContent = `${turn} / ${MAX_TURNS}`;
  els.promptText.textContent = complete ? "全6回の対話が完了しました。" : FIXED_PROMPT;
  els.guideText.textContent = complete ? "視線計測を停止してから、振り返りへ進んでください。" : "決まった答え方はありません。";
  els.messageInput.disabled = complete;
  els.sendButton.disabled = complete;
  els.messageInput.placeholder = complete ? "課題は完了しました" : "次に必要だと思うことを自由に入力してください。";
  els.inputHint.textContent = complete ? "入力完了" : "次に必要だと思うことを自由に入力";
  firstFocusLoggedForTurn = Boolean(session.rounds[turn - 1]?.inputFirstFocusAt);
}

function stateToControl(value) {
  return ({ AI_PROPOSE: "ai", CO_DECIDE: "consult", USER_DECIDE: "self" })[value] || "consult";
}

function renderCriteria() {
  const completed = session.rounds.filter((round) => round.analysis);
  const source = completed.at(-1);
  const activeRound = session.rounds[Math.min(session.currentTurn - 1, MAX_TURNS - 1)];
  els.criteriaList.replaceChildren();
  if (!source) {
    const empty = document.createElement("article");
    empty.className = "criterion-card";
    empty.innerHTML = "<div class=\"criterion-title\"><h3>価値状態の更新待ち</h3></div><p class=\"criterion-interpretation\">最初の対話後に、ここへ同じ形式の価値状態が表示されます。</p>";
    els.criteriaList.append(empty);
    return;
  }
  let defaultsAdded = false;
  source.analysis.criteria.forEach((criterion) => {
    const key = criterion.id || criterion.title;
    if (session.condition === "A" && !activeRound.delegation[key]) {
      activeRound.delegation[key] = "consult";
      activeRound.delegationTouched[key] = false;
      defaultsAdded = true;
    }
    const selected = session.condition === "A"
      ? (activeRound.delegation[key] || "consult")
      : stateToControl(criterion.delegationState);
    const card = document.createElement("article");
    card.className = `criterion-card${criterion.focus ? " focus" : ""}`;
    card.dataset.key = key;
    const heading = document.createElement("div");
    heading.className = "criterion-title";
    const h3 = document.createElement("h3");
    h3.textContent = criterion.title;
    const tags = document.createElement("div");
    tags.className = "criterion-tags";
    const priority = document.createElement("span");
    priority.textContent = `優先状態：${criterion.priority}`;
    tags.append(priority);
    const label = document.createElement("p");
    label.className = "criterion-label";
    label.textContent = "AIが現在形成している意味";
    const meaning = document.createElement("p");
    meaning.className = "criterion-interpretation";
    meaning.textContent = criterion.meaning;
    heading.append(h3);
    card.append(heading, tags, label, meaning, createDelegationControl(key, selected, session.condition === "R"));
    els.criteriaList.append(card);
  });
  if (defaultsAdded) {
    session.events.push({ time: isoNow(), type: "delegation_defaults_applied", turn: session.currentTurn, value: "consult" });
    saveSession();
  }
}

function createDelegationControl(key, selectedValue, readOnly) {
  const control = document.createElement("div");
  control.className = `delegation-control${readOnly ? " read-only" : ""}`;
  control.setAttribute("role", "group");
  control.setAttribute("aria-label", "AIの参加方法");
  control.dataset.aoi = "AOI_Right_Delegation_Control";
  [["ai", "AIに提案してもらう"], ["consult", "一緒に考える"], ["self", "自分で決める"]].forEach(([value, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.value = value;
    button.textContent = label;
    button.disabled = readOnly;
    button.classList.toggle("selected", value === selectedValue);
    button.setAttribute("aria-pressed", value === selectedValue ? "true" : "false");
    button.addEventListener("click", () => {
      if (readOnly) return;
      const round = session.rounds[session.currentTurn - 1];
      const previous = round.delegation[key] || "consult";
      round.delegation[key] = value;
      round.delegationTouched[key] = true;
      logEvent("delegation_changed", { criterion: key, from: previous, to: value, delegationChangeAt: isoNow() });
      control.querySelectorAll("button").forEach((item) => {
        const selected = item.dataset.value === value;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", selected ? "true" : "false");
      });
    });
    control.append(button);
  });
  return control;
}

async function submitTurn() {
  if (session.status !== "running") return;
  if (!apiReady) { showToast("2つの AI に接続できていません。実験者を呼んでください。"); return; }
  const text = els.messageInput.value.trim();
  if (!text) { showToast("メッセージを入力してください。"); els.messageInput.focus(); return; }
  const index = session.currentTurn - 1;
  const round = session.rounds[index];
  const sendTime = isoNow();
  round.sendClickAt = sendTime;
  round.requestStartedAt = sendTime;
  const history = session.rounds.slice(0, index).flatMap((item) => [
    { role: "user", content: item.userText },
    { role: "assistant", content: item.aiText }
  ]);
  const previousAnalysis = index > 0 ? session.rounds[index - 1].analysis : null;
  els.aiLoading.classList.remove("hidden");
  els.messageInput.disabled = true;
  els.sendButton.disabled = true;
  logEvent("send_clicked", { length: text.length, sendClickAt: sendTime });
  try {
    const response = await fetch(API_TURN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.sessionId,
        condition: session.condition,
        turn: session.currentTurn,
        userText: text,
        history,
        pretaskAnchor: session.pretaskAnchor,
        delegation: session.condition === "A" ? round.delegation : {},
        delegationSourceCriteria: session.condition === "A" ? (previousAnalysis?.criteria || []) : []
      })
    });
    const result = await response.json();
    if (!response.ok) {
      const requestError = new Error(result.error || `HTTP ${response.status}`);
      requestError.details = result;
      throw requestError;
    }
    const displayTime = isoNow();
    round.userText = text;
    round.submittedAt = sendTime;
    round.aiText = result.dialogue;
    round.analysis = result.analysis;
    round.stateMetadata = result.stateMetadata;
    round.controlEvent = result.stateMetadata?.controlEvent || result.meta?.controlEvent;
    round.aiMeta = result.meta;
    round.aiResponseStartAt = displayTime;
    round.aiResponseCompleteAt = displayTime;
    round.rightPanelUpdateAt = displayTime;
    round.aiDisplayedAt = displayTime;
    round.analysisDisplayedAt = displayTime;
    logEvent("ai_response_complete", { at: displayTime, controlEvent: round.controlEvent, dialogueResponseId: result.meta.dialogueResponseId });
    logEvent("right_panel_updated", { at: displayTime, analysisResponseId: result.meta.analysisResponseId, itemCount: result.analysis.criteria.length });
    els.messageInput.value = "";
    updateCharCount();
    autoResize();
    if (session.currentTurn >= MAX_TURNS) {
      session.status = "complete";
      session.completedAt = isoNow();
      logEvent("task_completed");
      notifyParent("task-completed", { sessionId: session.sessionId });
    } else {
      session.currentTurn += 1;
      session.rounds[session.currentTurn - 1].promptShownAt = isoNow();
      firstFocusLoggedForTurn = false;
      logEvent("turn_prompt_displayed", { prompt: FIXED_PROMPT });
    }
    saveSession();
    renderAll();
    // Do not focus automatically: ai_response_complete → input_focus is TOI-A.
  } catch (error) {
    const details = error.details || {};
    const failure = {
      time: isoNow(),
      exceptionCode: details.exceptionCode || "T99_CLIENT_OR_SERVER_ERROR",
      stage: details.stage || "client",
      retryable: Boolean(details.retryable),
      message: error.message,
      attempts: details.attempts || [],
      promptVersion: details.promptVersion || session.promptVersion
    };
    round.errors.push(failure);
    logEvent("ai_request_failed", failure);
    saveSession();
    const message = failure.exceptionCode === "T03_QUOTA_EXCEEDED"
      ? "API の利用枠が不足しています。実験担当者に連絡してください。"
      : `AI の応答に失敗しました（${failure.exceptionCode}）。記録は保存されています。`;
    showToast(message);
    els.messageInput.disabled = false;
    els.sendButton.disabled = false;
  } finally {
    els.aiLoading.classList.add("hidden");
  }
}

function renderCompletion() {
  if (els.chatStage.querySelector(".completion-card")) return;
  const card = document.createElement("section");
  card.className = "completion-card";
  card.innerHTML = "<h3>6回の対話が完了しました</h3><p>視線計測を停止してから、対話後の振り返りへ進んでください。</p><button type=\"button\">振り返りへ進む</button>";
  card.querySelector("button").addEventListener("click", openReflection);
  els.chatStage.append(card);
}

function openReflection() {
  session.status = "reflection";
  logEvent("reflection_opened");
  buildReflectionRows();
  showOnly(els.reflectionScreen);
}

function buildReflectionRows() {
  els.reflectionRows.replaceChildren();
  const prompts = [
    ["reflected", "AI回答は自分の考えを反映していた"],
    ["fixedMeaning", "AIが自分の言葉を一つの意味に決めていると感じた"],
    ["proxyPriority", "AIが重視点の優先順位を代わりに決めていると感じた"],
    ["easyNext", "次に何を入力すればよいか考えやすかった"],
    ["needRevision", "自分の考えを修正・追加する必要を感じた"]
  ];
  REVIEW_TURNS.forEach((turn) => {
    const card = document.createElement("section");
    card.className = "review-turn-card";
    const answer = session.rounds[turn - 1].aiText || "";
    card.innerHTML = `<h2>対話 ${turn}</h2><p>${escapeHtml(answer.slice(0, 220))}</p>`;
    prompts.forEach(([name, label]) => {
      const row = document.createElement("label");
      row.innerHTML = `<span>${label}</span><select name="${name}_${turn}" required><option value="">選択</option>${[1, 2, 3, 4, 5].map((value) => `<option value="${value}">${value}</option>`).join("")}</select>`;
      card.append(row);
    });
    els.reflectionRows.append(card);
  });
  if (session.reflection) {
    session.reflection.rounds.forEach((review) => {
      Object.entries(review).forEach(([key, value]) => {
        if (key === "turn") return;
        const input = els.reflectionForm.elements[`${key}_${review.turn}`];
        if (input) input.value = value;
      });
    });
    ["understanding", "priority", "nextInput", "targetExposure"].forEach((name) => {
      els.reflectionForm.elements[name].value = session.reflection[name];
      $(`#${name}Value`).textContent = session.reflection[name];
    });
    els.reflectionForm.elements.turningPoint.value = session.reflection.turningPoint || "";
    els.reflectionForm.querySelectorAll("input,select,textarea").forEach((item) => { item.disabled = true; });
    els.reflectionExport.hidden = false;
  }
}

function updateCharCount() { els.charCount.textContent = `${els.messageInput.value.length} / 500`; }
function autoResize() {
  els.messageInput.style.height = "auto";
  els.messageInput.style.height = `${Math.min(els.messageInput.scrollHeight, 116)}px`;
}
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 4200);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function openExperimenterMenu() {
  if (!session) return;
  logEvent("experimenter_menu_opened");
  els.sessionSummary.innerHTML = [
    ["参加者", session.participantId], ["条件", session.condition], ["状態", session.status],
    ["現在", `${session.currentTurn} / 6`], ["規則", session.promptVersion], ["スキーマ", session.version]
  ].map(([term, value]) => `<div><dt>${term}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  els.dialog.showModal();
}

function exportCsv() {
  const header = [
    "participant_id", "condition", "session_schema_version", "prompt_version", "round", "control_event",
    "prompt_shown_ts", "ai_response_start_ts", "ai_response_complete_ts", "right_panel_update_ts",
    "input_focus_ts", "first_keystroke_ts", "last_keystroke_ts", "send_click_ts",
    "dialogue_model", "analysis_model", "dialogue_latency_ms", "analysis_latency_ms",
    "validation_status", "delegation_json", "delegation_touched_json"
  ];
  const rows = session.rounds.map((round) => [
    session.participantId, session.condition, session.version, round.aiMeta?.promptVersion || session.promptVersion,
    round.turn, round.controlEvent || "", round.promptShownAt || "", round.aiResponseStartAt || "",
    round.aiResponseCompleteAt || "", round.rightPanelUpdateAt || "", round.inputFirstFocusAt || "",
    round.firstKeystrokeAt || "", round.lastKeystrokeAt || "", round.sendClickAt || "",
    round.aiMeta?.dialogueModel || "", round.aiMeta?.analysisModel || "", round.aiMeta?.dialogueLatencyMs || "",
    round.aiMeta?.analysisLatencyMs || "", round.aiMeta?.validationStatus || "", JSON.stringify(round.delegation),
    JSON.stringify(round.delegationTouched)
  ]);
  download([header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n"), `${safeName(session.sessionId)}_timing.csv`, "text/csv;charset=utf-8");
  logEvent("export_csv");
}
function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function exportJson() {
  download(JSON.stringify(session, null, 2), `${safeName(session.sessionId)}_complete.json`, "application/json");
  logEvent("export_json");
}
function safeName(value) { return String(value).replace(/[^A-Za-z0-9_-]/g, "_"); }
function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

els.setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!apiReady) { showToast("AI 接続を確認してください。"); return; }
  const data = new FormData(els.setupForm);
  session = newSession(String(data.get("participantId")).trim(), String(data.get("condition")));
  saveSession();
  if (els.fullscreenToggle.checked) await tryFullscreen();
  showOnly(els.prepScreen);
});

els.prepForm.querySelectorAll('input[type="range"]').forEach((input) => {
  const output = $(`#${input.name}Value`);
  input.addEventListener("input", () => { if (output) output.textContent = input.value; });
});
els.prepForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(els.prepForm);
  session.pretest = {
    completedAt: isoNow(),
    sleepiness: Number(data.get("sleepiness")),
    tension: Number(data.get("tension")),
    confidence: Number(data.get("confidence")),
    familiarity: Number(data.get("familiarity")),
    checks: data.getAll("checks")
  };
  session.status = "instructions";
  logEvent("pretest_completed");
  prepareInstructions();
});

els.resumeButton.addEventListener("click", () => {
  session = loadStoredSession();
  if (!session) return;
  if (session.status === "pretest") showOnly(els.prepScreen);
  else if (session.status === "instructions") prepareInstructions();
  else if (session.status === "reflection" || session.status === "finished") { buildReflectionRows(); showOnly(els.reflectionScreen); }
  else startTask(true);
});
els.startTask.addEventListener("click", () => startTask(false));
els.composer.addEventListener("submit", (event) => { event.preventDefault(); submitTurn(); });
els.messageInput.addEventListener("input", () => {
  updateCharCount();
  autoResize();
  if (!session || session.status !== "running") return;
  const round = session.rounds[session.currentTurn - 1];
  const at = isoNow();
  if (!round.firstKeystrokeAt && els.messageInput.value.length) {
    round.firstKeystrokeAt = at;
    logEvent("first_keystroke", { at });
  }
  round.lastKeystrokeAt = at;
});
els.messageInput.addEventListener("focus", () => {
  if (!session || firstFocusLoggedForTurn || session.status !== "running") return;
  const round = session.rounds[session.currentTurn - 1];
  round.inputFirstFocusAt = isoNow();
  firstFocusLoggedForTurn = true;
  logEvent("input_first_focus", { at: round.inputFirstFocusAt });
});
els.messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    submitTurn();
  }
});
els.exportCsv.addEventListener("click", exportCsv);
els.exportJson.addEventListener("click", exportJson);
els.reflectionExport.addEventListener("click", exportJson);
els.reflectionForm.querySelectorAll('input[type="range"]').forEach((input) => {
  const output = $(`#${input.name}Value`);
  input.addEventListener("input", () => { if (output) output.textContent = input.value; });
});
els.reflectionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(els.reflectionForm);
  const rounds = REVIEW_TURNS.map((turn) => ({
    turn,
    reflected: Number(data.get(`reflected_${turn}`)),
    fixedMeaning: Number(data.get(`fixedMeaning_${turn}`)),
    proxyPriority: Number(data.get(`proxyPriority_${turn}`)),
    easyNext: Number(data.get(`easyNext_${turn}`)),
    needRevision: Number(data.get(`needRevision_${turn}`))
  }));
  session.reflection = {
    completedAt: isoNow(),
    rounds,
    understanding: Number(data.get("understanding")),
    priority: Number(data.get("priority")),
    nextInput: Number(data.get("nextInput")),
    targetExposure: Number(data.get("targetExposure")),
    turningPoint: String(data.get("turningPoint") || "").trim()
  };
  session.status = "finished";
  logEvent("reflection_completed");
  saveSession();
  els.reflectionForm.querySelectorAll("input,select,textarea").forEach((item) => { item.disabled = true; });
  els.reflectionExport.hidden = false;
  showToast("振り返りを保存しました。");
});
els.toggleFullscreen.addEventListener("click", async () => {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await tryFullscreen();
  logEvent("fullscreen_toggled", { active: Boolean(document.fullscreenElement) });
});
els.resetSession.addEventListener("click", () => {
  if (!confirm("このセッションを終了し、端末内の記録を削除しますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "e") {
    event.preventDefault();
    openExperimenterMenu();
  }
});
window.addEventListener("resize", () => { if (session) logEvent("viewport_changed", { width: innerWidth, height: innerHeight }); });
window.addEventListener("beforeunload", saveSession);

(async function init() {
  await checkAiHealth();
  if (PREVIEW_MODE) {
    session = buildPreviewSession();
    startTask(true);
    return;
  }
  const stored = loadStoredSession();
  if (stored && stored.status !== "finished") {
    els.resumeButton.hidden = false;
    els.resumeButton.textContent = `${stored.participantId} の続きから再開`;
  }
  showOnly(els.setupScreen);
})();
