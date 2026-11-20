'use client'

import { useLanguage } from '../../../components/language-context'
import type { Language } from '../../../components/language-context'
import { portfolioWorks } from '../../../lib/portfolio-data'
import { Bullets, Chapter, Figures, LongReadBody, LongReadHeader, NumList, OtherWorks, P, Quote, Stats, Sub, no } from '../../../components/long-read'

type CaseCopy = {
  back: string
  eyebrow: string
  summary: string
  nav: [string, string][]
  problemKicker: string
  problemTitle: string
  problemCopy: string
  insight: string
  stats: [string, string][]
  limit: string
  storyKicker: string
  storyTitle: string
  storyCopy: string
  storyAlt: string
  storyPanels: [string, string][]
  uiKicker: string
  uiTitle: string
  uiCopy: string
  uiPoints: {
    title: string
    copy: string
    image: string
    alt: string
    attraction: string
  }[]
  decisionsKicker: string
  decisionsTitle: string
  decisions: [string, string, string][]
  loopKicker: string
  loopTitle: string
  loopCopy: string
  loop: [string, string][]
  iterKicker: string
  iterTitle: string
  iterCopy: string
  iterCaption: string
  versions: [string, string, string][]
  fixesTitle: string
  fixes: [string, string][]
  pending: string
  resultKicker: string
  resultTitle: string
  resultCopy: string
  result: [string, string][]
  nextTitle: string
  next: string[]
  closing: string
  otherWorks: string
}

