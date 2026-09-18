import fs from 'node:fs/promises'
import path from 'node:path'
import playwright from '/Users/kongpeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js'

const { chromium } = playwright

const baseUrl = 'http://127.0.0.1:3001'
const screenshotDir = path.resolve('tmp/pdfs/web-screenshots')

const pages = [
  ['home', '/'],
  ['resume', '/resume'],
  ['works', '/works'],
  ['ai-co-creation', '/works/ai-judgement'],
  ['driving-hmi', '/works/driving-attention'],
  ['frametrace', '/works/frametrace'],
  ['taste-again', '/works/taste-again'],
  ['fridge-timeline', '/works/fridge-timeline'],
]

await fs.mkdir(screenshotDir, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
  locale: 'zh-CN',
})

for (const [name, route] of pages) {
  const page = await context.newPage()
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true,
    animations: 'disabled',
  })
  await page.close()
}

await context.close()
await browser.close()
