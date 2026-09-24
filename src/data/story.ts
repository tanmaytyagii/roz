import type { FrameId } from './frames.generated'
import type { SoundId } from './sounds.generated'
import { RAJU } from './story-raju'
import { SHANTI } from './story-shanti'

/**
 * A STORY DOCUMENT.
 *
 * Everything the story experience renders comes from one of these. The page is
 * a reader for these shapes, not a page about anybody — adding the next person
 * is a new file next to `story-raju.ts`, a line in the registry at the bottom,
 * and their frames in `tools/build-images.mjs`. No component is copied.
 *
 * There is more than one grammar, because not every subject's material can
 * carry the same form. Raju's is a *day*: seven photographs, seven hours. A
 * *sequence* is a document assembled from a few kinds of chapter — a plate, a
 * stand-in, one photograph read closely, a transcript, a last line — in
 * whatever order the material supports. The next document picks a grammar; it
 * does not get a new one.
 *
 * As with `stories.ts`: every word below is written. See the note there.
 */

/** One hour of the day. Seven of them make the timeline. */
export type Hour = {
  /** 24-hour clock, printed as given. Also what the time rail counts through. */
  time: string
  /** The chapter line. One clause, set in caps. */
  line: string
  deva: string
  /** A second beat, set small underneath. Never more than a sentence. */
  note: string
  frame: FrameId
  alt: string
  /**
   * The light at this hour, as two stops of a gradient laid over the frame.
   * This is what makes the scroll feel like a day passing rather than a list
   * of photographs.
   */
  light: [string, string]
}

/** One close-up in §The work. `tall` details set the rhythm of the montage. */
export type Detail = {
  label: string
  deva: string
  note: string
  frame: FrameId
  alt: string
  tall?: boolean
}

/** One object in §The objects. */
export type Artifact = {
  name: string
  deva: string
  note: string
  frame: FrameId
  alt: string
}

/** One quote in §The words. */
export type Utterance = {
  deva: string
  gloss: string
  where: string
}

/** One ambient recording. Nothing here is ever played without being asked for. */
export type Track = {
  id: SoundId
  label: string
  deva: string
  at: string
}

/** What every document carries, whatever its grammar. */
type DocBase = {
  /** Must match a `slug` in `stories.ts` — that record supplies name, age, place. */
  slug: string
  /**
   * Its number in the issue. An identity, not a count: it is given once, in
   * the order documents were made, and never changes after — which is what
   * lets a chapter id carry it.
   */
  number: number
  /** What the contents page calls it. */
  title: string
  /** One sentence: what this document is. */
  premise: string
  /** The line the story opens on. */
  epigraph: { deva: string; gloss: string }
  /** The note at the foot, in the publication's voice rather than the story's. */
  note: string
}

/** A day, told as its hours, then its work, objects, sound, words and dream. */
export type DayDoc = DocBase & {
  grammar: 'day'
  cover: { frame: FrameId; alt: string }
  day: Hour[]
  work: { lede: string; details: Detail[] }
  objects: { lede: string; items: Artifact[] }
  sound: { lede: string; tracks: Track[] }
  words: Utterance[]
  dream: { deva: string; gloss: string; frame: FrameId; alt: string }
}

/**
 * A chapter's address: `document-02/corner`. Written into the data, never
 * derived from a heading, so rewording a chapter cannot break a link to it —
 * from the archive, from another document, or from somebody's bookmark.
 */
export type ChapterId = `document-${string}/${string}`

/** A photograph given the whole screen, and one line. */
export type PlateChapter = {
  kind: 'plate'
  id: ChapterId
  time?: string
  line: string
  deva: string
  note?: string
  frame: FrameId
  alt: string
  /** Where the photograph is from, when its own record says so. */
  placed?: string
  /** object-position, for a frame whose subject sits away from the centre. */
  focus?: string
}

/**
 * A photograph that stands in for something nobody photographed. It is never
 * given the whole screen, and it always says what it is not.
 */
export type StandInChapter = {
  kind: 'stand-in'
  id: ChapterId
  time?: string
  line: string
  deva: string
  frame: FrameId
  alt: string
  provenance: string
}

/**
 * One place in a photograph, marked the way a picture editor marks a contact
 * sheet. `box` is x, y, width and height as percentages of the frame as it is
 * encoded — the reader never re-crops it, so the numbers always land.
 */
export type Mark = {
  time: string
  label: string
  deva: string
  note: string
  box: [number, number, number, number]
}

