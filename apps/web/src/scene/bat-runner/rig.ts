/* A small Batman made of real joints in 3D, then flattened to one colour. Turning him is a rotation of the model, not a swap of drawings, so every angle in between exists.
   `step` moves him through time and `drawFigure` turns a state into a picture. Neither touches the page. Model units: about 100 tall, y up, feet at 0. */

const RAD = Math.PI / 180;
const CAMERA_PITCH = 9 * RAD; // Seen from slightly above, so depth shows as a small drop on screen.
const CAPE_ROWS = 6;
const CAPE_COLUMNS = [-1, -0.6, -0.2, 0.2, 0.6, 1];

export type RunnerSettings = { speed: number; stride: number };

export type RunnerState = {
  x: number; vx: number; running: boolean;
  yaw: number; yawV: number; capeYaw: number; capeYawV: number;
  run: number; runV: number; crouch: number; crouchV: number;
  skid: number; phase: number; t: number;
  /** How far each row of the cape has been dragged back, 0 to about 1, with its velocity. */
  drag: number[]; dragV: number[];
};

export type RunnerInput = { target: number; /** Which way he looks while still, -1 to 1. */ look: number };

export const REST_LOOK = 0.8;
const lookYaw = (look: number) => look * 46 * RAD;

export function startRunner(x: number): RunnerState {
  const yaw = lookYaw(REST_LOOK);
  return {
    x, vx: 0, running: false, yaw, yawV: 0, capeYaw: yaw, capeYawV: 0, run: 0, runV: 0, crouch: 1, crouchV: 0, skid: 0, phase: 0, t: 0,
    drag: Array.from({ length: CAPE_ROWS }, () => 0), dragV: Array.from({ length: CAPE_ROWS }, () => 0),
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** One step of a spring. `damping` 1 settles with no overshoot; less lets it swing, for the cloth. Returns [value, velocity]. */
const spring = (value: number, velocity: number, target: number, freq: number, dt: number, damping = 1): [number, number] => {
  const v = velocity + (freq * freq * (target - value) - 2 * damping * freq * velocity) * dt;
  return [value + v * dt, v];
};

const START_AT = 9; // px away before he sets off, and...
const STOP_AT = 2.5; // ...px away when he stops, so a small hand movement doesn't start him and stop him again.

/** Moves him on by `dt` seconds: turn first, then run, ease to a stop, then settle back into the crouch. */
export function step(s: RunnerState, input: RunnerInput, settings: RunnerSettings, dtIn: number): void {
  const dt = clamp(dtIn, 0.001, 0.034);
  const gap = input.target - s.x, away = Math.abs(gap), dir = Math.sign(gap) || 1;
  if (away > START_AT) s.running = true;
  else if (away < STOP_AT && Math.abs(s.vx) < 30) s.running = false;
  const wantYaw = s.running ? dir * 84 * RAD : lookYaw(input.look);
  [s.yaw, s.yawV] = spring(s.yaw, s.yawV, wantYaw, 15, dt);
  [s.capeYaw, s.capeYawV] = spring(s.capeYaw, s.capeYawV, s.yaw, 7.5, dt);

  // He can't run until he has turned to face the way he's going. Near the target, speed falls with the distance left, so he eases in.
  const facing = clamp((Math.sin(s.yaw) * dir - 0.25) / 0.6, 0, 1);
  const decel = 1100, accel = 1500;
  const wantV = s.running ? dir * Math.min(settings.speed, Math.sqrt(2 * decel * away)) * facing : 0;
  const before = s.vx, change = wantV - s.vx, limit = (Math.abs(wantV) < Math.abs(s.vx) ? decel : accel) * dt;
  s.vx += clamp(change, -limit, limit);
  s.x += s.vx * dt;
  // Past the target with nothing left to do: stay on it.
  if (Math.sign(input.target - s.x) !== dir && Math.abs(s.vx) < 60) { s.x = input.target; s.vx = 0; }

  const pace = Math.abs(s.vx) / settings.speed;
  [s.run, s.runV] = spring(s.run, s.runV, clamp(pace * 2.4, 0, 1), 13, dt);
  [s.crouch, s.crouchV] = spring(s.crouch, s.crouchV, s.running ? 0 : 1, s.running ? 16 : 7, dt);
  // A hard stop throws the body back for a moment.
  const braking = Math.sign(before) !== 0 && Math.abs(s.vx) < Math.abs(before) ? clamp(Math.abs(before - s.vx) / dt / decel, 0, 1) : 0;
  s.skid += (braking - s.skid) * clamp(dt * 9, 0, 1);
  s.phase = (s.phase + (Math.abs(s.vx) * dt) / settings.stride) % 1;
  s.t += dt;

  // The cape lags row by row, the far end most, and swings past a little when he stops.
  for (let j = 0; j < CAPE_ROWS; j++) {
    const [d, v] = spring(s.drag[j] as number, s.dragV[j] as number, clamp(pace * 1.25, 0, 1), 13 - j * 1.3, dt, 0.68);
    s.drag[j] = d; s.dragV[j] = v;
  }
}

/** How strongly he shows: a slow pulse while crouched, whole while running. */
export const presence = (s: RunnerState) => lerp(1, 0.74 + 0.26 * (0.5 + 0.5 * Math.cos((s.t * Math.PI * 2) / 2.8)), s.crouch);

type Point = [number, number]; // Screen units, y up.
type Joint = [side: number, up: number, forward: number];

const add = (a: Joint, side: number, up: number, forward: number): Joint => [a[0] + side, a[1] + up, a[2] + forward];
const flat = ([side, up, forward]: Joint, yaw: number): Point => {
  const c = Math.cos(yaw), n = Math.sin(yaw);
  return [side * c + forward * n, up * Math.cos(CAMERA_PITCH) - (forward * c - side * n) * Math.sin(CAMERA_PITCH)];
};

/** Where the knee goes for a hip and an ankle: two fixed bones, bending forward and a little outward. */
function knee(hip: Joint, ankle: Joint, upper: number, lower: number, outward: number): Joint {
  const dx = ankle[0] - hip[0], dy = ankle[1] - hip[1], dz = ankle[2] - hip[2];
  const reach = Math.hypot(dx, dy, dz) || 1, d = Math.min(reach, (upper + lower) * 0.998);
  const ex = dx / reach, ey = dy / reach, ez = dz / reach;
  const a = (upper * upper - lower * lower + d * d) / (2 * d), h = Math.sqrt(Math.max(0, upper * upper - a * a));
  const dot = outward * ex + ez;
  const px = outward - dot * ex, py = -dot * ey, pz = 1 - dot * ez, pl = Math.hypot(px, py, pz) || 1;
  return [hip[0] + ex * a + (px / pl) * h, hip[1] + ey * a + (py / pl) * h, hip[2] + ez * a + (pz / pl) * h];
}

/** The pieces a canvas needs. Any context with these three is enough, which is what lets a test count the shapes. */
export type Pen = Pick<CanvasRenderingContext2D, "beginPath" | "arc" | "lineTo" | "moveTo" | "quadraticCurveTo" | "closePath" | "fill" | "stroke">;

/** A limb: two circles and the skin between them, each filled alone so overlaps can never punch a hole. */
function capsule(pen: Pen, a: Point, ar: number, b: Point, br: number) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
  pen.beginPath();
  if (d <= Math.abs(ar - br) + 0.001) { const [c, r] = ar > br ? [a, ar] : [b, br]; pen.arc(c[0], c[1], r, 0, Math.PI * 2); pen.fill(); return; }
  const at = Math.atan2(dy, dx), spread = Math.acos((ar - br) / d);
  pen.arc(a[0], a[1], ar, at + spread, at + Math.PI * 2 - spread);
  pen.arc(b[0], b[1], br, at - spread, at + spread);
  pen.closePath(); pen.fill();
}
function polygon(pen: Pen, points: Point[]) {
  pen.beginPath();
  points.forEach(([x, y], i) => (i ? pen.lineTo(x, y) : pen.moveTo(x, y)));
  pen.closePath(); pen.fill();
}

/** Draws him with the feet at (0, 0) and y up. The caller sets the scale and flips y. */
export function drawFigure(pen: Pen, s: RunnerState) {
  const { run, crouch, yaw, capeYaw } = s;
  const stride = s.phase * Math.PI * 2;
  const breath = Math.sin((s.t * Math.PI * 2) / 2.8) * crouch;
  const bob = Math.cos(stride * 2) * 2.2 * run;

  const lean = (lerp(lerp(6, 37, crouch), 24, run) - s.skid * 26) * RAD;
  const hip: Joint = [0, lerp(lerp(45, 28, crouch), 46, run) + bob + breath * 0.5, lerp(-2 * crouch, 2, run)];
  const chest = add(hip, 0, Math.cos(lean) * 27 + breath * 0.4, Math.sin(lean) * 27);
  const headLean = lean * 0.3;
  const head = add(chest, 0, Math.cos(headLean) * lerp(14, 11.5, crouch), Math.sin(headLean) * 14 + 2 * crouch);

  const P = (j: Joint) => flat(j, yaw);

  // Cape first. It hangs from the shoulders and flares; its far rows answer to a slower turn than the body, which is the follow-through.
  const shoulderY = chest[1] + 1.5, top = chest[2] - 2.5, seg = lerp(lerp(11, 8.2, crouch), 12.2, run); // Shorter in the crouch, so the hem clears the ground and its points show.
  const rows = CAPE_COLUMNS.map((k) => {
    let f = top, u = shoulderY;
    const out: Point[] = [];
    for (let j = 0; j <= CAPE_ROWS; j++) {
      const frac = j / CAPE_ROWS;
      const ripple = Math.sin(stride * 2 - j * 0.95 + k * 1.6) * run;
      const flare = k * (12.5 + lerp(lerp(14, 10, crouch), 8.5, run) * Math.pow(frac, 0.85) + ripple * 1.6);
      const rowYaw = lerp(yaw, capeYaw, frac);
      out.push(flat([flare, u, f], rowYaw));
      if (j === CAPE_ROWS) break;
      const dragged = s.drag[j] as number;
      // Upper rows lie along the back, lower rows fall straight, and running pulls it out behind. The middle lifts further than the edges, so from the side it fills like a sail.
      const rest = lerp(lean * 1.05, 4 * RAD, clamp(j / 3, 0, 1));
      const angle = rest + (dragged * lerp(64, 30, k * k) + ripple * (3 + j * 2.4)) * RAD;
      f -= seg * Math.sin(angle);
      u = Math.max(1.5, u - seg * Math.cos(angle));
    }
    return out;
  });
  for (let c = 0; c + 1 < rows.length; c++) {
    const a = rows[c] as Point[], b = rows[c + 1] as Point[];
    const tipA = a[CAPE_ROWS] as Point, tipB = b[CAPE_ROWS] as Point, upA = a[CAPE_ROWS - 1] as Point, upB = b[CAPE_ROWS - 1] as Point;
    pen.beginPath();
    a.forEach(([x, y], i) => (i ? pen.lineTo(x, y) : pen.moveTo(x, y)));
    // The hem scallops: an arch up between two points, like the wing of a bat.
    pen.quadraticCurveTo((tipA[0] + tipB[0] + upA[0] + upB[0]) / 4, (tipA[1] + tipB[1] + upA[1] + upB[1]) / 4 - 1, tipB[0], tipB[1]);
    for (let j = CAPE_ROWS - 1; j >= 0; j--) { const [x, y] = b[j] as Point; pen.lineTo(x, y); }
    pen.closePath(); pen.fill(); pen.stroke(); // The stroke closes the hairline a canvas leaves between two strips.
  }

  // Legs. Standing feet are planted apart. Running, each foot sweeps back along the ground, then lifts and comes through.
  ([-1, 1] as const).forEach((side, i) => {
    const a = stride + i * Math.PI;
    const lift = Math.max(0, -Math.sin(a));
    const runFoot: Joint = [side * 5, 3 + lift * 21, Math.cos(a) * 23 - lift * 3];
    const standFoot: Joint = [side * lerp(8, 11.5, crouch), 3, side * 8 * crouch];
    const ankle: Joint = [lerp(standFoot[0], runFoot[0], run), lerp(standFoot[1], runFoot[1], run), lerp(standFoot[2], runFoot[2], run)];
    const top = add(hip, side * 5.5, 0, 0);
    const bend = knee(top, ankle, 25, 26, side * lerp(0.55, 0.1, run));
    capsule(pen, P(top), 7, P(bend), 5);
    capsule(pen, P(bend), 5, P(ankle), 3);
    const pitch = lift * run * 0.9; // The toe drops as the foot lifts.
    capsule(pen, P(ankle), 3, P(add(ankle, 0, -2 - pitch * 7, 9.5 - pitch * 3)), 1.5);
  });

  // Body: waist to chest, then the broad yoke that makes the shape heroic.
  capsule(pen, P(add(hip, -5, 0, 0)), 5.8, P(add(hip, 5, 0, 0)), 5.8);
  capsule(pen, P(hip), 7, P(chest), 9.4);
  const shoulderL = add(chest, -lerp(14.5, 12.5, crouch), 1, 0), shoulderR = add(chest, lerp(14.5, 12.5, crouch), 1, 0);
  capsule(pen, P(shoulderL), 6, P(shoulderR), 6);

  // Arms pump against the legs when running, and hang low and ready in the crouch.
  ([shoulderL, shoulderR] as const).forEach((shoulder, i) => {
    const side = i ? 1 : -1;
    const swing = -Math.cos(stride + i * Math.PI) * 48 + 8;
    const upperAt = lerp(lerp(4, 32, crouch), swing, run) * RAD;
    const foreAt = upperAt + lerp(lerp(10, 26, crouch), 88, run) * RAD;
    const elbow = add(shoulder, side * lerp(lerp(3, 7, crouch), 1.5, run), -Math.cos(upperAt) * 17, Math.sin(upperAt) * 17);
    const hand = add(elbow, -side * lerp(2.5 * crouch, 0.5, run), -Math.cos(foreAt) * 16, Math.sin(foreAt) * 16);
    capsule(pen, P(shoulder), 5, P(elbow), 4.2);
    capsule(pen, P(elbow), 4.2, P(hand), 3.4);
  });

  // The cowl: neck, skull, chin, and the two ears that make him who he is. In profile the ears close up into one, as they should.
  capsule(pen, P(chest), 6, P(head), 5.4);
  capsule(pen, P(head), 7.6, P(add(head, 0, -4.8, 3.2)), 4.6);
  ([-1, 1] as const).forEach((side) => {
    polygon(pen, [P(add(head, side * 1.2, 3.5, 2.2)), P(add(head, side * 8, 2, -2.2)), P(add(head, side * 6.2, 20.5, -1.2))]);
  });
}
