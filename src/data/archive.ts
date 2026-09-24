import { FRAMES, type FrameId } from './frames.generated'
import { FRONT_FRAMES, PLACES, STORIES, type Story } from './stories'
import { DOCS_IN_ORDER, STORY_DOCS, framesOf, lastLineOf, statusOf, wordsOf, type DayDoc, type SequenceDoc } from './story'
import { SOUNDSCAPES } from './soundscapes'
import { PLACES_BY_STORY } from './places'
import { inWords } from '../lib/words'

/**
 * THE FIELD ARCHIVE.
 *
 * Every photograph ROZ holds, laid out as a contact sheet rather than as a
 * gallery. Nothing here is new material: each plate is a frame already in the
 * manifest, and its caption is the alt text already written for it. What the
 * archive adds is the provenance — which document a frame belongs to, whose
 * day it sits inside, and what hour of it — all of which the registries
 * already know and no page had yet put in one place.
 *
 * The distinction the archive has to hold on to: the *photographs* are real,
 * licensed documentary work by the photographers credited on every plate. The
 * *annotations* — the hours, the object notes, the trades — are written for
 * the prototype. `written` marks the second kind so a plate can say which it
 * is instead of letting the reader assume.
 */

export type Plate = {
  id: FrameId
  /** Running index across the whole sheet. */
  n: number
  /** What is visible, from the alt text the frame already carries. */
  caption: string
  /** A short editorial label where the data has one. */
  label?: string
  deva?: string
  /** The note the document already keeps on it. */
  note?: string
  subject?: Story
  place?: string
  /** The hour of the day it belongs to, for the frames that have one. */
  at?: string
  /** Where clicking goes, and what to call it. */
  to: string
  where: string
  /** True when the annotation above is prototype writing, not capture data. */
  written: boolean
}

export type Sheet = {
  n: number
  id: string
  title: string
  deva: string
  lede: string
  plates: Plate[]
}

const pad = (n: number) => String(n).padStart(2, '0')
const subjectOf = (slug: string) => STORIES.find((s) => s.slug === slug)
/** How a plate names the document it is filed in: by its number in the issue. */
const docOf = (slug: string) => {
  const d = STORY_DOCS[slug]
  return d ? `Document ${pad(d.number)}` : undefined
}

/** Into the document where it exists, back to the index where it does not. */
const storyAt = (slug: string, hash = '') => (statusOf(slug) === 'available' ? `/story/${slug}${hash}` : '/people')

let running = 0
const plate = (p: Omit<Plate, 'n'>): Plate => ({ ...p, n: (running += 1) })

/* ── The subjects ───────────────────────────────────────────────────── */
const subjects: Plate[] = STORIES.map((s) =>
  plate({
    id: s.frame,
    caption: `${s.occupation.replace(/^The /, '')}, ${s.place}.`,
    label: s.name,
    deva: s.nameDeva,
    note: s.line,
    subject: s,
    place: s.place,
    to: storyAt(s.slug),
    where: docOf(s.slug) ?? 'In production',
    written: true,
  }),
)

/**
 * Each photograph is filed once. The portraits go first, so a document that
 * also reads its subject's portrait — Shanti's does, all day — leaves it filed
 * under Subjects rather than filing it twice.
 */
const seen = new Set<FrameId>(subjects.map((p) => p.id))
const claim = (plates: Plate[]) => {
  const fresh = plates.filter((p) => !seen.has(p.id))
  fresh.forEach((p) => seen.add(p.id))
  return fresh
}

type Draft = Omit<Sheet, 'n'>

