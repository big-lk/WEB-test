'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/* 长文排版：所有作品页共用。一张纸色背景、一栏正文、左侧跟随目录，图片按实际比例排。 */

export type Fig = { src: string; alt: string; caption?: string; wide?: boolean }

/** 白底草图：在纸色背景上用正片叠底去掉白底 */
const isSketch = (src: string) => /sketch|ergonomics/.test(src)

export function P({ children, lead }: { children: ReactNode; lead?: boolean }) {
  return (
    <p className={`max-w-[680px] ${lead ? 'text-[19px] leading-[1.85] text-[#14161B] dark:text-neutral-100' : 'text-[16px] leading-[1.95] text-[#3B3E46] dark:text-neutral-300'}`}>{children}</p>
  )
}

export function Quote({ children }: { children: ReactNode }) {
  return <blockquote className="max-w-[680px] border-l-2 border-[#EEAF1C] pl-6 text-[21px] font-semibold leading-[1.65] tracking-[-0.01em]">{children}</blockquote>
}

/** 编号列表：粗体小标题 + 说明，连成一句 */
export function NumList({ items, en }: { items: [string, string][]; en?: boolean }) {
  return (
    <ol className="mt-4 grid max-w-[680px] gap-3">
      {items.map(([title, description], i) => (
        <li key={title} className="grid grid-cols-[28px_1fr] text-[16px] leading-[1.9] text-[#3B3E46] dark:text-neutral-300">
          <span className="font-mono text-[13px] leading-[1.9rem] text-[#A87A07]">{i + 1}.</span>
          <span><b className="font-semibold text-[#14161B] dark:text-white">{title}</b>{description ? (en ? ' — ' : '——') + description : ''}</span>
        </li>
      ))}
    </ol>
  )
}

/** 圆点列表 */
export function Bullets({ items, mark }: { items: string[]; mark?: string }) {
  return (
    <ul className="mt-4 grid max-w-[680px] gap-2">
      {items.map((point) => (
        <li key={point} className="grid grid-cols-[20px_1fr] text-[15px] leading-[1.85] text-[#3B3E46] dark:text-neutral-300">
          {mark ? <span aria-hidden="true" className="font-mono text-[12px] leading-[1.85rem] text-[#A87A07]">{mark}</span> : <span aria-hidden="true" className="mt-[0.8em] size-1.5 rounded-full bg-[#EEAF1C]" />}
          <span>{point}</span>
        </li>
      ))}
    </ul>
  )
}

