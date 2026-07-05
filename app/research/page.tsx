'use client'

import { useLanguage } from '../../components/language-context'

const copy = {
  en: {
    eyebrow: 'Research',
    title: 'Kansei Engineering, HCI, AI Interaction, and Product Systems',
    intro: 'My research explores how people understand, trust, remember, and act through products, interfaces, AI systems, and spatial experiences.',
    questionsTitle: 'Research Questions',
    interestsTitle: 'Research Interests',
    methodsTitle: 'Methods',
    currentTitle: 'Current Work',
    publicationsTitle: 'Project Studies / Presentations',
    stepLabel: 'Step',
    questions: ['How can emotional impressions become design variables across products, mobility, learning, food, and AR experiences?', 'How can AI interfaces show human agency, uncertainty, and system reasoning without becoming a black box?', 'How can everyday product systems make hidden time, place, memory, and effort visible through interaction?'],
    interests: [['Kansei Evaluation', 'Translating subjective impressions into design variables and evaluation language.'], ['Human-AI Co-creation', 'Designing AI systems that preserve user agency, correction, trust, and authorship.'], ['Spatial and Product Systems', 'Connecting physical objects, interface layers, timing, location, and service behavior.']],
    methods: ['Semantic differential method', 'Interview and observation', 'Scenario design', 'Prototype testing', 'System mapping', 'UX journey mapping'],
    current: [['Building a vocabulary', 'Organizing emotional descriptors such as trust, effort, timing, confidence, freshness, and control.'], ['Connecting system and behavior', 'Exploring how UI, hardware, AR overlays, light guidance, and data records can change everyday actions.'], ['Testing through prototypes', 'Using interface boards, concept renders, and small flows to test whether the framing supports real design decisions.']],
    publications: [{ title: 'Six Portfolio Design Studies', venue: 'Portfolio', year: '2025-2026', note: 'AI co-creation, transparent driving HMI, learning support, AR travel photography, food memory, and fridge timeline systems.' }],
  },
  ja: {
    eyebrow: '研究',
    title: '感性工学、HCI、AIインタラクション、プロダクトシステム',
    intro: '人がプロダクト、インターフェース、AIシステム、空間体験をどのように理解し、信頼し、記憶し、行動へ移すのかを探っています。',
    questionsTitle: '研究の問い',
    interestsTitle: '研究関心',
    methodsTitle: '方法',
    currentTitle: '現在の取り組み',
    publicationsTitle: 'プロジェクト研究・プレゼンテーション',
    stepLabel: 'ステップ',
    questions: ['信頼、努力、時間、記憶、新鮮さ、安心感のような印象を、どのようにデザイン変数へ変換できるか。', 'AIインターフェースは、主導権、不確実性、判断理由をどのように見せればブラックボックスにならないか。', '日常のプロダクトシステムは、隠れた時間、場所、記憶、努力をどのようにインタラクションで可視化できるか。'],
    interests: [['感性評価', '主観的な印象をデザイン変数と評価言語へ翻訳する。'], ['人とAIの共創', 'ユーザーの主導権、修正、信頼、作者性を残すAIシステムを考える。'], ['空間とプロダクトシステム', '物理オブジェクト、UIレイヤー、時間、場所、サービス行動を接続する。']],
    methods: ['SD法', 'インタビューと観察', 'シナリオ設計', 'プロトタイプ評価', 'システムマッピング', 'UXジャーニーマッピング'],
    current: [['語彙をつくる', '信頼、努力、タイミング、自信、新鮮さ、制御感などの感性語を整理する。'], ['システムと行動をつなぐ', 'UI、ハードウェア、AR表示、ライトガイド、記録データが日常行動をどう変えるかを探る。'], ['プロトタイプで検証する', 'インターフェースボード、コンセプトレンダリング、小さな操作フローを用いて、設計判断を検証する。']],
    publications: [{ title: '6つのポートフォリオ・デザインスタディ', venue: 'Portfolio', year: '2025-2026', note: 'AI共創、透明化HMI、学習支援、AR旅行写真、食の記憶、冷蔵庫タイムラインシステム。' }],
  },
  zh: {
    eyebrow: '研究',
    title: '感性工学、HCI、AI 交互与产品系统',
    intro: '我的研究关注人们如何通过产品、界面、AI 系统与空间体验形成理解、信任、记忆和行动。',
    questionsTitle: '研究问题',
    interestsTitle: '研究兴趣',
    methodsTitle: '研究方法',
    currentTitle: '当前工作',
    publicationsTitle: '项目研究 / 展示',
    stepLabel: '步骤',
    questions: ['如何把信任、努力、时间、记忆、新鲜感和安心感这样的印象转化为设计变量？', 'AI 界面如何呈现人的主导权、系统的不确定性和判断理由，而不是变成黑箱？', '日常产品系统如何通过交互让隐藏的时间、位置、记忆和努力被看见？'],
    interests: [['感性评价', '把主观印象转化为设计变量和评价语言。'], ['人机共创', '设计能够保留用户主导权、修正、信任和作者感的 AI 系统。'], ['空间与产品系统', '连接物理对象、界面层、时间、位置和服务行为。']],
    methods: ['语义差异法', '访谈与观察', '场景设计', '原型测试', '系统映射', 'UX 旅程图'],
    current: [['建立感性词汇', '整理信任、努力、时机、自信、新鲜感和控制感等评价词。'], ['连接系统与行为', '探索 UI、硬件、AR 叠加、灯光引导和数据记录如何改变日常行为。'], ['通过原型验证', '用界面板、概念渲染和小型流程测试研究框架是否能支持真实设计判断。']],
    publications: [{ title: '六个作品集设计研究', venue: 'Portfolio', year: '2025-2026', note: '涵盖 AI 共创、透明化驾驶 HMI、学习支持、AR 旅行摄影、料理记忆与冰箱时间线系统。' }],
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
        [t.currentTitle, t.current.map((item, i) => [`${t.stepLabel} ${i + 1} · ${item[0]}`, item[1]])],
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
