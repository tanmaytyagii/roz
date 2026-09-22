import type { FrameId } from './frames.generated'
import type { SoundId } from './sounds.generated'
import { RAJU } from './story-raju'

/**
 * A STORY DOCUMENT.
 *
 * Everything the story experience renders comes from one of these. The page is
 * a reader for this shape, not a page about Raju — adding the next person is a
 * new file next to `story-raju.ts`, a line in the registry at the bottom, and
 * their frames in `tools/build-images.mjs`. No component is copied.
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

export type StoryDoc = {
  /** Must match a `slug` in `stories.ts` — that record supplies name, age, place. */
  slug: string
  cover: { frame: FrameId; alt: string }
  /** The line the story opens on. */
  epigraph: { deva: string; gloss: string }
  day: Hour[]
  work: { lede: string; details: Detail[] }
  objects: { lede: string; items: Artifact[] }
  sound: { lede: string; tracks: Track[] }
  words: Utterance[]
  dream: { deva: string; gloss: string; frame: FrameId; alt: string }
}

/** Every story with a built experience. The router reads this. */
export const STORY_DOCS: Record<string, StoryDoc> = {
  [RAJU.slug]: RAJU,
}

export const getStoryDoc = (slug: string): StoryDoc | undefined => STORY_DOCS[slug]

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
