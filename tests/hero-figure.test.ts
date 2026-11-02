import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const svg = readFileSync(new URL("../apps/web/public/hero-figure.svg", import.meta.url), "utf8");

describe("the hero figure", () => {
  it("is one closed outline, so a mask of it has no holes or stray pieces", () => {
    expect(svg.match(/<path/g)).toHaveLength(1);
    const outline = svg.match(/ d="([^"]+)"/)?.[1] ?? "";
    expect(outline.match(/[Mm]/g)).toHaveLength(1);
    expect(outline.endsWith("z")).toBe(true);
  });
  it("stays small", () => {
    expect(svg.length).toBeLessThan(10_000);
  });
});
