import { motion } from 'motion/react'
import { STORIES } from '../data/stories'
import { BleedSpread, PlateSpread } from './StorySpread'
import { ChapterMark } from './ChapterMark'
import { rise } from '../lib/motion'
import { inWords } from '../lib/words'

/**
 * Seven spreads. The sequence alternates between a photograph that is the whole
 * page and a photograph set into it, so the scroll has a measure to it rather
 * than being seven of the same thing.
 */
export function Stories() {
  const by = (slug: string) => STORIES.find((s) => s.slug === slug)!

  return (
    <section id="stories" data-canvas="ink" className="relative bg-ink">
      <header className="u-pad pt-[clamp(4.5rem,13vh,10rem)] pb-[clamp(2.5rem,7vh,5rem)]">
        <ChapterMark n={2} title={`${inWords(STORIES.length, true)} days`} className="text-ash" />
        <div className="u-grid mt-[clamp(2rem,6vh,4.5rem)] gap-y-[clamp(1.5rem,4vh,2.5rem)]">
          <motion.h2
            {...rise()}
            className="u-display col-span-12 text-balance lg:col-span-7"
            style={{ fontSize: 'clamp(2rem, 6vw, 5.25rem)', lineHeight: 1 }}
          >
            {inWords(STORIES.length, true)} people.
            <span className="block text-ash">One ordinary day each.</span>
          </motion.h2>

          <motion.p {...rise(0.12)} className="u-mono col-span-12 max-w-[46ch] text-ash lg:col-span-4 lg:col-start-9">
            <span className="text-clay-ink">Editor's note.</span> The names, ages and words on these {inWords(STORIES.length)} spreads are
            written. The photographs are real, licensed documentary work, credited under each frame — the people in
            them are not the people described. Both are placeholders until interviews, commissioned photography and
            signed permissions exist.
          </motion.p>
        </div>
      </header>

      <BleedSpread story={by('raju')} align="left" />
      <PlateSpread story={by('shanti')} side="left" />
      <BleedSpread story={by('imran')} align="right" height="92svh" />
      <PlateSpread story={by('meena')} side="right" />
      <PlateSpread story={by('ramesh')} side="left" />
      <BleedSpread story={by('asha')} align="left" height="84svh" />
      <BleedSpread story={by('arjun')} align="right" />
    </section>
  )
}
