import { STORIES, type Story } from './stories'
import { statusOf, type StoryStatus } from './story'

/**
 * WHERE THE STORIES ARE.
 *
 * Places are not a second dataset. They are `STORIES` grouped by the `place`
 * each story already carries, with their counts and their state read from the
 * story registry — so registering the next document moves its location from
 * *in production* to *available*, and a second story in a town it already has
 * raises the count, without anything here being edited.
 *
 * The one thing that cannot be derived is where a town actually is. That is
 * the table below, and it is the whole of the new data in this file.
 */

type Coords = {
  lat: number
  lng: number
  /** The form the map uses. A region gets an abbreviation; a city keeps its name. */
  short: string
  /** Which side of the marker the label sits on, so neighbours do not collide. */
  side?: 'left' | 'right'
}

/**
 * Decimal degrees. Cities are their own coordinates; Western Uttar Pradesh is
 * a region rather than a point, so it sits at roughly the middle of the
 * doab — far enough from Delhi to be a separate mark at map scale, which it
 * also genuinely is.
 */
const COORDS: Record<string, Coords> = {
  'Western Uttar Pradesh': { lat: 28.7, lng: 78.6, short: 'Western U.P.', side: 'right' },
  Delhi: { lat: 28.61, lng: 77.21, short: 'Delhi', side: 'left' },
  Jaipur: { lat: 26.91, lng: 75.79, short: 'Jaipur', side: 'left' },
  Lucknow: { lat: 26.85, lng: 80.95, short: 'Lucknow', side: 'right' },
  Varanasi: { lat: 25.32, lng: 82.97, short: 'Varanasi', side: 'right' },
  Kolkata: { lat: 22.57, lng: 88.36, short: 'Kolkata', side: 'right' },
  Mumbai: { lat: 19.08, lng: 72.88, short: 'Mumbai', side: 'left' },
}

export type Place = {
  /** The exact string the stories carry, and the key everything else uses. */
  name: string
  short: string
  lat: number
  lng: number
  side: 'left' | 'right'
  /** Projected into map units, so the marker and the coastline share a space. */
  x: number
  y: number
  stories: Story[]
  /** Available if any story here can be read today. */
  status: StoryStatus
}

/* ── Projection ──────────────────────────────────────────────────────────
   Equirectangular, with longitude squeezed by the cosine of the middle of
   the country so the shape is not stretched. It is the simplest projection
   that keeps India looking like India at this size, and it is one line, which
   is the point — a map this small does not need a library.
   ──────────────────────────────────────────────────────────────────────── */
const MID_LAT = (22 * Math.PI) / 180
const KX = Math.cos(MID_LAT)

const project = (lat: number, lng: number) => ({ x: lng * KX, y: -lat })

/**
 * The coastline and the land borders, walked clockwise from the western tip
 * of Kutch. Sixty-odd points: enough for the country to be recognisable, few
 * enough that it reads as a drawing rather than a survey. The concavities are
 * the ones that matter — the two Gujarat gulfs, the notch Nepal makes in the
 * north, and the one Bangladesh makes in the east, which is where Kolkata sits.
 */
