import type { StoryDoc } from './story'

/**
 * RAJU — THE MASON. Western Uttar Pradesh.
 *
 * WRITTEN FOR THE PROTOTYPE. There is no Raju. The hours, the objects, the
 * quotes and the dream below are invented, and the man in the photographs is a
 * real worker photographed by someone else, who has not been interviewed and
 * has not agreed to any of this. The story says so on the page, twice, because
 * a demo that quietly attaches an invented life to a real face is not a demo.
 *
 * Real interviews, commissioned photography and signed permissions replace all
 * of it before anything is published.
 */
export const RAJU: StoryDoc = {
  slug: 'raju',

  cover: {
    frame: 'rj-open',
    alt: 'A construction worker in a knitted cap, the lower half of his face wrapped against the dust.',
  },

  epigraph: {
    deva: 'शहर रोज़ थोड़ा-थोड़ा बनता है।',
    gloss: 'The city gets built a little at a time, every day.',
  },

  /**
   * Seven hours, seven frames. The `light` pair is graded over each photograph
   * so the scroll reads as one day passing: blue before dawn, gold at seven,
   * bleached at one, amber at seven, indigo at eight.
   */
  day: [
    {
      time: '05:12',
      line: 'The city is still asleep.',
      deva: 'शहर अभी सो रहा है।',
      note: 'He is awake before it.',
      frame: 'rj-h1',
      alt: 'A sodium lamp over an empty riverside step before dawn, a dog crossing the foreground.',
      light: ['rgba(18,28,58,0.55)', 'rgba(8,10,20,0.30)'],
    },
    {
      time: '06:03',
      line: 'Raju leaves for work.',
      deva: 'राजू काम पर निकलता है।',
      note: 'Eleven minutes on foot, then whatever is going that way.',
      frame: 'rj-h2',
      alt: 'A wide dirt road running toward a brick kiln chimney, a lone figure walking it.',
      light: ['rgba(96,72,120,0.34)', 'rgba(190,120,60,0.22)'],
    },
    {
      time: '07:18',
      line: 'First brick.',
      deva: 'पहली ईंट।',
      note: 'The first line has to be true or the whole wall leans.',
      frame: 'rj-h3',
      alt: 'Seen from above, two workers passing a brick between them across dusty ground.',
      light: ['rgba(214,150,70,0.30)', 'rgba(150,96,44,0.16)'],
    },
    {
      time: '10:42',
      line: 'Chai break.',
      deva: 'चाय।',
      note: 'Six minutes. Two glasses if the sun is out.',
      frame: 'rj-h4',
      alt: 'A stream of tea poured from height into a row of waiting glasses at a street stall.',
      light: ['rgba(236,206,150,0.22)', 'rgba(210,166,104,0.12)'],
    },
    {
      time: '13:27',
      line: 'Lunch beneath unfinished concrete.',
      deva: 'अधूरी छत के नीचे खाना।',
      note: 'The roof is three weeks from being a roof.',
      frame: 'rj-h5',
      alt: 'The inside of an unfinished concrete floor, steel props holding the slab, one shaft of daylight across it.',
      light: ['rgba(246,238,220,0.16)', 'rgba(120,110,96,0.22)'],
    },
    {
      time: '18:49',
      line: 'Another wall stands.',
      deva: 'एक और दीवार खड़ी है।',
      note: 'Nine feet of it, since morning.',
      frame: 'rj-h6',
      alt: 'A long corridor between two brick walls, carts of raw bricks stacked down the middle.',
      light: ['rgba(210,104,40,0.34)', 'rgba(120,48,24,0.24)'],
    },
    {
      time: '20:13',
      line: 'Home.',
      deva: 'घर।',
      note: 'The room he rents is one he did not build.',
      frame: 'rj-h7',
      alt: 'A lit shopfront on a lane after dark, people sitting out on a bench, bicycles leaning at the kerb.',
      light: ['rgba(34,40,78,0.30)', 'rgba(12,14,28,0.26)'],
    },
  ],

  work: {
    lede: 'Six things his day is actually made of.',
    details: [
      {
        label: 'Brick',
        deva: 'ईंट',
        note: 'Nine hundred a day, passed hand to hand.',
        frame: 'rj-w1',
        alt: 'A stacked wall of raw bricks, pink and red, drying in the sun.',
        tall: true,
      },
      {
        label: 'Cement',
        deva: 'सीमेंट',
        note: 'Mixed by eye. The ratio lives in his hands, not on paper.',
        frame: 'rj-w2',
        alt: 'A worker crouched over a shallow pan, sifting mortar beside a heap of sand.',
      },
      {
        label: 'Hands',
        deva: 'हाथ',
        note: 'The lines fill with grey and stop washing out.',
        frame: 'rj-w3',
        alt: 'Two open palms held to the camera, blackened to the wrist.',
      },
      {
        label: 'Tools',
        deva: 'औज़ार',
        note: 'A trowel, a plumb line, a hammer. All of it his.',
        frame: 'rj-w4',
        alt: 'A hammer and three chisels laid out on a weathered painted board.',
      },
      {
        label: 'Dust',
        deva: 'धूल',
        note: 'It is in the tea, in the food, in the lungs, in the sleep.',
        frame: 'rj-w5',
        alt: 'A worker turning over a heap of ash and grit with a shovel against a brick wall.',
      },
      {
        label: 'Unfinished walls',
        deva: 'अधूरी दीवारें',
        note: 'He has never seen most of them finished.',
        frame: 'rj-w6',
        alt: 'A raw brick wall, unplastered, with putlog holes left open across it.',
        tall: true,
      },
    ],
  },

  objects: {
    lede: 'Five things he carries, or comes back to.',
    items: [
      {
        name: 'Hammer',
        deva: 'हथौड़ा',
        note: 'Handle rewrapped twice. Fourteen years.',
        frame: 'rj-o1',
        alt: 'A rusted claw hammer head, laid on a plain ground.',
      },
      {
        name: 'Steel tiffin',
        deva: 'टिफ़िन',
        note: 'Three tiers, and a scratch on the lid so he knows which one is his.',
        frame: 'rj-o2',
        alt: 'Stacked steel tiffin tins, dozens of them, packed edge to edge.',
      },
      {
        name: 'Old phone',
        deva: 'फ़ोन',
        note: 'Two numbers matter on it. The contractor, and home.',
        frame: 'rj-o3',
        alt: 'A worn keypad mobile phone lying face up on stone.',
      },
      {
        name: 'Work gloves',
        deva: 'दस्ताने',
        note: 'Worn through at the right thumb. He keeps using them.',
        frame: 'rj-o4',
        alt: 'Two pairs of leather work gloves laid flat on sand, stiff with use.',
      },
      {
        name: 'Chai glass',
        deva: 'चाय का गिलास',
        note: 'Not his. He returns it every morning.',
        frame: 'rj-o5',
        alt: 'A small glass of tea, filled to the brim, the foam still settling.',
      },
    ],
  },

  sound: {
    lede: 'Four recordings, about thirty seconds each. Nothing plays until you ask it to.',
    tracks: [
      { id: 'before-light', label: 'Before light', deva: 'उजाले से पहले', at: '05:12' },
      { id: 'the-site', label: 'The site', deva: 'साइट', at: '07:18' },
      { id: 'the-road', label: 'The road', deva: 'सड़क', at: '13:27' },
      { id: 'after-dark', label: 'After dark', deva: 'अँधेरे के बाद', at: '20:13' },
    ],
  },

  words: [
    {
      deva: 'दीवार सीधी है या नहीं, हाथ बता देता है।',
      gloss: 'The hand knows whether a wall is straight.',
      where: 'On the scaffold · 09:20',
    },
    {
      deva: 'मैंने चालीस घर बनाए हैं। किराए पर रहता हूँ।',
      gloss: 'I have built forty houses. I live in a rented room.',
      where: 'Chai stall · 10:48',
    },
    {
      deva: 'मिस्त्री का नाम दीवार पर नहीं लिखा जाता।',
      gloss: "Nobody writes the mason's name on the wall.",
      where: 'Site steps · 13:40',
    },
    {
      deva: 'थकान शाम को नहीं आती। सुबह आती है।',
      gloss: "The tiredness doesn't come in the evening. It comes in the morning.",
      where: 'Walking back · 19:10',
    },
    {
      deva: 'बेटा कहता है वो दफ़्तर में काम करेगा। ठीक है।',
      gloss: "My son says he'll work in an office. That's fine.",
      where: 'Home · 20:40',
    },
  ],

  dream: {
    deva: 'अगर सब ठीक रहा,\nतो अपना घर बनाऊँगा।',
    gloss: 'If everything goes well, I will build a house of my own.',
    frame: 'rj-dream',
    alt: 'A man sitting alone on top of a mountain of orange sand, in front of the unfinished apartment block behind it.',
  },
}
