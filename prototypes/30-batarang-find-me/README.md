# 30. Batarang navigation, with Where to find me

Prototype 29, with three changes: the whole right edge opens it on a computer, a faint scale at rest shows it's there, and the stops are only this page's sections, ending on a new Where to find me. Projects is reached from See all my builds. It runs over the real built site, so nothing in `apps/web` changes.

- **Closed:** the batarang tells you where you are. It sits exactly on a section's mark when you land there.
- **Open:** hover or click on a computer, tap on a phone. A line draws top to bottom with the stops on it. A stop scrolls there, or from another page goes there.
- **Header:** the logo and Resume. On a phone the theme moves inside the batarang's menu. No hamburger.

```bash
pnpm build
```

```bash
node prototypes/30-batarang-find-me/serve.mjs
```

It prints a local address and one for a phone on the same Wi-Fi. Resume doesn't go anywhere yet: the resume site is its own prototype.
