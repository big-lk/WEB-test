'use client'

import { useLanguage } from '../../components/language-context'
import { portfolioWorks } from '../../lib/portfolio-data'

const resumeCopy = {
  en: {
    eyebrow: 'Resume',
    name: 'KONG WEIPENG',
    headline: 'Industrial Design / HCI / Kansei Engineering',
    summary:
      'Research-driven industrial designer exploring sensory experience between people, products, and technology. I translate subtle feelings into design knowledge through user research, Kansei evaluation, prototyping, and interface design.',
    contact: ['Sapporo, Japan', 'littlekeen@outlook.com', 'lkdesigner.top'],
    sections: {
      profile: 'Profile',
      education: 'Education',
      skills: 'Core Skills',
      methods: 'Research Methods',
      projects: 'Selected Projects',
      focus: 'Research Focus',
    },
    education: {
      school: 'Sapporo City University',
      detail: 'Industrial Design',
      meta: 'Sapporo, Japan',
    },
    skills: ['Industrial design', 'UI/UX design', 'Human-AI interaction', 'Mobility HMI', 'AR experience design', 'Product-service systems'],
    methods: ['Interview and observation', 'Semantic differential method', 'Kansei evaluation', 'Scenario design', 'Prototype testing', 'System mapping', 'UX journey mapping', 'Data visualization'],
    focus: [
      'Translating emotional impressions into comparable design variables.',
      'Designing AI interfaces that preserve agency, transparency, trust, and authorship.',
      'Connecting physical products, UI layers, timing, location, and everyday behavior.',
    ],
    labels: { role: 'Role', methods: 'Methods', value: 'Value' },
  },
  ja: {
    eyebrow: '履歴書',
    name: '孔 維鵬',
    headline: 'インダストリアルデザイン / HCI / 感性工学',
    summary:
      '人・プロダクト・テクノロジーのあいだにある感性的な体験を探究するデザインリサーチャーです。ユーザー調査、感性評価、プロトタイピング、UI/UX設計を通して、曖昧な感覚をデザイン判断へつなげます。',
    contact: ['札幌、日本', 'littlekeen@outlook.com', 'lkdesigner.top'],
    sections: {
      profile: 'プロフィール',
      education: '学歴',
      skills: 'スキル',
      methods: '研究方法',
      projects: '代表プロジェクト',
      focus: '研究関心',
    },
    education: {
      school: '札幌市立大学',
      detail: 'インダストリアルデザイン',
      meta: '札幌、日本',
    },
    skills: ['インダストリアルデザイン', 'UI/UXデザイン', '人とAIのインタラクション', 'モビリティHMI', 'AR体験設計', 'プロダクトサービスシステム'],
    methods: ['インタビューと観察', 'SD法', '感性評価', 'シナリオ設計', 'プロトタイプ評価', 'システムマッピング', 'UXジャーニーマッピング', 'データ可視化'],
    focus: [
      '感情的な印象を比較可能なデザイン変数へ翻訳する。',
      '主体性、透明性、信頼、作者性を残すAIインターフェースを設計する。',
      '物理プロダクト、UI、時間、場所、日常行動を接続する。',
    ],
    labels: { role: '担当', methods: '方法', value: '価値' },
  },
  zh: {
    eyebrow: '简历',
    name: '孔维鹏',
    headline: '感性工学产品设计 / HCI / UIUX',
    summary:
      '我做产品设计时会先看用户在哪一刻犹豫、分心、忘记或没把握，再把这个问题转成界面结构、原型任务和可比较的设计判断。目前在札幌学习人间情报设计，关注 AI 产品体验、车载 HMI、学习与日常行为系统。',
    contact: ['日本札幌', 'littlekeen@outlook.com', 'lkdesigner.top'],
    sections: {
      profile: '我是谁',
      education: '教育经历',
      skills: '能做的东西',
      methods: '怎么判断',
      projects: '项目里看什么',
      focus: '我关心的事',
    },
    education: {
      school: '札幌市立大学',
      detail: '人间情报设计 / 修士前期课程',
      meta: '2025.04 入学 - 预计 2027.04 毕业',
    },
    skills: ['感性工学产品设计', 'UI/UX 设计', 'HCI', '人-AI 共创', '汽车 HMI', 'MR/AR 体验设计', '产品服务系统'],
    methods: ['访谈与观察', '语义差异法', '感性评价', '眼动追踪', '比较原型', '场景设计', '系统映射', 'UX 旅程图'],
    focus: [
      '面对 AI 或自动化系统，我会先拆清楚哪些判断可以交给系统，哪些需要用户继续参与。',
      '面对提醒和辅助界面，我更关心帮助出现的时机、程度和退出方式。',
      '面对日常产品，我会把一次记录、一次练习、一次驾驶或一次取物，整理成能反复发生的行为流程。',
    ],
    labels: { role: '我做了什么', methods: '我怎么判断', value: '形成的判断' },
  },
}

