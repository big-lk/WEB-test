"use strict";

const STORAGE_KEY = "eye_ui_experiment_fixed_backboard_v8";
const MAX_TURNS = 6;
const SESSION_SCHEMA_VERSION = 8;
const TURN_PROMPTS = [
  {
    kicker: "1回目｜希望する雰囲気",
    title: "料理の方法を決める前に、どんな夕食にしたいかを書く",
    guide: "相手にどう感じてほしいか、二人の間にどんな空気があるとよいかを書いてください。実現方法はまだ一つに決めなくてかまいません。",
    inputHint: "どんな感じの夕食にしたいかを入力",
    placeholder: "相手の気持ちや、二人の間にほしい雰囲気を入力してください。"
  },
  {
    kicker: "2回目｜もう一つ大切にしたいこと",
    title: "同時に大切にしたい気持ちや雰囲気を一つ加える",
    guide: "最初に書いた希望と一緒にかなえたいことを考えてください。料理や演出の方法は、まだ決め切らなくてかまいません。",
    inputHint: "同時に大切にしたいことを入力",
    placeholder: "もう一つ大切にしたい気持ちや雰囲気を入力してください。"
  },
  {
    kicker: "3回目｜食事中の二人の過ごし方",
    title: "料理以外に、どんな時間にしたいかを書く",
    guide: "食事中の会話、距離感、気分、避けたい空気などを思い浮かべてください。具体的な方法まで決めなくてかまいません。",
    inputHint: "食事中にほしい時間や空気を入力",
    placeholder: "食事中の二人に、どんな時間や空気があるとよいか入力してください。"
  },
  {
    kicker: "4回目｜食卓の場面を思い浮かべる",
    title: "AIの案のあと、二人がどう過ごしているとよいかを書く",
    guide: "実際に二人が食卓に座っている場面を思い浮かべ、どんな様子ならこの夕食らしいと感じるかを書いてください。",
    inputHint: "食卓での二人の様子を入力",
    placeholder: "実際の食卓で、二人がどう過ごしているとよいか入力してください。"
  },
  {
    kicker: "5回目｜夕食の流れ",
    title: "食べ始めから食後まで、自然だと思う流れを書く",
    guide: "料理の出し方、会話、演出の強さなどを含め、二人にとって自然だと思う夕食の流れを書いてください。",
    inputHint: "自然だと思う夕食の流れを入力",
    placeholder: "食べ始めから食後まで、どんな流れが自然だと思うか入力してください。"
  },
  {
    kicker: "6回目｜最後に伝えたい希望",
    title: "当日の夕食で大切にしたいことを自分の言葉でまとめる",
    guide: "細かな方法は未定のままでもかまいません。最後に大切にしたい感じや、避けたいことを書いてください。",
    inputHint: "最後に大切にしたい希望を入力",
    placeholder: "この夕食で最後に大切にしたいことを入力してください。"
  }
];
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
  anchorText: $("#anchorText"), anchorCharCount: $("#anchorCharCount"), startTask: $("#startTask"),
  startTaskHint: $("#startTaskHint"), appShell: $("#appShell"), chatStage: $("#chatStage"),
  emptyConversation: $("#emptyConversation"), promptKicker: $("#promptKicker"), promptText: $("#promptText"),
  turnLabel: $("#turnLabel"), guideText: $("#guideText"),
  turnCount: $("#turnCount"), composer: $("#composer"), messageInput: $("#messageInput"), sendButton: $("#sendButton"),
  charCount: $("#charCount"), inputHint: $("#inputHint"), criteriaList: $("#criteriaList"), conditionBadge: $("#conditionBadge"),
  insightHelp: $("#insightHelp"), savingStatus: $("#savingStatus"), toast: $("#toast"), dialog: $("#experimenterDialog"),
  sessionSummary: $("#sessionSummary"), exportCsv: $("#exportCsv"), exportJson: $("#exportJson"),
  toggleFullscreen: $("#toggleFullscreen"), resetSession: $("#resetSession"), aiConnection: $("#aiConnection"),
  aiLoading: $("#aiLoading"), loadingTitle: $("#loadingTitle"), loadingDetail: $("#loadingDetail"),
  exampleAssist: $("#exampleAssist"), createExample: $("#createExample"),
  exampleGuide: $("#exampleGuide"), exampleGuideText: $("#exampleGuideText"),
  reflectionScreen: $("#reflectionScreen"), reflectionForm: $("#reflectionForm"),
  reflectionRows: $("#reflectionRows"), overallScaleRows: $("#overallScaleRows"), reflectionExport: $("#reflectionExport"),
  debriefScreen: $("#debriefScreen"), acknowledgeDebrief: $("#acknowledgeDebrief"),
  debriefExport: $("#debriefExport")
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
    exampleGeneratedAt: null,
    exampleText: "",
    exampleGenerationCount: 0,
    errors: []
  };
}

