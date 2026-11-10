// 驾驶 HMI 注意力实验 · WebXR 主程序（Quest 3 浏览器 / 桌面预览）
import * as THREE from './vendor/three.module.js';
import { CONFIG } from './config.js';

const DEG = Math.PI / 180;
const qs = new URLSearchParams(location.search);

// ───────────────────────── 会话参数 ─────────────────────────
const S = {
  pid: 'P00', cond: 'S1', durMin: CONFIG.durationMin, timeScale: 1,
  sid: '', phase: 'idle',           // idle → calib → brief → drive → end
  simT: 0, wallStart: 0, phaseT: 0,
  egoSpeed: CONFIG.speedKmh / 3.6, egoTarget: CONFIG.speedKmh / 3.6,
  egoX: 0, egoXTarget: 0, egoXRate: 0,
  xr: false,
};
const CRUISE = CONFIG.speedKmh / 3.6;

// ───────────────────────── 随机数（按被试编号可复现）─────────────────────────
function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rand = Math.random;

// ───────────────────────── 渲染基础 ─────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local');
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9cfe0);
scene.fog = new THREE.Fog(0xb9cfe0, 80, 420);
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.05, 800);
camera.position.set(0, CONFIG.eyeHeight, 0);
scene.add(camera);
scene.add(new THREE.HemisphereLight(0xeef4ff, 0x5a5448, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 1.0); sun.position.set(-30, 60, 20); scene.add(sun);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// cockpitRoot：车辆坐标系。重新校准时整体旋转/平移，使车头对准被试正前方。
const cockpitRoot = new THREE.Group(); scene.add(cockpitRoot);
const cockpit = new THREE.Group(); cockpitRoot.add(cockpit);
const world = new THREE.Group(); cockpitRoot.add(world);   // 道路与交通，随本车横向偏移
const CAR_CX = 0.37;                                        // 车辆中心相对驾驶员的横向偏移（左舵）

const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);

// ───────────────────────── 画布贴图工具 ─────────────────────────
function canvasPanel(w, h, pxW, pxH, opts = {}) {
  const cv = document.createElement('canvas'); cv.width = pxW; cv.height = pxH;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: opts.depthTest ?? true, toneMapped: false, fog: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  if (opts.renderOrder) mesh.renderOrder = opts.renderOrder;
  return { cv, ctx: cv.getContext('2d'), tex, mesh };
}
const FONT = `"Noto Sans CJK SC","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif`;
function capsule(ctx, x, y, w, h, fill) {
  const r = h / 2; ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h); ctx.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
}

// ───────────────────────── 车内 ─────────────────────────
const EYE = CONFIG.eyeHeight;
(function buildCockpit() {
  const dark = mat(0x2a2c30), trim = mat(0x3c3f45), paint = mat(0x8a96a3);
  const dash = box(1.8, 0.26, 0.55, dark); dash.position.set(CAR_CX, 0.85, -0.88); cockpit.add(dash);
  const hood = box(1.7, 0.08, 1.8, paint); hood.position.set(CAR_CX, 0.78, -2.0); cockpit.add(hood);
  const roof = box(1.7, 0.05, 1.7, trim); roof.position.set(CAR_CX, 1.56, 0.35); cockpit.add(roof);
  const header = box(1.7, 0.08, 0.1, trim); header.position.set(CAR_CX, 1.52, -0.48); cockpit.add(header);
  // A 柱
  const pillar = (x0, x1) => {
    const a = new THREE.Vector3(x0, 0.98, -1.08), b = new THREE.Vector3(x1, 1.52, -0.48);
    const len = a.distanceTo(b);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, len, 8), trim);
    p.position.copy(a).add(b).multiplyScalar(0.5); p.lookAt(b); p.rotateX(Math.PI / 2); cockpit.add(p);
  };
  pillar(-0.5, -0.42); pillar(1.24, 1.16);
  // 车门与 B 柱
  for (const x of [-0.56, 1.30]) {
    const door = box(0.08, 0.42, 1.5, trim); door.position.set(x, 0.72, -0.1); cockpit.add(door);
    const sill = box(0.1, 0.04, 1.5, dark); sill.position.set(x, 0.95, -0.1); cockpit.add(sill);
    const bp = box(0.08, 0.62, 0.12, trim); bp.position.set(x, 1.25, 0.62); cockpit.add(bp);
  }
  // 后视镜
  const rm = box(0.26, 0.07, 0.03, mat(0x50565e)); rm.position.set(CAR_CX, 1.42, -0.62); cockpit.add(rm);
  for (const [x, z] of [[-0.68, -0.78], [1.42, -0.78]]) {
    const sm = box(0.04, 0.12, 0.2, mat(0x50565e)); sm.position.set(x, 1.0, z); cockpit.add(sm);
  }
})();

// 方向盘与灯带
const wheel = new THREE.Group(); wheel.position.set(0, 0.86, -0.45); wheel.rotation.x = -0.35; cockpit.add(wheel);
wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 10, 48), mat(0x1c1d20)));
const hub = box(0.12, 0.08, 0.04, mat(0x1c1d20)); wheel.add(hub);
const wheelBandMat = new THREE.MeshBasicMaterial({ color: 0x1b3a40, toneMapped: false });
const wheelBand = new THREE.Mesh(new THREE.TorusGeometry(0.182, 0.008, 6, 40, Math.PI * 0.6), wheelBandMat);
wheelBand.rotation.z = Math.PI * 0.2; wheelBand.position.z = 0.012; wheel.add(wheelBand);

