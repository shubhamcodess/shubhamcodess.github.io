# 39. Writing pages

The Writing section of the site: an index at `/writing/` and one page per piece at `/writing/<slug>/`, for essays, research and case studies of private work. Drawn here inside the real site frame; nothing in `apps/portfolio` changes.

```bash
pnpm build
```

```bash
node prototypes/39-writing-pages/serve.mjs
```

Open `/writing/`, `/writing/sample-post/` and `/writing/sample-case-study/`.

## The menu

- The header's **Research** (an anchor on home) becomes **Writing**, the page: Builds, Writing, Experience, Contact. It fits phones at 320px, being shorter than Research.
- Like every page, a writing page leaves its own link out of the bar (no current dot): Builds, Experience, Contact. The dock reads "Writing".
- Home keeps its Research & writing section; its All writing goes to `/writing/` instead of Substack. The dock list and the footer gain Writing.

## The index, `/writing/`

- The page title and lead, the count, and the builds page's lean filter chips: All, Research, Case studies, Essays (a kind shows only once it has a piece).
- Everything in one list, newest first, grouped by year (the year in mono on the left on wide screens, above on phones).
- Each row: the kind in mono, small outlined tags (IBM · Private, Sample), the title (one line on wide screens, wrapping on phones), a one-line summary, then the date, reading time and where it lives: Here, Substack ↗ or PDF ↗. Hovering a row lifts it on a faint surface.

## A piece, `/writing/<slug>/`

- **The bar:** All writing ← on the left; on phones and tablets a lean **Contents** chip on the right that opens the sections in a small sheet (choosing one jumps there and closes it; Escape or a tap outside closes it). On phones and tablets the bar stays under the top edge while reading, like a project page's section chips. On wide screens Contents is the sticky rail instead.
- **The masthead** (second pass, after Framer's editorial-grid blog openers): one raised paper plate. The kind, the title (up to 52px) and the summary on the left; the facts in a mono column on the right, past a hairline: Kind, Published, Reading, and for a case study Where, Role, When, Team and Stack. The hero's two lights leak faintly in at its top corners (blue from the left, amber from the right), and a 2px rule of the same blue and amber runs along its foot: the site's lighting, kept to a whisper. On phones the facts move under the title.
- **A case study** adds its headline numbers and the line "A private project: no code, data or client names are shared." across the masthead's foot, so everything at a glance is one block.
- **The reading column:** about 66 characters (42rem, 17px, line height 1.7) in the site's own type, with "On this page" as a sticky rail on the left on wide screens.
- Pull quotes have an amber rule (`--accent-warm`); code sits on the sunken surface in Geist Mono; links carry the site's dotted line.
- Pictures, sketches and diagrams are figures with a mono caption. Each loads only when it nears the screen (`loading="lazy"`) at its true size, so nothing jumps. Drawings come in a light and a dark version; the theme shows one, and the hidden one never downloads.
- **The foot:** one hairline, then the tags on the left and Next → on the right, in one row.

## How a post gets onto the site (to build next)

One folder per piece, picked up on the next build. No admin screen and no service: Git is the CMS.

- **The folder name is the slug:** `content/writing/the-blind-script-notes/` becomes `/writing/the-blind-script-notes/`.
- **`index.md` is the post,** and its front matter is strictly typed: the build checks it against a schema and stops, naming the file and the field, if anything is missing or wrong.
- **Everything else in the folder is the post's material:** images, sketches and diagram sources, referenced by their file names in the Markdown and published beside the page.
- **Contents comes from the Markdown, typed:** the build reads the `##` headings into a typed list (`{ id, title }`), giving each a stable id from its text; that list draws both the wide-screen rail and the phone Contents sheet. A heading can set its own id with `## Title {#id}`; two headings with the same id fail the build.

```
content/writing/
  the-blind-script-notes/
    index.md          the post
    cover.png         any image, sketch or diagram it uses
    sketch.svg
```

```markdown
---
title: Sample post: what a writing page can hold
summary: One sentence for the list and for search results.
date: 2026-11-22
kind: essay            # essay | case-study | research
tags: [Design]
cover: cover.png       # optional
draft: false           # true keeps it off the site
# case studies only
private: IBM
role: Senior engineer
when: 2023 to 2025
team: 6
stack: [Java, Kafka, OpenShift]
numbers:
  - { value: "40%", label: "fewer failed runs" }
---

Write in Markdown. `## Headings` become the "On this page" rail.

![Alt text for screen readers](cover.png "Caption under the picture")

```mermaid
graph LR; Agent --> Script --> Tools
```
```

At build time, before the site is drawn:

- **Front matter is checked** against a typed schema (the same way builds are); a missing title, a bad date or an unknown kind fails the build with the file's name.
- **The slug** is the folder name, so the address is `/writing/<folder>/`. Each piece gets its own HTML page, title, description, social image and a place in the sitemap and RSS feed, like every other page.
- **Markdown becomes HTML once, at build time,** so a post ships no Markdown parser and no extra script: the page is text and images.
- **Images** are turned into WebP at two widths with their sizes recorded, so they load lazily without jumping.
- **Diagrams** written as `mermaid` blocks are drawn into still SVGs, a light and a dark one, by the headless browser the build already uses. No diagram library reaches the visitor.
- **Sketches** are SVG files used as they are.
- **The index and home** read the same list, with the Substack feed and the paper merged in, newest first.
- **Drafts** stay out of the build; nothing on the site until it's decided.
