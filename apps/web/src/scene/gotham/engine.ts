/* Inverted Gotham, daytime. The mood is The Batman (2022), and every building is drawn here: nothing is traced or copied.
   Depth comes from layers moving at the speeds true perspective would give them, and atmosphere from color. To add something, add an entry to LANDMARKS or EFFECTS.
   Night lives in prototypes/15-gotham-skyline until dark mode gets its own production pass. */
import { SCENE_OPTIONS } from "@portfolio/content/scene-options";
import type { Palette } from "@portfolio/design/palettes";
import { building, MIX_BAG, type Ctx, type Style } from "./buildings";
import { alpha, hex, mix, seeded } from "./color";
import { EFFECTS, type Effect, type EffectFrame } from "./effects";
import { LANDMARKS, type Landmark, type LandmarkContext, type LayerId } from "./landmarks";

type Option<K extends keyof typeof SCENE_OPTIONS> = (typeof SCENE_OPTIONS)[K][number];

/** What each setting's name means in numbers. Adding an option without a value here is a type error. */
export const SCENE_VALUES = {
  depth: { off: 0, low: 0.5, full: 1, big: 1.7 } satisfies Record<Option<"depth">, number>,
  sway: { off: 0, low: 0.5, full: 1, big: 1.6 } satisfies Record<Option<"sway">, number>,
  haze: { low: 0.55, full: 1, thick: 1.5 } satisfies Record<Option<"haze">, number>,
  dust: { off: 0, low: 0.5, full: 1, big: 1.7 } satisfies Record<Option<"dust">, number>,
  density: { sparse: 0.8, normal: 1, dense: 1.3 } satisfies Record<Option<"density">, number>,
  reach: { short: 0.8, mid: 1, tall: 1.15 } satisfies Record<Option<"reach">, number>,
  word: { off: 0, faint: 1, soft: 1.6 } satisfies Record<Option<"word">, number>,
};
export type SceneSettings = { [K in keyof typeof SCENE_VALUES]: number };

/* Layers, far to near. z is real depth in px, and ink is how far a color has come out of the haze. */
type Layer = { id: LayerId; z: number; ink: number; cell: number; rib: number; min: number; max: number; lo: number; hi: number; seed: number; edges?: boolean };
export const LAYERS: readonly Layer[] = [
  { id: "ridge", z: -900, ink: 0.14, cell: 0, rib: 0, min: 12, max: 58, lo: 0.26, hi: 0.62, seed: 3 },
  { id: "far", z: -620, ink: 0.26, cell: 0, rib: 0.5, min: 16, max: 70, lo: 0.24, hi: 0.64, seed: 11 },
  { id: "distant", z: -380, ink: 0.42, cell: 2, rib: 0.7, min: 22, max: 78, lo: 0.22, hi: 0.58, seed: 23 },
  { id: "hero", z: -190, ink: 0.54, cell: 3, rib: 1, min: 32, max: 84, lo: 0.22, hi: 0.48, seed: 37 },
  { id: "mid", z: -40, ink: 0.66, cell: 4, rib: 1, min: 40, max: 92, lo: 0.15, hi: 0.34, seed: 41 },
  { id: "near", z: 150, ink: 0.8, cell: 5, rib: 1, min: 70, max: 150, lo: 0.1, hi: 0.2, seed: 59, edges: true },
];
const ACTIVE: Landmark[] = Object.values(LANDMARKS);
const PERSPECTIVE = 1500, ABOVE = 120, SUN_X = 0.84, PHONE = 760, WORD = "GOTHAM";

