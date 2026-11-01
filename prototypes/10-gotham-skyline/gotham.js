/* Inverted Gotham: The Batman (2022) in mood. Every building is drawn by this code, nothing is traced or copied.
   Depth comes from real 3D layers, atmosphere from color. To add something, add an entry to LANDMARKS or EFFECTS. */
window.Gotham = (() => {
  /* ---------- Small helpers ---------- */
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
  const alpha = (h, a) => { const [r, g, b] = rgb(h); return `rgba(${r},${g},${b},${a})`; };
  const seeded = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = (r, list) => list[Math.floor(r() * list.length)];

  /* ---------- Layers, far to near. z is real depth in px, ink is how far the color has come out of the haze. ---------- */
  const LAYERS = [
    { id: 'ridge', z: -900, ink: .14, cell: 0, rib: 0, min: 16, max: 40, lo: .4, hi: .6, seed: 3 },
    { id: 'far', z: -620, ink: .26, cell: 0, rib: .5, min: 20, max: 50, lo: .38, hi: .62, seed: 11 },
    { id: 'distant', z: -380, ink: .42, cell: 2, rib: .7, min: 26, max: 60, lo: .32, hi: .56, seed: 23 },
    { id: 'hero', z: -190, ink: .6, cell: 3, rib: 1, min: 32, max: 74, lo: .26, hi: .48, seed: 37 },
    { id: 'mid', z: -40, ink: .78, cell: 4, rib: 1, min: 46, max: 100, lo: .17, hi: .34, seed: 41 },
    { id: 'near', z: 150, ink: .94, cell: 5, rib: 1, min: 70, max: 150, lo: .1, hi: .2, seed: 59, edges: true },
  ];

  /* ---------- One building: a stack of setbacks with a cap. "up" is +y, because the city hangs from the top. ---------- */
  const KINDS = {
    deco: () => ({ steps: [[1, .5], [.8, .2], [.6, .1], [.4, .06]], cap: 'spire', capH: .14 }),
    gothic: () => ({ steps: [[1, .62], [.74, .14]], cap: 'pinnacles', capH: .24 }),
    slab: () => ({ steps: [[1, .96]], cap: 'tank', capH: .04 }),
    pyramid: () => ({ steps: [[1, .78]], cap: 'pyramid', capH: .22 }),
    ziggurat: () => ({ steps: [[1, .46], [.86, .16], [.72, .12], [.58, .1], [.44, .08]], cap: 'crenel', capH: .03 }),
    mansard: () => ({ steps: [[1, .78], [.88, .05]], cap: 'mansard', capH: .17 }),
    needle: () => ({ steps: [[1, .56], [.68, .17], [.42, .1]], cap: 'needle', capH: .17 }),
  };

  function tri(x, a, b, c, d, e, f) { x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.lineTo(e, f); x.closePath(); x.fill(); }

  /** A wall: flat color, a shadow side, piers, floors and windows. All the richness is here. */
  function wall(x, r, st, cx, y0, w, h, litBoost = 1) {
    if (y0 <= 0) { h -= -130 - y0; y0 = -130; }
    const left = cx - w / 2, shade = Math.min(w * .3, 26), sunSide = st.sunX > cx;
    x.fillStyle = st.body; x.fillRect(left, y0, w, h);
    x.fillStyle = st.side; x.fillRect(sunSide ? left : left + w - shade, y0, shade, h);
    const sunStripe = Math.max(1, w * .05);
    x.fillStyle = st.sun; x.fillRect(sunSide ? left + w - sunStripe : left, y0, sunStripe, h);
    if (st.rib) {
      const bays = Math.max(2, Math.round(w / Math.max(7, st.cell * 2.2)));
      x.fillStyle = st.ribC;
      for (let i = 1; i < bays; i++) x.fillRect(left + (i / bays) * w, y0, Math.max(.6, w > 60 ? 1.1 : .7), h);
    }
    if (st.cell) {
      const cw = st.cell, ch = st.cell * 1.7, cols = Math.max(1, Math.floor((w - 4) / (cw * 1.5))), rows = Math.floor(h / (ch * 1.25));
      const gap = (w - 4) / cols;
      for (let j = 0; j < rows; j++) {
        const fy = y0 + 3 + j * ch * 1.25;
        if (j % 7 === 6) { x.fillStyle = st.ribC; x.fillRect(left, fy, w, Math.max(1, cw * .3)); continue; }
        for (let i = 0; i < cols; i++) {
          const v = r(), px = left + 2 + i * gap + (gap - cw * .7) / 2;
          if (v < st.lit * litBoost) { x.fillStyle = r() < .82 ? st.win : st.win2; x.globalAlpha = .55 + r() * .45; }
          else { x.fillStyle = st.pane; x.globalAlpha = .55; }
          x.fillRect(px, fy, cw * .7, ch);
          x.globalAlpha = 1;
        }
      }
    }
    // A bright ledge where each setback meets the next, which is what makes the steps read.
    x.fillStyle = st.ledge; x.fillRect(left - 1, y0 + h - Math.max(1, w * .012), w + 2, Math.max(1, w * .012));
  }

  function capOf(x, st, kind, cx, y0, w, h) {
    x.fillStyle = st.body;
    if (kind === 'spire') { tri(x, cx - w / 2, y0, cx + w / 2, y0, cx, y0 + h); x.fillStyle = st.side; tri(x, st.sunX > cx ? cx - w / 2 : cx + w / 2, y0, cx, y0, cx, y0 + h); }
    else if (kind === 'needle') { tri(x, cx - w * .3, y0, cx + w * .3, y0, cx, y0 + h); }
    else if (kind === 'pyramid') { tri(x, cx - w / 2, y0, cx + w / 2, y0, cx, y0 + h); x.fillStyle = st.side; tri(x, st.sunX > cx ? cx - w / 2 : cx + w / 2, y0, cx, y0, cx, y0 + h); x.fillStyle = st.body; x.fillRect(cx - .8, y0 + h - 1, 1.6, h * .35); }
    else if (kind === 'pinnacles') {
      const pw = w * .2;
      tri(x, cx - w * .32, y0, cx + w * .32, y0, cx, y0 + h);
      for (const p of [-.5, .5]) tri(x, cx + p * w - pw / 2, y0, cx + p * w + pw / 2, y0, cx + p * w, y0 + h * .62);
    } else if (kind === 'crenel') {
      const n = Math.max(3, Math.round(w / 14)), bw = w / (n * 2 - 1);
      for (let i = 0; i < n; i++) x.fillRect(cx - w / 2 + i * 2 * bw, y0 - 1, bw, h + 1);
    } else if (kind === 'mansard') {
      x.beginPath(); x.moveTo(cx - w / 2, y0); x.lineTo(cx + w / 2, y0); x.lineTo(cx + w * .34, y0 + h); x.lineTo(cx - w * .34, y0 + h); x.closePath(); x.fill();
      x.fillRect(cx - .8, y0 + h - 1, 1.6, h * .5);
    } else if (kind === 'tank') {
      const tw = Math.min(w * .3, 22), tx = cx + w * .18;
      x.fillRect(tx - tw / 2, y0 + h * .4, tw, tw * .9);
      tri(x, tx - tw * .62, y0 + h * .4 + tw * .9, tx + tw * .62, y0 + h * .4 + tw * .9, tx, y0 + h * .4 + tw * 1.45);
      x.fillRect(tx - tw * .4, y0 - 1, 1.5, h * .4 + 2); x.fillRect(tx + tw * .4, y0 - 1, 1.5, h * .4 + 2);
    }
  }

  /** Small pointed finials on the corners of a setback, which is most of what makes a skyline read as gothic. */
  function finials(x, st, cx, y, w, h) {
    x.fillStyle = st.body;
    for (const s of [-1, 1]) tri(x, cx + s * w / 2 - s * h * .3, y - 1, cx + s * w / 2, y - 1, cx + s * w / 2 - s * h * .05, y + h);
  }

  function building(x, r, base, b) {
    // Each building catches the haze a little differently, so a row of them never looks like one flat color.
    const t = (r() - .5) * .22, tone = t > 0 ? base.side : base.hazeTone;
    const st = { ...base, body: mix(base.body, tone, Math.abs(t)) };
    const spec = KINDS[b.kind]();
    let y = 0;
    spec.steps.forEach(([wf, hf], i) => {
      wall(x, r, st, b.x, y, b.w * wf, b.h * hf, i ? 1.15 : 1);
      y += b.h * hf;
      if (b.w > 26 && i < spec.steps.length - 1) finials(x, st, b.x, y, b.w * wf, Math.min(b.h * .05, b.w * .34));
    });
    const last = spec.steps[spec.steps.length - 1][0];
    capOf(x, st, spec.cap, b.x, y, b.w * last, b.h * spec.capH);
    if (b.mast) { x.fillStyle = st.body; x.fillRect(b.x - .6, b.h - 2, 1.2, b.mast); }
    return b.h + (b.mast || 0);
  }

  /* ---------- Landmarks. Each one is a plugin: where it goes, and how it draws itself. Easter eggs slot in here. ---------- */
  const LANDMARKS = {
    /* Wayne Tower: a broad podium, a ribbed shaft stepping in, and a crown of two tall spires, like a cowl's ears.
       Flanked by a slim pyramid and a blunt ziggurat, as the user marked in their reference. */
    wayne: {
      layer: 'hero', at: .655,
      size: (c) => ({ H: c.H * .92 * c.reach, cx: c.W * .655, W: Math.min(c.W * .145, c.H * .92 * .21) }),
      clearance(c) { const { cx, W } = this.size(c); return { a: cx - W * 1.5, b: cx + W * 1.7, far: .5, near: .12 }; },
      draw(x, r, base, c) {
        const { H, cx, W } = this.size(c), st = { ...base, body: mix(base.body, base.slot, .45), side: mix(base.side, base.slot, .55) };
        // Companions first, so the tower stands in front of them.
        building(x, r, st, { x: cx - W * .98, w: W * .44, h: H * .62, kind: 'pyramid' });
        building(x, r, st, { x: cx + W * 1.08, w: W * .72, h: H * .58, kind: 'ziggurat' });
        // Podium and low wings with battlements.
        wall(x, r, st, cx, 0, W * 1.56, H * .17);
        capOf(x, st, 'crenel', cx - W * .6, H * .17, W * .36, H * .012);
        capOf(x, st, 'crenel', cx + W * .6, H * .17, W * .36, H * .012);
        const steps = [[1, .2], [.84, .24], [.64, .1], [.48, .06]];
        let y = H * .17;
        const shaftStart = y;
        steps.forEach(([wf, hf], i) => {
          const w = W * wf, h = H * hf;
          wall(x, r, st, cx, y, w, h, i ? 1.3 : 1);
          y += h;
          // Buttress fins and small gargoyles at each setback.
          x.fillStyle = st.body;
          for (const s of [-1, 1]) {
            tri(x, cx + s * w * .5, y - h * .6, cx + s * w * .5, y, cx + s * (w * .5 + W * .045), y - h * .02);
            if (i < 3) tri(x, cx + s * w * .5, y, cx + s * w * .32, y, cx + s * w * .47, y + H * .028);
          }
        });
        // Long lancet windows run the height of the shaft: the tower's vertical drama.
        for (const u of [-.2, -.07, .07, .2]) { const g = x.createLinearGradient(0, shaftStart, 0, y); g.addColorStop(0, alpha(st.crown, 0)); g.addColorStop(1, alpha(st.crown, st.lancet)); x.fillStyle = g; x.fillRect(cx + u * W - .75, y - (y - shaftStart) * .5, 1.5, (y - shaftStart) * .5 - H * .02); }
        // The crown: a lit core, two tall horns like a cowl's ears, and a low gable between them.
        const cw = W * .48, top = y, sh = H * .2;
        x.fillStyle = st.body;
        x.fillRect(cx - cw / 2, top, cw, sh * .3);
        tri(x, cx - cw * .5, top + sh * .3 - 1, cx - cw * .14, top + sh * .3 - 1, cx - cw * .4, top + sh);
        tri(x, cx + cw * .5, top + sh * .3 - 1, cx + cw * .14, top + sh * .3 - 1, cx + cw * .4, top + sh);
        tri(x, cx - cw * .2, top + sh * .3 - 1, cx + cw * .2, top + sh * .3 - 1, cx, top + sh * .5);
        x.fillStyle = st.side;
        const far = st.sunX > cx ? -1 : 1;
        tri(x, cx + far * cw * .5, top + sh * .3 - 1, cx + far * cw * .32, top + sh * .3 - 1, cx + far * cw * .4, top + sh);
        c.beacon(cx - cw * .4, top + sh); c.beacon(cx + cw * .4, top + sh);
        c.keepClear(cx - W * .7, cx + W * .7);
        this.crownAt = { top, sh, cw };
      },
      // Lit parts go on after the haze, so they stay crisp and warm.
      after(x, r, st, c) {
        const { H, cx, W } = this.size(c), { top, sh, cw } = this.crownAt;
        const bloom = x.createRadialGradient(cx, top + sh * .14, 0, cx, top + sh * .14, cw * 1.5);
        bloom.addColorStop(0, alpha(st.crown, st.crownA * .34)); bloom.addColorStop(1, alpha(st.crown, 0));
        x.fillStyle = bloom; x.beginPath(); x.arc(cx, top + sh * .14, cw * 1.5, 0, 7); x.fill();
        // Light catches the edges of the horns, so the crown holds its shape against any sky.
        x.strokeStyle = alpha(st.crown, st.rim); x.lineWidth = 1; x.beginPath();
        for (const s of [-1, 1]) { x.moveTo(cx + s * cw * .5, top + sh * .3); x.lineTo(cx + s * cw * .4, top + sh); x.lineTo(cx + s * cw * .14, top + sh * .3); }
        x.moveTo(cx - cw * .2, top + sh * .3); x.lineTo(cx, top + sh * .5); x.lineTo(cx + cw * .2, top + sh * .3); x.stroke();
        for (const u of [-.26, 0, .26]) {
          const g = x.createLinearGradient(0, top, 0, top + sh * .3);
          g.addColorStop(0, alpha(st.crown, .2)); g.addColorStop(1, alpha(st.crown, st.crownA));
          x.fillStyle = g;
          x.beginPath(); x.moveTo(cx + u * cw - cw * .05, top + sh * .02); x.lineTo(cx + u * cw + cw * .05, top + sh * .02); x.lineTo(cx + u * cw + cw * .05, top + sh * .22); x.lineTo(cx + u * cw, top + sh * .29); x.lineTo(cx + u * cw - cw * .05, top + sh * .22); x.closePath(); x.fill();
        }
        // The sign, drawn upright so it can be read in an upside-down city. A quiet easter egg.
        const sy = H * .23, fs = Math.max(9, Math.min(H * .027, W * .125));
        x.fillStyle = st.slot; x.fillRect(cx - W * .4, sy - fs * .9, W * .8, fs * 1.8);
        x.fillStyle = alpha(st.crown, .5); x.fillRect(cx - W * .4, sy - fs * .9, W * .8, 1); x.fillRect(cx - W * .4, sy + fs * .9 - 1, W * .8, 1);
        x.fillStyle = st.crown; x.font = `700 ${fs}px "Barlow Semi Condensed", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
        if ('letterSpacing' in x) x.letterSpacing = `${(fs * .22).toFixed(1)}px`;
        x.fillText('WAYNE', cx, sy);
        if ('letterSpacing' in x) x.letterSpacing = '0px';
      },
    },
    /* A suspension bridge, hanging the other way up: towers reach down, the deck runs across, the cables swing between. */
    bridge: {
      layer: 'distant', at: .25,
      draw(x, r, st, c) {
        const cx = c.W * this.at, span = c.W * .3, th = c.H * .64 * c.reach, deck = th * .5, a = cx - span / 2, b = cx + span / 2;
        const tower = (tx) => {
          x.fillStyle = st.body;
          for (const s of [-1, 1]) x.fillRect(tx + s * span * .03 - 2.5, 0, 5, th);
          x.strokeStyle = st.body; x.lineWidth = 1.6; x.beginPath();
          for (let y = deck * .25; y < th - 20; y += th * .15) { x.moveTo(tx - span * .03, y); x.lineTo(tx + span * .03, y + th * .15); x.moveTo(tx + span * .03, y); x.lineTo(tx - span * .03, y + th * .15); }
          x.stroke();
          tri(x, tx - span * .04, th, tx + span * .04, th, tx, th + th * .1);
        };
        x.fillStyle = st.body; x.fillRect(a - span * .32, deck, span * 1.64, 5);
        x.strokeStyle = alpha(st.body, .9); x.lineWidth = 1.1;
        x.beginPath(); x.moveTo(a, th); x.quadraticCurveTo(cx, deck * 1.02 - (th - deck) * .96, b, th); x.stroke();
        x.beginPath(); x.moveTo(a, th); x.lineTo(a - span * .32, deck); x.moveTo(b, th); x.lineTo(b + span * .32, deck); x.stroke();
        x.lineWidth = .6; x.beginPath();
        for (let i = 1; i < 26; i++) { const u = i / 26, px = a + span * u, py = th + (deck * 1.02 - (th - deck) * .96 - th) * 2 * u * (1 - u); x.moveTo(px, deck + 3); x.lineTo(px, py); }
        x.stroke();
        tower(a); tower(b);
        c.keepClear(a - span * .05, b + span * .05, .5);
      },
    },
    /* A crane on an unfinished tower: Gotham is always half-built. */
    crane: {
      layer: 'mid', at: .86,
      draw(x, r, st, c) {
        const cx = c.W * this.at, h = c.H * .34 * c.reach;
        wall(x, r, st, cx, 0, c.W * .07, h * .78);
        x.strokeStyle = st.body; x.lineWidth = 1; x.beginPath();
        const w = c.W * .07;
        for (let y = h * .78; y < h; y += 12) { x.moveTo(cx - w / 2, y); x.lineTo(cx + w / 2, y); }
        for (const u of [-.5, -.17, .17, .5]) { x.moveTo(cx + u * w, h * .78); x.lineTo(cx + u * w, h); }
        const mx = cx + w * .1, my = h + c.H * .14;
        x.moveTo(mx, h * .78); x.lineTo(mx, my); x.moveTo(mx + 5, h * .78); x.lineTo(mx + 5, my);
        for (let y = h * .78; y < my; y += 9) { x.moveTo(mx, y); x.lineTo(mx + 5, y + 9); }
        x.moveTo(mx - c.W * .08, my); x.lineTo(mx + c.W * .035, my); x.moveTo(mx - c.W * .08, my - 5); x.lineTo(mx + c.W * .035, my - 5);
        x.moveTo(mx - c.W * .07, my); x.lineTo(mx - c.W * .07, my - 26);
        x.stroke();
        c.beacon(mx + 2, my);
      },
    },
  };

  /* ---------- Times of day. Day takes its sky from the active palette. ---------- */
  function looks(time, p) {
    if (time === 'night') {
      const dark = '#05070b';
      return {
        sky: ['#2b1a1c', '#171318', '#0c0e14', '#07090e'], glow: 'rgba(214,92,40,.2)', ink: '#ece6dc', ink2: '#a59c92', line: '#c9b8a4', lineRest: 'rgba(201,184,164,.7)', accent: '#e6703a', paper: '#16181f',
        layer: (l) => {
          const body = mix('#2b2a35', dark, l.ink), side = mix(body, '#000000', .4);
          return { body, side, hazeTone: mix(body, '#3a2a2a', .5), sun: mix(body, '#c0572c', .34 * Math.min(1, l.ink * 1.3)), ribC: mix(body, '#000000', .3), pane: mix(body, '#000000', .3), slot: '#040507', ledge: mix(body, '#c0572c', .22), win: '#e9a95c', win2: '#cfdbe0', lit: .03 + l.ink * .1, crown: '#ffb45e', crownA: .98, lancet: .5, rim: .4, signInk: '#1a0f08' };
        },
        haze: '#2a1a1b', hazeA: .9, fog: '#3a2522', ray: null, sunX: .84,
      };
    }
    const [s0, s1, s2, s3] = p.sky, ink = p.ink, g = rgb('#000000') && p.glow.match(/\d+/g).slice(0, 3).map(Number), warm = hex(g);
    return {
      sky: p.sky, glow: p.glow, ink, ink2: p.ink2, line: p.line, lineRest: p.lineRest, accent: p.accent, paper: p.paper,
      layer: (l) => {
        const dark = mix(ink, s3, .1), body = mix(mix(s2, s3, .4), dark, l.ink);
        return { body, side: mix(body, dark, .34), hazeTone: mix(body, s1, .5), sun: mix(body, warm, .5 * Math.min(1, l.ink * 1.3)), ribC: mix(body, dark, .24), pane: mix(body, dark, .34), slot: mix(body, '#000000', .42), ledge: mix(body, warm, .34), win: mix(warm, '#ffffff', .25), win2: '#f4efe4', lit: .002 + l.ink * .006, crown: mix(warm, p.accent, .25), crownA: .9, lancet: .22, rim: .22, signInk: mix(ink, '#000000', .3) };
      },
      haze: s0, hazeA: .94, fog: s0, ray: warm, sunX: .84,
    };
  }

  /* ---------- Effects. Each is a plugin with update and draw, on one live canvas. Wind, embers, birds and more slot in here. ---------- */
  const EFFECTS = {
    dust: {
      create(r, c) { return Array.from({ length: c.count(70) }, () => ({ x: r(), y: r(), d: .25 + r() * .75, s: .5 + r() * 1.5, o: r() * 7, a: .12 + r() * .34 })); },
      draw(x, st, t, c) {
        x.fillStyle = c.look.dustColor;
        for (const p of st) {
          const px = ((p.x + t * .006 * p.d * c.wind + Math.sin(t * .23 + p.o) * .006) % 1 + 1) % 1, py = ((p.y - c.scroll / c.H * p.d * .35 + Math.sin(t * .17 + p.o) * .012) % 1 + 1) % 1;
          x.globalAlpha = p.a * c.amount * (.6 + .4 * Math.sin(t * .6 + p.o));
          x.beginPath(); x.arc(px * c.W + c.cam * p.d * 26, py * c.H, p.s * (.6 + p.d), 0, 7); x.fill();
        }
        x.globalAlpha = 1;
      },
    },
    birds: {
      create(r, c) { return Array.from({ length: c.count(9) }, () => ({ u: r(), v: .3 + r() * .36, s: 1.6 + r() * 2.4, f: 6 + r() * 4, o: r() * 7, sp: .008 + r() * .01 })); },
      draw(x, st, t, c) {
        x.strokeStyle = c.look.birdColor; x.lineWidth = 1;
        for (const b of st) {
          const px = (((b.u + t * b.sp) % 1.2) - .1) * c.W + c.cam * 8, py = b.v * c.H + Math.sin(t * .4 + b.o) * 7 - c.scroll * .3, fl = Math.sin(t * b.f + b.o) * b.s * .6;
          x.globalAlpha = .55 * c.amount; x.beginPath(); x.moveTo(px - b.s * 1.6, py - fl); x.lineTo(px, py); x.lineTo(px + b.s * 1.6, py - fl); x.stroke();
        }
        x.globalAlpha = 1;
      },
    },
    rain: {
      night: true,
      create(r, c) { return Array.from({ length: c.count(150) }, () => ({ x: r(), y: r(), d: .3 + r() * .7, l: 10 + r() * 22 })); },
      draw(x, st, t, c) {
        x.strokeStyle = c.look.rainColor; x.lineWidth = .8; x.beginPath();
        for (const p of st) {
          const py = (p.y + t * (.5 + p.d * .7)) % 1, px = ((p.x + py * .07 * c.wind + t * .02) % 1 + 1) % 1, X = px * c.W + c.cam * p.d * 30, Y = py * c.H;
          x.moveTo(X, Y); x.lineTo(X - p.l * .12, Y + p.l * p.d);
        }
        x.globalAlpha = .34 * c.amount; x.stroke(); x.globalAlpha = 1;
      },
    },
  };

  /* ---------- Mount ---------- */
  function mount(host, config) {
    const cfg = { time: 'day', palette: null, depth: 1, sway: 1, haze: 1, dust: 1, density: 1, reach: 1, landmarks: ['wayne', 'bridge', 'crane'], ...config };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stage = document.createElement('div'); stage.className = 'g-stage'; host.append(stage);
    const live = document.createElement('canvas'); live.className = 'g-live'; host.append(live);
    const liveX = live.getContext('2d');
    const nodes = []; // everything with depth, painted far to near
    const P = 1500, TOP = 120; // TOP: the city continues above the screen, so the camera never finds its edge
    let W = 0, H = 0, overscan = 0, D = 1, look = null, effects = {}, beamFrom = null;
    const cam = { x: 0, y: 0, tx: 0, ty: 0, sc: 0 };

    function layerNode(z, cls) {
      const el = document.createElement('div'); el.className = 'g-layer ' + (cls || '');
      const c = document.createElement('canvas'); el.append(c); stage.append(el);
      const n = { el, c, z, f: (P - z) / P }; nodes.push(n); return n;
    }
    const built = { beacons: [] };

    function fit(n) {
      const w = W + overscan * 2, h = H + TOP;
      n.c.width = w * D; n.c.height = h * D; n.c.style.width = w + 'px'; n.c.style.height = h + 'px'; n.c.style.left = -overscan + 'px'; n.c.style.top = -TOP + 'px';
      const x = n.c.getContext('2d'); x.setTransform(D, 0, 0, D, overscan * D, TOP * D); x.clearRect(-overscan, -TOP, w, h);
      return x;
    }

    function paintLayer(n, l) {
      const x = fit(n), r = seeded(l.seed), st = { ...look.layer(l), cell: W < 700 ? l.cell * .7 : l.cell, rib: l.rib, sunX: W * look.sunX };
      const clear = [], c = {
        W, H, reach: cfg.reach,
        beacon: (bx, by) => {
          const i = document.createElement('i'); i.className = 'g-beacon'; i.style.left = bx + overscan + 'px'; i.style.top = by + 'px'; i.style.animationDelay = (bx % 37) / 12 + 's'; n.el.append(i); built.beacons.push(i);
        },
        keepClear: (a, b, share = 1) => clear.push([a, b, share]),
      };
      // Landmarks reserve their ground first, then the skyline is drawn around and behind them.
      const here = cfg.landmarks.map((k) => LANDMARKS[k]).filter((m) => m && m.layer === l.id);
      const scratch = document.createElement('canvas').getContext('2d');
      here.forEach((m) => m.draw(scratch, seeded(l.seed + 5), st, c));
      n.el.querySelectorAll('.g-beacon').forEach((b) => b.remove());
      const width = W < 700 ? 1.5 : 1;
      // Landmarks in other layers keep their sightline: nothing in front covers them, nothing behind competes with them.
      const myIndex = LAYERS.indexOf(l);
      const sight = cfg.landmarks.map((k) => LANDMARKS[k]).filter((m) => m && m.clearance && m.layer !== l.id).map((m) => ({ ...m.clearance(c), front: myIndex > LAYERS.findIndex((a) => a.id === m.layer) }));
      for (let px = -overscan - 60; px < W + overscan + 60;) {
        const w = (l.min + r() * (l.max - l.min)) * width / cfg.density, kind = pick(r, ['deco', 'deco', 'deco', 'gothic', 'gothic', 'needle', 'needle', 'pyramid', 'mansard', 'ziggurat', 'slab']);
        const u = (px + w / 2) / W, rise = .72 + .28 * Math.min(1, Math.max(0, (u - .1) / .4));
        const h = H * (l.lo + r() * (l.hi - l.lo)) * rise * cfg.reach;
        if (l.edges && u > .2 && u < .8) { px += w * .8; continue; } // the nearest roofs only frame the shot
        const blocked = clear.find(([a, b]) => px + w > a && px < b);
        const tooTall = blocked && blocked[2] === 1;
        const inSight = sight.find((v) => px + w > v.a && px < v.b);
        const capped = inSight ? Math.min(h, H * (inSight.front ? inSight.near : inSight.far) * cfg.reach) : h;
        building(x, r, st, { x: px + w / 2, w, h: tooTall ? capped * .55 : capped * (blocked ? .6 : 1), kind, mast: r() < .12 && l.id !== 'near' ? H * .02 + r() * H * .035 : 0 });
        px += w * (.72 + r() * .3);
      }
      here.forEach((m) => m.draw(x, seeded(l.seed + 5), st, c));

      // Atmosphere: the feet of the city dissolve into the haze, so nothing ends in a hard line under the header.
      const hazeTo = H * (.24 + (1 - l.ink) * .16);
      const g = x.createLinearGradient(0, 0, 0, hazeTo);
      const strength = Math.min(1, look.hazeA * cfg.haze);
      g.addColorStop(0, alpha(look.haze, strength)); g.addColorStop(.3, alpha(look.haze, strength * .6)); g.addColorStop(1, alpha(look.haze, 0));
      x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(-overscan, -TOP, W + overscan * 2, H + TOP);
      x.globalCompositeOperation = 'source-over';
      here.forEach((m) => m.after && m.after(x, seeded(l.seed + 7), st, c));
    }

    function fogSheet(n, seed, band, color, amount) {
      const x = fit(n), r = seeded(seed);
      for (let i = 0; i < 70; i++) {
        const px = -overscan + r() * (W + overscan * 2), py = H * (band[0] + r() * (band[1] - band[0])), rad = H * (.05 + r() * .14);
        const g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, alpha(color, amount * (.1 + r() * .22))); g.addColorStop(1, alpha(color, 0));
        x.save(); x.translate(px, py); x.scale(3.2, 1); x.translate(-px, -py); x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); x.restore();
      }
    }

    function raysSheet(n) {
      const x = fit(n);
      if (!look.ray) return;
      const sx = W * look.sunX, sy = -H * .12, r = seeded(9);
      x.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (.52 + r() * .42), len = H * (1 + r() * .5), spread = .012 + r() * .036;
        const g = x.createRadialGradient(sx, sy, 0, sx, sy, len); g.addColorStop(0, alpha(look.ray, .05 + r() * .05)); g.addColorStop(1, alpha(look.ray, 0));
        x.fillStyle = g; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a - spread) * len, sy + Math.sin(a - spread) * len); x.lineTo(sx + Math.cos(a + spread) * len, sy + Math.sin(a + spread) * len); x.closePath(); x.fill();
      }
      x.globalCompositeOperation = 'source-over';
    }

    let plan = [];
    function buildPlan() {
      stage.innerHTML = ''; nodes.length = 0;
      const phone = innerWidth < 760;
      const use = phone ? LAYERS.filter((l) => l.id !== 'distant') : LAYERS;
      plan = [];
      use.forEach((l) => {
        plan.push({ node: layerNode(l.z, 'g-' + l.id), l });
        if (l.id === 'far') plan.push({ node: layerNode(l.z + 60, 'g-fog a'), fog: [.05, .62, .8] });
        if (l.id === 'distant') plan.push({ node: layerNode(l.z + 50, 'g-rays'), rays: true });
        if (l.id === 'hero') plan.push({ node: layerNode(l.z + 70, 'g-fog b'), fog: [.08, .5, .75] });
      });
    }

    function paint() {
      built.beacons = [];
      look = looks(cfg.time, cfg.palette);
      look.dustColor = cfg.time === 'night' ? '#e9a56a' : '#fff6e0'; look.birdColor = cfg.time === 'night' ? '#000000' : cfg.palette.ink; look.rainColor = '#b9c4cf';
      plan.forEach((s, i) => {
        s.node.el.querySelectorAll('.g-beacon').forEach((b) => b.remove());
        if (s.l) paintLayer(s.node, s.l);
        else if (s.rays) raysSheet(s.node);
        else fogSheet(s.node, 40 + i, s.fog, look.fog, s.fog[2] * cfg.haze * (cfg.time === 'night' ? .5 : 1));
      });
      const r = seeded(77), c = { count: (n) => Math.round(n * (innerWidth < 760 ? .5 : 1)) };
      effects = {};
      Object.entries(EFFECTS).forEach(([k, e]) => { if (!e.night || cfg.time === 'night') effects[k] = e.create(r, c); });
      apply();
    }

    function resize() {
      W = host.clientWidth; H = host.clientHeight; if (!W || !H) return;
      D = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 1.75); overscan = Math.round(W * .1);
      const lw = Math.min(innerWidth, 1400);
      live.width = W; live.height = H; void lw;
      buildPlan(); paint();
    }

    /* ---------- The camera: real perspective, one spring, one clock. ---------- */
    let last = 0, swayAt = 0, raf = 0;
    function place(t) {
      const k = cfg.depth, s = cam.sc;
      // The city steps back as content scrolls over it, so text always wins.
      host.style.opacity = Math.max(.38, 1 - s / (H * .9)).toFixed(3);
      const swayNow = reduced ? 0 : Math.sin(s / 520) * cfg.sway;
      swayAt = swayNow;
      const rotY = reduced ? 0 : (cam.x * 1.9 + swayNow * 1.5) * k, rotX = reduced ? 0 : cam.y * -1 * k;
      const breathe = reduced ? 0 : Math.sin(t * .11) * .35;
      stage.style.transform = `translate3d(0,0,${(-s * .05).toFixed(1)}px) rotateY(${(rotY + breathe * .3).toFixed(3)}deg) rotateX(${rotX.toFixed(3)}deg)`;
      for (const n of nodes) {
        const depth = (n.z + 900) / 1050; // 0 far, 1 near
        const lift = s * (.12 + depth * .62) * (reduced ? .4 : 1), side = reduced ? 0 : swayNow * depth * 46 * k;
        let drift = 0;
        if (!reduced && n.el.classList.contains('g-fog')) drift = Math.sin(t * .05 + n.z) * 34 + t * .0;
        n.el.style.transformOrigin = '62% 30%';
        n.el.style.transform = `translate3d(${(side + drift).toFixed(1)}px,${(-lift).toFixed(1)}px,${n.z}px) scale(${n.f.toFixed(4)})`;
      }
    }
    function drawLive(t) {
      liveX.clearRect(0, 0, W, H);
      const c = { W, H, wind: 1 + Math.sin(t * .07) * .4, scroll: cam.sc, cam: cam.x, amount: cfg.dust, look };
      for (const [k, st] of Object.entries(effects)) EFFECTS[k].draw(liveX, st, t, c);
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
      const q = 1 - Math.exp(-dt * 2.4);
      cam.x += (cam.tx - cam.x) * q; cam.y += (cam.ty - cam.y) * q;
      cam.sc += (cfg.scrollY() - cam.sc) * (1 - Math.exp(-dt * 6));
      place(now / 1000); drawLive(now / 1000);
    }
    function apply() { place(performance.now() / 1000); drawLive(reduced ? 8 : performance.now() / 1000); }

    addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') { cam.tx = e.clientX / innerWidth - .5; cam.ty = e.clientY / innerHeight - .5; } });
    let rt; const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(resize, 140); }); ro.observe(host);
    resize();
    if (!reduced) raf = requestAnimationFrame(frame);
    if (reduced) { cfg.onScroll = () => { cam.sc = cfg.scrollY(); apply(); }; }

    return {
      set(next) { const was = cfg.time; Object.assign(cfg, next); if ('time' in next || 'palette' in next || 'haze' in next || 'density' in next || 'reach' in next || 'landmarks' in next) { if (was !== cfg.time || true) paint(); } else apply(); },
      look: () => look,
      nudge(px, py) { cam.tx = px; cam.ty = py; cam.x = px; cam.y = py; },
      syncScroll() { cam.sc = cfg.scrollY(); apply(); },
      sway: () => swayAt,
    };
  }
  return { mount, LANDMARKS, EFFECTS, LAYERS, looks };
})();
