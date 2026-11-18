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

- The only strong colour on the site is the light: blue with about one warm lane in five, in the hero and the scroll light at the frame's edge. Nothing else is blue.
- **Markers are ink.** Timelines, list dashes, years, icons and the current-link dot are drawn in the page's own ink (`--marker`, `--marker-strong`, `--marker-lane`), like a printed line. Bright blue timelines and glowing nodes were tried and removed: they read as generated.
- The accent is for focus rings. Don't use it for text, fills or decoration.
- Light is the default theme. The choice is saved, and restored before first paint.
- A new palette is one more `:root[data-palette='…']` block in `tokens.css` and one more name in `PaletteName`. It may only re-point semantic tokens.

## Type

- **Geist** for everything read. **Geist Mono** for labels, counts, stacks and facts: the developer's voice, used small.
- Weights: 400 for text, 500 for headings. No bold, no italics, no synthetic styles.
- Scale: `--text-xs` 12, `--text-sm` 14, `--text-md` 16, `--text-lg` 18, `--text-xl` 22, `--text-2xl` fluid 28 to 44.
- Large type tightens: -0.035em on the hero name, -0.02em on section titles. Mono labels are uppercase with 0.04em tracking.
- Headings balance their lines, paragraphs avoid orphans.
- A small mono label above a title always has `--space-3` between them, so they read as a pair.

## Logo

- **The SP mark:** an angular S and P interlocked, on a rounded tile. The tile has no fill of its own, so it is the panel it sits on, wash and grain included. A second tile behind it, offset down and right, is its shadow: the surface's own hue, a step darker on light and a step lighter on dark. The letters are ink.
- 42px in the header (`--logo-mark-size`), the letters at 82% of the tile.
- **Hover (and keyboard focus):** the tile skews back (skew -10°, 4°, scaled to 96%) while the letters come up off it (up and left, 6% larger), leaving their shadow on the tile in the step colour, over 340ms. Pointer devices only; reduced motion keeps the pose without the movement.
- **Browser icon:** `public/favicon.svg`, the same mark on a solid tile in the light paper colour, or the dark surface when the browser is dark. The letters are a little larger there, so they hold at 16px.
- The badge still sets SP in type.

## Gallery

`/gallery/` ("Gallery" in the dock and footer; route id `me` in the code), "Off the clock": life away from work. On (`features.mePage`); false takes away the page, its links and its place in the sitemap. A step less formal than the rest of the site, made of the same paper, ink and type. Built from prototype 35.

