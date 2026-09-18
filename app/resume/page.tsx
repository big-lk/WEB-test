'use client'

import { useLanguage } from '../../components/language-context'
import { portfolioWorks } from '../../lib/portfolio-data'

const resumeProjectIds = ['co-creative-ai-training', 'transparent-driving-hud', 'fridge-timeline']

const resumeProjectVisuals: Record<string, string> = {
  'co-creative-ai-training': '/works/portfolio/generated/ai-cocreation-chat-v2.png',
  'transparent-driving-hud': '/works/portfolio/generated/hmi-risk-overlay.png',
  'fridge-timeline': '/works/portfolio/generated/fridge-system-explained-v2.png',
}

const resumeCopy = {
  en: {
    eyebrow: 'Resume',
    name: 'KONG WEIPENG',
    headline: 'Direction: Human-computer interaction and product experience design',
    graduation: 'Master’s student in Japan | Expected graduation: Apr 2027',
    download: 'Resume versions',
    downloadVariants: [['General', '/resume/kong-weipeng-resume-cn.pdf'], ['Smart hardware', '/resume/kong-weipeng-resume-shenzhen-smart-hardware-cn.pdf'], ['Automotive HMI', '/resume/kong-weipeng-resume-shenzhen-automotive-hmi-cn.pdf']],
    collaborationTitle: 'Awards and University-Community Collaboration',
    collaboration: ['Second Prize, Sapporo streetcar new-vehicle design proposal competition (2025.12).', 'Advertising value enhancement project with Sapporo City Transportation Promotion Bureau (university-industry collaboration): designed a marketing and promotion proposal based on the characteristics of old and new streetcars.'],
    summary: [
      'Kansei engineering and industrial design background. I combine subjective user evaluations with physiological and behavioral data, including heart rate and eye tracking, to analyze experience differences and inform design decisions.',
      'I analyze new technology through its mechanisms and use cases, use Codex and other AI tools for prototyping workflows and WeChat mini-program development, and explore VR/MR applications in experiments and everyday life.',
      'I explain technical principles and research findings to engineering, product, design, and content colleagues, and turn research findings and user feedback into interaction flows and design explanations.',
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
    skills: ['User research', 'AI product experience', 'UI/UX design', 'Mobility HMI', 'VR/MR experience prototyping', 'AI-assisted WeChat mini-program development', 'Codex-assisted workflows', 'Cross-disciplinary communication', 'Figma / Photoshop / Illustrator', 'Blender / After Effects'],
    methods: ['Interview and observation', 'Semantic differential method', 'Subjective experience evaluation', 'Eye-tracking and heart-rate data', 'Scenario design', 'Prototype comparison', 'System mapping', 'UX journey mapping'],
    focus: [
      'Translating emotional impressions into comparable design variables.',
      'Designing AI interfaces that preserve agency, transparency, trust, and authorship.',
      'Connecting physical products, UI layers, timing, location, and everyday behavior.',
    ],
    labels: { role: 'Role', methods: 'Methods', value: 'Value' },
  },
  ja: {
    eyebrow: '履歴書',
    name: '孔 維鵬',
    headline: '専門方向：HCIとプロダクト体験デザイン',
    graduation: '日本の修士前期課程在学中 | 2027年4月修了予定',
    download: '履歴書バージョン',
    downloadVariants: [['総合版', '/resume/kong-weipeng-resume-cn.pdf'], ['スマートハードウェア', '/resume/kong-weipeng-resume-shenzhen-smart-hardware-cn.pdf'], ['自動車HMI', '/resume/kong-weipeng-resume-shenzhen-automotive-hmi-cn.pdf']],
    collaborationTitle: '受賞と地域連携',
    collaboration: ['札幌市の路面電車新車両デザイン提案募集で二等賞（2025.12）。', '札幌市交通振興局との広告価値向上プロジェクト（地域連携）：新旧の路面電車の特徴を生かしたマーケティング・プロモーション案を作成。'],
    summary: [
      '感性工学と工業デザインを背景に、主観評価と心拍・視線などの生理・行動データで体験の違いを分析し、デザイン判断の根拠にします。',
      '新しい技術製品を仕組みと利用場面から分析します。CodexなどのAIツールで試作ワークフローを構築し、WeChatミニプログラムを開発するとともに、実験と日常場面でのVR/MR活用を探究しています。',
      '技術の原理と研究結果を異なる専門領域の担当者に説明し、調査結果とユーザーフィードバックをインタラクションフローや設計説明に整理します。',
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
    skills: ['ユーザーリサーチ', 'AIプロダクト体験', 'UI/UXデザイン', 'モビリティHMI', 'VR/MR体験プロトタイプ', 'AI支援によるWeChatミニプログラム開発', 'Codexによるワークフロー構築', '専門領域間の情報整理', 'Figma / Photoshop / Illustrator', 'Blender / After Effects'],
    methods: ['インタビューと観察', 'SD法', '主観的な体験評価', '視線・心拍データ', 'シナリオ設計', '比較プロトタイプ', 'システムマッピング', 'UXジャーニーマッピング'],
    focus: [
      '感情的な印象を比較可能なデザイン変数へ翻訳する。',
      '主体性、透明性、信頼、作者性を残すAIインターフェースを設計する。',
      '物理プロダクト、UI、時間、場所、日常行動を接続する。',
    ],
    labels: { role: '担当', methods: '方法', value: '価値' },
  },
  zh: {
    eyebrow: '简历',
    name: '孔维鹏',
    headline: '专业方向：人机交互与产品体验设计',
    graduation: '硕士研究生在读（日本）｜预计 2027.04 毕业',
    download: '按岗位查看简历',
    downloadVariants: [['科技产品通用版', '/resume/kong-weipeng-resume-cn.pdf'], ['智能硬件版', '/resume/kong-weipeng-resume-shenzhen-smart-hardware-cn.pdf'], ['智能汽车 HMI 版', '/resume/kong-weipeng-resume-shenzhen-automotive-hmi-cn.pdf']],
    collaborationTitle: '奖项与校地合作',
    collaboration: ['日本札幌市路面电车新车设计方案征集二等奖（2025.12）。', '日本札幌市交通振兴局广告价值提升项目（校地合作）：结合新旧电车特点设计营销推广方案。'],
    summary: [
      '感性工学与工业设计背景，结合用户主观评价、心率和眼动等生理与行为数据分析体验差异，为设计判断提供依据。',
      '从原理和使用场景分析新技术产品。使用 Codex 等 AI 工具搭建原型开发工作流，借助 AI 开发微信小程序，探索 VR/MR 在实验与日常场景中的应用。',
      '能向工程、产品、设计与内容人员解释技术原理和研究结果，将调研发现与用户反馈整理成交互流程和设计说明。',
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
    skills: ['用户研究', 'AI 产品体验', 'UI/UX 设计', '智能驾驶 HMI', 'VR/MR 体验原型', 'AI 辅助微信小程序开发', 'Codex 工作流', '跨专业信息整理', 'Figma / Photoshop / Illustrator', 'Blender / After Effects'],
    methods: ['访谈与观察', '语义差异法', '主观体验评价', '眼动与心率数据', '比较原型', '场景设计', '系统映射', 'UX 旅程图'],
    focus: [
      '面对 AI 或自动化系统，我会先拆清楚哪些判断可以交给系统，哪些需要用户继续参与。',
      '面对提醒和辅助界面，我更关心帮助出现的时机、程度和退出方式。',
      '面对日常产品，我会把一次记录、一次驾驶、一次拍摄或一次取物，整理成能反复发生的行为流程。',
    ],
    labels: { role: '个人工作', methods: '研究方法', value: '设计方案' },
  },
}

export default function ResumePage() {
  const { language } = useLanguage()
  const t = resumeCopy[language]
  const works = portfolioWorks[language]
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
                          className="aspect-video h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </a>
                      <div>
                      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
                        <span>{work.category}</span>
                        <span>{work.year}</span>
                      </div>
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
