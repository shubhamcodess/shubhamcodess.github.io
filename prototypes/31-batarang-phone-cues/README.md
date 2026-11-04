# 31. Batarang navigation, with phone cues

Prototype 30, plus two clues: on a phone's first visit the menu peeks once and pulls back, and on any screen, crossing into a section shows its name beside the batarang. Add `?peek` to the address to see the peek again.

Prototype 30 was 29 with three changes: the whole right edge opens it on a computer, a faint scale at rest shows it's there, and the stops are only this page's sections, ending on a new Where to find me. Projects is reached from See all my builds. It runs over the real built site, so nothing in `apps/web` changes.

- **Closed:** the batarang tells you where you are. It sits exactly on a section's mark when you land there.
- **Open:** hover or click on a computer, tap on a phone. A line draws top to bottom with the stops on it. A stop scrolls there, or from another page goes there.
- **Header:** the logo and Resume. On a phone the theme moves inside the batarang's menu. No hamburger.

```bash
pnpm build
```

```bash
node prototypes/31-batarang-phone-cues/serve.mjs
```

It prints a local address and one for a phone on the same Wi-Fi. Resume doesn't go anywhere yet: the resume site is its own prototype.
