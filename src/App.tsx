import { Suspense, lazy, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { Grain } from './components/Grain'
import { DocumentHead, HEAD_ROW } from './components/DocumentNav'
import { readingFor } from './data/issue'
import { Home } from './pages/Home'

/**
 * The homepage is what arrives first, so it is the only document in the entry
 * chunk. The other four load on their way in — behind the dip, which is long
 * enough to cover a same-origin chunk, and prefetched on idle so in practice
 * they are already there before anybody clicks.
 */
const StoryPage = lazy(() => import('./pages/StoryPage').then((m) => ({ default: m.StoryPage })))
const PeoplePage = lazy(() => import('./pages/PeoplePage').then((m) => ({ default: m.PeoplePage })))
const PlacesPage = lazy(() => import('./pages/PlacesPage').then((m) => ({ default: m.PlacesPage })))
const SoundsPage = lazy(() => import('./pages/SoundsPage').then((m) => ({ default: m.SoundsPage })))
const ArchivePage = lazy(() => import('./pages/ArchivePage').then((m) => ({ default: m.ArchivePage })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))
import { useLenis } from './lib/useLenis'
import { useRoute, useScrollRestoration } from './lib/router'
import { DISSOLVE, usePrefersReducedMotion } from './lib/motion'

const STORY = /^\/story\/([a-z0-9-]+)$/

/** The room goes dark, then comes up. No spinner, no bar, no percentage. */
const DIP = 190
const RISE = 460

export default function App() {
  const route = useRoute()
  const reduced = usePrefersReducedMotion()
  // The document on screen, which lags the address bar by one dip.
  const [shown, setShown] = useState(route)

  useLenis()
  useScrollRestoration(shown.key)

  // A hash against the same document is an anchor, not a change of chapter,
  // and reduced motion never wants the dip at all.
  const dipping = route.path !== shown.path && !reduced
  if (route.key !== shown.key && !dipping) setShown(route)

  // Hold the old document up for exactly one dip, then swap under cover.
  useEffect(() => {
    if (!dipping) return
    const t = setTimeout(() => setShown(route), DIP)
    return () => clearTimeout(t)
  }, [dipping, route])

  // Warm the other documents once the first one is on screen and the browser
  // has nothing better to do, so a click lands on a chunk that is already here.
  useEffect(() => {
    let live = true
    const warm = () => {
      if (!live) return
      void import('./pages/PeoplePage')
      void import('./pages/PlacesPage')
      void import('./pages/SoundsPage')
      void import('./pages/StoryPage')
      void import('./pages/ArchivePage')
    }
    // requestIdleCallback is still missing on older Safari.
    const idle = 'requestIdleCallback' in window
    const handle = idle ? requestIdleCallback(warm, { timeout: 3000 }) : window.setTimeout(warm, 1800)
    return () => {
      live = false
      if (idle) cancelIdleCallback(handle as number)
      else clearTimeout(handle as number)
    }
  }, [])

  const slug = STORY.exec(shown.path)?.[1]
  // The document being turned to, if the next page is one.
  const bound = readingFor(STORY.exec(route.path)?.[1] ?? '')

  return (
    <>
      <Grain />
      <Navigation path={shown.path} />
      {/* The skip link's target, and the only landmark every route has. */}
      <main id="main" tabIndex={-1}>
        {/* Keyed on the path, not the key: an in-page anchor must not remount
            the document underneath the reader. */}
        <motion.div
          key={shown.path}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: RISE / 1000, ease: DISSOLVE }}
        >
          <Suspense fallback={null}>
            {slug ? (
              <StoryPage slug={slug} />
            ) : shown.path === '/' ? (
              <Home />
            ) : shown.path === '/people' ? (
              <PeoplePage />
            ) : shown.path === '/places' ? (
              <PlacesPage />
            ) : shown.path === '/sounds' ? (
              <SoundsPage />
            ) : shown.path === '/archive' ? (
              <ArchivePage />
            ) : (
              <NotFound />
            )}
          </Suspense>
        </motion.div>
      </main>
      <Footer />

      {/* The dip itself. Opacity on one viewport-sized layer — a page-wide
          blur would read the same and cost a full-document readback.

          Turning to a document, the dark carries that document's number, set
          in exactly the place its own opening line sets it: the page comes up
          under a number that is already there, so the turn reads as entering
          Document 02 rather than as loading a route. It adds no time. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[65] bg-ink ease-[cubic-bezier(.65,0,.35,1)]"
        style={{
          opacity: dipping ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: `${dipping ? DIP : RISE}ms`,
        }}
      >
        {bound && (
          <div className={HEAD_ROW}>
            <DocumentHead reading={bound} ghost />
          </div>
        )}
      </div>
    </>
  )
}
