// 预防性线索：路上的线索物体、时间窗与「看向」判定、预防动作、方案 C 的提示、cues.csv。
// 线索本身在 config.js 的 cues 数组里定义。
import { CUE_TYPES, CUE_NAMES } from './config.js';
import { drawGlyph, drawCheck, drawBadge } from './glyphs.js';

export const CUE_COLS = ['cue_id', 'type', 'segment', 'side', 'hint_shown', 'looked', 'first_look_rel_s', 'anticipated', 'faded',
  'driver_state', 'on_phone', 's_m', 'action', 'cond', 'check_shown', 'hazard_overlap', 't_arrive',
  'look_src', 'looked_head', 'looked_eye', 'first_look_eye_rel_s', 'eye_valid_share', 'eye_min_angle_deg'];

// 检查线索配置：方位合法且偏离正前方 ≥ 20°、动作合法、每段六种线索各至少一次、相邻线索的时间窗不重叠
export function validateCues(CONFIG, segBounds, lenScale, cruise) {
  const C = CONFIG.cue, warn = [];
  const segOf = s => (s < segBounds[0] ? 1 : s < segBounds[1] ? 2 : 3);
  const seen = { 1: new Set(), 2: new Set(), 3: new Set() };
  const list = CONFIG.cues.map(c => ({ ...c, sEff: c.s * lenScale })).sort((a, b) => a.sEff - b.sEff);
  const ids = new Set();
  list.forEach((c, i) => {
    if (ids.has(c.id)) warn.push(`${c.id}: id 重复`); ids.add(c.id);
    if (!CUE_TYPES.includes(c.type)) warn.push(`${c.id}: 未知类型 ${c.type}`);
    const b = C.bearings[c.side];
    if (b == null) warn.push(`${c.id}: 未知方位 ${c.side}`);
    else if (Math.abs(b) < 20) warn.push(`${c.id}: 方位 ${c.side} 偏离正前方不足 20°`);
    if (!['slow', 'left', 'right'].includes(c.action)) warn.push(`${c.id}: 未知预防动作 ${c.action}`);
    if (c.sEff <= 0 || c.sEff >= segBounds[2]) warn.push(`${c.id}: 里程 ${c.s} 超出路线`);
    else seen[segOf(c.sEff)].add(c.type);
    if (i > 0 && c.sEff - list[i - 1].sEff < (C.windowBeforeSec + 2) * cruise) warn.push(`${c.id}: 与 ${list[i - 1].id} 相距不足 ${Math.round((C.windowBeforeSec + 2) * cruise)} 米，时间窗会重叠`);
  });
  for (const seg of [1, 2, 3]) for (const t of CUE_TYPES) if (!seen[seg].has(t)) warn.push(`第 ${seg} 段缺少线索类型 ${t}`);
  return { list, warn, segOf };
}

