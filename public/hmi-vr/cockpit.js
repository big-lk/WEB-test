// 车内：完整的座舱（仪表台、中控台、四个座位、四扇车门、A/B/C 柱、车顶、后窗、后备箱盖、引擎盖、后视镜）。
// 只负责“看起来像一辆完整的车”；仪表屏、中控屏、HUD、手机、方向盘灯带这些会变化的部件仍在 main.js 里。
// 车辆坐标：驾驶员眼点在 (0, EYE, 0)，车头朝 -z，左舵；车身中心线在 x = CAR_CX。

export function buildCockpit({ THREE, cockpit, mat, box, CAR_CX, EYE }) {
  const CX = CAR_CX, XL = -0.56, XR = 1.30;                 // 左右车门内板的位置
  // 车内照不到太阳，所以内饰材质带一点自发光，免得整个车厢黑成一片
  const im = (c, k = 0.45) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: k });
  const M = {
    dash: im(0x2b2f34), dashTop: im(0x3a3f45), trim: im(0x4a4f56), dark: im(0x1b1d20, 0.3), carpet: im(0x24262a, 0.3),
    seat: im(0x8a8378), seatDark: im(0x6a645b), liner: im(0x9c9fa1, 0.45), pillar: im(0x62676c, 0.4), chrome: im(0xb4bac0),
    paint: mat(0x8a96a3), paintDark: mat(0x6f7a86), glass: new THREE.MeshBasicMaterial({ color: 0x7890a2, toneMapped: false }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xd9d2bf, toneMapped: false }), jeans: im(0x3a4a68),
  };
  const add = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); cockpit.add(m); return m; };
  const cyl = (r, h, m, seg = 12) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
  const bar = (a, b, r, m) => {                               // 两点之间的一根杆
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), p = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.25, va.distanceTo(vb), 8), m);
    p.position.copy(va).add(vb).multiplyScalar(0.5); p.lookAt(vb); p.rotateX(Math.PI / 2); cockpit.add(p); return p;
  };

  // —— 地板与前围 ——
  add(box(1.86, 0.05, 4.3, M.carpet), CX, 0.16, 0.25);
  add(box(1.80, 0.62, 0.10, M.dark), CX, 0.48, -1.20);

  // —— 仪表台 ——
  add(box(1.80, 0.28, 0.52, M.dash), CX, 0.83, -0.90);                          // 主体
  add(box(1.80, 0.03, 0.54, M.dashTop), CX, 0.97, -0.90, -0.02);                // 台面
  add(box(1.80, 0.26, 0.20, M.dash), CX, 0.58, -0.73);                          // 下护板
  for (const x of [-0.40, 0.30, 0.98, 1.20]) {                                  // 出风口
    add(box(0.16, 0.07, 0.02, M.dark), x, 0.90, -0.635);
    for (let k = -1; k <= 1; k++) add(box(0.15, 0.006, 0.025, M.trim), x, 0.90 + k * 0.02, -0.633);
  }
  add(box(0.27, 0.014, 0.05, M.dark), 0, 0.957, -0.618);                        // 仪表屏上方的遮光檐
  add(box(0.52, 0.17, 0.015, M.dashTop), 0.98, 0.72, -0.628);                   // 手套箱
  add(box(0.10, 0.02, 0.02, M.chrome), 0.98, 0.79, -0.622);
  add(box(0.36, 0.26, 0.06, M.dashTop), 0.53, 0.70, -0.63);                     // 中控面板（屏幕下方）
  for (const x of [0.43, 0.53, 0.63]) add(cyl(0.022, 0.03, M.chrome), x, 0.68, -0.575, Math.PI / 2);
  add(box(0.30, 0.03, 0.012, M.dark), 0.53, 0.76, -0.578);

  // —— 中控台、扶手、挡把、杯架 ——
  add(box(0.24, 0.30, 1.30, M.dash), CX, 0.49, 0.02);
  add(box(0.22, 0.02, 1.28, M.dashTop), CX, 0.65, 0.02);
  add(box(0.21, 0.07, 0.44, M.seatDark), CX, 0.70, 0.34);                       // 扶手
  add(cyl(0.022, 0.09, M.chrome), CX, 0.70, -0.28); add(new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 8), M.dark), CX, 0.76, -0.28);
  for (const x of [CX - 0.055, CX + 0.055]) add(cyl(0.038, 0.012, M.dark, 16), x, 0.662, -0.06);

  // —— 座椅 ——
  const seat = (x, withLegs) => {
    add(box(0.50, 0.14, 0.52, M.seat), x, 0.40, 0.10);                          // 坐垫
    for (const s of [-1, 1]) add(box(0.06, 0.18, 0.50, M.seatDark), x + s * 0.25, 0.43, 0.10);
    add(box(0.48, 0.66, 0.12, M.seat), x, 0.80, 0.40, 0.18);                    // 靠背
    for (const s of [-1, 1]) add(box(0.06, 0.60, 0.14, M.seatDark), x + s * 0.24, 0.80, 0.39, 0.18);
    add(box(0.26, 0.20, 0.10, M.seatDark), x, 1.22, 0.48, 0.1);                 // 头枕
    for (const s of [-1, 1]) add(cyl(0.008, 0.12, M.chrome, 6), x + s * 0.07, 1.10, 0.47);
    if (withLegs) for (const s of [-1, 1]) {                                    // 驾驶者的腿（低头时能看到自己坐在车里）
      add(box(0.15, 0.13, 0.46, M.jeans), x + s * 0.11, 0.53, -0.12, 0.06);
      add(box(0.13, 0.36, 0.13, M.jeans), x + s * 0.11, 0.37, -0.42, -0.35);
    }
  };
  seat(0, true); seat(0.74, false);
  // 后排
  add(box(1.50, 0.16, 0.50, M.seat), CX, 0.42, 1.14);
  add(box(1.50, 0.62, 0.14, M.seat), CX, 0.80, 1.44, 0.2);
  for (const x of [-0.05, 0.79]) add(box(0.26, 0.18, 0.10, M.seatDark), x, 1.18, 1.52, 0.1);
  add(box(1.66, 0.04, 0.40, M.trim), CX, 1.02, 1.72);                           // 后窗台
  add(box(1.70, 0.86, 0.06, M.dark), CX, 0.60, 1.90);

  // —— 车门（前后各两扇）、窗台、扶手、拉手 ——
  for (const [X, s] of [[XL, 1], [XR, -1]]) {
    add(box(0.07, 0.76, 2.50, M.trim), X, 0.58, 0.16);                          // 门板
    add(box(0.11, 0.04, 2.50, M.dark), X, 0.965, 0.16);                         // 窗台
    add(box(0.03, 0.30, 2.30, M.dashTop), X + s * 0.045, 0.62, 0.16);           // 门板上的装饰面
    for (const z of [-0.20, 0.95]) {                                            // 扶手、拉手、扬声器
      add(box(0.12, 0.06, 0.62, M.seatDark), X + s * 0.07, 0.72, z);
      add(box(0.02, 0.03, 0.14, M.chrome), X + s * 0.05, 0.86, z - 0.28);
      add(cyl(0.085, 0.012, M.dark, 16), X + s * 0.042, 0.42, z - 0.25, 0, 0, Math.PI / 2);
    }
    add(box(0.035, 0.76, 0.02, M.dark), X + s * 0.02, 0.58, 0.39);              // 前后门之间的缝
    // B 柱、C 柱、车顶边梁
    add(box(0.09, 0.60, 0.15, M.pillar), X, 1.27, 0.40);
    add(box(0.09, 0.62, 0.34, M.pillar), X, 1.27, 1.52, -0.25);
    add(box(0.09, 0.07, 2.36, M.pillar), X, 1.545, 0.56);
    add(box(0.02, 0.03, 0.16, M.chrome), X + s * 0.05, 1.50, 0.05);             // 车顶拉手
    // A 柱（比原来粗，下端加三角窗的饰板）
    bar([X + s * 0.05, 0.98, -1.10], [X + s * 0.14, 1.53, -0.50], 0.045, M.pillar);
    add(box(0.07, 0.10, 0.22, M.dark), X + s * 0.01, 1.02, -0.98);
    // 外后视镜：镜壳 + 朝向驾驶员的镜面
    const mx = X - s * 0.17;
    add(box(0.18, 0.11, 0.07, M.paintDark), mx, 1.03, -0.80);
    add(box(0.10, 0.04, 0.06, M.dark), X - s * 0.06, 0.99, -0.80);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.085), M.glass); face.position.set(mx, 1.03, -0.762); face.lookAt(0, EYE, 0); cockpit.add(face);
  }

  // —— 车顶、遮阳板、顶灯、内后视镜 ——
  add(box(1.80, 0.05, 2.42, M.liner), CX, 1.585, 0.56);
  add(box(1.80, 0.09, 0.14, M.pillar), CX, 1.535, -0.53);                       // 前风挡上横梁
  add(box(1.80, 0.09, 0.12, M.pillar), CX, 1.535, 1.74);                        // 后窗上横梁
  for (const x of [0, 0.74]) add(box(0.38, 0.015, 0.15, M.liner), x, 1.515, -0.40, 0.25);
  add(box(0.12, 0.012, 0.07, M.lamp), CX, 1.556, 0.02);
  add(box(0.27, 0.075, 0.035, M.dark), CX, 1.42, -0.62);
  const rv = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.055), M.glass); rv.position.set(CX, 1.42, -0.60); rv.lookAt(0, EYE, 0); cockpit.add(rv);
  bar([CX, 1.46, -0.62], [CX, 1.52, -0.56], 0.012, M.dark);

  // —— 车外能看到的部分：引擎盖、翼子板棱线、雨刮、后备箱盖 ——
  add(box(1.74, 0.09, 1.80, M.paint), CX, 0.80, -2.06, 0.035);
  for (const s of [-1, 1]) add(box(0.10, 0.05, 1.78, M.paintDark), CX + s * 0.80, 0.845, -2.06, 0.035);
  add(box(1.74, 0.20, 0.10, M.paintDark), CX, 0.70, -2.96);
  add(box(1.78, 0.03, 0.10, M.dark), CX, 0.985, -1.19);                         // 风挡下沿饰板
  for (const [x, rz] of [[0.02, 0.10], [0.72, 0.10]]) add(box(0.50, 0.012, 0.02, M.dark), x, 1.0, -1.16, 0, 0, rz);
  add(box(1.70, 0.10, 0.62, M.paint), CX, 0.99, 2.24);

  // —— 方向盘的幅条、管柱、拨杆（盘圈和灯带在 main.js）——
  return {
    dressWheel(wheel) {
      for (const rz of [0, Math.PI * 0.62, -Math.PI * 0.62]) { const sp = box(0.03, 0.17, 0.016, M.dark); sp.position.set(Math.sin(-rz) * 0.09, -Math.cos(rz) * 0.09, 0); sp.rotation.z = rz; wheel.add(sp); }
      const hubCap = cyl(0.055, 0.03, M.dashTop, 20); hubCap.rotation.x = Math.PI / 2; hubCap.position.z = 0.012; wheel.add(hubCap);
      const col = cyl(0.035, 0.34, M.dark, 10); col.rotation.x = Math.PI / 2; col.position.z = -0.17; wheel.add(col);
      for (const s of [-1, 1]) { const st = box(0.16, 0.014, 0.014, M.dark); st.position.set(s * 0.13, 0.01, -0.07); st.rotation.z = s * 0.2; wheel.add(st); }
    },
  };
}
