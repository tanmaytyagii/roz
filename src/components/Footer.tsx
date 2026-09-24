import { motion } from 'motion/react'
import { navHref } from '../data/stories'
import { IN_PRODUCTION, NEXT_NUMBER, READINGS, STATUS_LINE } from '../data/issue'
import { ISSUE } from '../data/relations'
import { RECORDISTS } from '../data/soundscapes'
import { FRAMES } from '../data/frames.generated'
import { Wordmark } from './Wordmark'
import { Link } from './Link'
import { useRoute } from '../lib/router'
import { fade, rise } from '../lib/motion'

/** Unique photographers, in the order their frames first appear. */
const PHOTOGRAPHERS = Array.from(
  new Map(
    Object.values(FRAMES)
      .filter((f) => f.credit)
      .map((f) => [f.credit!.creator, f.credit!]),
  ).values(),
)

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
  const home = useRoute().path === '/'

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
        <motion.nav {...fade(0.1, 1.2)} aria-label="Back matter" className="mt-[clamp(2rem,6vh,3.5rem)]">
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

        {/* The colophon. */}
        <dl className="mt-[clamp(3rem,8vh,5rem)]">
          <Entry label="Status">{STATUS_LINE}</Entry>

          <Entry label="Subjects">
            Every name, age, quote and answer in this issue is{' '}
            <span className="text-clay-ink">written for the prototype</span>. The people photographed are not the
            people described, and have not been interviewed or asked. Real subjects replace them before anything is
            published.
          </Entry>

          <Entry label="Photography">
            Licensed documentary work under Creative Commons, credited beside each frame. Frames are cropped and graded
            for this prototype; adaptations carry the licence of the original.
            <span className="mt-3 flex flex-wrap items-baseline">
              {PHOTOGRAPHERS.map((c, i) => (
                <span key={c.creator}>
                  <a
                    href={c.source}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-dim underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline"
                  >
                    {c.creator}
                  </a>
                  {/* Trailing, not leading: a wrapped line has to start with a
                      name rather than with somebody else's separator. */}
                  {i < PHOTOGRAPHERS.length - 1 && (
                    <span aria-hidden className="px-[0.45em] text-ash/25">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </span>
          </Entry>

          <Entry label="Recordings">
            Field recordings from Freesound, used under the terms each recordist chose and credited in the sound
            archive. None was made in the town its story is set in.
            <span className="mt-3 flex flex-wrap items-baseline">
              {RECORDISTS.map((c, i) => (
                <span key={c.creator}>
                  <a
                    href={c.source}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-dim underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline"
                  >
                    {c.creator}
                  </a>
                  {i < RECORDISTS.length - 1 && (
                    <span aria-hidden className="px-[0.45em] text-ash/25">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </span>
          </Entry>

          <Entry label="Type">Set in Instrument Serif, Archivo, DM Mono and Tiro Devanagari.</Entry>
        </dl>

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

/** One entry of the colophon: what it is about, and what there is to say. */
function Entry({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div {...fade(0, 1)} className="u-grid items-baseline gap-y-2 border-t border-paper/10 py-[clamp(1rem,2.6vh,1.5rem)]">
      <dt className="u-label col-span-12 text-dim sm:col-span-3 lg:col-span-2">{label}</dt>
      <dd className="u-mono col-span-12 max-w-[68ch] text-ash sm:col-span-9 lg:col-span-7 lg:col-start-4">{children}</dd>
    </motion.div>
  )
}
