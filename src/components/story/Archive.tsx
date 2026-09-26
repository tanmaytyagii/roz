import { motion } from 'motion/react'
import { STORIES } from '../../data/stories'
import { IN_PRODUCTION, NEXT_NUMBER, factsFor, turnFrom, type Reading } from '../../data/issue'
import { ISSUE, tally } from '../../data/relations'
import { ChapterMark } from '../ChapterMark'
import { Link } from '../Link'
import { FieldNote } from '../FieldNote'
import { ArchiveRelation } from '../ArchiveRelation'
import { DocumentEntry } from '../DocumentNav'
import { fade, reveal, rise } from '../../lib/motion'
import { inWords, listed } from '../../lib/words'

/**
 * THE END OF A DOCUMENT.
 *
 * The same four beats after every document, whatever its grammar: the end is
 * marked, the document's archive is opened, the editor says what comes next in
 * the issue, and the way back to the issue is the last thing on the page.
 *
 * The end line mirrors the line each document opens on — the issue on one
 * side, the document's number on the other — so a document is bracketed by
 * the same rule top and bottom.
 *
 * What comes next is read from the issue's order, not chosen here: the
 * document after this one if there is one, the ones before it if not, and then
 * the number the next finished document will take, which belongs to nobody
 * yet.
 */
export function Archive({ reading, n }: { reading: Reading; n: number }) {
  const { story, doc, number } = reading
  const { next, earlier } = turnFrom(story.slug)
  const facts = factsFor(story.slug)
  const built = STORIES.length - IN_PRODUCTION.length
  const heading = `end-${story.slug}`

  return (
    <section id="archive" data-canvas="ink" aria-labelledby={heading} className="relative bg-ink">
      {/* The end, marked. */}
      <div className="u-pad pt-[clamp(3.5rem,10vh,7rem)]">
        <motion.div
          {...fade(0, 1.2)}
          className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-paper/20 pt-[clamp(0.9rem,2.2vh,1.4rem)]"
        >
          <h2 id={heading} className="u-label text-clay-ink">
            End of Document {number}
          </h2>
          <p lang="hi" className="u-deva text-dim" style={{ fontSize: '0.9375rem' }}>
            {story.nameDeva}
          </p>
          <p className="u-mono ml-auto whitespace-nowrap text-dim">
            ROZ <span className="opacity-40">/</span> Issue {ISSUE.number}
          </p>
        </motion.div>
      </div>

      {/* What the document holds, then what it is not. */}
      <div className="u-pad pt-[clamp(2.5rem,7vh,4.5rem)]">
        <div className="u-grid">
          <div className="col-span-12 lg:col-span-8">
            <ArchiveRelation slug={story.slug} omit="story" />
            {/* And where the rest of it is kept: the sheets its photographs
                are filed on at the back of the issue, and the notes on them. */}
            {(facts.filed.length > 0 || facts.notes.length > 0) && (
              <motion.div
                {...fade()}
                className="u-grid items-baseline gap-y-1 border-t border-paper/12 py-[clamp(0.6rem,1.6vh,1rem)]"
              >
                <span className="u-label col-span-12 text-dim sm:col-span-3">In the back matter</span>
                <span className="col-span-12 flex flex-wrap items-baseline gap-x-4 gap-y-1 sm:col-span-9">
                  {facts.filed.map((f) => (
                    <Link
                      key={f.id}
                      to={`/archive#${f.id}`}
                      className="u-mono text-cream underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline"
                    >
                      {f.title} <span className="text-dim">{tally(f.plates)}</span>
                    </Link>
                  ))}
                  {facts.notes.length > 0 && (
                    <Link
                      to="/archive#field-notes"
                      className="u-mono text-cream underline-offset-[3px] transition-colors duration-[250ms] hover:text-clay-ink hover:underline"
                    >
                      Field notes <span className="text-dim">{tally(facts.notes.length)}</span>
                    </Link>
                  )}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-[clamp(2.5rem,7vh,4.5rem)]">
          <FieldNote n={1} title="A note on this story">
            {doc.note}
          </FieldNote>
        </div>
      </div>

      {/* What the editor puts after it. */}
      <div className="u-pad pt-[clamp(4rem,12vh,8rem)] pb-[clamp(1.5rem,4vh,2.5rem)]">
        <ChapterMark n={n} title="In this issue" className="text-ash" />
        <motion.h2
          {...reveal()}
          className="u-display mt-[clamp(2rem,6vh,4rem)] text-balance"
          style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1 }}
        >
          {inWords(built, true)} {built === 1 ? 'day' : 'days'}, of {inWords(STORIES.length)}.
        </motion.h2>
      </div>

      <ol className="u-pad pb-[clamp(3rem,9vh,6rem)]">
        {next.map((r, i) => (
          <DocumentEntry key={r.story.slug} reading={r} label={i === 0 ? 'Next in this issue' : 'Then'} />
        ))}
        {earlier.map((r, i) => (
          <DocumentEntry key={r.story.slug} reading={r} label={i === 0 ? 'Earlier in this issue' : 'And'} />
        ))}
        {IN_PRODUCTION.length > 0 && (
          <motion.li {...rise(0, 16)} className="border-t border-paper/12">
            <Link to="/archive#unfinished" className="group u-grid items-baseline gap-y-2 py-[clamp(1.5rem,4vh,2.5rem)]">
              <span className="u-label col-span-12 text-dim lg:col-span-3">Not yet in this issue</span>
              <span className="col-span-12 lg:col-span-9">
                <span className="u-mono block text-dim">Document {NEXT_NUMBER}</span>
                <span
                  className="u-display mt-2 block text-ash transition-colors duration-500 group-hover:text-cream group-focus-visible:text-cream"
                  style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.5rem)' }}
                >
                  In production
                </span>
                <span className="u-mono mt-3 block max-w-[52ch] text-dim">
                  {inWords(IN_PRODUCTION.length, true)} people have a photograph on file and a premise, and none of
                  their documents is built: {listed(IN_PRODUCTION.map((s) => s.name))}. Nobody has been given this
                  number.
                </span>
                <span className="u-label mt-4 inline-flex items-center gap-3 text-dim transition-colors duration-500 group-hover:text-cream group-focus-visible:text-cream">
                  The unfinished documents
                  <span aria-hidden className="relative block h-px w-[clamp(1.5rem,3vw,2.5rem)] overflow-hidden bg-current/30">
                    <span className="absolute inset-0 origin-left scale-x-0 bg-clay transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                  </span>
                </span>
              </span>
            </Link>
          </motion.li>
        )}
      </ol>

      {/* And home to the issue, which is the last thing on the page. */}
      <div className="u-pad pb-[clamp(4rem,12vh,8rem)]">
        <motion.div {...rise()} className="border-t border-paper/12 pt-[clamp(2rem,6vh,4rem)]">
          <Link
            to="/#contents"
            className="group inline-flex flex-wrap items-baseline gap-x-[clamp(1rem,3vw,2.5rem)] gap-y-2"
          >
            <span
              className="u-display text-ash transition-[transform,color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[0.1em] group-hover:text-cream"
              style={{ fontSize: 'clamp(2rem, 7vw, 5.5rem)', lineHeight: 1 }}
            >
              Return to Issue {ISSUE.number}
            </span>
            <span lang="hi" className="u-deva text-dim" style={{ fontSize: 'clamp(1rem,1.7vw,1.375rem)' }}>
              अंक
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