- **Reached from** the dock, a quiet mono "Off the clock →" under the contact profiles, and the footer index. Not the hero: its only calls to action are Featured builds and Experience.
- **Tags:** one paper luggage tag per thing the owner does: Biking, Photography, Filmmaking, Food, People, Places. Each has its top corners cut, a reinforced punched hole with a loop of twine threaded through it (both ends run over the top edge into the hole), a dotted rule inside the paper, a small fine-line drawing in muted ink (a bike on the road, a camera in its viewfinder, a reel trailing film, a steaming bowl, three friends, a pin on a map), the name, on paper a shade lighter than the page in dark mode (`--me-tag-paper`), and how many photos it has in mono ("4 photos"; the line stays empty when there are none yet, so every name sits at the same height). Tags hang turned a degree or two (`me.turns`) and straighten on hover, lifting a little while the drawing darkens. 150px wide; three to a row on phones. A new tag is one more entry in `topics` in `content/me.ts` and one more drawing in `TopicArt`.
- **A tag isn't a page.** It shows that topic's photos and brings the gallery up; "Every photo ↓" under the tags shows all of them. The address follows the choice (`/gallery/#photos` for all of them, `/gallery/#food` for a topic), so a link lands on it.
- **The dock:** once the tags scroll away and the gallery is on screen, the same names wait at the top as a small solid pill bar (no blur), with **All** first; the chosen one is ink on paper. It scrolls sideways on phones.
- **The gallery:** every photo, hung on twine like prints drying. A line above says what's showing ("Every photo" or the topic), its count in mono, and "Show all" when a topic is chosen. A topic with no photos says "No photos here yet." Three lines are strung at first and two more as the visitor nears the end, each print fading in as it is pegged. Five places a line on wide screens, then four, three, and two on phones; each print up to 220px wide.
- **The rope** is twisted twine: a core cord with two plies dashed half a twist apart and a soft shadow on the wall, drawn at its real width so the twist keeps its pitch. **Pegs** are wooden clothes pegs, one tapered piece with a little grain, a groove for the rope and a steel spring; the top sits over the rope and the jaw bites the print's top edge. Colours are the `--rope-*` and `--peg-*` tokens, lighter twine and deeper wood in dark mode.
- **A print** is a polaroid in its photo's own shape, never cropped: an upright photo takes one place and one peg, a wide one two of each, turned less. When a wide photo won't fit the end of a line, the next upright one steps in. Paper edges, a dotted rule just inside, one glassy finish over every photo, and the photo's short title on the foot. Prints hang lower toward the middle of the sagging line and straighten on hover.
- **Opened,** a print hangs in a **darkroom**: a warm dark room (no blur), a rope across the top, the print larger on one peg or two, with the photo's caption on its foot. Previous and next sit in one bar at the bottom (arrow keys too); close is top right, or bottom right on phones. No count. Escape or a click on the room closes it, and focus returns to the print. The system cursor shows inside it, since the open dialog covers the comet.
- **Photos** are WebP in `public/me/photos/`, a print copy (560px tall) and a large copy (about 1600px on the long side), with all metadata stripped. Each has a short title, a caption in the owner's own voice (what the moment was, such as "Stuck behind the lights on an evening ride back home.", never a description of the picture), a plain alt text for screen readers, and one or two topics, in `content/me.ts`. They're also listed in the page's llms.txt section. A clip can hang too (`video: true` and a 720p H.264 `<name>.mp4`, metadata stripped): its print gets a round play mark and it plays, muted at first, with controls when opened. None is on the page yet.

## Grain

A barely-there film grain on the page panels, so the background reads as a surface rather than a clean gradient. Chosen by `theme.texture` in the config (`'grain'` or `'none'`).

