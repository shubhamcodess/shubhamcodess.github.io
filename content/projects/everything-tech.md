---
slug: everything-tech
title: EverythingTech
line: A daily tech newspaper with no human editor. It reads 45+ sources overnight, merges the duplicates and writes each story from the full article.
stack: [Python, GitHub Actions, GitHub Pages, Claude Code routines]
status: Live, daily 08:30 IST
since: "2026-09"
live: true
stage: newsletter-fold
facts:
  - { value: "45+", label: "Sources read overnight" }
  - { value: "08:30", label: "Live daily, IST" }
  - { value: "0", label: "Servers" }
visibility: listed
order: 1
private: false
links:
  - { label: "Today's paper", href: "https://shubhamcodess.github.io/everything-tech-newsletter/", kind: site }
  - { label: Code, href: "https://github.com/shubhamcodess/everything-tech-newsletter", kind: code }
  - { label: RSS, href: "https://shubhamcodess.github.io/everything-tech-newsletter/feed.xml", kind: feed }
---

A daily tech newspaper with no human editor. It reads 45+ free sources overnight, merges the duplicates and writes each story from the full article. There is no server, database or API key.

## How a day's paper is made

1. **Collect:** Python gathers articles from the sources.
2. **Sort:** coverage of the same story collapses into one, crediting every outlet.
3. **Write:** a scheduled routine picks, ranks and writes from the full text.
4. **Check:** a validator rejects copied sentences, filler and cut-off prose.
5. **Publish:** CI merges the edition once checks pass, and GitHub Pages serves it.

## What I built

- Scripts do everything mechanical. The model only picks, ranks and writes, and it never writes HTML.
- Each day is kept as a Markdown edition. One client-side template renders every date, so a design change updates the whole archive.
- The context is token-budgeted, so a small model can run the paper reliably.
- Sources, interests, edition size and site theme are all config, so it can be forked.
- The paper also comes out as Markdown, JSON and RSS, and the archive prunes itself after 30 days.
