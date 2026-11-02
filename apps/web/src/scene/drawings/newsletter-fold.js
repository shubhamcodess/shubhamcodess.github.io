/* The EverythingTech drawing: a folded newspaper opens on a drafting plate, the pen writes the front page, it passes its checks, then it folds away.
   One pure timeline drives everything: draw(t) gives the same picture for the same t, so a test can freeze any moment. */
export const NewsletterFold = (() => {
  const W = 3.4, H = 4.3, PERIOD = 15, HOLD = 10, TAU = Math.PI * 2;
  const MAX_FOLD = Math.PI - .05; // never quite shut, so the layers keep a little thickness
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (v) => { v = clamp(v); return v * v * v * (v * (v * 6 - 15) + 10); };
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  const STEPS = [['Collect', 0, 1.6], ['Sort', 1.6, 4.4], ['Write', 4.4, 7.7], ['Check', 7.7, 8.7], ['Publish', 8.7, 15]];

  /* ---------- The front page, in paper coordinates. Lines crossing a fold are split so each panel carries its own part. ---------- */
  const quadOf = (x, y) => (y > 0 ? 2 : 0) + (x > 0 ? 1 : 0); // 0 TL, 1 TR, 2 BL, 3 BR
  function buildPage() {
    const quads = [[], [], [], []];
    let id = 1;
    function add(x1, y1, x2, y2, at, dur, style) {
      const cuts = [0, 1];
      if ((x1 < 0) !== (x2 < 0)) cuts.push(-x1 / (x2 - x1));
      if ((y1 < 0) !== (y2 < 0)) cuts.push(-y1 / (y2 - y1));
      cuts.sort((a, b) => a - b);
      for (let i = 0; i + 1 < cuts.length; i++) {
        const a = cuts[i], b = cuts[i + 1];
        const ax = x1 + (x2 - x1) * a, ay = y1 + (y2 - y1) * a, bx = x1 + (x2 - x1) * b, by = y1 + (y2 - y1) * b;
        quads[quadOf((ax + bx) / 2, (ay + by) / 2)].push({ ax, ay, bx, by, at: at + dur * a, dur: dur * (b - a), style, seed: id++ });
      }
    }
    // One line of text: words of uneven length rather than a ruled bar.
    function words(x1, x2, y, at, dur, style = 'text', seed = 1) {
      let x = x1, i = 0;
      while (x < x2) {
        const w = Math.min(x2 - x, .13 + hash(seed * 3.1 + i) * .3);
        add(x, y, x + w, y, at + dur * (x - x1) / (x2 - x1), dur * w / (x2 - x1), style);
        x += w + .045; i++;
      }
    }
    const L = -W / 2 + .17, R = W / 2 - .17;
    add(L, -1.72, R, -1.72, .05, .08, 'rule'); add(L, -1.68, R, -1.68, .07, .08, 'rule');
    // The 60-second Brief: five lines in a box.
    [[L, -1.6, R, -1.6], [R, -1.6, R, -1.14], [R, -1.14, L, -1.14], [L, -1.14, L, -1.6]].forEach((l, i) => add(...l, .12 + i * .012, .02, 'line'));
    for (let i = 0; i < 5; i++) words(L + .1, R - .1 - hash(i + 9) * .6, -1.52 + i * .081, .16 + i * .018, .018, 'text', i + 20);
    // The lead story: a picture block, a headline, then its column.
    const px0 = L, px1 = .3, py0 = -1.04, py1 = -.1;
    [[px0, py0, px1, py0], [px1, py0, px1, py1], [px1, py1, px0, py1], [px0, py1, px0, py0]].forEach((l, i) => add(...l, .27 + i * .01, .012, 'line'));
    for (let k = py0 - py1; k < px1 - px0; k += .085) { // hatch across the block, trimmed to its edges
      const s0 = Math.max(0, -k), s1 = Math.min(py1 - py0, px1 - px0 - k);
      add(px0 + k + s0, py1 - s0, px0 + k + s1, py1 - s1, .31 + (k + .94) * .03, .012, 'hatch');
    }
    add(L, .03, .22, .03, .36, .03, 'head'); add(L, .135, -.28, .135, .39, .02, 'head');
    for (let i = 0; i < 2; i++) words(L, .3 - i * .12, .25 + i * .08, .41 + i * .012, .012, 'text', i + 40);
    for (let i = 0; i < 15; i++) words(.42, R - (i === 14 ? .4 : 0), py0 + .02 + i * .092, .33 + i * .006, .007, 'text', i + 60);
    add(L, .48, R, .48, .46, .03, 'rule');
    // Six must-reads, three across and two down.
    const cols = 3, gap = .12, cw = (R - L - gap * (cols - 1)) / cols;
    for (let row = 0; row < 2; row++) for (let c = 0; c < cols; c++) {
      const x = L + c * (cw + gap), y = .6 + row * .5, at = .5 + (row * 3 + c) * .03;
      add(x, y, x + cw * (.62 + hash(row * 3 + c) * .34), y, at, .012, 'sub');
      for (let i = 0; i < 3; i++) words(x, x + cw - (i === 2 ? .22 : 0), y + .09 + i * .075, at + .012 + i * .006, .007, 'text', row * 30 + c * 7 + i + 80);
    }
    add(L, 1.6, R, 1.6, .7, .03, 'rule');
    // The wire: short ticked rows.
    for (let i = 0; i < 4; i++) {
      add(L, 1.71 + i * .1, L + .05, 1.71 + i * .1, .73 + i * .02, .005, 'tick');
      words(L + .1, R - hash(i + 3) * .9, 1.71 + i * .1, .735 + i * .02, .03, 'text', i + 120);
    }
    return quads;
  }
  const PAGE = buildPage();

  // Hatching on the back of the sheet, in paper coordinates.
  function buildBack() {
    const out = [[], [], [], []];
    for (let q = 0; q < 4; q++) {
      const x0 = q % 2 ? 0 : -W / 2, x1 = q % 2 ? W / 2 : 0, y0 = q > 1 ? 0 : -H / 2, y1 = q > 1 ? H / 2 : 0;
      // Diagonal strokes rising from the lower edge and fading upward, the same texture as the button.
      for (let k = 0; k < 15; k++) {
        const bx = x0 + (x1 - x0) * (k + .5) / 15, len = Math.min(x1 - bx, y1 - y0) * .55;
        if (len > .04) out[q].push({ ax: bx, ay: y1 - .02, bx: bx + len, by: y1 - .02 - len, seed: q * 100 + k + 500 });
      }
    }
    return out;
  }
  const BACK = buildBack();

  const BAT = [[1.8, 8], [4.5, 12.6], [7.2, 11.2], [9.2, 15], [12, 19], [14.8, 15], [16.8, 11.2], [19.5, 12.6], [22.2, 8], [18.6, 8.8], [15.6, 6.6], [13.6, 9.2], [12.9, 6], [12, 8.2], [11.1, 6], [10.4, 9.2], [8.4, 6.6], [5.4, 8.8], [1.8, 8]];

  const SOURCES = Array.from({ length: 16 }, (_, i) => ({ side: hash(i + 2) > .5 ? 1 : -1, y: hash(i * 5.3) * 1.5 - .75, delay: hash(i * 2.2) * .85, bend: (hash(i * 7.7) - .5) * .9 }));

  /* ---------- Mount one drawing on a canvas ---------- */
  function mount(canvas, opts = {}) {
    const ctx = canvas.getContext('2d'), host = canvas.parentElement, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cfg = { plays: 'always', line: 'steady', callouts: true, ...opts };
    let w = 0, h = 0, dpr = 1, scale = 1, cx = 0, cy = 0, colors = {};
    let time = cfg.startAt ?? 0, last = 0, raf = 0, visible = true;
    let hovered = false, yawT = 0, tiltT = 0, yawS = 0, tiltS = 0;
    let boil = 0;

    function readColors() {
      const s = getComputedStyle(canvas), v = (n) => s.getPropertyValue(n).trim();
      colors = { line: v('--line'), rest: v('--line-rest'), ink: v('--ink'), ink2: v('--ink-2'), accent: v('--accent'), paper: v('--paper') };
    }
    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      scale = Math.min(w / 6.3, h / 5); cx = w / 2; cy = h * .455;
    }

    function project(x, y, z, yaw, tilt) {
      const c = Math.cos(yaw), s = Math.sin(yaw), x1 = x * c - y * s, y1 = x * s + y * c;
      const ct = Math.cos(tilt), st = Math.sin(tilt), y2 = y1 * ct - z * st, d = y1 * st + z * ct, k = 9.5 / (9.5 - d);
      return [cx + x1 * k * scale, cy + y2 * k * scale];
    }

    // A pen line: the same small wander every frame, so it reads as drawn but does not crawl unless Line is set to Alive.
    function pen(pts, seed, amp, width, color, alpha = 1, dash) {
      if (alpha <= .01 || pts.length < 2) return;
      ctx.beginPath();
      const n = pts.length;
      const off = (i) => {
        if (i === 0 && n === 2) return [0, 0];
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        const q = (hash(seed + i * 1.7 + boil * 31) - .5) * amp * 2;
        return [pts[i][0] - dy / l * q, pts[i][1] + dx / l * q];
      };
      let p = off(0); ctx.moveTo(p[0], p[1]);
      for (let i = 1; i < n; i++) {
        const q = off(i);
        ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
        p = q;
      }
      ctx.lineTo(p[0], p[1]);
      ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width;
      ctx.setLineDash(dash || []);
      ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    const steps = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
    const seg = (a, b, seed, amp, width, color, alpha, dash) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      pen(steps(a, b, Math.max(2, Math.min(9, Math.round(len / 16)))), seed, amp, width, color, alpha, dash);
    };

    function draw(t) {
      if (!w) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      /* --- Where the timeline is --- */
      const openA = ease(span(t, 1.5, 2.95)), closeA = ease(span(t, 13.75, 14.85));
      const openB = ease(span(t, 3.0, 4.45)), closeB = ease(span(t, 12.5, 13.65));
      const a = MAX_FOLD * (1 - openA + closeA), b = MAX_FOLD * (1 - openB + closeB);
      const writing = t < 13.9 ? span(t, 4.4, 7.7) : 0; // cleared only once the sheet is shut again
      const check = span(t, 7.75, 8.45) * (1 - span(t, 12.2, 12.5));
      const notes = ease(span(t, 5, 6.2)) * (1 - ease(span(t, 11.9, 12.4)));
      const yaw = -.17 + yawS + Math.sin(t / PERIOD * TAU) * .012, tilt = .8 + tiltS;
      const ox = W / 4 * (a / MAX_FOLD), oy = H / 4 * (b / MAX_FOLD);

      const lift = (q) => { // the stack's thickness, so a closed packet shows its layers
        const closed = (a + b) / (2 * MAX_FOLD);
        return closed * .012 * (q === 3 ? 2 : q === 1 ? 3 : q === 2 ? 1 : 0);
      };
      const fold = (x, y, q) => {
        let yy = y, z = 0;
        if (q > 1) { yy = y * Math.cos(b); z = y * Math.sin(b); }
        let xx = x;
        if (q % 2) { xx = x * Math.cos(a) - z * Math.sin(a); z = x * Math.sin(a) + z * Math.cos(a); }
        return [xx + ox, yy + oy, z + lift(q)];
      };
      const P = (x, y, q) => { const f = fold(x, y, q); return project(f[0], f[1], f[2], yaw, tilt); };
      const flat = (x, y, q, dx = 0, dy = 0) => { const f = fold(x, y, q); return project(f[0] + dx, f[1] + dy, 0, yaw, tilt); };
      const corners = (q) => {
        const x0 = q % 2 ? 0 : -W / 2, x1 = q % 2 ? W / 2 : 0, y0 = q > 1 ? 0 : -H / 2, y1 = q > 1 ? H / 2 : 0;
        return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      };

      /* --- Collect: the sources stream in to the shut packet --- */
      const stream = 1 - span(t, 1.45, 1.75);
      if (t < 1.75) {
        const home = project(ox - W / 4, oy - H / 4, .1, yaw, tilt);
        SOURCES.forEach((s, i) => {
          const u = ease(span(t, s.delay, s.delay + .75));
          if (u <= 0 || u >= 1) return;
          const sx = cx + s.side * Math.min(w / 2 - 10, 3 * scale), sy = cy + s.y * scale;
          const at = (v) => { const m = 1 - v; return [m * m * sx + 2 * m * v * ((sx + home[0]) / 2) + v * v * home[0], m * m * sy + 2 * m * v * (sy + s.bend * scale) + v * v * home[1]]; };
          const tail = at(Math.max(0, u - .16)), head = at(u);
          seg(tail, head, i + 900, .3, 1, colors.line, .6 * stream);
          ctx.globalAlpha = .9 * stream; ctx.fillStyle = colors.line;
          ctx.fillRect(head[0] - 1, head[1] - 1, 2, 2); ctx.globalAlpha = 1;
        });
      }

      /* --- The shadow is a wireframe, as on the button --- */
      const shadowDash = [2.5, 3.5];
      for (let q = 0; q < 4; q++) {
        const c = corners(q), pts = c.map((p) => flat(p[0], p[1], q, .12, .1));
        for (let e = 0; e < 4; e++) seg(pts[e], pts[(e + 1) % 4], q * 11 + e + 300, .25, .8, colors.line, .22, shadowDash);
      }

      /* --- Construction arcs: the path each corner travels as a fold opens --- */
      const arcA = Math.sin(Math.PI * span(t, 1.2, 3.1)), arcB = Math.sin(Math.PI * span(t, 2.75, 4.65));
      if (arcA > .01) {
        const arc = Array.from({ length: 19 }, (_, i) => { const ang = MAX_FOLD * i / 18, x = W / 2, c = Math.cos(ang), s = Math.sin(ang); return project(x * c, -H / 2 + H / 4, x * s, yaw, tilt); });
        pen(arc, 41, .3, .9, colors.accent, arcA * .7, [3, 4]);
      }
      if (arcB > .01) {
        const arc = Array.from({ length: 19 }, (_, i) => { const ang = MAX_FOLD * i / 18, y = H / 2, c = Math.cos(ang), s = Math.sin(ang); return project(W / 2, y * c, y * s, yaw, tilt); });
        pen(arc, 43, .3, .9, colors.accent, arcB * .7, [3, 4]);
      }

      /* --- Panels, furthest first --- */
      const order = a > .001
        ? (a < Math.PI / 2 ? [0, 2, 1, 3] : [0, 2, 3, 1])
        : [0, 1, 2, 3];
      for (const q of order) {
        const c = corners(q), pts = c.map((p) => P(p[0], p[1], q));
        let area = 0;
        for (let e = 0; e < 4; e++) { const u = pts[e], v = pts[(e + 1) % 4]; area += u[0] * v[1] - v[0] * u[1]; }
        const front = area > 0;

        ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
        ctx.fillStyle = colors.paper; ctx.fill();

        if (front) {
          for (const l of PAGE[q]) {
            const f = clamp((writing - l.at) / l.dur);
            if (f <= 0) continue;
            const A = P(l.ax, l.ay, q), B = P(l.ax + (l.bx - l.ax) * f, l.ay + (l.by - l.ay) * f, q);
            const st = l.style;
            if (st === 'text') seg(A, B, l.seed, .3, .75, colors.ink2, .62);
            else if (st === 'hatch') seg(A, B, l.seed, .25, .6, colors.line, .42);
            else if (st === 'head') seg(A, B, l.seed, .35, 2.1, colors.ink, .9);
            else if (st === 'sub') seg(A, B, l.seed, .3, 1.35, colors.ink, .8);
            else if (st === 'tick') seg(A, B, l.seed, .1, 1.4, colors.accent, .85);
            else if (st === 'rule') seg(A, B, l.seed, .3, .85, colors.rest, .9);
            else seg(A, B, l.seed, .35, .9, colors.line, .75);
          }
          // Masthead: real type laid on the sheet, revealed left to right, never hand-lettered.
          if (q < 2 && writing > 0) {
            const O = P(0, -1.9, q), X = P(q ? 1 : -1, -1.9, q), Y = P(0, -1.6, q), ux = (q ? 1 : -1), reveal = -1.5 + clamp(writing / .1) * 3;
            ctx.save();
            ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.clip();
            ctx.transform((X[0] - O[0]) * ux, (X[1] - O[1]) * ux, (Y[0] - O[0]) / .3, (Y[1] - O[1]) / .3, O[0], O[1]);
            ctx.beginPath(); ctx.rect(-1.6, -.4, reveal + 1.6, .6); ctx.clip();
            ctx.scale(.0034, .0034);
            ctx.font = '600 100px "Barlow Semi Condensed", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = colors.ink;
            ctx.letterSpacing = '4px';
            ctx.fillText('EVERYTHINGTECH', 0, 26);
            ctx.restore();
          }
        } else {
          for (const k of BACK[q]) seg(P(k.ax, k.ay, q), P(k.bx, k.by, q), k.seed, .3, .7, colors.line, .24);
          // A small sketched bat sits on the outside of the shut packet.
          if (q === 1 && a > Math.PI / 2) {
            const bat = BAT.map(([x, y]) => P(W / 4 + (x - 12) * .03, -H / 4 + (y - 12) * .03, q));
            pen(bat, 71, .22, 1, colors.accent, .85);
          }
        }

        // Outer edges run slightly past the corners, like the button. Fold lines stay faint and dashed.
        for (let e = 0; e < 4; e++) {
          const u = c[e], v = c[(e + 1) % 4], onFold = (u[0] === 0 && v[0] === 0) || (u[1] === 0 && v[1] === 0);
          if (onFold) { seg(P(u[0], u[1], q), P(v[0], v[1], q), q * 17 + e, .15, .8, colors.line, .3, [3, 4]); continue; }
          const dx = Math.sign(v[0] - u[0]) * .07, dy = Math.sign(v[1] - u[1]) * .07;
          const atFoldU = u[0] === 0 || u[1] === 0, atFoldV = v[0] === 0 || v[1] === 0;
          const A = P(u[0] - (atFoldU ? 0 : dx), u[1] - (atFoldU ? 0 : dy), q), B = P(v[0] + (atFoldV ? 0 : dx), v[1] + (atFoldV ? 0 : dy), q);
          seg(A, B, q * 23 + e + 40, .45, 1.05, colors.line, .95);
          seg(A, B, q * 29 + e + 70, .85, .65, colors.line, .3);
        }
      }

      /* --- Check: an amber tick is pen-drawn only once the page is finished --- */
      if (check > 0) {
        const c = [[.0, .0], [.09, .1], [.26, -.15]].map(([x, y]) => [W / 2 - .58 + x * 1.5, 1.86 + y * 1.5]);
        const f = check * 2, pts = [P(c[0][0], c[0][1], 3)];
        const mid = P(c[1][0], c[1][1], 3), end = P(c[2][0], c[2][1], 3);
        if (f < 1) pts.push([pts[0][0] + (mid[0] - pts[0][0]) * f, pts[0][1] + (mid[1] - pts[0][1]) * f]);
        else { pts.push(mid); pts.push([mid[0] + (end[0] - mid[0]) * (f - 1), mid[1] + (end[1] - mid[1]) * (f - 1)]); }
        if (openA + openB > 1.9) {
          ctx.lineWidth = 1.9; ctx.strokeStyle = colors.accent; ctx.beginPath();
          pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
        }
      }

      /* --- Callouts: real parts of the paper, only where there is room --- */
      if (cfg.callouts && notes > 0) {
        const fs = Math.max(9, Math.min(11, w / 56));
        ctx.font = `500 ${fs}px ui-monospace,Menlo,monospace`;
        const gap = Math.max(0, w / 2 - (W / 2 + .3) * scale);
        const note = (label, px, py, q, side, row, i) => {
          const tw = ctx.measureText(label).width;
          if (gap < tw + 14) return;
          const f = ease(clamp(notes * 3.2 - i * .4));
          if (f <= 0) return;
          const A = P(px, py, q), X = side > 0 ? w - tw - 12 : 12 + tw, Y = cy + row * scale;
          const elbow = [A[0] + (X - A[0]) * .55, Y];
          const end = [X - side * 4, Y];
          const pts = [A, elbow, end], total = f * 2;
          const drawn = total < 1 ? [A, [A[0] + (elbow[0] - A[0]) * total, A[1] + (elbow[1] - A[1]) * total]]
            : [A, elbow, [elbow[0] + (end[0] - elbow[0]) * (total - 1), elbow[1]]];
          ctx.globalAlpha = .8 * notes; ctx.strokeStyle = colors.line; ctx.lineWidth = .8;
          ctx.beginPath(); drawn.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
          ctx.fillStyle = colors.accent; ctx.fillRect(A[0] - 1.5, A[1] - 1.5, 3, 3);
          ctx.globalAlpha = f * notes; ctx.fillStyle = colors.ink2;
          ctx.textBaseline = 'middle'; ctx.textAlign = side > 0 ? 'left' : 'right';
          ctx.fillText(label, X, Y); ctx.globalAlpha = 1;
          void pts;
        };
        note('60-SEC BRIEF', W / 2 - .17, -1.37, 1, 1, -1.16, 0);
        note('LEAD STORY', -W / 2 + .17, -.55, 0, -1, -.62, 1);
        note('MUST-READS', W / 2 - .17, .85, 3, 1, .32, 2);
        note('THE WIRE', -W / 2 + .17, 1.78, 2, -1, .92, 3);
      }

      /* --- Sources label and the five real steps along the foot of the plate --- */
      const fs2 = Math.max(9, Math.min(10.5, w / 58));
      ctx.font = `500 ${fs2}px ui-monospace,Menlo,monospace`;
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      if (t < 2.2) {
        ctx.globalAlpha = ease(span(t, .1, .5)) * (1 - span(t, 1.7, 2.2));
        ctx.fillStyle = colors.ink2; ctx.textAlign = 'center';
        ctx.fillText('45+ SOURCES', cx, 20);
        ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      }
      const labels = STEPS.map((s) => s[0].toUpperCase()), widths = labels.map((l) => ctx.measureText(l).width);
      const sepW = Math.min(20, (w - 24 - widths.reduce((u, v) => u + v, 0)) / 4), total = widths.reduce((u, v) => u + v, 0) + sepW * 4;
      let x = cx - total / 2; const y = h - 11;
      STEPS.forEach((s, i) => {
        const on = ease(span(t, s[1] - .1, s[1] + .35)) * (1 - ease(span(t, s[2] - .1, s[2] + .35)));
        const past = i === 4 ? (t > 12.6 ? 1 - span(t, 12.6, 13.2) : 1) : 1;
        ctx.globalAlpha = .42 + .58 * on * past;
        ctx.fillStyle = on * past > .5 ? colors.accent : colors.ink2;
        ctx.fillText(labels[i], x, y);
        x += widths[i];
        if (i < 4) { ctx.globalAlpha = .4; ctx.strokeStyle = colors.line; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x + 4, y - 3.5); ctx.lineTo(x + sepW - 4, y - 3.5); ctx.stroke(); }
        x += sepW;
      });
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      const k = 1 - Math.exp(-dt * 3.2); // the camera follows the pointer slowly
      yawS += (yawT - yawS) * k; tiltS += (tiltT - tiltS) * k;
      if (!reduced && (cfg.plays === 'always' || hovered)) time = (time + dt) % PERIOD;
      if (cfg.line === 'alive') boil = Math.floor(now / 170) % 5; else boil = 0;
      draw(reduced ? HOLD : time);
      if (!reduced) raf = requestAnimationFrame(frame);
    }
    function wake() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    const pointerHost = opts.pointerHost || host;
    pointerHost.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') { hovered = true; wake(); } });
    pointerHost.addEventListener('pointerleave', () => { hovered = false; yawT = 0; tiltT = 0; });
    pointerHost.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = pointerHost.getBoundingClientRect();
      yawT = ((e.clientX - r.left) / r.width - .5) * .1;
      tiltT = ((e.clientY - r.top) / r.height - .5) * -.07;
    });

    new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(canvas);
    new ResizeObserver(() => { resize(); draw(reduced ? HOLD : time); }).observe(canvas);
    new MutationObserver(() => { readColors(); draw(reduced ? HOLD : time); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });
    document.addEventListener('visibilitychange', wake);
    if (document.fonts) document.fonts.ready.then(() => draw(reduced ? HOLD : time));

    readColors(); resize(); draw(reduced ? HOLD : time); wake();
    return {
      set(key, value) { cfg[key] = value; if (key === 'plays' && value === 'hover') time = HOLD; wake(); },
      seek(t) { time = t % PERIOD; draw(time); },
    };
  }
  return { mount, PERIOD, HOLD };
})();
