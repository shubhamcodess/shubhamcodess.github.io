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
| `09-nav-skyline` | Traditional top nav with the daytime inverted skyline, three ways of fitting them together: Street, Apart and Behind. On scroll it keeps a bar, or drops it for floating buttons with a Clear, Fog or Mist face. Logo, links and page text are placeholders. |

The four themes in `08-daylight-themes` are now in the real site, in `packages/design/src/palettes.ts`.

The Batcave here is a stand-in. In the final build it needs to be much more realistic, with smoother animation and much better suits.
