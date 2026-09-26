# ROZ — रोज़

**हर दिन की एक कहानी।**
Stories from the India you don't see.

An interactive documentary about everyday India, set as one issue of a publication. **Issue 01**
opens on its contents at `/#contents` and holds:

- **Two documents** you can read all the way through — Document 01, Raju's day
  (`/story/raju`), and Document 02, Shanti's corner (`/story/shanti`). They are built in two
  different grammars: a day told hour by hour, and a sequence held on one photograph.
- **Three indexes** — the people at `/people`, the map at `/places`, the recordings at `/sounds`.
- **The back matter** at `/archive` — every photograph as proof sheets, the field notes, the
  recordings, the fragments, the unfinished documents, and the colophon.

Seven people are in the issue. Five of them have no document: their files stay open in the back
matter, with what the archive holds for each and what it does not.

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

Every **name, age, hour, object, quote, mark and answer** is written for the prototype. The
people in the photographs are **not** the people described, have not been interviewed, and have
not agreed to anything. Each document says so at its opening and again in a note at its end, and
the colophon says it for the issue.

The **photographs** are real, CC-licensed documentary work, sourced through
[Openverse](https://openverse.org) and credited beside every frame with a link to the
photographer and the licence. **No-derivatives (ND) work is excluded**: every frame is cropped
and graded, which is a derivative. A photograph is given a place only where its own source
names one — in this issue, one frame of Varanasi. Nothing is placed from what is visible in a
picture.

The **recordings** are CC-licensed field recordings from Freesound, trimmed to a loop and
credited by name and licence. All four are listed by Document 01. Two name India in their own
titles; the other two do not say where they were made. Each is shown with what its record says,
never with a location it does not give. Nothing plays until somebody presses play, and no audio
is fetched before then.

The **field notes** mark every line as *documented* (from a photograph's or recording's own
record), *observed* (the editor's reading of how the archive uses its material) or *written*
(prototype writing). A note whose evidence stops being true stops being drawn.

Before any of this is published for real: commissioned photography, actual interviews, signed
permissions.

---

## Structure

```
src/
  App              the router, the page turn, the lazy document chunks (warmed on idle)
  pages/
    Home           the cold open, the stories, the question, and the contents
    StoryPage      reads one document in whichever grammar it is written
    PeoplePage     the people index
    PlacesPage     the map, the panel, the written index of towns
    SoundsPage     the sound archive
    ArchivePage    the back matter
    NotFound       an address that matches nobody, or a document not built
  components/
    story/         the two grammars: Opening, TheDay, TheWork, TheObjects, TheSound,
                   TheWords, TheDream (a day); DocumentSlate, Sequence, MarkedFrame
                   (a sequence); Archive (the end of every document)
    About          the manifesto, and `Contents` — the issue's cover and contents page
    DocumentNav    a document's opening line and disclosure, and its contents entry
    RunningHead    ROZ / Issue 01, across the pages that belong to the whole issue
    Colophon       the issue's account of itself — shared by the back matter and footer
    FieldNote      a note, a notebook entry, and a note in a document's margin
    Unfinished     the production sheets for documents not built
    ArchiveRelation, Elsewhere, Navigation, Footer, Hero, Intro, Stories, StorySpread,
    TheQuestion, Frame, Grain, ChapterMark, Wordmark, Link
  data/
    stories.ts            the cast, the front's captions, the nav
    story.ts              the document shapes, the registry, `statusOf`, the chapter helpers
    story-raju.ts         Document 01
    story-shanti.ts       Document 02
    issue.ts              the reading order, the front matter, the contents, the back matter
    archive.ts            the proof sheets and the fragments
    relations.ts          what connects to what, and the issue's counts
    notes.ts              the field notes, built from the records they discuss
    unfinished.ts         the open files, one per person without a document
    places.ts             the towns, and one coordinate table
    soundscapes.ts        the recordings the documents list
    frames.generated.ts   AUTO-GENERATED image manifest — do not edit
    sounds.generated.ts   AUTO-GENERATED audio manifest — do not edit
  lib/
    router.ts      pathnames, the History API, scroll and focus on arrival. No dependency.
    audio.ts       one transport for the whole site
    motion.ts      reveal primitives; every one collapses under reduced motion
    useLenis.ts    smooth scroll (lazy-loaded, desktop only), anchors, scroll lock
    useNavState.ts one scroll listener for the chrome
    words.ts       counts set as words, lists set as prose
tools/
  fetch-images.mjs, fetch-audio.mjs, build-images.mjs, fonts.mjs   sourcing and encoding
  contact.mjs, contact-multi.mjs, shoot.mjs                        judging the imagery
  audit.mjs    first-screen weight, LCP, CLS, reduced motion, scroll lock
  story.mjs    a document: routing, Back, the page turn, the hours, the sound
  archive.mjs  front → people → document → back, and the people index
  places.mjs   the marks, the panel, the counts, place → document → place
  sounds.mjs   nothing fetched before a press; play, pause, stop, end, leaving
  a11y.mjs     overflow at 390/768/1024/1440 on every route, and the first keyboard stops
```

### Every count is derived

No number in the issue is typed. Subjects, documents, places, photographs, recordings, notes,
fragments and unfinished files are all counted off the registries, so the contents, the back
matter, the colophon and the footer cannot disagree with one another or with the site.

### Adding the next document

1. Add its frames to `PICKS` in `tools/build-images.mjs` (and to `MOBILE` for any that go
   full-bleed), then run it.
2. Write `src/data/story-<slug>.ts` as a `DayDoc` or a `SequenceDoc`, giving it the next
   document number — the contents shows which one that is. A sequence's chapter ids are
   `document-NN/<name>`; they are the document's permanent addresses.
3. Register it in `STORY_DOCS` in `src/data/story.ts`.

That is the whole change. Registering it opens the route, numbers it in the contents, moves the
person from *in production* to available everywhere they appear, closes their production sheet,
files its photographs on their own proof sheet, and updates every count. A person in a town
the issue has not been to also needs one line of latitude and longitude in `COORDS` in
`src/data/places.ts`.

### Regenerating the imagery

`public/frames` and `src/data/frames.generated.ts` are committed build output.

```bash
node tools/fetch-images.mjs tools/slots.json        # candidates → .imgcache
node tools/contact-multi.mjs sheet.jpg <slot> …     # judge a section at once
# edit the PICKS table in tools/build-images.mjs
node tools/build-images.mjs                         # grade, crop, encode, write the manifest
```

One grade is applied to every frame, so the photography reads as one body of work.
`build-images.mjs` clears `public/frames` first — do not point a running dev server at it
mid-run.

### Regenerating the sound

```bash
node tools/fetch-audio.mjs      # download, trim to 25 s on MP3 frame bounds, write the manifest
```

---

## Design notes

- **One publication.** Every document opens on the same line — ROZ / Issue 01, and its number —
  and ends the same way: the end marked, what it holds, a note on what is written, what comes
  next in the issue, and the way back to the contents. The page turn carries that line through
  the dark, so the next page comes up under words already there.
- **Two canvases.** Warm black and aged paper, alternating. The flip is the strongest structural
  device the site has.
- **Four typefaces, self-hosted.** Instrument Serif, Tiro Devanagari Hindi, Archivo and DM Mono.
  144 kB. Every run of Devanagari is marked `lang="hi"`.
- **The pointer is the reader's.** No custom cursor, no magnetic element. Hover is carried by
  the thing being hovered — a hairline, an opacity, two percent of scale.
- **Motion is slow and optional.** One dissolve curve and a few parallax speeds. With
  `prefers-reduced-motion`, every reveal returns its arrived state and nothing waits on scroll.
- **Mobile is its own composition.** Wide photographs are re-cropped for portrait screens rather
  than squeezed; Raju's hours fold into the corner, and Shanti's marked photograph holds the top of
  the screen while its readings pass beneath it.
- **The map is deliberately small.** One coastline drawn from real coordinates, no tiles and no
  library; the marks are buttons laid over it. It knows the towns the stories are set in and
  nothing else.
- **One sound at a time.** A single `HTMLAudioElement`, created on the first press, shared by the
  documents and the sound archive, stopped when the page is left.
- **Arrival is looked after.** A link to a place on a page lands on it and gives it the focus;
  Back and a refresh return the reader to where they were.

---

## Measured

Production build, 1440×900, local preview:

| | |
|---|---|
| First-screen JS | ~153 kB gzip (two chunks); each document and index is a further 1–11 kB, loaded on idle |
| CSS | 11 kB gzip |
| Fonts | 144 kB, preloaded, subset |
| First screen | ~1.05 MB including the three hero plates |
| LCP | ~90 ms |
| CLS | 0 |
| Audio | 0 bytes until somebody presses play (4 × 25 s) |

Every frame ships AVIF with a WebP fallback at two to four widths, an inlined placeholder and
declared dimensions.

---

## Not built

Five documents, and filing the archive by city, trade, hour and theme. Both are listed in the
contents as not yet in the issue. The five people each have a photograph on file and a premise,
and a production sheet at `/archive#unfinished` says what the archive holds for them and what it
does not. Nothing is invented to fill the gap.
