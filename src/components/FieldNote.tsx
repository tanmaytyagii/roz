import { motion } from 'motion/react'
import { KINDS, materialFor, resolve, type LineKind, type Note } from '../data/notes'
import { Frame } from './Frame'
import { Link } from './Link'
import { fade, rise } from '../lib/motion'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * A FIELD NOTE.
 *
 * The publication's own voice, as distinct from the story's. Every document
 * ends up needing one — what is invented, where the photographs came from, why
 * the map is bad on purpose — and each had grown its own markup. This is the
 * one shape they all use: an index, a heading, a ruled column of prose, and
 * nothing else.
 *
 * It is deliberately the quietest thing on any page it appears on. A note that
 * competed with the work would be a different kind of dishonesty.
 *
 * With an `id` it becomes an entry in the field notebook: addressable, and
 * with its title set as a heading so the notebook can be read by heading.
 */
export function FieldNote({
  n,
  title,
  deva,
  id,
  children,
  tone = 'ink',
}: {
  /** The note's number within its document. */
  n: number
  title: string
  deva?: string
  /** An address, for notes that are linked to from elsewhere. */
  id?: string
  children: React.ReactNode
  tone?: 'ink' | 'paper'
}) {
  const muted = tone === 'paper' ? 'text-slate' : 'text-ash'
  const rule = tone === 'paper' ? 'border-ink/12' : 'border-paper/12'
  const mark = tone === 'paper' ? 'text-clay-paper' : 'text-clay-ink'
  const Title = id ? 'h3' : 'p'

  return (
    <motion.aside
      {...fade()}
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={`u-grid gap-y-3 border-t ${rule} pt-[clamp(1.25rem,3vh,2rem)] ${id ? 'scroll-mt-24' : ''}`}
    >
      <p className="u-mono col-span-2 text-dim sm:col-span-1">{pad(n)}</p>
      <Title id={id ? `${id}-title` : undefined} className={`u-label col-span-10 sm:col-span-3 ${mark}`}>
        {title}
        {deva && (
          <span lang="hi" className="u-deva mt-1 block normal-case tracking-normal opacity-70" style={{ fontSize: '0.9375rem' }}>
            {deva}
          </span>
        )}
      </Title>
      <motion.div {...rise(0.06, 14)} className={`u-mono col-span-12 max-w-[72ch] ${muted} sm:col-span-7 sm:col-start-6`}>
        {children}
      </motion.div>
    </motion.aside>
  )
}

/* ── The field notebook ────────────────────────────────────────────────── */

/**
 * How each kind of line is set. Documented is the only kind in full ink;
 * observed carries a pencil rule in the margin, the way an editor's reading is
 * written beside a print rather than on it; written is marked in clay, the
 * colour the rest of ROZ already uses for "written for the prototype".
 */
const SET: Record<LineKind, { mark: string; text: string; pencil: boolean }> = {
  documented: { mark: 'text-ink', text: 'text-ink', pencil: false },
  observed: { mark: 'text-slate', text: 'text-ink/85', pencil: true },
  written: { mark: 'text-clay-paper', text: 'text-slate', pencil: false },
}

const SERIF = { fontSize: 'clamp(1.0625rem, 1.3vw, 1.25rem)', lineHeight: 1.4, letterSpacing: '0' } as const

/** The key at the head of the notebook: the three kinds of line, said once. */
export function FieldNoteKey() {
  return (
    <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
      {(Object.keys(KINDS) as LineKind[]).map((k) => (
        <div key={k} className="contents">
          <dt className={`u-label pt-[0.15em] ${SET[k].mark}`}>{KINDS[k].label}</dt>
          <dd className="u-mono mb-2 text-slate sm:mb-0">{KINDS[k].gloss}</dd>
        </div>
      ))}
    </dl>
  )
}

