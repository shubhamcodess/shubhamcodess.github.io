# 36. Phone header that comes back

On phones (under 600px), the header returns at the top once you've scrolled past the hero (on other pages, past the page's top) and stopped scrolling. While you scroll it stays tucked away, so it never covers what you're reading in motion.

- **When:** past the hero and still for 180ms. Any scroll sends it back up; scrolling back into the hero puts it in its own place again.
- **What:** the real header (logo, Builds, Experience, More with its sheet), floating as a rounded bar inset by the frame's edge, with a clear 1px edge and a soft shadow. Solid, no blur.
- **Colours:** it keeps the panel it came from: night on home (the hero's header), paper on paper pages.
- **No jump:** a spacer holds the header's place in the page while it floats.
- **Desktop:** unchanged.
- `demo.mp4` is a recording at iPhone 13 size.

It runs over the real built site, so nothing in `apps/portfolio` changes.

```bash
pnpm build
```

```bash
node prototypes/36-phone-header-return/serve.mjs
```

Open `/` on a phone on the same Wi-Fi (the address is printed), or in a phone-sized window.

## Second pass

The first pass floated the header as a rounded dark card with a shadow. That read as a separate box; the header should be the page's own.

- **Look:** exactly the header at the top of home: the panel's own surface (with its grain), the links, one hairline under them, no box, no shadow, full width inside the frame. Content scrolls up to that line and goes behind it.
- **Tone:** it matches the panel under it: paper over the builds and experience, night over the contact section.
- **When:** past the hero, it hides while scrolling down and comes back when you stop (180ms) or scroll up.