const copy: Record<Language, CaseCopy> = {
  zh: {
    back: '返回作品列表',
    eyebrow: '微信小程序 / 个人饮食周期',
    summary: '记下每种食物距上次吃过了多少天，给不同的味道设一个自己的周期；记录攒久了，随时能查。',
    nav: [['问题', '#problem'], ['体验场景', '#story'], ['界面设计', '#ui'], ['行为闭环', '#loop'], ['版本迭代', '#iteration'], ['当前结果', '#result']],
    problemKicker: '问题背景',
    problemTitle: '“好久没吃”是一种周期判断，却很难立刻说清多久没吃、现在值不值得吃',
    problemCopy: '有些味道适合一周吃一次，也有人每天都想喝一杯。用户想到“今天吃点好久没吃的吧”时，需要同时回忆吃过什么、距上次多久，以及现在是否到了再次选择的时间。',
    insight: '所以不做更长的推荐列表，而是给每个人一张自己的饮食周期表，记录长期攒下来，随时能查。',
    stats: [['89.47%', '经常或偶尔不知道吃什么'], ['71.93%', '认为选择太多会增加决策难度'], ['92.98%', '会周期性想起某种食物或饮料'], ['38.60%', '想起后会较快再次行动']],
    limit: '数据来自 57 人形成性问卷，用于发现问题和决定 MVP 方向，不代表市场规模或长期留存。',
    storyKicker: '体验场景',
    storyTitle: '一份咖喱饭的“多久吃一次”是怎么来的',
    storyCopy: '一次记录提供日期，用户再为这份味道设定参考周期。下一次打开小程序时，系统把实际间隔与个人周期放在一起，帮助判断今天是否值得再吃。',
    storyAlt: '六格漫画：用户查看咖喱饭距上次食用天数、设定周期并再次选择',
    storyPanels: [
      ['01 · 想吃旧味道', '用户今天想吃点好久没吃的，但一时想不起哪个最合适。'],
      ['02 · 查看间隔', '列表先显示每种食物距上次食用了多少天。'],
      ['03 · 对照周期', '咖喱饭已经超过用户自己设定的一周参考周期。'],
      ['04 · 做出选择', '用户决定今天再吃，并保留最终决定权。'],
      ['05 · 更新记录', '吃完后用少量信息记录这一次，日期自动更新。'],
      ['06 · 形成节奏', '记得多了，就有了自己的饮食周期。'],
    ],
    uiKicker: '界面设计',
    uiTitle: '让天数、周期和再次记录一眼可见',
    uiCopy: '界面围绕三个判断组织：多久没吃、个人通常多久想吃一次、这次是否要重新记录。其他信息不抢占主流程。',
    uiPoints: [
      {
        title: '首页先看吃饭时间线和很久没尝的味道',
        copy: '上方是吃饭时间线（周 / 月），一眼看出最近吃了什么；下面按多久没吃排出候选，可以凭感觉挑，也可以挑最久没吃的。',
        image: '/works/haojiu-meichi/ui/v11-home.jpg',
        alt: '好久没吃 1.1 首页：吃饭时间线与很久没尝的味道',
        attraction: '为什么这样做：系统只给时间参考，不替用户决定今天必须吃什么。',
      },
      {
        title: '吃饭日历：漏记的饭也能补回来',
        copy: '日历按天显示吃过的东西，点某一天就能补记或改日期。不要求天天打卡，漏了也能补上。',
        image: '/works/haojiu-meichi/ui/v11-calendar.jpg',
        alt: '好久没吃 1.1 吃饭日历',
        attraction: '为什么这样做：记录越完整，周期越准；补记比每天提醒更不打扰。',
      },
      {
        title: '该吃了：按自己的周期排好顺序',
        copy: '超过自己设定周期的味道排在前面，饮品写“该喝了”；不想吃就点“晚 7 天再出现”，记录不会删。',
        image: '/works/haojiu-meichi/ui/v11-due.jpg',
        alt: '好久没吃 1.1 该吃了页面',
        attraction: '为什么这样做：用户看到的是自己的生活规律，而不是平台规定的提醒周期。',
      },
    ],
    decisionsKicker: 'Design decisions',
    decisionsTitle: '调研影响了三个关键设计判断',
    decisions: [
      ['以天数为基础', '每记一次，先更新距上次吃过的天数。', '驱动力：减少回忆成本'],
      ['周期由用户设定', '每种食物可以设置不同参考周期，并可随使用调整。', '驱动力：尊重个人差异'],
      ['参考而非到期命令', '展示多久没吃和周期状态，由用户决定再吃、忽略或调整。', '驱动力：保留自主判断'],
    ],
    loopKicker: 'Behavior loop',
    loopTitle: '一次记录怎样帮到下一次',
    loopCopy: '产品不要求连续打卡。每次吃过之后更新日期，周期表才会逐渐接近用户真实的生活节奏；长期积累的记录也能随时查找，回答“上次是什么时候吃的”。',
    loop: [['记录', '保存食物与日期'], ['计算', '显示距上次食用天数'], ['设定', '给出个人参考周期'], ['判断', '决定现在是否再吃'], ['更新', '吃过后刷新日期'], ['积累', '逐渐形成个人周期']],
    iterKicker: '版本迭代',
    iterTitle: '按“第一次用的人”重走两轮，改出现在的 1.1 版',
    iterCopy: '现在的 1.1 版，是按“第一次用的人”重走两轮后改出来的：两个模拟新人（一个按引导填、一个跳过引导）用真实页面代码走完整流程，再按“完全不知道这个软件的人”重走一轮，把卡住的地方逐条改掉。这还不是真人测试，真人测试是下一步。',
    iterCaption: '1.1 的新手流程：欢迎 → 1 分钟填好口味 → 确认 → 首页吃饭时间线（开发者工具渲染截图）',
    versions: [['1.1', '当前版本', '首页吃饭时间线（周 / 月）和吃饭日历，可以补记过去的饭；1 分钟快速填好口味；凭感觉挑或挑最久没吃的；三档评价；导出备份与恢复；照片按用户分开保存。']],
    fixesTitle: '走查发现的问题，和怎么改的',
    fixes: [['同一个名字记两次，会出现两条“拉面”，刚吃过的那条还显示“该吃了”', '同名自动并进原来那条，算又吃了一次，并提示“之前记过”'], ['刚开始只有几条记录时，“凭感觉挑”点了什么都没有', '没有可推荐的就先隐藏，指引改为先看时间线'], ['几天前定的方案一直挂着“今天的方案”，每天还自动弹一次', '写明是哪天定的，只有今天定的才会弹出'], ['“吃过的”页用另一套颜色和图例，和首页“紫 = 过去、橙 = 今天”冲突', '去掉旧时间轴，全站统一成一套颜色'], ['饮品也写“该吃了”，今天已经吃过的还出现“今天吃它”', '饮品改成“该喝了”，今天吃过的不再提示']],
    pending: '还没解决：“凭感觉挑”效果偏弱（“很久没吃”的分数压过了感觉）；快速填空的确认页偏密；“方案”这个词偏抽象。',
    resultKicker: '当前结果',
    resultTitle: '57 人概念调研后，完成真实可用并上线的微信小程序',
    resultCopy: '当前是 1.1 版：吃饭时间线与日历、记一笔、个人周期、该吃了、凭感觉挑，以及备份与恢复。',
    result: [['核心流程', '食物记录、日期更新、周期设置、周期列表与再次记录。'], ['个人节奏', '不同食物分别设置参考周期，并保留修改与忽略的权利。'], ['真实实现', '借助 AI 开发工具完成微信小程序，实现可实际操作的主要流程。']],
    nextTitle: '接下来要看什么',
    next: ['找 5–8 位真实用户做任务测试：第一次记录、找回旧味道、处理“该吃了”，看是否不用解释。', '7 天使用观察：首条记录完成率、回访和再次品尝。', '加大“凭感觉挑”里感觉的权重，再看推荐会不会跟着变。'],
    closing: '“好久没吃”不替用户决定吃什么。它把多久没吃和个人周期摆在一起，让用户更容易判断今天是否值得再吃。',
    otherWorks: '查看其他作品',
  },
  en: {
    back: 'Back to works',
    eyebrow: 'WeChat mini program / Personal food cycles',
    summary: 'Records how many days since each food was last eaten and lets you set your own interval for each flavor; the log builds up over time and can be searched any time.',
    nav: [['Problem', '#problem'], ['Story', '#story'], ['Real UI', '#ui'], ['Behavior loop', '#loop'], ['Iteration', '#iteration'], ['Outcome', '#result']],
    problemKicker: 'Opportunity',
    problemTitle: '“I have not eaten this in a while” leaves two questions: how long, and is today the right time?',
    problemCopy: 'Some flavors suit a weekly rhythm; others are wanted every day. Choosing something familiar means recalling what was eaten, how long it has been, and whether it is time to choose it again.',
    insight: 'Design opportunity: build a personal food-cycle reference table that grows into a searchable long-term record.',
    stats: [['89.47%', 'Often or sometimes cannot decide what to eat'], ['71.93%', 'Say too many choices make deciding harder'], ['92.98%', 'Periodically miss a dish or drink'], ['38.60%', 'Act soon after remembering it']],
    limit: 'A 57-person formative survey guided the problem and MVP direction; it is not evidence of market size or long-term retention.',
    storyKicker: 'Experience story',
    storyTitle: 'How curry develops a personal “how often”',
    storyCopy: 'A record supplies the date, and the user sets a reference interval for that flavor. On the next visit, the app places the actual gap beside that interval to help decide whether to eat it again today.',
    storyAlt: 'Six-panel comic showing days since curry was last eaten, a personal interval, and choosing it again',
    storyPanels: [['01 · Choose something familiar', 'The user wants something they have not eaten in a while but cannot immediately choose.'], ['02 · Check the gap', 'The list shows days since each food was last eaten.'], ['03 · Compare the interval', 'Curry has passed the one-week reference interval set by the user.'], ['04 · Make the choice', 'The user decides to eat it again today and keeps the final decision.'], ['05 · Update the record', 'A brief record after eating updates the date.'], ['06 · Build a rhythm', 'Repeated records gradually form a personal food-cycle reference.']],
    uiKicker: 'UI attraction',
    uiTitle: 'Make days, intervals, and repeat recording visible at a glance',
    uiCopy: 'The interface supports three judgments: how long it has been, how often the user usually wants that food, and whether to record it again.',
    uiPoints: [
      {
        title: 'The home screen starts with a meal timeline and long-missed flavors',
        copy: 'A meal timeline (week / month) shows what you have eaten lately; below, candidates are ordered by how long it has been. Pick by feeling, or pick the one you have gone longest without.',
        image: '/works/haojiu-meichi/ui/v11-home.jpg',
        alt: 'Long Time No Taste 1.1 home: meal timeline and long-missed flavors',
        attraction: 'Why: the app offers a time reference, not an order to eat something today.',
      },
      {
        title: 'Meal calendar: add the meals you forgot to log',
        copy: 'The calendar shows what you ate each day; tap a day to add a meal or change a date. No daily check-in needed, and gaps can be filled later.',
        image: '/works/haojiu-meichi/ui/v11-calendar.jpg',
        alt: 'Long Time No Taste 1.1 meal calendar',
        attraction: 'Why: the more complete the log, the more accurate the cycle; filling gaps is less intrusive than daily reminders.',
      },
      {
        title: 'Due list: ordered by your own intervals',
        copy: 'Flavors past your own interval come first, and drinks say “time to drink”. Not in the mood? “Show again in 7 days” postpones it without deleting the record.',
        image: '/works/haojiu-meichi/ui/v11-due.jpg',
        alt: 'Long Time No Taste 1.1 due list',
        attraction: 'Why: users see their own rhythm, not a reminder schedule set by the platform.',
      },
    ],
    decisionsKicker: 'Design decisions',
    decisionsTitle: 'Research changed three core decisions',
    decisions: [['Start with days elapsed', 'Each record updates days since the food was last eaten, creating a clear time reference.', 'Driver: reduce recall effort'], ['Let users set the interval', 'Each food can have a different reference interval that users can adjust.', 'Driver: respect personal differences'], ['Support a decision', 'Show elapsed time and cycle status so the user can choose, ignore, or adjust.', 'Driver: preserve autonomy']],
    loopKicker: 'Behavior loop',
    loopTitle: 'How one record becomes the next cycle reference',
    loopCopy: 'Updating the date after each meal gradually brings the cycle table closer to the user’s real routine, and the accumulated log answers “when did I last have this?” at any time.',
    loop: [['Record', 'Save the food and date'], ['Calculate', 'Show days since it was last eaten'], ['Set', 'Choose a personal reference interval'], ['Judge', 'Decide whether to eat it now'], ['Update', 'Refresh the date after eating'], ['Accumulate', 'Build a personal cycle']],
    iterKicker: 'Iteration',
    iterTitle: 'Two walkthroughs as a first-time user shaped the current version 1.1',
    iterCopy: 'Version 1.1 came out of two walkthroughs as a first-time user: two simulated newcomers (one following the onboarding, one skipping it) ran the full flow on the real page code, then I walked it again as someone who knows nothing about the app and fixed each place they got stuck. This is not yet a test with real users; that comes next.',
    iterCaption: 'The 1.1 onboarding: welcome → fill in your tastes in a minute → confirm → home meal timeline (rendered in the developer tools)',
    versions: [['1.1', 'Current version', 'A meal timeline (week / month) and meal calendar on the home screen, with past meals addable; a one-minute taste setup; pick by feeling or by longest gap; three-level ratings; backup export and restore; photos stored per user.']],
    fixesTitle: 'What the walkthroughs found, and the fix',
    fixes: [['Recording the same name twice created two “ramen” entries, and the one just eaten still showed as due', 'Same names merge into the existing entry as one more time eaten, with a note saying so'], ['With only a few records, “pick by feeling” returned nothing', 'It stays hidden until there is something to suggest; the guide points to the timeline first'], ['A plan made days ago stayed labeled “today’s plan” and popped up every day', 'It shows the day it was made, and only today’s plan pops up'], ['The history page used its own colors and legend, clashing with “purple = past, orange = today”', 'The old timeline was removed and one color scheme used throughout'], ['Drinks also said “time to eat”, and items already eaten today still offered “eat it today”', 'Drinks say “time to drink”, and items eaten today are no longer suggested']],
    pending: 'Still open: “pick by feeling” has little effect (the long-gap score outweighs feelings); the quick-setup confirmation page is dense; the word “plan” feels abstract.',
    resultKicker: 'Outcome',
    resultTitle: 'From concept research to a working, released WeChat mini program',
    resultCopy: 'The current version 1.1 covers the meal timeline and calendar, quick records, personal intervals, the due list, picking by feeling, and backup and restore.',
    result: [['Core flow', 'Food records, date updates, interval settings, cycle lists, and repeat recording.'], ['Personal rhythm', 'Separate intervals for different foods, with options to adjust or ignore them.'], ['Working implementation', 'AI development tools helped build the WeChat mini program and its usable core flows.']],
    nextTitle: 'Next validation',
    next: ['Task tests with 5–8 real users: first record, finding an old flavor, handling the due list, without explanation.', 'A seven-day field test: first-record completion, return visits, and repeat tasting.', 'Raise the weight of feelings in “pick by feeling”, then check whether suggestions change.'],
    closing: 'The app places days since a food was last eaten beside its personal interval, helping users judge whether to choose it again today.',
    otherWorks: 'View other works',
  },
  ja: {
    back: '作品一覧へ戻る',
    eyebrow: 'WeChatミニプログラム / 個人の食事周期',
    summary: '食べ物ごとに前回からの日数を記録し、味ごとに自分の目安周期を決める。記録はたまっていき、いつでも探せる。',
    nav: [['課題', '#problem'], ['体験物語', '#story'], ['実UI', '#ui'], ['行動ループ', '#loop'], ['改版', '#iteration'], ['成果', '#result']],
    problemKicker: 'Opportunity',
    problemTitle: '「しばらく食べていない」を、日数と今日また食べたいかで判断する',
    problemCopy: '週に一度食べたい味も、毎日飲みたいものもある。久しぶりのものを選ぶ時は、何を食べたか、前回からどれくらい経ったか、また選びたい時期かを合わせて思い出す必要がある。',
    insight: '設計機会：個人の食事周期を参照でき、いつでも検索できる長期記録になる表を作る。',
    stats: [['89.47%', '食事選びに迷うことがある'], ['71.93%', '選択肢の多さが決定を難しくする'], ['92.98%', '料理や飲料を周期的に懐かしむ'], ['38.60%', '思い出した後すぐ行動する']],
    limit: '57名の形成的調査は課題とMVP方針の判断に使用し、市場規模や長期継続を示すものではない。',
    storyKicker: 'Experience story',
    storyTitle: '一皿のカレーに、自分の「どれくらいの頻度」ができるまで',
    storyCopy: '一回の記録で日付を残し、その味の目安周期を設定する。次に開く時、実際の間隔と個人の周期を並べ、今日また食べたいかを判断する。',
    storyAlt: 'カレーを前回食べた日からの日数、周期設定、再び選ぶまでの6コマ漫画',
    storyPanels: [['01 · 久しぶりの味を選びたい', 'しばらく食べていないものが欲しいが、すぐに候補が思い浮かばない。'], ['02 · 間隔を見る', '一覧で、食べ物ごとの前回からの日数を確認する。'], ['03 · 周期と比較', 'カレーは本人が設定した一週間の目安周期を過ぎている。'], ['04 · 自分で選ぶ', '本人が今日もう一度食べると決める。'], ['05 · 記録を更新', '食後に少ない情報で記録し、日付を更新する。'], ['06 · リズムができる', '記録を重ね、個人の食事周期の参考にする。']],
    uiKicker: 'UI attraction',
    uiTitle: '日数、周期、再記録を一目で分かるようにする',
    uiCopy: '前回からの日数、普段どの頻度で食べたいか、今回もう一度記録するかという三つの判断を中心に構成する。',
    uiPoints: [
      {
        title: 'ホームでは食事タイムラインと久しぶりの味から',
        copy: '上に食事タイムライン（週／月）があり、最近何を食べたかが一目で分かる。下には久しぶり順に候補が並び、気分で選ぶことも、一番久しぶりのものを選ぶこともできる。',
        image: '/works/haojiu-meichi/ui/v11-home.jpg',
        alt: '好久没吃 1.1 ホーム：食事タイムラインと久しぶりの味',
        attraction: 'なぜこうしたか：アプリは時間の目安を示すだけで、今日食べるものを決めつけない。',
      },
      {
        title: '食事カレンダー：記録し忘れた食事も後から足せる',
        copy: 'カレンダーで日ごとに食べたものを表示し、日付を押せば追加や日付の修正ができる。毎日の記録を求めず、抜けは後から埋められる。',
        image: '/works/haojiu-meichi/ui/v11-calendar.jpg',
        alt: '好久没吃 1.1 食事カレンダー',
        attraction: 'なぜこうしたか：記録がそろうほど周期は正確になり、後から足すほうが毎日の通知より負担が少ない。',
      },
      {
        title: 'そろそろ：自分の周期の順に並ぶ',
        copy: '自分で決めた周期を過ぎた味が上に来て、飲み物は「そろそろ飲もう」と表示。気が乗らなければ「7日後にまた表示」で先送りでき、記録は消えない。',
        image: '/works/haojiu-meichi/ui/v11-due.jpg',
        alt: '好久没吃 1.1 そろそろ一覧',
        attraction: 'なぜこうしたか：見えるのは自分の生活のリズムで、アプリが決めた通知周期ではない。',
      },
    ],
    decisionsKicker: 'Design decisions',
    decisionsTitle: '調査が変えた3つの設計',
    decisions: [['日数を基礎にする', '記録のたびに前回からの日数を更新し、分かりやすい時間の参考にする。', '動機：思い出す負担を減らす'], ['本人が周期を設定', '食べ物ごとに異なる目安周期を決め、使いながら調整できる。', '動機：個人差を尊重する'], ['判断の参考にする', '日数と周期の状態を示し、再び食べる、見送る、調整するかは本人が選ぶ。', '動機：主体性を保つ']],
    loopKicker: 'Behavior loop',
    loopTitle: '一回の記録を次の周期の参考にする',
    loopCopy: '食べた後に日付を更新し、周期表を本人の実際の生活リズムへ近づけていく。蓄積した記録で「前回いつ食べたか」もすぐ探せる。',
    loop: [['記録', '食べ物と日付を保存'], ['計算', '前回からの日数を表示'], ['設定', '個人の目安周期を決める'], ['判断', '今また食べるかを選ぶ'], ['更新', '食後に日付を更新'], ['蓄積', '個人の周期ができる']],
    iterKicker: '改版',
    iterTitle: '「初めて使う人」として2回たどり直し、現在の1.1版に',
    iterCopy: '現在の1.1版は、「初めて使う人」として2回たどり直して改めたもの。模擬の新規ユーザー2人（ガイドどおりに入力する人、ガイドを飛ばす人）に実際の画面コードで全体をたどらせ、さらに「アプリを何も知らない人」としてもう一度たどり、つまずく箇所を一つずつ直した。まだ実ユーザーによるテストではなく、それが次のステップ。',
    iterCaption: '1.1の初回フロー：ようこそ → 1分で好みを入力 → 確認 → ホームの食事タイムライン（開発者ツールでの描画）',
    versions: [['1.1', '現在の版', 'ホームに食事タイムライン（週／月）と食事カレンダー、過去の食事も記録可能。1分で好みを入力、気分で選ぶ／一番久しぶりから選ぶ、3段階の評価、バックアップの書き出しと復元、写真をユーザーごとに保存。']],
    fixesTitle: 'たどり直しで見つかった問題と直し方',
    fixes: [['同じ名前を2回記録すると「ラーメン」が2件になり、食べたばかりの方も「そろそろ」と表示された', '同じ名前は元の記録にまとめ、もう一度食べたことにして「前にも記録あり」と表示'], ['記録が少ないうちは「気分で選ぶ」を押しても何も出なかった', '候補がないときは隠し、ガイドはまずタイムラインを示す'], ['数日前に決めたプランが「今日のプラン」のまま毎日表示された', '決めた日を明記し、今日決めたものだけを表示'], ['「食べたもの」画面だけ別の配色と凡例で、「紫＝過去、橙＝今日」と食い違った', '古いタイムラインを外し、配色を全体で統一'], ['飲み物にも「そろそろ食べよう」、今日食べたものにも「今日食べる」が出た', '飲み物は「そろそろ飲もう」に、今日食べたものには出さない']],
    pending: '未解決：「気分で選ぶ」の効きが弱い（久しぶり度が気分より強く効く）、初回入力の確認画面が詰まっている、「プラン」という言葉が抽象的。',
    resultKicker: 'Outcome',
    resultTitle: '概念調査から、実際に使える公開済みWeChatミニプログラムへ',
    resultCopy: '現在の1.1版は、食事タイムラインとカレンダー、記録、個人の周期、そろそろ一覧、気分で選ぶ、バックアップと復元をカバーする。',
    result: [['主要フロー', '食事記録、日付更新、周期設定、周期一覧、再記録。'], ['個人のリズム', '食べ物ごとに目安周期を設定し、変更や見送りを本人が選べる。'], ['実装', 'AI開発ツールを使ってWeChatミニプログラムを制作し、主要フローを操作できるようにした。']],
    nextTitle: '次の検証',
    next: ['実ユーザー5〜8名で、初回記録・久しぶりの味の検索・「そろそろ」一覧の扱いを説明なしでできるか確かめる。', '7日間の利用観察で、初回記録の完了率、再訪、再食を見る。', '「気分で選ぶ」で気分の重みを上げ、推薦が変わるかを確かめる。'],
    closing: '前回からの日数と個人の周期を並べ、今日もう一度食べたいかを本人が判断しやすくする。',
    otherWorks: '他の作品を見る',
  },
}

