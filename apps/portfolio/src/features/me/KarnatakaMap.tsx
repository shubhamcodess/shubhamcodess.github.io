import { karnataka } from '../../content/karnataka'

/**
 * Karnataka in fine line, like a survey map: the state's outline, a fainter echo just inside it,
 * a light graticule, and a marker on Bengaluru. Decorative; the tile's words say where it is.
 * The tile's hover traces the outline and pulses the marker (see me.css).
 */
export function KarnatakaMap() {
  const { width, height, outline, parallels, meridians, bengaluru } = karnataka
  return (
    <svg className="me-map" viewBox={`-40 -40 ${width + 80} ${height + 80}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g className="me-map__grid">
        {parallels.map((y) => (
          <line key={`p${y}`} x1={-40} x2={width + 40} y1={y} y2={y} />
        ))}
        {meridians.map((x) => (
          <line key={`m${x}`} x1={x} x2={x} y1={-40} y2={height + 40} />
        ))}
      </g>
      <path className="me-map__echo" d={outline} transform={`translate(${width * 0.015} ${height * 0.015}) scale(0.97)`} />
      <path className="me-map__outline" d={outline} pathLength={1} />
      <g className="me-map__marker" transform={`translate(${bengaluru.x} ${bengaluru.y})`}>
        <circle className="me-map__ring" r={34} />
        <circle className="me-map__dot" r={11} />
      </g>
    </svg>
  )
}
