'use client'

import Link from 'next/link'
import { useLanguage } from '../../../components/language-context'

const hero = '/works/portfolio/frametrace-grid-4.jpg'
const privateMemory = '/works/frametrace/private-memory.jpg'
const gestureImage = '/works/frametrace/gesture-framing.jpg'
const journeyImages = [
  '/works/frametrace/story-discover.jpg',
  '/works/frametrace/story-navigate.jpg',
  '/works/frametrace/story-align.jpg',
]

const copy = {
  en: {
    back: 'Back to works',
    eyebrow: 'MR glasses / Photography across time',
    title: 'FrameTrace',
    subtitle: 'Two directions: experience other photographers’ viewpoints, and frame with your hands like a viewfinder',
    summary: 'First, MR glasses show other photographers’ positions, lens directions, poses, and shooting sequences, so users can experience where and how others shot. Second, borrowing from existing viewfinder products, two-hand gestures frame a view, preview the composition, and return a focal-length recommendation.',
    role: 'Independent concept research, spatial UX, MR interaction, and Quest 3 prototyping · 2025–2026',
    nav: [['Concept', '#concept'], ['Research', '#research'], ['Next direction', '#direction'], ['Gesture viewfinder', '#gesture'], ['Prototype', '#prototype']],
    conceptKicker: 'The opportunity',
    conceptTitle: 'At a place worth photographing, most people take one wide shot at the entrance and leave.',
    conceptCopy: 'People often explore few other positions, angles, compositions, or focal lengths, and cannot see where another photographer stood or how they posed. FrameTrace places those experiences back into real space.',
    insight: 'What appears is where someone stood, which way they faced, and the focal length, so you can walk over and shoot.',
    journey: [['Direction 1 · Others’ viewpoints', 'See other photographers’ positions, lens directions, and pose traces, then follow a set of photo spots to explore further angles.'], ['Direction 2 · Gesture viewfinder', 'No separate viewfinder or raised phone: frame a view with both hands to preview it, and the system recommends a focal length.'], ['Joining the two', 'Find a position worth standing in first, then decide your own frame with gestures and take the shot.']],
    researchKicker: 'Concept-impression survey',
    researchTitle: 'What the survey suggests—not what it proves',
    researchCopy: 'The survey collected 106 responses to illustrated concepts. The primary analysis used 82 responses after excluding high-risk patterns. It helps prioritize the next prototype, but it does not yet show real headset usability or behavior.',
    metrics: [['5.65/7', 'Overall concept', 'Positive first impression'], ['5.81/7', 'Private-photo revisit', 'Highest-rated idea'], ['28.0%', 'Public viewpoint recreation', 'Most chosen single priority'], ['69.5%', 'Privacy concern', 'Largest barrier']],
    directionKicker: 'Next design direction',
    directionTitle: 'What I plan to change in the next version',
    directions: [
      ['Main task: recreate public viewpoints', 'Find, walk, align, and shoot as one path.'],
      ['Side path: revisit private photos', 'Kept apart from public traces, as personal memory only.'],
      ['Show where a viewpoint comes from', 'Tell users who left this viewpoint, so a recommendation has a source.'],
      ['More control', 'Explain recommendations, keep new traces private, and require an explicit choice before sharing.'],
    ],
    directionNote: 'These are design hypotheses derived from the survey. They have not yet been implemented or validated in the next prototype.',
    experienceKicker: 'Proposed next flow',
    experienceTitle: 'Discover viewpoints, follow a sequence, align and shoot',
    experience: [['01 · Discover', 'See nearby photographers’ positions and directions in the scene.'], ['02 · Follow', 'Follow the suggested sequence to explore further angles and poses.'], ['03 · Align', 'Stand on the suggested spot, line up with the trace, and take your own shot.']],
    gestureKicker: 'Direction 2 · Gesture viewfinder',
    gestureTitle: 'Frame it with your hands first, then decide where to stand and which lens to use.',
    gestureCopy: 'Similar viewfinder tools already exist, but they mean carrying one more device or raising a phone. Here the hands are the viewfinder: when no trace is selected and you just want to say “I want this part”, a two-hand frame expresses the intent, and the system turns it into focal length, position, and level hints.',
    gestureCaption: 'Concept storyboard (AI-generated image): observe → frame with both hands → position and focal length appear → raise the camera and shoot',
    gestureSteps: [['Observe', 'Look at the scene with the camera down.'], ['Frame', 'Form a box with both hands around what you want.'], ['Suggest', 'The frame becomes a standing spot, a direction, and a 24/35/50/70 mm suggestion.'], ['Shoot', 'Raise the camera at the marked spot; the hint fades.']],
    gestureScore: ['5.56/7', 'Gesture framing', 'Positive, but not the top-rated idea'],
    gestureDecision: 'After the survey it became an optional helper rather than the entry to every feature: it never blocks the main task and can be turned off with one tap. Naturalness and fatigue of the gesture still need testing in the headset.',
    gestureBuiltTitle: 'Already in the Quest 3 prototype',
    gestureBuilt: ['Two-hand framing box', 'Stability, rule-of-thirds, and level feedback', '24/35/50/70 mm focal-length and movement suggestions'],
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
    closing: 'The survey shows what to build first; next is watching how people actually use it on site.',
    otherWorks: 'View other works',
  },
  ja: {
    back: '作品一覧へ戻る',
    eyebrow: 'MRグラス / 時間を超えた写真体験',
    title: 'FrameTrace',
    subtitle: '二つの方向：他者の撮影位置と視点を体験し、両手でファインダーのように構図を決める',
    summary: '一つ目は、MRグラスで他者の撮影位置、レンズの方向、ポーズ、撮影順序を表示し、他者の視点を体験すること。二つ目は、既存のファインダー製品を参考に、両手のジェスチャーで画面を囲んで構図を確かめ、焦点距離の提案を受けること。',
    role: 'コンセプト調査、空間UX、MRインタラクション、Quest 3プロトタイプを独立制作・2025–2026',
    nav: [['コンセプト', '#concept'], ['調査', '#research'], ['次の方向', '#direction'], ['手で取景', '#gesture'], ['プロトタイプ', '#prototype']],
    conceptKicker: '機会',
    conceptTitle: '撮る価値のある場所に着いても、多くの人は入口で全景を一枚撮って帰ってしまう。',
    conceptCopy: '位置、角度、構図、焦点距離をさらに調整することは少なく、他者がどこに立ち、どんなポーズを取ったかも分からない。FrameTraceはその撮影経験を現実の空間に重ねる。',
    insight: '目の前に出るのは、当時の立ち位置・向き・焦点距離。そこまで歩いて撮ればいい。',
    journey: [['方向1・他者の視点', '現地で他者の撮影位置、レンズの方向、ポーズの痕跡を見て、一連の撮影地点をたどる。'], ['方向2・ジェスチャーファインダー', 'ファインダーやスマホを構えず、両手で範囲を囲んで構図を確かめ、焦点距離の提案を受ける。'], ['二つをつなぐ', '立つ価値のある位置を見つけてから、ジェスチャーで自分の画面を決めて撮影する。']],
    researchKicker: 'コンセプト印象調査',
    researchTitle: '調査が示唆すること、まだ証明していないこと',
    researchCopy: 'イラストによるコンセプトに対して106件を収集し、高リスク回答を除いた82件を主分析とした。次の試作の優先順位を考える材料であり、ヘッドセットの使いやすさや実際の行動はまだ検証していない。',
    metrics: [['5.65/7', '全体コンセプト', '第一印象は肯定的'], ['5.81/7', '個人写真の再訪', '最も高い評価'], ['28.0%', '公共撮影位置の再現', '単一優先で最多'], ['69.5%', 'プライバシー懸念', '最大の障壁']],
    directionKicker: '次の設計方向',
    directionTitle: '次のバージョンで変更したいこと',
    directions: [['主線：公共の撮影位置を再現', '探す・歩く・合わせる・撮るを一本の流れにする。'], ['支線：個人写真の再訪', '公共トレースとは分け、個人の記憶として残す。'], ['撮影位置の出どころを示す', 'この位置を誰が残したかを示し、推薦に根拠を持たせる。'], ['本人の制御を増やす', '推薦理由を示し、新規記録は非公開、共有は明示的に選ぶ。']],
    directionNote: 'これは調査から得た次の設計仮説であり、まだ次期プロトタイプへの実装・検証は完了していない。',
    experienceKicker: '次に試すフロー',
    experienceTitle: '撮影位置を発見し、順序に沿い、重ねて撮る',
    experience: [['01・発見', '現地で近くの撮影者の位置と方向を見る。'], ['02・探索', '提案された順序に沿って、角度やポーズをさらに探す。'], ['03・重ねる', '提案された位置に立ち、痕跡と重ねて自分の一枚を撮る。']],
    gestureKicker: '方向 2・ジェスチャー取景',
    gestureTitle: 'まず手で画面を囲み、それから立ち位置とレンズを決める。',
    gestureCopy: '似た取景ツールはすでにあるが、もう一台持つかスマホを構える必要がある。ここでは手そのものを取景器にする。痕跡を選んでいなくても「ここを撮りたい」と思った時、両手の枠で意図を伝え、システムが焦点距離・立ち位置・水平のヒントに変える。',
    gestureCaption: 'コンセプト絵コンテ（AI 生成画像）：観察 → 両手で枠を作る → 立ち位置と焦点距離が出る → カメラを構えて撮る',
    gestureSteps: [['観察', 'カメラを下ろしたまま現場を見る。'], ['囲む', '撮りたい範囲を両手の枠で囲む。'], ['提案', '枠が立ち位置・向き・24/35/50/70 mm の提案になる。'], ['撮る', '示された位置でカメラを構えると、ヒントは消える。']],
    gestureScore: ['5.56/7', 'ジェスチャー取景', '好意的だが最高評価ではない'],
    gestureDecision: '調査後、すべての機能の入口ではなく任意の補助に変更。主タスクを妨げず、ワンタップでオフにできる。ジェスチャーの自然さと疲労はヘッドセットでの検証が必要。',
    gestureBuiltTitle: 'Quest 3 プロトタイプで実装済み',
    gestureBuilt: ['両手の取景枠', '安定度・三分割・水平のフィードバック', '24/35/50/70 mm の焦点距離と移動の提案'],
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
    closing: '調査で、次に何を先に作るかが見えた。次は現地で実際の使われ方を見る。',
    otherWorks: '他の作品を見る',
  },
  zh: {
    back: '返回作品列表',
    eyebrow: 'MR 眼镜 / 跨时间摄影',
    title: 'FrameTrace',
    subtitle: '两个方向：体验别人的拍摄位置和视角，以及用双手手势完成取景',
    summary: 'FrameTrace 有两个方向：一是通过 MR 眼镜显示他人的机位、镜头方向、姿势与拍摄顺序，体验别人的拍摄位置和视角；二是参考市面上已有的取景器产品，用双手手势框出画面，实现取景器式的构图预览与焦距推荐。',
    role: '独立完成概念研究、空间 UX、MR 交互与 Quest 3 原型 · 2025–2026',
    nav: [['概念', '#concept'], ['调查', '#research'], ['下一步方向', '#direction'], ['手势取景', '#gesture'], ['原型', '#prototype']],
    conceptKicker: '问题背景',
    conceptTitle: '到了值得拍的地方，多数人只在入口拍一张全景就走了。',
    conceptCopy: '人们很少继续调整位置、角度、构图和焦段，也看不到别人为了那张照片站在哪里、摆了什么姿势。FrameTrace 把这些摄影经验放回真实空间。',
    insight: '眼前显示的是当时的机位、朝向和焦距，人可以照着走过去拍。',
    journey: [['方向一 · 体验别人的视角', '在现场看到他人的机位、镜头方向和姿势虚影，沿着一组拍摄点继续寻找角度。'], ['方向二 · 手势取景器', '不用另拿取景器或举起手机，双手比出画框即可预览构图，系统据此推荐镜头焦距。'], ['两者衔接', '先找到值得站的位置，再用手势决定自己的画面，完成拍摄。']],
    researchKicker: '概念印象调查',
    researchTitle: '调查能提示方向，但还不能替代行为验证',
    researchCopy: '调查针对概念图文收集了 106 份回答，排除高风险回答后的主分析为 N=82。它用于确定下一版原型的优先级，但还不能代表头显中的真实可用性和用户行为。',
    metrics: [['5.65/7', '整体概念', '第一印象积极'], ['5.81/7', '私人旧照回访', '评价最高的想法'], ['28.0%', '公共机位复现', '单一首选最多'], ['69.5%', '隐私顾虑', '最大采用门槛']],
    directionKicker: '下一步设计假设',
    directionTitle: '调查后需要进一步验证什么',
    directions: [['主线：复现公共机位', '把寻找、行走、对齐、拍摄整理成一条主线。'], ['支线：回访私人旧照', '和公共痕迹分开，只作为个人记忆保留。'], ['说明机位出处', '告诉用户这个机位是谁留下的，推荐有出处。'], ['增加用户控制', '解释推荐原因；新痕迹默认私密；分享必须主动选择。']],
    directionNote: '这些是调查结果提出的下一步设计假设，目前还没有在新版原型中完成实现和验证。',
    experienceKicker: '下一版拟验证流程',
    experienceTitle: '发现机位、跟随顺序、对齐拍摄',
    experience: [['01 · 发现', '在现场看到附近拍摄者的机位与方向。'], ['02 · 跟随', '沿着推荐顺序继续寻找角度和姿势。'], ['03 · 对齐', '站到推荐机位，与历史痕迹对齐后拍下自己的一张。']],
    gestureKicker: '方向二 · 手势取景器',
    gestureTitle: '先用手比出想拍的画面，再决定站哪、用什么焦段。',
    gestureCopy: '市面上已有类似的取景器产品，但都要多带一个设备或举起手机。这里把双手当成取景器：没有选中任何历史痕迹、只想表达“我想拍这一块”时，用双手比框说明意图，系统把它转换成焦距、站位和水平提示。',
    gestureCaption: '概念分镜（AI 生成图像）：观察现场 → 双手比框 → 生成站位与焦距 → 举机拍摄',
    gestureSteps: [['观察', '先放下相机看现场。'], ['比框', '双手框出想拍的范围。'], ['建议', '画框转换为站位、朝向和 24/35/50/70 mm 焦距建议。'], ['拍摄', '走到标记位置举起相机，提示随之淡出。']],
    gestureScore: ['5.56/7', '手势取景', '积极，但不是评价最高的想法'],
    gestureDecision: '调查后把它从“所有功能的入口”降为可选的辅助工具：不挡主任务，一键可关。手势的自然度和疲劳度还需要在头显中验证。',
    gestureBuiltTitle: 'Quest 3 原型已实现',
    gestureBuilt: ['双手取景框', '构图稳定度、三分线与水平提示', '24/35/50/70 mm 焦距与移动建议'],
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
    closing: '调查说明了下一步该先做什么；接下来要在真实地点看用户实际怎么用。',
    otherWorks: '查看其他作品',
  },
} as const

