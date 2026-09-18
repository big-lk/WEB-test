'use client'

import Link from 'next/link'
import { useLanguage } from './language-context'
import { portfolioWorks } from '../lib/portfolio-data'

type CaseId = 'co-creative-ai-training' | 'transparent-driving-hud' | 'fridge-timeline'

const labels = {
  en: {
    back: 'Back to works',
    problem: 'The problem',
    visual: 'Core experience',
    role: 'My role',
    methods: 'How I evaluated it',
    process: 'Scenario, solution, and validation steps',
    value: 'Design value',
    validation: 'Validation boundary',
    other: 'View other works',
  },
  ja: {
    back: '作品一覧へ戻る',
    problem: '課題',
    visual: 'コア体験',
    role: '担当',
    methods: '判断方法',
    process: '場面・提案・検証のステップ',
    value: 'デザイン価値',
    validation: '検証範囲',
    other: '他の作品を見る',
  },
  zh: {
    back: '返回作品',
    problem: '问题',
    visual: '核心体验',
    role: '我负责的部分',
    methods: '判断依据',
    process: '情景、方案与验证步骤',
    value: '设计价值',
    validation: '验证方式',
    other: '查看其他作品',
  },
}

const visualNotes: Record<CaseId, Record<'en' | 'ja' | 'zh', string>> = {
  'co-creative-ai-training': {
    en: 'The user first makes the responsibility split explicit. The AI then changes the detail, explanation, questions, and conclusion strength of its response.',
    ja: 'ユーザーが判断の分担を明示し、AIはその関係に応じて提案の粒度、説明、問い返し、結論の強さを変える。',
    zh: '界面先把 AI 对模糊词的常规理解摆出来，再用确认和调整入口引导用户判断“这是不是我的意思”。',
  },
  'transparent-driving-hud': {
    en: 'Only the most important risk is shown. A short emotional cue makes the AI’s concern immediately understandable without filling the windshield with alerts.',
    ja: '最も重要な危険だけを表示する。短い感情的な言葉でAIの懸念を直感的に伝え、視界を警告で埋めない。',
    zh: '图中对比邻车与儿童两类风险提示。实际交互需按风险优先级控制显示数量，避免同时出现过多内容；表情、短句与风险程度的对应关系仍需验证。',
  },
  'fridge-timeline': {
    en: 'Before the door opens, the light strip suggests a storage area. After it opens, internal lighting points to the exact location and uses color to show time status.',
    ja: 'ドアを開ける前に外部ライトが収納エリアを示し、開けた後は内部ライトが位置と期限状態を色で伝える。',
    zh: '可磁吸移动的中央摄像与触控终端负责登记；外部灯条先提示区域，内部区域灯光再定位物品并显示日期状态。',
  },
}

export function ConceptCasePage({ id }: { id: CaseId }) {
  const { language } = useLanguage()
  const t = labels[language]
  const work = portfolioWorks[language].find((item) => item.id === id)

  if (!work) return null

  return (
    <main>
      <header className="border-b border-[#f7b718]/25 bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
          <Link href="/works" className="text-sm text-[#f7b718] no-underline hover:text-white">← {t.back}</Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#f7b718]">{work.category} · {work.year}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">{work.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-300">{work.description}</p>
        </div>
      </header>

      <section className="border-b border-[#f7b718]/25 bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b57900] dark:text-[#f7b718]">{t.problem}</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{work.question}</h2>
        </div>
      </section>

      <figure className="border-b border-[#f7b718]/25 bg-neutral-950">
        <div className="mx-auto max-w-[1500px] px-3 py-6 md:px-8 md:py-10">
          <img src={work.image} alt={`${work.title} ${t.visual}`} className="mx-auto max-h-[900px] w-full object-contain" />
          <figcaption className="mx-auto mt-6 grid max-w-6xl gap-3 border-t border-white/15 pt-5 text-white md:grid-cols-[10rem_1fr]">
            <span className="text-sm font-semibold text-[#f7b718]">{t.visual}</span>
            <span className="max-w-3xl leading-7 text-neutral-300">{visualNotes[id][language]}</span>
          </figcaption>
        </div>
      </figure>

      <section className="border-b border-[#f7b718]/25 bg-[#fffaf0] dark:bg-neutral-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-2 md:px-8 md:py-16">
          <div className="border-t border-[#f7b718]/40 pt-5">
            <h2 className="text-lg font-semibold">{t.role}</h2>
            <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-300">{work.role}</p>
          </div>
          <div className="border-t border-[#f7b718]/40 pt-5">
            <h2 className="text-lg font-semibold">{t.methods}</h2>
            <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-300">{work.methods}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#f7b718]/25 bg-white dark:bg-neutral-900/30">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <h2 className="text-3xl font-semibold">{t.process}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {work.process.map(([title, description], index) => (
              <article key={title} className="border-t border-[#f7b718]/45 pt-5">
                <p className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">0{index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[0.7fr_1.3fr] md:px-8 md:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f7b718]">{t.value}</p>
            <h2 className="mt-4 text-3xl font-semibold">{work.outcomes[0]}</h2>
          </div>
          <div className="grid gap-5">
            {work.outcomes.slice(1).map((outcome) => (
              <p key={outcome} className="border-t border-white/15 pt-5 leading-7 text-neutral-300">{outcome}</p>
            ))}
            <div className="border-t border-[#f7b718]/45 pt-5">
              <p className="text-sm font-semibold text-[#f7b718]">{t.validation}</p>
              <p className="mt-3 leading-7 text-neutral-300">{work.next}</p>
            </div>
            <Link href="/works" className="mt-3 text-sm font-semibold text-[#f7b718] no-underline hover:text-white">{t.other} →</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
