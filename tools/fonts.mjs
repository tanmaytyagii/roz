import fs from 'node:fs/promises'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const REQ = [
  ['instrument-serif',      'Instrument+Serif:ital@0;1',                  ['latin']],
  ['archivo',               'Archivo:wght@400..600',                      ['latin']],
  ['dm-mono',               'DM+Mono:wght@400',                           ['latin']],
  ['tiro-devanagari-hindi', 'Tiro+Devanagari+Hindi:ital@0;1',             ['devanagari', 'latin']],
]
for (const [name, spec, subsets] of REQ) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${spec}&display=swap`, { headers: { 'User-Agent': UA } })).text()
  const blocks = css.split('/*').slice(1)
  for (const b of blocks) {
    const subset = b.slice(0, b.indexOf('*/')).trim()
    if (!subsets.includes(subset)) continue
    const url = b.match(/url\((https:[^)]+\.woff2)\)/)?.[1]
    if (!url) continue
    const ital = /font-style:\s*italic/.test(b)
    const file = `${name}${ital ? '-italic' : ''}-${subset}.woff2`
    const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer())
    await fs.writeFile(`public/fonts/${file}`, buf)
    console.log(file.padEnd(44), (buf.length / 1024).toFixed(1) + 'kb')
  }
}
