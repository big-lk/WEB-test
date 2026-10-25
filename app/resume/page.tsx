'use client'

import { useLanguage } from '../../components/language-context'
import { getOrderedPortfolioWorks } from '../../lib/portfolio-data'

const resumeProjectIds = ['fridge-timeline', 'alive-energy-link', 'smart-oven-timing', 'co-creative-ai-training', 'transparent-driving-hud']

const resumeProjectVisuals: Record<string, string> = {
  'transparent-driving-hud': '/works/portfolio/generated/hmi-risk-overlay.png',
  'fridge-timeline': '/works/portfolio/fridge-system/exterior.jpg',
  'alive-energy-link': '/works/portfolio/alive-energy-link/cover-three-appliances.jpg',
  'smart-oven-timing': '/works/portfolio/oven-state-timing/cover-ai-oven.jpg',
  'factory-planning': '/works/portfolio/factory-safety-vi/factory-first-floor.jpg',
  'corporate-vi': '/works/portfolio/factory-safety-vi/vi-cover.jpg',
}

const resumeCopy = {
  en: {
    eyebrow: 'Resume',
    name: 'KONG WEIPENG',
    headline: 'Direction: Industrial design, HCI, and product experience design',
    graduation: 'Master’s student in Japan | Expected graduation: Apr 2027',
    download: 'Resume versions',
    downloadVariants: [['General', '/resume/kong-weipeng-resume-cn.pdf'], ['Smart hardware', '/resume/kong-weipeng-resume-shenzhen-smart-hardware-cn.pdf'], ['Automotive HMI', '/resume/kong-weipeng-resume-shenzhen-automotive-hmi-cn.pdf']],
    collaborationTitle: 'Awards and University-Community Collaboration',
    collaboration: ['Second Prize, Sapporo streetcar new-vehicle design proposal competition (2025.12).', 'Advertising value project with the Sapporo City Transportation Promotion Bureau (university–city collaboration): compared the old and new streetcars and proposed a promotion plan for each.'],
    summary: [
      'Industrial design degree, now doing kansei engineering research in an HCI master’s program. Experience in product form, CMF, hardware interaction, and 3D renders. Work includes a refrigerator system, a power strip that shows power use and helps find the right plug, factory planning and a logo from an internship at Xinfeng Technology, and a corporate VI course project.',
      'With new technology, I first work out how it works, then where it gets used. I prototype with Codex and other AI tools, built and released a WeChat mini program with AI, and am building MR prototypes on Quest 3.',
      'I can explain technical principles and research results to engineering, product, design, and content colleagues, and turn research findings and user feedback into interaction flows and design notes.',
    ],
    contact: ['Sapporo, Japan', 'Mobile / WeChat: +86 18475264028', 'Japanese JLPT N1', 'littlekeen@outlook.com', 'lkdesigner.top'],
    sections: {
      profile: 'Profile',
      education: 'Education',
      skills: 'Core Skills',
      methods: 'Research Methods',
      projects: 'Selected Projects',
      focus: 'Research Focus',
    },
    education: [
      { school: 'Sapporo City University', detail: 'Human Information Design (HCI research focus) / Master’s student', meta: 'Apr 2025 - Expected Apr 2027' },
      { school: 'Harbin University of Science and Technology', detail: 'Industrial Design / Bachelor of Engineering', meta: 'Graduated Jul 2023' },
    ],
    skills: ['Industrial product concept design', 'Product system design', 'Factory spatial planning', 'Safety wayfinding and signage', 'Corporate VI and identity standards', 'Smart-appliance interaction', 'Cable identification and power monitoring', 'CMF exploration', '3D modeling and visualization', 'User research', 'AI product experience', 'UI/UX design', 'Mobility HMI', 'VR/MR experience prototyping', 'AI-assisted WeChat mini-program development', 'Codex-assisted workflows', 'Figma / Photoshop / Illustrator', 'Blender / C4D / After Effects'],
    methods: ['Interview and observation', 'Semantic differential method', 'Subjective experience evaluation', 'Eye-tracking and heart-rate data', 'Scenario design', 'Factory zone and safety-sign mapping', 'Logo grid and application standards', 'Cable and outlet mapping', 'Power and appliance-state visualization', 'Prototype comparison', 'Product-system mapping', 'UX journey mapping'],
    focus: [
      'Breaking vague impressions like “premium” or “reassuring” into variables I can design and compare.',
      'With AI, sorting out which judgments the system can take and which the user should add.',
      'Looking at one record, one photo, or one trip to the fridge, and turning it into a flow that can repeat.',
    ],
    labels: { role: 'Role', methods: 'Methods', value: 'Value' },
  },
  ja: {
    eyebrow: '履歴書',
    name: '孔 維鵬',
    headline: '専門方向：工業デザイン、HCI、プロダクト体験',
    graduation: '日本の修士前期課程在学中 | 2027年4月修了予定',
    download: '履歴書バージョン',
    downloadVariants: [['総合版', '/resume/kong-weipeng-resume-cn.pdf'], ['スマートハードウェア', '/resume/kong-weipeng-resume-shenzhen-smart-hardware-cn.pdf'], ['自動車HMI', '/resume/kong-weipeng-resume-shenzhen-automotive-hmi-cn.pdf']],
    collaborationTitle: '受賞と地域連携',
    collaboration: ['札幌市の路面電車新車両デザイン提案募集で二等賞（2025.12）。', '札幌市交通振興局との広告価値向上プロジェクト（地域連携）：新旧の路面電車の特徴を比べ、プロモーション案を作成。'],
    summary: [
      '工業デザインを学び、現在はHCIの修士課程で感性工学の研究をしています。製品造形、CMF、ハードウェア操作、3Dレンダリングの経験があり、冷蔵庫の製品システム、消費電力が見えて差込口を探しやすい電源タップ、鑫豊科技インターンでの工場計画とロゴ、企業VIの授業課題などを制作しました。',
      '新しい技術は、まず仕組みを理解し、次にどこで使われるかを見ます。CodexなどのAIツールで試作し、AIを使ってWeChatミニプログラムを開発・公開しました。Quest 3でMRの試作も進めています。',
      '技術の原理や研究結果をエンジニア、企画、デザイン、コンテンツの担当者に説明でき、調査結果やユーザーの声をインタラクションフローと設計メモにまとめられます。',
    ],
    contact: ['札幌、日本', '携帯 / WeChat：+86 18475264028', '日本語能力試験 N1', 'littlekeen@outlook.com', 'lkdesigner.top'],
    sections: {
      profile: 'プロフィール',
      education: '学歴',
      skills: 'スキル',
      methods: '研究方法',
      projects: '代表プロジェクト',
      focus: '研究関心',
    },
    education: [
      { school: '札幌市立大学', detail: '人間情報デザイン（HCI研究）/ 修士課程在学中', meta: '2025.04 入学 - 2027.04 修了予定' },
      { school: 'ハルビン理工大学', detail: '工業デザイン（工学）/ 学士', meta: '2023.07 卒業' },
    ],
    skills: ['工業製品のコンセプトデザイン', 'プロダクトシステム設計', '工場空間計画', '安全誘導・サイン', '企業VIと識別規定', 'スマート家電の操作設計', '配線識別と電力監視', 'CMF検討', '3Dモデリングとビジュアル表現', 'ユーザーリサーチ', 'AIプロダクト体験', 'UI/UXデザイン', 'モビリティHMI', 'VR/MR体験プロトタイプ', 'AI支援によるWeChatミニプログラム開発', 'Codexによるワークフロー構築', 'Figma / Photoshop / Illustrator', 'Blender / C4D / After Effects'],
    methods: ['インタビューと観察', 'SD法', '主観的な体験評価', '視線・心拍データ', 'シナリオ設計', '工場ゾーン・安全サインの整理', 'ロゴグリッド・応用規定', '配線・差込口のマッピング', '電力と家電状態の可視化', '比較プロトタイプ', '製品システムマッピング', 'UXジャーニーマッピング'],
    focus: [
      '「高級感」「安心感」のような曖昧な印象を、デザインして比べられる変数に分ける。',
      'AIと一緒に作るとき、どの判断をシステムに任せ、どこをユーザーが補うかを整理する。',
      '一回の記録、一枚の撮影、一回の取り出しを分解し、繰り返せる行動の流れにする。',
    ],
    labels: { role: '担当', methods: '方法', value: '価値' },
  },
  zh: {
    eyebrow: '简历',
    name: '孔维鹏',
    headline: '专业方向：工业设计、人机交互与产品体验设计',
    graduation: '硕士研究生在读（日本）｜预计 2027.04 毕业',
    download: '按岗位查看简历',
    downloadVariants: [['科技产品通用版', '/resume/kong-weipeng-resume-cn.pdf'], ['智能硬件版', '/resume/kong-weipeng-resume-shenzhen-smart-hardware-cn.pdf'], ['智能汽车 HMI 版', '/resume/kong-weipeng-resume-shenzhen-automotive-hmi-cn.pdf']],
    collaborationTitle: '奖项与校地合作',
    collaboration: ['日本札幌市路面电车新车设计方案征集二等奖（2025.12）。', '日本札幌市交通振兴局广告价值提升项目（校地合作）：对比新旧两款电车的特点，做推广方案。'],
    summary: [
      '工业设计本科，硕士读人机交互、做感性工学研究。做过产品造型、CMF、硬件交互和三维效果图；代表作品有冰箱产品系统、能看出功耗和找到插头的智能插排、鑫丰科技实习中的厂区规划与 Logo，以及企业 VI 课程作业。',
      '看新技术产品时，先弄清原理，再看它用在什么场景。用 Codex 等 AI 工具做原型，借助 AI 开发并上线了一个微信小程序，也在用 Quest 3 做 MR 原型。',
      '能把技术原理和研究结果讲给工程、产品、设计和内容同事听，也能把调研发现和用户反馈整理成交互流程和设计说明。',
    ],
    contact: ['日本札幌', '手机 / 微信（同号）：+86 18475264028', '日语 JLPT N1', 'littlekeen@outlook.com', 'lkdesigner.top'],
    sections: {
      profile: '个人简介',
      education: '教育经历',
      skills: '专业能力与工具',
      methods: '研究方法',
      projects: '代表项目',
      focus: '我关心的事',
    },
    education: [
      { school: '札幌市立大学（日本）', detail: '人间情报设计（人机交互 HCI 方向）/ 硕士研究生在读', meta: '2025.04 入学 - 预计 2027.04 毕业' },
      { school: '哈尔滨理工大学', detail: '工业设计（工科）/ 本科', meta: '2023.07 毕业' },
    ],
    skills: ['工业产品概念设计', '产品系统设计', '厂区空间规划', '安全导视与标识', '企业 VI 与识别规范', '智能家电交互', '线材识别与功率监管', '产品造型与 CMF', 'C4D 三维建模与渲染', '用户研究', 'AI 产品体验', 'UI/UX 设计', '智能驾驶 HMI', 'VR/MR 体验原型', 'AI 辅助微信小程序开发', 'Codex 工作流', 'Figma / Photoshop / Illustrator', 'Blender / After Effects'],
    methods: ['访谈与观察', '语义差异法', '主观体验评价', '眼动与心率数据', '场景设计', '厂区功能分区与安全标识梳理', 'Logo 标准制图与应用规范', '线材与插孔关系梳理', '功率和家电状态可视化', '比较原型', '产品系统映射', 'UX 旅程图'],
    focus: [
      '和 AI 一起做事时，先分清哪些判断可以交给系统，哪些要用户自己补上。',
      '做提醒和辅助界面，最在意帮助什么时候出现、出现到什么程度、怎么关掉。',
      '看日常产品，习惯把一次记录、一次拍摄或一次取物拆开来看，整理成能反复发生的行为流程。',
    ],
    labels: { role: '个人工作', methods: '研究方法', value: '设计方案' },
  },
}

