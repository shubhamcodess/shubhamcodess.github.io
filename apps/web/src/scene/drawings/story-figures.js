/* The story's figures: technical blueprints, one per chapter, that together say where it started and where it got to. They're pen drawings in the theme's tones, with amber for what's live.
   Chapter 1, "Keeping it running": one workload, three platforms. It runs on OpenShift 3 while the next platform is still dashed construction lines. As you scroll it moves to OpenShift 4, then to GKE, a pod at a time, and every release above it comes through the same Helm pipeline, gate by gate.
   draw() takes three clocks: the intro (time since it first showed), the chapter's scroll (0 to 1) and plain time for what never stops (releases). The same inputs give the same picture. */
export const StoryFigures = (() => {
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (v) => { v = clamp(v); return v * v * v * (v * (v * 6 - 15) + 10); };
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const DONE = 0.78; // A chapter's drawing finishes here in its slot: about 80% of the way along its stretch of the line, just before the scene leaves.
  const ARRIVED = 0.3; // Matches story-motion's ENTER: the share of its slot a scene spends coming into focus.
  const INTRO = 1.8; // Seconds the pen takes to lay the drawing down.
  const COS = Math.cos(Math.PI / 6), SIN = Math.sin(Math.PI / 6);

  /* ---------- Chapter 1: one service, three platforms, one pipeline, and traffic that never drops ---------- */
  const PLATFORMS = ['OpenShift 3', 'OpenShift 4', 'GKE'];
  const SLAB = { w: 1.9, d: 1.3, t: .16 }, STEP = 1.95; // A platform's size, and how far apart they sit (iso units along x and -y).
  const PODS = [[.15, -.3], [.62, -.3], [.4, .3]]; // Where the pods stand, on the cluster's two nodes.
  const GATES = ['Template', 'Stage', 'Prod'];
  const RELEASE = 3.4; // Seconds between releases.
  // Each move, in the share of its own stretch: the new platform is built, the service is deployed onto it, it reports ready, traffic swings over, and only then the old one retires.
  const MOVE = { build: [0, .12], deploy: [.12, .5], ready: [.52, .6], cut: [.66, .84], retire: [.86, 1] };

  function chapterOne(g) {
    const { ctx, s, X0, Y0, colors, intro, c, time, pen, label } = g;
    const iso = (x, y, z) => [X0 + (x - y) * COS * s, Y0 + (x + y) * SIN * s - z * s];
    const at = (k) => [k * STEP, -k * STEP]; // A platform's centre: the row runs across the screen.
    const reveal = (a) => span(intro, a, a + .35);
    const moves = [span(c, .06, .47), span(c, .53, .94)];
    const phase = (k, [a, b]) => (k < 0 || k > 1 ? 0 : ease(span(moves[k], a, b)));
    const traffic = phase(0, MOVE.cut) + phase(1, MOVE.cut); // 0 to 2: which platform serves, and the swing between.
    const w = SLAB.w / 2, d = SLAB.d / 2, t = SLAB.t;
    const poly = (pts) => { ctx.beginPath(); pts.forEach(([px, py], q) => (q ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); };

    const cube = (x, y, z, sx, sy, sz, k, alpha, color) => {
      if (alpha <= 0) return;
      const P = (dx, dy, dz) => iso(x + dx, y + dy, z + dz), a = sx / 2, b = sy / 2;
      const t0 = P(-a, -b, sz), t1 = P(a, -b, sz), t2 = P(a, b, sz), t3 = P(-a, b, sz), b1 = P(a, -b, 0), b2 = P(a, b, 0), b3 = P(-a, b, 0);
      ctx.globalAlpha = alpha * .1; ctx.fillStyle = color; poly([t0, t1, b1, b2, b3, t3]); ctx.fill();
      ctx.strokeStyle = color; ctx.globalAlpha = alpha * .9;
      [[t0, t1], [t1, t2], [t2, t3], [t3, t0], [t1, b1], [t2, b2], [t3, b3], [b1, b2], [b2, b3]].forEach(([p, q], e) => pen(k * 20 + e, p, q, 1, 1));
    };

    PLATFORMS.forEach((name, k) => {
      const [cx, cy] = at(k), r = reveal(.05 + k * .1);
      if (!r) return;
      const built = k === 0 ? 1 : phase(k - 1, MOVE.build), retired = phase(k, MOVE.retire);
      const serving = 1 - Math.min(1, Math.abs(traffic - k));
      // The platform: dashed construction lines until it's built, quiet once it's retired.
      const top = [[cx - w, cy - d], [cx + w, cy - d], [cx + w, cy + d], [cx - w, cy + d]].map(([x, y]) => iso(x, y, 0));
      const low = [[cx + w, cy - d], [cx + w, cy + d], [cx - w, cy + d]].map(([x, y]) => iso(x, y, -t));
      ctx.setLineDash(built > .5 ? [] : [4, 5]);
      ctx.strokeStyle = serving > .5 ? colors.ink : colors.line;
      ctx.globalAlpha = (.5 + .4 * built - .55 * retired) * r;
      for (let e = 0; e < 4; e++) pen(k * 10 + e, top[e], top[(e + 1) % 4], r, serving > .5 ? 1.2 : .9);
      pen(k * 10 + 5, top[1], low[0], r); pen(k * 10 + 6, top[2], low[1], r); pen(k * 10 + 7, top[3], low[2], r);
      pen(k * 10 + 8, low[0], low[1], r); pen(k * 10 + 9, low[1], low[2], r);
      ctx.setLineDash([]);
      // The cluster on it: a control plane and two worker nodes, drawn as it's built.
      const cluster = built * (1 - retired * .7) * r;
      if (cluster > .01) {
        ctx.strokeStyle = colors.line; ctx.globalAlpha = .5 * cluster;
        for (const [y0, y1] of [[-.58, -.04], [.04, .58]]) {
          const n = [[cx - .12, cy + y0], [cx + .86, cy + y0], [cx + .86, cy + y1], [cx - .12, cy + y1]].map(([x, y]) => iso(x, y, 0));
          for (let e = 0; e < 4; e++) pen(k * 60 + e + (y0 > 0 ? 5 : 0), n[e], n[(e + 1) % 4], built, .7);
        }
        cube(cx - .58, cy, 0, .42, .62, .26, 500 + k, cluster * .8, colors.line);
      }
      // The service's pods: deployed one by one onto a new platform while the old one keeps serving, and gone once it retires.
      PODS.forEach(([ox, oy], i) => {
        const up = k === 0 ? ease(span(intro, .45, .8)) : ease(span(phase(k - 1, MOVE.deploy), i * .28, i * .28 + .44));
        const fresh = up > 0 && up < 1;
        cube(cx + ox, cy + oy, 0, .3, .3, .34 * up, 100 + k * 3 + i, up * (1 - retired), fresh ? colors.accent : colors.ink);
      });
      // Ready: a tick over the new platform before any traffic reaches it.
      const ready = k > 0 ? phase(k - 1, MOVE.ready) * (1 - phase(k - 1, MOVE.retire)) : 0;
      if (ready > .01) { const [rx, ry] = iso(cx + w, cy - d, -t); label('READY ✓', rx, ry + 20, colors.accent, ready); } // under its right corner, clear of the drawing
      // Its name, over its back corner.
      const [lx, ly] = iso(cx - w, cy - d, 0);
      label(name.toUpperCase(), lx, ly - 13, serving > .5 ? colors.accent : colors.ink2, (built > .5 ? .95 - .5 * retired : .6) * r);
    });

    // Traffic: a line along the bottom that rises into whichever platform serves. It flows the whole time and swings over without a break.
    const tIn = reveal(.4), corner = (k) => iso(at(k)[0] + w, at(k)[1] + d, -t);
    const busY = Y0 + 1.3 * s, startX = iso(-w, d, 0)[0] - .2 * s;
    const riser = corner(0).map((v, q) => v + (corner(1)[q] - corner(0)[q]) * Math.min(1, traffic) + (corner(2)[q] - corner(1)[q]) * Math.max(0, traffic - 1));
    ctx.strokeStyle = colors.ink; ctx.globalAlpha = .75 * tIn; ctx.lineWidth = 1.1;
    ctx.setLineDash([6, 5]); ctx.lineDashOffset = -time * 22;
    ctx.beginPath(); ctx.moveTo(startX, busY); ctx.lineTo(riser[0], busY); ctx.lineTo(riser[0], riser[1] + 4); ctx.stroke();
    ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.beginPath(); ctx.moveTo(riser[0] - 4, riser[1] + 10); ctx.lineTo(riser[0], riser[1] + 4); ctx.lineTo(riser[0] + 4, riser[1] + 10); ctx.stroke();
    label('TRAFFIC', startX, busY - 11, colors.ink2, .9 * tIn, 'left');

    // The pipeline above: a Helm chart with its revision, three gates, and a drop into whichever platform serves. Releases run through it the whole time.
    const mid = X0 + 2 * STEP * COS * s, pipeIn = reveal(.3), lineY = Y0 - 2.2 * s, x0 = mid - 4.3 * s, x1 = mid + 3.3 * s;
    const gateX = GATES.map((_, k) => x0 + (x1 - x0) * (.34 + k * .25));
    const dropTo = iso(at(0)[0] + (at(1)[0] - at(0)[0]) * traffic, at(0)[1] + (at(1)[1] - at(0)[1]) * traffic, .5);
    ctx.strokeStyle = colors.line; ctx.globalAlpha = .75 * pipeIn;
    pen(400, [x0 + 22, lineY], [x1, lineY], pipeIn, 1);
    pen(401, [x1, lineY], [x1, lineY + 14], pipeIn, 1);
    ctx.setLineDash([3, 4]); pen(402, [x1, lineY + 14], dropTo, pipeIn, .9); ctx.setLineDash([]);
    ctx.strokeStyle = colors.ink; ctx.globalAlpha = .85 * pipeIn; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x0, lineY, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x0, lineY, 3, 0, Math.PI * 2); ctx.stroke();
    for (let q = 0; q < 7; q++) { const a = (q / 7) * Math.PI * 2 - Math.PI / 2; pen(410 + q, [x0 + Math.cos(a) * 3, lineY + Math.sin(a) * 3], [x0 + Math.cos(a) * 13, lineY + Math.sin(a) * 13], pipeIn, 1); }
    // The revision counts every release since it first showed: the same chart, the same history, on every platform.
    const rev = 1 + Math.floor(time / RELEASE);
    label('HELM CHART', x0, lineY + 26, colors.ink2, .9 * pipeIn);
    label(`REV ${rev}`, x0, lineY + 39, colors.ink2, .6 * pipeIn);

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
    const ring = span(cycle, .84, 1);
    if (ring > 0 && ring < 1) { ctx.strokeStyle = colors.accent; ctx.globalAlpha = (1 - ring) * .7; ctx.beginPath(); ctx.ellipse(dropTo[0], dropTo[1] + .5 * s, 6 + ring * 26, (6 + ring * 26) * .5, 0, 0, Math.PI * 2); ctx.stroke(); }
  }

  /* ---------- Chapter 2: the pilot first, then the rest ---------- */
  // A legacy block in five slices. The pilot slice is cut out first, rebuilt on the platform as a clean two-layer app, and approved; then the rest follow the same path, faster, onto the same stack, and a shared-standards strip runs under them all.
  const LEGACY = { x0: -2.4, y0: 1.0, d: 1.2, h: 1.1, slice: .32, n: 5 };
  const DECK2 = { x: 1.55, y: -1.6, w: 1.9, d: .66, t: .14 }, SLOT = .62, APP = { w: .36, d: .42, low: .34, gap: .06, high: .3 };
  const slotX = (k) => DECK2.x - 1.66 + k * SLOT; // Slot 4 is the pilot's: furthest along, so its labels have open space to the right.
  // When each slice leaves and lands, in the chapter's scroll. The pilot takes its time; the rest come quicker, one after another.
  const FLIGHTS = [[.06, .3], ...[0, 1, 2, 3].map((j) => [.48 + j * .085, .48 + j * .085 + .19])];

  function chapterTwo(g) {
    const { ctx, w: W, h: H, colors, intro, c, pen, label } = g;
    const s = Math.min(W / 12.4, H / 4.4), X0 = W / 2 - 1.35 * s, Y0 = H / 2 + .3 * s;
    const iso = (x, y, z) => [X0 + (x - y) * COS * s, Y0 + (x + y) * SIN * s - z * s];
    const reveal = (a) => span(intro, a, a + .35);
    const poly = (pts) => { ctx.beginPath(); pts.forEach(([px, py], q) => (q ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); };
    // A box from its near-bottom-left corner: top, and the two faces that show.
    const box = (x, y, z, bw, bd, bh, k, alpha, color, tone = .1, dash = null) => {
      if (alpha <= .005 || bh <= .001) return;
      const P = (dx, dy, dz) => iso(x + dx, y + dy, z + dz);
      const t0 = P(0, 0, bh), t1 = P(bw, 0, bh), t2 = P(bw, bd, bh), t3 = P(0, bd, bh), b1 = P(bw, 0, 0), b2 = P(bw, bd, 0), b3 = P(0, bd, 0);
      ctx.globalAlpha = alpha * tone; ctx.fillStyle = color; poly([t0, t1, b1, b2, b3, t3]); ctx.fill();
      ctx.setLineDash(dash ?? []); ctx.strokeStyle = color; ctx.globalAlpha = alpha * .9;
      [[t0, t1], [t1, t2], [t2, t3], [t3, t0], [t1, b1], [t2, b2], [t3, b3], [b1, b2], [b2, b3]].forEach(([p, q], e) => pen(k * 20 + e, p, q, 1, 1));
      ctx.setLineDash([]);
    };

    // The platform it all lands on: containers on Kubernetes, released with Helm.
    const deckIn = reveal(.15);
    if (deckIn) {
      const { x, y, w, d, t } = DECK2;
      const top = [[x - w, y - d], [x + w, y - d], [x + w, y + d], [x - w, y + d]].map(([px, py]) => iso(px, py, 0));
      const low = [[x + w, y - d], [x + w, y + d], [x - w, y + d]].map(([px, py]) => iso(px, py, -t));
      ctx.strokeStyle = colors.ink; ctx.globalAlpha = .85 * deckIn;
      for (let e = 0; e < 4; e++) pen(700 + e, top[e], top[(e + 1) % 4], deckIn, 1.1);
      pen(705, top[1], low[0], deckIn); pen(706, top[2], low[1], deckIn); pen(707, top[3], low[2], deckIn);
      pen(708, low[0], low[1], deckIn); pen(709, low[1], low[2], deckIn);
      const [lx, ly] = iso(x + w, y + d, -t); // under its lowest corner, where nothing is drawn
      label('DOCKER / K8S \u00b7 HELM', lx, ly + 18, colors.ink2, .9 * deckIn);
    }

    // The shared-standards strip under every app, laid down once they've all arrived.
    const strip = ease(span(c, .84, .97));
    if (strip > 0) {
      const a = iso(slotX(0) - .12, DECK2.y + .38, 0), b = iso(slotX(4) + APP.w + .12, DECK2.y + .38, 0);
      ctx.strokeStyle = colors.accent; ctx.globalAlpha = .85; pen(720, a, b, strip, 1.6);
      const [lx, ly] = iso(DECK2.x + DECK2.w, DECK2.y + DECK2.d, -DECK2.t); // under the platform's lowest corner, clear of every line
      label('SHARED STANDARDS', lx, ly + 33, colors.accent, strip);
    }

    // The legacy block: whatever slices haven't left yet, with the tangle running across their faces. Once it's empty it's a dashed outline.
    const L = LEGACY, legacyIn = reveal(.05), lastGone = ease(span(c, FLIGHTS[4][0], FLIGHTS[4][0] + .08));
    const sliceX = (k) => L.x0 + (L.n - 1 - k) * L.slice; // Slice 0 is the one nearest the platform.
    if (legacyIn) {
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .45 * lastGone * legacyIn;
      box(L.x0, L.y0, 0, L.slice * L.n, L.d, L.h, 760, .45 * lastGone * legacyIn, colors.line, 0, [4, 5]);
      const [lx, ly] = iso(L.x0, L.y0, L.h);
      label('LEGACY', lx, ly - 13, colors.ink2, (.9 - .5 * lastGone) * legacyIn);
    }
    for (let k = L.n - 1; k >= 0; k--) {
      const left = span(c, FLIGHTS[k][0], FLIGHTS[k][0] + .02);
      if (left > 0 || !legacyIn) continue;
      const x = sliceX(k);
      box(x, L.y0, 0, L.slice, L.d, L.h, 800 + k, .8 * legacyIn, colors.line, .16);
      // The tangle: a line that wanders across the front faces, slice to slice, so no slice reads as separable until it's cut out.
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .55 * legacyIn;
      for (let q = 0; q < 2; q++) {
        const za = .2 + hash(k * 7 + q) * .7, zb = .2 + hash((k + 1) * 7 + q) * .7;
        pen(850 + k * 4 + q, iso(x, L.y0 + L.d, za), iso(x + L.slice, L.y0 + L.d, zb), legacyIn, .8);
      }
      // The pilot's cut: dashed, just before it lifts out.
      if (k === 0) {
        const cut = span(c, .02, .06) * (1 - span(c, FLIGHTS[0][0], FLIGHTS[0][0] + .01));
        if (cut > 0) { ctx.strokeStyle = colors.accent; ctx.globalAlpha = .9 * cut; ctx.setLineDash([3, 3]); const P = (dx, dz) => iso(x + dx, L.y0 + L.d, dz); pen(870, P(0, 0), P(0, L.h), 1, 1); pen(871, iso(x, L.y0, L.h), iso(x, L.y0 + L.d, L.h), 1, 1); ctx.setLineDash([]); }
      }
    }

    // The slices in flight and landed. In the air a slice is amber and narrows to an app's footprint; on landing it splits into its two layers.
    for (let k = 0; k < L.n; k++) {
      const [a, b] = FLIGHTS[k], fly = span(c, a, b);
      if (fly <= 0) continue;
      const p = ease(span(fly, 0, .82)), split = ease(span(fly, .82, 1));
      const slot = 4 - k, from = [sliceX(k), L.y0], to = [slotX(slot), DECK2.y - APP.d / 2];
      const bw = L.slice + (APP.w - L.slice) * p, bd = L.d + (APP.d - L.d) * p, bh = L.h + (APP.low + APP.high + APP.gap - L.h) * p;
      const x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p, z = Math.sin(Math.PI * p) * 1.5;
      const flying = p < 1, color = flying ? colors.accent : colors.ink;
      if (flying) { box(x, y, z, bw, bd, bh, 900 + k, .9, color, .1); continue; }
      // Landed: Spring Boot below, Angular above, with a small gap opening between them.
      box(x, y, 0, APP.w, APP.d, APP.low, 920 + k, .9, colors.ink, .1);
      box(x, y, APP.low + APP.gap * split, APP.w, APP.d, APP.high + (APP.gap) * (1 - split), 940 + k, .9, colors.ink, .1);
      // Then it's packed into its container: a dashed frame around both layers.
      const pack = ease(span(fly, .9, 1)), m = .05;
      box(x - m, y - m, 0, APP.w + m * 2, APP.d + m * 2, APP.low + APP.gap + APP.high + m, 960 + k, .55 * pack, colors.line, 0, [3, 3]);
    }

    // The pilot's notes: a column past the platform's right corner, with leaders back to the pilot, so nothing lands on them.
    const pilot = span(c, FLIGHTS[0][1] - .02, FLIGHTS[0][1] + .04);
    if (pilot > 0) {
      const x = slotX(4) + APP.w, y = DECK2.y - APP.d / 2, col = iso(DECK2.x + DECK2.w, DECK2.y - DECK2.d, 0)[0] + 14;
      const rows = [['ANGULAR', APP.low + APP.gap + APP.high / 2], ['SPRING BOOT', APP.low / 2]];
      // Under Spring Boot, its tests; under that, the container it ships in.
      const [, ty] = iso(x, y + APP.d / 2, APP.low / 2), [dx, dy] = iso(x + .05, y + APP.d / 2 + .05, -.02);
      label('+ TESTS', col, ty + 14, colors.ink2, .75 * pilot, 'left');
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .7 * pilot; pen(983, [dx + 3, dy + 10], [col - 4, ty + 28], pilot, .8);
      label('DOCKER IMAGE', col, ty + 28, colors.ink2, .9 * pilot, 'left');
      rows.forEach(([text, z], q) => {
        const [ax, ay] = iso(x, y + APP.d / 2, z);
        ctx.strokeStyle = colors.line; ctx.globalAlpha = .7 * pilot; pen(980 + q, [ax + 3, ay], [col - 4, ay], pilot, .8);
        label(text, col, ay, colors.ink2, .9 * pilot, 'left');
      });
      const top = iso(x, y + APP.d / 2, APP.low + APP.gap + APP.high)[1] - 16;
      label('PILOT', col, top, colors.ink, .95 * pilot, 'left');
      label('APPROVED \u2713', col, top - 14, colors.accent, ease(span(c, .36, .44)), 'left');
    }
  }

  const CHAPTERS = [chapterOne, chapterTwo];

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
      // A chapter after the first waits until its scene has fully arrived and its words are sharp.
      const start = chapter ? ARRIVED : 0;
      return clamp((st.progress * count - chapter - start) / (DONE - start));
    }

    function draw(now) {
      if (!paint || !w) return;
      const time = reduced ? RELEASE * .5 : (now - t0) / 1000;
      const intro = reduced ? 1 : shownAt < 0 ? 0 : clamp((now - shownAt) / 1000 / INTRO);
      const s = Math.min(w / 10.4, h / 4.5), X0 = w / 2 - 2 * STEP * COS * s, Y0 = h / 2 + .45 * s; // The block, pipeline to labels, sits centred.
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
      const label = (text, x, y, color, alpha, align = 'center') => {
        if (alpha <= 0) return;
        ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.font = `500 ${Math.max(8.5, Math.min(10.5, s * .2))}px ${font}`;
        ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(text.split('').join(' '), x, y);
      };
      paint({ ctx, w, h, s, X0, Y0, colors, intro, c: beat(), time, pen, label });
      ctx.globalAlpha = 1;
    }

    const showing = () => visible && (!scene || Number(scene.style.opacity || 1) > .01);
    function frame(now) {
      raf = 0;
      if (!showing()) return;
      if (shownAt < 0 && (!scene || Number(scene.style.opacity || 1) > .95)) shownAt = now; // The pen starts once the scene is in focus.
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
