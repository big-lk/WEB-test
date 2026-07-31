'use client'

import Link from 'next/link'
import { useLanguage } from '../../../components/language-context'

const assets = {
  hero: '/works/frametrace/hero.jpg',
  overview: '/works/frametrace/research-overview.jpg',
  concerns: '/works/frametrace/choices-concerns.jpg',
  open: '/works/frametrace/open-responses.jpg',
  privateMemory: '/works/frametrace/private-memory.jpg',
  gesture: '/works/frametrace/gesture-framing.jpg',
  pose: '/works/frametrace/pose-ghost.jpg',
}

const storyImages = [
  '/works/frametrace/story-discover.jpg',
  '/works/frametrace/story-select.jpg',
  '/works/frametrace/story-navigate.jpg',
  '/works/frametrace/story-align.jpg',
  '/works/frametrace/story-share.jpg',
]

const copy = {
  en: {
    back: 'Back to works',
    eyebrow: 'AR travel photography · Concept research · Quest 3 MVP',
    title: 'FrameTrace',
    subtitle: 'A shared spatial memory layer for travel photography',
    summary: 'FrameTrace lets people see a public viewpoint—or their own private photo memory—at the place where it was created, then navigate, align, and photograph it again.',
    role: 'Independent research, spatial UX, AR interaction, visual scenarios, and Quest 3 prototyping · 2025–2026',
    nav: [['Concept', '#concept'], ['Research', '#research'], ['Pivot', '#pivot'], ['Experience', '#experience'], ['Safety', '#safety'], ['MVP', '#mvp']],
    conceptKicker: 'From photo reference to spatial reference',
    conceptTitle: 'Good photos are easy to save, but hard to reproduce on site.',
    conceptCopy: 'A reference image rarely carries the exact viewpoint, direction, focal length, composition, or subject position needed at the real location. FrameTrace stores these relationships as a reusable Photo Trace.',
    insight: 'The opportunity is not another photo guide. It is turning photographic experience into spatial knowledge.',
    traceDataTitle: 'The minimum Photo Trace',
    traceData: ['Camera position', 'Viewing direction', 'Composition bounds', 'Suggested focal length', 'Subject position or pose tag', 'Time, light, and sharing permission'],
    flow: [['Discover', 'See a small number of nearby anonymous traces.'], ['Navigate', 'Walk to the original viewpoint with direction and distance only.'], ['Align & capture', 'Stop, load the historic frame, then adjust position and focal length.'], ['Keep or share', 'Save privately by default; publish anonymously only by choice.']],
    researchKicker: 'Concept-impression research',
    researchTitle: 'Before building more features, I tested what felt valuable—and what could block adoption.',
    researchCopy: '106 recommended survey responses covered 21 seven-point items, one-priority choices, concerns, and open answers. The main analysis excludes 24 high-risk responses; the study evaluates first impressions of illustrated concepts, not real Quest 3 performance.',
    tiers: [['106', 'Collected', 'All recommended responses'], ['82', 'Primary analysis', 'High-risk responses excluded'], ['56', 'Strict sensitivity', 'Low-risk responses only']],
    metrics: [['5.65/7', 'Overall concept', '85.4% reached agreement level'], ['5.81/7', 'Private-photo revisit', 'Highest-rated concept'], ['28.0%', 'Public viewpoint recreation', 'Most selected if only one remained'], ['69.5%', 'Privacy concern', 'Largest adoption barrier']],
    concernsTitle: 'Positive reception did not erase the risks',
    concerns: [['56.1%', 'Inaccurate recommendations'], ['52.4%', 'Walking safety'], ['43.9%', 'Occluding reality'], ['39.0%', 'Learning cost']],
    boundary: 'Research boundary: these data set product priorities and risk hypotheses. They do not prove market demand or usability in a headset.',
    pivotKicker: 'Design pivot',
    pivotTitle: 'The research changed the hierarchy, not the number of features.',
    pivots: [
      ['Gesture framing', '5.56/7: positive, but not the strongest signal.', 'Keep it as an optional way to express composition intent.'],
      ['Public viewpoint recreation', 'Most frequent single priority: 28.0%.', 'Make discover → navigate → align → capture the main task.'],
      ['Private-photo revisit', 'Highest concept score: 5.81/7.', 'Make it the emotional high point, not a minor branch.'],
      ['Recommendation', '56.1% worried it would be inaccurate.', 'Show why a trace fits and always offer alternatives.'],
      ['Privacy and safety', '69.5% and 52.4% were concerned.', 'Move consent and walking-state reduction into the main flow.'],
    ],
    storyKicker: 'Main experience',
    storyTitle: 'Follow a trace, reach the viewpoint, recreate the frame',
    storyCopy: 'The sequence deliberately reduces information while walking and restores richer guidance only after the user stops.',
    story: [['01 · Discover', 'See only a few nearby traces.'], ['02 · Choose', 'Select one recommendation and inspect why it fits.'], ['03 · Navigate', 'Walk with direction and distance, not a full AR overlay.'], ['04 · Align', 'Load the historic frame and translate advice into body movement.'], ['05 · Leave a trace', 'Save privately or explicitly publish an anonymous trace.']],
    privateKicker: 'Emotional branch',
    privateTitle: 'A private photo can become a doorway back to a place and time.',
    privateCopy: 'A personal or family photo stays private and outside public recommendations. When the owner returns, they may actively open its frame, position, and image overlay, photograph the place again, and compare how time changed it.',
    supportTitle: 'Two optional tools support the photo',
    support: [['Gesture framing', 'When no trace is selected, a two-hand frame can express “I want to photograph this area” and request position or focal-length advice.'], ['Pose Ghost', 'When a companion is present and the user opts in, a faceless outline suggests feet, body direction, and one simple action.']],
    safetyKicker: 'Trust and movement',
    safetyTitle: 'Privacy and walking safety are part of the interaction model.',
    states: [['Moving', 'Direction + distance', 'Hide people, photo cards, and composition lines.'], ['Arrived', 'Footprints + heading', 'Confirm the environment is safe before loading the frame.'], ['Aligning', 'Historic frame + physical adjustment', 'Show “left 1.2 m,” “lower 20 cm,” and “50 mm” only while stopped.']],
    rules: ['New traces are private by default.', 'Public traces omit faces and require explicit permission.', 'Sensitive places can prohibit shared traces.', 'Pause guidance near roads, steps, or dense crowds.', 'Keep the real environment visible; avoid opaque central panels.'],
    mvpKicker: 'Prototype boundary',
    mvpTitle: 'From a future concept to a testable Quest 3 MVP',
    implementedTitle: 'Implemented now',
    implemented: ['Quest 3 two-hand framing', 'Stability, thirds, and level guidance', '24 / 35 / 50 / 70 mm movement advice', 'Three Pose Ghost patterns', 'Local JSON Photo Trace saving and visualization', 'Explainable ranking inputs', 'New records default to private', 'Desktop simulation and EditMode tests'],
    nextTitle: 'Next to implement or validate',
    next: ['Shared spatial anchors at real attractions', 'Cloud-backed public traces', 'Movement detection and safety degradation', 'Consent, revoke, and delete interface', 'Private old-photo import and place binding', 'Real camera image and historic overlay'],
    validationTitle: 'Next validation',
    validationCopy: 'With 6–10 target users, compare finding a viewpoint without the system and with a public Photo Trace. Measure completion time, alignment error, distraction while walking, recommendation understanding, privacy-state comprehension, photo satisfaction, gesture naturalness, and fatigue.',
    closing: 'FrameTrace does not only help people take better photos. It turns photographic experience and personal memories into spatial knowledge that can be revisited—safely, transparently, and with consent.',
    otherWorks: 'View other works',
  },
  ja: {
    back: '作品一覧へ戻る',
    eyebrow: 'AR旅行写真・コンセプト調査・Quest 3 MVP',
    title: 'FrameTrace',
    subtitle: '旅行写真のための共有空間記憶レイヤー',
    summary: '公共の撮影位置や自分の写真記憶を、撮影された場所で見つけ、移動し、構図を合わせ、もう一度撮影できるARシステム。',
    role: '調査、空間UX、ARインタラクション、シナリオ表現、Quest 3プロトタイプを独立制作・2025–2026',
    nav: [['コンセプト', '#concept'], ['調査', '#research'], ['設計変更', '#pivot'], ['体験', '#experience'], ['安全', '#safety'], ['MVP', '#mvp']],
    conceptKicker: '写真参照から空間参照へ',
    conceptTitle: '良い写真は保存しやすいが、現地で再現するのは難しい。',
    conceptCopy: '参照写真だけでは、正確な撮影位置、方向、焦点距離、構図、人物位置が分からない。FrameTraceはこれらの関係を再利用できるPhoto Traceとして保存する。',
    insight: '機会は新しい写真攻略ではなく、撮影経験を空間知識へ変えること。',
    traceDataTitle: 'Photo Traceの最小データ',
    traceData: ['撮影位置', '視線方向', '構図境界', '推奨焦点距離', '人物位置・姿勢タグ', '時間、光、公開権限'],
    flow: [['発見', '近くの匿名トレースを少数だけ表示。'], ['移動', '方向と距離だけで元の撮影位置へ歩く。'], ['構図合わせ', '停止後に過去の構図を読み込み、位置と焦点距離を調整。'], ['保存・共有', '既定は非公開。選択した場合のみ匿名公開。']],
    researchKicker: 'コンセプト印象調査',
    researchTitle: '機能を増やす前に、価値と採用を妨げる条件を調べた。',
    researchCopy: '推薦サンプル106件。21項目の7件法、単一優先選択、懸念、自由記述を収集した。主分析は高リスク24件を除外。イラストによる第一印象評価であり、Quest 3の実使用評価ではない。',
    tiers: [['106', '収集', '推薦回答すべて'], ['82', '主分析', '高リスク回答を除外'], ['56', '厳格分析', '低リスク回答のみ']],
    metrics: [['5.65/7', '全体コンセプト', '85.4%が同意水準'], ['5.81/7', '個人写真の再訪', '最も高い評価'], ['28.0%', '公共撮影位置の再現', '一つだけ残す場合の最多選択'], ['69.5%', 'プライバシー懸念', '最大の採用障壁']],
    concernsTitle: '好意的な反応でも、リスクは消えない',
    concerns: [['56.1%', '推薦精度'], ['52.4%', '歩行安全'], ['43.9%', '現実の遮蔽'], ['39.0%', '学習コスト']],
    boundary: '調査の境界：データは優先順位とリスク仮説を決めるために用いる。市場需要やヘッドセットの使いやすさを証明するものではない。',
    pivotKicker: '設計変更',
    pivotTitle: '研究は機能数ではなく、機能の階層を変えた。',
    pivots: [['手勢構図', '5.56/7。好意的だが最強ではない。', '構図意図を伝える任意機能として残す。'], ['公共撮影位置の再現', '単一優先で最多の28.0%。', '発見→移動→構図→撮影を主タスクにする。'], ['個人写真の再訪', '最高評価5.81/7。', '小さな支線ではなく感情的な高点にする。'], ['推薦', '56.1%が不正確さを懸念。', '理由と代替案を常に表示する。'], ['プライバシーと安全', '69.5%と52.4%が懸念。', '同意と歩行時の情報削減を主フローへ入れる。']],
    storyKicker: '主体験',
    storyTitle: '過去の撮影位置を追い、構図を再現する',
    storyCopy: '歩行中は情報を意図的に減らし、停止してから詳しい撮影ガイドを表示する。',
    story: [['01・発見', '近くのトレースを少数だけ見る。'], ['02・選択', '一つを選び、推薦理由を確認。'], ['03・移動', '方向と距離だけで歩く。'], ['04・構図', '過去のフレームを身体の移動へ翻訳。'], ['05・残す', '非公開保存または匿名公開を選ぶ。']],
    privateKicker: '感情的な支線',
    privateTitle: '個人写真は、場所と時間へ戻る入口になる。',
    privateCopy: '本人や家族の写真は非公開で、公共推薦には入らない。再訪時に本人が開いた場合だけ構図、位置、写真の重ね合わせを表示し、時間の変化を再撮影できる。',
    supportTitle: '写真を支える二つの任意ツール',
    support: [['手勢構図', 'トレース未選択時、両手フレームで「この範囲を撮りたい」と伝え、位置や焦点距離の助言を受ける。'], ['Pose Ghost', '同行者がいて本人が有効にした時だけ、顔のない輪郭で足位置、体の方向、短い動作を示す。']],
    safetyKicker: '信頼と移動',
    safetyTitle: 'プライバシーと歩行安全をインタラクションに組み込む。',
    states: [['移動中', '方向＋距離', '人物、写真カード、構図線を隠す。'], ['到着', '足跡＋向き', '環境安全を確認してから構図を読み込む。'], ['構図中', '過去フレーム＋身体調整', '停止中のみ「左1.2m」「20cm低く」「50mm」を表示。']],
    rules: ['新しいトレースは既定で非公開。', '公開時は顔を含めず、明示的な許可が必要。', '敏感な場所では共有を禁止できる。', '道路、段差、混雑時はガイドを停止。', '現実視野を保ち、中央の不透明パネルを避ける。'],
    mvpKicker: 'プロトタイプの境界',
    mvpTitle: '未来構想から検証できるQuest 3 MVPへ',
    implementedTitle: '現在実装済み',
    implemented: ['Quest 3両手フレーム', '安定度、三分割、水平ガイド', '24 / 35 / 50 / 70 mm移動助言', '3種類のPose Ghost', 'ローカルJSON保存と空間表示', '説明可能な推薦入力', '新規記録は非公開既定', 'デスクトップ模擬とEditModeテスト'],
    nextTitle: '次に実装・検証',
    next: ['観光地の共有空間アンカー', 'クラウド公開トレース', '移動検知と安全時の縮退', '公開・取消・削除UI', '個人旧写真の取込と場所紐付け', '実カメラ写真と過去画像の重ね合わせ'],
    validationTitle: '次の検証',
    validationCopy: '対象者6〜10名で、システムなしと公共Photo Traceありの撮影位置探索を比較する。完了時間、構図誤差、歩行時の注意、推薦理由の理解、公開状態の理解、写真満足度、手勢自然度、疲労を測る。',
    closing: 'FrameTraceは写真を上手に撮るだけの道具ではない。撮影経験と個人の記憶を、安全で透明性があり、同意に基づいて再訪できる空間知識へ変える。',
    otherWorks: '他の作品を見る',
  },
  zh: {
    back: '返回作品列表',
    eyebrow: 'AR 旅行摄影 · 概念印象研究 · Quest 3 MVP',
    title: 'FrameTrace',
    subtitle: 'A shared spatial memory layer for travel photography',
    summary: '让用户在真实地点看见公共摄影机位或自己的私人照片记忆，再通过空间导航、画面对齐和轻量提示重新完成拍摄。',
    role: '独立完成调研、空间 UX、AR 交互、视觉场景与 Quest 3 原型 · 2025–2026',
    nav: [['概念', '#concept'], ['研究', '#research'], ['设计转向', '#pivot'], ['体验', '#experience'], ['安全', '#safety'], ['MVP', '#mvp']],
    conceptKicker: '从照片参考到空间参考',
    conceptTitle: '好照片很容易收藏，却很难在现场复现。',
    conceptCopy: '二维参考图通常没有携带真实地点中的准确机位、方向、焦距、构图与人物站位。FrameTrace 把这些关系保存为可重新调用的 Photo Trace。',
    insight: '机会点不是再做一份拍照攻略，而是把摄影经验变成空间知识。',
    traceDataTitle: 'Photo Trace 最小数据',
    traceData: ['摄影者站位', '镜头方向', '构图边界', '推荐焦距', '人物站位或姿势标签', '时间、光线与公开权限'],
    flow: [['发现', '在景点附近只显示少量匿名痕迹。'], ['导航', '用方向和距离走到过去的机位。'], ['对齐与拍摄', '停止后加载历史构图，再调整位置和焦距。'], ['保存或分享', '默认私人保存，主动选择后才匿名公开。']],
    researchKicker: '概念印象研究',
    researchTitle: '继续增加功能前，我先验证什么有价值，以及什么会阻止采用。',
    researchCopy: '共收集 106 份问卷推荐样本，包含 21 道七点量表、单一优先选择、采用顾虑与开放题。主分析排除 24 份高风险回答；研究评价的是概念图文第一印象，不是 Quest 3 的真实使用效果。',
    tiers: [['106', '原始样本', '全部问卷推荐回答'], ['82', '主分析', '排除高风险回答'], ['56', '严格敏感性', '仅保留低风险回答']],
    metrics: [['5.65/7', '整体概念', '85.4% 达到同意水平'], ['5.81/7', '私人旧照回访', '评价最高的概念'], ['28.0%', '公共机位复现', '只能保留一个时选择最多'], ['69.5%', '隐私顾虑', '最大采用门槛']],
    concernsTitle: '积极评价没有消除采用风险',
    concerns: [['56.1%', '推荐不准'], ['52.4%', '行走安全'], ['43.9%', '遮挡现实'], ['39.0%', '学习成本']],
    boundary: '研究边界：这些数据用于确定产品优先级与风险假设，不证明市场需求，也不代表头显中的可用性结果。',
    pivotKicker: '设计转向',
    pivotTitle: '研究改变的不是功能数量，而是功能层级。',
    pivots: [['手势取景', '5.56/7：评价积极，但不是最强信号。', '保留为表达构图意图的辅助入口。'], ['公共机位复现', '单一首选最多，占 28.0%。', '升级为发现→导航→对齐→拍摄的任务主线。'], ['私人旧照回访', '5.81/7，为最高评价。', '从第三支线升级为作品的情感高点。'], ['个性化推荐', '56.1% 担心推荐不准。', '解释适配原因，并始终允许查看其他方案。'], ['隐私与安全', '69.5% 与 52.4% 表达顾虑。', '把授权和行走降密度放进主流程。']],
    storyKicker: '任务主线',
    storyTitle: '追随过去的摄影机位，重新完成这张照片',
    storyCopy: '行走时主动降低信息密度，只有停止后才恢复构图虚影、位置调整与焦距提示。',
    story: [['01 · 发现', '只看见附近少量摄影痕迹。'], ['02 · 选择', '选择推荐机位，并查看适配原因。'], ['03 · 导航', '只保留方向与距离，避免视野拥挤。'], ['04 · 对齐', '把历史构图翻译为身体移动与镜头调整。'], ['05 · 留下痕迹', '私人保存，或主动匿名公开。']],
    privateKicker: '情感主线',
    privateTitle: '一张私人旧照片，可以成为回到地点与时间的入口。',
    privateCopy: '自己或家人的旧照默认只对本人可见，也不会进入公共推荐。用户回到附近并主动打开后，旧构图、当年站位与照片叠层才出现；完成复拍后，可以对照时间带来的变化。',
    supportTitle: '两个按需出现的摄影辅助',
    support: [['手势取景', '没有选中历史痕迹时，用双手方框表达“我想拍这一块”，再请求焦距与站位建议。'], ['Pose Ghost', '检测到同行者且用户主动开启时，用无面部线框提示脚部站位、身体朝向和一个简单动作。']],
    safetyKicker: '信任与移动',
    safetyTitle: '隐私与行走安全是交互模型的一部分。',
    states: [['行走态', '方向 + 距离', '隐藏人物虚影、照片卡片和复杂构图线。'], ['到达态', '脚印 + 镜头方向', '确认周围安全后再加载构图。'], ['对齐态', '历史构图 + 身体调整', '仅在停止时显示“左移 1.2m”“降低 20cm”“50mm”。']],
    rules: ['新记录默认私密。', '匿名公开不保存人脸，且必须主动授权。', '住宅、学校、医院等敏感地点禁止公开。', '靠近道路、台阶或高人流时暂停摄影指引。', '始终保留现实环境可视范围，不遮挡中心视野。'],
    mvpKicker: '原型边界',
    mvpTitle: '从未来概念走向可测试的 Quest 3 MVP',
    implementedTitle: '当前已经实现',
    implemented: ['Quest 3 双手取景框', '稳定度、三分线与水平提示', '24 / 35 / 50 / 70 mm 焦距和移动建议', '三套 Pose Ghost', 'Photo Trace 本地 JSON 保存与空间显示', '可解释的推荐输入', '新记录默认 isPublic = false', '桌面模拟场景与 EditMode 测试'],
    nextTitle: '下一步实现或验证',
    next: ['景点级共享空间锚点', '真正的云端公开痕迹', '移动检测与安全降级', '公开授权、撤回与删除界面', '私人旧照导入与地点绑定', '真实相机成片与历史照片叠层'],
    validationTitle: '下一步行为验证',
    validationCopy: '招募 6–10 名目标用户，对比不用系统和使用公共 Photo Trace 时寻找机位的表现。记录完成时间、构图误差、行走分心、推荐原因理解、私密/公开状态理解、照片满意度、手势自然度与疲劳。',
    closing: 'FrameTrace 不只帮助人拍得更好。它把摄影经验和个人记忆变成可以被再次进入的空间知识，并让这种进入建立在安全、透明与同意之上。',
    otherWorks: '查看其他作品',
  },
} as const

