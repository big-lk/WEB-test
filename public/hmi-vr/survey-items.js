// 问卷条目定义。pre.html / post.html 都从这里读。
// 成熟量表的条目文字先留占位（text 以「【待填】」开头），只定好编号和量程；条目请从原文或已发表的译本里取。
// 改条目文字时不要改 id：数据文件的列名就是 id。

const fill = (prefix, n, label) => Array.from({ length: n }, (_, i) => ({ id: `${prefix}_${String(i + 1).padStart(2, '0')}`, text: `【待填】${label} 第 ${i + 1} 项` }));

// —— 背景 6 题（自编，全文）——
export const BACKGROUND = {
  id: 'bg', title: '基本情况', type: 'choice',
  items: [
    { id: 'bg_01', text: '年龄段', options: ['18–24', '25–34', '35–44', '45 以上'] },
    { id: 'bg_02', text: '驾照', options: ['没有', '有'], extra: { id: 'bg_02_years', label: '持有年数', showIf: '有' } },
    { id: 'bg_03', text: '过去一年开车频率', options: ['几乎不开', '每月几次', '每周几次', '几乎每天'] },
    { id: 'bg_04', text: '用过辅助驾驶（自适应巡航、车道保持、领航辅助）吗', options: ['没用过', '用过几次', '经常用'] },
    { id: 'bg_05', text: '用过 VR 头显吗', options: ['没用过', '用过几次', '经常用'] },
    { id: 'bg_06', text: '平时坐车时看手机的时间', options: ['几乎不看', '偶尔', '大部分时间'] },
  ],
};

// —— SSQ 晕动问卷（Kennedy 等 1993）：16 项，每项 0–3。前测、后测用同一套条目，id 前缀不同 ——
const SSQ_SCALE = { min: 0, max: 3, labels: ['【待填】0', '【待填】1', '【待填】2', '【待填】3'] };
export const SSQ_PRE = { id: 'ssq_pre', title: '现在的身体感觉', intro: '【待填】SSQ 指导语（前测）', type: 'scale', scale: SSQ_SCALE, items: fill('ssq_pre', 16, 'SSQ') };
export const SSQ_POST = { id: 'ssq_post', title: '现在的身体感觉', intro: '【待填】SSQ 指导语（后测）', type: 'scale', scale: SSQ_SCALE, items: fill('ssq_post', 16, 'SSQ') };

// —— NASA-TLX：六个分量表，每个 0–100（步长 5），不加权 ——
export const TLX = {
  id: 'tlx', title: '刚才这段行驶的负荷', intro: '【待填】NASA-TLX 指导语', type: 'slider',
  scale: { min: 0, max: 100, step: 5, left: '【待填】低端', right: '【待填】高端' },
  items: fill('tlx', 6, 'NASA-TLX 分量表'),
};

// —— van der Laan 可接受性量表（1997）：9 对形容词，5 点（-2 … +2）——
export const VDL = {
  id: 'vdl', title: '对这套系统的评价', intro: '【待填】van der Laan 指导语', type: 'pair',
  scale: { min: -2, max: 2 },
  items: fill('vdl', 9, 'van der Laan 词对').map(it => ({ id: it.id, left: it.text + ' 左端', right: it.text + ' 右端' })),
};

// —— 信任量表（Jian、Bisantz 与 Drury 2000）：12 题，7 点（1–7）——
export const TRUST = {
  id: 'trust', title: '对这套系统的信任', intro: '【待填】信任量表指导语', type: 'scale',
  scale: { min: 1, max: 7, left: '【待填】1 的文字', right: '【待填】7 的文字' },
  items: fill('trust', 12, '信任量表'),
};

// —— 对系统的理解（自编，全文）：4 题，7 点，1 完全不同意 — 7 完全同意 ——
// und_01、und_02 同意 = 误解；und_03、und_04 同意 = 理解正确
export const UNDERSTANDING = {
  id: 'und', title: '对系统的理解', intro: '下面的说法，你同意到什么程度？', type: 'scale',
  scale: { min: 1, max: 7, left: '完全不同意', right: '完全同意' },
  items: [
    { id: 'und_01', text: '没有出现提示的时候，前方基本是安全的。' },
    { id: 'und_02', text: '只要系统开着，停着的车后面有没有人，它都能知道。' },
    { id: 'und_03', text: '系统减速的地方，往往是它自己也看不清的地方。' },
    { id: 'und_04', text: '即使系统没有提示，我也需要自己留意路边。' },
  ],
};

// —— 驾驶参与意愿（自编，全文）：6 题，7 点。eng_05 反向计分 ——
export const ENGAGE = {
  id: 'eng', title: '刚才乘车时的感受', intro: '下面的说法，你同意到什么程度？', type: 'scale',
  scale: { min: 1, max: 7, left: '完全不同意', right: '完全同意' },
  items: [
    { id: 'eng_01', text: '刚才坐在车里，我愿意自己去留意路上的情况。' },
    { id: 'eng_02', text: '刚才留意路况，是因为我觉得有意思，不是因为被要求。' },
    { id: 'eng_03', text: '比起刚开始，我更知道路上哪些地方值得看。' },
    { id: 'eng_04', text: '刚才我有几次比车先注意到了什么。' },
    { id: 'eng_05', text: '刚才的大部分时间，我更想看手机而不是看路。' },
    { id: 'eng_06', text: '以后用这样的车，我仍然想保持自己在开车的感觉。' },
  ],
};

// —— 内在动机量表 IMI：兴趣/享受、胜任感两个分量表，7 点。条目数和文字待从原文或译本确认 ——
export const IMI = {
  id: 'imi', title: '对刚才这段行驶的感受', intro: '【待填】IMI 指导语', type: 'scale',
  scale: { min: 1, max: 7, left: '【待填】1 的文字', right: '【待填】7 的文字' },
  items: [...fill('imi_int', 7, 'IMI 兴趣/享受'), ...fill('imi_com', 6, 'IMI 胜任感')],
};

// —— 说明与同意：文字是草稿，正式使用前请按伦理审查的要求改写 ——
export const CONSENT = {
  title: '参加说明',
  paragraphs: [
    '【待确认】这是一项关于辅助驾驶乘车体验的研究。你将戴上 VR 头显，乘坐一辆自动行驶的车，全程约 22 分钟，前后各有一份问卷，总共约 35 分钟。',
    '【待确认】过程中会记录头部朝向、按键和问卷回答，不录音、不录像，数据只用编号保存，不含姓名。',
    '【待确认】VR 可能引起头晕或不适。任何时候觉得不舒服，都可以摘下头显并退出，不需要说明理由。',
    '【待确认】联系人：＿＿＿＿（＿＿＿＿）',
  ],
  agree: '我已阅读上面的说明，自愿参加。',
};

export const PRE_SECTIONS = [BACKGROUND, SSQ_PRE];
export const POST_SECTIONS = [SSQ_POST, TLX, ENGAGE, IMI, VDL, TRUST, UNDERSTANDING];   // 意愿放在信任、理解之前，免得被那些题目带着答
