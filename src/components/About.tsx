import { motion } from 'motion/react'
import { ChapterMark } from './ChapterMark'
import { Frame } from './Frame'
import { FRONT_FRAMES, STORIES } from '../data/stories'
import {
  BACK_MATTER,
  DOCUMENTS,
  FRONT_MATTER,
  INDEXES,
  IN_PRODUCTION,
  READABLE,
  READINGS,
  UNBUILT,
  factsFor,
} from '../data/issue'
import { SHEETS } from '../data/archive'
import { ISSUE, tally } from '../data/relations'
import { Link } from './Link'
import { DocumentEntry } from './DocumentNav'
import { RunningHead } from './RunningHead'
import { Wordmark } from './Wordmark'
import { fade, liftLine, reveal, rise, uncover } from '../lib/motion'
import { inWords, listed } from '../lib/words'

const GHAT = FRONT_FRAMES.find((f) => f.frame === 'ghat')!

const MANIFESTO = [
  'We pass thousands of people every day.',
  'Most become part of the background.',
  'ROZ asks you to stop for a moment.',
  'To look closer.',
  'To listen.',
  'To remember that every ordinary day belongs to someone.',
]

export function About() {
  return (
    <section id="about" data-canvas="paper" className="relative bg-paper text-ink">
      <div className="u-pad py-[clamp(4.5rem,13vh,10rem)]">
        <ChapterMark n={4} title="Why ROZ" className="text-slate" />

        <div className="u-grid mt-[clamp(3rem,9vh,7rem)] gap-y-[clamp(2.5rem,7vh,5rem)]">
          <motion.figure {...uncover()} className="col-span-12 sm:col-span-6 lg:col-span-4">
            <Frame
              id={GHAT.frame}
              alt={GHAT.alt}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw"
              className="aspect-[3/2] w-full"
            />
          </motion.figure>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <h2 className="u-display text-balance" style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)', lineHeight: 1.12 }}>
              {MANIFESTO.map((line, i) => (
                <motion.span
                  key={line}
                  {...liftLine(i * 0.07, '32%')}
                  className="mt-[0.5em] block first:mt-0"
                  style={{ color: i >= 2 ? 'var(--color-ink)' : 'var(--color-slate)' }}
                >
                  {line}
                </motion.span>
              ))}
            </h2>

            <motion.p {...rise(0.3)} className="u-deva mt-[clamp(2rem,5vh,3.5rem)] text-clay-paper" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.625rem)' }} lang="hi">
              हर दिन की एक कहानी।
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * THE ISSUE.
 *
 * The contents page, and the hub every document returns to — set as the front
 * of a printed issue rather than as the end of a web page. A running head, a
 * cover (the masthead, the issue, the line the publication is known by), a
 * little front matter saying what the issue holds, and then the contents
 * proper: the documents, the indexes, the back matter, and what is not
 * finished. Every number is counted off the registries.
 *
 * The unfinished half stays on the page. It is set quieter — ash rather than
 * cream, no photograph, no number, no way in — but in full, by name, so it
 * reads as a list of entries still being made rather than as something broken.
 */
