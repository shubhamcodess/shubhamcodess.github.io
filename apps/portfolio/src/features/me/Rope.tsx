/**
 * The clothesline's parts. The rope is twisted twine: a core cord with two plies dashed half a twist apart,
 * offset either side of it, and a soft shadow on the wall. It is drawn at its real width so the twist keeps
 * its pitch on every screen. The peg is a wooden clothes peg seen from the front: one tapered piece with a
 * little grain, a groove for the rope and a steel spring round its waist.
 */
export function Rope({ width, className = '' }: { readonly width: number; readonly className?: string | undefined }) {
  const w = Math.max(1, Math.round(width))
  const d = `M0 6 Q${w / 2} 34 ${w} 6`
  return (
    <svg className={`rope ${className}`} viewBox={`0 0 ${w} 40`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="rope__shadow" d={d} transform="translate(0 3)" />
      <path className="rope__core" d={d} />
      <path className="rope__ply rope__ply--dark" d={d} transform="translate(0 0.7)" />
      <path className="rope__ply rope__ply--light" d={d} transform="translate(0 -0.7)" />
    </svg>
  )
}

export function Peg({ className = '' }: { readonly className?: string | undefined }) {
  return (
    <span className={`peg ${className}`} aria-hidden="true">
      <svg viewBox="0 0 12 34" width="12" height="34" focusable="false">
        <path
          className="peg__wood"
          d="M3 .6h6a1.8 1.8 0 0 1 1.8 1.8L10 31.6a1.8 1.8 0 0 1-1.8 1.8H3.8A1.8 1.8 0 0 1 2 31.6L1.2 2.4A1.8 1.8 0 0 1 3 .6Z"
        />
        <path className="peg__shade" d="M8.4 1.2a1.5 1.5 0 0 1 1.8 1.4l-.7 28.8a1.5 1.5 0 0 1-1.3 1.4Z" />
        <path className="peg__grain" d="M4.4 3v10M6.6 20v10M5.6 4v6" />
        <path className="peg__groove" d="M3.4 8.5h5.2" />
        <rect className="peg__spring" x=".6" y="13.6" width="10.8" height="3.8" rx="1.3" />
        <path className="peg__coil" d="M3 14.2v2.6M5 14.2v2.6M7 14.2v2.6M9 14.2v2.6" />
      </svg>
    </span>
  )
}
