/* The story's figure: one Gotham, drawn in pen, that the scroll pulls back from chapter by chapter. Chapter 1, "Keeping it running": a close shot of an old tower by the river, an elevated line running past it on a lattice trestle. A brace cracks as you scroll, the lamp and a window falter, the pen redraws the brace, and the light holds. The train never stops.
   draw() is a function of three clocks: the intro (time since it first showed), the chapter's scroll (0 to 1) and plain time for the life that never stops (the train, the water). The same inputs give the same picture. */
export const GothamStory = (() => {
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (v) => { v = clamp(v); return v * v * v * (v * (v * 6 - 15) + 10); };
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const LEAVE = 0.74; // Matches story-motion: the share of its slot a chapter holds before it leaves.
  const INTRO = 2.6; // Seconds the pen takes to lay the scene down.

  /* ---------- The world, in units. y grows downward. Layers: 0 far city, 1 the tower and its neighbour, 2 the el and the quay. ---------- */
  const QUAY = 8, DECK = 6.15, TRUSS = 6.85, WATER = 8.55;
  const strokes = [], windows = [], lamps = [];
  let seed = 1;
  const line = (x1, y1, x2, y2, layer, style, at) => strokes.push({ x1, y1, x2, y2, layer, style, at, seed: seed++ });
  const box = (x0, y0, x1, y1, layer, style, at) => { line(x0, y1, x0, y0, layer, style, at); line(x0, y0, x1, y0, layer, style, at + .02); line(x1, y0, x1, y1, layer, style, at + .04); };

  // Far city: thin towers in the haze, their windows only specks of light.
  for (let i = 0; i < 30; i++) {
    const x = -2 + i * .68 + hash(i) * .4, w = .35 + hash(i + 40) * .7, top = 1.2 + hash(i + 80) * 3.6;
    box(x, top, x + w, DECK, 0, 'far', .02 + (i / 30) * .3);
    if (hash(i + 120) > .55) line(x + w / 2, top, x + w / 2, top - .3 - hash(i) * .6, 0, 'far', .3);
    for (let k = 0; k < 6; k++) if (hash(i * 9 + k) > .6) windows.push({ x: x + .08 + hash(i * 7 + k) * (w - .2), y: top + .3 + hash(i * 5 + k) * (DECK - top - .5), w: .05, h: .07, layer: 0, lit: true, dim: .45, seed: i * 9 + k });
  }

  // The tower: three setbacks, pilasters, a great arch at its foot, a spire lost above the frame.
  const T = [[3.0, 7.2, 3.3], [3.5, 6.7, 1.7], [4.15, 6.05, .75]];
  T.forEach(([x0, x1, top], s) => {
    const bottom = s === 0 ? QUAY : T[s - 1][2];
    box(x0, top, x1, bottom, 1, 'ink', .14 + s * .05);
    const n = s === 0 ? 7 : s === 1 ? 6 : 4;
    for (let p = 1; p < n; p++) {
      const px = x0 + (x1 - x0) * p / n;
      line(px, top + .08, px, bottom, 1, 'pilaster', .2 + s * .05 + p * .01);
      // Gothic finials: each pilaster runs past the cornice into a point.
      line(px - .06, top, px, top - .32, 1, 'ink', .3 + s * .05); line(px + .06, top, px, top - .32, 1, 'ink', .3 + s * .05);
    }
    for (const ex of [x0, x1]) { line(ex - .07, top, ex, top - .42, 1, 'ink', .3 + s * .05); line(ex + .07, top, ex, top - .42, 1, 'ink', .3 + s * .05); }
    line(x0 - .08, top, x1 + .08, top, 1, 'ink', .22 + s * .05); // cornice runs past the corners
    // Windows between pilasters, a few lit.
    for (let p = 0; p < n; p++) for (let r = 0; ; r++) {
      const y = top + .32 + r * .42;
      if (y > bottom - .3 || (s === 0 && y > 5.7)) break;
      const cw = (x1 - x0) / n, wx = x0 + cw * p + cw * .3;
      windows.push({ arch: true, x: wx + cw * .06, y, w: cw * .28, h: .27, layer: 1, lit: hash(s * 50 + p * 7 + r) > .72, dim: 1, seed: s * 50 + p * 7 + r });
    }
  });
  line(5.1, .75, 5.1, -.6, 1, 'ink', .32); line(4.85, .75, 5.1, -.2, 1, 'ink', .33); line(5.35, .75, 5.1, -.2, 1, 'ink', .33);
  // The arch: a round head on two jambs, and its keystone.
  const AX = 5.1, AR = .78, AY = 6.75;
  line(AX - AR, QUAY, AX - AR, AY, 1, 'ink', .26); line(AX + AR, QUAY, AX + AR, AY, 1, 'ink', .26);
  for (let k = 0; k < 12; k++) { const a = Math.PI + (k / 12) * Math.PI, b = Math.PI + ((k + 1) / 12) * Math.PI; line(AX + Math.cos(a) * AR, AY + Math.sin(a) * AR, AX + Math.cos(b) * AR, AY + Math.sin(b) * AR, 1, 'ink', .27 + k * .004); }
  line(AX - .1, AY - AR - .12, AX + .1, AY - AR - .12, 1, 'ink', .3);
  // Solid masses: they hide the far city behind them and carry a faint tone, so the near city reads as heavier than the haze.
  const MASSES = [
    ...T.map(([x0, x1, top], s) => ({ pts: [[x0, s === 0 ? QUAY : T[s - 1][2]], [x0, top], [x1, top], [x1, s === 0 ? QUAY : T[s - 1][2]]], tone: .07, layer: 1 })),
    { pts: [[4.85, .75], [5.1, -.6], [5.35, .75]], tone: .07, layer: 1 },
    { pts: [[11.2, QUAY], [11.2, 2.1], [17, 2.1], [17, QUAY]], tone: .13, layer: 1 },
  ];
  const TOWER_WINDOW = windows.findIndex((w) => w.layer === 1 && w.lit && w.y > 3.5); // the one that falters

  // The neighbour on the right: a dark wall, mostly in shadow.
  box(11.2, 2.1, 17, QUAY, 1, 'ink', .18);
  for (let p = 1; p < 7; p++) line(11.2 + p * .82, 2.25, 11.2 + p * .82, QUAY, 1, 'pilaster', .22 + p * .01);
  for (let p = 0; p < 7; p++) for (let r = 0; r < 8; r++) windows.push({ x: 11.5 + p * .82, y: 2.6 + r * .42, w: .24, h: .24, layer: 1, lit: hash(200 + p * 13 + r) > .82, dim: .9, seed: 200 + p * 13 + r });

  // The el: deck, a lattice trestle under it, and lattice towers down to the quay.
  const PANEL = .8, X0 = -2, X1 = 18;
  line(X0, DECK, X1, DECK, 2, 'ink', .4); line(X0, DECK + .16, X1, DECK + .16, 2, 'ink', .42); line(X0, TRUSS, X1, TRUSS, 2, 'ink', .44);
  const panels = [];
  for (let x = X0, i = 0; x < X1; x += PANEL, i++) {
    line(x, DECK + .16, x, TRUSS, 2, 'thin', .45 + i * .006);
    if (Math.abs(x + PANEL / 2 - 8.6) < PANEL / 2) panels.push({ x }); // the brace that cracks is drawn on its own
    else line(x, DECK + .16, x + PANEL, TRUSS, 2, 'thin', .46 + i * .006);
    line(x + PANEL, DECK + .16, x, TRUSS, 2, 'thin', .46 + i * .006);
  }
  const BRACE = panels[0];
  for (const cx of [1.4, 8.6 - PANEL * 2.5, 14.4]) {
    line(cx - .22, TRUSS, cx - .3, QUAY, 2, 'ink', .52); line(cx + .22, TRUSS, cx + .3, QUAY, 2, 'ink', .52);
    for (let y = TRUSS, k = 0; y < QUAY - .1; y += .3, k++) line(cx + (k % 2 ? .24 : -.24), y, cx + (k % 2 ? -.25 : .25), y + .3, 2, 'thin', .55 + k * .005);
  }
  // Rails on the deck, a cornice of rivets.
  for (let x = X0; x < X1; x += .4) line(x, DECK - .06, x, DECK, 2, 'thin', .48 + (x - X0) * .002);

  // The quay: its wall, a railing, signal lamps, and a street lamp by the arch.
  line(X0, QUAY, X1, QUAY, 2, 'ink', .58); line(X0, QUAY + .25, X1, QUAY + .25, 2, 'thin', .6);
  line(X0, QUAY - .42, X1, QUAY - .42, 2, 'thin', .62);
  for (let x = X0 + .3; x < X1; x += .6) line(x, QUAY - .42, x, QUAY, 2, 'thin', .62 + (x - X0) * .003);
  const LAMP = { x: 8.9, top: 7.05 };
  line(LAMP.x, QUAY, LAMP.x, LAMP.top, 2, 'ink', .66); line(LAMP.x, LAMP.top, LAMP.x - .32, LAMP.top - .08, 2, 'ink', .67);
  lamps.push({ x: LAMP.x - .34, y: LAMP.top + .02, r: 1.1, main: true });
  for (const x of [2.1, 10.6, 13.8]) lamps.push({ x, y: QUAY - .5, r: .28, signal: true });

  /* ---------- Drawing ---------- */
  function mount(canvas, opts) {
    const ctx = canvas.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const chapter = opts.chapter ?? 0, count = opts.count ?? 4, story = opts.story ?? (() => ({ progress: 0, live: false }));
    const scene = canvas.closest('[data-scene]'), host = canvas.closest('.story-frame') || canvas;
    let w = 0, h = 0, dpr = 1, colors = {}, raf = 0, visible = false, shownAt = -1, t0 = performance.now();
    let yawT = 0, yawS = 0;

    function readColors() {
      const s = getComputedStyle(canvas), v = (n) => s.getPropertyValue(n).trim();
      colors = { line: v('--line'), rest: v('--line-rest'), ink: v('--ink'), ink2: v('--ink-2'), accent: v('--accent') };
    }
    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      return true;
    }

    /** How far through its chapter the scroll is, 0 to 1. Without the film (no pin, or reduced motion) it's the finished chapter. */
    function beat() {
      const s = story();
      if (!s.live || reduced) return 1;
      return clamp((s.progress * count - chapter) / (LEAVE * .92));
    }

    function draw(now) {
      const time = reduced ? 3.2 : (now - t0) / 1000;
      const intro = reduced ? 1 : shownAt < 0 ? 0 : clamp((now - shownAt) / 1000 / INTRO);
      const c = beat();
      const crack = ease(span(c, .1, .38)), fix = ease(span(c, .44, .8)), trouble = crack * (1 - fix);

      // Camera: a close shot of the tower's foot and the el, pushing in slowly as the chapter plays.
      const zoom = 1 + c * .05, s = Math.max(w / 11.2, h / 6.9) * zoom, fx = 7.6, fy = 6.05;
      const X = (x, layer) => w / 2 + (x - fx) * s + yawS * (layer === 0 ? 4 : layer === 1 ? 9 : 16);
      const Y = (y) => h * .52 + (y - fy) * s;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';

      const pen = (k, x1, y1, x2, y2, layer, reveal, width = 1) => {
        if (reveal <= 0) return;
        const ax = X(x1, layer), ay = Y(y1), bx0 = X(x2, layer), by0 = Y(y2);
        const bx = ax + (bx0 - ax) * reveal, by = ay + (by0 - ay) * reveal;
        const len = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.round(len / 16)), nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
        ctx.lineWidth = width;
        ctx.beginPath(); ctx.moveTo(ax, ay);
        for (let i = 1; i <= n; i++) { const t = i / n, j = (hash(k * 31 + i) - .5) * .9 * Math.sin(Math.PI * t); ctx.lineTo(ax + (bx - ax) * t + nx * j, ay + (by - ay) * t + ny * j); }
        ctx.stroke();
      };
      const reveal = (at) => span(intro, at, at + .22);

      const lightsOn = ease(span(intro, .68, .95));
      const strokesOf = (layer) => {
        for (const st of strokes) {
          if ((st.layer === 0) !== (layer === 0)) continue;
          const r = reveal(st.at);
          if (!r) continue;
          ctx.strokeStyle = st.style === 'far' ? colors.rest : colors.line;
          ctx.globalAlpha = st.style === 'far' ? .34 : st.style === 'pilaster' ? .4 : st.style === 'thin' ? .62 : .85;
          pen(st.seed, st.x1, st.y1, st.x2, st.y2, st.layer, r, st.style === 'ink' ? 1.1 : .8);
        }
      };
      // A lancet window: straight jambs and a pointed head.
      const win = (x, y, ww, hh) => { ctx.beginPath(); ctx.moveTo(x, y + hh); ctx.lineTo(x, y + ww * .5); ctx.lineTo(x + ww / 2, y - ww * .35); ctx.lineTo(x + ww, y + ww * .5); ctx.lineTo(x + ww, y + hh); ctx.closePath(); };
      const windowsOf = (layer) => windows.forEach((wn, i) => {
        if ((wn.layer === 0) !== (layer === 0)) return;
        const x = X(wn.x, wn.layer), y = Y(wn.y), ww = wn.w * s, hh = wn.h * s;
        if (wn.lit) {
          let level = lightsOn * wn.dim * (.85 + .15 * Math.sin(time * .6 + wn.seed));
          if (i === TOWER_WINDOW) level *= 1 - trouble * (1 - flick(7));
          ctx.globalAlpha = (wn.layer === 0 ? .45 : .58) * level; ctx.fillStyle = colors.accent;
          if (wn.arch) { win(x, y, ww, hh); ctx.fill(); } else ctx.fillRect(x, y, ww, hh);
        } else if (wn.layer === 1) {
          ctx.globalAlpha = .26 * reveal(.3); ctx.strokeStyle = colors.rest; ctx.lineWidth = .6;
          if (wn.arch) { win(x, y, ww, hh); ctx.stroke(); } else ctx.strokeRect(x, y, ww, hh);
        }
      });
      const shape = (m) => { ctx.beginPath(); m.pts.forEach(([x, y], k) => (k ? ctx.lineTo(X(x, m.layer), Y(y)) : ctx.moveTo(X(x, m.layer), Y(y)))); ctx.closePath(); };

      // The far city in the haze, then the near masses cut out of it and toned.
      strokesOf(0); windowsOf(0);
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1;
      for (const m of MASSES) { shape(m); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = colors.line;
      for (const m of MASSES) { ctx.globalAlpha = m.tone * reveal(.2); shape(m); ctx.fill(); }
      // The quay wall and the el's deck are solid too.
      ctx.globalAlpha = .14 * reveal(.5); ctx.fillRect(X(-2, 2), Y(QUAY), X(18, 2) - X(-2, 2), .25 * s);
      ctx.globalAlpha = .1 * reveal(.45); ctx.fillRect(X(-2, 2), Y(DECK), X(18, 2) - X(-2, 2), .16 * s);

      // Light, under the near lines: the lamp's sodium pool and the signals.
      const flick = (k) => (hash(Math.floor(time * 13) + k) > .45 ? 1 : .15);
      const lampLevel = (1 - trouble * (1 - flick(3))) * ease(span(intro, .75, 1));
      for (const l of lamps) {
        const level = l.main ? lampLevel : (.6 + .4 * Math.sin(time * 1.7 + l.x)) * ease(span(intro, .8, 1));
        const x = X(l.x, 2), y = Y(l.y), r = l.r * s;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, colors.accent); g.addColorStop(1, 'transparent');
        ctx.globalAlpha = (l.main ? .32 : .22) * level; ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = .9 * level; ctx.fillStyle = colors.accent;
        ctx.beginPath(); ctx.arc(x, y, l.main ? 2.2 : 1.6, 0, Math.PI * 2); ctx.fill();
      }

      // The near city's lines.
      strokesOf(1);

      // Shadow on the tower's right face and the neighbour: hatching that rises from the foot and fades.
      ctx.lineWidth = .7;
      for (const [x0, x1, y0, y1, a] of [[5.8, 7.2, 3.3, QUAY, .5], [11.2, 17, 2.1, QUAY, .42]]) {
        ctx.save(); ctx.beginPath(); ctx.rect(X(x0, 1), Y(y0), X(x1, 1) - X(x0, 1), Y(y1) - Y(y0)); ctx.clip();
        const fade = ctx.createLinearGradient(0, Y(y1), 0, Y(y0));
        fade.addColorStop(0, colors.rest); fade.addColorStop(.55, 'transparent');
        ctx.strokeStyle = fade;
        for (let k = -(y1 - y0); k < x1 - x0; k += .16) {
          const r = reveal(.5 + (k + 6) * .01);
          if (!r) continue;
          ctx.globalAlpha = a * r;
          ctx.beginPath(); ctx.moveTo(X(x0 + k, 1), Y(y1)); ctx.lineTo(X(x0 + k + (y1 - y0), 1), Y(y0)); ctx.stroke();
        }
        ctx.restore();
      }

      windowsOf(1);

      // The brace: whole, then cracked and sagging, then redrawn by the pen.
      const bx = BRACE.x, top = DECK + .16, r0 = reveal(.47);
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .62;
      if (crack === 0 || fix === 1) {
        if (fix === 1) { ctx.strokeStyle = colors.ink; ctx.globalAlpha = .85; }
        pen(901, bx, top, bx + PANEL, TRUSS, 2, r0, fix === 1 ? 1.1 : .8);
      } else {
        const mx = bx + PANEL / 2, my = (top + TRUSS) / 2, gap = .1 * crack, sag = .2 * crack;
        ctx.globalAlpha = .62 * (1 - fix * .7);
        pen(902, bx, top, mx - gap, my - gap + sag, 2, 1, .8);
        pen(903, mx + gap, my + gap + sag * 1.6, bx + PANEL, TRUSS, 2, 1, .8);
        // A short spark at the break while it's failing.
        ctx.strokeStyle = colors.accent; ctx.globalAlpha = trouble * (.5 + .5 * flick(11));
        for (let k = 0; k < 4; k++) { const a = hash(k + Math.floor(time * 9)) * Math.PI * 2; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(X(mx, 2), Y(my + sag)); ctx.lineTo(X(mx, 2) + Math.cos(a) * 11, Y(my + sag) + Math.sin(a) * 11); ctx.stroke(); }
        // The pen redraws it, in ink.
        if (fix > 0) {
          ctx.strokeStyle = colors.ink; ctx.globalAlpha = .9;
          pen(904, bx, top, bx + PANEL, TRUSS, 2, fix, 1.2);
          const px = X(bx + PANEL * fix, 2), py = Y(top + (TRUSS - top) * fix);
          ctx.globalAlpha = .9; ctx.lineWidth = 1; ctx.strokeStyle = colors.ink;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 5, py - 13); ctx.lineTo(px + 9, py - 11); ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px + 7, py - 12); ctx.lineTo(px + 15, py - 32); ctx.stroke();
        }
      }

      // The train: three cars, lit, that never stop. Here before the scene is fully drawn, because it always was.
      const carL = 2.25, gapL = .12, trainL = carL * 3 + gapL * 2, loop = X1 - X0 + trainL + 6;
      const head = X0 - 3 + ((time * 1.9) % loop);
      const trainIn = ease(span(intro, .4, .8));
      for (let k = 0; k < 3; k++) {
        const x1 = head - k * (carL + gapL), x0 = x1 - carL;
        ctx.strokeStyle = colors.line; ctx.globalAlpha = .85 * trainIn; ctx.lineWidth = 1;
        ctx.strokeRect(X(x0, 2), Y(DECK - .62), carL * s, .56 * s);
        ctx.globalAlpha = .5 * trainIn; ctx.beginPath(); ctx.moveTo(X(x0 + .06, 2), Y(DECK - .66)); ctx.lineTo(X(x1 - .06, 2), Y(DECK - .66)); ctx.stroke();
        ctx.fillStyle = colors.accent;
        for (let q = 0; q < 6; q++) { ctx.globalAlpha = .55 * trainIn * (hash(k * 6 + q) > .2 ? 1 : .3); ctx.fillRect(X(x0 + .16 + q * .35, 2), Y(DECK - .5), .22 * s, .2 * s); }
      }
      // Its headlight on the rails ahead.
      const hx = X(head, 2), hy = Y(DECK - .3), g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 1.4 * s);
      g.addColorStop(0, colors.accent); g.addColorStop(1, 'transparent');
      ctx.globalAlpha = .25 * trainIn; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, 1.4 * s, 0, Math.PI * 2); ctx.fill();

      // The river: short strokes that drift, and the city's lights broken up in it.
      ctx.lineWidth = .7;
      for (let i = 0; i < 46; i++) {
        const y = WATER + .1 + hash(i) * 1.6, x = -1 + hash(i + 70) * 18 + Math.sin(time * .5 + i) * .15, len = .2 + hash(i + 9) * .6;
        ctx.globalAlpha = .3 * reveal(.6 + hash(i) * .2) * (.6 + .4 * Math.sin(time * 1.3 + i * 2));
        ctx.strokeStyle = colors.rest; ctx.beginPath(); ctx.moveTo(X(x, 2), Y(y)); ctx.lineTo(X(x + len, 2), Y(y)); ctx.stroke();
      }
      ctx.strokeStyle = colors.accent;
      for (const l of [...lamps, { x: 5.4, main: false }, { x: 12.3 }, { x: 4.2 }]) {
        for (let k = 0; k < 5; k++) {
          const y = WATER + .12 + k * .2, wob = Math.sin(time * 2.1 + k * 1.7 + l.x) * .08, len = (.3 - k * .04) * (.7 + .3 * Math.sin(time * 3 + k));
          ctx.globalAlpha = (l.main ? .5 * lampLevel : .3 * lightsOn) * (1 - k * .17);
          ctx.beginPath(); ctx.moveTo(X(l.x - len / 2 + wob, 2), Y(y)); ctx.lineTo(X(l.x + len / 2 + wob, 2), Y(y)); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Draws only while this chapter is on screen; the scroll clock is read every frame.
    const showing = () => visible && (!scene || Number(scene.style.opacity || 1) > .01);
    function frame(now) {
      raf = 0;
      if (!showing()) return;
      if (shownAt < 0) shownAt = now;
      yawS += (yawT - yawS) * .08;
      draw(now);
      if (!reduced) raf = requestAnimationFrame(frame);
    }
    const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const onMove = (e) => { if (e.pointerType === 'touch') return; const r = host.getBoundingClientRect(); yawT = ((e.clientX - r.left) / r.width - .5) * 2; wake(); };
    const onLeave = () => { yawT = 0; wake(); };
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); });
    const ro = new ResizeObserver(() => { if (resize()) { readColors(); draw(performance.now()); } });
    const mo = new MutationObserver(() => { readColors(); wake(); });
    const tick = () => wake();
    io.observe(canvas); ro.observe(canvas);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette', 'style', 'class'] });
    host.addEventListener('pointermove', onMove); host.addEventListener('pointerleave', onLeave);
    document.getElementById('page')?.addEventListener('scroll', tick, { passive: true });
    readColors(); resize(); wake();
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); mo.disconnect();
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
      document.getElementById('page')?.removeEventListener('scroll', tick);
    };
  }

  return { mount };
})();
