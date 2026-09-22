import { useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import type { Story } from '../data/stories'
import { isAvailable } from '../data/story'
import { Frame, Credit } from './Frame'
import { Link } from './Link'
import { DISSOLVE, rise, uncover, usePrefersReducedMotion } from '../lib/motion'

const DEVA_NUM = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
const deva = (n: number) =>
  String(n)
    .padStart(2, '0')
    .split('')
    .map((d) => DEVA_NUM[Number(d)])
    .join('')

/** The same mark either way: a link where the day exists, an admission where it does not. */
function EnterStory({ story }: { story: Story }) {
  const [told, setTold] = useState(false)
  const built = isAvailable(story.slug)

  const mark = (
    <>
      <span className="u-label">Enter story</span>
      <span aria-hidden className="relative block h-px w-[clamp(2rem,4vw,3.25rem)] overflow-hidden bg-current/35">
        <span className="absolute inset-0 origin-left scale-x-0 bg-clay transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
      </span>
      <span className="u-mono opacity-45">{story.duration}</span>
    </>
  )

  if (built) {
    return (
      <Link
        to={`/story/${story.slug}`}
        className="group inline-flex w-fit items-center gap-3"
      >
        {mark}
      </Link>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setTold((v) => !v)}
        aria-expanded={told}
        className="group inline-flex w-fit items-center gap-3"
      >
        {mark}
      </button>
      <AnimatePresence initial={false}>
        {told && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: DISSOLVE }}
            className="u-mono overflow-hidden text-clay-ink"
          >
            This day is still being built. Raju's is the one that is finished.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Titling({ story, tone }: { story: Story; tone: 'ink' | 'paper' }) {
  const muted = tone === 'paper' ? 'text-paper/70' : 'text-slate'
  return (
    <>
      <motion.p {...rise(0, 16)} className="u-label text-clay-ink">
        {story.occupation}
      </motion.p>

      <motion.h3
        {...rise(0.06, 22)}
        id={`story-${story.slug}`}
        className="mt-[clamp(0.5rem,1.4vh,1rem)] flex flex-wrap items-baseline gap-x-[clamp(0.6rem,1.4vw,1.5rem)] gap-y-1"
      >
        <span className="u-display" style={{ fontSize: 'clamp(2.75rem, 8.5vw, 7rem)' }}>
          {story.name}
        </span>
        <span className={`u-deva ${muted}`} style={{ fontSize: 'clamp(1.125rem, 2.6vw, 2.25rem)' }} lang="hi">
          {story.nameDeva}
        </span>
        <span className="sr-only">
          {' — '}
          {story.occupation}, {story.place}
        </span>
      </motion.h3>

      <motion.p {...rise(0.12, 16)} className={`u-mono mt-[clamp(0.4rem,1vh,0.85rem)] ${muted}`}>
        {story.place} <span className="opacity-40">·</span> {story.age} <span className="opacity-40">·</span>{' '}
        <span lang="hi" className="u-deva">
          {story.occupationDeva}
        </span>
      </motion.p>
    </>
  )
}

function Body({ story, tone }: { story: Story; tone: 'ink' | 'paper' }) {
  return (
    <>
      <motion.p
        {...rise(0.18, 16)}
        className="u-lede mt-[clamp(1.25rem,3vh,2.25rem)] max-w-[32ch] text-pretty"
        style={{ color: tone === 'paper' ? 'rgba(238,229,214,0.82)' : 'var(--color-cream)' }}
      >
        {story.line}
      </motion.p>

      <motion.blockquote
        {...rise(0.24, 16)}
        lang="hi"
        className="u-deva mt-[clamp(1rem,2.4vh,1.75rem)] max-w-[28ch] border-l border-clay/45 pl-[clamp(0.75rem,1.4vw,1.25rem)]"
        style={{ fontSize: 'clamp(1rem, 1.5vw, 1.3125rem)', color: tone === 'paper' ? 'rgba(238,229,214,0.7)' : 'var(--color-ash)' }}>
        {story.quote}
      </motion.blockquote>
    </>
  )
}

/** Variant one: the photograph is the page. */
export function BleedSpread({
  story,
  align = 'left',
  height = '100svh',
}: {
  story: Story
  align?: 'left' | 'right'
  height?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])
  const right = align === 'right'

  return (
    // Two layouts, not one layout shrunk. On a wide screen the photograph is
    // the page and the titling sits on it. On a phone the photograph is a
    // portrait plate and the titling follows it, which is how a vertical
    // documentary actually reads.
    <article
      ref={ref}
      aria-labelledby={`story-${story.slug}`}
      className="relative isolate overflow-clip lg:flex lg:min-h-[var(--bleed-h)] lg:flex-col lg:justify-end"
      style={{ '--bleed-h': height } as CSSProperties}
    >
      <motion.div
        className="relative aspect-[3/4] w-full sm:aspect-[4/3] lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto"
        style={reduced ? undefined : { y }}
      >
        <Frame
          id={story.frame}
          alt={`${story.occupation}, ${story.place}.`}
          sizes="100vw"
          position={story.focus}
          className="h-full w-full lg:-mt-[5%] lg:h-[110%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(to top, rgba(10,9,7,0.85) 0%, transparent 34%)' }}
        />
      </motion.div>

      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden lg:block"
        style={{
          background: right
            ? 'linear-gradient(285deg, rgba(10,9,7,0.85) 0%, rgba(10,9,7,0.35) 46%, transparent 72%), linear-gradient(to top, rgba(10,9,7,0.9) 0%, transparent 52%)'
            : 'linear-gradient(75deg, rgba(10,9,7,0.85) 0%, rgba(10,9,7,0.35) 46%, transparent 72%), linear-gradient(to top, rgba(10,9,7,0.9) 0%, transparent 52%)',
        }}
      />

      {/* The index, set as a watermark in the opposite corner to the titling. */}
      <motion.span
        aria-hidden
        {...rise(0, 0)}
        className={`u-deva pointer-events-none absolute top-[clamp(4.5rem,11vh,8rem)] text-paper/20 ${
          right ? 'left-[var(--edge)]' : 'right-[var(--edge)]'
        }`}
        style={{ fontSize: 'clamp(3rem, 9vw, 8rem)', lineHeight: 1 }} lang="hi">
        {deva(story.index)}
      </motion.span>

      <div className="u-pad u-grid gap-y-[clamp(1.5rem,4vh,3rem)] pt-[clamp(2rem,5vh,3rem)] pb-[clamp(2.5rem,6vh,4rem)] lg:pt-[clamp(6rem,18vh,12rem)]">
        <div className={`col-span-12 lg:col-span-7 ${right ? 'lg:col-start-6 lg:text-right' : ''}`}>
          <div className={right ? 'lg:flex lg:flex-col lg:items-end' : ''}>
            <Titling story={story} tone="paper" />
            <Body story={story} tone="paper" />
          </div>
        </div>

        <div
          className={`col-span-12 flex flex-col justify-end gap-[clamp(0.75rem,2vh,1.25rem)] lg:col-span-4 ${
            right ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-9 lg:items-end'
          }`}
        >
          <EnterStory story={story} />
          <p className={`u-mono max-w-[34ch] text-paper/65 ${right ? '' : 'lg:text-right'}`}>
            <span className="text-clay-ink">Demo subject</span>
            <span className="opacity-40"> · </span>
            <Credit id={story.frame} />
          </p>
        </div>
      </div>
    </article>
  )
}

