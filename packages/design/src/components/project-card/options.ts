/** Every choice a card has. No CSS here, so the content schema can read it. Set them once in `cards` in content/site.ts; each card picks only its `layout`. */
export const CARD_OPTIONS = {
  /** What's behind the words. `clear`: the page shows through. `frost`: a soft sheet of paper. */
  face: ["clear", "frost"],
  /** What's behind the drawing. `drafting`: a grid rising from the bottom over a low wash of paper. `grid`: an even grid all over. `none`: nothing. */
  plate: ["drafting", "grid", "none"],
  /** Where the frame's rising hatch goes. `text`: only behind the words, never the drawing. `whole`: across the whole card. */
  hatch: ["text", "whole"],
  /** `vertical`: drawing over words. `horizontal`: side by side. `wide`: a wide drawing over words on the left and links on the right, for a card spanning columns. A narrow card always stacks. */
  layout: ["vertical", "horizontal", "wide"],
} as const;

export type CardDesign = { face: (typeof CARD_OPTIONS.face)[number]; plate: (typeof CARD_OPTIONS.plate)[number]; hatch: (typeof CARD_OPTIONS.hatch)[number] };
export type CardLayout = (typeof CARD_OPTIONS.layout)[number];
export const DEFAULT_CARD_DESIGN: CardDesign = { face: "clear", plate: "drafting", hatch: "text" };
