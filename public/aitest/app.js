"use strict";

const STORAGE_KEY = "eye_ui_experiment_ja_session_v5";
const MAX_TURNS = 6;
const SESSION_SCHEMA_VERSION = 5;
const QUERY = new URLSearchParams(location.search);
const PREVIEW_MODE = QUERY.get("preview") === "1";
const EMBED_MODE = QUERY.get("embed") === "1" || window.self !== window.top;
const API_HEALTH_URL = new URL("api/health", document.baseURI);
const API_TURN_URL = new URL("api/turn", document.baseURI);

const turns = [
  { prompt: "現在考えている特別な夕食について説明してください。", guide: "相手の状態、好み、食事で得てほしい感覚など、すでに考えていることから始められます。" },
  { prompt: "この夕食で相手に得てほしい具体的な感覚を、さらに説明してください。", guide: "その感覚を、食べ物や実際の食事体験と結びつけてください。" },
  { prompt: "その食事体験に影響する新しい要望を一つ追加してください。", guide: "食べ物や食べ進める過程に、どのように表れるべきかを説明してください。" },
  { prompt: "その要望で、さらに配慮したい感覚や境界を説明してください。", guide: "現在の献立や、実際に食べる過程と結びつけてください。" },
  { prompt: "複数の要望が同時にあるとき、どのように取捨選択するかを説明してください。", guide: "AI がまだ理解していない条件を追加しても構いません。" },
  { prompt: "ここまでに形成された考えを、夕食全体の要望としてまとめてください。", guide: "残したい部分、調整したい部分、まだ決めない部分を説明してください。" }
];

const $ = (selector) => document.querySelector(selector);
const els = {
  setupScreen: $("#setupScreen"), setupForm: $("#setupForm"), participantId: $("#participantId"), resumeButton: $("#resumeButton"),
  fullscreenToggle: $("#fullscreenToggle"), prepScreen: $("#prepScreen"), prepForm: $("#prepForm"),
  instructionScreen: $("#instructionScreen"), conditionInstruction: $("#conditionInstruction"), startTask: $("#startTask"),
  appShell: $("#appShell"), chatStage: $("#chatStage"), emptyConversation: $("#emptyConversation"), promptText: $("#promptText"), turnLabel: $("#turnLabel"),
  guideText: $("#guideText"), turnCount: $("#turnCount"), composer: $("#composer"), messageInput: $("#messageInput"), sendButton: $("#sendButton"), charCount: $("#charCount"),
  inputHint: $("#inputHint"), criteriaList: $("#criteriaList"), conditionBadge: $("#conditionBadge"), insightHelp: $("#insightHelp"),
  savingStatus: $("#savingStatus"), toast: $("#toast"), dialog: $("#experimenterDialog"), sessionSummary: $("#sessionSummary"), exportCsv: $("#exportCsv"),
  exportJson: $("#exportJson"), toggleFullscreen: $("#toggleFullscreen"), resetSession: $("#resetSession"),
  aiConnection: $("#aiConnection"), aiLoading: $("#aiLoading"), loadingTitle: $("#loadingTitle"), loadingDetail: $("#loadingDetail"),
  reflectionScreen: $("#reflectionScreen"), reflectionForm: $("#reflectionForm"), reflectionRows: $("#reflectionRows"), reflectionExport: $("#reflectionExport")
};

let session = null;
let toastTimer = null;
let firstFocusLoggedForTurn = false;
let apiReady = false;
let apiModels = null;

