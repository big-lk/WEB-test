"use strict";

const STORAGE_KEY = "eye_ui_experiment_fixed_backboard_v8";
const MAX_TURNS = 6;
const SESSION_SCHEMA_VERSION = 8;
const TURN_PROMPTS = [
  {
    kicker: "1回目｜雰囲気と目標",
    title: "この夕食で目指したい雰囲気と、夕食後の二人を思い浮かべて書く",
    guide: "相手にどう感じてほしいか、夕食後に二人がどうなっていたらよいかを書いてください。実現方法はまだ一つに決めなくてかまいません。",
    inputHint: "目指したい雰囲気や夕食後の二人を入力",
    placeholder: "夕食中の雰囲気や、夕食後の二人がどうなっていたらよいか入力してください。"
  },
  {
    kicker: "2回目｜もう一つ大切にしたいこと",
    title: "同時に大切にしたい気持ちや雰囲気を一つ加える",
    guide: "最初に書いた目標と一緒にかなえたいことを考えてください。献立や演出の方法は、まだ決め切らなくてかまいません。",
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
// ?invite=rich（試作。使用者の提案 2026-11-27）：参加者が一度に多く書きやすくするための文言と入力欄。既定の文言は変えない。
// 変えるのは「一つ」という数の指定と、入力欄の例示だけ。正式に使うには、資料 4・5 との対応を使用者が確認すること。
// ?layout=flow2（試作。2026-11-28、使用者が実験機で通しての指摘をまとめて入れた版）：flow の配置に次を加える。
//   送信前の小さな確認／中身のない枠は短い帯にする／例文の出どころと変わった文を見分けられるようにする／
//   事前の状態は眠気と緊張だけにする／対話の完了時に視線計測の停止を求めない／入力の案内を「多めに・二人ならではのことを」に寄せる／
//   回答は長めで、入力の具体さに合わせる（サーバーへ dialogueStyle: "open" を送る）。
// 既定・side・flow の動作と文言は変えない。参加者に見える新しい文言は候補であり、正式に使う前に使用者の確認が必要。
const FLOW2 = QUERY.get("layout") === "flow2";
// 試作（2026-11-28）：?stimulus=prechoice。対話の前に「大切にしたいこと」を決まった選択肢から二つ選んでもらい、
// 第3・4回の刺激をその二つだけで決める（サーバーへ stimulusRule: "prechoice" と pretaskAnchor.values を送る）。
// 先に選んだものが X（第3回に意味を狭められる）、後に選んだものが Y（第4回に縮められる）。
// 指定が無ければ画面も送信内容も従来どおり。選択肢と見出しの文言は候補で、正式に使う前に使用者の確認が要る。
const PRECHOICE = QUERY.get("stimulus") === "prechoice";
const PRECHOICE_OPTIONS = [["no_burden", "気を遣わせない"], ["natural_talk", "自然に話せる"], ["not_grand", "大げさにしない"],
  ["not_heavy", "重くしない"], ["relaxed", "ゆっくりできる"], ["as_usual", "いつもどおり"]];
// 試作（2026-11-28 夜）：?stimulus=smalltalk。はじめの「今の状態」の画面に、ふだんの食事についての短い質問を 5 つ足す。
// そのうち 2 つ（prep, keep）の答えをサーバーへ送り（stimulusRule: "smalltalk", smallTalk）、第3・4回の刺激を答えと逆の側で出す。
// 答えは右側にも対話にも出さない。残りの 3 つは記録するだけ。指定が無ければ画面も送信内容も従来どおり。文言は候補。
const SMALLTALK = QUERY.get("stimulus") === "smalltalk";
const SMALLTALK_QUESTIONS = [
  ["cook", "ふだん、料理はどのくらいしますか。", [["daily", "ほぼ毎日"], ["weekly", "週に数回"], ["rarely", "あまりしない"]]],
  ["prep", "誰かを食事に招くとき、準備はどうしたいですか。", [["before", "来る前に全部済ませておきたい"], ["together", "来てから一緒に仕上げたい"]]],
  ["menu", "献立はいつ決めることが多いですか。", [["ahead", "前の日までに決める"], ["sameday", "当日、買い物をしながら決める"]]],
  ["keep", "準備の時間が足りなくなったら、どちらを取りますか。", [["dishes", "品数や見た目をそろえる"], ["time", "相手と一緒にいる時間をとる"]]],
  ["taste", "味つけはどちらに近いですか。", [["recipe", "レシピどおりに量る"], ["byeye", "目分量で決める"]]]
];
function setupSmallTalk(form) {
  if (!SMALLTALK || form.querySelector(".talk-section")) return;
  const section = document.createElement("section");
  section.className = "prep-section talk-section";
  const head = document.createElement("h2");
  head.textContent = "ふだんの食事について";
  const lead = document.createElement("p");
  lead.className = "talk-lead";
  lead.textContent = "近いほうを選んでください。深く考えなくてかまいません。";
  section.append(head, lead);
  SMALLTALK_QUESTIONS.forEach(([name, question, options]) => {
    const box = document.createElement("fieldset");
    box.className = "scenario-picker talk-item";
    box.style.gridTemplateColumns = `repeat(${options.length}, minmax(0, 1fr))`;
    const legend = document.createElement("legend");
    legend.textContent = question;
    box.append(legend);
    options.forEach(([value, label]) => {
      const row = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio"; input.name = `talk_${name}`; input.value = value; input.required = true;
      const span = document.createElement("span");
      span.textContent = label;
      row.append(input, span);
      box.append(row);
    });
    section.append(box);
  });
  form.querySelector(".participant-scales").after(section);
}
function readSmallTalk(form) {
  if (!SMALLTALK) return null;
  const out = {};
  for (const [name] of SMALLTALK_QUESTIONS) {
    const picked = form.querySelector(`input[name="talk_${name}"]:checked`);
    if (!picked) return undefined;
    out[name] = picked.value;
  }
  return out;
}
let prechoicePicked = [];
function setupPrechoice(form) {
  if (!PRECHOICE || form.querySelector(".value-picker")) return;
  const box = document.createElement("fieldset");
  box.className = "scenario-picker value-picker";
  const legend = document.createElement("legend");
  legend.textContent = "3．この夕食で大切にしたいことに近いものを、二つ選ぶ";
  box.append(legend);
  PRECHOICE_OPTIONS.forEach(([id, label]) => {
    const row = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox"; input.name = "prechoice"; input.value = id;
    const span = document.createElement("span");
    span.textContent = label;
    row.append(input, span);
    box.append(row);
    input.addEventListener("change", () => {
      if (input.checked) {
        if (prechoicePicked.length >= 2) { input.checked = false; showToast("選べるのは二つまでです。選び直すときは、選んだものをもう一度押して外してください。"); return; }
        prechoicePicked.push(id);
      } else {
        prechoicePicked = prechoicePicked.filter((x) => x !== id);
      }
    });
  });
  const text = form.querySelector(".anchor-text");
  text.after(box);
}
function restorePrechoice(form, values) {
  if (!PRECHOICE || !Array.isArray(values)) return;
  prechoicePicked = values.filter((v) => PRECHOICE_OPTIONS.some(([id]) => id === v)).slice(0, 2);
  form.querySelectorAll('input[name="prechoice"]').forEach((el) => { el.checked = prechoicePicked.includes(el.value); });
}
const INVITE_RICH = QUERY.get("invite") === "rich" || FLOW2;
if (INVITE_RICH) {
  document.documentElement.dataset.invite = "rich";
  const rich = [
    { guide: "相手にどう感じてほしいか、夕食後に二人がどうなっていたらよいかを、思い浮かぶ場面も交えて書いてください。いくつ書いてもかまいません。実現方法はまだ一つに決めなくてかまいません。",
      placeholder: "夕食中の雰囲気や、夕食後の二人の様子を、思い浮かぶだけ入力してください。" },
    { kicker: "2回目｜ほかに大切にしたいこと", title: "同時に大切にしたい気持ちや雰囲気を加える",
      guide: "最初に書いた目標と一緒にかなえたいことを、思いつくだけ書いてください。そう思う理由や場面も添えてかまいません。献立や演出の方法は、まだ決め切らなくてかまいません。",
      placeholder: "ほかに大切にしたい気持ちや雰囲気を、思いつくだけ入力してください。" },
    { guide: "食事中の会話、距離感、気分、避けたい空気などを、場面を思い浮かべながらいくつか書いてください。具体的な方法まで決めなくてかまいません。",
      placeholder: "食事中の二人に、どんな時間や空気があるとよいか、思い浮かぶだけ入力してください。" },
    { guide: "実際に二人が食卓に座っている場面を思い浮かべ、どんな様子ならこの夕食らしいと感じるかを、いくつか書いてください。",
      placeholder: "実際の食卓での二人の様子を、思い浮かぶだけ入力してください。" },
    { guide: "料理の出し方、会話、演出の強さなどを含め、二人にとって自然だと思う夕食の流れを、順を追って書いてください。",
      placeholder: "食べ始めから食後までの流れを、順を追って入力してください。" },
    { guide: "細かな方法は未定のままでもかまいません。最後に大切にしたい感じや、避けたいことを、いくつでも書いてください。",
      placeholder: "この夕食で大切にしたいこと、避けたいことを、思いつくだけ入力してください。" }
  ];
  rich.forEach((item, index) => Object.assign(TURN_PROMPTS[index], item));
  if (FLOW2) {
    // 第1回の入力が、その後の回答とカードの材料になる。短い一言で終わらないよう、目安と「二人ならでは」を明示する。
    TURN_PROMPTS[0].guide = "相手にどう感じてほしいか、夕食後に二人がどうなっていたらよいかを、3文くらいを目安に書いてください。"
      + "相手の人柄や、お二人のいつもの様子など、お二人ならではのことを入れてください。実現方法はまだ一つに決めなくてかまいません。";
    TURN_PROMPTS[0].placeholder = "夕食中の雰囲気や、夕食後の二人の様子を、相手の人柄やいつもの二人の様子も交えて入力してください。";
  }
}
const PREVIEW_MODE = QUERY.get("preview") === "1";
const EMBED_MODE = QUERY.get("embed") === "1" || window.self !== window.top;
// 視線計測用の配置。指定がなければ従来の配置のまま。機能と記録内容は変えない。
//   ?layout=side … 右側パネルを広げ、判断分担ボタンをカード本文の右に置く（文言は従来どおり）。
//   ?layout=flow … side に加えて、画面の部品を「回答を読む → 右側を見る → 入力する」の一本の流れに並べ直す。
//                  今回の案内を入力欄のすぐ上に移す。右側上部の説明を1行にする。優先度のタグは「高い」のカードだけに出す。
//                  カードごとの「AIはこう受け取っています」と、例文作成後のトーストは出さない。
const LAYOUT_VARIANT = FLOW2 ? "flow" : ["side", "flow"].includes(QUERY.get("layout")) ? QUERY.get("layout") : "default";
document.documentElement.dataset.layout = LAYOUT_VARIANT;
if (FLOW2) document.documentElement.dataset.flow2 = "1";
const LAYOUT_NAME = FLOW2 ? "flow2" : LAYOUT_VARIANT;  // 記録用の名前
// 回答の書き方：flow2 は "open"（長め・入力に合わせる）。比較用に ?style=open|default で切り替えられる。
const DIALOGUE_STYLE = ["open", "default"].includes(QUERY.get("style")) ? QUERY.get("style") : (FLOW2 ? "open" : "default");
// v2.8: ?engine=offline で生成AIを使わないオフライン版（登録済みの文から回答を組み立てる）
const ENGINE = QUERY.get("engine") === "offline" ? "offline" : "online";
const API_HEALTH_URL = new URL("../api/aitest/health" + (ENGINE === "offline" ? "?engine=offline"
  : QUERY.get("model") ? "?model=" + encodeURIComponent(QUERY.get("model")) : ""), document.baseURI);
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
  turnLabel: $("#turnLabel"), guideText: $("#guideText"), turnAnchor: $("#turnAnchor"),
  anchorScenarioText: $("#anchorScenarioText"), anchorGoalText: $("#anchorGoalText"),
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
  delegationTurningPoint: $("#delegationTurningPoint"),
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
      viewportHeight: innerHeight, pixelRatio: devicePixelRatio, userAgent: navigator.userAgent,
      layoutVariant: LAYOUT_NAME, inviteRich: INVITE_RICH, dialogueStyle: DIALOGUE_STYLE
    },
    aiModels: apiModels,
    pretest: null,
    experimenterChecks: [],
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
    ["strong_ambiguity", "generic_marked", "generic_implicit", "generic_unranked", "generic_unranked_marked",
      "generic_embedded", "mixed_e1explicit", "mixed_e1content"]
      .includes(QUERY.get("variant")) ? QUERY.get("variant") : "standard"
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
  els.conditionInstruction.querySelector("h3").textContent = adjustable ? "「AIが読み取ったこと」を確認し、AIの関わり方を選ぶ" : "「AIが読み取ったこと」を確認する";
  els.conditionInstruction.querySelector("p").textContent = adjustable
    ? "「AIが読み取ったこと」でAIの受け取り方を確認します。必要なら、AIにどこまで考えてもらうかをボタンで選び、次に伝える短い例文を作れます。ボタンは例文づくりのためのもので、カードはAIの読み取りとして毎回更新されます。"
    : "「AIが読み取ったこと」で、AIがあなたの希望をどう受け取ったか確認します。変更用のボタンはありません。";
  if (session.pretaskAnchor) {
    const radio = els.anchorForm.querySelector(`input[value="${session.pretaskAnchor.scenarioId}"]`);
    if (radio) radio.checked = true;
    els.anchorText.value = session.pretaskAnchor.freeText || "";
    restorePrechoice(els.anchorForm, session.pretaskAnchor.values);
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
  if (freeText.length < 4) { showToast("目指したい雰囲気と夕食後の二人の状態を、一文で入力してください。"); els.anchorText.focus(); return null; }
  const label = scenario.closest("label").querySelector("span").textContent;
  if (PRECHOICE) {
    if (prechoicePicked.length !== 2) { showToast("大切にしたいことに近いものを、二つ選んでください。"); return null; }
    const labels = prechoicePicked.map((v) => PRECHOICE_OPTIONS.find(([id]) => id === v)[1]);
    return { scenarioId: scenario.value, scenarioLabel: label, freeText, values: [...prechoicePicked], valueLabels: labels };
  }
  return { scenarioId: scenario.value, scenarioLabel: label, freeText };
}

function startTask(resuming = false) {
  if (!resuming) {
    const anchor = readAnchor();
    if (!anchor) return;
    session.pretaskAnchor = anchor;
    logEvent("pretask_anchor_recorded", { scenarioId: anchor.scenarioId, textLength: anchor.freeText.length,
      ...(anchor.values ? { values: anchor.values } : {}) });
  }
  session.status = session.status === "complete" ? "complete" : "running";
  if (!session.startedAt) session.startedAt = isoNow();
  const round = session.rounds[session.currentTurn - 1];
  if (!round.promptShownAt) round.promptShownAt = isoNow();
  els.appShell.dataset.condition = session.condition;
  els.conditionBadge.textContent = session.condition === "UI_B" ? "UI B" : "UI A";
  els.insightHelp.textContent = session.condition === "UI_B"
    ? "本文はAIの解釈、タグはAIが置いた優先度です。ボタンは例文づくりのためのもので、カードはAIの読み取りとして毎回更新されます。AIに伝わるのは、あなたが送信した文章です。"
    : "本文はAIの解釈、タグはAIが置いた優先度を表します。";
  // flow：右側上部の説明は両 UI 共通の1行にする（ボタンと例文の説明は、課題説明と練習で伝える）
  if (LAYOUT_VARIANT === "flow") els.insightHelp.textContent = "AIがあなたの希望をどう受け取ったかを表示します。";
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
  els.turnLabel.textContent = complete ? "完了" : `${turn}回目`;
  els.turnCount.textContent = `${turn} / ${MAX_TURNS}`;
  els.promptKicker.textContent = complete ? "対話完了" : prompt.kicker;
  els.promptText.textContent = complete ? "全6回の対話が完了しました。" : prompt.title;
  els.guideText.textContent = complete
    ? (FLOW2 ? "このまま、振り返りへ進んでください。" : "視線計測を停止してから、振り返りへ進んでください。")
    : prompt.guide;
  els.turnAnchor.classList.toggle("hidden", complete || !session.pretaskAnchor);
  if (session.pretaskAnchor) {
    els.anchorScenarioText.textContent = session.pretaskAnchor.scenarioLabel;
    els.anchorGoalText.textContent = `最初に書いた目標：${session.pretaskAnchor.freeText}`;
  }
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
  renderExampleText(activeRound);
  if (!source) {
    const empty = document.createElement("article");
    empty.className = "criterion-card";
    empty.innerHTML = "<div class=\"criterion-title\"><h3>最初の回答を待っています</h3></div><p class=\"criterion-interpretation\">最初の回答が出ると、AIが会話から読み取った内容をここに表示します。</p>";
    els.criteriaList.append(empty);
    return;
  }
  let defaultsAdded = false;
  const exampleKeys = new Set((activeRound.exampleUsed || []).map((item) => item.key));
  source.analysis.criteria.forEach((criterion) => {
    const key = criterion.id || criterion.title;
    if (FLOW2 && isPlaceholderCriterion(key)) {
      // 会話からまだ読み取れていない枠。見出しと本文とボタンのある 1 枚のカードにすると、読み取った内容のように見えるので、
      // 見出しだけの短い帯にする（文言は従来からある見出しのまま）。ボタンは付けず、例文にも使わない。
      const bar = document.createElement("article");
      bar.className = "criterion-card placeholder";
      bar.dataset.key = key;
      bar.dataset.priority = "";
      const heading = document.createElement("div");
      heading.className = "criterion-title";
      const h3 = document.createElement("h3");
      h3.textContent = criterion.title;
      heading.append(h3);
      bar.append(heading);
      if (key === "anchor-context") {
        const note = document.createElement("span");
        note.className = "placeholder-note";
        note.textContent = criterion.meaning;
        bar.append(note);
      }
      els.criteriaList.append(bar);
      return;
    }
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
    card.className = `criterion-card${criterion.focus ? " focus" : ""}${FLOW2 && exampleKeys.has(key) ? " in-example" : ""}`;
    card.dataset.key = key;
    card.dataset.priority = criterion.priority || "";
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
      // 新しい配置（side / flow）では出さない：ボタンを押すたびに例文作成へ誘導する表示になり、
      // 「ボタン → 例文 → 入力」の経路を画面側が指示してしまうため。練習での案内は残す。
      if (LAYOUT_VARIANT === "default") showToast(`「${button.textContent}」を選びました。下の「例文を作る」で、次に伝える文に反映できます。`);
    });
    control.append(button);
  });
  return control;
}