/** 数字行：细线分隔，不做卡片 */
export function Stats({ items }: { items: [string, string, string?][] }) {
  return (
    <dl className={`mt-8 grid gap-6 ${items.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
      {items.map(([value, label, detail]) => (
        <div key={label} className="border-t border-black/[0.1] pt-4 dark:border-white/10">
          <dt className="text-3xl font-light tabular-nums text-[#14161B] dark:text-white">{value}</dt>
          <dd className="mt-2 text-[14px] font-semibold leading-6">{label}</dd>
          {detail ? <dd className="mt-1 text-[13px] leading-6 text-[#74777F]">{detail}</dd> : null}
        </div>
      ))}
    </dl>
  )
}

/** 小标题：章节内的次级段落 */
export function Sub({ children }: { children: ReactNode }) {
  return <h3 className="mt-10 max-w-[680px] text-[18px] font-semibold leading-snug">{children}</h3>
}

function FigItem({ f }: { f: Fig }) {
  const [wide, setWide] = useState(!!f.wide)
  const ref = useRef<HTMLImageElement>(null)
  const check = () => { const im = ref.current; if (im && im.naturalWidth && im.naturalWidth / im.naturalHeight >= 1.45) setWide(true) }
  useEffect(() => { if (ref.current?.complete) check() }, [])
  return (
    <figure className={`min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
      <a href={f.src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[14px] bg-[#F7F4EE] no-underline ring-1 ring-black/[0.06] dark:bg-neutral-900 dark:ring-white/10">
        <img ref={ref} onLoad={check} src={f.src} alt={f.alt} loading="lazy" decoding="async"
          className={`mx-auto block h-auto w-full object-contain ${wide ? 'max-h-[640px]' : 'max-h-[560px]'} ${isSketch(f.src) ? 'mix-blend-multiply dark:bg-white dark:mix-blend-normal' : ''}`} />
      </a>
      {f.caption ? <figcaption className="mt-2.5 text-[13px] leading-6 text-[#74777F]">{f.caption}</figcaption> : null}
    </figure>
  )
}

/** 文中插图：横长图（宽高比 ≥ 1.45）独占一行，其余两张并排；只有一张时通栏 */
export function Figures({ items, video, cols }: { items: Fig[]; video?: { src: string; poster?: string }; cols?: 3 }) {
  if (!items.length && !video) return null
  return (
    <div className={`mt-8 grid items-start gap-x-6 gap-y-8 ${cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {video ? <video src={video.src} poster={video.poster} autoPlay loop muted playsInline className="col-span-full aspect-video w-full rounded-[14px] bg-[#14161B] object-cover" /> : null}
      {items.map((f) => (cols === 3 ? (
        <figure key={f.src} className="min-w-0">
          <img src={f.src} alt={f.alt} loading="lazy" className="w-full rounded-[14px] ring-1 ring-black/[0.06]" />
          {f.caption ? <figcaption className="mt-2.5 text-[13px] leading-6 text-[#74777F]">{f.caption}</figcaption> : null}
        </figure>
      ) : <FigItem key={f.src} f={items.length === 1 ? { ...f, wide: true } : f} />))}
    </div>
  )
}

export function Chapter({ id, no, title, children }: { id: string; no: string; title: string; children: ReactNode }) {
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

/** 页头：返回链接、分类、标题、导语、三项信息，右侧可放一张图 */
export function LongReadHeader({ back, backHref = '/works', eyebrow, title, lead, meta, aside }: {
  back: string; backHref?: string; eyebrow: string; title: string; lead: string; meta: [string, string][]; aside?: ReactNode
}) {
  return (
    <header className={`mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14 ${aside ? 'md:grid-cols-[1fr_minmax(0,0.62fr)] md:items-end' : ''}`}>
      <div>
        <Link href={backHref} className="text-sm text-[#74777F] no-underline hover:text-[#14161B] dark:hover:text-white">← {back}</Link>
        <p className="mt-12 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#A87A07] dark:text-[#EEAF1C]">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.14] tracking-[-0.02em] md:text-[56px]">{title}</h1>
        <p className="mt-6 max-w-[680px] text-[19px] leading-[1.8] text-[#3B3E46] dark:text-neutral-300">{lead}</p>
        {meta.length ? (
          <dl className={`mt-10 grid max-w-4xl gap-6 border-t border-black/[0.1] pt-5 text-[14px] leading-6 dark:border-white/10 ${meta.length === 3 ? 'sm:grid-cols-[1.2fr_1.2fr_0.8fr]' : meta.length === 2 ? 'sm:grid-cols-2' : ''}`}>
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#A4A6AD]">{k}</dt>
                <dd className="mt-1.5 text-[#3B3E46] dark:text-neutral-300">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      {aside ? <div className="hidden md:block">{aside}</div> : null}
    </header>
  )
}

/** 正文 + 左侧目录（随滚动高亮） */
export function LongReadBody({ chapters, contentsLabel, children, deps = [] }: { chapters: { id: string; title: string }[]; contentsLabel: string; children: ReactNode; deps?: unknown[] }) {
  const [active, setActive] = useState(chapters[0]?.id ?? '')
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) setActive((vis[0].target as HTMLElement).dataset.chapter!)
    }, { rootMargin: '-20% 0px -65% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 md:grid-cols-[200px_minmax(0,1fr)] md:px-8">
      <nav aria-label={contentsLabel} className="hidden md:block">
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
      <article className="grid min-w-0 gap-16">{children}</article>
    </div>
  )
}

export const no = (chapters: { id: string }[], id: string) => String(chapters.findIndex((x) => x.id === id) + 1).padStart(2, '0')

export function OtherWorks({ label }: { label: string }) {
  return <Link href="/works" className="mt-12 inline-flex items-center gap-2 rounded-[12px] border border-black/[0.12] px-4 py-2.5 text-[13px] font-semibold text-[#14161B] no-underline transition hover:border-[#14161B] dark:border-white/20 dark:text-white">{label} →</Link>
}
