import { siteSchema, type SiteConfig } from "@portfolio/content/schema";

/** Edit, push, deploy. Section order here is the order on the page. */
const config = {
  name: "Shubham Prakash",
  description: "Shubham Prakash's corner of the internet.",
  sections: [
    { id: "home", enabled: true },
    { id: "about", enabled: true },
    { id: "experience", enabled: true },
    { id: "projects", enabled: true },
    { id: "now", enabled: true },
    { id: "contact", enabled: true },
  ],
  flags: { writing: false, photography: false, ask: false, motion: true },
  social: [
    { label: "GitHub", href: "https://github.com/shubhamcodess" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shubham-prakash-dev/" },
  ],
} satisfies SiteConfig;

export const site = siteSchema.parse(config);
