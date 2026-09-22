import { MAP, type Place } from '../../data/places'

/**
 * THE DRAWING.
 *
 * One coastline and seven marks. The country is an `aria-hidden` SVG — it is
 * a picture, and it says nothing a screen reader needs — while the marks are
 * ordinary HTML buttons laid over it at their projected share of the box. That
 * is the whole reason they are not `<g>` elements: a button is focusable,
 * announces itself, takes the site's focus ring and has a hit area you can
 * actually hit with a thumb, none of which comes free inside SVG.
 *
 * Hovering or focusing a mark previews it in the panel. Clicking pins it.
 */
export function IndiaMap({
  places,
  shown,
  pinned,
  onPreview,
  onPick,
}: {
  places: Place[]
  shown: Place
  pinned: string | null
  onPreview: (name: string | null) => void
  onPick: (name: string) => void
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[34rem] lg:max-w-none"
      style={{ aspectRatio: `${MAP.width} / ${MAP.height}` }}
      onMouseLeave={() => onPreview(null)}
    >
      <svg
        aria-hidden
        viewBox={`0 0 ${MAP.width} ${MAP.height}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={MAP.path}
          fill="rgba(238,229,214,0.035)"
          stroke="rgba(238,229,214,0.3)"
          strokeWidth={1}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <ul>
        {places.map((p) => {
          const live = shown.name === p.name
          const held = pinned === p.name
          const left = p.side === 'left'
          return (
            <li key={p.name}>
              <button
                type="button"
                onClick={() => onPick(p.name)}
                onMouseEnter={() => onPreview(p.name)}
                onFocus={() => onPreview(p.name)}
                aria-pressed={held}
                aria-label={`${p.short} — ${p.stories.length} ${p.stories.length === 1 ? 'story' : 'stories'}, ${
                  p.status === 'available' ? 'available to read' : 'in production'
                }`}
                // The hit area is centred on the coordinate and the mark sits
                // at its middle. The name hangs off the mark absolutely, so a
                // long name cannot drag the dot away from the town it names.
                className="absolute -translate-x-1/2 -translate-y-1/2 p-4"
                style={{
                  left: `${(p.x / MAP.width) * 100}%`,
                  top: `${(p.y / MAP.height) * 100}%`,
                }}
              >
                <span
                  aria-hidden
                  className="relative block h-[7px] w-[7px] rounded-full border transition-[background-color,border-color,transform] duration-[400ms] ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{
                    background: live ? 'var(--color-clay)' : 'transparent',
                    borderColor: live ? 'var(--color-clay)' : 'rgba(238,229,214,0.45)',
                    transform: live ? 'scale(1.3)' : 'scale(1)',
                  }}
                >
                  {/* At phone width only the live name is set: seven of them at
                      that scale is a pile of type, not a map. */}
                  <span
                    className={`u-mono absolute top-1/2 -translate-y-1/2 whitespace-nowrap transition-[color,opacity] duration-[400ms] ${
                      left ? 'right-[calc(100%+0.55rem)]' : 'left-[calc(100%+0.55rem)]'
                    } ${live ? '' : 'hidden lg:block'}`}
                    style={{
                      color: live ? 'var(--color-cream)' : 'var(--color-dim)',
                      opacity: live ? 1 : 0.62,
                    }}
                  >
                    {p.short}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
