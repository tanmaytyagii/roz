import { useEffect, useLayoutEffect, useState } from 'react'
import { setScroll } from './useLenis'

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

/**
 * Restores the scroll position a route was left at — or takes the top on a
 * fresh navigation. Two frames, because the incoming page has to lay out
 * before there is anywhere to scroll to.
 */
export function useScrollRestoration(key: string) {
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  useLayoutEffect(() => {
    const hash = window.location.hash
    let raf = 0
    const settle = () => {
      const target = hash ? document.querySelector(hash) : null
      if (target) setScroll(window.scrollY + target.getBoundingClientRect().top)
      else setScroll((history.state as HistoryState)?.y ?? 0)
    }
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(settle)
    })
    return () => cancelAnimationFrame(raf)
  }, [key])
}
