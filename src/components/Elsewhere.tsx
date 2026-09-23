import { motion } from 'motion/react'
import { DOCUMENTS } from '../data/issue'
import { Link } from './Link'
import { fade, rise } from '../lib/motion'

/**
 * The way out of a document, and into its siblings.
 *
 * Each index used to end differently — one sent you home, one to the people,
 * one to two of the three — so a reader could land in the archive and have no
 * way to the map except the bar at the top. This is the same row at the foot
 * of all of them: everything else in the issue, minus wherever you already
 * are, set as type rather than as cards.
 */
export function Elsewhere({ here }: { here: string }) {
  const rest = DOCUMENTS.filter((d) => d.path !== here)

  return (
    <section data-canvas="ink" aria-labelledby="elsewhere" className="relative bg-ink">
      <div className="u-pad py-[clamp(4rem,12vh,8rem)]">
        <motion.div {...fade()} className="border-t border-paper/12 pt-[clamp(1.5rem,4vh,2.5rem)]">
          <h2 id="elsewhere" className="u-label text-dim">
            Elsewhere in this issue
          </h2>

          <ul className="mt-[clamp(1.5rem,4vh,2.5rem)]">
            {rest.map((d, i) => (
              <motion.li key={d.id} {...rise(i * 0.05, 16)} className="border-t border-paper/10 first:border-t-0">
                <Link
                  to={d.path}
                  className="group u-grid items-baseline gap-y-1 py-[clamp(0.9rem,2.4vh,1.5rem)]"
                >
                  <span className="col-span-12 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:col-span-5 lg:col-span-4">
                    <span
                      className="u-display text-ash transition-[transform,color] duration-[500ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[0.06em] group-hover:text-cream group-focus-visible:text-cream"
                      style={{ fontSize: 'clamp(1.375rem, 3vw, 2.25rem)' }}
                    >
                      {d.title}
                    </span>
                    <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(0.875rem,1.3vw,1.0625rem)' }}>
                      {d.deva}
                    </span>
                  </span>
                  <span className="u-mono col-span-12 max-w-[46ch] text-dim sm:col-span-7 sm:col-start-6 lg:col-span-5">
                    {d.line}
                  </span>
                  <span className="u-mono col-span-12 text-dim/70 lg:col-span-2 lg:col-start-11 lg:text-right">
                    {d.tally}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>

          <motion.p {...fade(0.2, 1.2)} className="u-mono mt-[clamp(1.5rem,4vh,2.5rem)] text-dim">
            <Link
              to="/"
              className="underline-offset-[4px] transition-colors duration-[250ms] hover:text-cream hover:underline"
            >
              Back to the front
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
