'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type WheelEvent } from 'react'
import { useLanguage } from '../components/language-context'
import { portfolioWorks } from '../lib/portfolio-data'

const copy = {
  en: {
    eyebrow: 'Industrial Design / HCI / Kansei Engineering',
    title: 'KONG WEIPENG',
    role: 'Research-driven industrial designer exploring sensory experience between people, products, and technology.',
    intro: 'I turn subtle feelings into design knowledge through user research, Kansei evaluation, prototyping, and interface design.',
    primary: 'View Works',
    secondary: 'Research Focus',
    status: 'Sapporo City University · Industrial Design',
    heroNote: 'Design research, product meaning, and human-centered technology.',
    exploreTitle: 'Explore',
    exploreText: 'Choose the entry point that matches what you want to inspect first.',
    valueTitle: 'What I Am Building',
    valueText: 'This portfolio is becoming a living record of research questions, design decisions, prototypes, and reflections rather than a static gallery.',
    selectedWorks: 'Selected Work',
    selectedWorksText: 'Six design studies across AI co-creation, mobility HMI, learning support, AR travel photography, food memory, and product-service systems.',
    researchFocus: 'Research Focus',
    researchText: 'My work sits between design practice, human-centered research, AI interaction, spatial experience, and product-service systems.',
    about: 'About',
    aboutText: 'Based in Sapporo, I study industrial design through Kansei Engineering, UI/UX, AI interaction, mobility HMI, AR experience, and everyday product systems.',
    contact: 'Contact',
    previousWork: 'Previous work',
    nextWork: 'Next work',
    contactText: 'Available for portfolio review, design research conversations, and collaborative projects.',
    email: 'littlekeen@outlook.com',
    explore: [
      ['Works', 'Project process, prototype status, and next steps.', '/works'],
      ['Research', 'Questions, methods, and current research direction.', '/research'],
      ['Contact', 'Portfolio review and collaboration discussion.', '/#contact'],
    ],
    focus: [
      ['Kansei Engineering', 'Translating emotional impressions into design variables.'],
      ['Human-AI Interaction', 'Preserving agency, transparency, trust, and learning evidence in AI-supported experiences.'],
      ['Product-Service Systems', 'Connecting physical products, interface layers, timing, location, and everyday behavior.'],
    ],
    process: [
      ['Question', 'How can vague preferences become concrete design material?'],
      ['Method', 'Combine interviews, scenario design, system mapping, interface prototypes, and visual storytelling.'],
      ['Output', 'Show reasoning, iteration, and next steps behind each project.'],
    ],
    methods: [
      ['Interview', 'I use interviews to catch the words, pauses, and contradictions that reveal what people actually value.'],
      ['Kansei Evaluation', 'I translate emotional impressions into comparable design variables instead of leaving them as vague adjectives.'],
      ['Prototyping', 'I make early forms and flows quickly so ideas can be discussed, tested, and corrected.'],
      ['UI/UX Design', 'I connect interface structure with user goals, so the screen supports a clear decision path.'],
      ['Data Visualization', 'I turn research findings into visible patterns that can guide design choices.'],
      ['Scenario Design', 'I write use situations to keep products connected to real moments, not isolated features.'],
    ],
  },
  ja: {
    eyebrow: 'インダストリアルデザイン / HCI / 感性工学',
    title: '孔 維鵬',
    role: '人・プロダクト・テクノロジーのあいだにある感性的な体験を探究するデザインリサーチャー。',
    intro: 'ユーザー調査、感性評価、プロトタイピングを通して、曖昧な感覚をデザイン判断へつなげる方法を研究しています。',
    primary: '作品を見る',
    secondary: '研究を見る',
    status: '札幌市立大学 · インダストリアルデザイン',
    heroNote: 'デザインリサーチ、プロダクトの意味、人間中心のテクノロジー。',
    exploreTitle: '見る入口',
    exploreText: '最初に見たい内容に合わせて入口を選べます。',
    valueTitle: 'このサイトで構築しているもの',
    valueText: 'このポートフォリオは、研究課題、デザイン判断、プロトタイプ、振り返りを継続的に記録する場として育てています。',
    selectedWorks: '作品',
    selectedWorksText: 'AI共創、モビリティHMI、学習支援、AR旅行写真、食の記憶、プロダクトサービスシステムを横断する6つのデザインスタディです。',
    researchFocus: '研究の焦点',
    researchText: 'デザイン実践、人間中心研究、AIインタラクション、空間体験、プロダクトサービスシステムを横断しています。',
    about: 'プロフィール',
    aboutText: '札幌を拠点に、感性工学、UI/UX、AIインタラクション、モビリティHMI、AR体験、日常のプロダクトシステムを通してインダストリアルデザインを学んでいます。',
    contact: '連絡',
    previousWork: '前の作品',
    nextWork: '次の作品',
    contactText: 'ポートフォリオレビュー、デザインリサーチ、共同プロジェクトの相談を歓迎します。',
    email: 'littlekeen@outlook.com',
    explore: [
      ['作品', 'プロセス、プロトタイプの状態、次のステップ。', '/works'],
      ['研究', '問い、方法、現在の研究方向。', '/research'],
      ['連絡', 'ポートフォリオレビューや共同研究の相談。', '/#contact'],
    ],
    focus: [
      ['感性工学', '感情的な印象をデザイン要素へ翻訳する。'],
      ['人とAIのインタラクション', '主体性、透明性、信頼、学習の証拠を残すAI体験を考える。'],
      ['プロダクトサービスシステム', '物理プロダクト、UI、時間、場所、日常行動を結びつける。'],
    ],
    process: [
      ['問い', '曖昧な好みを、どのように具体的なデザイン材料へ変換できるか。'],
      ['方法', 'インタビュー、シナリオ設計、システムマッピング、UIプロトタイプ、ビジュアル表現を組み合わせる。'],
      ['成果', 'プロジェクトごとの思考、反復、次の課題が見えるポートフォリオを構築する。'],
    ],
    methods: [
      ['インタビュー', '発言だけでなく、迷い、沈黙、矛盾からユーザーが本当に重視している価値を読み取ります。'],
      ['感性評価', '曖昧な形容詞として残さず、感情的な印象を比較できるデザイン変数へ翻訳します。'],
      ['プロトタイピング', '早い段階で形や流れを作り、議論、検証、修正ができる状態にします。'],
      ['UI/UXデザイン', '画面構成をユーザーの目的と結びつけ、判断しやすい体験へ整理します。'],
      ['データ可視化', '調査結果を見えるパターンへ変換し、デザイン判断の根拠にします。'],
      ['シナリオ設計', '製品を機能単体ではなく、実際の利用場面と結びつけて考えます。'],
    ],
  },
  zh: {
    eyebrow: '感性工学产品设计 / HCI',
    title: '孔维鹏',
    role: '我用感性工学和产品设计研究具体场景里的判断、注意和记忆。',
    intro: '我通常从一个很小的卡点开始：用户为什么犹豫、分心、忘记、没把握，或者不想完全交给系统。然后再把这个卡点做成界面、原型和可以比较的任务。',
    primary: '看作品',
    secondary: '看问题',
    status: '札幌市立大学 · 人间情报设计',
    heroNote: '先把问题说清楚，再决定界面应该提示、记录、解释，还是让用户自己判断。',
    exploreTitle: '从哪里看都可以',
    exploreText: '作品、研究和简历不是三份材料，而是同一条思考线的不同入口。',
    valueTitle: '我的项目怎么读',
    valueText: '我不想只展示最终画面。每个项目都先交代一个具体使用断点，再说明我为什么这样组织界面，最后标出目前已经做到的部分和还需要验证的部分。',
    selectedWorks: '六个问题',
    selectedWorksText: '这 6 个问题分别落在 AI 分担、智驾注意力、日语试读、跨时间摄影、“好久没吃”微信小程序和冰箱日期提示里。',
    researchFocus: '我的问题意识',
    researchText: '感性工学对我来说不是把界面形容得更感性，而是把“有把握、想继续、该自己决定”这类话拆成可以比较的界面差异。',
    about: '我从哪里来',
    aboutText: '目前在札幌学习人间情报设计。我的项目从人-AI 分担、智驾注意力、日语试读、跨时间摄影、“好久没吃”微信小程序到冰箱日期提示，表面不一样，核心都在处理人和系统之间的分担关系。',
    contact: '聊一聊',
    previousWork: '上一个作品',
    nextWork: '下一个作品',
    contactText: '如果你也关心技术如何保留人的判断位置，可以和我聊聊。',
    email: 'littlekeen@outlook.com',
    explore: [
      ['作品', '看每个项目的问题、取舍和边界。', '/works'],
      ['研究', '看我怎么把感受变成设计问题。', '/research'],
      ['联系', '讨论作品、实习或合作。', '/#contact'],
    ],
    focus: [
      ['用户卡点', '先找用户在哪一刻开始犹豫、分心、忘记或没把握。'],
      ['界面取舍', '判断什么时候该提示、解释、记录，什么时候不要继续打扰。'],
      ['验证边界', '把已经观察到的结果和下一步要验证的事分开说清楚。'],
    ],
    process: [
      ['先问人', '这个场景里，用户为什么没有继续行动。'],
      ['再做界面', '把提示、记录、回看和决定权放到合适的位置。'],
      ['最后看行为', '用比较原型、选择任务或眼动追踪，看注意和判断有没有变化。'],
    ],
    methods: [
      ['访谈', '听用户怎么解释自己的犹豫、懒、嘴馋、没自信和想继续。'],
      ['感性评价', '把模糊感受拆成能比较的词，而不是停在“高级”“方便”这种空话。'],
      ['原型设计', '先做能让人判断的界面，不急着把功能堆完整。'],
      ['UI/UX 设计', '界面要告诉用户：现在是系统帮你、陪你想，还是你自己决定。'],
      ['行为观察', '用选择、视线和操作路径看设计有没有真的改变注意力。'],
      ['场景设计', '把产品放回一顿饭、一次练习、一段驾驶、一张旧照片里看。'],
    ],
  },
}

