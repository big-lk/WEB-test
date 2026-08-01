'use client'

import Link from 'next/link'
import { useLanguage } from '../../../components/language-context'

const hero = '/works/frametrace/hero.jpg'
const privateMemory = '/works/frametrace/private-memory.jpg'
const journeyImages = [
  '/works/frametrace/story-discover.jpg',
  '/works/frametrace/story-navigate.jpg',
  '/works/frametrace/story-align.jpg',
]

const copy = {
  en: {
    back: 'Back to works',
    eyebrow: 'AR travel photography · Research in progress',
    title: 'FrameTrace',
    subtitle: 'Turn photo references into spatial guidance',
    summary: 'A concept for helping travelers find a past camera position, align the frame, and revisit public or personal photo memories at the real location.',
    role: 'Independent concept research, spatial UX, AR interaction, and Quest 3 prototyping · 2025–2026',
    nav: [['Concept', '#concept'], ['Research', '#research'], ['Next direction', '#direction'], ['Prototype', '#prototype']],
    conceptKicker: 'The opportunity',
    conceptTitle: 'A saved photo does not tell you how to recreate it on site.',
    conceptCopy: 'People can see the result, but not the photographer’s exact position, direction, focal length, or composition. FrameTrace explores whether that missing information can be saved as a Photo Trace and recalled in place.',
    insight: 'From a two-dimensional reference to guidance that can be acted on in real space.',
    journey: [['Find', 'See a small number of nearby photo traces.'], ['Reach', 'Walk to the original viewpoint with simple direction and distance.'], ['Recreate', 'Stop, align the historic frame, and take a new photo.']],
    researchKicker: 'Concept-impression survey',
    researchTitle: 'What the survey suggests—not what it proves',
    researchCopy: 'The survey collected 106 responses to illustrated concepts. The primary analysis used 82 responses after excluding high-risk patterns. It helps prioritize the next prototype, but it does not yet show real headset usability or behavior.',
    metrics: [['5.65/7', 'Overall concept', 'Positive first impression'], ['5.81/7', 'Private-photo revisit', 'Highest-rated idea'], ['28.0%', 'Public viewpoint recreation', 'Most chosen single priority'], ['69.5%', 'Privacy concern', 'Largest barrier']],
    directionKicker: 'Next design direction',
    directionTitle: 'What I plan to change in the next version',
    directions: [
      ['One main task', 'Use public viewpoint recreation as the clearest entry: find, walk, align, capture.'],
      ['One emotional branch', 'Keep private-photo revisiting as a personal memory experience, separate from public traces.'],
      ['Less information while walking', 'Show only direction and distance while moving; load the frame after the user stops.'],
      ['More control', 'Explain recommendations, keep new traces private, and require an explicit choice before sharing.'],
    ],
    directionNote: 'These are design hypotheses derived from the survey. They have not yet been implemented or validated in the next prototype.',
    experienceKicker: 'Proposed next flow',
    experienceTitle: 'Find a trace, reach the viewpoint, recreate the frame',
    experience: [['01 · Discover', 'Browse only a few relevant traces nearby.'], ['02 · Navigate', 'Follow a low-distraction route to the original position.'], ['03 · Align', 'Translate photo advice into movement, camera height, and focal length.']],
    memoryKicker: 'Personal memory branch',
    memoryTitle: 'Return to a private photo without turning it into public data.',
    memoryCopy: 'A personal or family photo remains visible only to its owner. When revisiting the place, the owner may choose to open the old frame and photograph the scene again.',
    prototypeKicker: 'Current boundary',
    prototypeTitle: 'What exists today—and what comes next',
    nowTitle: 'Prototype now',
    now: ['Quest 3 hand framing', 'Composition stability, thirds, and level feedback', 'Focal-length and movement suggestions', 'Local Photo Trace saving', 'Pose Ghost experiments'],
    nextTitle: 'Next version',
    next: ['Public viewpoint recreation as one complete flow', 'Walking / stopped interface states', 'Private-photo import and revisit', 'Sharing consent and deletion controls', 'Real-place behavioral testing'],
    validationTitle: 'Next validation',
    validationCopy: 'Test with 6–10 participants. Compare finding and recreating a viewpoint with and without FrameTrace, then observe time, alignment error, distraction, privacy understanding, photo confidence, and fatigue.',
    closing: 'The survey gives FrameTrace a clearer next question. The next prototype must turn that direction into observable behavior.',
    otherWorks: 'View other works',
  },
  ja: {
    back: '作品一覧へ戻る',
    eyebrow: 'AR旅行写真・調査進行中',
    title: 'FrameTrace',
    subtitle: '写真参照を空間ガイドへ変える',
    summary: '過去の撮影位置を探し、構図を合わせ、公共または個人の写真記憶を現地で再訪するためのコンセプト。',
    role: 'コンセプト調査、空間UX、ARインタラクション、Quest 3プロトタイプを独立制作・2025–2026',
    nav: [['コンセプト', '#concept'], ['調査', '#research'], ['次の方向', '#direction'], ['プロトタイプ', '#prototype']],
    conceptKicker: '機会',
    conceptTitle: '保存した写真だけでは、現地で同じ構図を再現できない。',
    conceptCopy: '結果は見えても、撮影者の正確な位置、方向、焦点距離、構図は分からない。FrameTraceは、その不足情報をPhoto Traceとして場所に残せるかを探る。',
    insight: '二次元の参照を、現実空間で行動できるガイドへ。',
    journey: [['探す', '近くの写真トレースを少数だけ見る。'], ['到達する', '方向と距離で元の撮影位置へ歩く。'], ['再現する', '停止後に過去の構図を合わせ、新しい写真を撮る。']],
    researchKicker: 'コンセプト印象調査',
    researchTitle: '調査が示唆すること、まだ証明していないこと',
    researchCopy: 'イラストによるコンセプトに対して106件を収集し、高リスク回答を除いた82件を主分析とした。次の試作の優先順位を考える材料であり、ヘッドセットの使いやすさや実際の行動はまだ検証していない。',
    metrics: [['5.65/7', '全体コンセプト', '第一印象は肯定的'], ['5.81/7', '個人写真の再訪', '最も高い評価'], ['28.0%', '公共撮影位置の再現', '単一優先で最多'], ['69.5%', 'プライバシー懸念', '最大の障壁']],
    directionKicker: '次の設計方向',
    directionTitle: '次のバージョンで変更したいこと',
    directions: [['一つの主タスク', '公共撮影位置の再現を、探す・歩く・合わせる・撮るの入口にする。'], ['一つの感情的支線', '個人写真の再訪は公共トレースと分け、私的な記憶体験として残す。'], ['歩行中の情報を減らす', '移動中は方向と距離だけ、停止後に構図を表示する。'], ['本人の制御を増やす', '推薦理由を示し、新規記録は非公開、共有は明示的に選ぶ。']],
    directionNote: 'これは調査から得た次の設計仮説であり、まだ次期プロトタイプへの実装・検証は完了していない。',
    experienceKicker: '次に試すフロー',
    experienceTitle: 'トレースを探し、位置へ行き、構図を再現する',
    experience: [['01・発見', '近くの関連トレースを少数だけ見る。'], ['02・移動', '注意を奪わない案内で元の位置へ行く。'], ['03・構図', '助言を身体移動、カメラ高さ、焦点距離へ変える。']],
    memoryKicker: '個人記憶の支線',
    memoryTitle: '個人写真を公開データにせず、撮影場所へ戻る。',
    memoryCopy: '本人や家族の写真は所有者だけに表示する。場所を再訪した時、本人が選んだ場合だけ過去の構図を開き、もう一度撮影できる。',
    prototypeKicker: '現在の境界',
    prototypeTitle: '今あるものと、次に作るもの',
    nowTitle: '現在のプロトタイプ',
    now: ['Quest 3の手勢構図', '安定度、三分割、水平フィードバック', '焦点距離と移動の提案', 'ローカルPhoto Trace保存', 'Pose Ghost実験'],
    nextTitle: '次のバージョン',
    next: ['公共撮影位置を再現する一貫したフロー', '歩行中／停止中の画面状態', '個人写真の取込と再訪', '共有同意と削除操作', '実際の場所での行動テスト'],
    validationTitle: '次の検証',
    validationCopy: '6〜10名で、FrameTraceなし／ありの撮影位置探索と再現を比較する。時間、構図誤差、歩行中の注意、公開状態の理解、写真への自信、疲労を観察する。',
    closing: '調査によって次の問いは明確になった。次のプロトタイプでは、その方向を実際の行動として検証する。',
    otherWorks: '他の作品を見る',
  },
  zh: {
    back: '返回作品列表',
    eyebrow: '跨时间摄影引导 · 研究进行中',
    title: 'FrameTrace',
    subtitle: '和另一个时间的人在同一空间共同摄影',
    summary: '探索如何通过 MR 眼镜，把公共摄影机位、私人旧照和另一个时间的观看方式，变成真实地点中可再次进入的共同摄影体验。',
    role: '独立完成概念研究、空间 UX、MR 交互与 Quest 3 原型 · 2025–2026',
    nav: [['概念', '#concept'], ['调查', '#research'], ['下一步方向', '#direction'], ['原型', '#prototype']],
    conceptKicker: '问题背景',
    conceptTitle: '看到一张照片，并不等于进入了那个人当时所在的空间。',
    conceptCopy: '用户能看到成片，却通常不知道摄影者站在哪里、看向哪里、为何这样构图。FrameTrace 探索能否把这些关系保存成 Photo Trace，让后来者或未来的自己在同一地点重新进入那次拍摄。',
    insight: '把二维照片参考，转化为真实空间中跨时间的共同摄影体验。',
    journey: [['寻找', '只查看附近少量摄影痕迹。'], ['到达', '用简单的方向和距离走到原机位。'], ['复现', '停止后对齐历史构图，完成新的拍摄。']],
    researchKicker: '概念印象调查',
    researchTitle: '调查能提示方向，但还不能替代行为验证',
    researchCopy: '调查针对概念图文收集了 106 份回答，排除高风险回答后的主分析为 N=82。它用于确定下一版原型的优先级，但还不能代表头显中的真实可用性和用户行为。',
    metrics: [['5.65/7', '整体概念', '第一印象积极'], ['5.81/7', '私人旧照回访', '评价最高的想法'], ['28.0%', '公共机位复现', '单一首选最多'], ['69.5%', '隐私顾虑', '最大采用门槛']],
    directionKicker: '下一步设计假设',
    directionTitle: '下一版需要进一步验证什么',
    directions: [['一个主要任务', '把公共机位复现整理为寻找、行走、对齐、拍摄的一条主线。'], ['一个情感支线', '把私人旧照回访与公共痕迹分开，保留为个人记忆体验。'], ['一个空间共创', '让用户理解自己正在和另一个时间的观看方式共同完成拍摄。'], ['增加用户控制', '解释推荐原因；新痕迹默认私密；分享必须主动选择。']],
    directionNote: '这些是调查结果提出的下一步设计假设，目前还没有在新版原型中完成实现和验证。',
    experienceKicker: '下一版拟验证流程',
    experienceTitle: '发现痕迹、到达机位、对齐构图',
    experience: [['01 · 发现', '只浏览附近少量相关摄影痕迹。'], ['02 · 导航', '用低干扰的方式走到过去的机位。'], ['03 · 对齐', '把摄影建议转化成移动、机位高度与焦距。']],
    memoryKicker: '私人记忆支线',
    memoryTitle: '回到一张私人旧照，但不把它变成公共数据。',
    memoryCopy: '自己或家人的旧照只对本人显示。回到附近后，只有用户主动选择时才打开过去的构图，并完成一次新的拍摄。',
    prototypeKicker: '当前范围',
    prototypeTitle: '现在已经有什么，下一步准备做什么',
    nowTitle: '当前原型',
    now: ['Quest 3 手势取景', '稳定度、三分线与水平反馈', '焦距和移动建议', '本地 Photo Trace 保存', 'Pose Ghost 实验'],
    nextTitle: '下一版计划',
    next: ['公共机位复现的完整流程', '行走态与停止态界面', '私人旧照导入与回访', '分享授权与删除操作', '真实地点中的行为测试'],
    validationTitle: '接下来要看什么',
    validationCopy: '招募 6–10 名用户，对比不用 FrameTrace 与使用 FrameTrace 时寻找和复现机位的表现，观察完成时间、构图误差、行走分心、隐私状态理解、拍摄信心与疲劳。',
    closing: '调查让 FrameTrace 的下一步问题更清楚；下一版原型要把这些方向变成可观察的真实行为。',
    otherWorks: '查看其他作品',
  },
} as const

