import { motion } from 'motion/react'
import { ChapterMark } from './ChapterMark'
import { Frame } from './Frame'
import { DOCUMENTS, UNBUILT } from '../data/issue'
import { Link } from './Link'
import { fade, liftLine, rise, uncover } from '../lib/motion'

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
              id="ghat"
              alt="Figures on a stone ghat before dawn, lit by a single sodium lamp."
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
 * THE CONTENTS.
 *
 * The front page used to end on a list of what was missing, which by the end
 * had one orphaned row left on it and no way through to the three documents
 * that had since been built. This is the other way round: what the issue holds,
 * then what it does not, both counted off the registries so neither can drift
 * out of date again.
 */
export function Contents() {
  return (
    <section id="contents" data-canvas="ink" className="scroll-mt-24 bg-ink">
      <div className="u-pad pt-[clamp(4.5rem,13vh,9rem)] pb-[clamp(2rem,6vh,4rem)]">
        <ChapterMark n={5} title="The issue" className="text-ash" />
        <div className="u-grid mt-[clamp(2rem,6vh,4.5rem)] gap-y-4">
          <motion.h2
            {...rise()}
            className="u-display col-span-12 lg:col-span-6"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 4rem)', lineHeight: 1.02 }}
          >
            What is in here.
          </motion.h2>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[42ch] self-end text-dim lg:col-span-4 lg:col-start-9"
          >
            Four documents so far, and one day you can read all the way through. The rest is photographed and
            written but not built, and is listed as such.
          </motion.p>
        </div>
      </div>

      {/* What exists. Each one a way in. */}
      <ul className="u-pad">
        {DOCUMENTS.map((d, i) => (
          <motion.li key={d.id} {...rise(i * 0.05, 18)} className="border-t border-paper/10">
            <Link to={d.path} className="group u-grid items-baseline gap-y-2 py-[clamp(1.25rem,3.4vh,2.25rem)]">
              <span aria-hidden className="u-mono col-span-2 text-dim sm:col-span-1">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="col-span-10 flex flex-wrap items-baseline gap-x-[0.5em] gap-y-1 sm:col-span-4">
                <span
                  className="u-display text-cream transition-[transform,color] duration-[500ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[0.06em] group-hover:text-clay-ink group-focus-visible:text-clay-ink"
                  style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)' }}
                >
                  {d.title}
                </span>
                <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1.125rem)' }}>
                  {d.deva}
                </span>
              </span>
              <span className="u-mono col-span-12 max-w-[44ch] text-dim sm:col-span-5 sm:col-start-6">{d.line}</span>
              <span className="u-mono col-span-12 text-dim/70 sm:col-span-2 sm:col-start-11 sm:text-right">
                {d.tally}
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      {/* And what does not, said plainly rather than promised. */}
      <div className="u-pad pt-[clamp(3rem,9vh,6rem)]">
        <motion.p {...fade()} className="u-label text-dim">
          Not built
        </motion.p>
      </div>
      <ul className="u-pad">
        {UNBUILT.map((c, i) => (
          <motion.li key={c.title} {...rise(i * 0.05, 18)} className="border-t border-paper/10 last:border-b">
            <div className="u-grid items-baseline gap-y-2 py-[clamp(1.25rem,3.4vh,2.25rem)]">
              <span aria-hidden className="u-mono col-span-2 text-dim/60 sm:col-span-1">
                —
              </span>
              <h3 className="col-span-10 flex flex-wrap items-baseline gap-x-[0.5em] gap-y-1 sm:col-span-4">
                <span className="u-display text-ash" style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)' }}>
                  {c.title}
                </span>
                <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1.125rem)' }}>
                  {c.deva}
                </span>
              </h3>
              <p className="u-mono col-span-12 max-w-[44ch] text-dim sm:col-span-5 sm:col-start-6">{c.line}</p>
              <p className="u-mono col-span-12 text-dim/70 sm:col-span-2 sm:col-start-11 sm:text-right">{c.tally}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
