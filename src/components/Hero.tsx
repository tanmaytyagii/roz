import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Frame } from './Frame'
import { usePrefersReducedMotion } from '../lib/motion'
import type { FrameId } from '../data/frames.generated'

/** The cold open. Three frames, dissolving, the way a documentary starts. */
const PLATES: { id: FrameId; alt: string; slate: string }[] = [
  {
    id: 'dawn',
    alt: 'A man cycles across an open field at sunrise, a city skyline dissolved in haze behind him.',
    slate: 'Sunrise · Outskirts · 06:14',
  },
  {
    id: 'kiln',
    alt: 'Workers resting on a flatbed cart at a brick field under a heavy sky.',
    slate: 'Brick field · Western U.P. · 17:40',
  },
  {
    id: 'chai',
    alt: 'A glass of chai on a stall counter, the vendor out of focus behind it.',
    slate: 'Chai stall · Mumbai · 07:02',
  },
]

const HOLD = 7000

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const [shot, setShot] = useState(0)
  // Only the first plate is on the critical path. The rest arrive once the
  // browser has nothing better to do.
  const [rest, setRest] = useState(false)

  useEffect(() => {
    if (reduced) return
    const start = () => setRest(true)
    if (document.readyState === 'complete') {
      const t = setTimeout(start, 600)
      return () => clearTimeout(t)
    }
    window.addEventListener('load', start, { once: true })
    return () => window.removeEventListener('load', start)
  }, [reduced])

  // The sequence only runs while the hero is actually on screen.
  useEffect(() => {
    if (reduced || !rest) return
    const el = ref.current
    if (!el) return
    let timer: ReturnType<typeof setInterval> | undefined
    const run = (on: boolean) => {
      clearInterval(timer)
      timer = on ? setInterval(() => setShot((s) => (s + 1) % PLATES.length), HOLD) : undefined
    }
    const io = new IntersectionObserver(([e]) => run(e.isIntersecting && !document.hidden), { threshold: 0 })
    io.observe(el)
    const vis = () => run(!document.hidden && el.getBoundingClientRect().bottom > 0)
    document.addEventListener('visibilitychange', vis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', vis)
      clearInterval(timer)
    }
  }, [reduced, rest])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // Three speeds: the photograph barely moves, the type leaves, the chrome goes first.
  const plateY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const plateScale = useTransform(scrollYProgress, [0, 1], [1, 1.14])
  const typeY = useTransform(scrollYProgress, [0, 1], ['0%', '-34%'])
  const typeFade = useTransform(scrollYProgress, [0, 0.62], [1, 0])
  const chromeFade = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  const live = PLATES[reduced ? 0 : shot]

  return (
    <section
      ref={ref}
      id="top"
      data-canvas="ink"
      className="relative isolate flex h-[100svh] min-h-[34rem] flex-col overflow-clip"
      aria-label="ROZ — introduction"
    >
      <motion.div
        className="absolute inset-0 -z-10"
        style={reduced ? undefined : { y: plateY, scale: plateScale }}
      >
        {PLATES.map((p, i) => {
          if (i > 0 && !rest) return null
          return (
            <div
              key={p.id}
              className="absolute inset-0 transition-opacity duration-[2600ms] ease-[cubic-bezier(.65,0,.35,1)]"
              style={{ opacity: (reduced ? 0 : shot) === i ? 1 : 0 }}
            >
              <Frame
                id={p.id}
                alt={i === 0 ? p.alt : ''}
                priority={i === 0}
                sizes="100vw"
                className="h-full w-full"
              />
            </div>
          )
        })}
      </motion.div>

      {/* Light shaping. Top for the bar, bottom to hand the page to the next section. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,9,7,0.62) 0%, rgba(10,9,7,0.12) 26%, rgba(10,9,7,0.20) 46%, rgba(10,9,7,0.78) 82%, var(--color-ink) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(100deg, rgba(10,9,7,0.5) 0%, transparent 52%)' }}
      />

      {/* Upper slate */}
      <motion.div
        style={reduced ? undefined : { opacity: chromeFade }}
        className="u-pad pointer-events-none relative mt-[clamp(4.5rem,8vh,6.5rem)]"
      >
        <p className="u-label flex items-center gap-3 text-paper/70">
          <span aria-hidden className="inline-block h-px w-[clamp(1.5rem,4vw,3.5rem)] bg-current" />
          An interactive documentary
        </p>
      </motion.div>

      {/* The title block sits low and left. The photograph keeps the air above it. */}
      <motion.div
        style={reduced ? undefined : { y: typeY, opacity: typeFade }}
        className="u-pad u-grid relative mt-auto items-end gap-y-[clamp(1rem,2.4vh,2rem)] pb-[clamp(2rem,6vh,4rem)]"
      >
        <div className="col-span-12 lg:col-span-8">
          <h1 className="sr-only">ROZ — रोज़. Stories from the India you don't see.</h1>
          <p
            aria-hidden
            lang="hi"
            className="u-deva text-paper"
            style={{
              fontSize: 'clamp(5.5rem, 17vw, 16rem)',
              lineHeight: 0.92,
              marginLeft: '-0.04em',
              textShadow: '0 0.06em 0.5em rgba(10,9,7,0.35)',
            }}>
            रोज़
          </p>
          <p
            aria-hidden
            lang="hi"
            className="u-deva mt-[clamp(0.4rem,1.2vh,1rem)] text-cream/80"
            style={{ fontSize: 'clamp(1.25rem, 2.7vw, 2.15rem)' }}>
            हर दिन की एक कहानी।
          </p>
        </div>

        <p
          aria-hidden
          className="u-display col-span-12 max-w-[16ch] text-balance text-cream/70 lg:col-span-4 lg:justify-self-end lg:text-right"
          style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', lineHeight: 1.18 }}
        >
          Stories from the India you don't see.
        </p>
      </motion.div>

      {/* Foot: the one call to action, the slate, the scroll cue. */}
      <motion.div
        style={reduced ? undefined : { opacity: chromeFade }}
        className="u-pad u-grid relative items-center gap-y-4 border-t border-paper/12 py-[clamp(0.85rem,1.8vh,1.4rem)]"
      >
        <div className="col-span-6 lg:col-span-4">
          <a href="#intro" className="group inline-flex items-center gap-3">
            <span className="u-label text-paper">Enter ROZ</span>
            <span aria-hidden className="relative block h-px w-[clamp(1.75rem,5vw,3.5rem)] overflow-hidden bg-paper/35">
              <span className="absolute inset-0 origin-left scale-x-0 bg-clay transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
            </span>
          </a>
        </div>

        <p
          className="u-mono col-span-6 hidden text-paper/65 lg:col-span-4 lg:block lg:text-center"
          aria-live="off"
        >
          <span className="tabular-nums">{String((reduced ? 0 : shot) + 1).padStart(2, '0')}</span>
          <span className="opacity-40"> / {String(PLATES.length).padStart(2, '0')}</span>
          <span className="mx-2 opacity-40">·</span>
          {live.slate}
        </p>

        <p className="u-label col-span-6 flex items-center justify-end gap-3 text-paper/70 lg:col-span-4">
          Scroll to explore
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
