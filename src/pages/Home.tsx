import { Hero } from '../components/Hero'
import { Intro } from '../components/Intro'
import { Stories } from '../components/Stories'
import { TheQuestion } from '../components/TheQuestion'
import { About, Contents } from '../components/About'

/** Chapter one, unchanged. */
export function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Stories />
      <TheQuestion />
      <About />
      <Contents />
    </>
  )
}
