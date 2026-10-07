import { chromium } from '@playwright/test'
import fs from 'node:fs'

const BASE = process.env.BASE ?? 'http://127.0.0.1:5173'
const OUT = process.env.OUT ?? 'C:/Users/HP/AppData/Local/Temp/claude/c--laravel-projects-ak/2c2f164e-1cca-4410-94aa-36d729668630/scratchpad/shots'
fs.mkdirSync(OUT, { recursive: true })

const routes = (process.env.ROUTES ?? '/,/about,/skills,/projects,/projects/opencompas-educational-erp,/experience,/services,/resume,/contact,/does-not-exist,/projects/nope').split(',')
const viewports = { desktop: { width: 1440, height: 900 }, tablet: { width: 820, height: 1180 }, mobile: { width: 390, height: 844 } }
const which = (process.env.VP ?? 'desktop').split(',')
const fullPage = process.env.FULL !== '0'

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const report = []

for (const vpName of which) {
  const context = await browser.newContext({ viewport: viewports[vpName], deviceScaleFactor: 1, reducedMotion: process.env.RM ? 'reduce' : 'no-preference' })
  for (const route of routes) {
    const page = await context.newPage()
    const errors = []
    page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`[${m.type()}] ${m.text().slice(0, 300)}`))
    page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
    page.on('requestfailed', (r) => errors.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`))
    page.on('response', (r) => r.status() >= 400 && !r.url().includes('/projects/nope') && errors.push(`[http ${r.status()}] ${r.url()}`))
    await page.goto(BASE + route + (process.env.Q ?? ''), { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(Number(process.env.WAIT ?? 1500))
    // Scroll through so whileInView animations settle before the full-page shot.
    if (fullPage) {
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(700)
    }
    const info = await page.evaluate(() => ({
      title: document.title,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 60)),
      scene: document.querySelector('[data-scene-quality]')?.getAttribute('data-scene-quality') ?? null,
      canvas: Boolean(document.querySelector('canvas')),
    }))
    const file = `${OUT}/${vpName}${route.replace(/\//g, '_') || '_home'}.png`
    await page.screenshot({ path: file, fullPage })
    report.push({ vp: vpName, route, ...info, errors })
    await page.close()
  }
  await context.close()
}
await browser.close()
for (const r of report) {
  console.log(`\n${r.vp} ${r.route} | title="${r.title}" | h1=${JSON.stringify(r.h1)} | overflowX=${r.overflowX} | scene=${r.scene} canvas=${r.canvas}`)
  if (r.brokenImages.length) console.log('  BROKEN IMAGES', r.brokenImages)
  r.errors.forEach((e) => console.log('  ', e))
}
