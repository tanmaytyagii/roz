// Drives /places: the marks, the panel, the written index, and the loop
// between a place, a person and their day.
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ORIGIN = process.env.ROZ_URL ?? 'http://localhost:5180'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900 },
})
const problems = []
const page = await browser.newPage()
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message))
page.on('console', (m) => m.type() === 'error' && problems.push('console: ' + m.text()))
page.on('requestfailed', (r) => problems.push(`failed: ${r.url()} ${r.failure()?.errorText}`))
const here = () => page.evaluate(() => location.pathname)

await page.goto(ORIGIN + '/places', { waitUntil: 'networkidle2' })
await page.evaluate(() => document.fonts.ready)

// ── The drawing ────────────────────────────────────────────────────────
console.log('— the map —')
const marks = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('#map button[aria-label]')]
  const box = document.querySelector('#map svg').getBoundingClientRect()
  return btns.map((b) => {
    const r = b.getBoundingClientRect()
    return {
      label: b.getAttribute('aria-label'),
      cx: r.x + r.width / 2,
      hit: Math.round(Math.min(r.width, r.height)),
      inside: r.x > box.x - 40 && r.right < box.right + 160,
    }
  })
})
console.log('  marks        :', marks.length)
console.log('  hit area     :', marks[0]?.hit + 'px')
console.log('  named        :', marks.every((m) => /—/.test(m.label)) ? 'all' : 'SOME UNNAMED')
if (marks.length !== 7) problems.push(`expected 7 marks, found ${marks.length}`)
if ((marks[0]?.hit ?? 0) < 36) problems.push('the marks are too small to hit')
if (marks.some((m) => !m.inside)) problems.push('a mark sits outside the drawing')

// Longitude order: the marks must actually be where the towns are.
const order = ['Mumbai', 'Jaipur', 'Delhi', 'Western U.P.', 'Lucknow', 'Varanasi', 'Kolkata']
const byX = [...marks].sort((a, b) => a.cx - b.cx).map((m) => m.label.split('—')[0].trim())
console.log('  west → east  :', byX.join(' · '))
if (byX.join() !== order.join()) problems.push('the marks are not in longitude order')

// ── Pinning a place changes the panel ─────────────────────────────────
console.log('\n— the panel —')
const panelName = () => page.evaluate(() => document.querySelector('#map h2')?.textContent?.trim())
console.log('  opens on     :', await panelName())
await page.evaluate(() => {
  const b = [...document.querySelectorAll('#map button[aria-label]')].find((x) => x.getAttribute('aria-label').startsWith('Kolkata'))
  b.click()
})
await wait(700)
const pinned = await page.evaluate(() => ({
  name: document.querySelector('#map h2')?.textContent?.trim(),
  pressed: [...document.querySelectorAll('#map button[aria-pressed="true"]')].map((b) => b.getAttribute('aria-label').split('—')[0].trim()),
  status: document.querySelector('#map [class*="u-label"]')?.textContent?.trim(),
  links: [...document.querySelectorAll('#map a[href^="/story/"]')].map((a) => a.getAttribute('href')),
}))
console.log('  after Kolkata:', JSON.stringify(pinned))
if (pinned.name !== 'Kolkata') problems.push('pinning a mark did not change the panel')
if (pinned.links.length) problems.push('an in-production place offers a story link')

await page.evaluate(() => {
  const b = [...document.querySelectorAll('#map button[aria-label]')].find((x) => x.getAttribute('aria-label').startsWith('Western'))
  b.click()
})
await wait(700)
const avail = await page.evaluate(() => [...document.querySelectorAll('#map a[href^="/story/"]')].map((a) => a.getAttribute('href')))
console.log('  Western U.P. :', avail.join(' ') || '(no link)')
if (!avail.includes('/story/raju')) problems.push('the available place does not offer its story')

// ── The written index ─────────────────────────────────────────────────
console.log('\n— the index —')
const index = await page.evaluate(() =>
  [...document.querySelectorAll('#the-places ol > li')].map((li) => ({
    name: li.querySelector('[class*="u-display"]')?.textContent?.trim(),
    status: li.querySelector('[class*="u-label"]')?.textContent?.trim(),
    count: Number(li.querySelector('[data-count]')?.textContent?.trim()),
    href: li.querySelector('a')?.getAttribute('href'),
    // What a screen reader is actually given for the row.
    spoken: (li.querySelector('.sr-only')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
  })))
for (const r of index) console.log(`    ${String(r.name).padEnd(14)} ${String(r.status).padEnd(15)} ${r.count}`)
const counts = index.map((r) => r.count)
console.log('  rows         :', index.length, '· counts:', counts.join(' '))
if (index.length !== 7) problems.push(`the index lists ${index.length} places, not 7`)
if (counts.some((c) => c !== 1)) problems.push('a location count does not match the story data')
if (index.filter((r) => r.status === 'Available').length !== 1) problems.push('more than one place claims to be available')
if (index.some((r) => !r.spoken.includes('story'))) problems.push('a row does not announce its story count')

// ── The loop: place → story → place ───────────────────────────────────
console.log('\n— the loop —')
await page.evaluate(() => document.querySelector('#map a[href="/story/raju"]')?.click())
await wait(1500)
console.log('  place → Raju :', await here(), (await here()) === '/story/raju' ? 'OK' : 'FAILED')
if ((await here()) !== '/story/raju') problems.push('the panel did not reach the story')

await page.evaluate(() => document.querySelector('a[href="/places"]')?.click())
await wait(1500)
console.log('  Raju → places:', await here(), (await here()) === '/places' ? 'OK' : 'FAILED')
if ((await here()) !== '/places') problems.push("the story slate's place did not reach /places")

await page.goBack({ waitUntil: 'load' })
await wait(1400)
console.log('  Back         :', await here())
await page.goForward({ waitUntil: 'load' })
await wait(1200)
console.log('  Forward      :', await here())

console.log('\n' + (problems.length ? 'PROBLEMS:\n  ' + [...new Set(problems)].join('\n  ') : 'no console errors, no failed requests, no problems'))
await browser.close()
process.exit(problems.length ? 1 : 0)
