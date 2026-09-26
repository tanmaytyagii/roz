import { motion } from 'motion/react'
import type { Story } from '../data/stories'
import type { DocumentFacts, Reading } from '../data/issue'
import { ISSUE } from '../data/relations'
import { Frame } from './Frame'
import { Link } from './Link'
import { rise, uncover } from '../lib/motion'

/**
 * WHERE A DOCUMENT SITS IN THE ISSUE.
 *
 * Every document opens on the same line, whatever its grammar: the issue on
 * the left, as the way back to its contents, and the document's number on
 * the right. The two stories are built
 * differently on purpose; this line is what makes them read as two documents
 * of one publication rather than two websites.
 *
 * The row's box is exported so the page turn can set the same words in exactly
 * the same place while the room is dark — the number is already there when
 * the document comes up under it.
 */
export const HEAD_BOX = 'u-pad relative mt-[clamp(4.5rem,8vh,6.5rem)]'
export const HEAD_ROW = `${HEAD_BOX} flex flex-wrap items-baseline gap-x-6 gap-y-2`

export function DocumentHead({ reading, ghost = false }: { reading: Reading; ghost?: boolean }) {
  // The running identity, the same words the contents and the back matter
  // carry: the publication and the issue first, the document second.
  const label = (
    <>
      <span aria-hidden className="relative block h-px w-[clamp(1.5rem,4vw,3rem)] overflow-hidden bg-current">
        <span className="absolute inset-0 origin-right scale-x-0 bg-clay transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
      </span>
      <span className="u-mono normal-case tracking-[0.06em]">
        ROZ <span className="opacity-40">/</span> Issue {ISSUE.number}
      </span>
    </>
  )

  return (
    <>
      {ghost ? (
        // In the page turn the whole line is set, so the reader sees which
        // issue they are still in before the document comes up under it.
        <span aria-hidden className="inline-flex items-center gap-3 text-paper/70">
          {label}
        </span>
      ) : (
        <Link
          to="/#contents"
          className="group inline-flex items-center gap-3 text-paper/70 transition-colors hover:text-paper"
        >
          {label}
          <span className="sr-only"> — return to the contents</span>
        </Link>
      )}
      <p className="u-mono ml-auto whitespace-nowrap text-paper/70">Document {reading.number}</p>
    </>
  )
}

/**
 * The same admission at the foot of every opening, in the same words. Anything
 * a document needs to add — a credit, a scroll cue — follows it.
 */
export function Disclosure({ story, children }: { story: Story; children?: React.ReactNode }) {
  return (
    <p className="u-mono text-paper/60">
      <span className="text-clay-ink">Demo subject</span>
      <span className="opacity-40"> · </span>
      Written for the prototype. Nobody photographed here is {story.name}.
      {children}
    </p>
  )
}

/**
 * One document, as the issue lists it: its number, its person, what it is, and
 * the way in — before it is entered, and again when the editor points to it
 * from the end of another. A ruled entry with one small photograph, set the
 * way a contents page sets a feature. Never a card.
 *
 * `label` is what the entry is to the page it sits on ("Next in this issue");
 * without one, the left column carries the document's number instead.
 */
export function DocumentEntry({ reading: r, label, facts }: { reading: Reading; label?: string; facts?: DocumentFacts }) {
  const { story, doc } = r
  return (
    <motion.li {...rise(0, 16)} className="border-t border-paper/12">
      <Link to={r.path} className="group u-grid items-start gap-y-3 py-[clamp(1.5rem,4vh,2.5rem)]">
        {label ? (
          <span className="u-label col-span-12 text-dim lg:col-span-3">{label}</span>
        ) : (
          // On the contents the number is the folio: set large, the way a
          // printed contents sets the page a feature starts on — except that
          // this is the document's number, which is all a web page has.
          <span className="col-span-12 flex items-baseline gap-3 lg:col-span-3 lg:block">
            <span className="u-label text-clay-ink">Document</span>
            <span
              className="u-display block text-paper transition-colors duration-500 group-hover:text-clay-ink"
              style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 0.9 }}
            >
              {r.number}
            </span>
          </span>
        )}

        <motion.span {...uncover(0.05)} className="col-span-4 block overflow-hidden sm:col-span-3 lg:col-span-2">
          <Frame
            id={story.frame}
            alt=""
            position={story.focus}
            sizes="(max-width: 640px) 30vw, (max-width: 1024px) 22vw, 14vw"
            className="w-full transition-[transform,filter] duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] group-hover:brightness-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            style={{ aspectRatio: '4 / 5' }}
          />
        </motion.span>

        <span className="col-span-8 sm:col-span-9 lg:col-span-6 lg:col-start-6">
          {label && <span className="u-mono mb-2 block text-clay-ink">Document {r.number}</span>}
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className="u-display text-cream transition-colors duration-500 group-hover:text-clay-ink group-focus-visible:text-clay-ink"
              style={{ fontSize: 'clamp(2rem, 5.6vw, 4.5rem)' }}
            >
              {story.name}
            </span>
            <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(0.9375rem, 1.6vw, 1.25rem)' }}>
              {story.nameDeva}
            </span>
          </span>
          <span className="u-mono mt-2 block text-dim">
            {story.occupation.replace(/^The /, '')}
            <span className="opacity-40"> · </span>
            {story.place}
          </span>
          <span className="u-lede mt-3 hidden max-w-[40ch] text-ash sm:block">{doc.premise}</span>
          <span className="mt-4 inline-flex items-center gap-3">
            <span className="u-label text-clay-ink">Enter document</span>
            <span aria-hidden className="relative block h-px w-[clamp(1.5rem,3vw,2.5rem)] overflow-hidden bg-current/30">
              <span className="absolute inset-0 origin-left scale-x-0 bg-clay transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
            </span>
            <span className="u-mono text-dim">{story.duration}</span>
          </span>
        </span>
        {/* On a phone the column beside the photograph is too narrow for the
            premise, so it runs under both. */}
        <span className="u-mono col-span-12 max-w-[46ch] text-ash sm:hidden">{doc.premise}</span>

        {/* The entry's particulars, where the page asks for them: what the
            document holds and where the rest of it is filed. Counted by the
            registries, never typed. */}
        {facts && (
          <div className="col-span-12 border-t border-dotted border-paper/15 pt-3 lg:col-span-7 lg:col-start-6">
            <dl className="flex flex-wrap gap-x-[clamp(1rem,2.4vw,2rem)] gap-y-2">
              <Fact label="Status" value="Available" />
              <Fact label="Photographs" value={pad(facts.photographs)} />
              <Fact label="Recordings" value={facts.recordings ? pad(facts.recordings) : 'None'} />
              {facts.notes.length > 0 && <Fact label="Field notes" value={pad(facts.notes.length)} />}
              {facts.filed.length > 0 && <Fact label="Filed" value={facts.filed.map((f) => f.title).join(' · ')} />}
            </dl>
          </div>
        )}
      </Link>
    </motion.li>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

/** One particular of a contents entry: a small label, and its value. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-baseline gap-2">
      <dt className="u-label text-dim">{label}</dt>
      <dd className="u-mono text-ash">{value}</dd>
    </div>
  )
}
