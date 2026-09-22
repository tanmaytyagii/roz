import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { Grain } from './components/Grain'
import { Home } from './pages/Home'
import { StoryPage } from './pages/StoryPage'
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

  const slug = STORY.exec(shown.path)?.[1]

  return (
    <>
      <Grain />
      <Navigation path={shown.path} />
      <main>
        {/* Keyed on the path, not the key: an in-page anchor must not remount
            the document underneath the reader. */}
        <motion.div
          key={shown.path}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: RISE / 1000, ease: DISSOLVE }}
        >
          {slug ? <StoryPage slug={slug} /> : <Home />}
        </motion.div>
      </main>
      <Footer />

      {/* The dip itself. Opacity on one viewport-sized layer — a page-wide
          blur would read the same and cost a full-document readback. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[65] bg-ink ease-[cubic-bezier(.65,0,.35,1)]"
        style={{
          opacity: dipping ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: `${dipping ? DIP : RISE}ms`,
        }}
      />
    </>
  )
}
