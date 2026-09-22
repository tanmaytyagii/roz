import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { PLACES_BY_STORY, PLACES_OFF_MAP, findPlace, type Place } from '../data/places'
import { statusOf } from '../data/story'
import { Frame, Credit } from '../components/Frame'
import { ChapterMark } from '../components/ChapterMark'
import { Link } from '../components/Link'
import { IndiaMap } from '../components/places/IndiaMap'
import { fade, reveal, rise, uncover } from '../lib/motion'

/**
 * PLACES — where the stories are.
 *
 * A map inside a magazine rather than a map site: the drawing is small, quiet
 * and only ever a way into somebody's day. Every name, count and state on the
 * page is read from the stories; nothing here is a second list of towns.
 */
export function PlacesPage() {
  const places = PLACES_BY_STORY
  const [pinned, setPinned] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  // Hover and focus preview. A click pins. Failing both, the page opens on the
  // first place with something to read in it.
  const fallback = places.find((p) => p.status === 'available') ?? places[0]
  const shown = findPlace(hovered ?? '') ?? findPlace(pinned ?? '') ?? fallback

  useEffect(() => {
    const was = document.title
    document.title = 'Places — जगहें · ROZ'
    return () => {
      document.title = was
    }
  }, [])

  const totalStories = places.reduce((n, p) => n + p.stories.length, 0)

  return (
    <article>
      {/* ── The slate ───────────────────────────────────────────────── */}
      <section id="places-top" data-canvas="ink" className="relative bg-ink">
        <div className="u-pad pt-[clamp(6rem,18vh,11rem)] pb-[clamp(2.5rem,8vh,5rem)]">
          <ChapterMark n={1} title="The geography" className="text-ash" />

          <div className="u-grid mt-[clamp(2.5rem,8vh,5.5rem)] items-end gap-y-[clamp(1.5rem,4vh,2.5rem)]">
            <h1 className="col-span-12 lg:col-span-7">
              <motion.span
                {...reveal()}
                className="u-display block text-paper"
                style={{ fontSize: 'clamp(3.5rem, 13vw, 11rem)', lineHeight: 0.9 }}
              >
                Places
              </motion.span>
              <motion.span
                {...reveal(0.1)}
                lang="hi"
                className="u-deva mt-[0.12em] block text-ash"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 4rem)' }}
              >
                जगहें
              </motion.span>
            </h1>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <motion.p
                {...rise(0.16)}
                className="u-display text-balance text-cream"
                style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.875rem)', lineHeight: 1.2 }}
              >
                Every story belongs somewhere.
              </motion.p>
              <motion.p {...rise(0.22)} className="u-mono mt-[clamp(1rem,2.6vh,1.5rem)] max-w-[34ch] text-ash">
                Cities, towns, streets and edges of places where ordinary days unfold.
              </motion.p>
              <motion.p {...fade(0.3, 1.2)} className="u-mono mt-[clamp(0.75rem,2vh,1.25rem)] text-dim">
                {String(places.length).padStart(2, '0')} places
                <span className="opacity-40"> · </span>
                {String(totalStories).padStart(2, '0')} {totalStories === 1 ? 'story' : 'stories'}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The map, and what is in the place you are on ────────────── */}
      <section id="map" data-canvas="ink" className="relative bg-ink">
        <div className="u-pad u-grid items-start gap-y-[clamp(2.5rem,7vh,4rem)] pb-[clamp(4rem,12vh,8rem)]">
          <motion.div {...fade(0, 1.4)} className="col-span-12 lg:col-span-7">
            <IndiaMap
              places={places}
              shown={shown}
              pinned={pinned}
              onPreview={setHovered}
              onPick={(name) => setPinned((v) => (v === name ? null : name))}
            />
            <p className="u-mono mt-[clamp(1rem,3vh,2rem)] max-w-[44ch] text-dim">
              Drawn from the coastline, not traced from a survey. Seven marks, one for each place a story has been
              photographed in.
            </p>
          </motion.div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <PlacePanel place={shown} />
          </div>
        </div>
      </section>

      {/* ── A photograph, between the drawing and the list ──────────── */}
      <motion.figure {...uncover()} className="relative" data-canvas="ink">
        <Frame
          id="wet-road"
          alt="An empty road at night, the streetlights doubled in the wet tarmac."
          sizes="100vw"
          className="h-[clamp(13rem,40vh,24rem)] w-full"
          position="center 58%"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, var(--color-ink) 0%, transparent 24%, transparent 58%, rgba(10,9,7,0.9) 100%)',
          }}
        />
        <figcaption className="u-pad absolute inset-x-0 bottom-0 pb-[clamp(0.75rem,2vh,1.25rem)]">
          <p className="u-mono text-paper/60">
            <span className="text-clay-ink">The same road, in every one of them.</span>
            <span className="opacity-40"> · </span>
            <Credit id="wet-road" />
          </p>
        </figcaption>
      </motion.figure>

      {/* ── The written index ──────────────────────────────────────── */}
      <section id="the-places" data-canvas="ink" className="relative bg-ink">
        <div className="u-pad pt-[clamp(4rem,12vh,8rem)] pb-[clamp(4rem,12vh,8rem)]">
          <ChapterMark n={2} title="The places" className="text-ash" />
          <div className="u-grid mt-[clamp(2rem,6vh,4rem)] items-end gap-y-[clamp(1.25rem,3vh,2rem)]">
            <motion.h2
              {...reveal()}
              className="u-display col-span-12 text-balance lg:col-span-7"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 4rem)', lineHeight: 1.02 }}
            >
              Seven towns, so far.
            </motion.h2>
            <motion.p
              {...rise(0.1)}
              className="u-mono col-span-12 max-w-[40ch] self-end text-ash lg:col-span-4 lg:col-start-9"
            >
              The same list as the map, set as a page. Counts come from the stories themselves.
            </motion.p>
          </div>

          <PlaceIndex places={places} />

          {PLACES_OFF_MAP.length > 0 && (
            <p className="u-mono mt-[clamp(1.5rem,4vh,2.5rem)] text-dim">
              Not yet placed on the drawing: {PLACES_OFF_MAP.join(', ')}.
            </p>
          )}
        </div>
      </section>

      {/* ── The statement ──────────────────────────────────────────── */}
      <section data-canvas="paper" className="relative bg-paper text-ink">
        <div className="u-pad py-[clamp(4rem,12vh,8rem)]">
          <ChapterMark n={3} title="Why the map is small" className="text-slate" />
          <div className="u-grid mt-[clamp(2.5rem,7vh,4.5rem)] gap-y-[clamp(1.5rem,4vh,2.5rem)]">
            <motion.h2
              {...reveal()}
              className="u-display col-span-12 text-balance lg:col-span-6"
              style={{ fontSize: 'clamp(1.5rem, 3.6vw, 2.75rem)', lineHeight: 1.12 }}
            >
              A country is not the story.
              <span className="block text-slate">Somebody's Tuesday is.</span>
            </motion.h2>
            <motion.div {...rise(0.1)} className="col-span-12 lg:col-span-5 lg:col-start-8">
              <p className="u-mono max-w-[56ch] text-slate">
                The drawing on this page is deliberately poor at being a map. It has no state lines, no roads, no
                district names and no search. It knows seven towns, because ROZ has been to seven towns, and its only
                job is to take you from a dot to a person and then get out of the way.
              </p>
              <p className="u-mono mt-[clamp(1rem,2.6vh,1.5rem)] max-w-[56ch] text-slate/80">
                Where a place is marked <span className="text-clay-paper">in production</span>, it has a photograph and
                a person and nothing else yet. The geography is real. The lives written onto it are not, and the
                archive says so at length.
              </p>
              <p className="mt-[clamp(1.5rem,4vh,2.5rem)]">
                <Link
                  to="/people"
                  className="u-label text-clay-paper underline-offset-[5px] transition-colors duration-[250ms] hover:underline"
                >
                  The people →
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </article>
  )
}

