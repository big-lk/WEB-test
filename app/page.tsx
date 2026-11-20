'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useLanguage } from '../components/language-context'
import { getOrderedPortfolioWorks } from '../lib/portfolio-data'
import KanseiField from '../components/kansei-field'

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

  return (
    <main>
      <KanseiField hero={t} />

      <div className="mx-auto max-w-6xl px-5 pb-24 pt-20 md:px-8 md:pt-28">
        {/* 关于 */}
        <section className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A87A07] dark:text-[#EEAF1C]">01 · {t.about}</p>
          <div>
            <p className="max-w-[720px] text-[22px] font-medium leading-[1.7] tracking-[-0.01em] md:text-[24px]">{t.aboutText}</p>
            <dl className="mt-10 grid max-w-[880px] gap-6 border-t border-black/[0.1] pt-5 text-[14px] leading-6 dark:border-white/10 sm:grid-cols-3">
              {t.explore.map(([label, description]) => (
                <div key={label}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#A4A6AD]">{label}</dt>
                  <dd className="mt-1.5 text-[#3B3E46] dark:text-neutral-300">{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 方法 */}
        <section className="mt-24 grid gap-6 border-t border-black/[0.08] pt-10 dark:border-white/10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A87A07] dark:text-[#EEAF1C]">02 · {t.valueTitle}</p>
          <div className="max-w-[720px]">
            <p className="text-[17px] leading-[1.95] text-[#3B3E46] dark:text-neutral-300">{t.valueText}</p>
            <ol className="mt-6 grid gap-3">
              {t.process.map(([title, description], i) => (
                <li key={title} className="grid grid-cols-[28px_1fr] text-[16px] leading-[1.9] text-[#3B3E46] dark:text-neutral-300">
                  <span className="font-mono text-[13px] leading-[1.9rem] text-[#A87A07]">{i + 1}.</span>
                  <span><b className="font-semibold text-[#14161B] dark:text-white">{title}</b>{language === 'en' ? ' — ' : '——'}{description}</span>
                </li>
              ))}
            </ol>
            <Link href="/research" className="mt-6 inline-block text-[14px] font-semibold text-[#14161B] dark:text-white">{t.researchLink} →</Link>
          </div>
        </section>

        {/* 作品索引 */}
        <section className="mt-24 grid gap-6 border-t border-black/[0.08] pt-10 dark:border-white/10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A87A07] dark:text-[#EEAF1C]">03 · {t.selectedWorks}</p>
          <div>
            <p className="max-w-[720px] text-[17px] leading-[1.95] text-[#3B3E46] dark:text-neutral-300">{t.selectedWorksText}</p>
            <ol className="mt-8 border-t border-black/[0.12] dark:border-white/15">
              {works.map((work, i) => (
                <li key={work.title} className="border-b border-black/[0.08] dark:border-white/10">
                  <Link href={work.href} className="group grid grid-cols-[36px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-5 no-underline md:grid-cols-[36px_minmax(0,1fr)_160px_150px] md:gap-x-6">
                    <span className="font-mono text-[12px] tabular-nums text-[#A4A6AD]">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">
                      <span className="block text-[18px] font-semibold leading-snug text-[#14161B] transition group-hover:text-[#A87A07] dark:text-white">{work.title}</span>
                      <span className="mt-1 block text-[14px] leading-6 text-[#74777F] md:line-clamp-1">{work.description}</span>
                    </span>
                    <span className="col-start-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#9A9CA3] md:col-start-auto">{work.year} · {work.status}</span>
                    <span className="hidden overflow-hidden rounded-[10px] bg-[#F7F4EE] ring-1 ring-black/[0.06] md:block dark:bg-neutral-900">
                      {work.image ? <img src={work.cover ?? work.image} alt="" loading="lazy" className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link href="/works" className="mt-6 inline-block text-[14px] font-semibold text-[#14161B] dark:text-white">{t.primary} →</Link>
          </div>
        </section>

        {/* 联系 */}
        <section id="contact" className="mt-24 grid scroll-mt-28 gap-6 border-t border-black/[0.08] pt-10 dark:border-white/10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A87A07] dark:text-[#EEAF1C]">04 · {t.contact}</p>
          <div className="max-w-[720px]">
            <p className="text-[17px] leading-[1.95] text-[#3B3E46] dark:text-neutral-300">{t.contactText}</p>
            <a href={`mailto:${t.email}`} className="mt-6 inline-block text-[28px] font-semibold tracking-[-0.01em] text-[#14161B] dark:text-white md:text-[34px]">{t.email}</a>
            <p className="mt-3 text-[14px] text-[#74777F]">{t.phone} · lkdesigner.top</p>
          </div>
        </section>
      </div>
    </main>
  )
}
