# ROZ — रोज़

**हर दिन की एक कहानी।**
Stories from the India you don't see.

An interactive documentary about everyday India. This repository holds **chapter one, the
homepage**, and **chapter two, the first story** — Raju, the mason, at `/story/raju`.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # tsc -b && vite build  →  dist/
npm run preview    # serve the built site
npm run lint       # oxlint
```

Node 20+. No environment variables, no services, no API keys.

---

## This is a prototype, and it says so

Every **name, age, hour, object, quote and answer** on the site is written. The people in the
photographs are **not** the people described, have not been interviewed, and have not agreed to
anything. The site states this in five places — the stories section header, each frame's
caption, the footer, the foot of Raju's opening slate, and a full editorial note on the way out
of his story — because a demo that quietly attaches invented biographies to real faces is not a
demo, it is a fabrication.

The **soundscapes** are the same arrangement: CC-licensed field recordings, trimmed to a loop,
credited by name and licence, three of the four recorded in India and one not. The page says
which. Nothing plays until somebody presses play, and no audio file is fetched before then.

The photographs are real, CC-licensed documentary work, sourced through
[Openverse](https://openverse.org) and credited beside every frame with a link to the
photographer and the licence. **No-derivatives (ND) work is excluded**: every frame is cropped
and colour-graded, which is a derivative, so ND licences are unusable here regardless of
attribution.

Before any of this is published for real: commissioned photography, actual interviews, signed
permissions.

---

## Structure

```
src/
  App            the router: `/` and `/story/<slug>`, and nothing else
  pages/
    Home           chapter one, the homepage
    StoryPage      chapter two — reads one story document, section by section
  components/
    story/
      Opening      the slate: name, particulars, the line he is known for
      TheDay       seven single-shot hours + the fixed clock and time rail
      TheWork      the six-detail montage
      TheObjects   the specimen sheet, on paper
      TheSound     four ambient loops, click to play, nothing preloaded
      TheWords     the quotes, on paper
      TheDream     the last frame and the last line
      Archive      the editorial note, the other six days, the way back
    Link           an anchor that goes through the History API
    Navigation     bar + full-screen menu overlay
    Hero           three-plate dissolve, parallax, the title composition
    Intro          the premise, on paper — plus the six places
    Stories        the seven spreads, sequenced
    StorySpread    BleedSpread / PlateSpread, the two story layouts
    TheQuestion    the one centred composition on the page
    About          manifesto + the contents page for what is not built
    Footer         colophon, credits, prototype disclosure
    Frame          responsive AVIF/WebP with art-directed mobile crops
    Grain          the film layer — grain plate + vignette
    ChapterMark    the section rule
    Wordmark       ROZ | रोज़
  data/
    stories.ts              demo cast, places, answers, nav
    story.ts                the STORY DOCUMENT shape + the registry
    story-raju.ts           Raju's document — every word of the story
    frames.generated.ts     AUTO-GENERATED image manifest — do not edit
    sounds.generated.ts     AUTO-GENERATED audio manifest — do not edit
  lib/
    router.ts      pathnames, the History API, one event. No dependency.
    motion.ts      reveal primitives; every one collapses under reduced motion
    useLenis.ts    smooth scroll (lazy-loaded, desktop only) + scroll lock
    useNavState.ts one scroll listener for the whole chrome
tools/
  fetch-images.mjs   sources CC candidates from Openverse into .imgcache
  fetch-audio.mjs    sources CC field recordings, trims them on MP3 frame bounds
  contact.mjs        builds a contact sheet for one slot
  contact-multi.mjs  one sheet across several slots, to judge a section at once
  build-images.mjs   grades + encodes public/frames and frames.generated.ts
  fonts.mjs          pulls the four woff2 subsets into public/fonts
  shoot.mjs          screenshots the running site at four viewports
  audit.mjs          first-screen weight, LCP, CLS, reduced motion, scroll lock
  story.mjs          drives a story: routing, Back, the dip, the clock, the sound, RM
  a11y.mjs           overflow at 390/768/1440, and the first ten keyboard stops
