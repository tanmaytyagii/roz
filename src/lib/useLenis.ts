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
  if (instance) {
    // On a route change the document under Lenis has just been replaced, and
    // it clamps a jump to the height it last measured — which, coming from a
    // short document into a long one, lands the reader well above the mark.
    // Make it measure again first.
    instance.resize()
    instance.scrollTo(y, smooth ? { duration: 1.1 } : { immediate: true, force: true })
  } else {
    // `instant`, not the default: the stylesheet sets `scroll-behavior:
    // smooth` for touch, and without saying so a deep link would scroll
    // through the whole document on arrival instead of landing.
    window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'instant' })
  }
}

/**
 * The element a hash names. By id rather than as a selector: a chapter id is
 * `document-02/corner`, which is a perfectly good id and not a valid selector,
 * and a malformed hash in somebody's address bar should land on nothing
 * rather than throw.
 */
export function hashTarget(hash: string): HTMLElement | null {
  if (!hash || hash === '#') return null
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return null
  }
}

/**
 * Where a link to `target` should actually leave the reader.
 *
 * An id names the thing a link is about — an hour's line, say — but the page
 * reads by chapter: land on the heading alone and it sits under the bar with
 * its photograph scrolled away above it, which is not a place, just a scroll
 * position. So a target inside a `[data-chapter]` lands on the whole chapter,
 * and the offset is measured from layout rather than from the screen, so a
 * heading still mid-way through rising into place does not move the mark.
 * `scroll-margin-top` is honoured either way.
 */
export function landingFor(target: HTMLElement): number {
  const el = (target.closest('[data-chapter]') as HTMLElement | null) ?? target
  let y = 0
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop
  return Math.max(0, y - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0))
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
        const target = hashTarget(hash)
        if (!target) return
        e.preventDefault()
        // Lenis does not read `scroll-margin-top`, and because it owns every
        // in-page jump the browser never gets to. `landingFor` honours it, so
        // a section can keep itself clear of the fixed bar with one CSS
        // property — and a line inside a chapter lands on its chapter.
        const clear = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
        lenis?.scrollTo(landingFor(target) - (clear ? 8 : 0), { duration: 1.5 })
        // Preventing the default also cancels the browser moving focus into
        // the fragment, which is the whole point of a skip link. Do it by
        // hand, and lend the target a tabstop if it has none — otherwise the
        // reader is scrolled somewhere their keyboard has not gone.
        const el = target as HTMLElement
        if (!el.hasAttribute('tabindex') && !el.matches('a[href],button,input,select,textarea,[contenteditable]')) {
          el.setAttribute('tabindex', '-1')
        }
        el.focus({ preventScroll: true })
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
