import { FRAMES, type FrameId } from './frames.generated'
import { SOUNDS, type SoundId } from './sounds.generated'
import { FRONT_FRAMES, PLACES, STORIES } from './stories'
import { STORY_DOCS, framesOf, tracksOf, wordsOf, type DayDoc, type PlateChapter, type SequenceDoc } from './story'
import { FRAGMENTS, SHEETS } from './archive'
import { SOUNDSCAPES } from './soundscapes'
import { PLACES_BY_STORY, findPlace } from './places'
import { relationFor } from './relations'
import { inWords, licence } from '../lib/words'

/**
 * FIELD NOTES.
 *
 * What an editor keeps beside the plates and the recordings: small things the
 * archive knows about its own material. Every note is built from data already
 * in the repository — a credit record, a recording's own title, what a
 * document says about where a frame came from — and each one checks its own
 * evidence as it is built. If the thing a note would say is not supported,
 * the note is not written. There is no fallback text.
 *
 * Every line is one of three kinds, and never two at once:
 *
 *   documented — taken from a photograph's or a recording's own record
 *   observed   — the editor's reading of how the archive uses its material
 *   written    — prototype writing; not documentary evidence of anything
 *
 * The photograph and recording context under each note — who made it, under
 * what licence, where it is from when that is recorded — is not written here
 * at all. It is read off the same records the credits are, when the note is
 * drawn.
 */

export type LineKind = 'documented' | 'observed' | 'written'
export type NoteLine = { kind: LineKind; text: string }

/** The three kinds, as the notebook names and explains them. */
export const KINDS: Record<LineKind, { label: string; gloss: string }> = {
  documented: {
    label: 'Documented',
    gloss: "From a photograph's or a recording's own record: who made it, the licence, the source — and a place only where the source gives one.",
  },
  observed: { label: 'Observed', gloss: "The editor's reading of how the archive uses its material." },
  written: { label: 'Written', gloss: 'Prototype writing. Not evidence of anything.' },
}

/** What a note is about. Each resolves through the registries that already hold the thing. */
export type NoteRef =
  | { kind: 'subject'; slug: string }
  | { kind: 'place'; name: string }
  | { kind: 'photograph'; frame: FrameId }
  | { kind: 'recording'; id: SoundId }
  /** A chapter of a document, by the id its link already uses. */
  | { kind: 'chapter'; slug: string; id: string }
  | { kind: 'fragment'; deva: string }

export type Note = {
  /** Stable, and the note's address: `field-notes/two-mornings`. */
  id: `field-notes/${string}`
  n: number
  label: string
  lines: NoteLine[]
  about: NoteRef[]
  /**
   * Where the note also stands in the margin of a document, if anywhere: the
   * story's slug and the id of the chapter it sits beside.
   */
  margin?: { slug: string; chapter: string }
}

const pad = (n: number) => String(n).padStart(2, '0')
const docNumber = (slug: string) => {
  const d = STORY_DOCS[slug]
  return d ? `Document ${pad(d.number)}` : undefined
}
const credit = (frame: FrameId) => FRAMES[frame].credit
const day = (slug: string) => {
  const d = STORY_DOCS[slug]
  return d?.grammar === 'day' ? (d as DayDoc) : undefined
}
const sequence = (slug: string) => {
  const d = STORY_DOCS[slug]
  return d?.grammar === 'sequence' ? (d as SequenceDoc) : undefined
}
const plateChapters = () =>
  Object.values(STORY_DOCS)
    .flatMap((d) => (d.grammar === 'sequence' ? d.chapters : []))
    .filter((c): c is PlateChapter => c.kind === 'plate')

/** Where a frame is from — but only when a document recorded it from the frame's own source. */
export const placedFor = (frame: FrameId): string | undefined =>
  plateChapters().find((c) => c.frame === frame && c.placed)?.placed

type Draft = Omit<Note, 'n'> | null

