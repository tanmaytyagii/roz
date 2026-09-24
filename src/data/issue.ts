import { STORIES, type Story } from './stories'
import { DOCS_IN_ORDER, statusOf, type StoryDoc } from './story'
import { PLACES_BY_STORY } from './places'
import { SOUNDSCAPES } from './soundscapes'
import { SHEETS } from './archive'
import { inWords, listed } from '../lib/words'

/**
 * THE ISSUE.
 *
 * What ROZ currently consists of, and what it does not. Every tally below is
 * counted off the registries rather than written down, so the contents page,
 * the footer and the foot of each document can never disagree with each other
 * — or with the site — the way they had started to.
 *
 * It is also the reading order: which document comes first, which comes next,
 * and which number the next one to be finished will take. A document's
 * number is given in its own data file and never changes; everything here is
 * read from those numbers rather than from anybody's position in a list.
 */

export type Document = {
  id: string
  path: string
  title: string
  deva: string
  /** What the document is. One sentence. */
  line: string
  /** Counted, never typed. */
  tally: string
}

const pad = (n: number) => String(n).padStart(2, '0')

/* ── The reading order ──────────────────────────────────────────────── */

/** A document someone can read today, with the person it belongs to. */
export type Reading = {
  /** `01`, as it is set everywhere. */
  number: string
  doc: StoryDoc
  story: Story
  path: string
}

/** Every finished document, in the order they were made. */
export const READINGS: Reading[] = DOCS_IN_ORDER.flatMap((doc) => {
  const story = STORIES.find((s) => s.slug === doc.slug)
  return story ? [{ number: pad(doc.number), doc, story, path: `/story/${story.slug}` }] : []
})

export const readingFor = (slug: string) => READINGS.find((r) => r.story.slug === slug)

/** The people whose documents are not built yet, in the order they were photographed. */
export const IN_PRODUCTION: Story[] = STORIES.filter((s) => statusOf(s.slug) !== 'available')

/**
 * The number the next finished document will take. Nobody holds it yet — it
 * is not promised to any of the people in production, and it is never
 * printed next to one of their names.
 */
export const NEXT_NUMBER = pad(Math.max(0, ...DOCS_IN_ORDER.map((d) => d.number)) + 1)

/**
 * What an editor would put after this document. The one that follows it, if
 * there is one; otherwise the ones before it. Never itself, and never a
 * document that does not exist.
 */
export const turnFrom = (slug: string): { next: Reading[]; earlier: Reading[] } => {
  const here = readingFor(slug)
  const at = here ? Number(here.number) : 0
  return {
    next: READINGS.filter((r) => Number(r.number) > at),
    earlier: READINGS.filter((r) => Number(r.number) < at),
  }
}

/* ── The counts ─────────────────────────────────────────────────────── */

const subjects = STORIES.length
const available = READINGS.length
const towns = PLACES_BY_STORY.length
const recordings = SOUNDSCAPES.length
// Counted from the archive rather than restated, so the contents page cannot
// claim a number of plates the sheets do not actually lay out.
const photographs = SHEETS.reduce((n, s) => n + s.plates.length, 0)

/** The issue in six numbers, in the order the masthead sets them. */
export const MASTHEAD: { count: number; label: string }[] = [
  { count: subjects, label: 'subjects' },
  { count: towns, label: 'places' },
  { count: recordings, label: 'recordings' },
  { count: photographs, label: 'photographs' },
  { count: available, label: available === 1 ? 'document to read' : 'documents to read' },
  { count: IN_PRODUCTION.length, label: 'unfinished' },
]

/* ── The documents ──────────────────────────────────────────────────── */

/** The ways into the issue that are not themselves a story. */
export const INDEXES: Document[] = [
  {
    id: 'people',
    path: '/people',
    title: 'People',
    deva: 'लोग',
    line: 'The archive — everyone ROZ has photographed, and whose day you can read today.',
    tally: `${pad(subjects)} subjects · ${pad(available)} available`,
  },
  {
    id: 'places',
    path: '/places',
    title: 'Places',
    deva: 'जगहें',
    line: 'A drawn map of the country, marked once for each town a story was made in.',
    tally: `${pad(towns)} places`,
  },
  {
    id: 'sounds',
    path: '/sounds',
    title: 'Sounds',
    deva: 'आवाज़ें',
    line: 'Field recordings standing in for the hours of a day. Nothing plays until you ask.',
    tally: `${pad(recordings)} recordings`,
  },
  {
    id: 'archive',
    path: '/archive',
    title: 'Field archive',
    deva: 'संग्रह',
    line: 'Every photograph the issue holds, as proof sheets — most of it never became a chapter.',
    tally: `${pad(photographs)} plates`,
  },
]

/** Everything that exists, in reading order: the indexes, then the documents. */
export const DOCUMENTS: Document[] = [
  ...INDEXES,
  ...READINGS.map(({ number, doc, story, path }) => ({
    id: `story-${story.slug}`,
    path,
    title: doc.title,
    deva: story.nameDeva,
    line: `Document ${number}. ${story.occupation.replace(/^The /, '')} in ${story.place}. ${doc.premise}`,
    tally: story.duration,
  })),
]

/** What is written and photographed but not built. Counted where it can be. */
export const UNBUILT: { title: string; deva: string; line: string; tally: string }[] = [
  {
    title: 'The other days',
    deva: 'बाकी दिन',
    line: `${inWords(subjects - available, true)} more people are in the archive with a photograph and a premise. Their hours are not written.`,
    tally: `${pad(subjects - available)} in production`,
  },
  {
    title: 'Filing',
    deva: 'अनुक्रम',
    line: 'The archive is laid out in the order the work was made. Filing it by city, trade, hour and theme is not.',
    tally: 'Not started',
  },
]

/** How many of the documents are stories, as distinct from the ways into them. */
export const READABLE = READINGS.length

/** One honest sentence for the footer, assembled from the same counts. */
export const STATUS_LINE =
  `Prototype. ${pad(DOCUMENTS.length)} documents: ` +
  listed(['the people', 'the map', 'the recordings', 'the field archive', ...READINGS.map(({ doc }) => doc.title)]) +
  '. ' +
  `${pad(subjects - available)} of the ${pad(subjects)} days are photographed and written but not yet built.`
