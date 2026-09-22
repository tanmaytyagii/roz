// The audio contract: nothing fetched before a press, one recording at a time,
// play / pause / stop / completion, and every control reachable by keyboard.
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ORIGIN = process.env.ROZ_URL ?? 'http://localhost:5180'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  // The real policy: sound only after the reader does something.
  args: ['--no-sandbox', '--hide-scrollbars', '--autoplay-policy=document-user-activation-required'],
  defaultViewport: { width: 1440, height: 900 },
})
const problems = []
const page = await browser.newPage()
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message))
page.on('console', (m) => m.type() === 'error' && problems.push('console: ' + m.text()))
page.on('requestfailed', (r) => problems.push(`failed: ${r.url()} ${r.failure()?.errorText}`))

await page.goto(ORIGIN + '/sounds', { waitUntil: 'networkidle2' })
await page.evaluate(() => document.fonts.ready)

const audioHits = () =>
  page.evaluate(() => performance.getEntriesByType('resource').filter((r) => r.name.includes('/sounds/')).length)
const state = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('button[aria-pressed]')].map((b) => ({
      name: b.getAttribute('aria-label')?.split('—')[0].trim(),
      label: b.getAttribute('aria-label') ?? '',
      pressed: b.getAttribute('aria-pressed'),
      word: b.querySelector('[class*="u-label"]')?.textContent?.trim(),
      clock: b.querySelector('[class*="u-mono"]')?.textContent?.replace(/\s+/g, ' ').trim(),
    })),
  )
const press = (i) =>
  page.evaluate((n) => {
    const b = [...document.querySelectorAll('button[aria-pressed]')][n]
    b.scrollIntoView({ block: 'center' })
    b.click()
  }, i)

console.log('— before anybody presses anything —')
console.log('  audio requests :', await audioHits(), (await audioHits()) === 0 ? 'OK' : 'AUTOLOADED')
if ((await audioHits()) !== 0) problems.push('audio was fetched before any interaction')
const all = await state()
console.log('  recordings     :', all.length)
console.log('  idle words     :', all.map((r) => r.word).join(' '))
if (all.length !== 4) problems.push(`expected 4 recordings, found ${all.length}`)
if (all.some((r) => r.word !== 'Listen')) problems.push('a recording does not start idle')
console.log('  full label     :', all[0].label)
if (all.some((r) => !/seconds, stands in for/.test(r.label))) problems.push('a control is not fully described')

console.log('\n— play —')
await press(0)
await wait(2600)
let s = await state()
console.log('  row 1          :', JSON.stringify(s[0]))
console.log('  fetched        :', await audioHits())
if (s[0].word !== 'Playing') problems.push('pressing play did not start the recording')
if ((await audioHits()) !== 1) problems.push('the wrong number of files was fetched')

// The clock has to actually move.
const t1 = s[0].clock
await wait(2500)
const t2 = (await state())[0].clock
console.log(`  clock          : ${t1} → ${t2}`, t1 !== t2 ? 'OK (running)' : 'STUCK')
if (t1 === t2) problems.push('the clock did not advance during playback')

console.log('\n— one at a time —')
await press(2)
await wait(2400)
s = await state()
console.log('  row 1 / row 3  :', s[0].word, '/', s[2].word)
console.log('  fetched        :', await audioHits())
if (s[0].word !== 'Listen' || s[2].word !== 'Playing') problems.push('a second recording did not replace the first')
if (s.filter((r) => r.word === 'Playing').length !== 1) problems.push('more than one recording is playing')

console.log('\n— pause, resume, stop —')
await press(2)
await wait(1600)
s = await state()
console.log('  after press    :', s[2].word, '· clock', s[2].clock)
if (s[2].word !== 'Paused') problems.push('pressing a playing recording did not pause it')
const held = s[2].clock
await wait(1500)
if ((await state())[2].clock !== held) problems.push('the clock kept running while paused')

await press(2)
await wait(1800)
s = await state()
console.log('  resumed        :', s[2].word, '· clock', s[2].clock)
if (s[2].word !== 'Playing') problems.push('a paused recording did not resume')

await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Stop' && x.getAttribute('aria-hidden') !== 'true')
  b?.click()
})
await wait(1400)
s = await state()
console.log('  after Stop     :', s.map((r) => r.word).join(' '), '· clock', s[2].clock)
if (s.some((r) => r.word !== 'Listen')) problems.push('Stop did not return everything to idle')
if (s[2].clock?.startsWith('00:00') === false) problems.push('Stop did not rewind the clock')

console.log('\n— keyboard —')
await page.evaluate(() => [...document.querySelectorAll('button[aria-pressed]')][1].focus())
await page.keyboard.press('Enter')
await wait(2200)
s = await state()
const ring = await page.evaluate(() => {
  const st = getComputedStyle(document.activeElement)
  return st.outlineStyle !== 'none' && st.outlineWidth !== '0px'
})
console.log('  Enter on row 2 :', s[1].word, '· focus ring:', ring)
if (s[1].word !== 'Playing') problems.push('Enter did not start a recording')
if (!ring) problems.push('the transport has no visible focus')

// ── Completion returns to idle. The recordings are 25s, so this waits. ──
console.log('\n— playing one to the end (~26s) —')
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Stop' && x.getAttribute('aria-hidden') !== 'true')
  b?.click()
})
await wait(900)
await press(3)
await wait(27000)
s = await state()
console.log('  after it ends  :', s.map((r) => r.word).join(' '), '· clock', s[3].clock)
if (s.some((r) => r.word !== 'Listen')) problems.push('a finished recording did not return to idle')

console.log('\n— leaving the page stops the sound —')
await page.evaluate(() => document.querySelector('a[href="/places"]')?.click())
await wait(1800)
console.log('  path           :', await page.evaluate(() => location.pathname))
console.log('  still playing  :', await page.evaluate(() => {
  const a = [...document.querySelectorAll('audio')]
  return a.some((x) => !x.paused)
}) ? 'YES' : 'no')

console.log('\n' + (problems.length ? 'PROBLEMS:\n  ' + [...new Set(problems)].join('\n  ') : 'no console errors, no failed requests, no problems'))
await browser.close()
process.exit(problems.length ? 1 : 0)
