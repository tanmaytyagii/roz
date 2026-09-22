import type { FrameId } from './frames.generated'

/**
 * DEMO CAST.
 *
 * Every name, age and quote below is written. The photographs are real,
 * CC-licensed documentary work by the photographers credited in
 * `frames.generated.ts`, and the people in them are NOT the people described
 * here. Nothing in this file should be read as a record of a real person.
 * It stands in until interviews, commissioned photography and signed
 * permissions exist.
 */
export type Story = {
  index: number
  slug: string
  name: string
  nameDeva: string
  age: number
  occupation: string
  occupationDeva: string
  place: string
  /** One sentence. Never two. */
  line: string
  quote: string
  duration: string
  frame: FrameId
  /** Full-bleed spread, or a plate set inside the page. */
  layout: 'bleed' | 'plate'
  /** object-position, for frames whose subject sits away from the centre. */
  focus?: string
}

export const STORIES: Story[] = [
  {
    index: 1,
    slug: 'raju',
    name: 'Raju',
    nameDeva: 'राजू',
    age: 42,
    occupation: 'The Mason',
    occupationDeva: 'राजमिस्त्री',
    place: 'Western Uttar Pradesh',
    line: 'He has built forty houses and rented in every one of the towns they stand in.',
    quote: 'शहर रोज़ थोड़ा-थोड़ा बनता है।',
    duration: '04:52',
    frame: 'raju',
    layout: 'bleed',
    focus: 'center 34%',
  },
  {
    index: 2,
    slug: 'shanti',
    name: 'Shanti',
    nameDeva: 'शान्ति',
    age: 58,
    occupation: 'The Flower Seller',
    occupationDeva: 'फूल विक्रेता',
    place: 'Varanasi',
    line: 'She has sat at the same corner of the same lane for thirty-one years.',
    quote: 'फूल सुबह के होते हैं। शाम तक सब बिक जाना चाहिए।',
    duration: '06:18',
    frame: 'shanti',
    layout: 'plate',
  },
  {
    index: 3,
    slug: 'imran',
    name: 'Imran',
    nameDeva: 'इमरान',
    age: 47,
    occupation: 'The Auto Driver',
    occupationDeva: 'ऑटो चालक',
    place: 'Lucknow',
    line: 'Three hundred conversations a week, and almost none of them about him.',
    quote: 'सवारी बैठती है, बात करती है, उतर जाती है।',
    duration: '05:44',
    frame: 'imran',
    layout: 'bleed',
    focus: 'center 50%',
  },
  {
    index: 4,
    slug: 'meena',
    name: 'Meena',
    nameDeva: 'मीना',
    age: 39,
    occupation: 'The Tailor',
    occupationDeva: 'दर्ज़ी',
    place: 'Jaipur',
    line: 'Wedding season arrives once a year and takes her sleep with it.',
    quote: 'नाप याद रह जाता है, चेहरा नहीं।',
    duration: '05:07',
    frame: 'meena',
    layout: 'plate',
  },
  {
    index: 5,
    slug: 'ramesh',
    name: 'Ramesh',
    nameDeva: 'रमेश',
    age: 34,
    occupation: 'The Tea Seller',
    occupationDeva: 'चायवाला',
    place: 'Mumbai',
    line: 'Four hundred glasses a day, and he knows how nearly all of them are taken.',
    quote: 'सबकी चाय अलग होती है। मीठी, कड़क, हल्की।',
    duration: '03:59',
    frame: 'ramesh',
    layout: 'plate',
  },
  {
    index: 6,
    slug: 'asha',
    name: 'Asha',
    nameDeva: 'आशा',
    age: 29,
    occupation: 'The Night-Shift Nurse',
    occupationDeva: 'रात्रि नर्स',
    place: 'Delhi',
    line: 'Her day begins when the ward finally goes quiet, and ends when the city wakes.',
    quote: 'रात में अस्पताल सच बोलता है।',
    duration: '07:03',
    frame: 'asha',
    layout: 'bleed',
  },
  {
    index: 7,
    slug: 'arjun',
    name: 'Arjun',
    nameDeva: 'अर्जुन',
    age: 26,
    occupation: 'The Street Photographer',
    occupationDeva: 'छायाकार',
    place: 'Kolkata',
    line: 'He walks the same four streets every morning and has never taken the same frame twice.',
    quote: 'रोज़ वही रास्ता, रोज़ कुछ और।',
    duration: '06:41',
    frame: 'arjun',
    layout: 'bleed',
    focus: 'center 58%',
  },
]

/** §8 — the places ROZ looks, each with the frame it is looking at. */
export const PLACES: { text: string; frame: FrameId; alt: string }[] = [
  { text: 'At the chai stall.', frame: 'chai', alt: 'A glass of chai on a stall counter, the vendor blurred behind it.' },
  { text: 'On the construction site.', frame: 'scaffold', alt: 'Workers on bamboo scaffolding lashed across a building front.' },
  { text: 'Inside the auto.', frame: 'inside-auto', alt: "The view over an auto driver's shoulder into oncoming traffic." },
  { text: 'Behind the sewing machine.', frame: 'machine', alt: 'A tailor at a treadle sewing machine in low lamplight.' },
  { text: 'Before sunrise.', frame: 'mist', alt: 'A figure carrying a bundle across a river platform in heavy fog.' },
  { text: 'After everyone goes home.', frame: 'wet-road', alt: 'An empty road at night, streetlights doubled in the wet tarmac.' },
]

/** §14 — answers to the question. Written, like the rest of the demo cast. */
export const ANSWERS: { deva: string; gloss: string; who: string }[] = [
  { deva: 'बच्चों की पढ़ाई हो जाए।', gloss: 'That the children finish their studies.', who: 'Mason, 42' },
  { deva: 'अपना घर बना लूँ।', gloss: 'That I build a house of my own.', who: 'Tea seller, 34' },
  { deva: 'रोज़ काम मिलता रहे।', gloss: 'That there is work every day.', who: 'Auto driver, 47' },
  { deva: 'थोड़ा समय अपने लिए।', gloss: 'A little time for myself.', who: 'Tailor, 39' },
  { deva: 'घर वाले खुश रहें।', gloss: 'That the people at home are happy.', who: 'Flower seller, 58' },
]

export const NAV = [
  { label: 'Stories', href: '#stories' },
  { label: 'People', href: '/people' },
  { label: 'Places', href: '/places' },
  { label: 'Sounds', href: '/sounds' },
  { label: 'About', href: '#about' },
] as const

/**
 * NAV is written from the homepage's point of view: most of it is anchors into
 * that document. From anywhere else a hash has to carry the path home with it,
 * while an entry that is already a path stands on its own.
 */
export const navHref = (href: string, onHome: boolean) =>
  href.startsWith('#') && !onHome ? `/${href}` : href
