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

  /** Draws iso boxes from their near-bottom-left corner: the top and the two faces that show, lightly toned. Shared by the chapters. */
  function boxTool(ctx, iso, pen) {
    const poly = (pts) => { ctx.beginPath(); pts.forEach(([px, py], q) => (q ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); };
    return (x, y, z, bw, bd, bh, k, alpha, color, tone = .1, dash = null) => {
      if (alpha <= .005 || bh <= .001) return;
      const P = (dx, dy, dz) => iso(x + dx, y + dy, z + dz);
      const t0 = P(0, 0, bh), t1 = P(bw, 0, bh), t2 = P(bw, bd, bh), t3 = P(0, bd, bh), b1 = P(bw, 0, 0), b2 = P(bw, bd, 0), b3 = P(0, bd, 0);
      ctx.globalAlpha = alpha * tone; ctx.fillStyle = color; poly([t0, t1, b1, b2, b3, t3]); ctx.fill();
      ctx.setLineDash(dash ?? []); ctx.strokeStyle = color; ctx.globalAlpha = alpha * .9;
      [[t0, t1], [t1, t2], [t2, t3], [t3, t0], [t1, b1], [t2, b2], [t3, b3], [b1, b2], [b2, b3]].forEach(([p, q], e) => pen(k * 20 + e, p, q, 1, 1));
      ctx.setLineDash([]);
    };
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
    const box = boxTool(ctx, iso, pen);

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

  /* ---------- Chapter 3: one framework, many systems ---------- */
  // Four sources, one order platform. The first is wired by hand, a tangle of custom plumbing; then the integration framework is drawn and the tangle becomes one socket and a task. The other three just snap in. Data runs to the platform through a few bounded lanes, it goes live, and the 20-minute compile shrinks to seconds.
  const RAIL = { x0: -2.4, x1: 1.0, y: -.3, d: .6, t: .14 }, PLAT = { x: 2.3, y: -.7, w: 1.2, d: 1.4, h: .8 };
  const SOCKETS = [-1.95, -1.25, -.55, .15], SRC_Y = -1.55, SRC = .4, LANES = [-.2, 0, .2];
  const SNAP = [[.3, .38], [.42, .5], [.5, .58], [.58, .66]]; // When each source's task snaps into its socket.

  function chapterThree(g) {
    const { ctx, w: W, h: H, colors, intro, c, time, pen, label } = g;
    const s = Math.min(W / 10.4, H / 4.6), X0 = W / 2 - .8 * s, Y0 = H / 2 + .1 * s - 8;
    const iso = (x, y, z) => [X0 + (x - y) * COS * s, Y0 + (x + y) * SIN * s - z * s];
    const reveal = (a) => span(intro, a, a + .35);
    const box = boxTool(ctx, iso, pen);
    const rail = ease(span(c, .16, .3)), flow = ease(span(c, .62, .7));

    // The sources: small boxes in a row behind the rail, unnamed.
    const srcIn = reveal(.05);
    SOCKETS.forEach((x, k) => box(x - SRC / 2, SRC_Y, 0, SRC, SRC, SRC, 1100 + k, .85 * srcIn, colors.ink, .12));
    { const [lx, ly] = iso(SOCKETS[0] - SRC / 2, SRC_Y, SRC); label('SOURCES', lx, ly - 13, colors.ink2, .9 * srcIn); }

    // The old way: the first source wired straight to the platform by hand, a long wandering dashed line. It fades once the framework is there.
    const wired = ease(span(c, .02, .16)), unwired = ease(span(c, .3, .38));
    if (wired > 0 && unwired < 1) {
      // Out of the source towards the viewer, then a long wander along where the rail will be, into the platform.
      const a = iso(SOCKETS[0], SRC_Y + SRC, 0), m = iso(SOCKETS[0], .1, 0), b = iso(PLAT.x, .25, .1);
      const at = (t) => (t < .2 ? [a[0] + (m[0] - a[0]) * t / .2, a[1] + (m[1] - a[1]) * t / .2] : [m[0] + (b[0] - m[0]) * (t - .2) / .8, m[1] + (b[1] - m[1]) * (t - .2) / .8]);
      ctx.strokeStyle = colors.ink2; ctx.globalAlpha = .75 * (1 - unwired); ctx.lineWidth = .9; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      const n = 48;
      for (let i = 1; i <= Math.round(n * wired); i++) {
        const t = i / n, [px, py] = at(t), wob = t < .2 ? 0 : Math.sin((t - .2) * Math.PI * 7) * 11 * Math.sin(Math.PI * (t - .2) / .8) + (hash(i) - .5) * 5;
        ctx.lineTo(px, py + wob);
      }
      ctx.stroke(); ctx.setLineDash([]);
    }

    // The framework: a long rail, drawn by the pen, its name to the left of its near end.
    if (rail > 0) {
      const { x0, x1, y, d, t } = RAIL;
      ctx.strokeStyle = colors.ink; ctx.globalAlpha = .85;
      const top = [[x0, y], [x1, y], [x1, y + d], [x0, y + d]].map(([px, py]) => iso(px, py, 0));
      const low = [[x1, y], [x1, y + d], [x0, y + d]].map(([px, py]) => iso(px, py, -t));
      for (let e = 0; e < 4; e++) pen(1200 + e, top[e], top[(e + 1) % 4], rail, 1.1);
      pen(1205, top[1], low[0], rail); pen(1206, top[2], low[1], rail); pen(1207, top[3], low[2], rail);
      pen(1208, low[0], low[1], rail); pen(1209, low[1], low[2], rail);
      // Its sockets: small marks on its top, one per source.
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .7 * rail;
      SOCKETS.forEach((x, k) => { const q = [[x - .17, y + .05], [x + .17, y + .05], [x + .17, y + .39], [x - .17, y + .39]].map(([px, py]) => iso(px, py, 0)); for (let e = 0; e < 4; e++) pen(1220 + k * 4 + e, q[e], q[(e + 1) % 4], rail, .7); });
      const [lx, ly] = iso(x0, y + d, -t);
      label('INTEGRATION', lx - 8, ly + 4, colors.ink2, .9 * rail, 'right');
      label('FRAMEWORK', lx - 8, ly + 17, colors.ink2, .9 * rail, 'right');
    }

    // Each source connects with a short line and a task card in its socket: amber as it lands, ink after.
    SOCKETS.forEach((x, k) => {
      const [a, b] = SNAP[k], on = ease(span(c, a, b));
      if (on <= 0) return;
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .8; pen(1300 + k, iso(x, SRC_Y + SRC, 0), iso(x, RAIL.y + .05, 0), on, .9);
      const fresh = 1 - span(c, b + .04, b + .12);
      box(x - .13, RAIL.y + .09, 0, .26, .26, .08 * on, 1320 + k, on, fresh > .5 ? colors.accent : colors.ink, .25);
    });
    // The first card is named once, under the rail, where nothing else lands.
    { const t = ease(span(c, SNAP[0][0], SNAP[0][1])); if (t > 0) { const [tx, ty] = iso(SOCKETS[0], RAIL.y + RAIL.d, -RAIL.t); label('TASK', tx, ty + 14, colors.accent, t * (1 - span(c, .42, .52))); } }

    // The order platform at the rail's end.
    const platIn = reveal(.2);
    box(PLAT.x, PLAT.y, 0, PLAT.w, PLAT.d, PLAT.h, 1400, .9 * platIn, colors.ink, .1);
    const [bx, by] = iso(PLAT.x, PLAT.y, PLAT.h);
    label('ORDER PLATFORM', bx, by - 13, colors.ink2, .9 * platIn);
    label('LIVE ✓', bx, by - 27, colors.accent, ease(span(c, .7, .78)));

    // Bounded lanes from the rail into the platform, and the work moving through them, a few at a time.
    if (flow > 0) {
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .7;
      LANES.forEach((y, k) => pen(1500 + k, iso(RAIL.x1, y, 0), iso(PLAT.x, y, 0), flow, .8));
      ctx.fillStyle = colors.accent;
      LANES.forEach((y, k) => {
        for (let q = 0; q < 2; q++) {
          const u = ((time * .55 + k * .37 + q * .5) % 1), [px, py] = iso(RAIL.x1 + (PLAT.x - RAIL.x1) * u, y, .02);
          ctx.globalAlpha = flow * .9 * Math.sin(Math.PI * u); ctx.fillRect(px - 3, py - 3, 6, 6);
        }
      });
      const [lx, ly] = iso(RAIL.x1, RAIL.y + RAIL.d, -RAIL.t); // under the rail's end, left of the platform
      label('BOUNDED WORKERS', lx + .6 * s, ly + 22, colors.ink2, .9 * flow, 'right');
    }

    // The compile: a dimension line under the platform, 20 minutes long, that shrinks to seconds.
    const dim = ease(span(c, .74, .8)), shrink = ease(span(c, .8, .95));
    if (dim > 0) {
      const [cx, cy] = iso(PLAT.x + PLAT.w, PLAT.y + PLAT.d, 0), len = 80 - 68 * shrink, y = cy + 34, x0 = cx - len / 2, x1 = cx + len / 2;
      ctx.strokeStyle = shrink > .5 ? colors.accent : colors.ink2; ctx.globalAlpha = .9 * dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.moveTo(x0, y - 4); ctx.lineTo(x0, y + 4); ctx.moveTo(x1, y - 4); ctx.lineTo(x1, y + 4); ctx.stroke();
      label('20 MIN', cx, y - 11, colors.ink2, dim * (1 - shrink));
      label('SECONDS', cx, y - 11, colors.accent, shrink);
    }
  }

  /* ---------- Chapter 4: requirement to production, a three-row funnel ---------- */
  // Laid out as cleanly as the first chapter, and read like a snake down the card. Top row, left to right: requirements come in through a thin portal and become design docs, HLD and LLD. Middle row, right to left, three platforms: the code, the AI agents, the AI review and automation. Bottom row, left to right: CI/CD gates, production on GKE, and out through a second portal.
  const P4 = { w: .95, d: .65, t: .14, step: 1.95 };
  const T4 = { row1: [.04, .16], docs: [.12, .2], drop1: [.2, .25], code: [.25, .36], ai: [.36, .46], auto: [.46, .56], drop2: [.56, .6], row3: [.6, .68], gates: [.66, .74], out: [.72, .78], flow: [.78, .86] };

  function chapterFour(g) {
    const { ctx, w: W, h: H, colors, c, time, pen, label } = g;
    const s = Math.min(W / 10.4, H / 5.8), X0 = W / 2 - 2 * P4.step * COS * s, Y0 = H / 2 + .25 * s;
    const iso = (x, y, z) => [X0 + (x - y) * COS * s, Y0 + (x + y) * SIN * s - z * s];
    const box = boxTool(ctx, iso, pen);
    const ph = (r) => ease(span(c, r[0], r[1]));
    const at = (k) => [k * P4.step, -k * P4.step]; // slab k's centre; 0 is left
    const cx = (k) => iso(...at(k), 0)[0];
    const right2 = iso(at(2)[0] + P4.w, at(2)[1] - P4.d, 0); // the code platform's right corner, where the top row drops in
    const y1 = Y0 - 2.45 * s, y3 = Y0 + 1.55 * s, xL = cx(0) - .55 * s, xR = right2[0];
    // A thin portal: a narrow upright ellipse, like a ring seen nearly edge-on.
    const portal = (x, y, alpha) => { if (alpha <= 0) return; ctx.strokeStyle = colors.ink; ctx.globalAlpha = .85 * alpha; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y, 5, 13, 0, 0, Math.PI * 2); ctx.stroke(); };
    const arrow = (x, y, dir, alpha) => { ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(x - dir * 6, y - 4); ctx.lineTo(x, y); ctx.lineTo(x - dir * 6, y + 4); ctx.stroke(); };
    const sheet = (x, y, k, alpha) => { // a design doc: a page with a few lines
      ctx.strokeStyle = colors.ink; ctx.globalAlpha = .85 * alpha; ctx.lineWidth = 1; ctx.strokeRect(x - 9, y - 12, 18, 24);
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .7 * alpha; for (let q = 0; q < 4; q++) pen(3000 + k * 5 + q, [x - 5, y - 6 + q * 4.5], [x + 5 - (q === 3 ? 4 : 0), y - 6 + q * 4.5], alpha, .7);
    };
    const slab = (k, alpha, live) => {
      const [x, y] = at(k), { w, d, t } = P4;
      const top = [[x - w, y - d], [x + w, y - d], [x + w, y + d], [x - w, y + d]].map(([px, py]) => iso(px, py, 0));
      const low = [[x + w, y - d], [x + w, y + d], [x - w, y + d]].map(([px, py]) => iso(px, py, -t));
      ctx.strokeStyle = live ? colors.ink : colors.line; ctx.globalAlpha = .85 * alpha;
      for (let e = 0; e < 4; e++) pen(3100 + k * 10 + e, top[e], top[(e + 1) % 4], alpha, 1.1);
      pen(3105 + k * 10, top[1], low[0], alpha); pen(3106 + k * 10, top[2], low[1], alpha); pen(3107 + k * 10, top[3], low[2], alpha);
      pen(3108 + k * 10, low[0], low[1], alpha); pen(3109 + k * 10, low[1], low[2], alpha);
    };
    const names = (k, lines, alpha) => { const [lx, ly] = iso(at(k)[0] - P4.w, at(k)[1] - P4.d, 0); lines.forEach(([text, color], q) => label(text, lx, ly - 13 - (lines.length - 1 - q) * 13, color, .95 * alpha)); };

    // Top row: the in-portal, the line, and two design docs.
    const r1 = ph(T4.row1), docs = ph(T4.docs);
    portal(xL, y1, r1);
    label('REQUIREMENTS', xL, y1 + 24, colors.ink2, .9 * r1);
    const dHL = X0 + 1.5 * s, dLL = dHL + 34;
    if (r1 > 0) { ctx.strokeStyle = colors.line; ctx.globalAlpha = .75; pen(3010, [xL + 8, y1], [xR, y1], r1, 1); arrow(dHL - 16, y1, 1, .75 * r1); }
    if (docs > 0) {
      sheet(dHL, y1, 0, docs); sheet(dLL, y1, 1, docs);
      label('HLD', dHL, y1 + 24, colors.ink2, .9 * docs); label('LLD', dLL, y1 + 24, colors.ink2, .9 * docs);
      label('DESIGN', (dHL + dLL) / 2, y1 - 22, colors.ink, .95 * docs);
    }
    // Drop into the code platform, at the right.
    const dr1 = ph(T4.drop1), top2 = right2;
    if (dr1 > 0) { ctx.strokeStyle = colors.line; ctx.globalAlpha = .8; ctx.setLineDash([3, 4]); pen(3021, [xR, y1], [xR, right2[1] - 3], dr1, .9); ctx.setLineDash([]); arrow(xR, right2[1] - 3, 0, 0); ctx.beginPath(); ctx.globalAlpha = .8 * dr1; ctx.moveTo(xR - 4, right2[1] - 9); ctx.lineTo(xR, right2[1] - 3); ctx.lineTo(xR + 4, right2[1] - 9); ctx.stroke(); }

    // Middle row, right to left: code, AI agents, AI review and automation.
    const code = ph(T4.code), ai = ph(T4.ai), auto = ph(T4.auto);
    if (code > 0) {
      slab(2, code, true);
      const [x, y] = at(2); // the stack: three layers set down one on another, each its own size and tone
      [[.62, .44, .07], [.54, .38, .12], [.46, .32, .17]].forEach(([hw, hd, tone], q) => { const z = q * .17 + .3 * (1 - ease(span(code, q * .25, q * .25 + .5))); box(x - hw, y - hd, z, hw * 2, hd * 2, .12, 3200 + q, .9 * ease(span(code, q * .25, q * .25 + .5)), colors.ink, tone); });
      names(2, [['CODE', colors.ink], ['NEXT.JS · ANGULAR', colors.ink2], ['JAVA · SPRING BOOT', colors.ink2]], code);
    }
    if (ai > 0) {
      slab(1, ai, false);
      const [x, y] = at(1), hub = [x, y], spokes = [[x - .5, y - .3], [x + .45, y - .35], [x + .05, y + .42]];
      ctx.strokeStyle = colors.accent; ctx.globalAlpha = .7 * ai; spokes.forEach(([px, py], q) => pen(3300 + q, iso(...hub, .12), iso(px, py, .1), ai, .9));
      spokes.forEach(([px, py], q) => box(px - .1, py - .1, 0, .2, .2, .2, 3310 + q, .9 * ai, colors.accent, .14));
      box(hub[0] - .14, hub[1] - .14, 0, .28, .28, .26, 3320, .95 * ai, colors.accent, .2);
      names(1, [['AI AGENTS · MCP', colors.accent]], ai);
    }
    if (auto > 0) {
      slab(0, auto, false);
      const [x, y] = at(0); // a page of code on the platform, a spark over the line it's reviewing
      box(x - .38, y - .45, 0, .76, .9, .03, 3400, .9 * auto, colors.ink, .06);
      ctx.strokeStyle = colors.ink2; ctx.globalAlpha = .7 * auto;
      for (let q = 0; q < 5; q++) pen(3410 + q, iso(x - .26, y - .32 + q * .16, .04), iso(x - .26 + .3 + hash(q + 7) * .26, y - .32 + q * .16, .04), auto, .8);
      const line = Math.floor(time * 1.2) % 5, [sx, sy] = iso(x + .28, y - .32 + line * .16, .5), r = 6 * (1 + .15 * Math.sin(time * 5));
      ctx.fillStyle = colors.accent; ctx.globalAlpha = .9 * auto;
      ctx.beginPath(); ctx.moveTo(sx, sy - r); ctx.quadraticCurveTo(sx, sy, sx + r, sy); ctx.quadraticCurveTo(sx, sy, sx, sy + r); ctx.quadraticCurveTo(sx, sy, sx - r, sy); ctx.quadraticCurveTo(sx, sy, sx, sy - r); ctx.fill();
      names(0, [['AI CODE REVIEW', colors.accent], ['AUTOMATION', colors.ink2]], auto);
    }
    // Arrows between the platforms, pointing the way the work goes: right to left.
    [[2, 1, code * ai], [1, 0, ai * auto]].forEach(([from, to, a], q) => {
      if (a <= 0) return;
      const p = iso(at(from)[0] - P4.w - .12, at(from)[1] + .2, .05), e = iso(at(to)[0] + P4.w + .12, at(to)[1] - .2, .05);
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .7; ctx.setLineDash([3, 4]); pen(3500 + q, p, e, a, .9); ctx.setLineDash([]);
      const ang = Math.atan2(e[1] - p[1], e[0] - p[0]); ctx.globalAlpha = .8 * a; ctx.beginPath(); ctx.moveTo(e[0] - Math.cos(ang - .4) * 7, e[1] - Math.sin(ang - .4) * 7); ctx.lineTo(e[0], e[1]); ctx.lineTo(e[0] - Math.cos(ang + .4) * 7, e[1] - Math.sin(ang + .4) * 7); ctx.stroke();
    });

    // Down from the automation platform to the bottom row.
    const dr2 = ph(T4.drop2), low0 = iso(at(0)[0] + P4.w, at(0)[1] + P4.d, -P4.t);
    if (dr2 > 0) { ctx.strokeStyle = colors.line; ctx.globalAlpha = .8; ctx.setLineDash([3, 4]); pen(3600, [low0[0], low0[1] + 4], [low0[0], y3], dr2, .9); ctx.setLineDash([]); }

    // Bottom row, left to right: CI/CD gates, production on GKE, and out through the second portal.
    const r3 = ph(T4.row3), gates = ph(T4.gates), out = ph(T4.out), gx = [low0[0] + 1.1 * s, low0[0] + 2.2 * s, low0[0] + 3.3 * s], cloudX = low0[0] + 4.7 * s, xOut = cloudX + 1.5 * s;
    if (r3 > 0) {
      ctx.strokeStyle = colors.line; ctx.globalAlpha = .75; pen(3610, [low0[0], y3], [xOut - 8, y3], r3, 1);
      label('CI/CD', low0[0] - 8, y3 - 7, colors.ink, .95 * r3, 'right'); label('GITHUB ACTIONS', low0[0] - 8, y3 + 7, colors.ink2, .9 * r3, 'right');
    }
    const cycle = (time % 3.4) / 3.4, live = ph(T4.flow);
    ['BUILD', 'TEST', 'DEPLOY'].forEach((name, k) => {
      if (gates <= 0) return;
      const x = gx[k], passed = live > 0 && cycle > .3 + k * .12 && cycle < .95;
      ctx.strokeStyle = passed ? colors.accent : colors.line; ctx.globalAlpha = .9 * gates; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y3 - 7); ctx.lineTo(x + 7, y3); ctx.lineTo(x, y3 + 7); ctx.lineTo(x - 7, y3); ctx.closePath(); ctx.stroke();
      if (passed) { ctx.beginPath(); ctx.moveTo(x - 3, y3); ctx.lineTo(x - .5, y3 + 2.5); ctx.lineTo(x + 3.5, y3 - 3); ctx.stroke(); }
      label(name, x, y3 + 18, passed ? colors.accent : colors.ink2, .9 * gates);
    });
    if (gates > 0) { // production: a small cloud sitting on the line
      const r = .2 * s; ctx.strokeStyle = colors.ink; ctx.globalAlpha = .9 * gates; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(cloudX - 2.2 * r, y3 + .8 * r); ctx.lineTo(cloudX + 2.2 * r, y3 + .8 * r);
      ctx.arc(cloudX + 1.4 * r, y3, .8 * r, Math.PI * .5, Math.PI * 1.5, true); ctx.moveTo(cloudX + 1.4 * r, y3 - .8 * r);
      ctx.arc(cloudX + .2 * r, y3 - .6 * r, 1.25 * r, -Math.PI * .05, -Math.PI * .95, true);
      ctx.arc(cloudX - 1.4 * r, y3, .8 * r, -Math.PI * .5, Math.PI * .5, true); ctx.stroke();
      label('PROD', cloudX, y3 + 18, colors.ink, .95 * gates); label('GKE / K8S', cloudX, y3 + 31, colors.ink2, .9 * gates);
    }
    portal(xOut, y3, out);
    label('SHIPPED', xOut, y3 + 24, colors.accent, .9 * out);

    // Work moving through it all, once it's in place: in through the first portal, along every row, and out through the second.
    if (live > 0) {
      const way = [[xL, y1], [xR, y1], top2, iso(...at(1), .45), iso(...at(0), .3), [low0[0], low0[1] + 4], [low0[0], y3], [xOut, y3]];
      const lens = way.slice(1).map((p, q) => Math.hypot(p[0] - way[q][0], p[1] - way[q][1])), total = lens.reduce((a, b) => a + b, 0);
      const along = (u) => { let d = u * total, q = 0; while (q < lens.length - 1 && d > lens[q]) { d -= lens[q]; q++; } const f = d / lens[q]; return [way[q][0] + (way[q + 1][0] - way[q][0]) * f, way[q][1] + (way[q + 1][1] - way[q][1]) * f]; };
      ctx.fillStyle = colors.accent;
      for (let q = 0; q < 3; q++) { const u = (time * .07 + q / 3) % 1, [px, py] = along(u); ctx.globalAlpha = .9 * live * Math.min(1, u * 12, (1 - u) * 12); ctx.fillRect(px - 3, py - 3, 6, 6); }
      // Requirement sheets fly in from off the left, into the first portal.
      for (let q = 0; q < 2; q++) {
        const u = (time * .3 + q / 2) % 1, k = ease(u), px = xL - 70 * (1 - k), py = y1 - 18 * (1 - k);
        ctx.strokeStyle = colors.accent; ctx.globalAlpha = live * Math.min(1, u * 6, (1 - u) * 6) * .9; ctx.lineWidth = 1;
        ctx.save(); ctx.translate(px, py); ctx.rotate(-.3 * (1 - k)); ctx.strokeRect(-6, -4, 12, 8); ctx.restore();
      }
    }
  }

  const CHAPTERS = [chapterOne, chapterTwo, chapterThree, chapterFour];

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