/* ── A day: its hours, then its details and objects ─────────────────── */
const dayDocs = DOCS_IN_ORDER.filter((d): d is DayDoc => d.grammar === 'day')
const daySheets: Draft[] = dayDocs.flatMap((doc) => {
  const who = subjectOf(doc.slug)
  if (!who) return []
  // Only suffixed when there is more than one, so the sheets that already
  // exist keep the addresses they were given.
  const id = (base: string) => (dayDocs.length > 1 ? `${base}-${doc.slug}` : base)
  const hours = claim(
    doc.day.map((h) =>
      plate({
        id: h.frame,
        caption: h.alt,
        label: h.line,
        deva: h.deva,
        note: h.note,
        subject: who,
        place: who.place,
        at: h.time,
        to: storyAt(doc.slug, `#hour-${h.time.replace(':', '')}`),
        where: docOf(doc.slug) ?? 'In the story',
        written: true,
      }),
    ),
  )
  const details = claim([
    ...doc.work.details.map((d) =>
      plate({
        id: d.frame,
        caption: d.alt,
        label: d.label,
        deva: d.deva,
        note: d.note,
        subject: who,
        place: who.place,
        to: storyAt(doc.slug, '#the-work'),
        where: docOf(doc.slug) ?? 'In the story',
        written: true,
      }),
    ),
    ...doc.objects.items.map((o) =>
      plate({
        id: o.frame,
        caption: o.alt,
        label: o.name,
        deva: o.deva,
        note: o.note,
        subject: who,
        place: who.place,
        to: storyAt(doc.slug, '#the-objects'),
        where: docOf(doc.slug) ?? 'In the story',
        written: true,
      }),
    ),
  ])
  return [
    {
      id: id('the-day'),
      title: 'The day',
      deva: 'दिन',
      lede: `${docOf(doc.slug)}. ${who.name}'s day, an hour at a time. Each plate opens at the hour it belongs to.`,
      plates: hours,
    },
    {
      id: id('details'),
      title: 'Details',
      deva: 'ब्यौरा',
      lede: `${docOf(doc.slug)}. What the work is made of, and what gets carried to it. Close enough that the day disappears.`,
      plates: details,
    },
  ]
})

/* ── A sequence: whatever photographs its chapters hold ─────────────── */
const sequenceSheets: Draft[] = DOCS_IN_ORDER.filter((d): d is SequenceDoc => d.grammar === 'sequence').flatMap(
  (doc) => {
    const who = subjectOf(doc.slug)
    if (!who) return []
    const plates = claim(
      doc.chapters.flatMap((c): Plate[] => {
        if (c.kind === 'plate')
          return [
            plate({
              id: c.frame,
              caption: c.alt,
              label: c.line.replace(/\.$/, ''),
              deva: c.deva,
              note: c.placed,
              subject: who,
              // Only where the photograph's own record places it.
              place: c.placed ? who.place : undefined,
              at: c.time,
              to: storyAt(doc.slug, `#${c.id}`),
              where: docOf(doc.slug) ?? 'In the story',
              written: true,
            }),
          ]
        if (c.kind === 'stand-in')
          return [
            plate({
              id: c.frame,
              caption: c.alt,
              label: c.line.replace(/\.$/, ''),
              deva: c.deva,
              note: c.provenance,
              subject: who,
              at: c.time,
              to: storyAt(doc.slug, `#${c.id}`),
              where: `${docOf(doc.slug)} · stands in`,
              written: true,
            }),
          ]
        return []
      }),
    )
    const holdsPortrait = framesOf(doc).includes(who.frame)
    return [
      {
        id: doc.id,
        title: doc.title,
        deva: who.nameDeva,
        lede:
          `Document ${pad(doc.number)}. ` +
          (holdsPortrait ? `${who.name}'s portrait is filed above; the document reads it all day. ` : '') +
          'These are the other photographs it holds, each opening at the chapter it belongs to.',
        plates,
      },
    ]
  },
)

/* ── Reference frames ───────────────────────────────────────────────────
   The photographs that carry no story of their own: the places the homepage
   looks at, the cold open, a day's first and last frame. Their captions
   describe only what is in them, which is the one thing about this archive
   that is not written. */
