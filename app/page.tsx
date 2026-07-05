'use client'

import Link from 'next/link'
import { useLanguage } from '../components/language-context'

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
    selectedWorksText: 'A current project connecting product experience, AI-supported creativity, and interface research.',
    researchFocus: 'Research Focus',
    researchText: 'My work sits between design practice and human-centered research.',
    about: 'About',
    aboutText: 'Based in Sapporo, I study industrial design with a focus on Kansei Engineering, UI/UX, and the emotional qualities of product experience.',
    contact: 'Contact',
    contactText: 'Available for portfolio review, design research conversations, and collaborative projects.',
    email: 'littlekeen@outlook.com',
    explore: [
      ['Works', 'Project process, prototype status, and next steps.', '/works'],
      ['Research', 'Questions, methods, and current research direction.', '/research'],
      ['Contact', 'Portfolio review and collaboration discussion.', '/#contact'],
    ],
    works: [
      {
        title: 'AI Cooking Persona',
        type: 'UX research / AI creativity',
        year: '2025',
        status: 'Research prototype in progress',
        description: 'A persona visualization study for supporting cooking creativity through AI-assisted ideation and interface design.',
        image: '/works/ai-cooking-persona-generated.png',
      },
    ],
    focus: [
      ['Kansei Engineering', 'Translating emotional impressions into design variables.'],
      ['Product Experience', 'Connecting user perception, scenarios, and product meaning.'],
      ['AI + Creativity', 'Exploring interfaces that support imagination without replacing authorship.'],
    ],
    process: [
      ['Question', 'How can vague preferences become concrete design material?'],
      ['Method', 'Combine interviews, persona visualization, scenario design, and UI prototypes.'],
      ['Output', 'Show reasoning, iteration, and next steps behind each project.'],
    ],
    methods: ['Interview', 'Kansei Evaluation', 'Prototyping', 'UI/UX Design', 'Data Visualization', 'Scenario Design'],
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
    exploreTitle: 'Explore',
    exploreText: '最初に見たい内容に合わせて入口を選べます。',
    valueTitle: 'What I Am Building',
    valueText: 'このポートフォリオは、研究課題、デザイン判断、プロトタイプ、振り返りを継続的に記録する場として育てています。',
    selectedWorks: 'Selected Work',
    selectedWorksText: 'プロダクト体験、AIによる創造支援、インターフェース研究を結びつけるプロジェクトです。',
    researchFocus: 'Research Focus',
    researchText: '実践としてのデザインと、人間中心の研究を横断しています。',
    about: 'About',
    aboutText: '札幌を拠点に、感性工学、UI/UX、プロダクト体験の情緒的価値を中心にインダストリアルデザインを学んでいます。',
    contact: 'Contact',
    contactText: 'ポートフォリオレビュー、デザインリサーチ、共同プロジェクトの相談を歓迎します。',
    email: 'littlekeen@outlook.com',
    explore: [
      ['作品', 'プロセス、プロトタイプの状態、次のステップ。', '/works'],
      ['研究', '問い、方法、現在の研究方向。', '/research'],
      ['連絡', 'ポートフォリオレビューや共同研究の相談。', '/#contact'],
    ],
    works: [
      {
        title: 'AI Cooking Persona',
        type: 'UXリサーチ / AI創造支援',
        year: '2025',
        status: '研究プロトタイプ制作中',
        description: 'AIを用いた料理アイデア発想を支援するためのペルソナ可視化とインターフェースデザインの研究。',
        image: '/works/ai-cooking-persona-generated.png',
      },
    ],
    focus: [
      ['感性工学', '感情的な印象をデザイン要素へ翻訳する。'],
      ['プロダクト体験', 'ユーザーの知覚、シナリオ、プロダクトの意味を結びつける。'],
      ['AI + Creativity', '人の創造性を置き換えず、拡張するインターフェースを探る。'],
    ],
    process: [
      ['Question', '曖昧な好みを、どのように具体的なデザイン材料へ変換できるか。'],
      ['Method', 'インタビュー、ペルソナ可視化、シナリオ設計、UIプロトタイプを組み合わせる。'],
      ['Output', 'プロジェクトごとの思考、反復、次の課題が見えるポートフォリオを構築する。'],
    ],
    methods: ['インタビュー', '感性評価', 'プロトタイピング', 'UI/UXデザイン', 'データ可視化', 'シナリオ設計'],
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
    selectedWorks: 'Selected Work',
    selectedWorksText: '当前项目聚焦产品体验、AI 创意支持与界面研究之间的连接。',
    researchFocus: 'Research Focus',
    researchText: '我的工作位于设计实践与以人为中心研究之间。',
    about: 'About',
    aboutText: '目前在札幌学习工业设计，关注感性工学、UI/UX 与产品体验中的情绪价值。',
    contact: 'Contact',
    contactText: '欢迎进行作品集交流、设计研究讨论与合作项目沟通。',
    email: 'littlekeen@outlook.com',
    explore: [
      ['作品', '查看项目过程、原型状态和下一步。', '/works'],
      ['研究', '查看研究问题、方法和当前方向。', '/research'],
      ['联系', '作品集交流与合作讨论。', '/#contact'],
    ],
    works: [
      {
        title: 'AI Cooking Persona',
        type: 'UX 研究 / AI 创意支持',
        year: '2025',
        status: '研究原型正在推进',
        description: '通过 AI 辅助的用户画像可视化，探索如何支持料理创意生成与界面设计。',
        image: '/works/ai-cooking-persona-generated.png',
      },
    ],
    focus: [
      ['感性工学', '将情绪印象转化为可分析的设计变量。'],
      ['产品体验', '连接用户感知、使用场景与产品意义。'],
      ['AI + Creativity', '探索支持想象力、而不是替代创作者的界面。'],
    ],
    process: [
      ['问题', '如何把模糊的偏好转化为具体、可讨论的设计材料？'],
      ['方法', '结合访谈、用户画像可视化、场景设计和 UI 原型进行验证。'],
      ['产出', '让每个项目都能看见思考过程、迭代依据和下一步计划。'],
    ],
    methods: ['访谈', '感性评价', '原型设计', 'UI/UX 设计', '数据可视化', '场景设计'],
  },
}

