'use client'

import Link from 'next/link'
import { useLanguage } from './language-context'
import { portfolioWorks } from '../lib/portfolio-data'

type CaseId = 'co-creative-ai-training' | 'transparent-driving-hud' | 'fridge-timeline' | 'alive-energy-link' | 'factory-planning' | 'corporate-vi' | 'smart-oven-timing'

const labels = {
  en: {
    back: 'Back to works',
    problem: 'The problem',
    visual: 'Design visuals',
    role: 'My role',
    methods: 'Methods and tools',
    process: 'Scenario, solution, and validation steps',
    value: 'Design value',
    validation: 'Validation boundary',
    gallery: 'Design development',
    research: 'Research evidence',
    videos: 'Process animation',
    modules: 'Design details',
    sources: 'Sources',
    fullImage: 'View full image',
    other: 'View other works',
  },
  ja: {
    back: '作品一覧へ戻る',
    problem: '課題',
    visual: '提案の図示',
    role: '担当',
    methods: '方法・ツール',
    process: '場面・提案・検証のステップ',
    value: 'デザイン価値',
    validation: '検証範囲',
    gallery: 'デザインの展開',
    research: '調査結果',
    videos: 'プロセス動画',
    modules: '各部のデザイン',
    sources: '出典',
    fullImage: '画像を大きく見る',
    other: '他の作品を見る',
  },
  zh: {
    back: '返回作品',
    problem: '痛点与场景',
    visual: '方案图示',
    role: '我的角色',
    methods: '方法',
    process: '设计方案',
    value: '设计要点',
    validation: '当前阶段',
    gallery: '设计过程与应用',
    research: '调研',
    videos: '流程演示',
    modules: '分项设计',
    sources: '资料来源',
    fullImage: '查看原图',
    other: '查看其他作品',
  },
}

const visualNotes: Record<CaseId, Record<'en' | 'ja' | 'zh', string>> = {
  'co-creative-ai-training': {
    en: 'The interface shows the AI’s usual interpretation of a vague term, then uses confirmation and adjustment controls to ask whether it matches the user’s meaning.',
    ja: '曖昧な言葉に対するAIの一般的な解釈を示し、確認・調整の入口で「自分の意味と合っているか」を判断するよう促す。',
    zh: '界面先把 AI 对模糊词的常规理解摆出来，再用确认和调整入口引导用户判断“这是不是我的意思”。',
  },
  'transparent-driving-hud': {
    en: 'Only the most important risk is shown. A short emotional cue makes the AI’s concern immediately understandable without filling the windshield with alerts.',
    ja: '最も重要な危険だけを表示する。短い感情的な言葉でAIの懸念を直感的に伝え、視界を警告で埋めない。',
    zh: '图中对比邻车与儿童两类风险提示。实际交互需按风险优先级控制显示数量，避免同时出现过多内容；表情、短句与风险程度的对应关系仍需验证。',
  },
  'fridge-timeline': {
    en: 'This board is a 2026 AI-assisted reinterpretation of the concept, not the original 2023 design. In the original, the door cue was an angled light strip beside the handle (see the 2023 renders and animation below).',
    ja: 'この図は2026年にAIで再構成した方案図で、2023年の元の設計ではない。元の設計では、ドアの提示は取っ手横の斜めのライトだった（下の2023年のレンダリングと動画を参照）。',
    zh: '此图为 2026 年借助 AI 二次创作的方案图，并非 2023 年原设计。原设计中门外提示是门把手旁呈角形的灯带，见下方 2023 年原始渲染与动画。',
  },
  'alive-energy-link': {
    en: 'The smart power strip, kettle, and microwave/oven are three appliance nodes. Outlet lighting identifies connections, and each device communicates its own power or operating state.',
    ja: 'スマート電源タップ、ケトル、電子レンジ・オーブンを3つの家電ノードとして扱う。差込口のライトで接続を識別し、各製品の電力や動作状態を伝える。',
    zh: '智能排插、热水壶和微波/烤箱是三个家电节点。排插灯光帮助辨认连接，各设备再呈现自身的功率或工作状态。',
  },
  'factory-planning': {
    en: 'The renders separate production, storage, office, and service zones, and mark visitor routes and safety-related doors.',
    ja: 'レンダリングで生産、倉庫、オフィス、サービスの各ゾーンを分け、見学動線と安全に関わる扉の位置を示す。',
    zh: '厂区模型以分区标注空间功能，并标出参观动线和消防、物流门等安全相关位置。',
  },
  'corporate-vi': {
    en: 'The VI manual develops a geometric K mark from a text-led identity and defines its grid, color, and applications.',
    ja: 'VIマニュアルでは文字中心の識別から幾何学的なKマークへ展開し、グリッド、色、応用を規定する。',
    zh: 'VI 手册从文字型 Logo 发展出几何 K 标志，并规范网格、色彩和应用组合。',
  },
  'smart-oven-timing': {
    en: 'AI-generated concept: the screen beside the oven shows the predicted result (left); AI predictions of the same bread at different finishes (right).',
    ja: 'AI生成のコンセプト図：オーブン横の画面に焼き上がりの予測を表示（左）、同じパンの焼き加減ごとのAI予測（右）。',
    zh: 'AI 生成的概念图：烤箱侧边的屏幕显示烤制预想（左）；同一面包不同烤制程度的 AI 预测（右）。',
  },
}


