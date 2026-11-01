import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/* Browser parts follow the design, so the native `title` tooltip stays out. */
const tsx = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? tsx(join(dir, e.name)) : e.name.endsWith(".tsx") ? [join(dir, e.name)] : []));

describe("native browser parts", () => {
  it.each([...tsx("apps/web/src"), ...tsx("packages/design/src")])("%s has no native title tooltip", (file) => {
    expect(readFileSync(file, "utf8")).not.toMatch(/\stitle=[{"]/);
  });
});
