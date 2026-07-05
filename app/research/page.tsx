'use client'

import { useLanguage } from '../../components/language-context'

const copy = {
  en: {
    eyebrow: 'Research',
    title: 'Kansei Engineering, HCI, and Product Experience',
    intro: 'My research explores how people form emotional impressions of products and interfaces, and how these impressions can become practical design knowledge.',
    questionsTitle: 'Research Questions',
    interestsTitle: 'Research Interests',
    methodsTitle: 'Methods',
    currentTitle: 'Current Work',
    publicationsTitle: 'Publications / Presentations',
    questions: ['How can emotional impressions become design variables?', 'How can AI interfaces support human imagination without flattening personal preference?', 'How can product experience research support both concept design and interface prototyping?'],
    interests: [['Kansei Evaluation', 'Measuring subjective impressions and connecting them to product attributes.'], ['Product Experience', 'Studying how scenarios, perception, and product meaning shape user experience.'], ['AI-supported Ideation', 'Studying how AI can help people externalize preferences, scenarios, and creative directions.']],
    methods: ['Semantic differential method', 'Interview and observation', 'Scenario design', 'Prototype testing', 'Persona visualization', 'UX journey mapping'],
    current: [['Building a vocabulary', 'Organizing emotional descriptors for interviews, evaluation sheets, and interface prompts.'], ['Connecting data and form', 'Exploring how subjective evaluation results can guide visual hierarchy and interaction states.'], ['Testing through prototypes', 'Using small UI prototypes to test whether the framing supports real design decisions.']],
    publications: [{ title: 'AI Persona Visualization for Cooking Creativity', venue: 'Workshop', year: '2025', note: 'Exploration of AI-assisted persona systems for creative UX.' }],
  },
  ja: {
    eyebrow: '研究',
    title: '感性工学、HCI、プロダクト体験',
    intro: '人がプロダクトやインターフェースに対して抱く感性的な印象を探り、それを実践的なデザイン知へ変換することを目指しています。',
    questionsTitle: 'Research Questions',
    interestsTitle: 'Research Interests',
    methodsTitle: 'Methods',
    currentTitle: 'Current Work',
    publicationsTitle: 'Publications / Presentations',
    questions: ['安心感、明快さ、新しさ、食欲のような印象を、どのようにデザイン変数へ変換できるか。', 'AIインターフェースは、個人の嗜好を一般的な提案に薄めず、どのように想像力を支援できるか。', 'プロダクト体験研究を、コンセプト設計とUIプロトタイピングの両方に役立つ知識にできるか。'],
    interests: [['感性評価', '主観的な印象を測定し、プロダクト要素との関係を捉える。'], ['プロダクト体験', 'シナリオ、知覚、プロダクトの意味がユーザー体験をどのように形づくるかを研究する。'], ['AIによる発想支援', 'AIが嗜好、シナリオ、創造的方向性の外在化をどのように支援できるかを探る。']],
    methods: ['SD法', 'インタビューと観察', 'シナリオ設計', 'プロトタイプ評価', 'ペルソナ可視化', 'UXジャーニーマッピング'],
    current: [['語彙をつくる', 'インタビュー、評価シート、インターフェースプロンプトに使える感性語を整理する。'], ['データと形をつなぐ', '主観評価の結果を、視覚階層、カード構造、インタラクション状態に反映する方法を探る。'], ['プロトタイプで検証する', '小さなUIプロトタイプを用いて、研究フレーミングが実際のデザイン判断を支援できるか検証する。']],
    publications: [{ title: 'AI Persona Visualization for Cooking Creativity', venue: 'Workshop', year: '2025', note: '創造的UXのためのAI支援ペルソナシステムの探究。' }],
  },
  zh: {
    eyebrow: '研究',
    title: '感性工学、HCI 与产品体验',
    intro: '我的研究关注人们如何形成对产品和界面的情感印象，并探索如何将这些印象转化为可用于设计实践的知识。',
    questionsTitle: 'Research Questions',
    interestsTitle: 'Research Interests',
    methodsTitle: 'Methods',
    currentTitle: 'Current Work',
    publicationsTitle: 'Publications / Presentations',
    questions: ['如何把舒适、清晰、新鲜感、食欲这样的情绪印象转化为设计变量？', 'AI 界面如何支持人的想象力，而不是把个人偏好压缩成普通的通用建议？', '产品体验研究如何同时服务于概念设计与界面原型？'],
    interests: [['感性评价', '测量主观印象，并分析它们与产品属性之间的关系。'], ['产品体验', '研究场景、感知与产品意义如何共同塑造用户体验。'], ['AI 发想支持', '研究 AI 如何帮助用户外化偏好、场景和创作方向。']],
    methods: ['语义差异法', '访谈与观察', '场景设计', '原型测试', '用户画像可视化', 'UX 旅程图'],
    current: [['建立感性词汇', '整理可用于访谈、评价表和界面提示词的情绪描述。'], ['连接数据与形式', '探索如何把主观评价结果转化为视觉层级、卡片结构和交互状态。'], ['通过原型验证', '用小型 UI 原型测试研究框架是否真的能支持设计判断。']],
    publications: [{ title: 'AI Persona Visualization for Cooking Creativity', venue: 'Workshop', year: '2025', note: '探索面向创意 UX 的 AI 辅助用户画像系统。' }],
  },
}

export default function ResearchPage() {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-18">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">{t.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">{t.intro}</p>

      {[
        [t.questionsTitle, t.questions.map((q, i) => [`Q${i + 1}`, q])],
        [t.interestsTitle, t.interests.map((item, i) => [`0${i + 1} · ${item[0]}`, item[1]])],
        [t.currentTitle, t.current.map((item, i) => [`Step ${i + 1} · ${item[0]}`, item[1]])],
      ].map(([title, items]) => (
        <section key={title as string} className="mt-14 grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <h2 className="text-2xl font-semibold tracking-normal">{title as string}</h2>
          <div className="grid gap-4">
            {(items as string[][]).map(([label, text]) => (
              <article key={label} className="rounded-lg border border-[#f7b718]/32 bg-white p-5 dark:border-[#f7b718]/25 dark:bg-neutral-900">
                <span className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">{label}</span>
                <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-300">{text}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-14 grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-2xl font-semibold tracking-normal">{t.methodsTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {t.methods.map((method) => (
            <span key={method} className="rounded-md border border-[#f7b718]/45 bg-[#fff4cf]/55 px-3 py-2 text-sm text-neutral-800 dark:border-[#f7b718]/30 dark:bg-neutral-900 dark:text-neutral-300">{method}</span>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-2xl font-semibold tracking-normal">{t.publicationsTitle}</h2>
        <div className="grid gap-4">
          {t.publications.map((publication) => (
            <article key={publication.title} className="border-t border-[#f7b718]/35 pt-5 dark:border-[#f7b718]/25">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-neutral-500"><span>{publication.venue}</span><span>·</span><span>{publication.year}</span></div>
              <h3 className="mt-3 text-xl font-semibold">{publication.title}</h3>
              <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">{publication.note}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
