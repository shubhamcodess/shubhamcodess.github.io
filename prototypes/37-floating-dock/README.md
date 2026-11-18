# 37. Floating dock

A small pill at the bottom centre of the screen, on every page and every screen size, so you never have to scroll to the top or the bottom to move on.

- **What's in it:** the SP mark (goes home), a thin rule, and the name of the page you're on with a four-dot glyph. Tapping the name opens every page of the site above the dock (Home, Builds, Experience, Credentials, Gallery, Contact, in the footer's order), the current one marked with a dot, and the sound and theme switches under them.
- **When:** it rises while you scroll, once the header is out of view, and settles away 1.4s after you stop. It stays while it's open, hovered or focused. At the top of a page the header does the job, so the dock stays away.
- **No shift:** it floats over the content and nothing moves under it. Moving the content would make the page jump each time it appears, and it's only up while you're scrolling.
- **Tone:** it follows what's under it: paper over paper panels, night over the hero, contact and footer.
- **Names and links:** read from the site's own footer, so they're the real ones, and a new page shows up in the list on its own.
- **Keyboard:** Tab reaches it while it's up; Escape closes the list and returns focus; a click outside closes it.
- **Reduced motion:** fades only, and lingers a little longer.

It runs over the real built site, so nothing in `apps/portfolio` changes.

```bash
pnpm build
```

```bash
node prototypes/37-floating-dock/serve.mjs
```

Open any page, on a phone on the same Wi-Fi (the address is printed) or in a browser, and scroll.