```

### Adding the next person

The story page is a reader for a document, not a page about Raju.

1. Add the frames to the `PICKS` table in `tools/build-images.mjs` (and to `MOBILE` for any
   that go full-bleed), then run it.
2. Write `src/data/story-<slug>.ts` against the `StoryDoc` type.
3. Register it in `STORY_DOCS` in `src/data/story.ts`.

`/story/<slug>` now exists, their spread on the homepage turns into a link on its own, and the
plate for them in every other story's archive flips from *In production* to *Enter story*. No
component is copied and no layout is touched.

### Regenerating the imagery

`public/frames` and `src/data/frames.generated.ts` are committed build output. To change the
photography:

```bash
node tools/fetch-images.mjs tools/slots.json        # homepage candidates → .imgcache
node tools/fetch-images.mjs tools/slots-raju.json   # Raju's day, work and objects
node tools/contact-multi.mjs sheet.jpg rj-brick rj-cement rj-hands   # judge a section
# edit the PICKS table in tools/build-images.mjs
node tools/build-images.mjs                         # grade, crop, encode, write the manifest
```

One grade is applied to every frame — saturation pulled back, warm per-channel curves, a
little density — so the photography reads as a single body of work rather than a stock
collage.

`build-images.mjs` clears `public/frames` before it starts, so do not point a running dev
server at it mid-run.

### Regenerating the sound

`public/sounds` and `src/data/sounds.generated.ts` are committed build output too.

```bash
node tools/fetch-audio.mjs      # download, trim to 25 s, write the manifest
```

The trim cuts on MP3 frame boundaries rather than re-encoding — every frame carries its own
header, so a cut between two of them leaves a valid file. It keeps a 40-second field recording
down to a loop without putting a transcoder in the toolchain.

---

## Design notes

- **The pointer is the reader's.** No custom cursor, no cursor label, no magnetic element.
  Hover is carried by the thing being hovered — a hairline, a change of opacity, two percent of
  scale — never by redrawing the mouse.
- **Two canvases.** Warm black and aged paper, alternating. The flip from one to the other is
  the strongest structural device on the page.
- **Four typefaces, self-hosted.** Instrument Serif (display), Tiro Devanagari Hindi (all
  Devanagari), Archivo (interface), DM Mono (timecodes and credits). 144 kB total.
- **Devanagari is not decoration.** It carries the wordmark, the hero, the names, the quotes
  and the answers, and every run is marked `lang="hi"`.
- **Motion is cinema, not a demo reel.** One dissolve curve, three parallax speeds, one hover
  settle of 2%. The pointer is the reader's own — there is no custom cursor, no cursor label
  and no magnetic element. With `prefers-reduced-motion` set, reveals return the arrived state
  with no animation and no dependence on scroll — nothing is ever hidden behind a scroll
  event.
- **Mobile is a separate design.** Full-bleed spreads become portrait plates with the titling
  below them, and the wide photographs are re-cropped for portrait screens rather than
  squeezed — otherwise the subject falls out of frame.

- **Between documents, the room goes dark.** One 190 ms dip to ink, the swap underneath it,
  then 460 ms back up. No spinner, no bar, no percentage — and no page-wide blur, which would
  read the same and cost a full-document readback.
- **Reading progress is one hairline** on the very top edge of the page, in clay at half
  strength. It sits outside the bar on purpose: the bar leaves on the way down and the line
  should not leave with it.

### Inside a story

- **The light is the hour.** Each of the seven chapters carries its own two-stop gradient,
  laid over the photograph in `soft-light`: blue before dawn, gold at seven, bleached at one,
  amber at seven, indigo after dark. Scrolling the day is watching the light move.
- **The clock keeps the real distance.** A rail down the right edge counts the actual minutes
  between chapters as you scroll, so 10:42 → 13:27 takes as long as it should. It is written
  straight to the DOM on rAF; only the lit tick is state, and only when it changes.
- **The rail folds up on a narrow screen.** Below `lg` the right-edge rail becomes two words
  of mono in the corner the chapter titling already leaves empty — which hour, how far through
  — and unfolds the seven hours upward when tapped. The trigger comes first in the DOM and the
  container is `flex-col-reverse`, so Tab walks forward into the hours instead of backwards out
  of them.
- **The canvas alternates the same way the homepage does** — film, film, film, paper, film,
  paper, film, film — so eight sections still read as a sequence rather than a stack.
- **The objects are a specimen sheet, not cards.** Nothing is boxed, nothing is bordered, no
  two plates are the same size, and each annotation sits one column off its own plate on a
  hairline leader.
- **The sound is opt-in all the way down.** No `<audio>` element exists until a click, so
  scrolling past the section costs nothing at all. The transport is three hairlines — the
  smallest level meter that still reads as sound — still and muted at rest, moving and clay
  while it runs, with the state also written out in words beside it.

---

## Measured

Production build, 1440×900, local preview:

| | |
|---|---|
| JS | 143 kB gzip (+5 kB Lenis, loaded off the critical path) |
| CSS | 8 kB gzip |
| Fonts | 144 kB, preloaded, subset |
| First screen | ~890 kB including all three hero plates |
| LCP | ~90 ms |
| CLS | 0 |
| Grain | no measurable frame cost — a locked 16.7 ms median either way |
| Audio | 0 bytes until somebody presses play (4 × ~25 s, ~0.5 MB each) |

Every frame ships AVIF with a WebP fallback at 2–4 widths, carries an inlined 20px placeholder,
and declares its dimensions. Only the first hero plate is eager; the other two load after
`load`.

---

## Not built

The other six days, the site-wide soundscapes, the portrait mosaic, the map and the archive.
The homepage's contents section lists them; the six unbuilt spreads say so when you press
`ENTER STORY` rather than pretending, and their plates in Raju's archive are marked
*In production*.
