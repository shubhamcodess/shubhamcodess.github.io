/* The mcp-token-optimizer drawing, kept simple: in the same skewed view as the story's figures, a stream of tokens leaves a server, crosses mto, a sheet of anonymous JSON where some lines get struck, and what comes out is about a third of what went in.
   The only real words are the measure: 37,355 to 13,244 tokens, 64.5% fewer, from the GitHub issue list benchmark. Everything else is shape.
   One pure timeline drives everything: draw(t) gives the same picture for the same t. Colors come from the theme, and surfaces let the page show through. */
export const MtoStream = (() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (v) => { v = clamp(v); return v * v * v * (v * (v * 6 - 15) + 10); };
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const COS = Math.cos(Math.PI / 6), SIN = .5;
  const arc = (cx, cy, rx, ry = rx, from = 0, to = 360) => { const n = Math.max(6, Math.round(Math.abs(to - from) / 24)); return Array.from({ length: n + 1 }, (_, i) => { const a = ((from + ((to - from) * i) / n) * Math.PI) / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }); };
  const ring = (cx, cy, r, sides, start = -90) => Array.from({ length: sides + 1 }, (_, i) => { const a = ((start + (360 * i) / sides) * Math.PI) / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const spokes = (cx, cy, a, b, n, start = -90) => Array.from({ length: n }, (_, i) => { const t = ((start + (360 * i) / n) * Math.PI) / 180; return [[cx + Math.cos(t) * a, cy + Math.sin(t) * a], [cx + Math.cos(t) * b, cy + Math.sin(t) * b]]; });

  /* Hand-sketched references to each agent's mark, in a 24px square. */
  const MARKS = {
    claudeCode: [[[3, 4.5], [21, 4.5], [21, 10.5], [23.6, 10.5], [23.6, 13.5], [21, 13.5], [21, 16.5], [19.5, 16.5], [19.5, 19.5], [18, 19.5], [18, 16.5], [16.5, 16.5], [16.5, 19.5], [15, 19.5], [15, 16.5], [9, 16.5], [9, 19.5], [7.5, 19.5], [7.5, 16.5], [6, 16.5], [6, 19.5], [4.5, 19.5], [4.5, 16.5], [3, 16.5], [3, 13.5], [.4, 13.5], [.4, 10.5], [3, 10.5], [3, 4.5]], [[6, 7.5], [7.5, 7.5], [7.5, 10.5], [6, 10.5], [6, 7.5]], [[16.5, 7.5], [18, 7.5], [18, 10.5], [16.5, 10.5], [16.5, 7.5]]],
    claudeDesktop: spokes(12, 12, 1.6, 10.8, 12, -82).map(([a, b], i) => [a, [12 + (b[0] - 12) * (i % 2 ? .78 : 1), 12 + (b[1] - 12) * (i % 2 ? .78 : 1)]]),
    copilot: [arc(8, 8.2, 4.2, 3.8), arc(16, 8.2, 4.2, 3.8), [[12, 8], [12, 11]], [[3.8, 9.2], [2.2, 12], [2, 16.2], [6, 19.6], [12, 21], [18, 19.6], [22, 16.2], [21.8, 12], [20.2, 9.2]], [[9, 14], [9, 17]], [[15, 14], [15, 17]]],
    cursor: [ring(12, 12, 11, 6), [[12, 12], [12, 23]], [[12, 12], [2.5, 6.5]], [[12, 12], [21.5, 6.5]]],
    windsurf: [[[.8, 6.4], [3.4, 6.4], [4.4, 8.4], [4.4, 14.6], [6.6, 17.4], [9, 14.6], [9, 9.4], [11.4, 6.8], [13.8, 9.4], [13.8, 14.6], [16.2, 17.4], [18.6, 14.6], [18.6, 8.6], [20.6, 6.4], [23.2, 6.4]]],
    gemini: [[[12, .8], [13, 7], [17, 11], [23.2, 12], [17, 13], [13, 17], [12, 23.2], [11, 17], [7, 13], [.8, 12], [7, 11], [11, 7], [12, .8]]],
    cline: [arc(12, 3.2, 2.2), [[12, 5.4], [12, 7.4]], [[6, 7.4], [18, 7.4], [20.6, 10], [20.6, 19], [18, 21.8], [6, 21.8], [3.4, 19], [3.4, 10], [6, 7.4]], [[8.8, 12], [8.8, 16.4]], [[15.2, 12], [15.2, 16.4]], [[3.4, 13], [1, 13], [1, 17], [3.4, 17]], [[20.6, 13], [23, 13], [23, 17], [20.6, 17]]],
  };
  const AGENTS = ['claudeCode', 'claudeDesktop', 'copilot', 'cursor', 'windsurf', 'gemini', 'cline'];

  const PERIOD = 28, HOLD = 9.5, SHEET = 14; // The sheet runs twice a loop, and seven agents take four seconds each.
  const AGENT_TURN = PERIOD / AGENTS.length, NARROW = 480;
  const SLAB = { w: 1.02, d: .74, t: .14 }, STEP = 2.42;
  const RACK = { w: .46, d: .34, h: 1.18, u: 3 };
  const FLOW = 14, DOTS = 9, LANE = .17; // Cycles of the stream in one loop, and tokens on a lane at once. It closes on itself.

  /* The anonymous JSON: indent, key length, value length, and whether it gets struck. Only the shape of a document. */
  const ROWS = [[0, .08, 0], [1, .22, .42], [1, .3, .46, 1], [1, .2, .54, 1], [1, .18, .3], [1, .28, .48, 1], [1, .2, .44], [1, .26, .4, 1], [0, .08, 0]];
  const CUT = ROWS.map((r, i) => (r[3] ? i : -1)).filter((i) => i >= 0);
  const BEAT = { write: 0, strike: 2.4, settled: 8.2, fade: 12.8 };

  function mount(canvas, opts = {}) {
    const ctx = canvas.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, colors = {}, mono = 'monospace';
    let time = opts.startAt ?? 0, last = 0, raf = 0, visible = true, plays = opts.plays ?? 'always', hovered = false;
    let leanX = 0, leanY = 0, leanXs = 0, leanYs = 0;

    function readColors() {
      const s = getComputedStyle(canvas), v = (n) => s.getPropertyValue(n).trim();
      colors = { line: v('--line'), rest: v('--line-rest'), ink: v('--ink'), ink2: v('--ink-2'), accent: v('--accent') };
      mono = v('--font-note') || 'ui-monospace, monospace';
    }
    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    // A pen line: the same slight wander every frame, so it reads as drawn but never crawls.
    function pen(k, [ax, ay], [bx, by], width, color, alpha = 1, dash) {
      if (alpha <= .01) return;
      const len = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.round(len / 18)), nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
      ctx.beginPath(); ctx.moveTo(ax, ay);
      for (let i = 1; i <= n; i++) { const u = i / n, j = (hash(k * 31 + i) - .5) * .8 * Math.sin(Math.PI * u); ctx.lineTo(ax + (bx - ax) * u + nx * j, ay + (by - ay) * u + ny * j); }
      ctx.setLineDash(dash || []); ctx.lineWidth = width; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    // A surface: hides what's behind it in the drawing, and takes a faint tint, so the page shows through on any theme.
    function surface(pts, tint) {
      ctx.beginPath(); pts.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.closePath();
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = tint; ctx.fillStyle = colors.ink; ctx.fill(); ctx.globalAlpha = 1;
    }
    function label(s, x, y, size, color, alpha = 1, weight = 500) {
      if (alpha <= .01) return;
      ctx.font = `${weight} ${size}px ${mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.globalAlpha = alpha;
      ctx.fillText(w < NARROW ? s : s.split('').join('\u200a'), x, y); ctx.globalAlpha = 1;
    }

    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const narrow = w < NARROW, s = Math.min(w / 11.9, (h - (narrow ? 26 : 40)) / 3.5), size = clamp(s * .2, 9, 11);
      const X0 = w / 2 - STEP * COS * 2 * s + leanXs * 4, Y0 = h / 2 + .32 * s + leanYs * 3;
      const iso = (x, y, z = 0) => [X0 + (x - y) * COS * s, Y0 + (x + y) * SIN * s - z * s];
      const centre = (k) => [k * STEP, -k * STEP]; // Each station's centre: the row runs across the screen.
      const { w: sw, d: sd, t: st } = SLAB;
      const slab = (k) => {
        const [cx, cy] = centre(k);
        const top = [[cx - sw, cy - sd], [cx + sw, cy - sd], [cx + sw, cy + sd], [cx - sw, cy + sd]].map(([x, y]) => iso(x, y));
        const low = [[cx + sw, cy - sd], [cx + sw, cy + sd], [cx - sw, cy + sd]].map(([x, y]) => iso(x, y, -st));
        surface([top[0], top[1], low[0], low[1], low[2], top[3]], .06);
        for (let e = 0; e < 4; e++) pen(k * 10 + e, top[e], top[(e + 1) % 4], 1.1, colors.ink, .85);
        pen(k * 10 + 5, top[1], low[0], 1, colors.ink, .85); pen(k * 10 + 6, top[2], low[1], 1, colors.ink, .85); pen(k * 10 + 7, top[3], low[2], 1, colors.ink, .85);
        pen(k * 10 + 8, low[0], low[1], 1, colors.ink, .85); pen(k * 10 + 9, low[1], low[2], 1, colors.ink, .85);
      };
      const edgeOut = (k) => iso(centre(k)[0] + sw, centre(k)[1] - sd * .05, 0), edgeIn = (k) => iso(centre(k)[0] - sw, centre(k)[1] + sd * .05, 0);

      // The stream. Three lanes of tokens go in. At mto's edge the outer two are cut short and fall away, so one lane, about a third, comes out.
      const flow = (t / PERIOD) * FLOW;
      const dot = (x, y, color, alpha, r = 2.6) => { ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - r * .62); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r * .62); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; };
      const A = edgeOut(0), B = edgeIn(1), C = edgeOut(1), D = edgeIn(2);
      const laneOff = LANE * s, across = [-COS * .55, SIN * 1.1]; // Across the stream, along the plate's depth.
      ctx.save();
      for (const k of [-1, 0, 1]) pen(900 + k, [A[0] + across[0] * k * laneOff, A[1] + across[1] * k * laneOff], [B[0] + across[0] * k * laneOff, B[1] + across[1] * k * laneOff], .7, colors.rest, .55, [2, 5]);
      pen(905, C, D, .7, colors.rest, .55, [2, 5]);
      for (let lane = -1; lane <= 1; lane++) {
        for (let i = 0; i < DOTS; i++) {
          const phase = (flow + i / DOTS + (lane + 1) * .037) % 1;
          const px = A[0] + (B[0] - A[0]) * phase + across[0] * lane * laneOff, py = A[1] + (B[1] - A[1]) * phase + across[1] * lane * laneOff;
          const near = span(phase, .78, 1), cut = lane !== 0;
          // The two outer lanes fall away and redden as they reach the edge; the middle lane goes on through.
          const fall = cut ? ease(near) : 0;
          dot(px + across[0] * lane * laneOff * fall * .5, py + fall * s * .34, cut && near > 0 ? colors.accent : colors.ink, clamp(phase * 8) * (cut ? 1 - fall : clamp((1 - phase) * 10)) * .9);
        }
      }
      for (let i = 0; i < DOTS; i++) {
        const phase = (flow + i / DOTS) % 1;
        dot(C[0] + (D[0] - C[0]) * phase, C[1] + (D[1] - C[1]) * phase, colors.ink, clamp(phase * 10) * clamp((1 - phase) * 10) * .9);
      }
      ctx.restore();

      slab(0); slab(1); slab(2);

      // The server: just an outline, three units with a light each.
      {
        const [cx, cy] = centre(0), { w: rw, d: rd, h: rh, u } = RACK;
        const P = (x, y, z) => iso(cx + x, cy + y, z);
        const t0 = P(-rw, -rd, rh), t1 = P(rw, -rd, rh), t2 = P(rw, rd, rh), t3 = P(-rw, rd, rh), b1 = P(rw, -rd, 0), b2 = P(rw, rd, 0), b3 = P(-rw, rd, 0);
        surface([t0, t1, b1, b2, b3, t3], .05);
        [[t0, t1], [t1, t2], [t2, t3], [t3, t0], [t1, b1], [t2, b2], [t3, b3], [b1, b2], [b2, b3]].forEach(([p, q], e) => pen(100 + e, p, q, 1, colors.ink, .9));
        for (let i = 1; i < u; i++) { const z = rh * i / u; pen(120 + i, P(-rw, rd, z), P(rw, rd, z), .8, colors.ink, .6); pen(125 + i, P(rw, rd, z), P(rw, -rd, z), .8, colors.ink, .6); }
        for (let i = 0; i < u; i++) {
          const z = rh * (i + .5) / u, [lx, ly] = P(-rw + .16, rd, z), on = Math.sin(t * 2.2 + i * 2) > .1;
          dot(lx, ly, on ? colors.accent : colors.ink, on ? .95 : .35, 2.4);
          pen(130 + i, P(-rw + .34, rd, z), P(rw - .12, rd, z), .7, colors.ink, .35);
        }
      }

      // mto: a sheet lying on its slab, an anonymous document. It writes, some lines are struck and go, and the rest close up.
      {
        const [cx, cy] = centre(1), c = t % SHEET, m = .14;
        const P = (x, y) => iso(cx + x, cy + y, .002);
        const sheet = [P(-sw + m, -sd + m * .8), P(sw - m, -sd + m * .8), P(sw - m, sd - m * .8), P(-sw + m, sd - m * .8)];
        sheet.forEach((p, e) => pen(200 + e, p, sheet[(e + 1) % 4], .8, colors.line, .7));
        const x0 = -sw + m + .14, wide = (sw - m) * 2 - .28, y0 = -sd + m * .8 + .12, lh = ((sd - m * .8) * 2 - .24) / (ROWS.length - 1);
        const fade = 1 - ease(span(c, BEAT.fade, SHEET - .1));
        ROWS.forEach(([ind, key, val, cut], i) => {
          const shown = span(c, BEAT.write + i * .22, BEAT.write + i * .22 + .5);
          if (shown <= 0) return;
          const at = cut ? BEAT.strike + (CUT.indexOf(i) / CUT.length) * (BEAT.settled - BEAT.strike - 1.2) : 0;
          const strike = cut ? span(c, at, at + .35) : 0, gone = cut ? ease(span(c, at + .35, at + .85)) : 0;
          if (gone >= 1) return;
          let row = i;
          for (const j of CUT) if (j < i) { const a = BEAT.strike + (CUT.indexOf(j) / CUT.length) * (BEAT.settled - BEAT.strike - 1.2); row -= ease(span(c, a + .4, a + 1)); }
          const y = y0 + row * lh + (gone * lh * .4), xs = x0 + ind * .14, keyEnd = xs + wide * key * shown, valStart = keyEnd + .07, valEnd = valStart + wide * val * shown;
          const alpha = fade * (1 - gone);
          pen(220 + i, P(xs, y), P(keyEnd, y), 1.5, strike > 0 ? colors.accent : colors.ink, alpha * (cut ? .85 : .95));
          if (val && shown >= 1) pen(240 + i, P(valStart, y), P(valEnd, y), 1, strike > 0 ? colors.accent : colors.ink, alpha * .55);
          if (strike > 0 && strike < 1) pen(260 + i, P(xs - .04, y), P(xs + (wide * (key + val) + .15) * strike, y), 1, colors.accent, alpha);
        });
      }

      // The agent: one mark on its slab, lying in the same plane, turning to the next as the others fade.
      {
        const [cx, cy] = centre(2), turn = t / AGENT_TURN, index = Math.floor(turn) % AGENTS.length, slide = ease(span(turn % 1, .8, 1));
        const scale = .036, gap = .92; // In plate units.
        for (let k = -1; k <= 2; k++) {
          const name = AGENTS[(index + k + AGENTS.length) % AGENTS.length], off = k - slide, near = Math.max(0, 1 - Math.abs(off));
          const alpha = (.1 + .9 * near * near) * clamp(1.5 - Math.abs(off));
          if (alpha <= .01) continue;
          const my = off * gap * .62; // Slides along the slab's depth.
          MARKS[name].forEach((stroke, i) => {
            const pts = stroke.map(([x, y]) => iso(cx + (x - 12) * scale, cy + (y - 12) * scale + my));
            for (let q = 0; q < pts.length - 1; q++) pen(600 + k * 50 + i * 20 + q, pts[q], pts[q + 1], 1, colors.ink, alpha);
          });
        }
      }

      // The only words: what each station is, and the measure.
      const nameAt = (k) => { const [x, y] = iso(centre(k)[0] - sw, centre(k)[1] - sd); return [x, y - size - 3]; };
      if (!narrow) {
        const [ax, ay] = nameAt(0), [bx, by] = nameAt(1), [cx2, cy2] = nameAt(2);
        const rackTop = iso(centre(0)[0] - RACK.w, centre(0)[1] - RACK.d, RACK.h)[1];
        label('MCP SERVER', ax, Math.min(ay, rackTop - size), size, colors.ink2);
        label('MTO', bx, by, size + 1, colors.ink, 1, 600); label('YOUR AGENT', cx2, cy2, size, colors.ink2);
      }
      const measureY = Math.max(iso(centre(1)[0] + sw, centre(1)[1] + sd, -st)[1], 0) + size + 8;
      label('37,355 TOK', (A[0] + B[0]) / 2, Math.max(A[1], B[1]) + s * .62, size, colors.ink2);
      label('13,244 TOK', (C[0] + D[0]) / 2, Math.max(C[1], D[1]) + s * .62, size, colors.ink);
      label('64.5% FEWER', iso(centre(1)[0] + sw, centre(1)[1] + sd)[0], measureY, size + (narrow ? 0 : 1.5), colors.accent, 1, 600);
    }

    function frame(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      const k = 1 - Math.exp(-dt * 3.2);
      leanXs += (leanX - leanXs) * k; leanYs += (leanY - leanYs) * k;
      if (!reduced && (plays === 'always' || hovered)) time = (time + dt) % PERIOD;
      draw(reduced ? HOLD : time);
      if (!reduced || Math.abs(leanX - leanXs) + Math.abs(leanY - leanYs) > .001) raf = requestAnimationFrame(frame);
    }
    const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    const host = opts.pointerHost || canvas;
    host.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') { hovered = true; wake(); } });
    host.addEventListener('pointerleave', () => { hovered = false; leanX = 0; leanY = 0; wake(); });
    host.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = host.getBoundingClientRect();
      leanX = (e.clientX - r.left) / r.width - .5; leanY = (e.clientY - r.top) / r.height - .5; wake();
    });
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(canvas);
    new ResizeObserver(() => { resize(); draw(reduced ? HOLD : time); }).observe(canvas);
    new MutationObserver(() => { readColors(); draw(reduced ? HOLD : time); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette', 'style'] });
    document.addEventListener('visibilitychange', wake);
    if (document.fonts) document.fonts.ready.then(() => { readColors(); draw(reduced ? HOLD : time); });

    readColors(); resize(); draw(reduced ? HOLD : time); wake();
    return {
      set(key, value) { if (key === 'plays') { plays = value; if (value === 'hover') time = HOLD; wake(); } },
      seek(t) { time = t % PERIOD; plays = 'paused'; draw(time); },
    };
  }
  return { mount, PERIOD, HOLD };
})();
