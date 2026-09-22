/**
 * The mark. Latin and Devanagari set as one lockup, divided by a hairline —
 * the same word twice, which is the whole idea of the publication.
 * Typographic only. It inherits colour, so it works on ink, clay and paper.
 */
export function Wordmark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const lg = size === 'lg'
  return (
    <span className="inline-flex items-baseline gap-[0.45em] leading-none">
      <span
        className="u-display"
        style={{
          fontSize: lg ? 'clamp(3.5rem, 11vw, 9rem)' : 'clamp(1.25rem, 1.7vw, 1.5rem)',
          letterSpacing: lg ? '-0.03em' : '0.04em',
        }}
      >
        ROZ
      </span>
      <span
        aria-hidden
        style={{
          width: 1,
          // Tied to the Latin cap height, not to the line box.
          height: lg ? 'clamp(2.45rem, 7.7vw, 6.3rem)' : 'clamp(0.88rem, 1.19vw, 1.05rem)',
          alignSelf: 'baseline',
          transform: 'translateY(0.04em)',
          background: 'currentColor',
          opacity: 0.26,
          marginInline: lg ? '0.16em' : '0.1em',
        }}
      />
      <span
        lang="hi"
        className="u-deva"
        style={{ fontSize: lg ? 'clamp(2rem, 6.2vw, 5rem)' : 'clamp(0.875rem, 1.15vw, 1rem)', opacity: 0.82 }}>
        रोज़
      </span>
    </span>
  )
}