export default function ResumePage() {
  const { language } = useLanguage()
  const t = resumeCopy[language]
  const works = portfolioWorks[language]

  return (
    <main className="bg-[#fffaf0] dark:bg-neutral-950">
      <section className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <div className="rounded-lg border border-[#f7b718]/35 bg-white p-6 shadow-sm shadow-[#f7b718]/10 dark:border-[#f7b718]/25 dark:bg-neutral-900 md:p-10">
          <header className="grid gap-8 border-b border-[#f7b718]/35 pb-8 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-neutral-950 dark:text-white md:text-6xl">{t.name}</h1>
              <p className="mt-4 text-lg font-medium text-neutral-800 dark:text-neutral-200">{t.headline}</p>
              <p className="mt-5 max-w-3xl leading-8 text-neutral-600 dark:text-neutral-300">{t.summary}</p>
            </div>
            <ul className="grid gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              {t.contact.map((item) => (
                <li key={item} className="rounded-md border border-[#f7b718]/30 bg-[#fff4cf]/45 px-3 py-2 dark:border-[#f7b718]/20 dark:bg-neutral-950">
                  {item}
                </li>
              ))}
            </ul>
          </header>

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="grid content-start gap-8">
              <section>
                <h2 className="text-lg font-semibold">{t.sections.education}</h2>
                <div className="mt-4 border-t border-[#f7b718]/30 pt-4">
                  <h3 className="font-semibold text-neutral-950 dark:text-white">{t.education.school}</h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{t.education.detail}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-500">{t.education.meta}</p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold">{t.sections.skills}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {t.skills.map((skill) => (
                    <span key={skill} className="rounded-md border border-[#f7b718]/35 bg-[#fff4cf]/60 px-3 py-2 text-sm text-neutral-800 dark:border-[#f7b718]/25 dark:bg-neutral-950 dark:text-neutral-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold">{t.sections.methods}</h2>
                <ul className="mt-4 grid gap-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {t.methods.map((method) => (
                    <li key={method} className="border-t border-[#f7b718]/25 pt-2">{method}</li>
                  ))}
                </ul>
              </section>
            </aside>

            <div className="grid gap-10">
              <section>
                <h2 className="text-xl font-semibold">{t.sections.focus}</h2>
                <ul className="mt-4 grid gap-3">
                  {t.focus.map((item) => (
                    <li key={item} className="rounded-md border border-[#f7b718]/30 bg-[#fffaf0] px-4 py-3 leading-7 text-neutral-700 dark:border-[#f7b718]/20 dark:bg-neutral-950 dark:text-neutral-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">{t.sections.projects}</h2>
                <div className="mt-5 grid gap-6">
                  {works.map((work) => (
                    <article key={work.id} className="border-t border-[#f7b718]/35 pt-5">
                      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
                        <span>{work.category}</span>
                        <span>{work.year}</span>
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold tracking-normal">{work.title}</h3>
                      <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">{work.description}</p>
                      <dl className="mt-4 grid gap-3 text-sm">
                        <div>
                          <dt className="font-semibold text-neutral-950 dark:text-white">{t.labels.role}</dt>
                          <dd className="mt-1 text-neutral-600 dark:text-neutral-300">{work.role}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-neutral-950 dark:text-white">{t.labels.methods}</dt>
                          <dd className="mt-1 text-neutral-600 dark:text-neutral-300">{work.methods}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-neutral-950 dark:text-white">{t.labels.value}</dt>
                          <dd className="mt-1 text-neutral-600 dark:text-neutral-300">{work.outcomes[0]}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