export function Contents() {
  const filing = UNBUILT.find((u) => u.title === 'Filing')
  const archive = INDEXES.find((d) => d.id === 'archive')
  const indexes = INDEXES.filter((d) => d.id !== 'archive')
  const f = FRONT_MATTER
  const sheets = BACK_MATTER.filter((p) => SHEETS.some((s) => s.id === p.id)).length
  const parts = listed([
    `${inWords(sheets)} proof sheets`,
    ...BACK_MATTER.filter((p) => !SHEETS.some((s) => s.id === p.id)).map((p) =>
      p.id === 'colophon' ? 'the colophon' : p.title.toLowerCase(),
    ),
  ])

  return (
    // `flow-root`, so the running head's top margin stays inside the page it
    // heads: a reader sent to the contents lands with the head clear of the bar.
    <section id="contents" data-canvas="ink" aria-labelledby="issue-heading" className="flow-root bg-ink">
      <RunningHead where="Contents" />

      {/* The cover. */}
      <div className="u-pad pt-[clamp(3rem,9vh,6rem)] pb-[clamp(3rem,9vh,5.5rem)]">
        <ChapterMark n={5} title="Contents" className="text-ash" />
        <div className="u-grid mt-[clamp(2.5rem,8vh,5rem)] items-end gap-y-[clamp(2rem,6vh,3.5rem)]">
          <h2 id="issue-heading" className="col-span-12 lg:col-span-7">
            <span className="sr-only">ROZ, Issue {ISSUE.number} — contents</span>
            <motion.span {...reveal()} aria-hidden className="block text-paper">
              <Wordmark size="lg" />
            </motion.span>
            <motion.span
              {...reveal(0.08)}
              aria-hidden
              className="mt-[clamp(1rem,3vh,1.75rem)] flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-paper/20 pt-[clamp(0.9rem,2.4vh,1.4rem)]"
            >
              <span className="u-display text-cream" style={{ fontSize: 'clamp(2rem, 5.4vw, 4.5rem)', lineHeight: 1 }}>
                Issue {ISSUE.number}
              </span>
              <span lang="hi" className="u-deva text-ash" style={{ fontSize: 'clamp(1.125rem, 2.4vw, 1.875rem)' }}>
                अंक {toDeva(ISSUE.number)}
              </span>
            </motion.span>
          </h2>
          <motion.div {...rise(0.12)} className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p lang="hi" className="u-deva text-clay-ink" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.625rem)' }}>
              हर दिन की एक कहानी।
            </p>
            <p className="u-label mt-3 text-dim">Stories from the India you don't see.</p>
          </motion.div>
        </div>
      </div>

      {/* The front matter: what the issue is, before what is in it. */}
      <div className="u-pad pb-[clamp(3.5rem,10vh,6.5rem)]">
        <div className="u-grid gap-y-[clamp(1.25rem,3vh,2rem)] border-t border-paper/12 pt-[clamp(1.5rem,4vh,2.5rem)]">
          <p className="u-label col-span-12 text-dim lg:col-span-3">Front matter</p>
          <motion.p
            {...rise()}
            className="u-display col-span-12 text-balance lg:col-span-5 lg:col-start-4"
            style={{ fontSize: 'clamp(1.625rem, 3.2vw, 2.75rem)', lineHeight: 1.06 }}
          >
            <span className="block text-cream">
              {inWords(f.readable, true)} {f.readable === 1 ? 'document' : 'documents'} to read.
            </span>
            {f.unfinished > 0 && (
              <span className="block text-ash">
                {inWords(f.unfinished, true)} {f.unfinished === 1 ? 'is' : 'are'} still being made.
              </span>
            )}
          </motion.p>
          <motion.dl
            {...fade(0.15, 1.2)}
            className="col-span-12 grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:grid-cols-1"
          >
            {(
              [
                ['Photographs', f.photographs],
                ['Recordings', f.recordings],
                ['Field notes', f.notes],
                ['Fragments', f.fragments],
                ['Subjects', f.subjects],
                ['Places', f.places],
              ] as const
            ).map(([label, n]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 border-b border-paper/10 py-[0.45rem]">
                <dt className="u-label text-dim">{label}</dt>
                <dd className="u-mono text-clay-ink">{tally(n)}</dd>
              </div>
            ))}
          </motion.dl>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[52ch] text-dim lg:col-span-5 lg:col-start-4"
          >
            {inWords(DOCUMENTS.length, true)} documents in all, {inWords(READABLE)} of them{' '}
            {READABLE === 1 ? 'a story' : 'stories'} you can read all the way through. What the documents were made from —
            and what never became a chapter — is kept at the back, in the{' '}
            <Link
              to="/archive"
              className="text-ash underline decoration-paper/25 underline-offset-[4px] transition-colors duration-[250ms] hover:text-cream hover:decoration-current"
            >
              field archive
            </Link>
            .
          </motion.p>
        </div>
      </div>

      {/* ── The contents proper ─────────────────────────────────────────── */}

      <Group label="Documents" tally={`${tally(READINGS.length)} to read`} />
      <ol className="u-pad mt-[clamp(1rem,2.6vh,1.5rem)]">
        {READINGS.map((r) => (
          <DocumentEntry key={r.story.slug} reading={r} facts={factsFor(r.story.slug)} />
        ))}
      </ol>

      <Group label="Indexes" />
      <ul className="u-pad mt-[clamp(1rem,2.6vh,1.5rem)]">
        {indexes.map((d, i) => (
          <Entry key={d.id} to={d.path} title={d.title} deva={d.deva} line={d.line} tally={d.tally} delay={i * 0.05} />
        ))}
      </ul>

      {archive && (
        <>
          <Group label="Back matter" />
          <ul className="u-pad mt-[clamp(1rem,2.6vh,1.5rem)]">
            <Entry
              to={archive.path}
              title={archive.title}
              deva={archive.deva}
              line={`${archive.line} ${parts.charAt(0).toUpperCase()}${parts.slice(1)}.`}
              tally={archive.tally}
            />
          </ul>
        </>
      )}

      <Group
        label="Not yet in this issue"
        note="Each has a photograph on file, a premise and a town — and nothing more. Their documents stay open rather than be invented; what each one holds, and what it does not, is filed at the back."
        tally={`${tally(IN_PRODUCTION.length)} in production`}
      />
      <ul className="u-pad mt-[clamp(1rem,2.6vh,1.5rem)]">
        {IN_PRODUCTION.map((s, i) => (
          <motion.li key={s.slug} {...rise(i * 0.04, 12)} className="border-t border-paper/10">
            {/* A real destination now exists — the person's production sheet in
                the back matter — so the entry leads there, and nowhere else. */}
            <Link
              to={`/archive#unfinished/${s.slug}`}
              aria-label={`${s.name}, ${s.occupation.replace(/^The /, '')}, ${s.place}: in production. The production sheet, in the back matter.`}
              className="group u-grid items-baseline py-[clamp(0.75rem,2vh,1.1rem)]"
            >
              <p className="col-span-12 flex items-baseline gap-x-3 lg:col-span-9 lg:col-start-4">
                <span
                  className="u-display shrink-0 text-ash transition-colors duration-500 group-hover:text-cream group-focus-visible:text-cream"
                  style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)' }}
                >
                  {s.name}
                </span>
                <span lang="hi" className="u-deva shrink-0 text-dim" style={{ fontSize: '0.875rem' }}>
                  {s.nameDeva}
                </span>
                <span className="u-mono hidden shrink-0 text-dim sm:inline">
                  {s.occupation.replace(/^The /, '')}
                  <span className="opacity-40"> · </span>
                  {s.place}
                </span>
                <Leader always />
                <span className="u-label shrink-0 text-dim/70">In production</span>
              </p>
              {/* On a phone the trade and town drop under the name, so the
                  state keeps its place at the end of the line. */}
              <p className="u-mono col-span-12 mt-1 text-dim sm:hidden">
                {s.occupation.replace(/^The /, '')}
                <span className="opacity-40"> · </span>
                {s.place}
              </p>
            </Link>
          </motion.li>
        ))}
        {filing && (
          <motion.li {...rise(0, 12)} className="border-t border-b border-paper/10">
            <div className="u-grid items-baseline gap-y-1 py-[clamp(0.75rem,2vh,1.1rem)]">
              <p className="col-span-12 flex items-baseline gap-x-3 lg:col-span-9 lg:col-start-4">
                <span className="u-display shrink-0 text-ash" style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)' }}>
                  {filing.title}
                </span>
                <span lang="hi" className="u-deva shrink-0 text-dim" style={{ fontSize: '0.875rem' }}>
                  {filing.deva}
                </span>
                <Leader always />
                <span className="u-label shrink-0 text-dim/70">{filing.tally}</span>
              </p>
              <p className="u-mono col-span-12 max-w-[48ch] text-dim lg:col-span-6 lg:col-start-4">{filing.line}</p>
            </div>
          </motion.li>
        )}
      </ul>
      <div className="u-pad pt-[clamp(1.25rem,3vh,2rem)] pb-[clamp(1rem,3vh,2rem)]">
        <motion.p {...fade(0.1, 1.2)} className="u-mono text-dim lg:pl-[calc(25%+0.4rem)]">
          <Link
            to="/people"
            className="underline-offset-[4px] transition-colors duration-[250ms] hover:text-cream hover:underline"
          >
            All {inWords(STORIES.length)} in the people index
          </Link>
        </motion.p>
      </div>
    </section>
  )
}

