# Drawing guide for posts

Give this file to whoever (or whichever AI) draws a picture for a post. Every diagram and sketch on the site follows it, so they all look like one hand drew them in the site's own ink and paper.

The two samples beside this file are the reference: `sample-diagram.svg` (a diagram) and `sample-sketch.svg` (a hand sketch), each with its `.dark.svg` twin. Match them.

## The files

- **SVG only**, one file per drawing, saved in the post's folder. Use it in the post as `![What it shows](name.svg "Caption")`.
- **Always two versions:** `name.svg` for light mode and `name.dark.svg` for dark mode. Same drawing, only the colours change (table below). The page shows the one that matches the theme.
- **Self-contained:** no `<style>` blocks, no CSS classes, no scripts, no links, no `<image>` or embedded bitmaps, no external fonts. Write every colour, width and size as an attribute on the element. (The page shows the file as a picture, so nothing outside the file can reach it.)
- **No background rectangle.** The page draws the paper behind the drawing.
- **Size:** set `viewBox` and nothing else on `<svg>` (no `width` or `height`). Draw on the grid below. Keep it wide rather than tall: about 720 × 280 for a diagram, 520 × 220 for a sketch. Never taller than it is wide.

## Tokens

| Token | Light (`name.svg`) | Dark (`name.dark.svg`) | Use |
|---|---|---|---|
| `paper` | `#fbf8f1` | `#11151e` | Fill inside boxes and shapes |
| `ink` | `#1c1915` | `#e8ebf2` | Box edges, main lines, main labels |
| `ink-muted` | `#645b4e` | `#939aa9` | Arrows, secondary labels, notes, dashed lines |
| `accent` | `#a4480b` | `#f2a24e` | The **one** thing the drawing is about. At most one box or label per drawing |
| `line` | `#dccfb9` | `#1e2331` | Faint guides or groupings, if needed at all |

| Token | Value |
|---|---|
| Grid | Place everything on a 4px grid; leave at least 20 units of margin inside the `viewBox` |
| Box | `rx="10"`, stroke `ink`, `stroke-width="1.2"`, fill `paper`; height 44 to 56 |
| Accent box | The same, stroke `accent` |
| Line and arrow | stroke `ink-muted`, `stroke-width="1.2"`, `fill="none"`, round caps and joins |
| Arrowhead | One `<marker>`: a filled triangle `M0 0 10 5 0 10z` in `ink-muted`, `markerWidth="7"`, `orient="auto"` |
| Dashed line (a return path, something optional) | `stroke-dasharray="4 4"` |
| Gap between boxes | At least 56 for an arrow between them, 24 between boxes in a stack |
| Font | `font-family="ui-monospace, 'Geist Mono', SFMono-Regular, Menlo, monospace"` for diagrams; the sketch may use `'Geist', system-ui, sans-serif` |
| Label | `font-size="12"`, `ink`, centred (`text-anchor="middle"`), lower case, a word or two |
| Note under a label | `font-size="10"`, `ink-muted`, 17 below the label |
| Caption inside the drawing | `font-size="10"`, `ink-muted`, under everything, centred |
| Sketch strokes | `stroke-width="1.6"`, round caps and joins, slightly wobbly paths (hand drawn, not perfect geometry); `stroke-opacity=".55"` to `.7` for secondary marks |

## Style

- **Calm and sparse.** A few boxes and arrows, plenty of space. If it needs more than about eight boxes, split it into two drawings.
- **Words:** short, lower case, plain. No titles inside the drawing: the caption under it (in the Markdown) says what it is.
- **One accent**, for the idea the post is about. Everything else is ink and muted ink.
- **No** gradients, shadows, emoji, icons from icon sets, 3D, or colours outside the table.
- **Readable on a phone:** on phones the drawing is shown about 330px wide (under half its size), and a tap opens it full size. Keep the `viewBox` 720 wide or less, labels at 12 (14 for a key label), and no more than four boxes in a row, so it still reads at a glance before the tap.
- **Alt text** (in the Markdown) says what the drawing shows in a sentence, for screen readers.

## Prompt to give an AI

> Draw an SVG for a blog post, following the drawing guide below exactly. It shows: <what it should show>.
> Give me two files, `name.svg` (light) and `name.dark.svg` (dark), identical except for the colours in the token table. Use only attributes, no CSS, no background rectangle, `viewBox` only. Match the attached sample-diagram.svg.

Then paste this file and attach `sample-diagram.svg`.
