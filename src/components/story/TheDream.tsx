import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { StoryDoc } from '../../data/story'
import { Frame, Credit } from '../Frame'
import { fade, liftLine, usePrefersReducedMotion } from '../../lib/motion'

/**
 * THE DREAM.
 *
 * The last photograph and the last line, and nothing else in the frame with
 * them. The type is centred — the only centred composition in the story, the
 * same device the homepage keeps for its one question, so arriving here reads
 * as a change of address rather than another section.
 */
export function TheDream({ doc }: { doc: StoryDoc }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const lines = doc.dream.deva.split('\n')

  return (
    <section
      ref={ref}
      id="the-dream"
      data-canvas="ink"
      aria-labelledby="dream-heading"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-clip py-[clamp(5rem,14vh,10rem)]"
    >
      <motion.div className="absolute inset-0 -z-10" style={reduced ? undefined : { y }}>
        <Frame
          id={doc.dream.frame}
          alt={doc.dream.alt}
          sizes="100vw"
          className="-mt-[8%] h-[116%] w-full"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(86% 66% at 50% 44%, rgba(10,9,7,0.56) 0%, rgba(10,9,7,0.34) 48%, rgba(10,9,7,0.66) 100%), linear-gradient(to bottom, rgba(10,9,7,0.58) 0%, transparent 26%, transparent 64%, rgba(10,9,7,0.62) 88%, var(--color-ink) 100%)',
        }}
      />

      <div className="u-pad text-center">
        <motion.p {...fade(0, 1.2)} className="u-label text-clay-ink">
          The dream
        </motion.p>

        {/* Sized in rem, not ch: the h2 carries no font-size of its own, so a
            ch measure here would be read against the 16px body and fold every
            line after two words. */}
        <h2 id="dream-heading" className="mx-auto mt-[clamp(1.5rem,5vh,3rem)] max-w-[min(92vw,46rem)]">
          <span className="sr-only">
            {doc.dream.deva.replace('\n', ' ')} — {doc.dream.gloss}
          </span>
          {lines.map((line, i) => (
            <motion.span
              key={line}
              aria-hidden
              lang="hi"
              {...liftLine(i * 0.12, '38%')}
              className="u-deva block text-paper"
              style={{ fontSize: 'clamp(1.625rem, 5.4vw, 4.25rem)', lineHeight: 1.3 }}
            >
              {line}
            </motion.span>
          ))}
        </h2>

        <motion.p
          {...fade(0.4, 1.4)}
          className="u-lede mx-auto mt-[clamp(1.75rem,5vh,3rem)] max-w-[34ch] text-cream/85"
        >
          {doc.dream.gloss}
        </motion.p>

        <motion.p {...fade(0.6, 1.4)} className="u-mono mt-[clamp(2.5rem,8vh,5rem)] text-paper/70">
          <span className="text-clay-ink">Demo subject</span>
          <span className="opacity-40"> · </span>
          <Credit id={doc.dream.frame} />
        </motion.p>
      </div>
    </section>
  )
}
