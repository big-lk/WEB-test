// 驾驶 HMI 注意力实验 · WebXR 主程序（Quest 3 浏览器 / 桌面预览）
import * as THREE from './vendor/three.module.js';
import { CONFIG } from './config.js';
import { initBot } from './simbot.js';
import { initCues } from './cues.js';
import { buildCockpit } from './cockpit.js';
import { initScenery, makeFacade } from './scenery.js';

const DEG = Math.PI / 180;
const qs = new URLSearchParams(location.search);

// ───────────────────────── 会话参数 ─────────────────────────
const TOTAL_MIN = CONFIG.segmentsMin.reduce((a, b) => a + b, 0);
const S = {
  pid: 'P00', cond: 'A', durMin: TOTAL_MIN, timeScale: 1,
  sid: '', phase: 'idle',           // idle → calib → brief → drive → end
  simT: 0, wallStart: 0, phaseT: 0,
  egoSpeed: CONFIG.speedKmh / 3.6, egoTarget: CONFIG.speedKmh / 3.6,
  egoX: 0, egoXTarget: 0, egoXRate: 0, egoXBase: 0,
  xr: false,
  // 里程与三段式
  s: 0, segment: 1, segBounds: [0, 0, 0], totalLen: 0, lenScale: 1,
  // 预防动作（线索）与驾驶员监测对车速、横向位置的修正；与危险事件的控制量分开
  prevDv: 0, prevDx: 0, prevX: 0, dmsLimit: null,
  sim: false, record: false,
};
const CRUISE = CONFIG.speedKmh / 3.6;
function setupSegments() {
  const k = S.durMin / TOTAL_MIN; let acc = 0;
  S.lenScale = k; S.segBounds = CONFIG.segmentsMin.map(m => (acc += m * k * 60 * CRUISE)); S.totalLen = acc;
}
const segmentAt = s => (s < S.segBounds[0] ? 1 : s < S.segBounds[1] ? 2 : 3);
// 当前生效的方案：只有第二段按 cond，第一、三段不显示任何方案提示（等同 A）
const effCond = () => (S.segment === 2 ? S.cond : 'A');

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
const cabin = buildCockpit({ THREE, cockpit, mat, box, CAR_CX, EYE });   // 完整的座舱，见 cockpit.js

// 方向盘与灯带
const wheel = new THREE.Group(); wheel.position.set(0, 0.86, -0.45); wheel.rotation.x = -0.35; cockpit.add(wheel);
wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 10, 48), mat(0x1c1d20)));
const hub = box(0.12, 0.08, 0.04, mat(0x1c1d20)); wheel.add(hub);
const wheelBandMat = new THREE.MeshBasicMaterial({ color: 0x1b3a40, toneMapped: false });
const wheelBand = new THREE.Mesh(new THREE.TorusGeometry(0.182, 0.008, 6, 40, Math.PI * 0.6), wheelBandMat);
wheelBand.rotation.z = Math.PI * 0.2; wheelBand.position.z = 0.012; wheel.add(wheelBand); wheelBand.visible = !!CONFIG.wheelLight;
cabin.dressWheel(wheel);

// 仪表屏
// 仪表屏：一块窄屏立在仪表台台面上、方向盘上沿的后面（从方向盘上方看过去）。
// 从眼点看，它的上沿在水平线下约 10°，和仪表台远端的轮廓线齐平：不挡路面，也不挡 HUD（HUD 在 -2° 到 -6°）。
const dashBezel = mat(0x0c0d0f);
function mountScreen(p, w, h, pos, yawDeg, pitchDeg, neck) {   // 屏幕 + 背壳 + 支架；背壳比屏大一圈、在屏后 8 毫米
  p.mesh.position.set(...pos); p.mesh.rotation.set(pitchDeg * DEG, yawDeg * DEG, 0, 'YXZ'); cockpit.add(p.mesh);
  const back = box(w + 0.016, h + 0.016, 0.012, dashBezel); back.position.copy(p.mesh.position); back.quaternion.copy(p.mesh.quaternion); back.translateZ(-0.008); cockpit.add(back);
  if (neck) { const n = box(...neck.size, dashBezel); n.position.set(...neck.pos); cockpit.add(n); }
}
const cluster = canvasPanel(0.21, 0.074, 512, 180);
mountScreen(cluster, 0.21, 0.074, [0, 0.895, -0.608], 0, -18);   // 仪表屏：在仪表台立面上，从方向盘上半圈里看过去
// 中控屏
// 中控屏：横屏，悬在仪表台正面的前方（离仪表台正面留 2 厘米以上），整块在台面轮廓线以下，不挡右前方的路面。
// 向驾驶员一侧转 14°、向后仰 12°；这两个角度下屏幕四角都不会碰到仪表台和下方的中控面板。
const center = canvasPanel(0.30, 0.20, 480, 320);
mountScreen(center, 0.30, 0.20, [0.53, 0.86, -0.552], -14, -12, { size: [0.08, 0.05, 0.05], pos: [0.53, 0.80, -0.595] });
// HUD 虚像：7.5 m 处，10°×3.5°，中心下俯 4°
const HUD_D = 7.5, HUD_HALF = 10, HUD_W = 2 * HUD_D * Math.tan(HUD_HALF * DEG), HUD_H = HUD_W * 360 / 1024;   // HUD 宽 20°、高约 7°
const hud = canvasPanel(HUD_W, HUD_H, 1024, 360, { depthTest: false, renderOrder: 10 });
hud.mesh.position.set(0, EYE - HUD_D * Math.tan(6 * DEG), -HUD_D); cockpit.add(hud.mesh);
// 说明面板（校准、说明、结束）
const panel = canvasPanel(1.2, 0.6, 1024, 512, { depthTest: false, renderOrder: 20 });
panel.mesh.position.set(0, EYE, -1.6); cockpit.add(panel.mesh);

