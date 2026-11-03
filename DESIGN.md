---
name: Blueprint
status: growing
modes: [light, dark]
default-mode: light
palettes: packages/design/src/palettes.ts
colors:
  dark:  { base: "#0b0e15", paper: "#10141e", ink: "#e4e8ef", ink-2: "#99a4b6", line: "#a9bfdf", line-rest: "rgba(169,191,223,.72)", accent: "#e6b044", grid: "rgba(169,191,223,.075)" }
type:
  label: { family: "Geist", weight: 500, transform: uppercase, tracking: .07em, size: 14.5px }
  title: { family: "Geist", weight: 500, tracking: -.035em }
  body:  { family: "Geist", weight: 400 }
  note:  { family: "Geist Mono", weight: 500, size: 11px, tracking: .06em }
motion:
  soft: "cubic-bezier(.22,.61,.36,1)"
  expo: "cubic-bezier(.16,1,.3,1)"
  small-part: .3s
  frame: .6s
  shadow: .65s
  texture: .85s
  icon: .95s
  press: .18s
  theme-fade: 1.4s
  sway: { amplitude: .7px, duration: 900ms }
drawing:
  hatch: "135deg, 1px line, 5px gap (6px on cards)"
  plate-grid: 22px
  focus: "1.5px dashed accent"
---

# Blueprint design system

This is the single source for how anything on this site looks and moves. The values above are the tokens. The rest explains how to use them.

## How it stays current

The user does not maintain this file. Claude does, as part of building.

1. **Before building any UI,** read this file. Reuse its tokens and rules, so a new component already looks like the rest. Also apply `docs/decisions/011-quality-bar.md` and `012-component-library.md`.
2. **Build it** as a new numbered prototype, and show it to the user.
3. **When the user approves it,** add an entry under Components in the same piece of work: its parts, states, values and rules.
4. **If it needs something new,** like a color or a timing, add it to the tokens. Don't leave one-off values in a component.
5. **If a rule or token changes,** update this file first, then every production use of it. Old prototypes stay as they were, as a record.

Each entry has a status: **Draft** (being tried), **Approved** (the user said yes, small tweaks expected) or **Locked** (changes only by decision).

## Daylight environment: Locked

Light mode is the default. Its colors are not in this file: they're in `packages/design/src/palettes.ts`, the one list of themes, currently Dust, Sodium, Smog, Storm and Old Gotham. Every theme has the same structure.

- **Sky:** a four-stop gradient, lightest at the top, running slightly off vertical.
- **Sun:** a soft glow at the top right.
- **Grain:** film grain that lightens and darkens equally, so it never lowers contrast.
- **Switching themes:** a slow fade over `theme-fade`, never a snap. A page opens in its theme without fading into it.

Components read colors only from the tokens (`--ink`, `--line`, `--accent` and so on), so they work in every theme. To add or change a theme, use the `blueprint-palette` skill.

The Dark mode colors above are from the prototypes and aren't final.

## Principles

- **Drafted, not decorated.** Things look like technical drawings: thin lines, sharp corners, nothing rounded.
- **Lines run past corners.** Frames are four separate drafting lines that overshoot, not a border.
- **Clear faces.** Surfaces are outlines, and the page shows through.
- **Texture rises and fades.** Hatching starts at the bottom edge and is gone before it reaches the text.
- **Shadows are wireframes.** A shadow is a second outline with lines joining the corners, not a blur.
- **Hand in the drawing, not in the type.** Icons and drawings wobble slightly. Text is always a clean font: Geist everywhere, Geist Mono for small labels.
- **Amber is rare.** One or two touches per element, so it keeps its meaning.
- **Soft motion.** Slow, smooth and without overshoot. Nothing shakes or bounces, and motion is a function of time.
- **Browser parts belong to the design.** Anything the browser would draw itself gets our own version as it comes up. Done so far: scrollbar, tooltips, text selection. Never use a native `title`.
- **Real facts only.** Every word and number on a component is true.

