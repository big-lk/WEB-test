'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type WheelEvent } from 'react'
import { useLanguage } from '../components/language-context'
import { getOrderedPortfolioWorks } from '../lib/portfolio-data'

const copy = {
  en: {
    eyebrow: 'Kansei Product Design / HCI',
    title: 'KONG WEIPENG',
    role: 'I use human-centered research to turn subjective experience into product decisions.',
    intro: 'With a background in kansei engineering and industrial design, I connect product form, hardware interaction, user evaluation, and working prototypes.',
    primary: 'View Works',
    secondary: 'Research Focus',
    status: 'Sapporo City University · Human Information Design',
    heroNote: 'Design research, product meaning, and human-centered technology.',
    exploreTitle: 'Career Information',
    exploreText: 'Industrial Design B.Eng. and Human Information Design master’s student, working across product experience, smart hardware, and mobility HMI.',
    valueTitle: 'How I Turn a Problem into Design',
    valueText: 'I locate the specific break in use, decide whether the interface should prompt, explain, record, or return the decision, then compare how attention and judgment change.',
    selectedWorks: 'Selected Work',
    selectedWorksText: 'From a live eating-record mini program, AI co-creation, an AI predictive-image oven, and a fridge system to MR photography and driving HMI.',
    researchLink: 'See five research topics',
    about: 'Background and Skills',
    aboutText: 'Industrial Design B.Eng.; currently studying Human Information Design (HCI) at Sapporo City University. My work spans appliance systems, factory planning (internship) and corporate VI, AI interaction, mobility HMI, and MR. I use Figma, Adobe tools, Blender, After Effects, and Codex to make concepts and prototypes.',
    contact: 'Contact',
    previousWork: 'Previous work',
    nextWork: 'Next work',
    contactText: 'Available for portfolio review, design research conversations, and collaborative projects.',
    email: 'littlekeen@outlook.com',
    phone: 'Mobile / WeChat: +86 18475264028',
    explore: [
      ['Education', 'Industrial Design B.Eng. / Human Information Design master’s candidate', '/resume'],
      ['Direction', 'Human-computer interaction and product experience design', '/works'],
      ['Contact', 'Mobile and WeChat: +86 18475264028', '#contact'],
    ],
    process: [
      ['Question', 'How can vague preferences become concrete design material?'],
      ['Method', 'Combine interviews, scenario design, system mapping, interface prototypes, and visual storytelling.'],
      ['Observe', 'Use comparative prototypes, choice tasks, or eye tracking to see whether attention and judgment change.'],
    ],
  },
  ja: {
    eyebrow: 'インダストリアルデザイン / HCI / 感性工学',
    title: '孔 維鵬',
    role: 'AIとインターフェースが、人の判断・注意・行動をどう残せるかを研究しています。',
    intro: '感性工学と工業デザインを背景に、製品の造形、ハードウェア操作、ユーザー評価を動くプロトタイプへつなげます。',
    primary: '作品を見る',
    secondary: '研究を見る',
    status: '札幌市立大学 · 人間情報デザイン',
    heroNote: 'デザインリサーチ、プロダクトの意味、人間中心のテクノロジー。',
    exploreTitle: '応募情報',
    exploreText: '工業デザイン学士、人間情報デザイン修士前期。プロダクト体験、スマートハードウェア、モビリティHMIを横断しています。',
    valueTitle: '課題をデザインへ変える方法',
    valueText: '具体的な利用の断点を見つけ、UIが提示・説明・記録・本人の判断のどれを担うか決め、注意と判断の変化を比較します。',
    selectedWorks: '作品',
    selectedWorksText: '公開中の食事記録ミニプログラム、AI 共創、AI 予測画像オーブン、冷蔵庫システムから、MR 撮影と運転 HMI まで。',
    researchLink: '五つの研究テーマを見る',
    about: '背景とスキル',
    aboutText: 'ハルビン理工大学で工業デザインを専攻し、現在は札幌市立大学で人間情報デザイン（HCI）を学んでいます。製品システム、工場計画（インターン）と企業VI、AI・モビリティ・MRの体験を設計。Figma、Adobe製品、Blender、After Effects、Codexでコンセプトやプロトタイプを制作します。',
    contact: '連絡',
    previousWork: '前の作品',
    nextWork: '次の作品',
    contactText: 'ポートフォリオレビュー、デザインリサーチ、共同プロジェクトの相談を歓迎します。',
    email: 'littlekeen@outlook.com',
    phone: '携帯 / WeChat（同一番号）：+86 18475264028',
    explore: [
      ['学歴', '工業デザイン（工学）/ 人間情報デザイン修士前期', '/resume'],
      ['専門方向', 'HCIとプロダクト体験デザイン', '/works'],
      ['連絡', '携帯 / WeChat：+86 18475264028', '#contact'],
    ],
    process: [
      ['問い', '曖昧な好みを、どのように具体的なデザイン材料へ変換できるか。'],
      ['方法', 'インタビュー、シナリオ設計、システムマッピング、UIプロトタイプ、ビジュアル表現を組み合わせる。'],
      ['観察', '比較UI、選択課題、アイトラッキングで注意と判断の変化を見る。'],
    ],
  },
  zh: {
    eyebrow: '感性工学产品设计 / HCI',
    title: '孔维鹏',
    role: '从用户研究出发定义需求，并把方案做成可体验原型的产品体验设计者。',
    intro: '工业设计本科，札幌市立大学人机交互硕士在读。做过已上线的微信小程序、带电控的冰箱模型，以及 AI 交互研究。',
    primary: '看作品',
    secondary: '看研究课题',
    status: '札幌市立大学 · 人间情报设计（人机交互 HCI 方向）',
    heroNote: '前期做产品系统，后期研究人的判断与感受。',
    exploreTitle: '求职信息',
    exploreText: '工业设计（工科）本科，人间情报设计（人机交互 HCI 方向）硕士研究生在读。专业方向为人机交互与产品体验设计。',
    valueTitle: '我怎么把问题变成设计',
    valueText: '先在具体场景里找到用户卡住的那一刻，再定义要解决的需求，最后做成能被体验和比较的原型。',
    selectedWorks: '代表项目',
    selectedWorksText: '从已上线的饮食记录小程序、AI 共创、AI 预测图像烤箱和冰箱系统，到 MR 摄影与驾驶 HMI。',
    researchLink: '看五个研究课题',
    about: '背景与能力',
    aboutText: '工业设计本科，现读札幌市立大学人间情报设计（HCI）。作品涵盖冰箱完整系统、智能插座、厂区规划（实习）与企业 VI 课程设计，以及 AI、驾驶和 MR 交互。使用 Figma、Adobe 工具、C4D、Blender、After Effects 与 Codex 制作概念和原型。',
    contact: '聊一聊',
    previousWork: '上一个作品',
    nextWork: '下一个作品',
    contactText: '产品体验、智能硬件、汽车 HMI 与用户研究方向均可联系。',
    email: 'littlekeen@outlook.com',
    phone: '手机 / 微信（同号）：+86 18475264028',
    explore: [
      ['教育', '工业设计（工科）本科 / 人间情报设计硕士在读', '/resume'],
      ['专业方向', '人机交互与产品体验设计', '/works'],
      ['联系', '手机 / 微信同号：+86 18475264028', '#contact'],
    ],
    process: [
      ['先问人', '这个场景里，用户为什么没有继续行动。'],
      ['再做界面', '把提示、记录、回看和决定权放到合适的位置。'],
      ['最后看行为', '用比较原型、选择任务或眼动追踪，看注意和判断有没有变化。'],
    ],
  },
}

