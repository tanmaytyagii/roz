import { useEffect } from 'react'
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
import { NotFound } from './NotFound'

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