const ui = {
  zh: { role: '角色', period: '时间', contents: '目录', why: '为什么这样做', drive: '依据' },
  ja: { role: '担当', period: '期間', contents: '目次', why: 'なぜこうしたか', drive: '根拠' },
  en: { role: 'Role', period: 'Period', contents: 'Contents', why: 'Why', drive: 'Basis' },
} as const

export default function TasteAgainCasePage() {
  const { language } = useLanguage()
  const t = copy[language]
  const u = ui[language]
  const en = language === 'en'
  const work = portfolioWorks[language].find((item) => item.id === 'taste-again')
  if (!work) return null

  const ids = ['problem', 'story', 'ui', 'loop', 'iteration', 'result']
  const chapters = ids.map((id, i) => ({ id, title: t.nav[i]?.[0] ?? id }))
  const n = (id: string) => no(chapters, id)
  const colon = en ? ': ' : '：'
  const strip = (s: string) => s.replace(/^(为什么这样做|なぜこうしたか|Why)[：:]\s*/, '')

  return (
    <main>
      <LongReadHeader back={t.back} eyebrow={t.eyebrow} title={work.title} lead={t.summary} meta={[[u.role, work.role], [u.period, work.period]]}
        aside={<img src={work.image} alt={work.title} className="w-full rounded-[16px] ring-1 ring-black/[0.06]" />} />

      <LongReadBody chapters={chapters} contentsLabel={u.contents} deps={[language]}>
        <Chapter id="problem" no={n('problem')} title={chapters[0].title}>
          <P lead>{t.problemTitle}</P>
          <div className="mt-5"><P>{t.problemCopy}</P></div>
          <Stats items={t.stats.map(([v, l]) => [v, l] as [string, string])} />
          <p className="mt-4 max-w-[680px] text-[13px] leading-6 text-[#74777F]">{t.limit}</p>
          <div className="mt-10"><Quote>{t.insight}</Quote></div>
        </Chapter>

        <Chapter id="story" no={n('story')} title={chapters[1].title}>
          <P lead>{t.storyTitle}</P>
          <div className="mt-5"><P>{t.storyCopy}</P></div>
          <NumList items={t.storyPanels.map(([a, b]) => [a.replace(/^\d+\s*·\s*/, ''), b] as [string, string])} en={en} />
        </Chapter>

        <Chapter id="ui" no={n('ui')} title={chapters[2].title}>
          <P lead>{t.uiTitle}</P>
          <div className="mt-5"><P>{t.uiCopy}</P></div>
          <div className="mt-10 grid gap-14">
            {t.uiPoints.map((point, i) => (
              <div key={point.title} className="grid items-center gap-8 sm:grid-cols-[minmax(0,1fr)_240px]">
                <div>
                  <h3 className="flex gap-3 text-[18px] font-semibold leading-snug"><span className="font-mono text-[13px] leading-7 text-[#A87A07]">{i + 1}.</span>{point.title}</h3>
                  <div className="mt-3"><P>{point.copy}</P></div>
                  <p className="mt-3 max-w-[680px] text-[14px] leading-7 text-[#74777F]"><b className="font-semibold text-[#3B3E46] dark:text-neutral-200">{u.why}{colon}</b>{strip(point.attraction)}</p>
                </div>
                <img src={point.image} alt={point.alt} loading="lazy" className="mx-auto w-[220px] rounded-[22px] shadow-[0_18px_40px_rgba(20,22,27,0.14)] ring-1 ring-black/[0.08]" />
              </div>
            ))}
          </div>
          <Sub>{t.decisionsTitle}</Sub>
          <NumList items={t.decisions.map(([a, b, c]) => [a, en ? `${b} (${c})` : `${b}（${c}）`] as [string, string])} en={en} />
        </Chapter>

        <Chapter id="loop" no={n('loop')} title={chapters[3].title}>
          <P lead>{t.loopTitle}</P>
          <div className="mt-5"><P>{t.loopCopy}</P></div>
          <p className="mt-8 flex max-w-[760px] flex-wrap items-baseline gap-x-3 gap-y-3 text-[15px] leading-7">
            {t.loop.map(([a, b], i) => (
              <span key={a} className="inline-flex items-baseline gap-3">
                <span><b className="font-semibold">{a}</b> <span className="text-[#74777F]">{b}</span></span>
                {i < t.loop.length - 1 ? <span aria-hidden="true" className="text-[#A87A07]">→</span> : <span aria-hidden="true" className="text-[#A87A07]">↺</span>}
              </span>
            ))}
          </p>
        </Chapter>

        <Chapter id="iteration" no={n('iteration')} title={chapters[4].title}>
          <P lead>{t.iterTitle}</P>
          <div className="mt-5"><P>{t.iterCopy}</P></div>
          <NumList items={t.versions.map(([v, l, d]) => [`${v} · ${l}`, d] as [string, string])} en={en} />
          <Figures items={[{ src: '/works/haojiu-meichi/ui/flow-v1-1.jpg', alt: t.iterCaption, caption: t.iterCaption }]} />
          <Sub>{t.fixesTitle}</Sub>
          <table className="mt-4 w-full max-w-[760px] border-collapse text-left text-[14px] leading-7">
            <tbody>
              {t.fixes.map(([problem, fix]) => (
                <tr key={problem} className="border-b border-black/[0.08] align-top dark:border-white/10">
                  <td className="w-1/2 py-3 pr-6 text-[#74777F]">{problem}</td>
                  <td className="py-3 text-[#14161B] dark:text-neutral-100"><span className="mr-2 text-[#A87A07]">→</span>{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-5 max-w-[680px] text-[14px] leading-7 text-[#74777F]">{t.pending}</p>
        </Chapter>

        <Chapter id="result" no={n('result')} title={chapters[5].title}>
          <P lead>{t.resultTitle}</P>
          <div className="mt-5"><P>{t.resultCopy}</P></div>
          <NumList items={t.result.map(([a, b]) => [a, b] as [string, string])} en={en} />
          <Sub>{t.nextTitle}</Sub>
          <Bullets items={t.next} mark="→" />
          <div className="mt-10"><Quote>{t.closing}</Quote></div>
          <OtherWorks label={t.otherWorks} />
        </Chapter>
      </LongReadBody>
    </main>
  )
}
