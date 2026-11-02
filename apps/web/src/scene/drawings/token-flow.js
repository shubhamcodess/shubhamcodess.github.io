/* The mcp-token-optimizer drawing: a tool response leaves the MCP server, passes through mto, loses its noise, and reaches the agent shorter.
   The two dimension lines are to scale: 37,355 and 13,244 tokens, from the GitHub issue list benchmark.
   One pure timeline drives everything: draw(t) gives the same picture for the same t. */
export const TokenFlow = (() => {
  const PERIOD = 13, HOLD = 9;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (v) => { v = clamp(v); return v * v * v * (v * (v * 6 - 15) + 10); };
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // Three blocks on one wire. Everything is measured from these.
  const SERVER = { x: -2.2, w: .46, d: .42, h: .56 }, MTO = { x: 0, w: .34, d: .5, h: .82 }, AGENT = { x: 2.2, w: .46, d: .42, h: .56 };
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
      ctx.fillStyle = colors.paper; ctx.fill();
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

    function draw(t) {
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

      block(SERVER, 400); block(AGENT, 500); block(MTO, 600);
      // Hatching on the top of mto, the one block that does anything.
      const top = MTO.h;
      for (let i = 1; i < 7; i++) { const u = i / 7; seg([MTO.x - MTO.w + u * MTO.w * 2, -MTO.d, top], [MTO.x - MTO.w + u * MTO.w * 2, MTO.d, top], 620 + i, .5, colors.rest, .45); }

      // Noise drops out of the front of mto.
      for (const row of flecks) {
        const f = span(t, row.gate, row.gate + 1.1), e = ease(f);
        if (f >= 1) continue;
        const x = MTO.x + (hash(row.i) - .5) * MTO.w * 1.5, y = MTO.d + .05 + hash(row.i + 9) * .1, z = .4 - e * 1, half = .13 * (1 - e * .6);
        seg([x - half, y, z], [x + half, y, z + (hash(row.i + 4) - .5) * .12], row.i + 700, 1.1, colors.accent, (1 - e) * .95, [2, 2]);
      }

      text('MCP SERVER', SERVER.x, -SERVER.d, SERVER.h + .16, size, colors.ink2);
      text('YOUR AGENT', AGENT.x, -AGENT.d, AGENT.h + .16, size, colors.ink2);
      text('MTO', MTO.x, -MTO.d, MTO.h + .16, Math.min(size + 1, 12), colors.ink);

      // Each measure sits under its line, clear of the blocks.
      text('37,355 TOK', (LANE + GATE) / 2, RAIL + .6, 0, size, colors.ink2, inMeasure);
      text('13,244 TOK', END, RAIL + .6, 0, size, colors.ink, outMeasure, 'right');

      // The result. It's the loop's one lasting touch of amber.
      const result = ease(span(t, rows[12].thru + 1.2, rows[12].thru + 2.2)) * gone;
      text('64.5% FEWER', MTO.x, -MTO.d, MTO.h + .46, Math.min(size + 2, 14), colors.accent, result);
      if (wide) text('GITHUB ISSUE LIST, 40 ISSUES', 0, MTO.d + .62, 0, Math.max(9, size - 1), colors.ink2, ease(span(t, .4, 1.2)) * gone * .8);
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
