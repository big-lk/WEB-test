'use client'

import { useLanguage } from '../../components/language-context'

const copy = {
  en: {
    eyebrow: 'Portfolio',
    title: 'Selected Works',
    intro: 'Projects across product experience, AI-supported creativity, and UX research. Each work is treated as a research process, not only as a final visual outcome.',
    detailLabels: { role: 'Role', method: 'Methods', next: 'Next step' },
    works: [
      {
        title: 'AI Cooking Persona',
        category: 'UX research / AI creativity',
        year: '2025',
        role: 'UX research, persona system, interface concept',
        methods: 'Persona visualization, scenario design, UI prototype',
        status: 'Research prototype in progress',
        next: 'Refine persona categories, test scenario prompts, and turn the interface concept into a clearer interaction flow.',
        image: '/works/ai-cooking-persona-generated.png',
        description: 'A study on how AI-generated personas can support cooking ideation, helping people move from vague preference to concrete creative direction.',
        question: 'When people want to cook creatively, they often begin with vague feelings: light, seasonal, comforting, surprising, or easy to share. This project asks how an AI interface can help translate those feelings into useful persona cards, scenarios, and recipe directions.',
        process: [
          ['Research framing', 'Define the gap between emotional preference, cooking context, and concrete ideation output.'],
          ['Persona structure', 'Experiment with persona cards that combine lifestyle, taste preference, constraints, and desired mood.'],
          ['Interface concept', 'Design a flow where users can compare personas, adjust scenario variables, and collect promising directions.'],
          ['Evaluation plan', 'Prepare criteria for judging whether the system supports creativity, clarity, and personal relevance.'],
        ],
        outcomes: [
          'A clearer design concept for AI-assisted cooking ideation.',
          'A visual system for persona cards and scenario comparison.',
          'A research direction connecting Kansei evaluation with generative interfaces.',
        ],
      },
    ],
  },
  ja: {
    eyebrow: 'ポートフォリオ',
    title: 'Selected Works',
    intro: 'プロダクト体験、AIによる創造支援、UXリサーチを横断するプロジェクトです。完成形だけでなく、研究と検証のプロセスを重視しています。',
    detailLabels: { role: '担当', method: '方法', next: '次のステップ' },
    works: [
      {
        title: 'AI Cooking Persona',
        category: 'UXリサーチ / AI創造支援',
        year: '2025',
        role: 'UXリサーチ、ペルソナ設計、UIコンセプト',
        methods: 'ペルソナ可視化、シナリオ設計、UIプロトタイプ',
        status: '研究プロトタイプ制作中',
        next: 'ペルソナ分類を整理し、シナリオプロンプトを検証しながら、インターフェースの流れをより明確にする。',
        image: '/works/ai-cooking-persona-generated.png',
        description: 'AIが生成するペルソナを用いて、料理の好みや曖昧な感覚を具体的な発想へつなげるための研究。',
        question: '料理の発想は、軽い、季節感がある、安心する、意外性がある、共有しやすいといった曖昧な感覚から始まることがあります。このプロジェクトでは、その感覚をペルソナカード、シナリオ、レシピ方向へ変換するAIインターフェースを探っています。',
        process: [
          ['Research framing', '感性的な好み、料理の文脈、具体的な発想アウトプットのあいだのギャップを整理する。'],
          ['Persona structure', '生活スタイル、味の嗜好、制約、望ましい気分を組み合わせたペルソナカードを検討する。'],
          ['Interface concept', 'ペルソナ比較、シナリオ変数の調整、有望な方向性の保存ができる流れを設計する。'],
          ['Evaluation plan', '創造性、明確さ、個人との関連性を評価するための観点を準備する。'],
        ],
        outcomes: ['AIによる料理発想支援のデザインコンセプトを具体化。', 'ペルソナカードとシナリオ比較のビジュアルシステム。', '感性評価と生成AIインターフェースを接続する研究方向。'],
      },
    ],
  },
  zh: {
    eyebrow: '作品集',
    title: 'Selected Works',
    intro: '项目聚焦产品体验、AI 创意支持与 UX 研究。相比单纯展示最终视觉，我更重视从研究到验证的过程。',
    detailLabels: { role: '负责内容', method: '方法', next: '下一步' },
    works: [
      {
        title: 'AI Cooking Persona',
        category: 'UX 研究 / AI 创意支持',
        year: '2025',
        role: 'UX 研究、用户画像系统、界面概念',
        methods: '用户画像可视化、场景设计、UI 原型',
        status: '研究原型正在推进',
        next: '继续整理画像分类，测试场景提示词，并把界面概念推进为更清晰的交互流程。',
        image: '/works/ai-cooking-persona-generated.png',
        description: '研究 AI 生成的用户画像如何支持料理创意发想，帮助用户从模糊偏好转向更具体的创作方向。',
        question: '人在想做一道料理时，常常不是从明确菜名开始，而是从“清爽”“有季节感”“治愈”“有惊喜”“适合分享”这样的模糊感受开始。这个项目研究 AI 界面如何把这些感受转化为可用的用户画像、场景和料理方向。',
        process: [
          ['研究定位', '梳理情绪偏好、料理语境和具体创意产出之间的断点。'],
          ['画像结构', '尝试把生活方式、口味偏好、限制条件和期望情绪组合成可比较的画像卡片。'],
          ['界面概念', '设计用户可以比较画像、调整场景变量、保存有潜力方向的操作流程。'],
          ['评价计划', '准备从创意支持、清晰度和个人相关性三个角度验证系统价值。'],
        ],
        outcomes: ['形成更清晰的 AI 辅助料理发想设计概念。', '建立用户画像卡片与场景比较的视觉系统。', '把感性评价与生成式界面研究连接起来。'],
      },
    ],
  },
}