// 仪表屏
const cluster = canvasPanel(0.34, 0.12, 512, 180);
cluster.mesh.position.set(0, 1.03, -0.76); cluster.mesh.lookAt(0, EYE, 0); cockpit.add(cluster.mesh);
// 中控屏
const center = canvasPanel(0.30, 0.20, 480, 320);
center.mesh.position.set(0.52, 0.93, -0.70); center.mesh.lookAt(0, EYE, 0); cockpit.add(center.mesh);
// HUD 虚像：7.5 m 处，10°×3.5°，中心下俯 4°
const HUD_D = 7.5, HUD_W = 2 * HUD_D * Math.tan(5 * DEG), HUD_H = 2 * HUD_D * Math.tan(1.75 * DEG);
const hud = canvasPanel(HUD_W, HUD_H, 1024, 360, { depthTest: false, renderOrder: 10 });
hud.mesh.position.set(0, EYE - HUD_D * Math.tan(4 * DEG), -HUD_D); cockpit.add(hud.mesh);
// 说明面板（校准、说明、结束）
const panel = canvasPanel(1.2, 0.6, 1024, 512, { depthTest: false, renderOrder: 20 });
panel.mesh.position.set(0, EYE, -1.6); cockpit.add(panel.mesh);

// ───────────────────────── 道路与环境 ─────────────────────────
const ROAD_LEN = 700;
function stripeTex(dash) {
  const cv = document.createElement('canvas'); cv.width = 16; cv.height = 128;
  const c = cv.getContext('2d'); c.fillStyle = '#fff';
  if (dash) c.fillRect(0, 0, 16, 48); else c.fillRect(0, 0, 16, 128);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, ROAD_LEN / 12); return t;
}
const dashTex = stripeTex(true);
function strip(x, w, color, y, tex) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, ROAD_LEN),
    new THREE.MeshLambertMaterial({ color, map: tex || null, transparent: !!tex, alphaTest: tex ? 0.5 : 0 }));
  if (tex) m.material.alphaMap = tex;
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, -ROAD_LEN / 2 + 60); world.add(m); return m;
}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), mat(0x7d8c6a));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; world.add(ground);
strip(-5.25, 14, 0x55585c, 0);             // 双向四车道
strip(3.6, 3.7, 0xa9a49a, 0.12);           // 右侧人行道
strip(-14.1, 3.7, 0xa9a49a, 0.12);         // 左侧人行道
strip(-1.75, 0.15, 0xffffff, 0.01, dashTex);   // 本车道 | 左车道 虚线
strip(-8.75, 0.15, 0xffffff, 0.01, dashTex);
strip(1.75, 0.15, 0xffffff, 0.01);
strip(-5.15, 0.12, 0xf2c230, 0.01); strip(-5.35, 0.12, 0xf2c230, 0.01);   // 中央双黄线
strip(-12.25, 0.15, 0xffffff, 0.01);

// 路边物体池（循环复用）
const SPAN = 480, roadside = [];
(function buildRoadside() {
  const trunk = mat(0x6b5440), leaf = mat(0x4f7a46), pole = mat(0x8a8d90);
  const bCols = [0xc9c1b4, 0xa7b3bd, 0xd8cbb0, 0x9aa49a, 0xbfa99a, 0xe0ddd5];
  for (let i = 0; i < 40; i++) {               // 行道树
    for (const side of [1, -1]) {
      const g = new THREE.Group();
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.2, 6), trunk); t.position.y = 1.1; g.add(t);
      const c = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), leaf); c.position.y = 3.0; g.add(c);
      g.position.set(side > 0 ? 4.8 : -15.3, 0.12, -i * (SPAN / 40) - (side > 0 ? 0 : 6)); world.add(g); roadside.push(g);
    }
  }
  for (let i = 0; i < 16; i++) {               // 路灯
    const g = new THREE.Group();
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 7, 6), pole); p.position.y = 3.5; g.add(p);
    const arm = box(1.8, 0.08, 0.08, pole); arm.position.set(-0.9, 6.9, 0); g.add(arm);
    g.position.set(2.4, 0.12, -i * (SPAN / 16) - 11); world.add(g); roadside.push(g);
  }
  for (let i = 0; i < 36; i++) {               // 楼房
    const side = i % 2 ? 1 : -1, h = 6 + rand() * 22, w = 8 + rand() * 10, d = 8 + rand() * 8;
    const b = box(w, h, d, mat(bCols[i % bCols.length]));
    b.position.set(side > 0 ? 11 + w / 2 + rand() * 4 : -21 - w / 2 - rand() * 4, h / 2, -(i / 2 | 0) * (SPAN / 18) - rand() * 8);
    world.add(b); roadside.push(b);
  }
})();

// 对向车流
function makeCar(color) {
  const g = new THREE.Group();
  const body = box(1.8, 0.7, 4.4, mat(color)); body.position.y = 0.6; g.add(body);
  const top = box(1.6, 0.55, 2.3, mat(0x2b3138)); top.position.set(0, 1.2, 0.2); g.add(top);
  const wm = mat(0x111111);
  for (const [x, z] of [[-0.85, 1.4], [0.85, 1.4], [-0.85, -1.4], [0.85, -1.4]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.2, 10), wm);
    w.rotation.z = Math.PI / 2; w.position.set(x, 0.33, z); g.add(w);
  }
  return g;
}
const oncoming = [];
for (let i = 0; i < 5; i++) {
  const c = makeCar([0xb03a2e, 0xe8e8e8, 0x2c4a6e, 0x1e1e1e, 0x9aa1a8][i]);
  c.rotation.y = Math.PI; c.position.set(i % 2 ? -7 : -10.5, 0, -60 - i * 90); world.add(c); oncoming.push(c);
}