function newSession(participantId, condition, experimentVariant = "standard") {
  return {
    version: SESSION_SCHEMA_VERSION,
    promptVersion: apiModels?.promptVersion || "unknown",
    sessionId: `${participantId}-${condition}-${experimentVariant}-${Date.now()}`,
    participantId: participantId.toUpperCase(),
    condition,
    experimentVariant,
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
    debriefAcknowledgedAt: null,
    rounds: Array.from({ length: MAX_TURNS }, (_, index) => blankRound(index + 1)),
    events: []
  };
}

function buildPreviewSession() {
  const preview = newSession(
    "PREVIEW",
    QUERY.get("condition") === "UI_A" ? "UI_A" : "UI_B",
    QUERY.get("variant") === "strong_ambiguity" ? "strong_ambiguity" : "standard"
  );
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
        summary: "AIが今の会話から読み取ったこと",
        criteria: [
          { id: "natural-talk", title: "自然に話せる時間", meaning: "料理や演出に邪魔されず、自然に話せること", priority: "中心", delegationState: "CO_DECIDE", source: "USER_TURN", evidenceTurns: [1, 2], focus: true },
          { id: "light-burden", title: "相手への負担を抑える", meaning: "疲れていても気を遣わずに食事を楽しめること", priority: "維持", delegationState: "CO_DECIDE", source: "PRETASK_ANCHOR", evidenceTurns: [0, 2], focus: false },
          { id: "small-special", title: "控えめな特別感", meaning: "大げさにせず、普段とは少し違うと感じられること", priority: "未確定", delegationState: "CO_DECIDE", source: "USER_TURN", evidenceTurns: [1], focus: false }
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
    if (parsed?.version !== SESSION_SCHEMA_VERSION) return null;
    if (!parsed.experimentVariant) parsed.experimentVariant = "standard";
    return parsed;
  } catch { return null; }
}

function showOnly(target) {
  [els.setupScreen, els.prepScreen, els.instructionScreen, els.appShell, els.reflectionScreen, els.debriefScreen]
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
    els.aiConnection.querySelector("small").textContent = `会話を作るAI：${data.dialogueModel} / 内容を整理するAI：${data.analysisModel}`;
  } catch {
    apiReady = false;
    els.aiConnection.classList.add("error");
    els.aiConnection.querySelector("b").textContent = "AI に接続できません";
    els.aiConnection.querySelector("small").textContent = "実験用サーバーの設定を確認してください";
    notifyParent("error", { code: "health_check_failed" });
  }
}

function prepareInstructions() {
  const adjustable = session.condition === "UI_B";
  els.instructionScreen.dataset.condition = adjustable ? "UI_B" : "UI_A";
  els.conditionInstruction.querySelector("h3").textContent = adjustable ? "右側を確認して、AIの関わり方を選ぶ" : "右側でAIの読み取りを確認する";
  els.conditionInstruction.querySelector("p").textContent = adjustable
    ? "右側でAIがあなたの希望をどう受け取ったか確認します。必要なら、AIにどこまで考えてもらうかをボタンで変え、次に伝える短い例文も作れます。"
    : "右側で、AIがあなたの希望をどう受け取ったか確認します。右側には変更用のボタンはありません。";
  if (session.pretaskAnchor) {
    const radio = els.anchorForm.querySelector(`input[value="${session.pretaskAnchor.scenarioId}"]`);
    if (radio) radio.checked = true;
    els.anchorText.value = session.pretaskAnchor.freeText || "";
  }
  updateAnchorState();
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
  if (freeText.length < 4) { showToast("選んだ場面で望んでいる感じや時間を、一文で入力してください。"); els.anchorText.focus(); return null; }
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
  els.conditionBadge.textContent = session.condition === "UI_B" ? "UI B" : "UI A";
  els.insightHelp.textContent = session.condition === "UI_B"
    ? "本文はAIの解釈、タグはAIが置いた優先度です。ボタンの選択は、次に送信した内容へのAI回答から反映されます。"
    : "本文はAIの解釈、タグはAIが置いた優先度を表します。";
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
  requestAnimationFrame(positionChatAtLatestAnswer);
}

