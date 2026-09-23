import { STORIES } from './stories'
import { statusOf } from './story'
import { PLACES_BY_STORY } from './places'
import { SOUNDSCAPES } from './soundscapes'

/**
 * THE ISSUE.
 *
 * What ROZ currently consists of, and what it does not. Every tally below is
 * counted off the registries rather than written down, so the contents page,
 * the footer and the foot of each document can never disagree with each other
 * — or with the site — the way they had started to.
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
const subjects = STORIES.length
const available = STORIES.filter((s) => statusOf(s.slug) === 'available').length
const towns = PLACES_BY_STORY.length
const recordings = SOUNDSCAPES.length
const lead = STORIES.find((s) => statusOf(s.slug) === 'available')

/** The documents that exist, in reading order. */
export const DOCUMENTS: Document[] = [
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
    tally: `${pad(towns)} towns`,
  },
  {
    id: 'sounds',
    path: '/sounds',
    title: 'Sounds',
    deva: 'आवाज़ें',
    line: 'Field recordings standing in for the hours of a day. Nothing plays until you ask.',
    tally: `${pad(recordings)} recordings`,
  },
  ...(lead
    ? [
        {
          id: 'story',
          path: `/story/${lead.slug}`,
          title: `${lead.name}'s day`,
          deva: lead.nameDeva,
          line: `${lead.occupation.replace(/^The /, '')} in ${lead.place}. Fifteen hours, seven of them set down.`,
          tally: lead.duration,
        },
      ]
    : []),
]

/** What is written and photographed but not built. Counted where it can be. */
export const UNBUILT: { title: string; deva: string; line: string; tally: string }[] = [
  {
    title: 'The other days',
    deva: 'बाकी दिन',
    line: 'Six more people are in the archive with a photograph and a premise. Their hours are not written.',
    tally: `${pad(subjects - available)} in production`,
  },
  {
    title: 'The filed archive',
    deva: 'संग्रह',
    line: 'Every day filed by city, trade, hour and theme, rather than by the order they were made.',
    tally: 'Not started',
  },
]

/** One honest sentence for the footer, assembled from the same counts. */
export const STATUS_LINE =
  `Prototype. ${pad(DOCUMENTS.length)} documents: the archive, the map, the recordings and ` +
  `${lead ? `${lead.name}'s day` : 'no story yet'}. ` +
  `${pad(subjects - available)} of the ${pad(subjects)} days are photographed and written but not yet built.`