// v1.9.3: ボタンの選択は AI には送らず、参加者が次に書く文の「例文」にだけ反映する。
const DELEGATION_EXAMPLE_PATTERNS = {
  self: (title) => `「${title}」は自分で決めたいので、AIからは案を出さないでください。`,
  ai: (title) => `「${title}」は具体的な案を一つ出してください。`,
  consult: (title) => `「${title}」はまだ決めずに、考える材料を示してください。`
};
const DELEGATION_EXAMPLE_ORDER = { self: 0, ai: 1, consult: 2 };
const PLACEHOLDER_CRITERION_IDS = new Set(["anchor-context", "pending-meaning"]);
function isPlaceholderCriterion(key) { return PLACEHOLDER_CRITERION_IDS.has(key) || /^pending-meaning/.test(String(key)); }

// 例文の表示。flow2 では、(1) ボタンの選択から作った文か、書き方の型かを枠の見た目で分け、(2) 文ごとに区切り、
// (3) 同じ回で作り直したときに前回から変わった文に印を付け、(4) 文のもとになったカードのボタンに同じ色の縁を付ける。
// 動きのある表示（点滅など）は使わない：視線を引いて、見る場所を画面側が指示することになるため。
function splitExampleSentences(text) { return String(text || "").split(/(?<=。)/).map((x) => x.trim()).filter(Boolean); }
function renderExampleText(round) {
  const text = round?.exampleText || "";
  if (!FLOW2) { els.exampleGuideText.textContent = text; return; }
  els.exampleGuide.dataset.source = round?.exampleSource || "template";
  const previous = new Set(round?.examplePreviousSentences || []);
  const fromButtons = round?.exampleSource === "buttons";
  els.exampleGuideText.replaceChildren(...splitExampleSentences(text).map((sentence, index) => {
    const span = document.createElement("span");
    span.className = "example-sentence";
    span.textContent = sentence;
    if (fromButtons && round.exampleUsed?.[index]) span.dataset.state = round.exampleUsed[index].state;
    if (round.exampleGenerationCount > 1 && !previous.has(sentence)) span.dataset.changed = "1";
    return span;
  }));
  const keys = new Set((fromButtons ? round.exampleUsed || [] : []).map((item) => item.key));
  els.criteriaList.querySelectorAll(".criterion-card").forEach((card) => card.classList.toggle("in-example", keys.has(card.dataset.key)));
}

