import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { isNumbered } from '../../data/story'
import type {
  Chapter,
  CloseChapter,
  PlateChapter,
  SequenceDoc,
  StandInChapter,
  WordsChapter,
} from '../../data/story'
import { Frame, Credit } from '../Frame'
import { ChapterMark } from '../ChapterMark'
import { MarkedFrame } from './MarkedFrame'
import { Transcript } from './TheWords'
import { fade, liftLine, reveal, rise, uncover, usePrefersReducedMotion } from '../../lib/motion'

/**
 * A SEQUENCE.
 *
 * The chapters in the order the document gives them, each drawn by the one
 * reader for its kind. Nothing here knows whose document it is: the order, the
 * number of chapters and what is in them are all the data's.
 */
export function Sequence({ doc }: { doc: SequenceDoc }) {
  const marked: Chapter[] = doc.chapters.filter(isNumbered)
  return (
    <>
      {doc.chapters.map((c) => {
        const n = marked.indexOf(c) + 1
        switch (c.kind) {
          case 'plate':
            return <PlateView key={c.id} chapter={c} />
          case 'stand-in':
            return <StandInView key={c.id} chapter={c} />
          case 'marked':
            return <MarkedFrame key={c.id} chapter={c} n={n} />
          case 'words':
            return <WordsView key={c.id} chapter={c} n={n} />
          case 'close':
            return <CloseView key={c.id} chapter={c} />
        }
      })}
    </>
  )
}

/**
 * A photograph given the whole screen. Only a frame whose place is not in
 * doubt is allowed this; it rises out of the ink it follows rather than
 * cutting in.
 */
function PlateView({ chapter: c }: { chapter: PlateChapter }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <section
      ref={ref}
      id={c.id}
      data-canvas="ink"
      aria-label={c.line}
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-clip"
    >
      <motion.div className="absolute inset-0 -z-10" style={reduced ? undefined : { y }}>
        <Frame id={c.frame} alt={c.alt} sizes="100vw" position={c.focus} className="-mt-[6%] h-[112%] w-full" />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom, var(--color-ink) 0%, rgba(10,9,7,0.2) 20%, transparent 42%, rgba(10,9,7,0.5) 70%, rgba(10,9,7,0.9) 100%)',
        }}
      />

      <div className="u-pad u-grid items-end gap-y-4 pb-[clamp(2rem,7vh,4.5rem)]">
        <div className="col-span-12 lg:col-span-7">
          {c.time && (
            <motion.p {...fade(0, 1.2)} className="u-mono text-clay-ink">
              {c.time}
            </motion.p>
          )}
          <motion.h2
            {...reveal(0.05)}
            className="u-display mt-3 text-balance text-paper"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
          >
            {c.line}
          </motion.h2>
          <motion.p
            {...rise(0.12, 16)}
            lang="hi"
            className="u-deva mt-3 text-cream/80"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.625rem)' }}
          >
            {c.deva}
          </motion.p>
          {c.note && (
            <motion.p {...rise(0.18, 16)} className="u-mono mt-4 max-w-[38ch] text-paper/70">
              {c.note}
            </motion.p>
          )}
        </div>
        <motion.p
          {...fade(0.3, 1.2)}
          className="u-mono col-span-12 text-paper/60 lg:col-span-4 lg:col-start-9 lg:text-right"
        >
          {c.placed && (
            <>
              <span className="text-cream/80">{c.placed}</span>
              <span className="opacity-40"> · </span>
            </>
          )}
          <Credit id={c.frame} />
        </motion.p>
      </div>
    </section>
  )
}

/**
 * A stand-in. Set small and off to one side, never full-bleed, with what it is
 * not written directly under it — a photograph borrowed for a moment nobody
 * photographed should look borrowed.
 */
