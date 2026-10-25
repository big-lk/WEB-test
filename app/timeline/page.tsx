'use client'

import Link from 'next/link'
import type { WheelEvent } from 'react'
import { useLanguage, type Language } from '../../components/language-context'
import { portfolioWorks } from '../../lib/portfolio-data'

type NodeKind = 'education' | 'project' | 'milestone' | 'future'

type Course = {
  name: string
  note?: string
  key?: boolean
}

type TimelineNode = {
  period: string
  kind: NodeKind
  title: string
  subtitle?: string
  description?: string
  coursesLabel?: string
  courses?: Course[]
  works?: string[]
  images?: string[]
}

const copy: Record<Language, { eyebrow: string; title: string; intro: string; hint: string; worksLabel: string; kinds: Record<NodeKind, string>; nodes: TimelineNode[] }> = {
  zh: {
    eyebrow: 'Timeline',
    title: '从工业设计到人机交互',
    intro: '本科打下产品与结构的基础，毕业后独立做作品并取得 N1，再到日本读人机交互方向的硕士。每个阶段学了什么、做了什么，按时间排开；点作品可进入详情。',
    hint: '横向滑动查看全部 →',
    worksLabel: '这一阶段的作品',
    kinds: { education: '学习', project: '作品', milestone: '节点', future: '计划' },
    nodes: [
      {
        period: '2019.09 – 2023.07',
        kind: 'education',
        title: '哈尔滨理工大学',
        subtitle: '工业设计（工科）本科 · 4 年',
        coursesLabel: '与现在方向最相关的专业课',
        courses: [
          { name: '人机工程学', key: true },
          { name: '产品语意设计', key: true },
          { name: '系统产品设计', key: true },
          { name: '企业形象设计' },
          { name: '产品参数化设计与制造' },
          { name: '机械运动结构设计（课程设计）' },
        ],
        works: ['fridge-timeline', 'corporate-vi'],
      },
      {
        period: '2023.01 – 2023.02',
        kind: 'project',
        title: '鑫丰科技 实习',
        subtitle: '企业实习',
        description: 'B 端厂区规划：用 C4D 效果图和机械设计人员快速对齐分区与动线；设计公司 Logo，并延展为精简 VI。',
        works: ['factory-planning'],
      },
      {
        period: '2023.07 – 2024.04',
        kind: 'project',
        title: '智能互联功耗显示',
        subtitle: '独立作品',
        description: '以智能排插为中心，连接微波/烤箱和热水壶：找到线材、看见功率、联动设备状态。',
        works: ['alive-energy-link'],
      },
      {
        period: '2024.04 – 2025.04',
        kind: 'project',
        title: 'AI 图像生成烤箱',
        subtitle: '独立作品',
        description: '先看预测的烤制状态图选出想要的成品，得到参考时间，再微调时长预览细微变化；PS 搭建的界面概念。',
        works: ['smart-oven-timing'],
      },
      {
        period: '2024.09',
        kind: 'milestone',
        title: '日语 JLPT N1',
        description: '日本语能力考试最高级别。',
      },
      {
        period: '2025.04 – 至今',
        kind: 'education',
        title: '札幌市立大学（日本）',
        subtitle: '人间情报设计（人机交互 HCI）硕士在读',
        coursesLabel: '修读课程（日文原名 · 说明）',
        courses: [
          { name: 'デザイン研究法', note: '设计研究方法：统计分析、文本挖掘、联合分析、实验设计与生理 / 心理计测，以感性工学研究法为主', key: true },
          { name: 'メカトロニクス特論', note: '机电一体化：搭建电路，进行传感检测与模拟', key: true },
          { name: 'インタフェースデザイン特論', note: '界面（UI）设计', key: true },
          { name: '協創デザイン特論', note: '共创设计' },
          { name: 'ビジュアルデザイン特論', note: '视觉设计' },
          { name: '映像デザイン特論', note: '影像设计' },
          { name: '連携プロジェクト演習', note: '与地方、企业合作的项目实践' },
        ],
        works: ['co-creative-ai-training', 'transparent-driving-hud', 'frametrace', 'taste-again'],
      },
      {
        period: '2025.12',
        kind: 'milestone',
        title: '札幌市路面电车新车设计 二等奖',
        description: '日本札幌市路面电车新车设计方案征集。',
      },
      {
        period: '2027.04',
        kind: 'future',
        title: '预计硕士毕业',
        description: '寻找人机交互与产品体验设计方向的工作机会。',
      },
    ],
  },
  ja: {
    eyebrow: 'Timeline',
    title: 'インダストリアルデザインからHCIへ',
    intro: '学部でプロダクトと構造の基礎を学び、卒業後は個人制作とJLPT N1取得、その後日本でHCI分野の修士課程に進みました。各時期に学んだこと・つくったものを時系列で並べています。作品をクリックすると詳細へ移動します。',
    hint: '横にスクロールして全体を見る →',
    worksLabel: 'この時期の作品',
    kinds: { education: '学び', project: '作品', milestone: '節目', future: '予定' },
    nodes: [
      {
        period: '2019.09 – 2023.07',
        kind: 'education',
        title: 'ハルビン理工大学',
        subtitle: '工業デザイン（工学）学士 · 4年',
        coursesLabel: '現在の方向に関係の深い専門科目',
        courses: [
          { name: '人間工学', key: true },
          { name: 'プロダクトセマンティクス', key: true },
          { name: 'システムプロダクトデザイン', key: true },
          { name: 'コーポレートアイデンティティデザイン' },
          { name: 'パラメトリックデザインと製造' },
          { name: '機構運動設計（課題設計）' },
        ],
        works: ['fridge-timeline', 'corporate-vi'],
      },
      {
        period: '2023.01 – 2023.02',
        kind: 'project',
        title: '鑫豊科技 インターン',
        subtitle: '企業インターン',
        description: 'BtoBの工場計画：C4Dのレンダリングで機械設計者とゾーンや動線をすばやく確認。会社ロゴをデザインし、簡潔なVIに展開。',
        works: ['factory-planning'],
      },
      {
        period: '2023.07 – 2024.04',
        kind: 'project',
        title: 'スマート連携の消費電力表示',
        subtitle: '個人制作',
        description: 'スマート電源タップを中心に電子レンジ・オーブンと電気ケトルをつなぎ、配線探索・電力の可視化・機器の状態連携を扱う。',
        works: ['alive-energy-link'],
      },
      {
        period: '2024.04 – 2025.04',
        kind: 'project',
        title: 'AI画像生成オーブン',
        subtitle: '個人制作',
        description: '予測された焼き上がり画像から仕上がりを選んで目安時間を得て、時間を微調整しながら変化を確認する。Photoshopで制作した画面構想。',
        works: ['smart-oven-timing'],
      },
      {
        period: '2024.09',
        kind: 'milestone',
        title: '日本語能力試験 N1',
        description: '日本語能力試験の最上級。',
      },
      {
        period: '2025.04 – 現在',
        kind: 'education',
        title: '札幌市立大学',
        subtitle: 'デザイン研究科 人間情報デザイン（HCI）修士前期課程',
        coursesLabel: '履修科目',
        courses: [
          { name: 'デザイン研究法', note: '統計解析、テキストマイニング、コンジョイント分析、実験計画、生理・心理計測など感性工学系の研究法', key: true },
          { name: 'メカトロニクス特論', note: '回路制作とセンシング・シミュレーション', key: true },
          { name: 'インタフェースデザイン特論', note: 'UIデザイン', key: true },
          { name: '協創デザイン特論' },
          { name: 'ビジュアルデザイン特論' },
          { name: '映像デザイン特論' },
          { name: '連携プロジェクト演習', note: '地域・企業との連携プロジェクト' },
        ],
        works: ['co-creative-ai-training', 'transparent-driving-hud', 'frametrace', 'taste-again'],
      },
      {
        period: '2025.12',
        kind: 'milestone',
        title: '札幌市路面電車 新型車両デザイン 二等賞',
        description: '札幌市の路面電車新型車両デザイン募集。',
      },
      {
        period: '2027.04',
        kind: 'future',
        title: '修士課程修了予定',
        description: 'HCI・プロダクト体験デザイン分野での就職を目指しています。',
      },
    ],
  },
  en: {
    eyebrow: 'Timeline',
    title: 'From Industrial Design to HCI',
    intro: 'An industrial design degree built my product and structure foundations. After graduating I made independent projects and passed JLPT N1, then started an HCI master’s in Japan. Here is what I studied and made at each stage — click a project to open it.',
    hint: 'Scroll sideways to see everything →',
    worksLabel: 'Projects from this stage',
    kinds: { education: 'Study', project: 'Project', milestone: 'Milestone', future: 'Next' },
    nodes: [
      {
        period: '2019.09 – 2023.07',
        kind: 'education',
        title: 'Harbin University of Science and Technology',
        subtitle: 'B.Eng. in Industrial Design · 4 years',
        coursesLabel: 'Core courses most related to my current work',
        courses: [
          { name: 'Human Engineering', key: true },
          { name: 'Product Semantics Design', key: true },
          { name: 'System Product Design', key: true },
          { name: 'Corporate Identity Design' },
          { name: 'Product Parametric Design & Manufacturing' },
          { name: 'Course Design: Mechanical Motion Structure' },
        ],
        works: ['fridge-timeline', 'corporate-vi'],
      },
      {
        period: '2023.01 – 2023.02',
        kind: 'project',
        title: 'Internship at Xinfeng Technology',
        subtitle: 'Company internship',
        description: 'B2B plant planning: C4D renders to align quickly with mechanical designers on zones and routes; designed the company logo and extended it into a compact VI.',
        works: ['factory-planning'],
      },
      {
        period: '2023.07 – 2024.04',
        kind: 'project',
        title: 'Smart-Connected Power Display',
        subtitle: 'Independent project',
        description: 'A smart power strip links a microwave/oven and a kettle: find the right cable, see the power draw, and connect device states.',
        works: ['alive-energy-link'],
      },
      {
        period: '2024.04 – 2025.04',
        kind: 'project',
        title: 'AI Image-Generation Oven',
        subtitle: 'Independent project',
        description: 'Pick the finish you want from predicted baking-state images to get a reference time, then fine-tune the duration to preview subtle changes. A Photoshop interface concept.',
        works: ['smart-oven-timing'],
      },
      {
        period: '2024.09',
        kind: 'milestone',
        title: 'JLPT N1',
        description: 'Highest level of the Japanese-Language Proficiency Test.',
      },
      {
        period: '2025.04 – Now',
        kind: 'education',
        title: 'Sapporo City University (Japan)',
        subtitle: 'M.Des. candidate, Human Information Design (HCI)',
        coursesLabel: 'Courses taken (Japanese title · what it covers)',
        courses: [
          { name: 'デザイン研究法', note: 'Design research methods: statistics, text mining, conjoint analysis, experiment design, and physiological / psychological measurement for kansei research', key: true },
          { name: 'メカトロニクス特論', note: 'Mechatronics: building circuits, sensing, and simulation', key: true },
          { name: 'インタフェースデザイン特論', note: 'Interface (UI) design', key: true },
          { name: '協創デザイン特論', note: 'Co-creation design' },
          { name: 'ビジュアルデザイン特論', note: 'Visual design' },
          { name: '映像デザイン特論', note: 'Moving-image design' },
          { name: '連携プロジェクト演習', note: 'Collaborative projects with the city and companies' },
        ],
        works: ['co-creative-ai-training', 'transparent-driving-hud', 'frametrace', 'taste-again'],
      },
      {
        period: '2025.12',
        kind: 'milestone',
        title: 'Sapporo Streetcar Design Competition — 2nd Prize',
        description: 'Open call for the design of Sapporo’s new streetcar.',
      },
      {
        period: '2027.04',
        kind: 'future',
        title: 'Expected graduation',
        description: 'Looking for roles in HCI and product experience design.',
      },
    ],
  },
}

