import { afterEach, describe, expect, it, vi } from "vitest";
import { backgroundBootScript, PALETTE_IDS, selectors, type BackgroundContext } from "@portfolio/design";

const context: BackgroundContext = { current: "dust", configured: "smog", list: ["dust", "sodium", "smog", "storm"] };

describe("selectors", () => {
  afterEach(() => vi.restoreAllMocks());

  it("config returns the configured palette", () => {
    expect(selectors.config(context)).toBe("smog");
  });

  it("next moves along the list and wraps around", () => {
    expect(selectors.next(context)).toBe("sodium");
    expect(selectors.next({ ...context, current: "storm" })).toBe("dust");
  });

  it("random never returns the current palette", () => {
    for (const roll of [0, 0.5, 0.999]) {
      vi.spyOn(Math, "random").mockReturnValue(roll);
      expect(selectors.random(context)).not.toBe("dust");
    }
  });
});

describe("boot script", () => {
  const store = (initial: Record<string, string> = {}) => {
    const data = { ...initial };
    return { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v), data };
  };
  const run = (onLoad: "config" | "random", local = store(), session = store(), roll = 0) => {
    const root = { dataset: { palette: "dust" } };
    const math = Object.create(Math, { random: { value: () => roll } });
    new Function("document", "localStorage", "sessionStorage", "Math", backgroundBootScript(onLoad))({ documentElement: root }, local, session, math);
    return root.dataset.palette;
  };

  it("leaves the configured palette alone by default", () => {
    expect(run("config")).toBe("dust");
  });

  it("uses a visitor's stored choice, in either mode", () => {
    const stored = () => store({ "background-selection": "storm" });
    expect(run("config", stored())).toBe("storm");
    expect(run("random", stored())).toBe("storm");
  });

  it("ignores a stored palette that no longer exists", () => {
    expect(run("config", store({ "background-selection": "removed" }))).toBe("dust");
  });

  it("random picks once per visit and holds it", () => {
    const session = store();
    expect(run("random", store(), session, 0.99)).toBe(PALETTE_IDS[PALETTE_IDS.length - 1]);
    expect(run("random", store(), session, 0)).toBe(PALETTE_IDS[PALETTE_IDS.length - 1]);
  });
});
