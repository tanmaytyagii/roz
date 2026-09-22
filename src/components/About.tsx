import { motion } from 'motion/react'
import { ChapterMark } from './ChapterMark'
import { Frame } from './Frame'
import { liftLine, rise, uncover } from '../lib/motion'

const MANIFESTO = [
  'We pass thousands of people every day.',
  'Most become part of the background.',
  'ROZ asks you to stop for a moment.',
  'To look closer.',
  'To listen.',
  'To remember that every ordinary day belongs to someone.',
]

export function About() {
  return (
    <section id="about" data-canvas="paper" className="relative bg-paper text-ink">
      <div className="u-pad py-[clamp(4.5rem,13vh,10rem)]">
        <ChapterMark n={4} title="Why ROZ" className="text-slate" />

        <div className="u-grid mt-[clamp(3rem,9vh,7rem)] gap-y-[clamp(2.5rem,7vh,5rem)]">
          <motion.figure {...uncover()} className="col-span-12 sm:col-span-6 lg:col-span-4">
            <Frame
              id="ghat"
              alt="Figures on a stone ghat before dawn, lit by a single sodium lamp."
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw"
              className="aspect-[3/2] w-full"
            />
          </motion.figure>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <h2 className="u-display text-balance" style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)', lineHeight: 1.12 }}>
              {MANIFESTO.map((line, i) => (
                <motion.span
                  key={line}
                  {...liftLine(i * 0.07, '32%')}
                  className="mt-[0.5em] block first:mt-0"
                  style={{ color: i >= 2 ? 'var(--color-ink)' : 'var(--color-slate)' }}
                >
                  {line}
                </motion.span>
              ))}
            </h2>

            <motion.p {...rise(0.3)} className="u-deva mt-[clamp(2rem,5vh,3.5rem)] text-clay-paper" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.625rem)' }} lang="hi">
              हर दिन की एक कहानी।
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  )
}

const UPCOMING = [
  { id: 'sounds', n: 3, title: 'Sounds', deva: 'आवाज़ें', line: 'Listen to India. Eight cities, eight ambient recordings, nothing autoplayed.' },
  { id: 'people', n: 4, title: 'People', deva: 'लोग', line: 'A portrait mosaic that reads as one word until you move closer to it.' },
  { id: 'places', n: 5, title: 'Places', deva: 'जगहें', line: 'Where ROZ lives — a drawn map of the country, marked story by story.' },
  { id: 'archive', n: 6, title: 'Archive', deva: 'संग्रह', line: 'Every day filed by city, trade, hour and theme.' },
]

/** The contents page. Also what the nav's remaining links point at. */
export function InProduction() {
  return (
    <section data-canvas="ink" className="bg-ink">
      <div className="u-pad pt-[clamp(4.5rem,13vh,9rem)] pb-[clamp(2rem,6vh,4rem)]">
        <ChapterMark n={5} title="In production" className="text-ash" />
        <div className="u-grid mt-[clamp(2rem,6vh,4.5rem)] gap-y-4">
          <motion.h2
            {...rise()}
            className="u-display col-span-12 lg:col-span-6"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 4rem)', lineHeight: 1.02 }}
          >
            The rest of the issue.
          </motion.h2>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[42ch] self-end text-dim lg:col-span-4 lg:col-start-9"
          >
            Chapter one is what you have just read. Everything below is being made.
          </motion.p>
        </div>
      </div>

      <ul className="u-pad">
        {UPCOMING.map((c, i) => (
          <motion.li key={c.id} id={c.id} {...rise(i * 0.05, 18)} className="scroll-mt-24 border-t border-paper/10 last:border-b">
            <div className="u-grid items-baseline gap-y-2 py-[clamp(1.25rem,3.4vh,2.25rem)]">
              <span className="u-mono col-span-2 text-dim sm:col-span-1">{String(c.n).padStart(2, '0')}</span>
              <h3 className="col-span-10 flex items-baseline gap-[0.5em] sm:col-span-4">
                <span className="u-display text-ash" style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)' }}>
                  {c.title}
                </span>
                <span className="u-deva text-dim" style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1.125rem)' }} lang="hi">
                  {c.deva}
                </span>
              </h3>
              <p className="u-mono col-span-12 max-w-[42ch] text-dim sm:col-span-7 sm:col-start-6">{c.line}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
