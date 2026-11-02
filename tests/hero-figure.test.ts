import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fitHeight } from "../apps/web/src/scene/figure/fit-height";

const svg = readFileSync(new URL("../apps/web/public/hero-figure.svg", import.meta.url), "utf8");
const css = readFileSync(new URL("../apps/web/src/scene/scene.css", import.meta.url), "utf8");
const tsx = readFileSync(new URL("../apps/web/src/scene/figure/BatFigure.tsx", import.meta.url), "utf8");

describe("the figure's drawing", () => {
  it("has the layers the component stacks", () => {
    for (const id of ["back", "front"]) expect(svg).toContain(`<g id="${id}">`);
  });
  it("takes every shade from the theme, and each one is defined", () => {
    const shades = [...new Set([...svg.matchAll(/fill="var\(--(f\d),/g)].map((m) => m[1]))];
    expect(shades.length).toBeGreaterThanOrEqual(6);
    for (const shade of shades) expect(css).toContain(`--${shade}:`);
    expect(svg).not.toMatch(/fill="#/);
  });
  it("stays light", () => expect(svg.length).toBeLessThan(45_000));
  it("has the same box in the file and the component", () => {
    const box = /viewBox="([^"]+)"/.exec(svg)?.[1];
    expect(tsx).toContain(`"${box}"`);
  });
  it("doesn't move for someone who asked for less motion", () => {
    expect(css).toMatch(/no-preference\) \{\s*\.bat-figure \{ animation/);
  });
});

describe("fitHeight", () => {
  const limits = { min: 22, max: 52, clearance: 4 };
  it("takes the room there is, less the clearance", () => expect(fitHeight(40, limits)).toBe(36));
  it("stays within its limits", () => {
    expect(fitHeight(500, limits)).toBe(52);
    expect(fitHeight(10, limits)).toBe(22);
  });
  it("takes the largest size when nothing is above it", () => expect(fitHeight(undefined, limits)).toBe(52));
});