// ───────────────────────── 走神诱因（广告牌、气球、雕塑）─────────────────────────
const distractors = []; let nextDistractT = 30;
function spawnDistractor() {
  const side = rand() < 0.5 ? -1 : 1, kind = ['billboard', 'balloon', 'sculpture'][Math.floor(rand() * 3)];
  const g = new THREE.Group();
  if (kind === 'billboard') {
    const p = canvasPanel(9, 4.5, 512, 256);
    const c = p.ctx, hue = Math.floor(rand() * 360);
    c.fillStyle = `hsl(${hue},55%,45%)`; c.fillRect(0, 0, 512, 256);
    c.fillStyle = '#fff'; c.font = `bold 64px ${FONT}`; c.textAlign = 'center';
    c.fillText(['冬日灯光节', '新品上市', '温泉一日游', '雪祭倒计时'][Math.floor(rand() * 4)], 256, 145); p.tex.needsUpdate = true;
    p.mesh.position.y = 7; p.mesh.rotation.y = -side * 0.5; g.add(p.mesh);
    const leg = box(0.3, 5, 0.3, mat(0x666666)); leg.position.y = 2.5; g.add(leg);
  } else if (kind === 'balloon') {
    const b = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 12), mat(0xe2574c)); b.position.y = 28; g.add(b);
    const k = box(1.2, 1, 1.2, mat(0x7a5a3a)); k.position.y = 23.5; g.add(k);
  } else {
    const s = new THREE.Mesh(new THREE.TorusKnotGeometry(2.2, 0.6, 64, 8), mat(0x3aa0c8)); s.position.y = 4.5; g.add(s);
  }
  g.position.set(side > 0 ? 9 + rand() * 6 : -19 - rand() * 6, 0, -260);
  g.userData = { kind, side }; world.add(g); distractors.push(g);
  logEvent('distractor', '', '', kind, side > 0 ? 'right' : 'left');
}

// ───────────────────────── 危险事件 ─────────────────────────
const hazards = []; let schedule = []; let hazardSeq = 0;
function buildSchedule() {
  const types = [...CONFIG.eventTypes];
  for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [types[i], types[j]] = [types[j], types[i]]; }
  const k = S.durMin / 20;
  schedule = CONFIG.eventTimesMin.map((m, i) => ({
    t: Math.max(20, m * 60 * k + (rand() * 2 - 1) * CONFIG.eventJitterSec), type: types[i % types.length], done: false,
  }));
  logEvent('schedule', '', '', JSON.stringify(schedule.map(s => [Math.round(s.t), s.type])), '');
}

function makeChild() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.7, 8), mat(0xf0b429)); body.position.y = 0.75; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), mat(0xe9c3a0)); head.position.y = 1.25; g.add(head);
  const legs = box(0.3, 0.4, 0.15, mat(0x34495e)); legs.position.y = 0.2; g.add(legs);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), mat(0xe74c3c)); ball.position.set(-0.6, 0.15, 0); g.add(ball);
  return g;
}
function makeConstruction() {
  const g = new THREE.Group(), cone = mat(0xf26b1d);
  for (let i = 0; i < 7; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 10), cone); c.position.set(1.2 - i * 0.35, 0.35, 8 - i * 4); g.add(c);
  }
  const bar = box(3.2, 1.0, 0.2, mat(0xe0e0e0)); bar.position.set(0, 0.8, -18); g.add(bar);
  for (let i = 0; i < 4; i++) { const s = box(0.4, 1.02, 0.22, cone); s.position.set(-1.2 + i * 0.8, 0.8, -18); g.add(s); }
  const sign = new THREE.Mesh(new THREE.CircleGeometry(0.6, 3), mat(0xf2c230)); sign.position.set(1.4, 1.6, 14); sign.rotation.z = Math.PI / 2; g.add(sign);
  return g;
}

function spawnHazard(type) {
  const id = `H${++hazardSeq}`; let obj, h;
  if (type === 'child') {
    obj = makeChild(); obj.position.set(4.3, 0.12, -CONFIG.child.spawnDist);
    h = { id, type, obj, stage: 'approach', moving: false, target: () => obj.position.clone().setY(0.9) };
  } else if (type === 'cutin') {
    obj = makeCar(0x2f6f8f); obj.position.set(-3.5, 0, CONFIG.cutin.spawnBehind);
    const blink = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xffa500 }));
    blink.position.set(0.85, 0.75, -2.22); blink.visible = false; obj.add(blink);
    h = { id, type, obj, blink, stage: 'approach', lane: 0, target: () => obj.position.clone().setY(0.8) };
  } else {
    obj = makeConstruction(); obj.position.set(0, 0, -CONFIG.construction.spawnDist);
    h = { id, type, obj, stage: 'approach', target: () => obj.position.clone().add(new THREE.Vector3(0, 0.8, 8)) };
  }
  h.t0 = S.simT; h.tWarn = null; h.tTake = null; h.looked = false; h.responded = false;
  h.ring = null; world.add(obj); hazards.push(h);
  logEvent('hazard_spawn', id, type, '', '');
  return h;
}

function setStage(h, stage) {
  if (h.stage === stage) return; h.stage = stage;
  const ctx = () => `${CONFIG.confidence < 0.8 ? 'suppressed' : S.cond};aoi=${aoiOf(head.yaw, head.pitch)};yaw=${head.yaw.toFixed(1)};pitch=${head.pitch.toFixed(1)}`;
  if (stage === 'warn') { h.tWarn = S.simT; logEvent('hmi_warn', h.id, h.type, CONFIG.confidence, ctx()); }
  if (stage === 'takeover') {
    h.tTake = S.simT; S.lastTake = h; logEvent('hmi_takeover', h.id, h.type, CONFIG.confidence, ctx());
    if (CONFIG.takeoverSound && CONFIG.confidence >= 0.8) chime();
  }
  if (stage === 'resolved') logEvent('hazard_resolved', h.id, h.type, '', '');
}

