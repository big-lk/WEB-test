// 驾驶 HMI 注意力实验 · 参数配置
// 改这里即可，不需要动 main.js。时间单位：秒（除非写明分钟）。

export const CONFIG = {
  // —— 车辆与时长 ——
  speedKmh: 50,            // 巡航车速（城市 L2）
  durationMin: 20,         // 正式驾驶时长；URL 参数 dur 可覆盖
  eyeHeight: 1.2,          // 驾驶员眼高（米，距路面）

  // —— 记录 ——
  logHz: 30,               // 头部姿态记录频率
  uploadEverySec: 10,      // 每隔多少秒把数据发到电脑端 server.py
  lookThresholdDeg: 15,    // 头部朝向与危险目标夹角小于此值，记为“看向目标”

  // —— 危险事件 ——
  // 以 20 分钟为基准的出现时间（分钟），时长不同会按比例缩放。
  // 每 5 分钟至少一次，便于比较前后段的反应时间。
  eventTimesMin: [2.5, 5.5, 8.0, 11.5, 14.0, 17.5],
  eventJitterSec: 30,      // 每个事件前后随机偏移，避免被试猜到节奏
  // 事件种类与顺序；会按被试编号做可复现的随机打乱
  eventTypes: ['child', 'cutin', 'construction', 'child', 'cutin', 'construction'],
  confidence: 0.9,         // 系统识别置信度；< 0.8 时不显示提示（与法规表一致）

  // 各事件的触发距离（米，目标与本车的纵向距离）
  child:        { spawnDist: 110, warnDist: 40, takeoverDist: 30, runSpeed: 2.5 },
  cutin:        { spawnBehind: 15, relSpeed: 4.0, warnAhead: 12, laneChangeSec: 2.5 },
  construction: { spawnDist: 200, warnDist: 100, takeoverDist: 70 },

  // —— 提示方式 ——
  takeoverSound: false,    // 是否播放接管提示音。开启后被试可凭声音反应，会削弱视觉方案之间的差别
  arFov: { h: 24, v: 6.5, centerPitch: -4 },  // S2 AR-HUD 视场（度）

  // —— 自然走神的诱因 ——
  distractorEverySec: [50, 110],  // 路边广告牌、气球等随机出现的间隔

  // —— 视线区域（AOI，按头部朝向划分，单位：度；yaw 右为正，pitch 上为正）——
  // 顺序即判定优先级
  aoi: [
    ['rear_mirror',   20,  42,   8,  26],
    ['center_screen', 22,  52, -34,  -8],
    ['cluster',      -12,  12, -26, -11],
    ['hud',           -6,   6,  -7,  -1],
    ['road_ahead',   -20,  20, -11,  12],
    ['mirror_left',  -58, -30, -24,   2],
    ['mirror_right',  52,  74, -20,   4],
  ],
};
