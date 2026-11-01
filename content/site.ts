import { siteSchema, type SiteConfig } from "@portfolio/content/schema";

/** Edit, push, deploy. */
const config = {
  name: "Shubham Prakash",
  description: "Shubham Prakash's corner of the internet.",
  background: { default: "oldGotham", onLoad: "config" },
  scene: { face: "clear", contentFade: "mid", depth: "big", sway: "full", haze: "full", dust: "full", density: "normal", reach: "mid", word: "faint" },
  headerButton: { texture: "hatch", shadow: "br", hover: "shadow", press: "keycap", sway: "off" },
  flags: { writing: false, photography: false, ask: false, motion: true, backgroundPanel: true },
} satisfies SiteConfig;

export const site = siteSchema.parse(config);
