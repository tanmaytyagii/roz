import { useEffect } from 'react'
import { motion } from 'motion/react'
import { STORIES } from '../data/stories'
import { getStoryDoc } from '../data/story'
import { Opening } from '../components/story/Opening'
import { TheDay } from '../components/story/TheDay'
import { TheWork } from '../components/story/TheWork'
import { TheObjects } from '../components/story/TheObjects'
import { TheSound } from '../components/story/TheSound'
import { TheWords } from '../components/story/TheWords'
import { TheDream } from '../components/story/TheDream'
import { Archive } from '../components/story/Archive'
import { Link } from '../components/Link'
import { rise } from '../lib/motion'

/**
 * One story, read from its document.
 *
 * The order is fixed and the sections are generic: the slate, the day, the
 * work, the objects, the sound, the words, the dream, the way out. Every one of
 * them takes the document and nothing else, so the second story is a data file
 * and a line in the registry.
 *
 * The canvas alternates — film, film, film, paper, film, paper, film, film —
 * so the read has the same measure as the homepage rather than eight screens of
 * the same ground.
 */
export function StoryPage({ slug }: { slug: string }) {
  const story = STORIES.find((s) => s.slug === slug)
  const doc = getStoryDoc(slug)

  useEffect(() => {
    if (!story || !doc) return
    const was = document.title
    document.title = `${story.name} — ${story.occupation}, ${story.place} · ROZ`
    return () => {
      document.title = was
    }
  }, [story, doc])

  if (!story || !doc) return <NotFound slug={slug} />

  return (
    <article key={slug}>
      <Opening story={story} doc={doc} />
      <TheDay doc={doc} />
      <TheWork doc={doc} />
      <TheObjects doc={doc} />
      <TheSound doc={doc} />
      <TheWords doc={doc} />
      <TheDream doc={doc} />
      <Archive slug={slug} />
    </article>
  )
}

/** A story that has no document yet, or a link to somebody who is not here. */
function NotFound({ slug }: { slug: string }) {
  const known = STORIES.find((s) => s.slug === slug)
  return (
    <section
      data-canvas="ink"
      className="flex min-h-[100svh] flex-col justify-center bg-ink py-[clamp(6rem,18vh,12rem)]"
    >
      <div className="u-pad u-grid">
        <div className="col-span-12 lg:col-span-7 lg:col-start-2">
          <motion.p {...rise()} className="u-label text-clay-ink">
            Not built
          </motion.p>
          <motion.h1
            {...rise(0.06)}
            className="u-display mt-[clamp(1rem,3vh,2rem)] text-balance"
            style={{ fontSize: 'clamp(2.25rem, 7vw, 5.5rem)', lineHeight: 1 }}
          >
            {known ? `${known.name}'s day is in production.` : 'There is no story here.'}
          </motion.h1>
          <motion.p {...rise(0.14)} className="u-mono mt-[clamp(1.5rem,4vh,2.5rem)] max-w-[46ch] text-ash">
            {known
              ? 'Their spread is on the homepage. The story experience has been built for one person so far.'
              : 'The address does not match anybody in the archive.'}
          </motion.p>
          <motion.p {...rise(0.2)} className="mt-[clamp(2rem,6vh,3.5rem)]">
            <Link to="/#stories" className="group inline-flex items-center gap-3">
              <span className="u-label">Back to the stories</span>
              <span aria-hidden className="relative block h-px w-[clamp(2rem,4vw,3.25rem)] overflow-hidden bg-current/35">
                <span className="absolute inset-0 origin-left scale-x-0 bg-clay transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </span>
            </Link>
          </motion.p>
        </div>
      </div>
    </section>
  )
}