// 手机（次任务）：放在方向盘右下方，内容定时更换
const phone = canvasPanel(0.085, 0.17, 240, 480);
phone.mesh.position.set(...CONFIG.phone.pos); phone.mesh.lookAt(0, EYE, 0); phone.mesh.visible = CONFIG.phone.enabled; cockpit.add(phone.mesh);
{ const back = box(0.095, 0.18, 0.012, mat(0x101113)); back.position.copy(phone.mesh.position); back.quaternion.copy(phone.mesh.quaternion); back.translateZ(-0.008); back.visible = CONFIG.phone.enabled; cockpit.add(back);
  const arm = box(0.02, 0.14, 0.02, mat(0x101113)); arm.position.set(CONFIG.phone.pos[0] + 0.03, CONFIG.phone.pos[1] - 0.09, CONFIG.phone.pos[2] + 0.03); arm.visible = CONFIG.phone.enabled; cockpit.add(arm); }
const FEED = ['今晚吃什么？附近 5 家新店', '周末天气：晴，最低 -3°C', '新消息 3 条', '雪祭门票今天开售', '朋友发来一张照片', '本周热门短片', '快递已到驿站', '明天 10:00 有日程'];
let phoneKey = '';
function drawPhone(dim) {
  if (!CONFIG.phone.enabled) return;
  const nt = notice(), note = nt && nt.target === 'phone' ? nt : null;
  const idx = Math.floor(S.simT / CONFIG.phone.feedEverySec), key = `${idx}|${dim ? 1 : 0}|${note ? note.id : ''}`;
  if (key === phoneKey) return; phoneKey = key;
  const c = phone.ctx; c.fillStyle = '#f4f6f8'; c.fillRect(0, 0, 240, 480);
  c.fillStyle = '#1d2a33'; c.font = `bold 22px ${FONT}`; c.textAlign = 'left'; c.textBaseline = 'middle';
  for (let i = 0; i < 4; i++) {
    const y = 30 + i * 112; c.fillStyle = `hsl(${(idx * 47 + i * 83) % 360},45%,${i === 0 ? 62 : 80}%)`; c.fillRect(14, y, 212, 64);
    c.fillStyle = '#1d2a33'; const t = FEED[(idx + i) % FEED.length];
    c.fillText(t.slice(0, 9), 16, y + 82); c.fillStyle = '#7b8a95'; c.fillText(t.slice(9, 18), 16, y + 104);
  }
  if (note) {   // 新消息横幅
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 0, 240, 480);
    c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(8, 16, 224, 112, 16); c.fill();
    c.fillStyle = '#e5383b'; c.beginPath(); c.arc(30, 44, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1d2a33'; c.font = `bold 22px ${FONT}`; c.fillText('新消息', 48, 44); c.font = `20px ${FONT}`;
    c.fillText(note.text.slice(0, 10), 20, 80); c.fillText(note.text.slice(10, 20), 20, 106);
  }
  if (dim) { c.fillStyle = 'rgba(0,0,0,0.72)'; c.fillRect(0, 0, 240, 480); }
  phone.tex.needsUpdate = true;
}

