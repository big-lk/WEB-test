'use client'

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
  },
  ja: {
    eyebrow: 'ポートフォリオ',
    title: '作品',
    intro: 'AI共創、モビリティHMI、学習支援、AR旅行写真、食の記憶、プロダクトサービスシステムを横断する6つのデザインスタディです。完成形だけでなく、研究と検証のプロセスを重視しています。',
    detailLabels: { role: '担当', method: '方法', next: '次のステップ' },
    processTitle: 'プロセス',
    valueTitle: '価値',
  },
  zh: {
    eyebrow: '作品集',
    title: '作品',
    intro: '这里整理了 6 个设计研究项目，覆盖 AI 共创、智能驾驶 HMI、学习支持、AR 旅行摄影、料理记忆与产品服务系统。相比单纯展示最终视觉，我更重视从研究到验证的过程。',
    detailLabels: { role: '负责内容', method: '方法', next: '下一步' },
    processTitle: '过程',
    valueTitle: '价值',
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
              </div>
            </div>

            {work.detailImage ? (
              <div className="border-t border-[#f7b718]/25 bg-[#fffaf0] p-4 dark:border-[#f7b718]/20 dark:bg-neutral-950">
                <img src={work.detailImage} alt={`${work.title} presentation board`} className="w-full rounded-md border border-[#f7b718]/25 bg-white object-cover dark:border-[#f7b718]/20" />
              </div>
            ) : null}

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
          </article>
        ))}
      </div>
    </main>
  )
}
