import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/** Read the preference synchronously, for the non-hook helpers below. */
export const reducedMotionNow = () =>
  typeof window !== 'undefined' && window.matchMedia(QUERY).matches

/**
 * Live reduced-motion preference. Read once on mount and kept in sync, so
 * switching the OS setting takes effect without a reload.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(reducedMotionNow)
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** True only for devices with a real pointer — gates the cursor and hover art. */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const on = () => setFine(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return fine
}

/** The house dissolve. Used for anything that reveals on scroll. */
export const DISSOLVE = [0.16, 1, 0.3, 1] as const

const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const

/**
 * The reveal primitives.
 *
 * With reduced motion on they return the *arrived* state with no animation and
 * no viewport dependency at all — nothing on this page is ever hidden behind
 * a scroll event. Without it, text rises once and stays.
 */
export const rise = (delay = 0, distance = 28) =>
  reducedMotionNow()
    ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: distance },
        whileInView: { opacity: 1, y: 0 },
        viewport: VIEWPORT,
        transition: { duration: 1.1, delay, ease: DISSOLVE },
      }

/** A frame uncovers itself upward, like a print coming up in the tray. */
export const uncover = (delay = 0) =>
  reducedMotionNow()
    ? { initial: false as const, animate: { clipPath: 'inset(0% 0 0 0)' }, transition: { duration: 0 } }
    : {
        initial: { clipPath: 'inset(100% 0 0 0)' },
        whileInView: { clipPath: 'inset(0% 0 0 0)' },
        viewport: { once: true, margin: '0px 0px -10% 0px' },
        transition: { duration: 1.35, delay, ease: DISSOLVE },
      }

/** A single line of a display heading, lifting into place. */
export const liftLine = (delay = 0, distance = '38%') =>
  reducedMotionNow()
    ? { initial: false as const, animate: { opacity: 1, y: '0%' }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: distance },
        whileInView: { opacity: 1, y: '0%' },
        viewport: VIEWPORT,
        transition: { duration: 1.15, delay, ease: DISSOLVE },
      }

/**
 * A heading arriving. Opacity, a small lift, and a mask wiping down over the
 * line — the three together read as film titling. The mask overshoots the box
 * by a third of an em at both ends so ascenders and descenders are never
 * clipped at rest.
 */
export const reveal = (delay = 0, distance = 22) =>
  reducedMotionNow()
    ? {
        initial: false as const,
        animate: { opacity: 1, y: 0, clipPath: 'inset(-0.34em -0.12em -0.34em 0)' },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: distance, clipPath: 'inset(100% -0.12em -0.34em 0)' },
        whileInView: { opacity: 1, y: 0, clipPath: 'inset(-0.34em -0.12em -0.34em 0)' },
        viewport: VIEWPORT,
        transition: { duration: 1.2, delay, ease: DISSOLVE },
      }

/** A plain fade, for rules and captions. */
export const fade = (delay = 0, duration = 1) =>
  reducedMotionNow()
    ? { initial: false as const, animate: { opacity: 1, scaleX: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: VIEWPORT,
        transition: { duration, delay, ease: DISSOLVE },
      }