function buildDelegationExample(criteria, delegation, touched, maxItems = 2, maxLength = 120) {
  const picked = (criteria || [])
    .map((item, index) => ({ item, index, key: item.id || item.title }))
    .filter(({ item, key }) => key && item.title && !isPlaceholderCriterion(key) && !/^turn-\d+-record$/.test(key))
    .map((entry) => ({ ...entry, state: delegation?.[entry.key] || "consult" }))
    // 既定の「一緒に考える」のまま触っていないカードは例文に入れない
    .filter(({ key, state }) => state !== "consult" || touched?.[key] === true)
    .sort((a, b) => DELEGATION_EXAMPLE_ORDER[a.state] - DELEGATION_EXAMPLE_ORDER[b.state] || a.index - b.index);
  const sentences = [];
  const used = [];
  for (const { key, state, item } of picked) {
    if (sentences.length >= maxItems) break;
    const sentence = DELEGATION_EXAMPLE_PATTERNS[state](String(item.title).trim());
    if ((sentences.join("") + sentence).length > maxLength && sentences.length) break;
    sentences.push(sentence);
    used.push({ key, state });
  }
  return { text: sentences.join(""), used };
}

function createNextInputExample() {
  if (!session || session.status !== "running" || session.condition !== "UI_B") return;
  const turn = session.currentTurn;
  const round = session.rounds[turn - 1];
  const completed = session.rounds.filter((item) => item.analysis);
  const criteria = completed.at(-1)?.analysis?.criteria || [];
  const titles = criteria.map((item) => item.title);
  const focusTitle = criteria.find((item) => item.focus)?.title || titles[0] || "夕食全体の雰囲気";
  const fromButtons = buildDelegationExample(criteria, round.delegation, round.delegationTouched);
  const examples = {
    1: "相手に＿＿と感じてほしく、二人の間に＿＿のような空気があるとよいです。",
    2: `「${focusTitle}」と一緒に、＿＿と感じられることも大切にしたいです。`,
    3: "食事中は、二人が＿＿のように過ごせる時間にしたいです。",
    4: "食卓では、二人が＿＿のように過ごしているのがよいです。",
    5: "食べ始めは＿＿で、食後は＿＿となる流れが自然です。",
    6: "この夕食で最後に大切にしたいのは＿＿です。"
  };
  const text = fromButtons.text || examples[turn].slice(0, 100);
  els.exampleGuide.dataset.source = fromButtons.text ? "buttons" : "template";
  round.examplePreviousSentences = splitExampleSentences(round.exampleText);
  round.exampleGeneratedAt = isoNow();
  round.exampleText = text;
  round.exampleGenerationCount = (round.exampleGenerationCount || 0) + 1;
  round.exampleSource = fromButtons.text ? "buttons" : "template";
  round.exampleUsed = fromButtons.used;
  renderExampleText(round);
  els.exampleGuide.classList.remove("hidden");
  logEvent("example_generated", {
    at: round.exampleGeneratedAt,
    textLength: text.length,
    generationCount: round.exampleGenerationCount,
    delegation: { ...round.delegation },
    source: fromButtons.text ? "buttons" : "template",
    usedCriteria: fromButtons.used
  });
  round.exampleSource = fromButtons.text ? "buttons" : "template";
  // flow：例文は右下の決まった場所に出るので、同じ内容のトーストは出さない（入力欄を隠し、視線を引くため）
  if (LAYOUT_VARIANT !== "flow") showToast(fromButtons.text ? "ボタンの選択から例文を作りました。必要な部分だけ使ってください。"
    : "右下に短い例文の型を表示しました。必要な部分だけ使ってください。");
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
  els.loadingDetail.textContent = "続いて「AIが読み取ったこと」を更新します";
  const loadingTimer = window.setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - loadingStartedAt) / 1000);
    // v1.7: 待ち時間の長さで表示文言を変えない（条件間・ターン間で刺激を一定に保つ）。
    if (elapsedSeconds >= 20) round.longWaitShown = true;
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
        engine: ENGINE,
        condition: session.condition,
        experimentVariant: session.experimentVariant || "standard",
        eventCardMode: QUERY.get("card") === "separate" ? "separate" : "merge",
        // v2.5: パネル固定は比較用の任意設定（?lock=1）。正式実験では使わない。
        panelLock: QUERY.get("lock") === "1",
        // flow 配置：回答の末尾を、固定の終止文ではなく、参加者の言葉を入れた依頼文にする（両 UI 共通）
        // 比較用に ?closing=fixed|personal|gap で切り替えられる（gap＝固定の終止文の前に「まだ決まっていないこと」を一文入れる）
        closingMode: ["fixed", "personal", "gap", "gap2"].includes(QUERY.get("closing")) ? QUERY.get("closing")
          : (LAYOUT_VARIANT === "flow" || INVITE_RICH ? "personal" : "fixed"),
        ...(INVITE_RICH ? { inviteMode: "rich" } : {}),
        ...(DIALOGUE_STYLE === "open" ? { dialogueStyle: "open" } : {}),
        ...(PRECHOICE && Array.isArray(session.pretaskAnchor?.values) ? { stimulusRule: "prechoice" } : {}),
        ...(SMALLTALK && session.smallTalk ? { stimulusRule: "smalltalk", smallTalk: { prep: session.smallTalk.prep, keep: session.smallTalk.keep } } : {}),
        // 分析AI の指示文の版。サーバーは試験用の参加者番号のときだけ受け付ける（正式な番号では環境変数 EXPERIMENT_ANALYSIS_PROMPT で決まる）。
        // flow2 は v7（title は項目名、meaning は AI の受け取り方）を前提にしているので、試験用の番号では v7 を送る。?prompt=v1〜v7 で切り替えられる。
        ...(/^v[1-9]$/.test(QUERY.get("prompt") || "") ? { analysisPrompt: QUERY.get("prompt") } : FLOW2 ? { analysisPrompt: "v7" } : {}),
        // 試験用の参加者番号（TEST- など）に限り、?model=… でモデルを切り替えられる（サーバー側で確認する）
        ...(QUERY.get("model") ? { model: QUERY.get("model") } : {}),
        turn: session.currentTurn,
        userText: text,
        history,
        pretaskAnchor: session.pretaskAnchor,
        delegation: session.condition === "UI_B" ? round.delegation : {},
        delegationSourceCriteria: session.condition === "UI_B" ? (previousAnalysis?.criteria || []) : [],
        // v1.7: 両条件とも前ターンのカードを分析AIだけに渡す（ID維持のため。会話AIには渡らない）。
        previousCriteria: (previousAnalysis?.criteria || []).map(({ id, title, meaning, priority }) => ({ id, title, meaning, priority }))
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
  // flow2：ここで視線計測を止めると、参加者の前で別のソフトに切り替えることになる。止めずに振り返りへ進み、最後に実験者が止める。
  card.innerHTML = FLOW2
    ? "<h3>6回の対話が完了しました</h3><p>このまま、対話後の振り返りへ進んでください。</p><button type=\"button\">振り返りへ進む</button>"
    : "<h3>6回の対話が完了しました</h3><p>視線計測を停止してから、対話後の振り返りへ進んでください。</p><button type=\"button\">振り返りへ進む</button>";
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
  const axis = document.createElement("div");
  axis.className = "five-point-axis";
  axis.innerHTML = "<span>1　全くそう思わない</span><span>5　とてもそう思う</span>";
  const scale = document.createElement("div");
  scale.className = "five-point-scale";
  scale.append(options, axis);
  fieldset.append(legend, scale);
  return fieldset;
}

