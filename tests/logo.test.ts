import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOGO_OPTIONS, siteSchema } from "@portfolio/content";
import { site } from "@portfolio/site";
import { bladeAt, ENTRY, LODGED, PLATE } from "../apps/web/src/scene/logo-drawing";
import { BLANK, HIT_MS, introScene, isLodged, PLATE_ONLY, pullScene, PULL_MS, REST, rethrowScene, throwScene, Timeline, view } from "../apps/web/src/scene/logo-motion";

const css = readFileSync(new URL("../apps/web/src/scene/scene.css", import.meta.url), "utf8");
const config = { ...site, logo: { ...site.logo } };

/** Runs a timeline to the end, a frame at a time. */
function run(t: Timeline, limit = 10_000) {
  for (let ms = 0; ms < limit && t.advance(16); ms += 16);
  return t.state;
}

describe("the logo's settings", () => {
  it("defaults to Geist, suit grey, letter depth on, guides and aim off", () => {
    expect(site.logo).toMatchObject({ lettering: "geist", blade: "suit", depth: true, guides: false, aim: false });
  });
  it("rejects unknown options and keys", () => {
    expect(siteSchema.safeParse({ ...config, logo: { ...config.logo, blade: "gold" } }).success).toBe(false);
    expect(siteSchema.safeParse({ ...config, logo: { ...config.logo, glow: true } }).success).toBe(false);
    expect(siteSchema.safeParse({ ...config, logo: { ...config.logo, speed: 9 } }).success).toBe(false);
  });
  it("accepts every option", () => {
    for (const lettering of LOGO_OPTIONS.lettering) for (const blade of LOGO_OPTIONS.blade)
      expect(siteSchema.safeParse({ ...config, logo: { ...config.logo, lettering, blade } }).success).toBe(true);
  });
  it("has colors for every solid finish, from the theme only", () => {
    for (const blade of LOGO_OPTIONS.blade.filter((b) => b !== "outline")) {
      const rule = new RegExp(`\\.site-logo\\[data-blade="${blade}"\\]\\s*\\{([^}]+)\\}`).exec(css)?.[1] ?? "";
      for (const part of ["face", "side", "bevel", "edge"]) expect(rule).toContain(`--logo-blade-${part}:`);
      expect(rule).not.toMatch(/#[0-9a-f]{3}/i);
    }
  });
});

describe("the logo's drawing", () => {
  it("goes in through the P, inside the plate", () => {
    expect(ENTRY.x).toBeGreaterThan(21);
    expect(ENTRY.x).toBeLessThan(PLATE.w);
    expect(ENTRY.y).toBeGreaterThan(10);
    expect(ENTRY.y).toBeLessThan(19);
  });
  it("flies in from outside, beyond the top right, and ends lodged", () => {
    const far = bladeAt(1);
    expect(far.x).toBeGreaterThan(PLATE.w);
    expect(far.y).toBeLessThan(0);
    expect(bladeAt(0).x).toBeCloseTo(LODGED.x, 9);
    expect(bladeAt(0).y).toBeCloseTo(LODGED.y, 9);
  });
});

describe("the logo's motion", () => {
  it("the intro ends on the finished logo", () => {
    const t = new Timeline(BLANK);
    t.play(introScene(2));
    expect(run(t)).toMatchObject({ frame: 1, letters: 1, depth: 1, blade: 1, flight: 0, spin: 0, hit: 1, mark: 1, chips: 1 });
  });
  it("can draw the plate and hold the throw back", () => {
    const t = new Timeline(BLANK);
    t.play(introScene(2, false));
    expect(isLodged(run(t))).toBe(false);
  });
  it("strikes when it says it does", () => {
    const t = new Timeline(PLATE_ONLY);
    t.play(throwScene(2));
    t.advance(HIT_MS - 1);
    expect(t.state.flight).toBeGreaterThan(0);
    t.advance(2);
    expect(t.state.flight).toBe(0);
    expect(isLodged(run(t))).toBe(true);
  });
  it("pulls out and leaves only a faint cut", () => {
    const t = new Timeline(REST);
    t.play(pullScene());
    expect(run(t)).toMatchObject({ blade: 0, flight: 1, mark: 0.45 });
  });
  it("throws again from lodged, pulling out first", () => {
    const t = new Timeline(REST);
    t.play(rethrowScene(t.state, 2));
    t.advance(PULL_MS);
    expect(t.state.blade).toBeLessThan(0.5);
    expect(isLodged(run(t))).toBe(true);
  });
  it("takes over mid-move without a jump", () => {
    const t = new Timeline(PLATE_ONLY);
    t.play(throwScene(2));
    t.advance(HIT_MS - 200);
    const before = t.state.flight;
    t.play(pullScene());
    t.advance(1);
    expect(Math.abs(t.state.flight - before)).toBeLessThan(0.01);
  });
  it("never overshoots", () => {
    const t = new Timeline(BLANK);
    t.play(introScene(2));
    for (let ms = 0; ms < 4000; ms += 8) {
      t.advance(8);
      for (const k of ["frame", "letters", "depth", "blade", "hit"] as const) expect(t.state[k]).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
  it("draws the finished logo whole, with nothing left over", () => {
    const v = view(REST);
    expect([...v.frame, ...v.letters, ...v.guides]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(v.blade.opacity).toBe(1);
    expect(v.flight.opacity).toBe(0);
    expect(v.target.opacity).toBe(0);
    expect(v.chips.every((c) => c.opacity === 0)).toBe(true);
  });
});
