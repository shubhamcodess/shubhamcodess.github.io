import { describe, expect, it } from "vitest";
import { drawFigure, presence, startRunner, step, type Pen, type RunnerState } from "../apps/web/src/scene/bat-runner/rig";

const SETTINGS = { speed: 340, stride: 78 };
const run = (s: RunnerState, target: number, seconds: number, look = 0.5, each?: () => void) => {
  for (let i = 0; i < seconds * 60; i++) { step(s, { target, look }, SETTINGS, 1 / 60); each?.(); }
};
/** Records what would be drawn, so a test can check every number is real and nothing sinks through the line. */
const recordingPen = () => {
  const points: number[][] = [];
  const pen = { beginPath() {}, closePath() {}, fill() {}, stroke() {}, moveTo: (x: number, y: number) => points.push([x, y]), lineTo: (x: number, y: number) => points.push([x, y]), quadraticCurveTo: (a: number, b: number, x: number, y: number) => points.push([a, b], [x, y]), arc: (x: number, y: number, r: number) => points.push([x, y, r]) } as unknown as Pen;
  return { pen, points };
};

describe("the runner", () => {
  it("stays crouched in place with no pointer", () => {
    const s = startRunner(200);
    run(s, 200, 3);
    expect(s.x).toBe(200);
    expect(s.crouch).toBeGreaterThan(0.95);
    expect(s.running).toBe(false);
  });
  it("turns before it runs", () => {
    const s = startRunner(0);
    let movedAt = -1, frame = 0;
    run(s, 400, 0.4, 0.5, () => { frame++; if (movedAt < 0 && Math.abs(s.vx) > 20) movedAt = frame; });
    expect(movedAt).toBeGreaterThan(0);
    expect(s.yaw).toBeGreaterThan(0.8);
    const back = startRunner(0);
    run(back, 4000, 1);
    run(back, 0, 0.05);
    expect(back.vx).toBeGreaterThan(0); // Still carrying its speed while it turns round.
  });
  it("arrives on the target without overshooting it, and settles", () => {
    const s = startRunner(0);
    let furthest = 0;
    run(s, 300, 3, 0.5, () => { furthest = Math.max(furthest, s.x); });
    expect(Math.abs(s.x - 300)).toBeLessThan(3);
    expect(furthest).toBeLessThan(304);
    expect(s.crouch).toBeGreaterThan(0.9);
  });
  it("runs left as well as right", () => {
    const s = startRunner(500);
    run(s, 100, 0.6);
    expect(s.yaw).toBeLessThan(-1);
    expect(s.vx).toBeLessThan(0);
    run(s, 100, 3);
    expect(Math.abs(s.x - 100)).toBeLessThan(3);
  });
  it("draws real numbers in every moment, and its cape never goes through the line", () => {
    const s = startRunner(0);
    const check = () => {
      const { pen, points } = recordingPen();
      drawFigure(pen, s);
      expect(points.length).toBeGreaterThan(40);
      for (const p of points) for (const v of p) expect(Number.isFinite(v)).toBe(true);
      expect(Math.max(...points.map((p) => p[1] as number))).toBeLessThan(115);
    };
    run(s, 600, 2.5, 0.5, check);
    run(s, 0, 2.5, -0.5, check);
  });
  it("pulses only while crouched", () => {
    const s = startRunner(0);
    run(s, 0, 1.4);
    expect(presence(s)).toBeLessThan(0.8);
    run(s, 900, 1);
    expect(presence(s)).toBeGreaterThan(0.95);
  });
});
