const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

/**
 * A count set in a sentence rather than in a tally. `07` belongs in a ruled
 * index; "seven" belongs in a line of prose — and both are counted, so neither
 * can go stale when the next document lands.
 */
export const inWords = (n: number, capital = false) => {
  const w = WORDS[n] ?? String(n)
  return capital ? w[0].toUpperCase() + w.slice(1) : w
}

/** "Raju's day", "Raju's day and Shanti's corner", "a, b and c". */
export const listed = (items: string[]) =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

/**
 * A Creative Commons licence, named the same way everywhere: "CC BY 2.0",
 * "CC0 1.0" — never "BY 2.0", and never "CC CC0 1.0".
 */
export const licence = (name: string) => (/^CC/i.test(name) ? name : `CC ${name}`)
