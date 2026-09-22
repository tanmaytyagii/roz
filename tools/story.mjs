// Drives the story experience the way a reader would, and checks the things
// that only break in a browser: routing, Back, the time rail, the sound, and
// what is left on screen with reduced motion on.
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const ORIGIN = process.env.ROZ_URL ?? 'http://localhost:5180'
const SLUG = process.argv[2] ?? 'raju'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox', '--autoplay-policy=document-user-activation-required', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900 },
})

const problems = []
const watch = (page) => {
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message))
  page.on('console', (m) => m.type() === 'error' && problems.push('console: ' + m.text()))
  page.on('requestfailed', (r) => problems.push(`failed: ${r.url()} ${r.failure()?.errorText}`))
  return page
}

// ── 1. homepage → story → Back, and what the scroll does ────────────────
{
  const page = watch(await browser.newPage())
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle2' })
  await page.evaluate(() => document.fonts.ready)

  await page.evaluate(() => document.querySelector('#stories')?.scrollIntoView())
  await wait(1400)
  const leftAt = await page.evaluate(() => {
    window.scrollBy(0, 900)
    return window.scrollY
  })
  await wait(900)

  const link = await page.evaluate((slug) => {
    const a = document.querySelector(`a[href="/story/${slug}"]`)
    if (!a) return null
    const r = a.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }, SLUG)
  console.log('— routing —')
  if (!link) {
    problems.push(`no /story/${SLUG} link on the homepage`)
  } else {
    await page.mouse.click(link.x, link.y)
    await wait(1200)
    console.log('  after click :', await page.evaluate(() => location.pathname), '· scrollY', await page.evaluate(() => Math.round(window.scrollY)))
    console.log('  title       :', await page.title())

    // The dip: it has to darken and lift, and it must never be a screen that
    // stays up waiting for something.
    const veil = await page.evaluate(() => {
      const el = [...document.querySelectorAll('div[aria-hidden]')].find(
        (d) => getComputedStyle(d).position === 'fixed' && getComputedStyle(d).zIndex === '65',
      )
      return el ? getComputedStyle(el).opacity : 'missing'
    })
    console.log('  dip at rest :', veil, veil === '0' ? 'OK' : 'STUCK')
    if (veil !== '0') problems.push('the page dip did not lift')

    // The reader's own pointer, everywhere.
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('body, body *')].filter((e) => getComputedStyle(e).cursor === 'none').length)
    console.log('  cursor:none :', hidden, hidden === 0 ? 'OK (native pointer)' : 'HIDDEN SOMEWHERE')
    if (hidden > 0) problems.push('something is still hiding the native cursor')

    await page.goBack({ waitUntil: 'load' })
    await wait(1600)
    const back = await page.evaluate(() => ({ path: location.pathname, y: Math.round(window.scrollY) }))
    const drift = Math.abs(back.y - leftAt)
    console.log(`  after Back  : ${back.path} · scrollY ${back.y} (left at ${leftAt}, drift ${drift}px) ${drift < 80 ? 'OK' : 'LOST'}`)
    if (back.path !== '/') problems.push('Back did not return to the homepage')
    if (drift >= 80) problems.push(`Back lost the reading position (${drift}px)`)

    await page.goForward({ waitUntil: 'load' })
    await wait(1200)
    console.log('  after Fwd   :', await page.evaluate(() => location.pathname))
  }
  await page.close()
}

