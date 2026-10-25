'use client'

import Link from 'next/link'
import { useLanguage } from '../../components/language-context'
import { getOrderedPortfolioWorks, workGroups } from '../../lib/portfolio-data'

const copy = {
  en: {
    eyebrow: 'Portfolio',
    title: 'Selected Works',
    intro: 'Nine projects, ordered by relevance to product-experience roles: main cases in product experience and AI first, then explorations and early industrial design, then internship and coursework. Each one states how far it has gone.',
    groups: [['Main cases', 'Product experience and AI: from defining the need to a prototype people can try.'], ['Explorations and early concepts', 'MR photography, driving HMI, and an early appliance system.'], ['Internship and coursework', 'B2B communication, brand, and identity.']],
    timelineLink: 'View everything by date',
    detailLabels: { role: 'My contribution', method: 'Methods and tools', next: 'Current scope and next step' },
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
    intro: '9作品を志望職種との関連順に掲載：製品体験と AI の主な事例、探索的なコンセプトと初期の工業デザイン、インターンと課題の順です。各作品でどこまで進んだかを明記しています。',
    groups: [['主な事例', '製品体験と AI：ニーズの判断から体験できる試作まで。'], ['探索と初期コンセプト', 'MR 撮影、運転 HMI、初期の家電システム。'], ['企業インターンと課題', 'BtoB のコミュニケーション、ブランドと VI。']],
    timelineLink: '時系列で見る',
    detailLabels: { role: '担当', method: '方法・ツール', next: '現在の範囲と次のステップ' },
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
    eyebrow: '作品集',
    title: '作品',
    intro: '九个项目按求职方向排序：先是产品体验与 AI 的主案例，再是探索性概念和早期工业设计，最后是实习与课程。每个项目都写明做到了哪一步。',
    groups: [['主案例', '产品体验与 AI：从需求判断到可体验的原型。'], ['探索与早期概念', 'MR 摄影、驾驶 HMI，以及早期的家电系统。'], ['企业实习与课程', 'B 端沟通、品牌与 VI。']],
    timelineLink: '按时间看全部作品',
    detailLabels: { role: '我的角色', method: '方法', next: '当前阶段' },
    processTitle: '我怎么推进',
    valueTitle: '核心发现',
    researchTitle: '先听人怎么想',
    researchNote: '这些数据能说明什么',
    decisionsTitle: '所以设计改了哪里',
    limitsTitle: '验证边界',
    deliveryTitle: '已经能被使用的部分',
    viewCase: '看完整案例',
  },
}

export default function WorksPage() {
  const { language } = useLanguage()
  const t = copy[language]
  const works = getOrderedPortfolioWorks(language)

  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-18">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">{t.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">{t.intro}</p>
      <Link href="/timeline" className="mt-5 inline-block text-sm font-medium text-[#b57900] no-underline hover:text-neutral-950 dark:text-[#f7b718] dark:hover:text-white">{t.timelineLink} →</Link>

      {workGroups.map((group, groupIndex) => {
        const groupWorks = works.filter((work) => (group.ids as readonly string[]).includes(work.id))
        return (
        <section key={group.key} className="mt-14">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-[#f7b718]/35 pb-3">
            <h2 className="text-2xl font-semibold tracking-normal">{t.groups[groupIndex][0]}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.groups[groupIndex][1]}</p>
          </div>

      <div className="relative mt-8 space-y-10 before:absolute before:bottom-3 before:left-3 before:top-3 before:w-px before:bg-[#f7b718]/45 md:before:left-[12.25rem]">
        {groupWorks.map((work) => (
          <div key={work.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4 md:grid-cols-[10rem_1.5rem_minmax(0,1fr)] md:gap-x-6">
            <div className="hidden pt-5 text-right md:block">
              <p className="text-lg font-semibold text-[#b57900] dark:text-[#f7b718]">{work.year}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{work.period}</p>
            </div>
            <div aria-hidden="true" className="relative col-start-1 row-start-1 flex justify-center md:col-start-2">
              <span className="relative z-10 mt-6 size-3 rounded-full border-2 border-[#b57900] bg-[#fffaf0] dark:border-[#f7b718] dark:bg-neutral-950" />
            </div>
            <article id={work.id} className="scroll-mt-24 col-start-2 row-start-1 overflow-hidden rounded-lg border border-[#f7b718]/32 bg-white dark:border-[#f7b718]/25 dark:bg-neutral-900 md:col-start-3">
            <div className="border-b border-[#f7b718]/25 px-6 py-4 md:hidden">
              <p className="text-lg font-semibold text-[#b57900] dark:text-[#f7b718]">{work.year}</p>
              <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{work.period}</p>
            </div>
            <div>
              {'image' in work && work.image ? (
                <div className="grid place-items-center border-b border-[#f7b718]/25 bg-neutral-950 p-2 md:p-4">
                  <img src={work.image} alt={work.title} loading="lazy" decoding="async" className="max-h-[360px] w-full object-contain md:max-h-[520px]" />
                </div>
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
                  <span>{work.category}</span>
                </div>
                <p className="mb-3 text-sm font-medium text-[#b57900] dark:text-[#f7b718]">{work.status}</p>
                <h3 className="text-3xl font-semibold tracking-normal">{work.title}</h3>
                <p className="mt-4 leading-8 text-neutral-600 dark:text-neutral-300">{work.description}</p>
                <dl className="mt-8 grid gap-4 text-sm">
                  <div className="grid gap-1 border-t border-[#f7b718]/35 pt-4 dark:border-[#f7b718]/25"><dt className="font-semibold text-neutral-950 dark:text-white">{t.detailLabels.role}</dt><dd className="text-neutral-600 dark:text-neutral-400">{work.role}</dd></div>
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
          </div>
        ))}
      </div>
        </section>
        )
      })}
    </main>
  )
}
