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
    { id: 'ridge', z: -900, ink: .14, cell: 0, rib: 0, min: 12, max: 58, lo: .26, hi: .62, seed: 3 },
    { id: 'far', z: -620, ink: .26, cell: 0, rib: .5, min: 16, max: 70, lo: .24, hi: .64, seed: 11 },
    { id: 'distant', z: -380, ink: .42, cell: 2, rib: .7, min: 22, max: 78, lo: .22, hi: .58, seed: 23 },
    { id: 'hero', z: -190, ink: .54, cell: 3, rib: 1, min: 32, max: 84, lo: .22, hi: .48, seed: 37 },
    { id: 'mid', z: -40, ink: .66, cell: 4, rib: 1, min: 40, max: 92, lo: .15, hi: .34, seed: 41 },
    { id: 'near', z: 150, ink: .8, cell: 5, rib: 1, min: 70, max: 150, lo: .1, hi: .2, seed: 59, edges: true },
  ];

  /* How often each building type appears: mostly flat and stepped roofs, so spires stand out when they do appear. */
  const SKYLINE_MIX = { flat: 6, stepped: 5, slab: 3, helipad: 3, dome: 2, clock: 1, mansard: 3, ziggurat: 2, deco: 3, gothic: 2, pyramid: 2, needle: 1 };
  const MIX_BAG = Object.entries(SKYLINE_MIX).flatMap(([k, n]) => Array(n).fill(k));

  /* ---------- One building: a stack of setbacks with a cap. "up" is +y, because the city hangs from the top. ---------- */
  const KINDS = {
    deco: () => ({ steps: [[1, .5], [.8, .2], [.6, .1], [.4, .06]], cap: 'spire', capH: .14 }),
    gothic: () => ({ steps: [[1, .62], [.74, .14]], cap: 'pinnacles', capH: .24 }),
    slab: () => ({ steps: [[1, .96]], cap: 'tank', capH: .04 }),
    pyramid: () => ({ steps: [[1, .78]], cap: 'pyramid', capH: .22 }),
    ziggurat: () => ({ steps: [[1, .46], [.86, .16], [.72, .12], [.58, .1], [.44, .08]], cap: 'crenel', capH: .03 }),
    mansard: () => ({ steps: [[1, .78], [.88, .05]], cap: 'mansard', capH: .17 }),
    needle: () => ({ steps: [[1, .56], [.68, .17], [.42, .1]], cap: 'needle', capH: .17 }),
    flat: () => ({ steps: [[1, .985]], cap: 'parapet', capH: .015 }),
    stepped: () => ({ steps: [[1, .58], [.74, .28], [.46, .13]], cap: 'parapet', capH: .01 }),
    helipad: () => ({ steps: [[1, .92], [.62, .05]], cap: 'helipad', capH: .03 }),
    dome: () => ({ steps: [[1, .78], [.8, .08]], cap: 'dome', capH: .14 }),
    clock: () => ({ steps: [[.62, .74], [1, .12], [.62, .03]], cap: 'pyramid', capH: .11 }),
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
    // Weather: stains run from each ledge towards the ground, which is up the screen here. Gotham isn't a clean city.
    if (st.cell > 1) {
      const streaks = Math.min(st.wear ? 60 : 26, Math.round(w * h / 5200 * (st.wear || 1)));
      for (let i = 0; i < streaks; i++) {
        const sx = left + r() * w, top = y0 + r() * h, len = Math.min(top - y0, 22 + r() * 110), sw = .8 + r() * 2.6;
        const g = x.createLinearGradient(0, top, 0, top - len);
        g.addColorStop(0, alpha(r() < .75 ? st.grime : st.stain, .1 + r() * .24)); g.addColorStop(1, alpha(st.grime, 0));
        x.fillStyle = g; x.fillRect(sx, top - len, sw, len);
      }
    }
    // A bright ledge where each setback meets the next, which is what makes the steps read.
    x.fillStyle = st.ledge; x.fillRect(left - 1, y0 + h - Math.max(1, w * .012), w + 2, Math.max(1, w * .012));
  }

  function capOf(x, st, kind, cx, y0, w, h) {
    x.fillStyle = st.body;
    if (kind === 'parapet') { x.fillRect(cx - w / 2 - 1, y0 - 1, w + 2, Math.max(1.5, h)); if (w > 40) x.fillRect(cx + w * .2, y0, w * .12, Math.max(4, w * .1)); }
    else if (kind === 'helipad') { const pw = w * 1.7, t = Math.max(1.5, h * .5); x.fillRect(cx - w * .16, y0 - 1, w * .32, h); x.fillRect(cx - pw / 2, y0 + h - 1, pw, t); x.fillStyle = st.ledge; x.fillRect(cx - pw / 2, y0 + h + t - 2, pw, 1); x.fillStyle = st.body; x.fillRect(cx + pw * .42, y0 + h, 1, Math.max(5, pw * .16)); }
    else if (kind === 'dome') { x.beginPath(); x.ellipse(cx, y0, w * .5, h, 0, 0, Math.PI); x.fill(); x.fillRect(cx - .7, y0 + h - 1, 1.4, Math.max(4, h * .35)); }
    else if (kind === 'spire') { tri(x, cx - w / 2, y0, cx + w / 2, y0, cx, y0 + h); x.fillStyle = st.side; tri(x, st.sunX > cx ? cx - w / 2 : cx + w / 2, y0, cx, y0, cx, y0 + h); }
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

  /** Weathered stone lettering fixed to the facade, with the company's mark beneath: part of the building, not a sign on it.
      It's turned upside down with the rest of the city, so turning your head reads it. */
  function wayneSign(x, r, st, cx, cy, w, H) {
    const D = 2, fs = Math.min(w * .19, H * .034), cw = Math.ceil(w), ch = Math.ceil(fs * 3.2);
    const off = document.createElement('canvas'); off.width = cw * D; off.height = ch * D;
    const o = off.getContext('2d'); o.scale(D, D); o.translate(cw / 2, ch / 2);
    const stamp = (color, dx, dy) => {
      o.fillStyle = color; o.strokeStyle = color; o.save(); o.translate(dx, dy);
      o.font = `700 ${fs}px "Barlow Semi Condensed", sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle';
      if ('letterSpacing' in o) o.letterSpacing = `${(fs * .2).toFixed(1)}px`;
      o.save(); o.translate(0, -fs * .62); o.scale(1.22, 1); o.fillText('WAYNE', 0, 0); o.restore();
      // The mark: a blocky W between two thin rules.
      const m = fs * .82, y = fs * .72;
      o.beginPath();
      [[-.72, -.5], [-.34, -.5], [-.34, -.36], [-.48, -.36], [-.34, .2], [-.12, -.5], [.12, -.5], [.34, .2], [.48, -.36], [.34, -.36], [.34, -.5], [.72, -.5], [.72, -.36], [.62, -.36], [.42, .5], [.24, .5], [0, -.2], [-.24, .5], [-.42, .5], [-.62, -.36], [-.72, -.36]].forEach(([a, b], i) => (i ? o.lineTo(a * m, y + b * m) : o.moveTo(a * m, y + b * m)));
      o.closePath(); o.fill();
      o.fillRect(-w * .42, y - .75, w * .42 - m * .85, 1.5); o.fillRect(m * .85, y - .75, w * .42 - m * .85, 1.5);
      o.restore();
    };
    stamp(st.signShadow, 1.1, 1.1); // the letters stand proud of the wall
    stamp(st.signStone, 0, 0);
    // Wear: chips and missing edges, then a sunlit top edge on what's left.
    o.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 170; i++) { o.globalAlpha = .3 + r() * .7; o.beginPath(); o.arc((r() - .5) * cw, (r() - .5) * ch, .25 + r() * r() * 1.9, 0, 7); o.fill(); }
    o.globalAlpha = .8; for (let i = 0; i < 9; i++) { o.fillRect((r() - .5) * cw, (r() - .5) * ch, 1 + r() * 9, .6 + r() * .6); }
    // Sun and rain have eaten more of the letters at one end, as they would on a real facade.
    const fade = o.createLinearGradient(-cw * .45, 0, cw * .45, 0); fade.addColorStop(0, 'rgba(0,0,0,.34)'); fade.addColorStop(.55, 'rgba(0,0,0,.08)'); fade.addColorStop(1, 'rgba(0,0,0,.22)');
    o.globalAlpha = 1; o.fillStyle = fade; o.fillRect(-cw / 2, -ch / 2, cw, ch);
    o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';

    // A paler patch of wall where the lettering has protected the stone, and rust running from its fixings towards the ground.
    x.fillStyle = alpha(st.signStone, .05); x.fillRect(cx - cw * .47, cy - ch * .5, cw * .94, ch);
    for (let i = 0; i < 26; i++) {
      const sx = cx - cw * .4 + r() * cw * .8, top = cy + ch * (.1 + r() * .3), len = 16 + r() * 48, g = x.createLinearGradient(0, top, 0, top - len);
      g.addColorStop(0, alpha(st.stain, .55)); g.addColorStop(1, alpha(st.stain, 0)); x.fillStyle = g; x.fillRect(sx, top - len, .8 + r() * 1.3, len);
    }
    // Upside down with the city: a half turn, not a mirror, so it still reads correctly when you turn your head.
    x.save(); x.translate(cx, cy); x.rotate(Math.PI); x.globalAlpha = .9; x.drawImage(off, -cw / 2, -ch / 2, cw, ch); x.restore();
  }

  /* ---------- Landmarks. Each one is a plugin: where it goes, and how it draws itself. Easter eggs slot in here. ---------- */
  const LANDMARKS = {
    /* Wayne Tower: a broad podium, a ribbed shaft stepping in, and a crown of two tall spires, like a cowl's ears.
       Flanked by a slim pyramid and a blunt ziggurat, as the user marked in their reference. */
    wayne: {
      layer: 'hero', at: .655,
      // On a narrow screen the tower keeps its proportions rather than shrinking with the width.
      size: (c) => { const H = c.H * .92 * c.reach; return { H, cx: c.W * (c.W < 760 ? .62 : .655), W: Math.min(Math.max(c.W * .145, Math.min(c.W * .3, H * .19)), H * .21) }; },
      clearance(c) { const { cx, W } = this.size(c); return { a: cx - W * 1.5, b: cx + W * 1.7, far: .5, near: .12 }; },
      draw(x, r, base, c) {
        const { H, cx, W } = this.size(c), st = { ...base, wear: 3.4, body: mix(base.body, base.slot, .45), side: mix(base.side, base.slot, .55) };
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
        wayneSign(x, r, st, cx, H * .535, W * .74, H);
      },
    },
    /* A few hand-placed buildings in front of Wayne Tower, for depth. They stay low, so the shaft and the name stay clear.
       Wide screens only: on a phone the tower has the screen to itself. */
    wayneFrontMid: {
      layer: 'mid',
      draw(x, r, st, c) {
        if (c.W < 760) return;
        const { H, cx, W } = LANDMARKS.wayne.size(c);
        building(x, r, st, { x: cx - W * .78, w: W * .42, h: H * .27, kind: 'deco' });
        building(x, r, st, { x: cx + W * .36, w: W * .5, h: H * .2, kind: 'stepped' });
      },
    },
    wayneFrontNear: {
      layer: 'near',
      draw(x, r, st, c) {
        if (c.W < 760) return;
        const { H, cx, W } = LANDMARKS.wayne.size(c);
        building(x, r, st, { x: cx - W * .12, w: W * .62, h: H * .13, kind: 'mansard' });
      },
    },
    /* A suspension bridge, hanging the other way up: towers reach down, the deck runs across, the cables swing between. */
    bridge: {
      layer: 'distant', at: .25,
      draw(x, r, st, c) {
        const cx = c.W * (c.W < 760 ? .12 : this.at), span = Math.max(c.W * .3, 250), th = c.H * .64 * c.reach, deck = th * .5, a = cx - span / 2, b = cx + span / 2;
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
          return { body, side, grime: '#000000', stain: '#5b3a24', hazeTone: mix(body, '#3a2a2a', .5), sun: mix(body, '#c0572c', .34 * Math.min(1, l.ink * 1.3)), ribC: mix(body, '#000000', .3), pane: mix(body, '#000000', .3), slot: '#040507', ledge: mix(body, '#c0572c', .22), win: '#e9a95c', win2: '#cfdbe0', lit: .03 + l.ink * .1, crown: '#ffb45e', crownA: .98, lancet: .5, rim: .4, signStone: '#c98f58', signShadow: '#0a0705', signInk: '#1a0f08' };
        },
        haze: '#2a1a1b', hazeA: .9, fog: '#3a2522', ray: null, sunX: .84,
      };
    }
    const [s0, s1, s2, s3] = p.sky, ink = p.ink, g = rgb('#000000') && p.glow.match(/\d+/g).slice(0, 3).map(Number), warm = hex(g);
    return {
      sky: p.sky, glow: p.glow, ink, ink2: p.ink2, line: p.line, lineRest: p.lineRest, accent: p.accent, paper: p.paper,
      layer: (l) => {
        const dark = mix(ink, s3, .1), body = mix(mix(s2, s3, .4), dark, l.ink);
        return { body, side: mix(body, dark, .34), grime: dark, stain: mix(warm, dark, .55), hazeTone: mix(body, s1, .5), sun: mix(body, warm, .5 * Math.min(1, l.ink * 1.3)), ribC: mix(body, dark, .24), pane: mix(body, dark, .34), slot: mix(body, '#000000', .42), ledge: mix(body, warm, .34), win: mix(warm, '#ffffff', .25), win2: '#f4efe4', lit: .002 + l.ink * .006, crown: mix(warm, p.accent, .25), crownA: .9, lancet: .22, rim: .22, signStone: mix(s1, warm, .4), signShadow: mix(dark, '#000000', .5), signInk: mix(ink, '#000000', .3) };
      },
      haze: s0, hazeA: .94, fog: s0, ray: warm, sunX: .84,
    };
  }

  /* ---------- Effects. Each is a plugin with update and draw, on one live canvas. Wind, embers, birds and more slot in here. ---------- */
  const EFFECTS = {
    dust: {
      create(r, c) { return Array.from({ length: c.count(110) }, () => ({ x: r(), y: r(), d: .25 + r() * .75, s: .5 + r() * 1.5, o: r() * 7, a: .12 + r() * .34 })); },
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
    /* Bats at three distances. Far ones are specks among the towers, a few cross the open sky, and one or two pass close. */
    bats: {
      create(r, c) {
        const make = (s0, s1, y0, y1, a, speed) => ({ s: s0 + r() * (s1 - s0), u: r(), v: y0 + r() * (y1 - y0), a, dir: r() < .72 ? 1 : -1, sp: speed * (.7 + r() * .6), f: 7 + r() * 4, o: r() * 7, glide: .12 + r() * .2, wander: 5 + r() * 16, d: s0 / 8 });
        const far = c.phone ? 3 : 5, mid = c.phone ? 3 : 5, openSky = c.phone ? 2 : 4;
        return [
          ...Array.from({ length: far }, () => make(1.1, 1.8, .18, .56, .38, .006)), // among the towers, small and hazy
          ...Array.from({ length: openSky }, () => make(1.4, 3, .6, .92, .5, .009)), // out in the open sky
          ...Array.from({ length: mid }, () => make(2.4, 3.8, .22, .78, .6, .012)),
          make(5.4, 6.6, .3, .62, .74, .021), make(6.2, 8, .55, .85, .8, .026), // close to the lens, and rare
        ];
      },
      draw(x, st, t, c) {
        x.strokeStyle = c.look.birdColor; x.fillStyle = c.look.birdColor; x.lineWidth = 1;
        for (const b of st) {
          const run = ((b.u + t * b.sp * b.dir) % 1.3 + 1.3) % 1.3 - .15;
          const px = run * c.W + c.cam * b.s * 3, py = b.v * c.H + Math.sin(t * (.32 + b.d) + b.o) * b.wander - c.scroll * (.16 + b.d * .5);
          // They flap in bursts and glide between them, which is what makes a bat look alive rather than mechanical.
          const burst = Math.max(b.glide, Math.sin(t * .55 + b.o * 3) * .5 + .5), fl = Math.sin(t * b.f + b.o) * b.s * .62 * burst;
          x.globalAlpha = b.a * Math.min(1, c.amount + .3);
          if (b.s < 2.2) { x.beginPath(); x.moveTo(px - b.s * 1.6, py - fl); x.lineTo(px, py); x.lineTo(px + b.s * 1.6, py - fl); x.stroke(); continue; }
          const s = b.s, wing = (k) => [[k * s * 2.2, -fl - s * .1], [k * s * 1.25, -fl * .45 - s * .42], [k * s * .36, -s * .3], [k * s * .2, -s * .62]];
          const under = (k) => [[k * s * 1.45, -fl * .52 + s * .22], [k * s * .92, -fl * .26 - s * .02], [k * s * .56, s * .24]];
          const pts = [...wing(-1), [0, -s * .32], ...wing(1).reverse(), ...under(1), [0, s * .62], ...under(-1).reverse()];
          x.beginPath(); pts.forEach(([a, e], i) => (i ? x.lineTo(px + a, py + e) : x.moveTo(px + a, py + e))); x.closePath(); x.fill();
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
    const cfg = { time: 'day', palette: null, word: 'GOTHAM', wordStrength: 1, depth: 1, sway: 1, haze: 1, dust: 1, density: 1, reach: 1, landmarks: ['wayne', 'wayneFrontMid', 'wayneFrontNear', 'bridge', 'crane'], ...config };
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
      const width = W < 700 ? 1.1 : 1;
      // Landmarks in other layers keep their sightline: nothing in front covers them, nothing behind competes with them.
      const myIndex = LAYERS.indexOf(l);
      const sight = cfg.landmarks.map((k) => LANDMARKS[k]).filter((m) => m && m.clearance && m.layer !== l.id).map((m) => ({ ...m.clearance(c), front: myIndex > LAYERS.findIndex((a) => a.id === m.layer) }));
      for (let px = -overscan - 60; px < W + overscan + 60;) {
        let w = (l.min + r() * (l.max - l.min)) * width / cfg.density; const kind = pick(r, MIX_BAG);
        const u = (px + w / 2) / W, rise = .72 + .28 * Math.min(1, Math.max(0, (u - .1) / .4));
        const spread = r(), h = H * (l.lo + spread * spread * (l.hi - l.lo)) * rise * cfg.reach; // squared, so most are low and a few stand tall
        if (l.edges && u > .2 && u < .8) { px += w * .8; continue; } // the nearest roofs only frame the shot
        // The front rows stay open: gaps between buildings, and nothing wider than a tower should be.
        // Without this they pile up into a dark, heavy band right under the header.
        if (l.ink > .5 && r() < .24) { px += w * (.7 + r() * .9); continue; }
        if (l.ink > .5) w = Math.min(w, Math.max(l.min * .6, h * .4));
        const blocked = clear.find(([a, b]) => px + w > a && px < b);
        const tooTall = blocked && blocked[2] === 1;
        const inSight = sight.find((v) => px + w > v.a && px < v.b);
        if (inSight && inSight.front) { px += w * .7; continue; } // nothing stands in front of a landmark
        const capped = inSight ? Math.min(h, H * (inSight.front ? inSight.near : inSight.far) * cfg.reach) : h;
        building(x, r, st, { x: px + w / 2, w, h: tooTall ? capped * .55 : capped * (blocked ? .6 : 1), kind, mast: r() < .1 && l.id !== 'near' && kind !== 'pyramid' ? H * .015 + r() * H * .03 : 0 });
        px += w * (.72 + r() * .3);
      }
      here.forEach((m) => m.draw(x, seeded(l.seed + 5), st, c));

      // Atmosphere: the feet of the city dissolve into the haze, so nothing ends in a hard line under the header.
      const hazeTo = H * (W < 760 ? (l.ink > .5 ? .3 : .17) : .26 + (1 - l.ink) * .14);
      const g = x.createLinearGradient(0, 0, 0, hazeTo);
      const strength = Math.min(1, look.hazeA * cfg.haze);
      g.addColorStop(0, alpha(look.haze, strength)); g.addColorStop(.42, alpha(look.haze, strength * (l.ink > .5 ? .74 : .6))); g.addColorStop(1, alpha(look.haze, 0));
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

    /* The city's name, huge and far behind everything, in outline. The skyline covers most of it, and only the ends of the letters show below.
       Turned upside down with the city. Thin lines and low contrast keep it out of the way of the page. */
    function wordSheet(n) {
      const x = fit(n);
      if (!cfg.word || !cfg.wordStrength) return;
      const font = (size) => `700 ${size}px "Barlow Semi Condensed", sans-serif`;
      x.font = font(100); if ('letterSpacing' in x) x.letterSpacing = '2px';
      const fs = Math.min(100 * (W * .98) / x.measureText(cfg.word).width, H * .78), reach = H * (W < 760 ? .6 : .67), cap = fs * .7;
      x.save();
      x.translate(W / 2, reach - cap / 2); x.rotate(Math.PI);
      x.font = font(fs); x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'miter'; x.miterLimit = 3;
      if ('letterSpacing' in x) x.letterSpacing = `${(fs * .02).toFixed(1)}px`;
      // The depth: the same outline stepped back behind itself, faintly, so the letters read as solid blocks.
      const steps = Math.round(Math.max(5, fs * .05)), dx = -.8, dy = .8;
      x.strokeStyle = look.wordColor; x.lineWidth = .7;
      for (let i = steps; i > 0; i--) { x.globalAlpha = .1 * cfg.wordStrength; x.strokeText(cfg.word, dx * i, dy * i); }
      x.globalAlpha = .44 * cfg.wordStrength; x.lineWidth = 1; x.strokeText(cfg.word, 0, 0);
      x.restore(); x.globalAlpha = 1;
    }

    let plan = [];
    function buildPlan() {
      stage.innerHTML = ''; nodes.length = 0;
      const phone = innerWidth < 760;
      const use = phone ? LAYERS.filter((l) => l.id !== 'ridge' && l.id !== 'near') : LAYERS;
      plan = [{ node: layerNode(-1150, 'g-word'), word: true }];
      use.forEach((l) => {
        plan.push({ node: layerNode(l.z, 'g-' + l.id), l });
        if (l.id === 'far' && !phone) plan.push({ node: layerNode(l.z + 60, 'g-fog a'), fog: [.05, .62, .8] });
        if (l.id === 'distant') plan.push({ node: layerNode(l.z + 50, 'g-rays'), rays: true });
        if (l.id === 'hero') plan.push({ node: layerNode(l.z + 70, 'g-fog b'), fog: [.08, .5, .75] });
      });
    }

    function paint() {
      built.beacons = [];
      look = looks(cfg.time, cfg.palette);
      look.wordColor = cfg.time === 'night' ? '#c9a58a' : mix(cfg.palette.line, cfg.palette.sky[1], .25);
      look.dustColor = cfg.time === 'night' ? '#e9a56a' : '#fff6e0'; look.birdColor = cfg.time === 'night' ? '#000000' : cfg.palette.ink; look.rainColor = '#b9c4cf';
      plan.forEach((s, i) => {
        s.node.el.querySelectorAll('.g-beacon').forEach((b) => b.remove());
        if (s.word) wordSheet(s.node);
        else if (s.l) paintLayer(s.node, s.l);
        else if (s.rays) raysSheet(s.node);
        else fogSheet(s.node, 40 + i, s.fog, look.fog, s.fog[2] * cfg.haze * (cfg.time === 'night' ? .5 : 1));
      });
      const r = seeded(77), c = { phone: innerWidth < 760, count: (n) => Math.round(n * (innerWidth < 760 ? .5 : 1)) };
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
        const depth = Math.max(0, (n.z + 900) / 1050); // 0 far, 1 near
        // The word rises with the city, so the skyline keeps it clipped and it's never seen in full.
        const rise = n.el.classList.contains('g-word') ? .5 : .12 + depth * .62;
        const lift = s * rise * (reduced ? .4 : 1), side = reduced ? 0 : swayNow * depth * 46 * k;
        let drift = 0;
        if (!reduced && n.el.classList.contains('g-fog')) drift = Math.sin(t * .05 + n.z) * 34;
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
      set(next) { const before = { ...cfg }; Object.assign(cfg, next); const repaint = ['time', 'palette', 'haze', 'density', 'reach', 'landmarks', 'word', 'wordStrength'].some((k) => next[k] !== undefined && next[k] !== before[k]); if (repaint) paint(); else apply(); },
      look: () => look,
      nudge(px, py) { cam.tx = px; cam.ty = py; cam.x = px; cam.y = py; },
      syncScroll() { cam.sc = cfg.scrollY(); apply(); },
      sway: () => swayAt,
    };
  }
  return { mount, LANDMARKS, EFFECTS, LAYERS, looks };
})();
