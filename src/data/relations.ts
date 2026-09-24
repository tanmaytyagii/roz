import { STORIES, type Story } from './stories'
import { STORY_DOCS, framesOf, statusOf, tracksOf, wordsOf, type StoryStatus } from './story'
import { PLACES_BY_STORY, type Place } from './places'
import { SOUNDSCAPES, type Soundscape } from './soundscapes'
import { HOLDINGS } from './archive'

/**
 * WHAT CONNECTS TO WHAT.
 *
 * Every relationship ROZ can honestly claim, derived from the registries that
 * already hold them: a person belongs to a town, a town holds people, a
 * recording stands in for an hour of somebody's day, and a day either exists
 * or does not. Nothing is asserted here that is not already written down
 * somewhere else, and no relationship is invented to fill a gap.
 *
 * The asymmetry is the point. Raju's document holds twenty photographs, seven
 * hours and four recordings; Shanti's holds three photographs and no sound at
 * all; the rest hold one photograph and a premise. Counting each honestly, in
 * the terms its own grammar uses, is what makes *in production* read as a
 * state of the work rather than as a missing feature.
 */

export type Holding = { label: string; count: number }

export type Relation = {
  story: Story
  status: StoryStatus
  /** The town, where one is on the drawing. */
  place: Place | undefined
  /** Recordings that stand in for an hour of this person's day. */
  sounds: Soundscape[]
  /** What the document actually contains, counted. */
  holdings: Holding[]
  /** Photographs the document carries, cover and dream included. */
  frames: number
}

const holdingsFor = (slug: string, portrait: Story['frame']): { holdings: Holding[]; frames: number } => {
  const doc = STORY_DOCS[slug]
  if (!doc) {
    // A premise, a portrait and a place. That is the whole of it, and saying
    // so plainly is better than leaving the row blank.
    return { holdings: [{ label: 'Photograph', count: 1 }, { label: 'Premise', count: 1 }], frames: 1 }
  }
  // The portrait counts once, whether or not the document also uses it.
  const frames = new Set([portrait, ...framesOf(doc)]).size
  if (doc.grammar === 'day') {
    return {
      holdings: [
        { label: 'Hours', count: doc.day.length },
        { label: 'Details', count: doc.work.details.length },
        { label: 'Objects', count: doc.objects.items.length },
        { label: 'Words', count: doc.words.length },
        { label: 'Recordings', count: tracksOf(doc).length },
      ],
      frames,
    }
  }
  const marks = doc.chapters.reduce((n, c) => n + (c.kind === 'marked' ? c.marks.length : 0), 0)
  return {
    holdings: [
      { label: 'Photographs', count: framesOf(doc).length },
      ...(marks ? [{ label: 'Marks', count: marks }] : []),
      { label: 'Words', count: wordsOf(doc)?.words.length ?? 0 },
    ],
    frames,
  }
}

export const relationFor = (slug: string): Relation | undefined => {
  const story = STORIES.find((s) => s.slug === slug)
  if (!story) return undefined
  const { holdings, frames } = holdingsFor(slug, story.frame)
  return {
    story,
    status: statusOf(slug),
    place: PLACES_BY_STORY.find((p) => p.name === story.place),
    sounds: SOUNDSCAPES.filter((s) => s.story.slug === slug),
    holdings,
    frames,
  }
}

export const RELATIONS: Relation[] = STORIES.flatMap((s) => {
  const r = relationFor(s.slug)
  return r ? [r] : []
})

/**
 * The edition. ROZ is one issue so far, which is a fact about the publication
 * rather than a claim about the world — and naming it that way is what makes
 * the unfinished half read as work in progress instead of as an empty site.
 */
export const ISSUE = {
  number: '01',
  /** Counted, so a second issue cannot inherit the first one's arithmetic. */
  get subjects() {
    return STORIES.length
  },
  get available() {
    return STORIES.filter((s) => statusOf(s.slug) === 'available').length
  },
  get towns() {
    return PLACES_BY_STORY.length
  },
  get recordings() {
    return SOUNDSCAPES.length
  },
  /**
   * Every photograph the issue holds — the same number the field archive lays
   * out, so the contents page and the archive can never disagree about it.
   */
  get frames() {
    return HOLDINGS.photographs
  },
}

/** `07` rather than `7`, everywhere a tally is set. */
export const tally = (n: number) => String(n).padStart(2, '0')
