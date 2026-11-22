# 38. Research & writing

A "Research & writing" panel on home, right after Featured builds. Builds are folders; research is paper.

- **The paper:** one raised sheet with the words on the left and page one of the PDF on the right, printed on white with a second sheet turned behind it. Hovering straightens it and lifts it a little. On phones and tablets (under 760px) the page sits on top, smaller and centred.
- **Words:** `Paper · 2026 · cs.AI`, the title (The Blind Script), its subtitle, a two-line summary, and one number in the featured cards' voice: "3 → 36 of 48 quiet faults caught, before and after the digest (qwen3:4b)". Every fact is from the paper and its repository.
- **Actions:** Read the paper and View on GitHub as dotted text links, then the one solid button, **Endorse on arXiv**. It opens a short note: an independent researcher submitting to cs.AI, one endorsement needed, the endorsement code "coming with the submission", and a link to arXiv's page on how endorsement works. Escape or a click outside closes it.
- **Writing:** one quiet line under the paper, past a hairline: the label, the three latest Substack posts (from the feed on 22 Nov 2026), each tagged SUBSTACK, and All writing. On phones they stack, each tag following its title.
- **Later:** posts written on this site get the tag HERE; All writing then leads to a /writing/ page.

`paper-p1.webp` is page one of `paper/main.pdf` from the repository, rendered at 778 × 1100.

It runs over the real built site, so nothing in `apps/portfolio` changes.

```bash
pnpm build
```

```bash
node prototypes/38-research-writing/serve.mjs
```

Open `/` and scroll past Featured builds.
