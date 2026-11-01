---
name: Blueprint
status: growing
modes: [light, dark]
default-mode: light
palettes: packages/design/src/palettes.ts
colors:
  dark:  { base: "#0b0e15", paper: "#10141e", ink: "#e4e8ef", ink-2: "#99a4b6", line: "#a9bfdf", line-rest: "rgba(169,191,223,.72)", accent: "#e6b044", grid: "rgba(169,191,223,.075)" }
type:
  label: { family: "Barlow Semi Condensed", weight: 600, transform: uppercase, tracking: .09em, size: 16px }
  title: { family: "Barlow Semi Condensed", weight: 600, tracking: .015em }
  body:  { family: "Barlow", weight: 400, note: "temporary, not chosen yet" }
  note:  { family: "ui-monospace, Menlo, monospace", weight: 500, size: 11px, tracking: .06em }
motion:
  soft: "cubic-bezier(.22,.61,.36,1)"
  small-part: .3s
  frame: .6s
  shadow: .65s
  texture: .85s
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

Light mode is the default. Its colors are not in this file: they're in `packages/design/src/palettes.ts`, the one list of themes, currently Dust, Sodium, Smog and Storm. Every theme has the same structure.

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
- **Hand in the drawing, not in the type.** Icons and drawings wobble slightly. Text is always a clean font.
- **Amber is rare.** One or two touches per element, so it keeps its meaning.
- **Soft motion.** Slow, smooth and without overshoot. Nothing shakes or bounces, and motion is a function of time.
- **Real facts only.** Every word and number on a component is true.

**Never use:** rounded corners, drop-shadow blurs, purple or blue gradients, tag-pill clusters, stock icon sets, emoji as icons, fade-up on every element, or copy with no fact behind it.

**Frost** (blurring what's behind a surface) is the one allowed glass effect, and only where a component sits over the busy cave or floats in the header. It should look like smoke in the air, not like a glass panel.

## Components

### Button: Approved
Code: `packages/design/src/components/button`. Prototype: `prototypes/05-button-soft`, which replaced the feel of `04-button`.

- **Parts:** body, wireframe shadow, three corner lines, texture, frame, sketched icon, label.
- **Levels:** primary (texture .3, amber icon), secondary (texture .15, line-colored icon), quiet (no texture, underline until hovered).
- **Sizes:** small 38px, medium 46px, large 60px high, with a 46px minimum touch area.

| State | What happens |
|---|---|
| Rest | Corner overshoot 4px, texture rises 62% |
| Hover | Overshoot 6px, texture rises 92%, shadow slides out 7px (5px small, 9px large) at .5 opacity, frame line brightens, slow sway, faint pen line redraws |
| Press | The button drops into its shadow over .18s |
| Keyboard focus | Dashed amber line 12px clear of the button |
| Disabled | Dashed frame, no texture or shadow, muted text |

- **Shadow direction:** bottom right.
- **Face:** clear by default. A use can set `--bp-face` and `--bp-face-filter` to tint and blur what's behind it, for example over the cave, or in the header.
- **Rule:** the main icon line never disappears on hover. Only the fainter second line redraws.

### Scroll thumb: Approved
Code: `packages/design/src/components/scroll-thumb`. It replaces the visible scrollbar with one small draggable shape that takes up no width. The shape is passed in: this site uses a small batarang, standing on end. On hover it grows by 1.4 and darkens, softly. It's for pointers, while keyboards, wheels and touch scroll natively.

### Project card: Approved
Prototype: `prototypes/06-project-card`, with its detail page at `projects/everything-tech/`.

- **Parts:** frame, wireframe shadow, texture, stage (drafting plate with a live drawing), meta line, title with arrow, one description, up to three links.
- **Click:** the whole card opens `/projects/<slug>`. Links sit above it and go straight to the site, code or feed. Private projects have no links.
- **Hover:** overshoot 6px to 9px, texture rises 18% to 34%, shadow slides out 9px over .8s, arrow moves 5px, and the drawing leans slowly towards the pointer. The card doesn't sway, because shaking a large surface is jarring.
- **Keyboard focus:** dashed amber line around the frame.
- **Over the cave:** use Frost (62% base tint, 4px blur).
- **Layouts:** stacked for the grid, and side by side for a featured project.
- **To the detail page:** the stage grows into the page header using a view transition.

**Production layout, agreed but not designed yet:** a mixed-size grid rather than equal cards, with the featured project biggest and a rhythm of one big, one small.

### Live drawings
Each project's drawing is built with the `blueprint-motion-graphic` skill, which holds their rules and code contract.

| Project | Drawing | Status |
|---|---|---|
| EverythingTech | A folded newspaper opens, the pen writes the front page, it's checked, it folds away | Approved |

### Project page: Draft
A mock exists in `prototypes/06-project-card/projects/everything-tech/`: back link, stage, meta, title, lead paragraph, links, numbered steps, what was built, stack. Its layout hasn't been reviewed on its own.

## Not decided yet

- Fonts: the shortlist is in `docs/decisions/008-type.md`.
- Background motion for light mode.
- Header, navigation, theme toggle, panels, rows, inputs, footer.
- Page grid and spacing scale.

## Sharing it later

Keep this file free of personal facts, so it can be reused elsewhere. The Batman scene (Gotham, the cave) belongs to this site rather than to the system, and lives in `docs/decisions/`.

In code, the tokens are in `packages/design/src/tokens.css`, and a test fails if that file and this one disagree. Change this file first, then that one. Daylight colors are in `palettes.ts`, where a test checks every theme's contrast. Components follow `docs/decisions/012-component-library.md`, so they can become a package of their own.