/* ── Document 01: one day, many photographers ─────────────────────────── */
const oneDay = (): Draft => {
  const doc = day('raju')
  const who = STORIES.find((s) => s.slug === 'raju')
  if (!doc || !who) return null
  const frames = framesOf(doc)
  const makers = new Set(frames.map((f) => credit(f)?.creator).filter(Boolean))
  if (makers.size < 2) return null
  return {
    id: 'field-notes/one-day',
    label: 'One day, many photographers',
    lines: [
      {
        kind: 'documented',
        text: `${docNumber('raju')} holds ${frames.length} photographs. Their credit records name ${makers.size} photographers.`,
      },
      {
        kind: 'observed',
        text: 'What makes them read as one day is the editing. The records ROZ keeps for these frames carry no dates and no places, so nothing in them puts any two on the same day, or in the same town.',
      },
      { kind: 'written', text: `${who.name}, his hours and his words are written for the prototype. Nobody in these photographs is ${who.name}.` },
    ],
    about: [
      { kind: 'subject', slug: 'raju' },
      { kind: 'chapter', slug: 'raju', id: 'the-day' },
    ],
  }
}

/* ── 05:12: a frame and a recording at the same hour ──────────────────── */
const firstHour = (): Draft => {
  const doc = day('raju')
  const who = STORIES.find((s) => s.slug === 'raju')
  const hour = doc?.day[0]
  const track = doc ? tracksOf(doc).find((t) => t.at === hour?.time) : undefined
  if (!doc || !who || !hour || !track) return null
  const photographer = credit(hour.frame)?.creator
  const recordist = SOUNDS[track.id].credit.creator
  // Only if they really are two different people's work.
  if (!photographer || photographer === recordist) return null
  return {
    id: 'field-notes/first-hour',
    label: `${hour.time} — a frame and a recording`,
    lines: [
      {
        kind: 'observed',
        text: `${docNumber('raju')} sets both at ${hour.time}. They were made by different people, and nothing in either record puts them in the same place — or in ${who.place}.`,
      },
      { kind: 'written', text: `The hour, and ${who.name} being awake at it, are written.` },
    ],
    about: [
      { kind: 'subject', slug: 'raju' },
      { kind: 'chapter', slug: 'raju', id: `hour-${hour.time.replace(':', '')}` },
      { kind: 'photograph', frame: hour.frame },
      { kind: 'recording', id: track.id },
    ],
    margin: { slug: 'raju', chapter: 'the-sound' },
  }
}

/* ── One photographer, two mornings ───────────────────────────────────── */
const twoMornings = (): Draft => {
  const raju = day('raju')
  const shanti = sequence('shanti')
  const hour = raju?.day[0]
  const walk = shanti?.chapters.find((c) => c.kind === 'stand-in')
  if (!raju || !shanti || !hour || !walk || walk.kind !== 'stand-in') return null
  const a = credit(hour.frame)?.creator
  const b = credit(walk.frame)?.creator
  if (!a || a !== b) return null
  const front = PLACES.find((p) => p.frame === walk.frame)
  return {
    id: 'field-notes/two-mornings',
    label: 'One photographer, two mornings',
    lines: [
      { kind: 'documented', text: `Both frames are credited to ${a}.` },
      {
        kind: 'observed',
        text:
          `${docNumber('raju')} uses one at ${hour.time}. ${docNumber('shanti')} uses the other at ${walk.time}, as a stand-in for the walk up from the river` +
          (front ? `, and the front of the issue uses it again for “${front.text.replace(/\.$/, '')}”.` : '.') +
          ' The archive files each frame once.',
      },
      { kind: 'written', text: 'Neither morning is documented. Both belong to people written for the prototype.' },
    ],
    about: [
      { kind: 'chapter', slug: 'raju', id: `hour-${hour.time.replace(':', '')}` },
      { kind: 'chapter', slug: 'shanti', id: walk.id },
      { kind: 'photograph', frame: hour.frame },
      { kind: 'photograph', frame: walk.frame },
    ],
    margin: { slug: 'shanti', chapter: walk.id },
  }
}

