import puppeteer from 'puppeteer-core'
import fs from 'node:fs/promises'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
await fs.mkdir('.shots', { recursive: true })
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'shell',
  args: ['--no-sandbox', '--force-color-profile=srgb', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
const problems = []
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()) })
page.on('requestfailed', (r) => problems.push('failed: ' + r.url()))

await page.goto('http://localhost:5180/', { waitUntil: 'networkidle2' })
await page.evaluate(() => document.fonts.ready)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// 1 — the menu overlay
await page.click('button[aria-controls="roz-menu"]')
await wait(1100)
await page.screenshot({ path: '.shots/i-menu.png' })
const locked = await page.evaluate(() => {
  const before = window.scrollY
  window.scrollBy(0, 400)
  return { overflow: getComputedStyle(document.documentElement).overflow, before, after: window.scrollY }
})
console.log('menu scroll lock:', JSON.stringify(locked))
await page.keyboard.press('Escape')
await wait(900)
console.log('menu closed by Escape:', await page.evaluate(() => !document.getElementById('roz-menu')))

// 2 — the hover plates in the intro list
await page.evaluate(() => document.querySelector('#intro')?.scrollIntoView())
await wait(1600)
const row = await page.evaluate(() => {
  const el = [...document.querySelectorAll('li')].find((l) => l.textContent?.includes('Inside the auto'))
  const r = el?.getBoundingClientRect()
  return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null
})
if (row) {
  await page.mouse.move(row.x, row.y)
  await wait(300)
  await page.mouse.move(row.x + 20, row.y + 4)
  await wait(1100)
  await page.screenshot({ path: '.shots/i-hover.png' })
  console.log('hovered "Inside the auto"')
} else console.log('row not found')

// 3 — keyboard focus ring on the first interactive thing
await page.evaluate(() => window.scrollTo(0, 0))
await wait(600)
for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); await wait(200) }
await page.screenshot({ path: '.shots/i-focus.png' })
console.log('focused:', await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 40)))

// 4 — a headings / landmark outline
console.log('\nheadings:', JSON.stringify(await page.evaluate(() =>
  [...document.querySelectorAll('h1,h2,h3')].map((h) => h.tagName + ': ' + h.textContent.trim().slice(0, 44))), null, 1))
console.log('images missing alt:', await page.evaluate(() => [...document.images].filter((i) => i.alt === null).length))
console.log('links w/o text:', await page.evaluate(() =>
  [...document.querySelectorAll('a,button')].filter((a) => !a.textContent.trim() && !a.getAttribute('aria-label')).length))

if (problems.length) console.log('\nPROBLEMS:\n' + [...new Set(problems)].join('\n'))
else console.log('\nno console errors / failed requests')
await browser.close()
