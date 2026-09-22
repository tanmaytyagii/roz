import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { Story } from '../../data/stories'
import type { StoryDoc } from '../../data/story'
import { Frame, Credit } from '../Frame'
import { Link } from '../Link'
import { rise, usePrefersReducedMotion } from '../../lib/motion'

/**
 * The slate.
 *
 * The frame is the same negative as the spread on the homepage, re-cropped
 * wide — arriving here should feel like walking into the photograph you just
 * clicked, not like loading a different document. The titling is set as a film
 * slate: the name at scale, the particulars stacked under it in a mono column,
 * the line he is known for across the gutter.
 */
export function Opening({ story, doc }: { story: Story; doc: StoryDoc }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // The same three speeds as the homepage hero: the photograph barely moves,
  // the type leaves, the chrome goes first.
  const plateY = useTransform(scrollYProgress, [0, 1], ['0%', '13%'])
  const plateScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const typeY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const typeFade = useTransform(scrollYProgress, [0, 0.66], [1, 0])
  const chromeFade = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  return (
    <section
      ref={ref}
      id="story-top"
      data-canvas="ink"
      aria-labelledby="story-name"
      className="relative isolate flex h-[100svh] min-h-[36rem] flex-col overflow-clip"
    >
      <motion.div className="absolute inset-0 -z-10" style={reduced ? undefined : { y: plateY, scale: plateScale }}>
        <Frame id={doc.cover.frame} alt={doc.cover.alt} sizes="100vw" priority className="h-full w-full" />
      </motion.div>

      {/* Light shaping. Bottom-heavy, because the titling sits low. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,9,7,0.72) 0%, rgba(10,9,7,0.10) 24%, rgba(10,9,7,0.34) 52%, rgba(10,9,7,0.88) 86%, var(--color-ink) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(88deg, rgba(10,9,7,0.62) 0%, rgba(10,9,7,0.1) 46%, transparent 68%)' }}
      />

      {/* Top slate: where you are, and the way back. */}
      <motion.div
        style={reduced ? undefined : { opacity: chromeFade }}
        className="u-pad relative mt-[clamp(4.5rem,8vh,6.5rem)] flex flex-wrap items-baseline gap-x-6 gap-y-2"
      >
        <Link
          to="/#stories"
          className="group u-label inline-flex items-center gap-3 text-paper/70 transition-colors hover:text-paper"
        >
          <span aria-hidden className="relative block h-px w-[clamp(1.5rem,4vw,3rem)] overflow-hidden bg-current">
            <span className="absolute inset-0 origin-right scale-x-0 bg-clay transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
          </span>
          All stories
        </Link>
        <p className="u-mono ml-auto whitespace-nowrap text-paper/70">
          <span className="hidden sm:inline">
            Chapter two <span className="opacity-40">·</span> Story{' '}
          </span>
          {String(story.index).padStart(2, '0')}
          <span className="opacity-55"> / 07</span>
        </p>
      </motion.div>

      {/* The titling. */}
      <motion.div
        style={reduced ? undefined : { y: typeY, opacity: typeFade }}
        className="u-pad u-grid relative mt-auto items-end gap-y-[clamp(1.75rem,5vh,3rem)] pb-[clamp(1.75rem,5vh,3.5rem)]"
      >
        <div className="col-span-12 lg:col-span-7">
          <motion.h1
            id="story-name"
            {...rise(0, 26)}
            className="flex flex-wrap items-baseline gap-x-[clamp(0.7rem,1.8vw,1.75rem)] gap-y-1"
          >
            <span className="u-display text-paper" style={{ fontSize: 'clamp(4rem, 15vw, 13rem)' }}>
              {story.name}
            </span>
            <span
              lang="hi"
              className="u-deva text-cream/70"
              style={{ fontSize: 'clamp(1.5rem, 4.4vw, 3.75rem)' }}
            >
              {story.nameDeva}
            </span>
            <span className="sr-only">
              {' — '}
              {story.occupation}, {story.place}
            </span>
          </motion.h1>

          {/* The particulars, stacked and ruled, the way a slate is written. */}
          <motion.dl
            {...rise(0.1, 18)}
            className="mt-[clamp(1rem,2.6vh,1.75rem)] flex flex-wrap items-baseline gap-x-[clamp(1.25rem,3vw,2.75rem)] gap-y-2 border-t border-paper/20 pt-[clamp(0.75rem,1.8vh,1.25rem)]"
          >
            <div>
              <dt className="sr-only">Age</dt>
              <dd className="u-display text-paper" style={{ fontSize: 'clamp(1.5rem,2.6vw,2.25rem)' }}>
                {story.age}
              </dd>
            </div>
            <div>
              <dt className="sr-only">Trade</dt>
              <dd className="u-label text-paper/85">{story.occupation.replace(/^The /, '')}</dd>
            </div>
            <div>
              <dt className="sr-only">Place</dt>
              <dd className="u-label text-paper/85">{story.place}</dd>
            </div>
            <div className="ml-auto">
              <dt className="sr-only">In Devanagari</dt>
              <dd lang="hi" className="u-deva text-clay-ink" style={{ fontSize: 'clamp(1rem,1.7vw,1.375rem)' }}>
                {story.occupationDeva}
              </dd>
            </div>
          </motion.dl>
        </div>

        <motion.figure {...rise(0.2, 18)} className="col-span-12 lg:col-span-4 lg:col-start-9">
          <blockquote
            lang="hi"
            className="u-deva border-l border-clay/55 pl-[clamp(0.85rem,1.4vw,1.25rem)] text-cream"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.75rem)' }}
          >
            {doc.epigraph.deva}
          </blockquote>
          <figcaption className="u-mono mt-3 pl-[clamp(0.85rem,1.4vw,1.25rem)] text-paper/55">
            {doc.epigraph.gloss}
          </figcaption>
        </motion.figure>
      </motion.div>

      {/* Foot: the disclosure and the credit, on the same hairline. Small, but
          it is the first thing under the name and it is never hidden. */}
      <motion.div
        style={reduced ? undefined : { opacity: chromeFade }}
        className="u-pad relative flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-paper/12 py-[clamp(0.7rem,1.6vh,1.15rem)]"
      >
        <p className="u-mono text-paper/60">
          <span className="text-clay-ink">Demo subject</span>
          <span className="opacity-40"> · written for the prototype · </span>
          <Credit id={doc.cover.frame} />
        </p>
        <p className="u-label ml-auto flex items-center gap-3 text-paper/65">
          Scroll
          <span aria-hidden className="relative block h-6 w-px overflow-hidden bg-paper/25">
            <span
              className="absolute inset-x-0 h-2 bg-paper"
              style={{ animation: reduced ? undefined : 'roz-drip 2.6s cubic-bezier(.65,0,.35,1) infinite' }}
            />
          </span>
        </p>
      </motion.div>
    </section>
  )
}
