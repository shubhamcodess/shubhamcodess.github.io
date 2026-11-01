import { siteSchema, type SiteConfig } from "@portfolio/content/schema";

/** Edit, push, deploy. */
const config = {
  name: "Shubham Prakash",
  description: "Shubham Prakash's corner of the internet.",
  background: { default: "dust", onLoad: "config" },
  scene: { fit: "street", face: "mist", density: "normal", reach: "mid", strength: "faint", contentFade: "mid", parallax: "low" },
  headerButton: { texture: "hatch", shadow: "br", hover: "none", press: "warp", sway: "off" },
  flags: { writing: false, photography: false, ask: false, motion: true, backgroundPanel: true },
} satisfies SiteConfig;

export const site = siteSchema.parse(config);
