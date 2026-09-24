import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { SHEETS, FRAGMENTS, HOLDINGS, type Plate, type Sheet } from '../data/archive'
import { SOUNDSCAPES } from '../data/soundscapes'
import { ISSUE, tally } from '../data/relations'
import { FRAMES } from '../data/frames.generated'
import { Frame, Credit } from '../components/Frame'
import { ChapterMark } from '../components/ChapterMark'
import { FieldNote } from '../components/FieldNote'
import { Link } from '../components/Link'
import { Elsewhere } from '../components/Elsewhere'
import { fade, reveal, rise, uncover } from '../lib/motion'
import { inWords, listed } from '../lib/words'

/** Whose days the recordings stand in for, read off the recordings themselves. */
const heard = Array.from(new Set(SOUNDSCAPES.map((s) => `${s.story.name}'s day`)))

/**
 * THE FIELD ARCHIVE.
 *
 * Not a gallery. A work table: every photograph the issue holds, laid out as
 * proof sheets with its index, what is in it, and which document it ended up
 * in. The plates are small on purpose — a contact sheet is for finding things,
 * not for admiring them, and the finished frames are already large elsewhere.
 *
 * It is also where the publication is most visibly unfinished, and it does not
 * hide that. Most of the subjects have one plate and nothing behind it.
 */
