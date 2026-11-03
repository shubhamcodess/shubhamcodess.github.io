import { BLADE_TILT, bladeAt, CHIPS, LETTER_DEPTH } from "./logo-drawing";

/* The logo's motion. Every value it draws is a number here, and every number is a function of time:
   scenes are lists of tweens, a timeline plays them against its own clock, and `view` turns the numbers into what's drawn.
   Nothing here touches the page, so it can be tested as it is. */

export type LogoState = {
  frame: number; guides: number; letters: number; depth: number;
  /** The flight line: how much is drawn, and how strongly it shows. */
  path: number; pathOp: number; target: number;
  /** The batarang: how visible, where along its flight (0 is lodged), and its spin in degrees. */
  blade: number; flight: number; spin: number;
  /** The cut: how much is drawn, and how strongly it shows. */
  hit: number; mark: number;
  /** The flecks' run, 0 to 1. At 1 they're gone. */
  chips: number;
};
type Key = keyof LogoState;

/** Before anything is drawn. */
export const BLANK: LogoState = { frame: 0, guides: 0, letters: 0, depth: 0, path: 0, pathOp: 0, target: 0, blade: 0, flight: 1, spin: 0, hit: 0, mark: 0, chips: 1 };
/** The finished logo, lodged and still. The server sends this, and reduced motion stays on it. */
export const REST: LogoState = { ...BLANK, frame: 1, guides: 1, letters: 1, depth: 1, blade: 1, flight: 0, hit: 1, mark: 1 };
/** The plate drawn and the batarang not yet thrown, for a load without the intro. */
export const PLATE_ONLY: LogoState = { ...REST, blade: 0, flight: 1, hit: 0, mark: 0 };

type Ease = (t: number) => number;
function bezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t: number) => ((ax * t + bx) * t + cx) * t, Y = (t: number) => ((ay * t + by) * t + cy) * t, dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    let t = x;
    for (let i = 0; i < 8; i++) { const e = X(t) - x, d = dX(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; }
    return Y(Math.min(1, Math.max(0, t)));
  };
}
/** The motion tokens from DESIGN.md, plus the throw's own curves. No overshoot anywhere. */
export const EASE = {
  soft: bezier(0.22, 0.61, 0.36, 1),
  expo: bezier(0.16, 1, 0.3, 1),
  inOut: bezier(0.45, 0, 0.55, 1),
  in: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  linear: (t: number) => t,
} satisfies Record<string, Ease>;

export type Tween = { k: Key; to: number; dur: number; at?: number; from?: number; ease?: Ease };
type Running = { k: Key; to: number; dur: number; at: number; from?: number; ease: Ease; start?: number };

/** Plays scenes against its own clock. A new scene takes over the values it moves from wherever they are, so nothing jumps. */
export class Timeline {
  readonly state: LogoState;
  private running: Running[] = [];
  private clock = 0;
  constructor(initial: LogoState) { this.state = { ...initial }; }
  get busy() { return this.running.length > 0; }
  set(values: Partial<LogoState>) { Object.assign(this.state, values); }
  play(scene: Tween[]) {
    const keys = new Set(scene.map((t) => t.k));
    this.running = this.running.filter((t) => !keys.has(t.k)).concat(scene.map((t) => ({ ...t, at: this.clock + (t.at ?? 0), ease: t.ease ?? EASE.soft })));
  }
  /** Moves the clock on. Returns whether anything is still playing. */
  advance(ms: number): boolean {
    this.clock += ms;
    for (const t of this.running) {
      if (this.clock < t.at) continue;
      t.start ??= t.from ?? this.state[t.k];
      const p = t.dur > 0 ? Math.min(1, (this.clock - t.at) / t.dur) : 1;
      this.state[t.k] = p >= 1 ? t.to : t.start + (t.to - t.start) * t.ease(p);
    }
    this.running = this.running.filter((t) => this.clock < t.at + t.dur);
    return this.busy;
  }
}

/** When a throw strikes, from the start of its scene. */
export const HIT_MS = 1000;
const FLY_FROM = 480;

