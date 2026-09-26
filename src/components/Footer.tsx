import { motion } from 'motion/react'
import { navHref } from '../data/stories'
import { IN_PRODUCTION, NEXT_NUMBER, READINGS } from '../data/issue'
import { ISSUE } from '../data/relations'
import { Wordmark } from './Wordmark'
import { Link } from './Link'
import { Colophon } from './Colophon'
import { useRoute } from '../lib/router'
import { fade, rise } from '../lib/motion'

/** The back of the issue, in the order a reader would look for it. */
const BACK = [
  { label: 'Issue', href: '#contents' },
  { label: 'Field archive', href: '/archive' },
  { label: 'People', href: '/people' },
  { label: 'Places', href: '/places' },
  { label: 'Sounds', href: '/sounds' },
  { label: 'About', href: '#about' },
] as const

/**
 * THE BACK MATTER.
 *
 * Not a site footer: the last page of an issue. The contents once more as a
 * single line of type, what the issue holds, and then the colophon — who made
 * what, under which terms, and what is written — set as ruled entries rather
 * than as columns of links.
 */
export function Footer() {
  // The footer is on every document, and some of its entries are anchors into
  // the homepage. From anywhere else they have to carry the path with them or
  // they point at nothing.
  const path = useRoute().path
  const home = path === '/'

  return (
    <footer data-canvas="ink" className="bg-ink pt-[clamp(4rem,11vh,8rem)] pb-[clamp(1.5rem,4vh,2.5rem)]">
      <div className="u-pad">
        <motion.div
          {...rise()}
          className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-t border-paper/12 pt-[clamp(2rem,6vh,4rem)]"
        >
          <Wordmark size="lg" />
          <p className="u-mono pb-[0.6em] text-dim">
            Issue {ISSUE.number}
            <span className="opacity-40"> · </span>
            still being assembled
          </p>
        </motion.div>

        {/* The contents, once more, as one line of type. */}
        <motion.nav {...fade(0.1, 1.2)} aria-label="The issue" className="mt-[clamp(2rem,6vh,3.5rem)]">
          <ul className="flex flex-wrap items-baseline gap-x-[clamp(1rem,2.6vw,2.25rem)] gap-y-2">
            {BACK.map((b) => (
              <li key={b.label}>
                <Link
                  to={navHref(b.href, home)}
                  className="u-display text-ash transition-colors duration-[250ms] hover:text-cream focus-visible:text-cream"
                  style={{ fontSize: 'clamp(1.375rem, 2.6vw, 2.25rem)' }}
                >
                  {b.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="u-mono mt-[clamp(1rem,2.6vh,1.5rem)] flex flex-wrap items-baseline gap-x-2 gap-y-1 text-dim">
            <span className="u-label mr-2 text-dim">In this issue</span>
            {READINGS.map((r, i) => (
              <span key={r.story.slug}>
                <Link
                  to={r.path}
                  className="underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline"
                >
                  Document {r.number} — {r.doc.title}
                </Link>
                {(i < READINGS.length - 1 || IN_PRODUCTION.length > 0) && <span className="opacity-40"> · </span>}
              </span>
            ))}
            {IN_PRODUCTION.length > 0 && <span>Document {NEXT_NUMBER} — in production</span>}
          </p>
        </motion.nav>

        {/* The colophon. On the field archive it is the last part of the page
            itself, in full, so the back of that page does not say it twice. */}
        {path !== '/archive' && <Colophon className="mt-[clamp(3rem,8vh,5rem)]" />}

        <div className="mt-[clamp(3rem,8vh,5rem)] flex flex-wrap items-baseline justify-between gap-4 border-t border-paper/12 pt-5">
          <p className="u-mono text-dim">
            © {new Date().getFullYear()} ROZ — a prototype
            <span className="opacity-40"> · </span>
            Issue {ISSUE.number}
          </p>
          <p className="u-deva text-dim" style={{ fontSize: '0.9375rem' }} lang="hi">
            हर दिन की एक कहानी।
          </p>
          <p className="u-label text-dim">Stories from the India you don't see.</p>
        </div>
      </div>
    </footer>
  )
}
