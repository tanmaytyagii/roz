import { useEffect, useState } from 'react'

export type NavState = {
  /** Past the hero — the bar earns a backdrop. */
  settled: boolean
  /** Scrolling down and well past the fold — the bar gets out of the way. */
  hidden: boolean
  /** Which canvas is directly under the bar right now. */
  onPaper: boolean
  /** 0 → 1 through the document. */
  progress: number
  /**
   * True where the document opens on a full-bleed photograph. The backdrop can
   * arrive slowly over one; over type it has to be there before the title is.
   */
  gentle: boolean
}

/**
 * One scroll listener for the whole chrome. Reads on rAF, writes state only
 * when a value actually flips, so the bar never re-renders per frame. Re-reads
 * the page's themed sections whenever the route changes under it.
 */
export function useNavState(route: string): NavState {
  const [state, setState] = useState<NavState>({
    settled: false,
    hidden: false,
    onPaper: false,
    progress: 0,
    gentle: true,
  })

  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    let onPaper = false

    // A 1px band sitting exactly where the bar is. Whichever themed section
    // crosses it decides the bar's colour. The band is defined in viewport
    // units, so it has to be rebuilt whenever the viewport changes height.
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-canvas]'))

    /**
     * How far down the bar earns its backdrop.
     *
     * A document that opens on a full-bleed photograph carries its own
     * darkening across the top, so the bar can stay bare most of the way down
     * the first screen and the slate reads as one composition — which is how
     * the homepage and the story slate were drawn.
     *
     * A document that opens on type has nothing behind the bar but flat ink,
     * and its title runs straight into the section links. Those settle almost
     * at once. Measured from the opening section rather than listed by route,
     * so a new document gets the right answer on its own.
     */
    let settleAt = window.innerHeight * 0.65
    const gauge = () => {
      const opener = document.querySelector('main [data-canvas]')
      const plate = opener?.querySelector('picture, img')
      const opensOnPhotograph =
        !!plate && plate.getBoundingClientRect().top + window.scrollY <= 4
      settleAt = opensOnPhotograph ? window.innerHeight * 0.65 : 24
      setState((st) => (st.gentle === opensOnPhotograph ? st : { ...st, gentle: opensOnPhotograph }))
    }
    gauge()

    let io: IntersectionObserver
    const watch = () => {
      io?.disconnect()
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) onPaper = e.target.getAttribute('data-canvas') === 'paper'
          }
          setState((s) => (s.onPaper === onPaper ? s : { ...s, onPaper }))
        },
        { rootMargin: `-56px 0px -${Math.max(0, window.innerHeight - 58)}px 0px`, threshold: 0 },
      )
      sections.forEach((s) => io.observe(s))
    }
    watch()

    const read = () => {
      ticking = false
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const next = {
        settled: y > settleAt,
        hidden: y > window.innerHeight * 1.1 && y > last + 4,
        onPaper,
        progress: max > 0 ? Math.min(1, y / max) : 0,
      }
      if (y > last + 4 || y < last - 4) last = y
      setState((s) =>
        s.settled === next.settled && s.hidden === next.hidden && Math.abs(s.progress - next.progress) < 0.002
          ? s
          : { ...s, ...next },
      )
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(read)
    }
    const onResize = () => {
      gauge()
      watch()
      onScroll()
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      io.disconnect()
    }
    // `route` is the dependency: a new document has new themed sections, and the
    // band under the bar has to be rebuilt against them.
  }, [route])

  return state
}
