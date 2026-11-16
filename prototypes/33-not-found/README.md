# 33. Not-found page

The page anyone sees at an address with no page. Until now the 404 drew the home page under a "Page not found" title, which looked like the site was broken.

- **Kept:** the header and the night sky from home, so it still feels like the site.
- **Says:** a small mono `404`, "Page not found" at the hero's size, and the address that was typed, so the visitor sees what went wrong.
- **Leads on:** two buttons in the hero's style, Home and Builds. No other sections.
- **Stays:** status 404 and noindex, as now.

It runs over the real built site, so nothing in `apps/portfolio` changes.

```bash
pnpm build
```

```bash
node prototypes/33-not-found/serve.mjs
```

Open any address that doesn't exist, for example `/nope/`. It prints one for a phone on the same Wi-Fi too.