// ── 2. the story itself: the rail, the clock, the sound ─────────────────
{
  const page = watch(await browser.newPage())
  await page.goto(`${ORIGIN}/story/${SLUG}`, { waitUntil: 'networkidle2' })
  await page.evaluate(() => document.fonts.ready)
  await wait(600)

  const hours = await page.evaluate(() => document.querySelectorAll('#the-day article').length)
  console.log('\n— the day —')
  console.log('  chapters    :', hours)

  // Walk the day and read the clock at each chapter.
  const clock = []
  for (let i = 0; i < hours; i++) {
    await page.evaluate((n) => {
      const el = document.querySelectorAll('#the-day article')[n]
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
    }, i)
    await wait(700)
    clock.push(
      await page.evaluate(() => {
        const nav = document.querySelector('nav[aria-label="The hours"]')
        return {
          t: nav?.querySelector('p span')?.textContent,
          on: nav?.querySelector('[aria-current="true"]')?.getAttribute('aria-label')?.split('—')[0].trim(),
          vis: Number(getComputedStyle(nav).opacity) > 0.5,
        }
      }),
    )
  }
  console.log('  clock/rail  :', clock.map((c) => `${c.t}${c.vis ? '' : '(hidden)'}`).join(' → '))
  if (clock.some((c) => !c.t)) problems.push('the clock stopped reporting a time')
  if (!clock.every((c) => c.vis)) problems.push('the time rail was hidden during the day')
  if (clock.some((c) => c.on !== c.t)) problems.push('the lit tick did not match the clock')

  // The rail is a way of moving as well as a readout.
  await page.evaluate(() => document.querySelectorAll('nav[aria-label="The hours"] button')[2]?.click())
  await wait(1400)
  const jumped = await page.evaluate(() => {
    const el = document.querySelectorAll('#the-day article')[2]
    return Math.abs(el.getBoundingClientRect().top) < 40
  })
  console.log('  rail jump   :', jumped ? 'lands on 07:18' : 'MISSED')
  if (!jumped) problems.push('the rail did not scroll to the hour it names')

  // Sound: nothing may load before it is asked for.
  const early = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => r.name.includes('/sounds/')).length)
  console.log('\n— the sound —')
  console.log('  fetched before any click :', early, early === 0 ? 'OK' : 'AUTOLOADED')
  if (early > 0) problems.push('audio was fetched before anybody pressed play')

  await page.evaluate(() => document.querySelector('#the-sound')?.scrollIntoView())
  await wait(900)
  await page.evaluate(() => document.querySelector('#the-sound li button')?.click())
  await wait(2500)
  const playing = await page.evaluate(() => {
    const btn = document.querySelector('#the-sound li button')
    return {
      pressed: btn?.getAttribute('aria-pressed'),
      label: btn?.textContent?.includes('Playing'),
      loaded: performance.getEntriesByType('resource').filter((r) => r.name.includes('/sounds/')).length,
    }
  })
  console.log('  after play  :', JSON.stringify(playing))
  if (playing.pressed !== 'true') problems.push('the first track did not start on click')

  // And a second press stops it rather than stacking.
  await page.evaluate(() => document.querySelector('#the-sound li button')?.click())
  await wait(1200)
  console.log('  after stop  :', await page.evaluate(() => document.querySelector('#the-sound li button')?.getAttribute('aria-pressed')))

  console.log('\n— structure —')
  console.log('  headings    :', (await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map((h) => h.tagName + ' ' + h.textContent.trim().slice(0, 34)))).join('\n                ') )
  console.log('  img no alt  :', await page.evaluate(() => [...document.images].filter((i) => i.getAttribute('alt') === null).length))
  console.log('  unlabelled  :', await page.evaluate(() =>
    [...document.querySelectorAll('a,button')].filter((a) => !a.textContent.trim() && !a.getAttribute('aria-label')).length))
  await page.close()
}

