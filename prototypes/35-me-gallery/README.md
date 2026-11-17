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
