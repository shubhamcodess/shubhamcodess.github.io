import { describe, expect, it } from "vitest";
import { SCENE_OPTIONS } from "@portfolio/content/scene-options";
import { MIX_BAG } from "../apps/web/src/scene/gotham/buildings";
import { alpha, mix, seeded } from "../apps/web/src/scene/gotham/color";
import { LAYERS, SCENE_VALUES } from "../apps/web/src/scene/gotham/engine";
import { LANDMARKS, type Landmark } from "../apps/web/src/scene/gotham/landmarks";

describe("Gotham scene", () => {
  it("every setting option means a number", () => {
    for (const [key, values] of Object.entries(SCENE_VALUES)) {
      expect(Object.keys(values).sort()).toEqual([...SCENE_OPTIONS[key as keyof typeof SCENE_OPTIONS]].sort());
    }
  });

  it("the city is the same on every visit", () => {
    const a = seeded(7), b = seeded(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("every landmark sits on a layer that exists, and Wayne Tower is there", () => {
    const layers = LAYERS.map((l) => l.id);
    for (const m of Object.values(LANDMARKS) as Landmark[]) expect(layers).toContain(m.layer);
    expect(LANDMARKS.wayne.layer).toBe("hero");
  });

  it("layers run far to near, getting darker", () => {
    for (let i = 1; i < LAYERS.length; i++) {
      expect(LAYERS[i]!.z).toBeGreaterThan(LAYERS[i - 1]!.z);
      expect(LAYERS[i]!.ink).toBeGreaterThan(LAYERS[i - 1]!.ink);
    }
  });

  it("spires stay the minority of the skyline", () => {
    const pointy = MIX_BAG.filter((k) => ["deco", "gothic", "pyramid", "needle"].includes(k)).length;
    expect(pointy / MIX_BAG.length).toBeLessThan(0.3);
  });

  it("color helpers", () => {
    expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(alpha("#102030", 0.5)).toBe("rgba(16,32,48,0.5)");
  });
});
