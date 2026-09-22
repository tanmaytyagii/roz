import puppeteer from 'puppeteer-core'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = 'http://localhost:5190/'
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'shell',
  args: ['--no-sandbox', '--hide-scrollbars'], defaultViewport: { width: 1440, height: 900 },
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// ── 1. weight of the first screen ───────────────────────────────────────
{
  const page = await browser.newPage()
  const seen = []
  page.on('response', async (r) => {
    const t = r.request().resourceType()
    if (!['document','script','stylesheet','font','image'].includes(t)) return
    let size = 0
    try { size = (await r.buffer()).length } catch {}
    seen.push({ t, url: r.url().split('/').pop(), size })
  })
  await page.goto(URL, { waitUntil: 'networkidle2' })
  await page.evaluate(() => document.fonts.ready)
  await wait(2500) // let the deferred hero plates arrive
  const by = {}
  for (const s of seen) by[s.t] = (by[s.t] ?? 0) + s.size
  const total = Object.values(by).reduce((a, b) => a + b, 0)
  console.log('— first screen (incl. deferred hero plates) —')
  for (const [k, v] of Object.entries(by).sort((a,b)=>b[1]-a[1])) console.log(`  ${k.padEnd(12)} ${(v/1024).toFixed(0).padStart(6)} kB`)
  console.log(`  ${'TOTAL'.padEnd(12)} ${(total/1024).toFixed(0).padStart(6)} kB`)
  const lcp = await page.evaluate(() => new Promise((res) => {
    new PerformanceObserver((l) => { const e = l.getEntries().at(-1); res({ t: Math.round(e.startTime), el: e.element?.tagName, url: (e.url||'').split('/').pop() }) })
      .observe({ type: 'largest-contentful-paint', buffered: true })
    setTimeout(() => res(null), 1500)
  }))
  console.log('  LCP', JSON.stringify(lcp))
  const cls = await page.evaluate(() => new Promise((res) => {
    let v = 0
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) v += e.value }).observe({ type: 'layout-shift', buffered: true })
    setTimeout(() => res(Number(v.toFixed(4))), 1200)
  }))
  console.log('  CLS', cls)
  await page.close()
}

// ── 2. reduced motion ───────────────────────────────────────────────────
{
  const page = await browser.newPage()
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(URL, { waitUntil: 'networkidle2' })
  await page.evaluate(() => document.fonts.ready)
  await wait(1200)
  await page.screenshot({ path: '.shots/rm-hero.png' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.32))
  await wait(1500)
  await page.screenshot({ path: '.shots/rm-story.png' })
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('h2,h3,p,blockquote')]
      .filter((e) => e.getBoundingClientRect().top > -200 && e.getBoundingClientRect().bottom < innerHeight + 200)
      .filter((e) => Number(getComputedStyle(e).opacity) < 0.35 && e.textContent.trim())
      .map((e) => e.textContent.trim().slice(0, 40)))
  console.log('\n— reduced motion —')
  console.log('  content stuck invisible in viewport:', hidden.length ? hidden : 'none')
  await page.close()
}

// ── 3. wheel-driven scroll lock behind the menu ─────────────────────────
{
  const page = await browser.newPage()
  await page.goto(URL, { waitUntil: 'networkidle2' })
  await wait(800)
  await page.click('button[aria-controls="roz-menu"]')
  await wait(1000)
  const before = await page.evaluate(() => window.scrollY)
  await page.mouse.move(700, 450)
  await page.mouse.wheel({ deltaY: 900 })
  await wait(900)
  const after = await page.evaluate(() => window.scrollY)
  console.log('\n— menu —')
  console.log(`  scroll behind overlay: ${before} -> ${after} ${before === after ? '(locked)' : '(LEAKS)'}`)
  await page.close()
}
await browser.close()