// ───────────────────────── 视线：有眼动数据用眼动，没有就用头部朝向 ─────────────────────────
// eye：眼睛相对头部的角度（由校准把套件的原始 x、y 换算成度）；gaze：视线在车辆坐标里的方向 = 头部朝向 + 眼睛角度
const eye = { x: 0, y: 0, open: 1, wall: -1e9, n: 0, yaw: 0, pitch: 0, valid: false, usable: true, M: null, rms: null };
const gaze = { yaw: 0, pitch: 0, src: 'head', dir: new THREE.Vector3(0, 0, -1) };
function pushEye(s) { eye.x = +s.x; eye.y = +s.y; eye.open = s.open ?? 1; eye.wall = performance.now(); eye.n++; }
function updateGaze() {
  const E = CONFIG.eye;
  eye.valid = E.enabled && eye.usable && performance.now() - eye.wall < E.staleSec * 1000 && eye.open > 0.2;
  if (eye.valid) { const M = eye.M; eye.yaw = M ? M[0] * eye.x + M[1] * eye.y + M[2] : eye.x; eye.pitch = M ? M[3] * eye.x + M[4] * eye.y + M[5] : eye.y; }
  gaze.src = eye.valid ? 'eye' : 'head';
  gaze.yaw = head.yaw + (eye.valid ? eye.yaw : 0); gaze.pitch = head.pitch + (eye.valid ? eye.pitch : 0);
  const y = gaze.yaw * DEG, p = gaze.pitch * DEG;
  gaze.dir.set(Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p));
}
// 眼动校准：依次看几个黄点，用最小二乘把原始 (x, y) 拟合成角度
const calDot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd23f, depthTest: false, fog: false, toneMapped: false }));
calDot.renderOrder = 30; calDot.visible = false; cockpit.add(calDot);
const cal = { t: 0, samples: [] };
function solve3(A, b) {   // 3×3 线性方程组（克莱姆法则）
  const det = m => m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
  const d = det(A); if (Math.abs(d) < 1e-9) return null;
  return [0, 1, 2].map(k => { const m = A.slice(); for (let r = 0; r < 3; r++) m[r * 3 + k] = b[r]; return det(m) / d; });
}
function fitEye(samples) {
  const A = new Array(9).fill(0), by = [0, 0, 0], bp = [0, 0, 0];
  for (const s of samples) { const v = [s.x, s.y, 1]; for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) A[i * 3 + j] += v[i] * v[j]; by[i] += v[i] * s.ty; bp[i] += v[i] * s.tp; } }
  const a = solve3(A, by), c = solve3(A, bp); if (!a || !c) return null;
  let sq = 0; for (const s of samples) sq += (a[0] * s.x + a[1] * s.y + a[2] - s.ty) ** 2 + (c[0] * s.x + c[1] * s.y + c[2] - s.tp) ** 2;
  return { M: [...a, ...c], rms: Math.sqrt(sq / samples.length) };
}
function stepEyeCal(rdt) {
  const E = CONFIG.eye, pts = E.calibPoints, INTRO = 2.5;
  cal.t += rdt;
  const k = Math.floor((cal.t - INTRO) / E.calibHoldSec);
  if (cal.t < INTRO) { S.calTarget = null; return; }
  if (k >= pts.length) {
    calDot.visible = false; S.calTarget = null;
    const seen = new Set(cal.samples.map(s => s.k)), fit = seen.size >= 3 ? fitEye(cal.samples) : null;
    if (fit && fit.rms <= E.calibMaxRmsDeg) { eye.M = fit.M; eye.rms = fit.rms; logEvent('eye_calib', '', '', 'ok', `rms=${fit.rms.toFixed(2)};n=${cal.samples.length};M=${fit.M.map(v => v.toFixed(3)).join(' ')}`); }
    else { eye.usable = false; logEvent('eye_calib', '', '', 'failed', `rms=${fit ? fit.rms.toFixed(2) : 'na'};n=${cal.samples.length};points=${seen.size}`); }
    startBrief(); return;
  }
  const [ty, tp] = pts[k], y = ty * DEG, p = tp * DEG, phase = (cal.t - INTRO) / E.calibHoldSec - k;
  drawPanel(null); calDot.visible = true; calDot.position.set(2 * Math.sin(y) * Math.cos(p), EYE + 2 * Math.sin(p), -2 * Math.cos(y) * Math.cos(p));
  S.calTarget = { yaw: ty, pitch: tp };
  // 每个点后 60% 的时间取样；目标角度按当时的头部朝向修正，所以头稍微动一点也没关系
  if (phase > 0.4 && performance.now() - eye.wall < E.staleSec * 1000) cal.samples.push({ k, x: eye.x, y: eye.y, ty: ty - head.yaw, tp: tp - head.pitch });
}

// ───────────────────────── 驾驶员监测（三个方案共同的合规部分）─────────────────────────
// 视线离开道路的连续时间 → 提醒 → 警告 → 风险减缓；看回道路 recoverSec 后解除。
const dms = { off: 0, on: 0, state: 'attentive', aoi: '' };
function updateDMS(h) {
  const D = CONFIG.dms, aoi = aoiOf(gaze.yaw, gaze.pitch), off = D.offRoadAoi.includes(aoi);   // 规则不变；有眼动时按视线判断，没有时按头部
  dms.aoi = aoi;
  if (off) { dms.off += h; dms.on = 0; } else { dms.on += h; if (dms.on >= D.recoverSec) dms.off = 0; }
  const st = dms.off >= D.mitigateAfterSec ? 'mitigate' : dms.off >= D.warnAfterSec ? 'warn' : dms.off >= D.remindAfterSec ? 'remind' : (off && dms.off > 0 ? 'eyes_off' : 'attentive');
  if (st !== dms.state) {
    if (st !== 'eyes_off' && !(st === 'attentive' && dms.state === 'eyes_off')) logEvent('dms', '', '', st, `from=${dms.state};off=${dms.off.toFixed(1)};aoi=${aoi}`);
    if (st === 'warn' && D.warnSound) chime();
    dms.state = st;
  }
  S.dmsLimit = st === 'mitigate' ? D.mitigateKmh / 3.6 : null;
}
function eyeIcon(c, x, y, r, col) {
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(3, r * 0.16);
  c.beginPath(); c.moveTo(x - r, y); c.quadraticCurveTo(x, y - r * 0.9, x + r, y); c.quadraticCurveTo(x, y + r * 0.9, x - r, y); c.stroke();
  c.beginPath(); c.arc(x, y, r * 0.3, 0, Math.PI * 2); c.fill();
}

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
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.15; world.add(ground);   // 比路面低一些，避免与路面深度打架（路面整片变成草地的颜色）
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
  const bCols = [0xc9c1b4, 0xa7b3bd, 0xd8cbb0, 0x9aa49a, 0xbfa99a, 0xe0ddd5], facade = makeFacade(THREE);
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
    const b = box(w, h, d, facade(bCols[i % bCols.length], w, h, i)); b.userData = { building: true, w, h, side };
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