function updateHazard(h, dt) {
  const z = h.obj.position.z; // 负值 = 在本车前方
  if (h.type === 'child') {
    const c = CONFIG.child, dist = -z;
    if (!h.moving && dist < c.warnDist) { h.moving = true; setStage(h, 'warn'); }
    if (h.moving && h.obj.position.x > -6) h.obj.position.x -= c.runSpeed * dt;
    if (h.stage === 'warn' && dist < c.takeoverDist) { setStage(h, 'takeover'); S.egoTarget = 0; }
    if (h.stage === 'takeover' && h.obj.position.x < -3.2) { setStage(h, 'resolved'); S.egoTarget = CRUISE; }
  } else if (h.type === 'cutin') {
    const c = CONFIG.cutin;
    h.obj.position.z -= (CRUISE + c.relSpeed) * dt;         // 邻车自身车速；主循环已加上本车位移
    if (h.stage === 'approach' && z < -c.warnAhead) { setStage(h, 'warn'); h.warnAt = S.simT; }
    if (h.blink) h.blink.visible = h.stage !== 'approach' && h.stage !== 'resolved' && (S.simT * 2.5 % 1 < 0.5);
    if (h.stage === 'warn' && S.simT - h.warnAt > 1.5) { setStage(h, 'takeover'); S.egoTarget = CRUISE * 0.7; }
    if (h.stage === 'takeover') {
      h.lane = Math.min(1, h.lane + dt / c.laneChangeSec);
      h.obj.position.x = -3.5 + 3.5 * (0.5 - 0.5 * Math.cos(Math.PI * h.lane));
      if (h.lane >= 1 && S.simT - h.tTake > 6) { setStage(h, 'resolved'); S.egoTarget = CRUISE; }
    }
  } else {
    const c = CONFIG.construction, dist = -z;
    if (h.stage === 'approach' && dist < c.warnDist) setStage(h, 'warn');
    if (h.stage === 'warn' && dist < c.takeoverDist) setStage(h, 'takeover');
    if (h.stage === 'takeover' && !h.laneChanged && (h.responded || S.simT - h.tTake > 1.5)) {
      h.laneChanged = true; S.egoXTarget = -3.5; S.egoXRate = 3.5 / 3; S.egoTarget = CRUISE * 0.7; logEvent('ego_lane_change', h.id, h.type, 'left', '');
    }
    if (h.stage === 'takeover' && dist < -25) { setStage(h, 'resolved'); S.egoXTarget = 0; S.egoXRate = 3.5 / 4; S.egoTarget = CRUISE; logEvent('ego_lane_change', h.id, h.type, 'back', ''); }
  }
}

// ───────────────────────── 提示显示（S1 / S2 / S3）─────────────────────────
const COLORS = { warn: '#f5a623', takeover: '#e5383b', l2: '#3cc6d6', dim: 'rgba(255,255,255,0.18)' };
function activeHazard() {
  let best = null;
  for (const h of hazards) if (h.stage === 'warn' || h.stage === 'takeover') { if (!best || h.stage === 'takeover') best = h; }
  return best;
}
function cockpitPos(v) { return v.clone().add(world.position); }          // world 局部 → 车辆坐标
function bearingDeg(p) { const d = p.clone().sub(new THREE.Vector3(0, EYE, 0)); return Math.atan2(d.x, -d.z) / DEG; }
function elevDeg(p) { const d = p.clone().sub(new THREE.Vector3(0, EYE, 0)); return Math.atan2(d.y, Math.hypot(d.x, d.z)) / DEG; }

let hmiKey = '', hmiPulseT = 0, hmiVisible = 0;
function drawHMI(dt) {
  const h = activeHazard();
  const show = h && CONFIG.confidence >= 0.8;
  const stage = show ? h.stage : 'none';
  const tp = h ? cockpitPos(h.target()) : null;
  const bear = tp ? bearingDeg(tp) : 0;
  hmiPulseT += dt;
  const pulse = stage === 'takeover' ? 0.55 + 0.45 * Math.abs(Math.sin(hmiPulseT * 5)) : 1;
  hmiVisible = 0;

  // —— HUD ——
  const key = `${S.cond}|${stage}|${Math.round(bear * 2)}|${Math.round(pulse * 10)}|${S.phase}`;
  if (key !== hmiKey) {
    hmiKey = key; const c = hud.ctx, W = 1024, H = 360; c.clearRect(0, 0, W, H);
    const driving = S.phase === 'drive' || S.phase === 'brief';
    if (driving && S.cond !== 'S3') {
      capsule(c, 24, H - 112, 140, 70, 'rgba(20,30,34,0.55)');
      c.fillStyle = COLORS.l2; c.font = `bold 46px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('L2', 94, H - 77);
    }
    if (S.cond === 'S1' && driving) {
      c.fillStyle = COLORS.dim; c.fillRect(170, H - 30, W - 340, 6);
      if (stage !== 'none') {
        const col = COLORS[stage], half = (W - 340) / 2, cx = W / 2 + Math.max(-1, Math.min(1, bear / 5)) * half;
        c.globalAlpha = pulse; c.fillStyle = col; c.fillRect(Math.max(170, cx - 70), H - 36, 140, 18);
        if (Math.abs(bear) > 5) {                // 目标在 HUD 范围外：边缘箭头
          const s = Math.sign(bear), ex = s > 0 ? W - 150 : 150; c.beginPath();
          c.moveTo(ex + s * 30, H - 27); c.lineTo(ex - s * 4, H - 50); c.lineTo(ex - s * 4, H - 4); c.fill();
        }
        c.globalAlpha = 1;
      }
    }
    if ((S.cond === 'S1' || S.cond === 'S2') && stage === 'takeover') {
      c.globalAlpha = pulse; capsule(c, W / 2 - 160, H - 150, 320, 96, COLORS.takeover);
      c.fillStyle = '#fff'; c.font = `bold 58px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('请接管', W / 2, H - 101);
      c.globalAlpha = 1;
    }
    hud.tex.needsUpdate = true;
  }
  let ringVisible = false;

  // —— S2：AR 贴地光圈，只在 AR-HUD 视场内显示 ——
  for (const hz of hazards) {
    if (S.cond !== 'S2') break;
    const on = show && hz === h;
    if (on && !hz.ring) {
      hz.ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 2.3, 48), new THREE.MeshBasicMaterial({ color: 0xf5a623, transparent: true, depthTest: false, toneMapped: false, fog: false }));
      hz.ring.rotation.x = -Math.PI / 2; hz.ring.renderOrder = 9; world.add(hz.ring);
    }
    if (hz.ring) {
      const gp = hz.target().setY(0.05); hz.ring.position.copy(gp);
      const cp = cockpitPos(gp), fov = CONFIG.arFov;
      const inFov = Math.abs(bearingDeg(cp)) <= fov.h / 2 && Math.abs(elevDeg(cp) - fov.centerPitch) <= fov.v / 2;
      hz.ring.visible = on && inFov;
      hz.ring.material.color.set(hz.stage === 'takeover' ? 0xe5383b : 0xf5a623); hz.ring.material.opacity = pulse;
      if (hz.ring.visible) ringVisible = true;
    }
  }

  hmiVisible = +((S.cond === 'S1' && stage !== 'none') || (S.cond === 'S2' && (stage === 'takeover' || ringVisible)) || (S.cond === 'S3' && stage !== 'none'));

  // —— 仪表屏、方向盘灯带：所有方案同步“请接管”——
  wheelBandMat.color.set(stage === 'takeover' ? new THREE.Color(0xe5383b).multiplyScalar(pulse) : (S.phase === 'drive' ? 0x1f5961 : 0x1b2a2e));
  drawCluster(stage, pulse);
  drawCenter(stage, h, pulse);
}

