import { siteSchema, type SiteConfig } from "@portfolio/content/schema";

/** Edit, push, deploy. */
const config = {
  name: "Shubham Prakash",
  description: "Shubham Prakash's corner of the internet.",
  background: { default: "storm", onLoad: "config" },
  scene: { fit: "behind", face: "clear", density: "dense", reach: "mid", strength: "clear", contentFade: "mid", parallax: "low" },
  headerButton: { texture: "hatch", shadow: "br", hover: "shadow", press: "keycap", sway: "off" },
  flags: { writing: false, photography: false, ask: false, motion: true, backgroundPanel: true },
} satisfies SiteConfig;

export const site = siteSchema.parse(config);
