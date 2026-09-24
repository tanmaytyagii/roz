import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { Mark, MarkedChapter } from '../../data/story'
import { Frame, Credit } from '../Frame'
import { ChapterMark } from '../ChapterMark'
import { DISSOLVE, reveal, rise, usePrefersReducedMotion } from '../../lib/motion'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * ONE PHOTOGRAPH, HELD.
 *
 * The opposite of a day told in hours. The photograph never moves and is never
 * re-cropped; the reader moves, and as they do the day is marked across it —
 * a hairline box in grease-pencil clay, the way a picture editor marks a proof,
 * with the rest of the frame let down so the eye goes where the hour is.
 *
 * The frame is set at the aspect it was encoded at, so a mark written as a
 * percentage of the photograph always lands on the thing it names. Before the
 * first reading the photograph is shown whole and unmarked; nothing is pointed
 * at until the reader has seen all of it.
 *
 * Beside the frame on a wide screen, under it on a narrow one: the photograph
 * holds the top of the phone and the readings pass beneath it.
 */
export function MarkedFrame({ chapter: c, n }: { chapter: MarkedChapter; n: number }) {
  const reduced = usePrefersReducedMotion()
  const items = useRef<(HTMLLIElement | null)[]>([])
  const [active, setActive] = useState(-1)

  useEffect(() => {
    let ticking = false
    const read = () => {
      ticking = false
      // A reading is reached when its middle passes a line: just below the
      // centre beside the frame, or into the lower band under it on a phone —
      // late enough that the photograph has settled before anything is marked.
      const wide = window.matchMedia('(min-width: 1024px)').matches
      const line = window.innerHeight * (wide ? 0.58 : 0.78)
      let next = -1
      items.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.top + r.height / 2 < line) next = i
      })
      setActive((a) => (a === next ? a : next))
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const mark = active >= 0 ? c.marks[active] : undefined

  return (
    <section id={c.id} data-canvas="ink" className="relative bg-ink">
      <header className="u-pad pt-[clamp(4.5rem,13vh,9rem)] pb-[clamp(2rem,6vh,4rem)]">
        <ChapterMark n={n} title={c.title} className="text-ash" />
        <div className="u-grid mt-[clamp(2rem,6vh,4rem)] gap-y-[clamp(1.25rem,3vh,2rem)]">
          <motion.h2
            {...reveal()}
            className="u-display col-span-12 text-balance lg:col-span-7"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
          >
            {c.lede}
          </motion.h2>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[38ch] self-end text-ash lg:col-span-4 lg:col-start-9"
          >
            {c.aside}
          </motion.p>
        </div>
      </header>

      <div className="u-pad relative pb-[clamp(4rem,12vh,8rem)] lg:grid lg:grid-cols-12 lg:gap-x-[clamp(0.75rem,1.6vw,1.75rem)]">
        {/* The photograph. It stays; the day goes across it. */}
        {/* On a phone the block is stuck to the very top and padded clear of the
            bar, so the readings passing under it never show through a gap
            whether the bar is out or not. */}
        <div className="sticky top-0 z-10 bg-ink pt-[3.75rem] pb-3 lg:top-[clamp(4.5rem,9vh,6rem)] lg:col-span-6 lg:self-start lg:bg-transparent lg:p-0">
          <figure className="mx-auto w-[min(100%,38svh)] lg:mx-0 lg:w-[min(100%,calc((100svh-clamp(4.5rem,9vh,6rem)-5.5rem)*0.8))]">
            <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
              <Frame
                id={c.frame}
                alt={c.alt}
                art={false}
                sizes="(max-width: 1024px) 80vw, 44vw"
                className="absolute inset-0 h-full w-full"
              />
              <Marker mark={mark} n={active + 1} reduced={reduced} />
            </div>
            <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-paper/12 pt-3">
              {/* The clock and the name of what is marked. The readings carry
                  the same words for anybody not looking at the frame. */}
              <span aria-hidden className="u-mono w-[5ch] shrink-0 text-clay-ink">
                {mark ? mark.time : '— —'}
              </span>
              <span aria-hidden className="u-label min-w-0 truncate text-cream">
                {mark ? mark.label : 'The whole frame'}
              </span>
              <span className="u-mono basis-full text-dim sm:ml-auto sm:basis-auto">
                <Credit id={c.frame} />
              </span>
            </figcaption>
          </figure>
          {/* On a phone the readings pass under the frame; soften the edge
              they disappear at. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-full h-8 lg:hidden"
            style={{ background: 'linear-gradient(to bottom, var(--color-ink), transparent)' }}
          />
        </div>

        <ol className="relative lg:col-span-5 lg:col-start-8">
          {c.marks.map((m, i) => (
            <li
              key={m.time}
              ref={(el) => {
                items.current[i] = el
              }}
              className="flex min-h-[46svh] flex-col justify-center border-t border-paper/12 py-[clamp(2rem,6vh,3.5rem)] transition-opacity duration-500 ease-[cubic-bezier(.16,1,.3,1)] first:border-t-0 motion-reduce:transition-none lg:min-h-[76svh]"
              style={{ opacity: i === active ? 1 : 0.38 }}
            >
              <p className="flex items-baseline gap-3">
                <span aria-hidden className="u-mono text-dim">
                  {pad(i + 1)}
                </span>
                <span className="u-mono text-clay-ink">{m.time}</span>
              </p>
              <h3 className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span lang="hi" className="u-deva text-cream" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
                  {m.deva}
                </span>
                <span className="u-label text-clay-ink">{m.label}</span>
              </h3>
              <p className="u-lede mt-4 max-w-[34ch] text-ash">{m.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/**
 * The grease-pencil box. Everything outside it is let down by a shadow the
 * frame clips, so there is only ever one lit place in the photograph. With no
 * mark it opens out to the whole frame and fades, which is how the photograph
 * is first seen and how it is left.
 */
function Marker({ mark, n, reduced }: { mark: Mark | undefined; n: number; reduced: boolean }) {
  const [x, y, w, h] = mark?.box ?? [0, 0, 100, 100]
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, opacity: mark ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.9, ease: DISSOLVE }}
      className="pointer-events-none absolute"
      style={{ boxShadow: '0 0 0 200vmax rgba(10,9,7,0.58)' }}
    >
      <span className="absolute inset-0 border border-clay-ink" />
      {/* Crop ticks, just outside the corners, the way it is done by hand. */}
      <span className="absolute -top-1.5 -left-1.5 h-3 w-3 border-t border-l border-clay-ink" />
      <span className="absolute -right-1.5 -bottom-1.5 h-3 w-3 border-r border-b border-clay-ink" />
      {mark && (
        <span
          className={`u-mono absolute left-0 text-clay-ink ${y < 8 ? 'top-full mt-1.5' : 'bottom-full mb-1.5'}`}
        >
          {pad(n)}
        </span>
      )}
    </motion.div>
  )
}
