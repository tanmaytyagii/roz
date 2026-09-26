import { FRAMES } from './frames.generated'
import type { Story } from './stories'
import { SHEETS, FRAGMENTS, type Plate } from './archive'
import { IN_PRODUCTION, NEXT_NUMBER, READINGS } from './issue'
import { findPlace } from './places'
import { relationFor } from './relations'
import { NOTES, placedFor, type LineKind, type Note } from './notes'
import { licence } from '../lib/words'

/**
 * THE UNFINISHED DOCUMENTS.
 *
 * A file for every person in the issue whose document is not built — kept
 * open, not hidden, because the archive does not yet hold enough to make it
 * honestly. Nothing here is a second list of people: a file exists exactly
 * while `statusOf` says a person is in production, and every line in it is
 * read off a registry that already holds the thing. When a document is
 * written and registered, its file closes on its own.
 *
 * Each line says which kind it is, in the same three words the field notes
 * use. The photograph and its credit are documented; the name, the trade,
 * the town, the premise and the line are written for the prototype.
 *
 * What a file does not hold is not a guess about what is missing. It is what
 * the finished documents in this issue are actually made of — read from their
 * own holdings — less anything this file already has.
 */

export type Held = {
  label: string
  kind: Exclude<LineKind, 'observed'>
  value: string
  /** Devanagari, when the thing held is a line in Hindi. */
  deva?: string
  /** Where it is filed, when it is filed somewhere a reader can go. */
  to?: string
  where?: string
}

/** One kind of material a finished document is made of, and which documents hold it. */
export type Absent = { label: string; in: string[] }

export type OpenFile = {
  /** The file's address in the back matter: `unfinished/imran`. */
  id: `unfinished/${string}`
  story: Story
  /** The one photograph on file, with only the provenance its record gives. */
  photograph: {
    plate: Plate | undefined
    creator?: string
    licence?: string
    licenceUrl?: string
    source?: string
    host?: string
    /** Only where a document took a place from the photograph's own source. */
    placed?: string
  }
  held: Held[]
  absent: Absent[]
  /** Field notes about this person or their material, if any have been written. */
  notes: Note[]
}

const pad = (n: number) => String(n).padStart(2, '0')

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

/**
 * What the finished documents are made of, in the order they list it, and
 * which of them holds each. Read from the relationship registry's own count
 * of each document's holdings.
 */
const MADE_OF: Absent[] = (() => {
  const made = new Map<string, string[]>()
  for (const r of READINGS) {
    for (const h of relationFor(r.story.slug)?.holdings ?? []) {
      if (h.count <= 0) continue
      made.set(h.label, [...(made.get(h.label) ?? []), `Document ${r.number}`])
    }
  }
  return [...made.entries()].map(([label, docs]) => ({ label, in: docs }))
})()

const plates = SHEETS.flatMap((s) => s.plates)

const fileFor = (story: Story): OpenFile => {
  const rel = relationFor(story.slug)
  const credit = FRAMES[story.frame].credit
  const plate = plates.find((p) => p.id === story.frame)
  const fragment = FRAGMENTS.find((f) => f.deva === story.quote)
  const town = findPlace(story.place)
  const photographs = rel?.frames ?? 0

  const held: Held[] = [
    ...(plate
      ? [
          {
            label: photographs === 1 ? 'Photograph' : 'Photographs',
            kind: 'documented' as const,
            value: `${pad(photographs)} — credited and licensed, filed on the Subjects sheet`,
            to: `/archive#plate/${plate.id}`,
            where: `Plate ${pad(plate.n)}`,
          },
        ]
      : []),
    { label: 'Premise', kind: 'written', value: story.line },
    {
      label: 'A line',
      kind: 'written',
      value: 'Set on the front, and kept with the fragments.',
      deva: story.quote,
      ...(fragment ? { to: `/archive#fragment/${fragment.n}`, where: `Fragment ${pad(fragment.n)}` } : {}),
    },
    {
      label: 'Set in',
      kind: 'written',
      value: story.place,
      ...(town ? { to: '/places', where: 'On the map' } : {}),
    },
  ]

  // A finished document's holdings, less whatever this file already holds.
  // Photographs are the exception: one frame on file is not the set a
  // document is built from, so what is missing is any beyond it.
  const has = new Set((rel?.holdings ?? []).filter((h) => h.count > 0).map((h) => h.label))
  const absent = MADE_OF.flatMap((m) =>
    m.label === 'Photographs'
      ? photographs <= 1
        ? [{ ...m, label: 'Further photographs' }]
        : []
      : has.has(m.label)
        ? []
        : [m],
  )

  return {
    id: `unfinished/${story.slug}`,
    story,
    photograph: {
      plate,
      creator: credit?.creator,
      licence: credit ? licence(credit.license) : undefined,
      licenceUrl: credit?.licenseUrl,
      source: credit?.source,
      host: credit ? host(credit.source) : undefined,
      placed: placedFor(story.frame),
    },
    held,
    absent,
    notes: NOTES.filter((n) =>
      n.about.some(
        (r) =>
          ((r.kind === 'subject' || r.kind === 'chapter') && r.slug === story.slug) ||
          (r.kind === 'photograph' && r.frame === story.frame),
      ),
    ),
  }
}

/** Every open file, in the order the issue lists the people. */
export const OPEN_FILES: OpenFile[] = IN_PRODUCTION.map(fileFor)

export const openFileFor = (slug: string) => OPEN_FILES.find((f) => f.story.slug === slug)

/** What a finished document is made of, for saying once rather than in every file. */
export const MADE_OF_DOCUMENTS = MADE_OF

/** The number no open file is given. */
export const UNASSIGNED = `Document ${NEXT_NUMBER}`
