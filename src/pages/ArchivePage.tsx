import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { SHEETS, FRAGMENTS, HOLDINGS, type Plate, type Sheet } from '../data/archive'
import { SOUNDSCAPES } from '../data/soundscapes'
import { ISSUE, tally } from '../data/relations'
import { FRAMES } from '../data/frames.generated'
import { Frame, Credit } from '../components/Frame'
import { ChapterMark } from '../components/ChapterMark'
import { FieldNote, FieldNoteEntry, FieldNoteKey } from '../components/FieldNote'
import { NOTES, notesAbout, type Note } from '../data/notes'
import { Link } from '../components/Link'
import { Elsewhere } from '../components/Elsewhere'
import { RunningHead } from '../components/RunningHead'
import { Colophon } from '../components/Colophon'
import { UnfinishedDocuments } from '../components/Unfinished'
import { openFileFor } from '../data/unfinished'
import { BACK_MATTER, READINGS } from '../data/issue'
import { fade, reveal, rise, uncover } from '../lib/motion'
import { inWords, listed } from '../lib/words'

/** The number a part of the back matter carries, from the one list that orders them. */
const partNumber = (id: string) => BACK_MATTER.find((p) => p.id === id)?.n ?? 0

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
    document.title = 'Field archive — संग्रह · ROZ'
    return () => {
      document.title = was
    }
  }, [])

  return (
    <article>
      {/* ── The index ───────────────────────────────────────────────── */}
      <section id="archive-top" data-canvas="ink" className="relative flow-root bg-ink">
        <RunningHead where="Back matter" to="/#contents" />
        <div className="u-pad pt-[clamp(3rem,9vh,6rem)] pb-[clamp(3rem,9vh,6rem)]">
          <ChapterMark n={1} title="Back matter" className="text-ash" />

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
                What remains after the documents.
              </motion.p>
              <motion.p {...rise(0.22)} className="u-mono mt-[clamp(1rem,2.6vh,1.5rem)] max-w-[36ch] text-ash">
                The back of Issue {ISSUE.number}, after {listed(READINGS.map((r) => `Document ${r.number}`))}. Not
                everything photographed becomes a chapter; most of it stays here.
              </motion.p>
            </div>
          </div>

          {/* The back matter's own contents: its parts, in the order they
              follow, each with the number it carries and what it holds. */}
          <motion.nav
            {...fade(0.3, 1.2)}
            aria-labelledby="back-matter-contents"
            className="mt-[clamp(2.5rem,8vh,5rem)] border-t border-paper/12 pt-[clamp(1rem,2.6vh,1.5rem)]"
          >
            <h2 id="back-matter-contents" className="u-label text-dim">
              In the back matter
            </h2>
            {/* Two columns read down, not across, the way a printed contents does. */}
            <ol className="mt-[clamp(0.75rem,2vh,1.25rem)] gap-x-[clamp(2rem,6vw,5rem)] sm:columns-2">
              {BACK_MATTER.map((p) => (
                <li key={p.id} className="break-inside-avoid border-b border-paper/10">
                  <a
                    href={`#${p.id}`}
                    className="group flex items-baseline gap-3 py-[clamp(0.55rem,1.4vh,0.8rem)]"
                  >
                    <span aria-hidden className="u-mono w-6 shrink-0 text-dim/70">
                      {tally(p.n)}
                    </span>
                    <span className="u-mono text-cream transition-colors duration-[250ms] group-hover:text-clay-ink group-focus-visible:text-clay-ink">
                      {p.title}
                    </span>
                    <span aria-hidden className="min-w-[1.5rem] flex-1 translate-y-[-0.25em] border-b border-dotted border-paper/20" />
                    {p.tally && <span className="u-mono shrink-0 text-dim">{p.tally}</span>}
                  </a>
                </li>
              ))}
            </ol>
          </motion.nav>
        </div>
      </section>

      {/* ── The contact sheets ──────────────────────────────────────── */}
      {SHEETS.map((sheet) => (
        <ContactSheet key={sheet.id} sheet={sheet} />
      ))}

      {/* ── The field notes ─────────────────────────────────────────── */}
      {NOTES.length > 0 && <FieldNotes n={partNumber('field-notes')} />}

      {/* ── The recordings ──────────────────────────────────────────── */}
      <section id="recordings" data-canvas="ink" className="relative scroll-mt-24 bg-ink">
        <div className="u-pad pt-[clamp(3.5rem,10vh,7rem)] pb-[clamp(3rem,9vh,6rem)]">
          <SheetHead
            n={partNumber('recordings')}
            title="Recordings"
            deva="आवाज़ें"
            lede={`${inWords(SOUNDSCAPES.length, true)}, all standing in for hours of ${listed(heard)}. The archive keeps what each one actually is.`}
          />
          <ul className="mt-[clamp(2rem,6vh,3.5rem)]">
            {SOUNDSCAPES.map((s, i) => (
              <motion.li
                key={s.id}
                id={`recording/${s.id}`}
                {...rise(i * 0.04, 16)}
                className="scroll-mt-24 border-t border-paper/12 last:border-b"
              >
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
                {notesAbout((r) => r.kind === 'recording' && r.id === s.id).length > 0 && (
                  <div className="u-grid -mt-1 pb-[clamp(0.9rem,2.4vh,1.5rem)]">
                    <NoteMarks
                      notes={notesAbout((r) => r.kind === 'recording' && r.id === s.id)}
                      className="col-span-12 sm:col-span-6 sm:col-start-6"
                    />
                  </div>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The fragments ───────────────────────────────────────────── */}
      <section id="fragments" data-canvas="paper" className="relative scroll-mt-24 bg-paper text-ink">
        <div className="u-pad py-[clamp(4rem,12vh,8rem)]">
          <ChapterMark n={partNumber('fragments')} title="Fragments" className="text-slate" />
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
                id={`fragment/${fr.n}`}
                {...rise(Math.min(i, 6) * 0.03, 16)}
                className="u-grid scroll-mt-24 items-baseline gap-y-2 border-t border-ink/12 py-[clamp(1rem,3vh,1.75rem)] last:border-b"
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
                  <NoteMarks notes={notesAbout((r) => r.kind === 'fragment' && r.deva === fr.deva)} className="mt-1 block" />
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

      {/* ── What remains open ───────────────────────────────────────── */}
      <UnfinishedDocuments n={partNumber('unfinished')} />

      {/* ── The colophon ────────────────────────────────────────────── */}
      <section id="colophon" data-canvas="ink" aria-labelledby="colophon-heading" className="relative scroll-mt-24 bg-ink">
        <div className="u-pad pt-[clamp(4rem,12vh,8rem)]">
          <SheetHead
            n={partNumber('colophon')}
            id="colophon-heading"
            title="Colophon"
            deva="पुष्पिका"
            lede={`Issue ${ISSUE.number}, closed the way a printed issue closes: what it holds, who made what, and what is written.`}
          />
          <Colophon full className="mt-[clamp(2rem,6vh,3.5rem)]" />
        </div>
      </section>

      <Elsewhere here="/archive" />
    </article>
  )
}

/** The head of a sheet: number, name, and what is on it. */
function SheetHead({ n, title, deva, lede, id }: { n: number; title: string; deva: string; lede: string; id?: string }) {
  return (
    <>
      <ChapterMark n={n} title={title} className="text-ash" />
      <div className="u-grid mt-[clamp(1.5rem,4vh,2.5rem)] items-end gap-y-3">
        <motion.h2 {...reveal()} id={id} className="col-span-12 flex flex-wrap items-baseline gap-x-4 lg:col-span-6">
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
        <SheetHead n={partNumber(sheet.id)} title={sheet.title} deva={sheet.deva} lede={sheet.lede} />
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
  const file = plate.subject ? openFileFor(plate.subject.slug) : undefined

  return (
    <motion.li
      {...uncover(delay)}
      id={`plate/${plate.id}`}
      className="col-span-6 scroll-mt-24 sm:col-span-4 lg:col-span-2"
    >
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
      <NoteMarks notes={notesAbout((r) => r.kind === 'photograph' && r.frame === plate.id)} className="mt-1 block" />
      {/* A portrait whose document is not built leads to its open file. */}
      {file && file.story.frame === plate.id && (
        <Link
          to={`/archive#${file.id}`}
          aria-label={`${file.story.name}: production sheet, in the unfinished documents`}
          className="u-mono mt-1 block text-clay-ink/80 underline decoration-current/25 underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:decoration-current"
        >
          Production sheet
        </Link>
      )}
    </motion.li>
  )
}

/**
 * THE FIELD NOTES.
 *
 * A notebook laid into the archive between the proof sheets and the
 * recordings — paper, because it is the editor's own, and ruled with a margin
 * down it the way an exercise book is. It holds a few notes rather than a
 * feed: each is about material already filed above or below it, and each says
 * which of its lines are documented, which are the editor's reading, and which
 * are written.
 */
function FieldNotes({ n }: { n: number }) {
  return (
    <section
      id="field-notes"
      data-canvas="paper"
      aria-labelledby="field-notes-heading"
      className="relative scroll-mt-24 bg-paper text-ink"
    >
      <div className="u-pad py-[clamp(4rem,12vh,8rem)]">
        <ChapterMark n={n} title="Field notes" className="text-slate" />
        <div className="u-grid mt-[clamp(2.5rem,7vh,4.5rem)] items-end gap-y-[clamp(1.25rem,3vh,2rem)]">
          <h2 id="field-notes-heading" className="col-span-12 lg:col-span-7">
            <motion.span
              {...reveal()}
              className="u-display block text-ink"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 4rem)', lineHeight: 1.02 }}
            >
              Field notes
            </motion.span>
            <motion.span
              {...reveal(0.08)}
              lang="hi"
              className="u-deva mt-[0.15em] block text-slate"
              style={{ fontSize: 'clamp(1.125rem, 2.6vw, 2rem)' }}
            >
              मैदानी नोट्स
            </motion.span>
          </h2>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[42ch] self-end text-slate lg:col-span-4 lg:col-start-9"
          >
            Kept beside the plates and the recordings. {inWords(NOTES.length, true)} notes on what the material is,
            where it came from when anyone recorded that, and which parts of it are made up.
          </motion.p>
        </div>

        {/* The key, said once, so no line below has to explain itself. */}
        <motion.div {...fade(0.1, 1.2)} className="u-grid mt-[clamp(2rem,6vh,3.5rem)] border-t border-ink/12 pt-[clamp(1rem,2.6vh,1.5rem)]">
          <p className="u-label col-span-12 mb-3 text-slate sm:col-span-4 sm:mb-0">Three kinds of line</p>
          <div className="col-span-12 max-w-[72ch] sm:col-span-7 sm:col-start-6">
            <FieldNoteKey />
          </div>
        </motion.div>

        {/* The notebook. A margin rule runs down it at the edge of the note
            column, the one decorative thing on the page. */}
        <div className="relative mt-[clamp(2.5rem,7vh,4.5rem)]">
          <div aria-hidden className="u-grid pointer-events-none absolute inset-0 max-sm:hidden">
            <span className="col-start-6 -ml-[calc(clamp(0.75rem,1.6vw,1.75rem)/2)] border-l border-clay-paper/25" />
          </div>
          <ol className="relative flex flex-col gap-[clamp(2.25rem,6vh,3.75rem)]">
            {NOTES.map((note) => (
              <FieldNoteEntry key={note.id} note={note} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/**
 * Where a plate, a recording or a fragment is the subject of a note, a small
 * mark beside it says so and leads to the note. Nothing is marked that the
 * notebook does not actually discuss.
 */
function NoteMarks({ notes, className = '' }: { notes: Note[]; className?: string }) {
  if (!notes.length) return null
  return (
    <span className={`u-mono ${className}`}>
      <span className="opacity-70">{notes.length === 1 ? 'Field note ' : 'Field notes '}</span>
      {notes.map((note, i) => (
        <span key={note.id}>
          <Link
            to={`/archive#${note.id}`}
            aria-label={`Field note ${note.n}: ${note.label}`}
            // The figure is two characters wide; the padding, cancelled by the
            // negative margin, gives a finger a target without moving the type.
            className="-mx-2 -my-3 inline-block px-2 py-3 text-clay-ink/80 underline decoration-current/25 underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:decoration-current [[data-canvas=paper]_&]:text-clay-paper"
          >
            {String(note.n).padStart(2, '0')}
          </Link>
          {i < notes.length - 1 && <span aria-hidden className="opacity-40"> · </span>}
        </span>
      ))}
    </span>
  )
}
