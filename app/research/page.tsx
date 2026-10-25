'use client'

import Link from 'next/link'
import { useLanguage } from '../../components/language-context'

type Topic = { project: string; href: string; question: string; text: string; methods: string[]; stage: string }

const copy: Record<'en' | 'ja' | 'zh', {
  eyebrow: string
  title: string
  intro: string
  topicsTitle: string
  methodLabel: string
  stageLabel: string
  viewCase: string
  topics: Topic[]
  boundaryTitle: string
  boundary: string
  earlyTitle: string
  early: string
  timelineLink: string
}> = {
  en: {
    eyebrow: 'Research topics',
    title: 'Turning feelings people can’t quite explain into variables I can design and compare',
    intro: 'For me, kansei engineering means finding the designable difference inside a vague feeling: where people feel unsure, where a cue is too intrusive, where a reminder helps, and where the decision should stay with the user. Each topic below sits inside a real project and states how far it has gone.',
    topicsTitle: 'Five topics',
    methodLabel: 'Methods',
    stageLabel: 'Stage',
    viewCase: 'View case',
    topics: [
      { project: 'Long Time No Taste', href: '/works/taste-again', question: 'Why do foods we like get forgotten?', text: 'When deciding what to eat, people only recall the last few meals. How often someone wants a food differs from person to person, so a long-term record builds a personal eating cycle that can also be searched at any time.', methods: ['57-person concept survey', 'Behavior-loop design', 'WeChat mini program'], stage: 'MVP live · no usage data yet' },
      { project: 'AI co-creation', href: '/works/ai-judgement', question: 'How to narrow the gap between a person’s own reading and the AI’s common one', text: 'People read “premium” or “cozy” differently, yet AI generates from the common reading, so results turn ordinary and users cannot see how they were understood. The interface shows the AI’s reading first and prompts users to enter their own judgment for the AI to adjust to.', methods: ['AI conversation text analysis', 'Comparative interfaces', 'Subjective evaluation', 'Eye tracking (planned)'], stage: 'Master’s research in progress · preparing the comparison and eye-tracking study' },
      { project: 'AI predictive-image oven', href: '/works/oven-state-timing', question: 'People think in results; the machine asks for parameters', text: 'A predicted image of the finished dish replaces time and temperature, so users judge by eye while the oven gets the parameters it needs.', methods: ['Visualizing sensations (color / shape / firmness)', 'AI image generation', 'Interface prototype', '66-person concept survey'], stage: 'Concept + survey · not tested on a real oven' },
      { project: 'FrameTrace', href: '/works/frametrace', question: 'At a good spot, where should I stand and which way should I shoot?', text: 'Other photographers’ positions, directions, and focal lengths are placed back in the scene, and a two-hand gesture works as a viewfinder.', methods: ['106-response concept survey (main analysis N=82)', 'Scenario design', 'Quest 3 prototype'], stage: 'Quest 3 prototype · no field test yet' },
      { project: 'Driving HMI', href: '/works/driving-attention', question: 'The steadier driver assistance gets, the less drivers watch the road', text: 'The system shows distance and speed, but not what it is worried about. The topic is how graded cues keep attention on the road while fitting Chinese regulations.', methods: ['Driving-scenario breakdown', 'Cue-intensity comparison', 'Regulation and standards review', 'Subjective evaluation (planned)'], stage: 'HMI concept · regulatory trade-offs mapped' },
    ],
    boundaryTitle: 'What has and hasn’t been tested',
    boundary: 'Most topics are still at the prototype or concept stage. The pages only describe what has been done; interface comparisons, eye tracking, and field tests are the next steps.',
    earlyTitle: 'Earlier work',
    early: 'The fridge system, ALIVE, and the internship come from an industrial-design lens: product systems, structure, and spatial identity. They are the base these topics grew from.',
    timelineLink: 'See the timeline',
  },
  ja: {
    eyebrow: '研究テーマ',
    title: 'うまく言えない感覚を、デザインし比較できる変数に分ける',
    intro: '私にとって感性工学とは、言葉にしにくい感覚の中からデザインできる違いを見つけることです。どこで自信をなくすか、どこが邪魔になるか、どこで知らせるべきか、どこを本人の判断に残すか。以下の五つのテーマはすべて実際の作品の中にあり、どこまで進んだかを明記しています。',
    topicsTitle: '五つのテーマ',
    methodLabel: '方法',
    stageLabel: '段階',
    viewCase: '事例を見る',
    topics: [
      { project: '好久没吃', href: '/works/taste-again', question: '好きな味はなぜ忘れられてしまうのか', text: '何を食べるか決める時、人は最近食べたものしか思い出せない。食べたくなる周期は人それぞれなので、長期の記録から個人の食の周期をつくり、いつでも探せるようにする。', methods: ['57名のコンセプト調査', '行動ループ設計', 'WeChat ミニプログラム開発'], stage: 'MVP 公開済み・利用データはまだない' },
      { project: 'AI 共創', href: '/works/ai-judgement', question: '個人の理解と AI の一般的な理解のずれをどう縮めるか', text: '「高級感」「温かみ」の受け取り方は人それぞれだが、AI は一般的な解釈で生成し、結果はありきたりになる。画面でまず AI の解釈を見せ、ユーザー独自の判断を入力するよう促し、AI がそれに合わせて調整する。', methods: ['AI 対話テキスト分析', '比較 UI', '主観評価', 'アイトラッキング（計画）'], stage: '修士研究進行中・比較 UI とアイトラッキング実験を準備中' },
      { project: 'AI 予測画像オーブン', href: '/works/oven-state-timing', question: '人は結果で考え、機械はパラメータを求める', text: '時間と温度の代わりに焼き上がりの予測画像を見せ、ユーザーは見た目で判断し、機械は必要な設定値を得る。', methods: ['感覚の可視化（色・形・硬さ）', 'AI 画像生成', '画面プロトタイプ', '66名のコンセプト調査'], stage: 'コンセプト＋調査・実機では未検証' },
      { project: 'FrameTrace', href: '/works/frametrace', question: '良い場所に着いても、どこに立ちどちらを撮ればいいか分からない', text: '他の撮影者の位置・向き・焦点距離を現地に戻し、両手のジェスチャーを取景器として使う。', methods: ['106件のコンセプト調査（主分析 N=82）', 'シナリオ設計', 'Quest 3 プロトタイプ'], stage: 'Quest 3 プロトタイプ・現地テストは未実施' },
      { project: '運転 HMI', href: '/works/driving-attention', question: '運転支援が安定するほど、人は道路を見なくなる', text: 'システムは距離や速度を示すが、何を気にしているかは伝えない。段階的な提示で路面への注意を保ちつつ、中国の法規にも合わせる方法を考える。', methods: ['運転場面の分解', '提示強度の比較', '法規・規格の整理', '主観評価（計画）'], stage: 'HMI コンセプト・法規との取捨選択を整理済み' },
    ],
    boundaryTitle: '検証できていること・いないこと',
    boundary: '多くのテーマはまだ試作やコンセプトの段階です。ページには実際に行ったことだけを書き、比較 UI、アイトラッキング、現地テストは次のステップとしています。',
    earlyTitle: '初期の作品',
    early: '冷蔵庫システム、ALIVE、企業インターンは工業デザインの視点（製品システム、構造、空間の識別）による作品で、これらのテーマの土台になっています。',
    timelineLink: '歩みを見る',
  },
  zh: {
    eyebrow: '研究课题',
    title: '把说不清的感受，拆成能设计、能比较的变量',
    intro: '感性工学对我来说，是从用户说不清的感受里找到可设计的差异：哪里没把握，哪里太打扰，哪里该提醒，哪里该让用户自己决定。下面五个课题都落在具体作品里，并写明做到了哪一步。',
    topicsTitle: '五个课题',
    methodLabel: '方法',
    stageLabel: '阶段',
    viewCase: '看案例',
    topics: [
      { project: '好久没吃', href: '/works/taste-again', question: '喜欢的味道为什么会被忘掉', text: '决定吃什么时，人往往只想得起最近吃过的几样。每种食物多久想吃一次因人而异，所以用长期记录形成个人的饮食周期，也方便随时查找。', methods: ['57 人概念问卷', '行为流程设计', '微信小程序开发'], stage: 'MVP 已上线 · 还没有使用数据' },
      { project: 'AI 共创', href: '/works/ai-judgement', question: '个人的理解和 AI 的通用理解，隔阂怎么缩小', text: '每个人对“高级感”“温馨”的理解不同，AI 却按大众理解生成，结果趋于平庸，用户也看不到 AI 是怎么理解的。界面先显示 AI 的理解，引导用户输入自己独特的判断，AI 再据此调整。', methods: ['AI 对话文本分析', '比较界面', '主观评价', '眼动追踪（计划）'], stage: '硕士研究进行中 · 准备界面比较与眼动实验' },
      { project: 'AI 预测图像烤箱', href: '/works/oven-state-timing', question: '人想的是结果，机器要的是参数', text: '用烤制成品的预测图代替时间和温度，用户凭眼睛判断，机器由此得到需要的参数。', methods: ['感觉的视觉化（颜色 / 形状 / 软硬）', 'AI 图像生成', '界面原型', '66 人概念调研'], stage: '概念 + 问卷 · 未用真实设备测试' },
      { project: 'FrameTrace', href: '/works/frametrace', question: '到了值得拍的地方，却不知道站哪、朝哪拍', text: '把他人的机位、朝向和焦距放回现场，并用双手手势当取景器。', methods: ['106 份概念问卷（主分析 N=82）', '场景设计', 'Quest 3 原型'], stage: 'Quest 3 原型 · 尚未实地测试' },
      { project: '驾驶 HMI', href: '/works/driving-attention', question: '辅助驾驶越稳定，人越容易放松观察', text: '系统只显示距离、速度，人不知道它“在担心什么”。研究分级提示怎样维持路面关注，同时符合国内法规。', methods: ['驾驶场景拆解', '提示强度比较', '法规与标准梳理', '主观评价（计划）'], stage: 'HMI 概念 · 已梳理法规取舍' },
    ],
    boundaryTitle: '验证到哪一步',
    boundary: '多数课题还在雏形或概念阶段。页面只写已经做到的部分；界面比较、眼动和实地测试是下一步。',
    earlyTitle: '前期作品',
    early: '冰箱系统、ALIVE 和企业实习来自工业设计视角：产品系统、结构与空间识别。它们是这些课题的出发点。',
    timelineLink: '看时间线',
  },
}

