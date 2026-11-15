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

Two palettes, chosen by `theme.palette` in the config. Each has a light and a dark theme. Switching the one value changes every page; nothing else needs touching.

**Signature (default).** The hero light has two colours, a deep blue and a warm amber, and each becomes a theme: midnight for dark, warm paper for light. Midnight is blue held close to black: a tint, not a colour. The frame is ink blue in both, so the site never sits on pure black or pure white.

| Role | Light: warm paper | Dark: midnight |
|---|---|---|
| `--backplate` (frame) | `#05070c` | `#05070c` |
| `--surface` (panel) | `#f3ede1` | `#0a0d14` |
| `--surface-raised` (sheets, cards) | `#fbf8f1` | `#11151e` |
| `--surface-sunken` (plates, wells) | `#e8dfce` | `#06080c` |
| `--ink` | `#1c1915` | `#e8ebf2` |
| `--ink-muted` | `#645b4e` | `#939aa9` |
| `--line` | `#dccfb9` | `#1e2331` |
| `--accent` (focus ring only) | `#1e40af` | `#8fb4ff` |

- Night surfaces (hero, project title, contact) are `#030409`: almost black, with the frame's blue in it. The light shader paints on that same colour.
- Every themed panel has a soft wash of light from its top edge (`--panel-wash`): cream on paper, blue on midnight.
- Card shadows carry the theme's tint, warm on paper and blue-black on midnight.

**Plain.** The first palette: pure black frame, neutral grey-green panels (`#f5f6f2` light, `#161716` dark), no wash. Kept whole, as the fallback.

Rules for both:

- The only strong colour on the site is the light: blue with about one warm lane in five. It also colours the scrollbar, the experience lane and small markers.
- The accent is for focus rings. Don't use it for text, fills or decoration.
- Light is the default theme. The choice is saved, and restored before first paint.
- A new palette is one more `:root[data-palette='…']` block in `tokens.css` and one more name in `PaletteName`. It may only re-point semantic tokens.

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
| 3D carousel for three featured builds | It hid two of three projects. All featured builds now show at once |
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

## Touch

- A tap is a press, never a selection. The phone's grey tap box is off, and the text of links and buttons can't be selected by a tap. Paragraphs stay selectable.
- While a finger is on a link or button it dims to `--press-opacity` (55%), then returns. That is the only tap feedback; there is no lingering focus ring after a tap.
- Double-tap zoom is off on controls (`touch-action: manipulation`), so taps register at once.

## Accessibility

- One `h1` per page, headings in order, landmarks for header, main, nav and footer, and a skip link.
- Everything works by keyboard, with a visible focus ring on every surface.
- The light and icons are decorative and hidden from screen readers. Every fact also exists as text.
- Short link labels carry a fuller accessible name, for example "Code: whatcmd".
- No native `title` tooltips.

## Pages and navigation

| Page | Address | Reached from |
|---|---|---|
| Home | `/` | The logo, the footer |
| All builds | `/builds/` | Header, hero, featured section, footer |
| A build | `/builds/<slug>/` | Any build card, the previous and next links on a build |
| Experience | `/experience/` | Header, hero, the home teaser, the credentials page, footer |
| Credentials | `/credentials/` | The home teaser, the experience page, footer |

- **Home** is one scroll: hero, featured builds, an experience teaser, contact.
- **Header links differ by page,** set by `nav` in the config, so a phone header stays uncluttered:

| Page | Header links |
|---|---|
| Home | Builds, Experience, Contact |
| All builds, a build | Experience |
| Experience | Builds |
| Credentials | Builds, Experience |

- **The current link** is in full ink with a small point of the light beneath it. On home it follows the section being read: Builds over Featured, Experience over the experience teaser, Contact over contact.
- **Hash in the address bar:** on home, the address follows the section being read (`/#featured`, `/#experience`, `/#contact`, nothing at the top), replacing the history entry rather than adding to it. Opening `/#contact` from any page lands on that section.
- **The footer is the site index:** every page and Contact, from every page. It also carries the sound and theme switches, so they are in reach from anywhere. On phones they share a row with the copyright.
- **All builds:** filter chips group it by kind; a kind needs at least two builds.
- Featured holds one to five builds, with a designed grid for each count: 1 full width, 2 halves, 3 thirds, 4 as two rows of two, 5 as two halves over three thirds.
- The hero's action chips fade out once the visitor has scrolled past them.

## Project page

- **Title plate** (night): back link, position and kind, the name very large, summary, outside links as frosted chips, then up to three facts as a title card. The hero light runs behind it at lower strength.
- **Stage:** a browser-like frame for the build in motion (recording or motion graphic). It keeps its shape and says so plainly until the recording exists.
- **Rail:** section links, kind, year and stack. It stays in view on wide screens. On phones the section links become a row of chips stuck under the top edge.
- **Sections, in order:** What it does (numbered tiles), Use case (prose, only when written), How it is built (notes on a lane of light), Honest limits (a quiet note). Each kind of content has its own shape; nothing is a plain divider list.
- A use-case write-up goes in `useCase` for that build in `content/build-stories.ts`. The recording goes in `media` in `content/builds.ts`.

## Experience

