/* A cut-out puppet of the traced figure, the way a rigged character is built: the cape, the legs and the boots are separate pieces in one color, cut from the reference along its own lines.
   Standing still they add up to exactly the traced outline. Moving, the cape swings behind and the legs walk out from under it.
   `stepFigure` moves it through time and `traceFigure` writes its shape. Neither touches the page. Units are the trace's own: y down, feet at `h`, facing +x. */

type Point = readonly [number, number];
type Curve = { from: Point; segments: number[][] };
export type Outline = { w: number; h: number; cape: Curve; bootA: Curve; bootB: Curve };

// Where the boots leave the hem, as segment numbers along the trace. A test holds these to the file.
const BOOT_A = { from: 348, to: 14 } as const;
const BOOT_B = { from: 320, to: 340 } as const;

// The parts hidden inside the silhouette, cut by hand along the lines in the reference. They only show once the cape swings away.
const HIPS: Point[] = [[165, 318], [296, 318], [287, 360], [244, 385], [172, 362]];
const REAR_ARM: Point[] = [[78, 250], [135, 250], [140, 388], [172, 412], [165, 430], [152, 442], [115, 428], [100, 380], [80, 330]];
const SHOULDER: Point = [100, 190];
const LEGS = [
  {
    hip: [192, 375] as Point, knee: [157, 498] as Point, ankle: [128, 680] as Point, kneeSize: 17, thighBase: 9, footBase: 58, reach: 0,
    thigh: [[172, 352], [192, 350], [219, 357], [244, 379], [236, 400], [212, 435], [189, 473], [172, 502], [162, 512], [146, 492], [151, 445], [160, 445], [169, 428], [172, 410], [160, 397]] as Point[],
    shin: [[144, 490], [114, 522], [105, 552], [105, 578], [108, 610], [114, 655], [119, 690], [135, 690], [142, 640], [150, 605], [160, 575], [169, 508], [162, 490]] as Point[],
    toes: [[116, 779], [134, 741]] as Point[],
  },
  {
    hip: [252, 380] as Point, knee: [225, 505] as Point, ankle: [220, 690] as Point, kneeSize: 18, thighBase: 2, footBase: 0, reach: 46, // The reference stands in perspective with this foot higher. Walking, both use the same ground.
    thigh: [[244, 379], [285, 357], [284, 385], [272, 422], [254, 465], [246, 495], [240, 515], [209, 502], [211, 495], [212, 445], [236, 400]] as Point[],
    shin: [[209, 500], [192, 532], [192, 552], [202, 605], [209, 650], [210, 690], [235, 690], [232, 658], [240, 585], [242, 522], [241, 512], [235, 500]] as Point[],
    toes: [[283, 733], [205, 705]] as Point[],
  },
];
const CAPE_PIVOT: Point = [205, 190];

const RAD = Math.PI / 180;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (lo: number, hi: number, v: number) => { const t = clamp((v - lo) / (hi - lo), 0, 1); return t * t * (3 - 2 * t); };
/** One step of a spring. `damping` 1 settles with no overshoot; less lets it swing, for the cloth. Returns [value, velocity]. */
const spring = (value: number, velocity: number, target: number, freq: number, dt: number, damping = 1): [number, number] => {
  const v = velocity + (freq * freq * (target - value) - 2 * damping * freq * velocity) * dt;
  return [value + v * dt, v];
};

