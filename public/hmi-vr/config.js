// 驾驶 HMI 注意力实验 · 参数配置
// 改这里即可，不需要动 main.js。时间单位：秒（除非写明分钟）。

export const CONFIG = {
  // —— 车辆 ——
  speedKmh: 50,            // 巡航车速（城市 L2）
  eyeHeight: 1.2,          // 驾驶员眼高（米，距路面）

  // —— 三段式 ——
  // 一次会话：第一段无提示 → 第二段按 cond（A / B / C）→ 第三段无提示。段间不停车、不提示切换。
  // 各段长度（分钟，按巡航车速换算成里程；车减速时实际用时会略长）。URL 参数 dur 给出总分钟数时按比例缩放。
  segmentsMin: [5, 12, 5],

  // —— 记录 ——
  logHz: 30,               // 头部姿态记录频率
  uploadEverySec: 10,      // 每隔多少秒把数据发到电脑端 server.py
  lookThresholdDeg: 15,    // 头部朝向与危险目标夹角小于此值，记为“看向目标”

  // —— 危险事件（会出现「请接管」的事件，三个方案相同）——
  // 以 20 分钟为基准的出现时间（分钟），总时长不同会按比例缩放。
  eventTimesMin: [2.5, 5.5, 8.0, 11.5, 14.0, 17.5],
  eventJitterSec: 30,      // 每个事件前后随机偏移，避免被试猜到节奏
  // 事件种类与顺序；会按被试编号做可复现的随机打乱
  eventTypes: ['child', 'cutin', 'construction', 'child', 'cutin', 'construction'],
  confidence: 0.9,         // 系统识别置信度；< 0.8 时不显示提示（与法规表一致）

  // 各事件的触发距离（米，目标与本车的纵向距离）
  child:        { spawnDist: 110, warnDist: 40, takeoverDist: 30, runSpeed: 2.5 },
  cutin:        { spawnBehind: 15, relSpeed: 4.0, warnAhead: 12, laneChangeSec: 2.5 },
  construction: { spawnDist: 200, warnDist: 100, takeoverDist: 70 },

  takeoverSound: false,    // 是否播放接管提示音。开启后被试可凭声音反应，会削弱视觉方案之间的差别

  // —— 驾驶员监测（三个方案共同的合规部分，不随方案变化）——
  // 视线离开道路（看手机、中控屏、低头、回头）连续超过下面的秒数，逐级响应：提醒 → 警告 → 风险减缓。
  // 看回道路连续 recoverSec 秒后解除。「请接管」只由危险事件触发，规则不变。
  dms: {
    remindAfterSec: 5,     // 提醒：仪表与光带出现琥珀色图标
    warnAfterSec: 9,       // 警告：红色图标
    mitigateAfterSec: 13,  // 风险减缓：车速逐步降到 mitigateKmh，直到看回道路
    mitigateKmh: 30,
    recoverSec: 1.0,
    warnSound: false,
    offRoadAoi: ['phone', 'center_screen', 'down', 'rear', 'up'],
  },

  // —— 眼动（可选）——
  // 眼动套件的数据由电脑端 server.py 接收（OSC 或 POST …/gaze），页面每秒取 pollHz 次。没有数据时自动退回头部朝向。
  // 输入可以是任意单位的 (x, y)：进入驾驶前有一段校准（依次看几个点），把它换算成眼睛相对头部的角度。
  eye: {
    enabled: true,
    pollHz: 30,
    staleSec: 0.3,           // 超过这么久没有新数据，视为无效
    lookBy: 'auto',          // 「看向线索」用哪种判定，并用于方案 C 的「人先看到」：'head' | 'eye' | 'auto'（时间窗内眼动多数有效就用 eye）
    tolDeg: 10,              // 视线与线索物体的夹角小于此值，算看向（按物体的实际方位，不按四个方位扇区）
    // 线索离得远时几乎就在正前方，和「看着前面的路」分不开。所以：物体偏离正前方不到 minEccDeg 时不判定；
    // 判定时容差取 tolDeg 与「偏离角的一半」中较小的一个，也就是视线要离线索比离正前方更近才算。
    // minEccDeg 应该不小于套件实测误差的两倍，套件到货、看过校准残差后再定。
    minEccDeg: 4,
    dwellSec: 0.2,
    calibPoints: [[0, 0], [-15, 0], [15, 0], [0, 8], [0, -10]],   // 校准点（度：左右, 上下），相对正前方
    calibHoldSec: 1.6,       // 每个点看多久
    calibMaxRmsDeg: 3,       // 校准残差超过此值则本次会话不用眼动
  },

  // —— 次任务：手机 ——
  phone: {
    enabled: true,
    pos: [0.27, 0.76, -0.42],        // 车辆坐标（米），中控台上的手机支架
    feedEverySec: 6,                 // 手机上的内容多久换一条
  },

  // —— 预防性线索（三个方案都执行预防动作；只有 C 在第二段显示提示）——
  cue: {
    actionLeadSec: 3,      // 到达线索前约多少秒开始预防动作
    slowKmh: 8,            // 减速量
    slowRate: 1.2,         // 预防减速 / 恢复的加速度（m/s²），比紧急制动柔和
    lateralM: 0.4,         // 横向让出量
    lateralSec: 1.5,       // 横向让出用时
    hintLeadSec: 1,        // 提示比预防动作早多少秒出现
    checkSec: 1.5,         // 「人先看到」时对勾显示多久
    fadeAfter: 3,          // 同一类型连续多少次「人先看到」后不再提示
    // 「看向」的判定：头部朝向进入方位中心 ± tolDeg，连续 dwellSec；时间窗为到达前 windowBeforeSec 秒到通过
    windowBeforeSec: 6,
    tolDeg: 25,
    dwellSec: 0.4,
    pitchRange: [-15, 30], // 低头看手机、中控屏不算
    // 方位中心（度，右为正）。头部朝向误差约 ±25°，所以只用偏离正前方 20° 以上的方位。
    bearings: { 'left': -70, 'front-left': -35, 'front-right': 35, 'right': 70 },
    spawnAheadM: 260,      // 线索物体提前多少米出现在路上
  },

  // 线索：id、类型、里程位置 s（米）、方位、预防动作（slow 减速 / left 向左让 / right 向右让）
  // 类型：parked_front 停着的车头前 · bus_stop 公交站 · blind_junction 视线被挡的路口
  //       door_zone 路边车的开门范围 · cyclist 骑车的人 · lead_brake 前车的前车在刹车
  // 三段的里程范围（按 5 / 12 / 5 分钟）：0–4167、4167–14167、14167–18333。每段六种线索各至少一次，位置不同。
  // 改了 segmentsMin 之后要同步调整 s；程序启动时会检查，不满足时在控制台和 events.csv 里报 cue_config_warning。
  cues: [
    // 第一段（无提示）
    { id: 'C01', type: 'parked_front',   s: 285,   side: 'front-right', action: 'left' },
    { id: 'C02', type: 'blind_junction', s: 600,   side: 'right',       action: 'slow' },
    { id: 'C03', type: 'cyclist',        s: 945,   side: 'front-right', action: 'left' },
    { id: 'C04', type: 'door_zone',      s: 1265,  side: 'front-right', action: 'left' },
    { id: 'C05', type: 'lead_brake',     s: 1660,  side: 'front-left',  action: 'slow' },
    { id: 'C06', type: 'bus_stop',       s: 1965,  side: 'front-right', action: 'slow' },
    { id: 'C07', type: 'door_zone',      s: 2295,  side: 'front-right', action: 'slow' },
    { id: 'C08', type: 'lead_brake',     s: 2625,  side: 'front-left',  action: 'right' },
    { id: 'C09', type: 'blind_junction', s: 2955,  side: 'left',        action: 'slow' },
    { id: 'C10', type: 'bus_stop',       s: 3350,  side: 'left',        action: 'slow' },
    { id: 'C11', type: 'parked_front',   s: 3615,  side: 'front-left',  action: 'slow' },
    { id: 'C12', type: 'cyclist',        s: 3995,  side: 'front-right', action: 'slow' },
    // 第二段（按 cond）
    { id: 'C13', type: 'blind_junction', s: 4425,  side: 'left',        action: 'slow' },
    { id: 'C14', type: 'cyclist',        s: 4805,  side: 'front-right', action: 'slow' },
    { id: 'C15', type: 'bus_stop',       s: 5255,  side: 'left',        action: 'slow' },
    { id: 'C16', type: 'parked_front',   s: 5675,  side: 'front-left',  action: 'slow' },
    { id: 'C17', type: 'lead_brake',     s: 6045,  side: 'front-left',  action: 'right' },
    { id: 'C18', type: 'door_zone',      s: 6535,  side: 'front-right', action: 'slow' },
    { id: 'C19', type: 'cyclist',        s: 6960,  side: 'front-right', action: 'left' },
    { id: 'C20', type: 'blind_junction', s: 7350,  side: 'right',       action: 'slow' },
    { id: 'C21', type: 'door_zone',      s: 7740,  side: 'front-right', action: 'left' },
    { id: 'C22', type: 'parked_front',   s: 8185,  side: 'front-right', action: 'left' },
    { id: 'C23', type: 'lead_brake',     s: 8620,  side: 'front-left',  action: 'slow' },
    { id: 'C24', type: 'bus_stop',       s: 8995,  side: 'front-right', action: 'slow' },
    { id: 'C25', type: 'cyclist',        s: 9445,  side: 'front-right', action: 'slow' },
    { id: 'C26', type: 'blind_junction', s: 9835,  side: 'left',        action: 'slow' },
    { id: 'C27', type: 'parked_front',   s: 10285, side: 'front-left',  action: 'slow' },
    { id: 'C28', type: 'bus_stop',       s: 10635, side: 'left',        action: 'slow' },
    { id: 'C29', type: 'lead_brake',     s: 11075, side: 'front-left',  action: 'right' },
    { id: 'C30', type: 'door_zone',      s: 11520, side: 'front-right', action: 'slow' },
    { id: 'C31', type: 'blind_junction', s: 11925, side: 'right',       action: 'slow' },
    { id: 'C32', type: 'parked_front',   s: 12310, side: 'front-right', action: 'left' },
    { id: 'C33', type: 'door_zone',      s: 12785, side: 'front-right', action: 'left' },
    { id: 'C34', type: 'lead_brake',     s: 13210, side: 'front-left',  action: 'slow' },
    { id: 'C35', type: 'cyclist',        s: 13540, side: 'front-right', action: 'left' },
    { id: 'C36', type: 'bus_stop',       s: 13960, side: 'front-right', action: 'slow' },
    // 第三段（无提示）
    { id: 'C37', type: 'cyclist',        s: 14425, side: 'front-right', action: 'left' },
    { id: 'C38', type: 'blind_junction', s: 14785, side: 'right',       action: 'slow' },
    { id: 'C39', type: 'door_zone',      s: 15065, side: 'front-right', action: 'left' },
    { id: 'C40', type: 'parked_front',   s: 15435, side: 'front-right', action: 'left' },
    { id: 'C41', type: 'bus_stop',       s: 15770, side: 'front-right', action: 'slow' },
    { id: 'C42', type: 'lead_brake',     s: 16120, side: 'front-left',  action: 'slow' },
    { id: 'C43', type: 'door_zone',      s: 16485, side: 'front-right', action: 'slow' },
    { id: 'C44', type: 'parked_front',   s: 16845, side: 'front-left',  action: 'slow' },
    { id: 'C45', type: 'lead_brake',     s: 17100, side: 'front-left',  action: 'right' },
    { id: 'C46', type: 'blind_junction', s: 17490, side: 'left',        action: 'slow' },
    { id: 'C47', type: 'bus_stop',       s: 17780, side: 'left',        action: 'slow' },
    { id: 'C48', type: 'cyclist',        s: 18165, side: 'front-right', action: 'slow' },
  ],

  // —— 旧版方案 C 的做法（代码保留，默认不启用）——
  wheelLight: false,          // 方向盘盘圈上的状态灯带：默认不显示（量产车上没有这种东西）；提醒和「请接管」仍在仪表屏、HUD 上显示
  legacyC: {
    phoneDim: false,           // 风险出现时手机变暗
    roadPreview: false,        // 路上预判：在危险目标脚下画贴地光圈
    vignetteCountdown: false,  // 暗角倒计时：接管前视野边缘逐渐变暗
  },
  arFov: { h: 24, v: 6.5, centerPitch: -4 },  // roadPreview 用的 AR-HUD 视场（度）

  // —— 录像用的电脑预览（URL 参数 record=1）——
  record: {
    minutes: 5,            // 从第二段开头起录多少分钟
    hazards: false,        // 录像里是否出现「请接管」事件
    startDelaySec: 2,      // 打开页面后等多久开始，留出按下录屏的时间
  },

  // —— 模拟被试（URL 参数 sim=1，只用于检查流程和分析脚本）——
  sim: {
    look: [0.15, 0.15, 0.15],  // 三段各自「主动看向线索方位」的概率；URL 参数 simLook=0.1,0.5,0.8 覆盖
    hintFollow: 0.85,          // 看到方案 C 的提示后转头去看的概率
    hintFollowB: 0.5,          // 方案 B：读完中控屏的说明后再去看路边的概率（要先低头读，所以更低）
    phoneShare: 0.35,          // 低风险时看手机的时间占比（大致）
    takeoverRtSec: [0.8, 2.0], // 「请接管」后按键的反应时间范围
  },

  // —— 会分散注意力的东西 ——
  // 背景（行人、店招、对向车流）一直都有。醒目物和车内通知按里程安排在两个线索之间，三个方案、所有被试都相同。
  distract: {
    seed: 7,               // 换一个数就换一套安排
    eyeCatcherProb: 0.8,   // 两个线索之间出现一个醒目物（广告牌、大屏、热气球、摩天轮等）的概率
    noticeProb: 0.45,      // 刚过一个线索后，手机或中控屏弹出一条消息的概率
    noticeSec: 6,          // 消息显示多久
    pedestrians: 22,       // 人行道上的行人数量
    spawnAheadM: 260,
  },

  // —— 视线区域（AOI，按头部朝向划分，单位：度；yaw 右为正，pitch 上为正）——
  // 顺序即判定优先级
  aoi: [
    ['phone',          6,  44, -66, -36],
    ['rear_mirror',   20,  42,   8,  26],
    ['center_screen', 30,  56, -35, -13],
    ['cluster',      -12,  12, -33, -20],
    ['hud',          -11,  11, -9.6, -2.4],
    ['road_ahead',   -20,  20, -11,  12],
    ['mirror_left',  -58, -30, -24,   2],
    ['mirror_right',  52,  74, -20,   4],
  ],
};

export const CUE_TYPES = ['parked_front', 'bus_stop', 'blind_junction', 'door_zone', 'cyclist', 'lead_brake'];
export const CUE_NAMES = {
  parked_front: '停着的车头前', bus_stop: '公交站', blind_junction: '视线被挡的路口',
  door_zone: '路边车的开门范围', cyclist: '骑车的人', lead_brake: '前车的前车在刹车',
};