/* ── The river: the one place a record names ──────────────────────────── */
const theRiver = (): Draft => {
  const shanti = sequence('shanti')
  const who = STORIES.find((s) => s.slug === 'shanti')
  const river = shanti?.chapters.find((c) => c.kind === 'plate' && c.placed)
  if (!shanti || !who || !river || river.kind !== 'plate') return null
  const placedAnywhere = plateChapters().filter((c) => c.placed)
  const others = framesOf(shanti).filter((f) => f !== river.frame).length
  return {
    id: 'field-notes/the-river',
    label: 'The one place a record names',
    lines: [
      {
        kind: 'observed',
        text:
          (placedAnywhere.length === 1
            ? 'The river is the only photograph in the issue with a place taken from its own source.'
            : `The river is one of ${placedAnywhere.length} photographs in the issue with a place taken from their own source.`) +
          ` The other ${others === 1 ? 'photograph' : `${inWords(others)} photographs`} in ${docNumber('shanti')} carry none.`,
      },
      { kind: 'written', text: `What ${who.name} does at the ghat is written.` },
    ],
    about: [
      { kind: 'subject', slug: 'shanti' },
      { kind: 'place', name: who.place },
      { kind: 'chapter', slug: 'shanti', id: river.id },
      { kind: 'photograph', frame: river.frame },
    ],
  }
}

/* ── A river recording, not moved ─────────────────────────────────────── */
const notMoved = (): Draft => {
  const shanti = sequence('shanti')
  const who = STORIES.find((s) => s.slug === 'shanti')
  const river = shanti?.chapters.find((c) => c.kind === 'plate' && c.placed)
  const scape = SOUNDSCAPES.find((s) => /ganges/i.test(s.sound.credit.title))
  if (!shanti || !who || !river || !scape) return null
  // The note is about an absence. If Document 02 ever lists a recording, it is wrong.
  if (tracksOf(shanti).length) return null
  return {
    id: 'field-notes/not-moved',
    label: 'A river recording, not moved',
    lines: [
      {
        kind: 'observed',
        text:
          `${docNumber('shanti')} opens on a river and carries no recording. The one recording whose own title names a river stays where ${docNumber(scape.story.slug)} lists it, at ${scape.at}. ` +
          `Its record names the river, not a town, so it is not moved to ${who.place} on a guess.`,
      },
    ],
    about: [
      { kind: 'chapter', slug: 'shanti', id: river.id },
      { kind: 'recording', id: scape.id },
    ],
  }
}

/* ── One wall, a mark and a line ──────────────────────────────────────── */
const theWall = (): Draft => {
  const shanti = sequence('shanti')
  const who = STORIES.find((s) => s.slug === 'shanti')
  const corner = shanti?.chapters.find((c) => c.kind === 'marked')
  if (!shanti || !who || !corner || corner.kind !== 'marked') return null
  const at = corner.marks.findIndex((m) => m.label === 'The wall')
  const said = wordsOf(shanti)?.words.find((w) => /wall/i.test(w.gloss))
  const fragment = said && FRAGMENTS.find((f) => f.deva === said.deva)
  if (at < 0 || !said || !fragment) return null
  const mark = corner.marks[at]
  return {
    id: 'field-notes/the-wall',
    label: 'One wall, a mark and a line',
    lines: [
      {
        kind: 'observed',
        text: `Mark ${pad(at + 1)} on the corner frames the wall behind the woman in the photograph. The wall is there in the frame, thick with posters.`,
      },
      {
        kind: 'written',
        text: `${who.name}'s line about it — “${said.gloss}” — is written, like the hour on the mark, ${mark.time}.`,
      },
    ],
    about: [
      { kind: 'chapter', slug: 'shanti', id: corner.id },
      { kind: 'photograph', frame: corner.frame },
      { kind: 'fragment', deva: said.deva },
    ],
  }
}

