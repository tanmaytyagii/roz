// Contact sheet across several slots at once, so a whole section can be judged
// in one look instead of one sheet per slot.
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const [out, ...slots] = process.argv.slice(2)
const CELL = 240, LABEL = 20, COLS = 7
const comps = []
let row = 0
for (const slot of slots) {
  const dir = path.resolve('.imgcache', slot)
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.jpg')).sort()
  for (let i = 0; i < files.length; i++) {
    const col = i % COLS
    if (i > 0 && col === 0) row++
    const x = col * CELL, y = row * (CELL + LABEL)
    const b = await sharp(path.join(dir, files[i])).resize(CELL, CELL, { fit: 'cover' }).toBuffer()
    comps.push({ input: b, left: x, top: y + LABEL })
    const tag = `${slot}/${path.basename(files[i], '.jpg')}`
    comps.push({
      input: Buffer.from(`<svg width="${CELL}" height="${LABEL}"><rect width="${CELL}" height="${LABEL}" fill="#000"/><text x="4" y="15" font-family="monospace" font-size="15" fill="#ff4">${tag}</text></svg>`),
      left: x, top: y,
    })
  }
  row++
}
const h = row * (CELL + LABEL)
await sharp({ create: { width: COLS * CELL, height: h, channels: 3, background: '#111' } })
  .composite(comps).jpeg({ quality: 74 }).toFile(out)
console.log(out, COLS * CELL, h)
