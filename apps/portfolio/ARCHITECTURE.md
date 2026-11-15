# Architecture directives

> **Picking this up?** Read "Start here" at the end first. It lists what is waiting on the owner and what to do next.

How this app is built, and the rules that keep it lean and easy to change. For how it looks, see `DESIGN.md`.

## Commands

This is the live site. From the repository root, `pnpm dev`, `pnpm build`, `pnpm preview` and `pnpm check` all run it, and a push to `main` builds and publishes it to https://shubhamcodess.github.io (`.github/workflows/deploy.yml`: `pnpm check`, then `apps/portfolio/dist` to Pages). The earlier Gotham site in `apps/web` keeps its own commands, prefixed `web:` (`pnpm web:dev`, `pnpm web:build`, `pnpm web:check`), and is not deployed.

The build also writes `sitemap.xml`, `robots.txt` (pointing at the sitemap) and `404.html` (the home page). `site.url` in the config is the address they use.

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

```bash
pnpm --filter @portfolio/app format
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
| `src/lib` | Small hooks and helpers with no markup. `sound/` is the sound state and the Web Audio engine (loaded on first use) | `config` |
| `src/ui` | Reusable parts that know nothing about this site's content: `FolderCard`, `ActionLink`, `Icon`, `Reveal`, `LinkPreview`, and `light/` (the shader and its backdrop) | `lib`, `config` types |
| `src/layout` | Header and footer | `config`, `lib`, `ui` |
| `src/features/*` | One folder per part of the site: `hero`, `builds`, `project`, `experience`, `credentials`, `contact` | everything above |
| `scripts` | Build-time helpers that need the network. `fetch-credentials.mjs` reads the Credly wallet; `fetch-previews.mjs` saves the social preview of every outside link | `src/content/credentials-source.ts` |
| `public/data` | Data loaded at runtime, kept out of the bundle: `credentials.json`, `link-previews.json`. Written by the scripts, committed | nothing |
| `src/app` | `App.tsx` is the frame every page shares. `pages.tsx` loads each page as its own chunk | everything above |

Imports only go down this table. A feature never imports another feature. If two need the same thing, it moves to `ui` or `lib`.

## Rules

1. **Strict types, no escape hatches.** `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on. No `any`, no non-null `!`. Content and config use `as const satisfies`, so a typo in a slug or flag fails the build.
2. **Closed sets are unions.** Routes, build kinds, link kinds and themes are union types with a `Record` beside them. Adding a member makes the compiler list every place that needs it.
3. **Content is data.** Components never hold copy. A build is written once in `content/builds.ts` and feeds its card now and its page later.
4. **Config drives the site.** `config/site.ts` decides what is said, what is featured, how the light behaves and which parts are on. Turning a flag off must leave a complete page.
5. **Tokens only.** A component's CSS reads `var(--…)`. A new value is added to `tokens.css` first.
6. **One CSS file per component,** imported by that component, with class names prefixed by the component (`.folder__tab`, `.hero__name`).
   **A class used by more than one page goes in `styles/base.css`** (today: `.section`, `.section__*`, `.build-stack`, `.page-onward`, `.enter`, `.reveal-fill`). Pages load as separate chunks, so a style kept in one feature's file is missing on any page that doesn't import that feature. That is how the Experience page lost its heading spacing once.
7. **One page, one HTML file.** Each route has its own HTML entry that names its route in `data-route`. Project pages share `project/index.html`; the build writes one real file per build with its own title and description. Pages load directly, with no SPA fallback and no client router.
8. **Effects clean up.** Every observer, listener, animation frame and WebGL resource is released in its effect's cleanup.
9. **Progressive.** The page is complete without WebGL, with reduced motion, and on touch. Enhancements switch on only when they can run.
10. **Budget.** JavaScript stays under 90 kB gzipped and CSS under 10 kB. Check the build output before adding anything heavy.

## Adding things

**A build:** add its card data to `content/builds.ts` and its story to `content/build-stories.ts` (the compiler insists on both). Its page, card and filter group follow. To feature it, add its slug to `featured.slugs` in `config/site.ts` (five at most; the type enforces it). Then refresh the runtime data (credentials and link previews):

```bash
pnpm --filter @portfolio/app data
```

**A use case or recording for a build:** fill `useCase` in its entry in `content/build-stories.ts`, or `media` on the build in `content/builds.ts`. The page shows the section only when it exists.

**Something about life outside work:** edit `content/me.ts`. State outlines are in `content/state-maps.ts` (Karnataka, Jharkhand, Odisha), made from OpenStreetMap's boundaries (ODbL; credit kept in that file); a place is marked by latitude and longitude with `placeOn`. Add a state the same way. Put drawings, pictures or clips in `public/me/` and point `art` at them.

**A role, employer or recognition:** edit `content/experience.ts`. A new employer goes at the top of `employers`.

**Credentials** come from the Credly wallet. Earn a badge, then run `pnpm --filter @portfolio/app data` and commit `public/data`. What is left out, extras not on Credly, issuer names and order are in `content/credentials-source.ts`. Credly doesn't allow cross-site reads, so the fetch can't happen in the visitor's browser.

**A certificate for a recognition:** put the image in `public/certificates/` and set `certificate: 'certificates/<file>'` on that recognition. It then follows the pointer over the card. Any element can do the same with `data-hover-image` and `data-hover-title`.

**A page:**
1. Add its id to `RouteId` in `config/types.ts`, its entry to `routes` and its header links to `nav` in `config/site.ts`.
2. Add `<name>/index.html` with `data-route`, and list it in `vite.config.ts`.
3. Add its loader to `loadPage` in `app/pages.tsx`. The compiler flags this step if it's missed.

**A section on the home page:** build it as a feature folder, add its flag and copy to the config, and place it in `HomePage`.

**A design value:** add the token, then use it. Update `DESIGN.md` in the same change.

## The light

- `ui/light/coveLight.ts` is the shader and its WebGL2 setup. It returns `null` when WebGL2 isn't available, and the backdrop keeps its CSS glow.
- `ui/light/useLightScene.ts` runs one animation loop per backdrop. It writes `--light-pointer-x`, `--light-pointer-y` and `--light-scroll` on the backdrop's parent, and that parent's CSS decides what moves.
- `ui/light/LightBackdrop.tsx` is the component. The hero and the project title plate both use it.
- All tuning is `hero.light` in the config. Nothing is hard-coded in the shader except the shape of the scene.

## Known gaps

- **Content is rendered in the browser.** Before launch, pre-render each page to static HTML at build time, so search engines and AI readers get the content without running JavaScript. This is the one launch blocker.
- **JavaScript per page** (gzipped, everything a page downloads): home 89.0 kB, project 88.6, experience 81.7, builds 80.4, credentials 80.2. Budget 90 kB per page. React and the shared frame are 78 kB of that.
- **Long text stays out of shared code.** Each build's full story is in `content/build-stories.ts`, loaded only by project pages. Keep `content/builds.ts` to card data, because every page imports it. The sound engine is its own 1.5 kB chunk; the wiring and toggle are in the main bundle. Credentials and link previews are runtime JSON, not bundled. npm download totals are fetched live in the browser (`lib/npmDownloads.ts`, cached in localStorage), the one outside request the pages make. Split by page before adding anything heavy.
- **CSS is slightly over its 10 kB budget** (10.4 kB). Splitting it by page is the fix.
- **Credentials load after the page,** so they aren't in the HTML for search engines. Pre-rendering (below) should inline `public/data/credentials.json`.
- **Page transitions** use cross-document view transitions, which Firefox doesn't have yet. It simply navigates.
- **No automated tests or gates yet,** by the owner's choice for now. The repository's responsive and performance gates still point at `apps/web`.
- **No content security policy, sitemap or social image yet.** Add them with the deploy setup.
- **Font subsets.** Fontsource ships every script. Only the Latin files are ever downloaded, but the others still sit in `dist`.
- **Motion was tuned by reading values, not by long viewing.** The preview pane used during the build stalls animations. Swing, reveal and transition timings are all tokens or config, so they are quick to adjust by eye.

## Start here

State on 2026-11-15: every page in `DESIGN.md` is built, typed, formatted and committed locally. Nothing is deployed, and nothing has been pushed.

**How the owner works:** one piece at a time, short bulleted replies, real content only, no AI attribution in commits. They decide by looking at the running site, on desktop and phone.

**Waiting on the owner:**

| Item | Where it goes |
|---|---|
| Check the tools list | `content/tools.ts`. Spring Boot and Vercel were added on the owner's word |
| One title everywhere? | Today: hero "Cloud Full Stack Developer" (`hero.role`), experience "Sr. Cloud Full Stack Developer", badge "AI Engineer" (`contact.badge.role`). The badge title is the owner's choice |
| Recordings or motion graphics per build | `media` on the build in `content/builds.ts` |
| Use-case write-ups | `useCase` on the build in `content/build-stories.ts` |
| Whether to list career-os, lets-dsa and 90-days-challenge | Left out so far, because they point at job hunting |
| Whether this app replaces `apps/web` | Decisions 001 and 003 in `docs/decisions` still describe the old site |

**Suggested order of work:**

1. Static pre-render (see Known gaps).
2. Point the responsive and performance gates at this app, and add the content security policy.
3. Recordings into the project stage, and onto the featured cards' plates.
4. An About section, once its content is agreed.

**Small things worth knowing:**

- The preview pane in the desktop app stalls CSS transitions and `requestAnimationFrame`. To test scroll-driven code there, stand in a timer: `window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16)`.
- **First paint:** the app script is render-blocking (`blocking="render"`, kept in the build by a step in `vite.config.ts`), and `main.tsx` waits up to 250ms for the fonts, then renders synchronously with `flushSync`. The browser shows each page only once it is fully drawn, which is what lets the page transition fade between two complete pages. Don't make the first render async.
- In the preview pane, page transitions log "Transition was aborted … Page already revealed" because the pane doesn't paint frames. Real Chrome doesn't.
- **Shared state** (theme, sound, current section) lives in small stores read with `useSyncExternalStore`, so the header and footer switches always agree. Theme and sound re-read storage on `pageshow`, because Back and Forward restore pages as they were left.
- The preview pane in the desktop app stalls CSS transitions. A blank area in a screenshot is usually an entrance that has not played, not a bug. Check with a real browser.
- `pnpm data` needs the network, and npm, LinkedIn and Product Hunt refuse automated reads, so those links have no hover card.
- **Colours:** `theme.palette` in `config/site.ts` is `'signature'` or `'plain'`. The build writes it onto `<html data-palette>`; `tokens.css` does the rest. The shader reads `--night-surface`, which must stay a six-digit hex.
- The certificate in `public/certificates/` shows three signatories' names. It is public once the repository is.
- The portrait is `src/assets/portrait.webp`, with a transparent background. Replace the file to change it.
- `site.routes` lists real pages only. Project pages are made from `project/index.html` by the plugin in `vite.config.ts`.
