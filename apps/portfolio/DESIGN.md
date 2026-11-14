# Design directives

How this site looks, moves and reads. Every rule here is live in the code. Change the rule and the code in the same piece of work.

The prototype in `site-try` is the visual reference only. This app is the production build, and where the two differ, this file wins.

## The idea

A developer's portfolio that reads like a well-kept workspace: black frame, rounded panels, quiet type, one moving light behind the name, and the work filed in folders. Subtle wins every tie.

## Principles

1. **Words first.** The name, role and builds are always the sharpest thing on screen. Decoration sits behind them and dimmer than them.
2. **One signature per screen.** The hero has the light. The work has the folder. Nothing else competes.
3. **Everything is true.** Summaries and numbers come from each project's README and its own benchmarks. Never round up. Private work gets no link.
4. **Nothing provisional ships.** No sample copy, stock imagery or placeholder sections. A part appears when its content is real.
5. **Tokens, not literals.** Components hold no raw color, size or duration. See `src/styles/tokens.css`.
6. **Config, not edits.** Copy, order, featured builds, light tuning and feature flags live in `src/config/site.ts`.
7. **Works without the extras.** No WebGL, reduced motion, touch, keyboard and 320px wide are all first-class.

## The frame

- A black backplate (`--backplate`) with rounded panels inset 10px (`--frame-inset`). Panels stack with the same 10px gap.
- Panel radius is `--frame-radius`: 24px on phones, up to 40px on wide screens. The prototype's fixed 48px ate too much of a phone screen.
- One content measure for every section: `.container`, 1240px wide with a `--page-gutter` edge. Headers, headings and grids share the same page edge.
- The hero and footer are **night** surfaces: dark in both themes. Every other panel follows the theme.
- Scrolling is native. The scrollbar is thin and takes the frame's colors.

## Color

| Role | Light | Dark |
|---|---|---|
| `--surface` (panel) | `#f5f6f2` | `#161716` |
| `--surface-raised` (folder sheet) | `#fcfdfa` | `#222422` |
| `--surface-sunken` (folder plate) | `#e8ebe4` | `#0d0e0d` |
| `--ink` | `#1c1f1d` | `#eef0ec` |
| `--ink-muted` | `#5c635e` | `#a2a8a2` |
| `--line` | `#dde1da` | `#2e312e` |
| `--accent` (focus ring only) | `#1d4ed8` | `#8fb4ff` |

- Neutral, slightly green-grey surfaces. The only strong color on the site is the hero light: blue with about one warm lane in five.
- The accent is for focus rings. Don't use it for text, fills or decoration.
- Light is the default theme. The choice is saved, and restored before first paint.

## Type

- **Geist** for everything read. **Geist Mono** for labels, counts, stacks and facts: the developer's voice, used small.
- Weights: 400 for text, 500 for headings. No bold, no italics, no synthetic styles.
- Scale: `--text-xs` 12, `--text-sm` 14, `--text-md` 16, `--text-lg` 18, `--text-xl` 22, `--text-2xl` fluid 28 to 44.
- Large type tightens: -0.035em on the hero name, -0.02em on section titles. Mono labels are uppercase with 0.04em tracking.
- Headings balance their lines, paragraphs avoid orphans.

## Space and shape

- Spacing is a 4px grid, `--space-1` to `--space-9`. Pick from the scale.
- Radii: 8 (small controls), 14 (folder tab), 24 (cards), pill (chips and icon buttons).
- Hairlines are 1px in `--line`. Shadows are barely there and only lift folder sheets.
- Touch targets are at least 44px.

## Hero

- Name as a real `h1`, solid and crisp. One line on wide screens, two on phones, sized to its container.
- Under it: role and employer, then one sentence. At the bottom: two frosted chips that lead into the work.
- **The light** runs lanes along a floor toward the viewer and up a narrow wall far behind the name.
  - It is background. `intensity` stays at or under 0.6, the floor dims as it nears the viewer, and the wall fades as it rises.
  - The horizon sits above the name's centre, so the brightest part is behind the name, not under the reading text.
  - Fewer lanes on phones, so each stays a clean line.
- **Depth** comes from three things: the light scrolls slower than the page, it leans a little toward the pointer, and the words lean a few pixels the other way.
- **Frosted glass** is for things that sit over the light: a feathered plate with no visible edge behind the words, and the action chips. It is not a general card style. Phones get a plain dark feather instead of a blur, because blurring a moving canvas is slow there.

What was dropped from the prototype, and why:

| Dropped | Why |
|---|---|
| Hollow name that fills and empties, with a 2.5D outline | It fought the light and made the name hard to read for half of each cycle |
| Handwritten employer and italic serif "at" | Three typefaces in one line. One family reads calmer and more senior |
| Three.js | About 500 kB to draw one rectangle. The same shader now runs on raw WebGL2 |
| "Labs" and saved versions in the header and footer | Prototype scaffolding, not part of a portfolio |
| Full-brightness floor lanes at the screen edges | They pulled the eye away from the name |
| 3D carousel for three featured builds | It hid two of three projects. All three now show at once |
| Stock photos on build cards | Not the projects. A real fact holds the space until real graphics exist |

## Folder card

The site's one card. A tab rises out of a sheet, over an optional plate.

- **Tab:** mono, uppercase, index number then the kind of build. Its concave corner is built from fixed sizes, so it never stretches with the card.
- **Sheet:** title, summary, stack in mono, then links under a hairline.
- **Plate (feature variant):** the area above the sheet. It holds one headline fact now, and takes the project's drawing or screenshot later.
- **Compact variant:** no plate. The fact, if any, sits inline above the stack. Used for the full index.
- Links are plain words with an arrow: Code, Live, npm, Download. They open in a new tab.
- Hover lifts the card 4px. Arrows nudge up and right. Nothing else moves.

## Motion

- One easing, `--ease-out`, and three durations: 180ms (color), 420ms (movement), 900ms (the light fading in).
- Motion responds to the visitor (hover, pointer, scroll) or sits in the background. Nothing animates to get attention.
- Reduced motion: the light holds one still frame, depth is off, transitions are instant, scrolling is immediate.
- The light stops when the hero is off screen or the tab is hidden.

## Accessibility

- One `h1` per page, headings in order, landmarks for header, main, nav and footer, and a skip link.
- Everything works by keyboard, with a visible focus ring on every surface.
- The light and icons are decorative and hidden from screen readers. Every fact also exists as text.
- Short link labels carry a fuller accessible name, for example "Code: whatcmd".
- No native `title` tooltips.

## Not decided yet

Don't build these until they are: About, Experience, Contact, project pages, the graphics for each build, scroll transitions between panels, and a richer footer.