/* ── The front's slates ───────────────────────────────────────────────── */
const theSlates = (): Draft => {
  const slated = FRONT_FRAMES.filter((f) => f.slate)
  if (!slated.length) return null
  const towns = PLACES_BY_STORY.filter((p) => slated.some((f) => f.slate!.includes(p.short) || f.slate!.includes(p.name)))
  return {
    id: 'field-notes/the-slates',
    label: 'The slates on the cold open',
    lines: [
      {
        kind: 'written',
        text: `${slated.map((f) => `“${f.slate}”`).join(', ')} — each gives a place and a time, and each is a caption written for the prototype. Neither the place nor the time comes from the photograph.`,
      },
      ...(towns.length
        ? [
            {
              kind: 'observed' as const,
              text: `${towns.length === 1 ? 'One names a place' : `${inWords(towns.length, true)} name places`} this issue's stories are set in — ${towns.map((t) => t.short).join(' and ')}. That is the whole of the connection: the records ROZ keeps for these frames name neither.`,
            },
          ]
        : []),
    ],
    about: slated.map((f) => ({ kind: 'photograph' as const, frame: f.frame })),
  }
}

/* ── Resolving what a note is about ─────────────────────────────────────
   Each reference is looked up where the thing already lives — the person in
   the relationship registry, the photograph on its proof sheet, the
   recording in the sound archive. A note whose material cannot be found is
   not drawn. */

export type Resolved = {
  key: string
  kind: NoteRef['kind']
  /** Short, as it is set in the note. */
  label: string
  /** Its place in the issue, where it has one. */
  detail?: string
  to: string
  /** What a screen reader hears for the link. */
  spoken: string
}

const plates = () => SHEETS.flatMap((s) => s.plates)

export const resolve = (ref: NoteRef): Resolved | undefined => {
  switch (ref.kind) {
    case 'subject': {
      const rel = relationFor(ref.slug)
      if (!rel) return undefined
      const doc = docNumber(ref.slug)
      return {
        key: `subject/${ref.slug}`,
        kind: ref.kind,
        label: rel.story.name,
        detail: doc ?? 'In production',
        to: doc ? `/story/${ref.slug}` : '/people',
        spoken: `${rel.story.name}, ${doc ?? 'in production'}`,
      }
    }
    case 'place': {
      const p = findPlace(ref.name)
      if (!p) return undefined
      return { key: `place/${p.name}`, kind: ref.kind, label: p.short, to: '/places', spoken: `${p.name}, on the map` }
    }
    case 'chapter': {
      const doc = STORY_DOCS[ref.slug]
      const num = docNumber(ref.slug)
      if (!doc || !num) return undefined
      let label: string | undefined
      if (doc.grammar === 'day') {
        const hour = doc.day.find((h) => `hour-${h.time.replace(':', '')}` === ref.id)
        label = hour?.time ?? DAY_SECTIONS[ref.id]
      } else {
        const c = doc.chapters.find((x) => x.id === ref.id)
        label = c && 'time' in c && c.time ? c.time : c && 'title' in c ? c.title : undefined
      }
      if (!label) return undefined
      return {
        key: `chapter/${ref.slug}/${ref.id}`,
        kind: ref.kind,
        label,
        detail: num,
        to: `/story/${ref.slug}#${ref.id}`,
        spoken: `${num}, ${label}`,
      }
    }
    case 'photograph': {
      const plate = plates().find((p) => p.id === ref.frame)
      if (!plate) return undefined
      return {
        key: `photograph/${ref.frame}`,
        kind: ref.kind,
        label: `Plate ${pad(plate.n)}`,
        detail: plate.where,
        to: `/archive#plate/${ref.frame}`,
        spoken: `Plate ${plate.n} in the field archive`,
      }
    }
    case 'recording': {
      const s = SOUNDSCAPES.find((x) => x.id === ref.id)
      if (!s) return undefined
      const num = docNumber(s.story.slug)
      return {
        key: `recording/${ref.id}`,
        kind: ref.kind,
        label: s.title,
        detail: num ? `${s.at} · ${num}` : s.at,
        to: '/sounds',
        spoken: `Recording, ${s.title}, in the sound archive`,
      }
    }
    case 'fragment': {
      const f = FRAGMENTS.find((x) => x.deva === ref.deva)
      if (!f) return undefined
      return {
        key: `fragment/${f.n}`,
        kind: ref.kind,
        label: `Fragment ${pad(f.n)}`,
        detail: f.source,
        to: `/archive#fragment/${f.n}`,
        spoken: `Fragment ${f.n}, ${f.source}`,
      }
    }
  }
}

