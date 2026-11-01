import { building, capOf, tri, wall, type Ctx, type Style } from "./buildings";
import { alpha, mix, type Random } from "./color";

export type LayerId = "ridge" | "far" | "distant" | "hero" | "mid" | "near";

export type LandmarkContext = {
  W: number; H: number; reach: number;
  /** The label font's family, for anything lettered into the art. */
  font: string;
  /** A small blinking aircraft light at this point. */
  beacon(x: number, y: number): void;
};

/** A landmark is a plugin: which layer it's on and how it draws itself. Easter eggs slot in here. */
export type Landmark = {
  layer: LayerId;
  /** Ground it holds in its own layer, as [left, right, how much other buildings shrink to]. */
  reserve?(c: LandmarkContext): [number, number, number];
  /** Keeps a sightline in other layers: nothing in front, and nothing behind taller than `far`. */
  clearance?(c: LandmarkContext): { a: number; b: number; far: number };
  draw(x: Ctx, r: Random, st: Style, c: LandmarkContext): void;
  /** Runs after the haze, for lit parts that should stay crisp. */
  after?(x: Ctx, r: Random, st: Style, c: LandmarkContext): void;
};

/* The name and a W mark in weathered stone, fixed to the facade: part of the building, not a sign on it. */
function wayneSign(x: Ctx, r: Random, st: Style, cx: number, cy: number, w: number, H: number, family: string) {
  const D = 2, fs = Math.min(w * 0.19, H * 0.034), cw = Math.ceil(w), ch = Math.ceil(fs * 3.2);
  const off = document.createElement("canvas"); off.width = cw * D; off.height = ch * D;
  const o = off.getContext("2d") as Ctx; o.scale(D, D); o.translate(cw / 2, ch / 2);
  const stamp = (color: string, dx: number, dy: number) => {
    o.fillStyle = color; o.save(); o.translate(dx, dy);
    o.font = `700 ${fs}px ${family}`; o.textAlign = "center"; o.textBaseline = "middle";
    o.letterSpacing = `${(fs * 0.2).toFixed(1)}px`;
    o.save(); o.translate(0, -fs * 0.62); o.scale(1.22, 1); o.fillText("WAYNE", 0, 0); o.restore();
    // The mark: a blocky W between two thin rules. An original shape, not a film logo.
    const m = fs * 0.82, y = fs * 0.72;
    o.beginPath();
    ([[-0.72, -0.5], [-0.34, -0.5], [-0.34, -0.36], [-0.48, -0.36], [-0.34, 0.2], [-0.12, -0.5], [0.12, -0.5], [0.34, 0.2], [0.48, -0.36], [0.34, -0.36], [0.34, -0.5], [0.72, -0.5], [0.72, -0.36], [0.62, -0.36], [0.42, 0.5], [0.24, 0.5], [0, -0.2], [-0.24, 0.5], [-0.42, 0.5], [-0.62, -0.36], [-0.72, -0.36]] as const)
      .forEach(([a, b], i) => (i ? o.lineTo(a * m, y + b * m) : o.moveTo(a * m, y + b * m)));
    o.closePath(); o.fill();
    o.fillRect(-w * 0.42, y - 0.75, w * 0.42 - m * 0.85, 1.5); o.fillRect(m * 0.85, y - 0.75, w * 0.42 - m * 0.85, 1.5);
    o.restore();
  };
  stamp(st.signShadow, 1.1, 1.1); // the letters stand proud of the wall
  stamp(st.signStone, 0, 0);
  // Wear: chips and missing edges.
  o.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 170; i++) { o.globalAlpha = 0.3 + r() * 0.7; o.beginPath(); o.arc((r() - 0.5) * cw, (r() - 0.5) * ch, 0.25 + r() * r() * 1.9, 0, 7); o.fill(); }
  o.globalAlpha = 0.8;
  for (let i = 0; i < 9; i++) o.fillRect((r() - 0.5) * cw, (r() - 0.5) * ch, 1 + r() * 9, 0.6 + r() * 0.6);
  // Sun and rain have eaten more of the letters at the ends, as they would on a real facade.
  const fade = o.createLinearGradient(-cw * 0.45, 0, cw * 0.45, 0);
  fade.addColorStop(0, "rgba(0,0,0,.34)"); fade.addColorStop(0.55, "rgba(0,0,0,.08)"); fade.addColorStop(1, "rgba(0,0,0,.22)");
  o.globalAlpha = 1; o.fillStyle = fade; o.fillRect(-cw / 2, -ch / 2, cw, ch);
  o.globalCompositeOperation = "source-over";

  // A paler patch where the lettering has protected the stone, and rust running from its fixings towards the ground.
  x.fillStyle = alpha(st.signStone, 0.05); x.fillRect(cx - cw * 0.47, cy - ch * 0.5, cw * 0.94, ch);
  for (let i = 0; i < 26; i++) {
    const sx = cx - cw * 0.4 + r() * cw * 0.8, top = cy + ch * (0.1 + r() * 0.3), len = 16 + r() * 48, g = x.createLinearGradient(0, top, 0, top - len);
    g.addColorStop(0, alpha(st.stain, 0.55)); g.addColorStop(1, alpha(st.stain, 0));
    x.fillStyle = g; x.fillRect(sx, top - len, 0.8 + r() * 1.3, len);
  }
  // Upside down with the city: a half turn, not a mirror, so it reads correctly when you turn your head.
  x.save(); x.translate(cx, cy); x.rotate(Math.PI); x.globalAlpha = 0.9; x.drawImage(off, -cw / 2, -ch / 2, cw, ch); x.restore();
}