**Never use:** rounded corners, drop-shadow blurs, purple or blue gradients, tag-pill clusters, stock icon sets, emoji as icons, fade-up on every element, or copy with no fact behind it.

**Frost** (blurring what's behind a surface) is the one allowed glass effect, and only where a component sits over the busy cave or floats in the header. It should look like smoke in the air, not like a glass panel.

## Page layout
- **One column.** Every section below the hero, on every page, sits on `--col-left` and `--col-w` (`.page-col`, tokens in `tokens.css`). At most 1480px wide; on wide screens it centers, below that it starts after the rail and keeps half a rail clear on the right. No section sets its own width or side padding.
- **The header and the hero stay on `--gutter`,** the wider edge, by the user's choice.
- **Rhythm:** every section has `--sec-pad` above and below, and `--sec-gap` between its heading and its content. Every section opens the same way: kicker on a dimension line, two-tone heading, then content.
- **The rail:** from 1100px wide, the column keeps space clear on its left for in-page links, later.
- `pnpm responsive` fails if the sections' left edges differ at any width.

## Components

### Button: Approved
Code: `packages/design/src/components/button`. The options are listed once in `options.ts`, and the types, config and control panel all read that list. Everything runs on CSS, except one small page-wide listener (`press.tsx`) that keeps a quick press on screen, which CSS can't do. Prototype: `prototypes/05-button-soft`, whose press has since been replaced, and whose hover movement is now optional.

- **Parts:** base wireframe, three corner lines, and the cap, which holds the texture, fold lines, frame, sketched icon and label.

| Input | Options | Default |
|---|---|---|
| `variant` | primary (texture .3, amber icon), secondary (texture .15), quiet (no texture, underline until hovered) | primary |
| `size` | sm 38px, md 46px, lg 60px, all with a 46px minimum touch area | md |
| `texture` | hatch, dots, grid, fade | hatch |
| `shadow` | Which way the cap sinks: br, bl, tr, tl | br |
| `hover` | none, shadow | none |
| `press` | warp, keycap, drop, none | warp |
| `sway` | off, soft, softer | off |
| `face` | clear, frost. Leave it out to inherit `--bp-face` and `--bp-face-filter` from around the button. | clear |
| `iconHover` | none, redraw (the pen draws the main line again over the faint second line, which stays as the sketch), trace (the whole icon goes and is drawn again, main line first and the second pass a beat behind). Leave it out to inherit the site's default. | trace |
| `textHover` | none, glitch (a quick, settling flicker, on the label only), grow (a soft scale up and back). Leave it out to inherit the site's default. | grow |
| `icon`, `href`, `as`, `disabled`, `className`, `style` | Icon name, link target, link component, disabled state, and one-place changes | |

| State | What happens |
|---|---|
| Rest | Corner overshoot 4px, texture rises 62% |
| Hover | The cap stays still. Overshoot 6px, texture rises 92%, frame brightens. `iconHover` and `textHover` (below) add their own motion. |
| Hover, `shadow` | Also, the wireframe slides out from the still cap |
| Press, `keycap` | Like a key going down. The cap sinks onto a wireframe base that appears under it, in `press` (.18s), and comes back over .55s. A press shows for at least .24s, however quick the click. |
| Press, `warp` | The same keycap sink, while the texture folds inward like a pressed sheet of blueprint, along creases from each corner to the center. Each side of the fold shades differently, and the label sinks slightly. Released slowly over 1.25s. |
| Press, `drop` | The cap drops into its shadow, with no fold, and returns quickly |
| Keyboard focus | Same as hover, plus a dashed amber line 12px clear of the button |
| Disabled | Dashed frame, no texture or shadow, muted text |

- **Rule:** the redraw is a real draw-on, so the main line does go for a moment, but an icon never ends up blank. At rest every line is whole, whatever the pen was doing. If the hover ends part way, the unfinished strokes finish themselves over `small-part`. A browser that can't animate the values skips the motion and keeps the whole line.
- **The pen:** the ink lifts over `press`, then the pen draws for `icon`, one stroke at a time in the order they're listed in `icons.ts`, at a steady pace set by each stroke's length. Each stroke eases on its own, there's a small beat between strokes, and a short mark still gets enough time to read. It works on a button and on a `SketchIcon` on its own, which redraws when hovered itself. Nothing shakes or sways the icon.
- **Rule:** `textHover` only ever touches the label.
- **Rule:** a press has to show on any click. `:active` alone misses a trackpad tap or a short click on a busy page, so `press.tsx` adds `data-pressing` for .24s. It responds to pointer down for a mouse or pen, and to the click for touch (so a scroll doesn't press) and for the keyboard.
- **Rule:** hover and press are separate values, so each moves at its own speed. All of them share one `transition` list, and options change speeds through `--bp-p-dur` and `--bp-p-ease`, so an option can't drop a value from it.
- **Rule:** the label's `textHover` grow is a transform (`scale`), never `font-size`, so it can't shift a neighbouring button.
- **Icon and text hover motion:** `iconHover` and `textHover` ease with the motion tokens, on and off, never a linear jump. Both run only on `hover:hover` pointers; keyboard focus gets the label motion too, since it isn't tied to a pointer. The site sets one default for every button (`buttonMotion` in `content/site.ts`, as a data attribute on the page's root); any button can still set its own.
- **Reduced motion:** state changes are instant and the texture doesn't fold, and a press still shows. The icon and text hover motion don't run at all, rather than just losing their animation.

**Own icon:** `glyph` takes any icon in place of a sketched `icon`. A button with no text needs an `aria-label`. `SketchIcon` draws a sketched icon on its own.

### Header logo: Approved
Code: `apps/web/src/scene/SiteLogo.tsx`, with the geometry in `logo-drawing.ts` and the motion in `logo-motion.ts`. Prototype: `prototypes/24-logo-drafted-throw`. It lives in the site, not the library, because it's a Batman scene.

- **Parts:** a clear square plate at button height (38px) with four overshooting drafting lines, a wireframe shadow and rising hatch; SP; and a batarang buried in the top right of the P's bowl.
- **Settings:** `site.logo` in `content/site.ts`, typed by the schema. The options are listed once in `packages/content/src/logo-options.ts`.

| Setting | Options | Default |
|---|---|---|
| `lettering` | geist (the site font), drafted (strokes and arcs of one radius, square ends) | geist |
| `guides` | Faint cap, mid and base lines under the letters | off |
| `depth` | A hatched wireframe copy of SP set back down and to the right, for 2.5D | on |
| `blade` | suit (figure's mid grey), rust (accent), cowl (figure's dark grey), steel (suit grey, rust edge), outline (the earlier line drawing) | suit |
| `aim` | The dashed flight line and amber target drawn before each throw | off |
| `intro` | Draw the plate and letters on load before the throw | on |
| `hover` | Pull out and throw again when a mouse comes over it | on |
| `scroll` | `pull`: pull the batarang out past `threshold` px, throw again back at the top | pull, 40 |
| `speed`, `spins` | Playback speed (0.25 to 3), full turns in flight (0 to 4) | 1, 2 |

| State | What happens |
|---|---|
| Load | The frame draws in, then the guides, then the letters (Geist blurs into focus), then their depth slides out, then the throw. |
| Throw | With `aim`, the flight line is drawn and the target appears. The batarang flies in along the line, spinning, and its tip goes into the P. Its shadow on the plate closes in on the entry as it lands. A pale notch and splits are drawn in the letter, and flecks fly back. Nothing shakes. |
| Scrolled | It pulls back out along its line and is gone; the cut stays, fainter. |
| Back at the top, or clicked | It's thrown again. A click on the home page glides to the top first. |
| Reduced motion, or `flags.motion` off | The finished logo, still. |

- **Color:** the solid batarang is a face, a stacked side for its thickness, a pale bevel and a thin edge, all from the theme: the figure's ink and paper mixes (`--f0` to `--f4`), or the accent. Never pure ink, so it stays apart from the letters and frame.
- **Rule:** the server sends the finished logo. Where motion will play, it stays hidden until the first frame (all of it with the intro, otherwise just the batarang and cut), so it never shows and then jumps back.
- **Rule:** every value is a function of time, from one timeline (`Timeline`). A new scene takes over from wherever the values are, so a scroll or hover mid-throw never jumps.

### Theme button: Draft
The sm `Button` with one sun that shifts per theme. It lives in the site, not the library.

### Tooltip: Draft
A small paper box with four drafting lines running past its corners, and the label font in ink. It appears after a short beat on mouse hover or keyboard focus, stays while the pointer is on it, and Escape dismisses it. `open` holds it open, for example to confirm a tap. It's only visual, so what it points at keeps its own accessible name. The header's menus use the same box.

### Text selection
Paper text on the active theme's accent color, set in `tokens.css`. A test keeps it readable in every theme.

### Hero: Draft
A drawing's title block at bottom left, held to the name's width: "I am", the name with a hatched wireframe shadow, the role on a dimension line (its first word turns over, and the line eases to fit), then the rotating hook and one CTA on a row. The plate rests slightly turned and follows the pointer. Letters blur into focus on load. Details are in decision 016.

### Motion text: Draft
`MotionText` (`@portfolio/design/motion-text`): letters arrive with a motion blur, sliding in from the left, stretched and blurred, settling sharp in turn; scrolled out, they slide on and blur away, last letter first. It watches its own place on screen, so it works on any text; screen readers get the words whole; reduced motion keeps it still. Used on every section heading. Chosen over dots-to-text, which reads as a gimmick against the drawn, hazy look.

### Headings and small labels
Headings are Geist 500 with tight tracking, often two-tone, with the second line dimmed. Small labels are Geist Mono, uppercase, set on a short dimension line like the hero's role: hairlines either side with amber end ticks. No section numbers.

### Bat figure: Draft, for the user's eye
A small Batman at the end of the role's dimension line, as an easter egg, built to be placed on other lines too. Settings are `hero.figure` in `content/site.ts`, the code is `apps/web/src/scene/figure/`.
- **Model:** traced from the user's reference image into stacked layers, one for each region of the drawing: edge, cowl and gloves, cape, suit shadow, suit light, belt, face, eyes (`apps/web/public/hero-figure.svg`).
- **Color:** every shade is a mix of the theme's `--ink` and `--paper`, never the accent, so it belongs to whichever theme is on.
- **Pose:** upright, with a slight stealth bend from the knees only. The picture itself isn't tilted or leaned. A thin dark edge behind it and layers that part slightly with the pointer give it depth.
- **Pulse:** barely there. The suit's light dims by 14% over 4.2s and returns. Reduced motion stops it.
- **Knows its height:** `BatFigure` sits in any positioned element whose bottom edge is the line, and measures the room up to the nearest `data-figure-ceiling` in its section, less `clearance`, within `minHeight` and `maxHeight`. `data-figure-inset` says how much of the ceiling's box is empty at the bottom. It re-measures on resize.
- **Sharpness rule:** on the turned hero plate, don't animate its `opacity` or `transform`. Browsers paint that layer at low resolution. Animate something painted, like `fill-opacity`.
- **Rule:** decoration only. Hidden from screen readers, never takes a click.

### Story: Draft, for the user's eye
Experience, told as a film. All content and whether it has a frame are `story` in `content/site.ts`, under a strict type. The code is `apps/web/src/scene/Story.tsx`, `StoryStage.tsx`, `story-motion.ts` and `tool-logos.ts`. Prototype: `prototypes/22-story-log`.
- **Company and tabs:** the heading names the company in plain type, a little heavier and in the accent. Two small tabs sit at the head's bottom right: Now (this company, selected) and Archive (earlier companies; disabled with a "Nothing here yet" tooltip until there are any). The line runs from the start year to the current year, which the browser keeps current.
- **Heading:** kicker and two-tone heading pin with the sheet, centered below the header, and leave with it after the last scene.
- **Stage:** it holds the screen while the scroll plays one scene at a time, in place. Each scene blurs out of the haze with a slow camera push, holds to be read, and blurs away. The whole frame comes out of the haze as the section arrives, and goes back as it leaves. It's a function of the scroll alone.
- **Frame:** `frame: true` puts the scenes on a clear drawn sheet: not opaque, with the texture rising from below only, as on a button. Its frame and hover are the project card's own (`SheetFrame`). `frame: false` removes it, and the words stay on the column.
- **Scene:** a strip naming the sheet, then label, big line, role on a dimension line, one sentence, the log, a figure, and the tools.
- **Log:** what was done, one line each, with the verb as the column you scan. Verbs are a fixed list.
- **Tools:** hand-sketched references to each logo, in the icons' pen, and they redraw on hover. `Tool` is a fixed list and each must have a logo, or the build fails.
- **Figure:** a technical blueprint per chapter (`drawings/story-figures.js`), telling one arc from where it started to where it got to; the last chapter ends on a funnel where requirements pour in and the full stack forms. Pen lines in the theme's tones, amber only for what's live. Chapter 1: one service on three isometric platforms (OpenShift 3, OpenShift 4, GKE), each a small cluster (control plane and two nodes). Each move goes build, deploy alongside, READY, traffic swings over, then the old platform retires; the next platform waits as dashed construction lines. Traffic flows in along the bottom without a break, and releases keep coming through one Helm chart (its revision counting up), gate by gate, into whichever platform serves. Chapter 2: pilot first, then the rest. A legacy block in five tangled slices; the pilot slice is cut out (amber dashes), flies across in amber, lands on the Docker / K8s platform (released with Helm) as two layers, Angular over Spring Boot with its tests, is packed into a dashed container frame, and is APPROVED; then the other four follow faster onto the same stack, the legacy block empties to a dashed outline, and a SHARED STANDARDS strip runs under every app. Labels sit where nothing will land: the pilot's notes in a column past the platform's right corner, platform and strip names under corners. Chapter 3: one framework, many systems. Four unnamed sources and an order platform; the first source is wired by hand (a long wandering dashed line), then the integration framework rail is drawn and the tangle becomes one socket and a TASK card; the other three snap in, amber as they land. Work runs to the platform through a few bounded lanes, it goes LIVE, and a minimal dimension line under the platform shrinks from 20 MIN to SECONDS. Chapter 4, the finale: requirement to production as one stream rising bottom-left to top-right over a dotted rail of ENGINEERING PRINCIPLES. Requirement sheets fly in through a ring portal (its inner edge turning); DESIGN is two floating sheets, HLD over LLD, each with a small diagram; DEVELOPMENT is a stack of Lego-like bricks of different sizes with studs, snapping on from alternating sides (DATA · SCHEMA, RABBITMQ, JAVA · SPRING BOOT, NEXT.JS · ANGULAR, AI AGENTS · MCP on top in amber); AI CODE REVIEW is a page of code with a pulsing spark marking the line it reads; CI/CD is an endless loop with builds going round; PROD is a cloud over the pods on GKE / K8S; shipped work leaves through a second portal. Every name is a callout (dot, leader, name) set out in open canvas; the bricks' names step up and to the left as a staircase. A chapter after the first waits until its scene is fully in focus: its scroll beat starts after the scene arrives, and the pen starts only once the scene is sharp. Chapters not built yet stay marked as empty figures (`DRAWN` in `Story.tsx`). Don't publish those empty.
- **Scroll hint:** while the film is pinned, a quiet mono note under the line, "Scroll to move through the years", with a slowly settling amber chevron. It stays through every chapter, fades only as the last one ends, and steps aside while a checkpoint's tooltip is open.
- **Scene motion:** each scene comes in from slightly further off and leaves past the camera, easing out; the figure zooms a touch faster than the words, for parallax.
- **Line:** the first stop is words (2020), in a small button; the others are fine batarangs, filled when you're there. All jump to the moment their scene has fully arrived, so its figure plays from the start, and the batarangs redraw on hover. The bat figure appears by the last one when the story reaches now.
- **Words:** IBM is named. Clients and internal systems never are. A test holds this, using hashes so the names aren't in the repo.
- **Without motion:** no script, reduced motion, or too small a screen gets every scene in order inside the frame, and the stops become plain links.

### Scroll motion: Approved
Smooth scroll, content layers that follow a beat late, and reveal and hide. Mark content with `data-block` and `data-layer`, and text with `.rv` or `.ln`. Details are in decision 017.

### Scroll thumb: Approved
Code: `packages/design/src/components/scroll-thumb`. It replaces the visible scrollbar with one small draggable shape that takes up no width. The shape is passed in: this site uses a small batarang, standing on end. It rests at `--scroll-thumb-top`, which this site sets to the bottom of the header. On hover it grows by 1.4 and darkens, softly. It's for pointers, while keyboards, wheels and touch scroll natively.

### Project card: Approved
Prototype: `prototypes/06-project-card`, with its detail page at `projects/everything-tech/`.

- **Parts:** frame, wireframe shadow, texture, stage (drafting plate with a live drawing), meta line, title with arrow, one description, up to three links.
- **Click:** the whole card opens `/projects/<slug>`. Links sit above it and go straight to the site, code or feed. Private projects have no links.
- **Link icons:** a link that leaves the site opens in a new tab and has a tilted arrow, plus an icon for what it is: browser window for a site, GitHub for code, RSS for a feed, npm for a package. A link within the site has a straight arrow.
- **Hover:** overshoot 6px to 9px, texture rises 18% to 34%, shadow slides out 9px over .8s, arrow moves 5px and redraws, and the drawing leans slowly towards the pointer. The card doesn't sway, because shaking a large surface is jarring.
- **Keyboard focus:** dashed amber line around the frame.
- **Over the cave:** use Frost (62% base tint, 4px blur).
- **Layouts:** stacked for the grid, and side by side for a featured project.
- **To the detail page:** the stage grows into the page header using a view transition.

**Production layout:** a configurable grid of 1 to 3 columns, where each card sets its shape and span. The card chooses side by side from its own width, so it fits any cell. A plate with no drawing shows the project's real numbers as a schedule. Component: `@portfolio/design/project-card`.

### Live drawings
Each project's drawing is built with the `blueprint-motion-graphic` skill, which holds their rules and code contract.

| Project | Drawing | Status |
|---|---|---|
| EverythingTech | A folded newspaper opens, the pen writes the front page, it's checked, it folds away | Approved |
| mcp-token-optimizer | A response leaves the server, noise drops out at mto, and a shorter one reaches the agent, with dimension lines to scale | Draft |

### Project page: Draft
Back link, then meta, title, description and links beside a frosted plate, then the write-up and stack. Pages other than home start lower, leaving the city the top of the screen.

## Not decided yet

- Fonts: the shortlist is in `docs/decisions/008-type.md`.
- Background motion for light mode.
- Header, navigation, theme toggle, panels, rows, inputs, footer.
- Page grid and spacing scale.

## Sharing it later

Keep this file free of personal facts, so it can be reused elsewhere. The Batman scene (Gotham, the cave) belongs to this site rather than to the system, and lives in `docs/decisions/`.

In code, the tokens are in `packages/design/src/tokens.css`, and a test fails if that file and this one disagree. Change this file first, then that one. Daylight colors are in `palettes.ts`, where a test checks every theme's contrast. Components follow `docs/decisions/012-component-library.md`, so they can become a package of their own.
