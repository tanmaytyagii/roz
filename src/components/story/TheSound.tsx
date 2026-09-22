import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { StoryDoc } from '../../data/story'
import { SOUNDS, type SoundId } from '../../data/sounds.generated'
import { ChapterMark } from '../ChapterMark'
import { reveal, rise } from '../../lib/motion'

const LEVEL = 0.72
const FADE = 700
/** The meter at rest — uneven, so it reads as a level and not as a bar chart. */
const REST = [0.34, 0.62, 0.44]

/**
 * THE SOUND.
 *
 * Optional, and it means it: no audio element exists until somebody presses
 * play, so the page costs nothing to scroll past. One track at a time, looped,
 * faded in and out rather than cut — a field recording that snaps on at full
 * level sounds like a mistake.
 *
 * The transport is one element reused across the four tracks. Progress is
 * written straight to the node on rAF; the only state is which track is live.
 */
export function TheSound({ doc }: { doc: StoryDoc }) {
  const [live, setLive] = useState<SoundId | null>(null)
  const [loading, setLoading] = useState<SoundId | null>(null)
  const el = useRef<HTMLAudioElement | null>(null)
  const bars = useRef<Record<string, HTMLSpanElement | null>>({})
  const raf = useRef(0)
  const ramp = useRef(0)

  /** Ramp the level rather than cutting it. Resolves when it arrives. */
  const glide = useCallback((to: number, done?: () => void) => {
    const audio = el.current
    if (!audio) return
    cancelAnimationFrame(ramp.current)
    const from = audio.volume
    const t0 = performance.now()
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / FADE)
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * k))
      if (k < 1) ramp.current = requestAnimationFrame(step)
      else done?.()
    }
    ramp.current = requestAnimationFrame(step)
  }, [])

  const stop = useCallback(() => {
    const audio = el.current
    if (!audio) return
    glide(0, () => audio.pause())
    setLive(null)
  }, [glide])

  const play = useCallback(
    async (id: SoundId) => {
      if (live === id) return stop()
      // Nothing is fetched before this line runs, and this line only runs from
      // a click.
      const audio = (el.current ??= new Audio())
      audio.loop = true
      audio.preload = 'none'
      audio.src = SOUNDS[id].src
      audio.volume = 0
      setLoading(id)
      try {
        await audio.play()
        setLive(id)
        glide(LEVEL)
      } catch {
        setLive(null)
      } finally {
        setLoading(null)
      }
    },
    [live, stop, glide],
  )

  // One rAF loop, running only while something is playing.
  useEffect(() => {
    if (!live) {
      cancelAnimationFrame(raf.current)
      for (const bar of Object.values(bars.current)) if (bar) bar.style.transform = 'scaleX(0)'
      return
    }
    const tick = () => {
      const audio = el.current
      const bar = bars.current[live]
      if (audio && bar && audio.duration) bar.style.transform = `scaleX(${audio.currentTime / audio.duration})`
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [live])

  // Leaving the story stops the sound. It should never outlive the page.
  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current)
      cancelAnimationFrame(ramp.current)
      el.current?.pause()
      el.current = null
    },
    [],
  )

  return (
    <section id="the-sound" data-canvas="ink" className="relative bg-[#070605] py-[clamp(4.5rem,13vh,9rem)]">
      <div className="u-pad">
        <ChapterMark n={4} title="The sound" className="text-ash" />

        <div className="u-grid mt-[clamp(2.5rem,7vh,5rem)] gap-y-[clamp(1.25rem,3vh,2rem)]">
          <motion.h2
            {...reveal()}
            className="u-display col-span-12 text-balance lg:col-span-6"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
          >
            What it sounds like
            <span className="block text-ash">from where he is standing.</span>
          </motion.h2>
          <motion.p {...rise(0.1)} className="u-mono col-span-12 max-w-[42ch] self-end text-ash lg:col-span-4 lg:col-start-9">
            {doc.sound.lede}
          </motion.p>
        </div>

        <ul className="mt-[clamp(3rem,9vh,6rem)]">
          {doc.sound.tracks.map((track, i) => {
            const sound = SOUNDS[track.id]
            const on = live === track.id
            const busy = loading === track.id
            return (
              <motion.li
                key={track.id}
                {...rise(i * 0.05, 18)}
                className="relative border-t border-paper/12 last:border-b"
              >
                <button
                  type="button"
                  onClick={() => void play(track.id)}
                  aria-pressed={on}
                  aria-label={`${on ? 'Stop' : 'Play'} ${track.label} — ambient sound, ${Math.round(sound.seconds)} seconds, loops`}
                  className="group u-grid w-full items-center gap-y-3 py-[clamp(1.25rem,3.4vh,2.25rem)] text-left transition-opacity duration-[250ms] hover:opacity-100 focus-visible:opacity-100"
                  style={{ opacity: on ? 1 : 0.82 }}
                >
                  {/* The transport: three hairlines, the smallest level meter
                      that still reads as sound. Still and muted at rest,
                      moving and clay while it runs. */}
                  <span className="col-span-2 flex items-center sm:col-span-1">
                    <span
                      aria-hidden
                      className="flex h-3 items-end gap-[3px]"
                      style={{ opacity: busy ? 0.4 : 1, transition: 'opacity 250ms' }}
                    >
                      {REST.map((rest, n) => (
                        <span
                          key={n}
                          className="block h-3 w-px origin-bottom bg-current transition-[transform,color] duration-[300ms] ease-[cubic-bezier(.16,1,.3,1)]"
                          style={{
                            color: on ? 'var(--color-clay-ink)' : 'var(--color-ash)',
                            transform: `scaleY(${rest})`,
                            animation: on ? `roz-level 1100ms ${n * 170}ms ease-in-out infinite alternate` : undefined,
                          }}
                        />
                      ))}
                    </span>
                  </span>

                  <span className="col-span-10 sm:col-span-6 lg:col-span-5">
                    <span
                      className="u-display block transition-colors duration-700"
                      style={{
                        fontSize: 'clamp(1.375rem, 3vw, 2.5rem)',
                        color: on ? 'var(--color-paper)' : 'var(--color-ash)',
                      }}
                    >
                      {track.label}
                    </span>
                    <span lang="hi" className="u-deva mt-1 block text-dim" style={{ fontSize: 'clamp(0.9375rem,1.3vw,1.125rem)' }}>
                      {track.deva}
                    </span>
                  </span>

                  <span className="col-span-12 flex items-baseline gap-4 sm:col-span-5 sm:col-start-8 lg:col-span-4 lg:col-start-9 lg:justify-end">
                    <span className="u-mono text-dim">{track.at}</span>
                    <span className="u-mono text-dim">{Math.round(sound.seconds)}s</span>
                    <span
                      className="u-label transition-colors duration-[300ms] lg:ml-6"
                      style={{ color: on ? 'var(--color-clay-ink)' : 'var(--color-dim)' }}
                    >
                      {busy ? 'Loading' : on ? 'Playing' : 'Listen'}
                    </span>
                  </span>
                </button>

                {/* Where it has got to. */}
                <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px">
                  <span
                    ref={(node) => {
                      bars.current[track.id] = node
                    }}
                    className="block h-px origin-left scale-x-0 bg-clay"
                  />
                </span>
              </motion.li>
            )
          })}
        </ul>

        <motion.div {...rise(0.1)} className="u-grid mt-[clamp(2rem,6vh,3.5rem)] gap-y-4">
          <p className="u-mono col-span-12 max-w-[64ch] text-dim lg:col-span-8">
            <span className="text-clay-ink">Stand-in recordings.</span> Licensed under Creative Commons and trimmed to a
            loop — three of the four were recorded in India, the site interior was not. Like the photography, they hold
            a place until the real location sound exists.
          </p>
          <ul className="col-span-12 flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:col-span-8">
            {doc.sound.tracks.map((track) => {
              const c = SOUNDS[track.id].credit
              return (
                <li key={track.id} className="u-mono text-dim">
                  <span className="opacity-60">{track.label}: </span>
                  <a
                    href={c.source}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline-offset-[3px] transition-colors hover:text-clay-ink hover:underline"
                  >
                    {c.creator}
                  </a>
                  <span className="opacity-40"> · </span>
                  <a
                    href={c.licenseUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline-offset-[3px] transition-colors hover:text-clay-ink hover:underline"
                  >
                    {c.license}
                  </a>
                </li>
              )
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
