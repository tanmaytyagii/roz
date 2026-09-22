import { useState, type CSSProperties } from 'react'
import { FRAMES, type FrameId } from '../data/frames.generated'

/** Below this, a frame that goes full-bleed is served its portrait re-crop. */
const NARROW = '(max-width: 700px)'

type Props = {
  id: FrameId
  alt: string
  /** Layout hint for the browser's image selection. */
  sizes: string
  className?: string
  /** Only the hero frame should be eager. Everything else waits. */
  priority?: boolean
  /** CSS object-position, for frames whose subject sits off-centre in the crop. */
  position?: string
  /** Opt out of the portrait re-crop where the layout is already narrow. */
  art?: boolean
  style?: CSSProperties
}

/**
 * One photograph. AVIF first, WebP behind it, a 20px inline placeholder
 * underneath so there is colour in the hole before the frame lands and the
 * box never changes size. Frames that go full-bleed carry a second, portrait
 * crop for narrow screens — the wide one would lose its subject.
 */
export function Frame({ id, alt, sizes, className = '', priority = false, position, art = true, style }: Props) {
  const frame = FRAMES[id]
  const [loaded, setLoaded] = useState(false)
  const widest = frame.widths[frame.widths.length - 1]
  const mobile = art ? frame.mobile : null
  const set = (widths: number[], suffix: string, ext: string) =>
    widths.map((w) => `/frames/${id}${suffix}-${w}.${ext} ${w}w`).join(', ')

  return (
    <picture
      className={`relative block overflow-hidden bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${frame.lqip})`, ...style }}
    >
      {mobile && <source type="image/avif" media={NARROW} srcSet={set(mobile.widths, '-p', 'avif')} sizes={sizes} />}
      {mobile && <source type="image/webp" media={NARROW} srcSet={set(mobile.widths, '-p', 'webp')} sizes={sizes} />}
      <source type="image/avif" srcSet={set(frame.widths, '', 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set(frame.widths, '', 'webp')} sizes={sizes} />
      <img
        src={`/frames/${id}-${widest}.webp`}
        alt={alt}
        width={widest}
        height={Math.round(widest / frame.aspect)}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setLoaded(true)}
        className="h-full w-full object-cover transition-opacity duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ objectPosition: position, opacity: loaded || priority ? 1 : 0 }}
      />
    </picture>
  )
}

/** The photographer's line. Shown wherever a frame is, never hidden away. */
export function Credit({ id, className = '' }: { id: FrameId; className?: string }) {
  const c = FRAMES[id].credit
  if (!c) return null
  return (
    <span className={`u-mono ${className}`}>
      <a
        href={c.source}
        target="_blank"
        rel="noreferrer noopener"
        className="decoration-current/25 underline-offset-[3px] transition-colors hover:text-clay-ink hover:underline"
      >
        {c.creator}
      </a>
      <span className="opacity-40"> · </span>
      <a
        href={c.licenseUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="decoration-current/25 underline-offset-[3px] transition-colors hover:text-clay-ink hover:underline"
      >
        CC {c.license}
      </a>
    </span>
  )
}
