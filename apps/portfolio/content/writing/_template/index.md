---
# One template for every piece. Copy this folder to content/writing/<your-slug>/ (lowercase, hyphens);
# the folder name becomes the address /writing/<your-slug>/. Folders starting with _ are never published.

# Required
title: A short, plain title
summary: One or two sentences, shown under the title, in the list and in search results.
date: 2026-11-22          # YYYY-MM-DD, the day it is published
kind: essay               # essay | case-study | research (what the piece is: its label and how search engines read it)
category: Agents          # the filter on /writing/ is made from these; reuse the same words to group posts (/writing/?category=agents)

# Optional (delete any line you don't need)
tags: [Design, Agents]    # small pills at the foot of the page
draft: true               # true keeps it off the site; delete the line (or set false) to publish
masthead: letter          # letter (the default) | torn
private: IBM              # for work that can't be linked; shows "IBM · Private" and no code or demo links

# Optional "at a glance" column beside the title (usually for case studies). Leave out for a plain heading.
facts:
  - { label: Role, value: Senior engineer }
  - { label: When, value: 2023 to 2025 }
  - { label: Team, value: "6" }
  - { label: Stack, value: "Java, Kafka, OpenShift" }

# Optional headline numbers across the foot of the heading. Only numbers that are true and allowed.
numbers:
  - { value: "40%", label: fewer failed runs }

# Optional one line under the numbers.
note: A private project, so no code, data or client names are shared.
---

Write the post in plain Markdown below the line above.

## A section heading

Every `##` heading becomes an entry in Contents. To give one a fixed address, end it with `{#my-id}`.

Paragraphs, **bold**, *italic*, `inline code`, [links](https://example.com), lists and > quotes all work.

```ts
// Code blocks keep their spacing and scroll sideways on small screens.
const answer = 42
```

## Pictures, sketches and diagrams

Put the file in this folder and use its name. The text in quotes becomes the caption.
For diagrams and sketches, follow DRAWING.md in this folder (give it to whichever AI draws them), and match
sample-diagram.svg and sample-sketch.svg.

![What the picture shows, for screen readers](picture.webp "A caption under the picture")

For a drawing that needs a dark version, add a second file with .dark before the extension
(diagram.svg and diagram.dark.svg); the page shows the one that matches the theme.

![A diagram of how the parts connect](diagram.svg "How the parts connect")

Every picture loads only when it nears the screen, and can be tapped to open full size.
