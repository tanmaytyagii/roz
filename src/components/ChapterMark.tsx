import { motion } from 'motion/react'
import { DISSOLVE, fade, reducedMotionNow } from '../lib/motion'

const DEVA_NUM = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
const toDeva = (n: number) =>
  String(n)
    .padStart(2, '0')
    .split('')
    .map((d) => DEVA_NUM[Number(d)])
    .join('')

/**
 * The chapter rule. Every section opens with one, so the page reads as a
 * sequence of chapters rather than a stack of blocks.
 */
export function ChapterMark({ n, title, className = '' }: { n: number; title: string; className?: string }) {
  return (
    <motion.div {...fade()} className={`flex items-center gap-[clamp(0.75rem,2vw,1.5rem)] ${className}`}>
      <span className="u-deva shrink-0 leading-none opacity-75" style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.375rem)' }} lang="hi">
        {toDeva(n)}
      </span>
      <span className="u-label shrink-0 opacity-70">{title}</span>
      <motion.span
        aria-hidden
        initial={reducedMotionNow() ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
        transition={{ duration: reducedMotionNow() ? 0 : 1.5, ease: DISSOLVE, delay: 0.1 }}
        className="block h-px min-w-0 flex-1 origin-left bg-current opacity-20"
      />
    </motion.div>
  )
}
