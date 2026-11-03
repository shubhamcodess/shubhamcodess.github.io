/* The story's figures: technical blueprints, one per chapter, that together say where it started and where it got to. They're pen drawings in the theme's tones, with amber for what's live.
   Chapter 1, "Keeping it running": one workload, three platforms. It runs on OpenShift 3 while the next platform is still dashed construction lines. As you scroll it moves to OpenShift 4, then to GKE, a pod at a time, and every release above it comes through the same Helm pipeline, gate by gate.
   draw() takes three clocks: the intro (time since it first showed), the chapter's scroll (0 to 1) and plain time for what never stops (releases). The same inputs give the same picture. */
export const StoryFigures = (() => {
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (v) => { v = clamp(v); return v * v * v * (v * (v * 6 - 15) + 10); };
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const LEAVE = 0.74; // Matches story-motion: the share of its slot a chapter holds before it leaves.
  const INTRO = 1.8; // Seconds the pen takes to lay the drawing down.
  const COS = Math.cos(Math.PI / 6), SIN = Math.sin(Math.PI / 6);

  /* ---------- Chapter 1: three platforms, one workload, one pipeline ---------- */
  const PLATFORMS = ['OpenShift 3', 'OpenShift 4', 'GKE'];
  const SLAB = { w: 1.9, d: 1.3, t: .16 }, STEP = 1.95; // A slab's size, and how far apart they sit (in iso units along x and -y).
  const PODS = [[-.5, -.28], [.05, .28], [.5, -.12]]; // Where the three pods stand on a slab.
  const GATES = ['Template', 'Stage', 'Prod'];
  const RELEASE = 3.4; // Seconds between releases.

  function chapterOne(g) {
    const { ctx, s, X0, Y0, colors, intro, c, time, pen, label } = g;
    const iso = (x, y, z) => [X0 + (x - y) * COS * s, Y0 + (x + y) * SIN * s - z * s];
    const at = (k) => [k * STEP, -k * STEP]; // A slab's centre: the row runs across the screen.
    const reveal = (a) => span(intro, a, a + .35);

    // The move: 0 to 2 platforms along. Each move takes the pods across one after another.
    const m1 = span(c, .14, .5), m2 = span(c, .56, .92), here = ease(m1) + ease(m2);
    const podAt = (i) => {
      const stage = m2 > 0 ? 1 : 0, local = stage ? m2 : m1;
      const p = ease(span(local, i * .16, i * .16 + .62));
      const [ax, ay] = at(stage), [bx, by] = at(stage + 1), [ox, oy] = PODS[i];
      return { x: ax + ox + (bx - ax) * p, y: ay + oy + (by - ay) * p, z: Math.sin(Math.PI * p) * .9, moving: p > 0 && p < 1 };
    };

    // The slabs: solid where the workload is or was, dashed where it hasn't got to yet. The one it left goes quiet.
    PLATFORMS.forEach((name, k) => {
      const [cx, cy] = at(k), r = reveal(.05 + k * .1);
      if (!r) return;
      const live = 1 - Math.min(1, Math.abs(here - k)), reached = here > k - .5, left = here > k + .5;
      const w = SLAB.w / 2, d = SLAB.d / 2, t = SLAB.t;
      const top = [[cx - w, cy - d], [cx + w, cy - d], [cx + w, cy + d], [cx - w, cy + d]].map(([x, y]) => iso(x, y, 0));
      const low = [[cx + w, cy - d], [cx + w, cy + d], [cx - w, cy + d]].map(([x, y]) => iso(x, y, -t));
      ctx.setLineDash(reached ? [] : [4, 5]);
      ctx.strokeStyle = live > .5 ? colors.ink : colors.line;
      ctx.globalAlpha = (left ? .4 : reached ? .85 : .5) * r;
      for (let e = 0; e < 4; e++) pen(k * 10 + e, top[e], top[(e + 1) % 4], r, live > .5 ? 1.2 : .9);
      pen(k * 10 + 5, top[1], low[0], r); pen(k * 10 + 6, top[2], low[1], r); pen(k * 10 + 7, top[3], low[2], r);
      pen(k * 10 + 8, low[0], low[1], r); pen(k * 10 + 9, low[1], low[2], r);
      ctx.setLineDash([]);
      // A faint grid on the live slab's top: the cluster's nodes.
      if (reached && !left) {
        ctx.strokeStyle = colors.rest; ctx.globalAlpha = .35 * r * Math.max(.3, live);
        for (let q = 1; q < 4; q++) { const x = cx - w + (2 * w * q) / 4; pen(k * 50 + q, iso(x, cy - d, 0), iso(x, cy + d, 0), r, .6); }
        pen(k * 50 + 9, iso(cx - w, cy, 0), iso(cx + w, cy, 0), r, .6);
      }
      // Its name, under its lowest corner, and a tick when it's the one running.
      const [lx, ly] = iso(cx + w, cy + d, -t);
      label(name.toUpperCase(), lx, ly + 16, live > .5 ? colors.accent : colors.ink2, (left ? .45 : reached ? .95 : .6) * r);
    });

    // The arrows between platforms: dimension-style leaders, drawn as each move begins.
    for (let k = 0; k < 2; k++) {
      const local = k ? m2 : m1;
      if (!local) continue;
      const [ax, ay] = at(k), [bx, by] = at(k + 1);
      const a = iso(ax + SLAB.w / 2 + .12, ay - .2, .05), b = iso(bx - SLAB.w / 2 - .12, by + .2, .05);
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .7;
      ctx.setLineDash([3, 4]); pen(300 + k, a, b, ease(span(local, 0, .3)), .9); ctx.setLineDash([]);
      const e = ease(span(local, .25, .35));
      if (e) { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); ctx.globalAlpha = .8 * e; ctx.beginPath(); ctx.moveTo(b[0] - Math.cos(ang - .4) * 7, b[1] - Math.sin(ang - .4) * 7); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0] - Math.cos(ang + .4) * 7, b[1] - Math.sin(ang + .4) * 7); ctx.stroke(); }
    }

    // The pods: small cubes that cross in an arc, one at a time.
    const cube = (x, y, z, size, k, alpha, lit) => {
      const h = size / 2, P = (dx, dy, dz) => iso(x + dx, y + dy, z + dz);
      const t0 = P(-h, -h, size), t1 = P(h, -h, size), t2 = P(h, h, size), t3 = P(-h, h, size), b1 = P(h, -h, 0), b2 = P(h, h, 0), b3 = P(-h, h, 0);
      ctx.globalAlpha = alpha * .1; ctx.fillStyle = lit ? colors.accent : colors.line;
      ctx.beginPath(); [t0, t1, b1, b2, b3, t3].forEach(([px, py], q) => (q ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = lit ? colors.accent : colors.ink; ctx.globalAlpha = alpha * .9;
      [[t0, t1], [t1, t2], [t2, t3], [t3, t0], [t1, b1], [t2, b2], [t3, b3], [b1, b2], [b2, b3]].forEach(([p, q], e) => pen(k * 20 + e, p, q, 1, 1));
    };
    const podsIn = ease(span(intro, .45, .8));
    PODS.forEach((_, i) => {
      const p = podAt(i);
      // Its shadow on the slab below while it's in the air.
      if (p.z > .02) { const [sx, sy] = iso(p.x, p.y, 0); ctx.globalAlpha = .18 * podsIn; ctx.fillStyle = colors.line; ctx.beginPath(); ctx.ellipse(sx, sy, 9, 4.5, 0, 0, Math.PI * 2); ctx.fill(); }
      cube(p.x, p.y, p.z, .34, 100 + i, podsIn, p.moving);
    });

    // The pipeline above: a Helm chart, three gates, and a drop into whichever platform is live. Releases run through it the whole time.
    const mid = X0 + 2 * STEP * COS * s, pipeIn = reveal(.3), lineY = Y0 - 2.15 * s, x0 = mid - 4.1 * s, x1 = mid + 3.3 * s;
    const gateX = GATES.map((_, k) => x0 + (x1 - x0) * (.32 + k * .26));
    const dropTo = iso(...at(0).map((v, q) => v + (at(1)[q] - at(0)[q]) * here), .45);
    ctx.strokeStyle = colors.line; ctx.globalAlpha = .75 * pipeIn;
    pen(400, [x0 + 22, lineY], [x1, lineY], pipeIn, 1);
    pen(401, [x1, lineY], [x1, lineY + 14], pipeIn, 1);
    ctx.setLineDash([3, 4]); pen(402, [x1, lineY + 14], dropTo, pipeIn, .9); ctx.setLineDash([]);
    // The chart: a ship's wheel, sketched.
    ctx.strokeStyle = colors.ink; ctx.globalAlpha = .85 * pipeIn; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x0, lineY, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x0, lineY, 3, 0, Math.PI * 2); ctx.stroke();
    for (let q = 0; q < 7; q++) { const a = (q / 7) * Math.PI * 2 - Math.PI / 2; pen(410 + q, [x0 + Math.cos(a) * 3, lineY + Math.sin(a) * 3], [x0 + Math.cos(a) * 13, lineY + Math.sin(a) * 13], pipeIn, 1); }
    label('HELM CHART', x0, lineY + 28, colors.ink2, .9 * pipeIn);

    // A release: a small sheet that travels the line, ticks each gate as it passes, then drops into the live platform.
    const cycle = (time % RELEASE) / RELEASE, along = ease(span(cycle, .05, .62)), drop = ease(span(cycle, .62, .86));
    const relX = x0 + 22 + (x1 - x0 - 22) * along;
    GATES.forEach((name, k) => {
      const gx = gateX[k], passed = relX >= gx && cycle < .95;
      ctx.strokeStyle = passed ? colors.accent : colors.line; ctx.globalAlpha = .9 * pipeIn; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx, lineY - 7); ctx.lineTo(gx + 7, lineY); ctx.lineTo(gx, lineY + 7); ctx.lineTo(gx - 7, lineY); ctx.closePath(); ctx.stroke();
      if (passed) { ctx.beginPath(); ctx.moveTo(gx - 3, lineY); ctx.lineTo(gx - .5, lineY + 2.5); ctx.lineTo(gx + 3.5, lineY - 3); ctx.stroke(); }
      label(name.toUpperCase(), gx, lineY - 16, passed ? colors.accent : colors.ink2, .85 * pipeIn);
    });
    if (pipeIn > .9 && cycle < .9) {
      let px = relX, py = lineY;
      if (drop > 0) { px = x1 + (dropTo[0] - x1) * drop; py = lineY + 14 + (dropTo[1] - lineY - 14) * drop; }
      ctx.globalAlpha = (1 - span(cycle, .82, .9)) * .95; ctx.fillStyle = colors.accent; ctx.fillRect(px - 4, py - 4, 8, 8);
    }
    // Where it lands: a short ring on the live platform.
    const ring = span(cycle, .84, 1);
    if (ring > 0 && ring < 1) { ctx.strokeStyle = colors.accent; ctx.globalAlpha = (1 - ring) * .7; ctx.beginPath(); ctx.ellipse(dropTo[0], dropTo[1] + .45 * s, 6 + ring * 26, (6 + ring * 26) * .5, 0, 0, Math.PI * 2); ctx.stroke(); }
  }

  const CHAPTERS = [chapterOne];

  /* ---------- Mounting: one canvas per chapter, drawn only while it shows ---------- */
  function mount(canvas, opts) {
    const ctx = canvas.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const chapter = opts.chapter ?? 0, count = opts.count ?? 4, story = opts.story ?? (() => ({ progress: 0, live: false }));
    const paint = CHAPTERS[chapter];
    const scene = canvas.closest('[data-scene]');
    let w = 0, h = 0, dpr = 1, colors = {}, font = 'monospace', raf = 0, visible = false, shownAt = -1;
    const t0 = performance.now();

    function readColors() {
      const st = getComputedStyle(canvas), v = (n) => st.getPropertyValue(n).trim();
      colors = { line: v('--line'), rest: v('--line-rest'), ink: v('--ink'), ink2: v('--ink-2'), accent: v('--accent') };
      font = v('--font-note') || 'monospace';
    }
    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      return true;
    }
    /** How far through its chapter the scroll is. Without the film (no pin, or reduced motion) it's the finished chapter. */
    function beat() {
      const st = story();
      if (!st.live || reduced) return 1;
      return clamp((st.progress * count - chapter) / (LEAVE * .92));
    }

    function draw(now) {
      if (!paint || !w) return;
      const time = reduced ? RELEASE * .5 : (now - t0) / 1000;
      const intro = reduced ? 1 : shownAt < 0 ? 0 : clamp((now - shownAt) / 1000 / INTRO);
      const s = Math.min(w / 10.4, h / 4.6), X0 = w / 2 - 2 * STEP * COS * s, Y0 = h / 2 + .62 * s; // The block, pipeline to labels, sits centred.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // A pen line: the same slight wander every frame, so it reads as drawn but never crawls.
      const pen = (k, [ax, ay], [bx0, by0], reveal = 1, width = 1) => {
        if (reveal <= 0) return;
        const bx = ax + (bx0 - ax) * reveal, by = ay + (by0 - ay) * reveal;
        const len = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.round(len / 18)), nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
        ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(ax, ay);
        for (let i = 1; i <= n; i++) { const t = i / n, j = (hash(k * 31 + i) - .5) * .8 * Math.sin(Math.PI * t); ctx.lineTo(ax + (bx - ax) * t + nx * j, ay + (by - ay) * t + ny * j); }
        ctx.stroke();
      };
      const label = (text, x, y, color, alpha) => {
        if (alpha <= 0) return;
        ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.font = `500 ${Math.max(8.5, Math.min(10.5, s * .2))}px ${font}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text.split('').join(' '), x, y);
      };
      paint({ ctx, s, X0, Y0, colors, intro, c: beat(), time, pen, label });
      ctx.globalAlpha = 1;
    }

    const showing = () => visible && (!scene || Number(scene.style.opacity || 1) > .01);
    function frame(now) {
      raf = 0;
      if (!showing()) return;
      if (shownAt < 0) shownAt = now;
      draw(now);
      if (!reduced) raf = requestAnimationFrame(frame);
    }
    const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); });
    const ro = new ResizeObserver(() => { if (resize()) { readColors(); draw(performance.now()); } });
    const mo = new MutationObserver(() => { readColors(); wake(); });
    io.observe(canvas); ro.observe(canvas);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette', 'style', 'class'] });
    const page = document.getElementById('page');
    page?.addEventListener('scroll', wake, { passive: true });
    if (document.fonts) document.fonts.ready.then(() => { readColors(); wake(); });
    readColors(); resize(); wake();
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); mo.disconnect(); page?.removeEventListener('scroll', wake); };
  }

  return { mount, chapters: CHAPTERS.length };
})();
