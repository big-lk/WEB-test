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
    eyebrow: '工业设计 / HCI / 感性工学',
    title: '孔维鹏',
    role: '关注人与产品、技术之间感性体验的设计研究者。',
    intro: '我通过用户研究、感性评价与原型设计，把模糊的感受转化为可讨论、可验证、可用于设计判断的线索。',
    primary: '查看作品',
    secondary: '研究方向',
    status: '札幌市立大学 · 工业设计',
    heroNote: '设计研究、产品意义与以人为中心的技术体验。',
    exploreTitle: '快速入口',
    exploreText: '可以从不同路径进入内容，不必只依赖顶部导航。',
    valueTitle: '我正在构建什么',
    valueText: '这个网站会逐步成为一个持续更新的研究作品集：不仅展示结果，也记录问题、方法、设计判断、原型迭代和下一步计划。',
    selectedWorks: '作品',
    selectedWorksText: '这里整理了 6 个设计研究项目，覆盖 AI 共创、智能驾驶 HMI、学习支持、AR 旅行摄影、料理记忆与产品服务系统。',
    researchFocus: '研究方向',
    researchText: '我的工作位于设计实践、以人为中心研究、AI 交互、空间体验与产品服务系统之间。',
    about: '关于我',
    aboutText: '目前在札幌学习工业设计，关注感性工学、UI/UX、AI 交互、移动出行 HMI、AR 体验与日常产品系统。',
    contact: '联系',
    previousWork: '上一个作品',
    nextWork: '下一个作品',
    contactText: '欢迎进行作品集交流、设计研究讨论与合作项目沟通。',
    email: 'littlekeen@outlook.com',
    explore: [
      ['作品', '查看项目过程、原型状态和下一步。', '/works'],
      ['研究', '查看研究问题、方法和当前方向。', '/research'],
      ['联系', '作品集交流与合作讨论。', '/#contact'],
    ],
    focus: [
      ['感性工学', '将情绪印象转化为可分析的设计变量。'],
      ['人机交互', '在 AI 支持的体验中保留人的主导权、透明性、信任和学习证据。'],
      ['产品服务系统', '连接实体产品、界面层、时间、位置与日常行为。'],
    ],
    process: [
      ['问题', '如何把模糊的偏好转化为具体、可讨论的设计材料？'],
      ['方法', '结合访谈、场景设计、系统映射、UI 原型和视觉化表达进行验证。'],
      ['产出', '让每个项目都能看见思考过程、迭代依据和下一步计划。'],
    ],
    methods: [
      ['访谈', '我会从用户的表达、停顿和矛盾里找出真正影响体验判断的价值。'],
      ['感性评价', '把“高级”“舒适”“轻盈”等模糊印象转化为可以比较和讨论的设计变量。'],
      ['原型设计', '用早期形态和流程把想法快速落地，让它可以被讨论、测试和修正。'],
      ['UI/UX 设计', '把界面结构和用户目标连接起来，让操作路径更清楚、更有判断依据。'],
      ['数据可视化', '把研究结果转化为可见的模式，帮助设计决策不只停留在感觉上。'],
      ['场景设计', '把产品放回真实使用情境中思考，而不是只看单独功能。'],
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
