import { motion } from 'motion/react'
import { NAV, navHref } from '../data/stories'
import { FRAMES } from '../data/frames.generated'
import { Wordmark } from './Wordmark'
import { Link } from './Link'
import { useRoute } from '../lib/router'
import { rise } from '../lib/motion'

/** Unique photographers, in the order their frames first appear. */
const PHOTOGRAPHERS = Array.from(
  new Map(
    Object.values(FRAMES)
      .filter((f) => f.credit)
      .map((f) => [f.credit!.creator, f.credit!]),
  ).values(),
)

export function Footer() {
  // The footer is on every document, and its section links are anchors into
  // the homepage. From anywhere else they have to carry the path with them or
  // they point at nothing.
  const home = useRoute().path === '/'

  return (
    <footer data-canvas="ink" className="bg-ink pt-[clamp(4rem,11vh,8rem)] pb-[clamp(1.5rem,4vh,2.5rem)]">
      <div className="u-pad">
        <motion.div {...rise()} className="border-t border-paper/12 pt-[clamp(2rem,6vh,4rem)]">
          <Wordmark size="lg" />
        </motion.div>

        <div className="u-grid mt-[clamp(2.5rem,7vh,5rem)] gap-y-[clamp(2rem,5vh,3rem)]">
          <nav aria-label="Footer" className="col-span-6 sm:col-span-3 lg:col-span-2">
            <p className="u-label mb-4 text-dim">Sections</p>
            <ul className="flex flex-col gap-2">
              {NAV.map((n) => (
                <li key={n.label}>
                  <Link
                    to={navHref(n.href, home)}
                    className="u-mono text-ash transition-colors duration-[250ms] hover:text-cream"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 sm:col-span-4 lg:col-span-3">
            <p className="u-label mb-4 text-dim">Status</p>
            <p className="u-mono max-w-[34ch] text-ash">
              Prototype. The homepage, and one story experience — Raju. The other six days, the site-wide soundscapes,
              the mosaic, the map and the archive are not built.
            </p>
          </div>

          <div className="col-span-12 sm:col-span-5 lg:col-span-4 lg:col-start-6">
            <p className="u-label mb-4 text-dim">Subjects</p>
            <p className="u-mono max-w-[40ch] text-ash">
              Every name, age, quote and answer on this site is <span className="text-clay-ink">written for the
              prototype</span>. The people photographed are not the people described, and have not been interviewed
              or asked. Real subjects replace them before anything is published.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-3 lg:col-start-10">
            <p className="u-label mb-4 text-dim">Photography</p>
            <p className="u-mono text-ash">
              Licensed documentary work under Creative Commons, credited beside each frame.
            </p>
            <ul className="mt-3 flex flex-wrap items-baseline">
              {PHOTOGRAPHERS.map((c, i) => (
                <li key={c.creator}>
                  <a
                    href={c.source}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="u-mono text-dim underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline"
                  >
                    {c.creator}
                  </a>
                  {/* Trailing, not leading: a wrapped line has to start with a
                      name rather than with somebody else's separator. */}
                  {i < PHOTOGRAPHERS.length - 1 && (
                    <span aria-hidden className="u-mono px-[0.45em] text-ash/25">
                      ·
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="u-mono mt-4 text-dim">
              Frames are cropped and graded for this prototype. Adaptations carry the licence of the original.
            </p>
          </div>
        </div>

        <div className="mt-[clamp(3rem,8vh,5rem)] flex flex-wrap items-baseline justify-between gap-4 border-t border-paper/12 pt-5">
          <p className="u-mono text-dim">© {new Date().getFullYear()} ROZ — a prototype.</p>
          <p className="u-deva text-dim" style={{ fontSize: '0.9375rem' }} lang="hi">
            हर दिन की एक कहानी।
          </p>
          <p className="u-label text-dim">Stories from the India you don't see.</p>
        </div>
      </div>
    </footer>
  )
}
