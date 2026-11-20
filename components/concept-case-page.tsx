'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from './language-context'
import { portfolioWorks } from '../lib/portfolio-data'
import KanseiSignature from './kansei-signature'
import { kansei } from '../lib/kansei'

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
    en: 'The dinner example is an illustrative scenario. The side panel lists the AI’s reading item by item; users can add a sentence to correct it, or change who decides an item.',
    ja: '夕食の例は説明用の想定場面。右側パネルがAIの読み取りを項目ごとに示し、ユーザーは一文を補って直すか、項目ごとに誰が判断するかを変えられる。',
    zh: '晚餐示例为说明用的设想场景。右侧面板逐项列出 AI 的理解，用户可以补一句话修正，或改某一项由谁判断。',
  },
  'transparent-driving-hud': {
    en: 'Driver view in the VR test scene (scenario 1, S1): a child steps out from between parked cars on the right. The pedestrian badge and arrow at the lower edge of the HUD point to the child; “L2” on the left is the system status. Cars, people and the city are simplified models, and the navigation screen is a mock-up.',
    ja: 'VRテスト場面の運転者視点（場面1、S1）：右側の駐車車両の間から子どもが出てくる。HUD下端の歩行者バッジと矢印が子どもの方向を指し、左の「L2」はシステムの状態。車両・人・街は簡易モデルで、ナビ画面はイメージ。',
    zh: 'VR 测试场景中的驾驶员视角（第 1 章，S1）：儿童从右侧停放车辆间走出，HUD 下缘的行人徽章和箭头指向儿童所在方位，左侧「L2」是系统状态。车辆、行人和城市为简化模型，导航界面为示意。',
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
    <span className="grid size-11 place-items-center rounded-2xl border border-[#EEAF1C]/45 bg-[#F6ECD2] text-[#A87A07] dark:bg-neutral-900 dark:text-[#EEAF1C]">
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
    <figure className="rounded-2xl border border-black/[0.08] bg-white/60 backdrop-blur-xl p-5 dark:border-white/10 dark:bg-neutral-900">
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
                    className={`h-3 rounded-r transition-opacity group-hover:opacity-80 ${highlight ? 'bg-[#EEAF1C]' : 'bg-neutral-400 dark:bg-neutral-500'}`}
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

/** 白底草图：在纸色背景上用正片叠底去掉白底 */
const isSketch = (src: string) => /sketch|ergonomics/.test(src)

const chapterLabels = {
  zh: { problem: '问题', research: '调研', solution: '方案', gallery: '过程资料', compare: '对比', end: '结论与当前阶段', parts: '方案分成以下几部分，后文逐一展开：', findings: '调研让方案多了三条要求：', meta: ['角色', '方法', '时间'], contents: '目录' },
  ja: { problem: '課題', research: '調査', solution: '提案', gallery: 'プロセス資料', compare: '比較', end: '結論と現在の段階', parts: '提案は次の要素からなり、以下で順に説明する：', findings: '調査から、提案に次の三つの条件が加わった：', meta: ['担当', '方法', '期間'], contents: '目次' },
  en: { problem: 'Problem', research: 'Research', solution: 'Solution', gallery: 'Process material', compare: 'Comparison', end: 'Takeaways and status', parts: 'The solution has the following parts, each covered below:', findings: 'The research added three requirements:', meta: ['Role', 'Methods', 'Period'], contents: 'Contents' },
}

type Fig = { src: string; alt: string; caption?: string; wide?: boolean }

/** 文中插图：按图片实际比例排——横长图（宽高比 ≥ 1.45）独占一行，其余两张并排 */
function FigItem({ f }: { f: Fig }) {
  const [wide, setWide] = useState(!!f.wide)
  const ref = useRef<HTMLImageElement>(null)
  const check = () => { const im = ref.current; if (im && im.naturalWidth && im.naturalWidth / im.naturalHeight >= 1.45) setWide(true) }
  useEffect(() => { if (ref.current?.complete) check() }, [])
  return (
    <figure className={`min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
      <a href={f.src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[14px] bg-[#F7F4EE] no-underline ring-1 ring-black/[0.06] dark:bg-neutral-900 dark:ring-white/10">
        <img
          src={f.src}
          alt={f.alt}
          loading="lazy"
          decoding="async"
          ref={ref}
          onLoad={check}
          className={`mx-auto block h-auto w-full object-contain ${wide ? 'max-h-[640px]' : 'max-h-[520px]'} ${isSketch(f.src) ? 'mix-blend-multiply dark:bg-white dark:mix-blend-normal' : ''}`}
        />
      </a>
      {f.caption ? <figcaption className="mt-2.5 text-[13px] leading-6 text-[#74777F]">{f.caption}</figcaption> : null}
    </figure>
  )
}

function Figures({ items, video }: { items: Fig[]; video?: { src: string; poster?: string } }) {
  if (!items.length && !video) return null
  return (
    <div className="mt-8 grid items-start gap-x-6 gap-y-8 sm:grid-cols-2">
      {video ? <video src={video.src} poster={video.poster} autoPlay loop muted playsInline className="aspect-video w-full rounded-[14px] bg-[#14161B] object-cover sm:col-span-2" /> : null}
      {items.map((f, i) => <FigItem key={f.src} f={items.length === 1 ? { ...f, wide: true } : f} />)}
    </div>
  )
}

function Chapter({ id, no, title, children }: { id: string; no: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} data-chapter={id} className="scroll-mt-28 border-t border-black/[0.08] pt-10 first:border-t-0 first:pt-0 dark:border-white/10">
      <h2 className="flex items-baseline gap-4 text-[26px] font-semibold leading-snug tracking-[-0.015em]">
        <span className="font-mono text-[13px] font-medium tracking-[0.1em] text-[#A87A07] dark:text-[#EEAF1C]">{no}</span>
        <span>{title}</span>
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

const P = ({ children, lead }: { children: React.ReactNode; lead?: boolean }) => (
  <p className={`max-w-[680px] ${lead ? 'text-[19px] leading-[1.85] text-[#14161B] dark:text-neutral-100' : 'text-[16px] leading-[1.95] text-[#3B3E46] dark:text-neutral-300'}`}>{children}</p>
)

export function ConceptCasePage({ id }: { id: CaseId }) {
  const { language } = useLanguage()
  const t = labels[language]
  const c = chapterLabels[language]
  const work = portfolioWorks[language].find((item) => item.id === id)
  const sig = kansei[id]
  const [active, setActive] = useState('problem')

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) setActive((vis[0].target as HTMLElement).dataset.chapter!)
    }, { rootMargin: '-20% 0px -65% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [language])

  if (!work) return null

  const modules = work.modules ?? []
  const chapters: { id: string; title: string }[] = [
    { id: 'problem', title: c.problem },
    ...(work.research ? [{ id: 'research', title: c.research }] : []),
    { id: 'solution', title: c.solution },
    ...modules.map((m, i) => ({ id: `part-${i + 1}`, title: m.title })),
    ...(work.gallery?.length ? [{ id: 'gallery', title: c.gallery }] : []),
    ...(work.comparison ? [{ id: 'compare', title: c.compare }] : []),
    { id: 'end', title: c.end },
  ]
  const no = (cid: string) => String(chapters.findIndex((x) => x.id === cid) + 1).padStart(2, '0')

  return (
    <main>
      {/* 页头 */}
      <header className="mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-10 md:grid-cols-[1fr_260px] md:items-end md:px-8 md:pb-20 md:pt-14">
        <div>
          <Link href="/works" className="text-sm text-[#74777F] no-underline hover:text-[#14161B] dark:hover:text-white">← {t.back}</Link>
          <p className="mt-12 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#A87A07] dark:text-[#EEAF1C]">{work.category}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.14] tracking-[-0.02em] md:text-[56px]">{work.title}</h1>
          <p className="mt-6 max-w-[680px] text-[19px] leading-[1.8] text-[#3B3E46] dark:text-neutral-300">{work.description}</p>
          <dl className="mt-10 grid max-w-4xl gap-6 border-t border-black/[0.1] pt-5 text-[14px] leading-6 dark:border-white/10 sm:grid-cols-[1.2fr_1.2fr_0.8fr]">
            {[work.role, work.methods, work.period].map((v, i) => (
              <div key={i}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#A4A6AD]">{c.meta[i]}</dt>
                <dd className="mt-1.5 text-[#3B3E46] dark:text-neutral-300">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        {sig ? (
          <figure className="hidden md:block">
            <KanseiSignature v={sig.v} count={3200} className="aspect-square w-full" />
            <figcaption className="text-center font-mono text-[10px] tracking-[0.14em] text-[#A4A6AD]">KANSEI · {sig.words[language].join(' / ')}</figcaption>
          </figure>
        ) : null}
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 md:grid-cols-[200px_minmax(0,1fr)] md:px-8">
        {/* 目录 */}
        <nav aria-label={c.contents} className="hidden md:block">
          <ol className="sticky top-28 grid gap-1 border-l border-black/[0.08] text-[13px] dark:border-white/10">
            {chapters.map((ch, i) => (
              <li key={ch.id}>
                <a href={`#${ch.id}`} className={`-ml-px flex gap-3 border-l py-1.5 pl-4 leading-5 no-underline transition ${active === ch.id ? 'border-[#EEAF1C] text-[#14161B] dark:text-white' : 'border-transparent text-[#9A9CA3] hover:text-[#14161B] dark:hover:text-white'}`}>
                  <span className="font-mono text-[11px] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="line-clamp-2">{ch.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="grid min-w-0 gap-16">
          <Chapter id="problem" no={no('problem')} title={c.problem}>
            <P lead>{work.question}</P>
          </Chapter>

          {work.research ? (
            <Chapter id="research" no={no('research')} title={c.research}>
              <P>{work.research.sample}</P>
              {work.research.charts?.length ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">{work.research.charts.map((chart) => <BarChart key={chart.title} chart={chart} />)}</div>
              ) : work.research.metrics.length ? (
                <dl className="mt-8 grid gap-6 sm:grid-cols-3">
                  {work.research.metrics.map(([value, label, detail]) => (
                    <div key={label} className="border-t border-black/[0.1] pt-4 dark:border-white/10">
                      <dt className="text-3xl font-light tabular-nums text-[#14161B] dark:text-white">{value}</dt>
                      <dd className="mt-2 text-[14px] font-semibold leading-6">{label}</dd>
                      <dd className="mt-1 text-[13px] leading-6 text-[#74777F]">{detail}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {work.research.decisions.length ? (
                <>
                  <div className="mt-10"><P>{c.findings}</P></div>
                  <ol className="mt-4 grid max-w-[680px] gap-4">
                    {work.research.decisions.map(([title, description], i) => (
                      <li key={title} className="grid grid-cols-[28px_1fr] text-[16px] leading-[1.9] text-[#3B3E46] dark:text-neutral-300">
                        <span className="font-mono text-[13px] leading-[1.9rem] text-[#A87A07]">{i + 1}.</span>
                        <span><b className="font-semibold text-[#14161B] dark:text-white">{title}{language === 'en' ? '. ' : '。'}</b>{description}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
            </Chapter>
          ) : null}

          <Chapter id="solution" no={no('solution')} title={c.solution}>
            <figure>
              <a href={work.image} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[14px] bg-[#14161B] no-underline">
                <img src={work.image} alt={`${work.title} ${t.visual}`} className="mx-auto max-h-[640px] w-full object-contain" />
              </a>
              <figcaption className="mt-2.5 max-w-[680px] text-[13px] leading-6 text-[#74777F]">{visualNotes[id][language]}</figcaption>
            </figure>
            <div className="mt-10"><P>{c.parts}</P></div>
            <ol className="mt-4 grid max-w-[680px] gap-3">
              {work.process.map(([title, description], i) => {
                const target = modules[i] ? `#part-${i + 1}` : undefined
                return (
                  <li key={title} className="grid grid-cols-[28px_1fr] text-[16px] leading-[1.9] text-[#3B3E46] dark:text-neutral-300">
                    <span className="font-mono text-[13px] leading-[1.9rem] text-[#A87A07]">{i + 1}.</span>
                    <span>{target ? <a href={target} className="font-semibold text-[#14161B] dark:text-white">{title}</a> : <b className="font-semibold text-[#14161B] dark:text-white">{title}</b>}{language === 'en' ? ' — ' : '——'}{description}</span>
                  </li>
                )
              })}
            </ol>
            {work.videos?.length ? (
              <div className={`mt-10 grid gap-6 ${work.videos.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                {work.videos.map((video, vi) => (
                  <figure key={video.src} className={work.videos!.length === 3 && vi === 0 ? 'sm:col-span-2' : ''}>
                    <video src={video.src} poster={video.poster} controls muted playsInline preload="none" className="aspect-video w-full rounded-[14px] bg-black object-contain" />
                    <figcaption className="mt-2.5 text-[13px] leading-6 text-[#74777F]">{video.caption}</figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </Chapter>

          {modules.map((m, i) => (
            <Chapter key={m.title} id={`part-${i + 1}`} no={no(`part-${i + 1}`)} title={m.title}>
              {m.kicker ? <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#A4A6AD]">{m.kicker}</p> : null}
              <P>{m.text}</P>
              {m.points?.length ? (
                <ul className="mt-4 grid max-w-[680px] gap-2">
                  {m.points.map((point) => (
                    <li key={point} className="grid grid-cols-[20px_1fr] text-[15px] leading-[1.85] text-[#3B3E46] dark:text-neutral-300">
                      <span aria-hidden="true" className="mt-[0.8em] size-1.5 rounded-full bg-[#EEAF1C]" /><span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Figures items={m.images} video={m.video} />
            </Chapter>
          ))}

          {work.gallery?.length ? (
            <Chapter id="gallery" no={no('gallery')} title={c.gallery}>
              <Figures items={work.gallery.map((g) => ({ src: g.image, alt: g.alt, caption: g.caption, wide: g.wide }))} />
            </Chapter>
          ) : null}

          {work.comparison ? (
            <Chapter id="compare" no={no('compare')} title={work.comparison.title}>
              <P>{work.comparison.intro}</P>
              <div className="mt-8 grid gap-6 md:hidden">
                {work.comparison.rows.map(([dimension, ours, theirs]) => (
                  <div key={dimension} className="border-t border-black/[0.1] pt-4">
                    <h3 className="text-[15px] font-semibold">{dimension}</h3>
                    <p className="mt-2 text-[14px] leading-6"><span className="text-[#A87A07]">{work.comparison?.columns[0]}：</span>{ours}</p>
                    <p className="mt-1 text-[14px] leading-6 text-[#74777F]">{work.comparison?.columns[1]}：{theirs}</p>
                  </div>
                ))}
              </div>
              <table className="mt-8 hidden w-full border-collapse text-left text-[14px] md:table">
                <thead>
                  <tr className="border-b border-[#14161B] dark:border-white/40">
                    <th className="w-32 py-3 pr-4" />
                    <th className="py-3 pr-4 font-semibold text-[#A87A07] dark:text-[#EEAF1C]">{work.comparison.columns[0]}</th>
                    <th className="py-3 font-semibold text-[#74777F]">{work.comparison.columns[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {work.comparison.rows.map(([dimension, ours, theirs]) => (
                    <tr key={dimension} className="border-b border-black/[0.08] align-top dark:border-white/10">
                      <th className="py-3.5 pr-4 font-semibold">{dimension}</th>
                      <td className="py-3.5 pr-4 leading-7 text-[#14161B] dark:text-neutral-100">{ours}</td>
                      <td className="py-3.5 leading-7 text-[#74777F]">{theirs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-5 text-[12px] leading-6 text-[#9A9CA3]">
                {t.sources}：{work.comparison.sources.map(([label, url], index) => (
                  <span key={url}>{index ? ' · ' : ''}<a href={url} target="_blank" rel="noreferrer" className="text-[#9A9CA3]">{label}</a></span>
                ))}
              </p>
            </Chapter>
          ) : null}

          <Chapter id="end" no={no('end')} title={c.end}>
            <blockquote className="max-w-[680px] border-l-2 border-[#EEAF1C] pl-6 text-[22px] font-semibold leading-[1.6] tracking-[-0.01em]">{work.outcomes[0]}</blockquote>
            <div className="mt-8 grid gap-5">
              {work.outcomes.slice(1).map((o) => <P key={o}>{o}</P>)}
              <P><b className="font-semibold text-[#14161B] dark:text-white">{t.validation}{language === 'en' ? ': ' : '：'}</b>{work.research?.limitation ?? work.next}</P>
            </div>
            <Link href="/works" className="mt-12 inline-flex items-center gap-2 rounded-[12px] border border-black/[0.12] px-4 py-2.5 text-[13px] font-semibold text-[#14161B] no-underline transition hover:border-[#14161B] dark:border-white/20 dark:text-white">{t.other} →</Link>
          </Chapter>
        </article>
      </div>
    </main>
  )
}
