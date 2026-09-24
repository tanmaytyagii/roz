import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { SOUNDSCAPES, RECORDISTS, TOTAL_SECONDS, type Soundscape } from '../data/soundscapes'
import { Frame, Credit } from '../components/Frame'
import { ChapterMark } from '../components/ChapterMark'
import { Link } from '../components/Link'
import { readingFor } from '../data/issue'
import { Elsewhere } from '../components/Elsewhere'
import { clock, stop, toggle, useAudio, useAudioFrame, useStopOnUnmount } from '../lib/audio'
import { fade, reveal, rise, uncover } from '../lib/motion'

/** The meter at rest — uneven, so it reads as a level and not as a bar chart. */
const REST = [0.34, 0.62, 0.44]

/**
 * SOUNDS — the archive.
 *
 * The recording is the content, so the interface is an annotation: three
 * hairlines, a word, a clock, and a rule that fills. There is no artwork, no
 * waveform, no volume, no queue and no shuffle, because none of those would
 * help anybody hear a street in India better.
 *
 * Everything on the page is read from the stories and from the recordings'
 * own metadata. Nothing here assigns a recording to a town.
 */
export function SoundsPage() {
  const scapes = SOUNDSCAPES
  useStopOnUnmount()

  useEffect(() => {
    const was = document.title
    document.title = 'Sounds — आवाज़ें · ROZ'
    return () => {
      document.title = was
    }
  }, [])

  // With four recordings the archive reads as one movement broken once, which
  // is why the split is here and not in a loop over groups.
  const first = scapes.slice(0, 2)
  const rest = scapes.slice(2)

  return (
    <article>
      {/* ── The slate ───────────────────────────────────────────────── */}
      <section id="sounds-top" data-canvas="ink" className="relative bg-ink">
        <div className="u-pad pt-[clamp(6rem,18vh,11rem)] pb-[clamp(3rem,9vh,6rem)]">
          <ChapterMark n={1} title="Field recordings" className="text-ash" />

          <div className="u-grid mt-[clamp(2.5rem,8vh,5.5rem)] items-end gap-y-[clamp(1.5rem,4vh,2.5rem)]">
            <h1 className="col-span-12 lg:col-span-7">
              <motion.span
                {...reveal()}
                className="u-display block text-paper"
                style={{ fontSize: 'clamp(3.5rem, 13vw, 11rem)', lineHeight: 0.9 }}
              >
                Sounds
              </motion.span>
              <motion.span
                {...reveal(0.1)}
                lang="hi"
                className="u-deva mt-[0.12em] block text-ash"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 4rem)' }}
              >
                आवाज़ें
              </motion.span>
            </h1>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <motion.p
                {...rise(0.16)}
                className="u-display text-balance text-cream"
                style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.875rem)', lineHeight: 1.2 }}
              >
                Every place has a sound.
              </motion.p>
              {/* Set as a column, because that is how it reads aloud. */}
              <motion.ul {...rise(0.22)} className="mt-[clamp(1rem,2.6vh,1.5rem)]">
                {['Traffic.', 'Footsteps.', 'Tools.', 'Trains.', 'Rain.', 'Voices.', 'Silence.'].map((w) => (
                  <li key={w} className="u-mono leading-[1.9] text-ash">
                    {w}
                  </li>
                ))}
              </motion.ul>
              <motion.p {...fade(0.3, 1.2)} className="u-mono mt-[clamp(1rem,2.6vh,1.5rem)] text-dim">
                {String(scapes.length).padStart(2, '0')} recordings
                <span className="opacity-40"> · </span>
                {clock(TOTAL_SECONDS)} in all
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The archive, first movement ─────────────────────────────── */}
      <section id="archive" data-canvas="ink" className="relative scroll-mt-24 bg-ink">
        <div className="u-pad pb-[clamp(2rem,6vh,3.5rem)]">
          <div className="u-grid items-end gap-y-[clamp(1.25rem,3vh,2rem)]">
            <motion.h2
              {...reveal()}
              className="u-display col-span-12 text-balance lg:col-span-7"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 4rem)', lineHeight: 1.02 }}
            >
              Four recordings,
              <span className="block text-ash">standing in for one day.</span>
            </motion.h2>
            <motion.p
              {...rise(0.1)}
              className="u-mono col-span-12 max-w-[44ch] self-end text-ash lg:col-span-4 lg:col-start-9"
            >
              None of these was made in the town its story is set in. Each one holds an hour open until the real
              location sound exists, and each says underneath it where it actually came from.
            </motion.p>
          </div>

          <ol className="mt-[clamp(2.5rem,7vh,4.5rem)]">
            {first.map((s, i) => (
              <Row key={s.id} scape={s} n={i + 1} />
            ))}
          </ol>
        </div>
      </section>

      {/* ── A photograph, to stop listening for a moment ────────────── */}
      <motion.figure {...uncover()} className="relative" data-canvas="ink">
        <Frame
          id="mist"
          alt="A figure carrying a bundle across a river platform in heavy fog."
          sizes="100vw"
          className="h-[clamp(13rem,38vh,22rem)] w-full"
          position="center 50%"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, var(--color-ink) 0%, transparent 26%, transparent 58%, rgba(10,9,7,0.9) 100%)',
          }}
        />
        <figcaption className="u-pad absolute inset-x-0 bottom-0 pb-[clamp(0.75rem,2vh,1.25rem)]">
          <p className="u-mono text-paper/60">
            <span className="text-clay-ink">Before anyone is awake to hear it.</span>
            <span className="opacity-40"> · </span>
            <Credit id="mist" />
          </p>
        </figcaption>
      </motion.figure>

      {/* ── The archive, second movement ────────────────────────────── */}
      <section data-canvas="ink" className="relative bg-ink">
        <div className="u-pad pt-[clamp(3rem,9vh,5rem)] pb-[clamp(4rem,12vh,8rem)]">
          <ol start={first.length + 1}>
            {rest.map((s, i) => (
              <Row key={s.id} scape={s} n={first.length + i + 1} />
            ))}
          </ol>
        </div>
      </section>

      {/* ── Silence ─────────────────────────────────────────────────── */}
      <Silence />

      {/* ── The colophon ───────────────────────────────────────────── */}
      <section data-canvas="paper" className="relative bg-paper text-ink">
        <div className="u-pad py-[clamp(4rem,12vh,8rem)]">
          <ChapterMark n={2} title="Where the sound came from" className="text-slate" />
          <div className="u-grid mt-[clamp(2.5rem,7vh,4.5rem)] gap-y-[clamp(1.5rem,4vh,2.5rem)]">
            <motion.h2
              {...reveal()}
              className="u-display col-span-12 text-balance lg:col-span-6"
              style={{ fontSize: 'clamp(1.5rem, 3.6vw, 2.75rem)', lineHeight: 1.12 }}
            >
              Somebody stood there
              <span className="block text-slate">and pressed record.</span>
            </motion.h2>
            <motion.div {...rise(0.1)} className="col-span-12 lg:col-span-5 lg:col-start-8">
              <p className="u-mono max-w-[56ch] text-slate">
                Every recording here is somebody else's field work, licensed under Creative Commons and trimmed to a
                loop for the prototype. They are credited by name and licence below and beside each one.
              </p>
              <p className="u-mono mt-[clamp(1rem,2.6vh,1.5rem)] max-w-[56ch] text-slate/80">
                Two of the four name India in the recording's own title. The other two do not say where they were
                made. <span className="text-clay-paper">None of them was recorded in any of the towns ROZ has a story
                in</span> — the archive says what each one actually is instead of giving it a location it has not
                earned.
              </p>
              <ul className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-col gap-2">
                {RECORDISTS.map((c) => (
                  <li key={c.creator} className="u-mono text-slate">
                    <a
                      href={c.source}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-paper hover:underline"
                    >
                      {c.creator}
                    </a>
                    <span className="opacity-40"> · </span>
                    <a
                      href={c.licenseUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-paper hover:underline"
                    >
                      {c.license}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <Elsewhere here="/sounds" />
    </article>
  )
}

/**
 * One recording. The row carries the hour it stands in for, what it is, where
 * it is really from, and a transport made of three hairlines and a word. The
 * rule along the bottom of the row is the progress — there is no second bar,
 * because the row is the bar.
 */
function Row({ scape, n }: { scape: Soundscape; n: number }) {
  const { id, phase } = useAudio()
  const live = id === scape.id
  const playing = live && phase === 'playing'
  const paused = live && phase === 'paused'
  const loading = live && phase === 'loading'
  const bar = useRef<HTMLSpanElement>(null)
  const time = useRef<HTMLSpanElement>(null)
  const length = Math.round(scape.sound.seconds)
  const reading = readingFor(scape.story.slug)

  useAudioFrame((at, len) => {
    if (bar.current) bar.current.style.transform = `scaleX(${live && len ? at / len : 0})`
    if (time.current) time.current.textContent = clock(live ? at : 0)
  })

  const word = loading ? 'Loading' : playing ? 'Playing' : paused ? 'Paused' : 'Listen'

  return (
    <motion.li {...rise(0, 18)} className="relative border-t border-paper/12 last:border-b">
      <div className="u-grid items-baseline gap-y-3 py-[clamp(1.5rem,4vh,2.5rem)]">
        <span aria-hidden className="u-mono col-span-2 text-dim/70 sm:col-span-1">
          {String(n).padStart(2, '0')}
        </span>

        <div className="col-span-10 sm:col-span-6 lg:col-span-5">
          <p
            className="u-mono text-clay-ink"
            style={{ fontSize: 'clamp(1.125rem, 2.4vw, 1.625rem)', letterSpacing: '0.04em' }}
          >
            {scape.at}
          </p>
          <h3 className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className="u-display transition-colors duration-700"
              style={{
                fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)',
                color: playing ? 'var(--color-paper)' : 'var(--color-cream)',
              }}
            >
              {scape.title}
            </span>
            <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(0.9375rem,1.3vw,1.125rem)' }}>
              {scape.deva}
            </span>
          </h3>
          <p className="u-mono mt-2 max-w-[44ch] text-ash">{scape.origin}</p>
          <p className="u-mono mt-1 text-dim">
            <span className="opacity-70">Recorded by </span>
            <SoundCredit scape={scape} />
          </p>
        </div>

        <div className="col-span-12 sm:col-span-5 sm:col-start-8 lg:col-span-4 lg:col-start-9">
          <button
            type="button"
            onClick={() => void toggle(scape.id, scape.sound.src)}
            aria-pressed={playing}
            aria-label={`${playing ? 'Pause' : 'Play'} ${scape.title} — ${scape.origin}, ${length} seconds, stands in for ${scape.at} in ${scape.story.name}'s day`}
            className="group flex w-full items-center gap-3 py-2 text-left transition-opacity duration-[250ms] hover:opacity-100 focus-visible:opacity-100"
            style={{ opacity: live ? 1 : 0.85 }}
          >
            <span
              aria-hidden
              className="flex h-3 shrink-0 items-end gap-[3px]"
              style={{ opacity: loading ? 0.4 : 1, transition: 'opacity 250ms' }}
            >
              {REST.map((rest, i) => (
                <span
                  key={i}
                  className="block h-3 w-px origin-bottom bg-current transition-[transform,color] duration-[300ms] ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{
                    color: live ? 'var(--color-clay-ink)' : 'var(--color-ash)',
                    transform: `scaleY(${rest})`,
                    animation: playing ? `roz-level 1100ms ${i * 170}ms ease-in-out infinite alternate` : undefined,
                  }}
                />
              ))}
            </span>
            <span
              className="u-label transition-colors duration-[300ms]"
              style={{ color: live ? 'var(--color-clay-ink)' : 'var(--color-dim)' }}
            >
              {word}
            </span>
            <span className="u-mono ml-auto shrink-0 text-dim">
              <span ref={time}>00:00</span>
              <span className="opacity-50"> / {clock(length)}</span>
            </span>
          </button>

          {/* Only offered once there is something to stop. */}
          <button
            type="button"
            onClick={() => stop()}
            className="u-label mt-1 text-dim transition-[opacity,color] duration-[250ms] hover:text-cream focus-visible:text-cream"
            style={{ opacity: live ? 1 : 0, pointerEvents: live ? 'auto' : 'none' }}
            tabIndex={live ? 0 : -1}
            aria-hidden={!live}
          >
            Stop
          </button>

          <p className="u-mono mt-[clamp(0.75rem,2vh,1.25rem)] text-dim">
            <span className="opacity-70">Stands in for {scape.at} in </span>
            {reading ? (
              // Straight to that hour of the document, not the top of it. The
              // link exists because the document lists this recording — it is
              // the one relationship here that is not an assumption.
              <Link
                to={`${reading.path}#hour-${scape.at.replace(':', '')}`}
                className="text-clay-ink underline-offset-[3px] transition-colors duration-[250ms] hover:underline"
              >
                Document {reading.number}, {scape.story.name}'s day
              </Link>
            ) : (
              <span>{scape.story.name}'s day</span>
            )}
            <span className="opacity-70"> · </span>
            <Link
              to="/places"
              className="underline-offset-[3px] transition-colors duration-[250ms] hover:text-cream hover:underline"
            >
              {scape.story.place}
            </Link>
          </p>
        </div>
      </div>

      {/* How far in. The row is the bar. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px">
        <span ref={bar} className="block h-px origin-left scale-x-0 bg-clay" />
      </span>
    </motion.li>
  )
}

/**
 * The recordist's line, on the recording's own terms: their name, their
 * licence, and the title they gave the file — all of it linked back to where
 * it came from.
 */
function SoundCredit({ scape }: { scape: Soundscape }) {
  const c = scape.sound.credit
  return (
    <>
      <a
        href={c.source}
        target="_blank"
        rel="noreferrer noopener"
        className="underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline"
      >
        {c.creator}
      </a>
      <span className="opacity-40"> · </span>
      <a
        href={c.licenseUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline"
      >
        {c.license}
      </a>
      <span className="opacity-40"> · </span>
      <span className="opacity-70">{c.title}</span>
    </>
  )
}

/**
 * The quietest thing on the site. No recording, no control, no animation —
 * three lines and a great deal of nothing, which is the point.
 */
function Silence() {
  return (
    <section
      data-canvas="ink"
      aria-labelledby="silence"
      className="relative flex min-h-[86svh] items-center bg-[#070605]"
    >
      <div className="u-pad u-grid w-full">
        <h2 id="silence" className="col-span-12 lg:col-span-8 lg:col-start-3">
          {['Sometimes,', 'the sound is', 'nothing.'].map((line, i) => (
            <motion.span
              key={line}
              {...reveal(i * 0.14)}
              className="u-display block"
              style={{
                fontSize: 'clamp(2.25rem, 8vw, 7rem)',
                lineHeight: 1.04,
                color: i === 2 ? 'var(--color-paper)' : 'var(--color-ash)',
              }}
            >
              {line}
            </motion.span>
          ))}
        </h2>
      </div>
    </section>
  )
}
