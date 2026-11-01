import { describe, expect, it } from "vitest";
import { nextRevealState } from "../packages/design/src/components/scroll-motion/engine";
import { seededWaits } from "../packages/design/src/components/rotating-text/seeded";

describe("seededWaits", () => {
  it("repeats for the same seed and stays in range", () => {
    const a = seededWaits(7, 3200, 5600), b = seededWaits(7, 3200, 5600);
    const first = Array.from({ length: 50 }, a);
    expect(first).toEqual(Array.from({ length: 50 }, b));
    for (const w of first) { expect(w).toBeGreaterThanOrEqual(3200); expect(w).toBeLessThanOrEqual(5600); }
    expect(new Set(first).size).toBeGreaterThan(10);
  });
  it("differs by seed", () => {
    expect(seededWaits(1, 0, 1000)()).not.toBe(seededWaits(2, 0, 1000)());
  });
});

describe("nextRevealState", () => {
  it("follows a block through the screen", () => {
    expect(nextRevealState(undefined, 900, 1200, 800)).toBe("below");
    expect(nextRevealState("below", 400, 700, 800)).toBe("in");
    expect(nextRevealState("in", -700, 60, 800)).toBe("above");
  });
  it("holds its state between thresholds, so it can't flicker", () => {
    expect(nextRevealState("below", 700, 1000, 800)).toBe("below");
    expect(nextRevealState("in", 700, 1000, 800)).toBe("in");
  });
});