/** One photograph, held still while the day is read across it. */
export type MarkedChapter = {
  kind: 'marked'
  id: ChapterId
  title: string
  deva: string
  lede: string
  aside: string
  frame: FrameId
  alt: string
  marks: Mark[]
}

/** A few things said, set as a transcript. */
export type WordsChapter = {
  kind: 'words'
  id: ChapterId
  title: string
  lede: string
  aside: string
  words: Utterance[]
}

/** The last line, and nothing else on the screen with it. */
export type CloseChapter = {
  kind: 'close'
  id: ChapterId
  time?: string
  deva: string
  gloss: string
}

export type Chapter = PlateChapter | StandInChapter | MarkedChapter | WordsChapter | CloseChapter

export type SequenceDoc = DocBase & {
  grammar: 'sequence'
  /** The document's own id, and the prefix every chapter id carries. */
  id: `document-${string}`
  chapters: Chapter[]
}

export type StoryDoc = DayDoc | SequenceDoc

/** Every story with a built experience. The router reads this. */
export const STORY_DOCS: Record<string, StoryDoc> = {
  [RAJU.slug]: RAJU,
  [SHANTI.slug]: SHANTI,
}

export const getStoryDoc = (slug: string): StoryDoc | undefined => STORY_DOCS[slug]

/** In the order they were made, which is the order the issue lists them. */
export const DOCS_IN_ORDER: StoryDoc[] = Object.values(STORY_DOCS).sort((a, b) => a.number - b.number)

/**
 * A story is available when its document exists, and in production when it
 * does not. Nothing anywhere declares this by hand: writing the data file and
 * registering it above is what moves a person from one state to the other, on
 * the homepage, in the archive and at the foot of every other story at once.
 */
export type StoryStatus = 'available' | 'in-production'

export const statusOf = (slug: string): StoryStatus =>
  STORY_DOCS[slug] ? 'available' : 'in-production'

export const isAvailable = (slug: string) => statusOf(slug) === 'available'

/* ── Reading a document without knowing its grammar ─────────────────────
   The archive, the relationships and the sound index all need the same few
   facts from a document. These answer them for either shape, so nothing
   downstream has to switch on `grammar`. */

/** Every photograph the document carries, once each, in reading order. */
export const framesOf = (doc: StoryDoc): FrameId[] => {
  const ids: FrameId[] =
    doc.grammar === 'day'
      ? [
          doc.cover.frame,
          ...doc.day.map((h) => h.frame),
          ...doc.work.details.map((d) => d.frame),
          ...doc.objects.items.map((o) => o.frame),
          doc.dream.frame,
        ]
      : doc.chapters.flatMap((c) => ('frame' in c ? [c.frame] : []))
  return Array.from(new Set(ids))
}

/** The recordings a document lists. A sequence carries none until one is real. */
export const tracksOf = (doc: StoryDoc): Track[] => (doc.grammar === 'day' ? doc.sound.tracks : [])

/** What is said in the document, and where on the page it is said. */
export const wordsOf = (doc: StoryDoc): { words: Utterance[]; at: string } | undefined => {
  if (doc.grammar === 'day') return { words: doc.words, at: '#the-words' }
  const c = doc.chapters.find((x): x is WordsChapter => x.kind === 'words')
  return c ? { words: c.words, at: `#${c.id}` } : undefined
}

/** The line a document ends on. */
export const lastLineOf = (doc: StoryDoc): { deva: string; gloss: string; at: string } | undefined => {
  if (doc.grammar === 'day') return { deva: doc.dream.deva, gloss: doc.dream.gloss, at: '#the-dream' }
  const c = doc.chapters.find((x): x is CloseChapter => x.kind === 'close')
  return c ? { deva: c.deva, gloss: c.gloss, at: `#${c.id}` } : undefined
}

/** Chapters that open on a numbered rule. The rest are beats between them. */
export const isNumbered = (c: Chapter) => c.kind === 'marked' || c.kind === 'words'

/**
 * How many numbered chapters a document has, so whatever follows it — the way
 * out at the foot — counts on from there instead of from a fixed number.
 */
export const chapterCount = (doc: StoryDoc) => (doc.grammar === 'day' ? 5 : doc.chapters.filter(isNumbered).length)

/** Minutes past midnight, for the clock and the time rail. */
export const minutesOf = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** The inverse, so the rail can print a time that falls between two chapters. */
export const timeOf = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes))
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
