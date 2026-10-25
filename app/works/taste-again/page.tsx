'use client'

import Link from 'next/link'
import { useLanguage } from '../../../components/language-context'
import type { Language } from '../../../components/language-context'
import { portfolioWorks } from '../../../lib/portfolio-data'

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
    nav: [['问题', '#problem'], ['体验场景', '#story'], ['界面设计', '#ui'], ['行为闭环', '#loop'], ['当前结果', '#result']],
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
        title: '先看到哪些味道已经接近个人周期',
        copy: '首页把距上次食用天数与个人参考周期放在一起，帮助用户从自己的记录中缩小候选。',
        image: '/works/haojiu-meichi/ui/home.jpg',
        alt: '好久没吃小程序首页真实界面',
        attraction: '为什么这样做：系统提供时间参考，不替用户决定今天必须吃什么。',
      },
      {
        title: '吃过之后，用最少信息更新这一次',
        copy: '记录按钮固定在中间；名称和日期优先，照片、地点和感受都能跳过，记起来不费事。',
        image: '/works/haojiu-meichi/ui/record.jpg',
        alt: '好久没吃小程序记录页真实界面',
        attraction: '为什么这样做：颜色层级和主动作要一眼看见，减少第一次记录的犹豫。',
      },
      {
        title: '周期表让不同食物拥有不同节奏',
        copy: '日期、次数、距上次天数与参考周期共同呈现；咖啡可以每天，某家餐厅可以每周，不使用统一规则。',
        image: '/works/haojiu-meichi/ui/memories.jpg',
        alt: '好久没吃小程序回忆页真实界面',
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
    resultKicker: '当前结果',
    resultTitle: '57 人概念调研后，完成真实可用并上线的微信小程序',
    resultCopy: '当前版本已经覆盖食物记录、距上次天数、个人周期设置、周期查看与再次记录的主要流程。',
    result: [['核心流程', '食物记录、日期更新、周期设置、周期列表与再次记录。'], ['个人节奏', '不同食物分别设置参考周期，并保留修改与忽略的权利。'], ['真实实现', '借助 AI 开发工具完成微信小程序，实现可实际操作的主要流程。']],
    nextTitle: '接下来要看什么',
    next: ['用 5–8 人任务测试验证首次记录、查找旧味道与处理再会卡片是否无需解释。', '计划进行 7 天使用观察，查看首条记录完成率、回访与再次品尝行为。'],
    closing: '“好久没吃”不替用户决定吃什么。它把多久没吃和个人周期摆在一起，让用户更容易判断今天是否值得再吃。',
    otherWorks: '查看其他作品',
  },
  en: {
    back: 'Back to works',
    eyebrow: 'WeChat mini program / Personal food cycles',
    summary: 'Records how many days since each food was last eaten and lets you set your own interval for each flavor; the log builds up over time and can be searched any time.',
    nav: [['Problem', '#problem'], ['Story', '#story'], ['Real UI', '#ui'], ['Behavior loop', '#loop'], ['Outcome', '#result']],
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
      { title: 'See which flavors are near their personal interval', copy: 'The home screen pairs days since each food was last eaten with its personal interval to narrow candidates from the user’s records.', image: '/works/haojiu-meichi/ui/home.jpg', alt: 'Real home screen', attraction: 'Design reason: provide a time reference and leave the choice to the user.' },
      { title: 'Update a meal with minimal information', copy: 'The central record button anchors the main action. Name and date come first; photos, places, and feelings can be skipped.', image: '/works/haojiu-meichi/ui/record.jpg', alt: 'Real recording screen', attraction: 'Design reason: a visible hierarchy and main action reduce hesitation on the first record.' },
      { title: 'Give different foods different rhythms', copy: 'Dates, counts, days elapsed, and reference intervals appear together. Coffee can be daily; a restaurant can be weekly.', image: '/works/haojiu-meichi/ui/memories.jpg', alt: 'Real food-cycle reference screen', attraction: 'Design reason: reflect the user’s own routines through personal intervals.' },
    ],
    decisionsKicker: 'Design decisions',
    decisionsTitle: 'Research changed three core decisions',
    decisions: [['Start with days elapsed', 'Each record updates days since the food was last eaten, creating a clear time reference.', 'Driver: reduce recall effort'], ['Let users set the interval', 'Each food can have a different reference interval that users can adjust.', 'Driver: respect personal differences'], ['Support a decision', 'Show elapsed time and cycle status so the user can choose, ignore, or adjust.', 'Driver: preserve autonomy']],
    loopKicker: 'Behavior loop',
    loopTitle: 'How one record becomes the next cycle reference',
    loopCopy: 'Updating the date after each meal gradually brings the cycle table closer to the user’s real routine, and the accumulated log answers “when did I last have this?” at any time.',
    loop: [['Record', 'Save the food and date'], ['Calculate', 'Show days since it was last eaten'], ['Set', 'Choose a personal reference interval'], ['Judge', 'Decide whether to eat it now'], ['Update', 'Refresh the date after eating'], ['Accumulate', 'Build a personal cycle']],
    resultKicker: 'Outcome',
    resultTitle: 'From concept research to a working, released WeChat mini program',
    resultCopy: 'The current version covers food records, elapsed days, personal interval settings, cycle review, and repeat recording.',
    result: [['Core flow', 'Food records, date updates, interval settings, cycle lists, and repeat recording.'], ['Personal rhythm', 'Separate intervals for different foods, with options to adjust or ignore them.'], ['Working implementation', 'AI development tools helped build the WeChat mini program and its usable core flows.']],
    nextTitle: 'Next validation',
    next: ['Test first recording, finding an old flavor, and handling a reunion card with 5–8 participants.', 'Run a seven-day field test to observe first-record completion, return, and repeat tasting.'],
    closing: 'The app places days since a food was last eaten beside its personal interval, helping users judge whether to choose it again today.',
    otherWorks: 'View other works',
  },
  ja: {
    back: '作品一覧へ戻る',
    eyebrow: 'WeChatミニプログラム / 個人の食事周期',
    summary: '食べ物ごとに前回からの日数を記録し、味ごとに自分の目安周期を決める。記録はたまっていき、いつでも探せる。',
    nav: [['課題', '#problem'], ['体験物語', '#story'], ['実UI', '#ui'], ['行動ループ', '#loop'], ['成果', '#result']],
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
      { title: '個人の周期に近づいた味を見る', copy: 'ホームで前回からの日数と目安周期を並べ、本人の記録から候補を絞れるようにする。', image: '/works/haojiu-meichi/ui/home.jpg', alt: '実際のホーム画面', attraction: '設計理由：時間の参考を示し、選択は本人に委ねる。' },
      { title: '食後は少ない情報で更新する', copy: '中央の記録ボタンを主操作とし、名前と日付を優先する。写真、場所、感想は省略できる。', image: '/works/haojiu-meichi/ui/record.jpg', alt: '実際の記録画面', attraction: '設計理由：視覚的な優先順位と主操作を明確にし、初回記録の迷いを減らす。' },
      { title: '食べ物ごとに異なるリズムを持つ', copy: '日付、回数、前回からの日数、目安周期を一緒に示す。コーヒーは毎日、ある店は毎週など、個別に設定する。', image: '/works/haojiu-meichi/ui/memories.jpg', alt: '実際の食事周期の参考画面', attraction: '設計理由：本人の生活リズムを個人の周期で表す。' },
    ],
    decisionsKicker: 'Design decisions',
    decisionsTitle: '調査が変えた3つの設計',
    decisions: [['日数を基礎にする', '記録のたびに前回からの日数を更新し、分かりやすい時間の参考にする。', '動機：思い出す負担を減らす'], ['本人が周期を設定', '食べ物ごとに異なる目安周期を決め、使いながら調整できる。', '動機：個人差を尊重する'], ['判断の参考にする', '日数と周期の状態を示し、再び食べる、見送る、調整するかは本人が選ぶ。', '動機：主体性を保つ']],
    loopKicker: 'Behavior loop',
    loopTitle: '一回の記録を次の周期の参考にする',
    loopCopy: '食べた後に日付を更新し、周期表を本人の実際の生活リズムへ近づけていく。蓄積した記録で「前回いつ食べたか」もすぐ探せる。',
    loop: [['記録', '食べ物と日付を保存'], ['計算', '前回からの日数を表示'], ['設定', '個人の目安周期を決める'], ['判断', '今また食べるかを選ぶ'], ['更新', '食後に日付を更新'], ['蓄積', '個人の周期ができる']],
    resultKicker: 'Outcome',
    resultTitle: '概念調査から、実際に使える公開済みWeChatミニプログラムへ',
    resultCopy: '現在の版は、食事記録、前回からの日数、個人の周期設定、周期の確認、再記録をカバーする。',
    result: [['主要フロー', '食事記録、日付更新、周期設定、周期一覧、再記録。'], ['個人のリズム', '食べ物ごとに目安周期を設定し、変更や見送りを本人が選べる。'], ['実装', 'AI開発ツールを使ってWeChatミニプログラムを制作し、主要フローを操作できるようにした。']],
    nextTitle: '次の検証',
    next: ['5〜8名で初回記録、古い味の検索、再会カード処理を検証する。', '7日間の実使用で初回記録、再訪、再食行動を観察する。'],
    closing: '前回からの日数と個人の周期を並べ、今日もう一度食べたいかを本人が判断しやすくする。',
    otherWorks: '他の作品を見る',
  },
}

