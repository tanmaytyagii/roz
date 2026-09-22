import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { PLACES } from '../data/stories'
import { Frame } from './Frame'
import { ChapterMark } from './ChapterMark'
import { DISSOLVE, liftLine, rise, useFinePointer, usePrefersReducedMotion } from '../lib/motion'

/**
 * The premise, on paper. The page turns from film to print here, which is the
 * single biggest tonal shift on the homepage — everything after it alternates.
 */
export function Intro() {
  return (
    <section id="intro" data-canvas="paper" className="relative bg-paper text-ink">
      <div className="u-pad py-[clamp(4.5rem,13vh,10rem)]">
        <ChapterMark n={1} title="The premise" className="text-slate" />

        <div className="u-grid mt-[clamp(3rem,9vh,7rem)]">
          <Statement />
        </div>
      </div>

      <PlacesList />
    </section>
  )
}

function Statement() {
  const lines = ['India is often told', 'through its monuments,', 'its cities,', 'its celebrations.']
  return (
    <div className="col-span-12 lg:col-span-10 lg:col-start-2">
      <h2
        className="u-display text-balance"
        style={{ fontSize: 'clamp(2.25rem, 7.2vw, 6.75rem)', lineHeight: 0.98 }}
      >
        {lines.map((l, i) => (
          <motion.span key={l} {...liftLine(i * 0.085)} className="block text-slate">
            {l}
          </motion.span>
        ))}
        <motion.span {...liftLine(0.46)} className="mt-[0.34em] block text-ink">
          ROZ looks somewhere else.
        </motion.span>
      </h2>
    </div>
  )
}

/**
 * Six lines, six photographs. On a pointer device the frame follows the
 * cursor; on touch it sits in the row. Same content either way.
 */
function PlacesList() {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const floating = fine && !reduced

  const [active, setActive] = useState<number | null>(null)
  // Frames mount on first hover and stay mounted — no flash on the second pass.
  const [seen, setSeen] = useState<Set<number>>(new Set())
  const plate = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!floating) return
    const el = plate.current
    const host = wrap.current
    if (!el || !host) return
    let raf = 0
    const at = { x: 0, y: 0 }
    const to = { x: 0, y: 0 }
    let primed = false

    const move = (e: PointerEvent) => {
      to.x = e.clientX
      to.y = e.clientY
      if (!primed) {
        at.x = to.x
        at.y = to.y
        primed = true
      }
    }
    const tick = () => {
      at.x += (to.x - at.x) * 0.1
      at.y += (to.y - at.y) * 0.1
      el.style.transform = `translate3d(${at.x}px, ${at.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }
    host.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      host.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [floating])

  const light = (i: number | null) => {
    setActive(i)
    if (i !== null && !seen.has(i)) setSeen(new Set(seen).add(i))
  }

  return (
    <div className="relative">
      <ul ref={wrap} className="u-pad border-t border-ink/12">
        {PLACES.map((p, i) => (
          <motion.li
            key={p.text}
            {...rise(0, 20)}
            transition={{ duration: 1, delay: i * 0.05, ease: DISSOLVE }}
            className="border-b border-ink/12"
            onPointerEnter={floating ? () => light(i) : undefined}
            onPointerLeave={floating ? () => light(null) : undefined}
          >
            <div className="u-grid items-center gap-y-4 py-[clamp(1.25rem,3.4vh,2.6rem)]">
              <span className="u-mono col-span-2 text-slate sm:col-span-1">
                {String(i + 1).padStart(2, '0')}
              </span>

              <p
                className="u-display col-span-10 sm:col-span-7 lg:col-span-6"
                style={{
                  fontSize: 'clamp(1.5rem, 4.2vw, 3.5rem)',
                  color: active === null || active === i ? 'var(--color-ink)' : 'color-mix(in oklab, var(--color-ink) 28%, var(--color-paper))',
                  transition: 'color 700ms cubic-bezier(.16,1,.3,1)',
                }}
              >
                {p.text}
              </p>

              {/* Touch and reduced-motion get the photograph inline. */}
              {!floating && (
                <div className="col-span-12 sm:col-span-4 sm:col-start-9">
                  <Frame
                    id={p.frame}
                    alt={p.alt}
                    sizes="(max-width: 640px) 100vw, 30vw"
                    className="aspect-[3/2] w-full"
                  />
                </div>
              )}
            </div>
          </motion.li>
        ))}
      </ul>

      {floating && (
        <div
          ref={plate}
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-30 w-[clamp(15rem,22vw,22rem)]"
        >
          {PLACES.map((p, i) =>
            seen.has(i) ? (
              <div
                key={p.frame}
                className="absolute inset-x-0 top-0 transition-[opacity,transform] duration-[650ms] ease-[cubic-bezier(.16,1,.3,1)]"
                style={{
                  opacity: active === i ? 1 : 0,
                  transform: active === i ? 'scale(1) translateY(-50%)' : 'scale(0.94) translateY(-48%)',
                }}
              >
                <Frame id={p.frame} alt="" sizes="22vw" className="aspect-[3/2] w-full shadow-[0_2rem_5rem_-1.5rem_rgba(10,9,7,0.6)]" />
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}
