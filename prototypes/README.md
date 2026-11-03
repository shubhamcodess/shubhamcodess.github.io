# Prototypes

Keep every prototype here. Don't overwrite or delete one: new ideas get a new numbered folder. Some may become a flip-switch minimal version of the website later.

| Folder | What it is |
|---|---|
| `01-background` | Flat, top-down cave drawing with three textures: Survey, Plan, Dust |
| `02-batcave-3d` | 3D wireframe Batcave with the mouse reveal |
| `03-gotham-to-cave` | Full page: inverted Gotham at the top, descent, Batcave at the bottom |
| `04-button` | Blueprint button specimen with states and tuning controls |
| `05-button-soft` | The same button with slower, softer hover motion. `04-button` keeps the original feel. |
| `06-project-card` | Project card with a live folding-newspaper drawing, an empty template and a mock `/projects/everything-tech` page |
| `07-light-palette` | Three daytime Gotham palettes with film gradient and grain, shown on the real button and card. Uses files from `06-project-card`. |
| `08-daylight-themes` | Four daytime themes with a rotate switch and a soft fade: Dust, Sodium (5% less saturated), Smog (blue haze, less green) and Storm. Uses files from `06-project-card`. |
| `10-gotham-skyline` | The cinematic inverted Gotham: real 3D layers, Wayne Tower, bridge, haze, day and night. Candidate for the real site. |
| `11-gotham-skyline` | The next pass on `10`: varied roofs, weathered upside-down Wayne lettering, grime, pointer-stirred dust, bats and fog, and Old Gotham. Pointer effects were tried here and removed in `12`. |
| `12-gotham-skyline` | The user's chosen taste: no pointer effects, varied bats, a better phone composition, Old Gotham by default. Replaced by `13`. |
| `13-gotham-skyline` | Same taste, with lighter, more open front rows and a clear space above Wayne Tower. Replaced by `14`. |
| `14-gotham-skyline` | `13` plus a few low buildings in front of Wayne Tower for depth, on wide screens. Replaced by `15`. |
| `15-gotham-skyline` | `14` plus a faint, upside-down GOTHAM in outline, far behind the skyline. This went into the real site, and it's also the first version of night. |
| `16-scroll-motion` | `15` plus snappy smooth scroll, content that follows a beat late with parallax, reveal and hide on scroll, and a font option. Taken from studying tryalan.ai, see `docs/references/tryalan-motion.md`. Only the EverythingTech section has real content. |
| `17-mcp-token-flow` | The mcp-token-optimizer drawing: a response passes through mto, noise drops out, and a shorter one reaches the agent. The production copy is in `apps/web/src/scene/drawings/`. |
| `18-bat-rig` | A small Batman built from 3D joints, with a turn, a run cycle and a cape, that followed the pointer along the hero's role line. The user wanted the exact reference shape instead, so it came off the site. `index.html` shows its poses. Replaced by the cut-out puppet in `apps/web/src/scene/figure/`. |
| `20-bat-puppet` | The traced figure cut into a puppet, with a turn and a walk after the pointer. The user said the walk looked like a chicken walk and the turn like a flat image flipping, so it came off the site. `index.html` shows its poses. |
| `19-bat-trace` | `trace.py` traces a figure on a white background into one clean outline. `trace_layers.py` traces its color regions into stacked layers with a knee bend, and made `apps/web/public/hero-figure.svg`. The reference image is not committed. |
| `21-story-frame` | The story as sheets passing inside one blueprint frame: a strip naming the sheet, a window the slides move through, a space reserved for the motion graphic, and a fixed three-cell title block. All content is one typed object in `story.js`. Press G to see the one shared page edge. |
| `22-story-log` | `21` made compact, on one shared column that leaves room on the left for in-page links later (press G to see it). A log of what was done replaces the fact cells, with slots for hand-drawn tool logos, and the scenes blur in and out with a slow camera push. |
| `23-story-ink-drawings` | The thin ink drawings that sat beside the first version of the story in the app. The user found them amateur, so real motion graphics replace them. |
| `24-logo-drafted-throw` | The header logo redone: SP as clean drafting lettering (one arc radius, square ends) on faint construction guides, a dashed flight line and amber target drawn before the batarang is thrown along it, no shake on impact. Scrolling down pulls the batarang out; back at the top it's thrown again. Shown at real size and ×6. Second pass: the blade buries its tip in the P with a shadow that closes on the entry, SP gets a hatched 2.5D wireframe depth, Geist lettering by default, and the aim line can be switched off. Third pass: the batarang is a solid plate (side, face, pale bevel, thin edge) in four finishes: rust, the figure's suit grey, cowl dark, and grey with a rust edge. The old outline is kept as an option. This went into the real site, with every choice in `site.logo`. |
| `25-live-stats` | GitHub and npm numbers fetched in the browser through a small TTL cache (two hours by default, mirrored to storage, calls in flight shared), shown on the project cards only at or above a threshold: stars on Code, weekly and monthly downloads on npm. A dotted ring refreshes them. Three placements to choose from, live or sample data, and the typed interface it becomes. Built into the site as `packages/stats`, configured by `site.stats`. |
| `26-mto-drawing` | mcp-token-optimizer's production drawing: a rack, a window striking real JSON lines, a drawer of kept originals, and a reel of hand-drawn agent marks |
| `27-mto-stream` | The same drawing, far simpler and skewed like the story's figures: an outlined server, anonymous JSON lines, and a stream of tokens where some get cut |
| `28-mto-window` | Back to prototype 26's rack, window and agent reel in the old slight skew: tokens pour in as small cards, and the JSON and pruning are pen lines with no text |
| `09-nav-skyline` | Traditional top nav with the daytime inverted skyline, three ways of fitting them together: Street, Apart and Behind. On scroll it keeps a bar, or drops it for floating buttons with a Clear, Fog or Mist face. Logo, links and page text are placeholders. |

The four themes in `08-daylight-themes` are now in the real site, in `packages/design/src/palettes.ts`.

The Batcave here is a stand-in. In the final build it needs to be much more realistic, with smoother animation and much better suits.
