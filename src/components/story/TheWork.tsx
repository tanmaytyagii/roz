import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { Detail, DayDoc } from '../../data/story'
import { Frame } from '../Frame'
import { ChapterMark } from '../ChapterMark'
import { reveal, rise, uncover, usePrefersReducedMotion } from '../../lib/motion'

/**
 * THE WORK.
 *
 * Six close-ups, deliberately six different formats at six different heights
 * and six different parallax speeds. A grid of equal tiles would read as a
 * product page; a montage that never lines up reads as a contact sheet
 * somebody has laid out by hand, which is what this is.
 *
 * The placement is by position rather than by content, so any story with six
 * details gets the same montage without touching this file. The rows are
 * explicit and every offset is positive: a negative one lets a frame climb into
 * the caption of the row above it, which is exactly what it looks like.
 */
const PLACE = [
  'sm:col-span-7 lg:col-span-4 lg:col-start-1 lg:row-start-1',
  'sm:col-span-8 sm:col-start-5 lg:col-span-5 lg:col-start-7 lg:row-start-1 lg:mt-[18vh]',
  'sm:col-span-7 lg:col-span-5 lg:col-start-2 lg:row-start-2',
  'sm:col-span-7 sm:col-start-6 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:mt-[16vh]',
  'sm:col-span-9 lg:col-span-7 lg:col-start-1 lg:row-start-3',
  'sm:col-span-6 sm:col-start-7 lg:col-span-4 lg:col-start-9 lg:row-start-3 lg:mt-[14vh]',
]
/** Different speeds, so nothing in the montage travels with anything else. */
const DRIFT = [7, -5, 9, -7, 5, -9]

export function TheWork({ doc }: { doc: DayDoc }) {
  return (
    <section id="the-work" data-canvas="ink" className="relative bg-ink">
      <header className="u-pad pt-[clamp(4.5rem,13vh,9rem)] pb-[clamp(2rem,6vh,4rem)]">
        <ChapterMark n={2} title="The work" className="text-ash" />
        <div className="u-grid mt-[clamp(2rem,6vh,4rem)] gap-y-[clamp(1.25rem,3vh,2rem)]">
          <motion.h2
            {...reveal()}
            className="u-display col-span-12 text-balance lg:col-span-7"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
          >
            {doc.work.lede}
          </motion.h2>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[38ch] self-end text-ash lg:col-span-4 lg:col-start-9"
          >
            Closer than the day lets you look.
          </motion.p>
        </div>
      </header>

      <ul className="u-pad u-grid gap-y-[clamp(2.5rem,8vh,6rem)] pb-[clamp(4rem,12vh,9rem)]">
        {doc.work.details.map((d, i) => (
          <DetailPlate key={d.frame} detail={d} n={i + 1} place={PLACE[i % PLACE.length]} drift={DRIFT[i % DRIFT.length]} />
        ))}
      </ul>
    </section>
  )
}

function DetailPlate({ detail, n, place, drift }: { detail: Detail; n: number; place: string; drift: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${drift}%`, `${-drift}%`])

  return (
    <motion.li ref={ref} {...uncover()} className={`col-span-12 ${place}`}>
      <motion.figure style={reduced ? undefined : { y }}>
        <div className="group overflow-hidden">
          <Frame
            id={detail.frame}
            alt={detail.alt}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 38vw"
            className="w-full transition-[transform,filter] duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] group-hover:brightness-[1.04] group-hover:contrast-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            style={{ aspectRatio: detail.tall ? '4 / 5' : '3 / 2' }}
          />
        </div>

        <figcaption className="mt-[clamp(0.75rem,1.8vh,1.25rem)] border-t border-paper/12 pt-3">
          <div className="flex items-baseline gap-3">
            <span aria-hidden className="u-mono text-dim">
              {String(n).padStart(2, '0')}
            </span>
            <span lang="hi" className="u-deva text-cream" style={{ fontSize: 'clamp(1.0625rem,1.6vw,1.375rem)' }}>
              {detail.deva}
            </span>
            <span className="u-label ml-auto text-clay-ink">{detail.label}</span>
          </div>
          <p className="u-mono mt-2 max-w-[38ch] text-ash">{detail.note}</p>
        </figcaption>
      </motion.figure>
    </motion.li>
  )
}
