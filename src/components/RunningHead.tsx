import { ISSUE } from '../data/relations'
import { HEAD_BOX } from './DocumentNav'
import { Link } from './Link'

/**
 * THE RUNNING HEAD.
 *
 * The line a printed issue carries across the top of its pages: the
 * publication and the issue on one side, where you are in it on the other.
 * ROZ sets it on the pages that belong to the issue as a whole — the contents
 * and the back matter — in exactly the box each document's own opening line
 * uses, so the issue reads as one object whichever page it is open at.
 *
 * The small crosses at each end are registration marks: the only print cue on
 * the line, and quiet enough to be missed.
 *
 * `ghost` is the same line with nothing to press, for the page turn to set in
 * the dark just before the page it belongs to comes up under it.
 */
export function RunningHead({ where, to, ghost = false }: { where: string; to?: string; ghost?: boolean }) {
  const issue = (
    <>
      ROZ <span className="opacity-40">/</span> Issue {ISSUE.number}
    </>
  )
  return (
    <div className={`${HEAD_BOX} flex items-center gap-x-3 text-paper/70 sm:gap-x-4`} aria-hidden={ghost || undefined}>
      <Register />
      {to && !ghost ? (
        <Link
          to={to}
          className="u-mono shrink-0 whitespace-nowrap transition-colors duration-[250ms] hover:text-paper focus-visible:text-paper"
        >
          {issue}
          <span className="sr-only"> — return to the contents</span>
        </Link>
      ) : (
        <p className="u-mono shrink-0 whitespace-nowrap">{issue}</p>
      )}
      <span aria-hidden className="block h-px min-w-[1.5rem] flex-1 bg-current opacity-20" />
      <p className="u-mono shrink-0 whitespace-nowrap">{where}</p>
      <Register />
    </div>
  )
}

/** A registration cross, drawn in two hairlines. */
function Register() {
  return (
    <span aria-hidden className="relative block h-2.5 w-2.5 shrink-0 opacity-40">
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
    </span>
  )
}