/** The colors a layer draws with, worked out from the active daylight theme. */
function styleFor(p: Palette, l: Layer, W: number): Style {
  const [, s1, s2, s3] = p.sky, warm = hex((p.glow.match(/\d+/g) as string[]).slice(0, 3).map(Number));
  const dark = mix(p.ink, s3, 0.1), body = mix(mix(s2, s3, 0.4), dark, l.ink);
  return {
    body, side: mix(body, dark, 0.34), hazeTone: mix(body, s1, 0.5), sun: mix(body, warm, 0.5 * Math.min(1, l.ink * 1.3)),
    ribC: mix(body, dark, 0.24), pane: mix(body, dark, 0.34), slot: mix(body, "#000000", 0.42), ledge: mix(body, warm, 0.34),
    grime: dark, stain: mix(warm, dark, 0.55), win: mix(warm, "#ffffff", 0.25), win2: "#f4efe4", crown: mix(warm, p.accent, 0.25),
    signStone: mix(s1, warm, 0.4), signShadow: mix(dark, "#000000", 0.5),
    lit: 0.002 + l.ink * 0.006, crownA: 0.9, lancet: 0.22, rim: 0.22,
    cell: W < 700 ? l.cell * 0.7 : l.cell, rib: l.rib, sunX: W * SUN_X,
  };
}

type Node = { el: HTMLDivElement; canvas: HTMLCanvasElement; z: number; fog: boolean; paint: (n: Node) => void; placed?: string; off?: boolean };

/** The scroll the city follows: the page's, minus any stretch a pinned section holds still (`data-hold-start` and `data-hold-length`, in px of scroll). */
function cityScroll(scroller: HTMLElement) {
  const s = scroller.scrollTop;
  let held = 0;
  for (const el of scroller.querySelectorAll<HTMLElement>("[data-hold-length]")) {
    const start = Number(el.dataset.holdStart), length = Number(el.dataset.holdLength);
    held += Math.min(length, Math.max(0, s - start));
  }
  return s - held;
}

