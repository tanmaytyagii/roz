import { useEffect, useRef, useSyncExternalStore } from 'react'

/**
 * THE TRANSPORT.
 *
 * One `HTMLAudioElement` for the whole site, created the first time somebody
 * presses play and never before — so a page with sound on it costs nothing to
 * scroll past. Because there is exactly one element, two recordings cannot
 * overlap: starting a second one is the same act as stopping the first.
 *
 * Discrete state (which recording, and whether it is running) goes through
 * `useAudio`, which re-renders on change. Position does not: it is read on rAF
 * by `useAudioFrame` and written straight to the node that shows it, because a
 * clock that re-rendered a list sixty times a second would be a strange way to
 * spend a battery.
 */

export type AudioPhase = 'idle' | 'loading' | 'playing' | 'paused'
export type AudioState = { id: string | null; phase: AudioPhase }

const LEVEL = 0.72
const FADE = 700

let el: HTMLAudioElement | null = null
let state: AudioState = { id: null, phase: 'idle' }

const watchers = new Set<() => void>()
const frames = new Set<(at: number, length: number) => void>()
let tick = 0
let ramp = 0

const publish = (next: AudioState) => {
  if (next.id === state.id && next.phase === state.phase) return
  state = next
  for (const w of watchers) w()
}

/** Ramp the level rather than cutting it: a field recording that snaps on at
    full volume sounds like a mistake. */
const glide = (to: number, done?: () => void) => {
  const audio = el
  if (!audio) return
  cancelAnimationFrame(ramp)
  const from = audio.volume
  const t0 = performance.now()
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / FADE)
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * k))
    if (k < 1) ramp = requestAnimationFrame(step)
    else done?.()
  }
  ramp = requestAnimationFrame(step)
}

const run = (on: boolean) => {
  cancelAnimationFrame(tick)
  if (!on) return
  const loop = () => {
    if (el) for (const f of frames) f(el.currentTime, el.duration || 0)
    tick = requestAnimationFrame(loop)
  }
  tick = requestAnimationFrame(loop)
}

/** Halt, rewind, and let every meter fall back to nothing. */
export function stop() {
  cancelAnimationFrame(ramp)
  run(false)
  if (el) {
    el.pause()
    el.currentTime = 0
  }
  for (const f of frames) f(0, 0)
  publish({ id: null, phase: 'idle' })
}

export function pause() {
  if (!el || state.phase !== 'playing') return
  const id = state.id
  glide(0, () => {
    el?.pause()
  })
  run(false)
  publish({ id, phase: 'paused' })
}

/**
 * Press a recording. Playing it pauses it; paused or idle starts it; a
 * different one replaces whatever is running.
 */
export async function toggle(id: string, src: string, opts: { loop?: boolean } = {}) {
  if (state.id === id && state.phase === 'playing') return pause()

  // Nothing is fetched before this line, and this line only runs from a press.
  const audio = (el ??= new Audio())
  audio.loop = Boolean(opts.loop)

  if (state.id === id && state.phase === 'paused') {
    publish({ id, phase: 'playing' })
    void audio.play()
    glide(LEVEL)
    run(true)
    return
  }

  audio.preload = 'none'
  audio.src = src
  audio.currentTime = 0
  audio.volume = 0
  audio.onended = opts.loop ? null : () => stop()
  publish({ id, phase: 'loading' })
  try {
    await audio.play()
    publish({ id, phase: 'playing' })
    glide(LEVEL)
    run(true)
  } catch {
    publish({ id: null, phase: 'idle' })
  }
}

const subscribe = (cb: () => void) => {
  watchers.add(cb)
  return () => watchers.delete(cb)
}
const snapshot = () => state

/** Which recording is loaded, and what it is doing. */
export function useAudio(): AudioState {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

/**
 * Position, on rAF, for writing straight into the DOM. The callback is held in
 * a ref so an inline arrow at the call site does not re-subscribe every render.
 */
export function useAudioFrame(cb: (at: number, length: number) => void) {
  const held = useRef(cb)
  useEffect(() => {
    held.current = cb
  }, [cb])
  useEffect(() => {
    const fn = (at: number, length: number) => held.current(at, length)
    frames.add(fn)
    return () => {
      frames.delete(fn)
    }
  }, [])
}

/** Leaving the page it belongs to should take the sound with it. */
export function useStopOnUnmount() {
  useEffect(() => () => stop(), [])
}

/** `00:08`, for a clock that should never surprise anybody. */
export const clock = (s: number) => {
  const n = Math.max(0, Math.floor(Number.isFinite(s) ? s : 0))
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
}
