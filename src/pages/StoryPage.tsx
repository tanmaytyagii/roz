import { useEffect } from 'react'
import { STORIES } from '../data/stories'
import { chapterCount, getStoryDoc } from '../data/story'
import { readingFor } from '../data/issue'
import { Opening } from '../components/story/Opening'
import { TheDay } from '../components/story/TheDay'
import { TheWork } from '../components/story/TheWork'
import { TheObjects } from '../components/story/TheObjects'
import { TheSound } from '../components/story/TheSound'
import { TheWords } from '../components/story/TheWords'
import { TheDream } from '../components/story/TheDream'
import { DocumentSlate } from '../components/story/DocumentSlate'
import { Sequence } from '../components/story/Sequence'
import { Archive } from '../components/story/Archive'
import { NotFound } from './NotFound'

/**
 * One story, read from its document.
 *
 * Which reader depends on the document's grammar, never on whose it is.
 *
 * A *day* has a fixed order and generic sections: the slate, the day, the
 * work, the objects, the sound, the words, the dream. The canvas alternates —
 * film, film, film, paper, film, paper, film — so the read has the same
 * measure as the homepage rather than eight screens of the same ground.
 *
 * A *sequence* takes its order from the data: a slate of type, then whatever
 * chapters the material can carry.
 *
 * Both open on the same line — the issue, and the document's number — and
 * end the same way out: the end marked, the archive, what comes next in the
 * issue, and the way back to it.
 */
export function StoryPage({ slug }: { slug: string }) {
  const story = STORIES.find((s) => s.slug === slug)
  const doc = getStoryDoc(slug)
  const reading = readingFor(slug)

  useEffect(() => {
    if (!story || !reading) return
    const was = document.title
    document.title = `${story.name} — ${story.occupation}, ${story.place} · Document ${reading.number} · ROZ`
    return () => {
      document.title = was
    }
  }, [story, reading])

  if (!story || !doc || !reading) return <NotFound slug={slug} />

  return (
    <article key={slug}>
      {doc.grammar === 'day' ? (
        <>
          <Opening story={story} doc={doc} reading={reading} />
          <TheDay doc={doc} />
          <TheWork doc={doc} />
          <TheObjects doc={doc} />
          <TheSound doc={doc} />
          <TheWords doc={doc} />
          <TheDream doc={doc} />
        </>
      ) : (
        <>
          <DocumentSlate story={story} doc={doc} reading={reading} />
          <Sequence doc={doc} />
        </>
      )}
      <Archive reading={reading} n={chapterCount(doc) + 1} />
    </article>
  )
}
