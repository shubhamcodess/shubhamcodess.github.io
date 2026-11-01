/* The scroll feel, in three independent parts:
   1. Smooth scroll: Lenis moves the page itself, quick to respond and quick to settle.
   2. Layers: each piece of content follows that scroll a beat late, at its own rate, and also drifts by where it is on screen.
   3. Reveal and hide: each block knows if it's below, in view or gone above, and CSS does the rest. */
window.ScrollMotion = (() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page = document.getElementById('page'), inner = page.querySelector('.page-inner'), root = document.documentElement;
  const cfg = { lerp: .14, wheel: 1, parallax: 1, lag: 1 };
  let lenis = null;

  const RATES = { a: 18, b: 13, c: 10, d: 7.5 }; // per second: a keeps up, d trails
  const DRIFT = { a: .012, b: .03, c: .055, d: .08 };
  const layers = [...document.querySelectorAll('[data-layer]')].map((el) => ({ el, layer: el.dataset.layer, follow: 0, top: 0, h: 0 }));
  const blocks = [...document.querySelectorAll('[data-block]')].map((el) => ({ el, top: 0, h: 0, state: '' }));

  const baseTop = (el) => { let y = 0, n = el; while (n && n !== page) { y += n.offsetTop; n = n.offsetParent; } return y; };
  const measure = () => {
    for (const l of layers) { l.top = baseTop(l.el); l.h = l.el.offsetHeight; }
    for (const b of blocks) { b.top = baseTop(b.el); b.h = b.el.offsetHeight; }
  };

  const useLenis = () => {
    if (lenis) { lenis.destroy(); lenis = null; }
    if (reduced || !cfg.lerp || !window.Lenis) return;
    lenis = new Lenis({ wrapper: page, content: inner, lerp: cfg.lerp, wheelMultiplier: cfg.wheel, smoothWheel: true, syncTouch: false, autoRaf: false });
  };

  const setState = (b, vh, s) => {
    const top = b.top - s, bottom = top + b.h;
    // A little overlap between the thresholds, so a block sitting on the line doesn't flicker.
    let next = b.state;
    if (top > vh * .92) next = 'below';
    else if (bottom < 90) next = 'above';
    else if (top < vh * .84 && bottom > 130) next = 'in';
    if (next !== b.state) { b.state = next || 'below'; b.el.dataset.state = b.state; }
  };

  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (lenis) lenis.raf(now);
    const s = page.scrollTop, vh = innerHeight;
    for (const b of blocks) setState(b, vh, s);
    if (!reduced) {
      for (const l of layers) {
        l.follow += (s - l.follow) * (1 - Math.exp(-dt * RATES[l.layer]));
        const onScreen = l.top - s + l.h / 2 - vh / 2;
        if (Math.abs(onScreen) > vh * 1.6) { if (l.on) { l.el.style.translate = ''; l.on = false; } continue; }
        l.on = true;
        const late = Math.max(-140, Math.min(140, (s - l.follow) * cfg.lag));
        const drift = onScreen * DRIFT[l.layer] * cfg.parallax;
        l.el.style.translate = `0 ${(late + drift).toFixed(2)}px`;
      }
    }
    requestAnimationFrame(frame);
  };

  const start = () => {
    measure();
    for (const b of blocks) { b.state = b.top - page.scrollTop > innerHeight * .84 ? 'below' : 'in'; b.el.dataset.state = b.state; }
    for (const l of layers) l.follow = page.scrollTop;
    useLenis();
    addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure);
    requestAnimationFrame(frame);
  };

  return { start, measure, set(next) { const same = next.lerp === cfg.lerp; Object.assign(cfg, next); if (!same) useLenis(); }, get lenis() { return lenis; } };
})();