function buildReflectionRows() {
  els.reflectionRows.replaceChildren();
  els.overallScaleRows.replaceChildren();
  [
    ["understanding", "「AIが読み取ったこと」から、AIの受け取り方を確認しやすかった"],
    ["noticeGap", "「AIが読み取ったこと」と自分の意図とのずれに気づきやすかった"],
    ["nextInput", "次に伝える内容を考えるうえで役立った"],
    ["delegationBoundary", "今回のやり取りでは、「AIに考えてもらいたいこと」と「自分で決めたいこと」の分け方を意識した"]
  ].forEach(([name, label]) => els.overallScaleRows.append(buildFivePointScale(name, label)));
  const prompts = [
    ["reflected", "AIの回答は、自分が入力した内容を反映していた"],
    ["partialUptake", "AIの回答は、自分が入力した複数の希望のうち、一部だけを取り上げ、ほかの希望を十分に扱っていなかった"],
    ["proxyPriority", "AIの回答は、自分が決めていない優先順位まで決めていた"],
    ["easyNext", "次に何を入力すればよいか考えやすかった"],
    ["needRevision", "自分の考えを修正・追加する必要を感じた"]
  ];
  REVIEW_TURNS.forEach((turn) => {
    const card = document.createElement("section");
    card.className = "review-turn-card";
    const userText = session.rounds[turn - 1].userText || "";
    const answer = session.rounds[turn - 1].aiText || "";
    const heading = document.createElement("h2");
    heading.textContent = `対話 ${turn}：入力とAIの回答`;
    const exchange = document.createElement("div");
    exchange.className = "review-exchange";
    exchange.innerHTML = `<section class="review-user"><small>対話 ${turn}で自分が入力した内容</small><p></p></section><section class="review-ai"><small>その入力に対するAIの回答</small><p></p></section>`;
    exchange.querySelector(".review-user p").textContent = userText;
    exchange.querySelector(".review-ai p").textContent = answer;
    card.append(heading, exchange);
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
    ["understanding", "noticeGap", "nextInput", "delegationBoundary"].forEach((name) => {
      els.reflectionForm.elements[name].value = session.reflection[name];
    });
    els.reflectionForm.elements.turningPoint.value = session.reflection.turningPoint || "";
    els.reflectionForm.elements.delegationTurningPoint.value = session.reflection.delegationTurningPoint || "";
    els.reflectionForm.querySelectorAll("input,select,textarea").forEach((item) => { item.disabled = true; });
    els.reflectionExport.hidden = false;
  }
}

function updateCharCount() { els.charCount.textContent = `${els.messageInput.value.length} / 500`; }
function updateAnchorState() {
  const scenarioSelected = Boolean(els.anchorForm.querySelector('input[name="scenario"]:checked'));
  const textLength = els.anchorText.value.trim().length;
  const ready = scenarioSelected && textLength >= 4 && (!PRECHOICE || prechoicePicked.length === 2);
  els.anchorCharCount.textContent = `${els.anchorText.value.length} / 160`;
  els.startTask.disabled = !ready;
  els.startTaskHint.textContent = ready
    ? "準備できました。対話を開始できます。"
    : "場面を一つ選び、目指す雰囲気と夕食後の目標を一文で入力してください。";
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
    ["回答の設定", ({ strong_ambiguity: "大きな解釈のずれを必ず入れる", generic_unranked: "一般的な受け取り（明示）",
      generic_embedded: "一般的な受け取り（内容のみ）", mixed_e1explicit: "参加者内 D1（第3回明示・第4回内容のみ）",
      mixed_e1content: "参加者内 D2（第3回内容のみ・第4回明示）" })[session.experimentVariant] || "通常の解釈のずれ"],
    ["規則", session.promptVersion],
    ["スキーマ", session.version]
  ].map(([term, value]) => `<div><dt>${term}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  els.dialog.showModal();
}

// 例文の2文字連続のうち、実際の送信文に含まれた割合（例文をどれだけ使ったかの目安）
function exampleOverlap(example, sent) {
  const clean = (value) => String(value || "").replace(/[\s＿「」。、]/g, "");
  const a = clean(example);
  const b = clean(sent);
  if (a.length < 2 || !b) return "";
  const grams = new Set();
  for (let i = 0; i < a.length - 1; i += 1) grams.add(a.slice(i, i + 2));
  let hit = 0;
  grams.forEach((gram) => { if (b.includes(gram)) hit += 1; });
  return (hit / grams.size).toFixed(2);
}

function exportCsv() {
  const header = [
    "participant_id", "session_id", "ui_condition", "experiment_variant", "session_schema_version", "prompt_version", "round", "control_event",
    "prompt_shown_ts", "ai_response_start_ts", "ai_response_complete_ts", "right_panel_update_ts",
    "input_focus_ts", "first_keystroke_ts", "last_keystroke_ts", "send_click_ts",
    "dialogue_model", "analysis_model", "dialogue_latency_ms", "analysis_latency_ms",
    "validation_status", "delegation_json", "delegation_touched_json",
    "example_generated_ts", "example_generation_count", "example_text", "example_source", "example_overlap"
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
    round.exampleGenerationCount || 0, round.exampleText || "", round.exampleSource || "",
    exampleOverlap(round.exampleText, round.userText)
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
  session.experimenterChecks = data.getAll("checks");
  session.events.push({ time: isoNow(), type: "experiment_variant_selected", experimentVariant });
  if (Object.keys(setupPreset).length) {  // URL で選択を入れておいた場合は、実際に送信された値と合わせて残す
    session.events.push({ time: isoNow(), type: "setup_preset", preset: setupPreset,
      kept: (setupPreset.condition ?? session.condition) === session.condition
        && (setupPreset.experimentVariant ?? experimentVariant) === experimentVariant });
  }
  saveSession();
  if (els.fullscreenToggle.checked) await tryFullscreen();
  showOnly(els.prepScreen);
});

if (FLOW2) {
  // 「考えを言葉にできそうか」は抽象的で答えにくく、「AIチャットの使い慣れ」は背景の調査にあたる（使用者の指摘）。この画面では尋ねない。
  ["confidence", "familiarity"].forEach((name) => {
    const input = els.prepForm.querySelector(`input[name="${name}"]`);
    if (!input) return;
    input.disabled = true;
    input.closest("label").hidden = true;
  });
}
els.prepForm.querySelectorAll('input[type="range"]').forEach((input) => {
  const output = $(`#${input.name}Value`);
  input.addEventListener("input", () => { if (output) output.textContent = input.value; });
});
setupSmallTalk(els.prepForm);
els.prepForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const talk = readSmallTalk(els.prepForm);
  if (talk === undefined) { showToast("ふだんの食事についての質問に、すべて答えてください。"); return; }
  if (talk) { session.smallTalk = talk; logEvent("smalltalk_recorded", { ...talk }); }
  const data = new FormData(els.prepForm);
  session.pretest = {
    completedAt: isoNow(),
    sleepiness: Number(data.get("sleepiness")),
    tension: Number(data.get("tension")),
    // flow2 では尋ねない（null）。0 や 4 を入れると、答えた値と区別できなくなる。
    confidence: data.has("confidence") ? Number(data.get("confidence")) : null,
    familiarity: data.has("familiarity") ? Number(data.get("familiarity")) : null
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
setupPrechoice(els.anchorForm);
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
    partialUptake: Number(data.get(`partialUptake_${turn}`)),
    proxyPriority: Number(data.get(`proxyPriority_${turn}`)),
    easyNext: Number(data.get(`easyNext_${turn}`)),
    needRevision: Number(data.get(`needRevision_${turn}`))
  }));
  session.reflection = {
    completedAt: isoNow(),
    rounds,
    understanding: Number(data.get("understanding")),
    noticeGap: Number(data.get("noticeGap")),
    nextInput: Number(data.get("nextInput")),
    delegationBoundary: Number(data.get("delegationBoundary")),
    turningPoint: String(data.get("turningPoint") || "").trim(),
    delegationTurningPoint: String(data.get("delegationTurningPoint") || "").trim()
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

// flow2：送信ボタンを押すと、ボタンのすぐ上（入力欄の上の行、字数の表示の位置）に小さな確認を出す。「送信する」を押して初めて送る。
// 今回の案内や入力した文に重ならず、出ても画面の配置は動かない。出てから 0.4 秒は押せない（二度押しで送られないように）。
// Enter キーは改行にする（日本語入力の確定の Enter が続けて送信になるのを防ぐ。2026-11-27 の試し録りで「友達が」だけが送られた）。
// 確認の中では Enter で送らない。入力を続けるか Esc を押すと、確認は閉じる。
const SEND_CONFIRM_SHORT_CHARS = 25;
let sendConfirmed = false;
let sendConfirmShownAt = 0;
function sendConfirmElement() {
  let box = $("#sendConfirm");
  if (box) return box;
  box = document.createElement("div");
  box.id = "sendConfirm";
  box.className = "send-confirm hidden";
  box.setAttribute("role", "group");
  box.setAttribute("aria-label", "送信の確認");
  box.dataset.aoi = "AOI_Left_SendConfirm";
  box.innerHTML = "<p>この内容で送信しますか。</p>"
    + "<button type=\"button\" class=\"send-confirm-yes\">送信する</button><button type=\"button\" class=\"send-confirm-no\">書き足す</button>";
  const note = document.createElement("small");
  note.id = "sendConfirmNote";
  note.className = "send-confirm-note hidden";
  note.textContent = "まだ短めです。相手の人柄や、お二人のいつもの様子も書き足せます。";
  els.composer.append(note, box);
  box.querySelector(".send-confirm-yes").addEventListener("click", () => {
    if (performance.now() - sendConfirmShownAt < 400) return;
    closeSendConfirm(null);
    sendConfirmed = true;
    try { els.composer.requestSubmit(); } finally { sendConfirmed = false; }
  });
  box.querySelector(".send-confirm-no").addEventListener("click", () => { closeSendConfirm("button"); els.messageInput.focus(); });
  return box;
}
function closeSendConfirm(via) {
  const box = $("#sendConfirm");
  if (!box || box.classList.contains("hidden")) return;
  box.classList.add("hidden");
  $("#sendConfirmNote")?.classList.add("hidden");
  if (via && session) logEvent("send_confirm_cancelled", { via });
}
function openSendConfirm() {
  const box = sendConfirmElement();
  const length = els.messageInput.value.trim().length;
  const short = Boolean(session) && session.status === "running" && session.currentTurn === 1 && length < SEND_CONFIRM_SHORT_CHARS;
  $("#sendConfirmNote").classList.toggle("hidden", !short);
  box.classList.remove("hidden");
  sendConfirmShownAt = performance.now();
  const b = box.getBoundingClientRect();
  if (session) logEvent("send_confirm_shown", { length, shortNote: short,
    rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] });
}
if (FLOW2) {
  document.addEventListener("submit", (event) => {
    if (event.target !== els.composer || sendConfirmed) return;
    if (!els.messageInput.value.trim()) return;  // 空のときは、従来どおりの案内に任せる
    event.preventDefault();
    event.stopImmediatePropagation();
    openSendConfirm();
  }, { capture: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { closeSendConfirm("escape"); return; }
    if (event.target === els.messageInput && event.key === "Enter" && !event.shiftKey) event.stopImmediatePropagation();  // 改行にする
  }, { capture: true });
  els.messageInput.addEventListener("input", () => closeSendConfirm("typing"));
}