export default function Home() {
  const { language } = useLanguage()
  const t = copy[language]
  const works = portfolioWorks[language]
  const [heroIndex, setHeroIndex] = useState(0)
  const heroWorks = useMemo(() => works, [works])
  const heroWork = heroWorks[heroIndex % heroWorks.length]

  useEffect(() => {
    setHeroIndex(0)
  }, [language])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroWorks.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [heroWorks.length])

  const shiftHero = (direction: -1 | 1) => {
    setHeroIndex((current) => (current + direction + heroWorks.length) % heroWorks.length)
  }

  const handleWorksWheel = (event: WheelEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const isVerticalWheel = Math.abs(event.deltaY) > Math.abs(event.deltaX)
    if (!isVerticalWheel) return

    const canScrollLeft = element.scrollLeft > 0
    const canScrollRight = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    const movingLeft = event.deltaY < 0
    const movingRight = event.deltaY > 0

    if ((movingLeft && canScrollLeft) || (movingRight && canScrollRight)) {
      event.preventDefault()
      element.scrollLeft += event.deltaY
    }
  }

  return (
    <main>
      <section className="border-b border-[#f7b718]/30 bg-[#fffaf0] dark:border-[#f7b718]/25 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
            <h1 className="mt-5 text-5xl font-semibold tracking-normal text-neutral-950 dark:text-white md:text-7xl">{t.title}</h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-700 dark:text-neutral-200">{t.role}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-400">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/works" className="rounded-md bg-[#f7b718] px-5 py-3 text-sm font-semibold text-black no-underline shadow-sm shadow-[#f7b718]/25 transition hover:bg-[#e1a514]">{t.primary}</Link>
              <Link href="/research" className="rounded-md border border-[#f7b718]/65 bg-white/45 px-5 py-3 text-sm font-medium text-neutral-900 no-underline transition hover:border-[#b57900] hover:bg-[#fff4cf] dark:bg-neutral-950 dark:text-neutral-100">{t.secondary}</Link>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-[#f7b718]/45 bg-neutral-950 text-white shadow-xl shadow-[#f7b718]/15 transition hover:border-[#f7b718] dark:border-[#f7b718]/35">
            {heroWork.image ? (
              <img key={heroWork.title} src={heroWork.image} alt={heroWork.title} className="absolute inset-0 size-full animate-[heroFade_4.2s_ease-in-out] object-cover opacity-72" />
            ) : (
              <div key={heroWork.title} className="absolute inset-0 grid animate-[heroFade_4.2s_ease-in-out] place-items-center bg-[#fff4cf] text-black">
                <div className="grid size-36 place-items-center rounded-full border border-[#f7b718]/60 bg-white text-6xl font-semibold text-[#b57900]">
                  +
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/36 to-[#f7b718]/18" />
            <Link href={heroWork.href} aria-label={heroWork.title} className="absolute inset-0 z-10 no-underline" />
            <div className="pointer-events-none absolute left-5 right-5 top-5 z-20 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/78">
              <span>LKD Portfolio</span>
              <span>{heroWork.year}</span>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 p-6 md:p-8">
              <p className="text-sm font-medium text-[#f7b718]">{heroWork.status}</p>
              <p className="mt-3 max-w-md text-2xl font-medium leading-snug">{heroWork.title}</p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/78">{heroWork.description}</p>
              <div className="pointer-events-auto mt-6 flex gap-2">
                {heroWorks.map((work, index) => (
                  <button
                    key={work.href}
                    type="button"
                    aria-label={work.title}
                    onClick={() => setHeroIndex(index)}
                    className={`h-2 rounded-full transition-all ${index === heroIndex ? 'w-10 bg-[#f7b718]' : 'w-4 bg-white/45 hover:bg-white/75'}`}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              aria-label={t.previousWork}
              onClick={() => shiftHero(-1)}
              className="absolute left-4 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-black/35 text-2xl leading-none text-white backdrop-blur transition hover:border-[#f7b718] hover:bg-[#f7b718] hover:text-black"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={t.nextWork}
              onClick={() => shiftHero(1)}
              className="absolute right-4 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-black/35 text-2xl leading-none text-white backdrop-blur transition hover:border-[#f7b718] hover:bg-[#f7b718] hover:text-black"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <section className="border-b border-[#f7b718]/20 bg-white/80 dark:border-[#f7b718]/20 dark:bg-neutral-900/25">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-6 md:grid-cols-[0.7fr_1.3fr] md:items-center md:px-8">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">{t.exploreTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{t.exploreText}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {t.explore.map(([label, description, href]) => (
              <Link key={href} href={href} className="rounded-lg border border-[#f7b718]/35 bg-[#fffaf0] p-4 no-underline transition hover:border-[#b57900] hover:bg-[#fff4cf] dark:border-[#f7b718]/25 dark:bg-neutral-950">
                <span className="font-semibold text-neutral-950 dark:text-white">{label}</span>
                <span className="mt-2 block text-sm leading-6 text-neutral-600 dark:text-neutral-300">{description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#f7b718]/20 bg-white/70 dark:border-[#f7b718]/20 dark:bg-neutral-900/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">{t.valueTitle}</h2>
            <p className="mt-4 leading-8 text-neutral-600 dark:text-neutral-300">{t.valueText}</p>
          </div>
          <div className="grid gap-3">
            {t.process.map(([title, description]) => (
              <div key={title} className="rounded-lg border border-[#f7b718]/28 bg-[#fffaf0] p-4 dark:border-[#f7b718]/25 dark:bg-neutral-950">
                <p className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">{title}</p>
                <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-18">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">{t.selectedWorks}</h2>
            <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">{t.selectedWorksText}</p>
          </div>
          <Link href="/works" className="text-sm font-medium text-[#b57900] no-underline hover:text-neutral-950 dark:text-[#f7b718]">{t.primary}</Link>
        </div>

        <div className="-mx-5 overflow-x-auto px-5 pb-4 md:-mx-8 md:px-8" onWheel={handleWorksWheel}>
          <div className="flex min-w-full snap-x gap-5">
          {works.map((work) => (
            <Link href={work.href} key={work.title} className="flex w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-[#f7b718]/28 bg-white no-underline shadow-sm shadow-[#f7b718]/10 transition hover:-translate-y-1 hover:border-[#b57900] sm:w-[26rem] lg:w-[31rem] dark:border-[#f7b718]/25 dark:bg-neutral-900">
              {work.image ? (
                <img src={work.image} alt={work.title} className="h-64 w-full object-cover" />
              ) : (
                <div className="grid h-64 place-items-center bg-[#fff4cf] px-6 text-center dark:bg-neutral-950">
                  <div>
                    <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full border border-[#f7b718]/55 bg-white text-2xl font-semibold text-[#b57900] dark:border-[#f7b718]/40 dark:bg-white dark:text-black">
                      +
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b57900] dark:text-[#f7b718]">{work.status}</p>
                  </div>
                </div>
              )}
              <div className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
                  <span>{work.type}</span>
                  <span>{work.year}</span>
                </div>
                <p className="mb-3 text-sm font-medium text-[#b57900] dark:text-[#f7b718]">{work.status}</p>
                <h3 className="text-xl font-semibold">{work.title}</h3>
                <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-300">{work.description}</p>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#f7b718]/28 bg-white dark:border-[#f7b718]/25 dark:bg-neutral-900/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[0.85fr_1.15fr] md:px-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">{t.researchFocus}</h2>
            <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-400">{t.researchText}</p>
          </div>
          <div className="grid gap-4">
            {t.focus.map(([title, description], index) => (
              <div key={title} className="grid gap-3 border-t border-[#f7b718]/35 pt-4 md:grid-cols-[7rem_1fr] dark:border-[#f7b718]/25">
                <span className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">0{index + 1}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 leading-7 text-neutral-600 dark:text-neutral-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1fr_1fr] md:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal">{t.about}</h2>
          <p className="mt-4 leading-8 text-neutral-600 dark:text-neutral-300">{t.aboutText}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {t.methods.map(([method, detail]) => (
              <span key={method} tabIndex={0} className="group relative rounded-md border border-[#f7b718]/45 bg-[#fff4cf]/55 px-3 py-2 text-sm text-neutral-800 outline-none transition hover:border-[#b57900] hover:bg-[#fff4cf] focus:border-[#b57900] focus:bg-[#fff4cf] dark:border-[#f7b718]/30 dark:bg-neutral-900 dark:text-neutral-300">
                {method}
                <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-3 hidden w-64 rounded-md border border-[#f7b718]/35 bg-white p-3 text-sm leading-6 text-neutral-700 shadow-xl shadow-[#f7b718]/15 group-hover:block group-focus:block group-focus-within:block dark:border-[#f7b718]/25 dark:bg-neutral-950 dark:text-neutral-200">
                  {detail}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div id="contact" className="rounded-lg border border-[#f7b718]/45 bg-neutral-950 p-6 text-white shadow-xl shadow-[#f7b718]/10 dark:border-[#f7b718]/35">
          <h2 className="text-3xl font-semibold tracking-normal">{t.contact}</h2>
          <p className="mt-4 leading-8 text-neutral-300">{t.contactText}</p>
          <a href={`mailto:${t.email}`} className="mt-8 inline-block text-lg font-medium text-[#f7b718] no-underline hover:text-white">{t.email}</a>
          <p className="mt-4 text-sm text-neutral-400">lkdesigner.top</p>
        </div>
      </section>
    </main>
  )
}
