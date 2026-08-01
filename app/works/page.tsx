'use client'

import Link from 'next/link'
import { useLanguage } from '../../components/language-context'
import { portfolioWorks } from '../../lib/portfolio-data'

const copy = {
  en: {
    eyebrow: 'Portfolio',
    title: 'Selected Works',
    intro: 'Six design studies across AI co-creation, mobility HMI, learning support, AR travel photography, food memory, and product-service systems. Each work is treated as a research process, not only as a final visual outcome.',
    detailLabels: { role: 'Role', method: 'Methods', next: 'Next step' },
    processTitle: 'Process',
    valueTitle: 'Value',
    researchTitle: 'Research evidence',
    researchNote: 'Sample and data relationship',
    decisionsTitle: 'How evidence changed the product',
    limitsTitle: 'Research boundary',
    deliveryTitle: 'What is real now',
    viewCase: 'Open full case study',
  },
  ja: {
    eyebrow: 'ポートフォリオ',
    title: '作品',
    intro: 'AI共創、モビリティHMI、学習支援、AR旅行写真、食の記憶、プロダクトサービスシステムを横断する6つのデザインスタディです。完成形だけでなく、研究と検証のプロセスを重視しています。',
    detailLabels: { role: '担当', method: '方法', next: '次のステップ' },
    processTitle: 'プロセス',
    valueTitle: '価値',
    researchTitle: '調査エビデンス',
    researchNote: 'サンプルとデータの関係',
    decisionsTitle: '調査から変えた設計',
    limitsTitle: '調査の限界',
    deliveryTitle: '現在の実装範囲',
    viewCase: '詳しいケーススタディを見る',
  },
  zh: {
    eyebrow: '作品不是分类，是问题',
    title: '作品',
    intro: '这 6 个项目不是按媒介分类，而是按问题展开：AI 共创里谁来判断，智驾里人该看见什么，学习里什么时候帮助才刚好，摄影和饮食里记忆如何再次进入行动，冰箱里日期管理如何变成日常习惯。',
    detailLabels: { role: '我负责的部分', method: '我怎么判断', next: '还要补上的证据' },
    processTitle: '我怎么推进',
    valueTitle: '现在形成的判断',
    researchTitle: '先听人怎么想',
    researchNote: '这些数据能说明什么',
    decisionsTitle: '所以设计改了哪里',
    limitsTitle: '现在还不能说太满的地方',
    deliveryTitle: '已经能被使用的部分',
    viewCase: '看完整案例',
  },
}

