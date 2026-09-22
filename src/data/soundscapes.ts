import { SOUNDS, type Sound, type SoundId } from './sounds.generated'
import { STORY_DOCS, statusOf, type StoryStatus } from './story'
import { STORIES, type Story } from './stories'
import type { Track } from './story'

/**
 * THE SOUND ARCHIVE.
 *
 * Derived, like the places are. A recording is in the archive because a story
 * lists it, and `sounds.generated.ts` already holds what the recording
 * actually is — its length, its recordist, its licence and the title the
 * person who made it gave it. Nothing is restated here.
 *
 * What is added is one honest line per recording about where it came from,
 * read off that title and nothing else. None of these were recorded in any of
 * the towns ROZ has stories in: they stand in for an hour of a day until real
 * location sound exists, and the page says so rather than captioning a stream
 * of crickets "Delhi".
 */

/**
 * Where the recording is actually from, taken from its own title. Two of them
 * name India; the other two say nothing about where they were made, and that
 * is what they get to say here.
 */
const ORIGIN: Record<SoundId, string> = {
  'before-light': 'Recorded on the Ganges',
  'the-site': 'Recorded inside a building site — country not stated',
  'the-road': 'Recorded on a street in India',
  'after-dark': 'Crickets after dark — country not stated',
}

export type Soundscape = {
  id: SoundId
  /** The editorial title the story gives it. */
  title: string
  deva: string
  /** The hour of the day it stands in for. */
  at: string
  /** Where the recording is really from, per its own metadata. */
  origin: string
  sound: Sound
  /** The story that lists it — a real relationship, not an assigned one. */
  story: Story
  status: StoryStatus
}

/**
 * Every recording any story carries, in the order its story tells them.
 * Adding a story with its own tracks extends this on its own.
 */
export const SOUNDSCAPES: Soundscape[] = Object.values(STORY_DOCS).flatMap((doc) => {
  const story = STORIES.find((s) => s.slug === doc.slug)
  if (!story) return []
  return doc.sound.tracks.flatMap((track: Track) => {
    const sound = SOUNDS[track.id]
    if (!sound) return []
    return [
      {
        id: track.id,
        title: track.label,
        deva: track.deva,
        at: track.at,
        origin: ORIGIN[track.id] ?? 'Origin not stated',
        sound,
        story,
        status: statusOf(story.slug),
      },
    ]
  })
})

/** Unique recordists, for the colophon at the foot of the archive. */
export const RECORDISTS = Array.from(
  new Map(SOUNDSCAPES.map((s) => [s.sound.credit.creator, s.sound.credit])).values(),
)

export const TOTAL_SECONDS = SOUNDSCAPES.reduce((n, s) => n + s.sound.seconds, 0)
