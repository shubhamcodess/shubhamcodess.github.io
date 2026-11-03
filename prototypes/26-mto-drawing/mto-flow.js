/* The mcp-token-optimizer drawing: a real tool response leaves an MCP server, mto strikes its noise, keeps the originals on disk, sends a shorter TOON result on, and the agent gets it.
   Every line, name and number is real: `npm run demo` in the mto repo and its measured results. The agents are the ones the project's site lists.
   One pure timeline drives everything: draw(t) gives the same picture for the same t. Colors come from the theme, and faces let the page show through. */
export const MtoFlow = (() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (v) => { v = clamp(v); return v * v * v * (v * (v * 6 - 15) + 10); };
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const arc = (cx, cy, rx, ry = rx, from = 0, to = 360) => { const n = Math.max(6, Math.round(Math.abs(to - from) / 24)); return Array.from({ length: n + 1 }, (_, i) => { const a = ((from + ((to - from) * i) / n) * Math.PI) / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }); };
  const ring = (cx, cy, r, sides, start = -90) => Array.from({ length: sides + 1 }, (_, i) => { const a = ((start + (360 * i) / sides) * Math.PI) / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const spokes = (cx, cy, a, b, n, start = -90) => Array.from({ length: n }, (_, i) => { const t = ((start + (360 * i) / n) * Math.PI) / 180; return [[cx + Math.cos(t) * a, cy + Math.sin(t) * a], [cx + Math.cos(t) * b, cy + Math.sin(t) * b]]; });

  /* Hand-sketched references to each mark, in a 24px square, drawn by the same pen as everything else. */
  const MARKS = {
    github: [[[16, 22], [16, 18], [15.1, 15.5], [18.5, 14.8], [21.3, 12], [21.5, 8.5], [20, 4.8], [19.9, 1.4], [16, 2.6], [12.5, 2.1], [9, 2.6], [5.1, 1.4], [5, 4.8], [3.5, 8.5], [3.7, 12], [6.5, 14.8], [9.9, 15.5], [9, 18], [9, 22]], [[9, 19], [5.5, 19.8], [3.8, 17.5], [2, 16]]],
    kubernetes: [ring(12, 12, 10.6, 7), arc(12, 12, 3), ...spokes(12, 12, 3, 7.6, 7)],
    claudeCode: [[[3, 4.5], [21, 4.5], [21, 10.5], [23.6, 10.5], [23.6, 13.5], [21, 13.5], [21, 16.5], [19.5, 16.5], [19.5, 19.5], [18, 19.5], [18, 16.5], [16.5, 16.5], [16.5, 19.5], [15, 19.5], [15, 16.5], [9, 16.5], [9, 19.5], [7.5, 19.5], [7.5, 16.5], [6, 16.5], [6, 19.5], [4.5, 19.5], [4.5, 16.5], [3, 16.5], [3, 13.5], [.4, 13.5], [.4, 10.5], [3, 10.5], [3, 4.5]], [[6, 7.5], [7.5, 7.5], [7.5, 10.5], [6, 10.5], [6, 7.5]], [[16.5, 7.5], [18, 7.5], [18, 10.5], [16.5, 10.5], [16.5, 7.5]]],
    claudeDesktop: spokes(12, 12, 1.6, 10.8, 12, -82).map(([a, b], i) => [a, [12 + (b[0] - 12) * (i % 2 ? .78 : 1), 12 + (b[1] - 12) * (i % 2 ? .78 : 1)]]),
    copilot: [arc(8, 8.2, 4.2, 3.8), arc(16, 8.2, 4.2, 3.8), [[12, 8], [12, 11]], [[3.8, 9.2], [2.2, 12], [2, 16.2], [6, 19.6], [12, 21], [18, 19.6], [22, 16.2], [21.8, 12], [20.2, 9.2]], [[9, 14], [9, 17]], [[15, 14], [15, 17]]],
    cursor: [ring(12, 12, 11, 6), [[12, 12], [12, 23]], [[12, 12], [2.5, 6.5]], [[12, 12], [21.5, 6.5]]],
    windsurf: [[[.8, 6.4], [3.4, 6.4], [4.4, 8.4], [4.4, 14.6], [6.6, 17.4], [9, 14.6], [9, 9.4], [11.4, 6.8], [13.8, 9.4], [13.8, 14.6], [16.2, 17.4], [18.6, 14.6], [18.6, 8.6], [20.6, 6.4], [23.2, 6.4]]],
    gemini: [[[12, .8], [13, 7], [17, 11], [23.2, 12], [17, 13], [13, 17], [12, 23.2], [11, 17], [7, 13], [.8, 12], [7, 11], [11, 7], [12, .8]]],
    cline: [arc(12, 3.2, 2.2), [[12, 5.4], [12, 7.4]], [[6, 7.4], [18, 7.4], [20.6, 10], [20.6, 19], [18, 21.8], [6, 21.8], [3.4, 19], [3.4, 10], [6, 7.4]], [[8.8, 12], [8.8, 16.4]], [[15.2, 12], [15.2, 16.4]], [[3.4, 13], [1, 13], [1, 17], [3.4, 17]], [[20.6, 13], [23, 13], [23, 17], [20.6, 17]]],
  };
  const AGENTS = [['Claude Code', 'claudeCode'], ['Claude Desktop', 'claudeDesktop'], ['GitHub Copilot', 'copilot'], ['Cursor', 'cursor'], ['Windsurf', 'windsurf'], ['Gemini CLI', 'gemini'], ['Cline', 'cline'], ['Roo Code', null]];
  const AGENT_TURN = 3.5; // Seconds per agent. Eight of them make one loop, so the reel closes on itself.

  /* The two calls, word for word from the repo's demo. `cut` lines are what mto removes. */
  const CASES = [
    {
      length: 15, mark: 'github', server: 'github', tool: 'list_issues', in: '37,355', out: '13,244', ratio: 13244 / 37355, saved: '64.5% FEWER',
      lines: [['"url": ".../issues/1000",'], ['"labels_url": ".../labels",', 1], ['"events_url": ".../events",', 1], ['"node_id": "I_kwDOAbCdEf0xYz",', 1], ['"number": 1000,'], ['"title": "Widget 0 fails when…",'], ['"avatar_url": ".../u/100?v=4",', 1], ['"gravatar_id": "",', 1], ['"state": "closed",']],
      sent: ['[40]:', '  - url: ".../issues/1000"', '    number: 1000', '    title: Widget 0 fails when…', '    state: closed', '  …'],
      note: 'pruned events_url×80, node_id×80, labels_url×40, avatar_url×40, …',
    },
    {
      length: 13, mark: 'kubernetes', server: 'kubernetes', tool: 'describe_configmap', in: '3,637', out: '1,935', ratio: 1935 / 3637, saved: '46.8% FEWER',
      lines: [['"resourceType": "configmaps",'], ['"name": "demo-config",'], ['"describeText": "Name: demo…'], ['cache.region0.maximum-size=1000', 1], ['cache.region1.maximum-size=1050', 1], ['cache.region2.maximum-size=1100', 1], ['… 57 more lines, repeated below', 1], ['"manifest": { "kind": "ConfigMap",'], ['  "app.properties": "cache.reg…']],
      sent: ['resourceType: configmaps', 'name: demo-config', 'describeText: "Name: demo…', '  [… 60 lines identical to', '   $.manifest.data[…]', '   omitted …]', 'manifest:', '  kind: ConfigMap'],
      note: '60 lines identical to the manifest, kept as one pointer',
    },
  ];
  const PERIOD = CASES.reduce((sum, c) => sum + c.length, 0);
  const HOLD = 12.2; // The GitHub call, finished: the noise gone, the result sent, the saving shown.
  /* The beats of one call, in seconds. Each runs in order. */
  const BEAT = { leave: .3, write: 1, strike: 3, send: 6.2, reach: 8.3, result: 9 };

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
    // A pen line: the same small wander every frame, so it reads as drawn but doesn't crawl.
    function pen(pts, seed, width, color, alpha = 1, dash) {
      if (alpha <= .01) return;
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const q = i === 0 || i === pts.length - 1 ? 0 : (hash(seed + i * 1.7) - .5) * .7;
        ctx[i ? 'lineTo' : 'moveTo'](x - ((b[1] - a[1]) / l) * q, y + ((b[0] - a[0]) / l) * q);
      });
      ctx.setLineDash(dash || []); ctx.lineWidth = width; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    function seg(a, b, seed, width, color, alpha, dash) {
      const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 22));
      pen(Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]), seed, width, color, alpha, dash);
    }
    // A surface: hides what's behind it in the drawing, lets the page show through, and takes a faint tint. So it matches any theme.
    function face(pts, seed, tint = .07, outline = true) {
      ctx.beginPath(); pts.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.closePath();
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = tint; ctx.fillStyle = colors.ink; ctx.fill(); ctx.globalAlpha = 1;
      if (outline) pts.forEach((p, i) => { const n = pts[(i + 1) % pts.length]; seg(p, n, seed + i, 1, colors.ink, .78); seg(p, n, seed + i + 40, .5, colors.line, .3); });
    }
    function label(s, x, y, size, color, alpha = 1, align = 'center', weight = 500) {
      if (alpha <= .01) return;
      ctx.font = `${weight} ${size}px ${mono}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.globalAlpha = alpha;
      ctx.fillText(s, x, y); ctx.globalAlpha = 1;
    }
    // A mark, redrawn by the pen as `drawn` goes 0 to 1.
    function mark(name, cx, cy, size, drawn, alpha, seed, color = colors.ink) {
      if (!name || alpha <= .01) return;
      const k = size / 24, plan = MARKS[name], total = plan.length;
      plan.forEach((stroke, i) => {
        const f = clamp(drawn * total - i);
        if (f <= 0) return;
        const end = Math.max(1, f * (stroke.length - 1)), whole = Math.floor(end), pts = stroke.slice(0, whole + 1).map(([x, y]) => [cx + (x - 12) * k, cy + (y - 12) * k]);
        if (whole < stroke.length - 1) { const a = stroke[whole], b = stroke[whole + 1], u = end - whole; pts.push([cx + (a[0] + (b[0] - a[0]) * u - 12) * k, cy + (a[1] + (b[1] - a[1]) * u - 12) * k]); }
        pen(pts, seed + i * 7, 1.05, color, alpha);
      });
    }
    // The server: a small rack drawn in the same projection as the rest of the site's figures, with lights that blink when it answers.
    function rack(cx, cy, s, sending, seed, t) {
      const C = Math.cos(Math.PI / 6), S = .5, a = .34 * s, d = .78 * s, H = 1.34 * s;
      const O = [cx + (d - a) * C / 2, cy + H / 2 + (a + d) * S / 2], u = [a * C, -a * S], v = [-d * C, -d * S];
      const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k], up = (p, k = 1) => [p[0], p[1] - H * k];
      for (const [p, q] of [[O, add(O, u)], [O, add(O, v)]]) seg([p[0] + 7, p[1] + 4], [q[0] + 7, q[1] + 4], seed + 60 + q[0], .6, colors.rest, .55, [3, 3]);
      face([add(O, v), O, up(O), up(add(O, v))], seed, .07);
      face([O, add(O, u), up(add(O, u)), up(O)], seed + 10, .1);
      face([up(O), up(add(O, u)), up(add(add(O, u), v)), up(add(O, v))], seed + 20, .05);
      const U = 4;
      for (let i = 0; i < U; i++) {
        const k0 = (i + .12) / U, k1 = (i + .88) / U, L = (m, q) => up(add(O, v, m), q);
        seg(L(.08, k1), L(.92, k1), seed + 30 + i, .7, colors.line, .6); seg(L(.08, k0), L(.92, k0), seed + 34 + i, .7, colors.line, .6);
        seg(L(.08, k0), L(.08, k1), seed + 38 + i, .7, colors.line, .6); seg(L(.92, k0), L(.92, k1), seed + 42 + i, .7, colors.line, .6);
        for (let q = 0; q < 3; q++) seg(L(.42 + q * .13, k0 + .22 / U), L(.42 + q * .13, k1 - .22 / U), seed + 46 + q, .6, colors.rest, .6);
        const on = sending > 0 && Math.sin(t * 9 + i * 2.1) > -.1, [lx, ly] = L(.2, (k0 + k1) / 2);
        ctx.globalAlpha = on ? .95 : .3; ctx.fillStyle = on ? colors.accent : colors.line; ctx.fillRect(lx - 1.5, ly - 1.5, 3, 3); ctx.globalAlpha = 1;
      }
      return { top: up(add(add(O, u), v))[1], bottom: O[1] };
    }

    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const full = w >= 520;
      // Which call this is, and how far into it.
      let which = 0, c = t;
      while (which < CASES.length - 1 && c >= CASES[which].length) c -= CASES[which++].length;
      const job = CASES[which], fade = ease(span(c, 0, .25)) * (1 - ease(span(c, job.length - .6, job.length - .05)));

      // Where everything sits. The window takes the middle; the stations stand either side of it.
      const size = full ? clamp(w / 72, 9.5, 11.5) : 9, drawer = full ? 34 : 24, bar = full ? 24 : 20, head = full ? size + 10 : 0;
      const rows = Math.max(job.lines.length, job.sent.length), note = full ? size + 10 : 0;
      const wanted = bar + 2 + head + rows * (size + (full ? 7.5 : 3.6)) + 8, room = h - drawer - 6 - note - (full ? 20 : 10), body = Math.min(room, wanted), top = (h - (body + 6 + drawer + note)) / 2;
      const sideW = full ? clamp(w * .17, 96, 190) : clamp(w * .17, 46, 62), x0 = sideW + (full ? 22 : 6), x1 = w - sideW - (full ? 22 : 6);
      const y0 = top, y1 = top + body, midY = (y0 + y1) / 2;
      const sx = sideW / 2 + (full ? 4 : 1), ax = w - sideW / 2 - (full ? 4 : 1);
      const dx = leanXs * 3, dy = leanYs * 2;

      const leaving = span(c, BEAT.leave, BEAT.write + .4) * fade;
      const reach = span(c, BEAT.reach - 1, BEAT.reach);
      const result = ease(span(c, BEAT.result, BEAT.result + .7)) * fade;

      // The wires. Each band is as thick as its share of the tokens, so the difference is to scale.
      const band = full ? clamp(h * .07, 16, 30) : 12, thin = band * job.ratio;
      const rs = full ? clamp(sideW * .52, 54, 88) : clamp(sideW * .62, 30, 38);
      const rackOut = sx + rs * .36;
      for (const k of [-1, 1]) {
        seg([rackOut, midY + k * band / 2], [x0, midY + k * band / 2], 200 + k, .8, colors.line, .75);
        seg([x1, midY + k * thin / 2], [ax - (full ? 30 : 16), midY + k * thin / 2], 210 + k, .8, colors.line, .75);
      }
      ctx.lineDashOffset = -t * 26;
      if (leaving > 0) { ctx.setLineDash([5, 6]); ctx.strokeStyle = colors.ink; ctx.lineWidth = Math.max(1, band * .34); ctx.globalAlpha = .28 * leaving; ctx.beginPath(); ctx.moveTo(rackOut, midY); ctx.lineTo(x0, midY); ctx.stroke(); }
      if (reach > 0 && fade > 0) { ctx.setLineDash([5, 6]); ctx.strokeStyle = colors.ink; ctx.lineWidth = Math.max(1, thin * .5); ctx.globalAlpha = .4 * fade; ctx.beginPath(); ctx.moveTo(x1, midY); ctx.lineTo(x1 + (ax - (full ? 30 : 16) - x1) * ease(reach), midY); ctx.stroke(); }
      ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.globalAlpha = 1;

      // The window: mto itself, with its shadow on the plate.
      const shade = [[x0 + 6, y0 + 5], [x1 + 6, y0 + 5], [x1 + 6, y1 + 5], [x0 + 6, y1 + 5]];
      shade.forEach((p, i) => seg(p, shade[(i + 1) % 4], 280 + i, .6, colors.rest, .5, [3, 3]));
      face([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 300, .05);
      const split = full ? (x0 + x1) / 2 : null;
      seg([x0, y0 + bar], [x1, y0 + bar], 320, .8, colors.line, .8);
      if (full) {
        label('MTO', x0 + 12, y0 + bar / 2 + .5, size + 1, colors.ink, 1, 'left', 600);
        label('127.0.0.1', x0 + 12 + (size + 1) * 2.9, y0 + bar / 2 + .5, size - .5, colors.ink2, .9, 'left');
        const chips = [['KEEP', c >= BEAT.send - .6 && c < BEAT.send + 1], ['TOON', c >= BEAT.send && c < BEAT.reach], ['PRUNE', c >= BEAT.strike && c < BEAT.send]];
        let cx = x1 - 12;
        for (const [name, on] of chips) {
          ctx.font = `500 ${size - .5}px ${mono}`; const tw = ctx.measureText(name).width;
          label(name, cx, y0 + bar / 2 + .5, size - .5, on ? colors.accent : colors.ink2, on ? 1 : .55, 'right');
          cx -= tw + 14;
        }
      } else {
        label(`${job.in} → ${job.out} TOK`, x0 + 7, y0 + bar / 2 + .5, size, colors.ink, fade, 'left');
      }

      // The panes. Side by side when there's room; on a narrow plate the second takes over from the first.
      const paneTop = y0 + bar + 2, swap = full ? 0 : ease(span(c, BEAT.send - .3, BEAT.send + .3));
      const paneA = [x0, full ? split : x1], paneB = [full ? split : x0, x1];
      if (full) seg([split, y0 + bar], [split, y1], 330, .8, colors.line, .7);
      const rowsTop = paneTop + head, lh = (y1 - rowsTop - 6) / rows;
      const pad = full ? 12 : 7;
      if (full) {
        label(job.tool, paneA[0] + pad, paneTop + head / 2, size - .5, colors.ink2, fade, 'left');
        label(`${job.in} TOK`, paneA[1] - pad, paneTop + head / 2, size - .5, colors.ink, fade * ease(leaving * 2), 'right');
        label('SENT TO MODEL', paneB[0] + pad, paneTop + head / 2, size - .5, colors.ink2, fade, 'left');
        label(`${job.out} TOK`, paneB[1] - pad, paneTop + head / 2, size - .5, colors.ink, ease(reach) * fade, 'right');
      }

      // The response, line by line, and the strikes.
      const cuts = job.lines.map((l, i) => (l[1] ? i : -1)).filter((i) => i >= 0);
      const strikeAt = (i) => BEAT.strike + (cuts.indexOf(i) / cuts.length) * (BEAT.send - BEAT.strike - .5);
      ctx.save(); ctx.beginPath(); ctx.rect(paneA[0] + 1, rowsTop - 2, paneA[1] - paneA[0] - 2, y1 - rowsTop + 1); ctx.clip();
      let stored = 0;
      const inAlpha = fade * (1 - swap);
      if (inAlpha > .01) {
        job.lines.forEach(([text, cut], i) => {
          const shown = span(c, BEAT.write + i * .16, BEAT.write + i * .16 + .45);
          if (shown <= 0) return;
          let row = i;
          for (const j of cuts) if (j < i) row -= ease(span(c, strikeAt(j) + .3, strikeAt(j) + .75));
          const y = rowsTop + (row + .5) * lh, chars = Math.ceil(text.length * shown), written = text.slice(0, chars);
          const strike = cut ? span(c, strikeAt(i), strikeAt(i) + .28) : 0, gone = cut ? ease(span(c, strikeAt(i) + .28, strikeAt(i) + .6)) : 0;
          if (gone >= 1) { stored++; return; }
          label(written, paneA[0] + pad, y + gone * 5, size, cut ? colors.ink2 : colors.ink, inAlpha * (1 - gone) * (cut ? .9 : 1), 'left');
          if (strike > 0) {
            ctx.font = `500 ${size}px ${mono}`; const tw = Math.min(ctx.measureText(text).width, paneA[1] - paneA[0] - pad * 2);
            seg([paneA[0] + pad - 2, y + gone * 5], [paneA[0] + pad - 2 + (tw + 4) * strike, y + gone * 5], 400 + i, 1.1, colors.accent, inAlpha * (1 - gone));
          }
        });
      }
      ctx.restore();

      // What's sent on, written once the strikes are done.
      ctx.save(); ctx.beginPath(); ctx.rect(paneB[0] + 1, rowsTop - 2, paneB[1] - paneB[0] - 2, y1 - rowsTop + 1); ctx.clip();
      const outAlpha = fade * (full ? 1 : swap);
      job.sent.forEach((text, i) => {
        const shown = span(c, BEAT.send + i * .22, BEAT.send + i * .22 + .4);
        if (shown <= 0) return;
        label(text.slice(0, Math.ceil(text.length * shown)), paneB[0] + pad, rowsTop + (i + .5) * lh, size, colors.ink, outAlpha, 'left');
      });
      ctx.restore();

      // The drawer under the window: what was cut is kept on disk, one call away.
      const dy0 = y1 + 6, dy1 = dy0 + drawer;
      face([[x0, dy0], [x1, dy0], [x1, dy1], [x0, dy1]], 500, .05);
      seg([(x0 + x1) / 2 - 12, dy0 + 5], [(x0 + x1) / 2 + 12, dy0 + 5], 512, 1, colors.line, .35);
      const drawerAlpha = .9;
      label(full ? 'KEPT ON DISK · mto_expand' : 'KEPT · mto_expand', x0 + (full ? 12 : 7), (dy0 + dy1) / 2 + 1, size - (full ? .5 : 0), colors.ink2, drawerAlpha, 'left');
      // A fleck for each cut line: it drops into the drawer and joins the stack there.
      for (const i of cuts) {
        const f = span(c, strikeAt(i) + .3, strikeAt(i) + 1);
        if (f <= 0 || fade <= .01) continue;
        const e = ease(f), from = rowsTop + (i + .5) * lh, x = x0 + (x1 - x0) * (full ? .1 + hash(i) * .3 : .3 + hash(i) * .4);
        if (f < 1) seg([x - 7, from + (dy0 - from) * e], [x + 7, from + (dy0 - from) * e], 520 + i, 1.1, colors.accent, (1 - e * .4) * fade, [2, 2]);
        else { const q = cuts.indexOf(i), rx = x1 - (full ? 12 : 7) - q * 6; seg([rx, (dy0 + dy1) / 2 - 5], [rx, (dy0 + dy1) / 2 + 5], 540 + i, 1.1, colors.ink2, .8 * fade); }
      }

      // The result: the loop's lasting touch of amber. Narrow, it takes the window's title bar.
      if (full) label(job.saved, ax, midY + clamp(h * .19, 44, 74) * 1.42, size + 1.5, colors.accent, result, 'center', 600);
      else label(job.saved, x1 - 7, y0 + bar / 2 + .5, size, colors.accent, result, 'right', 600);

      // The note of exactly what was cut, as mto writes it, under the drawer.
      if (full) label(job.note, (x0 + x1) / 2, dy1 + note / 2 + 2, size - 1, colors.ink2, .85 * ease(span(c, BEAT.send, BEAT.send + .6)) * fade);

      // The server, with its name turning when the call changes.
      const r = rack(sx + dx, midY + dy, rs, leaving > 0 && reach < 1 ? 1 : 0, 600, t);
      if (full) {
        label('MCP SERVER', sx, r.top - size, size, colors.ink2);
        mark(job.mark, sx - 34, r.bottom + 22, 15, ease(span(c, 0, .9)), fade, 680);
        label(job.server, sx - 22, r.bottom + 22, size, colors.ink, fade, 'left');
      } else {
        mark(job.mark, sx, r.bottom + 15, 13, ease(span(c, 0, .9)), fade, 680);
      }

      // The agent reel: one active, the others passing through and fading, like the site's install button.
      const turn = t / AGENT_TURN, index = Math.floor(turn) % AGENTS.length, step = full ? clamp(h * .19, 44, 74) : 34, slide = ease(span(turn % 1, .82, 1));
      if (full) label('YOUR AGENT', ax, midY - step * 1.42, size, colors.ink2);
      ctx.save(); ctx.beginPath(); ctx.rect(ax - sideW / 2, midY - step * 1.25, sideW, step * 2.5); ctx.clip();
      for (let k = -1; k <= 2; k++) {
        const [name, m] = AGENTS[(index + k + AGENTS.length) % AGENTS.length], off = k - slide, y = midY + off * step, near = Math.max(0, 1 - Math.abs(off));
        const a = (.13 + .87 * near * near) * clamp(1.6 - Math.abs(off)), ms = (full ? clamp(rs * .46, 26, 38) : 20) * (.72 + .28 * near), drew = k === 0 ? 1 : k === 1 ? slide : 1;
        mark(m, ax, y - (full ? 8 : 0) + dy, ms, drew, a, 700 + (index + k) * 31);
        if (full && near > .5) label(name, ax, y + (m ? ms / 2 + size - 4 : 0), size, colors.ink, a * (near * 2 - 1));
        else if (!m) label(name, ax, y, size - .5, colors.ink, a);
      }
      ctx.restore();
      // The slot it lands in, marked by four corners.
      const sw = full ? clamp(sideW * .46, 40, 78) : 20, sh = full ? clamp(step * .54, 26, 40) : 15, cn = 6;
      for (const [ex, ey] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const px = ax + ex * sw, py = midY + ey * sh + (full ? 3 : 0);
        seg([px, py], [px - ex * cn, py], 800 + ex, .8, colors.line, .75); seg([px, py], [px, py - ey * cn], 810 + ey, .8, colors.line, .75);
      }
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
    new MutationObserver(() => { readColors(); draw(reduced ? HOLD : time); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });
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