function positionChatAtLatestAnswer() {
  const answers = els.chatStage.querySelectorAll(".message.ai");
  const latestAnswer = answers[answers.length - 1];
  if (!latestAnswer) {
    els.chatStage.scrollTop = 0;
    return;
  }
  const stageTop = els.chatStage.getBoundingClientRect().top;
  const answerTop = latestAnswer.getBoundingClientRect().top;
  els.chatStage.scrollTop += answerTop - stageTop - 8;
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
  article.dataset.turn = String(turn);
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
  const prompt = TURN_PROMPTS[turn - 1];
  const background = session.pretaskAnchor
    ? `選んだ場面：${session.pretaskAnchor.scenarioLabel}。最初に考えたこと：${session.pretaskAnchor.freeText}`
    : "";
  els.turnLabel.textContent = complete ? "完了" : `${turn}回目`;
  els.turnCount.textContent = `${turn} / ${MAX_TURNS}`;
  els.promptKicker.textContent = complete ? "対話完了" : prompt.kicker;
  els.promptText.textContent = complete ? "全6回の対話が完了しました。" : prompt.title;
  els.guideText.textContent = complete
    ? "視線計測を停止してから、振り返りへ進んでください。"
    : `${prompt.guide} ${background}`;
  els.messageInput.disabled = complete;
  els.sendButton.disabled = complete;
  els.messageInput.placeholder = complete ? "課題は完了しました" : prompt.placeholder;
  els.inputHint.textContent = complete ? "入力完了" : prompt.inputHint;
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
  const exampleAvailable = session.condition === "UI_B" && session.status === "running";
  els.exampleAssist.classList.toggle("hidden", !exampleAvailable);
  els.createExample.disabled = !exampleAvailable;
  const savedExample = activeRound.exampleText || "";
  els.exampleGuide.classList.toggle("hidden", !exampleAvailable || !savedExample);
  els.exampleGuideText.textContent = savedExample;
  if (!source) {
    const empty = document.createElement("article");
    empty.className = "criterion-card";
    empty.innerHTML = "<div class=\"criterion-title\"><h3>最初の回答を待っています</h3></div><p class=\"criterion-interpretation\">最初の回答が出ると、AIが会話から読み取った内容をここに表示します。</p>";
    els.criteriaList.append(empty);
    return;
  }
  let defaultsAdded = false;
  source.analysis.criteria.forEach((criterion) => {
    const key = criterion.id || criterion.title;
    if (session.condition === "UI_B" && !activeRound.delegation[key]) {
      const previousRound = session.currentTurn > 1 ? session.rounds[session.currentTurn - 2] : null;
      activeRound.delegation[key] = previousRound?.delegation[key] || "consult";
      activeRound.delegationTouched[key] = false;
      defaultsAdded = true;
    }
    const selected = session.condition === "UI_B"
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
    const priorityText = ({
      "中心": "AIの優先度：高い",
      "維持": "AIの優先度：維持",
      "未確定": "AIの優先度：未確定"
    })[criterion.priority] || `AIの優先度：${criterion.priority}`;
    priority.textContent = priorityText;
    tags.append(priority);
    const label = document.createElement("p");
    label.className = "criterion-label";
    label.textContent = "AIはこう受け取っています";
    const meaning = document.createElement("p");
    meaning.className = "criterion-interpretation";
    meaning.textContent = criterion.meaning;
    heading.append(h3);
    card.append(heading, tags, label, meaning);
    if (session.condition === "UI_B") {
      const delegationBlock = document.createElement("div");
      delegationBlock.className = "delegation-block";
      delegationBlock.append(createDelegationControl(key, selected, false));
      card.append(delegationBlock);
    }
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
  control.setAttribute("aria-label", "AIにどこまで考えてもらうか");
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
      showToast(`「${button.textContent}」を選びました。次のAI回答から反映されます。`);
    });
    control.append(button);
  });
  return control;
}

