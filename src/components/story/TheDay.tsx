import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import type { Hour, StoryDoc } from '../../data/story'
import { minutesOf, timeOf } from '../../data/story'
import { Frame } from '../Frame'
import { ChapterMark } from '../ChapterMark'
import { setScroll } from '../../lib/useLenis'
import { DISSOLVE, fade, reveal, rise, uncover, usePrefersReducedMotion } from '../../lib/motion'

/**
 * THE DAY.
 *
 * Seven single-shot chapters, one screen each. Two things carry the feeling of
 * being inside somebody's day rather than reading a list of times:
 *
 *   — the light. Each frame is graded with the colour of its own hour, so the
 *     scroll runs blue, then gold, then bleached, then amber, then dark.
 *   — the clock. A rail down the right edge counts the real hours between the
 *     chapters as you scroll, so the gaps have length. 10:42 to 13:27 is a
 *     long way, and it should feel like one.
 *
 * The clock is written straight to the DOM on rAF. Only the active chapter is
 * state, and only when it actually changes.
 *
 * Two presentations of the one idea: `TimeRail` down the right edge on a wide
 * screen, `HourSheet` folded into the corner on a narrow one. They share the
 * active chapter, the progress and the jump, and nothing else.
 */
export function TheDay({ doc }: { doc: StoryDoc }) {
  const hours = doc.day
  const items = useRef<(HTMLElement | null)[]>([])
  const clock = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const tally = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)
  const [live, setLive] = useState(false)

  const first = minutesOf(hours[0].time)
  const last = minutesOf(hours[hours.length - 1].time)

  useLayoutEffect(() => {
    let anchors: number[] = []
    let opens = 0
    let closes = 0
    let ticking = false
    let shown = -1
    let railed = false

    // The centre of each chapter, and the outer bounds of the whole day, in
    // document coordinates. Re-measured on resize, because every chapter is a
    // viewport tall.
    const measure = () => {
      anchors = items.current.map((el) => {
        if (!el) return 0
        const r = el.getBoundingClientRect()
        return r.top + window.scrollY + r.height / 2
      })
      const first = items.current[0]?.getBoundingClientRect()
      const last = items.current[items.current.length - 1]?.getBoundingClientRect()
      opens = first ? first.top + window.scrollY : 0
      closes = last ? last.bottom + window.scrollY : 0
    }

    const read = () => {
      ticking = false
      if (anchors.length < 2) return
      const probe = window.scrollY + window.innerHeight / 2
      const top = anchors[0]
      const end = anchors[anchors.length - 1]

      let i = 0
      while (i < anchors.length - 2 && probe >= anchors[i + 1]) i++
      const span = anchors[i + 1] - anchors[i] || 1
      const t = Math.max(0, Math.min(1, (probe - anchors[i]) / span))

      const minutes =
        probe <= top
          ? first
          : probe >= end
            ? last
            : minutesOf(hours[i].time) + (minutesOf(hours[i + 1].time) - minutesOf(hours[i].time)) * t
      if (clock.current) clock.current.textContent = timeOf(minutes)

      const through = Math.max(0, Math.min(1, (probe - top) / (end - top || 1)))
      if (fill.current) fill.current.style.transform = `scaleY(${through})`
      if (tally.current) tally.current.style.transform = `scaleX(${through})`

      const near = probe <= top ? 0 : probe >= end ? hours.length - 1 : i + (t > 0.5 ? 1 : 0)
      if (near !== shown) {
        shown = near
        setActive(near)
      }

      // The rail belongs to the day and to nothing else. Derived from the same
      // probe rather than from intersection events, because those only fire on
      // a crossing — landing in the middle of the day from a restored scroll
      // position or a rail click would otherwise leave it hidden.
      const on = probe > opens && probe < closes
      if (on !== railed) {
        railed = on
        setLive(on)
      }
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(read)
    }
    const onResize = () => {
      measure()
      onScroll()
    }

    measure()
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [hours, first, last])

  const goto = (i: number, smooth = false) => {
    const el = items.current[i]
    if (!el) return
    setScroll(el.getBoundingClientRect().top + window.scrollY, smooth)
  }

  return (
    <section id="the-day" data-canvas="ink" className="relative bg-ink">
      <header className="u-pad pt-[clamp(4rem,12vh,8rem)] pb-[clamp(2.5rem,7vh,4.5rem)]">
        <ChapterMark n={1} title="The day" className="text-ash" />
        <div className="u-grid mt-[clamp(2rem,6vh,4rem)] gap-y-[clamp(1.25rem,3vh,2rem)]">
          <motion.h2
            {...reveal()}
            className="u-display col-span-12 text-balance lg:col-span-7"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
          >
            Fifteen hours.
            <span className="block text-ash">Seven of them are here.</span>
          </motion.h2>
          <motion.p {...rise(0.1)} className="u-mono col-span-12 max-w-[40ch] self-end text-ash lg:col-span-4 lg:col-start-9">
            One frame an hour, in the light of that hour. The clock on the right keeps the real distance between them.
          </motion.p>
        </div>
      </header>

      <TimeRail hours={hours} active={active} live={live} clock={clock} fill={fill} onPick={goto} />
      <HourSheet hours={hours} active={active} live={live} tally={tally} onPick={goto} />

      <ol>
        {hours.map((hour, i) => (
          <li key={hour.time}>
            <HourChapter
              hour={hour}
              index={i}
              total={hours.length}
              ref={(el) => {
                items.current[i] = el
              }}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}

/**
 * The rail. A hairline down the right edge with the seven hours marked on it,
 * the elapsed part filled, and the live time at the head. Wide screens only —
 * below the large breakpoint there is no room for it, and `HourSheet` folds the
 * same seven hours into the corner instead.
 */
function TimeRail({
  hours,
  active,
  live,
  clock,
  fill,
  onPick,
}: {
  hours: Hour[]
  active: number
  live: boolean
  clock: React.RefObject<HTMLSpanElement | null>
  fill: React.RefObject<HTMLSpanElement | null>
  onPick: (i: number) => void
}) {
  return (
    <nav
      aria-label="The hours"
      className="pointer-events-none fixed top-1/2 right-[var(--edge)] z-30 hidden -translate-y-1/2 transition-opacity duration-700 ease-[cubic-bezier(.16,1,.3,1)] lg:block"
      style={{ opacity: live ? 1 : 0 }}
    >
      <p className="u-mono mb-4 text-right text-clay-ink" style={{ fontSize: 'clamp(0.875rem,1.1vw,1.0625rem)' }}>
        <span ref={clock} aria-live="off">
          {hours[0].time}
        </span>
      </p>

      <ol className={`relative flex flex-col gap-[clamp(0.6rem,1.5vh,1.05rem)] ${live ? 'pointer-events-auto' : ''}`}>
        {/* The track, and the part of the day already behind you. */}
        <span aria-hidden className="absolute top-1 right-[3px] bottom-1 w-px bg-paper/15" />
        <span
          ref={fill}
          aria-hidden
          className="absolute top-1 right-[3px] bottom-1 w-px origin-top scale-y-0 bg-clay"
        />
        {hours.map((hour, i) => (
          <li key={hour.time} className="relative flex justify-end">
            {/* One accessible name on the button; everything inside it is
                decoration, or a screen reader hears the time twice. */}
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-current={i === active ? 'true' : undefined}
              aria-label={`${hour.time} — ${hour.line}`}
              className="group flex items-center gap-3"
            >
              <span
                aria-hidden
                className="u-mono whitespace-nowrap transition-[opacity,color] duration-[300ms] ease-[cubic-bezier(.16,1,.3,1)]"
                style={{
                  opacity: i === active ? 1 : 0.4,
                  color: i === active ? 'var(--color-cream)' : 'var(--color-dim)',
                }}
              >
                {hour.time}
              </span>
              <span
                aria-hidden
                className="block h-[7px] w-[7px] rounded-full border transition-[background-color,border-color,transform] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-125"
                style={{
                  background: i === active ? 'var(--color-clay)' : 'transparent',
                  borderColor: i === active ? 'var(--color-clay)' : 'rgba(238,229,214,0.4)',
                }}
              />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * The same rail, folded up for a narrow screen.
 *
 * Closed it is two lines of mono in the corner the chapter titling already
 * leaves empty — which hour you are in, and how far through the day. Tapped, it
 * unfolds the seven hours upward. It is the small-screen half of the pair: the
 * desktop rail is `hidden lg:block`, this is `lg:hidden`, and neither knows the
 * other exists.
 */
function HourSheet({
  hours,
  active,
  live,
  tally,
  onPick,
}: {
  hours: Hour[]
  active: number
  live: boolean
  tally: React.RefObject<HTMLSpanElement | null>
  onPick: (i: number, smooth?: boolean) => void
}) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  // Scrolling out of the day closes it, derived rather than set in an effect.
  if (open && !live) setOpen(false)

  const shut = (toTrigger = false) => {
    setOpen(false)
    if (toTrigger) trigger.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && shut(true)
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', key)
    window.addEventListener('pointerdown', away)
    return () => {
      window.removeEventListener('keydown', key)
      window.removeEventListener('pointerdown', away)
    }
  }, [open])

  return (
    <div
      ref={box}
      className="pointer-events-none fixed right-0 bottom-0 z-30 flex flex-col-reverse items-end transition-opacity duration-700 ease-[cubic-bezier(.16,1,.3,1)] lg:hidden"
      style={{
        opacity: live ? 1 : 0,
        // The home indicator and, in landscape, the notch.
        paddingRight: 'max(var(--gutter), env(safe-area-inset-right))',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + clamp(0.75rem, 2.2vh, 1.25rem))',
      }}
    >
      {/* The wash the open list reads against — the same light-shaping the
          chapters use on their own titling, not a panel. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 transition-opacity duration-500"
        style={{
          height: '27rem',
          opacity: open ? 1 : 0,
          background:
            'linear-gradient(to top, rgba(10,9,7,0.96) 0%, rgba(10,9,7,0.9) 34%, rgba(10,9,7,0.64) 68%, transparent 100%)',
        }}
      />

      {/* Closed: which hour, how far through. First in the DOM so Tab walks
          forward into the hours rather than backwards out of them — the
          container is `flex-col-reverse`, which puts it back on the bottom.
          Everything visible is marked decorative so the button has one clean
          name instead of reading its own numerals back twice. */}
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="roz-hours"
        className="pointer-events-auto flex flex-col items-end gap-[0.4rem] py-1 pl-8"
      >
        <span className="sr-only">
          {open ? 'Hide the hours. ' : 'Show all seven hours. '}
          Chapter {active + 1} of {hours.length}, {hours[active].time}.
        </span>
        <span aria-hidden className="flex items-baseline gap-2 leading-none">
          <span className="u-mono text-paper/40">
            {String(active + 1).padStart(2, '0')}
            <span className="opacity-60"> / {String(hours.length).padStart(2, '0')}</span>
          </span>
          <span
            className="u-mono text-clay-ink transition-colors duration-[250ms]"
            style={{ fontSize: 'clamp(0.875rem, 3.6vw, 1rem)' }}
          >
            {hours[active].time}
          </span>
        </span>
        {/* The affordance, and the day's progress, on one hairline. */}
        <span aria-hidden className="block h-px w-[4.25rem] bg-paper/20">
          <span ref={tally} className="block h-px w-full origin-left scale-x-0 bg-clay" />
        </span>
      </button>
      <AnimatePresence>
        {open && live && (
          <motion.ul
            id="roz-hours"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: reduced ? 0 : 0.34, ease: DISSOLVE }}
            className="pointer-events-auto mb-[clamp(0.6rem,1.6vh,0.9rem)] flex flex-col items-end"
          >
            {hours.map((hour, i) => (
              <li key={hour.time}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(i, !reduced)
                    setOpen(false)
                  }}
                  aria-current={i === active ? 'true' : undefined}
                  aria-label={`${hour.time} — ${hour.line}`}
                  className="flex items-center gap-2.5 py-[0.3rem] pl-6"
                >
                  <span
                    aria-hidden
                    className="u-mono transition-[color,opacity] duration-[250ms]"
                    style={{
                      color: i === active ? 'var(--color-cream)' : 'var(--color-dim)',
                      opacity: i === active ? 1 : 0.55,
                    }}
                  >
                    {hour.time}
                  </span>
                  <span
                    aria-hidden
                    className="block h-[5px] w-[5px] rounded-full border transition-colors duration-[250ms]"
                    style={{
                      background: i === active ? 'var(--color-clay)' : 'transparent',
                      borderColor: i === active ? 'var(--color-clay)' : 'rgba(238,229,214,0.35)',
                    }}
                  />
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

    </div>
  )
}

/** One hour: one photograph, one line, the light of that hour laid over it. */
const HourChapter = ({
  hour,
  index,
  total,
  ref,
}: {
  hour: Hour
  index: number
  total: number
  ref: (el: HTMLElement | null) => void
}) => {
  const local = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: local, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <article
      ref={(el) => {
        local.current = el
        ref(el)
      }}
      aria-labelledby={`hour-${hour.time.replace(':', '')}`}
      className="relative isolate flex h-[100svh] min-h-[32rem] flex-col justify-end overflow-clip"
    >
      {/* The frame comes up like a print in the tray, drifts, and settles out
          of a two-percent oversize — so it arrives last, under the titling
          rather than ahead of it. */}
      <motion.div {...uncover()} className="absolute inset-0 -z-10">
        <motion.div className="h-full w-full" style={reduced ? undefined : { y }}>
          <motion.div
            className="h-full w-full"
            initial={reduced ? false : { scale: 1.035 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 2.1, delay: 0.1, ease: DISSOLVE }}
          >
            <Frame
              id={hour.frame}
              alt={hour.alt}
              sizes="100vw"
              className="-mt-[6%] h-[112%] w-full"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* The hour's own light. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 mix-blend-soft-light"
        style={{ background: `linear-gradient(to bottom, ${hour.light[0]}, ${hour.light[1]})` }}
      />
      {/* And enough density under the type to read it. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(10,9,7,0.92) 0%, rgba(10,9,7,0.45) 30%, transparent 62%), linear-gradient(88deg, rgba(10,9,7,0.5) 0%, transparent 58%)',
        }}
      />

      <div className="u-pad u-grid items-end gap-y-6 pb-[clamp(2.5rem,8vh,5.5rem)]">
        <div className="col-span-12 lg:col-span-9">
          {/* The hour lands first. The line follows it. */}
          <motion.p
            {...rise(0, 12)}
            className="u-mono text-clay-ink"
            style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.5rem)', letterSpacing: '0.04em' }}
          >
            {hour.time}
          </motion.p>

          <motion.h3
            {...reveal(0.22, 20)}
            id={`hour-${hour.time.replace(':', '')}`}
            className="u-display mt-[clamp(0.5rem,1.4vh,1rem)] max-w-[18ch] text-balance text-paper uppercase"
            style={{ fontSize: 'clamp(1.875rem, 5.6vw, 4.75rem)', lineHeight: 0.98, letterSpacing: '0.005em' }}
          >
            {hour.line}
          </motion.h3>

          <motion.p
            {...rise(0.42, 14)}
            lang="hi"
            className="u-deva mt-[clamp(0.6rem,1.6vh,1.1rem)] text-cream/80"
            style={{ fontSize: 'clamp(1.0625rem, 1.9vw, 1.625rem)' }}
          >
            {hour.deva}
          </motion.p>
        </div>

        <motion.div
          {...fade(0.6, 1.2)}
          className="col-span-12 flex items-baseline gap-4 border-t border-paper/15 pt-3 lg:col-span-9"
        >
          <p className="u-mono max-w-[46ch] text-paper/70">{hour.note}</p>
          <p aria-hidden className="u-mono ml-auto shrink-0 text-paper/35">
            {String(index + 1).padStart(2, '0')}
            <span className="opacity-50"> / {String(total).padStart(2, '0')}</span>
          </p>
        </motion.div>
      </div>
    </article>
  )
}
