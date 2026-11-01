import { alpha, mix, type Random } from "./color";

export type Ctx = CanvasRenderingContext2D;

/** The colors and detail a layer draws with. */
export type Style = {
  body: string; side: string; hazeTone: string; sun: string; ribC: string; pane: string; slot: string; ledge: string;
  grime: string; stain: string; win: string; win2: string; crown: string; signStone: string; signShadow: string;
  lit: number; crownA: number; lancet: number; rim: number;
  cell: number; rib: number; sunX: number; wear?: number;
};

type Cap = "spire" | "pinnacles" | "tank" | "pyramid" | "crenel" | "mansard" | "needle" | "parapet" | "helipad" | "dome";
type Spec = { steps: readonly (readonly [number, number])[]; cap: Cap; capH: number };

/* One building: a stack of setbacks with a cap, as fractions of its width and height. "Up" is +y, because the city hangs from the top. */
const KINDS = {
  deco: { steps: [[1, 0.5], [0.8, 0.2], [0.6, 0.1], [0.4, 0.06]], cap: "spire", capH: 0.14 },
  gothic: { steps: [[1, 0.62], [0.74, 0.14]], cap: "pinnacles", capH: 0.24 },
  slab: { steps: [[1, 0.96]], cap: "tank", capH: 0.04 },
  pyramid: { steps: [[1, 0.78]], cap: "pyramid", capH: 0.22 },
  ziggurat: { steps: [[1, 0.46], [0.86, 0.16], [0.72, 0.12], [0.58, 0.1], [0.44, 0.08]], cap: "crenel", capH: 0.03 },
  mansard: { steps: [[1, 0.78], [0.88, 0.05]], cap: "mansard", capH: 0.17 },
  needle: { steps: [[1, 0.56], [0.68, 0.17], [0.42, 0.1]], cap: "needle", capH: 0.17 },
  flat: { steps: [[1, 0.985]], cap: "parapet", capH: 0.015 },
  stepped: { steps: [[1, 0.58], [0.74, 0.28], [0.46, 0.13]], cap: "parapet", capH: 0.01 },
  helipad: { steps: [[1, 0.92], [0.62, 0.05]], cap: "helipad", capH: 0.03 },
  dome: { steps: [[1, 0.78], [0.8, 0.08]], cap: "dome", capH: 0.14 },
  clock: { steps: [[0.62, 0.74], [1, 0.12], [0.62, 0.03]], cap: "pyramid", capH: 0.11 },
} satisfies Record<string, Spec>;
export type Kind = keyof typeof KINDS;

/** How often each type appears: mostly flat and stepped roofs, so spires stand out when they do appear. */
const SKYLINE_MIX: Record<Kind, number> = { flat: 6, stepped: 5, slab: 3, helipad: 3, dome: 2, clock: 1, mansard: 3, ziggurat: 2, deco: 3, gothic: 2, pyramid: 2, needle: 1 };
export const MIX_BAG = (Object.entries(SKYLINE_MIX) as [Kind, number][]).flatMap(([k, n]) => Array<Kind>(n).fill(k));

export function tri(x: Ctx, a: number, b: number, c: number, d: number, e: number, f: number) {
  x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.lineTo(e, f); x.closePath(); x.fill();
}