const iconPaths: Record<string, string> = {
  camera: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  light: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z',
  pin: 'M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  phone: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',
  plug: 'M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0V8zM12 18v4',
  gauge: 'M12 14l4-4M3.3 19a10 10 0 1 1 17.4 0',
  power: 'M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  image: 'M3 5h18v14H3zM3 16l5-5 5 5M14 14l2-2 5 5M15.5 9a1.5 1.5 0 1 0 0-.01',
  hand: 'M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-2a2 2 0 0 0-4 0',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  sparkles: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  calendar: 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18',
  refresh: 'M21 12a9 9 0 0 1-15.5 6.3L3 16M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M3 21v-5h5',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  check: 'M20 6L9 17l-5-5',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  alert: 'M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  route: 'M6 19a3 3 0 1 0 0-.01M18 5a3 3 0 1 0 0-.01M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15',
  frame: 'M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4',
  cube: 'M21 16V8l-9-5-9 5v8l9 5 9-5zM3.3 7L12 12l8.7-5M12 22V12',
  layers: 'M12 2l10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5',
  pen: 'M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.6 7.6M11 13a2 2 0 1 0 0-.01',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
}

function StepIcon({ name }: { name?: string }) {
  const d = name ? iconPaths[name] : undefined
  if (!d) return null
  return (
    <span className="grid size-11 place-items-center rounded-lg border border-[#f7b718]/45 bg-[#fff4cf] text-[#b57900] dark:bg-neutral-900 dark:text-[#f7b718]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </span>
  )
}

type Chart = { title: string; unit: string; total: number; bars: [string, number, boolean?][]; note?: string }

