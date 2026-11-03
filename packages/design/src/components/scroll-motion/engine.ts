import Lenis from "lenis";

export type ScrollMotionOptions = {
  /** Lenis smoothing per frame. Higher is quicker to settle, and 0 keeps native scrolling. */
  lerp: number;
  /** Scales each layer's lateness behind the scroll. */
  lag: number;
  /** Scales each layer's drift by its place on screen. */
  parallax: number;
};

/* a keeps up, d trails. Each is how quickly a layer catches the scroll, per second, and how far it drifts across the screen. */
const RATES: Record<string, number> = { a: 18, b: 13, c: 10, d: 7.5 };
const DRIFT: Record<string, number> = { a: 0.012, b: 0.03, c: 0.055, d: 0.08 };
const MAX_LATE = 140;

export type RevealState = "below" | "in" | "above";

/** Where a block is relative to the screen. The overlap between thresholds stops a block on the line from flickering. */
export function nextRevealState(current: RevealState | undefined, top: number, bottom: number, viewport: number): RevealState {
  if (top > viewport * 0.92) return "below";
  if (bottom < 90) return "above";
  if (top < viewport * 0.84 && bottom > 130) return "in";
  return current ?? "below";
}

type Layer = { el: HTMLElement; rate: number; drift: number; follow: number; top: number; h: number; on: boolean };
type Block = { el: HTMLElement; top: number; h: number; state: RevealState | undefined };

/**
 * Three independent parts. Smooth scroll moves the page. Layers follow it a beat late at their own rate, and drift by their place on screen.
 * Reveal gives each block a state, and CSS animates the rest.
 * Mark content with `data-block` and `data-layer="a|b|c|d"`. Returns a function that stops it all.
 */
export function startScrollMotion(page: HTMLElement, content: HTMLElement, options: ScrollMotionOptions) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* A finger scrolls on the browser's own thread, so a layer moved from this one always lands a frame apart from it, and that reads as judder. On touch the page scrolls natively, and only the reveals run. */
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  let layers: Layer[] = [], blocks: Block[] = [];

  const baseTop = (el: HTMLElement) => {
    let y = 0, n: HTMLElement | null = el;
    while (n && n !== page) { y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
    return y;
  };
  // Layout positions, unaffected by this engine's own transforms. Rescanned whenever the content changes size.
  const measure = () => {
    const oldLayers = new Map(layers.map((l) => [l.el, l])), oldBlocks = new Map(blocks.map((b) => [b.el, b]));
    layers = [...content.querySelectorAll<HTMLElement>("[data-layer]")].map((el) => {
      const key = el.dataset.layer ?? "b";
      return { el, rate: RATES[key] ?? RATES.b!, drift: DRIFT[key] ?? DRIFT.b!, follow: oldLayers.get(el)?.follow ?? page.scrollTop, top: baseTop(el), h: el.offsetHeight, on: oldLayers.get(el)?.on ?? false };
    });
    blocks = [...content.querySelectorAll<HTMLElement>("[data-block]")].map((el) => ({ el, top: baseTop(el), h: el.offsetHeight, state: oldBlocks.get(el)?.state ?? (el.dataset.state as RevealState | undefined) }));
  };
  measure();

  const lenis = reduced || touch || !options.lerp ? null : new Lenis({
    wrapper: page, content, eventsTarget: document.documentElement, lerp: options.lerp, smoothWheel: true, syncTouch: false, autoRaf: false, anchors: true,
    // Things that scroll on their own keep their wheel.
    prevent: (node: HTMLElement) => !!node.closest?.("[data-scroll-own]"),
  });

  let last = performance.now(), raf = 0;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    lenis?.raf(now);
    const s = page.scrollTop, vh = innerHeight;
    for (const b of blocks) {
      const state = nextRevealState(b.state, b.top - s, b.top - s + b.h, vh);
      if (state !== b.state) { b.state = state; b.el.dataset.state = state; }
    }
    if (!reduced && !touch) {
      for (const l of layers) {
        l.follow += (s - l.follow) * (1 - Math.exp(-dt * l.rate));
        // What starts on the first screen rests exactly where it was laid out. It only drifts once scrolling starts.
        const place = l.top < vh ? -s : l.top - s + l.h / 2 - vh / 2;
        if (Math.abs(l.top - s + l.h / 2 - vh / 2) > vh * 1.6) { if (l.on) { l.el.style.translate = ""; l.on = false; } continue; }
        l.on = true;
        const late = Math.max(-MAX_LATE, Math.min(MAX_LATE, (s - l.follow) * options.lag));
        l.el.style.translate = `0 ${(late + place * l.drift * options.parallax).toFixed(2)}px`;
      }
    }
    raf = touch ? 0 : requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  const wake = () => { raf ||= requestAnimationFrame(frame); };
  const remeasure = () => { measure(); if (touch) wake(); };

  if (touch) page.addEventListener("scroll", wake, { passive: true });
  const watch = new ResizeObserver(remeasure);
  watch.observe(content);
  addEventListener("resize", remeasure);
  document.fonts?.ready.then(remeasure);

  return () => {
    cancelAnimationFrame(raf); page.removeEventListener("scroll", wake); watch.disconnect(); removeEventListener("resize", remeasure); lenis?.destroy();
    for (const l of layers) l.el.style.translate = "";
  };
}