/** A wall: flat color, a shadow side, piers, floors and windows. All the richness is here. */
export function wall(x: Ctx, r: Random, st: Style, cx: number, startY: number, w: number, height: number, litBoost = 1) {
  // The city continues above the screen, so the camera never finds its edge.
  const y0 = startY <= 0 ? -130 : startY, h = startY <= 0 ? height + 130 + startY : height;
  const left = cx - w / 2, shade = Math.min(w * 0.3, 26), sunSide = st.sunX > cx;
  x.fillStyle = st.body; x.fillRect(left, y0, w, h);
  x.fillStyle = st.side; x.fillRect(sunSide ? left : left + w - shade, y0, shade, h);
  const sunStripe = Math.max(1, w * 0.05);
  x.fillStyle = st.sun; x.fillRect(sunSide ? left + w - sunStripe : left, y0, sunStripe, h);
  if (st.rib) {
    const bays = Math.max(2, Math.round(w / Math.max(7, st.cell * 2.2)));
    x.fillStyle = st.ribC;
    for (let i = 1; i < bays; i++) x.fillRect(left + (i / bays) * w, y0, Math.max(0.6, w > 60 ? 1.1 : 0.7), h);
  }
  if (st.cell) {
    const cw = st.cell, ch = st.cell * 1.7, cols = Math.max(1, Math.floor((w - 4) / (cw * 1.5))), rows = Math.floor(h / (ch * 1.25)), gap = (w - 4) / cols;
    for (let j = 0; j < rows; j++) {
      const fy = y0 + 3 + j * ch * 1.25;
      if (j % 7 === 6) { x.fillStyle = st.ribC; x.fillRect(left, fy, w, Math.max(1, cw * 0.3)); continue; }
      for (let i = 0; i < cols; i++) {
        const v = r(), px = left + 2 + i * gap + (gap - cw * 0.7) / 2;
        if (v < st.lit * litBoost) { x.fillStyle = r() < 0.82 ? st.win : st.win2; x.globalAlpha = 0.55 + r() * 0.45; }
        else { x.fillStyle = st.pane; x.globalAlpha = 0.55; }
        x.fillRect(px, fy, cw * 0.7, ch);
        x.globalAlpha = 1;
      }
    }
  }
  // Weather: stains run from each ledge towards the ground, which is up the screen here. Gotham isn't a clean city.
  if (st.cell > 1) {
    const streaks = Math.min(st.wear ? 60 : 26, Math.round((w * h) / 5200 * (st.wear ?? 1)));
    for (let i = 0; i < streaks; i++) {
      const sx = left + r() * w, top = y0 + r() * h, len = Math.min(top - y0, 22 + r() * 110), sw = 0.8 + r() * 2.6;
      const g = x.createLinearGradient(0, top, 0, top - len);
      g.addColorStop(0, alpha(r() < 0.75 ? st.grime : st.stain, 0.1 + r() * 0.24)); g.addColorStop(1, alpha(st.grime, 0));
      x.fillStyle = g; x.fillRect(sx, top - len, sw, len);
    }
  }
  // A bright ledge where each setback meets the next, which is what makes the steps read.
  x.fillStyle = st.ledge; x.fillRect(left - 1, y0 + h - Math.max(1, w * 0.012), w + 2, Math.max(1, w * 0.012));
}

