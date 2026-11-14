import type { SiteConfig } from './types'

/** The one place to change what the site says and which parts are on. */
export const site = {
  owner: 'Shubham Prakash',
  monogram: 'SP',
  theme: { default: 'light', storageKey: 'portfolio-theme' },
  routes: {
    home: { path: '', label: 'Home', title: 'Shubham Prakash | Cloud Full Stack Developer' },
    builds: { path: 'builds/', label: 'Builds', title: 'All builds | Shubham Prakash' },
  },
  nav: ['builds'],
  hero: {
    name: ['Shubham', 'Prakash'],
    role: 'Cloud Full Stack Developer',
    employer: 'IBM',
    statement: '6 years of shipping enterprise applications, scaling them in production, and building AI tools.',
    actions: [
      { label: 'Featured builds', to: '#featured' },
      { label: 'All builds', to: 'builds' },
    ],
    light: {
      intensity: 0.5,
      lanes: { wide: 64, narrow: 26 },
      speed: 0.4,
      horizon: 0.34,
      wallWidth: { wide: 0.26, narrow: 0.46 },
      floorPerspective: 0.11,
      cornerRadius: 0.016,
      cool: [0.02, 0.36, 1],
      warm: [1, 0.3, 0.02],
      warmShare: 0.18,
      nearFade: 0.8,
      maxPixelRatio: 1.5,
      parallax: { pointerLight: 0.03, pointerContent: 6, scrollLight: 0.35 },
    },
  },
  featured: {
    id: 'featured',
    title: 'Featured builds',
    lead: 'Open source tools I designed, built and shipped.',
    slugs: ['mcp-token-optimizer', 'whatcmd', 'everything-tech'],
    seeAll: 'See all builds',
  },
  buildsPage: {
    title: 'All builds',
    lead: 'Every public project I have shipped. Each one links to its code.',
  },
  socials: [
    { label: 'GitHub', href: 'https://github.com/shubhamcodess' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shubham-prakash-dev/' },
  ],
  features: {
    themeToggle: true,
    heroLight: true,
    heroParallax: true,
    featured: true,
    buildsPage: true,
    footer: true,
  },
} as const satisfies SiteConfig
