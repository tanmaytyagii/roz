import { motion } from 'motion/react'
import type { StoryDoc } from '../../data/story'
import { ChapterMark } from '../ChapterMark'
import { fade, reveal, rise } from '../../lib/motion'

/**
 * THE WORDS.
 *
 * On paper, because the Devanagari is the subject here rather than the
 * illustration, and it wants ink on a light ground. Each quote steps one column
 * further in than the last, so the block reads as a transcript being worked
 * through rather than five quotations in a stack.
 */
const STEP = ['lg:col-start-1', 'lg:col-start-2', 'lg:col-start-3', 'lg:col-start-2', 'lg:col-start-1']

export function TheWords({ doc }: { doc: StoryDoc }) {
  return (
    <section id="the-words" data-canvas="paper" className="relative bg-paper text-ink">
      <div className="u-pad pt-[clamp(4.5rem,13vh,9rem)] pb-[clamp(4rem,12vh,8rem)]">
        <ChapterMark n={5} title="The words" className="text-slate" />

        <div className="u-grid mt-[clamp(2.5rem,7vh,5rem)] gap-y-[clamp(1.25rem,3vh,2rem)]">
          <motion.h2
            {...reveal()}
            className="u-display col-span-12 text-balance lg:col-span-7"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
          >
            Five things he said,
            <span className="block text-slate">between one wall and the next.</span>
          </motion.h2>
          <motion.p {...rise(0.1)} className="u-mono col-span-12 max-w-[36ch] self-end text-slate lg:col-span-4 lg:col-start-9">
            Set as they would be spoken. The English underneath is a translation, not a replacement.
          </motion.p>
        </div>

        <ol className="mt-[clamp(3rem,10vh,7rem)]">
          {doc.words.map((w, i) => (
            <motion.li
              key={w.deva}
              {...rise(0, 24)}
              className="u-grid gap-y-[clamp(0.75rem,2vh,1.25rem)] py-[clamp(2rem,6vh,4rem)]"
            >
              {i > 0 && (
                <motion.span
                  aria-hidden
                  {...fade(0, 1.2)}
                  className="col-span-12 mb-[clamp(1.5rem,5vh,3.25rem)] h-px w-[clamp(3rem,10vw,9rem)] bg-ink/20"
                />
              )}

              <span aria-hidden className="u-mono col-span-2 text-slate sm:col-span-1">
                {String(i + 1).padStart(2, '0')}
              </span>

              <blockquote className={`col-span-10 sm:col-span-11 sm:col-start-2 lg:col-span-8 ${STEP[i % STEP.length]}`}>
                <p
                  lang="hi"
                  className="u-deva text-balance text-ink"
                  style={{ fontSize: 'clamp(1.375rem, 3.4vw, 2.875rem)', lineHeight: 1.34 }}
                >
                  {w.deva}
                </p>
                <footer className="mt-[clamp(0.85rem,2vh,1.4rem)]">
                  <p className="u-lede max-w-[40ch] text-slate">{w.gloss}</p>
                  <p className="u-label mt-3 text-clay-paper">{w.where}</p>
                </footer>
              </blockquote>
            </motion.li>
          ))}
        </ol>

        <motion.p {...fade(0, 1.4)} className="u-mono mt-[clamp(1rem,3vh,2rem)] text-slate/80">
          Written for the prototype, like the rest of the story.
        </motion.p>
      </div>
    </section>
  )
}
