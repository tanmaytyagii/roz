import { motion } from 'motion/react'
import { FRAMES } from '../data/frames.generated'
import { MADE_OF_DOCUMENTS, OPEN_FILES, UNASSIGNED, type OpenFile } from '../data/unfinished'
import { KINDS } from '../data/notes'
import { ISSUE, tally } from '../data/relations'
import { ChapterMark } from './ChapterMark'
import { Frame } from './Frame'
import { Link } from './Link'
import { fade, reveal, rise } from '../lib/motion'
import { inWords, listed } from '../lib/words'

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

/**
 * THE UNFINISHED DOCUMENTS.
 *
 * The back room of the issue: a production sheet for every document still
 * open. Each is set as a filing sheet rather than as a card — a ruled line
 * across the top, the person on the left, the one photograph on file in the
 * middle, and a ledger on the right of what the archive holds and what it does
 * not. Nothing is estimated. There is no progress, no date and no number;
 * absence is written down plainly, the way an editor would note it.
 */
export function UnfinishedDocuments({ n }: { n: number }) {
  if (!OPEN_FILES.length) return null

  // What the finished documents are made of, said once for all the files.
  const byDocument = new Map<string, string[]>()
  for (const m of MADE_OF_DOCUMENTS) {
    for (const d of m.in) byDocument.set(d, [...(byDocument.get(d) ?? []), lower(m.label)])
  }
  const madeOf = [...byDocument.entries()].map(([doc, parts]) => `${doc} is made of ${listed(parts)}`)
  const everyFileHasAPhotograph = OPEN_FILES.every((f) => f.photograph.plate)

  return (
    <section id="unfinished" data-canvas="ink" aria-labelledby="unfinished-heading" className="relative scroll-mt-24 bg-ink">
      <div className="u-pad pt-[clamp(4rem,12vh,8rem)]">
        <ChapterMark n={n} title="Unfinished documents" className="text-ash" />
        <div className="u-grid mt-[clamp(2.5rem,7vh,4.5rem)] items-end gap-y-[clamp(1.25rem,3vh,2rem)]">
          <h2 id="unfinished-heading" className="col-span-12 lg:col-span-7">
            <motion.span
              {...reveal()}
              className="u-display block text-paper"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 4rem)', lineHeight: 1.02 }}
            >
              Unfinished documents
            </motion.span>
            <motion.span
              {...reveal(0.08)}
              lang="hi"
              className="u-deva mt-[0.15em] block text-ash"
              style={{ fontSize: 'clamp(1.125rem, 2.6vw, 2rem)' }}
            >
              अधूरे दस्तावेज़
            </motion.span>
          </h2>
          <motion.p
            {...rise(0.1)}
            className="u-mono col-span-12 max-w-[42ch] self-end text-ash lg:col-span-4 lg:col-start-9"
          >
            {inWords(OPEN_FILES.length, true)} documents stay open. Not because anyone forgot them: the archive does not
            yet hold enough to make them without inventing what is missing.
          </motion.p>
        </div>

        {/* The principle, and what "enough" means, said once. */}
        <motion.div
          {...fade(0.1, 1.2)}
          className="u-grid mt-[clamp(2.5rem,7vh,4rem)] gap-y-3 border-t border-paper/12 pt-[clamp(1.25rem,3vh,2rem)]"
        >
          <p
            className="u-display col-span-12 text-balance text-cream lg:col-span-6"
            style={{ fontSize: 'clamp(1.375rem, 2.6vw, 2.25rem)', lineHeight: 1.12 }}
          >
            An unfinished document is better than an invented one.
          </p>
          <p className="u-mono col-span-12 max-w-[52ch] text-dim lg:col-span-5 lg:col-start-8">
            {madeOf.join('; ')}.{' '}
            {everyFileHasAPhotograph
              ? `For the ${inWords(OPEN_FILES.length)} below, the archive holds none of that beyond one photograph each — and the photograph is not of the person named.`
              : 'For the documents below, the archive holds none of that yet.'}{' '}
            None of them is given a document number: {UNASSIGNED} is still unassigned.
          </p>
        </motion.div>
      </div>

      <ol className="u-pad mt-[clamp(2.5rem,7vh,4.5rem)]">
        {OPEN_FILES.map((file) => (
          <ProductionSheet key={file.id} file={file} />
        ))}
      </ol>

      <div className="u-pad pt-[clamp(1.5rem,4vh,2.5rem)] pb-[clamp(3rem,9vh,6rem)]">
        <motion.p {...fade(0.1, 1.2)} className="u-mono flex flex-wrap gap-x-6 gap-y-3 text-dim">
          <Link
            to="/people"
            className="py-1 underline decoration-paper/20 underline-offset-[4px] transition-colors duration-[250ms] hover:text-cream hover:decoration-current focus-visible:text-cream"
          >
            All of them in the people index
          </Link>
          <Link
            to="/#contents"
            className="py-1 underline decoration-paper/20 underline-offset-[4px] transition-colors duration-[250ms] hover:text-cream hover:decoration-current focus-visible:text-cream"
          >
            Return to Issue {ISSUE.number}
          </Link>
        </motion.p>
      </div>
    </section>
  )
}