export function mountGotham(host: HTMLElement, scroller: HTMLElement, read: () => { palette: Palette; font: string; settings: SceneSettings }) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches; // On a phone the layers move only with the scroll, and the dust and bats draw at 30 frames a second.
  const stage = document.createElement("div"); stage.className = "g-stage"; host.append(stage);
  const live = document.createElement("canvas"); live.className = "g-live"; host.append(live);
  const liveX = live.getContext("2d") as Ctx;
  let { palette, font, settings } = read();
  let nodes: Node[] = [], W = 0, H = 0, overscan = 0, D = 1, liveD = 1;
  let effects: ReturnType<Effect>[] = [], shownFade = "";
  const cam = { x: 0, y: 0, tx: 0, ty: 0, scroll: 0 };

  function fit(n: Node) {
    const w = W + overscan * 2, h = H + ABOVE, c = n.canvas;
    c.width = w * D; c.height = h * D;
    Object.assign(c.style, { width: `${w}px`, height: `${h}px`, left: `${-overscan}px`, top: `${-ABOVE}px` });
    const x = c.getContext("2d") as Ctx;
    x.setTransform(D, 0, 0, D, overscan * D, ABOVE * D); x.clearRect(-overscan, -ABOVE, w, h);
    return x;
  }

  function paintLayer(n: Node, l: Layer) {
    const x = fit(n), r = seeded(l.seed), st = styleFor(palette, l, W);
    n.el.querySelectorAll(".g-beacon").forEach((b) => b.remove());
    const c: LandmarkContext = {
      W, H, reach: settings.reach, font,
      beacon(bx, by) {
        const i = document.createElement("i"); i.className = "g-beacon";
        Object.assign(i.style, { left: `${bx + overscan}px`, top: `${by}px`, animationDelay: `${(bx % 37) / 12}s` });
        n.el.append(i);
      },
    };
    // Landmarks reserve their ground first, then the skyline is drawn around and behind them.
    const here = ACTIVE.filter((m) => m.layer === l.id), held = here.flatMap((m) => (m.reserve ? [m.reserve(c)] : []));
    const mine = LAYERS.indexOf(l);
    const sight = ACTIVE.filter((m) => m.clearance && m.layer !== l.id).map((m) => ({ ...(m.clearance as NonNullable<Landmark["clearance"]>)(c), front: mine > LAYERS.findIndex((a) => a.id === m.layer) }));
    const widthScale = W < 700 ? 1.1 : 1;
    for (let px = -overscan - 60; px < W + overscan + 60;) {
      let w = ((l.min + r() * (l.max - l.min)) * widthScale) / settings.density;
      const kind = MIX_BAG[Math.floor(r() * MIX_BAG.length)] ?? "flat";
      const u = (px + w / 2) / W, rise = 0.72 + 0.28 * Math.min(1, Math.max(0, (u - 0.1) / 0.4));
      const spread = r(), h = H * (l.lo + spread * spread * (l.hi - l.lo)) * rise * settings.reach; // squared, so most are low and a few stand tall
      if (l.edges && u > 0.2 && u < 0.8) { px += w * 0.8; continue; } // the nearest roofs only frame the shot
      // The front rows stay open, or they pile up into a heavy band under the header.
      if (l.ink > 0.5 && r() < 0.24) { px += w * (0.7 + r() * 0.9); continue; }
      if (l.ink > 0.5) w = Math.min(w, Math.max(l.min * 0.6, h * 0.4));
      const blocked = held.find(([a, b]) => px + w > a && px < b);
      const inSight = sight.find((v) => px + w > v.a && px < v.b);
      if (inSight?.front) { px += w * 0.7; continue; } // only hand-placed buildings stand in front of a landmark
      const capped = inSight ? Math.min(h, H * inSight.far * settings.reach) : h;
      const mast = r() < 0.1 && l.id !== "near" && kind !== "pyramid" ? H * 0.015 + r() * H * 0.03 : 0;
      building(x, r, st, { x: px + w / 2, w, h: capped * (blocked ? (blocked[2] === 1 ? 0.55 : 0.6) : 1), kind, mast });
      px += w * (0.72 + r() * 0.3);
    }
    here.forEach((m) => m.draw(x, seeded(l.seed + 5), st, c));

    // Atmosphere: the feet of the city dissolve into the haze, so nothing ends in a hard line under the header.
    const hazeTo = H * (W < PHONE ? (l.ink > 0.5 ? 0.3 : 0.17) : 0.26 + (1 - l.ink) * 0.14), strength = Math.min(1, 0.94 * settings.haze);
    const g = x.createLinearGradient(0, 0, 0, hazeTo), haze = palette.sky[0];
    g.addColorStop(0, alpha(haze, strength)); g.addColorStop(0.42, alpha(haze, strength * (l.ink > 0.5 ? 0.74 : 0.6))); g.addColorStop(1, alpha(haze, 0));
    x.globalCompositeOperation = "source-atop"; x.fillStyle = g; x.fillRect(-overscan, -ABOVE, W + overscan * 2, H + ABOVE);
    x.globalCompositeOperation = "source-over";
    here.forEach((m) => m.after?.(x, seeded(l.seed + 7), st, c));
  }

  function paintFog(x: Ctx, seed: number, y0: number, y1: number, amount: number) {
    const r = seeded(seed), color = palette.sky[0];
    for (let i = 0; i < 70; i++) {
      const px = -overscan + r() * (W + overscan * 2), py = H * (y0 + r() * (y1 - y0)), rad = H * (0.05 + r() * 0.14);
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, alpha(color, amount * settings.haze * (0.1 + r() * 0.22))); g.addColorStop(1, alpha(color, 0));
      x.save(); x.translate(px, py); x.scale(3.2, 1); x.translate(-px, -py); x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); x.restore();
    }
  }

  function paintRays(x: Ctx) {
    const sx = W * SUN_X, sy = -H * 0.12, r = seeded(9), ray = hex((palette.glow.match(/\d+/g) as string[]).slice(0, 3).map(Number));
    x.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.52 + r() * 0.42), len = H * (1 + r() * 0.5), spread = 0.012 + r() * 0.036;
      const g = x.createRadialGradient(sx, sy, 0, sx, sy, len);
      g.addColorStop(0, alpha(ray, 0.05 + r() * 0.05)); g.addColorStop(1, alpha(ray, 0));
      x.fillStyle = g; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a - spread) * len, sy + Math.sin(a - spread) * len); x.lineTo(sx + Math.cos(a + spread) * len, sy + Math.sin(a + spread) * len); x.closePath(); x.fill();
    }
    x.globalCompositeOperation = "source-over";
  }

  /* The city's name, huge and far behind everything, in outline. The skyline covers most of it, and only the ends of the letters show.
     Upside down with the city. Thin lines and low contrast keep it out of the way of the page. */
  function paintWord(n: Node) {
    const x = fit(n), strength = settings.word;
    if (!strength) return;
    const at = (size: number) => `700 ${size}px ${font}`;
    x.font = at(100); x.letterSpacing = "2px";
    const fs = Math.min((100 * (W * 0.98)) / x.measureText(WORD).width, H * 0.78), bottom = H * (W < PHONE ? 0.6 : 0.67), cap = fs * 0.7;
    x.save();
    x.translate(W / 2, bottom - cap / 2); x.rotate(Math.PI);
    x.font = at(fs); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "miter"; x.miterLimit = 3; x.letterSpacing = `${(fs * 0.02).toFixed(1)}px`;
    // The depth: the same outline stepped back behind itself, faintly, so the letters read as solid blocks.
    x.strokeStyle = mix(palette.line, palette.sky[1], 0.25); x.lineWidth = 0.7;
    for (let i = Math.round(Math.max(5, fs * 0.05)); i > 0; i--) { x.globalAlpha = 0.1 * strength; x.strokeText(WORD, -0.8 * i, 0.8 * i); }
    x.globalAlpha = 0.44 * strength; x.lineWidth = 1; x.strokeText(WORD, 0, 0);
    x.restore(); x.globalAlpha = 1;
  }

  function addNode(z: number, name: string, paint: Node["paint"], fog = false) {
    const el = document.createElement("div"); el.className = `g-layer g-${name}`;
    const canvas = document.createElement("canvas"); el.append(canvas); stage.append(el);
    nodes.push({ el, canvas, z, fog, paint });
  }

  function buildNodes() {
    stage.innerHTML = ""; nodes = [];
    const phone = W < PHONE;
    const fog = (x: Ctx, seed: number, y1: number, amount: number) => paintFog(x, seed, seed === 42 ? 0.05 : 0.08, y1, amount);
    const air: Partial<Record<LayerId, (x: Ctx) => void>> = {
      far: (x) => fog(x, 42, 0.62, 0.8),
      distant: paintRays,
      hero: (x) => fog(x, 47, 0.5, 0.75),
    };
    const lift: Partial<Record<LayerId, number>> = { far: 60, distant: 50, hero: 70 };
    addNode(-1150, "word", paintWord);
    for (const l of LAYERS) {
      if (phone && (l.id === "ridge" || l.id === "near")) continue;
      const over = air[l.id];
      // On a phone the air is painted into the layer behind it: three fewer full-screen layers for the GPU to stack.
      if (over && touch) { addNode(l.z, l.id, (n) => { paintLayer(n, l); over(n.canvas.getContext("2d") as Ctx); }); continue; }
      addNode(l.z, l.id, (n) => paintLayer(n, l));
      if (over) addNode(l.z + (lift[l.id] ?? 0), l.id === "distant" ? "rays" : "fog", (n) => over(fit(n)), l.id !== "distant");
    }
  }

  function paintAll() {
    nodes.forEach((n) => n.paint(n));
    const r = seeded(77), setup = { phone: W < PHONE };
    effects = Object.values(EFFECTS).map((e) => e(r, setup));
    place(performance.now() / 1000);
    drawLive(reduced ? 8 : performance.now() / 1000);
  }

  function resize() {
    W = host.clientWidth; H = host.clientHeight;
    if (!W || !H) return;
    D = Math.min(devicePixelRatio || 1, touch ? 1.25 : W < PHONE ? 1.5 : 1.75); liveD = Math.min(devicePixelRatio || 1, 1.5); overscan = Math.round(W * 0.1);
    live.width = W * liveD; live.height = H * liveD;
    buildNodes(); paintAll();
  }

  /* The camera: one spring, one clock. Perspective is worked out here rather than left to CSS 3D, which some browsers flatten.
     A layer at depth z appears at `near` times its true movement, so far layers move little and near layers move a lot. */
  function place(t: number) {
    const k = settings.depth, s = cam.scroll;
    // The city steps back as content scrolls over it, so text always wins.
    const fade = Math.max(0.38, 1 - s / (H * 0.9)).toFixed(3);
    if (fade !== shownFade) host.style.opacity = shownFade = fade;
    const sway = reduced ? 0 : Math.sin(s / 520) * settings.sway;
    const turnY = reduced ? 0 : ((cam.x * 1.9 + sway * 1.5) * k + (touch ? 0 : Math.sin(t * 0.11) * 0.1)) * (Math.PI / 180), turnX = reduced ? 0 : -cam.y * k * (Math.PI / 180);
    const dolly = reduced ? 0 : s * 0.05;
    for (const n of nodes) {
      const near = PERSPECTIVE / (PERSPECTIVE - n.z);
      const depth = Math.max(0, (n.z + 900) / 1050); // 0 far, 1 near
      // The word sits furthest back but rises with the city, so the skyline keeps it clipped and it's never seen in full.
      const rise = n.z < -900 ? 0.5 : 0.12 + depth * 0.62;
      const lift = s * rise * (reduced ? 0.4 : 1), side = sway * depth * 46 * k, drift = !reduced && n.fog ? Math.sin(t * 0.05 + n.z) * 34 : 0;
      const x = (side + drift + n.z * Math.sin(turnY)) * near, y = (-lift - n.z * Math.sin(turnX)) * near;
      const zoom = (PERSPECTIVE - n.z) / (PERSPECTIVE - n.z + dolly);
      const off = -y > H * 1.1; // Lifted clear of the screen: the GPU can forget it.
      if (off !== n.off) { n.off = off; n.el.style.visibility = off ? "hidden" : ""; }
      if (off) continue;
      const placed = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${zoom.toFixed(4)})`;
      if (placed !== n.placed) n.el.style.transform = n.placed = placed; // A layer that hasn't moved costs nothing.
    }
  }
  function drawLive(t: number) {
    liveX.setTransform(liveD, 0, 0, liveD, 0, 0); liveX.clearRect(0, 0, W, H);
    const f: EffectFrame = { W, H, t, wind: 1 + Math.sin(t * 0.07) * 0.4, scroll: cam.scroll, cam: cam.x, amount: settings.dust, palette };
    for (const draw of effects) draw(liveX, f);
  }

  let raf = 0, last = 0, drawn = 0;
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    const q = 1 - Math.exp(-dt * 2.4);
    cam.x += (cam.tx - cam.x) * q; cam.y += (cam.ty - cam.y) * q;
    cam.scroll += (cityScroll(scroller) - cam.scroll) * (1 - Math.exp(-dt * 6));
    place(now / 1000);
    if (touch && now - drawn < 28) return;
    drawn = now; drawLive(now / 1000);
  }
  const pointer = (e: PointerEvent) => { if (e.pointerType !== "touch") { cam.tx = e.clientX / innerWidth - 0.5; cam.ty = e.clientY / innerHeight - 0.5; } };
  const scrolledStill = () => { cam.scroll = cityScroll(scroller); place(0); drawLive(8); };

  let timer = 0;
  const sized = new ResizeObserver(() => { clearTimeout(timer); timer = window.setTimeout(resize, 140); });
  sized.observe(host);
  addEventListener("pointermove", pointer);
  resize();
  if (reduced) scroller.addEventListener("scroll", scrolledStill, { passive: true });
  else raf = requestAnimationFrame(frame);

  return {
    /** Re-read the settings. Only what affects the drawing repaints it. */
    update() {
      const next = read(), before = settings;
      const repaint = next.palette !== palette || next.font !== font || (["haze", "density", "reach", "word"] as const).some((k) => next.settings[k] !== before[k]);
      palette = next.palette; font = next.font; settings = next.settings;
      if (repaint) paintAll();
      else if (reduced) scrolledStill();
    },
    destroy() {
      cancelAnimationFrame(raf); clearTimeout(timer); sized.disconnect();
      removeEventListener("pointermove", pointer); scroller.removeEventListener("scroll", scrolledStill);
      stage.remove(); live.remove();
    },
  };
}
