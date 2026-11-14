# Architecture directives

How this app is built, and the rules that keep it lean and easy to change. For how it looks, see `DESIGN.md`.

## Commands

Run from the repository root.

```bash
pnpm --filter @portfolio/app dev
```

```bash
pnpm --filter @portfolio/app build
```

```bash
pnpm --filter @portfolio/app typecheck
```

The dev server is on port 5180. `build` type-checks first and writes static files to `apps/portfolio/dist`.

## Stack

- Vite, React 19 and TypeScript, with plain CSS. Fonts are self-hosted through Fontsource.
- Runtime dependencies are React and the two fonts. Adding one is a decision: write down why here.
- No router, state library, CSS framework, animation library or icon package. Each was cheaper to do without.
- Output is static files for any static host. `PORTFOLIO_BASE` sets the path the site is served from.

## Folders

| Path | Owns | May import from |
|---|---|---|
| `src/config` | The site config and its types: copy, routes, featured builds, light tuning, feature flags | `content` |
| `src/content` | Typed content. `builds.ts` is the one source for every build | nothing |
| `src/styles` | `tokens.css` (all design values) and `base.css` (reset, frame, shared helpers) | nothing |
| `src/lib` | Small hooks and helpers with no markup | `config` |
| `src/ui` | Reusable parts that know nothing about this site's content: `FolderCard`, `ActionLink`, `Icon` | `lib` |
| `src/layout` | Header and footer | `config`, `lib`, `ui` |
| `src/features/*` | One folder per part of the site: `hero`, `builds` | everything above |
| `src/app` | Puts pages together and picks the page for a route | everything above |

Imports only go down this table. A feature never imports another feature. If two need the same thing, it moves to `ui` or `lib`.

## Rules

1. **Strict types, no escape hatches.** `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on. No `any`, no non-null `!`. Content and config use `as const satisfies`, so a typo in a slug or flag fails the build.
2. **Closed sets are unions.** Routes, build kinds, link kinds and themes are union types with a `Record` beside them. Adding a member makes the compiler list every place that needs it.
3. **Content is data.** Components never hold copy. A build is written once in `content/builds.ts` and feeds its card now and its page later.
4. **Config drives the site.** `config/site.ts` decides what is said, what is featured, how the light behaves and which parts are on. Turning a flag off must leave a complete page.
5. **Tokens only.** A component's CSS reads `var(--…)`. A new value is added to `tokens.css` first.
6. **One CSS file per component,** imported by that component, with class names prefixed by the component (`.folder__tab`, `.hero__name`).
7. **One page, one HTML file.** Each route has its own HTML entry that names its route in `data-route`. Pages load directly, with no SPA fallback and no client router.
8. **Effects clean up.** Every observer, listener, animation frame and WebGL resource is released in its effect's cleanup.
9. **Progressive.** The page is complete without WebGL, with reduced motion, and on touch. Enhancements switch on only when they can run.
10. **Budget.** JavaScript stays under 90 kB gzipped and CSS under 10 kB. Check the build output before adding anything heavy.

## Adding things

**A build:** add one object to `content/builds.ts`. To feature it, add its slug to `featured.slugs` in `config/site.ts`.

**A page:**
1. Add its id to `RouteId` in `config/types.ts`, and its entry to `routes` in `config/site.ts`.
2. Add `<name>/index.html` with `data-route`, and list it in `vite.config.ts`.
3. Add its component to `pages` in `app/App.tsx`. The compiler flags this step if it's missed.

**A section on the home page:** build it as a feature folder, add its flag and copy to the config, and place it in `HomePage`.

**A design value:** add the token, then use it. Update `DESIGN.md` in the same change.

## The hero light

- `features/hero/coveLight.ts` is the shader and its WebGL2 setup. It returns `null` when WebGL2 isn't available, and the hero keeps its CSS backdrop.
- `features/hero/useHeroScene.ts` runs the single animation loop. It writes `--hero-pointer-x`, `--hero-pointer-y` and `--hero-scroll` on the hero, and `hero.css` decides what moves.
- All tuning is `hero.light` in the config. Nothing is hard-coded in the shader except the shape of the scene.

## Known gaps

- **Content is rendered in the browser.** Before launch, pre-render each page to static HTML at build time, so search engines and AI readers get the content without running JavaScript.
- **No automated tests or gates yet.** The repository's responsive and performance gates still point at `apps/web`. They should be pointed here once this app becomes the deployed site.
- **No content security policy, sitemap or social image yet.** Add them with the deploy setup.
- **Font subsets.** Fontsource ships every script. Only the Latin files are ever downloaded, but the others still sit in `dist`.