function isoNow() { return new Date().toISOString(); }
function clockTime(iso) { return new Date(iso).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function notifyParent(type, detail = {}) {
  if (!EMBED_MODE || window.parent === window) return;
  window.parent.postMessage({ source: "ai-dinner-experiment", type, ...detail }, "*");
}
function newSession(participantId, condition) {
  return {
    version: SESSION_SCHEMA_VERSION, promptVersion: apiModels?.promptVersion || "unknown", sessionId: `${participantId}-${condition}-${Date.now()}`, participantId: participantId.toUpperCase(), condition,
    status: "pretest", currentTurn: 1, createdAt: isoNow(), startedAt: null, completedAt: null,
    environment: { screenWidth: screen.width, screenHeight: screen.height, viewportWidth: innerWidth, viewportHeight: innerHeight, pixelRatio: devicePixelRatio, userAgent: navigator.userAgent },
    aiModels: apiModels, pretest: null, practice: null, reflection: null,
    rounds: turns.map((_, i) => ({ turn: i + 1, promptShownAt: null, inputFirstFocusAt: null, submittedAt: null, aiDisplayedAt: null, analysisDisplayedAt: null, userText: "", aiText: "", analysis: null, aiMeta: null, delegation: {}, delegationTouched: {}, errors: [], exampleUsed: false })),
    events: []
  };
}

function buildPreviewSession() {
  const preview = newSession("PREVIEW", "B");
  preview.status = "running";
  preview.currentTurn = 4;
  preview.startedAt = isoNow();
  const samples = [
    {
      user: "親しい友人との出会いから二年になるので、家で特別な夕食を用意したいです。相手はビールと香ばしい脂の風味が好きですが、最近は疲れているので、準備を複雑にしすぎたくありません。",
      ai: "この夕食は、少量の香ばしい主菜と穏やかな付け合わせを一つの流れにまとめる方向から始められます。好きな香ばしさと適度な脂の満足感を残しつつ、付け合わせとスープは軽くして、疲れているときの食欲を重さで抑えないようにします。主要な料理を最初にまとめて整えれば、食事中に何度も世話をする負担も減らせます。ビールは献立全体を支配させず、香りを補う役割に留めます。この夕食を食べた相手に、どのような具体的な感覚を得てほしいですか？",
    },
    {
      user: "家で鍋を囲むのは良さそうです。少し特別感もほしいですが、それ以上に、料理の世話で忙しくならず、座って気楽に話せることを大切にしたいです。",
      ai: "求めているのは料理の数で作るにぎやかさではなく、二人が落ち着いて自然に話しながら、丁寧に用意された夕食だと感じられることです。鍋は途中で何度も具材を足す形を避け、煮崩れにくい主な具材と付け合わせを最初に整えます。特別感は一つの香ばしさと一つの穏やかな香りに集中させると、相手が好きな満足感を残しながら、あなたが頻繁に席を立つことも防げます。この感覚が食事の中で本当に出るようにするために、他に一緒に考えるべき新しい要望はありますか？",
    },
    {
      user: "食後に重く感じないよう、夕食全体に少し涼しさもほしいです。ただし、疲れている相手が冷たさでつらくならないようにしたいです。",
      ai: "追加された涼しさは、先ほどの香ばしさと脂の満足感に出口を作り、食後の重さを残さないための条件です。一方で、温かく落ち着いた食事の流れも守る必要があるため、主菜の濃さ、付け合わせの水分、入口温度に直接影響します。つまり、ここでいう涼しさは、完成したすべての料理に氷を直接入れる形にします。鍋のスープ、香ばしい主菜、最後の軽いデザートにも見える氷を残し、味を軽くするのではなく、毎回の低温で重さを消します。この要望を本当に夕食に落とし込むために、ほかにどのような感覚や境界も大切にしたいですか？",
    },
  ];
  samples.forEach((sample, index) => {
    const round = preview.rounds[index];
    const stamp = new Date(Date.now() - (3 - index) * 60000).toISOString();
    round.userText = sample.user;
    round.aiText = sample.ai;
    round.submittedAt = stamp;
    round.aiDisplayedAt = stamp;
    round.analysisDisplayedAt = stamp;
    round.analysis = {
      summary: "プレビュー",
      criteria: [
        { id: `p${index + 1}-conversation`, title: "自然な食事中の会話", category: "上位目标", description: "献立と食べ進めるテンポは、時間を引き延ばすのではなく、二人が自然に話せる状態を支える必要があります。", inferenceLevel: "上下文推测", confidence: "高", evidenceTurns: [2, 3], focus: true },
        { id: `p${index + 1}-effort`, title: "世話の少ない献立", category: "控制标准", description: "料理のために頻繁に席を立ったり、具材を足し続けたり、常に様子を見たりしなくてよい構成が必要です。", inferenceLevel: "明确表达", confidence: "高", evidenceTurns: [1, 2, 3], focus: false },
        { id: `p${index + 1}-special`, title: "特別感を一点に集める", category: "构成要素", description: "特別感は料理数や操作を増やすのではなく、少数の味覚上の要点に集中させる方向が考えられます。", inferenceLevel: "上下文推测", confidence: "中", evidenceTurns: [2], focus: false },
      ],
    };
  });
  preview.rounds[3].promptShownAt = isoNow();
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
  clearTimeout(saveSession.timer);
  saveSession.timer = setTimeout(() => els.savingStatus.classList.remove("visible"), 700);
}

function loadStoredSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

function showOnly(target) {
  [els.setupScreen, els.prepScreen, els.instructionScreen, els.appShell, els.reflectionScreen].forEach((el) => el.classList.toggle("hidden", el !== target));
}

async function checkAiHealth() {
  els.aiConnection.classList.remove("ready", "error");
  els.aiConnection.querySelector("b").textContent = "2つの AI を確認中";
  try {
    const response = await fetch(API_HEALTH_URL, { cache: "no-store" });
    const health = await response.json();
    if (!response.ok || !health.configured) throw new Error("API Key が設定されていません");
    apiReady = true;
    apiModels = { dialogue: health.dialogueModel, analysis: health.analysisModel, promptVersion: health.promptVersion, sessionSchemaVersion: health.sessionSchemaVersion };
    els.aiConnection.classList.add("ready");
    els.aiConnection.querySelector("b").textContent = "2つの AI に接続済み";
    els.aiConnection.querySelector("small").textContent = `対話：${health.dialogueModel} / 分析：${health.analysisModel}`;
    notifyParent("ready", { promptVersion: health.promptVersion });
  } catch (error) {
    apiReady = false;
    els.aiConnection.classList.add("error");
    els.aiConnection.querySelector("b").textContent = "AI に接続できません";
    els.aiConnection.querySelector("small").textContent = "実験用サーバーの設定を確認してください";
    notifyParent("error", { code: "health_check_failed" });
  }
}

function prepareInstructions() {
  const isB = session.condition === "B";
  els.conditionInstruction.querySelector("h2").textContent = isB ? "右側で判断方法を調整する" : "自然に対話を続ける";
  els.conditionInstruction.querySelector("p").textContent = isB
    ? "初期設定は「AI と相談」です。現在の考えに合わせて、「自分で判断」または「AI に任せる」へ変更できます。"
    : "必要に応じて入力、質問、修正を続けてください。決まった言い方を使う必要はありません。";
  showOnly(els.instructionScreen);
}

function prepareSelfObservation() {
  showOnly(els.prepScreen);
}

async function tryFullscreen() {
  if (document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  try { await document.documentElement.requestFullscreen(); } catch { showToast("全画面にできませんでした。必要に応じて F11 を押してください。"); }
}

function startTask(resuming = false) {
  session.status = session.status === "complete" ? "complete" : "running";
  if (!session.startedAt) session.startedAt = isoNow();
  if (!session.rounds[session.currentTurn - 1].promptShownAt) session.rounds[session.currentTurn - 1].promptShownAt = isoNow();
  els.appShell.dataset.condition = session.condition;
  els.conditionBadge.textContent = session.condition === "B" ? "調整できます" : "確認のみ";
  els.insightHelp.textContent = session.condition === "B"
    ? "初期設定は「AI と相談」です。今の考えに合わせて変更できます。"
    : "AI が会話から推測した内容です。違う場合は次の発言で直せます。";
  showOnly(els.appShell);
  renderAll();
  if (!resuming) logEvent("task_started", { condition: session.condition });
}

function renderAll() {
  els.appShell.dataset.condition = session.condition;
  els.chatStage.querySelectorAll(".message, .completion-card").forEach((el) => el.remove());
  const completedRounds = session.rounds.filter((r) => r.submittedAt);
  els.emptyConversation.classList.toggle("hidden", completedRounds.length > 0);
  completedRounds.forEach(renderRoundMessages);
  renderTurn();
  renderCriteria();
  if (session.status === "complete") renderCompletion();
  requestAnimationFrame(() => { els.chatStage.scrollTop = els.chatStage.scrollHeight; });
}

function renderRoundMessages(round) {
  const user = createMessage("user", "あなた", round.userText, round.submittedAt, round.turn);
  const ai = createMessage("ai", "AI", round.aiText, round.aiDisplayedAt, round.turn);
  els.chatStage.append(user, ai);
}

function createMessage(kind, speaker, text, time, turn) {
  const article = document.createElement("article");
  article.className = `message ${kind}${turn === session.currentTurn - 1 ? " current" : ""}`;
  article.dataset.aoi = kind === "ai" ? "AOI_AI_Answer" : "AOI_Left_Context";
  const avatar = document.createElement("div"); avatar.className = "message-avatar"; avatar.textContent = kind === "ai" ? "AI" : "YOU";
  const body = document.createElement("div"); body.className = "message-body";
  const meta = document.createElement("p"); meta.className = "message-meta"; meta.innerHTML = `<span>${speaker} · Turn ${turn}</span><time>${clockTime(time)}</time>`;
  const bubble = document.createElement("p"); bubble.className = "message-bubble"; bubble.textContent = text;
  body.append(meta, bubble); article.append(avatar, body); return article;
}

function renderTurn() {
  const turn = Math.min(session.currentTurn, MAX_TURNS);
  const complete = session.status === "complete";
  els.turnLabel.textContent = complete ? "COMPLETE" : `TURN ${turn}`;
  els.turnCount.textContent = `${turn} / ${MAX_TURNS}`;
  els.promptText.textContent = complete ? "全6ターンが完了しました。" : turns[turn - 1].prompt;
  els.guideText.textContent = complete ? "視線計測を停止してから、対話後の振り返りへ進んでください。" : turns[turn - 1].guide;
  els.messageInput.disabled = complete;
  els.sendButton.disabled = complete;
  els.messageInput.placeholder = complete ? "課題は完了しました" : "ここに入力してください";
  els.inputHint.textContent = complete ? "入力完了" : `Turn ${turn}：あなたの考えを入力`;
  firstFocusLoggedForTurn = Boolean(session.rounds[turn - 1]?.inputFirstFocusAt);
}

function renderCriteria() {
  const completed = session.rounds.filter((item) => item.analysis);
  const source = completed.at(-1);
  const round = session.rounds[Math.min(session.currentTurn - 1, MAX_TURNS - 1)];
  els.criteriaList.replaceChildren();
  if (!source) {
    const empty = document.createElement("article");
    empty.className = "criterion-card";
    empty.innerHTML = "<div class=\"criterion-title\"><h3>分析待機中</h3><span>分析 AI</span></div><p>最初の対話後に、独立した分析 AI がここを更新します。</p>";
    els.criteriaList.append(empty);
    return;
  }
  let defaultsAdded = false;
  if (session.condition === "B" && session.status !== "complete") {
    source.analysis.criteria.forEach(({ id, title }) => {
      const key = id || title;
      if (!round.delegation[key]) {
        round.delegation[key] = "consult";
        round.delegationTouched ||= {};
        round.delegationTouched[key] = false;
        defaultsAdded = true;
      }
    });
  }
  const categoryLabels = {
    "上位目标": "大切にしたいこと",
    "构成要素": "具体的な要素",
    "控制标准": "外せない条件",
    "判断对象": "確認したいこと",
  };
  source.analysis.criteria.forEach(({ id, title, category, description, focus }) => {
    const key = id || title;
    const card = document.createElement("article");
    card.className = `criterion-card${focus ? " focus" : ""}`;
    card.dataset.key = key;
    const heading = document.createElement("div"); heading.className = "criterion-title";
    const h3 = document.createElement("h3"); h3.textContent = title;
    const tags = document.createElement("div"); tags.className = "criterion-tags";
    const categoryTag = document.createElement("span"); categoryTag.textContent = categoryLabels[category] || category;
    tags.append(categoryTag);
    const label = document.createElement("p"); label.className = "criterion-label"; label.textContent = "AI の推測";
    const p = document.createElement("p"); p.className = "criterion-interpretation"; p.textContent = description;
    heading.append(h3); card.append(heading, tags, label, p);
    if (session.condition === "B" && session.status !== "complete") card.append(createDelegationControl(key, round.delegation[key] || "consult"));
    els.criteriaList.append(card);
  });
  if (defaultsAdded) {
    session.events.push({ time: isoNow(), type: "delegation_defaults_applied", turn: session.currentTurn, value: "consult" });
    saveSession();
  }
}

function createDelegationControl(key, selectedValue) {
  const control = document.createElement("div");
  control.className = "delegation-control"; control.setAttribute("role", "group"); control.setAttribute("aria-label", "判断の担当");
  [["self", "自分で判断"], ["consult", "AI と相談"], ["ai", "AI に任せる"]].forEach(([value, label]) => {
    const button = document.createElement("button"); button.type = "button"; button.dataset.value = value; button.textContent = label;
    button.classList.toggle("selected", value === selectedValue);
    button.setAttribute("aria-pressed", value === selectedValue ? "true" : "false");
    button.addEventListener("click", () => {
      const round = session.rounds[session.currentTurn - 1];
      const previous = round.delegation[key] || "unset";
      round.delegation[key] = value;
      round.delegationTouched ||= {};
      round.delegationTouched[key] = true;
      logEvent("delegation_changed", { criterion: key, from: previous, to: value });
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
  round.errors ||= [];
  const submittedAt = isoNow();
  const history = session.rounds.slice(0, index).flatMap((item) => [
    { role: "user", content: item.userText },
    { role: "assistant", content: item.aiText }
  ]);
  const previousAnalysis = index > 0 ? session.rounds[index - 1].analysis : null;
  const delegationSourceIds = previousAnalysis?.criteria?.map((item) => String(item.id || item.title)).filter(Boolean) || [];
  els.aiLoading.classList.remove("hidden");
  els.messageInput.disabled = true;
  els.sendButton.disabled = true;
  logEvent("message_submit_started", { length: text.length });
  try {
    const response = await fetch(API_TURN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.sessionId, condition: session.condition, turn: session.currentTurn, userText: text, history, delegation: session.condition === "B" ? round.delegation : {}, delegationSourceIds: session.condition === "B" ? delegationSourceIds : [], delegationSourceCriteria: session.condition === "B" ? (previousAnalysis?.criteria || []) : [] })
    });
    const result = await response.json();
    if (!response.ok) {
      const requestError = new Error(result.error || `HTTP ${response.status}`);
      requestError.details = result;
      throw requestError;
    }
    round.userText = text;
    round.submittedAt = submittedAt;
    round.aiText = result.dialogue;
    round.analysis = result.analysis;
    round.aiMeta = result.meta;
    round.aiDisplayedAt = isoNow();
    round.analysisDisplayedAt = round.aiDisplayedAt;
    logEvent("dialogue_ai_displayed", { responseId: result.meta.dialogueResponseId, model: result.meta.dialogueModel, latencyMs: result.meta.dialogueLatencyMs, attempts: result.meta.dialogueAttempts, promptVersion: result.meta.promptVersion });
    logEvent("analysis_ai_displayed", { responseId: result.meta.analysisResponseId, model: result.meta.analysisModel, latencyMs: result.meta.analysisLatencyMs, attempts: result.meta.analysisAttempts, validationStatus: result.meta.validationStatus });
    els.messageInput.value = ""; updateCharCount();
    if (session.currentTurn >= MAX_TURNS) {
      session.status = "complete"; session.completedAt = isoNow();
      logEvent("task_completed");
      notifyParent("task-completed", { sessionId: session.sessionId });
    } else {
      session.currentTurn += 1;
      session.rounds[session.currentTurn - 1].promptShownAt = isoNow();
      firstFocusLoggedForTurn = false;
      logEvent("turn_prompt_displayed", { prompt: turns[session.currentTurn - 1].prompt });
    }
    saveSession(); renderAll();
    requestAnimationFrame(() => { els.chatStage.scrollTop = els.chatStage.scrollHeight; if (session.status !== "complete") els.messageInput.focus(); });
  } catch (error) {
    const details = error.details || {};
    const failure = { time: isoNow(), exceptionCode: details.exceptionCode || "T99_CLIENT_OR_SERVER_ERROR", stage: details.stage || "client", retryable: Boolean(details.retryable), retryCount: Number(details.retryCount || 0), message: error.message, attempts: details.attempts || [], partialMeta: details.partialMeta || {}, promptVersion: details.promptVersion || session.promptVersion };
    round.errors.push(failure);
    logEvent("ai_request_failed", failure);
    saveSession();
    if (failure.exceptionCode === "I14_PERSONAL_INFO_BLOCKED") {
      showToast("氏名、電話番号、住所などの個人情報は AI に送信されません。削除してから、もう一度送信してください。");
    } else {
    const message = failure.exceptionCode === "T03_QUOTA_EXCEEDED"
      ? "API の利用枠が不足しているため、実験を続けられません。実験担当者に連絡してください。"
      : `AI の応答に失敗しました（${failure.exceptionCode}）。記録は保存されています。実験担当者に連絡してください。`;
    showToast(message);
    }
    els.messageInput.disabled = false;
    els.sendButton.disabled = false;
    els.messageInput.focus();
  } finally {
    els.aiLoading.classList.add("hidden");
  }
}

function renderCompletion() {
  if (els.chatStage.querySelector(".completion-card")) return;
  const card = document.createElement("section"); card.className = "completion-card";
  card.innerHTML = "<h3>対話課題が完了しました</h3><p>先に Tobii の視線計測を停止してください。停止を確認してから、各回の振り返りへ進みます。</p><button type=\"button\">視線計測を停止し、振り返りへ進む</button>";
  card.querySelector("button").addEventListener("click", openReflection);
  els.chatStage.append(card);
}

function openReflection() {
  session.status = "reflection";
  session.gazeRecordingEndedAt = isoNow();
  logEvent("gaze_recording_ended_confirmed");
  buildReflectionRows();
  showOnly(els.reflectionScreen);
}

function buildReflectionRows() {
  els.reflectionRows.replaceChildren();
  const header = document.createElement("div");
  header.className = "reflection-row header";
  header.innerHTML = "<span>回</span><span>そのときの課題</span><span>自分で判断すべきだと気づいたか</span><span>そのときの判断方法</span><span>代替できないと感じた強さ 1–7</span><span>そのとき最も重要だった考え</span>";
  els.reflectionRows.append(header);
  session.rounds.forEach((round, index) => {
    const row = document.createElement("div"); row.className = "reflection-row"; row.dataset.turn = String(round.turn);
    row.innerHTML = `<span class="turn-cell">Turn ${round.turn}</span><span class="prompt-cell">${escapeHtml(turns[index].prompt)}</span>
      <select name="occurred_${round.turn}" required><option value="">選択してください</option><option value="yes">あった</option><option value="no">なかった</option><option value="unsure">わからない</option></select>
      <select name="owner_${round.turn}" required><option value="">選択してください</option><option value="self">自分で判断する必要があった</option><option value="shared">AI と相談した</option><option value="ai">AI に任せられた</option><option value="unsure">わからない</option></select>
      <select name="conflict_${round.turn}" required>${["",1,2,3,4,5,6,7].map((v) => `<option value="${v}">${v || "選択してください"}</option>`).join("")}</select>
      <input name="note_${round.turn}" maxlength="160" placeholder="空欄でも構いません" />`;
    els.reflectionRows.append(row);
  });
  if (session.reflection) {
    session.reflection.rounds.forEach((review) => {
      for (const [field, value] of Object.entries({ occurred: review.occurred, owner: review.owner, conflict: review.conflict, note: review.note })) {
        const input = els.reflectionForm.elements[`${field}_${review.turn}`];
        if (input) input.value = value;
      }
    });
    els.reflectionForm.elements.clarity.value = session.reflection.clarity;
    els.reflectionForm.elements.nonreplaceable.value = session.reflection.nonreplaceable;
    els.reflectionForm.elements.control.value = session.reflection.control;
    els.reflectionForm.elements.experience.value = session.reflection.experience;
    els.reflectionForm.elements.effort.value = session.reflection.effort;
    els.reflectionForm.elements.delegationReflection.value = session.reflection.delegationReflection ?? 4;
    els.reflectionForm.elements.turningPoint.value = session.reflection.turningPoint;
    $("#clarityValue").textContent = session.reflection.clarity;
    $("#nonreplaceableValue").textContent = session.reflection.nonreplaceable;
    $("#controlValue").textContent = session.reflection.control;
    $("#experienceValue").textContent = session.reflection.experience;
    $("#effortValue").textContent = session.reflection.effort;
    $("#delegationReflectionValue").textContent = session.reflection.delegationReflection ?? 4;
    els.reflectionForm.querySelectorAll("input,select,textarea").forEach((item) => item.disabled = true);
    els.reflectionExport.hidden = false;
  }
}

function updateCharCount() { els.charCount.textContent = `${els.messageInput.value.length} / 500`; }
function autoResize() { els.messageInput.style.height = "auto"; els.messageInput.style.height = `${Math.min(els.messageInput.scrollHeight, 116)}px`; }

function showToast(message) {
  els.toast.textContent = message; els.toast.classList.add("show"); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function openExperimenterMenu() {
  if (!session) { showToast("進行中のセッションはありません。"); return; }
  const duration = session.startedAt ? Math.round((new Date(session.completedAt || isoNow()) - new Date(session.startedAt)) / 1000) : 0;
  els.sessionSummary.innerHTML = `
    <div><dt>参加者</dt><dd>${escapeHtml(session.participantId)}</dd></div><div><dt>条件</dt><dd>${session.condition}</dd></div>
    <div><dt>進行</dt><dd>${session.status === "complete" ? "完了" : `Turn ${session.currentTurn} / 6`}</dd></div><div><dt>経過</dt><dd>${Math.floor(duration / 60)}分 ${duration % 60}秒</dd></div>`;
  logEvent("experimenter_menu_opened"); els.dialog.showModal();
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }

function exportCsv() {
  const header = ["participant_id","condition","session_schema_version","prompt_version","round","prompt_shown_time","dialogue_ai_display_time","analysis_ai_display_time","input_start_time","submit_time","dialogue_model","analysis_model","dialogue_latency_ms","analysis_latency_ms","dialogue_attempt_count","analysis_attempt_count","validation_status","exception_codes","example_used","delegation_json","delegation_touched_json","reflection_nonreplaceable_awareness","reflection_tendency","reflection_strength_1_7","reflection_note","notes"];
  const rows = session.rounds.map((r) => {
    const review = session.reflection?.rounds?.find((item) => item.turn === r.turn);
    return [session.participantId, session.condition, session.version, r.aiMeta?.promptVersion || session.promptVersion || "", r.turn, r.promptShownAt || "", r.aiDisplayedAt || "", r.analysisDisplayedAt || "", r.inputFirstFocusAt || "", r.submittedAt || "", r.aiMeta?.dialogueModel || "", r.aiMeta?.analysisModel || "", r.aiMeta?.dialogueLatencyMs || "", r.aiMeta?.analysisLatencyMs || "", r.aiMeta?.dialogueAttempts?.length || "", r.aiMeta?.analysisAttempts?.length || "", r.aiMeta?.validationStatus || "", (r.errors || []).map((item) => item.exceptionCode).join("|"), r.exampleUsed, JSON.stringify(r.delegation), JSON.stringify(r.delegationTouched || {}), review?.occurred || "", review?.owner || "", review?.conflict || "", review?.note || "", ""];
  });
  const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  download(csv, `${safeName(session.sessionId)}_times.csv`, "text/csv;charset=utf-8"); logEvent("export_csv");
}
function csvCell(value) { const text = String(value ?? ""); return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
function exportJson() { download(JSON.stringify(session, null, 2), `${safeName(session.sessionId)}_complete.json`, "application/json"); logEvent("export_json"); }
function safeName(value) { return String(value).replace(/[^A-Za-z0-9_-]/g, "_"); }
function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

els.setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!apiReady) { showToast("2つの AI に接続できません。実験用サーバーの設定を確認してください。"); return; }
  const data = new FormData(els.setupForm);
  session = newSession(String(data.get("participantId")).trim(), String(data.get("condition")));
  saveSession();
  if (els.fullscreenToggle.checked) await tryFullscreen();
  prepareSelfObservation();
});
els.prepForm.querySelectorAll('input[type="range"]').forEach((input) => {
  const output = $(`#${input.name}Value`);
  input.addEventListener("input", () => { if (output) output.textContent = input.value; });
});
els.prepForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(els.prepForm);
  session.pretest = {
    recordedAt: isoNow(), sleepiness: Number(data.get("sleepiness")), tension: Number(data.get("tension")),
    confidence: Number(data.get("confidence")), familiarity: Number(data.get("familiarity")), checks: data.getAll("checks")
  };
  session.status = "instructions";
  logEvent("pretest_completed", session.pretest);
  prepareInstructions();
});
els.resumeButton.addEventListener("click", () => {
  const stored = loadStoredSession(); if (!stored) return; session = stored;
  if (session.status === "pretest") prepareSelfObservation();
  else if (session.status === "instructions") prepareInstructions();
  else if (session.status === "reflection" || session.status === "finished") { buildReflectionRows(); showOnly(els.reflectionScreen); }
  else startTask(true);
});
els.startTask.addEventListener("click", () => startTask(false));
els.composer.addEventListener("submit", (event) => { event.preventDefault(); submitTurn(); });
els.messageInput.addEventListener("input", () => { updateCharCount(); autoResize(); });
els.messageInput.addEventListener("focus", () => {
  if (!session || session.status !== "running" || firstFocusLoggedForTurn) return;
  const round = session.rounds[session.currentTurn - 1]; round.inputFirstFocusAt = isoNow(); firstFocusLoggedForTurn = true; logEvent("input_first_focus");
});
els.messageInput.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); submitTurn(); } });
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
  session.reflection = {
    recordedAt: isoNow(), clarity: Number(data.get("clarity")), nonreplaceable: Number(data.get("nonreplaceable")), control: Number(data.get("control")),
    experience: Number(data.get("experience")), effort: Number(data.get("effort")), delegationReflection: Number(data.get("delegationReflection")),
    turningPoint: String(data.get("turningPoint") || ""),
    rounds: session.rounds.map((round) => ({ turn: round.turn, occurred: data.get(`occurred_${round.turn}`), owner: data.get(`owner_${round.turn}`), conflict: Number(data.get(`conflict_${round.turn}`)), note: String(data.get(`note_${round.turn}`) || "") }))
  };
  session.status = "finished";
  logEvent("reflection_completed", { clarity: session.reflection.clarity, nonreplaceable: session.reflection.nonreplaceable, control: session.reflection.control, experience: session.reflection.experience, effort: session.reflection.effort, delegationReflection: session.reflection.delegationReflection });
  els.reflectionForm.querySelectorAll("input,select,textarea").forEach((item) => item.disabled = true);
  els.reflectionExport.hidden = false;
  event.submitter.textContent = "振り返りを保存しました";
  event.submitter.disabled = true;
  showToast("自己観察テストが完了しました。完全ログを書き出してください。");
  notifyParent("finished", { sessionId: session.sessionId });
});
els.toggleFullscreen.addEventListener("click", async () => { if (document.fullscreenElement) await document.exitFullscreen(); else await tryFullscreen(); logEvent("fullscreen_toggled", { active: Boolean(document.fullscreenElement) }); });
els.resetSession.addEventListener("click", () => {
  if (!confirm("現在のセッションを終了しますか？先にログを書き出してください。")) return;
  logEvent("session_reset"); localStorage.removeItem(STORAGE_KEY); session = null; els.dialog.close(); location.reload();
});
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "e") { event.preventDefault(); openExperimenterMenu(); }
});
window.addEventListener("resize", () => { if (session) logEvent("viewport_changed", { width: innerWidth, height: innerHeight }); });
window.addEventListener("beforeunload", saveSession);

if (EMBED_MODE) {
  document.documentElement.classList.add("embedded");
  els.fullscreenToggle.checked = false;
  els.fullscreenToggle.closest(".fullscreen-check").hidden = true;
  $(".keyboard-note").hidden = true;
  const publishFrameHeight = () => notifyParent("resize", { height: document.documentElement.scrollHeight });
  new ResizeObserver(publishFrameHeight).observe(document.body);
  publishFrameHeight();
}

if (PREVIEW_MODE) {
  session = buildPreviewSession();
  startTask(true);
  els.conditionBadge.textContent = "PREVIEW";
} else {
  const stored = loadStoredSession();
  if (stored) {
    els.resumeButton.hidden = false;
    els.resumeButton.textContent = `${stored.participantId}・条件 ${stored.condition} を再開`;
  }
}
updateCharCount();
checkAiHealth();