/** The flight line is drawn, the target appears, and the batarang flies in along the line, spinning, and goes in. */
export function throwScene(spins: number, at = 0): Tween[] {
  return [
    { k: "chips", to: 1, dur: 0, at },
    { k: "path", from: 0, to: 1, at, dur: 440 },
    { k: "pathOp", to: 1, at, dur: 180 },
    { k: "target", from: 0, to: 1, at: at + 220, dur: 300 },
    { k: "blade", from: 0, to: 1, at: at + FLY_FROM, dur: 90, ease: EASE.linear },
    { k: "flight", from: 1, to: 0, at: at + FLY_FROM, dur: HIT_MS - FLY_FROM, ease: EASE.in },
    { k: "spin", from: spins * 360, to: 0, at: at + FLY_FROM, dur: HIT_MS - FLY_FROM, ease: EASE.linear },
    { k: "hit", to: 1, at: at + HIT_MS, dur: 180 },
    { k: "mark", to: 1, at: at + HIT_MS, dur: 40, ease: EASE.linear },
    { k: "chips", from: 0, to: 1, at: at + HIT_MS, dur: 560 },
    { k: "target", to: 0, at: at + HIT_MS + 60, dur: 420 },
    { k: "pathOp", to: 0, at: at + HIT_MS + 260, dur: 700 },
  ];
}

export const PULL_MS = 460;
/** It pulls back out along its line and is gone. The cut stays, fainter. */
export function pullScene(at = 0): Tween[] {
  return [
    { k: "flight", to: 1, at, dur: PULL_MS, ease: EASE.in },
    { k: "spin", to: -540, at, dur: PULL_MS, ease: EASE.in },
    { k: "blade", to: 0, at: at + 300, dur: 160 },
    { k: "mark", to: 0.45, at: at + 120, dur: 500 },
    { k: "pathOp", to: 0, at, dur: 200 },
    { k: "target", to: 0, at, dur: 200 },
  ];
}

export const isLodged = (s: LogoState) => s.blade > 0.5 && s.flight < 0.5;

/** Throw it again: pull it out first if it's in. */
export function rethrowScene(s: LogoState, spins: number): Tween[] {
  return isLodged(s) ? [...pullScene(), ...throwScene(spins, PULL_MS + 60)] : throwScene(spins);
}

/** The frame, then the guides, then the letters, then their depth, then (unless held back) the throw. */
export function introScene(spins: number, withThrow = true): Tween[] {
  return [
    { k: "frame", to: 1, dur: 620, ease: EASE.expo },
    { k: "guides", to: 1, at: 160, dur: 560 },
    { k: "letters", to: 1, at: 360, dur: 760, ease: EASE.inOut },
    { k: "depth", to: 1, at: 900, dur: 650 },
    ...(withThrow ? throwScene(spins, 1060) : []),
  ];
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const part = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const n = (v: number) => Number(v.toFixed(3));

/** What's drawn, from the numbers. Dash offsets run from 1 (none of the line) to 0 (all of it). */
export function view(s: LogoState) {
  const depth = EASE.soft(s.depth), at = bladeAt(s.flight);
  return {
    frame: [0, 1, 2, 3].map((i) => n(1 - EASE.soft(part(s.frame, i * 0.14, i * 0.14 + 0.58)))),
    plateShadow: n(0.5 * part(s.frame, 0.55, 1)),
    plateHatch: n(0.5 * part(s.frame, 0.4, 1)),
    guides: [0, 1, 2].map((i) => n(1 - EASE.soft(part(s.guides, i * 0.12, i * 0.12 + 0.7)))),
    guidesOpacity: n(0.55 - 0.2 * part(s.letters, 0.6, 1)),
    letters: [n(1 - part(s.letters, 0, 0.56)), n(1 - part(s.letters, 0.44, 1))],
    geist: { opacity: n(part(s.letters, 0, 0.8)), blur: n((1 - EASE.soft(s.letters)) * 2.2) },
    depth: { transform: `translate(${n(LETTER_DEPTH.x * depth)} ${n(LETTER_DEPTH.y * depth)})`, opacity: n(part(s.depth, 0, 0.4)) },
    flight: { dash: n(1 - s.path), opacity: n(s.pathOp) },
    target: { opacity: n(s.target), r: n(1.8 + (1 - s.target) * 1.6) },
    slit: n(s.mark * part(s.hit, 0, 0.25)),
    cracks: [0, 1, 2].map((i) => ({ dash: n(1 - part(s.hit, i * 0.12, i * 0.12 + 0.7)), opacity: n(0.8 * s.mark) })),
    blade: { transform: `translate(${n(at.x)} ${n(at.y)}) matrix(${BLADE_TILT.join(" ")} 0 0) rotate(${n(s.spin)})`, opacity: n(s.blade) },
    chips: CHIPS.map(([dx, dy]) => ({ transform: `translate(${n(dx * s.chips)} ${n(dy * s.chips)})`, opacity: s.chips >= 1 ? 0 : n(Math.sin(s.chips * Math.PI)) })),
  };
}
export type LogoView = ReturnType<typeof view>;