// 会分散注意力的东西（行人、店招、醒目物、车内通知）在 scenery.js，开始时按里程安排好
let SCN = null;
const notice = () => (SCN ? SCN.notice() : null);

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
  const ctx = () => `${CONFIG.confidence < 0.8 ? 'suppressed' : effCond()};seg=${S.segment};aoi=${aoiOf(head.yaw, head.pitch)};yaw=${head.yaw.toFixed(1)};pitch=${head.pitch.toFixed(1)}`;
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

// ───────────────────────── 提示显示（A / B / C）─────────────────────────
// A：只有共同部分（L2、驾驶员监测、请接管）。B：加上已检测到的危险的方位光带。C：加上预防性线索的提示（见 cues.js）。
const COLORS = { warn: '#f5a623', takeover: '#e5383b', l2: '#3cc6d6', dim: 'rgba(255,255,255,0.18)', cue: '#d6f5f9', remind: '#f5a623', dmsWarn: '#e5383b' };
function activeHazard() {
  let best = null;
  for (const h of hazards) if (h.stage === 'warn' || h.stage === 'takeover') { if (!best || h.stage === 'takeover') best = h; }
  return best;
}
function cockpitPos(v) { return v.clone().add(world.position); }          // world 局部 → 车辆坐标
function bearingDeg(p) { const d = p.clone().sub(new THREE.Vector3(0, EYE, 0)); return Math.atan2(d.x, -d.z) / DEG; }
function elevDeg(p) { const d = p.clone().sub(new THREE.Vector3(0, EYE, 0)); return Math.atan2(d.y, Math.hypot(d.x, d.z)) / DEG; }

