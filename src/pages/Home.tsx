import { Hero } from '../components/Hero'
import { Intro } from '../components/Intro'
import { Stories } from '../components/Stories'
import { TheQuestion } from '../components/TheQuestion'
import { About, InProduction } from '../components/About'

/** Chapter one, unchanged. */
export function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Stories />
      <TheQuestion />
      <About />
      <InProduction />
    </>
  )
}