- **A page of its own,** built as layers on one lane of light. The present is at the top with a softly pulsing node; each employer is a layer beneath it, closed by a ring at the year it began. The lane fills as the page scrolls.
- A new employer is a new layer on top. Nothing else changes.
- **An employer layer:** the name very large, its span and place, then its roles, newest first.
- **A role is one card,** always open: its years, title, one sentence of scope, then two columns, Built and Delivered, two or three lines each. Only the strongest lines go in. No drawers, tabs or number tiles.
- At most three roles per employer. Fold small steps into the role they led to.
- **On phones** the cards drop their boxes: roles are plain reading on the lane, separated by a hairline, at reading sizes.
- **Recognition** is awards for the work, and sits under the layers. Certifications are not recognition. An award with a certificate shows it matted in a small frame, toned down to sit with the page. Hovering brings back its colours and shows it large beside the pointer, big enough to read; a tap or Enter opens it.
- **The home teaser** is the one-glance version. Left: the headline, with links to the full page and to credentials. Right: every role as a card on one unbroken lane, each with a years badge, the title and one line on what it covered, so the whole span reads with no gaps. Under both, inside the page edge: **tools of the trade**, one lean strip of small mono names, quieter than everything above it, drifting slowly, fading at its ends, pausing under the pointer, still with reduced motion. Names only, no chips. The list is `content/tools.ts`.

## Credentials

- **A page of its own,** indexed by issuer. The index shows each issuer with its count: a list that stays in view on wide screens, chips on phones.
- Each credential is a small card. One with a public record gets a Verify link.
- The list is loaded after the page, from the Credly wallet as of the last data run. While it loads, a quiet mono line says so; if it fails, the line links to the wallet on Credly.
- Hackathon and challenge badges live here, with their issuer, not under recognition.

## Contact

- A night panel, about two thirds of a screen. Copy on the left: title, "Mail reaches me fastest", the address with a mail icon, then the other places as a plain list of rows (icon, name, handle). Rows, not buttons.
- **The badge** hangs from the panel's top edge on a woven strap with a buckle, swivel and ring. It is two-tone: a graphite frame around a near-black face, with a blue accent.
  - It swings on a spring: it drops in when first seen, leans after the pointer, and kicks when pressed.
  - The developer card is in front. The Labs card hangs behind, far enough to the side that "Labs" can be read. Pressing the badge swaps them.
  - **Replay:** a small, dim icon in the contact panel's bottom-right corner, well clear of the badge and its swing, plays the portrait's arrival and the swing again. It is hidden with reduced motion.
  - **The portrait** arrives the way a generated image loads: a field of soft, round-cornered, muted grey cells that says nothing about the picture, clearing slowly from the top down while the field breathes in rolling waves. The photo is monochrome from its first frame, so cells and photo share one tone. A trace of the hero's light lanes stays over it.
- On phones the badge hangs first and centred, and the copy follows at phone sizes of its own.

## Sound

A clean, cinematic quiet. **Two voices, only on actions.** Nothing plays on hover, on load or while idle. Off until the visitor turns it on with the speaker button beside the theme toggle; the choice is remembered on every page.

| Moment | Voice |
|---|---|
| Press any link or button, the badge and the sound toggle included | A small wooden tap |
| Scroll a good stretch | A soft page-turn of air, rising when going down, louder when faster |

- **Made, not sampled.** Both are synthesised in the browser (Web Audio) in one small, warm room. No audio files; the engine loads only for visitors who have sound on.
- **Across pages:** the saved choice is the only truth. A page re-reads it when it is opened, when it comes back through Back or Forward, when its tab regains focus, and when another tab changes it.
- **Starting audio:** browsers allow it only from a click, tap or key press, on every page and after every return. The first one wakes the sound and is heard itself. Scrolling with a wheel or trackpad before any click stays silent; no site can change that.
- An element can opt out with `data-sound="none"`.
- **Do not add voices.** Tried and removed as too much: hover ticks, a room tone, chimes, clinks, an opening chord, a galaxy swell.
- Level and scroll spacing are `sound` in the config. The two voices are in `lib/sound/engine.ts`.

## Scrollbar

The browser's scrollbar is replaced by a thread of light in the frame's right edge. It runs down from the top as the page scrolls, with a bright drop at its head. It hides on pages too short to scroll, and the native bar returns when the flag is off.

## Link previews

Hovering an outside link shows a small frosted card that follows the pointer: the destination's social image, title and host. The previews are saved at build time, so nothing is fetched from other sites until the visitor clicks. Pointer only.

## Tilt

On hover, cards lean the slightest amount toward the pointer: felt, barely seen. Everything else about the card is unchanged.

- Any element with `data-tilt` takes part. Today: build cards, the home role cards, credential cards, recognition, project feature tiles, and the previous and next build panels.
- At most `tilt.maxDeg` (1.2°) at the edge, in 1000px of perspective, with the usual 4px lift.
- A very faint light (4% white, 160px across) sits under the pointer. It lives on the card's own surface: on a folder that is its sheet, so the light never fills the empty corner beside the tab.
- The lean follows in 220ms and settles back over 900ms, so it feels weighted.
- Not on large reading blocks (role cards on the Experience page, prose), and not on the badge, which has its own swing.
- Pointer only. Off with reduced motion. `features.tilt` turns it off everywhere.
- Tried and pulled back as too much: 3.5° lean, a large soft-light glow over the whole card box.

## Motion, in full

| Where | What moves |
|---|---|
| Page open | Name, role, statement and chips rise in, one after another |
| Scroll | Sections and cards rise in once, the first time they are seen |
| Between pages | The old page dims and sinks back a touch (260ms) while the new one rises gently into place (560ms). A build's title travels from its card to its page. The new page is shown only once fully drawn, so nothing jumps |
| Cards | Lift 4px and lean just over a degree toward the pointer, with a faint light on the card's surface. Pointer only; touch gets the lift |
| Theme toggle | The icon turns in |
| Experience | The lane fills with scroll; the present node pulses |
| Badge | Spring swing, card swap, portrait clearing from grey cells |

Everything uses `--ease-out`, the duration tokens and `--stagger`. Entrances play once and never replay on scroll back.

## Not decided yet

Don't build these until they are: an About section, the Labs site, the recordings for each build, scroll transitions between panels, and Substack (add its link to `contact.links` when the address exists).