let hmiKey = '', hmiPulseT = 0, hmiVisible = 0, ringShown = false;
// 此刻是否有方案提示或「请接管」在显示（按状态计算，加速模式下也和记录的时刻对得上）
function hmiVisibleNow() {
  const h = activeHazard(), stage = h && CONFIG.confidence >= 0.8 ? h.stage : 'none';
  return +(stage === 'takeover' || (effCond() === 'H' && stage !== 'none') || ringShown || !!cueDisplay().mode);
}
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
  const cond = effCond(), dmsSt = S.phase === 'drive' ? dms.state : 'attentive';
  const dmsCol = dmsSt === 'remind' ? COLORS.remind : (dmsSt === 'warn' || dmsSt === 'mitigate') ? COLORS.dmsWarn : null;
  const blink = dmsCol && dmsSt !== 'remind' ? Math.round(pulseDms() * 4) : 0;
  const cd = cueDisplay();
  const key = `${cond}|${stage}|${Math.round(bear * 2)}|${Math.round(pulse * 10)}|${S.phase}|${dmsSt}|${blink}|${cd.key}`;
  if (key !== hmiKey) {
    hmiKey = key; const c = hud.ctx, W = 1024, H = 360; c.clearRect(0, 0, W, H);
    const driving = S.phase === 'drive' || S.phase === 'brief';
    if (driving) {
      // HMI 区域的边框：淡底 + 细线 + 四角加粗，三个方案相同，让这块区域和下面的仪表屏分得开
      c.fillStyle = 'rgba(10,18,22,0.24)'; c.beginPath(); c.roundRect(5, 5, W - 10, H - 10, 26); c.fill();
      c.strokeStyle = 'rgba(214,245,249,0.38)'; c.lineWidth = 3; c.stroke();
      c.strokeStyle = 'rgba(214,245,249,0.85)'; c.lineWidth = 6; c.lineCap = 'round';
      for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const x0 = sx > 0 ? 5 : W - 5, y0 = sy > 0 ? 5 : H - 5;
        c.beginPath(); c.moveTo(x0, y0 + sy * 62); c.arcTo(x0, y0, x0 + sx * 62, y0, 26); c.lineTo(x0 + sx * 62, y0); c.stroke();
      }
      capsule(c, 24, H - 112, 140, 70, 'rgba(20,30,34,0.55)');
      c.fillStyle = COLORS.l2; c.font = `bold 46px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('L2', 94, H - 77);
      c.fillStyle = COLORS.dim; c.fillRect(170, H - 30, W - 340, 6);          // 视野下缘光带（底线，三个方案相同）
      if (dmsCol) { c.globalAlpha = dmsSt === 'remind' ? 1 : pulseDms(); eyeIcon(c, 94, 84, 34, dmsCol); c.globalAlpha = 1; }
    }
    if (cond === 'H' && driving && stage !== 'none') {                         // 旧方案 B（cond=H，已不在三方案内）：已检测到的危险在哪边
      const col = COLORS[stage], half = (W - 340) / 2, cx = W / 2 + Math.max(-1, Math.min(1, bear / HUD_HALF)) * half;
      c.globalAlpha = pulse; c.fillStyle = col; c.fillRect(Math.max(170, cx - 70), H - 36, 140, 18);
      if (Math.abs(bear) > HUD_HALF) {                // 目标在 HUD 范围外：边缘箭头
        const s = Math.sign(bear), ex = s > 0 ? W - 150 : 150; c.beginPath();
        c.moveTo(ex + s * 30, H - 27); c.lineTo(ex - s * 4, H - 50); c.lineTo(ex - s * 4, H - 4); c.fill();
      }
      c.globalAlpha = 1;
    }
    if (driving && cd.mode && stage !== 'takeover') drawCueOnHud(c, W, H);                         // C：预防性线索的图形或对勾
    if (stage === 'takeover') {                                                // 请接管：三个方案相同
      c.globalAlpha = pulse; capsule(c, W / 2 - 230, H / 2 - 76, 460, 140, COLORS.takeover);
      c.fillStyle = '#fff'; c.font = `bold 86px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('请接管', W / 2, H / 2 - 4);
      c.globalAlpha = 1;
    }
    hud.tex.needsUpdate = true;
  }
  let ringVisible = false;

  // —— 旧版 C「路上预判」：AR 贴地光圈，只在 AR-HUD 视场内显示（legacyC.roadPreview，默认关）——
  for (const hz of hazards) {
    if (!(CONFIG.legacyC.roadPreview && cond === 'C')) { if (hz.ring) hz.ring.visible = false; continue; }
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

  ringShown = ringVisible; hmiVisible = hmiVisibleNow();

  // —— 仪表屏、方向盘灯带：所有方案同步“请接管”——
  wheelBandMat.color.set(stage === 'takeover' ? new THREE.Color(0xe5383b).multiplyScalar(pulse)
    : dmsCol ? new THREE.Color(dmsCol).multiplyScalar(dmsSt === 'remind' ? 1 : pulseDms()) : (S.phase === 'drive' ? 0x1f5961 : 0x1b2a2e));
  drawCluster(stage, pulse, dmsSt, dmsCol);
  drawCenter();
  drawPhone(CONFIG.legacyC.phoneDim && cond === 'C' && stage !== 'none');
  vignette.visible = CONFIG.legacyC.vignetteCountdown && cond === 'C' && stage === 'warn';
  if (vignette.visible) vignette.material.opacity = 0.25 + 0.5 * Math.min(1, (S.simT - (h.tWarn ?? S.simT)) / 2);
}
const pulseDms = () => 0.55 + 0.45 * Math.abs(Math.sin(hmiPulseT * 4));
// 旧版 C「暗角倒计时」：接管前视野边缘逐渐变暗（legacyC.vignetteCountdown，默认关）
const vignette = new THREE.Mesh(new THREE.RingGeometry(0.42, 1.4, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, depthTest: false, fog: false }));
vignette.position.set(0, 0, -0.6); vignette.renderOrder = 15; vignette.visible = false; camera.add(vignette);
// 线索提示的显示状态由 cues.js 提供；没有线索模块时为空
let cueDisplay = () => ({ mode: null, key: '' }), drawCueOnCenter = null;
let drawCueOnHud = () => {};

let clusterKey = '';
function drawCluster(stage, pulse, dmsSt, dmsCol) {
  const kmh = Math.round(S.egoSpeed * 3.6), key = `${kmh}|${stage}|${Math.round(pulse * 5)}|${dmsSt}|${dmsCol && dmsSt !== 'remind' ? Math.round(pulseDms() * 4) : 0}`;
  if (key === clusterKey) return; clusterKey = key;
  const c = cluster.ctx; c.fillStyle = '#0d1114'; c.fillRect(0, 0, 512, 180);
  c.textBaseline = 'middle'; c.textAlign = 'left';
  c.fillStyle = '#e8eef2'; c.font = `bold 72px ${FONT}`; c.fillText(String(kmh), 30, 90);
  c.fillStyle = '#8a98a3'; c.font = `28px ${FONT}`; c.fillText('km/h', 150, 108);
  capsule(c, 380, 30, 100, 46, 'rgba(60,198,214,0.2)'); c.fillStyle = COLORS.l2; c.font = `bold 30px ${FONT}`; c.textAlign = 'center'; c.fillText('L2', 430, 54);
  if (dmsCol) { c.globalAlpha = dmsSt === 'remind' ? 1 : pulseDms(); eyeIcon(c, 320, 54, 26, dmsCol); c.globalAlpha = 1; }
  if (stage === 'takeover') {
    c.globalAlpha = pulse; capsule(c, 250, 100, 230, 60, COLORS.takeover);
    c.fillStyle = '#fff'; c.font = `bold 36px ${FONT}`; c.fillText('请接管', 365, 131); c.globalAlpha = 1;
  }
  cluster.tex.needsUpdate = true;
}