let clusterKey = '';
function drawCluster(stage, pulse) {
  const kmh = Math.round(S.egoSpeed * 3.6), key = `${kmh}|${stage}|${Math.round(pulse * 5)}`;
  if (key === clusterKey) return; clusterKey = key;
  const c = cluster.ctx; c.fillStyle = '#0d1114'; c.fillRect(0, 0, 512, 180);
  c.textBaseline = 'middle'; c.textAlign = 'left';
  c.fillStyle = '#e8eef2'; c.font = `bold 72px ${FONT}`; c.fillText(String(kmh), 30, 90);
  c.fillStyle = '#8a98a3'; c.font = `28px ${FONT}`; c.fillText('km/h', 150, 108);
  capsule(c, 380, 30, 100, 46, 'rgba(60,198,214,0.2)'); c.fillStyle = COLORS.l2; c.font = `bold 30px ${FONT}`; c.textAlign = 'center'; c.fillText('L2', 430, 54);
  if (stage === 'takeover') {
    c.globalAlpha = pulse; capsule(c, 250, 100, 230, 60, COLORS.takeover);
    c.fillStyle = '#fff'; c.font = `bold 36px ${FONT}`; c.fillText('请接管', 365, 131); c.globalAlpha = 1;
  }
  cluster.tex.needsUpdate = true;
}

let centerKey = '', centerT = 0;
function drawCenter(stage, h, pulse) {
  centerT += 1;
  const c = center.ctx, W = 480, H = 320;
  if (S.cond !== 'S3') {
    if (centerKey === 'media') return; centerKey = 'media';
    c.fillStyle = '#12171b'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#2b3a44'; c.fillRect(30, 40, 120, 120);
    c.fillStyle = '#e8eef2'; c.font = `bold 30px ${FONT}`; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText('正在播放', 175, 70); c.fillStyle = '#8a98a3'; c.font = `24px ${FONT}`; c.fillText('轻音乐电台', 175, 115);
    c.fillStyle = '#2b3a44'; c.fillRect(30, 220, 420, 6); c.fillStyle = '#3cc6d6'; c.fillRect(30, 220, 160, 6);
    center.tex.needsUpdate = true; return;
  }
  if (centerT % 3 !== 0 && stage === 'none' && centerKey === 'map-none') return;
  centerKey = `map-${stage}`;
  // S3：鸟瞰图（本车在下方中央，前方 80 m）
  c.fillStyle = '#12171b'; c.fillRect(0, 0, W, H);
  const sx = 16, sz = 3.4, ox = W / 2, oy = H - 50;
  for (const lx of [-12.25, -8.75, -5.25, -1.75, 1.75]) {
    const x = ox + (lx - S.egoX) * sx; c.strokeStyle = lx === -5.25 ? '#f2c230' : '#5d6a73'; c.lineWidth = 2;
    c.setLineDash(lx === -1.75 || lx === -8.75 ? [10, 12] : []); c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke();
  }
  c.setLineDash([]);
  c.fillStyle = '#3cc6d6'; c.fillRect(ox - 14, oy - 24, 28, 48);
  for (const hz of hazards) {
    if (hz.stage === 'resolved') continue;
    const p = hz.target(), x = ox + (p.x - S.egoX) * sx, y = oy + p.z * sz;
    if (y < -20 || y > H + 20) continue;
    const col = hz === h && stage !== 'none' ? COLORS[stage] : '#8a98a3';
    c.globalAlpha = hz === h ? pulse : 1; c.fillStyle = col;
    c.beginPath(); c.arc(x, y, hz.type === 'child' ? 10 : 16, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  }
  if (stage === 'takeover') {
    c.globalAlpha = pulse; c.strokeStyle = COLORS.takeover; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10);
    capsule(c, W / 2 - 100, 20, 200, 56, COLORS.takeover); c.fillStyle = '#fff'; c.font = `bold 34px ${FONT}`;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('请接管', W / 2, 48); c.globalAlpha = 1;
  }
  center.tex.needsUpdate = true;
}

function drawPanel(lines, accent) {
  const c = panel.ctx; c.clearRect(0, 0, 1024, 512);
  if (!lines) { panel.mesh.visible = false; return; }
  panel.mesh.visible = true;
  c.fillStyle = 'rgba(14,20,24,0.86)'; c.beginPath(); c.roundRect(0, 0, 1024, 512, 36); c.fill();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  lines.forEach((ln, i) => {
    c.fillStyle = i === 0 ? (accent || '#ffffff') : '#c9d3da';
    c.font = i === 0 ? `bold 60px ${FONT}` : `40px ${FONT}`;
    c.fillText(ln, 512, 120 + i * 82);
  });
  panel.tex.needsUpdate = true;
}

// ───────────────────────── 提示音（默认关闭）─────────────────────────
let actx = null;
function chime() {
  try {
    actx = actx || new AudioContext();
    for (const [f, t] of [[880, 0], [660, 0.18]]) {
      const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, actx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.25, actx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + t + 0.16);
      o.connect(g).connect(actx.destination); o.start(actx.currentTime + t); o.stop(actx.currentTime + t + 0.2);
    }
  } catch (e) { /* 无音频时忽略 */ }
}