export default function ResearchPage() {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-18">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b57900] dark:text-[#f7b718]">{t.eyebrow}</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal md:text-6xl">{t.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">{t.intro}</p>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-normal">{t.topicsTitle}</h2>
        <div className="mt-6 grid gap-4">
          {t.topics.map((topic, index) => (
            <article key={topic.href} className="grid gap-5 rounded-lg border border-[#f7b718]/32 bg-white p-5 md:grid-cols-[0.9fr_1.1fr] md:p-6 dark:border-[#f7b718]/25 dark:bg-neutral-900">
              <div>
                <span className="text-sm font-semibold text-[#b57900] dark:text-[#f7b718]">0{index + 1} · {topic.project}</span>
                <h3 className="mt-3 text-xl font-semibold leading-snug">{topic.question}</h3>
                <Link href={topic.href} className="mt-4 inline-block text-sm font-medium text-[#b57900] no-underline hover:text-neutral-950 dark:text-[#f7b718] dark:hover:text-white">{t.viewCase} →</Link>
              </div>
              <div>
                <p className="leading-7 text-neutral-600 dark:text-neutral-300">{topic.text}</p>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div className="grid gap-2 border-t border-[#f7b718]/30 pt-3 md:grid-cols-[4rem_1fr]">
                    <dt className="font-semibold">{t.methodLabel}</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {topic.methods.map((method) => (
                        <span key={method} className="rounded border border-[#f7b718]/40 bg-[#fff4cf]/55 px-2 py-0.5 text-neutral-700 dark:border-[#f7b718]/25 dark:bg-neutral-950 dark:text-neutral-300">{method}</span>
                      ))}
                    </dd>
                  </div>
                  <div className="grid gap-2 border-t border-[#f7b718]/30 pt-3 md:grid-cols-[4rem_1fr]">
                    <dt className="font-semibold">{t.stageLabel}</dt>
                    <dd className="text-neutral-600 dark:text-neutral-400">{topic.stage}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#f7b718]/40 bg-[#fff4cf]/45 p-5 dark:border-[#f7b718]/25 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">{t.boundaryTitle}</h2>
          <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">{t.boundary}</p>
        </div>
        <div className="rounded-lg border border-[#f7b718]/32 bg-white p-5 dark:border-[#f7b718]/25 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">{t.earlyTitle}</h2>
          <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">{t.early}</p>
          <Link href="/timeline" className="mt-3 inline-block text-sm font-medium text-[#b57900] no-underline hover:text-neutral-950 dark:text-[#f7b718] dark:hover:text-white">{t.timelineLink} →</Link>
        </div>
      </section>
    </main>
  )
}
