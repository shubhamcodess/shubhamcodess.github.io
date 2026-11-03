import { BATARANG_EDGES, BATARANG_OUTLINE, BLADE_ANGLE, BLADE_TILT } from "./batarang-shape";

/* The logo's line work, worked out once, in the plate's own 38-unit space: a blueprint plate the height of a header button,
   SP on it, and a batarang buried in the P. Clean lines throughout; the hand is in the drawings, not the mark. */
type Point = number[];
type Vec = { x: number; y: number };

export const PLATE = { w: 38, h: 38, past: 5, shadow: 4 } as const;

const f = (v: number) => v.toFixed(2);
const line = (pts: Point[]) => `M${pts.map(([x, y]) => `${f(x!)} ${f(y!)}`).join("L")}`;
const { w, h, past, shadow } = PLATE;

/** Four drafting lines that run past the corners, as on a button. Each one is drawn on from its start. */
export const FRAME = [`M${-past} 0H${w + past}`, `M${w} ${-past}V${h + past}`, `M${w + past} ${h}H${-past}`, `M0 ${h + past}V${-past}`] as const;
/** A wireframe shadow, not a blur: a second outline, joined at the corners. */
export const PLATE_SHADOW = `M${w} 0L${w + shadow} ${shadow}V${h + shadow}H${shadow}L0 ${h}M${w} ${h}L${w + shadow} ${h + shadow}`;
/** The plate's hatching, which rises from the bottom edge and is gone before the letters. */
export const PLATE_HATCH = Array.from({ length: 20 }, (_, i) => { const c = -h + i * 4; return `M${c} ${h}L${c + h} 0`; }).join(" ");

/** SP as drafting lettering: strokes and arcs of one 4-unit radius on a cap line (11), a mid line (19) and a baseline (27). */
export const LETTERS = [
  "M17.4 11H11.4A4 4 0 0 0 11.4 19H13.4A4 4 0 0 1 13.4 27H6.8",
  "M21.2 27V11H27.4A4 4 0 0 1 27.4 19H21.2",
] as const;
export const GUIDES = [11, 19, 27].map((y) => `M3 ${y}H35`);
/** SP in Geist, sized so its caps sit on the same lines. */
export const GEIST = { x: 19.1, y: 27, size: 22, tracking: "-.04em" } as const;
/** How far the letters' wireframe copy is set back, and its hatching. */
export const LETTER_DEPTH = { x: 1.3, y: 1.3 } as const;
export const LETTER_HATCH = Array.from({ length: 34 }, (_, i) => { const c = -10 + i * 1.5; return `M${c} 40L${c + 30} 0`; }).join(" ");

/* The batarang: the one shared shape, at the logo's size. */
export const BATARANG_R = 12.5;
const R = BATARANG_R;
const edges = BATARANG_EDGES.map((edge) => edge.map(([x, y]) => [x! * R, y! * R]));
export const BLADE = {
  shape: line(BATARANG_OUTLINE.map(([x, y]) => [x! * R, y! * R])) + "Z",
  edge: edges.map(line).join(" "),
  // The bevel: the same outline again, a little inside the first.
  bevel: edges.map((edge) => line(edge.map(([x, y]) => [x! * 0.82, y! * 0.82 + 0.5]))).join(" "),
  // Only the outline finish uses this.
  hatch: Array.from({ length: 30 }, (_, i) => { const c = -R * 1.4 + i * 1.8; return `M${f(c - 5)} -6L${f(c + 5)} 10`; }).join(" "),
};
/** Its thickness, as offsets of the face, so the side reads as solid. */
export const BLADE_SIDE = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1].map((t) => `translate(${f(0.9 * t)} ${f(1.2 * t)})`);
export { BLADE_ANGLE, BLADE_TILT };