const FONT = '"Noto Sans SC","Noto Sans CJK SC","PingFang SC",system-ui,sans-serif';
export function initCues(ctx) {
  const { THREE, CONFIG, S, world, cockpit, head, gaze, eye, aoiOf, logEvent, makeCar, mat, box, canvasPanel, activeHazard, dms, CRUISE, EYE, LOG } = ctx;
  const C = CONFIG.cue;
  const { list, warn, segOf } = validateCues(CONFIG, S.segBounds, S.lenScale, CRUISE);
  for (const w of warn) { console.warn('[cues]', w); logEvent('cue_config_warning', '', '', w, ''); }
  logEvent('cue_plan', '', '', list.length, [1, 2, 3].map(g => `seg${g}=${list.filter(c => segOf(c.sEff) === g).length}`).join(';'));
  LOG.cues.push(CUE_COLS.join(','));

  // ── 线索物体 ──（参考点在 z = 0：本车与它平齐时算「到达」）
  const dark = mat(0x2b3138), lamp = new THREE.MeshBasicMaterial({ color: 0xff2a1a, toneMapped: false });
  const bay = (len) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.5, len), mat(0x4a4d51)); m.rotation.x = -Math.PI / 2; m.position.set(2.95, 0.13, len / 2 - 1.5); return m; };
  const person = (color = 0x3d6fb0) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.0, 8), mat(color)); b.position.y = 0.9; g.add(b);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), mat(0xe9c3a0)); h.position.y = 1.58; g.add(h); return g;
  };
  const tail = (car, on) => { for (const x of [-0.7, 0.7]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.06), on ? lamp : mat(0x6b1a14)); l.position.set(x, 0.8, 2.22); car.add(l); } };
  const builders = {
    parked_front(c) {                            // 停着的车头前：行人可能从车头前走出来
      const g = new THREE.Group();
      if (c.side.includes('right')) {            // 右侧停车位里的厢式车
        g.add(bay(8)); const van = box(1.95, 1.9, 4.8, mat(0xe9e6df)); van.position.set(2.95, 1.08, 2.6); g.add(van);
        const cab = box(1.9, 0.7, 0.9, dark); cab.position.set(2.95, 1.45, 0.45); g.add(cab);
      } else {                                   // 左侧车道上停在斑马线前的车
        const car = makeCar(0x7d8894); car.position.set(-3.5, 0, 2.4); tail(car, true); g.add(car);
        for (let i = 0; i < 9; i++) { const z = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 3), mat(0xf2f2f2)); z.rotation.x = -Math.PI / 2; z.position.set(-11.6 + i * 1.6, 0.012, -3.2); g.add(z); }
      }
      return g;
    },
    bus_stop(c) {                                // 公交站：有人会从车前或对面跑过来
      const g = new THREE.Group(), right = c.side.includes('right'), x = right ? 4.5 : -13.7;
      const roof = box(1.5, 0.1, 4.2, mat(0x3f6f8a)); roof.position.set(x, 2.5, 0); g.add(roof);
      const back = box(0.08, 1.6, 4.2, mat(0xb9d3df, { transparent: true, opacity: 0.6 })); back.position.set(x + (right ? 0.7 : -0.7), 1.5, 0); g.add(back);
      for (const z of [-2, 2]) { const p = box(0.08, 2.4, 0.08, mat(0x6f7a80)); p.position.set(x - (right ? 0.6 : -0.6), 1.3, z); g.add(p); }
      const sign = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), new THREE.MeshLambertMaterial({ color: 0x2a6fd6, side: THREE.DoubleSide })); sign.position.set(right ? 2.2 : -12.6, 2.6, -2.8); g.add(sign);
      const pole = box(0.07, 2.6, 0.07, mat(0x6f7a80)); pole.position.set(right ? 2.2 : -12.6, 1.3, -2.8); g.add(pole);
      if (right) { g.add(bay(14)); const bus = box(2.5, 3.0, 10.5, mat(0x2e7d5b)); bus.position.set(3.05, 1.75, 5.6); g.add(bus); const win = box(2.52, 0.9, 9.6, dark); win.position.set(3.05, 2.3, 5.6); g.add(win); }
      else { const p1 = person(0xb0503d); p1.position.set(-12.9, 0.12, 0.6); g.add(p1); const p2 = person(); p2.position.set(-13.3, 0.12, -0.8); g.add(p2); }
      return g;
    },
    blind_junction(c) {                          // 视线被挡的路口：围挡挡住了横向来车
      const g = new THREE.Group(), right = c.side === 'right', sx = right ? 1 : -1;
      const road = new THREE.Mesh(new THREE.PlaneGeometry(34, 7), mat(0x55585c)); road.rotation.x = -Math.PI / 2;
      road.position.set(right ? 18.7 : -29.2, 0.125, 0); g.add(road);
      const wall = box(0.3, 2.7, 17, mat(0x9c8f7c)); wall.position.set(right ? 2.3 : -12.8, 1.45, 12.2); g.add(wall);
      const wall2 = box(9, 2.7, 0.3, mat(0x9c8f7c)); wall2.position.set((right ? 2.3 : -12.8) + sx * 4.5, 1.45, 3.8); g.add(wall2);
      const stop = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 6.4), mat(0xf2f2f2)); stop.rotation.x = -Math.PI / 2; stop.position.set(right ? 2.2 : -12.7, 0.14, 0); g.add(stop);
      return g;
    },
    door_zone() {                                // 路边刚停下的车：车门可能打开
      const g = new THREE.Group(); g.add(bay(8));
      const car = makeCar(0x8f3b34); car.position.set(2.95, 0.13, 0.4); tail(car, true); g.add(car);
      const occ = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(0x1a1a1a)); occ.position.set(2.55, 1.35, 0.2); g.add(occ);
      return g;
    },
    cyclist() {                                  // 骑车的人：贴着本车道右侧同向骑行
      const g = new THREE.Group(), fm = mat(0x24282c);
      for (const z of [-0.55, 0.55]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.035, 6, 18), fm); w.rotation.y = Math.PI / 2; w.position.set(1.35, 0.35, z); g.add(w); }
      const bar = box(0.05, 0.05, 1.1, fm); bar.position.set(1.35, 0.72, 0); g.add(bar);
      const r = person(0xd9a21b); r.position.set(1.35, 0.35, 0.1); r.scale.set(0.9, 0.85, 0.9); r.rotation.x = -0.25; g.add(r);
      return g;
    },
    lead_brake() {                               // 左侧车道上的两辆车，前面那辆在刹车
      const g = new THREE.Group();
      const rear = makeCar(0x51606b); rear.position.set(-3.5, 0, 0); tail(rear, false); g.add(rear);
      const front = makeCar(0xd0d4d8); front.position.set(-3.5, 0, -9.5); tail(front, true); g.add(front);
      return g;
    },
  };
  // 物体相对本车的接近速度比例：静止物体为 1；同向移动的物体小于 1（仍在里程 s 处与本车平齐）
  const RATIO = { cyclist: 1 - 4.5 / CRUISE, lead_brake: 1 - 9 / CRUISE };
  const PASS_M = 8;                              // 驶过参考点多少米算「通过」
  // 眼动判定用的参考点：该看的那个位置（相对线索物体原点，米）。视线与它的夹角 ≤ eye.tolDeg 算看向
  const REF = {
    parked_front: c => (c.side.includes('right') ? [1.9, 0.9, -0.6] : [-2.4, 0.9, -1.6]),
    bus_stop: c => (c.side.includes('right') ? [1.9, 0.9, -0.8] : [-12.9, 1.0, 0]),
    blind_junction: c => (c.side === 'right' ? [5, 1.0, 0] : [-15.5, 1.0, 0]),
    door_zone: () => [1.95, 1.0, 0.4], cyclist: () => [1.35, 1.1, 0], lead_brake: () => [-3.5, 0.9, -9.5],
  };
  const E = CONFIG.eye, _v = new THREE.Vector3();
  function refAngle(c) {                         // 视线与参考点的夹角，以及参考点的方位（度）
    const r = c.ref || (c.ref = REF[c.type](c));
    _v.set(r[0] + world.position.x, r[1], (c.obj ? c.obj.position.z : -1e3) + r[2]).sub(head.local);
    const yaw = Math.atan2(_v.x, -_v.z) * 180 / Math.PI, pitch = Math.atan2(_v.y, Math.hypot(_v.x, _v.z)) * 180 / Math.PI;
    _v.normalize(); return { ang: Math.acos(Math.max(-1, Math.min(1, _v.dot(gaze.dir)))) * 180 / Math.PI, yaw, pitch };
  }
  const useEye = c => E.lookBy === 'eye' || (E.lookBy === 'auto' && c.winN > 0 && c.eyeN > 0.5 * c.winN);

  const cues = list.map(c => ({ ...c, segment: segOf(c.sEff), state: 'wait', obj: null, dwell: 0, looked: false, tLook: null, tArrive: null,
    dwellEye: 0, lookedEye: false, tLookEye: null, eyeN: 0, winN: 0, minAng: 999, refYaw: 0, refPitch: 0,
    hintChecked: false, anticipated: 0, hint: 0, check: 0, faded: 0, driverState: '', onPhone: 0, hazardOverlap: 0, acting: false }));
  let idx = 0;                                   // 第一个还没结束的线索
  const center = side => C.bearings[side];
  const inSector = c => {
    const aoi = aoiOf(head.yaw, head.pitch);
    return Math.abs(head.yaw - center(c.side)) <= C.tolDeg && head.pitch >= C.pitchRange[0] && head.pitch <= C.pitchRange[1] && aoi !== 'phone' && aoi !== 'center_screen';
  };
  let current = null;                            // 时间窗打开着的线索

  // ── 方案 C 的提示：仪表台灯带上四个方位的显示位 + 视野下缘光带（HUD）──
  const COL = '#d6f5f9';                         // 白青色，静止，不闪
  const stripMat = new THREE.MeshBasicMaterial({ color: 0x1d4047, toneMapped: false });
  const SP = [[-0.54, 1.05, 0.10], [-0.54, 1.03, -0.30], [-0.54, 1.0, -0.80], [-0.5, 0.995, -1.08], [0.37, 0.995, -1.14], [1.24, 0.995, -1.08], [1.28, 1.0, -0.80], [1.28, 1.02, -0.30], [1.28, 1.03, 0.10]].map(p => new THREE.Vector3(...p));
  for (let i = 0; i < SP.length - 1; i++) {      // 灯带本体：沿风挡下沿和两侧窗台的一条暗线，三个方案都有
    const a = SP[i], b = SP[i + 1], seg = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, a.distanceTo(b), 6), stripMat);
    seg.position.copy(a).add(b).multiplyScalar(0.5); seg.lookAt(b); seg.rotateX(Math.PI / 2); cockpit.add(seg);
  }
  const BADGE = { 'left': [[-0.52, 1.08, -0.19], 0.085], 'front-left': [[-0.52, 1.05, -0.74], 0.13], 'front-right': [[0.78, 1.07, -1.11], 0.19], 'right': [[1.26, 1.08, -0.46], 0.19] };
  const badges = {};
  for (const [side, [pos, w]] of Object.entries(BADGE)) {
    const b = canvasPanel(w, w * 0.6, 256, 154, { depthTest: false, renderOrder: 8 });
    b.mesh.position.set(...pos); b.mesh.lookAt(0, EYE, 0); b.mesh.visible = false; cockpit.add(b.mesh); badges[side] = b;
  }
  let disp = { mode: null, cue: null, until: 0 }, dispKey = '';
  const streak = {}, faded = new Set();
  function syncBadges() {
    const key = disp.mode ? `${disp.mode}|${disp.cue.id}` : '';
    if (key === dispKey) return key; dispKey = key;
    for (const [side, b] of Object.entries(badges)) {
      const on = disp.mode && S.cond === 'C' && disp.cue.side === side; b.mesh.visible = !!on; if (!on) continue;
      const c = b.ctx; c.clearRect(0, 0, 256, 154); drawBadge(c, 128, 77, 240, 138, COL);
      if (disp.mode === 'glyph') drawGlyph(c, disp.cue.type, 128, 77, 44, COL); else drawCheck(c, 128, 77, 40, COL);
      b.tex.needsUpdate = true;
    }
    return key;
  }
  // 方案 B：车内说明。同样的时刻、同样的“先看到只给对勾 / 连续 3 次不再提示”规则，
  // 但用中控屏上的文字卡片说清楚“哪边、什么、车在做什么”，不指向车外的位置——要读就得把视线从路上移开。
  const SIDE_TXT = { left: '左侧', 'front-left': '左前方', 'front-right': '右前方', right: '右侧' };
  const ACT_TXT = { slow: '提前减速', left: '向左让出一点', right: '向右让出一点' };
  function drawOnCenter(c, W, H) {
    if (!disp.mode || S.cond !== 'B') return;
    const q = disp.cue;
    c.save(); c.fillStyle = '#12171b'; c.fillRect(0, 0, W, H); c.fillStyle = '#f4f6f8'; c.beginPath(); c.roundRect(18, 26, W - 36, H - 52, 20); c.fill();
    c.fillStyle = '#1d2a33'; c.textAlign = 'left'; c.textBaseline = 'middle';
    if (disp.mode === 'glyph') {
      c.fillStyle = '#5b6b76'; c.font = `24px ${FONT}`; c.fillText('车辆正在预防', 44, 66);
      c.fillStyle = '#1d2a33'; c.font = `bold 34px ${FONT}`; c.fillText(`${SIDE_TXT[q.side]}：${CUE_NAMES[q.type]}`, 44, 124);
      c.font = `28px ${FONT}`; c.fillText('可能突然有人或车出现', 44, 182);
      c.fillStyle = '#5b6b76'; c.font = `26px ${FONT}`; c.fillText(`车辆${ACT_TXT[q.action] || ''} · 请留意这一类地方`, 44, 238);
    } else {
      c.fillStyle = '#1d7a52'; c.font = `bold 44px ${FONT}`; c.fillText('✓ 你已经注意到了', 44, 120);
      c.fillStyle = '#1d2a33'; c.font = `30px ${FONT}`; c.fillText(`${SIDE_TXT[q.side]}：${CUE_NAMES[q.type]}`, 44, 190);
    }
    c.restore();
  }
  function drawOnHud(c, W, H) {                  // 视野下缘光带上的同一个图形：靠左或靠右表示方位，侧方再加一道折线
    if (!disp.mode || S.cond !== 'C') return;
    const left = disp.cue.side.includes('left'), sgn = left ? -1 : 1, x = left ? 330 : W - 330, y = H / 2 + 6;
    drawBadge(c, x, y, 290, 160, COL);
    if (disp.mode === 'glyph') drawGlyph(c, disp.cue.type, x, y, 52, COL); else drawCheck(c, x, y, 50, COL);
    c.save(); c.strokeStyle = COL; c.lineWidth = 8; c.lineCap = 'round'; c.lineJoin = 'round';
    for (let k = 0; k < (disp.cue.side.startsWith('front') ? 1 : 2); k++) {
      const cx = x + sgn * (166 + k * 22); c.beginPath(); c.moveTo(cx - sgn * 11, y - 32); c.lineTo(cx + sgn * 11, y); c.lineTo(cx - sgn * 11, y + 32); c.stroke();
    }
    c.restore();
  }

  function finish(c) {
    c.state = 'done';
    if (c.acting) { S.prevDv = 0; S.prevDx = 0; }   // 过后恢复原车速和位置
    if (disp.cue === c && disp.mode === 'glyph') disp = { mode: null, cue: null, until: 0 };
    const rel0 = (f, t) => (f && c.tArrive != null ? (t - c.tArrive).toFixed(2) : '');
    const byEye = useEye(c), lookedHead = c.looked, relEye = rel0(c.lookedEye, c.tLookEye);
    if (byEye) { c.looked = c.lookedEye; c.tLook = c.tLookEye; }   // 「是否看向」按这次用的判定方式；两种结果都另外记一列
    const rel = rel0(c.looked, c.tLook);
    LOG.cues.push([c.id, c.type, c.segment, c.side, c.hint, +c.looked, rel, c.anticipated, c.faded, c.driverState, c.onPhone,
      Math.round(c.sEff), c.action, S.cond, c.check, c.hazardOverlap, c.tArrive != null ? c.tArrive.toFixed(2) : '',
      byEye ? 'eye' : 'head', +lookedHead, +c.lookedEye, relEye, c.winN ? (c.eyeN / c.winN).toFixed(2) : '', c.minAng < 999 ? c.minAng.toFixed(1) : ''].join(','));
    logEvent('cue_pass', c.id, c.type, +c.looked, `seg=${c.segment};side=${c.side}`);
    if (current === c) current = null;
  }

  function step(dt) {
    if (disp.mode === 'check' && S.simT >= disp.until) disp = { mode: null, cue: null, until: 0 };
    while (idx < cues.length && cues[idx].state === 'gone') idx++;
    for (let i = idx; i < cues.length; i++) {
      const c = cues[i], dist = c.sEff - S.s, ratio = RATIO[c.type] ?? 1;
      if (dist > C.spawnAheadM) break;
      if (c.state === 'wait' && dist < 0) { c.state = 'gone'; continue; }   // 从中途开始（录像模式）时，已经过去的线索直接跳过
      if (!c.obj && c.state !== 'gone') { c.obj = builders[c.type](c); world.add(c.obj); }
      if (c.obj) {
        c.obj.position.z = -dist * ratio;
        if (c.obj.position.z > 45) { world.remove(c.obj); c.obj = null; c.state = c.state === 'done' ? 'gone' : c.state; if (c.state === 'gone') continue; }
      }
      if (c.state === 'gone' || c.state === 'done') continue;
      const tta = dist / Math.max(S.egoSpeed, 2);
      if (c.state === 'wait' && tta <= C.windowBeforeSec) {
        c.state = 'open'; current = c;
        if (S.egoSpeed < S.egoTarget - 0.5 || S.egoTarget < CRUISE - 0.01 || Math.abs(S.egoXBase) > 0.05) c.hazardOverlap = 1;   // 车还在从危险事件中恢复车速或回到原车道
        logEvent('cue_window', c.id, c.type, c.side, `seg=${c.segment};s=${Math.round(c.sEff)};action=${c.action}`);
      }
      if (c.state !== 'open') continue;
      c.tta = tta;
      if (activeHazard()) c.hazardOverlap = 1;   // 时间窗内出现「请接管」事件：分析时剔除
      // 「看向」：头部朝向在方位 ±tolDeg 内连续 dwellSec
      c.dwell = inSector(c) ? c.dwell + dt : 0;
      if (!c.looked && c.dwell >= C.dwellSec) { c.looked = true; c.tLook = S.simT - c.dwell; logEvent('cue_look', c.id, c.type, tta.toFixed(2), `src=head;yaw=${head.yaw.toFixed(1)}`); }
      // 眼动判定：视线落在线索参考点附近连续 eye.dwellSec（只在眼动数据有效时计）
      c.winN++; const ra = refAngle(c); c.refYaw = ra.yaw; c.refPitch = ra.pitch;
      if (eye.valid) {
        c.eyeN++; if (ra.ang < c.minAng) c.minAng = ra.ang;
        const ecc = Math.hypot(ra.yaw, ra.pitch);                       // 线索偏离正前方多少度
        c.dwellEye = ecc >= E.minEccDeg && ra.ang <= Math.min(E.tolDeg, ecc / 2) ? c.dwellEye + dt : 0;
        if (!c.lookedEye && c.dwellEye >= E.dwellSec) { c.lookedEye = true; c.tLookEye = S.simT - c.dwellEye; logEvent('cue_look', c.id, c.type, tta.toFixed(2), `src=eye;ang=${ra.ang.toFixed(1)}`); }
      } else c.dwellEye = 0;
      // 提示时刻（预防动作前 hintLeadSec 秒）：记下此刻的状态；只有 C 的第二段才显示
      if (!c.hintChecked && tta <= C.actionLeadSec + C.hintLeadSec) {
        c.hintChecked = true; c.anticipated = +(useEye(c) ? c.lookedEye : c.looked); c.driverState = dms.state; c.onPhone = +(aoiOf(gaze.yaw, gaze.pitch) === 'phone');
        let shown = 'none';
        if ((S.cond === 'C' || S.cond === 'B') && S.segment === 2 && c.segment === 2 && CONFIG.confidence >= 0.8 && !c.hazardOverlap) {
          if (faded.has(c.type)) { c.faded = 1; shown = 'faded'; }                 // 这一类已经学会，不再提示
          else if (c.anticipated) {                                                // 人先看到了：不显示图形，只给对勾
            c.check = 1; shown = 'check'; disp = { mode: 'check', cue: c, until: S.simT + C.checkSec };
            streak[c.type] = (streak[c.type] || 0) + 1;
            if (streak[c.type] >= C.fadeAfter) { faded.add(c.type); logEvent('cue_faded', c.id, c.type, streak[c.type], ''); }
          } else { c.hint = 1; shown = 'glyph'; disp = { mode: 'glyph', cue: c, until: 0 }; streak[c.type] = 0; }
        }
        logEvent('cue_hint', c.id, c.type, shown, `anticipated=${c.anticipated};state=${c.driverState};phone=${c.onPhone};seg=${c.segment}`);
      }
      // 预防动作：三个方案都执行，与被试是否看向无关
      if (!c.acting && tta <= C.actionLeadSec) {
        c.acting = true;
        if (c.action === 'slow') S.prevDv = C.slowKmh / 3.6; else S.prevDx = (c.action === 'left' ? -1 : 1) * C.lateralM;
        logEvent('cue_action', c.id, c.type, c.action, `tta=${tta.toFixed(2)};looked=${+c.looked}`);
      }
      if (c.tArrive == null && dist <= 0) { c.tArrive = S.simT; logEvent('cue_arrive', c.id, c.type, c.side, ''); }
      if (dist <= -PASS_M) finish(c);
    }
  }

  return {
    step, cues, warn,
    now: () => (current ? { id: current.id, display: disp.mode || '', open: true, tta: current.tta ?? C.windowBeforeSec, side: current.side, segment: current.segment, type: current.type, refYaw: current.refYaw, refPitch: current.refPitch } : { id: '', display: disp.mode || '' }),
    display: () => ({ mode: disp.mode, key: syncBadges() }),
    drawOnHud, drawOnCenter, faded, streak,
  };
}
