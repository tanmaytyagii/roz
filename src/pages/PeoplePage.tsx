import { useEffect } from 'react'
import { motion } from 'motion/react'
import { STORIES } from '../data/stories'
import { statusOf } from '../data/story'
import { Frame, Credit } from '../components/Frame'
import { ChapterMark } from '../components/ChapterMark'
import { Link } from '../components/Link'
import { Elsewhere } from '../components/Elsewhere'
import { PeopleIndex, IndexCount } from '../components/people/PeopleIndex'
import { fade, reveal, rise, uncover } from '../lib/motion'
import { inWords } from '../lib/words'

/**
 * PEOPLE — the archive.
 *
 * A contents page for a publication that is mostly still being made. It says
 * so: seven subjects, those readable today, and the rest marked
 * with what is actually happening to them rather than with a date.
 *
 * Everything on it is read from `STORIES` and the story registry. There is no
 * list of names in this file.
 */
export function PeoplePage() {
  const available = STORIES.filter((s) => statusOf(s.slug) === 'available')

  useEffect(() => {
    const was = document.title
    document.title = 'People — रोज़ · ROZ'
    return () => {
      document.title = was
    }
  }, [])

  return (
    <article>
      {/* ── The slate ───────────────────────────────────────────────── */}
      <section id="people-top" data-canvas="ink" className="relative bg-ink">
        <div className="u-pad pt-[clamp(6rem,18vh,11rem)] pb-[clamp(3rem,9vh,6rem)]">
          <ChapterMark n={1} title="The archive" className="text-ash" />

          <div className="u-grid mt-[clamp(2.5rem,8vh,5.5rem)] items-end gap-y-[clamp(1.5rem,4vh,2.5rem)]">
            <h1 className="col-span-12 lg:col-span-7">
              <motion.span
                {...reveal()}
                className="u-display block text-paper"
                style={{ fontSize: 'clamp(3.5rem, 13vw, 11rem)', lineHeight: 0.9 }}
              >
                People
              </motion.span>
              <motion.span
                {...reveal(0.1)}
                lang="hi"
                className="u-deva mt-[0.12em] block text-ash"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 4rem)' }}
              >
                लोग
              </motion.span>
            </h1>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <motion.p
                {...rise(0.16)}
                className="u-display text-balance text-cream"
                style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.875rem)', lineHeight: 1.2 }}
              >
                People who make the everyday possible.
              </motion.p>
              <div className="mt-[clamp(1rem,2.6vh,1.5rem)]">
                <IndexCount />
              </div>
            </div>
          </div>
        </div>

        {/* A photographic interruption between the title and the contents —
            the work itself, before any of the names for it. */}
        <motion.figure {...uncover()} className="relative">
          <Frame
            id="scaffold"
            alt="Workers on bamboo scaffolding lashed across the front of an unfinished building."
            sizes="100vw"
            className="h-[clamp(14rem,42vh,26rem)] w-full"
            position="center 46%"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, var(--color-ink) 0%, transparent 26%, transparent 62%, rgba(10,9,7,0.88) 100%)',
            }}
          />
          <figcaption className="u-pad absolute inset-x-0 bottom-0 pb-[clamp(0.75rem,2vh,1.25rem)]">
            <p className="u-mono text-paper/60">
              <span className="text-clay-ink">Seven days, one city at a time.</span>
              <span className="opacity-40"> · </span>
              <Credit id="scaffold" />
            </p>
          </figcaption>
        </motion.figure>
      </section>

      {/* ── The contents ────────────────────────────────────────────── */}
      <section id="index" data-canvas="ink" className="relative bg-ink">
        <div className="u-pad pt-[clamp(3.5rem,10vh,7rem)] pb-[clamp(1.5rem,4vh,2.5rem)]">
          <div className="u-grid items-end gap-y-[clamp(1.25rem,3vh,2rem)]">
            <motion.h2
              {...reveal()}
              className="u-display col-span-12 text-balance lg:col-span-7"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 4rem)', lineHeight: 1.02 }}
            >
              {available.length === STORIES.length
                ? 'Every day, in full.'
                : `${inWords(available.length, true)} ${available.length === 1 ? 'day is' : 'days are'} finished.`}
              <span className="block text-ash">The rest are being assembled.</span>
            </motion.h2>
            <motion.p
              {...rise(0.1)}
              className="u-mono col-span-12 max-w-[42ch] self-end text-ash lg:col-span-4 lg:col-start-9"
            >
              A day at a time, in the order they were photographed. Names stay where they are; the plate follows
              whoever you are reading.
            </motion.p>
          </div>
        </div>

        <PeopleIndex />
      </section>

      {/* ── The note ────────────────────────────────────────────────── */}
      <section data-canvas="paper" className="relative bg-paper text-ink">
        <div className="u-pad py-[clamp(4rem,12vh,8rem)]">
          <ChapterMark n={2} title="A note on the cast" className="text-slate" />
          <div className="u-grid mt-[clamp(2.5rem,7vh,4.5rem)] gap-y-[clamp(1.5rem,4vh,2.5rem)]">
            <motion.h2
              {...reveal()}
              className="u-display col-span-12 text-balance lg:col-span-6"
              style={{ fontSize: 'clamp(1.5rem, 3.6vw, 2.75rem)', lineHeight: 1.12 }}
            >
              Nobody here has been interviewed yet.
            </motion.h2>
            <motion.div {...rise(0.1)} className="col-span-12 lg:col-span-5 lg:col-start-8">
              <p className="u-mono max-w-[56ch] text-slate">
                Every name, age, trade and sentence in this archive is <span className="text-clay-paper">written for
                the prototype</span>. The photographs are real, licensed documentary work by the photographers credited
                beside each frame — the people in them are not the people described here, have not been asked, and have
                agreed to nothing. Commissioned photography, actual interviews and signed permissions replace all of it
                before ROZ is published.
              </p>
              <p className="u-mono mt-[clamp(1rem,2.6vh,1.5rem)] max-w-[56ch] text-slate/80">
                An entry marked <span className="text-clay-paper">in production</span> has a photograph and a premise
                and nothing else. There is no half-written interview behind it, and none will be invented to fill the
                gap.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── The way on ──────────────────────────────────────────────── */}
      <section data-canvas="ink" className="relative bg-ink">
        <div className="u-pad py-[clamp(4rem,12vh,8rem)]">
          <motion.div {...fade()} className="border-t border-paper/12 pt-[clamp(2rem,6vh,4rem)]">
            <div className="u-grid items-end gap-y-[clamp(1.5rem,4vh,2.5rem)]">
              {available[0] && (
                <div className="col-span-12 lg:col-span-7">
                  <motion.p {...rise()} className="u-label text-dim">
                    Start here
                  </motion.p>
                  <motion.p {...rise(0.06)} className="mt-[clamp(0.75rem,2vh,1.25rem)]">
                    <Link
                      to={`/story/${available[0].slug}`}
                      className="group inline-flex flex-wrap items-baseline gap-x-[clamp(0.75rem,2vw,1.5rem)] gap-y-2"
                    >
                      <span
                        className="u-display text-ash transition-[transform,color] duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[0.08em] group-hover:text-cream group-focus-visible:text-cream"
                        style={{ fontSize: 'clamp(2rem, 7vw, 5.5rem)', lineHeight: 1 }}
                      >
                        {available[0].name}
                      </span>
                      <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(1rem,1.7vw,1.375rem)' }}>
                        {available[0].nameDeva}
                      </span>
                      <span className="u-mono text-dim">{available[0].duration}</span>
                    </Link>
                  </motion.p>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      </section>

      <Elsewhere here="/people" />
    </article>
  )
}