// ───────────────────────── 头部姿态 ─────────────────────────
const head = { pos: new THREE.Vector3(0, EYE, 0), quat: new THREE.Quaternion(), local: new THREE.Vector3(), lq: new THREE.Quaternion(), yaw: 0, pitch: 0, roll: 0, fwd: new THREE.Vector3(0, 0, -1) };
const _e = new THREE.Euler(), _iq = new THREE.Quaternion();
function readHead(frame) {
  if (S.xr && frame) {
    const pose = frame.getViewerPose(renderer.xr.getReferenceSpace());
    if (!pose) return false;
    const p = pose.transform.position, o = pose.transform.orientation;
    head.pos.set(p.x, p.y, p.z); head.quat.set(o.x, o.y, o.z, o.w);
  } else { head.pos.copy(camera.position); head.quat.copy(camera.quaternion); }
  _iq.copy(cockpitRoot.quaternion).invert();
  head.local.copy(head.pos).sub(cockpitRoot.position).applyQuaternion(_iq);
  head.lq.copy(_iq).multiply(head.quat);
  _e.setFromQuaternion(head.lq, 'YXZ');
  head.yaw = -_e.y / DEG; head.pitch = _e.x / DEG; head.roll = _e.z / DEG;
  head.fwd.set(0, 0, -1).applyQuaternion(head.lq);
  return true;
}
function recenter(reason) {
  const f = new THREE.Vector3(0, 0, -1).applyQuaternion(head.quat);
  const yaw = Math.atan2(-f.x, -f.z);
  cockpitRoot.rotation.set(0, yaw, 0);
  cockpitRoot.position.set(head.pos.x, head.pos.y - EYE, head.pos.z);
  // 位置偏移按旋转后的车辆坐标计算：驾驶员眼点 (0, EYE, 0) 对准当前头部
  logEvent('recenter', '', '', (yaw / DEG).toFixed(1), reason);
}
function aoiOf(yaw, pitch) {
  if (Math.abs(yaw) > 100) return 'rear';
  for (const [name, y0, y1, p0, p1] of CONFIG.aoi) if (yaw >= y0 && yaw <= y1 && pitch >= p0 && pitch <= p1) return name;
  if (pitch < -34) return 'down';
  if (pitch > 26 || (pitch > 12 && Math.abs(yaw) < 20)) return 'up';
  if (Math.abs(yaw) <= 20) return pitch < 0 ? 'down' : 'up';
  return yaw < 0 ? 'left_side' : 'right_side';
}

// ───────────────────────── 记录与上传 ─────────────────────────
const FRAME_COLS = ['t_sim', 't_wall_ms', 'phase', 'speed_kmh', 'ego_x', 'head_x', 'head_y', 'head_z', 'yaw', 'pitch', 'roll', 'aoi', 'hazard_id', 'hazard_type', 'hazard_stage', 'hazard_angle', 'hazard_bearing', 'hmi_visible'];
const EVENT_COLS = ['t_sim', 't_wall_ms', 'type', 'hazard_id', 'hazard_type', 'value', 'note'];
const LOG = { frames: [FRAME_COLS.join(',')], events: [EVENT_COLS.join(',')], sent: { frames: 0, events: 0 }, ok: null, lastUp: 0, recent: [] };
const esc = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
function logEvent(type, hid, htype, value, note) {
  const wall = S.wallStart ? Math.round(performance.now() - S.wallStart) : 0;
  LOG.events.push([S.simT.toFixed(3), wall, type, hid, htype, value, note].map(esc).join(','));
  if (type !== 'schedule') { LOG.recent.push({ t: +S.simT.toFixed(1), type, hid, htype, value: String(value ?? ''), note: String(note ?? '') }); if (LOG.recent.length > 30) LOG.recent.shift(); }
  if (window.__onEvent) window.__onEvent(type, hid, htype, value, note);
}
let logAcc = 0;
function logFrame(dt) {
  logAcc += dt; if (logAcc < 1 / CONFIG.logHz) return; logAcc = 0;
  const h = activeHazard() || hazards.find(x => x.stage === 'approach');
  let ang = '', bear = '';
  if (h) {
    const tp = cockpitPos(h.target()), d = tp.sub(head.local).normalize();
    ang = (Math.acos(Math.max(-1, Math.min(1, d.dot(head.fwd)))) / DEG).toFixed(1);
    bear = bearingDeg(cockpitPos(h.target())).toFixed(1);
    if (+ang < CONFIG.lookThresholdDeg) {
      if (h.stage === 'approach' && !h.lookedPre) { h.lookedPre = true; logEvent('look_before_warn', h.id, h.type, ang, ''); }
      if (h.stage !== 'approach' && !h.looked) { h.looked = true; logEvent('first_look', h.id, h.type, ang, h.stage); }
    }
  }
  LOG.frames.push([S.simT.toFixed(3), Math.round(performance.now() - S.wallStart), S.phase, (S.egoSpeed * 3.6).toFixed(1), S.egoX.toFixed(2),
    head.local.x.toFixed(3), head.local.y.toFixed(3), head.local.z.toFixed(3), head.yaw.toFixed(1), head.pitch.toFixed(1), head.roll.toFixed(1),
    aoiOf(head.yaw, head.pitch), h?.id ?? '', h?.type ?? '', h?.stage ?? '', ang, bear, hmiVisible].join(','));
}
let uploading = false;
async function upload(final = false) {
  if (uploading && !final) return; uploading = true;
  const base = `pid=${encodeURIComponent(S.pid)}&sid=${S.sid}`;
  for (const kind of ['frames', 'events']) {
    const from = LOG.sent[kind], rows = LOG[kind].slice(from);
    if (!rows.length) continue;
    try {
      const r = await fetch(`./log?${base}&kind=${kind}`, { method: 'POST', body: rows.join('\n') + '\n', headers: { 'Content-Type': 'text/csv' } });
      if (!r.ok) throw new Error(r.status);
      LOG.sent[kind] = from + rows.length; LOG.ok = true;
    } catch (e) { LOG.ok = false; }
  }
  if (final) {
    try {
      await fetch(`./log?${base}&kind=meta`, { method: 'POST', body: JSON.stringify(meta(), null, 2), headers: { 'Content-Type': 'application/json' } });
    } catch (e) { LOG.ok = false; }
  }
  uploading = false; updateStatus();
}
function meta() {
  return { pid: S.pid, sid: S.sid, cond: S.cond, durMin: S.durMin, timeScale: S.timeScale, xr: S.xr, userAgent: navigator.userAgent,
    startedAt: S.startedAt, endedAt: new Date().toISOString(), simT: S.simT, config: CONFIG };
}
function download(name, text, type = 'text/csv') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
}