let centerKey = '';
function drawCenter() {   // 中控屏：正在播放的内容每 45 秒换一条，进度条在走；偶尔弹出一条消息
  const song = SCN ? SCN.song() : ['轻音乐电台', ''], nt = notice(), note = nt && nt.target === 'center' ? nt : null;
  const prog = (S.simT % 45) / 45, key = `${song[0]}|${Math.floor(prog * 60)}|${note ? note.id : ''}|${S.cond === 'B' && activeHazard()?.stage !== 'takeover' ? cueDisplay().key : ''}`;
  if (centerKey === key) return; centerKey = key;
  const c = center.ctx, W = 480, H = 320, hue = (song[0].length * 67) % 360;
  c.fillStyle = '#12171b'; c.fillRect(0, 0, W, H);
  c.fillStyle = `hsl(${hue},45%,42%)`; c.fillRect(30, 60, 120, 120); c.fillStyle = `hsl(${hue},45%,62%)`; c.beginPath(); c.arc(90, 120, 34, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#e8eef2'; c.font = `bold 30px ${FONT}`; c.textAlign = 'left'; c.textBaseline = 'middle';
  c.fillText('正在播放', 175, 90); c.fillStyle = '#c9d3da'; c.font = `26px ${FONT}`; c.fillText(song[0], 175, 132); c.fillStyle = '#8a98a3'; c.font = `22px ${FONT}`; c.fillText(song[1], 175, 168);
  c.fillStyle = '#2b3a44'; c.fillRect(30, 232, 420, 6); c.fillStyle = '#3cc6d6'; c.fillRect(30, 232, 420 * prog, 6);
  c.fillStyle = '#8a98a3'; for (const [x, t] of [[150, '⏮'], [228, '⏸'], [306, '⏭']]) { c.font = `34px ${FONT}`; c.fillText(t, x, 280); }
  if (note) {
    c.fillStyle = '#f4f6f8'; c.beginPath(); c.roundRect(14, 10, W - 28, 64, 14); c.fill();
    c.fillStyle = '#e5383b'; c.beginPath(); c.arc(40, 42, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1d2a33'; c.font = `bold 24px ${FONT}`; c.fillText(note.text.slice(0, 16), 60, 43);
  }
  if (drawCueOnCenter && activeHazard()?.stage !== 'takeover') drawCueOnCenter(c, W, H);
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
const FRAME_COLS = ['t_sim', 't_wall_ms', 'phase', 'speed_kmh', 'ego_x', 'head_x', 'head_y', 'head_z', 'yaw', 'pitch', 'roll', 'aoi', 'hazard_id', 'hazard_type', 'hazard_stage', 'hazard_angle', 'hazard_bearing', 'hmi_visible', 'segment', 's_m', 'driver_state', 'cue_id', 'cue_display', 'gaze_yaw', 'gaze_pitch', 'gaze_src', 'aoi_gaze'];
const EVENT_COLS = ['t_sim', 't_wall_ms', 'type', 'hazard_id', 'hazard_type', 'value', 'note'];
const LOG = { frames: [FRAME_COLS.join(',')], events: [EVENT_COLS.join(',')], cues: [], sent: { frames: 0, events: 0, cues: 0 }, ok: null, lastUp: 0, recent: [] };
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
    aoiOf(head.yaw, head.pitch), h?.id ?? '', h?.type ?? '', h?.stage ?? '', ang, bear, hmiVisibleNow(),
    S.segment, S.s.toFixed(1), dms.state, cueNow().id, cueNow().display,
    gaze.yaw.toFixed(1), gaze.pitch.toFixed(1), gaze.src, aoiOf(gaze.yaw, gaze.pitch)].join(','));
}
let uploading = false, pendingFinal = false;
async function upload(final = false) {
  if (uploading) { if (final) pendingFinal = true; return; }   // 正在上传时不并发；结束时的那一次排队重发
  uploading = true;
  const base = `pid=${encodeURIComponent(S.pid)}&sid=${S.sid}`;
  for (const kind of ['frames', 'events', 'cues']) {
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
  if (pendingFinal) { pendingFinal = false; return upload(true); }
}
function meta() {
  return { pid: S.pid, sid: S.sid, cond: S.cond, durMin: S.durMin, timeScale: S.timeScale, xr: S.xr, sim: S.sim, record: S.record,
    segBounds: S.segBounds, totalLen: S.totalLen, distance: S.s, userAgent: navigator.userAgent,
    eye: { samples: eye.n, usable: eye.usable, calibRmsDeg: eye.rms, M: eye.M },
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
  if (!drag || S.xr || S.sim || S.record) return;
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
  setupSegments();
  logEvent('session_start', '', '', S.cond, `pid=${S.pid};dur=${S.durMin};xr=${S.xr};scale=${S.timeScale};sim=${S.sim};record=${S.record};seg_m=${S.segBounds.map(Math.round).join('/')}`);
  buildSchedule();
  if (S.record && !CONFIG.record.hazards) schedule = [];
  CUES = initCues({ THREE, CONFIG, S, world, cockpit, head, gaze, eye, aoiOf, logEvent, makeCar, mat, box, canvasPanel, activeHazard, dms, CRUISE, EYE, LOG });
  SCN = initScenery({ THREE, CONFIG, S, world, cockpitRoot, roadside, oncoming, SPAN, CRUISE, logEvent, mat, box, canvasPanel, makeCar, mulberry32, FONT });
  stepCues = CUES.step; cueNow = CUES.now; cueDisplay = CUES.display; drawCueOnHud = CUES.drawOnHud; drawCueOnCenter = CUES.drawOnCenter;
  if (S.sim) bot = initBot({ CONFIG, S, DEG, camera, head, dms, hazards, activeHazard, cockpitPos, bearingDeg, onPress, hashStr, mulberry32, cueNow: () => cueNow(), simLook: qs.get('simLook'), simEarly: qs.get('simEarly') === '1', simEye: qs.get('simEye') === '1', pushEye, notice });
  document.body.classList.add('running');
  if (S.record) {   // 录像模式：不校准、不显示说明，直接从第二段开头开始
    S.recordEnd = Math.min(S.segBounds[1], S.segBounds[0] + CONFIG.record.minutes * 60 * CRUISE);
    camera.rotation.set(0, 0, 0); startDrive(); return;
  }
  drawPanel(['请坐好，看向正前方', '画面会自动对准你的座位'], '#ffffff');
}
function startBrief() {
  S.phase = 'brief'; S.phaseT = 0;
  drawPanel(['自动驾驶旅行体验', '车辆会自动行驶，请放松乘坐', '可以随意观看，也可以看手机', '出现「请接管」时请按扳机键（或捏合手指）', '现在按一次开始'], '#3cc6d6');
}
function startDrive() {
  S.phase = 'drive'; S.simT = 0; S.s = S.record ? S.segBounds[0] : 0; S.segment = segmentAt(S.s); drawPanel(null);
  logEvent('drive_start', '', '', S.cond, ''); logEvent('segment', '', '', S.segment, `cond=${effCond()}`);
}
function endSession(reason) {
  if (S.phase === 'end') return;
  S.phase = 'end';
  logEvent('session_end', '', '', reason, '');
  if (S.record) document.title = '录像结束';          // 录像模式：不停车、不显示文字，只改标题方便确认
  else { S.egoTarget = 0; drawPanel(['体验结束', '请摘下头显'], '#ffffff'); }
  upload(true);
  document.body.classList.add('ended');
}
let bot = null, CUES = null;
let cueNow = () => ({ id: '', display: '' });
window.HMI = { begin, endSession, download, LOG, S, meta, onPress, hazards, dms, CONFIG, pushEye, eye, gaze, get cues() { return CUES; }, get scenery() { return SCN; }, camera };

// ───────────────────────── 主循环 ─────────────────────────
const clock = new THREE.Clock();
let fps = 0, fpsN = 0, fpsT0 = performance.now();
const MAX_STEP = 1 / 30;      // 加速模式下把一帧拆成不超过 1/30 秒的子步，保证 0.4 秒这类判定不被跳过
function stepWorld(dt) {      // 推进一小步仿真（车辆、道路、事件、监测、记录）
  if (S.phase === 'drive') {
    S.simT += dt;
    if (bot) { bot.step(dt); readHead(null); }
    updateGaze();
    for (const ev of schedule) if (!ev.done && S.simT >= ev.t && !hazards.some(h => h.stage !== 'resolved' && h.stage !== 'gone')) { ev.done = true; spawnHazard(ev.type); }
    updateDMS(dt);
    if (S.s >= S.totalLen && !activeHazard()) endSession('complete');
    if (S.record && S.s >= S.recordEnd && !activeHazard()) endSession('record_done');
  }
  // 纵向速度：危险事件的目标车速 → 驾驶员监测的风险减缓上限 → 预防动作的小幅减速
  let target = S.egoTarget;
  if (S.dmsLimit != null) target = Math.min(target, S.dmsLimit);
  target = Math.max(0, target > 0 ? target - S.prevDv : 0);
  const dv = target - S.egoSpeed, hard = S.egoSpeed > S.egoTarget + 0.05;   // 起步 1.5 m/s²，紧急制动 4 m/s²，其余柔和减速
  S.egoSpeed += Math.sign(dv) * Math.min(Math.abs(dv), (dv > 0 ? 1.5 : hard ? 4 : CONFIG.cue.slowRate) * dt);
  // 横向：危险事件的自动变道（egoXBase）+ 预防动作的小幅让出（prevX）
  const dx = S.egoXTarget - S.egoXBase; S.egoXBase += Math.sign(dx) * Math.min(Math.abs(dx), S.egoXRate * dt);
  const dp = S.prevDx - S.prevX; S.prevX += Math.sign(dp) * Math.min(Math.abs(dp), CONFIG.cue.lateralM / CONFIG.cue.lateralSec * dt);
  S.egoX = S.egoXBase + S.prevX;
  world.position.x = CAR_CX - S.egoX;

  const adv = S.egoSpeed * dt;
  if (S.phase === 'drive') {
    S.s += adv;
    const seg = segmentAt(S.s);
    if (seg !== S.segment) { S.segment = seg; logEvent('segment', '', '', seg, `cond=${effCond()};s=${S.s.toFixed(0)}`); }
  }
  dashTex.offset.y -= adv / 12;
  for (const o of roadside) { o.position.z += adv; if (o.position.z > 30) o.position.z -= SPAN; }
  for (const c of oncoming) { c.position.z += adv + CRUISE * dt; if (c.position.z > 40) c.position.z -= 450; }
  if (SCN) SCN.step(dt, adv);
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i]; h.obj.position.z += adv;
    if (h.stage !== 'gone') updateHazard(h, dt);
    if (h.obj.position.z > 40 || h.obj.position.z < -400) {
      if (h.stage !== 'resolved' && h.stage !== 'gone') setStage(h, 'resolved');
      h.stage = 'gone'; world.remove(h.obj); if (h.ring) world.remove(h.ring); hazards.splice(i, 1);
    }
  }
  if (S.phase === 'drive') stepCues(dt);
}
let stepCues = () => {};

