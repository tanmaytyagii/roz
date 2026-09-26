import { motion } from 'motion/react'
import { FRONT_MATTER, IN_PRODUCTION, NEXT_NUMBER, READINGS, STATUS_LINE } from '../data/issue'
import { ISSUE, tally } from '../data/relations'
import { HOLDINGS } from '../data/archive'
import { PLACES_BY_STORY } from '../data/places'
import { RECORDISTS } from '../data/soundscapes'
import { FRAMES } from '../data/frames.generated'
import { Link } from './Link'
import { fade } from '../lib/motion'
import { inWords, listed } from '../lib/words'

/** Unique photographers, in the order their frames first appear. */
const PHOTOGRAPHERS = Array.from(
  new Map(
    Object.values(FRAMES)
      .filter((f) => f.credit)
      .map((f) => [f.credit!.creator, f.credit!]),
  ).values(),
)

/**
 * THE COLOPHON.
 *
 * The issue's account of itself: what it holds, who made what, under which
 * terms, and what is written. Every figure is counted off the registries and
 * every credit is one the records already carry — a credit ROZ does not have is
 * not given.
 *
 * `full` is the colophon proper, which closes the back matter. Without it,
 * the short form the back of every other page carries.
 */
export function Colophon({ full = false, className = '' }: { full?: boolean; className?: string }) {
  const f = FRONT_MATTER

  return (
    <dl className={className}>
      {full && (
        <>
          <Entry label="Issue">Issue {ISSUE.number}. Still being assembled.</Entry>
          <Entry label="Documents">
            {listed(READINGS.map((r) => `Document ${r.number}, ${r.doc.title}`))}.{' '}
            {IN_PRODUCTION.length > 0 && (
              <>
                {inWords(IN_PRODUCTION.length, true)} more {IN_PRODUCTION.length === 1 ? 'is' : 'are'} in production;
                Document {NEXT_NUMBER} has not been given to anyone.
              </>
            )}
          </Entry>
        </>
      )}

      {!full && <Entry label="Status">{STATUS_LINE}</Entry>}

      <Entry label="Subjects">
        {full && <>{tally(f.subjects)}. </>}
        Every name, age, quote and answer in this issue is{' '}
        <span className="text-clay-ink">written for the prototype</span>. The people photographed are not the people
        described, and have not been interviewed or asked. Real subjects replace them before anything is published.
      </Entry>

      {full && (
        <Entry label="Places">
          {tally(f.places)} — {PLACES_BY_STORY.map((p) => p.short).join(', ')}. Where the stories are set, which is not
          a record of where the photographs were taken.
        </Entry>
      )}

      <Entry label={full ? 'Photographs' : 'Photography'}>
        {full && (
          <>
            {tally(f.photographs)}, by {tally(HOLDINGS.photographers)} photographers.{' '}
          </>
        )}
        Licensed documentary work under Creative Commons, credited beside each frame. Frames are cropped and graded for
        this prototype; adaptations carry the licence of the original.
        <Names people={PHOTOGRAPHERS} />
      </Entry>

      <Entry label="Recordings">
        {full && (
          <>
            {tally(f.recordings)}, by {tally(RECORDISTS.length)} recordists.{' '}
          </>
        )}
        Field recordings from Freesound, used under the terms each recordist chose and credited in the sound archive.
        Nothing in their records places any of them in the town its story is set in.
        <Names people={RECORDISTS} />
      </Entry>

      {full && f.notes > 0 && (
        <Entry label="Field notes">
          {tally(f.notes)}, kept beside the plates and the recordings.{' '}
          <Link
            to="/archive#field-notes"
            className="underline decoration-paper/20 underline-offset-[3px] transition-colors duration-[250ms] hover:text-cream hover:decoration-current"
          >
            Each line is marked
          </Link>{' '}
          documented, observed or written.
        </Entry>
      )}

      {full && (
        <Entry label="Fragments">
          {tally(f.fragments)} lines, <span className="text-clay-ink">all written for the prototype</span>.
        </Entry>
      )}

      <Entry label="Type">Set in Instrument Serif, Archivo, DM Mono and Tiro Devanagari.</Entry>

      {full && <Entry label="Status">{STATUS_LINE}</Entry>}
    </dl>
  )
}

/** One entry of the colophon: what it is about, and what there is to say. */
function Entry({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div {...fade(0, 1)} className="u-grid items-baseline gap-y-2 border-t border-paper/10 py-[clamp(1rem,2.6vh,1.5rem)]">
      <dt className="u-label col-span-12 text-dim sm:col-span-3 lg:col-span-2">{label}</dt>
      <dd className="u-mono col-span-12 max-w-[68ch] text-ash sm:col-span-9 lg:col-span-7 lg:col-start-4">{children}</dd>
    </motion.div>
  )
}

/** The people credited, each linked to where their work is. */
function Names({ people }: { people: { creator: string; source: string }[] }) {
  return (
    <span className="mt-3 flex flex-wrap items-baseline">
      {people.map((c, i) => (
        <span key={c.creator}>
          <a
            href={c.source}
            target="_blank"
            rel="noreferrer noopener"
            className="text-dim underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline"
          >
            {c.creator}
          </a>
          {/* Trailing, not leading: a wrapped line has to start with a name
              rather than with somebody else's separator. */}
          {i < people.length - 1 && (
            <span aria-hidden className="px-[0.45em] text-ash/25">
              ·
            </span>
          )}
        </span>
      ))}
    </span>
  )
}
