import { motion } from 'motion/react'
import { STORIES } from '../data/stories'
import { Link } from '../components/Link'
import { rise } from '../lib/motion'

/**
 * Nothing here. Used for a person whose day is not built, and for an address
 * that matches nobody at all — the page says which, rather than quietly
 * serving the homepage under the wrong URL.
 */
export function NotFound({ slug }: { slug?: string }) {
  const known = slug ? STORIES.find((s) => s.slug === slug) : undefined
  return (
    <section
      data-canvas="ink"
      className="flex min-h-[100svh] flex-col justify-center bg-ink py-[clamp(6rem,18vh,12rem)]"
    >
      <div className="u-pad u-grid">
        <div className="col-span-12 lg:col-span-7 lg:col-start-2">
          <motion.p {...rise()} className="u-label text-clay-ink">
            Not built
          </motion.p>
          <motion.h1
            {...rise(0.06)}
            className="u-display mt-[clamp(1rem,3vh,2rem)] text-balance"
            style={{ fontSize: 'clamp(2.25rem, 7vw, 5.5rem)', lineHeight: 1 }}
          >
            {known ? `${known.name}'s day is being assembled.` : 'There is nothing at this address.'}
          </motion.h1>
          <motion.p {...rise(0.14)} className="u-mono mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[46ch] text-ash">
            {known
              ? 'They are in the archive, photographed and written. The day itself is still being made.'
              : 'It matches nothing in the archive — which is small, and says so.'}
          </motion.p>
          <motion.p {...rise(0.2)} className="mt-[clamp(2rem,6vh,3.5rem)]">
            <Link to="/people" className="group inline-flex items-center gap-3">
              <span className="u-label">Go to the archive</span>
              <span aria-hidden className="relative block h-px w-[clamp(2rem,4vw,3.25rem)] overflow-hidden bg-current/35">
                <span className="absolute inset-0 origin-left scale-x-0 bg-clay transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </span>
            </Link>
          </motion.p>
        </div>
      </div>
    </section>
  )
}