/**
 * What is in the place you are on. An index entry, not a modal: it sits in the
 * column beside the drawing and changes underneath you.
 */
function PlacePanel({ place }: { place: Place }) {
  const n = place.stories.length
  return (
    <div className="border-t border-paper/15 pt-[clamp(1rem,2.6vh,1.5rem)]">
      <h2 className="u-display text-cream" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: 1.05 }}>
        {place.short}
      </h2>
      <p className="u-mono mt-2 text-dim">
        {String(n).padStart(2, '0')} {n === 1 ? 'story' : 'stories'}
        <span className="opacity-40"> · </span>
        {String(n).padStart(2, '0')} {n === 1 ? 'person' : 'people'}
      </p>

      <ul className="mt-[clamp(1.25rem,3vh,2rem)] flex flex-col gap-[clamp(1.25rem,3vh,2rem)]">
        {place.stories.map((s) => {
          const open = statusOf(s.slug) === 'available'
          const meta = (
            <>
              <span className="mt-3 block overflow-hidden">
                <Frame
                  id={s.frame}
                  alt={`${s.occupation.replace(/^The /, '')}, ${s.place}.`}
                  position={s.focus}
                  sizes="(max-width: 1024px) 92vw, 32vw"
                  className="w-full transition-[transform,filter] duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] group-hover:brightness-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  style={{ aspectRatio: '3 / 2' }}
                />
              </span>
              <span className="u-mono mt-3 block max-w-[42ch] text-ash">
                {open ? s.line : 'The story is still being assembled.'}
              </span>
              <span className="mt-3 flex items-center gap-3">
                <span
                  className="u-label"
                  style={{ color: open ? 'var(--color-clay-ink)' : 'var(--color-dim)' }}
                >
                  {open ? 'Enter story' : 'In production'}
                </span>
                <span aria-hidden className="relative block h-px w-[clamp(1.5rem,3vw,2.5rem)] overflow-hidden bg-current/25">
                  <span className="absolute inset-0 origin-left scale-x-0 bg-clay transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                </span>
                {open && <span className="u-mono text-dim">{s.duration}</span>}
              </span>
            </>
          )

          const titling = (
            <>
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="u-display text-paper" style={{ fontSize: 'clamp(1.375rem, 2.4vw, 1.875rem)' }}>
                  {s.name}
                </span>
                <span lang="hi" className="u-deva text-dim" style={{ fontSize: '0.9375rem' }}>
                  {s.nameDeva}
                </span>
              </span>
              <span className="u-mono mt-1 block text-dim">{s.occupation.replace(/^The /, '')}</span>
            </>
          )

          return (
            <li key={s.slug}>
              {open ? (
                <Link to={`/story/${s.slug}`} className="group block">
                  {titling}
                  {meta}
                  <span className="sr-only">
                    — {s.name}, {s.occupation}, {s.place}. Story available.
                  </span>
                </Link>
              ) : (
                <div className="group block">
                  {titling}
                  {meta}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * The same seven places set as a contents page. Hovering or focusing a line
 * brings up its photograph in the plate beside it — the behaviour the archive
 * already established, and for the same reason: the picture belongs to the
 * page, not to the pointer.
 */
function PlaceIndex({ places }: { places: Place[] }) {
  const [at, setAt] = useState<string | null>(null)
  const shown = findPlace(at ?? '') ?? places[0]
  const lead = shown.stories[0]

  return (
    <div className="u-grid mt-[clamp(2.5rem,7vh,4.5rem)] items-start gap-y-[clamp(2rem,5vh,3rem)]">
      <ol className="col-span-12 lg:col-span-7" onMouseLeave={() => setAt(null)}>
        {places.map((p) => {
          const open = p.status === 'available'
          const n = p.stories.length
          return (
            <li key={p.name} className="border-t border-paper/12 last:border-b">
              <a
                href="#map"
                onMouseEnter={() => setAt(p.name)}
                onFocus={() => setAt(p.name)}
                className="group flex items-baseline gap-[clamp(0.75rem,2vw,1.5rem)] py-[clamp(0.9rem,2.4vh,1.5rem)]"
              >
                <span
                  className="u-display min-w-0 flex-1 transition-colors duration-[500ms] ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{
                    fontSize: 'clamp(1.375rem, 3.6vw, 2.5rem)',
                    color:
                      at === null || at === p.name
                        ? 'var(--color-cream)'
                        : 'color-mix(in oklab, var(--color-cream) 32%, var(--color-ink))',
                  }}
                >
                  {p.short}
                </span>
                <span
                  aria-hidden
                  className="u-label hidden shrink-0 sm:inline"
                  style={{ color: open ? 'var(--color-clay-ink)' : 'var(--color-dim)' }}
                >
                  {open ? 'Available' : 'In production'}
                </span>
                <span aria-hidden className="u-mono shrink-0 text-dim" data-count>
                  {String(n).padStart(2, '0')}
                </span>
                <span className="sr-only">
                  {n} {n === 1 ? 'story' : 'stories'}, {open ? 'available to read' : 'in production'}. Go to the map.
                </span>
              </a>
            </li>
          )
        })}
      </ol>

      <figure className="col-span-12 hidden lg:col-span-4 lg:col-start-9 lg:block">
        <div className="sticky top-[clamp(6rem,16vh,9rem)]">
          <div aria-hidden className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
            {places.map((p) => (
              <div
                key={p.name}
                className="absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]"
                style={{
                  opacity: p.name === shown.name ? 1 : 0,
                  transform: p.name === shown.name ? 'scale(1)' : 'scale(1.03)',
                }}
              >
                <Frame id={p.stories[0].frame} alt="" position={p.stories[0].focus} sizes="32vw" className="h-full w-full" />
              </div>
            ))}
          </div>
          {/* Two lines, not three things on one: the column is four columns
              wide and the credit has to stay readable in it. */}
          <figcaption className="u-mono mt-3 text-dim">
            <span aria-hidden className="block">
              <span className="text-clay-ink">{shown.short}</span>
              <span className="opacity-40"> · </span>
              {lead.name}
            </span>
            <span className="mt-1 block opacity-80">
              <span className="sr-only">Photograph: </span>
              <Credit id={lead.frame} />
            </span>
          </figcaption>
        </div>
      </figure>
    </div>
  )
}
