import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const design = matter(readFileSync("DESIGN.md", "utf8")).data as {
  colors: Record<"dark", Record<string, string>>;
  motion: Record<string, unknown>;
};
const css = readFileSync("packages/design/src/tokens.css", "utf8");

const block = (selector: string) => {
  const start = css.indexOf(selector);
  expect(start, selector).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("}", start));
};
const value = (scope: string, name: string) => scope.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];

describe("tokens.css matches DESIGN.md", () => {
  it("dark colors", () => {
    const scope = block('[data-theme="dark"]');
    for (const [name, expected] of Object.entries(design.colors.dark)) expect(value(scope, name), name).toBe(expected);
  });

  it("motion", () => {
    const scope = block(":root");
    expect(value(scope, "ease-soft")).toBe(design.motion.soft);
    for (const name of ["small-part", "frame", "shadow", "texture", "icon", "press", "theme-fade"]) expect(value(scope, `dur-${name}`), name).toBe(design.motion[name]);
  });
});
