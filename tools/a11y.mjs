// Horizontal overflow at the three widths that matter, and a walk through the
// first ten keyboard stops: every one has to be named, ringed, and leave the
// reader's own pointer alone.
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'shell', args: ['--no-sandbox', '--hide-scrollbars'],
})
const bad = []
for (const url of ['http://localhost:5190/', 'http://localhost:5190/story/raju']) {
  for (const [w, h] of [[390, 844], [768, 1024], [1440, 900]]) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 })
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await new Promise((r) => setTimeout(r, 2000))
    const r = await page.evaluate(() => {
      const de = document.documentElement
      const over = de.scrollWidth - de.clientWidth
      const wide = over > 0 ? [...document.querySelectorAll('body *')]
        .filter((e) => e.getBoundingClientRect().right > de.clientWidth + 1)
        .slice(0, 4).map((e) => e.tagName + '.' + String(e.className).slice(0, 40)) : []
      return { over, wide }
    })
    console.log(`  ${url.replace('http://localhost:5190', '') || '/'}`.padEnd(14), `${w}px`.padStart(6), ' overflow', r.over, r.over === 0 ? 'OK' : 'BAD ' + r.wide.join(' | '))
    if (r.over !== 0) bad.push(`${url} @${w}: ${r.over}px`)
    await page.close()
  }
}

// Keyboard: walk the first dozen stops from a cold load and confirm each one
// is named and visibly ringed.
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:5190/story/raju', { waitUntil: 'networkidle2' })
await page.evaluate(() => document.fonts.ready)
console.log('\n  tab order from a cold load:')
for (let i = 0; i < 10; i++) {
  await page.keyboard.press('Tab')
  const a = await page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return null
    const s = getComputedStyle(el)
    return {
      tag: el.tagName,
      name: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44),
      ring: s.outlineStyle !== 'none' && s.outlineWidth !== '0px',
      cursor: s.cursor,
    }
  })
  if (!a) { console.log(`   ${i + 1}. —`); continue }
  console.log(`   ${String(i + 1).padStart(2)}. ${a.tag.padEnd(6)} ${a.ring ? 'ring' : 'NO RING'}  cursor:${a.cursor.padEnd(9)} ${a.name || '(unnamed)'}`)
  if (!a.ring) bad.push('no focus ring on ' + a.tag + ' ' + a.name)
  if (!a.name) bad.push('unnamed focus stop: ' + a.tag)
}
await browser.close()
console.log('\n' + (bad.length ? 'PROBLEMS:\n  ' + bad.join('\n  ') : 'no overflow, every focus stop named and ringed'))
