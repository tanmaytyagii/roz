import { usePrefersReducedMotion } from '../lib/motion'

/**
 * The film layer. A tiled grain plate that steps between eight offsets, plus a
 * fixed vignette. Together they are what stops the page reading as a screen —
 * every section sits behind the same emulsion.
 *
 * Both layers are fixed, composited, and never hit-tested.
 */
export function Grain() {
  const reduced = usePrefersReducedMotion()
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <div
        className="absolute inset-[-100px] opacity-[0.1] mix-blend-overlay"
        style={{
          backgroundImage: 'url(/grain.png)',
          backgroundSize: '128px 128px',
          animation: reduced ? undefined : 'roz-grain 900ms steps(1, end) infinite',
          willChange: reduced ? undefined : 'transform',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 100% at 50% 42%, transparent 38%, rgba(10,9,7,0.30) 78%, rgba(10,9,7,0.62) 100%)',
        }}
      />
      <style>{`
        @keyframes roz-grain {
          0%   { transform: translate3d(0,0,0) }
          12%  { transform: translate3d(-7%,-4%,0) }
          25%  { transform: translate3d(4%,-8%,0) }
          37%  { transform: translate3d(-9%,5%,0) }
          50%  { transform: translate3d(6%,7%,0) }
          62%  { transform: translate3d(-4%,-6%,0) }
          75%  { transform: translate3d(8%,3%,0) }
          87%  { transform: translate3d(-6%,8%,0) }
          100% { transform: translate3d(0,0,0) }
        }
      `}</style>
    </div>
  )
}