- **Where:** themed panels only (Featured, the experience teaser, All builds, Experience, Credentials, a build's story). Never the night panels (hero, project title, contact), never cards.
- **How much:** 9% grain on paper, 5.5% on midnight. It should be noticed only side by side with the clean version.
- The panel's top light (`--panel-wash`) falls over it, so the grain fades toward the top edge.
- Tried and removed: a blueprint drafting grid, and grain at 20%. Both changed the site's look instead of adding depth to it.
- Tuning is in `scripts/grain.mjs`, which renders the grain into two small WebP tiles (`pnpm grain`). It was a live SVG noise filter, which Chrome recomputed for every new tile while scrolling and dropped frames.

## Text links

A link that isn't a button (See all builds, Full experience, Credentials, Professional experience, Say hello, Code, Live, npm, a credential card's Verify, the gallery's Show all) carries a link's underline: `.link-dots` in `base.css`, our own dots (1px, every 3px) in very faded muted ink (`--link-underline`). On hover, keyboard focus or touch, a second row of the same dots in the theme's colour (`--link-sweep`, the accent) fills in from left to right (420ms), and when the pointer leaves it empties out to the right (320ms). Reduced motion: the colour switches without the sweep. Only the words are underlined, never the arrow.

## Buttons

Two styles, chosen by `theme.buttons` in the config. One value changes every chip and button on the site: the filter chips, the credentials index, the project section chips, and the frosted action chips in the hero and on project pages. Plain text links (Code, Live, See all builds) are not buttons and don't change.

| | Pill | Lean (default) |
|---|---|---|
| Shape | Fully round, 44px tall | Fully round, 34px tall (frosted actions 40px) |
| Label | Sans, 14px | Mono, 11px, uppercase, 0.06em tracking |
| Hover | Ink darkens, border firms | Same |
| Selected | Inverted: ink fill, paper text | Raised surface, firm ink border, full-strength count |

- **Lean** keeps the round shape that suits the site, slimmer, so filters don't swell into big blobs on phones.
- **No glow, no colour in button states.** A blue glow and a line of light on selected chips were tried and removed: they read as generated, not designed.
- **Pill** is the first design, kept whole.
- Sizes come from the `--button-*` tokens in `tokens.css`; `styles/buttons.css` holds the lean overrides. A new style is one more value in `ButtonStyle` and one more block there.

## Space and shape

- Spacing is a 4px grid, `--space-1` to `--space-9`. Pick from the scale.
- Radii: 8 (small controls), 14 (folder tab), 24 (cards), pill (chips and icon buttons).
- Hairlines are 1px in `--line`. Shadows are barely there and only lift folder sheets.
- Touch targets are at least 44px.

## Hero

- Name as a real `h1`, solid and crisp. One line on wide screens, two on phones, sized to its container.
- Under it: role and employer, then one sentence. At the bottom: two glass chips that lead into the work. They have no live blur: over the moving light a backdrop blur re-runs every frame, so they carry a denser tint instead.
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

- **Tab:** mono, uppercase, the kind of build only. No running numbers (they read as generated); `index` stays optional in the component for other uses. Its concave corner is built from fixed sizes, so it never stretches with the card.
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
| Not found | any address with no page (`404.html`) | A mistyped or old link |

- **Home** is one scroll: hero, featured builds, an experience teaser, contact.
- **Every page reaches every other,** through three things that work together: the header, the dock and the footer. The logo goes home in the header and the dock.
  - **The header** holds the home page's anchors (`nav` in the config): Builds, Experience and Contact, the same at every width with no More menu. Each page leaves out its own link, so on Experience the bar shows Builds and Contact. From 600px up the sound and theme switches end the bar; on phones they are in the dock and the footer. Under 360px the links draw in a little so the bar fits.
  - **The dock** (`Dock`, `features.dock`, `dock` in the config) is a small solid pill floating at the foot of the screen over the page; nothing shifts under it. It holds the SP mark (home), a thin rule, and the name of the page you're on with a four-dot glyph. It rises while you scroll and settles away 1.4s after you stop (`dock.lingerMs`), staying while it's open, hovered, focused or a mouse is moving in the strip near it. It stays away while the header, the contact section or the footer is in view, since those already hold the links. It sits under the comet cursor, so the pointer always shows on top of it.
  - **The dock's list:** the page name opens every page above the bar (Home, Builds, Experience, Credentials, Gallery, Contact, from `sitePages()`, the same list as the footer), kept lean: 188px wide, 34px rows, just the names (an arrow shows on hover with a mouse), the current page in full ink on a soft filled row (ink at 10%, a step firmer than a hover at 5%), and the sound and theme switches, also 34px, past a hairline. Escape, a press outside or choosing a page closes it; Escape returns focus to the button.
  - **Tone:** the dock takes what's under it: raised paper over paper panels, a shade up from the night surface over the hero and other night panels.
  - From prototype `37-floating-dock`.
  - Writing joins with one entry when it exists.

- **The current link** is in full ink with a small ink dot beneath it. On home it follows the section being read: Builds over Featured, Experience over the experience teaser, Contact over contact.
- **Hash in the address bar:** on home, the address follows the section being read (`/#featured`, `/#experience`, `/#contact`, nothing at the top), replacing the history entry rather than adding to it. Opening `/#contact` from any page lands on that section.
- **Experience's foot:** "← All builds" on the left and "All credentials →" on the right. **Credentials' foot:** "← All builds" on the left and the experience link on the right.
- **The footer is the site index:** every page and Contact, from every page. It also carries the sound and theme switches, so they are in reach from anywhere. On phones they share a row with the copyright.
- **All builds:** filter chips group it by kind; a kind needs at least two builds. At its foot: "← Professional experience" on the left and "Say hello →" on the right. In a two-link row the left link's arrow always points left.
- **A featured card's plate** holds the headline fact on the left and, on the right level with the number, the build's own logo as a small badge (`logo` in `content/builds.ts`, the mark under `public/logos/`, taken from the build's own site). A shallow well pressed into the plate in the plate's own colour, only 4px wider than the tile on each side, shaded inside along the top and catching a little light on its lower lip (a deeper shade and a fainter lip in dark). In it, the build's own tile (40px, 11px corners, a faint light from the top left) with the mark at 60% lifted by a soft drop shadow. Each logo has two versions, as the builds' own sites do: in light mode dark strokes on a light tile with a hairline edge (`logo.light`, the `-light.svg` marks), in dark mode light strokes on the build's own dark tile. Both are in the page and the theme shows one. The tile casts a soft, blurred shadow toward the bottom right (2px 3px 8px), as from a light at the top left, and the mark's own shadow leans the same way. Over the tile, and the same glass over the tile as the credential badges (`--glass-*`). EverythingTech's mark is its hashtag. A build without a logo shows no badge.
- Featured holds one to five builds, with a designed grid for each count: 1 full width, 2 halves, 3 thirds, 4 as two rows of two, 5 as two halves over three thirds.
- The hero's action chips fade out once the visitor has scrolled past them.
- **Not found:** home's header and night sky, a small mono `404`, "Page not found" in Geist at up to 72px (well under the hero name, so it isn't loud), the address that was typed in a mono chip, and Home and Builds as glass chips. No other sections. Status 404 and noindex. The words are `notFound` in the config. From prototype `33-not-found`.

## Project page

- **Title plate** (night): back link, the kind of build, the name very large, summary, outside links as frosted chips, then up to three facts as a title card. The hero light runs behind it at lower strength.
- **Stage:** a plain box for the build in motion (recording or motion graphic), with the build's repository in small mono at its top left, as @shubhamcodess/<name> (the title, for a private build); no browser dots or address, since the replays inside are windows of their own. The replay sits with equal room on every side. A build with no replay or recording yet shows no stage at all (`features.projectMediaPending: false`); set it to true to bring back the empty stage with its "coming" note.
- **Motion graphics:** where a build's own site has a replay (MCP Token Optimizer, whatcmd, fuzzy, classify), the stage plays that replay itself, brought over as code, not video: the build's own UI in its own colours (light or dark with the site's theme), set in Geist and Geist Mono. The screen has one fixed height (660px; on phones the smaller of 520px and 70% of the screen) and the replay is laid out to fill it exactly, never scaled, with the same room on every side. No captions inside the replays; Pause and Replay sit at the right of the stage's bar, the same for every build. On phones each replay shows only its heart at full size: MCP Token Optimizer the server's JSON being pruned and the token count falling (no chat), classify each message and its decision. It waits while off screen, and with reduced motion shows its last frame still, without the buttons.
- **EverythingTech's stage is a recording,** not a replay: a reader's session on the edition of Friday 30 October 2026 (chosen for its cover photo and headlines), taken from the live site. The front page, the cover story, the must-reads, the Wire filtered to AI, a quick hit opened, the foot of the page, the archive, and night then day, back where it began so it loops. A drawn pointer shows the clicks; on the phone take, a touch ring. It plays inside a macOS-style window (traffic lights, address bar) in the site's light or dark, filling the stage's fixed height from the top. A 1280 × 800 take for wide stages and a 390 × 844 take below 560px, H.264 at about 2.6 MB and 1.8 MB with a poster each, in `public/motion/everything-tech/`, fetched only when that stage nears the screen, and paused while off screen.
- **Rail:** section links, kind, year and stack. It stays in view on wide screens. On phones the section links become a row of chips stuck under the top edge.
- **Overview:** the opening paragraph, large, formatted to what it says: commands, paths and names on a small mono plate (`code`), the key phrases in full ink and a touch heavier, quotations in italics with their marks set apart, and keys to press as keycaps. Written with inline marks in `content/build-stories.ts` (see `ui/RichText.tsx`). Every command shown is a real one from the build's README.
- **Sections, in order:** What it does (tiles), Use case (prose, only when written), How it is built (notes on a thin ink lane), Honest limits (a quiet note). Each kind of content has its own shape; nothing is a plain divider list.
- A use-case write-up goes in `useCase` for that build in `content/build-stories.ts`. The recording goes in `media` in `content/builds.ts`.
- **Stack tags:** each tool in the rail is a small outlined pill in mono, with its mark in muted ink before the name. Marks are from Simple Icons (CC0), kept in `content/tech-icons.ts`; a tool with no mark shows its name alone.
- **npm downloads:** every npm package link (on cards and on the title plate) carries its live all-time download total after the label, small and in mono: "npm ↓595". Read from npm's public API in the visitor's browser (18-month spans added up, since npm answers no more per request) and kept for two hours. Rounded down when shortened (1.2k), never up. A total under 5 isn't shown, and nothing shows if npm can't be reached. `npmDownloads` in the config.
- **Previous and next:** quiet text links at the page foot, the same as every other page-onward row (back on the left, on at the right). `projectPage.onward: 'panels'` in the config brings back the two larger panels instead.

## Experience

- **A page of its own,** built as layers on one thin ink lane. The present is at the top, a filled dot with a faint ring that breathes; each employer is a layer beneath it, closed by a ring at the year it began. The lane fills as the page scrolls.
- A new employer is a new layer on top. Nothing else changes.
- **An employer layer:** the name very large, its span and place, then its roles, newest first.
- **A role is one card,** always open: its years, title, one sentence of scope, then two columns, Built and Delivered, two or three lines each. Only the strongest lines go in. No drawers, tabs or number tiles.
- At most three roles per employer. Fold small steps into the role they led to.
- **On phones** the cards drop their boxes: roles are plain reading on the lane, separated by a hairline, at reading sizes.
- **Recognition** is awards for the work, and sits under the layers. Certifications are not recognition. An award with a certificate shows it matted in a small frame, in its own colours behind the same glass as the credential badges (the `--glass-*` tokens: a faint sheen, a hairline edge, colours eased back only slightly, a touch dimmer in dark). Hovering shows it large beside the pointer, big enough to read; a tap or Enter opens it.
- **The home teaser** is the one-glance version. Its two columns share one top and one bottom edge: the left column's first label sits on the line of "IBM … 2020 to now", and its last link ends level with the last role card. Left, top: the headline, its line and "Full experience". Left, below a hairline, built the same way (label, title, one line): "Credentials", "AI & cloud certified.", its line, three featured credentials as **patches** (`featuredCredentials` in `content/experience.ts`: the highest level from each main issuer), then "All credentials (28)". A patch is a small raised card with a stitched dashed line just inside its edge: the award mark and the level in mono, the title, and the issuer held to the foot so every patch in the row ends on one line (or, with `homeCard: 'badge'`, the award mark and issuer over the credential's badge). It links to the credential's public record and leans like every card. Three abreast; stacked on narrow phones, where each also shows its badge on the right. Right: every role as a card on one thin ink lane (the current role's dot filled, earlier roles as hollow rings), each with a years badge, the title and one line on what it covered, so the whole span reads with no gaps. Under both, inside the page edge: **tools of the trade**, one lean strip of small mono names, quieter than everything above it, drifting slowly, fading at its ends, pausing under the pointer, still with reduced motion. Names only, no chips. The list is `content/tools.ts`.

