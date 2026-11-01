import { describe, expect, it } from "vitest";
import { PALETTE_IDS, palettes, paletteCss, type Palette } from "@portfolio/design";

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

// Runs on every palette in the list, so a new one is checked without touching this file.
describe.each(PALETTE_IDS)("palette %s", (id) => {
  const p: Palette = palettes[id];

  it.each(["ink", "inkSoft", "line", "accent"] as const)("%s stays readable across the whole gradient", (name) => {
    const needed = { ink: 7, inkSoft: 4.5, line: 3, accent: 3 }[name];
    for (const stop of [...p.sky, p.paper]) expect(contrast(p[name], stop), `${name} on ${stop}`).toBeGreaterThanOrEqual(needed);
  });

  it("keeps selected text readable", () => {
    expect(contrast(p.paper, p.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("has a name to show people", () => {
    expect(p.name.length).toBeGreaterThan(0);
  });

  it("is written into the page CSS", () => {
    expect(paletteCss()).toContain(`[data-theme="light"][data-palette="${id}"]{--sky-0:${p.sky[0]}`);
  });
});
