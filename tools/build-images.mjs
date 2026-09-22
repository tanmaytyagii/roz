// Grades and encodes the selected frames into AVIF/WebP responsive sets.
// One grade across every frame so the photography reads as a single body of work.
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = path.resolve('.imgcache')
const OUT = path.resolve('public/frames')
const DATA = path.resolve('src/data/frames.generated.ts')

const R = { wide: 16 / 9, film: 1.85, land: 3 / 2, port: 4 / 5, tall: 3 / 4 }

// Frames that go full-bleed are re-cropped for portrait screens rather than
// squeezed: [id, aspect, focal]. Without this the subject falls out of frame.
const MOBILE = {
  dawn:     [R.tall, [0.24, 0.52]],
  kiln:     [R.tall, [0.35, 0.5]],
  chai:     [R.tall, [0.38, 0.5]],
  raju:     [R.tall, [0.5, 0.42]],
  imran:    [R.tall, [0.36, 0.5]],
  asha:     [R.tall, [0.33, 0.5]],
  arjun:    [R.tall, [0.45, 0.55]],
  // Raju — every frame that goes full-bleed inside the story.
  'rj-open':  [R.tall, [0.5, 0.44]],
  'rj-h1':    [R.tall, [0.4, 0.52]],
  'rj-h2':    [R.tall, [0.55, 0.55]],
  'rj-h3':    [R.tall, [0.5, 0.5]],
  'rj-h4':    [R.tall, [0.5, 0.5]],
  'rj-h5':    [R.tall, [0.55, 0.5]],
  'rj-h6':    [R.tall, [0.5, 0.52]],
  'rj-h7':    [R.tall, [0.42, 0.56]],
  'rj-dream': [R.tall, [0.5, 0.52]],
}
const MOBILE_WIDTHS = [480, 760, 1000]

// Where the hosting account is not the photographer, credit the photographer.
const CREDIT_OVERRIDE = { raju: 'Shubhodeep Roy / IAPB' }

// [id, source, aspect, widths, focal?] — focal is a 0..1 point in the source
// that the crop is centred on, for the frames where attention-cropping misreads
// the subject.
const PICKS = [
  ['dawn',        'bleed-dawn/00', R.wide, [1280, 1920, 2400]],
  ['kiln',        'r-mason/03',    R.wide, [1280, 1920, 2400]],
  ['chai',        'bleed-chai/08', R.wide, [1280, 1920, 2400]],
  // Story plates — format chosen per photograph, not per template.
  ['raju',        'r-kiln/00',     R.land, [900, 1400, 1800], [0.5, 0.46]],
  ['shanti',      'shanti/05',     R.port, [600, 900, 1200], [0.41, 0.5]],
  ['imran',       'bleed-auto/02', R.land, [900, 1400, 1800]],
  ['meena',       'meena/09',      R.port, [600, 900, 1200, 1500], [0.56, 0.5]],
  ['ramesh',      'ramesh/04',     R.port, [600, 900, 1200], [0.58, 0.46]],
  ['asha',        'asha/13',       R.film, [900, 1400, 1800]],
  ['arjun',       'arjun/04',      R.land, [900, 1400, 1800]],
  // Interstitials.
  ['mist',        'bleed-dawn/02', R.land, [720, 1100]],
  ['scaffold',    'raju/12',       R.land, [720, 1100]],
  ['inside-auto', 'r-auto-pov/05', R.land, [720, 1100]],
  ['machine',     'r-tailor/00',   R.land, [720, 1100]],
  ['wet-road',    'bleed-night/02', R.land, [720, 1100]],
  ['ghat',        'bleed-dawn/08', R.land, [720, 1100, 1440]],

  // ── Raju, the mason — chapter two ──────────────────────────────────────
  // The opening is the same negative as the homepage spread, re-cropped wide:
  // arriving on the story should feel like walking into the frame you clicked.
  ['rj-open',  'r-kiln/00',      R.wide, [1280, 1920], [0.5, 0.44]],
  // The day, hour by hour. Cinemascope, because each one is a single shot.
  ['rj-h1',    'bleed-dawn/03',  R.film, [1280, 1920], [0.44, 0.54]],
  ['rj-h2',    'hero/05',        R.film, [1280, 1920], [0.52, 0.56]],
  ['rj-h3',    'hero/11',        R.film, [1280, 1920], [0.5, 0.5]],
  ['rj-h4',    'bleed-chai/14',  R.film, [1280, 1920], [0.5, 0.5]],
  ['rj-h5',    'rj-dust/05',     R.film, [1280, 1920], [0.55, 0.5]],
  ['rj-h6',    'hero/08',        R.film, [1280, 1920], [0.5, 0.52]],
  ['rj-h7',    'rj-0512/07',     R.film, [1280, 1920], [0.46, 0.54]],
  // The work. Six details, deliberately six different formats — a montage,
  // not a grid.
  ['rj-w1',    'raju/03',        R.port, [600, 900, 1200]],
  ['rj-w2',    'r-mason/00',     R.land, [720, 1100]],
  ['rj-w3',    'rj-hands/01',    R.land, [720, 1100]],
  ['rj-w4',    'rj-hammer/07',   R.land, [720, 1100]],
  ['rj-w5',    'hero/09',        R.film, [900, 1400]],
  ['rj-w6',    'hero/12',        R.port, [600, 900, 1200]],
  // The objects. One shape for all five — a specimen sheet reads as a set.
  ['rj-o1',    'rj-tools/04',    1, [480, 720, 960], [0.5, 0.48]],
  ['rj-o2',    'rj-tiffin/05',   1, [480, 720, 960], [0.46, 0.46]],
  ['rj-o3',    'rj-phone/08',    1, [480, 720, 960], [0.5, 0.5]],
  ['rj-o4',    'rj-gloves/02',   1, [480, 720, 960], [0.5, 0.55]],
  ['rj-o5',    'bleed-chai/10',  1, [480, 720, 960], [0.5, 0.45]],
  // The dream: a man on a mountain of sand, in front of the building he is
  // putting up, which he will not live in.
  ['rj-dream', 'r-mason/04',     R.wide, [1280, 1920], [0.5, 0.52]],
]

