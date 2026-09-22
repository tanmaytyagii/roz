import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { STORIES, type Story } from '../../data/stories'
import { statusOf, type StoryStatus } from '../../data/story'
import { Frame, Credit } from '../Frame'
import { Link } from '../Link'
import { DISSOLVE, fade } from '../../lib/motion'

/**
 * THE INDEX.
 *
 * A contents page, not a grid of people. The names run down the left at
 * display size and one plate sits to the right of them, changing to whoever
 * the reader is on — a magazine index, where the photograph belongs to the
 * page rather than to the pointer. It answers focus as well as hover, so the
 * keyboard sees the same thing the mouse does.
 *
 * Nothing here knows who Raju is. A row reads louder because its story exists,
 * which `statusOf` answers from the registry; writing the next data file moves
 * that person up without this file changing.
 */

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'in-production', label: 'In production' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

const matches = (story: Story, filter: FilterId) => filter === 'all' || statusOf(story.slug) === filter

export function PeopleIndex() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [at, setAt] = useState<string | null>(null)
  const [near, setNear] = useState<string | null>(null)
  // Plates mount the first time they are asked for and stay mounted, so the
  // second pass over a name has no flash and the first costs one frame.
  const [seen, setSeen] = useState<Set<string>>(() => new Set([STORIES[0].slug]))
  const rows = useRef<Map<string, HTMLElement>>(new Map())

  const shown = STORIES.filter((s) => matches(s, filter))
  const count = (id: FilterId) => STORIES.filter((s) => matches(s, id)).length
  // Hover and focus win, because they are deliberate. Otherwise the plate
  // belongs to whichever name is closest to the middle of the screen.
  const plate = shown.find((s) => s.slug === (at ?? near)) ?? shown[0] ?? STORIES[0]

  const light = (slug: string) => {
    setAt(slug)
    setSeen((prev) => (prev.has(slug) ? prev : new Set(prev).add(slug)))
  }

  /**
   * Which name the reader is on. One rAF-throttled listener, writing state
   * only when the answer actually changes — the plate must not re-render the
   * list on every frame of a scroll.
   */
  useLayoutEffect(() => {
    let ticking = false
    let held: string | null = null

    const read = () => {
      ticking = false
      const middle = window.innerHeight / 2
      let best: string | null = null
      let closest = Infinity
      for (const [slug, el] of rows.current) {
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > window.innerHeight) continue
        const d = Math.abs(r.top + r.height / 2 - middle)
        if (d < closest) {
          closest = d
          best = slug
        }
      }
      if (best !== held) {
        held = best
        setNear(best)
      }
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // The filter changes which rows exist, so the reading has to start again.
  }, [filter])

  // Whatever the plate is showing has to be mounted to be seen. Derived during
  // render rather than in an effect: this is state caught up to a prop, not a
  // synchronisation with anything outside React.
  if (!seen.has(plate.slug)) setSeen((prev) => new Set(prev).add(plate.slug))

  return (
    <div className="u-pad pb-[clamp(4rem,12vh,8rem)]">
      {/* The index of the index. Three words, because the only distinction
          that matters to a reader is what they can read today. */}
      <div className="flex flex-wrap items-baseline gap-x-[clamp(1.25rem,3vw,2.5rem)] gap-y-2 border-t border-paper/12 pt-[clamp(1rem,2.6vh,1.5rem)]">
        <p className="u-label mr-auto text-dim">Index</p>
        {FILTERS.map((f) => {
          const on = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={on}
              className="u-label relative py-1 transition-colors duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)]"
              style={{ color: on ? 'var(--color-cream)' : 'var(--color-dim)' }}
            >
              {f.label}
              <span className="u-mono ml-2 opacity-50">{String(count(f.id)).padStart(2, '0')}</span>
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-px block h-px origin-left bg-clay transition-transform duration-[300ms] ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ transform: `scaleX(${on ? 1 : 0})` }}
              />
            </button>
          )
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} of {STORIES.length} subjects shown.
      </p>

      <div className="u-grid mt-[clamp(1.5rem,4vh,2.5rem)] gap-y-[clamp(2rem,5vh,3rem)]">
        <ol
          className="col-span-12 lg:col-span-7"
          onMouseLeave={() => setAt(null)}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((story) => (
              <motion.li
                key={story.slug}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.34, ease: DISSOLVE }}
              >
                <PersonRow
                  story={story}
                  dim={at !== null && at !== story.slug}
                  onEnter={() => light(story.slug)}
                  register={(el) => {
                    if (el) rows.current.set(story.slug, el)
                    else rows.current.delete(story.slug)
                  }}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>

        {/* The plate. One photograph for the whole index, travelling with the
            reader — never with the pointer. */}
        <figure className="col-span-12 hidden lg:col-span-4 lg:col-start-9 lg:block">
          <div className="sticky top-[clamp(6rem,16vh,9rem)]">
            {/* The photographs are decorative here — each one repeats a row the
                reader has already been given. The credit under them is not, and
                must stay in the accessibility tree, so `aria-hidden` goes on
                the stack rather than on the whole column. */}
            <div aria-hidden className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
              {STORIES.filter((s) => seen.has(s.slug)).map((s) => (
                <div
                  key={s.slug}
                  className="absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{
                    opacity: s.slug === plate.slug ? 1 : 0,
                    transform: s.slug === plate.slug ? 'scale(1)' : 'scale(1.03)',
                  }}
                >
                  <Frame
                    id={s.frame}
                    alt=""
                    position={s.focus}
                    sizes="32vw"
                    className="h-full w-full"
                  />
                </div>
              ))}
            </div>
            <figcaption className="u-mono mt-3 flex items-baseline gap-2 text-dim">
              <span aria-hidden className="text-clay-ink">{String(plate.index).padStart(2, '0')}</span>
              <span aria-hidden>{plate.name}</span>
              <span className="ml-auto">
                <span className="sr-only">Photograph: </span>
                <Credit id={plate.frame} />
              </span>
            </figcaption>
          </div>
        </figure>
      </div>
    </div>
  )
}

