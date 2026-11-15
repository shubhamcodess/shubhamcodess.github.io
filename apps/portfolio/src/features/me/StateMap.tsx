import { placeOn, stateMaps, type StateKey } from '../../content/state-maps'

interface StateMapProps {
  readonly state: StateKey
  /** The marked place, as latitude and longitude. */
  readonly at: readonly [lat: number, lon: number]
  readonly className?: string
}

/**
 * A state in fine line, like a survey map: its outline, a fainter echo just inside it, a light graticule
 * at each whole degree, and a marker on one place. Decorative; the words beside it say where it is.
 * The surrounding tile's hover traces the outline and pulses the marker (see me.css).
 */
export function StateMap({ state, at, className }: StateMapProps) {
  const { width, height, outline, parallels, meridians } = stateMaps[state]
  const marker = placeOn(state, at[0], at[1])
  const pad = Math.max(width, height) * 0.04
  const ring = Math.max(width, height) * 0.022
  return (
    <svg
      className={className ? `me-map ${className}` : 'me-map'}
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g className="me-map__grid">
        {parallels.map((y) => (
          <line key={`p${y}`} x1={-pad} x2={width + pad} y1={y} y2={y} />
        ))}
        {meridians.map((x) => (
          <line key={`m${x}`} x1={x} x2={x} y1={-pad} y2={height + pad} />
        ))}
      </g>
      <path className="me-map__echo" d={outline} transform={`translate(${width * 0.015} ${height * 0.015}) scale(0.97)`} />
      <path className="me-map__outline" d={outline} pathLength={1} />
      <g className="me-map__marker" transform={`translate(${marker.x.toFixed(1)} ${marker.y.toFixed(1)})`}>
        <circle className="me-map__ring" r={ring} />
        <circle className="me-map__dot" r={ring * 0.33} />
      </g>
    </svg>
  )
}
