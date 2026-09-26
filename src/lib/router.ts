import { useEffect, useLayoutEffect, useState } from 'react'
import { hashTarget, landingFor, setScroll } from './useLenis'

/**
 * The whole router. Pathnames, the History API, one event — no dependency.
 *
 * ROZ is a small, fixed set of documents: the homepage and one page per story.
 * Anything more than this would be scaffolding for its own sake.
 */

const PATH_CHANGED = 'roz:navigate'

/** Trailing slashes normalised away, so `/story/raju/` and `/story/raju` are one route. */
export const readPath = () => window.location.pathname.replace(/\/+$/, '') || '/'

type HistoryState = { y?: number } | null

export type Route = {
  /** `/story/raju` — what decides which document renders. */
  path: string
  /** `#stories`, or '' — what decides where on it you land. */
  hash: string
  /** Both together, for effects that have to re-run on either. */
  key: string
}

const readRoute = (): Route => {
  const path = readPath()
  const hash = window.location.hash
  return { path, hash, key: path + hash }
}

/** The live route. */
export function useRoute(): Route {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const sync = () => setRoute((r) => {
      const next = readRoute()
      return r.key === next.key ? r : next
    })
    window.addEventListener('popstate', sync)
    window.addEventListener(PATH_CHANGED, sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener(PATH_CHANGED, sync)
    }
  }, [])
  return route
}

/**
 * Go somewhere. `to` may carry a hash — `/#stories` returns to the homepage and
 * lands on the stories section, which is how a story hands you back.
 *
 * The scroll position of the page being left is written into its own history
 * entry first, so Back returns to the frame you were looking at rather than to
 * the top of a page you have already read.
 */
export function navigate(to: string) {
  const [pathname, hash] = to.split('#')
  const next = (pathname.replace(/\/+$/, '') || '/') + (hash ? `#${hash}` : '')
  const here = readPath() + window.location.hash
  if (next === here) return
  history.replaceState({ ...(history.state as object), y: window.scrollY }, '')
  history.pushState({ y: 0 } satisfies HistoryState, '', next)
  window.dispatchEvent(new Event(PATH_CHANGED))
}

const RELOAD_KEY = 'roz:reading-position'

/**
 * Where the keyboard goes when a page or a place on it arrives. The scroll
 * is done by hand here, so the browser never moves its own starting point:
 * without this, a reader following a link from the keyboard is left on the
 * body, and a deep link starts its first Tab from the top of the page.
 *
 * A place on a page takes the focus itself; a new page gives it to `main`,
 * which every route has. The very first page of a visit with no place asked
 * for is left alone, so the skip link is still the first thing Tab reaches.
 */
let arrived = false
function placeFocus(target: HTMLElement | null) {
  const first = !arrived
  arrived = true
  const el = target ?? (first ? null : document.getElementById('main'))
  if (!el) return
  if (!el.hasAttribute('tabindex') && !el.matches('a[href],button,input,select,textarea,[contenteditable]')) {
    el.setAttribute('tabindex', '-1')
  }
  el.focus({ preventScroll: true })
}

/**
 * Where the reader was when this page was last put away — but only on a
 * genuine reload of the same address, and only once, so an ordinary visit
 * never inherits somebody else's scroll position.
 */
let reloadChecked = false
function reloadedAt(key: string): number | undefined {
  if (reloadChecked) return undefined
  reloadChecked = true
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (nav?.type !== 'reload') return undefined
    const kept = JSON.parse(sessionStorage.getItem(RELOAD_KEY) ?? 'null') as { key: string; y: number } | null
    return kept && kept.key === key ? kept.y : undefined
  } catch {
    return undefined
  }
}

/**
 * Restores the scroll position a route was left at — or takes the top on a
 * fresh navigation. Two frames, because the incoming page has to lay out
 * before there is anywhere to scroll to.
 */
export function useScrollRestoration(key: string) {
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    // Manual restoration only knows a position that was written down, and a
    // position is otherwise only written when a link is followed. Note it when
    // the page is put away too, so a refresh returns the reader to where they
    // were rather than to the top. Session storage rather than history state:
    // a history write made while the page is being hidden is discarded.
    const keep = () => {
      try {
        sessionStorage.setItem(RELOAD_KEY, JSON.stringify({ key: readPath() + window.location.hash, y: window.scrollY }))
      } catch {
        // Storage can be unavailable; a refresh then starts at the top, as before.
      }
    }
    window.addEventListener('pagehide', keep)
    return () => window.removeEventListener('pagehide', keep)
  }, [])

  useLayoutEffect(() => {
    const hash = window.location.hash
    // Set when the reader left this entry by following a link (`navigate`
    // writes it on the way out), and zero on a fresh arrival. Coming back, it
    // wins over the hash: Back returns to what they were reading, not to
    // wherever the link that first brought them here pointed.
    const remembered = (history.state as HistoryState)?.y ?? reloadedAt(key) ?? 0
    let raf = 0
    let tries = 0

    const settle = () => {
      // A document arriving from a lazy chunk is not in the DOM the frame the
      // route changes, so a deep link — a recording pointing at the hour of
      // the day it stands in for — would find nothing and fall back to the
      // top. Wait for the target rather than guess, but not forever: about a
      // second, then take the remembered position instead.
      const target = hashTarget(hash)
      if (target) {
        // The target existing is also the sign the document has laid out, so
        // a remembered position waits for it too.
        setScroll(remembered || landingFor(target))
        placeFocus(target)
        return
      }
      if (hash && tries < 60) {
        tries += 1
        raf = requestAnimationFrame(settle)
        return
      }
      // The same patience for a remembered position: a lazily loaded document
      // is not tall enough to hold it on its first frame, and a jump clamped to
      // a short page is then carried off by scroll anchoring as the document
      // grows in above the footer.
      const room = document.documentElement.scrollHeight - window.innerHeight
      if (remembered > room && tries < 60) {
        tries += 1
        raf = requestAnimationFrame(settle)
        return
      }
      setScroll(remembered)
      placeFocus(null)
    }

    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(settle)
    })
    return () => cancelAnimationFrame(raf)
  }, [key])
}
