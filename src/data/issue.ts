import { STORIES, type Story } from './stories'
import { DOCS_IN_ORDER, STORY_DOCS, framesOf, statusOf, type StoryDoc } from './story'
import { PLACES_BY_STORY } from './places'
import { SOUNDSCAPES } from './soundscapes'
import { FRAGMENTS, SHEETS } from './archive'
import { NOTES, type Note } from './notes'
import { relationFor } from './relations'
import { listed } from '../lib/words'

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

/** The people whose documents are not built yet, in the order the issue lists them. */
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

/**
 * The front matter: what the issue is, counted, before its contents. Read by
 * the cover of the contents page and by the colophon at the back, so the two
 * ends of the issue can never disagree with each other.
 */
export const FRONT_MATTER = {
  readable: available,
  unfinished: IN_PRODUCTION.length,
  subjects,
  places: towns,
  photographs,
  recordings,
  notes: NOTES.length,
  fragments: FRAGMENTS.length,
}

/* ── What each document is, as its contents entry sets it ─────────────── */

const plateOf = (frame: string) => SHEETS.flatMap((s) => s.plates).find((p) => p.id === frame)

/** Whether a field note concerns a document: its person, a chapter, or material filed under it. */
const concerns = (note: Note, slug: string) =>
  note.about.some((r) => {
    if (r.kind === 'subject' || r.kind === 'chapter') return r.slug === slug
    if (r.kind === 'photograph') return plateOf(r.frame)?.subject?.slug === slug
    if (r.kind === 'recording') return SOUNDSCAPES.find((s) => s.id === r.id)?.story.slug === slug
    return false
  })

export type DocumentFacts = {
  /**
   * The photographs the document itself holds — the same count its field
   * note gives. A portrait used only on the front and the Subjects sheet is
   * not one of them.
   */
  photographs: number
  recordings: number
  notes: Note[]
  /** The proof sheets its material is filed on, with how much of it is on each. */
  filed: { id: string; title: string; plates: number }[]
}

/** What a document holds, read off the registries that already hold it. */
export const factsFor = (slug: string): DocumentFacts => {
  const rel = relationFor(slug)
  const doc = STORY_DOCS[slug]
  return {
    photographs: doc ? framesOf(doc).length : (rel?.frames ?? 0),
    recordings: rel?.sounds.length ?? 0,
    notes: NOTES.filter((n) => concerns(n, slug)),
    // The portraits sheet holds everybody, so it says nothing about any one document.
    filed: SHEETS.filter((s) => s.id !== 'subjects')
      .map((s) => ({ id: s.id, title: s.title, plates: s.plates.filter((p) => p.subject?.slug === slug).length }))
      .filter((s) => s.plates > 0),
  }
}

/**
 * The back matter, part by part, in the order the field archive lays it out —
 * with the section number each part carries there. The archive's own
 * contents are read from this, so the list and the page cannot drift apart.
 */
export const BACK_MATTER: { id: string; n: number; title: string; tally?: string }[] = (() => {
  const parts: { id: string; title: string; tally?: string }[] = [
    ...SHEETS.map((s) => ({ id: s.id, title: s.title, tally: `${pad(s.plates.length)} plates` })),
    ...(NOTES.length ? [{ id: 'field-notes', title: 'Field notes', tally: `${pad(NOTES.length)} notes` }] : []),
    { id: 'recordings', title: 'Recordings', tally: `${pad(recordings)} recordings` },
    { id: 'fragments', title: 'Fragments', tally: `${pad(FRAGMENTS.length)} lines` },
    // What remains open, after everything that has been collected and filed.
    ...(IN_PRODUCTION.length
      ? [{ id: 'unfinished', title: 'Unfinished documents', tally: `${pad(IN_PRODUCTION.length)} open` }]
      : []),
    { id: 'colophon', title: 'Colophon' },
  ]
  // The archive's first section is its own opening; the parts count on from two.
  return parts.map((p, i) => ({ ...p, n: i + 2 }))
})()

/* ── The documents ──────────────────────────────────────────────────── */

/** The ways into the issue that are not themselves a story. */
export const INDEXES: Document[] = [
  {
    id: 'people',
    path: '/people',
    title: 'People',
    deva: 'लोग',
    line: 'Everyone in the issue, and whose day you can read today.',
    tally: `${pad(subjects)} subjects · ${pad(available)} available`,
  },
  {
    id: 'places',
    path: '/places',
    title: 'Places',
    deva: 'जगहें',
    line: 'A drawn map of the country, marked once for each town a story is set in.',
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
    line: 'Every photograph the issue holds, as proof sheets, and the field notes kept beside them.',
    tally: `${pad(photographs)} plates · ${pad(NOTES.length)} notes`,
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
    title: 'Filing',
    deva: 'अनुक्रम',
    line: 'The archive is filed by document and by kind. Filing it by city, trade, hour and theme is not done.',
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
  `${pad(subjects - available)} of the ${pad(subjects)} people in it have no document yet — a photograph on file and a premise each, and nothing more.`