const rad = (BLADE_ANGLE * Math.PI) / 180, cos = Math.cos(rad), sin = Math.sin(rad);
const place = (x: number, y: number): Vec => {
  const rx = x * cos - y * sin, ry = x * sin + y * cos;
  return { x: BLADE_TILT[0] * rx + BLADE_TILT[2] * ry, y: BLADE_TILT[1] * rx + BLADE_TILT[3] * ry };
};
const along = place(1, 0), len = Math.hypot(along.x, along.y);
/** Along the wing, away from the tip. */
const U: Vec = { x: along.x / len, y: along.y / len };
const N: Vec = { x: -U.y, y: U.x };

/** Where the blade goes into the P: the top right of its bowl. Its tip is buried this far inside the letter. */
export const ENTRY: Vec = { x: 30.1, y: 12.7 };
export const BURIED = 4.6;
const tipAt: Vec = { x: ENTRY.x - U.x * BURIED, y: ENTRY.y - U.y * BURIED };
const tip = place(-R, -0.22 * R);
/** Where the batarang's centre sits once lodged. */
export const LODGED: Vec = { x: tipAt.x - tip.x, y: tipAt.y - tip.y };

const BIG = 200;
/** What stays visible of the batarang: everything on the near side of where it goes in. */
export const BLADE_VISIBLE = [
  [ENTRY.x - N.x * BIG, ENTRY.y - N.y * BIG], [ENTRY.x + N.x * BIG, ENTRY.y + N.y * BIG],
  [ENTRY.x + N.x * BIG + U.x * BIG, ENTRY.y + N.y * BIG + U.y * BIG], [ENTRY.x - N.x * BIG + U.x * BIG, ENTRY.y - N.y * BIG + U.y * BIG],
].map(([x, y]) => `${f(x!)},${f(y!)}`).join(" ");

/** The cut, and the splits running back from it into the letter, measured along and across the wing. */
const from = (a: number, b: number) => `${f(ENTRY.x + U.x * a + N.x * b)} ${f(ENTRY.y + U.y * a + N.y * b)}`;
export const SLIT_LINE = `M${from(0, -1.6)}L${from(0, 2.1)}`;
export const CRACKS = [`M${from(0, -1.6)}L${from(-3, -3.4)}`, `M${from(0, 1.6)}L${from(-2.6, 3.6)}`, `M${from(-1, 0)}L${from(-4, 0.4)}`] as const;
/** Flecks of the plate, thrown back along the batarang's path. */
export const FLECK = `M${from(0, -0.6)}L${from(0.9, 0.3)}`;
export const CHIPS = [[-5, -7], [1, -9], [6, -6], [-8, -2]] as const;

/** The flight line: a slight arc in from beyond the top right, ending where the blade goes in. */
const START: Vec = { x: ENTRY.x + U.x * 34, y: ENTRY.y + U.y * 34 };
const CTRL: Vec = { x: (START.x + ENTRY.x) / 2 - N.x * 4, y: (START.y + ENTRY.y) / 2 - N.y * 4 };
export const FLIGHT = `M${f(START.x)} ${f(START.y)}Q${f(CTRL.x)} ${f(CTRL.y)} ${f(ENTRY.x)} ${f(ENTRY.y)}`;
/** The batarang's centre at `s` along its flight: 0 is lodged, 1 is the far end of the line. */
export function bladeAt(s: number): Vec {
  const t = 1 - s, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
  return { x: a * START.x + b * CTRL.x + c * ENTRY.x + LODGED.x - ENTRY.x, y: a * START.y + b * CTRL.y + c * ENTRY.y + LODGED.y - ENTRY.y };
}

/** The blade's shadow on the plate, as a matrix. It falls down and to the right like every shadow here, and further the further
    a point is from where the blade goes in, so in flight it trails off and it closes on the entry as the blade lands. */
const K = 0.16, D: Vec = { x: 0.55, y: 0.84 }, s0 = ENTRY.x * U.x + ENTRY.y * U.y;
export const BLADE_SHADOW = [1 + K * D.x * U.x, K * D.y * U.x, K * D.x * U.y, 1 + K * D.y * U.y, -K * D.x * s0, -K * D.y * s0].map(f).join(" ");