// 実験者用：?condition=UI_A|UI_B と ?variant=<設定画面にある値> を付けると、設定画面の選択をあらかじめ入れておく。
// 付けなければ従来どおり（UI A・通常のずれが選ばれた状態）。画面の文言は変えない。
// 正式実験では UI ごとにブックマークを作っておくと、画面タイプや「解釈のずれ」の選び間違いを防げる。
function applySetupPreset(form, get) {
  const applied = {};
  for (const [param, field] of [["condition", "condition"], ["variant", "experimentVariant"]]) {
    const value = get(param);
    if (!value || !/^[A-Za-z0-9_]+$/.test(value)) continue;
    const input = form.querySelector(`input[name="${field}"][value="${value}"]`);
    if (input) { input.checked = true; applied[field] = value; }
  }
  return applied;
}
let setupPreset = {};

(async function init() {
  await checkAiHealth();
  if (!PREVIEW_MODE) setupPreset = applySetupPreset(els.setupForm, (key) => QUERY.get(key));
  if (PREVIEW_MODE) {
    session = buildPreviewSession();
    if (QUERY.get("screen") === "prep") {
      session.status = "pretest";
      showOnly(els.prepScreen);
      return;
    }
    if (QUERY.get("screen") === "instructions") {
      session.status = "instructions";
      prepareInstructions();
      return;
    }
    if (QUERY.get("screen") === "turn1") {
      session.status = "running";
      session.currentTurn = 1;
      session.rounds = Array.from({ length: MAX_TURNS }, (_, index) => blankRound(index + 1));
      startTask(true);
      return;
    }
    if (QUERY.get("screen") === "debrief") {
      session.status = "debrief";
      showOnly(els.debriefScreen);
      return;
    }
    if (QUERY.get("screen") === "reflection") {
      const previewExchanges = {
        3: {
          user: "食事中は、無理に話題を増やさず、自然に会話が続く雰囲気にしたいです。",
          ai: "温かい料理を一度に出せる形にします。気を遣わせないことは、食事を短時間で終え、新しい話題を増やさず静かに休めることとして整えます。この方針で、当日の流れを具体化できます。"
        },
        4: {
          user: "静かすぎるより、二人が落ち着いて近況を話せる食卓にしたいです。",
          ai: "準備の負担を減らす点は維持します。今回は二人で話す時間や特別感よりも相手を休ませることを最優先にし、会話は料理の感想だけに限定します。以上を基準に、当日の進行を整理します。"
        },
        6: {
          user: "相手に負担をかけず、食後に少し距離が近づいたと感じられることを大切にしたいです。",
          ai: "温かい主菜を中心にし、準備中と食事中の負担を抑えます。会話の進め方は決めず、確認できた希望だけを夕食の流れに反映します。現在の方針は以上です。未決定の部分は残したまま、実行に必要な内容だけを整理しました。"
        }
      };
      Object.entries(previewExchanges).forEach(([turn, exchange]) => {
        session.rounds[Number(turn) - 1].userText = exchange.user;
        session.rounds[Number(turn) - 1].aiText = exchange.ai;
      });
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