## Credentials

- **A page of its own,** indexed by issuer. The index shows each issuer with its count: a list that stays in view on wide screens, chips on phones.
- **The credential card** (`credentialsPage.card: 'badge'`, from prototype 34) is the same on this page and on home. A raised card with the patch's stitched dashed line just inside its edge. Top row: the award mark on the left, the credential's own badge on the right (56px). Then the level in mono (from the title: Professional, Associate, Foundations, Fundamentals…, or "Credential" when it names none), the name, the issuer, and Verify at the foot. The whole card is the link to the issuer's record. Badge images are in `public/badges/`, one per credential, found by the data script by title; when one is missing, the issuer's official mark (`public/issuers/`, `issuerLogos`) takes its place.
- **Badges sit under clear glass,** like a plaque (`ui/BadgeImage`, used on both cards): a rounded pane with a faint diagonal sheen across one corner and a hairline edge that catches the light. Nothing is blurred or washed; the badge reads exactly as it is, its colours eased back only slightly (a little less saturated, a touch dimmer in dark) so it sits with the page.
- **A short row keeps card width:** a group with one or two credentials keeps cards a third wide, as in a full row of three, instead of stretching across.
- **`card: 'classic'`** brings back this page's earlier plain cards (award mark, title, Verify link) in one switch.
- **Home keeps its patches** (see the home teaser above), not this card. Stacked on a phone, each patch also shows the credential's badge on its right. Three abreast, `credentialsPage.homeCard` picks: `'text'` (level, name, issuer; the default) or `'badge'` (the issuer in mono on top, the badge in the middle).
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
| Scroll a good stretch | Paper sliding under the hand: a dry, grainy hiss that flutters, rising when going down, louder when faster |

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