export function ArchivePage() {
  useEffect(() => {
    const was = document.title
    document.title = 'Field archive — ROZ'
    return () => {
      document.title = was
    }
  }, [])

  return (
    <article>
      {/* ── The index ───────────────────────────────────────────────── */}
      <section id="archive-top" data-canvas="ink" className="relative bg-ink">
        <div className="u-pad pt-[clamp(6rem,18vh,11rem)] pb-[clamp(3rem,9vh,6rem)]">
          <ChapterMark n={1} title={`Issue ${ISSUE.number}`} className="text-ash" />

          <div className="u-grid mt-[clamp(2.5rem,8vh,5.5rem)] items-end gap-y-[clamp(1.5rem,4vh,2.5rem)]">
            <h1 className="col-span-12 lg:col-span-7">
              <motion.span
                {...reveal()}
                className="u-display block text-paper"
                style={{ fontSize: 'clamp(2.75rem, 10vw, 8.5rem)', lineHeight: 0.92 }}
              >
                Field archive
              </motion.span>
              <motion.span
                {...reveal(0.1)}
                lang="hi"
                className="u-deva mt-[0.12em] block text-ash"
                style={{ fontSize: 'clamp(1.375rem, 4.4vw, 3.5rem)' }}
              >
                संग्रह
              </motion.span>
            </h1>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <motion.p
                {...rise(0.16)}
                className="u-display text-balance text-cream"
                style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.875rem)', lineHeight: 1.2 }}
              >
                What is left behind while the stories are being made.
              </motion.p>
              <motion.p {...rise(0.22)} className="u-mono mt-[clamp(1rem,2.6vh,1.5rem)] max-w-[36ch] text-ash">
                Not everything photographed becomes a chapter. Most of it stays here.
              </motion.p>
            </div>
          </div>

          {/* What the archive holds, counted off the registries. */}
          <motion.dl
            {...fade(0.3, 1.2)}
            className="mt-[clamp(2.5rem,8vh,5rem)] flex flex-wrap gap-x-[clamp(1.5rem,4vw,3.5rem)] gap-y-3 border-t border-paper/12 pt-[clamp(1rem,2.6vh,1.5rem)]"
          >
            {[
              [HOLDINGS.photographs, 'photographs'],
              [HOLDINGS.recordings, 'recordings'],
              [HOLDINGS.subjects, 'subjects'],
              [HOLDINGS.places, 'places'],
              [HOLDINGS.fragments, 'fragments'],
              [HOLDINGS.unfinished, 'unfinished documents'],
            ].map(([n, label]) => (
              <div key={String(label)} className="flex items-baseline gap-2">
                <dt className="sr-only">{label}</dt>
                <dd className="u-mono text-clay-ink" style={{ fontSize: 'clamp(0.875rem,1.2vw,1.0625rem)' }}>
                  {tally(Number(n))}
                </dd>
                <dd className="u-label text-dim">{label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* ── The contact sheets ──────────────────────────────────────── */}
      {SHEETS.map((sheet) => (
        <ContactSheet key={sheet.id} sheet={sheet} />
      ))}

      {/* ── The recordings ──────────────────────────────────────────── */}
      <section id="recordings" data-canvas="ink" className="relative scroll-mt-24 bg-ink">
        <div className="u-pad pt-[clamp(3.5rem,10vh,7rem)] pb-[clamp(3rem,9vh,6rem)]">
          <SheetHead
            n={SHEETS.length + 2}
            title="Recordings"
            deva="आवाज़ें"
            lede={`${inWords(SOUNDSCAPES.length, true)}, all standing in for hours of ${listed(heard)}. The archive keeps what each one actually is.`}
          />
          <ul className="mt-[clamp(2rem,6vh,3.5rem)]">
            {SOUNDSCAPES.map((s, i) => (
              <motion.li key={s.id} {...rise(i * 0.04, 16)} className="border-t border-paper/12 last:border-b">
                <Link
                  to="/sounds"
                  className="group u-grid items-baseline gap-y-2 py-[clamp(0.9rem,2.4vh,1.5rem)]"
                >
                  <span aria-hidden className="u-mono col-span-2 text-dim/70 sm:col-span-1">
                    {tally(i + 1)}
                  </span>
                  <span className="col-span-10 flex flex-wrap items-baseline gap-x-3 sm:col-span-4">
                    <span
                      className="u-display text-cream transition-colors duration-500 group-hover:text-clay-ink"
                      style={{ fontSize: 'clamp(1.125rem,2vw,1.625rem)' }}
                    >
                      {s.title}
                    </span>
                    <span lang="hi" className="u-deva text-dim" style={{ fontSize: '0.9375rem' }}>
                      {s.deva}
                    </span>
                  </span>
                  <span className="u-mono col-span-12 max-w-[44ch] text-dim sm:col-span-5 sm:col-start-6">
                    {s.origin}
                    <span className="opacity-40"> · </span>
                    {s.sound.credit.creator}
                  </span>
                  <span className="u-mono col-span-12 text-clay-ink sm:col-span-2 sm:col-start-11 sm:text-right">
                    {s.at}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The fragments ───────────────────────────────────────────── */}
      <section id="fragments" data-canvas="paper" className="relative scroll-mt-24 bg-paper text-ink">
        <div className="u-pad py-[clamp(4rem,12vh,8rem)]">
          <ChapterMark n={SHEETS.length + 3} title="Fragments" className="text-slate" />
          <div className="u-grid mt-[clamp(2.5rem,7vh,4.5rem)] items-end gap-y-[clamp(1.25rem,3vh,2rem)]">
            <motion.h2
              {...reveal()}
              className="u-display col-span-12 text-balance lg:col-span-7"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 4rem)', lineHeight: 1.02 }}
            >
              Lines, without their documents.
            </motion.h2>
            <motion.p
              {...rise(0.1)}
              className="u-mono col-span-12 max-w-[42ch] self-end text-slate lg:col-span-4 lg:col-start-9"
            >
              Every sentence the issue has written down, gathered in one column. All of it is written for the
              prototype — none of it was said to anybody.
            </motion.p>
          </div>

          <ol className="mt-[clamp(2.5rem,7vh,4.5rem)]">
            {FRAGMENTS.map((fr, i) => (
              <motion.li
                key={`${fr.n}-${fr.deva}`}
                {...rise(Math.min(i, 6) * 0.03, 16)}
                className="u-grid items-baseline gap-y-2 border-t border-ink/12 py-[clamp(1rem,3vh,1.75rem)] last:border-b"
              >
                <span aria-hidden className="u-mono col-span-2 text-slate/70 sm:col-span-1">
                  {tally(fr.n)}
                </span>
                <div className="col-span-10 sm:col-span-6">
                  <p lang="hi" className="u-deva text-ink" style={{ fontSize: 'clamp(1.0625rem, 2vw, 1.5rem)' }}>
                    {fr.deva}
                  </p>
                  {fr.gloss && <p className="u-mono mt-2 max-w-[42ch] text-slate">{fr.gloss}</p>}
                </div>
                <p className="u-mono col-span-12 text-slate/80 sm:col-span-4 sm:col-start-9 sm:text-right">
                  {fr.to ? (
                    <Link
                      to={fr.to}
                      className="underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-paper hover:underline"
                    >
                      {fr.source}
                    </Link>
                  ) : (
                    fr.source
                  )}
                </p>
              </motion.li>
            ))}
          </ol>

          <div className="mt-[clamp(2.5rem,7vh,4.5rem)]">
            <FieldNote n={1} title="What this archive is" tone="paper">
              The photographs are real. They are licensed documentary work by the {tally(HOLDINGS.photographers)}{' '}
              photographers credited on every plate, and the people in them are not the people ROZ describes — they
              have not been interviewed and have agreed to nothing. Everything written around them, including every
              line on this page, is prototype writing. Commissioned photography, actual interviews and signed
              permissions replace all of it before ROZ is published.
            </FieldNote>
          </div>
        </div>
      </section>

      <Elsewhere here="/archive" />
    </article>
  )
}

/** The head of a sheet: number, name, and what is on it. */
function SheetHead({ n, title, deva, lede }: { n: number; title: string; deva: string; lede: string }) {
  return (
    <>
      <ChapterMark n={n} title={title} className="text-ash" />
      <div className="u-grid mt-[clamp(1.5rem,4vh,2.5rem)] items-end gap-y-3">
        <motion.h2 {...reveal()} className="col-span-12 flex flex-wrap items-baseline gap-x-4 lg:col-span-6">
          <span className="u-display text-cream" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', lineHeight: 1.02 }}>
            {title}
          </span>
          <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(1rem,1.6vw,1.25rem)' }}>
            {deva}
          </span>
        </motion.h2>
        <motion.p {...rise(0.1)} className="u-mono col-span-12 max-w-[44ch] self-end text-ash lg:col-span-5 lg:col-start-8">
          {lede}
        </motion.p>
      </div>
    </>
  )
}

/**
 * One proof sheet. Plates are small and evenly ruled; the metadata sits under
 * each one at rest rather than waiting for a hover, because a contact sheet
 * whose annotations only exist on a pointer is no use on a phone.
 */
function ContactSheet({ sheet }: { sheet: Sheet }) {
  return (
    <section id={sheet.id} data-canvas="ink" className="relative scroll-mt-24 bg-ink">
      <div className="u-pad pt-[clamp(3.5rem,10vh,7rem)] pb-[clamp(2rem,6vh,4rem)]">
        <SheetHead n={sheet.n + 1} title={sheet.title} deva={sheet.deva} lede={sheet.lede} />
      </div>

      <ul className="u-pad u-grid gap-y-[clamp(1.5rem,4vh,2.5rem)] pb-[clamp(3rem,9vh,6rem)]">
        {sheet.plates.map((p, i) => (
          <PlateEntry key={p.id} plate={p} delay={Math.min(i, 8) * 0.03} />
        ))}
      </ul>
    </section>
  )
}

function PlateEntry({ plate, delay }: { plate: Plate; delay: number }) {
  const [told, setTold] = useState(false)
  const credit = FRAMES[plate.id].credit

  return (
    <motion.li {...uncover(delay)} className="col-span-6 sm:col-span-4 lg:col-span-2">
      <Link to={plate.to} className="group block" onFocus={() => setTold(true)} onMouseEnter={() => setTold(true)}>
        <span className="block overflow-hidden">
          <Frame
            id={plate.id}
            alt={plate.caption}
            art={false}
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 16vw"
            className="w-full transition-[transform,filter] duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] group-hover:brightness-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            style={{ aspectRatio: '1 / 1' }}
          />
        </span>

        <span className="mt-2 flex items-baseline gap-2">
          <span aria-hidden className="u-mono text-dim/70">
            {tally(plate.n)}
          </span>
          {plate.at && <span className="u-mono text-clay-ink">{plate.at}</span>}
          <span className="u-mono truncate text-cream">{plate.label}</span>
        </span>

        {plate.deva && (
          <span lang="hi" className="u-deva mt-0.5 block truncate text-dim" style={{ fontSize: '0.8125rem' }}>
            {plate.deva}
          </span>
        )}

        <span className="u-mono mt-1 block text-dim/80">
          {plate.subject ? plate.subject.name : 'No subject'}
          {plate.place && (
            <>
              <span className="opacity-40"> · </span>
              {plate.place.replace('Western Uttar Pradesh', 'Western U.P.')}
            </>
          )}
        </span>

        <span
          className="u-label mt-1 block text-clay-ink transition-opacity duration-500"
          style={{ opacity: told ? 1 : 0.5 }}
        >
          {plate.where}
        </span>
      </Link>

      {credit && (
        <p className="u-mono mt-1 text-dim/50">
          <Credit id={plate.id} />
        </p>
      )}
    </motion.li>
  )
}