export default function FrameTraceCasePage() {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <main className="bg-[#f4f8f7] text-[#102a33] dark:bg-[#07161c] dark:text-white">
      <section className="relative min-h-[72vh] overflow-hidden border-b border-cyan-300/25 bg-[#06171d] text-white">
        <img src={hero} alt="" className="absolute inset-0 size-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06171d] via-[#06171d]/62 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06171d] via-transparent to-[#06171d]/20" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-between px-5 py-10 md:px-8 md:py-14">
          <Link href="/works" className="w-fit text-sm text-cyan-100 no-underline hover:text-cyan-300">← {t.back}</Link>
          <div className="max-w-3xl pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{t.eyebrow}</p>
            <h1 className="mt-4 text-6xl font-semibold leading-none md:text-8xl">{t.title}</h1>
            <p className="mt-5 text-xl font-medium text-cyan-100 md:text-2xl">{t.subtitle}</p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{t.summary}</p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">{t.role}</p>
          </div>
        </div>
      </section>

      <nav aria-label="Case study sections" className="sticky top-[112px] z-40 overflow-x-auto border-b border-cyan-900/15 bg-[#f4f8f7]/95 backdrop-blur sm:top-[65px] dark:bg-[#07161c]/95">
        <div className="mx-auto flex max-w-6xl min-w-max gap-6 px-5 py-3 text-sm md:px-8">
          {t.nav.map(([label, href]) => <a key={href} href={href} className="font-medium text-[#47636a] no-underline hover:text-[#007f91] dark:text-white/65 dark:hover:text-cyan-300">{label}</a>)}
        </div>
      </nav>

      <section id="concept" className="scroll-mt-36 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007f91] dark:text-cyan-300">{t.conceptKicker}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{t.conceptTitle}</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[#47636a] dark:text-white/70">{t.conceptCopy}</p>
            <p className="mt-6 border-l-4 border-[#ef7656] pl-5 text-xl font-semibold leading-8">{t.insight}</p>
          </div>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {t.journey.map(([title, description], index) => (
            <article key={title} className="rounded-xl border border-cyan-950/10 bg-white p-5 dark:border-cyan-100/10 dark:bg-white/[0.04]">
              <span className="text-xs font-semibold text-[#ef7656]">0{index + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#557078] dark:text-white/60">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="research" className="scroll-mt-36 border-y border-cyan-300/20 bg-[#071c24] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{t.researchKicker}</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{t.researchTitle}</h2>
            </div>
            <p className="text-lg leading-8 text-white/65">{t.researchCopy}</p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {t.metrics.map(([value, label, detail]) => (
              <div key={label} className="bg-[#071c24] p-5">
                <p className="text-3xl font-semibold text-[#ff8b69]">{value}</p>
                <h3 className="mt-3 font-semibold">{label}</h3>
                <p className="mt-2 text-xs leading-5 text-white/50">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="direction" className="scroll-mt-36 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007f91] dark:text-cyan-300">{t.directionKicker}</p>
        <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{t.directionTitle}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {t.directions.map(([title, description], index) => (
            <article key={title} className="rounded-xl border border-cyan-950/10 bg-white p-5 dark:border-cyan-100/10 dark:bg-white/[0.04]">
              <span className="text-xs font-semibold text-[#ef7656]">NEXT 0{index + 1}</span>
              <h3 className="mt-3 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#557078] dark:text-white/60">{description}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 rounded-xl border border-[#ef7656]/30 bg-[#ef7656]/10 p-5 text-sm font-medium leading-7">{t.directionNote}</p>
      </section>

      <section className="bg-[#06171d] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{t.experienceKicker}</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{t.experienceTitle}</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {journeyImages.map((image, index) => (
              <article key={image}>
                <img src={image} alt={t.experience[index][0]} loading="lazy" className="aspect-video w-full rounded-xl border border-cyan-100/15 object-cover" />
                <h3 className="mt-4 font-semibold text-cyan-300">{t.experience[index][0]}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{t.experience[index][1]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
        <img src={privateMemory} alt={t.memoryTitle} loading="lazy" className="w-full rounded-xl border border-cyan-950/10 dark:border-cyan-100/10" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007f91] dark:text-cyan-300">{t.memoryKicker}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{t.memoryTitle}</h2>
          <p className="mt-6 text-lg leading-8 text-[#557078] dark:text-white/65">{t.memoryCopy}</p>
        </div>
      </section>

      <section id="prototype" className="scroll-mt-36 bg-[#071c24] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{t.prototypeKicker}</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{t.prototypeTitle}</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/[0.06] p-6">
              <h3 className="text-xl font-semibold text-cyan-300">{t.nowTitle}</h3>
              <ul className="mt-5 grid gap-3">
                {t.now.map((item) => <li key={item} className="text-sm leading-6 text-white/70">✓ {item}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-[#ef7656]/25 bg-[#ef7656]/[0.05] p-6">
              <h3 className="text-xl font-semibold text-[#ff9a7d]">{t.nextTitle}</h3>
              <ul className="mt-5 grid gap-3">
                {t.next.map((item) => <li key={item} className="text-sm leading-6 text-white/65">→ {item}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-8 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold">{t.validationTitle}</h3>
            <p className="mt-3 max-w-4xl leading-8 text-white/65">{t.validationCopy}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f8f7] dark:bg-[#07161c]">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center md:px-8 md:py-28">
          <p className="text-2xl font-semibold leading-relaxed md:text-4xl">{t.closing}</p>
          <Link href="/works" className="mt-9 inline-flex rounded-md bg-[#0ca6b8] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#07899a]">{t.otherWorks} <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
      </section>
    </main>
  )
}
