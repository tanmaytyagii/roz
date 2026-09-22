import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const slots = process.argv.slice(2)
const CELL = 300, COLS = 4
for (const slot of slots) {
  const dir = path.resolve('.imgcache', slot)
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.jpg')).sort()
  if (!files.length) { console.log(slot, 'empty'); continue }
  const rows = Math.ceil(files.length / COLS)
  const canvas = sharp({ create: { width: COLS * CELL, height: rows * (CELL + 22), channels: 3, background: '#111' } })
  const comps = []
  for (let i = 0; i < files.length; i++) {
    const x = (i % COLS) * CELL, y = Math.floor(i / COLS) * (CELL + 22)
    try {
      const b = await sharp(path.join(dir, files[i])).resize(CELL, CELL, { fit: 'cover' }).toBuffer()
      comps.push({ input: b, left: x, top: y + 22 })
    } catch {}
    const label = Buffer.from(`<svg width="${CELL}" height="22"><rect width="${CELL}" height="22" fill="#000"/><text x="6" y="16" font-family="monospace" font-size="14" fill="#f5c">${path.basename(files[i], '.jpg')}</text></svg>`)
    comps.push({ input: label, left: x, top: y })
  }
  await canvas.composite(comps).jpeg({ quality: 76 }).toFile(path.resolve('.imgcache', `sheet-${slot}.jpg`))
  console.log('sheet-' + slot, files.length)
}
