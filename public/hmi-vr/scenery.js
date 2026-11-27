// 街景与会分散注意力的东西：
//   背景（一直都有）：带窗户的楼面、店招、人行道上的行人、对向的公交和货车、路牌、彩旗、云
//   醒目物（按里程安排，三个方案和所有被试都相同）：广告牌、大屏、热气球、飞艇、摩天轮、吊车、喷泉、风筝、雕塑
//   车内通知（按里程安排）：手机或中控屏弹出一条消息
// 醒目物和通知都安排在两个线索之间、线索的时间窗之外，避免把「被别的东西吸引」误算成「看向线索」。
// 每一次出现都写进 events.csv（distractor / distractor_pass / notice），可以用来分析被试看了没有。

const SHOPS = ['咖啡', '便利店', '药房', '书店', '面包房', '花店', '理发', '水果', '眼镜', '茶饮', '面馆', '文具'];
const ADS = ['冬日灯光节', '新品上市', '温泉一日游', '雪祭倒计时', '周末市集', '滑雪季开幕', '城市马拉松', '夜间动物园'];
const NOTES = ['妈妈：晚上回来吃饭吗？', '小林：到了说一声', '快递：包裹已放驿站', '日程：15:00 组会', '天气：傍晚有雪', '小周发来一张照片', '群聊：谁带了充电器？', '银行：本月账单已出'];
const SONGS = [['轻音乐电台', '午后'], ['城市夜行', 'Lo-fi 精选'], ['晨间新闻', '交通广播'], ['雨天歌单', '民谣'], ['播客', '设计漫谈']];

export function makeFacade(THREE) {      // 带窗户的楼面：几种共用的窗格贴图，按楼的大小平铺
  const texs = [0, 1, 2].map(k => {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const c = cv.getContext('2d');
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, 128, 128);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) {
      const lit = (r * 7 + q * 3 + k * 5) % 6 === 0;
      c.fillStyle = lit ? '#f3e2a8' : ['#5d6f80', '#6d7f8f', '#55667a'][(r + q + k) % 3];
      if (k === 2) c.fillRect(q * 32 + 3, r * 32 + 6, 26, 20); else c.fillRect(q * 32 + 6, r * 32 + 5, 20, 22 - k * 6);
    }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  });
  return (color, w, h, i) => {
    const t = texs[i % texs.length].clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 5.5)));
    return new THREE.MeshLambertMaterial({ color, map: t });
  };
}

