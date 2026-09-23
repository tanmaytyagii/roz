import { useEffect } from 'react'
import type LenisType from 'lenis'
import { usePrefersReducedMotion } from './motion'

/** The live instance, so unrelated UI can pause the page without prop-drilling. */
let instance: LenisType | null = null

/**
 * Move the page to an absolute offset. Lenis owns the scroll position while it
 * is running, so `window.scrollTo` would be animated straight back out again —
 * route changes have to go through the instance.
 *
 * Instant by default, because that is what a route change and a restored
 * reading position both want. `smooth` is for the one case where the travel
 * itself is the point: choosing an hour and being taken there.
 */
export function setScroll(y: number, smooth = false) {
  if (instance) instance.scrollTo(y, smooth ? { duration: 1.1 } : { immediate: true, force: true })
  else window.scrollTo(smooth ? { top: y, behavior: 'smooth' } : { top: y })
}

/** Freeze the page behind a full-screen overlay. Safe to call when Lenis is off. */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  if (locked) instance?.stop()
  else instance?.start()
}

/**
 * Smooth scrolling, but only where it is wanted: never with reduced motion on,
 * and never on touch, where the native scroller is better than anything we
 * could write.
 */
export function useLenis() {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let lenis: LenisType | null = null
    let raf = 0
    let dead = false
    let onClick: ((e: MouseEvent) => void) | null = null

    // Loaded off the critical path: the page scrolls natively until it lands,
    // and touch devices never pay for it at all.
    void import('lenis').then(({ default: Lenis }) => {
      if (dead) return
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        wheelMultiplier: 0.95,
        smoothWheel: true,
      })
      instance = lenis

      const tick = (time: number) => {
        lenis?.raf(time)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      // In-page anchors have to go through Lenis or they fight it.
      onClick = (e: MouseEvent) => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
        const hash = a?.getAttribute('href')
        if (!hash || hash === '#') return
        const target = document.querySelector(hash)
        if (!target) return
        e.preventDefault()
        // Lenis does not read `scroll-margin-top`, and because it owns every
        // in-page jump the browser never gets to. Honour it here so a section
        // can keep itself clear of the fixed bar with one CSS property,
        // whether or not Lenis is the one doing the scrolling.
        const clear = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
        lenis?.scrollTo(target as HTMLElement, { offset: -(clear + 8), duration: 1.5 })
        history.replaceState(null, '', hash)
      }
      document.addEventListener('click', onClick)
    })

    return () => {
      dead = true
      if (onClick) document.removeEventListener('click', onClick)
      cancelAnimationFrame(raf)
      lenis?.destroy()
      instance = null
    }
  }, [reduced])
}