/** The sections of a day, by the ids their links already use. */
const DAY_SECTIONS: Record<string, string> = {
  'the-day': 'The day',
  'the-work': 'The work',
  'the-objects': 'The objects',
  'the-sound': 'The sound',
  'the-words': 'The words',
  'the-dream': 'The dream',
}

/* ── The notebook ─────────────────────────────────────────────────────── */

/**
 * In the order an editor would turn to them: the first document, the hour
 * and the photographer the two documents share, the second document, and
 * then the front of the issue.
 */
export const NOTES: Note[] = [oneDay(), firstHour(), twoMornings(), theRiver(), notMoved(), theWall(), theSlates()]
  .filter((d): d is Omit<Note, 'n'> => d !== null)
  // A note is only as good as its references: every one has to be found.
  .filter((d) => d.about.every((r) => resolve(r) !== undefined))
  .map((d, i) => ({ ...d, n: i + 1 }))

/** The notes that point at a given photograph, recording or fragment — for marking them where they are filed. */
export const notesAbout = (match: (r: NoteRef) => boolean) => NOTES.filter((n) => n.about.some(match))

/** The note that stands in the margin beside a given chapter, if one does. */
export const marginNote = (slug: string, chapter: string) =>
  NOTES.find((n) => n.margin?.slug === slug && n.margin.chapter === chapter)

/* ── What a photograph or a recording documents about itself ───────────
   Read straight off the records. Only what exists is returned: a frame with
   no recorded place has no place row, rather than one that says "unknown". */

export type Material = {
  key: string
  kind: 'photograph' | 'recording'
  frame?: FrameId
  rows: { label: string; value: string; href?: string }[]
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

export const materialFor = (ref: NoteRef): Material | undefined => {
  if (ref.kind === 'photograph') {
    const c = credit(ref.frame)
    const plate = plates().find((p) => p.id === ref.frame)
    if (!c || !plate) return undefined
    const place = placedFor(ref.frame)
    return {
      key: `photograph/${ref.frame}`,
      kind: 'photograph',
      frame: ref.frame,
      rows: [
        { label: 'Photograph', value: c.creator, href: c.source },
        { label: 'Licence', value: licence(c.license), href: c.licenseUrl },
        ...(host(c.source) ? [{ label: 'Source', value: host(c.source)!, href: c.source }] : []),
        ...(place ? [{ label: 'Place', value: place }] : []),
        { label: 'Filed', value: `Plate ${pad(plate.n)} · ${plate.where}` },
      ],
    }
  }
  if (ref.kind === 'recording') {
    const s = SOUNDSCAPES.find((x) => x.id === ref.id)
    if (!s) return undefined
    const c = s.sound.credit
    const num = docNumber(s.story.slug)
    return {
      key: `recording/${ref.id}`,
      kind: 'recording',
      rows: [
        { label: 'Recording', value: `“${c.title}”`, href: c.source },
        { label: 'Recordist', value: c.creator, href: c.source },
        { label: 'Licence', value: licence(c.license), href: c.licenseUrl },
        ...(host(c.source) ? [{ label: 'Source', value: host(c.source)!, href: c.source }] : []),
        { label: 'Stands in', value: num ? `${s.at} · ${num}` : s.at },
      ],
    }
  }
  return undefined
}
