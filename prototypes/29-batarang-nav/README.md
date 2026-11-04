# 29. Batarang navigation

The scroll thumb becomes the site's only navigation. It runs over the real built site, so nothing in `apps/web` changes.

- **Closed:** the batarang tells you where you are. It sits exactly on a section's mark when you land there.
- **Open:** hover or click on a computer, tap on a phone. A line draws top to bottom with the stops on it. A stop on this page scrolls there, and one on another page goes there.
- **Header:** the logo and Resume. On a phone the theme moves inside the batarang's menu. No hamburger.

```bash
pnpm build
```

```bash
node prototypes/29-batarang-nav/serve.mjs
```

It prints a local address and one for a phone on the same Wi-Fi. Resume doesn't go anywhere yet: the resume site is its own prototype.
