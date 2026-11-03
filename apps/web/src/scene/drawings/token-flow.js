/* The mcp-token-optimizer drawing: a tool response leaves an MCP server, passes through mto, a sketched cube, loses its noise, and reaches the agent shorter. The server's name and the agent's mark turn as it runs.
   The two dimension lines are to scale: 37,355 and 13,244 tokens, from the GitHub issue list benchmark.
   One pure timeline drives everything: draw(t) gives the same picture for the same t. */
export const TokenFlow = (() => {
  const CYCLE = 13, PERIOD = CYCLE * 2, HOLD = 9; // The tokens run twice a loop, so the names and marks close on themselves too.
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (v) => { v = clamp(v); return v * v * v * (v * (v * 6 - 15) + 10); };
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

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
  const SERVERS = ['github', 'kubernetes', 'filesystem']; // The servers on the project's own site.

  // A server, a cube and an agent on one wire. Everything is measured from these.
  const SERVER = { x: -2.25, w: .3, d: .28, h: 1.02, units: 4 }, MTO = { x: 0, w: .46, d: .44, h: .9 }, AGENT = { x: 2.25, w: .42 };
  const LANE = SERVER.x + SERVER.w, GATE = MTO.x - MTO.w, OUT = MTO.x + MTO.w, END = AGENT.x - AGENT.w, RAIL = .27;
  const RATIO = 13244 / 37355;

  // Fourteen rows leave the server and five arrive: about the same share as the real result. The rest is noise.
  const ROWS = 14, KEPT = [1, 4, 7, 9, 12], GAP = (GATE - LANE) / ROWS, SPEED = .7, START = .7, LEAVE = (GAP / SPEED);
  const rows = Array.from({ length: ROWS }, (_, i) => {
    const k = KEPT.indexOf(i), out = START + i * LEAVE, gate = out + (GATE - LANE) / SPEED;
    return { i, k, out, gate, thru: gate + (OUT - GATE) / .9, stop: END - .04 - k * (((GATE - LANE) * RATIO) / KEPT.length) };
  });

  function mount(canvas, opts = {}) {
    const ctx = canvas.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, scale = 1, cx = 0, cy = 0, colors = {}, font = 'monospace';
    let time = opts.startAt ?? 0, last = 0, raf = 0, visible = true, plays = opts.plays ?? 'always', hovered = false;
    let yawT = 0, tiltT = 0, yawS = 0, tiltS = 0;

    function readColors() {
      const s = getComputedStyle(canvas), v = (n) => s.getPropertyValue(n).trim();
      colors = { line: v('--line'), rest: v('--line-rest'), ink: v('--ink'), ink2: v('--ink-2'), accent: v('--accent'), paper: v('--paper') };
      font = v('--font-note') || 'monospace';
    }
    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      scale = Math.min(w / 6.05, h / 3.3); cx = w / 2; cy = h * .6;
    }
    function at(x, y, z = 0) {
      const yaw = -.08 + yawS, tilt = .8 + tiltS;
      const c = Math.cos(yaw), s = Math.sin(yaw), x1 = x * c - y * s, y1 = x * s + y * c;
      const ct = Math.cos(tilt), st = Math.sin(tilt), y2 = y1 * ct - z * st, k = 9.5 / (9.5 - (y1 * st + z * ct));
      return [cx + x1 * k * scale, cy + y2 * k * scale];
    }
    // A pen line: the same small wander every frame, so it reads as drawn but doesn't crawl.
    function pen(pts, seed, width, color, alpha = 1, dash) {
      if (alpha <= .01) return;
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const q = i === 0 || i === pts.length - 1 ? 0 : (hash(seed + i * 1.7) - .5) * .8;
        ctx[i ? 'lineTo' : 'moveTo'](x - ((b[1] - a[1]) / l) * q, y + ((b[0] - a[0]) / l) * q);
      });
      ctx.setLineDash(dash || []); ctx.lineWidth = width; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    // A straight line in the scene, broken into a few points so the pen can wander.
    function seg(a, b, seed, width, color, alpha, dash) {
      const pts = [];
      for (let i = 0; i <= 5; i++) pts.push(at(a[0] + (b[0] - a[0]) * i / 5, a[1] + (b[1] - a[1]) * i / 5, (a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * i / 5));
      pen(pts, seed, width, color, alpha, dash);
    }
    function face(corners, seed) {
      const p = corners.map((c) => at(...c));
      ctx.beginPath(); p.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.closePath();
      // Hides what's behind it in the drawing, but the page shows through, so it matches any theme.
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .08; ctx.fillStyle = colors.ink; ctx.fill(); ctx.globalAlpha = 1;
      corners.forEach((c, i) => {
        const n = corners[(i + 1) % corners.length];
        seg(c, n, seed + i, 1.1, colors.line, 1);
        seg(c, n, seed + i + 40, .55, colors.line, .35);
      });
    }
    function block({ x, w: bw, d, h: bh }, seed) {
      const l = x - bw, r = x + bw;
      for (const [a, b] of [[[l, -d], [r, -d]], [[r, -d], [r, d]], [[r, d], [l, d]], [[l, d], [l, -d]]]) seg([a[0] + .09, a[1] + .07], [b[0] + .09, b[1] + .07], seed + 70 + a[0], .7, colors.rest, .55, [3, 3]);
      face([[l, -d, 0], [l, d, 0], [l, d, bh], [l, -d, bh]], seed + 1);
      face([[r, -d, 0], [r, d, 0], [r, d, bh], [r, -d, bh]], seed + 10);
      face([[l, d, 0], [r, d, 0], [r, d, bh], [l, d, bh]], seed + 20);
      face([[l, -d, bh], [r, -d, bh], [r, d, bh], [l, d, bh]], seed + 30);
    }
    function text(s, x, y, z, size, color, alpha = 1, align = 'center') {
      if (alpha <= .01) return;
      const [px, py] = at(x, y, z);
      ctx.font = `500 ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.globalAlpha = alpha;
      ctx.fillText(s, px, py); ctx.globalAlpha = 1;
    }
    // A drawing's dimension line, with ticks at each end and its measure above.
    function dimension(a, b, y, seed, alpha) {
      const drawn = a + (b - a) * alpha;
      seg([a, y, 0], [drawn, y, 0], seed, .8, colors.rest, alpha);
      seg([a, y - .08, 0], [a, y + .08, 0], seed + 1, .9, colors.line, alpha);
      seg([b, y - .08, 0], [b, y + .08, 0], seed + 2, .9, colors.line, alpha * (alpha > .98 ? 1 : 0));
    }

    // The server stripped down to its lines: an outline and its units.
    function rack({ x, w: bw, d, h: bh, units }, seed) {
      const l = x - bw, r = x + bw;
      face([[r, -d, 0], [r, d, 0], [r, d, bh], [r, -d, bh]], seed + 10);
      face([[l, d, 0], [r, d, 0], [r, d, bh], [l, d, bh]], seed + 20);
      face([[l, -d, bh], [r, -d, bh], [r, d, bh], [l, d, bh]], seed + 30);
      for (let i = 1; i < units; i++) { const z = bh * i / units; seg([l, d, z], [r, d, z], seed + 40 + i, .8, colors.line, .8); seg([r, d, z], [r, -d, z], seed + 50 + i, .7, colors.line, .55); }
    }
    // mto's cube, sketched: its edges run a little past each corner, and the top is hatched.
    function cube({ x, w: bw, d, h: bh }, seed) {
      block({ x, w: bw, d, h: bh }, seed);
      const l = x - bw, r = x + bw, over = .06;
      for (const [a, b] of [[[l, d, bh], [r, d, bh]], [[l, d, 0], [r, d, 0]], [[l, -d, bh], [r, -d, bh]]]) seg([a[0] - over, a[1], a[2]], [b[0] + over, b[1], b[2]], seed + 80 + a[1] + a[2], .6, colors.line, .55);
      for (const [a, z0, z1] of [[l, -over, bh + over], [r, -over, bh + over]]) seg([a, d, z0], [a, d, z1], seed + 90 + a, .6, colors.line, .55);
      for (let i = 1; i < 7; i++) { const u = i / 7; seg([l + u * bw * 2, -d, bh], [l + u * bw * 2, d, bh], seed + 20 + i, .5, colors.rest, .45); }
    }
    // A mark drawn flat to the page, by the same pen.
    function mark(name, x, y, size, alpha, seed) {
      if (alpha <= .01) return;
      const k = size / 24;
      MARKS[name].forEach((stroke, i) => pen(stroke.map(([gx, gy]) => [x + (gx - 12) * k, y + (gy - 12) * k]), seed + i * 13, 1.1, colors.ink, alpha));
    }

    function draw(clock) {
      const t = clock % CYCLE; // The tokens' own run.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const size = Math.max(9, Math.min(12, scale * .165)), wide = w >= 300;
      const gone = 1 - ease(span(t, 12.1, 12.8));

      // The wire.
      for (const s of [-1, 1]) {
        seg([LANE, s * RAIL, 0], [GATE, s * RAIL, 0], 200 + s, .7, colors.rest, .75);
        seg([OUT, s * RAIL, 0], [END, s * RAIL, 0], 210 + s, .7, colors.rest, .75);
      }
      // The two measures: drawn once there's something to measure, and to scale.
      const inMeasure = ease(span(t, .7, 2)) * gone, outMeasure = ease(span(t, rows[12].thru + .4, rows[12].thru + 1.5)) * gone;
      dimension(LANE, GATE, RAIL + .42, 300, inMeasure);
      dimension(END - (GATE - LANE) * RATIO, END, RAIL + .42, 310, outMeasure);

      // Rows of the response. Noise is dashed, and what's kept is solid.
      const flecks = [];
      for (const row of rows) {
        const noise = row.k < 0;
        if (t < row.out) continue;
        if (t < row.gate) {
          const x = LANE + (t - row.out) * SPEED;
          seg([x, -RAIL + .05, 0], [x, RAIL - .05, 0], row.i * 3, noise ? .8 : 1.5, noise ? colors.ink2 : colors.ink, gone * (noise ? .6 : 1), noise ? [2, 2.5] : undefined);
        } else if (noise) {
          flecks.push(row);
        } else if (t >= row.thru) {
          const x = Math.min(row.stop, OUT + (t - row.thru) * .75);
          seg([x, -RAIL + .05, 0], [x, RAIL - .05, 0], row.i * 3, 1.5, colors.ink, gone);
        }
      }

      rack(SERVER, 400); cube(MTO, 600);

      // Under the server, its name turning: only the one in the slot is sharp.
      const serverAt = at(SERVER.x, SERVER.d + .2, 0), serverTurn = (clock / PERIOD) * SERVERS.length, serverIndex = Math.floor(serverTurn) % SERVERS.length, serverSlide = ease(span(serverTurn % 1, .9, 1));
      ctx.font = `500 ${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = colors.ink;
      for (const q of [0, 1]) {
        ctx.globalAlpha = q ? serverSlide : 1 - serverSlide;
        ctx.fillText(SERVERS[(serverIndex + q) % SERVERS.length], serverAt[0], serverAt[1] + (q - serverSlide) * size * 1.5);
      }
      ctx.globalAlpha = 1;

      // The agent: just its mark, turning to the next, with the ones either side fading away.
      const [agentX, agentY] = at(AGENT.x, 0, .42), markSize = Math.max(30, Math.min(58, scale * .78)), agentTurn = (clock / PERIOD) * AGENTS.length, agentIndex = Math.floor(agentTurn) % AGENTS.length, agentSlide = ease(span(agentTurn % 1, .78, 1));
      for (let q = -1; q <= 2; q++) {
        const off = q - agentSlide, near = Math.max(0, 1 - Math.abs(off));
        mark(AGENTS[(agentIndex + q + AGENTS.length) % AGENTS.length], agentX, agentY + off * markSize * 1.3, markSize * (.72 + .28 * near), (.08 + .92 * near * near) * clamp(1.5 - Math.abs(off)), 500 + q * 40);
      }

      // Noise drops out of the front of mto.
      for (const row of flecks) {
        const f = span(t, row.gate, row.gate + 1.1), e = ease(f);
        if (f >= 1) continue;
        const x = MTO.x + (hash(row.i) - .5) * MTO.w * 1.5, y = MTO.d + .05 + hash(row.i + 9) * .1, z = .4 - e * 1, half = .13 * (1 - e * .6);
        seg([x - half, y, z], [x + half, y, z + (hash(row.i + 4) - .5) * .12], row.i + 700, 1.1, colors.accent, (1 - e) * .95, [2, 2]);
      }

      text('MCP SERVER', SERVER.x, -SERVER.d, SERVER.h + .16, size, colors.ink2);
      text('YOUR AGENT', AGENT.x, 0, 1.32, size, colors.ink2);
      text('MTO', MTO.x, -MTO.d, MTO.h + .16, Math.min(size + 1, 12), colors.ink);

      // Each measure sits under its line, clear of the blocks.
      text('37,355 TOK', (LANE + GATE) / 2, RAIL + .68, 0, size, colors.ink2, inMeasure);
      text('13,244 TOK', END - .05, RAIL + .68, 0, size, colors.ink, outMeasure, 'right');

      // The result. It's the loop's one lasting touch of amber.
      const result = ease(span(t, rows[12].thru + 1.2, rows[12].thru + 2.2)) * gone;
      text('64.5% FEWER', MTO.x, -MTO.d, MTO.h + .46, Math.min(size + 2, 14), colors.accent, result);
      if (wide) text('GITHUB ISSUE LIST, 40 ISSUES', 0, MTO.d + .82, 0, Math.max(9, size - 1), colors.ink2, ease(span(t, .4, 1.2)) * gone * .8);
    }

    function frame(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      const k = 1 - Math.exp(-dt * 3.2);
      yawS += (yawT - yawS) * k; tiltS += (tiltT - tiltS) * k;
      if (!reduced && (plays === 'always' || hovered)) time = (time + dt) % PERIOD;
      draw(reduced ? HOLD : time);
      if (!reduced || Math.abs(yawT - yawS) + Math.abs(tiltT - tiltS) > .001) raf = requestAnimationFrame(frame);
    }
    const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    const host = opts.pointerHost || canvas;
    host.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') { hovered = true; wake(); } });
    host.addEventListener('pointerleave', () => { hovered = false; yawT = 0; tiltT = 0; wake(); });
    host.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = host.getBoundingClientRect();
      yawT = ((e.clientX - r.left) / r.width - .5) * .1; tiltT = ((e.clientY - r.top) / r.height - .5) * -.07; wake();
    });
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(canvas);
    new ResizeObserver(() => { resize(); draw(reduced ? HOLD : time); }).observe(canvas);
    new MutationObserver(() => { readColors(); draw(reduced ? HOLD : time); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });
    document.addEventListener('visibilitychange', wake);
    if (document.fonts) document.fonts.ready.then(() => draw(reduced ? HOLD : time));

    readColors(); resize(); draw(reduced ? HOLD : time); wake();
    return {
      set(key, value) { if (key === 'plays') { plays = value; if (value === 'hover') time = HOLD; wake(); } },
      seek(t) { time = t % PERIOD; draw(time); },
    };
  }
  return { mount, PERIOD, HOLD };
})();