export default function WorksPage() {
  const { language } = useLanguage()
  const t = copy[language]
  const works = portfolioWorks[language]

  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-18">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">{t.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">{t.intro}</p>

      <div className="mt-12 grid gap-10">
        {works.map((work) => (
          <article id={work.id} key={work.title} className="scroll-mt-24 overflow-hidden rounded-lg border border-[#f7b718]/32 bg-white dark:border-[#f7b718]/25 dark:bg-neutral-900">
            <div className="grid md:grid-cols-[0.95fr_1.05fr]">
              {'image' in work && work.image ? (
                <img src={work.image} alt={work.title} className="h-full min-h-[320px] w-full object-cover" />
              ) : (
                <div className="grid min-h-[320px] place-items-center bg-[#fff4cf] px-8 text-center dark:bg-neutral-950">
                  <div>
                    <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full border border-[#f7b718]/55 bg-white text-4xl font-semibold text-[#b57900] dark:text-black">
                      +
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b57900] dark:text-[#f7b718]">{work.status}</p>
                  </div>
                </div>
              )}
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
                {work.href.startsWith('/works/') ? (
                  <Link href={work.href} className="mt-8 inline-flex rounded-md bg-[#f7b718] px-5 py-3 text-sm font-semibold text-black no-underline transition hover:bg-[#e1a514]">
                    {t.viewCase} <span aria-hidden="true" className="ml-2">→</span>
                  </Link>
                ) : null}
              </div>
            </div>

            {!work.href.startsWith('/works/') && work.detailImage ? (
              <div className="border-t border-[#f7b718]/25 bg-[#fffaf0] p-4 dark:border-[#f7b718]/20 dark:bg-neutral-950">
                <img src={work.detailImage} alt={`${work.title} presentation board`} className="w-full rounded-md border border-[#f7b718]/25 bg-white object-cover dark:border-[#f7b718]/20" />
              </div>
            ) : null}

            {!work.href.startsWith('/works/') && work.research ? (
              <section className="border-t border-[#f7b718]/25 bg-neutral-950 px-6 py-8 text-white md:px-8 md:py-10">
                <div className="grid gap-5 md:grid-cols-[0.72fr_1.28fr] md:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f7b718]">{t.researchTitle}</p>
                    <h3 className="mt-3 text-2xl font-semibold">{t.researchNote}</h3>
                  </div>
                  <p className="max-w-3xl text-sm leading-7 text-neutral-300">{work.research.sample}</p>
                </div>

                <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-white/[0.12] bg-white/[0.12] sm:grid-cols-2 lg:grid-cols-4">
                  {work.research.metrics.map(([value, label, detail]) => (
                    <div key={label} className="bg-neutral-950 p-5">
                      <p className="text-3xl font-semibold text-[#f7b718]">{value}</p>
                      <p className="mt-3 text-sm font-semibold leading-6 text-white">{label}</p>
                      <p className="mt-2 text-xs leading-5 text-neutral-400">{detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <h3 className="text-xl font-semibold">{t.decisionsTitle}</h3>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {work.research.decisions.map(([title, description], index) => (
                      <div key={title} className="rounded-lg border border-[#f7b718]/30 bg-white/[0.04] p-5">
                        <p className="text-xs font-semibold text-[#f7b718]">0{index + 1}</p>
                        <h4 className="mt-3 font-semibold">{title}</h4>
                        <p className="mt-3 text-sm leading-7 text-neutral-300">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 rounded-lg border border-white/[0.12] bg-white/[0.04] p-5 md:grid-cols-[9rem_1fr]">
                  <p className="text-sm font-semibold text-[#f7b718]">{t.limitsTitle}</p>
                  <p className="text-sm leading-7 text-neutral-300">{work.research.limitation}</p>
                </div>
              </section>
            ) : null}

            {!work.href.startsWith('/works/') && work.delivery ? (
              <section className="border-t border-[#f7b718]/25 bg-[#fffaf0] px-6 py-8 md:px-8 md:py-10 dark:bg-neutral-950">
                <div className="grid gap-8 md:grid-cols-[0.36fr_1fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b57900] dark:text-[#f7b718]">MVP 0.2.0</p>
                    <h3 className="mt-3 text-2xl font-semibold">{t.deliveryTitle}</h3>
                  </div>
                  <div className="grid gap-0">
                    {work.delivery.map(([title, description], index) => (
                      <div key={title} className="grid gap-3 border-t border-[#f7b718]/35 py-5 first:pt-4 md:grid-cols-[4rem_10rem_1fr]">
                        <span className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">0{index + 1}</span>
                        <h4 className="font-semibold">{title}</h4>
                        <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {!work.href.startsWith('/works/') ? (
            <div className="grid gap-8 border-t border-[#f7b718]/25 p-6 md:grid-cols-[1fr_1fr] md:p-8 dark:border-[#f7b718]/20">
              <div>
                <h3 className="text-xl font-semibold">{t.processTitle}</h3>
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
                <h3 className="text-xl font-semibold">{t.valueTitle}</h3>
                <ul className="mt-5 grid gap-3">
                  {work.outcomes.map((outcome) => (
                    <li key={outcome} className="rounded-md border border-[#f7b718]/30 bg-[#fff4cf]/55 px-4 py-3 leading-7 text-neutral-700 dark:border-[#f7b718]/25 dark:bg-neutral-950 dark:text-neutral-300">{outcome}</li>
                  ))}
                </ul>
              </div>
            </div>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  )
}
