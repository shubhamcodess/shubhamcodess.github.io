import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { currentScene, figurePresence, frameLook, lineProgress, sceneLook, sceneTarget } from "../apps/web/src/scene/story-motion";
import { TOOL_LOGOS } from "../apps/web/src/scene/tool-logos";
import { TOOLS } from "../packages/content/src/schema";
import { site } from "../content/site";

const COUNT = 4;

describe("the story's scenes", () => {
  it("opens on the first scene, and ends on the last", () => {
    expect(sceneLook(0, 0, COUNT).opacity).toBe(1);
    expect(sceneLook(0, 1, COUNT).opacity).toBe(0);
    expect(sceneLook(1, COUNT - 1, COUNT).opacity).toBe(1);
    expect(sceneLook(1, 0, COUNT).opacity).toBe(0);
  });
  it("holds each scene sharp in the middle of its slot, to be read", () => {
    for (let i = 0; i < COUNT; i++) {
      const look = sceneLook((i + 0.5) / COUNT, i, COUNT);
      expect(look.opacity).toBe(1);
      expect(look.blur).toBe(0);
    }
  });
  it("keeps moving while it holds", () => {
    expect(sceneLook(1.35 / COUNT, 1, COUNT).scale).not.toBe(sceneLook(1.65 / COUNT, 1, COUNT).scale);
  });
  it("blurs on the way in and the way out", () => {
    expect(sceneLook(1.05 / COUNT, 1, COUNT).blur).toBeGreaterThan(5);
    expect(sceneLook(1.95 / COUNT, 1, COUNT).blur).toBeGreaterThan(5);
  });
  it("never shows two scenes fully at once", () => {
    for (let p = 0; p <= 1; p += 0.002) {
      const shown = [0, 1, 2, 3].map((i) => sceneLook(p, i, COUNT).opacity);
      expect(shown.filter((o) => o > 0.5).length).toBeLessThanOrEqual(1);
    }
  });
});

describe("the frame", () => {
  it("comes out of the haze as the section arrives, and is sharp once pinned", () => {
    expect(frameLook(900, 5000, 900).opacity).toBe(0);
    expect(frameLook(900, 5000, 900).blur).toBeGreaterThan(10);
    expect(frameLook(0, 4000, 900)).toMatchObject({ opacity: 1, blur: 0 });
  });
  it("goes back into it as the section leaves", () => {
    expect(frameLook(-4000, 900, 900).opacity).toBe(1);
    expect(frameLook(-4600, 300, 900).opacity).toBe(0);
  });
});

describe("the line and the figure", () => {
  it("only draws forward, and finishes as the last scene arrives", () => {
    let last = -1;
    for (let p = 0; p <= 1; p += 0.01) { const v = lineProgress(p, COUNT); expect(v).toBeGreaterThanOrEqual(last); last = v; }
    expect(lineProgress(1, COUNT)).toBe(1);
  });
  it("reaches each stop as its scene arrives", () => {
    for (let i = 1; i < COUNT; i++) expect(lineProgress((i + 0.3) / COUNT, COUNT)).toBeCloseTo(i / (COUNT - 1), 5);
  });
  it("keeps the figure back until the story reaches now", () => {
    expect(figurePresence(0.5, COUNT)).toBe(0);
    expect(figurePresence(1, COUNT)).toBe(1);
  });
});

describe("the jump points", () => {
  it("land on a scene that's fully there and sharp", () => {
    for (let i = 0; i < COUNT; i++) {
      const look = sceneLook(sceneTarget(i, COUNT), i, COUNT);
      expect(look.opacity).toBe(1);
      expect(look.blur).toBe(0);
      expect(currentScene(sceneTarget(i, COUNT), COUNT)).toBe(i);
    }
  });
});

describe("the section's rules", () => {
  const scss = readFileSync(new URL("../apps/web/src/scene/sections.css", import.meta.url), "utf8");
  it("only the page column sets a section's width", () => {
    expect(scss).not.toMatch(/\.(sec|story)[^{]*\{[^}]*max-width/);
    expect(scss).not.toMatch(/\.story \{[^}]*--line:/);
  });
  it("starts with words on the line and uses batarangs after, so the line has no other years", () => {
    expect(site.story.scenes[0]?.stop.kind).toBe("text");
    for (const scene of site.story.scenes.slice(1)) expect(scene.stop.kind).toBe("batarang");
  });
  it("has a logo for every tool", () => {
    for (const tool of TOOLS) expect(TOOL_LOGOS[tool].plan.length).toBeGreaterThan(0);
  });
});

describe("the story's words", () => {
  const all = JSON.stringify(site.story).toLowerCase();
  it("ends on what the role is now, matching the hero", () => {
    expect(site.story.scenes.at(-1)?.label).toBe("Now");
    expect(site.story.scenes.at(-1)?.title).toContain("Full Stack Developer");
  });
  it("carries one year only: the first stop", () => {
    expect(all.match(/\b(19|20)\d\d\b/g)).toEqual(["2020"]);
  });
  it("names IBM, and no client or internal system", () => {
    expect(all).toContain("ibm");
    // Hashes, not the names, because this repo is public and the names must not appear in it either.
    const hidden = new Set(["0e79172671f59f0f", "6855dad1c26a92d0", "1a727e83b046c986", "455dff638c8afb68", "e46b872ecbe3732b", "8d72d50dab35c20e", "382b6f65659bc4bd", "741c2580f44aba0e", "4fa1a13ac468ac49", "567c11cc2dd7ae17", "8bec8757f662f0f3", "846be5fc541c5039"]);
    for (const word of all.match(/[a-z0-9]+/g) ?? []) expect(hidden.has(createHash("sha256").update(word).digest("hex").slice(0, 16))).toBe(false);
  });
  it("leaves out what must never be published", () => {
    for (const word of ["salary", "ctc", "notice period", "laid off", "open to work", "looking for"]) expect(all).not.toContain(word);
  });
});
