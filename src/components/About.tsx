import { motion } from 'motion/react'
import { ChapterMark } from './ChapterMark'
import { Frame } from './Frame'
import { FRONT_FRAMES, STORIES } from '../data/stories'
import { DOCUMENTS, INDEXES, IN_PRODUCTION, MASTHEAD, READABLE, READINGS, UNBUILT } from '../data/issue'
import { ISSUE, tally } from '../data/relations'
import { Link } from './Link'
import { DocumentEntry } from './DocumentNav'
import { fade, liftLine, reveal, rise, uncover } from '../lib/motion'
import { inWords } from '../lib/words'

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
 * The contents page, and the hub every document returns to. It is set the way
 * a printed issue sets its contents: the masthead and what the issue holds,
 * counted; then the documents, which are what a reader came for; then the
 * indexes that lead into them; then, plainly, what is not finished. Every
 * number is counted off the registries, so none of it can drift out of date.
 *
 * The unfinished half stays on the page. It is set quieter — ash rather than
 * cream, no photograph, no way in — but in full, by name, so it reads as work
 * in progress rather than as something missing.
 */
export function Contents() {
  const filing = UNBUILT.find((u) => u.title === 'Filing')

  return (
    <section id="contents" data-canvas="ink" aria-labelledby="issue-heading" className="bg-ink">
      {/* The masthead. */}
      <div className="u-pad pt-[clamp(4.5rem,13vh,9rem)] pb-[clamp(2.5rem,7vh,4.5rem)]">
        <ChapterMark n={5} title={`Issue ${ISSUE.number}`} className="text-ash" />
        <div className="u-grid mt-[clamp(2rem,6vh,4.5rem)] items-end gap-y-[clamp(1.25rem,3vh,2rem)]">
          <h2 id="issue-heading" className="col-span-12 lg:col-span-7">
            <motion.span
              {...reveal()}
              className="u-display block text-paper"
              style={{ fontSize: 'clamp(2.75rem, 9vw, 7.5rem)', lineHeight: 0.92 }}
            >
              ROZ, Issue {ISSUE.number}.
            </motion.span>
            <motion.span
              {...reveal(0.08)}
              className="u-display mt-[0.12em] block text-ash"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 4rem)', lineHeight: 1.02 }}
            >
              What is in here.
            </motion.span>
          </h2>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[42ch] self-end text-dim lg:col-span-4 lg:col-start-9"
          >
            {inWords(DOCUMENTS.length, true)} documents so far, {inWords(READABLE)} of them{' '}
            {READABLE === 1 ? 'a story' : 'stories'} you can read all the way through. The rest is photographed and
            written but not built, and is listed as such.
          </motion.p>
        </div>

        {/* The issue in six numbers, counted. */}
        <motion.dl
          {...fade(0.2, 1.2)}
          className="mt-[clamp(2rem,6vh,3.5rem)] flex flex-wrap gap-x-[clamp(1.5rem,4vw,3.5rem)] gap-y-3 border-t border-paper/12 pt-[clamp(1rem,2.6vh,1.5rem)]"
        >
          {MASTHEAD.map((m) => (
            <div key={m.label} className="flex items-baseline gap-2">
              <dt className="sr-only">{m.label}</dt>
              <dd className="u-mono text-clay-ink" style={{ fontSize: 'clamp(0.875rem,1.2vw,1.0625rem)' }}>
                {tally(m.count)}
              </dd>
              <dd className="u-label text-dim">{m.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* The documents. What a reader came for, so they come first and largest. */}
      <div className="u-pad">
        <motion.h3 {...fade()} className="u-label text-dim">
          Documents
        </motion.h3>
      </div>
      <ol className="u-pad mt-[clamp(1rem,2.6vh,1.5rem)]">
        {READINGS.map((r) => (
          <DocumentEntry key={r.story.slug} reading={r} />
        ))}
      </ol>

      {/* The indexes. Every way into the documents, set smaller. */}
      <div className="u-pad pt-[clamp(3rem,9vh,6rem)]">
        <motion.h3 {...fade()} className="u-label text-dim">
          Indexes
        </motion.h3>
      </div>
      <ul className="u-pad mt-[clamp(1rem,2.6vh,1.5rem)]">
        {INDEXES.map((d, i) => (
          <motion.li key={d.id} {...rise(i * 0.05, 18)} className="border-t border-paper/10 last:border-b">
            <Link to={d.path} className="group u-grid items-baseline gap-y-2 py-[clamp(1rem,2.8vh,1.75rem)]">
              <span className="col-span-12 flex flex-wrap items-baseline gap-x-[0.5em] gap-y-1 sm:col-span-5 lg:col-span-4 lg:col-start-4">
                <span
                  className="u-display text-cream transition-[transform,color] duration-[500ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[0.06em] group-hover:text-clay-ink group-focus-visible:text-clay-ink"
                  style={{ fontSize: 'clamp(1.375rem, 2.8vw, 2.25rem)' }}
                >
                  {d.title}
                </span>
                <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1.0625rem)' }}>
                  {d.deva}
                </span>
              </span>
              <span className="u-mono col-span-12 max-w-[44ch] text-dim sm:col-span-5 sm:col-start-6 lg:col-span-3 lg:col-start-8">
                {d.line}
              </span>
              <span className="u-mono col-span-12 text-dim/70 sm:col-span-2 sm:col-start-11 sm:text-right">
                {d.tally}
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      {/* And what is not finished, by name, said plainly rather than promised. */}
      <div className="u-pad pt-[clamp(3rem,9vh,6rem)] pb-[clamp(1rem,3vh,2rem)]">
        <motion.div {...fade()} className="u-grid items-baseline gap-y-2">
          <h3 className="u-label col-span-12 text-dim lg:col-span-3">Not yet in this issue</h3>
          <p className="u-mono col-span-12 max-w-[52ch] text-dim lg:col-span-6 lg:col-start-4">
            Photographed and written, with a premise and a place. Their documents are not built, and nothing will be
            invented to close that gap.
          </p>
          <p className="u-mono col-span-12 text-dim/70 lg:col-span-2 lg:col-start-11 lg:text-right">
            {tally(IN_PRODUCTION.length)} in production
          </p>
        </motion.div>
      </div>
      <ul className="u-pad">
        {IN_PRODUCTION.map((s, i) => (
          <motion.li key={s.slug} {...rise(i * 0.04, 12)} className="border-t border-paper/10">
            <div className="u-grid items-baseline gap-y-1 py-[clamp(0.75rem,2vh,1.1rem)]">
              <span aria-hidden className="u-mono col-span-2 text-dim/60 sm:col-span-1 lg:col-start-4">
                {tally(s.index)}
              </span>
              <span className="col-span-10 flex flex-wrap items-baseline gap-x-3 sm:col-span-4 lg:col-span-3">
                <span className="u-display text-ash" style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)' }}>
                  {s.name}
                </span>
                <span lang="hi" className="u-deva text-dim" style={{ fontSize: '0.875rem' }}>
                  {s.nameDeva}
                </span>
              </span>
              <span className="u-mono col-span-10 col-start-3 text-dim sm:col-span-4 sm:col-start-auto lg:col-span-3">
                {s.occupation.replace(/^The /, '')}
                <span className="opacity-40"> · </span>
                {s.place}
              </span>
              <span className="u-label col-span-10 col-start-3 text-dim/70 sm:col-span-3 sm:col-start-auto sm:text-right lg:col-span-2">
                In production
              </span>
            </div>
          </motion.li>
        ))}
        {filing && (
          <motion.li {...rise(0, 12)} className="border-t border-b border-paper/10">
            <div className="u-grid items-baseline gap-y-1 py-[clamp(0.75rem,2vh,1.1rem)]">
              <span aria-hidden className="u-mono col-span-2 text-dim/60 sm:col-span-1 lg:col-start-4">
                —
              </span>
              <span className="col-span-10 flex flex-wrap items-baseline gap-x-3 sm:col-span-4 lg:col-span-3">
                <span className="u-display text-ash" style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)' }}>
                  {filing.title}
                </span>
                <span lang="hi" className="u-deva text-dim" style={{ fontSize: '0.875rem' }}>
                  {filing.deva}
                </span>
              </span>
              <span className="u-mono col-span-10 col-start-3 max-w-[40ch] text-dim sm:col-span-4 sm:col-start-auto lg:col-span-3">
                {filing.line}
              </span>
              <span className="u-label col-span-10 col-start-3 text-dim/70 sm:col-span-3 sm:col-start-auto sm:text-right lg:col-span-2">
                {filing.tally}
              </span>
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