/**
 * One name in the contents. Available rows carry their sentence and a way in;
 * the rest carry a mark that says, when asked, what is actually happening to
 * them — which is not the same thing as a date nobody can keep.
 */
function PersonRow({
  story,
  dim,
  onEnter,
  register,
}: {
  story: Story
  dim: boolean
  onEnter: () => void
  register: (el: HTMLElement | null) => void
}) {
  const status: StoryStatus = statusOf(story.slug)
  const open = status === 'available'
  const [told, setTold] = useState(false)

  const titling = (
    <>
      <span className="flex flex-wrap items-baseline gap-x-[clamp(0.5rem,1.4vw,1rem)] gap-y-1">
        <span
          className="u-display transition-colors duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)]"
          style={{
            fontSize: 'clamp(1.75rem, 5.6vw, 4rem)',
            color: dim ? 'color-mix(in oklab, var(--color-cream) 34%, var(--color-ink))' : 'var(--color-cream)',
          }}
        >
          {story.name}
        </span>
        <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(0.9375rem, 1.7vw, 1.25rem)' }}>
          {story.nameDeva}
        </span>
      </span>
      <span className="u-mono mt-2 block text-dim">
        {story.occupation.replace(/^The /, '')}
        <span className="opacity-40"> · </span>
        {story.place}
      </span>
    </>
  )

  const body = (
    <>
      {/* The photograph rides in the row on a narrow screen, where there is no
          hover to ask for it and no room for a plate beside the names. */}
      <span className="col-span-4 block overflow-hidden lg:hidden">
        <Frame
          id={story.frame}
          alt={`${story.occupation.replace(/^The /, '')}, ${story.place}.`}
          position={story.focus}
          sizes="(max-width: 1024px) 30vw, 0px"
          className="w-full"
          style={{ aspectRatio: '1 / 1' }}
        />
      </span>

      {/* Name on the left, state on the right, the way a contents page sets a
          page number against a chapter. */}
      <span className="col-span-8 flex flex-col justify-center lg:col-span-12 lg:flex-row lg:items-start lg:justify-between lg:gap-[clamp(1.5rem,4vw,4rem)]">
        <span className="flex min-w-0 flex-col">
          <span className="u-mono mb-1 block text-dim/70 lg:mb-2">{String(story.index).padStart(2, '0')}</span>
          {titling}
          {open && <span className="u-mono mt-3 block max-w-[46ch] text-ash">{story.line}</span>}
        </span>

        <span className="mt-3 flex shrink-0 items-center gap-3 lg:mt-[clamp(1.9rem,3.6vw,3.1rem)]">
          <span
            className="u-label transition-colors duration-[300ms]"
            style={{ color: open ? 'var(--color-clay-ink)' : 'var(--color-dim)' }}
          >
            {open ? 'Enter story' : 'In production'}
          </span>
          <span aria-hidden className="relative block h-px w-[clamp(1.5rem,3vw,2.75rem)] overflow-hidden bg-current/25">
            <span
              className="absolute inset-0 origin-left scale-x-0 bg-clay transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
            />
          </span>
          {open && <span className="u-mono text-dim">{story.duration}</span>}
        </span>
      </span>
    </>
  )

  const shell =
    'group u-grid w-full items-center gap-x-[clamp(0.75rem,2vw,1.5rem)] gap-y-0 py-[clamp(1.5rem,4vh,2.75rem)] text-left'

  return (
    <div
      ref={register}
      className="border-t border-paper/12"
      onMouseEnter={onEnter}
      onFocusCapture={onEnter}
    >
      {open ? (
        <Link to={`/story/${story.slug}`} className={shell}>
          {body}
          <span className="sr-only">
            — {story.name}, {story.occupation}, {story.place}. Story available. {story.duration}.
          </span>
        </Link>
      ) : (
        <>
          <button type="button" onClick={() => setTold((v) => !v)} aria-expanded={told} className={shell}>
            {body}
            <span className="sr-only">
              — {story.name}, {story.occupation}, {story.place}. Story in production.
            </span>
          </button>
          <AnimatePresence initial={false}>
            {told && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: DISSOLVE }}
                className="u-mono overflow-hidden text-clay-ink"
              >
                <span className="block max-w-[52ch] pb-[clamp(1rem,3vh,1.75rem)]">
                  Photographed and written. The day itself — the hours, the work, the objects, the words — is still
                  being assembled.
                </span>
              </motion.p>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

/** The count, set as a line rather than as a statistic. */
export function IndexCount() {
  const available = STORIES.filter((s) => statusOf(s.slug) === 'available').length
  return (
    <motion.p {...fade(0.2, 1.2)} className="u-mono text-dim">
      {String(STORIES.length).padStart(2, '0')} subjects
      <span className="opacity-40"> · </span>
      <span className="text-clay-ink">{String(available).padStart(2, '0')} available to read</span>
    </motion.p>
  )
}