/** One entry of the notebook, drawn from its data: the lines, the records, and what it is about. */
export function FieldNoteEntry({ note }: { note: Note }) {
  const about = note.about.map(resolve).filter((r) => r !== undefined)
  const material = note.about.map(materialFor).filter((m) => m !== undefined)

  return (
    <li>
      <FieldNote n={note.n} id={note.id} title={note.label} tone="paper">
        <ul className="flex flex-col gap-[clamp(0.75rem,1.8vh,1.1rem)]">
          {note.lines.map((line) => {
            const k = SET[line.kind]
            return (
              <li key={line.text} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-4 max-sm:grid-cols-1 max-sm:gap-y-1">
                <span className={`u-label ${k.mark}`}>{KINDS[line.kind].label}</span>
                <p
                  className={`u-display ${k.text} ${k.pencil ? 'border-l border-slate/35 pl-3' : ''}`}
                  style={SERIF}
                >
                  {line.text}
                </p>
              </li>
            )
          })}
        </ul>

        {/* What the photographs and recordings document about themselves,
            read off their records rather than written here. */}
        {material.length > 0 && (
          <div className="mt-[clamp(1.25rem,3vh,1.75rem)] flex flex-col gap-4 border-t border-dotted border-ink/20 pt-[clamp(1rem,2.4vh,1.4rem)]">
            {material.map((m) => (
              <div key={m.key} className="flex items-start gap-4">
                {m.frame ? (
                  <Frame
                    id={m.frame}
                    alt=""
                    art={false}
                    sizes="80px"
                    className="w-[clamp(3.5rem,8vw,5rem)] shrink-0"
                    style={{ aspectRatio: '1 / 1' }}
                  />
                ) : (
                  // A recording has no picture. It gets the same square the
                  // photographs do, with the level meter the sound archive
                  // uses, at rest.
                  <span
                    aria-hidden
                    className="flex aspect-square w-[clamp(3.5rem,8vw,5rem)] shrink-0 items-center justify-center gap-[3px] border border-ink/15"
                  >
                    {[0.34, 0.62, 0.44].map((h) => (
                      <span key={h} className="block w-px bg-ink/45" style={{ height: `${h * 1.5}rem` }} />
                    ))}
                  </span>
                )}
                <dl className="grid min-w-0 flex-1 grid-cols-[6.75rem_minmax(0,1fr)] gap-x-3 gap-y-1 max-sm:grid-cols-[5.75rem_minmax(0,1fr)]">
                  {m.rows.map((r) => (
                    <div key={r.label} className="contents">
                      <dt className="u-label pt-[0.2em] text-slate/80">{r.label}</dt>
                      <dd className="u-mono min-w-0 break-words text-ink/80">
                        {r.href ? (
                          <a
                            href={r.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-paper hover:underline"
                          >
                            {r.value}
                          </a>
                        ) : (
                          r.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}

        {/* And where to find what it is about. */}
        <p className="mt-[clamp(1.1rem,2.6vh,1.5rem)] flex flex-wrap items-baseline gap-x-3 gap-y-2 text-slate">
          <span className="u-label text-slate/80">About</span>
          {about.map((r, i) => (
            <span key={r.key} className="inline-flex items-baseline">
              <Link
                to={r.to}
                aria-label={r.spoken}
                className="text-ink/85 underline decoration-ink/20 underline-offset-[4px] transition-colors duration-[250ms] hover:text-clay-paper hover:decoration-current focus-visible:text-clay-paper"
              >
                {r.label}
              </Link>
              {r.detail && <span className="ml-1.5 text-slate/70">{r.detail}</span>}
              {i < about.length - 1 && <span aria-hidden className="ml-3 text-slate/40">/</span>}
            </span>
          ))}
        </p>
      </FieldNote>
    </li>
  )
}

/**
 * A note in the margin of a document. Not a chapter and not an interruption:
 * set small, beside the section it belongs to, with a pencil rule down its
 * edge. It carries the note's first line and, if it has one, the line that
 * says what is written — the two a reader should not leave without — and
 * sends them to the notebook for the rest.
 */
export function MarginNote({ note, className = '' }: { note: Note; className?: string }) {
  const first = note.lines.find((l) => l.kind !== 'written')
  const written = note.lines.find((l) => l.kind === 'written')
  const shown = [first, written].filter((l) => l !== undefined)

  return (
    <motion.aside
      {...fade(0.1, 1.2)}
      aria-labelledby={`${note.id}-margin`}
      className={`max-w-[36ch] border-l border-paper/25 pl-[clamp(0.85rem,1.4vw,1.1rem)] ${className}`}
    >
      <p className="u-label text-dim">
        Field note {pad(note.n)}
        <span lang="hi" className="u-deva ml-2 normal-case tracking-normal" style={{ fontSize: '0.875rem' }}>
          मैदानी नोट
        </span>
      </p>
      <h3 id={`${note.id}-margin`} className="u-display mt-2 text-cream" style={{ ...SERIF, fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)' }}>
        {note.label}
      </h3>
      {shown.map((l) => (
        <p key={l.text} className="mt-2">
          <span className={`u-label mr-2 ${l.kind === 'written' ? 'text-clay-ink' : 'text-dim'}`}>{KINDS[l.kind].label}</span>
          <span className={`u-display ${l.kind === 'written' ? 'text-dim' : 'text-ash'}`} style={SERIF}>
            {l.text}
          </span>
        </p>
      ))}
      <p className="u-mono mt-3">
        <Link
          to={`/archive#${note.id}`}
          aria-label={`Field note ${note.n}, ${note.label}, in the field archive`}
          className="text-dim underline decoration-paper/20 underline-offset-[4px] transition-colors duration-[250ms] hover:text-cream hover:decoration-current focus-visible:text-cream"
        >
          The full note, in the field archive
        </Link>
      </p>
    </motion.aside>
  )
}