/**
 * One open file. The person on the left, as the issue has written them; the
 * photograph on file in the middle, with only what its record says about it;
 * the ledger on the right — what the archive holds, marked documented or
 * written, then what it does not.
 */
function ProductionSheet({ file }: { file: OpenFile }) {
  const { story, photograph: ph } = file
  const heading = `${file.id}-name`
  const aspect = FRAMES[story.frame].aspect
  const upright = aspect < 1

  return (
    <li>
      <motion.article
        {...rise(0, 18)}
        id={file.id}
        aria-labelledby={heading}
        className="u-grid scroll-mt-24 gap-y-[clamp(1.25rem,3vh,2rem)] border-t border-paper/15 pt-[clamp(0.9rem,2.2vh,1.25rem)] pb-[clamp(2.5rem,7vh,4.5rem)]"
      >
        {/* The filing line: what this sheet is, and what it is not given. */}
        <p className="u-mono col-span-12 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-dim">
          <span className="u-label text-clay-ink">Document in production</span>
          <span aria-hidden className="hidden h-px min-w-[2rem] flex-1 translate-y-[-0.25em] border-b border-dotted border-paper/20 sm:block" />
          <span>No document number</span>
        </p>

        {/* The person, as written. */}
        <div className="col-span-12 lg:col-span-3">
          <h3 id={heading} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="u-display text-cream" style={{ fontSize: 'clamp(2rem, 4.4vw, 3.5rem)', lineHeight: 0.95 }}>
              {story.name}
            </span>
            <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(1rem, 1.6vw, 1.25rem)' }}>
              {story.nameDeva}
            </span>
          </h3>
          <p className="u-mono mt-3 text-ash">
            {story.occupation.replace(/^The /, '')}, {story.age}
            <span lang="hi" className="u-deva ml-2 text-dim" style={{ fontSize: '0.9375rem' }}>
              {story.occupationDeva}
            </span>
          </p>
          <p className="u-label mt-3 text-clay-ink">Written for the prototype</p>
        </div>

        {/* The one photograph on file. */}
        <figure className="col-span-12 sm:col-span-7 lg:col-span-4 lg:col-start-4">
          <p className="u-label mb-2 text-dim">In the archive · the photograph on file</p>
          {ph.plate ? (
            <Link
              to={`/archive#plate/${ph.plate.id}`}
              aria-label={`Plate ${tally(ph.plate.n)} in the field archive: ${story.seen}`}
              className={`group block overflow-hidden ${upright ? 'max-w-[20rem]' : ''}`}
            >
              <Frame
                id={story.frame}
                alt=""
                art={false}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 56vw, 30vw"
                className="w-full transition-[transform,filter] duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] group-hover:brightness-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                style={{ aspectRatio: String(aspect) }}
              />
            </Link>
          ) : (
            <Frame
              id={story.frame}
              alt={story.seen}
              art={false}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 56vw, 30vw"
              className={`w-full ${upright ? 'max-w-[20rem]' : ''}`}
              style={{ aspectRatio: String(aspect) }}
            />
          )}
          <figcaption className="mt-3">
            <p className="u-mono text-ash">
              {story.seen} <span className="text-dim">Nobody in it is {story.name}.</span>
            </p>
            <dl className="mt-3 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-dotted border-paper/15 pt-3">
              {ph.creator && (
                <Row label="Photograph">
                  <a href={ph.source} target="_blank" rel="noreferrer noopener" className="underline-offset-[3px] hover:text-clay-ink hover:underline">
                    {ph.creator}
                  </a>
                </Row>
              )}
              {ph.licence && (
                <Row label="Licence">
                  <a href={ph.licenceUrl} target="_blank" rel="noreferrer noopener" className="underline-offset-[3px] hover:text-clay-ink hover:underline">
                    {ph.licence}
                  </a>
                </Row>
              )}
              {ph.host && <Row label="Source">{ph.host}</Row>}
              {/* The one thing most often assumed about a photograph, and the
                  one its record here does not say. */}
              <Row label="Place">{ph.placed ?? 'Not recorded'}</Row>
              {ph.plate && <Row label="Filed">Plate {tally(ph.plate.n)} · Subjects</Row>}
            </dl>
          </figcaption>
        </figure>

        {/* The ledger. */}
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <h4 className="u-label text-dim">In the archive</h4>
          <ul className="mt-2">
            {file.held.map((h) => (
              <li key={h.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-t border-paper/10 py-[clamp(0.55rem,1.4vh,0.85rem)] max-sm:grid-cols-1 max-sm:gap-y-1">
                <span className="u-label text-dim">{h.label}</span>
                {/* Set in the mono's own measure, so a wrapped line keeps its leading. */}
                <span className="u-mono block leading-[1.6] text-ash">
                  <span className={`u-label mr-2 ${h.kind === 'written' ? 'text-clay-ink' : 'text-cream'}`}>
                    {KINDS[h.kind].label}
                  </span>
                  {h.deva && (
                    <span
                      lang="hi"
                      className="u-deva my-1 block text-cream"
                      style={{ fontSize: 'clamp(1.0625rem, 1.5vw, 1.25rem)' }}
                    >
                      {h.deva}
                    </span>
                  )}
                  {h.value}
                  {h.to && h.where && (
                    <>
                      <span aria-hidden className="opacity-40"> · </span>
                      <Link
                        to={h.to}
                        className="whitespace-nowrap text-cream underline decoration-paper/25 underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:decoration-current focus-visible:text-clay-ink"
                      >
                        {h.where}
                      </Link>
                    </>
                  )}
                </span>
              </li>
            ))}
            {file.notes.length > 0 && (
              <li className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-t border-paper/10 py-[clamp(0.55rem,1.4vh,0.85rem)]">
                <span className="u-label text-dim">Field notes</span>
                <span className="u-mono flex flex-wrap gap-x-3">
                  {file.notes.map((note) => (
                    <Link
                      key={note.id}
                      to={`/archive#${note.id}`}
                      aria-label={`Field note ${note.n}: ${note.label}`}
                      className="-mx-2 -my-3 inline-block px-2 py-3 text-cream underline decoration-paper/25 underline-offset-[3px]"
                    >
                      {tally(note.n)}
                    </Link>
                  ))}
                </span>
              </li>
            )}
          </ul>

          <h4 className="u-label mt-[clamp(1.25rem,3vh,2rem)] text-dim">Not in the archive</h4>
          <p className="u-mono mt-2 border-t border-paper/10 pt-[clamp(0.55rem,1.4vh,0.85rem)] leading-[1.6]">
            <span className="text-cream">{listed(file.absent.map((a) => lower(a.label)))}.</span>{' '}
            <span className="text-dim">None of it has been made, and none of it will be written in to fill the gap.</span>
          </p>

          <dl className="mt-[clamp(1.25rem,3vh,2rem)] grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 border-t border-paper/10 pt-3">
            <Row label="Status">
              <span className="u-label text-clay-ink">In production</span>
            </Row>
            <Row label="Number">Not assigned</Row>
          </dl>

          <p className="u-mono mt-[clamp(1.25rem,3vh,2rem)]">
            <Link
              to={`/people#person-${story.slug}`}
              className="inline-block py-1 text-ash underline decoration-paper/25 underline-offset-[4px] transition-colors duration-[250ms] hover:text-cream hover:decoration-current focus-visible:text-cream"
            >
              Return to {story.name} in the people index
            </Link>
          </p>
        </div>
      </motion.article>
    </li>
  )
}

/** One line of a sheet's small ledger. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="contents">
      <dt className="u-label pt-[0.2em] text-dim">{label}</dt>
      <dd className="u-mono min-w-0 break-words text-ash">{children}</dd>
    </div>
  )
}