// The grade: pull saturation back, warm the highlights, deepen the blacks but
// stop short of crushing them. Per-channel curves — .tint() would strip the
// chroma out entirely and leave sepia. Same numbers on every frame.
const grade = (p) => p
  .modulate({ saturation: 0.82 })
  .linear([1.12, 1.07, 0.99], [-9, -10, -8])
  .gamma(1.03)

await fs.rm(OUT, { recursive: true, force: true })
await fs.mkdir(OUT, { recursive: true })
const manifest = []

for (const [id, src, aspect, widths, focal] of PICKS) {
  const file = path.join(SRC, `${src}.jpg`)
  const meta = await sharp(file).metadata()

  // A focal crop is applied before the resize so the point stays put at every width.
  const boxFor = (ratio, f) => {
    if (!f) return null
    const srcAspect = meta.width / meta.height
    const cw = srcAspect > ratio ? Math.round(meta.height * ratio) : meta.width
    const ch = srcAspect > ratio ? meta.height : Math.round(meta.width / ratio)
    const clamp = (v, max) => Math.max(0, Math.min(max, Math.round(v)))
    return { left: clamp(f[0] * meta.width - cw / 2, meta.width - cw),
             top: clamp(f[1] * meta.height - ch / 2, meta.height - ch), width: cw, height: ch }
  }

  const encode = async (suffix, ratio, f, wants) => {
    const box = boxFor(ratio, f)
    const src = () => (box ? sharp(file).rotate().extract(box) : sharp(file).rotate())
    const nat = Math.min(box?.width ?? meta.width, Math.round((box?.height ?? meta.height) * ratio))
    const hh = (w) => Math.round(w / ratio)
    const got = []
    for (const w of wants) {
      if (got.length && w > nat * 2.1) continue // never push past a 2.1x upscale
      const up = w / nat
      let pipe = grade(src().resize(w, hh(w), { fit: 'cover', position: sharp.strategy.attention, kernel: 'lanczos3' }))
      // Upscaled frames need their micro-contrast rebuilt or they read as mush.
      if (up > 1.15) pipe = pipe.sharpen({ sigma: 0.7 + Math.min(up - 1, 1) * 0.5, m1: 0.4, m2: 0.7 })
      await pipe.clone().avif({ quality: 50, effort: 7 }).toFile(path.join(OUT, `${id}${suffix}-${w}.avif`))
      await pipe.clone().webp({ quality: 72, effort: 6 }).toFile(path.join(OUT, `${id}${suffix}-${w}.webp`))
      got.push(w)
    }
    const lq = await grade(src().resize(20, Math.max(1, hh(20)), { fit: 'cover', position: sharp.strategy.attention }))
      .blur(1).webp({ quality: 30 }).toBuffer()
    return { widths: got, aspect: Number(ratio.toFixed(4)), lqip: `data:image/webp;base64,${lq.toString('base64')}` }
  }

  const main = await encode('', aspect, focal, widths)
  const out = main.widths
  const lqipStr = main.lqip
  const mob = MOBILE[id] ? await encode('-p', MOBILE[id][0], MOBILE[id][1], MOBILE_WIDTHS) : null

  const all = JSON.parse(await fs.readFile(path.join(SRC, path.dirname(src), 'meta.json'), 'utf8'))
  const rec = all.find((m) => m.file === `${path.basename(src)}.jpg`)

  manifest.push({
    id, widths: out, aspect: Number(aspect.toFixed(4)), lqip: lqipStr,
    mobile: mob,
    credit: rec
      ? { creator: CREDIT_OVERRIDE[id] ?? rec.creator ?? 'Unknown', license: `${rec.license.toUpperCase()} ${rec.license_version}`, licenseUrl: rec.license_url, source: rec.landing }
      : null,
  })
  console.log(`${id.padEnd(12)} ${out.join('/').padEnd(18)}${mob ? ' +portrait ' + mob.widths.join('/') : ''}`)
}

const ts = `// AUTO-GENERATED by tools/build-images.mjs — do not edit by hand.
export type Frame = {
  id: string
  widths: number[]
  /** width / height */
  aspect: number
  /** inlined 20px WebP, used as the background under the real frame */
  lqip: string
  /** portrait re-crop, served to narrow screens instead of squeezing the wide one */
  mobile: { widths: number[]; aspect: number; lqip: string } | null
  credit: { creator: string; license: string; licenseUrl: string; source: string } | null
}

export const FRAMES = ${JSON.stringify(Object.fromEntries(manifest.map((m) => [m.id, m])), null, 2)} satisfies Record<string, Frame>

export type FrameId = keyof typeof FRAMES
`
await fs.mkdir(path.dirname(DATA), { recursive: true })
await fs.writeFile(DATA, ts)
console.log('\nwrote', path.relative(process.cwd(), DATA))