function BarChart({ chart }: { chart: Chart }) {
  const max = Math.max(...chart.bars.map(([, v]) => v))
  return (
    <figure className="rounded-lg border border-[#f7b718]/30 bg-white p-5 dark:border-[#f7b718]/20 dark:bg-neutral-900">
      <figcaption className="text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-100">{chart.title}</figcaption>
      <p className="text-xs text-neutral-500">N = {chart.total}</p>
      <div className="mt-4 grid gap-3">
        {chart.bars.map(([label, value, highlight]) => {
          const pct = Math.round((value / chart.total) * 100)
          return (
            <div key={label} className="group grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-3" title={`${label}：${value} ${chart.unit}（${pct}%）`}>
              <span className="truncate text-xs text-neutral-600 dark:text-neutral-300">{label}</span>
              <div className="flex items-center gap-2">
                <div className="h-3 flex-1 rounded-r bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-3 rounded-r transition-opacity group-hover:opacity-80 ${highlight ? 'bg-[#f7b718]' : 'bg-neutral-400 dark:bg-neutral-500'}`}
                    style={{ width: `${(value / max) * 100}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs tabular-nums text-neutral-700 dark:text-neutral-200">{value} · {pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
      {chart.note ? <p className="mt-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{chart.note}</p> : null}
    </figure>
  )
}

export function ConceptCasePage({ id }: { id: CaseId }) {
  const { language } = useLanguage()
  const t = labels[language]
  const work = portfolioWorks[language].find((item) => item.id === id)

  if (!work) return null

  const processSection = (
    <section className="border-b border-[#f7b718]/25 bg-white dark:bg-neutral-900/30">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <h2 className="text-3xl font-semibold">{t.process}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {work.process.map(([title, description], index) => (
            <article key={title} className="border-t border-[#f7b718]/45 pt-5">
              <div className="flex items-center gap-3">
                <StepIcon name={work.processIcons?.[index]} />
                <p className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">0{index + 1}</p>
              </div>
              <h3 className="mt-3 text-xl font-semibold">{title}</h3>
              <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )

  return (
    <main>
      <header className="border-b border-[#f7b718]/25 bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
          <Link href="/works" className="text-sm text-[#f7b718] no-underline hover:text-white">← {t.back}</Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#f7b718]">{work.category} · {work.year}</p>
          <p className="mt-2 text-sm text-neutral-400">{work.period}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">{work.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-300">{work.description}</p>
          <dl className="mt-8 grid max-w-4xl gap-4 border-t border-white/15 pt-5 text-sm md:grid-cols-2">
            <div>
              <dt className="font-semibold text-[#f7b718]">{t.role}</dt>
              <dd className="mt-1 leading-6 text-neutral-400">{work.role}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#f7b718]">{t.methods}</dt>
              <dd className="mt-1 leading-6 text-neutral-400">{work.methods}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="border-b border-[#f7b718]/25 bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b57900] dark:text-[#f7b718]">{t.problem}</p>
          <h2 className="mt-4 max-w-4xl text-2xl font-semibold leading-snug md:text-3xl md:leading-snug">{work.question}</h2>
        </div>
      </section>

      {work.research ? (
        <section className="border-b border-[#f7b718]/25 bg-[#fffaf0] dark:bg-neutral-950">
          <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
            <h2 className="text-3xl font-semibold">{t.research}</h2>
            <p className="mt-4 max-w-4xl leading-7 text-neutral-600 dark:text-neutral-300">{work.research.sample}</p>
            {work.research.charts?.length ? (
              <div className={`mt-8 grid gap-4 ${work.research.charts.length === 4 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                {work.research.charts.map((chart) => <BarChart key={chart.title} chart={chart} />)}
              </div>
            ) : null}
            {!work.research.charts?.length && work.research.metrics.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {work.research.metrics.map(([value, label, detail]) => (
                <div key={label} className="rounded-lg border border-[#f7b718]/30 bg-white p-5 dark:bg-neutral-900">
                  <p className="text-3xl font-semibold text-[#b57900] dark:text-[#f7b718]">{value}</p>
                  <h3 className="mt-3 text-sm font-semibold leading-6">{label}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{detail}</p>
                </div>
              ))}
            </div>
            ) : null}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {work.research.decisions.map(([title, description]) => (
                <div key={title} className="border-t border-[#f7b718]/40 pt-5">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <figure className="border-b border-[#f7b718]/25 bg-neutral-950">
        <div className="mx-auto max-w-[1500px] px-3 py-6 md:px-8 md:py-10">
          <img src={work.image} alt={`${work.title} ${t.visual}`} className="mx-auto max-h-[720px] w-full object-contain" />
          <figcaption className="mx-auto mt-6 grid max-w-6xl gap-3 border-t border-white/15 pt-5 text-white md:grid-cols-[10rem_1fr_auto]">
            <span className="text-sm font-semibold text-[#f7b718]">{t.visual}</span>
            <span className="max-w-3xl leading-7 text-neutral-300">{visualNotes[id][language]}</span>
            <a href={work.image} target="_blank" rel="noreferrer" className="text-sm text-[#f7b718] no-underline hover:text-white">{t.fullImage} ↗</a>
          </figcaption>
        </div>
      </figure>

{processSection}

      {work.videos?.length ? (
        <section className="border-b border-[#f7b718]/25 bg-neutral-950 text-white">
          <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
            <h2 className="text-3xl font-semibold">{t.videos}</h2>
            <div className={`mt-8 grid gap-6 ${work.videos.length > 1 ? 'md:grid-cols-[1.6fr_1fr]' : 'max-w-4xl'}`}>
              {work.videos.map((video) => (
                <figure key={video.src} className="overflow-hidden rounded-lg border border-white/15 bg-black">
                  <video src={video.src} poster={video.poster} controls muted playsInline preload="none" className="aspect-video w-full bg-black object-contain" />
                  <figcaption className="px-5 py-4 text-sm leading-6 text-neutral-300">{video.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {work.modules?.length ? (
        <section className="border-b border-[#f7b718]/25 bg-white dark:bg-neutral-950">
          <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
            <h2 className="text-3xl font-semibold">{t.modules}</h2>
            <div className="mt-10 grid gap-16">
              {work.modules.map((module, index) => (
                <article key={module.title} className={`grid gap-8 ${module.stacked ? '' : 'md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start'}`}>
                  <div className={module.stacked ? 'max-w-4xl' : index % 2 ? 'md:order-2' : ''}>
                    {module.kicker ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b57900] dark:text-[#f7b718]">{module.kicker}</p> : null}
                    <h3 className="mt-3 text-2xl font-semibold leading-snug">{module.title}</h3>
                    <p className="mt-4 leading-8 text-neutral-600 dark:text-neutral-300">{module.text}</p>
                    {module.points?.length ? (
                      <ul className="mt-5 grid gap-2">
                        {module.points.map((point) => (
                          <li key={point} className="flex gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[#f7b718]" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className={`grid grid-cols-2 gap-3 ${module.stacked ? (module.images.filter((image) => !image.wide).length >= 3 ? 'md:grid-cols-3' : '') : index % 2 ? 'md:order-1' : ''}`}>
                    {module.video ? (
                      <video src={module.video.src} poster={module.video.poster} autoPlay loop muted playsInline className="col-span-2 aspect-video w-full rounded-lg bg-neutral-950 object-cover" />
                    ) : null}
                    {module.images.map((image, imageIndex) => (
                      <figure key={image.src} className={`overflow-hidden rounded-lg border border-[#f7b718]/25 bg-[#fffaf0] dark:bg-neutral-900 ${image.wide ? 'col-span-2 md:col-span-full' : ''}`}>
                        <a href={image.src} target="_blank" rel="noreferrer" className="block no-underline">
                          <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className={`w-full bg-white object-contain ${image.wide ? (module.stacked ? 'h-auto' : 'max-h-[420px]') : 'aspect-[4/3]'}`} />
                        </a>
                        {image.caption ? <figcaption className="px-3 py-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{image.caption}</figcaption> : null}
                      </figure>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {work.gallery?.length ? (
        <section className="border-b border-[#f7b718]/25 bg-[#fffaf0] dark:bg-neutral-950">
          <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
            <h2 className="text-3xl font-semibold">{t.gallery}</h2>
            <div className={`mt-8 grid gap-4 ${work.gallery.filter((item) => !item.wide).length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {work.gallery.map((item) => (
                <figure key={item.image} className={`overflow-hidden rounded-lg border border-[#f7b718]/30 bg-white dark:border-[#f7b718]/20 dark:bg-neutral-900 ${item.wide ? 'md:col-span-full' : ''}`}>
                  <a href={item.image} target="_blank" rel="noreferrer" className="block no-underline">
                    <img src={item.image} alt={item.alt} loading="lazy" decoding="async" className={`w-full bg-neutral-950 object-contain ${item.wide ? 'h-auto' : 'aspect-[4/3]'}`} />
                  </a>
                  <figcaption className="px-4 py-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {work.comparison ? (
        <section className="border-b border-[#f7b718]/25 bg-white dark:bg-neutral-900/30">
          <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
            <h2 className="text-3xl font-semibold">{work.comparison.title}</h2>
            <p className="mt-4 max-w-4xl leading-7 text-neutral-600 dark:text-neutral-300">{work.comparison.intro}</p>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#f7b718]">
                    <th className="w-36 py-3 pr-4 font-semibold text-neutral-500" />
                    <th className="py-3 pr-4 font-semibold text-[#b57900] dark:text-[#f7b718]">{work.comparison.columns[0]}</th>
                    <th className="py-3 font-semibold text-neutral-700 dark:text-neutral-200">{work.comparison.columns[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {work.comparison.rows.map(([dimension, ours, theirs]) => (
                    <tr key={dimension} className="border-b border-[#f7b718]/25 align-top">
                      <th className="py-3 pr-4 font-semibold">{dimension}</th>
                      <td className="py-3 pr-4 leading-6 text-neutral-800 dark:text-neutral-100">{ours}</td>
                      <td className="py-3 leading-6 text-neutral-600 dark:text-neutral-300">{theirs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-xs leading-6 text-neutral-500">
              {t.sources}：
              {work.comparison.sources.map(([label, url], index) => (
                <span key={url}>{index ? ' · ' : ''}<a href={url} target="_blank" rel="noreferrer" className="text-neutral-500">{label}</a></span>
              ))}
            </p>
          </div>
        </section>
      ) : null}

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
              <p className="mt-3 leading-7 text-neutral-300">{work.research?.limitation ?? work.next}</p>
            </div>
            <Link href="/works" className="mt-3 text-sm font-semibold text-[#f7b718] no-underline hover:text-white">{t.other} →</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
