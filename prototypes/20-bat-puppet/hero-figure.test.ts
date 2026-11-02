import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fitHeight, parseOutline, startFigure, stepFigure, traceFigure, type FigureState, type PathPen } from "../apps/web/src/scene/figure/rig";

const svg = readFileSync(new URL("../apps/web/public/hero-figure.svg", import.meta.url), "utf8");
const box = /viewBox="0 0 (\S+) (\S+)"/.exec(svg) as RegExpExecArray;
const d = (/ d="([^"]+)"/.exec(svg) as RegExpExecArray)[1] as string;
const outline = parseOutline(d, Number(box[1]), Number(box[2]));
const SETTINGS = { pace: 2.4, height: 40 };

const run = (s: FigureState, target: number, seconds: number, side = 1, each?: () => void) => {
  for (let i = 0; i < seconds * 60; i++) { stepFigure(s, { target, side }, SETTINGS, 1 / 60); each?.(); }
};
/** Every point the figure would draw, piece by piece. */
const drawn = (s: FigureState) => {
  const pieces: number[][][] = [];
  traceFigure((write) => {
    const pts: number[][] = [];
    const pen: PathPen = { moveTo: (x, y) => { pts.push([x, y]); }, lineTo: (x, y) => { pts.push([x, y]); }, bezierCurveTo: (_a, _b, _c, _e, x, y) => { pts.push([x, y]); }, closePath() {} };
    write(pen);
    pieces.push(pts);
  }, outline, s);
  return pieces;
};

describe("the figure's outline", () => {
  it("is one closed path, and stays small", () => {
    expect(svg.match(/<path/g)).toHaveLength(1);
    expect(d.match(/[Mm]/g)).toHaveLength(1);
    expect(d.endsWith("z")).toBe(true);
    expect(svg.length).toBeLessThan(10_000);
  });
  it("cuts the boots where they leave the hem", () => {
    // If the trace is ever redone, the segment numbers in rig.ts need finding again.
    expect(outline.bootA.from[0]).toBeCloseTo(143, -1);
    expect(outline.bootA.from[1]).toBeCloseTo(637, -1);
    expect(outline.bootB.from[0]).toBeCloseTo(233, -1);
    expect(outline.bootB.from[1]).toBeCloseTo(661, -1);
    expect(outline.cape.segments.length + outline.bootA.segments.length + outline.bootB.segments.length).toBe(369);
  });
});

describe("fitHeight", () => {
  const limits = { min: 22, max: 46, clearance: 6 };
  it("takes the room there is, less the clearance", () => expect(fitHeight(40, limits)).toBe(34));
  it("stays within its limits", () => {
    expect(fitHeight(500, limits)).toBe(46);
    expect(fitHeight(10, limits)).toBe(22);
  });
  it("takes the largest size when nothing is above it", () => expect(fitHeight(undefined, limits)).toBe(46));
});

describe("the figure's motion", () => {
  it("stands where it is with nothing to chase", () => {
    const s = startFigure(200, 1);
    run(s, 200, 3);
    expect(s.x).toBe(200);
    expect(s.drive).toBeLessThan(0.01);
  });
  it("turns before it goes", () => {
    const s = startFigure(0, -1);
    let turnedWhenMoving = -9;
    run(s, 400, 1.5, 1, () => { if (turnedWhenMoving === -9 && Math.abs(s.v) > 1) turnedWhenMoving = s.turn; });
    expect(turnedWhenMoving).toBeGreaterThan(0.4);
  });
  it("stays slow and grounded, at its pace", () => {
    const s = startFigure(0, 1);
    let fastest = 0;
    run(s, 4000, 6, 1, () => { fastest = Math.max(fastest, Math.abs(s.v)); });
    expect(fastest).toBeLessThanOrEqual(SETTINGS.pace * SETTINGS.height + 0.01);
  });
  it("arrives without overshooting, either way", () => {
    const right = startFigure(0, 1);
    let furthest = 0;
    run(right, 300, 7, 1, () => { furthest = Math.max(furthest, right.x); });
    expect(Math.abs(right.x - 300)).toBeLessThan(4);
    expect(furthest).toBeLessThan(304);
    const left = startFigure(300, -1);
    run(left, 0, 7, -1);
    expect(Math.abs(left.x)).toBeLessThan(4);
  });
  it("draws real numbers at every moment, with its feet near the ground", () => {
    const s = startFigure(0, 1);
    const check = () => {
      const pieces = drawn(s);
      const ys: number[] = [];
      for (const piece of pieces) for (const [x, y] of piece) { expect(Number.isFinite(x)).toBe(true); expect(Number.isFinite(y)).toBe(true); ys.push(y as number); }
      const lowest = Math.min(...ys);
      expect(lowest).toBeLessThan(45); // Never floats.
      expect(lowest).toBeGreaterThan(-45); // Never sinks through the line.
    };
    run(s, 900, 4, 1, check);
    run(s, 0, 4, -1, check);
  });
  it("is the same figure standing as in the reference, not a warped one", () => {
    const pieces = drawn(startFigure(0, 1));
    const xs = pieces.flat().map((p) => p[0] as number), ys = pieces.flat().map((p) => p[1] as number);
    expect(Math.max(...ys)).toBeGreaterThan(outline.h * 0.9);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(outline.w * 0.85);
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(outline.w * 1.05);
  });
});
