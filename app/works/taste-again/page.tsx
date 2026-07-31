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
    eyebrow: '微信小程序 UX 案例',
    summary: '一款不再增加选择，而是从个人记忆中找回曾经喜欢味道的微信小程序。',
    nav: [['问题', '#problem'], ['体验故事', '#story'], ['真实 UI', '#ui'], ['行为闭环', '#loop'], ['结果', '#result']],
    problemKicker: 'Opportunity',
    problemTitle: '人们缺少的不是更多推荐，而是一个能重新想起的入口',
    problemCopy: '选餐平台不断提供新选项，但疲惫时更多内容只会增加判断成本。调研中，味觉怀念非常普遍，真正的断点发生在“想起来了，却没有马上行动”。',
    insight: '设计机会：把“今天吃什么”从浏览陌生选项，改成重新遇见一份与此刻匹配的个人记忆。',
    stats: [['89.47%', '经常或偶尔不知道吃什么'], ['71.93%', '认为选择太多让决定更困难'], ['92.98%', '会周期性想起某种料理或饮料'], ['38.60%', '想起后会很快再次行动']],
    limit: '数据来自 57 人形成性问卷，用于发现问题和决定 MVP 方向，不代表市场规模或长期留存。',
    storyKicker: 'Experience story',
    storyTitle: '一份咖喱饭，如何从过去回到今天',
    storyCopy: '漫画把产品价值放进一个连续生活场景：选择压力被转化为感受表达，一次低负担记录逐渐积累成个人线索，并在新的情境中重新触发行动。',
    storyAlt: '六格漫画：用户从雨夜选餐困惑，到记录咖喱饭，再在之后的雨天重新想起这份味道',
    storyPanels: [
      ['01 · 选择过载', '下班后的雨夜，更多菜单没有带来答案，反而继续消耗精力。'],
      ['02 · 先说感觉', '用户选择“暖一点”，把一个复杂的选餐问题缩小成此刻的身体与情绪需要。'],
      ['03 · 个人唤起', '系统不是推荐陌生热门，而是找回一份过去在雨天吃过的咖喱饭。'],
      ['04 · 低负担记录', '吃完后拍照、写名称、选择感觉；可选信息不会阻塞保存。'],
      ['05 · 看见积累', '这顿饭进入味道时间轴，和过去的照片、地点与感觉连成个人轨迹。'],
      ['06 · 情境再会', '下一次雨天，旧味道带着理由再次出现，推动用户重新行动。'],
    ],
    uiKicker: 'UI attraction',
    uiTitle: '让人愿意开始、愿意留下、也愿意回来',
    uiCopy: '真实界面没有追求复杂仪表盘，而是用少量强识别元素建立吸引力：情绪卡片负责开始，珊瑚红主按钮负责行动，时间轴负责展示积累。',
    uiPoints: [
      {
        title: '把“吃什么”改写为“现在想获得什么感觉”',
        copy: '六张大卡片用图形、颜色和短句降低理解成本。用户不需要先知道菜名，只需要识别自己此刻更想温暖、清爽、满足还是安静。',
        image: '/works/haojiu-meichi/ui/home.jpg',
        alt: '好久没吃小程序首页真实界面',
        attraction: '吸引点：情绪先于菜单，让首页看起来更像自我感知，而不是另一个外卖列表。',
      },
      {
        title: '中央“记录此刻”把核心动作固定在拇指区',
        copy: '珊瑚红按钮与其他青绿色标签形成强对比。照片允许跳过、名称是核心、更多信息后置，减少第一次记录的阻力。',
        image: '/works/haojiu-meichi/ui/record.jpg',
        alt: '好久没吃小程序记录页真实界面',
        attraction: '吸引点：明确的颜色层级与一步可见的主动作，让用户知道下一步该做什么。',
      },
      {
        title: '味道时间轴把零散记录变成“我的故事”',
        copy: '日期、代表色、照片与次数共同呈现。用户看到的不只是数据条目，而是自己已经保存了多少味道、多少次经历。',
        image: '/works/haojiu-meichi/ui/memories.jpg',
        alt: '好久没吃小程序回忆页真实界面',
        attraction: '吸引点：可见的积累提供完成感，也让下一次记录不再像从零开始。',
      },
    ],
    decisionsKicker: 'Design decisions',
    decisionsTitle: '调研最终改变了三个关键设计',
    decisions: [
      ['减少选择', '首页先询问感觉，只展示少量来自个人记录的候选。', '驱动力：降低认知负担'],
      ['降低记录成本', '名称为核心；照片、地点、文字和再会节奏都可以跳过或稍后补充。', '驱动力：让第一次成功更容易发生'],
      ['用柔性再会替代到期提醒', '展示多久没吃和出现理由，由用户决定今天再吃、晚点再看或调整节奏。', '驱动力：保留自主感，减少被催促感'],
    ],
    loopKicker: 'Behavior loop',
    loopTitle: '一次记录如何带来下一次行动',
    loopCopy: '产品的增长不是依赖公开社交或连续打卡，而是让每次使用都增加下一次推荐的个人意义。',
    loop: [['感受', '把模糊需求说清楚'], ['唤起', '出现一份有来历的候选'], ['行动', '再次品尝或选择稍后'], ['记录', '用最少信息留下此刻'], ['积累', '时间轴变得更完整'], ['再会', '时间与情境重新触发']],
    resultKicker: 'Outcome',
    resultTitle: '从概念板推进到可运行的私人味道记忆 MVP',
    resultCopy: '当前版本已经覆盖从首次理解、记录、查找回忆到再次品尝的完整体验，并把隐私控制放在核心流程内，而不是作为上线后的补充。',
    result: [['完整体验', '首次教程、首页、记录、回忆、再会、详情、个人偏好与隐私说明。'], ['私人数据', '个人记录与偏好相互隔离，照片、地点和文字默认不公开，并支持删除与导出。'], ['可解释推荐', '依据时间距离、喜欢程度、感觉与情境排序，同时向用户说明为什么此刻出现。']],
    nextTitle: '下一步验证',
    next: ['用 5–8 人任务测试验证首次记录、查找旧味道与处理再会卡片是否无需解释。', '进行 7 天真实使用测试，观察首条记录完成率、回访与再次品尝行为。'],
    closing: '“好久没吃”不替用户决定吃什么。它把曾经喜欢过的味道保存下来，在合适的时候提供一个有理由、可拒绝、也可以继续书写的提醒。',
    otherWorks: '查看其他作品',
  },
  en: {
    back: 'Back to works',
    eyebrow: 'WeChat mini program UX case',
    summary: 'A private food-memory tool that reduces choices by bringing back something the user already loved.',
    nav: [['Problem', '#problem'], ['Story', '#story'], ['Real UI', '#ui'], ['Behavior loop', '#loop'], ['Outcome', '#result']],
    problemKicker: 'Opportunity',
    problemTitle: 'People did not need more recommendations. They needed a way to remember.',
    problemCopy: 'More menu content often adds decision cost when people are tired. Flavor nostalgia was common; the real break happened between remembering something and acting on it.',
    insight: 'Opportunity: turn “what should I eat?” from browsing unfamiliar options into meeting a personal memory that fits the moment.',
    stats: [['89.47%', 'Often or sometimes cannot decide what to eat'], ['71.93%', 'Say too many choices make deciding harder'], ['92.98%', 'Periodically miss a dish or drink'], ['38.60%', 'Act soon after remembering it']],
    limit: 'A 57-person formative survey guided the problem and MVP direction; it is not evidence of market size or long-term retention.',
    storyKicker: 'Experience story',
    storyTitle: 'How one curry meal returns from the past',
    storyCopy: 'The comic places the value inside everyday life: overload becomes emotional expression, a lightweight record becomes a personal cue, and context later brings it back.',
    storyAlt: 'Six-panel comic showing a user moving from rainy-night meal fatigue to recording curry and rediscovering it later',
    storyPanels: [['01 · Overload', 'A rainy commute and endless menus consume more energy without producing an answer.'], ['02 · Name the feeling', 'Choosing “something warm” reduces a complex decision to a current emotional need.'], ['03 · Personal recall', 'The app returns a curry memory from another rainy day—not a generic trending item.'], ['04 · Lightweight record', 'Photo, name, and feeling are enough; optional fields never block saving.'], ['05 · Visible accumulation', 'The meal joins a timeline of photos, places, colors, and feelings.'], ['06 · Contextual return', 'On another rainy evening, the memory returns with a reason and prompts new action.']],
    uiKicker: 'UI attraction',
    uiTitle: 'Designed to make people start, save, and return',
    uiCopy: 'The interface uses a few memorable elements: feeling cards start the journey, the coral action drives recording, and the timeline makes progress visible.',
    uiPoints: [
      { title: 'Reframe food choice as a feeling choice', copy: 'Six illustrated cards help users identify warmth, freshness, satisfaction, quiet, liveliness, or novelty before naming food.', image: '/works/haojiu-meichi/ui/home.jpg', alt: 'Real home screen', attraction: 'Attraction: self-awareness instead of another delivery list.' },
      { title: 'Keep “record now” in the thumb zone', copy: 'Coral contrast makes the action unmistakable. Photo is optional, name is core, and more detail stays secondary.', image: '/works/haojiu-meichi/ui/record.jpg', alt: 'Real recording screen', attraction: 'Attraction: strong hierarchy and one obvious next action.' },
      { title: 'Turn scattered records into my story', copy: 'Dates, colors, photos, and counts make personal accumulation visible rather than presenting a database.', image: '/works/haojiu-meichi/ui/memories.jpg', alt: 'Real memory timeline screen', attraction: 'Attraction: progress gives satisfaction and makes the next record meaningful.' },
    ],
    decisionsKicker: 'Design decisions',
    decisionsTitle: 'Research changed three core decisions',
    decisions: [['Reduce choice', 'Ask for a feeling first and show only a few personal candidates.', 'Driver: lower cognitive load'], ['Reduce recording cost', 'Name is core; photo, place, note, and return rhythm remain optional.', 'Driver: make first success easy'], ['Use flexible reunions', 'Show elapsed time and a reason, then let the user act, postpone, or adjust.', 'Driver: preserve autonomy']],
    loopKicker: 'Behavior loop',
    loopTitle: 'How one record creates the next action',
    loopCopy: 'The loop does not depend on public social sharing or rigid streaks. Every use increases the personal meaning of the next suggestion.',
    loop: [['Feel', 'Clarify a vague need'], ['Recall', 'Surface a meaningful candidate'], ['Act', 'Taste again or postpone'], ['Record', 'Save with minimal input'], ['Accumulate', 'Make the timeline richer'], ['Return', 'Let context trigger the memory']],
    resultKicker: 'Outcome',
    resultTitle: 'From concept board to a working private food-memory MVP',
    resultCopy: 'The current version covers onboarding, recording, memory retrieval, and reunion while treating privacy as part of the main experience.',
    result: [['Complete experience', 'Onboarding, home, record, memories, reunion, detail, preferences, and privacy.'], ['Private data', 'Isolated personal records, private-by-default photos and text, delete and export controls.'], ['Explainable suggestions', 'Rank by elapsed time, liking, feeling, and context, then show why the item appears.']],
    nextTitle: 'Next validation',
    next: ['Test first recording, finding an old flavor, and handling a reunion card with 5–8 participants.', 'Run a seven-day field test to observe first-record completion, return, and repeat tasting.'],
    closing: 'The product does not decide what people should eat. It preserves what they once loved and returns it as a reasoned, dismissible memory that can keep growing.',
    otherWorks: 'View other works',
  },
  ja: {
    back: '作品一覧へ戻る',
    eyebrow: 'WeChatミニプログラム UXケース',
    summary: '選択肢を増やさず、過去に好きだった味を個人の記憶から戻すミニプログラム。',
    nav: [['課題', '#problem'], ['体験物語', '#story'], ['実UI', '#ui'], ['行動ループ', '#loop'], ['成果', '#result']],
    problemKicker: 'Opportunity',
    problemTitle: '必要なのは推薦の追加ではなく、思い出すための入口だった',
    problemCopy: '疲れている時、メニューが増えるほど判断コストも増える。味を懐かしむ経験は多いが、思い出しても行動しない断点がある。',
    insight: '機会：「何を食べるか」を未知の候補探しから、今に合う個人の記憶との再会へ変える。',
    stats: [['89.47%', '食事選びに迷うことがある'], ['71.93%', '選択肢の多さが決定を難しくする'], ['92.98%', '料理や飲料を周期的に懐かしむ'], ['38.60%', '思い出した後すぐ行動する']],
    limit: '57名の形成的調査は課題とMVP方針の判断に使用し、市場規模や長期継続を示すものではない。',
    storyKicker: 'Experience story',
    storyTitle: '一皿のカレーが、過去から今日へ戻るまで',
    storyCopy: '選択疲れを感情表現へ変え、軽い記録を個人の手がかりとして蓄積し、新しい状況で再び行動を起こす物語。',
    storyAlt: '雨の夜の選択疲れからカレーを記録し、後日もう一度思い出すまでの6コマ漫画',
    storyPanels: [['01 · 選択過多', '雨の帰宅時、メニューを見続けても答えは出ず、疲労だけが増える。'], ['02 · 気分から始める', '「温かいもの」を選び、複雑な選択を今の感覚へ縮める。'], ['03 · 個人の想起', '流行ではなく、以前の雨の日に食べたカレーが戻る。'], ['04 · 軽い記録', '写真、名前、気分だけで保存でき、任意項目は妨げない。'], ['05 · 蓄積を見る', '料理が写真、場所、色、気分の時間軸へ加わる。'], ['06 · 状況で再会', '次の雨の日に理由とともに戻り、新しい行動を促す。']],
    uiKicker: 'UI attraction',
    uiTitle: '始めたくなる、残したくなる、戻りたくなるUI',
    uiCopy: '気分カードが開始を、コーラル色の主操作が記録を、時間軸が蓄積の実感を担う。',
    uiPoints: [
      { title: '「何を食べる」より「今どんな感覚がほしい」', copy: '6枚の絵付きカードで、料理名を考える前に温かさ、爽やかさ、満足、静けさなどを選ぶ。', image: '/works/haojiu-meichi/ui/home.jpg', alt: '実際のホーム画面', attraction: '魅力：外食リストではなく自己理解から始まる。' },
      { title: '中央の「今を記録」を親指の位置へ', copy: 'コーラル色で主操作を明確にし、写真は省略可能、名前を中心に詳細を後置する。', image: '/works/haojiu-meichi/ui/record.jpg', alt: '実際の記録画面', attraction: '魅力：次に何をすべきかが一目で分かる。' },
      { title: '味の時間軸で「自分の物語」にする', copy: '日付、色、写真、回数で蓄積を見せ、単なるデータ一覧にしない。', image: '/works/haojiu-meichi/ui/memories.jpg', alt: '実際の記憶時間軸', attraction: '魅力：進捗の実感が次の記録の意味を作る。' },
    ],
    decisionsKicker: 'Design decisions',
    decisionsTitle: '調査が変えた3つの設計',
    decisions: [['選択を減らす', '最初に気分を聞き、個人記録から少数候補だけを示す。', '動機：認知負荷を下げる'], ['記録コストを下げる', '名前を中心に、写真、場所、文章、周期は任意にする。', '動機：最初の成功を容易にする'], ['柔らかな再会', '時間と理由を示し、再食、延期、調整を本人が選ぶ。', '動機：主体性を保つ']],
    loopKicker: 'Behavior loop',
    loopTitle: '一回の記録が次の行動を生む',
    loopCopy: '公開SNSや厳格な連続記録ではなく、使うほど次の提案が個人的になるループ。',
    loop: [['感覚', '曖昧な欲求を明確化'], ['想起', '意味のある候補を戻す'], ['行動', '再び味わう／後にする'], ['記録', '最小入力で残す'], ['蓄積', '時間軸を豊かにする'], ['再会', '状況が再び記憶を起動']],
    resultKicker: 'Outcome',
    resultTitle: '構想ボードから実動する個人味覚記憶MVPへ',
    resultCopy: '初回理解、記録、記憶検索、再会までを一つの体験にし、プライバシーを中核に含めた。',
    result: [['一貫した体験', '導入、ホーム、記録、回想、再会、詳細、好み、プライバシー。'], ['個人データ', '記録を分離し、写真と文章は非公開既定、削除と書き出しを提供。'], ['説明可能な提案', '時間、好み、気分、状況で順位づけし、出現理由を示す。']],
    nextTitle: '次の検証',
    next: ['5〜8名で初回記録、古い味の検索、再会カード処理を検証する。', '7日間の実使用で初回記録、再訪、再食行動を観察する。'],
    closing: '食べるものを代わりに決めるのではない。好きだった味を残し、理由があり、拒否でき、続けられる記憶として戻す。',
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

      <nav aria-label="Case study sections" className="overflow-x-auto border-b border-[#f7b718]/25 bg-[#fffaf0] dark:bg-neutral-950">
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