// ───────────────────────── 输入 ─────────────────────────
function onPress(src) {
  if (S.phase === 'brief') { logEvent('brief_ok', '', '', src, ''); startDrive(); return; }
  if (S.phase !== 'drive') return;
  // 接管提示出现后 8 秒内的第一次按键都算作对该事件的反应（即使危险已经解除）
  let h = activeHazard();
  if ((!h || h.responded || h.stage !== 'takeover') && S.lastTake && !S.lastTake.responded && S.simT - S.lastTake.tTake < 8) h = S.lastTake;
  if (h && !h.responded) {
    h.responded = true;
    const rtTake = h.tTake != null ? ((S.simT - h.tTake) * 1000).toFixed(0) : '';
    const rtWarn = h.tWarn != null ? ((S.simT - h.tWarn) * 1000).toFixed(0) : '';
    logEvent('response', h.id, h.type, rtTake, `stage=${h.stage};rt_from_warn_ms=${rtWarn};src=${src}`);
  } else logEvent('press_idle', '', '', '', src);
}
for (const i of [0, 1]) {
  const ctrl = renderer.xr.getController(i);
  ctrl.addEventListener('selectstart', () => onPress(`select${i}`));
  scene.add(ctrl);
}
// 双手同时握住握把 2 秒：重新校准
const grips = new Set(); let gripT = 0;
for (const i of [0, 1]) {
  const ctrl = renderer.xr.getController(i);
  ctrl.addEventListener('squeezestart', () => grips.add(i));
  ctrl.addEventListener('squeezeend', () => { grips.delete(i); gripT = 0; });
}
addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); onPress('key'); }
  if (e.code === 'KeyR') recenter('key');
});
// 桌面预览：拖动鼠标转头
let drag = null; const look = { yaw: 0, pitch: 0 };
renderer.domElement.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY]; });
addEventListener('pointerup', () => { drag = null; });
addEventListener('pointermove', e => {
  if (!drag || S.xr) return;
  look.yaw -= (e.clientX - drag[0]) * 0.25 * DEG; look.pitch -= (e.clientY - drag[1]) * 0.25 * DEG;
  look.pitch = Math.max(-80 * DEG, Math.min(80 * DEG, look.pitch)); drag = [e.clientX, e.clientY];
  camera.rotation.set(look.pitch, look.yaw, 0, 'YXZ');
});

// ───────────────────────── 流程 ─────────────────────────
function begin(opts) {
  Object.assign(S, opts);
  rand = mulberry32(hashStr(S.pid));
  const d = new Date(), p = n => String(n).padStart(2, '0');
  S.sid = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  S.startedAt = d.toISOString(); S.wallStart = performance.now(); S.phase = 'calib'; S.phaseT = 0;
  logEvent('session_start', '', '', S.cond, `pid=${S.pid};dur=${S.durMin};xr=${S.xr};scale=${S.timeScale}`);
  buildSchedule();
  drawPanel(['请坐好，看向正前方', '画面会自动对准你的座位'], '#ffffff');
  document.body.classList.add('running');
}
function startBrief() {
  S.phase = 'brief'; S.phaseT = 0;
  drawPanel(['自动驾驶旅行体验', '车辆会自动行驶，请放松乘坐，随意观看', '如果出现「请接管」，请按扳机键', '（或捏合手指）。现在按一次开始'], '#3cc6d6');
}
function startDrive() {
  S.phase = 'drive'; S.simT = 0; drawPanel(null); logEvent('drive_start', '', '', S.cond, '');
}
function endSession(reason) {
  if (S.phase === 'end') return;
  S.phase = 'end'; S.egoTarget = 0;
  logEvent('session_end', '', '', reason, '');
  drawPanel(['体验结束', '请摘下头显'], '#ffffff');
  upload(true);
  document.body.classList.add('ended');
}
window.HMI = { begin, endSession, download, LOG, S, meta, onPress, hazards };