function createNextInputExample() {
  if (!session || session.status !== "running" || session.condition !== "UI_B") return;
  const turn = session.currentTurn;
  const round = session.rounds[turn - 1];
  const completed = session.rounds.filter((item) => item.analysis);
  const criteria = completed.at(-1)?.analysis?.criteria || [];
  const titles = criteria.map((item) => item.title);
  const focusTitle = criteria.find((item) => item.focus)?.title || titles[0] || "夕食全体の雰囲気";
  const examples = {
    1: "相手に＿＿と感じてほしく、二人の間に＿＿のような空気があるとよいです。",
    2: `「${focusTitle}」と一緒に、＿＿と感じられることも大切にしたいです。`,
    3: "食事中は、二人が＿＿のように過ごせる時間にしたいです。",
    4: "食卓では、二人が＿＿のように過ごしているのがよいです。",
    5: "食べ始めは＿＿で、食後は＿＿となる流れが自然です。",
    6: "この夕食で最後に大切にしたいのは＿＿です。"
  };
  const text = examples[turn].slice(0, 100);
  els.exampleGuideText.textContent = text;
  els.exampleGuide.classList.remove("hidden");
  round.exampleGeneratedAt = isoNow();
  round.exampleText = text;
  round.exampleGenerationCount = (round.exampleGenerationCount || 0) + 1;
  logEvent("example_generated", {
    at: round.exampleGeneratedAt,
    textLength: text.length,
    generationCount: round.exampleGenerationCount,
    delegation: { ...round.delegation }
  });
  showToast("右下に短い例文の型を表示しました。必要な部分だけ使ってください。");
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
  const loadingStartedAt = Date.now();
  els.loadingTitle.textContent = "会話AIが回答を作成中";
  els.loadingDetail.textContent = "続いて右側の「AIが読み取ったこと」を更新します";
  const loadingTimer = window.setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - loadingStartedAt) / 1000);
    if (elapsedSeconds >= 20) {
      els.loadingTitle.textContent = "回答内容を再確認中";
      els.loadingDetail.textContent = `入力は保存されています（${elapsedSeconds}秒経過）`;
    }
  }, 5000);
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
        experimentVariant: session.experimentVariant || "standard",
        turn: session.currentTurn,
        userText: text,
        history,
        pretaskAnchor: session.pretaskAnchor,
        delegation: session.condition === "UI_B" ? round.delegation : {},
        delegationSourceCriteria: session.condition === "UI_B" ? (previousAnalysis?.criteria || []) : []
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
      logEvent("turn_prompt_displayed", { prompt: TURN_PROMPTS[session.currentTurn - 1].title });
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
    window.clearInterval(loadingTimer);
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

function buildFivePointScale(name, statement) {
  const fieldset = document.createElement("fieldset");
  fieldset.className = "review-question";
  const legend = document.createElement("legend");
  legend.textContent = statement;
  const options = document.createElement("div");
  options.className = "five-point-options";
  [1, 2, 3, 4, 5].forEach((value) => {
    const label = document.createElement("label");
    label.className = "five-point-option";
    label.innerHTML = `<input type="radio" name="${name}" value="${value}" aria-label="${value}" ${value === 1 ? "required" : ""}><span class="rating-dot" aria-hidden="true"></span><span class="rating-number">${value}</span>`;
    options.append(label);
  });
  fieldset.append(legend, options);
  return fieldset;
}

