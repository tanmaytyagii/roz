import { motion } from 'motion/react'
import { relationFor, tally } from '../data/relations'
import { readingFor } from '../data/issue'
import { Link } from './Link'
import { fade, rise } from '../lib/motion'

/**
 * WHAT ELSE THE ARCHIVE HOLDS ON THIS PERSON.
 *
 * The publication knows more about a subject than any one document shows: the
 * town their story is set in, the recordings that stand in for their
 * hours, and how much of their day has actually been set down. This draws
 * those threads as a ruled index rather than as a row of related-post cards —
 * and where a thread leads nowhere yet, it says so instead of hiding.
 *
 * `omit` is the document you are already reading, so it never points at itself.
 */
export function ArchiveRelation({
  slug,
  omit,
  tone = 'ink',
}: {
  slug: string
  omit?: 'story' | 'place' | 'sound'
  tone?: 'ink' | 'paper'
}) {
  const rel = relationFor(slug)
  if (!rel) return null
  const { story, status, place, sounds, holdings } = rel
  const open = status === 'available'
  const reading = readingFor(story.slug)

  const muted = tone === 'paper' ? 'text-slate' : 'text-dim'
  const rule = tone === 'paper' ? 'border-ink/12' : 'border-paper/12'
  const strong = tone === 'paper' ? 'text-ink' : 'text-cream'
  const accent = tone === 'paper' ? 'text-clay-paper' : 'text-clay-ink'

  return (
    <motion.div {...fade()}>
      <motion.p {...rise()} className={`u-label ${muted}`}>
        In the archive
      </motion.p>

      <ul className="mt-[clamp(0.75rem,2vh,1.25rem)]">
        {omit !== 'story' && (
          <Row label="Document" rule={rule} muted={muted}>
            {reading ? (
              <Link
                to={reading.path}
                className={`u-mono ${accent} underline-offset-[3px] transition-colors duration-[250ms] hover:underline`}
              >
                Document {reading.number} · {reading.doc.title} — {story.duration}
              </Link>
            ) : (
              <span className={`u-mono ${muted}`}>In production. A photograph and a premise so far.</span>
            )}
          </Row>
        )}

        {/* "Set in", not "photographed in": the photographs stand in for the
            town far more often than they were taken there, and the row should
            not claim otherwise. */}
        {omit !== 'place' && (
          <Row label="Set in" rule={rule} muted={muted}>
            {place ? (
              <Link
                to="/places"
                className={`u-mono ${strong} underline-offset-[3px] transition-colors duration-[250ms] hover:${accent} hover:underline`}
              >
                {place.short}
              </Link>
            ) : (
              <span className={`u-mono ${muted}`}>{story.place}</span>
            )}
          </Row>
        )}

        {omit !== 'sound' && (
          <Row label="Recordings" rule={rule} muted={muted}>
            {sounds.length ? (
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {sounds.map((s) => (
                  <Link
                    key={s.id}
                    // Straight to the hour it stands in for, not just to the
                    // top of the story.
                    to={open ? `/story/${story.slug}#hour-${s.at.replace(':', '')}` : '/sounds'}
                    className={`u-mono ${strong} underline-offset-[3px] transition-colors duration-[250ms] hover:underline`}
                  >
                    {s.at}
                  </Link>
                ))}
                <Link
                  to="/sounds"
                  className={`u-mono ${muted} underline-offset-[3px] transition-colors duration-[250ms] hover:underline`}
                >
                  ({tally(sounds.length)} in the sound archive)
                </Link>
              </span>
            ) : (
              <span className={`u-mono ${muted}`}>None yet.</span>
            )}
          </Row>
        )}

        <Row label="This document holds" rule={rule} muted={muted}>
          <span className={`u-mono ${muted} flex flex-wrap gap-x-4 gap-y-1`}>
            {holdings.map((h) => (
              <span key={h.label}>
                <span className={strong}>{tally(h.count)}</span> {h.label.toLowerCase()}
              </span>
            ))}
          </span>
        </Row>
      </ul>
    </motion.div>
  )
}

/** One line of the index: a label, a value, and a way there if there is one. */
function Row({
  label,
  rule,
  muted,
  children,
}: {
  label: string
  rule: string
  muted: string
  children: React.ReactNode
}) {
  return (
    <li className={`u-grid items-baseline gap-y-1 border-t ${rule} py-[clamp(0.6rem,1.6vh,1rem)]`}>
      <span className={`u-label col-span-12 ${muted} sm:col-span-3`}>{label}</span>
      <span className="col-span-12 sm:col-span-9">{children}</span>
    </li>
  )
}