export function initScenery(ctx) {
  const { THREE, CONFIG, S, world, cockpitRoot, roadside, oncoming, SPAN, CRUISE, logEvent, mat, box, canvasPanel, makeCar, mulberry32, FONT } = ctx;
  const D = CONFIG.distract, rnd = mulberry32(D.seed), U = (a, b) => a + rnd() * (b - a), pick = a => a[Math.floor(rnd() * a.length)];
  const basic = c => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  const textPanel = (w, h, text, bg, fg = '#fff', px = 256) => {
    const p = canvasPanel(w, h, px, Math.round(px * h / w)), c = p.ctx, H = Math.round(px * h / w);
    c.fillStyle = bg; c.fillRect(0, 0, px, H); c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `bold ${Math.round(Math.min(H * 0.6, px / (text.length + 1) * 1.5))}px ${FONT}`; c.fillText(text, px / 2, H / 2 + 2); p.tex.needsUpdate = true;
    p.mesh.material.side = THREE.DoubleSide; p.mesh.material.fog = true; return p.mesh;
  };

  // ── 背景 1：给已有的楼加店招 ──
  let nShop = 0;
  for (const o of roadside) {
    if (!o.userData.building) continue;
    const { w, h, side } = o.userData; if (h < 7 || (nShop++ % 3 === 2)) continue;
    const sw = Math.min(w - 1, 7), sign = textPanel(sw, 1.3, pick(SHOPS), `hsl(${Math.floor(U(0, 360))},50%,38%)`);
    sign.position.set(-side * (w / 2 + 0.06), -h / 2 + 3.4, U(-1.5, 1.5)); sign.rotation.y = -side * Math.PI / 2; o.add(sign);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(sw, 2.4), basic(0x2c3a45)); win.position.set(-side * (w / 2 + 0.05), -h / 2 + 1.4, sign.position.z); win.rotation.y = -side * Math.PI / 2; o.add(win);
  }

  // ── 背景 2：人行道上的行人（循环复用）──
  const peds = [];
  const makePed = () => {
    const g = new THREE.Group(), col = [0x3d6fb0, 0xb0503d, 0x4f8a5b, 0x7a5aa6, 0x333a44, 0xc9a23a, 0x8a8f96][Math.floor(rnd() * 7)], tall = U(0.9, 1.08);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.62, 8), mat(col)); body.position.y = 1.08; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat(0xe2bd9c)); head.position.y = 1.55; g.add(head);
    const legs = [-1, 1].map(s => { const l = new THREE.Group(), m = box(0.11, 0.78, 0.12, mat(0x2a2f38)); m.position.y = -0.39; l.add(m); l.position.set(s * 0.085, 0.78, 0); g.add(l); return l; });
    if (rnd() < 0.3) { const bag = box(0.2, 0.26, 0.1, mat(0x8b5a2b)); bag.position.set(0.22, 0.9, 0); g.add(bag); }
    if (rnd() < 0.15) { const dog = box(0.16, 0.2, 0.42, mat(0xd8c9a8)); dog.position.set(0.5, 0.22, 0.2); g.add(dog); }
    g.scale.setScalar(tall); return { g, legs };
  };
  for (let i = 0; i < D.pedestrians; i++) {
    const p = makePed(), right = i % 2 === 0, dir = rnd() < 0.5 ? 1 : -1;
    p.v = dir * U(1.0, 1.6); p.phase = U(0, 6.28);
    p.g.position.set(right ? U(4.0, 5.2) : U(-15.2, -13.2), 0.12, -U(0, 300) + 30); p.g.rotation.y = dir > 0 ? Math.PI : 0;
    world.add(p.g); peds.push(p);
  }

  // ── 背景 3：对向的公交、货车、出租车 ──
  const big = (w, h, d, col, winCol) => { const g = new THREE.Group(), b = box(w, h, d, mat(col)); b.position.y = h / 2 + 0.35; g.add(b); const wn = box(w + 0.02, h * 0.32, d * 0.9, mat(winCol)); wn.position.y = h * 0.72 + 0.35; g.add(wn); return g; };
  const extra = [big(2.5, 2.9, 10.5, 0xc0392b, 0x22303a), big(2.3, 2.6, 6.5, 0xe8e2d0, 0x30363c), makeCar(0xf2c230), makeCar(0x3f7f5f)];
  extra.forEach((c, i) => { c.rotation.y = Math.PI; c.position.set(i % 2 ? -10.5 : -7, 0, -130 - i * 110); world.add(c); oncoming.push(c); });

  // ── 背景 4：路牌、彩旗（随道路滚动）、云（不动）──
  const gantry = new THREE.Group();
  for (const x of [-13.4, 3.0]) { const p = box(0.25, 7, 0.25, mat(0x7d8286)); p.position.set(x, 3.5, 0); gantry.add(p); }
  const beam = box(16.6, 0.3, 0.3, mat(0x7d8286)); beam.position.set(-5.2, 6.9, 0); gantry.add(beam);
  [['滨江路  ↑', -1.6], ['中央车站  ←', -6.8]].forEach(([t, x]) => { const s = textPanel(4.2, 1.5, t, '#1f5fae', '#fff', 512); s.position.set(x, 6.0, 0.2); gantry.add(s); });
  gantry.position.z = -SPAN * 0.55; world.add(gantry); roadside.push(gantry);
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Group(), p = box(0.08, 5, 0.08, mat(0x8a8d90)); p.position.y = 2.5; g.add(p);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.8), new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(i / 8, 0.6, 0.5), side: THREE.DoubleSide })); f.position.set(0.42, 3.9, 0); g.add(f);
    g.position.set(-12.7, 0.12, -i * (SPAN / 8) - 20); world.add(g); roadside.push(g);
  }
  for (let i = 0; i < 7; i++) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: 0.85 }));
    c.scale.set(U(30, 60), U(5, 9), U(14, 26)); c.position.set(U(-260, 260), U(70, 120), -U(200, 380)); cockpitRoot.add(c);
  }

  // ── 醒目物 ──
  const KINDS = {
    billboard(side) { const g = new THREE.Group(), p = textPanel(9, 4.5, pick(ADS), `hsl(${Math.floor(U(0, 360))},55%,45%)`, '#fff', 512); p.position.y = 7; p.rotation.y = -side * 0.5; g.add(p); const leg = box(0.3, 5, 0.3, mat(0x666666)); leg.position.y = 2.5; g.add(leg); return g; },
    led_screen(side) { const g = new THREE.Group(), m = basic(0xff4466), s = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.5), m); s.material.side = THREE.DoubleSide; s.position.y = 8; s.rotation.y = -side * 0.6; g.add(s); const fr = box(0.4, 6, 0.4, mat(0x333333)); fr.position.y = 3; g.add(fr); g.userData.tick = t => m.color.setHSL((t * 0.35) % 1, 0.8, 0.55); return g; },
    balloon() { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12), mat(0xe2574c)); b.position.y = 54; g.add(b); const st = new THREE.Mesh(new THREE.SphereGeometry(6.05, 16, 6, 0, 6.3, 1.2, 0.5), mat(0xf7e06a)); st.position.y = 54; g.add(st); const k = box(2, 1.6, 2, mat(0x7a5a3a)); k.position.y = 46; g.add(k); g.userData.tick = t => { g.position.y = Math.sin(t * 0.5) * 2; }; g.userData.far = 1; return g; },
    airship(side) { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), mat(0xf4f4f0)); b.scale.set(6, 6, 22); b.position.y = 48; g.add(b); const f = box(0.4, 8, 5, mat(0x2a6fd6)); f.position.set(0, 48, 19); g.add(f); const band = box(12.2, 1.6, 12, mat(0xe5383b)); band.position.y = 48; g.add(band); g.userData.tick = (t, dt) => { g.position.x -= side * 3 * dt; }; g.userData.far = 1; return g; },
    ferris(side) { const g = new THREE.Group(), w = new THREE.Group(); w.add(new THREE.Mesh(new THREE.TorusGeometry(18, 0.4, 6, 40), mat(0xd9dde0))); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, c = box(2.4, 2.4, 2.4, mat([0xe74c3c, 0xf2c230, 0x3aa0c8, 0x58b368][i % 4])); c.position.set(Math.cos(a) * 18, Math.sin(a) * 18, 0); w.add(c); const sp = box(0.2, 18, 0.2, mat(0xd9dde0)); sp.position.set(Math.cos(a) * 9, Math.sin(a) * 9, 0); sp.rotation.z = a - Math.PI / 2; w.add(sp); } w.position.y = 44; w.rotation.y = side * 0.9; g.add(w); const leg = box(1, 44, 1, mat(0x9aa0a6)); leg.position.y = 22; g.add(leg); g.userData.tick = (t, dt) => { w.rotation.z += 0.25 * dt; }; g.userData.far = 1; return g; },
    crane(side) { const g = new THREE.Group(), tw = box(1.8, 64, 1.8, mat(0xf2a01d)); tw.position.y = 32; g.add(tw); const arm = new THREE.Group(), j = box(40, 1.2, 1.2, mat(0xf2a01d)); j.position.x = 13; arm.add(j); const hook = box(0.7, 14, 0.7, mat(0x444444)); hook.position.set(29, -7, 0); arm.add(hook); arm.position.y = 64; g.add(arm); g.userData.tick = (t, dt) => { arm.rotation.y += 0.22 * dt; }; g.userData.far = 1; return g; },
    fountain() { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.2, 0.6, 20), mat(0xb8bcc0)); b.position.y = 0.4; g.add(b); const jets = [0, 1, 2, 3, 4].map(i => { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1, 6), basic(0xbfe6ff)); j.position.set(Math.cos(i * 1.256) * 1.4, 1, Math.sin(i * 1.256) * 1.4); g.add(j); return j; }); g.userData.tick = t => jets.forEach((j, i) => { const h = 2.2 + 1.6 * Math.sin(t * 2.2 + i); j.scale.y = h; j.position.y = 0.7 + h / 2; }); return g; },
    kite() { const g = new THREE.Group(), k = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ color: 0xff7a1a, side: THREE.DoubleSide, toneMapped: false })); k.rotation.z = Math.PI / 4; k.position.y = 11; g.add(k); const tail = box(0.12, 4, 0.12, basic(0xffe14d)); tail.position.y = 8; g.add(tail); const kid = box(0.4, 1.3, 0.3, mat(0x3d6fb0)); kid.position.y = 0.75; g.add(kid); g.userData.tick = t => { k.position.x = tail.position.x = Math.sin(t * 0.9) * 2; k.position.y = 11 + Math.sin(t * 1.4) * 1.2; tail.position.y = k.position.y - 3; }; return g; },
    sculpture() { const g = new THREE.Group(), s = new THREE.Mesh(new THREE.TorusKnotGeometry(2.2, 0.6, 64, 8), mat(0x3aa0c8)); s.position.y = 4.5; g.add(s); g.userData.tick = (t, dt) => { s.rotation.y += 0.5 * dt; }; return g; },
  };
  // 安排：每两个线索之间（间隔够大时）按概率放一个醒目物，再按概率在刚过线索后放一条车内通知
  const cueS = CONFIG.cues.map(c => c.s * S.lenScale).sort((a, b) => a - b), plan = [], notes = [];
  const kinds = Object.keys(KINDS), W = CONFIG.cue.windowBeforeSec * CRUISE;
  const pts = [0, ...cueS, S.totalLen];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], gap = b - a;
    const mid = (a + b) / 2 - W / 2 + U(-15, 15), nearSeg = S.segBounds.some(x => Math.abs(x - mid) < 80);   // 段与段交界处不放，免得像是在提示切换
    if (gap > 2 * W + 60 && rnd() < D.eyeCatcherProb && !nearSeg) plan.push({ s: mid, kind: pick(kinds), side: rnd() < 0.5 ? -1 : 1, obj: null, state: 0 });
    if (i > 0 && gap > 2 * W + 60 && rnd() < D.noticeProb) notes.push({ s: a + U(35, 60), target: rnd() < 0.6 ? 'phone' : 'center', text: pick(NOTES), done: false });
  }
  let pi = 0, ni = 0, notice = null, t = 0;

  function step(dt, adv) {
    t += dt;
    for (const p of peds) {
      p.g.position.z += adv - p.v * dt; if (p.g.position.z > 30) p.g.position.z -= 330; if (p.g.position.z < -300) p.g.position.z += 330;
      const sw = Math.sin(t * 5 * Math.abs(p.v) + p.phase) * 0.5; p.legs[0].rotation.x = sw; p.legs[1].rotation.x = -sw;
    }
    if (S.phase !== 'drive') return;
    while (pi < plan.length && plan[pi].state === 2) pi++;
    for (let i = pi; i < plan.length; i++) {
      const e = plan[i], dist = e.s - S.s; if (dist > D.spawnAheadM) break;
      if (e.state === 2) continue;
      if (!e.obj) { if (dist < -20) { e.state = 2; continue; } e.obj = KINDS[e.kind](e.side); e.obj.position.x = e.obj.userData.far ? (e.side > 0 ? U(30, 38) : -U(40, 48)) : (e.side > 0 ? U(7.4, 9.4) : -U(17.4, 19.4)); world.add(e.obj); logEvent('distractor', `D${i + 1}`, e.kind, e.side > 0 ? 'right' : 'left', `s=${Math.round(e.s)}`); }
      e.obj.position.z = -dist; if (e.obj.userData.tick) e.obj.userData.tick(t, dt);
      if (e.state === 0 && dist <= 0) { e.state = 1; logEvent('distractor_pass', `D${i + 1}`, e.kind, e.side > 0 ? 'right' : 'left', ''); }
      if (dist < -60) { world.remove(e.obj); e.obj = null; e.state = 2; }
    }
    if (notice && S.simT >= notice.until) notice = null;
    while (ni < notes.length && notes[ni].s < S.s - 30) ni++;      // 从中途开始（录像模式）时跳过已经过去的
    if (ni < notes.length && S.s >= notes[ni].s) { const n = notes[ni++]; notice = { target: n.target, text: n.text, until: S.simT + D.noticeSec, id: `N${ni}` }; logEvent('notice', notice.id, n.target, n.text, `s=${Math.round(n.s)}`); }
  }

  return {
    step, plan, notes,
    notice: () => notice,
    song: () => SONGS[Math.floor(S.simT / 45) % SONGS.length],
  };
}
