import { motion } from 'motion/react'
import type { Story } from '../../data/stories'
import type { SequenceDoc } from '../../data/story'
import type { Reading } from '../../data/issue'
import { Link } from '../Link'
import { DocumentHead, Disclosure, HEAD_ROW } from '../DocumentNav'
import { DISSOLVE, rise, usePrefersReducedMotion } from '../../lib/motion'

/**
 * The slate for a sequence.
 *
 * Raju's document opens on his face. This one opens on nothing but type — the
 * way a reel opens on the board before the first frame — because a document
 * with three photographs should not spend one of them on its title. The
 * particulars are written the way a slate is chalked: ruled, labelled, one
 * line each. The disclosure sits on the bottom rule, small and never hidden.
 */
export function DocumentSlate({ story, doc, reading }: { story: Story; doc: SequenceDoc; reading: Reading }) {
  const reduced = usePrefersReducedMotion()
  // The chrome is always on the first screen, and the foot sits on its very
  // bottom edge — below the band a scroll reveal waits for — so it arrives on
  // mount instead of on view.
  const arrive = (delay: number) =>
    reduced
      ? { initial: false as const }
      : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1.2, delay, ease: DISSOLVE } }

  return (
    <section
      id={`${doc.id}/opening`}
      data-canvas="ink"
      aria-labelledby="story-name"
      className="relative flex min-h-[100svh] flex-col bg-ink"
    >
      {/* Top: where this sits in the issue, and the way back to it. */}
      <motion.div {...arrive(0)} className={HEAD_ROW}>
        <DocumentHead reading={reading} />
      </motion.div>

      <div className="u-pad mt-auto pt-[clamp(3rem,10vh,6rem)] pb-[clamp(2rem,6vh,4rem)]">
        <div className="u-grid items-end gap-y-[clamp(2rem,6vh,3.5rem)]">
          <div className="col-span-12 lg:col-span-8">
            <motion.h1
              id="story-name"
              {...rise(0, 26)}
              className="flex flex-wrap items-baseline gap-x-[clamp(0.7rem,1.8vw,1.75rem)] gap-y-1"
            >
              <span className="u-display text-paper" style={{ fontSize: 'clamp(4rem, 15vw, 13rem)' }}>
                {story.name}
              </span>
              <span lang="hi" className="u-deva text-cream/70" style={{ fontSize: 'clamp(1.5rem, 4.4vw, 3.75rem)' }}>
                {story.nameDeva}
              </span>
              <span className="sr-only">
                {' — '}
                {story.occupation}, {story.place}
              </span>
            </motion.h1>

            {/* The slate itself. */}
            <motion.dl {...rise(0.1, 18)} className="mt-[clamp(1.25rem,3vh,2rem)] border-t border-paper/20">
              <SlateRow label="Subject">
                <span className="u-mono text-paper/85">
                  {story.occupation.replace(/^The /, '')}, {story.age}
                </span>
                <span lang="hi" className="u-deva ml-3 text-clay-ink" style={{ fontSize: 'clamp(0.9375rem,1.4vw,1.125rem)' }}>
                  {story.occupationDeva}
                </span>
              </SlateRow>
              <SlateRow label="Place">
                <Link
                  to="/places"
                  className="u-mono text-paper/85 underline-offset-[5px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline focus-visible:text-clay-ink"
                >
                  {story.place}
                </Link>
              </SlateRow>
              <SlateRow label="Premise">
                <span
                  className="u-display block text-balance text-cream"
                  style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.875rem)', lineHeight: 1.15 }}
                >
                  {doc.premise}
                </span>
              </SlateRow>
            </motion.dl>
          </div>

          <motion.figure {...rise(0.2, 18)} className="col-span-12 lg:col-span-3 lg:col-start-10">
            <blockquote
              lang="hi"
              className="u-deva border-l border-clay/55 pl-[clamp(0.85rem,1.4vw,1.25rem)] text-cream"
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.625rem)' }}
            >
              {doc.epigraph.deva}
            </blockquote>
            <figcaption className="u-mono mt-3 pl-[clamp(0.85rem,1.4vw,1.25rem)] text-paper/55">
              {doc.epigraph.gloss}
            </figcaption>
          </motion.figure>
        </div>
      </div>

      {/* Foot: what is written, on the same hairline as the way on. */}
      <motion.div
        {...arrive(0.3)}
        className="u-pad flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-paper/12 py-[clamp(0.7rem,1.6vh,1.15rem)]"
      >
        <Disclosure story={story} />
        <p className="u-label ml-auto flex items-center gap-3 text-paper/65">
          Scroll
          <span aria-hidden className="relative block h-6 w-px overflow-hidden bg-paper/25">
            <span
              className="absolute inset-x-0 h-2 bg-paper"
              style={{ animation: reduced ? undefined : 'roz-drip 2.6s cubic-bezier(.65,0,.35,1) infinite' }}
            />
          </span>
        </p>
      </motion.div>
    </section>
  )
}

/** One chalked line of the slate: a label, and what it says. */
function SlateRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="u-grid items-baseline gap-y-1 border-b border-paper/12 py-[clamp(0.6rem,1.6vh,0.95rem)]">
      <dt className="u-label col-span-12 text-dim sm:col-span-2">{label}</dt>
      <dd className="col-span-12 sm:col-span-10">{children}</dd>
    </div>
  )
}