const DEVA_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
const toDeva = (n: string) => n.replace(/\d/g, (d) => DEVA_DIGITS[Number(d)])

/** A group of the contents: a running label, and what the group is, counted. */
function Group({ label, note, tally: count }: { label: string; note?: string; tally?: string }) {
  return (
    <div className="u-pad pt-[clamp(3rem,9vh,5.5rem)]">
      <motion.div {...fade()} className="u-grid items-baseline gap-y-2">
        <h3 className="u-label col-span-12 text-dim lg:col-span-3">{label}</h3>
        {note && <p className="u-mono col-span-12 max-w-[52ch] text-dim lg:col-span-6 lg:col-start-4">{note}</p>}
        {count && (
          <p className="u-mono col-span-12 text-dim/70 lg:col-span-2 lg:col-start-11 lg:text-right">{count}</p>
        )}
      </motion.div>
    </div>
  )
}

/** The dotted leader a printed contents runs from an entry to its figure. */
function Leader({ always = false }: { always?: boolean }) {
  return (
    <span
      aria-hidden
      className={`min-w-[1.5rem] flex-1 translate-y-[-0.25em] border-b border-dotted border-paper/20 ${always ? 'block' : 'hidden sm:block'}`}
    />
  )
}

/** One entry of the contents that is not a document: its title, what it is, and its figure. */
function Entry({
  to,
  title,
  deva,
  line,
  tally: count,
  delay = 0,
}: {
  to: string
  title: string
  deva: string
  line: string
  tally: string
  delay?: number
}) {
  return (
    <motion.li {...rise(delay, 18)} className="border-t border-paper/10 last:border-b">
      <Link to={to} className="group u-grid items-baseline gap-y-2 py-[clamp(1rem,2.8vh,1.6rem)]">
        <span className="col-span-12 flex flex-wrap items-baseline gap-x-[0.5em] gap-y-1 lg:col-span-9 lg:col-start-4">
          <span
            className="u-display text-cream transition-[transform,color] duration-[500ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[0.06em] group-hover:text-clay-ink group-focus-visible:text-clay-ink"
            style={{ fontSize: 'clamp(1.375rem, 2.8vw, 2.25rem)' }}
          >
            {title}
          </span>
          <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1.0625rem)' }}>
            {deva}
          </span>
          <Leader />
          <span className="u-mono basis-full text-dim/80 sm:basis-auto">{count}</span>
        </span>
        <span className="u-mono col-span-12 max-w-[52ch] text-dim lg:col-span-6 lg:col-start-4">{line}</span>
      </Link>
    </motion.li>
  )
}