export default function Home() {
  const { language } = useLanguage()
  const t = copy[language]

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

          <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-[#f7b718]/45 bg-neutral-950 text-white shadow-xl shadow-[#f7b718]/15 dark:border-[#f7b718]/35">
            <img src="/works/ai-cooking-persona-generated.png" alt="AI cooking persona project" className="absolute inset-0 size-full object-cover opacity-72" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/36 to-[#f7b718]/18" />
            <div className="absolute left-5 right-5 top-5 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/78">
              <span>LKD Portfolio</span>
              <span>2026</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-sm font-medium text-[#f7b718]">{t.status}</p>
              <p className="mt-3 max-w-md text-2xl font-medium leading-snug">{t.heroNote}</p>
            </div>
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

        <div className="grid gap-6 md:grid-cols-2">
          {t.works.map((work) => (
            <article key={work.title} className="overflow-hidden rounded-lg border border-[#f7b718]/28 bg-white dark:border-[#f7b718]/25 dark:bg-neutral-900">
              <img src={work.image} alt={work.title} className="h-64 w-full object-cover" />
              <div className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
                  <span>{work.type}</span>
                  <span>{work.year}</span>
                </div>
                <p className="mb-3 text-sm font-medium text-[#b57900] dark:text-[#f7b718]">{work.status}</p>
                <h3 className="text-xl font-semibold">{work.title}</h3>
                <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-300">{work.description}</p>
              </div>
            </article>
          ))}
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
            {t.methods.map((method) => (
              <span key={method} className="rounded-md border border-[#f7b718]/45 bg-[#fff4cf]/55 px-3 py-2 text-sm text-neutral-800 dark:border-[#f7b718]/30 dark:bg-neutral-900 dark:text-neutral-300">{method}</span>
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