renderer.setAnimationLoop((time, frame) => {
  const rdt = Math.min(clock.getDelta(), 0.1);
  const dt = rdt * (S.phase === 'drive' ? S.timeScale : 1);
  const haveHead = readHead(frame);
  fpsN++; if (time - fpsT0 >= 1000) { fps = Math.round(fpsN * 1000 / (time - fpsT0)); fpsN = 0; fpsT0 = time; }
  if (S.pendingRecenter && haveHead) { S.pendingRecenter = false; recenter('remote'); }

  if (S.phase === 'calib') {
    S.phaseT += rdt * (S.sim ? 10 : 1);
    if (S.phaseT > 4 && !S.calibrated && haveHead) { recenter('auto'); S.calibrated = true; }
    if (S.phaseT > 6) {   // 有眼动数据进来就先校准，否则直接进入说明
      if (CONFIG.eye.enabled && (performance.now() - eye.wall < 1000 || (bot && bot.hasEye))) { S.phase = 'eyecal'; cal.t = 0; cal.samples = []; drawPanel(['视线校准', '头尽量不动，只用眼睛', '依次看向出现的黄色圆点'], '#ffd23f'); }
      else startBrief();
    }
  }
  if (S.phase === 'eyecal') { if (bot) bot.calib(S.calTarget); stepEyeCal(rdt * (S.sim ? 6 : 1)); }
  if (S.phase === 'brief' && S.sim) onPress('sim');
  if (grips.size === 2 && S.xr) { gripT += rdt; if (gripT > 2) { recenter('grip'); gripT = -999; } }

  if (S.phase === 'drive' || S.phase === 'brief' || S.phase === 'end') {
    let rem = dt;
    while (rem > 1e-6) {
      const h = Math.min(rem, MAX_STEP); rem -= h;
      stepWorld(h);
      if (haveHead && S.phase === 'drive') logFrame(h);
      if (S.phase === 'end') break;
    }
  }
  if (S.phase !== 'idle') {
    drawHMI(rdt);
    if (haveHead && S.phase !== 'drive') logFrame(rdt);
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
    durMin: +$('dur').value || TOTAL_MIN, timeScale: +(qs.get('speed') || 1), xr, sim: qs.get('sim') === '1',
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
$('btn-post').addEventListener('click', () => { location.href = `./post.html?pid=${encodeURIComponent(S.pid)}&cond=${encodeURIComponent(S.cond)}`; });
$('btn-dl').addEventListener('click', () => {
  const n = `${S.pid}_${S.sid}`;
  download(`${n}_frames.csv`, LOG.frames.join('\n') + '\n');
  download(`${n}_events.csv`, LOG.events.join('\n') + '\n');
  if (LOG.cues.length) download(`${n}_cues.csv`, LOG.cues.join('\n') + '\n');
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
    pid: S.pid, sid: S.sid, cond: S.cond, phase: S.phase, xr: S.xr, durMin: S.durMin, segment: S.segment, effCond: effCond(), s: Math.round(S.s), driverState: dms.state,
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

// 眼动数据：从电脑端 server.py 取最新一条（套件 → 电脑 → …/gaze）。取不到（比如只是静态网页）就停止，改用头部朝向
if (CONFIG.eye.enabled && qs.get('sim') !== '1' && qs.get('record') !== '1') {
  let fails = 0;
  const iv = setInterval(async () => {
    try { const g = await (await fetch('./gaze')).json(); fails = 0; if (g && g.ageMs != null && g.ageMs < CONFIG.eye.staleSec * 1000) pushEye(g); }
    catch (e) { if (++fails > 5) clearInterval(iv); }
  }, 1000 / CONFIG.eye.pollHz);
}
// 录像用的电脑预览（record=1）：隐藏界面和调试信息，固定视角朝前，按 cond 自动跑第二段开头的几分钟
if (qs.get('record') === '1') {
  $('ui').style.display = 'none'; document.body.classList.add('record');
  setTimeout(() => begin({ pid: qs.get('pid') || 'REC', cond: qs.get('cond') || 'C', durMin: TOTAL_MIN, timeScale: +(qs.get('speed') || 1), xr: false, sim: false, record: true }), CONFIG.record.startDelaySec * 1000);
}
// 模拟被试：打开页面后自动以桌面预览开始（只用于检查流程和分析脚本）
if (qs.get('sim') === '1' && qs.get('record') !== '1') setTimeout(() => begin(formOpts(false)), 300);
