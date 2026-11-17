# 35. /me gallery

/me as small blocks on top and one endless gallery below, instead of four big tiles that each open their own page.

- **Blocks:** Biking, Photography, Filmmaking, Places. Small (148px), turned a degree or two, in the old tiles' frames: paper, polaroid, film. Add a line to `blocks` in `gallery.js` to add one; they wrap and stay centred.
- **They are not pages.** Every block, and the "The gallery" cue under them, scrolls to `#gallery`.
- **Gallery:** every photo, hung on the site's own clotheslines. No labels, no categories, no filters: in the real build, every photo dropped in one folder shows up here. More lines are strung as the visitor nears the end, each print fading in as it is pegged. 2 per line on phones, 3, 4, then 5 on wide screens.
- **Dock:** once the blocks scroll away and the gallery is on screen, the same blocks sit at the top as a small pill bar (icons only on phones). Solid, no backdrop blur.
- **Viewer:** a print opens in the site's photo viewer; arrows and the arrow keys step through every photo.
- **Stand-ins:** only four photos are on the site today, so the prototype repeats them to 40 to show a long scroll.

It runs over the real built site, so nothing in `apps/portfolio` changes.

```bash
pnpm build
```

```bash
node prototypes/35-me-gallery/serve.mjs
```

Open `/me/`. It prints an address for a phone on the same Wi-Fi too.

## Second pass

- **Six blocks:** Biking, Photography, Filmmaking, Food, People, Places. Places no longer lists cities.
- **Filmmaking is a reel,** not black: a film strip in the paper's own tones, holes punched down both edges, with a reel icon.
- **Categories:** each photo carries one or two (`tags`). A block or a pill shows only its photos, with a count and "Show all"; the pill bar gains "All" and marks the one chosen. The address follows: `/me/#gallery/food`. A category with no photos yet says so.
- **Nothing is cropped.** Each print keeps its photo's shape. A wide photo hangs across two places on two pegs, turned less; when it won't fit the end of a line, the next upright photo steps in so lines don't end with a gap.
- **Viewer:** the polaroid comes up larger, with the photo's title on its foot, the count beside it, and a line about the photo below.
- **Phones:** the blocks sit three to a row.
- The stand-ins' titles and lines come from what each photo shows; their categories are only for the demo.

## Third pass

- **Rope:** twisted twine instead of a thin line: a core cord with two plies dashed half a twist apart, and a soft shadow on the wall. Drawn at the line's real width, so the twist keeps its pitch on every screen. Its own colours in dark mode.
- **Pegs:** wooden clothes pegs, each one tapered piece of wood with a little grain, a groove for the rope and a steel spring across the middle (a first try drew two halves with a seam, which read as two clips). The jaws sit over the rope and bite the print's top edge; a wide print gets two.

## Fourth pass

- **Captions on the line:** each polaroid has a deeper foot with the photo's short title on it.
- **Viewer:** the same one title on the foot, with the count. No second line.
- **The owner's own photos** (doughnuts, a grilled sandwich, the bike after rain, the figurine) hang among the stand-ins. They sit in `photos/`, resized and stripped of metadata, and stay out of the public repository. On another machine those four prints simply won't load.