export default function FrameTraceCasePage() {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <main className="bg-[#f4f8f7] text-[#102a33] dark:bg-[#07161c] dark:text-white">
      <section className="relative min-h-[72vh] overflow-hidden border-b border-cyan-300/25 bg-[#06171d] text-white">
        <img src={hero} alt="FrameTrace 跨时间摄影的四个关键场景" className="absolute inset-0 size-full object-contain opacity-78" />
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

      <section id="gesture" className="scroll-mt-36 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007f91] dark:text-cyan-300">{t.gestureKicker}</p>
        <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{t.gestureTitle}</h2>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#557078] dark:text-white/65">{t.gestureCopy}</p>
        <figure className="mt-10">
          <img src={gestureImage} alt={t.gestureCaption} loading="lazy" className="w-full rounded-xl border border-cyan-950/10 dark:border-cyan-100/10" />
          <figcaption className="mt-3 text-xs text-[#6b8289] dark:text-white/45">{t.gestureCaption}</figcaption>
        </figure>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.gestureSteps.map(([title, description], index) => (
            <li key={title} className="rounded-xl border border-cyan-950/10 bg-white p-4 dark:border-cyan-100/10 dark:bg-white/[0.04]">
              <span className="text-xs font-semibold text-[#ef7656]">0{index + 1}</span>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-[#557078] dark:text-white/60">{description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-4 md:grid-cols-[0.8fr_1.2fr_1fr]">
          <div className="rounded-xl bg-[#071c24] p-5 text-white">
            <p className="text-3xl font-semibold text-[#ff8b69]">{t.gestureScore[0]}</p>
            <h3 className="mt-3 font-semibold">{t.gestureScore[1]}</h3>
            <p className="mt-2 text-xs leading-5 text-white/50">{t.gestureScore[2]}</p>
          </div>
          <p className="rounded-xl border border-[#ef7656]/30 bg-[#ef7656]/10 p-5 text-sm font-medium leading-7">{t.gestureDecision}</p>
          <div className="rounded-xl border border-cyan-950/10 bg-white p-5 dark:border-cyan-100/10 dark:bg-white/[0.04]">
            <h3 className="font-semibold text-[#007f91] dark:text-cyan-300">{t.gestureBuiltTitle}</h3>
            <ul className="mt-3 grid gap-2">
              {t.gestureBuilt.map((item) => <li key={item} className="text-sm leading-6 text-[#557078] dark:text-white/60">✓ {item}</li>)}
            </ul>
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
