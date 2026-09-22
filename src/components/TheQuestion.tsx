import { motion } from 'motion/react'
import { ANSWERS } from '../data/stories'
import { ChapterMark } from './ChapterMark'
import { fade, liftLine, rise } from '../lib/motion'

/**
 * The one centred composition on the page. Everything else is set off-axis, so
 * arriving at dead centre reads as a change of address rather than a default.
 */
export function TheQuestion() {
  return (
    <section
      id="question"
      data-canvas="ink"
      aria-labelledby="question-heading"
      className="relative overflow-clip bg-[#070605] py-[clamp(5rem,16vh,12rem)]"
    >
      <div className="u-pad">
        <ChapterMark n={3} title="The question" className="text-ash" />
      </div>

      <div className="u-pad mt-[clamp(3.5rem,11vh,8rem)] text-center">
        <h2
          id="question-heading"
          className="u-display mx-auto text-balance"
          style={{ fontSize: 'clamp(2.5rem, 9.4vw, 9rem)', lineHeight: 0.95 }}
        >
          {['What does', 'a good life', 'mean to you?'].map((l, i) => (
            <motion.span
              key={l}
              {...liftLine(i * 0.1, '42%')}
              className="block"
              style={{ color: i === 2 ? 'var(--color-cream)' : 'var(--color-ash)' }}
            >
              {l}
            </motion.span>
          ))}
        </h2>
      </div>

      <ul className="u-pad mx-auto mt-[clamp(4rem,14vh,10rem)] flex max-w-[52rem] flex-col">
        {ANSWERS.map((a, i) => (
          <motion.li
            key={a.deva}
            // Long and unhurried. These are meant to be read one at a time.
            {...rise(0.12, 18)}
            transition={{ duration: 1.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-2 py-[clamp(1.75rem,5vh,3.25rem)] text-center"
          >
            {i > 0 && (
              <span aria-hidden className="mb-[clamp(1.75rem,5vh,3.25rem)] h-px w-16 bg-paper/12" />
            )}
            <p className="u-deva text-cream" style={{ fontSize: 'clamp(1.25rem, 3.2vw, 2.25rem)' }} lang="hi">
              {a.deva}
            </p>
            <p className="u-mono text-ash">{a.gloss}</p>
            <p className="u-label text-dim">{a.who}</p>
          </motion.li>
        ))}
      </ul>

      <motion.p
        {...fade(0, 1.4)}
        className="u-mono u-pad mt-[clamp(2rem,6vh,4rem)] text-center text-dim"
      >
        Written answers, for the prototype.
      </motion.p>
    </section>
  )
}