function buildReflectionRows() {
  els.reflectionRows.replaceChildren();
  els.overallScaleRows.replaceChildren();
  [
    ["understanding", "右側を見て、AIがどう受け取ったか確認しやすかった"],
    ["priority", "AIが何を優先しているか確認しやすかった"],
    ["nextInput", "次に伝える内容を考えるうえで役立った"],
    ["targetExposure", "画面を見て、この回に何を書けばよいか分かりやすかった"]
  ].forEach(([name, label]) => els.overallScaleRows.append(buildFivePointScale(name, label)));
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
    const heading = document.createElement("h2");
    heading.textContent = `対話 ${turn}`;
    const answerLabel = document.createElement("small");
    answerLabel.className = "review-answer-label";
    answerLabel.textContent = "この回のAI回答（全文）";
    const answerText = document.createElement("p");
    answerText.className = "review-answer";
    answerText.textContent = answer;
    card.append(heading, answerLabel, answerText);
    prompts.forEach(([name, label]) => card.append(buildFivePointScale(`${name}_${turn}`, label)));
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
    });
    els.reflectionForm.elements.turningPoint.value = session.reflection.turningPoint || "";
    els.reflectionForm.querySelectorAll("input,select,textarea").forEach((item) => { item.disabled = true; });
    els.reflectionExport.hidden = false;
  }
}