// ───────────────────────── 主循环 ─────────────────────────
const clock = new THREE.Clock();
let fps = 0, fpsN = 0, fpsT0 = performance.now();
renderer.setAnimationLoop((time, frame) => {
  const rdt = Math.min(clock.getDelta(), 0.1);
  const dt = rdt * (S.phase === 'drive' ? S.timeScale : 1);
  const haveHead = readHead(frame);
  fpsN++; if (time - fpsT0 >= 1000) { fps = Math.round(fpsN * 1000 / (time - fpsT0)); fpsN = 0; fpsT0 = time; }
  if (S.pendingRecenter && haveHead) { S.pendingRecenter = false; recenter('remote'); }

  if (S.phase === 'calib') {
    S.phaseT += rdt;
    if (S.phaseT > 4 && !S.calibrated && haveHead) { recenter('auto'); S.calibrated = true; }
    if (S.phaseT > 6) startBrief();
  }
  if (grips.size === 2 && S.xr) { gripT += rdt; if (gripT > 2) { recenter('grip'); gripT = -999; } }

  if (S.phase === 'drive' || S.phase === 'brief' || S.phase === 'end') {
    if (S.phase === 'drive') {
      S.simT += dt;
      for (const ev of schedule) if (!ev.done && S.simT >= ev.t && !hazards.some(h => h.stage !== 'resolved' && h.stage !== 'gone')) { ev.done = true; spawnHazard(ev.type); }
      if (S.simT >= nextDistractT) { spawnDistractor(); nextDistractT = S.simT + CONFIG.distractorEverySec[0] + rand() * (CONFIG.distractorEverySec[1] - CONFIG.distractorEverySec[0]); }
      if (S.simT >= S.durMin * 60 && !activeHazard()) endSession('complete');
    }
    // 纵向速度：起步 1.5 m/s²，制动 4 m/s²
    const dv = S.egoTarget - S.egoSpeed;
    S.egoSpeed += Math.sign(dv) * Math.min(Math.abs(dv), (dv > 0 ? 1.5 : 4) * dt);
    // 横向：自动变道
    const dx = S.egoXTarget - S.egoX; S.egoX += Math.sign(dx) * Math.min(Math.abs(dx), S.egoXRate * dt);
    world.position.x = CAR_CX - S.egoX;

    const adv = S.egoSpeed * dt;
    dashTex.offset.y -= adv / 12;
    for (const o of roadside) { o.position.z += adv; if (o.position.z > 30) o.position.z -= SPAN; }
    for (const c of oncoming) { c.position.z += adv + CRUISE * dt; if (c.position.z > 40) c.position.z -= 450; }
    for (let i = distractors.length - 1; i >= 0; i--) {
      const g = distractors[i]; g.position.z += adv;
      if (g.position.z > 40) { world.remove(g); distractors.splice(i, 1); }
    }
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i]; h.obj.position.z += adv;
      if (h.stage !== 'gone') updateHazard(h, dt);
      if (h.obj.position.z > 40 || h.obj.position.z < -400) {
        if (h.stage !== 'resolved' && h.stage !== 'gone') setStage(h, 'resolved');
        h.stage = 'gone'; world.remove(h.obj); if (h.ring) world.remove(h.ring); hazards.splice(i, 1);
      }
    }
  }
  if (S.phase !== 'idle') {
    drawHMI(rdt);
    if (haveHead) logFrame(dt || rdt);
    if (performance.now() - LOG.lastUp > CONFIG.uploadEverySec * 1000 && S.phase !== 'end') { LOG.lastUp = performance.now(); upload(); }
  }
  renderer.render(scene, camera);
});

// ───────────────────────── 2D 控制页 ─────────────────────────
const $ = id => document.getElementById(id);
function updateStatus() {
  const el = $('status'); if (!el) return;
  const f = LOG.frames.length - 1, e = LOG.events.length - 1;
  el.textContent = `已记录 ${f} 帧、${e} 个事件。` + (LOG.ok === true ? '已同步到电脑。' : LOG.ok === false ? '未能同步到电脑，结束后请手动下载。' : '');
}
function formOpts(xr) {
  return {
    pid: ($('pid').value || 'P00').trim(), cond: $('cond').value,
    durMin: +$('dur').value || CONFIG.durationMin, timeScale: +(qs.get('speed') || 1), xr,
  };
}
for (const [k, id] of [['pid', 'pid'], ['cond', 'cond'], ['dur', 'dur']]) if (qs.get(k)) $(id).value = qs.get(k);

async function enterVR() {
  const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'hand-tracking'] });
  renderer.xr.setFoveation(1);
  await renderer.xr.setSession(session);
  begin(formOpts(true));
  session.addEventListener('end', () => { S.xr = false; if (S.phase !== 'end') endSession('exit_vr'); });
}
$('btn-vr').addEventListener('click', () => enterVR().catch(err => { $('xr-note').textContent = `无法进入 VR：${err.message}`; }));
$('btn-desk').addEventListener('click', () => { begin(formOpts(false)); });
$('btn-end').addEventListener('click', () => endSession('manual'));
$('btn-dl').addEventListener('click', () => {
  const n = `${S.pid}_${S.sid}`;
  download(`${n}_frames.csv`, LOG.frames.join('\n') + '\n');
  download(`${n}_events.csv`, LOG.events.join('\n') + '\n');
  download(`${n}_meta.json`, JSON.stringify(meta(), null, 2), 'application/json');
});
if (navigator.xr) {
  navigator.xr.isSessionSupported('immersive-vr').then(ok => {
    $('btn-vr').disabled = !ok;
    if (!ok) $('xr-note').textContent = '这台设备不支持 VR。可以先用桌面预览检查流程。';
    if (!window.isSecureContext) $('xr-note').textContent = '当前不是安全连接，VR 无法启用。请用 localhost（USB 连线）或 https 打开。';
  });
} else { $('btn-vr').disabled = true; $('xr-note').textContent = window.isSecureContext ? '这台设备不支持 VR。可以先用桌面预览检查流程。' : '当前不是安全连接，VR 无法启用。请用 localhost（USB 连线）或 https 打开。'; }
setInterval(updateStatus, 1000);

// ───────────────────────── 心跳：把当前状态发给电脑端监控页 ─────────────────────────
async function heartbeat() {
  const h = activeHazard() || hazards.find(x => x.stage === 'approach');
  const st = {
    pid: S.pid, sid: S.sid, cond: S.cond, phase: S.phase, xr: S.xr, durMin: S.durMin,
    simT: +S.simT.toFixed(1), speedKmh: Math.round(S.egoSpeed * 3.6), fps,
    yaw: +head.yaw.toFixed(1), pitch: +head.pitch.toFixed(1), aoi: S.phase === 'idle' ? '' : aoiOf(head.yaw, head.pitch),
    hazard: h ? { id: h.id, type: h.type, stage: h.stage } : null, hmiVisible,
    frames: LOG.frames.length - 1, events: LOG.events.length - 1, synced: LOG.ok,
    schedule: schedule.map(e => [Math.round(e.t), e.type, e.done]),
    recent: LOG.recent.slice(-12),
  };
  try {
    const r = await fetch('./status', { method: 'POST', body: JSON.stringify(st), headers: { 'Content-Type': 'application/json' } });
    const { cmd } = await r.json();
    if (cmd === 'recenter') S.pendingRecenter = true;
    if (cmd === 'end' && S.phase !== 'idle') endSession('remote');
  } catch (e) { /* 没有连电脑时忽略 */ }
}
setInterval(heartbeat, 500);