export default function FrameTraceCasePage() {
  const { language } = useLanguage()
  const t = copy[language]

  return (
    <main className="bg-[#f4f8f7] text-[#102a33] dark:bg-[#07161c] dark:text-white">
      <section className="relative min-h-[78vh] overflow-hidden border-b border-cyan-300/25 bg-[#06171d] text-white">
        <img src={assets.hero} alt="" className="absolute inset-0 size-full object-cover object-center opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06171d] via-[#06171d]/62 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06171d] via-transparent to-[#06171d]/25" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-between px-5 py-10 md:px-8 md:py-14">
          <Link href="/works" className="w-fit text-sm text-cyan-100 no-underline hover:text-cyan-300">← {t.back}</Link>
          <div className="max-w-3xl pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{t.eyebrow}</p>
            <h1 className="mt-4 text-6xl font-semibold leading-none md:text-8xl">{t.title}</h1>
            <p className="mt-5 text-lg font-medium text-cyan-100 md:text-2xl">{t.subtitle}</p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{t.summary}</p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">{t.role}</p>
          </div>
        </div>
      </section>

      <nav aria-label="Case study sections" className="sticky top-16 z-30 overflow-x-auto border-b border-cyan-900/15 bg-[#f4f8f7]/95 backdrop-blur dark:bg-[#07161c]/95">
        <div className="mx-auto flex max-w-6xl min-w-max gap-6 px-5 py-3 text-sm md:px-8">
          {t.nav.map(([label, href]) => <a key={href} href={href} className="font-medium text-[#47636a] no-underline hover:text-[#007f91] dark:text-white/65 dark:hover:text-cyan-300">{label}</a>)}
        </div>
      </nav>

      <section id="concept" className="scroll-mt-28 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007f91] dark:text-cyan-300">{t.conceptKicker}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{t.conceptTitle}</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[#47636a] dark:text-white/70">{t.conceptCopy}</p>
            <p className="mt-6 border-l-4 border-[#ef7656] pl-5 text-xl font-semibold leading-8">{t.insight}</p>
          </div>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {t.flow.map(([title, description], index) => (
            <article key={title} className="rounded-xl border border-cyan-950/10 bg-white p-5 shadow-sm dark:border-cyan-100/10 dark:bg-white/[0.04]">
              <span className="text-xs font-semibold text-[#ef7656]">0{index + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#557078] dark:text-white/60">{description}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-cyan-950/10 bg-[#dff3f3] p-6 dark:border-cyan-100/10 dark:bg-cyan-300/[0.06]">
          <h3 className="font-semibold">{t.traceDataTitle}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {t.traceData.map((item) => <span key={item} className="rounded-full border border-cyan-800/20 bg-white/75 px-3 py-2 text-sm dark:border-cyan-200/15 dark:bg-white/[0.04]">{item}</span>)}
          </div>
        </div>
      </section>

      <section id="research" className="scroll-mt-28 border-y border-cyan-300/20 bg-[#071c24] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{t.researchKicker}</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{t.researchTitle}</h2>
            </div>
            <p className="text-lg leading-8 text-white/65">{t.researchCopy}</p>
          </div>
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {t.tiers.map(([value, label, detail], index) => (
              <div key={label} className="rounded-xl border border-cyan-200/15 bg-white/[0.04] p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-4xl font-semibold text-cyan-300">{value}</p>
                  <span className="text-xs text-white/40">0{index + 1}</span>
                </div>
                <h3 className="mt-3 font-semibold">{label}</h3>
                <p className="mt-2 text-sm text-white/55">{detail}</p>
              </div>
            ))}
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
          <img src={assets.overview} alt={t.researchTitle} loading="lazy" className="mt-10 w-full rounded-xl border border-cyan-100/15 bg-white object-cover" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <img src={assets.concerns} alt={t.concernsTitle} loading="lazy" className="w-full rounded-xl border border-cyan-100/15 bg-white" />
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-semibold">{t.concernsTitle}</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {t.concerns.map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-white/10 p-4">
                    <p className="text-2xl font-semibold text-cyan-300">{value}</p>
                    <p className="mt-2 text-sm text-white/60">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 rounded-lg border border-[#ef7656]/30 bg-[#ef7656]/10 p-4 text-sm leading-7 text-white/70">{t.boundary}</p>
            </div>
          </div>
          <img src={assets.open} alt="" loading="lazy" className="mt-8 w-full rounded-xl border border-cyan-100/15 bg-white" />
        </div>
      </section>

      <section id="pivot" className="scroll-mt-28 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007f91] dark:text-cyan-300">{t.pivotKicker}</p>
        <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{t.pivotTitle}</h2>
        <div className="mt-10 grid gap-4">
          {t.pivots.map(([title, evidence, change], index) => (
            <article key={title} className="grid gap-3 rounded-xl border border-cyan-950/10 bg-white p-5 md:grid-cols-[4rem_12rem_1fr_1fr] md:items-start dark:border-cyan-100/10 dark:bg-white/[0.04]">
              <span className="text-sm font-semibold text-[#ef7656]">0{index + 1}</span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm leading-7 text-[#557078] dark:text-white/60">{evidence}</p>
              <p className="border-l-2 border-cyan-400 pl-4 text-sm font-medium leading-7">{change}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="scroll-mt-28 bg-[#06171d] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{t.storyKicker}</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{t.storyTitle}</h2>
            </div>
            <p className="text-lg leading-8 text-white/65">{t.storyCopy}</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {storyImages.map((image, index) => (
              <article key={image} className={index === storyImages.length - 1 ? 'lg:col-span-2' : ''}>
                <img src={image} alt={t.story[index][0]} loading="lazy" className="aspect-video w-full rounded-xl border border-cyan-100/15 object-cover" />
                <div className="mt-3 flex gap-4">
                  <h3 className="min-w-24 font-semibold text-cyan-300">{t.story[index][0]}</h3>
                  <p className="text-sm leading-6 text-white/55">{t.story[index][1]}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <img src={assets.privateMemory} alt={t.privateTitle} loading="lazy" className="w-full rounded-xl border border-cyan-950/10 shadow-xl dark:border-cyan-100/10" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007f91] dark:text-cyan-300">{t.privateKicker}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{t.privateTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-[#557078] dark:text-white/65">{t.privateCopy}</p>
          </div>
        </div>
        <h2 className="mt-20 text-3xl font-semibold">{t.supportTitle}</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {[assets.gesture, assets.pose].map((image, index) => (
            <article key={image} className="overflow-hidden rounded-xl border border-cyan-950/10 bg-white dark:border-cyan-100/10 dark:bg-white/[0.04]">
              <img src={image} alt={t.support[index][0]} loading="lazy" className="aspect-video w-full object-cover" />
              <div className="p-5">
                <h3 className="text-xl font-semibold">{t.support[index][0]}</h3>
                <p className="mt-3 text-sm leading-7 text-[#557078] dark:text-white/60">{t.support[index][1]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="safety" className="scroll-mt-28 border-y border-cyan-950/10 bg-[#dff3f3]/70 dark:border-cyan-100/10 dark:bg-cyan-300/[0.05]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007f91] dark:text-cyan-300">{t.safetyKicker}</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{t.safetyTitle}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {t.states.map(([state, ui, rule], index) => (
              <article key={state} className="rounded-xl border border-cyan-950/10 bg-white p-5 dark:border-cyan-100/10 dark:bg-[#07161c]">
                <span className="text-xs font-semibold text-[#ef7656]">STATE 0{index + 1}</span>
                <h3 className="mt-3 text-2xl font-semibold">{state}</h3>
                <p className="mt-4 rounded-md bg-[#dff3f3] px-3 py-2 text-sm font-semibold text-[#006e7e] dark:bg-cyan-300/10 dark:text-cyan-300">{ui}</p>
                <p className="mt-4 text-sm leading-7 text-[#557078] dark:text-white/60">{rule}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {t.rules.map((rule) => <p key={rule} className="rounded-lg border border-cyan-950/10 p-4 text-sm leading-6 dark:border-cyan-100/10">{rule}</p>)}
          </div>
        </div>
      </section>

      <section id="mvp" className="scroll-mt-28 bg-[#071c24] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{t.mvpKicker}</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{t.mvpTitle}</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/[0.06] p-6">
              <h3 className="text-xl font-semibold text-cyan-300">{t.implementedTitle}</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {t.implemented.map((item) => <li key={item} className="text-sm leading-6 text-white/70">✓ {item}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-[#ef7656]/25 bg-[#ef7656]/[0.05] p-6">
              <h3 className="text-xl font-semibold text-[#ff9a7d]">{t.nextTitle}</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {t.next.map((item) => <li key={item} className="text-sm leading-6 text-white/65">→ {item}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-10 rounded-xl border border-white/10 p-6 md:p-8">
            <h3 className="text-2xl font-semibold">{t.validationTitle}</h3>
            <p className="mt-4 max-w-4xl leading-8 text-white/65">{t.validationCopy}</p>
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