export default function WorksPage() {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-18">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">{t.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">{t.intro}</p>

      <div className="mt-12 grid gap-10">
        {t.works.map((work) => (
          <article key={work.title} className="overflow-hidden rounded-lg border border-[#f7b718]/32 bg-white dark:border-[#f7b718]/25 dark:bg-neutral-900">
            <div className="grid md:grid-cols-[0.95fr_1.05fr]">
              <img src={work.image} alt={work.title} className="h-full min-h-[320px] w-full object-cover" />
              <div className="p-6 md:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
                  <span>{work.category}</span><span>·</span><span>{work.year}</span>
                </div>
                <p className="mb-3 text-sm font-medium text-[#b57900] dark:text-[#f7b718]">{work.status}</p>
                <h2 className="text-3xl font-semibold tracking-normal">{work.title}</h2>
                <p className="mt-4 leading-8 text-neutral-600 dark:text-neutral-300">{work.description}</p>
                <p className="mt-6 leading-8 text-neutral-700 dark:text-neutral-200">{work.question}</p>
                <dl className="mt-8 grid gap-4 text-sm">
                  <div className="grid gap-1 border-t border-[#f7b718]/35 pt-4 dark:border-[#f7b718]/25"><dt className="font-semibold text-neutral-950 dark:text-white">{t.detailLabels.role}</dt><dd className="text-neutral-600 dark:text-neutral-400">{work.role}</dd></div>
                  <div className="grid gap-1 border-t border-[#f7b718]/35 pt-4 dark:border-[#f7b718]/25"><dt className="font-semibold text-neutral-950 dark:text-white">{t.detailLabels.method}</dt><dd className="text-neutral-600 dark:text-neutral-400">{work.methods}</dd></div>
                  <div className="grid gap-1 border-t border-[#f7b718]/35 pt-4 dark:border-[#f7b718]/25"><dt className="font-semibold text-neutral-950 dark:text-white">{t.detailLabels.next}</dt><dd className="text-neutral-600 dark:text-neutral-400">{work.next}</dd></div>
                </dl>
              </div>
            </div>

            <div className="grid gap-8 border-t border-[#f7b718]/25 p-6 md:grid-cols-[1fr_1fr] md:p-8 dark:border-[#f7b718]/20">
              <div>
                <h3 className="text-xl font-semibold">Process</h3>
                <div className="mt-5 grid gap-4">
                  {work.process.map(([title, description], index) => (
                    <div key={title} className="grid gap-2 border-t border-[#f7b718]/25 pt-4">
                      <span className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">0{index + 1} · {title}</span>
                      <p className="leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Value</h3>
                <ul className="mt-5 grid gap-3">
                  {work.outcomes.map((outcome) => (
                    <li key={outcome} className="rounded-md border border-[#f7b718]/30 bg-[#fff4cf]/55 px-4 py-3 leading-7 text-neutral-700 dark:border-[#f7b718]/25 dark:bg-neutral-950 dark:text-neutral-300">{outcome}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
