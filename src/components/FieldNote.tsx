import { motion } from 'motion/react'
import { fade, rise } from '../lib/motion'

/**
 * A FIELD NOTE.
 *
 * The publication's own voice, as distinct from the story's. Every document
 * ends up needing one — what is invented, where the photographs came from, why
 * the map is bad on purpose — and each had grown its own markup. This is the
 * one shape they all use: an index, a heading, a ruled column of prose, and
 * nothing else.
 *
 * It is deliberately the quietest thing on any page it appears on. A note that
 * competed with the work would be a different kind of dishonesty.
 */
export function FieldNote({
  n,
  title,
  children,
  tone = 'ink',
}: {
  /** The note's number within its document. */
  n: number
  title: string
  children: React.ReactNode
  tone?: 'ink' | 'paper'
}) {
  const muted = tone === 'paper' ? 'text-slate' : 'text-ash'
  const rule = tone === 'paper' ? 'border-ink/12' : 'border-paper/12'
  const mark = tone === 'paper' ? 'text-clay-paper' : 'text-clay-ink'

  return (
    <motion.aside {...fade()} className={`u-grid gap-y-3 border-t ${rule} pt-[clamp(1.25rem,3vh,2rem)]`}>
      <p className="u-mono col-span-2 text-dim sm:col-span-1">{String(n).padStart(2, '0')}</p>
      <p className={`u-label col-span-10 sm:col-span-3 ${mark}`}>{title}</p>
      <motion.div {...rise(0.06, 14)} className={`u-mono col-span-12 max-w-[72ch] ${muted} sm:col-span-7 sm:col-start-6`}>
        {children}
      </motion.div>
    </motion.aside>
  )
}
