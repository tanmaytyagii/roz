import { motion } from 'motion/react'
import { STORIES } from '../../data/stories'
import { isAvailable } from '../../data/story'
import { Frame } from '../Frame'
import { ChapterMark } from '../ChapterMark'
import { Link } from '../Link'
import { fade, reveal, rise, uncover } from '../../lib/motion'

/**
 * The way out.
 *
 * The note first, because this is the last place anybody reads before they
 * leave and it is the one thing on the page that is not a performance. Then the
 * other six days, which hand the reader back to the archive on the homepage.
 *
 * A story whose document exists links straight to it; the rest return to their
 * spread and say what they are. Adding the next story flips its own plate over
 * without this file changing.
 */
export function Archive({ slug }: { slug: string }) {
  const others = STORIES.filter((s) => s.slug !== slug)

  return (
    <section id="archive" data-canvas="ink" className="relative bg-ink">
      {/* The note. Quiet, and directly in the path out. */}
      <div className="u-pad pt-[clamp(3.5rem,10vh,7rem)]">
        <motion.div {...fade()} className="u-grid gap-y-4 border-t border-paper/12 pt-[clamp(1.5rem,4vh,2.5rem)]">
          <p className="u-label col-span-12 text-clay-ink lg:col-span-3">A note on this story</p>
          <p className="u-mono col-span-12 max-w-[72ch] text-ash lg:col-span-8 lg:col-start-5">
            Raju is not a real person. The age, the hours, the objects, the words and the dream on this page were all
            written for the prototype. The photographs are real, licensed documentary work by the photographers credited
            under every frame — the people in them are not the people described here, have not been interviewed, and
            have not agreed to any of this. Commissioned photography, actual interviews and signed permissions replace
            all of it before ROZ is published.
          </p>
        </motion.div>
      </div>

      <div className="u-pad pt-[clamp(4rem,12vh,8rem)] pb-[clamp(2rem,6vh,4rem)]">
        <ChapterMark n={6} title="The archive" className="text-ash" />
        <div className="u-grid mt-[clamp(2rem,6vh,4rem)] gap-y-[clamp(1.25rem,3vh,2rem)]">
          <motion.h2
            {...reveal()}
            className="u-display col-span-12 text-balance lg:col-span-7"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
          >
            One day, of seven.
          </motion.h2>
          <motion.p {...rise(0.1)} className="u-mono col-span-12 max-w-[40ch] self-end text-ash lg:col-span-4 lg:col-start-9">
            Six more are written and photographed. Their days are being assembled in the archive.
          </motion.p>
        </div>
      </div>

      <ul className="u-pad u-grid gap-y-[clamp(2rem,5vh,3rem)] pb-[clamp(4rem,12vh,8rem)]">
        {others.map((s, i) => {
          const built = isAvailable(s.slug)
          return (
            <motion.li
              key={s.slug}
              {...uncover(i * 0.04)}
              className="col-span-6 sm:col-span-4 lg:col-span-2"
            >
              <Link
                to={built ? `/story/${s.slug}` : '/people'}
                className="group block"
              >
                <div className="overflow-hidden">
                  <Frame
                    id={s.frame}
                    alt=""
                    position={s.focus}
                    sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 16vw"
                    className="w-full transition-[transform,filter] duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] group-hover:brightness-[1.04] group-hover:contrast-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    style={{ aspectRatio: '4 / 5' }}
                  />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span aria-hidden className="u-mono text-dim">
                    {String(s.index).padStart(2, '0')}
                  </span>
                  <span className="u-display text-cream transition-colors duration-500 group-hover:text-clay-ink" style={{ fontSize: 'clamp(1.125rem,1.7vw,1.5rem)' }}>
                    {s.name}
                  </span>
                  <span lang="hi" className="u-deva text-dim" style={{ fontSize: '0.875rem' }}>
                    {s.nameDeva}
                  </span>
                </div>
                <p className="u-mono mt-1 text-dim">
                  {s.occupation.replace(/^The /, '')}
                  <span className="opacity-40"> · </span>
                  {s.place}
                </p>
                {/* Recedes rather than hides: without hover — on a phone, or with
                    reduced motion — this is the only thing that says whether the
                    day behind the plate exists yet. */}
                <p className="u-label mt-2 text-clay-ink opacity-55 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {built ? 'Enter story' : 'In production'}
                </p>
              </Link>
            </motion.li>
          )
        })}
      </ul>

      <div className="u-pad pb-[clamp(4rem,12vh,8rem)]">
        <motion.div {...rise()} className="border-t border-paper/12 pt-[clamp(2rem,6vh,4rem)]">
          <Link
            to="/people"
            className="group inline-flex flex-wrap items-baseline gap-x-[clamp(1rem,3vw,2.5rem)] gap-y-2"
          >
            <span
              className="u-display text-ash transition-[transform,color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[0.1em] group-hover:text-cream"
              style={{ fontSize: 'clamp(2rem, 7vw, 5.5rem)', lineHeight: 1 }}
            >
              Back to the archive
            </span>
            <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(1rem,1.7vw,1.375rem)' }}>
              कहानियाँ
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
