// 检查录像模式：record=1 自动开始、界面隐藏、视角固定、跑第二段前 5 分钟后结束。先启动 server.py。
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PORT = process.env.PORT || 8000, out = process.argv[2];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const cond of ['C', 'A']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(`http://localhost:${PORT}/index.html?record=1&cond=${cond}&pid=REC${cond}&speed=${process.env.SPEED || 20}`);
  await page.waitForFunction(() => window.HMI && HMI.S.phase === 'drive', null, { timeout: 20000 });
  const start = await page.evaluate(() => ({ s: Math.round(HMI.S.s), seg: HMI.S.segment, ui: getComputedStyle(document.getElementById('ui')).display, hazards: HMI.LOG.events.filter(e => e.includes('schedule')).length }));
  // 等第一个图形提示（或 A 的同一时刻）出现时截图
  await page.waitForFunction(() => { const c = HMI.cues.cues.find(c => c.id === 'C14'); if (c && c.state === 'open' && c.tta < 3.3) { HMI.S.timeScale = 0; return true; } return false; }, null, { timeout: 120000, polling: 'raf' });
  await page.waitForTimeout(300); await page.screenshot({ path: `${out}/record_${cond}.png` });
  await page.evaluate(() => { HMI.S.timeScale = +(new URLSearchParams(location.search).get('speed') || 1); });
  await page.waitForFunction(() => HMI.S.phase === 'end' && HMI.LOG.ok !== null, null, { timeout: 300000, polling: 500 });
  await page.waitForTimeout(1500);
  const end = await page.evaluate(() => ({ title: document.title, simT: Math.round(HMI.S.simT), s: Math.round(HMI.S.s), panel: HMI.S.phase, speed: Math.round(HMI.S.egoSpeed * 3.6) }));
  console.log(cond, JSON.stringify({ start, end, errs }));
  await page.close();
}
await browser.close();