/** Variant two: the photograph is a plate, set into the page with air around it. */
export function PlateSpread({ story, side = 'left' }: { story: Story; side?: 'left' | 'right' }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['4%', '-4%'])
  const left = side === 'left'

  return (
    <article
      ref={ref}
      aria-labelledby={`story-${story.slug}`}
      className="u-pad u-grid items-center gap-y-[clamp(2rem,6vh,4rem)] border-t border-paper/10 py-[clamp(4rem,12vh,9rem)]"
    >
      <motion.figure
        {...uncover()}
        className={`col-span-12 sm:col-span-8 lg:col-span-5 ${
          left ? 'sm:col-start-1 lg:col-start-1' : 'sm:col-start-5 lg:col-start-8 lg:row-start-1'
        }`}
      >
        <motion.div
          className="group overflow-hidden"
          style={reduced ? undefined : { y }}
        >
          <Frame
            id={story.frame}
            alt={`${story.occupation}, ${story.place}.`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 40vw"
            className="w-full transition-[transform,filter] duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] group-hover:brightness-[1.04] group-hover:contrast-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            style={{ aspectRatio: '4 / 5' }}
          />
        </motion.div>
        <figcaption className="u-mono mt-3 text-dim">
          <span className="text-clay-ink">Demo subject</span>
          <span className="opacity-40"> · </span>
          <Credit id={story.frame} />
        </figcaption>
      </motion.figure>

      <div
        className={`col-span-12 lg:col-span-5 ${
          left ? 'lg:col-start-7' : 'lg:col-start-2 lg:row-start-1'
        }`}
      >
        <div className="flex items-baseline gap-4">
          <span aria-hidden className="u-deva text-dim" style={{ fontSize: 'clamp(1.75rem,3.4vw,3rem)' }} lang="hi">
            {deva(story.index)}
          </span>
          <span aria-hidden className="h-px flex-1 bg-paper/15" />
        </div>
        <div className="mt-[clamp(1rem,2.6vh,2rem)]">
          <Titling story={story} tone="ink" />
          <Body story={story} tone="ink" />
          <div className="mt-[clamp(1.5rem,3.4vh,2.5rem)]">
            <EnterStory story={story} />
          </div>
        </div>
      </div>
    </article>
  )
}
