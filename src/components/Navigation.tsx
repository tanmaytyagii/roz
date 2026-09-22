import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NAV } from '../data/stories'
import { Wordmark } from './Wordmark'
import { useNavState } from '../lib/useNavState'
import { lockScroll } from '../lib/useLenis'
import { Link } from './Link'
import { DISSOLVE } from '../lib/motion'

/**
 * The bar is shared by every document, so the section links have to resolve
 * against the current one: on the homepage they are in-page anchors, and from
 * inside a story they are a route change followed by an anchor.
 */
export function Navigation({ path }: { path: string }) {
  const { settled, hidden, onPaper, progress } = useNavState(path)
  const [menu, setMenu] = useState(false)
  const home = path === '/'
  const to = (href: string) => (home ? href : `/${href}`)

  // The overlay owns the page while it is open — including Lenis, which would
  // otherwise keep scrolling the document underneath it.
  useEffect(() => {
    lockScroll(menu)
    if (!menu) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('keydown', esc)
      lockScroll(false)
    }
  }, [menu])

  const light = onPaper && !menu

  return (
    <>
      <a
        href={home ? '#intro' : '#story-top'}
        className="u-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[90] focus:bg-paper focus:px-4 focus:py-3 focus:text-ink"
      >
        Skip to content
      </a>

      {/* Reading progress. One hairline on the top edge of the page. It sits
          outside the bar on purpose: the bar leaves on the way down, and the
          line should not leave with it. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-px">
        <div
          className="h-px w-full origin-left bg-clay"
          style={{ transform: `scaleX(${progress})`, opacity: 0.5 }}
        />
      </div>

      <motion.header
        animate={{ y: hidden && !menu ? '-102%' : '0%' }}
        transition={{ duration: 0.65, ease: DISSOLVE }}
        className="fixed inset-x-0 top-0 z-50"
        style={{ color: light ? 'var(--color-ink)' : 'var(--color-paper)' }}
      >
        {/* The bar earns its backdrop only once the hero is behind it. */}
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: settled && !menu ? 1 : 0,
            background: light
              ? 'linear-gradient(to bottom, rgba(238,229,214,0.94), rgba(238,229,214,0.78) 60%, transparent)'
              : 'linear-gradient(to bottom, rgba(10,9,7,0.88), rgba(10,9,7,0.55) 60%, transparent)',
            backdropFilter: 'blur(6px)',
          }}
        />

        <nav aria-label="Primary" className="u-pad relative flex h-[clamp(3.5rem,5.6vw,4.5rem)] items-center gap-6">
          <Link
            to={home ? '#top' : '/'}
            className="shrink-0 opacity-90 transition-opacity duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)] hover:opacity-100 focus-visible:opacity-100"
            aria-label="ROZ — home"
          >
            <Wordmark />
          </Link>

          <ul className="ml-auto hidden items-center gap-[clamp(1.25rem,2.4vw,2.75rem)] lg:flex">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  to={to(item.href)}
                  className="group u-label relative inline-block py-2 opacity-70 transition-opacity duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)] hover:opacity-100 focus-visible:opacity-100"
                >
                  {item.label}
                  <span
                    aria-hidden
                    className="absolute -bottom-px left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-controls="roz-menu"
            aria-label={menu ? 'Close the menu' : 'Open the menu'}
            className="u-label ml-auto flex items-center gap-3 py-2 opacity-70 transition-opacity duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)] hover:opacity-100 focus-visible:opacity-100 lg:ml-[clamp(1.5rem,3.5vw,3.5rem)]"
          >
            <span
              aria-hidden
              className="relative inline-block h-[1.2em] w-[4.4em] overflow-hidden text-left leading-[1.2em]"
            >
              <span
                className="absolute inset-0 transition-transform duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ transform: menu ? 'translateY(-110%)' : 'none' }}
              >
                Menu
              </span>
              <span
                className="absolute inset-0 transition-transform duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ transform: menu ? 'none' : 'translateY(110%)' }}
              >
                Close
              </span>
            </span>
            <span aria-hidden className="grid gap-[5px]">
              <span
                className="block h-px w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ transform: menu ? 'translateY(3px) rotate(6deg)' : 'none' }}
              />
              <span
                className="block h-px w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ transform: menu ? 'translateY(-3px) rotate(-6deg)' : 'none' }}
              />
            </span>
          </button>
        </nav>

      </motion.header>

      <AnimatePresence>{menu && <Menu home={home} onClose={() => setMenu(false)} />}</AnimatePresence>
    </>
  )
}

function Menu({ home, onClose }: { home: boolean; onClose: () => void }) {
  return (
    <motion.div
      id="roz-menu"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.75, ease: DISSOLVE }}
      className="fixed inset-0 z-40 bg-paper text-ink"
    >
      <div className="u-pad flex h-full flex-col justify-between pt-[clamp(6rem,12vh,9rem)] pb-[clamp(1.5rem,4vh,3rem)]">
        <ul className="u-grid gap-y-1">
          {NAV.map((item, i) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.14 + i * 0.055, ease: DISSOLVE }}
              className="col-span-12 border-t border-ink/12 md:col-span-10 md:col-start-2"
            >
              <Link
                to={home ? item.href : `/${item.href}`}
                onClick={onClose}
                className="group flex items-baseline gap-[clamp(1rem,3vw,3rem)] py-[clamp(0.5rem,1.6vh,1.1rem)]"
              >
                <span className="u-mono w-8 shrink-0 text-slate">{String(i + 1).padStart(2, '0')}</span>
                <span
                  className="u-display transition-[transform,color] duration-[300ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[0.08em] group-hover:text-clay-paper"
                  style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
                >
                  {item.label}
                </span>
                <span className="u-deva ml-auto hidden text-slate sm:block" style={{ fontSize: 'clamp(1rem,1.6vw,1.375rem)' }} lang="hi">
                  {DEVA_NAV[item.label]}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.42 }}
          className="u-grid items-end gap-y-6 border-t border-ink/12 pt-6"
        >
          <p className="u-mono col-span-12 max-w-[42ch] text-slate md:col-span-5 md:col-start-2">
            A prototype. Demo subjects and licensed documentary photography stand in until the real interviews exist.
          </p>
          <p
            lang="hi"
            className="u-deva col-span-12 text-slate md:col-span-4 md:col-start-9 md:text-right"
            style={{ fontSize: '0.9375rem' }}
          >
            हर दिन की एक कहानी।
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

const DEVA_NAV: Record<string, string> = {
  Stories: 'कहानियाँ',
  People: 'लोग',
  Places: 'जगहें',
  Sounds: 'आवाज़ें',
  About: 'परिचय',
}