/** Reads the one closed path in the figure's svg, which only ever holds m, c, l and z, and cuts it into the cape and the two boots. */
export function parseOutline(d: string, w: number, h: number): Outline {
  const tokens = d.match(/[Mmclz]|-?\d*\.?\d+/g) ?? [];
  let i = 0, x = 0, y = 0, cmd = "";
  const next = () => Number(tokens[i++]);
  const segments: number[][] = [], at: Point[] = [];
  const add = (rel: number[]) => {
    const pts = rel.map((v, n) => v + (n % 2 ? y : x));
    x = pts[pts.length - 2] as number; y = pts[pts.length - 1] as number;
    segments.push(pts); at.push([x, y]);
  };
  while (i < tokens.length) {
    const t = tokens[i] as string;
    if (/[Mmclz]/.test(t)) { cmd = t; i++; }
    if (cmd === "z") break;
    if (cmd === "M" || cmd === "m") { x = next(); y = next(); at.push([x, y]); cmd = "l"; }
    else if (cmd === "c") add([next(), next(), next(), next(), next(), next()]);
    else add([next(), next()]);
  }
  const n = segments.length, run = (from: number, to: number) => { const out: number[][] = []; for (let k = from; k !== to; k = (k + 1) % n) out.push(segments[k] as number[]); return out; };
  const start = (k: number) => at[k % n] as Point;
  return {
    w, h,
    bootA: { from: start(BOOT_A.from), segments: run(BOOT_A.from, BOOT_A.to) },
    bootB: { from: start(BOOT_B.from), segments: run(BOOT_B.from, BOOT_B.to) },
    // The cape closes straight across where each boot was, and the shins fill those gaps.
    cape: { from: start(BOOT_A.to), segments: [...run(BOOT_A.to, BOOT_B.from), [...start(BOOT_B.to)], ...run(BOOT_B.to, BOOT_A.from)] },
  };
}

/** How tall it can be in the space above its line, leaving `clearance`, within the limits. Undefined room means it's free to take the largest size. */
export function fitHeight(room: number | undefined, limits: { min: number; max: number; clearance: number }): number {
  return Math.round(clamp(room === undefined ? limits.max : room - limits.clearance, limits.min, limits.max));
}

export type FigureSettings = { pace: number; height: number };
export type FigureInput = { target: number; side: number };

export type FigureState = {
  x: number; v: number; chasing: boolean;
  turn: number; turnV: number; tilt: number; tiltV: number;
  drive: number; driveV: number; lean: number; leanV: number;
  dragTop: number; dragTopV: number; dragLow: number; dragLowV: number;
  phase: number; t: number;
};

export const startFigure = (x: number, side: number): FigureState => ({
  x, v: 0, chasing: false, turn: side, turnV: 0, tilt: 1, tiltV: 0, drive: 0, driveV: 0, lean: 0, leanV: 0, dragTop: 0, dragTopV: 0, dragLow: 0, dragLowV: 0, phase: 0, t: 0,
});

const STRIDE = 1.5; // Body heights per full cycle of both legs.
const SET_OFF = 0.35; // Body heights away before it sets off, and...
const ARRIVED = 0.08; // ...when it counts as there, so a small hand movement doesn't start and stop it.

/** Turn first, heavy and unhurried, then go: he eases up to pace, leans in, and eases down onto the target. */
export function stepFigure(s: FigureState, input: FigureInput, settings: FigureSettings, dtIn: number): void {
  const dt = clamp(dtIn, 0.001, 0.034), { height, pace } = settings;
  const gap = input.target - s.x, away = Math.abs(gap), dir = Math.sign(gap) || 1;
  if (away > SET_OFF * height) s.chasing = true;
  else if (away < ARRIVED * height && Math.abs(s.v) < 0.25 * height) s.chasing = false;
  const face = s.chasing ? dir : input.side;
  [s.turn, s.turnV] = spring(s.turn, s.turnV, face, 8.5, dt);
  [s.tilt, s.tiltV] = spring(s.tilt, s.tiltV, s.chasing ? 0.25 : 1, 5, dt);

  const facing = clamp((s.turn * dir - 0.45) / 0.45, 0, 1);
  const top = pace * height, decel = 4.5 * height, accel = 3.6 * height;
  const want = s.chasing ? dir * Math.min(top, Math.sqrt(2 * decel * away)) * facing : 0;
  const before = s.v, slowing = Math.abs(want) < Math.abs(s.v), limit = (slowing ? decel : accel) * dt;
  s.v += clamp(want - s.v, -limit, limit);
  s.x += s.v * dt;
  if (Math.sign(input.target - s.x) !== dir && Math.abs(s.v) < 0.8 * height) { s.x = input.target; s.v = 0; }

  const speed = Math.abs(s.v) / top;
  [s.drive, s.driveV] = spring(s.drive, s.driveV, clamp(speed * 1.5, 0, 1), 8, dt);
  const pulling = clamp((Math.abs(s.v) - Math.abs(before)) / dt / accel, -1, 1);
  [s.lean, s.leanV] = spring(s.lean, s.leanV, speed * 7.5 + pulling * 2.5, 6, dt);
  [s.dragTop, s.dragTopV] = spring(s.dragTop, s.dragTopV, clamp(speed * 1.2, 0, 1), 8, dt, 0.8);
  [s.dragLow, s.dragLowV] = spring(s.dragLow, s.dragLowV, clamp(speed * 1.2, 0, 1), 5, dt, 0.62);
  s.phase = (s.phase + (Math.abs(s.v) * dt) / (STRIDE * height)) % 1;
  s.t += dt;
}

