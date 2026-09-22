// Walks the archive the way a reader does: homepage → people → a story →
// back → back, and checks the things that only break in a browser.
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
const clickText = (sel, text) =>
  page.evaluate(
    ([s, t]) => {
      const el = [...document.querySelectorAll(s)].find((e) => e.textContent.includes(t))
      if (!el) return false
      el.click()
      return true
    },
    [sel, text],
  )

console.log('— the walk —')
await page.goto(ORIGIN + '/', { waitUntil: 'networkidle2' })
await page.evaluate(() => document.fonts.ready)
console.log('  start        :', await here())

// Homepage → People, through the bar.
await clickText('header nav a', 'People')
await wait(1400)
console.log('  nav People   :', await here(), (await here()) === '/people' ? 'OK' : 'FAILED')
if ((await here()) !== '/people') problems.push('the People link did not reach /people')
console.log('  title        :', await page.title())

// Note where we were, then People → Raju from the index.
await page.evaluate(() => document.querySelector('#index')?.scrollIntoView())
await wait(1000)
const leftAt = await page.evaluate(() => Math.round(window.scrollY))
await page.evaluate(() => document.querySelector('a[href="/story/raju"]')?.click())
await wait(1500)
console.log('  → Raju       :', await here(), (await here()) === '/story/raju' ? 'OK' : 'FAILED')
if ((await here()) !== '/story/raju') problems.push('the archive did not reach the story')

// Back to the archive, at the name we left.
await page.goBack({ waitUntil: 'load' })
await wait(1700)
const back = await page.evaluate(() => ({ p: location.pathname, y: Math.round(window.scrollY) }))
const drift = Math.abs(back.y - leftAt)
console.log(`  Back         : ${back.p} at ${back.y} (left ${leftAt}, drift ${drift}px)`, drift < 90 ? 'OK' : 'LOST')
if (back.p !== '/people') problems.push('Back did not return to /people')
if (drift >= 90) problems.push(`Back lost the position in the archive (${drift}px)`)

await page.goForward({ waitUntil: 'load' })
await wait(1200)
console.log('  Forward      :', await here())

// The foot of a story hands you back to the archive.
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await wait(1500)
await page.evaluate(() => {
  const a = [...document.querySelectorAll('a[href="/people"]')].pop()
  a?.click()
})
await wait(1400)
console.log('  story → back :', await here(), (await here()) === '/people' ? 'OK' : 'FAILED')
if ((await here()) !== '/people') problems.push('the foot of the story did not reach /people')

await page.evaluate(() => document.querySelector('a[href="/"]')?.click())
await wait(1400)
console.log('  → homepage   :', await here(), (await here()) === '/' ? 'OK' : 'FAILED')

// ── The index itself ──────────────────────────────────────────────────
await page.goto(ORIGIN + '/people', { waitUntil: 'networkidle2' })
await page.evaluate(() => document.fonts.ready)
await wait(600)
console.log('\n— the index —')

const rows = await page.evaluate(() => ({
  total: document.querySelectorAll('#index ol > li').length,
  links: [...document.querySelectorAll('#index ol a')].map((a) => a.getAttribute('href')),
  buttons: document.querySelectorAll('#index ol button[aria-expanded]').length,
}))
console.log('  entries      :', rows.total, '· links:', rows.links.join(' ') || '(none)', '· in production:', rows.buttons)
// Read the expected split off the page rather than hardcoding it: registering
// the next story is meant to change these numbers, not break this file.
const available = rows.links.length
const total = rows.total
if (available + rows.buttons !== total) problems.push('an entry is neither a link nor an explanation')
if (rows.links.some((h) => !/^\/story\/[a-z0-9-]+$/.test(h))) problems.push('a row links somewhere that is not a story')

// Filtering is typographic, but it has to actually filter.
for (const [label, want] of [['Available', available], ['In production', total - available], ['All', total]]) {
  await page.evaluate((t) => {
    const b = [...document.querySelectorAll('#index button[aria-pressed]')].find((e) => e.textContent.startsWith(t))
    b?.click()
  }, label)
  await wait(700)
  const n = await page.evaluate(() => document.querySelectorAll('#index ol > li').length)
  console.log(`  filter ${label.padEnd(14)}: ${n}`, n === want ? 'OK' : `expected ${want}`)
  if (n !== want) problems.push(`the ${label} filter shows ${n}, not ${want}`)
}

// An in-production entry must say what it is instead of going nowhere.
await page.evaluate(() => document.querySelector('#index ol button[aria-expanded]')?.click())
await wait(700)
const told = await page.evaluate(() => {
  const b = document.querySelector('#index ol button[aria-expanded]')
  return { expanded: b?.getAttribute('aria-expanded'), path: location.pathname }
})
console.log('  in-production :', JSON.stringify(told), told.path === '/people' ? 'OK (stayed)' : 'NAVIGATED')
if (told.expanded !== 'true') problems.push('an in-production entry explains nothing when pressed')
if (told.path !== '/people') problems.push('an in-production entry navigated away')

console.log('\n' + (problems.length ? 'PROBLEMS:\n  ' + [...new Set(problems)].join('\n  ') : 'no console errors, no failed requests, no problems'))
await browser.close()
process.exit(problems.length ? 1 : 0)