function StandInView({ chapter: c }: { chapter: StandInChapter }) {
  return (
    <section id={c.id} data-canvas="ink" className="relative bg-ink">
      <div className="u-pad u-grid items-end gap-y-[clamp(2rem,5vh,3rem)] py-[clamp(5rem,16vh,10rem)]">
        <div className="col-span-12 sm:col-span-5 lg:col-span-4 lg:col-start-2">
          {c.time && (
            <motion.p {...fade(0, 1.2)} className="u-mono text-clay-ink">
              {c.time}
            </motion.p>
          )}
          <motion.h2
            {...reveal(0.05)}
            className="u-display mt-3 text-paper"
            style={{ fontSize: 'clamp(1.75rem, 4.4vw, 3.5rem)', lineHeight: 1 }}
          >
            {c.line}
          </motion.h2>
          <motion.p
            {...rise(0.12, 16)}
            lang="hi"
            className="u-deva mt-3 text-ash"
            style={{ fontSize: 'clamp(1.0625rem, 1.6vw, 1.375rem)' }}
          >
            {c.deva}
          </motion.p>
        </div>

        <motion.figure {...uncover(0.05)} className="col-span-12 sm:col-span-7 lg:col-span-5 lg:col-start-7">
          <Frame
            id={c.frame}
            alt={c.alt}
            art={false}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 56vw, 38vw"
            className="w-full"
            style={{ aspectRatio: '3 / 2' }}
          />
          <figcaption className="mt-3 border-t border-paper/12 pt-3">
            <p className="u-label text-clay-ink">Stands in</p>
            <p className="u-mono mt-2 max-w-[44ch] text-ash">{c.provenance}</p>
            <p className="u-mono mt-2 text-dim">
              <Credit id={c.frame} />
            </p>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  )
}

/** What was said, on paper, set by the same transcript every document uses. */
function WordsView({ chapter: c, n }: { chapter: WordsChapter; n: number }) {
  return (
    <section id={c.id} data-canvas="paper" className="relative bg-paper text-ink">
      <div className="u-pad pt-[clamp(4.5rem,13vh,9rem)] pb-[clamp(4rem,12vh,8rem)]">
        <ChapterMark n={n} title={c.title} className="text-slate" />
        <div className="u-grid mt-[clamp(2.5rem,7vh,5rem)] gap-y-[clamp(1.25rem,3vh,2rem)]">
          <motion.h2
            {...reveal()}
            className="u-display col-span-12 text-balance lg:col-span-7"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
          >
            {c.lede}
          </motion.h2>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[36ch] self-end text-slate lg:col-span-4 lg:col-start-9"
          >
            {c.aside}
          </motion.p>
        </div>
        <Transcript words={c.words} />
      </div>
    </section>
  )
}

/**
 * The last line, on bare ink. No photograph: after a document that has held
 * one frame all day, the ending is the frame going away.
 */
function CloseView({ chapter: c }: { chapter: CloseChapter }) {
  const lines = c.deva.split('\n')
  // Not under the chapter's own address: only chapters carry `document-NN/…`.
  const heading = `${c.id.replace('/', '-')}-line`
  return (
    <section
      id={c.id}
      data-canvas="ink"
      aria-labelledby={heading}
      className="relative flex min-h-[86svh] flex-col justify-center bg-ink py-[clamp(5rem,14vh,10rem)]"
    >
      <div className="u-pad text-center">
        {c.time && (
          <motion.p {...fade(0, 1.2)} className="u-mono text-clay-ink">
            {c.time}
          </motion.p>
        )}
        <h2 id={heading} className="mx-auto mt-[clamp(1.5rem,5vh,3rem)] max-w-[min(92vw,46rem)]">
          <span className="sr-only">
            {c.deva.replace('\n', ' ')} — {c.gloss}
          </span>
          {lines.map((line, i) => (
            <motion.span
              key={line}
              aria-hidden
              lang="hi"
              {...liftLine(i * 0.12, '38%')}
              className="u-deva block text-paper"
              style={{ fontSize: 'clamp(1.5rem, 4.6vw, 3.5rem)', lineHeight: 1.3 }}
            >
              {line}
            </motion.span>
          ))}
        </h2>
        <motion.p {...fade(0.4, 1.4)} className="u-lede mx-auto mt-[clamp(1.75rem,5vh,3rem)] max-w-[34ch] text-cream/80">
          {c.gloss}
        </motion.p>
      </div>
    </section>
  )
}
