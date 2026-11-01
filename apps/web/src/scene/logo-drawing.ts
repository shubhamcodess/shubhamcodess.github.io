import { sketch } from "@portfolio/design/button";
import { BATARANG_EDGES, BATARANG_OUTLINE } from "./batarang-shape";
import { LOGO_LETTERS } from "./logo-letters";

/* The logo's line work, worked out once. Everything is pen lines on a skewed plane, so it reads as a drawing of something 3D. */
type Point = number[];

const SHAPES = LOGO_LETTERS;

const flat = (pts: Point[]) => `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`;

/* `past` runs an edge beyond its corners, the way a draughtsman's lines cross. The faint second pass does this; the main line stays clean. */
function edges(shape: Point[], past: number): Point[][] {
  return shape.map((a, i) => {
    const b = shape[(i + 1) % shape.length]!, len = Math.hypot(b[0]! - a[0]!, b[1]! - a[1]!);
    const ux = ((b[0]! - a[0]!) / len) * past, uy = ((b[1]! - a[1]!) / len) * past;
    return [[a[0]! - ux, a[1]! - uy], [b[0]! + ux, b[1]! + uy]];
  });
}
const pen = (lines: Point[][], seed: number, amp: number) => lines.map((l, i) => sketch(l, seed + i * 11, amp)).join(" ");


export const LOGO = {
  /** The solid letters, used only to hide what's behind them. */
  face: SHAPES.map(flat).join(""),
  front: pen(SHAPES.flatMap((s) => edges(s, 0)), 5, 0.2),
  frontSecond: pen(SHAPES.flatMap((s) => edges(s, 1.9)), 61, 0.42),
  back: pen(SHAPES.flatMap((s) => edges(s, 0)), 23, 0.3),
  /** Light guide lines the letters sit on, like the crop lines on a button. */
  guides: pen([[[-7, 30], [55, 30]], [[-7, 0], [23.4, 0]], [[3, -5], [3, 35]]], 41, 0.12),
};

/** How far the letters' back face sits behind the front. */
export const LOGO_DEPTH = { x: 2.8, y: 2 };

/* The batarang: its own tilt, so it reads as a flat blade turned in the air. */
export const BATARANG_R = 20;
const scaled = (pts: Point[]) => pts.map(([x, y]) => [x! * BATARANG_R, y! * BATARANG_R]);
const blade = BATARANG_EDGES.map(scaled);
// The bevel on the reference: the same outline again, a little inside the first.
const bevel = blade.map((edge) => edge.map(([x, y]) => [x! * 0.84, y! * 0.84 + 0.5]));

// Hatching across the blade, kept inside it by a clip.
const hatch: Point[][] = [];
for (let c = -BATARANG_R * 1.5; c < BATARANG_R * 1.5; c += 1.5) hatch.push([[c - 5, -6], [c + 5, 10]]);

export const BLADE = {
  outline: BATARANG_OUTLINE.map(([x, y]) => `${(x! * BATARANG_R).toFixed(2)} ${(y! * BATARANG_R).toFixed(2)}`).join("L"),
  edge: pen(blade, 7, 0.2),
  edgeSecond: pen(blade, 71, 0.36),
  bevel: pen(bevel, 31, 0.16),
  hatch: pen(hatch, 53, 0.3),
};

/* Tilt, then the angle it's lodged at. All of this is one plane, so the spin in flight stays in that plane too. */
export const BLADE_TILT = [1, -0.04, -0.14, 0.9] as const;
export const BLADE_ANGLE = -20;

const rad = (BLADE_ANGLE * Math.PI) / 180;
const [tx, ty] = [-BATARANG_R, -0.22 * BATARANG_R] as [number, number];
const [rx, ry] = [tx * Math.cos(rad) - ty * Math.sin(rad), tx * Math.sin(rad) + ty * Math.cos(rad)];
/** The wing tip, measured from the batarang's centre, once it's tilted and turned. */
export const BLADE_TIP = { x: BLADE_TILT[0] * rx + BLADE_TILT[2] * ry, y: BLADE_TILT[1] * rx + BLADE_TILT[3] * ry };