const reference: Plate[] = claim([
  ...PLACES.map((p) =>
    plate({
      id: p.frame,
      caption: p.alt,
      label: p.text.replace(/\.$/, ''),
      to: '/#intro',
      where: 'On the front',
      written: false,
    }),
  ),
  ...FRONT_FRAMES.filter((f) => !PLACES.some((p) => p.frame === f.frame)).map((f) =>
    plate({ id: f.frame, caption: f.alt, label: f.where, to: '/', where: 'On the front', written: false }),
  ),
  ...dayDocs.flatMap((doc) => {
    const who = subjectOf(doc.slug)
    if (!who) return []
    return [
      plate({
        id: doc.cover.frame,
        caption: doc.cover.alt,
        label: 'The slate',
        subject: who,
        place: who.place,
        to: storyAt(doc.slug),
        where: docOf(doc.slug) ?? 'In the story',
        written: false,
      }),
      plate({
        id: doc.dream.frame,
        caption: doc.dream.alt,
        label: 'The last frame',
        subject: who,
        place: who.place,
        to: storyAt(doc.slug, '#the-dream'),
        where: docOf(doc.slug) ?? 'In the story',
        written: false,
      }),
    ]
  }),
])

const unfinished = STORIES.filter((s) => statusOf(s.slug) !== 'available').length

/**
 * Numbered after the empty ones are dropped, so the sequence never skips. The
 * running plate index is re-counted the same way: a frame dropped as already
 * filed must not leave a hole in the proof numbers either.
 */
export const SHEETS: Sheet[] = (() => {
  const drafts: Draft[] = [
    {
      id: 'subjects',
      title: 'Subjects',
      deva: 'लोग',
      lede: `One portrait for each person in the issue. ${inWords(unfinished, true)} of the ${inWords(STORIES.length)} have nothing behind them yet.`,
      plates: subjects,
    },
    ...daySheets,
    ...sequenceSheets,
    {
      id: 'reference',
      title: 'Reference',
      deva: 'संदर्भ',
      lede: 'Frames with no story attached. They describe what is in them and nothing more.',
      plates: reference,
    },
  ].filter((s) => s.plates.length > 0)
  let k = 0
  return drafts.map((s, i) => ({ ...s, n: i + 1, plates: s.plates.map((p) => ({ ...p, n: (k += 1) })) }))
})()

/* ── Fragments ──────────────────────────────────────────────────────────
   The written lines the publication already holds, gathered in one column and
   attributed to the document they come from. Every one of them is prototype
   writing, and the archive says so at the head rather than beside each line. */
export type Fragment = { n: number; deva: string; gloss?: string; source: string; to?: string }

let f = 0
const frag = (x: Omit<Fragment, 'n'>): Fragment => ({ ...x, n: (f += 1) })

export const FRAGMENTS: Fragment[] = [
  ...STORIES.map((s) =>
    frag({
      deva: s.quote,
      source: `${s.name} · ${s.place}`,
      to: storyAt(s.slug),
    }),
  ),
  ...DOCS_IN_ORDER.flatMap((doc) => {
    const who = subjectOf(doc.slug)
    if (!who) return []
    const said = wordsOf(doc)
    const last = lastLineOf(doc)
    return [
      // An epigraph that is not already the person's line on the front.
      ...(doc.epigraph.deva !== who.quote
        ? [frag({ deva: doc.epigraph.deva, gloss: doc.epigraph.gloss, source: `${who.name} · the first line`, to: storyAt(doc.slug) })]
        : []),
      ...(said
        ? said.words.map((w) => frag({ deva: w.deva, gloss: w.gloss, source: `${who.name} · ${w.where}`, to: storyAt(doc.slug, said.at) }))
        : []),
      ...(last
        ? [frag({ deva: last.deva.replace('\n', ' '), gloss: last.gloss, source: `${who.name} · the last line`, to: storyAt(doc.slug, last.at) })]
        : []),
    ]
  }),
]

/* ── What the archive holds, counted ───────────────────────────────── */
const photographs = SHEETS.reduce((n, s) => n + s.plates.length, 0)

export const HOLDINGS = {
  photographs,
  recordings: SOUNDSCAPES.length,
  subjects: STORIES.length,
  places: PLACES_BY_STORY.length,
  fragments: FRAGMENTS.length,
  /** Documents written and photographed but not built. */
  unfinished: STORIES.filter((s) => statusOf(s.slug) !== 'available').length,
  /** Unique photographers across everything shown. */
  photographers: new Set(
    Object.values(FRAMES)
      .map((fr) => fr.credit?.creator)
      .filter(Boolean),
  ).size,
}
