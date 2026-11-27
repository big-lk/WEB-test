// 模拟被试（URL 参数 sim=1）：用程序转动“头部”和按键，只用于检查流程、数据记录和分析脚本。
// 行为：平时在看路和看手机之间切换，偶尔看路边；被驾驶员监测提醒后看回道路；出现「请接管」后看向危险并按键；
// 按给定概率主动看向线索方位（三段各一个概率，URL 参数 simLook=第一段,第二段,第三段），看到方案 C 的提示后大概率转头。
// simEye=1：同时模拟眼动套件——头只转一小部分，其余靠眼睛；原始数据故意带比例和偏移，用来检查校准。

export function initBot(ctx) {
  const { CONFIG, S, DEG, camera, dms, activeHazard, cockpitPos, bearingDeg, onPress, hashStr, mulberry32, cueNow } = ctx;
  const P = CONFIG.sim;
  const rnd = mulberry32(hashStr(S.pid + '#sim'));
  const U = (a, b) => a + rnd() * (b - a);
  const lookP = (ctx.simLook ? ctx.simLook.split(',').map(Number) : P.look).concat([0, 0, 0]).slice(0, 3);
  const cur = { yaw: 0, pitch: -2 }, tgt = { yaw: 0, pitch: -2 };
  let mode = 'road', until = U(4, 9), jitterT = 0;
  let dmsReactAt = null, pressAt = null, pressedFor = null, seenNote = '';
  // 模拟眼动
  const eyeMode = !!ctx.simEye, g = { yaw: 0, pitch: -2 };          // g：视线（头 + 眼）
  let track = false, blinkAt = U(2, 6), blinkEnd = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const feed = (ey, ep, open = 1) => ctx.pushEye({ x: ey / 28 + 0.04, y: ep / 22 - 0.03, open });   // 套件的“原始值”：非度数、带偏移
  const plans = new Map();                       // 线索 id → 这次打不打算看、什么时候看

  function setTarget(yaw, pitch) { tgt.yaw = yaw; tgt.pitch = pitch; }
  function baseBehaviour(t) {
    if (t < until) return;
    const r = rnd();
    if (mode !== 'road') { mode = 'road'; until = t + U(6, 14); setTarget(U(-3, 3), U(-4, 0)); return; }
    const phoneLen = rnd() < 0.12 ? U(10, 17) : U(3, 14 * P.phoneShare + 3);   // 偶尔看很久，触发提醒 / 警告 / 风险减缓
    if (r < 0.78) { mode = 'phone'; until = t + phoneLen; setTarget(U(26, 34), U(-46, -40)); }
    else { mode = 'glance'; until = t + U(0.8, 2.0); const s = rnd() < 0.5 ? -1 : 1; setTarget(s * U(14, 40), U(-2, 8)); }
  }

  return {
    lookP, hasEye: eyeMode,
    calib(target) { if (eyeMode) { const k = target || { yaw: 0, pitch: 0 }; feed(k.yaw + U(-0.3, 0.3), k.pitch + U(-0.3, 0.3)); } },   // 校准时：头不动，眼睛看校准点
    step(dt) {
      const t = S.simT;
      // 1. 请接管：看向危险并按键
      const hz = activeHazard();
      const takeover = hz && hz.stage === 'takeover' && CONFIG.confidence >= 0.8;
      if (takeover) {
        if (pressedFor !== hz.id && pressAt == null) pressAt = t + U(P.takeoverRtSec[0], P.takeoverRtSec[1]);
        const b = bearingDeg(cockpitPos(hz.target()));
        setTarget(Math.max(-60, Math.min(60, b)), -3); mode = 'hazard'; until = t + 1.5;
        if (pressAt != null && t >= pressAt) { onPress('sim'); pressedFor = hz.id; pressAt = null; }
      } else {
        pressAt = null;
        // 2. 被驾驶员监测提醒：过一小会儿看回道路
        if (['remind', 'warn', 'mitigate'].includes(dms.state) && mode === 'phone') {
          if (dmsReactAt == null) dmsReactAt = t + U(0.5, dms.state === 'remind' && rnd() < 0.25 ? 10 : 1.2);  // 少数时候不理会提醒，会升级到警告、风险减缓
          if (t >= dmsReactAt) { mode = 'road'; until = t + U(5, 10); setTarget(U(-3, 3), -2); dmsReactAt = null; }
        } else if (mode !== 'phone') dmsReactAt = null;
        // 2b. 车内通知：多半会去看一眼手机或中控屏
        const nt = ctx.notice && ctx.notice();
        if (nt && nt.id !== seenNote) { seenNote = nt.id; if (rnd() < 0.6 && mode !== 'cue') { mode = 'phone'; until = t + U(2, 4.5); if (nt.target === 'phone') setTarget(U(26, 34), U(-46, -40)); else setTarget(U(36, 50), U(-30, -18)); } }
        // 3. 线索：主动看，或看到提示后看
        const c = cueNow();
        if (c.id && c.open) {
          let p = plans.get(c.id);
          if (!p) {
            const will = rnd() < lookP[c.segment - 1];
            p = { will, at: ctx.simEarly ? U(4.9, 5.8) : U(2.2, 5.7), dur: U(0.8, 1.5), done: false, hintDecided: false };   // simEarly=1：主动看都发生在提示之前
            plans.set(c.id, p);
          }
          if (!p.done && !p.hintDecided && c.display === 'glyph') {
            p.hintDecided = true;
            if (S.cond === 'B') {                    // B：提示在中控屏上——先低头读，读完才可能去看路边（概率更低、更晚）
              p.read = true; mode = 'read'; until = t + U(1.0, 1.8); setTarget(U(36, 50), U(-30, -18));
              if (!p.will && rnd() < P.hintFollowB) { p.will = true; p.at = Math.max(0.2, c.tta - U(1.3, 2.0)); }
            } else if (!p.will && rnd() < P.hintFollow) { p.will = true; p.at = Math.max(0.3, c.tta - U(0.5, 0.9)); }
          }
          if (p.will && !p.done && c.tta <= p.at && mode !== 'read') {
            p.done = true; mode = 'cue'; until = t + p.dur; track = eyeMode;
            if (!eyeMode) setTarget(CONFIG.cue.bearings[c.side] + U(-8, 8), U(-3, 6));   // 只有头部数据时：转向线索所在的方位
          }
          if (track && mode === 'cue') setTarget(c.refYaw, c.refPitch);                  // 有眼动时：盯着线索物体本身
          else track = false;
        }
        baseBehaviour(t);
      }
      // 头部转动：最快约 220°/s，加一点抖动。有眼动时头只转 30%–45%，其余由眼睛完成（眼睛约 500°/s）
      jitterT += dt;
      const maxStep = 220 * dt, hy = eyeMode ? tgt.yaw * 0.3 : tgt.yaw, hp = eyeMode ? tgt.pitch * 0.45 : tgt.pitch;
      cur.yaw += Math.max(-maxStep, Math.min(maxStep, hy - cur.yaw));
      cur.pitch += Math.max(-maxStep, Math.min(maxStep, hp - cur.pitch));
      if (eyeMode) {
        const es = 500 * dt; g.yaw += clamp(tgt.yaw - g.yaw, -es, es); g.pitch += clamp(tgt.pitch - g.pitch, -es, es);
        if (t >= blinkAt) { blinkEnd = t + 0.15; blinkAt = t + U(2, 6); }
        feed(clamp(g.yaw - cur.yaw, -35, 35) + U(-0.4, 0.4), clamp(g.pitch - cur.pitch, -30, 25) + U(-0.4, 0.4), t < blinkEnd ? 0 : 1);
      }
      const jy = Math.sin(jitterT * 1.7) * 1.2, jp = Math.sin(jitterT * 2.3) * 0.8;
      camera.rotation.set((cur.pitch + jp) * DEG, -(cur.yaw + jy) * DEG, 0, 'YXZ');
    },
  };
}