/* On a narrow screen the tower keeps its proportions rather than shrinking with the width. */
const wayneSize = (c: LandmarkContext) => {
  const H = c.H * 0.92 * c.reach;
  return { H, cx: c.W * (c.W < 760 ? 0.62 : 0.655), W: Math.min(Math.max(c.W * 0.145, Math.min(c.W * 0.3, H * 0.19)), H * 0.21) };
};
const crown = (H: number, W: number) => ({ top: H * 0.17 + H * 0.6, sh: H * 0.2, cw: W * 0.48 });

export const LANDMARKS = {
  /* Wayne Tower: a broad podium, a ribbed shaft stepping in, and a crown of two tall spires, like a cowl's ears.
     Flanked by a slim pyramid and a blunt ziggurat. */
  wayne: {
    layer: "hero",
    reserve(c) { const { cx, W } = wayneSize(c); return [cx - W * 0.7, cx + W * 0.7, 1]; },
    clearance(c) { const { cx, W } = wayneSize(c); return { a: cx - W * 1.5, b: cx + W * 1.7, far: 0.5 }; },
    draw(x, r, base, c) {
      const { H, cx, W } = wayneSize(c), st: Style = { ...base, wear: 3.4, body: mix(base.body, base.slot, 0.45), side: mix(base.side, base.slot, 0.55) };
      // Companions first, so the tower stands in front of them.
      building(x, r, st, { x: cx - W * 0.98, w: W * 0.44, h: H * 0.62, kind: "pyramid" });
      building(x, r, st, { x: cx + W * 1.08, w: W * 0.72, h: H * 0.58, kind: "ziggurat" });
      // Podium and low wings with battlements.
      wall(x, r, st, cx, 0, W * 1.56, H * 0.17);
      capOf(x, st, "crenel", cx - W * 0.6, H * 0.17, W * 0.36, H * 0.012);
      capOf(x, st, "crenel", cx + W * 0.6, H * 0.17, W * 0.36, H * 0.012);
      let y = H * 0.17;
      const shaftStart = y;
      ([[1, 0.2], [0.84, 0.24], [0.64, 0.1], [0.48, 0.06]] as const).forEach(([wf, hf], i) => {
        const w = W * wf, h = H * hf;
        wall(x, r, st, cx, y, w, h, i ? 1.3 : 1);
        y += h;
        // Buttress fins and small gargoyles at each setback.
        x.fillStyle = st.body;
        for (const s of [-1, 1]) {
          tri(x, cx + s * w * 0.5, y - h * 0.6, cx + s * w * 0.5, y, cx + s * (w * 0.5 + W * 0.045), y - h * 0.02);
          if (i < 3) tri(x, cx + s * w * 0.5, y, cx + s * w * 0.32, y, cx + s * w * 0.47, y + H * 0.028);
        }
      });
      // Long lancet windows run up the shaft: the tower's vertical drama.
      for (const u of [-0.2, -0.07, 0.07, 0.2]) {
        const g = x.createLinearGradient(0, shaftStart, 0, y);
        g.addColorStop(0, alpha(st.crown, 0)); g.addColorStop(1, alpha(st.crown, st.lancet));
        x.fillStyle = g; x.fillRect(cx + u * W - 0.75, y - (y - shaftStart) * 0.5, 1.5, (y - shaftStart) * 0.5 - H * 0.02);
      }
      // The crown: a lit core, two tall horns, and a low gable between them.
      const { top, sh, cw } = crown(H, W);
      x.fillStyle = st.body;
      x.fillRect(cx - cw / 2, top, cw, sh * 0.3);
      tri(x, cx - cw * 0.5, top + sh * 0.3 - 1, cx - cw * 0.14, top + sh * 0.3 - 1, cx - cw * 0.4, top + sh);
      tri(x, cx + cw * 0.5, top + sh * 0.3 - 1, cx + cw * 0.14, top + sh * 0.3 - 1, cx + cw * 0.4, top + sh);
      tri(x, cx - cw * 0.2, top + sh * 0.3 - 1, cx + cw * 0.2, top + sh * 0.3 - 1, cx, top + sh * 0.5);
      x.fillStyle = st.side;
      const away = st.sunX > cx ? -1 : 1;
      tri(x, cx + away * cw * 0.5, top + sh * 0.3 - 1, cx + away * cw * 0.32, top + sh * 0.3 - 1, cx + away * cw * 0.4, top + sh);
      c.beacon(cx - cw * 0.4, top + sh); c.beacon(cx + cw * 0.4, top + sh);
    },
    after(x, r, st, c) {
      const { H, cx, W } = wayneSize(c), { top, sh, cw } = crown(H, W);
      const bloom = x.createRadialGradient(cx, top + sh * 0.14, 0, cx, top + sh * 0.14, cw * 1.5);
      bloom.addColorStop(0, alpha(st.crown, st.crownA * 0.34)); bloom.addColorStop(1, alpha(st.crown, 0));
      x.fillStyle = bloom; x.beginPath(); x.arc(cx, top + sh * 0.14, cw * 1.5, 0, 7); x.fill();
      // Light catches the edges of the horns, so the crown holds its shape against any sky.
      x.strokeStyle = alpha(st.crown, st.rim); x.lineWidth = 1; x.beginPath();
      for (const s of [-1, 1]) { x.moveTo(cx + s * cw * 0.5, top + sh * 0.3); x.lineTo(cx + s * cw * 0.4, top + sh); x.lineTo(cx + s * cw * 0.14, top + sh * 0.3); }
      x.moveTo(cx - cw * 0.2, top + sh * 0.3); x.lineTo(cx, top + sh * 0.5); x.lineTo(cx + cw * 0.2, top + sh * 0.3); x.stroke();
      for (const u of [-0.26, 0, 0.26]) {
        const g = x.createLinearGradient(0, top, 0, top + sh * 0.3);
        g.addColorStop(0, alpha(st.crown, 0.2)); g.addColorStop(1, alpha(st.crown, st.crownA));
        x.fillStyle = g;
        x.beginPath(); x.moveTo(cx + u * cw - cw * 0.05, top + sh * 0.02); x.lineTo(cx + u * cw + cw * 0.05, top + sh * 0.02); x.lineTo(cx + u * cw + cw * 0.05, top + sh * 0.22); x.lineTo(cx + u * cw, top + sh * 0.29); x.lineTo(cx + u * cw - cw * 0.05, top + sh * 0.22); x.closePath(); x.fill();
      }
      wayneSign(x, r, st, cx, H * 0.535, W * 0.74, H, c.font);
    },
  },
  /* A few hand-placed buildings in front of Wayne Tower, for depth. They stay low, so the shaft and the name stay clear.
     Wide screens only: on a phone the tower has the screen to itself. */
  wayneFrontMid: {
    layer: "mid",
    draw(x, r, st, c) {
      if (c.W < 760) return;
      const { H, cx, W } = wayneSize(c);
      building(x, r, st, { x: cx - W * 0.78, w: W * 0.42, h: H * 0.27, kind: "deco" });
      building(x, r, st, { x: cx + W * 0.36, w: W * 0.5, h: H * 0.2, kind: "stepped" });
    },
  },
  wayneFrontNear: {
    layer: "near",
    draw(x, r, st, c) {
      if (c.W < 760) return;
      const { H, cx, W } = wayneSize(c);
      building(x, r, st, { x: cx - W * 0.12, w: W * 0.62, h: H * 0.13, kind: "mansard" });
    },
  },
  /* A suspension bridge, hanging the other way up: towers reach down, the deck runs across, the cables swing between. */
  bridge: {
    layer: "distant",
    reserve(c) { const { a, b, span } = bridgeAt(c); return [a - span * 0.05, b + span * 0.05, 0.5]; },
    draw(x, _r, st, c) {
      const { cx, span, a, b } = bridgeAt(c), th = c.H * 0.64 * c.reach, deck = th * 0.5;
      const tower = (tx: number) => {
        x.fillStyle = st.body;
        for (const s of [-1, 1]) x.fillRect(tx + s * span * 0.03 - 2.5, 0, 5, th);
        x.strokeStyle = st.body; x.lineWidth = 1.6; x.beginPath();
        for (let y = deck * 0.25; y < th - 20; y += th * 0.15) { x.moveTo(tx - span * 0.03, y); x.lineTo(tx + span * 0.03, y + th * 0.15); x.moveTo(tx + span * 0.03, y); x.lineTo(tx - span * 0.03, y + th * 0.15); }
        x.stroke();
        tri(x, tx - span * 0.04, th, tx + span * 0.04, th, tx, th + th * 0.1);
      };
      const crest = deck * 1.02 - (th - deck) * 0.96;
      x.fillStyle = st.body; x.fillRect(a - span * 0.32, deck, span * 1.64, 5);
      x.strokeStyle = alpha(st.body, 0.9); x.lineWidth = 1.1;
      x.beginPath(); x.moveTo(a, th); x.quadraticCurveTo(cx, crest, b, th); x.stroke();
      x.beginPath(); x.moveTo(a, th); x.lineTo(a - span * 0.32, deck); x.moveTo(b, th); x.lineTo(b + span * 0.32, deck); x.stroke();
      x.lineWidth = 0.6; x.beginPath();
      for (let i = 1; i < 26; i++) { const u = i / 26; x.moveTo(a + span * u, deck + 3); x.lineTo(a + span * u, th + (crest - th) * 2 * u * (1 - u)); }
      x.stroke();
      tower(a); tower(b);
    },
  },
  /* A crane on an unfinished tower: Gotham is always half-built. */
  crane: {
    layer: "mid",
    draw(x, r, st, c) {
      const cx = c.W * 0.86, h = c.H * 0.34 * c.reach, w = c.W * 0.07;
      wall(x, r, st, cx, 0, w, h * 0.78);
      x.strokeStyle = st.body; x.lineWidth = 1; x.beginPath();
      for (let y = h * 0.78; y < h; y += 12) { x.moveTo(cx - w / 2, y); x.lineTo(cx + w / 2, y); }
      for (const u of [-0.5, -0.17, 0.17, 0.5]) { x.moveTo(cx + u * w, h * 0.78); x.lineTo(cx + u * w, h); }
      const mx = cx + w * 0.1, my = h + c.H * 0.14;
      x.moveTo(mx, h * 0.78); x.lineTo(mx, my); x.moveTo(mx + 5, h * 0.78); x.lineTo(mx + 5, my);
      for (let y = h * 0.78; y < my; y += 9) { x.moveTo(mx, y); x.lineTo(mx + 5, y + 9); }
      x.moveTo(mx - c.W * 0.08, my); x.lineTo(mx + c.W * 0.035, my); x.moveTo(mx - c.W * 0.08, my - 5); x.lineTo(mx + c.W * 0.035, my - 5);
      x.moveTo(mx - c.W * 0.07, my); x.lineTo(mx - c.W * 0.07, my - 26);
      x.stroke();
      c.beacon(mx + 2, my);
    },
  },
} satisfies Record<string, Landmark>;

function bridgeAt(c: LandmarkContext) {
  const cx = c.W * (c.W < 760 ? 0.12 : 0.25), span = Math.max(c.W * 0.3, 250);
  return { cx, span, a: cx - span / 2, b: cx + span / 2 };
}