export default function TasteAgainCasePage() {
  const { language } = useLanguage()
  const t = copy[language]
  const work = portfolioWorks[language].find((item) => item.id === 'taste-again')
  const storyMedia = [
    { image: '/works/haojiu-meichi/ui/curry.jpg', position: 'center' },
    { image: '/works/haojiu-meichi/ui/home.jpg', position: 'center 38%' },
    { image: '/works/haojiu-meichi/ui/reminders.jpg', position: 'center 30%' },
    { image: '/works/haojiu-meichi/ui/record.jpg', position: 'center 34%' },
    { image: '/works/haojiu-meichi/ui/memories.jpg', position: 'center 28%' },
    { image: '/works/haojiu-meichi/ui/curry.jpg', position: 'center' },
  ]

  if (!work) return null

  return (
    <main>
      <section className="border-b border-[#f7b718]/30 bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
          <Link href="/works" className="text-sm text-neutral-300 no-underline hover:text-[#f7b718]">← {t.back}</Link>
          <div className="mt-9 grid gap-9 md:grid-cols-[0.76fr_1.24fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f7b718]">{t.eyebrow}</p>
              <h1 className="mt-4 text-5xl font-semibold leading-none md:text-7xl">{work.title}</h1>
              <p className="mt-6 text-xl leading-8 text-neutral-200">{t.summary}</p>
              <p className="mt-5 text-sm leading-7 text-neutral-400">{work.role}</p>
            </div>
            <figure className="relative aspect-[3/2] overflow-hidden rounded-lg border border-[#f7b718]/35 bg-[#131313]">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#f7b718]" />
              <img src="/works/haojiu-meichi/ui/record.jpg" alt="" className="absolute -bottom-[20%] left-[6%] w-[28%] -rotate-6 border border-white/15 shadow-2xl" />
              <img src="/works/haojiu-meichi/ui/home.jpg" alt={work.title} className="absolute -bottom-[10%] left-1/2 z-10 w-[34%] -translate-x-1/2 border border-white/15 shadow-2xl" />
              <img src="/works/haojiu-meichi/ui/memories.jpg" alt="" className="absolute -bottom-[20%] right-[6%] w-[28%] rotate-6 border border-white/15 shadow-2xl" />
            </figure>
          </div>
        </div>
      </section>

      <nav aria-label="Case study sections" className="sticky top-[112px] z-40 overflow-x-auto border-b border-[#f7b718]/25 bg-[#fffaf0]/95 backdrop-blur sm:top-[65px] dark:bg-neutral-950/95">
        <div className="mx-auto flex max-w-6xl min-w-max gap-6 px-5 py-3 text-sm md:px-8">
          {t.nav.map(([label, href]) => <a key={href} href={href} className="font-medium text-neutral-600 no-underline hover:text-[#b57900] dark:text-neutral-300 dark:hover:text-[#f7b718]">{label}</a>)}
        </div>
      </nav>

      <section id="problem" className="scroll-mt-28 mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 md:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b57900] dark:text-[#f7b718]">{t.problemKicker}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{t.problemTitle}</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-neutral-600 dark:text-neutral-300">{t.problemCopy}</p>
            <p className="mt-6 border-l-4 border-[#f7b718] pl-5 text-xl font-semibold leading-8">{t.insight}</p>
          </div>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-[#f7b718]/30 bg-[#f7b718]/30 sm:grid-cols-2 lg:grid-cols-4">
          {t.stats.map(([value, label]) => (
            <div key={label} className="bg-white p-5 dark:bg-neutral-950">
              <p className="text-3xl font-semibold text-[#b57900] dark:text-[#f7b718]">{value}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-neutral-500">{t.limit}</p>
      </section>

      <section id="story" className="scroll-mt-28 border-y border-[#f7b718]/25 bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <div className="grid gap-7 md:grid-cols-[0.7fr_1.3fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f7b718]">{t.storyKicker}</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">{t.storyTitle}</h2>
            </div>
            <p className="text-lg leading-8 text-neutral-300">{t.storyCopy}</p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
            {t.storyPanels.map(([title, description], index) => (
              <figure key={title} className="bg-neutral-950">
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                  <img
                    src={storyMedia[index].image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90"
                    style={{ objectPosition: storyMedia[index].position }}
                  />
                  <span className="absolute left-4 top-4 text-5xl font-semibold leading-none text-[#f7b718] drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]">0{index + 1}</span>
                </div>
                <figcaption className="min-h-40 p-5">
                  <h3 className="text-sm font-semibold text-[#f7b718]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-300">{description}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="ui" className="scroll-mt-28 mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b57900] dark:text-[#f7b718]">{t.uiKicker}</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-5xl">{t.uiTitle}</h2>
          <p className="mt-5 text-lg leading-8 text-neutral-600 dark:text-neutral-300">{t.uiCopy}</p>
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-14 lg:grid-cols-3">
          {t.uiPoints.map((point, index) => (
            <article key={point.title} className="flex flex-col">
              <figure className="mx-auto w-[min(82vw,278px)] overflow-hidden border border-neutral-300 bg-[#fbf7ef] shadow-[0_24px_60px_rgba(0,0,0,0.12)] dark:border-neutral-700">
                <img src={point.image} alt={point.alt} loading="lazy" className="block h-auto w-full" />
              </figure>
              <p className="mt-6 text-xs font-semibold text-[#b57900] dark:text-[#f7b718]">UI 0{index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold leading-snug">{point.title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">{point.copy}</p>
              <p className="mt-4 border-l-2 border-[#f7b718] pl-4 text-sm font-medium leading-6 text-neutral-800 dark:text-neutral-200">{point.attraction}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#f7b718]/25 bg-[#fff4cf]/45 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b57900] dark:text-[#f7b718]">{t.decisionsKicker}</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-5xl">{t.decisionsTitle}</h2>
          <div className="mt-9 grid gap-8 md:grid-cols-3">
            {t.decisions.map(([title, description, driver], index) => (
              <article key={title} className="border-t-2 border-[#f7b718] pt-5">
                <span className="text-xs font-semibold text-[#b57900] dark:text-[#f7b718]">0{index + 1}</span>
                <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
                <p className="mt-5 text-sm font-semibold">{driver}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="loop" className="scroll-mt-28 bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f7b718]">{t.loopKicker}</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">{t.loopTitle}</h2>
            </div>
            <p className="text-lg leading-8 text-neutral-300">{t.loopCopy}</p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {t.loop.map(([title, description], index) => (
              <div key={title} className="relative rounded-lg border border-white/[0.14] p-4">
                <span className="text-xs font-semibold text-[#f7b718]">0{index + 1}</span>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-neutral-400">{description}</p>
                {index < t.loop.length - 1 ? <span aria-hidden="true" className="absolute -right-2 top-1/2 z-10 hidden size-4 -translate-y-1/2 rotate-45 border-r border-t border-[#f7b718] bg-neutral-950 lg:block" /> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="result" className="scroll-mt-28 mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-9 md:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b57900] dark:text-[#f7b718]">{t.resultKicker}</p>
            <h2 className="mt-4 text-3xl font-semibold md:text-5xl">{t.resultTitle}</h2>
            <p className="mt-5 leading-8 text-neutral-600 dark:text-neutral-300">{t.resultCopy}</p>
          </div>
          <div className="grid gap-3">
            {t.result.map(([title, description], index) => (
              <div key={title} className="grid gap-3 border-t border-[#f7b718]/45 py-5 md:grid-cols-[4rem_9rem_1fr]">
                <span className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">0{index + 1}</span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
              </div>
            ))}
            <div className="mt-3 border-l-4 border-[#f7b718] bg-[#fff4cf]/55 p-5 dark:bg-[#f7b718]/10">
              <h3 className="font-semibold">{t.nextTitle}</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
                {t.next.map((item) => <li key={item}>→ {item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#f7b718]/25 bg-white dark:bg-neutral-900/40">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center md:px-8 md:py-24">
          <p className="text-2xl font-semibold leading-relaxed md:text-4xl">{t.closing}</p>
          <Link href="/works" className="mt-9 inline-flex rounded-md bg-[#f7b718] px-5 py-3 text-sm font-semibold text-black no-underline transition hover:bg-[#e1a514]">{t.otherWorks} <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
      </section>
    </main>
  )
}