// ── 3. the narrow-screen hour sheet ─────────────────────────────────────
for (const [w, h] of [[390, 844], [768, 1024]]) {
  const page = watch(await browser.newPage())
  await page.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 })
  await page.goto(`${ORIGIN}/story/${SLUG}`, { waitUntil: 'networkidle2' })
  await page.evaluate(() => document.fonts.ready)
  console.log(`\n— hour sheet @${w} —`)

  const rail = await page.evaluate(() => getComputedStyle(document.querySelector('nav[aria-label="The hours"]')).display)
  console.log('  desktop rail:', rail, rail === 'none' ? 'OK (hidden)' : 'SHOWING')
  if (rail !== 'none') problems.push(`the desktop rail is visible at ${w}px`)

  // Outside the day it is not there; inside it is.
  const before = await page.evaluate(() => {
    const el = document.querySelector('[aria-controls="roz-hours"]')?.closest('div')
    return el ? Number(getComputedStyle(el).opacity) : -1
  })
  await page.evaluate(() => {
    const el = document.querySelectorAll('#the-day article')[1]
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
  })
  await wait(900)
  const inside = await page.evaluate(() => {
    const btn = document.querySelector('[aria-controls="roz-hours"]')
    const el = btn?.closest('div')
    return { opacity: Number(getComputedStyle(el).opacity), name: btn?.querySelector('.sr-only')?.textContent?.trim().replace(/\s+/g, ' ') }
  })
  console.log('  at the top  :', before.toFixed(2), '· inside the day:', inside.opacity.toFixed(2))
  console.log('  name        :', inside.name)
  if (before > 0.05) problems.push('the hour sheet shows outside the day')
  if (inside.opacity < 0.95) problems.push('the hour sheet is missing inside the day')

  // Open it with the keyboard alone, then choose an hour with the keyboard.
  await page.evaluate(() => document.querySelector('[aria-controls="roz-hours"]').focus())
  await page.keyboard.press('Enter')
  await wait(700)
  const opened = await page.evaluate(() => ({
    expanded: document.querySelector('[aria-controls="roz-hours"]')?.getAttribute('aria-expanded'),
    times: [...document.querySelectorAll('#roz-hours button')].map((b) => b.getAttribute('aria-label').split('—')[0].trim()),
    current: document.querySelector('#roz-hours [aria-current="true"]')?.getAttribute('aria-label')?.split('—')[0].trim(),
  }))
  console.log('  opened      :', opened.expanded, '·', opened.times.join(' '))
  console.log('  highlighted :', opened.current)
  if (opened.expanded !== 'true' || opened.times.length !== 7) problems.push('the sheet did not open with all seven hours')

  // Tab to the fifth hour and take it.
  for (let i = 0; i < 5; i++) await page.keyboard.press('Tab')
  const target = await page.evaluate(() => document.activeElement?.getAttribute('aria-label')?.split('—')[0].trim())
  await page.keyboard.press('Enter')
  await wait(2200)
  const landed = await page.evaluate(() => {
    const arts = [...document.querySelectorAll('#the-day article')]
    const i = arts.findIndex((a) => Math.abs(a.getBoundingClientRect().top) < 40)
    return { i, closed: document.querySelector('[aria-controls="roz-hours"]')?.getAttribute('aria-expanded') }
  })
  console.log('  chose       :', target, '→ chapter', landed.i + 1, landed.i >= 0 ? 'OK' : 'MISSED')
  console.log('  closed after:', landed.closed)
  if (landed.i < 0) problems.push('choosing an hour did not land on a chapter')
  if (landed.closed !== 'false') problems.push('the sheet stayed open after a choice')

  // Escape closes it and hands focus back.
  await page.evaluate(() => document.querySelector('[aria-controls="roz-hours"]').click())
  await wait(500)
  await page.keyboard.press('Escape')
  await wait(500)
  const after = await page.evaluate(() => ({
    expanded: document.querySelector('[aria-controls="roz-hours"]')?.getAttribute('aria-expanded'),
    focused: document.activeElement?.getAttribute('aria-controls'),
  }))
  console.log('  escape      :', after.expanded, '· focus back on trigger:', after.focused === 'roz-hours')
  if (after.expanded !== 'false') problems.push('Escape did not close the sheet')
  if (after.focused !== 'roz-hours') problems.push('Escape did not return focus to the trigger')

  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  console.log('  overflow    :', over, over === 0 ? 'OK' : 'BAD')
  if (over !== 0) problems.push(`horizontal overflow at ${w}px`)
  await page.close()
}

// ── 4. reduced motion: nothing may be left hidden behind an animation ───
{
  const page = watch(await browser.newPage())
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(`${ORIGIN}/story/${SLUG}`, { waitUntil: 'networkidle2' })
  await page.evaluate(() => document.fonts.ready)
  console.log('\n— reduced motion —')
  const stuck = []
  for (const at of [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9]) {
    await page.evaluate((p) => window.scrollTo(0, document.body.scrollHeight * p), at)
    await wait(700)
    stuck.push(
      ...(await page.evaluate(() =>
        [...document.querySelectorAll('h1,h2,h3,p,blockquote,figure,li')]
          .filter((e) => {
            const r = e.getBoundingClientRect()
            return r.top > -100 && r.bottom < innerHeight + 100 && r.height > 0
          })
          .filter((e) => {
            const s = getComputedStyle(e)
            return (Number(s.opacity) < 0.35 || /inset\(\s*(9\d|100)/.test(s.clipPath)) && e.textContent.trim()
          })
          .map((e) => e.textContent.trim().slice(0, 40)),
      )),
    )
  }
  console.log('  invisible in viewport :', stuck.length ? [...new Set(stuck)] : 'none')
  if (stuck.length) problems.push('content is hidden with reduced motion on')
  await page.close()
}

console.log('\n' + (problems.length ? 'PROBLEMS:\n  ' + [...new Set(problems)].join('\n  ') : 'no console errors, no failed requests, no problems'))
await browser.close()
process.exit(problems.length ? 1 : 0)