- Any element with `data-tilt` takes part. Today: build cards, the home role cards, credential cards, recognition, project feature tiles, and the previous and next build panels when `onward` is `'panels'`.
- At most `tilt.maxDeg` (1.2°) at the edge, in 1000px of perspective, with the usual 4px lift.
- A very faint light (2% white, 90px across) sits under the pointer. It lives on the card's own surface: on a folder that is its sheet, so the light never fills the empty corner beside the tab.
- The lean follows in 220ms and settles back over 900ms, so it feels weighted.
- Not on large reading blocks (role cards on the Experience page, prose), and not on the badge, which has its own swing.
- Pointer only. Off with reduced motion. `features.tilt` turns it off everywhere.
- Tried and pulled back as too much: 3.5° lean, a large soft-light glow over the whole card box, then a 4% light 160px across.

## Comet cursor

The pointer is a comet. Switched by `features.cometCursor`, separately from the chalk trail; tuned by `cometCursor` in the config.

- **The head:** a sharp dart about the size of the system arrow, pointing up and left, its tip exactly on the click point, so it never feels out of place or imprecise.
- **The tail:** a thin tapered streak behind the head along its axis. A stub at rest; it stretches with speed (up to `tailMax` 1.25 times its length) and draws back in when the pointer stops.
- **Bending space:** a faint curved arc just ahead of the tip, like a bow wave, that appears once the comet is moving fast (`bowAt` 0.3).
- **Over something clickable** the head grows 12% and the bow wave holds quietly. **A press** squeezes the head.
- **Colour:** white, blended by difference, like the chalk trail: dark on paper, light on the hero and on midnight, inverted over text. Aware of the theme and of the surface beneath it, with no colour of its own.
- Pointer devices only; touch keeps nothing. With reduced motion it stays a comet but doesn't stretch. Turning it off brings back the system arrow.

## Chalk trail

A short hand-drawn line follows the pointer, like chalk dragged across the page, shedding a little dust. Switched by `features.chalkTrail`; tuned by `chalkTrail` in the config.

- **The line:** its tip eases after the pointer rather than sticking to it (`follow` 0.16), so it lags a little behind the hand. It is never longer than 60px (`maxLength`), however fast the pointer moves, and fades within about a fifth of a second. 1.5px at the tip, tapering to nothing, at 38% strength. Each segment is drawn in three slightly offset passes, so its edge is grainy like chalk rather than a clean vector stroke.
- **The dust:** about one move in three sheds a speck that drifts, slows and fades over a second.
- **Colour:** drawn white and blended by difference, so it is pale chalk on the dark hero and faint graphite on the paper, in both themes, with no colour of its own.
- Pointer only. Off with reduced motion. Nothing runs while the pointer is still.
- Keep it small. It should be noticed on the second look, not the first.

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
| Pointer | A short chalk line with a little dust, gone in a quarter of a second |

Everything uses `--ease-out`, the duration tokens and `--stagger`. Entrances play once and never replay on scroll back.

## Not decided yet

Don't build these until they are: an About section, the Labs site, the recordings for each build, scroll transitions between panels, and nothing else pending here.
