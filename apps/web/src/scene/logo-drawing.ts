import { sketch } from "@portfolio/design/button";
import { BATARANG_EDGES, BATARANG_OUTLINE, BLADE_ANGLE, BLADE_TILT } from "./batarang-shape";

/* The logo's line work, worked out once: a blueprint plate the same height as a header button, with a batarang driven into its face. */
type Point = number[];

export const PLATE = { w: 62, h: 38, past: 5, shadow: 4 };

const at = (shape: Point[], dx: number, dy: number) => shape.map(([x, y]) => [x! + dx, y! + dy]);
const flat = (pts: Point[]) => `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
const pen = (lines: Point[][], seed: number, amp: number) => lines.map((l, i) => sketch(l, seed + i * 11, amp)).join(" ");

const S = at([[2, 0], [20, 0], [20, 5], [5, 5], [5, 10.5], [18, 10.5], [20, 12.5], [20, 24], [18, 26], [0, 26], [0, 21], [15, 21], [15, 15.5], [2, 15.5], [0, 13.5], [0, 2]], 7, 6);
const P_OUT = at([[0, 0], [15, 0], [18, 3], [18, 13], [15, 16], [5, 16], [5, 26], [0, 26]], 30, 6);
const P_IN = at([[5, 5], [13, 5], [13, 11], [5, 11]], 30, 6);
const LETTERS = [S, P_OUT, P_IN];

const { w, h, past, shadow } = PLATE;
const hatch: Point[][] = [];
for (let c = -h; c < w + h; c += 4) hatch.push([[c, h], [c + h, 0]]);

export const LOGO = {
  letterFill: LETTERS.map(flat).join(""),
  // Four drafting lines that run past the corners, as on a button.
  frame: pen([[[-past, 0], [w + past, 0]], [[-past, h], [w + past, h]], [[0, -past], [0, h + past]], [[w, -past], [w, h + past]]], 17, 0.1),
  // A wireframe shadow, not a blur: a second outline, joined at the corners.
  shadow: pen([[[w + shadow, shadow], [w + shadow, h + shadow], [shadow, h + shadow]], [[w, 0], [w + shadow, shadow]], [[w, h], [w + shadow, h + shadow]], [[0, h], [shadow, h + shadow]]], 29, 0.1),
  hatch: pen(hatch, 41, 0.1),
};

/* The batarang, with its own slight tilt so it reads as a blade turned towards you. */
export const BATARANG_R = 18;
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

// Where the wing tip ends up, inside the plate, right of the P.
const TIP_AT = { x: 50.5, y: 13.5 };
const tip = place(-BATARANG_R, -0.22 * BATARANG_R), along = place(1, 0), len = Math.hypot(along.x, along.y);
const u = { x: along.x / len, y: along.y / len }; // along the wing, away from the tip
const n = { x: -u.y, y: u.x };

/** Where the batarang's centre sits once lodged. */
export const LODGED = { x: TIP_AT.x - tip.x, y: TIP_AT.y - tip.y };

// Everything before this line along the wing has gone into the plate.
const SLIT = { x: TIP_AT.x + u.x * 3.2, y: TIP_AT.y + u.y * 3.2 };
const big = 200;
/** What stays visible of the batarang: all but its buried tip. */
export const BLADE_VISIBLE = [
  [SLIT.x - n.x * big, SLIT.y - n.y * big], [SLIT.x + n.x * big, SLIT.y + n.y * big],
  [SLIT.x + n.x * big + u.x * big, SLIT.y + n.y * big + u.y * big], [SLIT.x - n.x * big + u.x * big, SLIT.y - n.y * big + u.y * big],
].map(([x, y]) => `${f(x!)},${f(y!)}`).join(" ");

/** The mark the blade made, and the splits running from it, measured along and across the wing. */
const from = (a: number, b: number) => `${f(SLIT.x + u.x * a + n.x * b)} ${f(SLIT.y + u.y * a + n.y * b)}`;
export const SLIT_LINE = `M${from(0, -2.1)}L${from(0, 2.1)}`;
export const CRACKS = [`M${from(0, -2.1)}L${from(-4, -4.6)}`, `M${from(0, 2.1)}L${from(-3.4, 5)}`, `M${from(-1, 0)}L${from(-5.2, 0.4)}`];
export const FLECK = `M${from(0, -0.6)}L${from(0.9, 0.3)}`;