/** The pieces of a canvas path this needs. A test passes a recorder instead. */
export type PathPen = Pick<CanvasPath, "moveTo" | "lineTo" | "bezierCurveTo" | "closePath">;
/** Each piece is filled on its own, so overlapping pieces can never cancel out into a hole. */
export type Painter = (write: (pen: PathPen) => void) => void;

type Mover = (x: number, y: number) => void;

/** Paints the figure piece by piece, feet on y = 0, y up, x = 0 on its centre. `depth` moves it back along its own thickness. */
export function traceFigure(paint: Painter, o: Outline, s: FigureState, depth = 0) {
  const { h: H } = o, cx = o.w / 2;
  const stride = s.phase * Math.PI * 2, d = s.drive;
  const breath = Math.sin((s.t * Math.PI * 2) / 3.6) * (1 - d);
  const turnAbout = (j: Point, x: number, y: number, a: number): Point => { const c = Math.cos(a), n = Math.sin(a), dx = x - j[0], dy = y - j[1]; return [j[0] + dx * c + dy * n, j[1] - dx * n + dy * c]; };

  // The walk. Thigh swings from the hip, the knee folds as the leg comes through, and the foot stays roughly level. Angles grow from nothing with the pace, so at rest every piece is exactly where it was cut.
  const legsAt = (phase: number) => LEGS.map((leg, i) => {
    const a = phase + i * Math.PI, lift = Math.max(0, -Math.sin(a));
    const thigh = (leg.thighBase + 23 * Math.cos(a)) * d * RAD;
    const shin = thigh - (7 + 54 * lift) * d * RAD;
    const foot = shin + ((leg.footBase - 24 * lift) * d * RAD) - shin * 0.75 * d;
    const knee = turnAbout(leg.hip, leg.knee[0], leg.knee[1], thigh);
    const down = leg.reach * d;
    const shinAt = (x: number, y: number): Point => { const p = turnAbout(leg.knee, x, y + (y > leg.knee[1] + 60 ? down : 0), shin); return [p[0] + knee[0] - leg.knee[0], p[1] + knee[1] - leg.knee[1]]; };
    const ankle = shinAt(leg.ankle[0], leg.ankle[1]);
    const bootAt = (x: number, y: number): Point => { const p = turnAbout(leg.ankle, x, y, foot); return [p[0] + ankle[0] - leg.ankle[0], p[1] + ankle[1] - leg.ankle[1]]; };
    const lowest = Math.max(...leg.toes.map(([x, y]) => bootAt(x, y)[1]));
    return { thigh, knee, shinAt, bootAt, lowest };
  });
  const legs = legsAt(stride);
  // Whichever foot is lower carries him, so the body rises and falls with the step. That's the weight. Only part of the rise is kept, so it's heavy and level rather than bouncing, and a foot may sit a hair off the line at the top of a step.
  const gapAt = (phase: number) => H - Math.max(...legsAt(phase).map((l) => l.lowest));
  const level = (gapAt(0) + gapAt(Math.PI / 4) + gapAt(Math.PI / 2) + gapAt((3 * Math.PI) / 4)) / 4;
  const carried = level + (gapAt(stride) - level) * 0.45;
  const armSwing = Math.sin(stride) * 26 * d * RAD;
  const fist = Math.sin(stride) * 12 * d;
  const leanTan = Math.tan((s.lean + 1.4 * s.tilt) * RAD); // Even at rest he leans into it a little.

  // The turn. Crossing the middle he's narrow, which is where the drawing swaps for its mirror image.
  const mirror = s.turn < 0 ? -1 : 1;
  const width = lerp(0.5, 1, smooth(0, 1, Math.abs(s.turn)));
  const yaw = lerp(3, 19, clamp(s.tilt, 0, 1)) * RAD, cosY = Math.cos(yaw), sinY = Math.sin(yaw);

  // Everything passes through here last: the lean above the hips, then a turn in 3D on a very slightly rounded surface, so the near side grows and the far side falls away like a solid thing, not a card.
  const final = (pen: (x: number, y: number) => void, xIn: number, yIn: number) => {
    let x = xIn + leanTan * Math.max(0, 350 - yIn) + leanTan * 0.25 * Math.max(0, 650 - Math.max(yIn, 350));
    const y = yIn + carried;
    x += (x - cx) * breath * 0.01 * Math.exp(-(((yIn - 230) / 130) ** 2));
    const across = (x - cx) * width, round = -(across * across) / 1500;
    const wide = across * cosY + round * sinY, near = across * sinY - round * cosY - depth;
    const scale = 1 / (1 - near / 1500);
    pen(mirror * (wide + depth * sinY) * scale, (H - y + breath * 1.6 * smooth(650, 380, yIn)) * scale);
  };

  const curve = (c: Curve, move: (x: number, y: number) => Point) => paint((pen) => {
    let out: Point = [0, 0];
    const to = (x: number, y: number) => { const p = move(x, y); final((a, b) => { out = [a, b]; }, p[0], p[1]); return out; };
    const [fx, fy] = to(c.from[0], c.from[1]); pen.moveTo(fx, fy);
    for (const q of c.segments) {
      if (q.length === 2) { const [a, b] = to(q[0] as number, q[1] as number); pen.lineTo(a, b); continue; }
      const [a, b] = to(q[0] as number, q[1] as number), [e, f] = to(q[2] as number, q[3] as number), [g, h] = to(q[4] as number, q[5] as number);
      pen.bezierCurveTo(a, b, e, f, g, h);
    }
    pen.closePath();
  });
  const shape = (points: Point[], move: (x: number, y: number) => Point) => paint((pen) => {
    points.forEach(([x, y], i) => final((a, b) => (i ? pen.lineTo(a, b) : pen.moveTo(a, b)), ...move(x, y)));
    pen.closePath();
  });
  const dot = (at: Point, r: number) => shape(Array.from({ length: 12 }, (_, i): Point => [at[0] + Math.cos((i * Math.PI) / 6) * r, at[1] + Math.sin((i * Math.PI) / 6) * r]), (x, y) => [x, y]);

  // The cape: rigid near the shoulders and swinging from them lower down, the far end lagging and rippling, so its points keep their shape. The rear lets go higher up than the front, which stays pinned behind the hand.
  curve(o.cape, (x, y) => {
    const front = clamp((x - 120) / 200, 0, 1), w = smooth(lerp(280, 440, front), lerp(520, 590, front), y);
    if (w <= 0) { const sway = Math.exp(-(((x - 345) ** 2 + (y - 345) ** 2) / 3400)) * fist; return [x + sway, y]; }
    const drag = lerp(s.dragTop, s.dragLow, w);
    const ripple = Math.sin(stride * 2 - x * 0.012 - y * 0.006) * 3.2 * w * w * d;
    const gathered = CAPE_PIVOT[0] + (x - CAPE_PIVOT[0]) * (1 - 0.3 * drag * w); // Pulled back, it gathers narrower, like cloth.
    return turnAbout(CAPE_PIVOT, gathered, y, -(drag * 27 * w + ripple) * RAD);
  });

  shape(REAR_ARM, (x, y) => turnAbout(SHOULDER, x, y, armSwing));
  shape(HIPS, (x, y) => [x, y]);
  legs.forEach((l, i) => {
    const leg = LEGS[i] as (typeof LEGS)[number];
    shape(leg.thigh, (x, y) => turnAbout(leg.hip, x, y, l.thigh));
    shape(leg.shin, l.shinAt);
    dot(l.knee, leg.kneeSize);
    curve(i ? o.bootB : o.bootA, l.bootAt);
  });
}
