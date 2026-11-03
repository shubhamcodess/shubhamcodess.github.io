/* The mcp-token-optimizer drawing: tokens pour out of a server as small cards, through a portal into one mto window. The JSON in it is only pen lines; some get struck and drop away, and fewer cards go on to the agent.
   The only numbers are the measure: 37,355 to 13,244 tokens, 64.5% fewer, from the GitHub issue list benchmark. The dimension lines are to scale.
   One pure timeline drives everything: draw(t) gives the same picture for the same t. Colors come from the theme, and surfaces let the page show through. */
export const MtoWindow = (() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
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


  const PERIOD = 28, HOLD = 9.5, SHEET = 14; // The window runs twice a loop, and seven agents take four seconds each.
  const AGENT_TURN = PERIOD / AGENTS.length;
  const SERVER = { x: -2.42, w: .4, d: .34, h: 1.02 }, MTO = { x: 0, w: .98, d: .24, h: 1.5 }, AGENT = { x: 2.42, w: .44, d: .34, h: .92 };
  const WIRE_Z = .5, IN_CARDS = 9, OUT_CARDS = 3, FLOW = 14; // The stream makes this many trips a loop, so it closes on itself. Three cards leave for every nine that arrive: about the real share.
  const RATIO = 13244 / 37355;

  /* A document's shape: indent, key length, value length, and whether it's struck. No words. */
  const ROWS = [[0, .05, 0], [1, .16, .4], [1, .24, .44, 1], [1, .14, .5, 1], [1, .12, .22], [1, .2, .46, 1], [1, .15, .38], [1, .22, .32, 1], [1, .1, .24, 1], [0, .05, 0]];
  const CUT = ROWS.map((r, i) => (r[3] ? i : -1)).filter((i) => i >= 0);
  const BEAT = { strike: 2.6, settled: 8.2, fade: 12.8 };
  const strikeAt = (i) => BEAT.strike + (CUT.indexOf(i) / CUT.length) * (BEAT.settled - BEAT.strike - 1.1);

  function mount(canvas, opts = {}) {
    const ctx = canvas.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, scale = 1, cx = 0, cy = 0, colors = {}, font = 'monospace';
    let time = opts.startAt ?? 0, last = 0, raf = 0, visible = true, plays = opts.plays ?? 'always', hovered = false;
    let yawT = 0, tiltT = 0, yawS = 0, tiltS = 0;

    function readColors() {
      const s = getComputedStyle(canvas), v = (n) => s.getPropertyValue(n).trim();
      colors = { line: v('--line'), rest: v('--line-rest'), ink: v('--ink'), ink2: v('--ink-2'), accent: v('--accent') };
      font = v('--font-note') || 'ui-monospace, monospace';
    }
    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      scale = Math.min(w / 6.5, h / 3); cx = w / 2; cy = h * .68;
    }
    // The same camera as the old drawing: nearly head on, with a slight turn and a little perspective.
    function at(x, y, z = 0) {
      const yaw = -.08 + yawS, tilt = .8 + tiltS;
      const c = Math.cos(yaw), s = Math.sin(yaw), x1 = x * c - y * s, y1 = x * s + y * c;
      const ct = Math.cos(tilt), st = Math.sin(tilt), y2 = y1 * ct - z * st, k = 9.5 / (9.5 - (y1 * st + z * ct));
      return [cx + x1 * k * scale, cy + y2 * k * scale];
    }
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
    function seg(a, b, seed, width, color, alpha, dash) {
      const pts = [];
      for (let i = 0; i <= 5; i++) pts.push(at(a[0] + (b[0] - a[0]) * i / 5, a[1] + (b[1] - a[1]) * i / 5, (a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * i / 5));
      pen(pts, seed, width, color, alpha, dash);
    }
    function face(corners, seed, tint = .07) {
      const p = corners.map((c) => at(...c));
      ctx.beginPath(); p.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.closePath();
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = tint; ctx.fillStyle = colors.ink; ctx.fill(); ctx.globalAlpha = 1;
      corners.forEach((c, i) => {
        const n = corners[(i + 1) % corners.length];
        seg(c, n, seed + i, 1.1, colors.line, 1);
        seg(c, n, seed + i + 40, .55, colors.line, .35);
      });
    }
    function block({ x, w: bw, d, h: bh }, seed) {
      const l = x - bw, r = x + bw;
      for (const [a, b] of [[[l, -d], [r, -d]], [[r, -d], [r, d]], [[r, d], [l, d]], [[l, d], [l, -d]]]) seg([a[0] + .09, a[1] + .07], [b[0] + .09, b[1] + .07], seed + 70 + a[0], .7, colors.rest, .55, [3, 3]);
      face([[l, -d, 0], [l, d, 0], [l, d, bh], [l, -d, bh]], seed + 1, .09);
      face([[r, -d, 0], [r, d, 0], [r, d, bh], [r, -d, bh]], seed + 10, .09);
      face([[l, d, 0], [r, d, 0], [r, d, bh], [l, d, bh]], seed + 20, .05);
      face([[l, -d, bh], [r, -d, bh], [r, d, bh], [l, d, bh]], seed + 30, .03);
    }
    function text(s, x, y, z, size, color, alpha = 1, align = 'center') {
      if (alpha <= .01) return;
      const [px, py] = at(x, y, z);
      ctx.font = `500 ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.globalAlpha = alpha;
      ctx.fillText(s, px, py); ctx.globalAlpha = 1;
    }
    function dimension(a, b, y, seed, alpha) {
      seg([a, y, 0], [a + (b - a) * alpha, y, 0], seed, .8, colors.rest, alpha);
      seg([a, y - .08, 0], [a, y + .08, 0], seed + 1, .9, colors.line, alpha);
      seg([b, y - .08, 0], [b, y + .08, 0], seed + 2, .9, colors.line, alpha >= .98 ? 1 : 0);
    }
    // A token: a small card, the same as the requirement sheets in the story. It turns level as it arrives.
    function card(x, y, turn, width, color, alpha) {
      if (alpha <= .01) return;
      const hw = width / 2, hh = width / 3;
      ctx.save(); ctx.translate(x, y); ctx.rotate(turn);
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.globalAlpha = alpha; ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
      ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
      ctx.restore(); ctx.globalAlpha = 1;
    }
    function portal(x, y, z, rx, rz, alpha) {
      const [px, py] = at(x, y, z), k = scale;
      ctx.strokeStyle = colors.accent; ctx.globalAlpha = alpha; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(px, py, rx * k, rz * k, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    }

    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const size = Math.max(9, Math.min(12, scale * .165)), cardW = clamp(scale * .17, 7.5, 14), flow = (t / PERIOD) * FLOW;
      const sheet = t % SHEET, gone = 1 - ease(span(sheet, BEAT.fade, SHEET - .1));
      const fromX = SERVER.x + SERVER.w, gate = MTO.x - MTO.w, out = MTO.x + MTO.w, endX = AGENT.x - AGENT.w;

      // The measures underneath: both to scale.
      const under = MTO.d + .36;
      dimension(fromX, gate, under, 300, 1);
      dimension(endX - (gate - fromX) * RATIO, endX, under, 310, ease(span(sheet, BEAT.settled - 1, BEAT.settled)) * gone);

      block(SERVER, 400); block(AGENT, 500); block(MTO, 600);

      // The server's front: three units, each with a light and a vent.
      {
        const { x, w: bw, d, h: bh } = SERVER, U = 3, l = x - bw, r = x + bw;
        for (let i = 1; i < U; i++) seg([l, d, bh * i / U], [r, d, bh * i / U], 410 + i, .8, colors.line, .75);
        for (let i = 0; i < U; i++) {
          const z = bh * (i + .5) / U, [lx, ly] = at(l + .12, d, z), on = Math.sin(t * 2.6 + i * 2.1) > .05;
          ctx.globalAlpha = on ? .95 : .3; ctx.fillStyle = on ? colors.accent : colors.line; ctx.fillRect(lx - 2, ly - 2, 4, 4); ctx.globalAlpha = 1;
          for (let q = 0; q < 3; q++) seg([l + .34 + q * .13, d, z - .09], [l + .34 + q * .13, d, z + .09], 420 + i * 3 + q, .7, colors.rest, .7);
        }
      }

      // The window: a bar across the top, then the document as pen lines. Struck lines drop out of the bottom as cards.
      {
        const { x, w: bw, d, h: bh } = MTO, l = x - bw, r = x + bw, m = .14, barZ = bh - .17;
        seg([l, d, barZ], [r, d, barZ], 630, .9, colors.line, .85);
        for (let q = 0; q < 3; q++) { const [dx, dy] = at(l + .1 + q * .075, d, barZ + .085); ctx.globalAlpha = .7; ctx.strokeStyle = colors.line; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(dx, dy, Math.max(1.4, scale * .018), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
        const left = l + m, wide = bw * 2 - m * 2, zTop = barZ - .1, lh = (zTop - .1) / (ROWS.length - 1);
        ROWS.forEach(([ind, key, val, cut], i) => {
          const shown = span(sheet, i * .16, i * .16 + .4);
          if (shown <= 0) return;
          const when = cut ? strikeAt(i) : 0, strike = cut ? span(sheet, when, when + .35) : 0, done = cut ? ease(span(sheet, when + .35, when + .85)) : 0;
          let row = i;
          for (const j of CUT) if (j < i) row -= ease(span(sheet, strikeAt(j) + .4, strikeAt(j) + 1));
          const z = zTop - row * lh, xs = left + ind * .13, keyEnd = xs + wide * key * shown, valStart = keyEnd + .07, valEnd = valStart + wide * val * shown, alpha = gone * (1 - done);
          if (done < 1) {
            const color = strike > 0 ? colors.accent : colors.ink;
            seg([xs, d, z], [keyEnd, d, z], 640 + i, 1.5, color, alpha);
            if (val && shown > .5) seg([valStart, d, z], [valEnd, d, z], 660 + i, 1, strike > 0 ? colors.accent : colors.ink2, alpha * .75);
            if (strike > 0 && strike < 1) seg([xs - .03, d, z], [xs - .03 + (valEnd - xs + .06) * strike, d, z], 680 + i, 1, colors.accent, alpha);
          }
          // Once struck, it falls away as a small amber card.
          const fall = cut ? span(sheet, when + .35, when + 1.25) : 0;
          if (fall > 0 && fall < 1 && gone > 0) {
            const e = fall * fall, [fx, fy] = at(xs + (valEnd - xs) * .5 + (hash(i) - .5) * .2, d + .12 + e * .35, z * (1 - e) - e * .15);
            card(fx, fy, (hash(i + 3) - .5) * 1.2 * e, cardW * .85, colors.accent, (1 - e) * gone);
          }
        });
      }

      // The agent's front: one mark, turning to the next as the others fade past.
      {
        const { x, d, h: bh } = AGENT, zc = bh * .5, k = (bh * .6) / 24, turn = t / AGENT_TURN, index = Math.floor(turn) % AGENTS.length, slide = ease(span(turn % 1, .8, 1));
        const corners = [[x - AGENT.w, d, 0], [x + AGENT.w, d, 0], [x + AGENT.w, d, bh], [x - AGENT.w, d, bh]].map((c) => at(...c));
        ctx.save(); ctx.beginPath(); corners.forEach(([px, py], i) => ctx[i ? 'lineTo' : 'moveTo'](px, py)); ctx.closePath(); ctx.clip();
        for (let q = -1; q <= 2; q++) {
          const name = AGENTS[(index + q + AGENTS.length) % AGENTS.length], off = q - slide, near = Math.max(0, 1 - Math.abs(off)), alpha = (.1 + .9 * near * near) * clamp(1.5 - Math.abs(off));
          if (alpha <= .01) continue;
          MARKS[name].forEach((stroke, s) => pen(stroke.map(([gx, gy]) => at(x + (gx - 12) * k, d, zc - (gy - 12) * k - off * bh * .72)), 700 + s * 13 + q, 1, colors.ink, alpha));
        }
        ctx.restore();
      }

      // The stream, drawn last so it passes in front. Cards pour off the server and turn level into the portal; fewer leave the far side.
      const [ax, ay] = at(fromX + .02, SERVER.d * .2, WIRE_Z), [bx, by] = at(gate - .02, MTO.d * .2, WIRE_Z), [cx2, cy2] = at(out + .02, MTO.d * .2, WIRE_Z), [ex, ey] = at(endX - .02, AGENT.d * .2, WIRE_Z);
      portal(gate - .02, MTO.d * .2, WIRE_Z, .05, .16, .9);
      for (let i = 0; i < IN_CARDS; i++) {
        const u = (flow + i / IN_CARDS) % 1, e = ease(u * .5 + u * u * .5), lift = (hash(i * 3.1) - .5) * .22 * (1 - e) * scale;
        card(ax + (bx - ax) * e, ay + (by - ay) * e + lift, (hash(i) - .5) * .9 * (1 - e) - .28 * (1 - e), cardW, colors.ink, Math.min(1, u * 9, (1 - u) * 14) * .95);
      }
      portal(out + .02, MTO.d * .2, WIRE_Z, .05, .16, .9);
      for (let i = 0; i < OUT_CARDS; i++) {
        const u = (flow + i / OUT_CARDS) % 1, e = ease(u * .5 + u * u * .5);
        card(cx2 + (ex - cx2) * e, cy2 + (ey - cy2) * e, .24 * (hash(i + 8) - .5) * Math.sin(u * Math.PI), cardW, colors.ink, Math.min(1, u * 14, (1 - u) * 9) * .95);
      }

      text('MCP SERVER', SERVER.x, -SERVER.d, SERVER.h + .16, size, colors.ink2);
      text('YOUR AGENT', AGENT.x, -AGENT.d, AGENT.h + .16, size, colors.ink2);
      text('MTO', MTO.x, -MTO.d, MTO.h + .16, Math.min(size + 1, 12), colors.ink);
      text('37,355 TOK', (fromX + gate) / 2, under + .24, 0, size, colors.ink2);
      text('13,244 TOK', endX, under + .24, 0, size, colors.ink, ease(span(sheet, BEAT.settled - .6, BEAT.settled + .3)) * gone, 'right');
      text('64.5% FEWER', MTO.x, under + .24, 0, Math.min(size + 1, 13), colors.accent, ease(span(sheet, BEAT.settled, BEAT.settled + .8)) * gone);
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
