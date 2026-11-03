import { describe, expect, it } from "vitest";
import { siteSchema } from "../packages/content/src/schema";
import { CARD_OPTIONS, DEFAULT_CARD_DESIGN } from "../packages/design/src/components/project-card/options";
import { site } from "../content/site";

describe("the card design setting", () => {
  it("is one setting, for every card", () => {
    expect(site.cards).toEqual({ face: "clear", plate: "drafting", hatch: "text" });
    expect(DEFAULT_CARD_DESIGN).toEqual(site.cards);
  });
  it("only takes the listed options", () => {
    expect(siteSchema.safeParse({ ...site, cards: { ...site.cards, face: "glass" } }).success).toBe(false);
    for (const face of CARD_OPTIONS.face) expect(siteSchema.safeParse({ ...site, cards: { ...site.cards, face } }).success).toBe(true);
  });
  it("lets a featured card use any layout", () => {
    for (const layout of CARD_OPTIONS.layout) {
      const items = site.shipped.items.map((item) => ({ ...item, layout }));
      expect(siteSchema.safeParse({ ...site, shipped: { ...site.shipped, items } }).success).toBe(true);
    }
  });
});
