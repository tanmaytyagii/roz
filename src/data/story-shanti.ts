import type { SequenceDoc } from './story'

/**
 * SHANTI — THE FLOWER SELLER. Varanasi.
 *
 * WRITTEN FOR THE PROTOTYPE. There is no Shanti. Her hours, her words and the
 * day at this corner are invented, and the woman in the photograph is a real
 * person photographed by someone else, who has not been interviewed and has not
 * agreed to any of this.
 *
 * Why this grammar. ROZ holds exactly one photograph of this corner, so the
 * document does not pretend to hold seven: it keeps the one frame still and
 * lets the day move across it, marked the way a picture editor marks a proof.
 * Of the three photographs, only the river is placed by its own record — the
 * photographer titled it Varanasi. The walk is a stand-in and says so; it is
 * never given the whole screen.
 */
export const SHANTI: SequenceDoc = {
  slug: 'shanti',
  grammar: 'sequence',
  id: 'document-02',
  number: 2,
  title: "Shanti's corner",
  premise: 'One corner of one lane, photographed once and held for a whole day.',

  epigraph: {
    deva: 'कोना वही है। दिन बदलता है।',
    gloss: 'The corner stays the same. The day is what changes.',
  },

  note:
    'Shanti is not a real person. Her age, her hours, her words and the day at this corner were written for the ' +
    'prototype. The three photographs are real, licensed work by the photographers credited under each — only the ' +
    'river is placed, by its own photographer, in Varanasi; the corner and the walk carry no place in the record ' +
    'ROZ holds for them. The people in them are not the people described here, have not been interviewed, and have ' +
    'not agreed to any of this. Commissioned photography, actual interviews and signed permissions replace all of ' +
    'it before ROZ is published.',

  chapters: [
    {
      kind: 'plate',
      id: 'document-02/river',
      time: '05:40',
      line: 'The ghat wakes before the lane does.',
      deva: 'गली से पहले घाट जागता है।',
      note: 'She buys by the kilo, while the lamps are still on.',
      frame: 'ghat',
      alt: 'The ghats at Varanasi seen from the water in early fog, boats moored along the steps, lamps still lit in the buildings above.',
      placed: "Varanasi — the photographer's own title",
      focus: '62% 50%',
    },
    {
      kind: 'stand-in',
      id: 'document-02/walk',
      time: '06:05',
      line: 'Up from the river.',
      deva: 'घाट से ऊपर।',
      frame: 'mist',
      alt: 'A figure in a head-cloth carries a pink bundle along a railed ledge, the drop beyond it lost in fog.',
      provenance:
        'Not Shanti, and not placed — the photographer did not record where this was taken. It stands in for the walk up.',
    },
    {
      kind: 'marked',
      id: 'document-02/corner',
      title: 'The corner',
      deva: 'कोना',
      lede: 'One photograph, held all day.',
      aside: 'The corner was photographed once. Everything that happens to it after that is written.',
      frame: 'shanti',
      alt: 'A woman in a pale shawl and a green sari sits at the corner of a lane, a tray of marigolds and leaves on the stone slab in front of her, the wall behind thick with posters and a painted direction sign.',
      /**
       * Measured against the 4:5 frame as encoded. In the order the day
       * reaches them, not the order the eye does.
       */
      marks: [
        {
          time: '06:20',
          label: 'The slab',
          deva: 'सिल',
          note: 'It was here before she was. She has never asked whose it is.',
          box: [28, 81, 57, 13],
        },
        {
          time: '07:30',
          label: 'Marigold',
          deva: 'गेंदा',
          note: 'By the handful, or by the string. The orange goes first.',
          box: [46, 68, 36, 16],
        },
        {
          time: '09:50',
          label: 'The arrow',
          deva: 'तीर',
          note: 'More people stop to ask the way than to buy. She points before they finish asking.',
          box: [72, 39.5, 28, 13],
        },
        {
          time: '12:40',
          label: 'The wall',
          deva: 'दीवार',
          note: 'Pasted over every week or so. It changes more often than she does.',
          box: [44, 15, 56, 24],
        },
        {
          time: '17:30',
          label: 'Hands',
          deva: 'हाथ',
          note: 'Money in one, flowers in the other. She counts without looking down.',
          box: [44, 70, 15, 9],
        },
      ],
    },
    {
      kind: 'words',
      id: 'document-02/words',
      title: 'Her words',
      lede: 'Three things she said, without getting up.',
      aside: 'Set as they would be spoken. The English underneath is a translation, not a replacement.',
      words: [
        {
          deva: 'रास्ता पूछने वाले ज़्यादा आते हैं, ख़रीदने वाले कम।',
          gloss: 'More people come to ask the way than to buy.',
          where: 'At the corner · 10:05',
        },
        {
          deva: 'फूल भगवान के लिए हैं। पैसा घर के लिए।',
          gloss: 'The flowers are for God. The money is for home.',
          where: 'At the corner · 13:10',
        },
        {
          deva: 'इकतीस साल में दीवार तीन बार पुती है। मैं वहीं हूँ।',
          gloss: 'In thirty-one years the wall has been painted three times. I am where I was.',
          where: 'Sweeping up · 19:00',
        },
      ],
    },
    {
      kind: 'close',
      id: 'document-02/close',
      time: '19:10',
      deva: 'जाने से पहले कोना झाड़ देती है,\nताकि सुबह वहीं मिले।',
      gloss: 'She sweeps the corner before she goes, so that it is there in the morning.',
    },
  ],
}