const dotStyles: Record<NodeKind, string> = {
  education: 'border-[#f7b718] bg-[#f7b718]',
  project: 'border-[#f7b718] bg-[#fffaf0] dark:bg-neutral-950',
  milestone: 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white',
  future: 'border-dashed border-neutral-400 bg-[#fffaf0] dark:bg-neutral-950',
}

export default function TimelinePage() {
  const { language } = useLanguage()
  const t = copy[language]
  const works = portfolioWorks[language]

  const handleWheel = (event: WheelEvent<HTMLOListElement>) => {
    const element = event.currentTarget
    if (element.scrollWidth <= element.clientWidth) return
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    const canLeft = element.scrollLeft > 0
    const canRight = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    if ((event.deltaY < 0 && canLeft) || (event.deltaY > 0 && canRight)) {
      event.preventDefault()
      element.scrollLeft += event.deltaY
    }
  }

  return (
    <main className="bg-[#fffaf0] dark:bg-neutral-950">
      <section className="mx-auto max-w-6xl px-5 pt-12 md:px-8 md:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">{t.title}</h1>
        <p className="mt-5 max-w-3xl leading-8 text-neutral-600 dark:text-neutral-300">{t.intro}</p>
        <p className="mt-8 hidden text-xs font-medium text-neutral-500 md:block">{t.hint}</p>
      </section>

      <ol
        onWheel={handleWheel}
        className="mx-auto flex max-w-6xl flex-col px-5 pb-16 pt-8 md:flex-row md:snap-x md:scroll-px-8 md:overflow-x-auto md:px-8 md:pb-20 md:pt-6"
      >
        {t.nodes.map((node, index) => {
          const isLast = index === t.nodes.length - 1
          const nodeWorks = (node.works ?? [])
            .map((id) => works.find((work) => work.id === id))
            .filter((work): work is NonNullable<typeof work> => Boolean(work))
          const wide = node.kind === 'education'

          return (
            <li
              key={node.period + node.title}
              className={`relative shrink-0 pb-10 pl-9 md:snap-start md:pb-0 md:pl-0 md:pr-6 md:pt-12 ${wide ? 'md:w-[27rem]' : 'md:w-[15.5rem]'}`}
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-[7px] top-5 w-px bg-[#f7b718]/50 md:bottom-auto md:left-5 md:right-0 md:top-[7px] md:h-px md:w-auto"
                />
              )}
              <span aria-hidden="true" className={`absolute left-0 top-1 size-4 rounded-full border-2 md:top-0 ${dotStyles[node.kind]}`} />

              <p className="text-xs font-semibold tracking-[0.12em] text-[#b57900] dark:text-[#f7b718]">
                {node.period}
                <span className="ml-2 rounded border border-[#f7b718]/40 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">{t.kinds[node.kind]}</span>
              </p>
              <h2 className="mt-2 text-xl font-semibold leading-snug">{node.title}</h2>
              {node.subtitle && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{node.subtitle}</p>}
              {node.description && <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{node.description}</p>}

              {node.images && node.images.length > 0 && (
                <div className="mt-3 grid gap-2">
                  {node.images.map((src, imageIndex) => (
                    <a
                      key={src}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-md border border-[#f7b718]/35 bg-white no-underline transition hover:border-[#b57900] dark:border-[#f7b718]/25"
                    >
                      <img
                        src={src}
                        alt={`${node.title} ${imageIndex + 1}`}
                        loading="lazy"
                        className="max-h-80 w-full object-contain transition duration-500 hover:scale-[1.02]"
                      />
                    </a>
                  ))}
                </div>
              )}

              {node.courses && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{node.coursesLabel}</p>
                  <ul className="mt-2 grid gap-1.5">
                    {node.courses.map((course) => (
                      <li
                        key={course.name}
                        className={`rounded-md border px-3 py-2 text-sm ${
                          course.key
                            ? 'border-[#f7b718]/60 bg-[#fff4cf]/70 dark:border-[#f7b718]/40 dark:bg-neutral-900'
                            : 'border-[#f7b718]/25 bg-white/60 dark:border-[#f7b718]/15 dark:bg-neutral-950'
                        }`}
                      >
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{course.name}</span>
                        {course.note && <span className="mt-0.5 block text-xs leading-5 text-neutral-500 dark:text-neutral-400">{course.note}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {nodeWorks.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{t.worksLabel}</p>
                  <div className={`mt-2 grid gap-2 ${nodeWorks.length > 1 ? 'grid-cols-2' : ''}`}>
                    {nodeWorks.map((work) => (
                      <Link
                        key={work.id}
                        href={work.href}
                        className="group overflow-hidden rounded-md border border-[#f7b718]/35 bg-white no-underline transition hover:border-[#b57900] dark:border-[#f7b718]/25 dark:bg-neutral-900"
                      >
                        {work.image && (
                          <img src={work.image} alt="" loading="lazy" className="aspect-video w-full bg-neutral-950 object-cover transition duration-500 group-hover:scale-[1.03]" />
                        )}
                        <span className="block px-2 py-1.5 text-xs font-medium leading-5 text-neutral-800 dark:text-neutral-200">{work.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </main>
  )
}