function updateCharCount() { els.charCount.textContent = `${els.messageInput.value.length} / 500`; }
function updateAnchorState() {
  const scenarioSelected = Boolean(els.anchorForm.querySelector('input[name="scenario"]:checked'));
  const textLength = els.anchorText.value.trim().length;
  const ready = scenarioSelected && textLength >= 4;
  els.anchorCharCount.textContent = `${els.anchorText.value.length} / 160`;
  els.startTask.disabled = !ready;
  els.startTaskHint.textContent = ready
    ? "準備できました。対話を開始できます。"
    : "場面を一つ選び、4文字以上の一文を入力すると開始できます。";
  els.startTaskHint.classList.toggle("ready", ready);
}
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
    ["現在", `${session.currentTurn} / 6`],
    ["回答の設定", session.experimentVariant === "strong_ambiguity" ? "大きな解釈のずれを必ず入れる" : "通常の解釈のずれ"],
    ["規則", session.promptVersion],
    ["スキーマ", session.version]
  ].map(([term, value]) => `<div><dt>${term}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  els.dialog.showModal();
}

function exportCsv() {
  const header = [
    "participant_id", "session_id", "ui_condition", "experiment_variant", "session_schema_version", "prompt_version", "round", "control_event",
    "prompt_shown_ts", "ai_response_start_ts", "ai_response_complete_ts", "right_panel_update_ts",
    "input_focus_ts", "first_keystroke_ts", "last_keystroke_ts", "send_click_ts",
    "dialogue_model", "analysis_model", "dialogue_latency_ms", "analysis_latency_ms",
    "validation_status", "delegation_json", "delegation_touched_json",
    "example_generated_ts", "example_generation_count", "example_text"
  ];
  const rows = session.rounds.map((round) => [
    session.participantId, session.sessionId, session.condition, session.experimentVariant || "standard",
    session.version, round.aiMeta?.promptVersion || session.promptVersion,
    round.turn, round.controlEvent || "", round.promptShownAt || "", round.aiResponseStartAt || "",
    round.aiResponseCompleteAt || "", round.rightPanelUpdateAt || "", round.inputFirstFocusAt || "",
    round.firstKeystrokeAt || "", round.lastKeystrokeAt || "", round.sendClickAt || "",
    round.aiMeta?.dialogueModel || "", round.aiMeta?.analysisModel || "", round.aiMeta?.dialogueLatencyMs || "",
    round.aiMeta?.analysisLatencyMs || "", round.aiMeta?.validationStatus || "", JSON.stringify(round.delegation),
    JSON.stringify(round.delegationTouched), round.exampleGeneratedAt || "",
    round.exampleGenerationCount || 0, round.exampleText || ""
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
  const participantId = String(data.get("participantId") || "").trim();
  if (!participantId) {
    showToast("参加者番号を入力してください。");
    els.participantId.focus();
    return;
  }
  const unfinished = loadStoredSession();
  if (unfinished && unfinished.status !== "finished") {
    const replaceConfirmed = confirm(
      `実験者確認：参加者 ${unfinished.participantId} の未完了記録が残っています。`
      + "新しいセッションを開始すると、端末内の再開用記録は置き換わります。続けますか？"
    );
    if (!replaceConfirmed) return;
  }
  const experimentVariant = String(data.get("experimentVariant") || "standard");
  session = newSession(participantId, String(data.get("condition")), experimentVariant);
  session.events.push({ time: isoNow(), type: "experiment_variant_selected", experimentVariant });
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
  const stored = loadStoredSession();
  if (!stored) return;
  if (!confirm(`実験者確認：参加者 ${stored.participantId} の未完了記録を再開しますか？`)) return;
  session = stored;
  if (session.status === "pretest") showOnly(els.prepScreen);
  else if (session.status === "instructions") prepareInstructions();
  else if (session.status === "reflection") { buildReflectionRows(); showOnly(els.reflectionScreen); }
  else if (session.status === "debrief" || session.status === "finished") { showOnly(els.debriefScreen); }
  else startTask(true);
});
els.anchorForm.addEventListener("input", updateAnchorState);
els.anchorForm.addEventListener("change", updateAnchorState);
els.startTask.addEventListener("click", () => startTask(false));
els.composer.addEventListener("submit", (event) => { event.preventDefault(); submitTurn(); });
els.createExample.addEventListener("click", createNextInputExample);
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
els.debriefExport.addEventListener("click", exportJson);
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
  session.status = "debrief";
  logEvent("blind_reflection_completed");
  saveSession();
  els.reflectionForm.querySelectorAll("input,select,textarea").forEach((item) => { item.disabled = true; });
  els.reflectionExport.hidden = false;
  showOnly(els.debriefScreen);
  showToast("振り返りを保存しました。続いて刺激設計を説明します。");
});

els.acknowledgeDebrief.addEventListener("click", () => {
  if (!session || (session.status !== "debrief" && session.status !== "finished")) return;
  if (!session.debriefAcknowledgedAt) {
    session.debriefAcknowledgedAt = isoNow();
    session.status = "finished";
    logEvent("stimulus_design_disclosed", { beforeInterview: true });
    saveSession();
  }
  els.acknowledgeDebrief.disabled = true;
  els.acknowledgeDebrief.textContent = "説明確認済み";
  showToast("刺激設計の説明を記録しました。データ利用を再確認してください。");
});
els.toggleFullscreen.addEventListener("click", async () => {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await tryFullscreen();
  logEvent("fullscreen_toggled", { active: Boolean(document.fullscreenElement) });
});
els.resetSession.addEventListener("click", () => {
  if (!confirm("このセッションを終了し、端末内の記録を削除しますか？")) return;
  session = null;
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
    if (QUERY.get("screen") === "debrief") {
      session.status = "debrief";
      showOnly(els.debriefScreen);
      return;
    }
    if (QUERY.get("screen") === "reflection") {
      const previewAnswers = {
        3: "温かい料理を一度に出せる形にします。気を遣わせないことは、食事を短時間で終え、新しい話題を増やさず静かに休めることとして整えます。この方針で、当日の流れを具体化できます。",
        4: "準備の負担を減らす点は維持します。今回は二人で話す時間や特別感よりも相手を休ませることを最優先にし、会話は料理の感想だけに限定します。以上を基準に、当日の進行を整理します。",
        6: "温かい主菜を中心にし、準備中と食事中の負担を抑えます。会話の進め方は決めず、確認できた希望だけを夕食の流れに反映します。現在の方針は以上です。未決定の部分は残したまま、実行に必要な内容だけを整理しました。"
      };
      Object.entries(previewAnswers).forEach(([turn, answer]) => { session.rounds[Number(turn) - 1].aiText = answer; });
      session.status = "reflection";
      buildReflectionRows();
      showOnly(els.reflectionScreen);
      return;
    }
    startTask(true);
    return;
  }
  const stored = loadStoredSession();
  if (stored && stored.status !== "finished") {
    els.resumeButton.hidden = false;
    els.resumeButton.textContent = "実験者：前回の未完了記録を確認";
  }
  showOnly(els.setupScreen);
})();
