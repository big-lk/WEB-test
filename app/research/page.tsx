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
    eyebrow: '我在追的不是学科名',
    title: '我关心用户为什么在某一刻停住',
    intro: '感性工学对我来说，不是先给产品贴上情绪词，而是从用户说不清的感受里找到可设计的差异：哪里没把握，哪里太打扰，哪里需要被提醒，哪里应该让用户自己决定。',
    questionsTitle: '我反复问的事',
    interestsTitle: '三个问题入口',
    methodsTitle: '我常用的办法',
    currentTitle: '现在正在补哪类证据',
    publicationsTitle: '这些问题落在哪些项目里',
    stepLabel: '步骤',
    questions: ['用户说“我不想完全交给 AI”时，他真正担心失去的是效率、责任感，还是自己的想法？', '用户不自信、分心、卡顿、想不起来的时候，产品应该帮助到哪里就停下？', '一次记录、一次提示、一次回看，能不能让用户下一次更容易行动？'],
    interests: [['感性评价', '把“安心、有把握、想继续”这些话，变成能比较的界面版本。'], ['人-AI 共创', '不只看 AI 输出好不好，也看用户在哪一步还需要参与判断。'], ['产品系统', '把界面、硬件、空间和时间提示连起来，观察它能否进入日常行为。']],
    methods: ['语义差异法', '访谈与观察', '场景设计', '比较原型', '眼动追踪', '系统映射', 'UX 旅程图'],
    current: [['把问题说准', '先说明用户在哪个场景、哪一步、因为什么停住，而不是直接套一个大概念。'], ['把界面做成比较', '同一个问题做不同程度的提示，看用户更容易理解、继续行动，还是被打扰。'], ['把行为看出来', '用选择任务、眼动追踪和小流程，检查注意力和判断有没有真的变化。']],
    publications: [{ title: '六个具体问题', venue: 'Portfolio', year: '2025-2026', note: 'AI 分担意识、智驾注意力、日语试读、跨时间摄影、“好久没吃”微信小程序、冰箱日期提示。' }],
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
