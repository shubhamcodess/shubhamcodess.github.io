/* Original angular mark, standing on end. Straight edges only, to match the rest of the site. */
const half = [[0, -0.13], [0.055, -0.13], [0.075, -0.33], [0.125, -0.12], [0.21, -0.13], [0.3, -0.3], [0.53, -0.35], [0.82, -0.22], [1, 0.03], [0.84, -0.04], [0.74, 0.05], [0.66, 0.22], [0.54, 0.11], [0.42, 0.13], [0.34, 0.32], [0.22, 0.21], [0.12, 0.25], [0, 0.48]] as const;
const outline = [...half, ...half.slice(1, -1).reverse().map(([x, y]) => [-x, y] as const)];
const points = outline.map(([x, y]) => `${(-y * 13 + 7).toFixed(2)},${(x * 13 + 13).toFixed(2)}`).join(" ");

export const Batarang = () => (
  <svg width="14" height="26" viewBox="0 0 14 26" fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
    <polygon points={points} />
  </svg>
);
