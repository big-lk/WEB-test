// 自动填写 pre.html → 跳到 VR 页（模拟被试跑完）→ post.html，检查数据是否带同一个 pid 保存。先启动 server.py。
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PORT = process.env.PORT || 8000, pid = process.argv[2] || 'Q01', cond = process.argv[3] || 'C';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
page.on('pageerror', e => console.log('ERR', String(e)));
const fillAll = () => page.evaluate(() => {
  let n = 0;
  for (const q of document.querySelectorAll('.q')) {
    const rs = q.querySelectorAll('input[type=radio]'); if (rs.length) { rs[(n++ * 7) % rs.length].click(); }
    const sl = q.querySelector('input[type=range]'); if (sl) { sl.value = String(5 * ((n++ * 3) % 21)); sl.dispatchEvent(new Event('input')); }
    const num = q.querySelector('input[type=number]'); if (num && !num.closest('[hidden]')) num.value = '3';
  }
  return document.querySelectorAll('.q').length;
});
// 1. 前测：先不勾同意、漏一题，确认会被拦住
await page.goto(`http://localhost:${PORT}/pre.html?pid=${pid}&cond=${cond}`);
const nPre = await fillAll();
await page.click('#submit');
console.log('pre 题数', nPre, '| 未勾同意时：', await page.textContent('#msg'));
await page.check('#agree');
await page.evaluate(() => { document.querySelector('.q input[type=radio]:checked').checked = false; });
await page.click('#submit');
console.log('漏答时：', await page.textContent('#msg'));
await fillAll();
await page.screenshot({ path: process.env.SHOT_DIR ? `${process.env.SHOT_DIR}/pre.png` : '/dev/null', fullPage: true }).catch(() => {});
await Promise.all([page.waitForURL(/index\.html/, { timeout: 15000 }), page.click('#submit')]);
const u = new URL(page.url());
console.log('跳转到', u.pathname + u.search, '| 页面上的编号/方案：', await page.inputValue('#pid'), await page.inputValue('#cond'));
// 2. VR 页：用模拟被试加速跑完（同一个编号）
await page.goto(`http://localhost:${PORT}/index.html?pid=${pid}&cond=${cond}&sim=1&speed=40`);
await page.waitForFunction(() => window.HMI && HMI.S.phase === 'end' && HMI.LOG.ok === true && HMI.LOG.sent.events >= HMI.LOG.events.length, null, { timeout: 600000, polling: 500 });
await Promise.all([page.waitForURL(/post\.html/), page.click('#btn-post')]);
console.log('结束后进入', new URL(page.url()).pathname + new URL(page.url()).search);
// 3. 后测
const nPost = await fillAll();
await page.screenshot({ path: process.env.SHOT_DIR ? `${process.env.SHOT_DIR}/post.png` : '/dev/null', fullPage: true }).catch(() => {});
await page.click('#submit');
await page.waitForFunction(() => document.body.dataset.saved);
console.log('post 题数', nPost, '|', await page.textContent('#msg'), '| 保存方式', await page.evaluate(() => document.body.dataset.saved));
await browser.close();