export default function Home() {
  const { language } = useLanguage()
  const t = copy[language]
  const works = useMemo(() => getOrderedPortfolioWorks(language), [language])
  const [heroIndex, setHeroIndex] = useState(0)
  const [isHeroPaused, setIsHeroPaused] = useState(false)
  const heroResumeTimer = useRef<number | null>(null)
  const heroWorks = works
  const heroWork = heroWorks[heroIndex % heroWorks.length]

  useEffect(() => {
    setHeroIndex(0)
    setIsHeroPaused(false)
  }, [language])

  useEffect(() => {
    return () => {
      if (heroResumeTimer.current !== null) window.clearTimeout(heroResumeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (isHeroPaused) return

    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroWorks.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [heroWorks.length, isHeroPaused])

  const pauseHero = () => {
    setIsHeroPaused(true)
    if (heroResumeTimer.current !== null) window.clearTimeout(heroResumeTimer.current)
    heroResumeTimer.current = window.setTimeout(() => {
      setIsHeroPaused(false)
      heroResumeTimer.current = null
    }, 6500)
  }

  const shiftHero = (direction: -1 | 1) => {
    setHeroIndex((current) => (current + direction + heroWorks.length) % heroWorks.length)
    pauseHero()
  }

  const handleWorksWheel = (event: WheelEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const isVerticalWheel = Math.abs(event.deltaY) > Math.abs(event.deltaX)
    if (!isVerticalWheel) return

    const canScrollLeft = element.scrollLeft > 0
    const canScrollRight = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    const movingLeft = event.deltaY < 0
    const movingRight = event.deltaY > 0

    if ((movingLeft && canScrollLeft) || (movingRight && canScrollRight)) {
      event.preventDefault()
      element.scrollLeft += event.deltaY
    }
  }

  return (
    <main>
      <section className="border-b border-[#f7b718]/30 bg-[#fffaf0] dark:border-[#f7b718]/25 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
            <h1 className="mt-5 text-5xl font-semibold tracking-normal text-neutral-950 dark:text-white md:text-7xl">{t.title}</h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-neutral-700 dark:text-neutral-200">{t.role}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-400">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/works" className="rounded-md bg-[#f7b718] px-5 py-3 text-sm font-semibold text-black no-underline shadow-sm shadow-[#f7b718]/25 transition hover:bg-[#e1a514]">{t.primary}</Link>
              <Link href="/research" className="rounded-md border border-[#f7b718]/65 bg-white/45 px-5 py-3 text-sm font-medium text-neutral-900 no-underline transition hover:border-[#b57900] hover:bg-[#fff4cf] dark:bg-neutral-950 dark:text-neutral-100">{t.secondary}</Link>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-[#f7b718]/45 bg-neutral-950 text-white shadow-xl shadow-[#f7b718]/15 transition hover:border-[#f7b718] dark:border-[#f7b718]/35">
            {heroWork.image ? (
              <img key={heroWork.title} src={heroWork.image} alt={heroWork.title} className="absolute inset-0 size-full animate-[heroFade_4.2s_ease-in-out] object-contain opacity-72" />
            ) : (
              <div key={heroWork.title} className="absolute inset-0 grid animate-[heroFade_4.2s_ease-in-out] place-items-center bg-[#fff4cf] text-black">
                <div className="grid size-36 place-items-center rounded-full border border-[#f7b718]/60 bg-white text-6xl font-semibold text-[#b57900]">
                  +
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/36 to-[#f7b718]/18" />
            <Link href={heroWork.href} aria-label={heroWork.title} className="absolute inset-0 z-10 no-underline" />
            <div className="pointer-events-none absolute left-5 right-5 top-5 z-20 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/78">
              <span>LKD Portfolio</span>
              <span>{heroWork.year}</span>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 p-6 md:p-8">
              <p className="text-sm font-medium text-[#f7b718]">{heroWork.status}</p>
              <p className="mt-3 max-w-md text-2xl font-medium leading-snug">{heroWork.title}</p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/78">{heroWork.description}</p>
              <div className="pointer-events-auto relative z-30 mt-6 flex gap-2">
                {heroWorks.map((work, index) => (
                  <button
                    key={work.href}
                    type="button"
                    aria-label={work.title}
                    onClick={() => {
                      setHeroIndex(index)
                      pauseHero()
                    }}
                    className="group relative z-30 grid size-8 touch-manipulation place-items-center rounded-full"
                  >
                    <span className={`block h-2 rounded-full transition-all ${index === heroIndex ? 'w-10 bg-[#f7b718]' : 'w-4 bg-white/45 group-hover:bg-white/75'}`} />
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              aria-label={t.previousWork}
              onClick={() => shiftHero(-1)}
              className="absolute left-4 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-black/35 text-2xl leading-none text-white backdrop-blur transition hover:border-[#f7b718] hover:bg-[#f7b718] hover:text-black"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={t.nextWork}
              onClick={() => shiftHero(1)}
              className="absolute right-4 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-black/35 text-2xl leading-none text-white backdrop-blur transition hover:border-[#f7b718] hover:bg-[#f7b718] hover:text-black"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <section className="border-b border-[#f7b718]/20 bg-white/80 dark:border-[#f7b718]/20 dark:bg-neutral-900/25">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-6 md:grid-cols-[0.7fr_1.3fr] md:items-center md:px-8">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">{t.exploreTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{t.exploreText}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {t.explore.map(([label, description, href]) => (
              <Link key={href} href={href} className="rounded-lg border border-[#f7b718]/35 bg-[#fffaf0] p-4 no-underline transition hover:border-[#b57900] hover:bg-[#fff4cf] dark:border-[#f7b718]/25 dark:bg-neutral-950">
                <span className="font-semibold text-neutral-950 dark:text-white">{label}</span>
                <span className="mt-2 block text-sm leading-6 text-neutral-600 dark:text-neutral-300">{description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#f7b718]/20 bg-white/70 dark:border-[#f7b718]/20 dark:bg-neutral-900/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">{t.valueTitle}</h2>
            <p className="mt-4 leading-8 text-neutral-600 dark:text-neutral-300">{t.valueText}</p>
            <Link href="/research" className="mt-4 inline-block text-sm font-medium text-[#b57900] no-underline hover:text-neutral-950 dark:text-[#f7b718] dark:hover:text-white">{t.researchLink} →</Link>
          </div>
          <div className="grid gap-3">
            {t.process.map(([title, description]) => (
              <div key={title} className="rounded-lg border border-[#f7b718]/28 bg-[#fffaf0] p-4 dark:border-[#f7b718]/25 dark:bg-neutral-950">
                <p className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">{title}</p>
                <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-18">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">{t.selectedWorks}</h2>
            <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">{t.selectedWorksText}</p>
          </div>
          <Link href="/works" className="text-sm font-medium text-[#b57900] no-underline hover:text-neutral-950 dark:text-[#f7b718]">{t.primary}</Link>
        </div>

        <div className="-mx-5 overflow-x-auto px-5 pb-4 md:-mx-8 md:px-8" onWheel={handleWorksWheel}>
          <div className="flex min-w-full snap-x gap-5">
          {works.map((work) => (
            <Link href={work.href} key={work.title} className="flex w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-[#f7b718]/28 bg-white no-underline shadow-sm shadow-[#f7b718]/10 transition hover:-translate-y-1 hover:border-[#b57900] sm:w-[26rem] lg:w-[31rem] dark:border-[#f7b718]/25 dark:bg-neutral-900">
              {work.image ? (
                <img src={work.image} alt={work.title} className="h-64 w-full bg-neutral-950 object-contain" />
              ) : (
                <div className="grid h-64 place-items-center bg-[#fff4cf] px-6 text-center dark:bg-neutral-950">
                  <div>
                    <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full border border-[#f7b718]/55 bg-white text-2xl font-semibold text-[#b57900] dark:border-[#f7b718]/40 dark:bg-white dark:text-black">
                      +
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b57900] dark:text-[#f7b718]">{work.status}</p>
                  </div>
                </div>
              )}
              <div className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
                  <span>{work.type}</span>
                  <span>{work.year}</span>
                </div>
                <p className="mb-3 text-sm font-medium text-[#b57900] dark:text-[#f7b718]">{work.status}</p>
                <p className="mb-3 text-xs leading-6 text-neutral-500 dark:text-neutral-400">{work.period}</p>
                <h3 className="text-xl font-semibold">{work.title}</h3>
                <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-300">{work.description}</p>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1fr_1fr] md:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal">{t.about}</h2>
          <p className="mt-4 leading-8 text-neutral-600 dark:text-neutral-300">{t.aboutText}</p>
        </div>
        <div id="contact" className="rounded-lg border border-[#f7b718]/45 bg-neutral-950 p-6 text-white shadow-xl shadow-[#f7b718]/10 dark:border-[#f7b718]/35">
          <h2 className="text-3xl font-semibold tracking-normal">{t.contact}</h2>
          <p className="mt-4 leading-8 text-neutral-300">{t.contactText}</p>
          <a href={`mailto:${t.email}`} className="mt-8 inline-block text-lg font-medium text-[#f7b718] no-underline hover:text-white">{t.email}</a>
          <p className="mt-4 text-sm text-neutral-300">{t.phone}</p>
          <p className="mt-2 text-sm text-neutral-400">lkdesigner.top</p>
        </div>
      </section>
    </main>
  )
}
