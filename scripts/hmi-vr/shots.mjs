// 在加速运行中，等指定线索到达前若干秒时暂停并截图。用法：node shots.mjs 输出目录 "查询串" C01:1.6 C02:1.2 …  （可加 :yaw 让镜头转向）
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [outDir, q, ...targets] = process.argv.slice(2);
const PORT = process.env.PORT || 8000;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 620 } });
page.on('pageerror', e => console.log('ERR', String(e)));
await page.goto(`http://localhost:${PORT}/index.html?sim=1&speed=${process.env.SPEED || 12}&${q}`);
for (const t of targets) {
  const [id, tta, yaw] = t.split(':');
  await page.waitForFunction(([id, tta]) => {
    const H = window.HMI; if (!H || !H.cues) return false;
    const c = H.cues.cues.find(c => c.id === id); if (!c) return true;
    if (c.state === 'open' && c.tta <= +tta) { H.S.timeScale = 0; return true; }
    return c.state === 'done' || c.state === 'gone';
  }, [id, tta], { timeout: 600000, polling: 'raf' });
  await page.evaluate(yaw => { HMI.camera.rotation.set(-0.06, -(+yaw || 0) * Math.PI / 180, 0, 'YXZ'); document.getElementById('ui').style.display = 'none'; }, yaw);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/${id}_${tta}${yaw ? '_y' + yaw : ''}.png` });
  const info = await page.evaluate(id => { const c = HMI.cues.cues.find(c => c.id === id); return { id, type: c.type, side: c.side, state: c.state, tta: c.tta, hint: c.hint, check: c.check, seg: HMI.S.segment, speed: (HMI.S.egoSpeed * 3.6).toFixed(1), x: HMI.S.egoX.toFixed(2) }; }, id);
  console.log(JSON.stringify(info));
  await page.evaluate(() => { document.getElementById('ui').style.display = ''; HMI.S.timeScale = +(new URLSearchParams(location.search).get('speed') || 1); });
}
await browser.close();
