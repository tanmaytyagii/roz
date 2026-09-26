import { useEffect } from 'react'
import { motion } from 'motion/react'
import { STORIES } from '../data/stories'
import { Link } from '../components/Link'
import { ISSUE } from '../data/relations'
import { rise } from '../lib/motion'

/**
 * Nothing here. Used for a person whose document is not built, and for an address
 * that matches nobody at all — the page says which, rather than quietly
 * serving the homepage under the wrong URL.
 */
export function NotFound({ slug }: { slug?: string }) {
  const known = slug ? STORIES.find((s) => s.slug === slug) : undefined

  useEffect(() => {
    const was = document.title
    document.title = known ? `${known.name} — in production · ROZ` : `Not in Issue ${ISSUE.number} · ROZ`
    return () => {
      document.title = was
    }
  }, [known])
  return (
    <section
      data-canvas="ink"
      className="flex min-h-[100svh] flex-col justify-center bg-ink py-[clamp(6rem,18vh,12rem)]"
    >
      <div className="u-pad u-grid">
        <div className="col-span-12 lg:col-span-7 lg:col-start-2">
          <motion.p {...rise()} className="u-label text-clay-ink">
            {known ? 'In production' : `Not in Issue ${ISSUE.number}`}
          </motion.p>
          <motion.h1
            {...rise(0.06)}
            className="u-display mt-[clamp(1rem,3vh,2rem)] text-balance"
            style={{ fontSize: 'clamp(2.25rem, 7vw, 5.5rem)', lineHeight: 1 }}
          >
            {known ? `${known.name}'s document is not built.` : 'There is nothing at this address.'}
          </motion.h1>
          <motion.p {...rise(0.14)} className="u-mono mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[46ch] text-ash">
            {known
              ? 'The archive holds a photograph and a premise for it, and nothing more. It stays open rather than be invented.'
              : 'It matches nothing in the issue — which is small, and says so.'}
          </motion.p>
          <motion.p {...rise(0.2)} className="mt-[clamp(2rem,6vh,3.5rem)] flex flex-wrap gap-x-8 gap-y-4">
            {known && (
              <Link to={`/archive#unfinished/${known.slug}`} className="group inline-flex items-center gap-3">
                <span className="u-label">The production sheet</span>
                <Rule />
              </Link>
            )}
            <Link to="/#contents" className="group inline-flex items-center gap-3">
              <span className="u-label">Return to Issue {ISSUE.number}</span>
              <Rule />
            </Link>
          </motion.p>
        </div>
      </div>
    </section>
  )
}

/** The hairline that draws out under a way in. */
function Rule() {
  return (
    <span aria-hidden className="relative block h-px w-[clamp(2rem,4vw,3.25rem)] overflow-hidden bg-current/35">
      <span className="absolute inset-0 origin-left scale-x-0 bg-clay transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
    </span>
  )
}
