// 用无头浏览器 + 模拟被试以加速模式跑完整个会话。先启动 server.py。
// 用法：node sim_run.mjs "pid=T01&cond=C&simLook=0.1,0.5,0.8" [更多查询串…]  （环境变量 PORT、SPEED、PAR 可改）
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PORT = process.env.PORT || 8000, SPEED = process.env.SPEED || 40, PAR = +(process.env.PAR || 3);
const jobs = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
async function run(q) {
  const page = await browser.newPage({ viewport: { width: 480, height: 300 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/status|favicon/.test(m.text())) errors.push(m.text()); });
  const t0 = Date.now();
  await page.goto(`http://localhost:${PORT}/index.html?sim=1&speed=${SPEED}&${q}`);
  await page.waitForFunction(() => window.HMI && window.HMI.S.phase === 'end' && window.HMI.LOG.ok !== null && window.HMI.LOG.sent.events >= window.HMI.LOG.events.length, null, { timeout: 600000, polling: 500 });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => ({ pid: HMI.S.pid, sid: HMI.S.sid, cond: HMI.S.cond, simT: Math.round(HMI.S.simT), s: Math.round(HMI.S.s), frames: HMI.LOG.frames.length - 1, events: HMI.LOG.events.length - 1, cues: Math.max(0, HMI.LOG.cues.length - 1), synced: HMI.LOG.ok }));
  await page.close();
  return { ...r, wallSec: Math.round((Date.now() - t0) / 1000), errors };
}
let fail = 0;
for (let i = 0; i < jobs.length; i += PAR) {
  const res = await Promise.all(jobs.slice(i, i + PAR).map(run));
  for (const r of res) { console.log(JSON.stringify(r)); if (r.errors.length || !r.synced) fail++; }
}
await browser.close();
process.exit(fail ? 1 : 0);