const OUTLINE: [number, number][] = [
  // Kutch and the Thar, north along the Pakistan border.
  [23.7, 68.2], [24.3, 68.8], [24.7, 71.0], [25.3, 70.6], [26.6, 70.1],
  [28.0, 70.2], [29.5, 73.0], [30.5, 74.5], [32.3, 74.6], [33.3, 74.1],
  // Kashmir, Ladakh, and the high border east.
  [34.6, 74.0], [35.5, 76.5], [34.6, 78.3], [33.0, 79.2], [31.8, 78.8],
  [31.0, 79.9], [30.3, 81.0],
  // Dipping south around Nepal, then the neck at Siliguri — narrow, because
  // it is: twenty-odd kilometres between Nepal and Bangladesh.
  [28.6, 80.2], [27.4, 83.3], [26.4, 85.5], [26.6, 88.1],
  [27.2, 88.2], [27.9, 88.8], [27.2, 89.6], [26.8, 90.5], [26.9, 92.0],
  // Arunachal, and the easternmost point of the country.
  [27.8, 92.1], [29.0, 94.5], [28.5, 96.3], [27.7, 97.4],
  [26.5, 96.2], [25.4, 95.2], [24.2, 94.3], [22.5, 93.3], [21.9, 92.6],
  // Back up and around Bangladesh: Tripura, the Meghalaya scarp, then down
  // the western side into the Sundarbans, which is where Kolkata sits.
  [23.2, 91.3], [24.2, 91.6], [25.1, 90.4], [25.2, 89.8], [26.1, 89.8],
  [26.2, 88.6], [25.1, 88.2], [24.2, 88.1], [23.0, 88.8], [21.7, 88.2],
  // The east coast, down to the tip.
  [21.5, 87.2], [20.3, 86.8], [19.3, 85.1], [17.7, 83.3], [16.3, 81.4],
  [15.8, 80.4], [14.0, 80.2], [13.1, 80.3], [11.5, 79.8], [10.3, 79.9],
  [9.2, 79.2], [8.9, 78.1], [8.08, 77.55],
  // The west coast, back up to the two Gujarat gulfs.
  [8.5, 76.9], [9.9, 76.2], [11.2, 75.7], [12.9, 74.8], [14.8, 74.1],
  [15.5, 73.8], [16.9, 73.3], [18.9, 72.8], [20.1, 72.7], [21.0, 72.6],
  [21.7, 72.5], [22.3, 72.9], [22.2, 72.2], [21.1, 71.0], [20.8, 70.2],
  [21.7, 69.2], [22.5, 69.1], [22.4, 70.0], [22.8, 70.5], [23.0, 69.6],
  [23.6, 68.6],
]

const points = OUTLINE.map(([lat, lng]) => project(lat, lng))
const PAD = 0.6
const minX = Math.min(...points.map((p) => p.x)) - PAD
const maxX = Math.max(...points.map((p) => p.x)) + PAD
const minY = Math.min(...points.map((p) => p.y)) - PAD
const maxY = Math.max(...points.map((p) => p.y)) + PAD

/**
 * The boundary as a closed curve rather than a polygon. Straight segments
 * between eighty coarse points read as a chart; the same points run through a
 * Catmull-Rom spline read as a line somebody drew, which is the register this
 * map wants. It also stops the north-east — the part with no stories in it and
 * the most complicated coastline — from being the loudest thing on the page.
 */
const smooth = (pts: { x: number; y: number }[]) => {
  const at = (i: number) => pts[(i + pts.length) % pts.length]
  const n = (v: number) => v.toFixed(2)
  let d = `M${n(at(0).x)},${n(at(0).y)}`
  for (let i = 0; i < pts.length; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C${n(c1.x)},${n(c1.y)} ${n(c2.x)},${n(c2.y)} ${n(p2.x)},${n(p2.y)}`
  }
  return d + ' Z'
}

/** The drawing's own coordinate space. Markers are placed as a share of it. */
export const MAP = {
  width: Number((maxX - minX).toFixed(3)),
  height: Number((maxY - minY).toFixed(3)),
  /** `d` for the coastline, closed. */
  path: smooth(points.map((p) => ({ x: p.x - minX, y: p.y - minY }))),
}

const place = (lat: number, lng: number) => {
  const p = project(lat, lng)
  return { x: p.x - minX, y: p.y - minY }
}

/**
 * Every place ROZ has a story in, in the order the stories were photographed.
 * Derived on load — there is no list of towns anywhere in this file.
 */
export const PLACES_BY_STORY: Place[] = (() => {
  const order: string[] = []
  const grouped = new Map<string, Story[]>()
  for (const s of STORIES) {
    if (!grouped.has(s.place)) {
      grouped.set(s.place, [])
      order.push(s.place)
    }
    grouped.get(s.place)!.push(s)
  }

  return order.flatMap((name) => {
    const coords = COORDS[name]
    const stories = grouped.get(name)!
    // A story in a town with no coordinates is a data gap, not a crash: it
    // keeps its place in the written index and sits out of the drawing.
    if (!coords) return []
    return [
      {
        name,
        short: coords.short,
        lat: coords.lat,
        lng: coords.lng,
        side: coords.side ?? 'right',
        ...place(coords.lat, coords.lng),
        stories,
        status: stories.some((s) => statusOf(s.slug) === 'available')
          ? ('available' as const)
          : ('in-production' as const),
      },
    ]
  })
})()

/** Places carrying a story but no coordinates — listed, not drawn. */
export const PLACES_OFF_MAP: string[] = Array.from(new Set(STORIES.map((s) => s.place))).filter((n) => !COORDS[n])

export const findPlace = (name: string) => PLACES_BY_STORY.find((p) => p.name === name)
