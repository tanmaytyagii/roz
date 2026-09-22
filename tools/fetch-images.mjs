// Sources candidate documentary photographs from Openverse (CC-licensed aggregator).
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve('.imgcache')
const UA = 'ROZ-prototype/1.0 (editorial demo)'
const SLOTS = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))

const ratio = (r) => (r.width && r.height) ? r.width / r.height : null
const fits = (r, want) => {
  const a = ratio(r)
  if (!a) return false
  if (want === 'wide') return a >= 1.3
  if (want === 'tall') return a <= 0.9
  if (want === 'square') return a > 0.75 && a < 1.4
  return true
}

async function search(q, page = 1) {
  const url = new URL('https://api.openverse.org/v1/images/')
  url.searchParams.set('q', q)
  url.searchParams.set('page_size', '20')
  url.searchParams.set('page', String(page))
  url.searchParams.set('mature', 'false')
  // No-derivatives licences are unusable here: every frame is cropped and graded.
  url.searchParams.set('license', 'by,by-sa,cc0,pdm,by-nc,by-nc-sa')
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) })
    if (!r.ok) { console.error('  search', r.status, q); return [] }
    return (await r.json()).results ?? []
  } catch (e) { console.error('  search err', q, e.message); return [] }
}

for (const slot of SLOTS) {
  const dir = path.join(OUT, slot.id)
  await fs.mkdir(dir, { recursive: true })
  const seen = new Set(); const meta = []
  const MAX = slot.max ?? 14
  for (const q of slot.queries) {
    for (let page = 1; page <= 2 && meta.length < MAX; page++) {
      for (const r of await search(q, page)) {
        if (meta.length >= MAX || seen.has(r.id)) continue
        if ((r.width ?? 0) < (slot.minw ?? 1000)) continue
        if (slot.aspect && !fits(r, slot.aspect)) continue
        seen.add(r.id)
        meta.push({ id: r.id, title: r.title, url: r.url, creator: r.creator, creator_url: r.creator_url,
          license: r.license, license_version: r.license_version, license_url: r.license_url,
          source: r.source, landing: r.foreign_landing_url, width: r.width, height: r.height, query: q })
      }
    }
  }
  let i = 0
  for (const m of meta) {
    const f = path.join(dir, `${String(i).padStart(2, '0')}.jpg`)
    try {
      const r = await fetch(m.url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(40000) })
      if (!r.ok) continue
      const buf = Buffer.from(await r.arrayBuffer())
      if (buf.length < 30000) continue
      await fs.writeFile(f, buf); m.file = path.basename(f); i++
    } catch { /* skip */ }
  }
  console.log(`${slot.id}: ${i} downloaded (${meta.length} candidates)`)
  await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify(meta.filter(m => m.file), null, 2))
}
console.log('done')