export default function ResumePage() {
  const { language } = useLanguage()
  const t = resumeCopy[language]
  const works = getOrderedPortfolioWorks(language)
  const selectedWorks = works.filter((work) => resumeProjectIds.includes(work.id))

  return (
    <main className="bg-[#fffaf0] dark:bg-neutral-950">
      <section className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <div className="rounded-lg border border-[#f7b718]/35 bg-white p-6 shadow-sm shadow-[#f7b718]/10 dark:border-[#f7b718]/25 dark:bg-neutral-900 md:p-10">
          <header className="grid gap-8 border-b border-[#f7b718]/35 pb-8 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-neutral-950 dark:text-white md:text-6xl">{t.name}</h1>
              <p className="mt-3 text-base font-semibold text-neutral-950 dark:text-white">{t.graduation}</p>
              <p className="mt-4 text-lg font-medium text-neutral-800 dark:text-neutral-200">{t.headline}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#b57900] dark:text-[#f7b718]">{t.download}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.downloadVariants.map(([label, href]) => (
                  <a key={href} href={href} download className="rounded-md border border-[#f7b718]/45 bg-[#fff4cf]/55 px-3 py-2 text-sm font-semibold text-neutral-900 no-underline transition hover:border-[#b57900] hover:bg-[#fff4cf] dark:border-[#f7b718]/30 dark:bg-neutral-950 dark:text-neutral-100">
                    {label}
                  </a>
                ))}
              </div>
              <div className="mt-5 max-w-3xl space-y-3 leading-8 text-neutral-600 dark:text-neutral-300">
                {t.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
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
                <div className="mt-4 grid gap-5">
                  {t.education.map((item) => (
                    <div key={item.school} className="border-t border-[#f7b718]/30 pt-4">
                      <h3 className="font-semibold text-neutral-950 dark:text-white">{item.school}</h3>
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{item.detail}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-500">{item.meta}</p>
                    </div>
                  ))}
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
              <section>
                <h2 className="text-lg font-semibold">{t.collaborationTitle}</h2>
                <ul className="mt-4 grid gap-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {t.collaboration.map((item) => <li key={item} className="border-t border-[#f7b718]/25 pt-3">{item}</li>)}
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
                <div className="mt-5 grid gap-8">
                  {selectedWorks.map((work) => (
                    <article key={work.id} className="grid gap-5 border-t border-[#f7b718]/35 pt-5 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] md:items-start">
                      <a
                        href={work.href}
                        className="block overflow-hidden rounded-md border border-[#f7b718]/30 bg-neutral-950 no-underline transition hover:border-[#b57900] dark:border-[#f7b718]/25"
                        aria-label={work.title}
                      >
                        <img
                          src={resumeProjectVisuals[work.id] ?? work.image}
                          alt={work.title}
                          className="aspect-video h-full w-full object-contain transition duration-500 hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </a>
                      <div>
                      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
                        <span>{work.category}</span>
                        <span>{work.year}</span>
                      </div>
                      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{work.period}</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-normal">
                        <a href={work.href} className="text-inherit no-underline transition hover:text-[#b57900]">{work.title}</a>
                      </h3>
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
                      </div>
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