export function capOf(x: Ctx, st: Style, kind: Cap, cx: number, y0: number, w: number, h: number) {
  x.fillStyle = st.body;
  const shadowSide = st.sunX > cx ? cx - w / 2 : cx + w / 2;
  switch (kind) {
    case "parapet":
      x.fillRect(cx - w / 2 - 1, y0 - 1, w + 2, Math.max(1.5, h));
      if (w > 40) x.fillRect(cx + w * 0.2, y0, w * 0.12, Math.max(4, w * 0.1));
      break;
    case "helipad": {
      const pw = w * 1.7, t = Math.max(1.5, h * 0.5);
      x.fillRect(cx - w * 0.16, y0 - 1, w * 0.32, h); x.fillRect(cx - pw / 2, y0 + h - 1, pw, t);
      x.fillStyle = st.ledge; x.fillRect(cx - pw / 2, y0 + h + t - 2, pw, 1);
      x.fillStyle = st.body; x.fillRect(cx + pw * 0.42, y0 + h, 1, Math.max(5, pw * 0.16));
      break;
    }
    case "dome":
      x.beginPath(); x.ellipse(cx, y0, w * 0.5, h, 0, 0, Math.PI); x.fill();
      x.fillRect(cx - 0.7, y0 + h - 1, 1.4, Math.max(4, h * 0.35));
      break;
    case "spire":
      tri(x, cx - w / 2, y0, cx + w / 2, y0, cx, y0 + h);
      x.fillStyle = st.side; tri(x, shadowSide, y0, cx, y0, cx, y0 + h);
      break;
    case "needle":
      tri(x, cx - w * 0.3, y0, cx + w * 0.3, y0, cx, y0 + h);
      break;
    case "pyramid":
      tri(x, cx - w / 2, y0, cx + w / 2, y0, cx, y0 + h);
      x.fillStyle = st.side; tri(x, shadowSide, y0, cx, y0, cx, y0 + h);
      x.fillStyle = st.body; x.fillRect(cx - 0.8, y0 + h - 1, 1.6, h * 0.35);
      break;
    case "pinnacles": {
      const pw = w * 0.2;
      tri(x, cx - w * 0.32, y0, cx + w * 0.32, y0, cx, y0 + h);
      for (const p of [-0.5, 0.5]) tri(x, cx + p * w - pw / 2, y0, cx + p * w + pw / 2, y0, cx + p * w, y0 + h * 0.62);
      break;
    }
    case "crenel": {
      const n = Math.max(3, Math.round(w / 14)), bw = w / (n * 2 - 1);
      for (let i = 0; i < n; i++) x.fillRect(cx - w / 2 + i * 2 * bw, y0 - 1, bw, h + 1);
      break;
    }
    case "mansard":
      x.beginPath(); x.moveTo(cx - w / 2, y0); x.lineTo(cx + w / 2, y0); x.lineTo(cx + w * 0.34, y0 + h); x.lineTo(cx - w * 0.34, y0 + h); x.closePath(); x.fill();
      x.fillRect(cx - 0.8, y0 + h - 1, 1.6, h * 0.5);
      break;
    case "tank": {
      const tw = Math.min(w * 0.3, 22), tx = cx + w * 0.18;
      x.fillRect(tx - tw / 2, y0 + h * 0.4, tw, tw * 0.9);
      tri(x, tx - tw * 0.62, y0 + h * 0.4 + tw * 0.9, tx + tw * 0.62, y0 + h * 0.4 + tw * 0.9, tx, y0 + h * 0.4 + tw * 1.45);
      x.fillRect(tx - tw * 0.4, y0 - 1, 1.5, h * 0.4 + 2); x.fillRect(tx + tw * 0.4, y0 - 1, 1.5, h * 0.4 + 2);
      break;
    }
  }
}

/** Small pointed finials on the corners of a setback, which is most of what makes a skyline read as gothic. */
function finials(x: Ctx, st: Style, cx: number, y: number, w: number, h: number) {
  x.fillStyle = st.body;
  for (const s of [-1, 1]) tri(x, cx + (s * w) / 2 - s * h * 0.3, y - 1, cx + (s * w) / 2, y - 1, cx + (s * w) / 2 - s * h * 0.05, y + h);
}

export type Building = { x: number; w: number; h: number; kind: Kind; mast?: number };

export function building(x: Ctx, r: Random, base: Style, b: Building) {
  // Each building catches the haze a little differently, so a row of them never looks like one flat color.
  const t = (r() - 0.5) * 0.22, tone = t > 0 ? base.side : base.hazeTone;
  const st = { ...base, body: mix(base.body, tone, Math.abs(t)) };
  const spec: Spec = KINDS[b.kind];
  let y = 0;
  spec.steps.forEach(([wf, hf], i) => {
    wall(x, r, st, b.x, y, b.w * wf, b.h * hf, i ? 1.15 : 1);
    y += b.h * hf;
    if (b.w > 26 && i < spec.steps.length - 1) finials(x, st, b.x, y, b.w * wf, Math.min(b.h * 0.05, b.w * 0.34));
  });
  const last = (spec.steps[spec.steps.length - 1] as readonly [number, number])[0];
  capOf(x, st, spec.cap, b.x, y, b.w * last, b.h * spec.capH);
  if (b.mast) { x.fillStyle = st.body; x.fillRect(b.x - 0.6, b.h - 2, 1.2, b.mast); }
}
