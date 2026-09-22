// Drives headless Chrome over the running dev server and writes screenshots
// at a set of viewports / scroll positions so the composition can be reviewed.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs/promises'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = process.env.ROZ_URL ?? 'http://localhost:5180/'
const OUT = '.shots'
const VIEW = process.argv[2] ?? 'desktop'
const SIZES = { desktop: [1440, 900], large: [1920, 1080], tablet: [834, 1112], mobile: [390, 844] }
const [width, height] = SIZES[VIEW]

await fs.mkdir(OUT, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox', '--force-color-profile=srgb', '--hide-scrollbars'],
  defaultViewport: { width, height, deviceScaleFactor: 1, isMobile: VIEW === 'mobile', hasTouch: VIEW === 'mobile' },
})
const page = await browser.newPage()
if (VIEW === 'mobile') await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])
const errors = []
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`) })
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => errors.push(`[404?] ${r.url()} ${r.failure()?.errorText}`))

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 })
await page.evaluate(() => document.fonts.ready)

const total = await page.evaluate(() => document.documentElement.scrollHeight)
const stops = Number(process.argv[3] ?? 0) || Math.min(16, Math.ceil(total / height))
for (let i = 0; i < stops; i++) {
  const y = Math.round((i * (total - height)) / Math.max(1, stops - 1))
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await new Promise((r) => setTimeout(r, 1500))
  await page.screenshot({ path: `${OUT}/${VIEW}-${String(i).padStart(2, '0')}.png` })
}
console.log(`${VIEW}: ${stops} shots, page ${total}px`)
if (errors.length) console.log('\nCONSOLE:\n' + [...new Set(errors)].join('\n'))
await browser.close()
