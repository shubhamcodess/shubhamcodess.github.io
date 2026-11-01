import { sketch } from "@portfolio/design/button";
import { BATARANG_EDGES, BATARANG_OUTLINE, BLADE_ANGLE, BLADE_TILT } from "./batarang-shape";

/* The logo's line work, worked out once: a blueprint plate the same height as a header button, with a batarang driven into its face. */
type Point = number[];

export const PLATE = { w: 38, h: 38, past: 5, shadow: 4 };

const pen = (lines: Point[][], seed: number, amp: number) => lines.map((l, i) => sketch(l, seed + i * 11, amp)).join(" ");

/* SP as pen strokes, in the same hand as the icons. */
const STROKES: Point[][] = [
  [[17.4, 11.2], [9.2, 10.6], [7, 12.6], [7, 17], [9.2, 19], [15.4, 19.2], [17.6, 21.2], [17.6, 25.6], [15.4, 27.6], [6.8, 27.2]],
  [[21.2, 28], [21, 10.4]],
  [[20.6, 10.6], [29, 10.6], [31.6, 12.8], [31.6, 17], [29, 19.4], [21, 19.4]],
];

const { w, h, past, shadow } = PLATE;
const hatch: Point[][] = [];
for (let c = -h; c < w + h; c += 4) hatch.push([[c, h], [c + h, 0]]);

export const LOGO = {
  // Four drafting lines that run past the corners, as on a button.
  frame: pen([[[-past, 0], [w + past, 0]], [[-past, h], [w + past, h]], [[0, -past], [0, h + past]], [[w, -past], [w, h + past]]], 17, 0.1),
  // A wireframe shadow, not a blur: a second outline, joined at the corners.
  shadow: pen([[[w + shadow, shadow], [w + shadow, h + shadow], [shadow, h + shadow]], [[w, 0], [w + shadow, shadow]], [[w, h], [w + shadow, h + shadow]], [[0, h], [shadow, h + shadow]]], 29, 0.1),
  hatch: pen(hatch, 41, 0.1),
  letters: pen(STROKES, 5, 0.34),
  lettersSecond: pen(STROKES, 61, 0.8),
};

/* The batarang, with its own slight tilt so it reads as a blade turned towards you. */
export const BATARANG_R = 14;
const blade = BATARANG_EDGES.map((edge) => edge.map(([x, y]) => [x! * BATARANG_R, y! * BATARANG_R]));
const bladeHatch: Point[][] = [];
for (let c = -BATARANG_R * 1.4; c < BATARANG_R * 1.4; c += 1.8) bladeHatch.push([[c - 5, -6], [c + 5, 10]]);

export const BLADE = {
  shape: `M${BATARANG_OUTLINE.map(([x, y]) => `${(x! * BATARANG_R).toFixed(2)} ${(y! * BATARANG_R).toFixed(2)}`).join("L")}Z`,
  edge: pen(blade, 7, 0.08),
  // The bevel on the reference: the same outline again, a little inside the first.
  bevel: pen(blade.map((edge) => edge.map(([x, y]) => [x! * 0.82, y! * 0.82 + 0.5])), 31, 0.08),
  hatch: pen(bladeHatch, 53, 0.12),
};

export { BLADE_ANGLE, BLADE_TILT };

const rad = (BLADE_ANGLE * Math.PI) / 180, cos = Math.cos(rad), sin = Math.sin(rad);
const place = (x: number, y: number) => {
  const rx = x * cos - y * sin, ry = x * sin + y * cos;
  return { x: BLADE_TILT[0] * rx + BLADE_TILT[2] * ry, y: BLADE_TILT[1] * rx + BLADE_TILT[3] * ry };
};
const f = (v: number) => v.toFixed(2);

// Where the wing tip ends up: in the bowl of the P.
const TIP_AT = { x: 27.5, y: 15 };
const tip = place(-BATARANG_R, -0.22 * BATARANG_R), along = place(1, 0), len = Math.hypot(along.x, along.y);
const u = { x: along.x / len, y: along.y / len }; // along the wing, away from the tip
const n = { x: -u.y, y: u.x };

/** The buried tip, measured from the batarang's centre. */
export const BLADE_TIP = tip;
/** Where the batarang's centre sits once lodged. */
export const LODGED = { x: TIP_AT.x - tip.x, y: TIP_AT.y - tip.y };

// Everything before this line along the wing has gone into the plate.
const SLIT = { x: TIP_AT.x + u.x * 2.4, y: TIP_AT.y + u.y * 2.4 };
const big = 200;
/** What stays visible of the batarang: all but its buried tip. */
export const BLADE_VISIBLE = [
  [SLIT.x - n.x * big, SLIT.y - n.y * big], [SLIT.x + n.x * big, SLIT.y + n.y * big],
  [SLIT.x + n.x * big + u.x * big, SLIT.y + n.y * big + u.y * big], [SLIT.x - n.x * big + u.x * big, SLIT.y - n.y * big + u.y * big],
].map(([x, y]) => `${f(x!)},${f(y!)}`).join(" ");

/** The mark the blade made, and the splits running from it, measured along and across the wing. */
const from = (a: number, b: number) => `${f(SLIT.x + u.x * a + n.x * b)} ${f(SLIT.y + u.y * a + n.y * b)}`;
export const SLIT_LINE = `M${from(0, -1.6)}L${from(0, 2.1)}`;
export const CRACKS = [`M${from(0, -1.6)}L${from(-3, -3.4)}`, `M${from(0, 1.6)}L${from(-2.6, 3.6)}`, `M${from(-1, 0)}L${from(-4, 0.4)}`];
export const FLECK = `M${from(0, -0.6)}L${from(0.9, 0.3)}`;
