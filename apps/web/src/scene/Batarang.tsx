import { BATARANG_OUTLINE } from "./batarang-shape";

/* The batarang standing on end, for the scroll thumb. */
const points = BATARANG_OUTLINE.map(([x, y]) => `${(-y! * 13 + 8).toFixed(2)},${(x! * 13 + 13).toFixed(2)}`).join(" ");

export const Batarang = () => (
  <svg width="14" height="26" viewBox="0 0 14 26" fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
    <polygon points={points} />
  </svg>
);
