import { motion } from 'motion/react'
import type { Artifact, DayDoc } from '../../data/story'
import { Frame, Credit } from '../Frame'
import { ChapterMark } from '../ChapterMark'
import { reveal, rise, uncover } from '../../lib/motion'

/**
 * THE OBJECTS.
 *
 * The page turns to paper here, which is the strongest tonal device the system
 * has, and the objects are set as a specimen sheet: catalogued, indented in a
 * shallow arc so no two sit on the same axis, each annotated on a hairline with
 * a leader running out to it. A museum plate, not a shop.
 *
 * Nothing is boxed, nothing has a border, nothing is the same size as the thing
 * above it — which is the whole difference between an artifact and a card. The
 * annotation always sits one column off the plate it belongs to, so the pair
 * reads as one entry however far into the page the entry is set.
 */
const ROWS = [
  { plate: 'lg:col-span-3 lg:col-start-1', label: 'lg:col-span-4 lg:col-start-5' },
  { plate: 'lg:col-span-2 lg:col-start-3', label: 'lg:col-span-4 lg:col-start-6' },
  { plate: 'lg:col-span-3 lg:col-start-5', label: 'lg:col-span-4 lg:col-start-9' },
  { plate: 'lg:col-span-2 lg:col-start-4', label: 'lg:col-span-4 lg:col-start-7' },
  { plate: 'lg:col-span-3 lg:col-start-2', label: 'lg:col-span-4 lg:col-start-6' },
]

export function TheObjects({ doc }: { doc: DayDoc }) {
  return (
    <section id="the-objects" data-canvas="paper" className="relative bg-paper text-ink">
      <div className="u-pad pt-[clamp(4.5rem,13vh,9rem)] pb-[clamp(3rem,9vh,6rem)]">
        <ChapterMark n={3} title="The objects" className="text-slate" />

        <div className="u-grid mt-[clamp(2.5rem,7vh,5rem)] gap-y-[clamp(1.25rem,3vh,2rem)]">
          <motion.h2
            {...reveal()}
            className="u-display col-span-12 text-balance lg:col-span-7"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
          >
            {doc.objects.lede}
          </motion.h2>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[38ch] self-end text-slate lg:col-span-4 lg:col-start-9"
          >
            Nothing here was bought for the photograph. Everything is worn to the shape of the hand that uses it.
          </motion.p>
        </div>

        <ol className="mt-[clamp(3rem,10vh,7rem)]">
          {doc.objects.items.map((item, i) => (
            <Specimen key={item.frame} item={item} n={i + 1} row={ROWS[i % ROWS.length]} />
          ))}
        </ol>
      </div>
    </section>
  )
}

function Specimen({ item, n, row }: { item: Artifact; n: number; row: { plate: string; label: string } }) {
  return (
    <motion.li
      {...rise(0, 22)}
      className="u-grid items-center gap-y-[clamp(1rem,2.6vh,1.75rem)] border-t border-ink/12 py-[clamp(1.75rem,5vh,3.5rem)] last:border-b"
    >
      <span aria-hidden className="u-mono col-span-2 self-start text-slate sm:col-span-1">
        {String(n).padStart(2, '0')}
      </span>

      <motion.figure {...uncover(0.05)} className={`col-span-10 self-start sm:col-span-4 ${row.plate}`}>
        <div className="group overflow-hidden">
          <Frame
            id={item.frame}
            alt={item.alt}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 34vw, 22vw"
            className="w-full transition-[transform,filter] duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] group-hover:brightness-[1.04] group-hover:contrast-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            style={{ aspectRatio: '1 / 1' }}
          />
        </div>
        <figcaption className="u-mono mt-2 text-slate/80">
          <Credit id={item.frame} />
        </figcaption>
      </motion.figure>

      {/* The leader. A hairline running from the plate out to what it is. */}
      <div className={`col-span-12 flex items-baseline gap-[clamp(0.75rem,2vw,1.5rem)] sm:col-span-7 sm:col-start-6 ${row.label}`}>
        <motion.span
          aria-hidden
          {...rise(0.12, 0)}
          className="mt-[0.7em] hidden h-px w-[clamp(1.5rem,4vw,4rem)] shrink-0 bg-ink/25 lg:block"
        />
        <div>
          <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span lang="hi" className="u-deva text-ink" style={{ fontSize: 'clamp(1.375rem,2.6vw,2.125rem)' }}>
              {item.deva}
            </span>
            <span className="u-label text-clay-paper">{item.name}</span>
          </h3>
          <p className="u-mono mt-3 max-w-[32ch] text-slate">{item.note}</p>
        </div>
      </div>
    </motion.li>
  )
}
