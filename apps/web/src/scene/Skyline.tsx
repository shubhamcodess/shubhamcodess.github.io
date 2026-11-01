"use client";

/**
 * The daytime inverted skyline. Provisional: the art isn't locked, only how it meets the header.
 * Everything is read from data attributes on <html>, so config and the control panel drive it the same way.
 */
import { useEffect } from "react";
import { palettes, type Palette, type PaletteId } from "@portfolio/design/palettes";

const DENSITY = { sparse: 0.72, normal: 1, dense: 1.45 };
const REACH = { short: 0.68, mid: 1, tall: 1.28 };
const STRENGTH = { faint: 0.55, soft: 1, clear: 1.7 };
const PARALLAX = { off: 0, low: 1, high: 2 };

type Point = [number, number];
type Building = { x: number; w: number; type: number; L: number };
type Tower = Building & { grow: number; target: number; rest: number };

const PROFILE: Point[][] = [
  [[0, 0], [0, 0.72], [0.16, 0.72], [0.16, 0.88], [0.32, 0.88], [0.32, 1], [0.5, 1]],
  [[0, 0], [0, 0.58], [0.2, 0.58], [0.2, 0.76], [0.4, 0.76], [0.46, 0.86], [0.5, 1]],
  [[0, 0], [0, 0.82], [0.12, 0.82], [0.5, 1]],
  [[0, 0], [0, 0.62], [0.1, 0.62], [0.1, 0.74], [0.2, 0.74], [0.2, 0.84], [0.3, 0.84], [0.3, 0.92], [0.42, 0.92], [0.5, 1]],
  [[0, 0], [0, 0.93], [0.12, 0.93], [0.12, 1], [0.38, 1], [0.38, 0.93], [0.5, 0.93]],
];
const shape = (type: number) => PROFILE[type] as Point[];
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const seeded = (seed: number) => { let i = 0; return () => hash(seed + i++ * 1.37); };

const outline = (b: Building, L: number): Point[] => {
  const h = shape(b.type), left = h.map(([dx, y]): Point => [b.x + dx * b.w, y * L]);
  return [...left, ...[...h].reverse().map(([dx, y]): Point => [b.x + (1 - dx) * b.w, y * L])];
};

function skyline(seed: number, base: number, lo: number, hi: number, W: number, H: number): Building[] {
  // Tallest towards the right, leaving room on the left for a name.
  const q = seeded(seed), out: Building[] = [], rise = (u: number) => 0.55 + 0.45 * Math.min(1, Math.max(0, (u - 0.18) / 0.5));
  for (let x = -60; x < W + 60;) {
    const w = Math.max(16, base * (0.5 + q())), type = [1, 1, 3, 3, 1, 0, 2, 4][Math.floor(q() * 8)] as number;
    out.push({ x, w, type, L: H * (lo + q() * (hi - lo)) * rise((x + w / 2) / W) });
    x += w * (0.82 + q() * 0.28);
  }
  return out;
}

export function Skyline() {
  useEffect(() => {
    const root = document.documentElement, city = document.getElementById("city") as HTMLElement;
    const scroller = document.getElementById("page") as HTMLElement;
    const layers = ["far", "mid", "near", "towers"].map((id) => document.getElementById(id) as HTMLCanvasElement);
    const [far, mid, near, top] = layers as [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement];
    let W = 0, H = 0, D = 1, towers: Tower[] = [], colors: Palette = palettes.dust, strength = 1, depth = 1;
    let raf = 0, last = 0, shown = -1, cleanups: (() => void)[] = [];
    const ptr = { x: 0, tx: 0 };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const prepare = (c: HTMLCanvasElement) => {
      c.width = (W + 80) * D; c.height = H * D; c.style.width = `${W + 80}px`; c.style.height = `${H}px`;
      const x = c.getContext("2d") as CanvasRenderingContext2D;
      x.setTransform(D, 0, 0, D, 40 * D, 0); x.clearRect(-40, 0, W + 80, H); x.lineJoin = "miter";
      return x;
    };
    function paint(x: CanvasRenderingContext2D, b: Building, o: { fill: string; fillA?: number; lineA?: number; grid?: number }, L = b.L) {
      const pts = outline(b, L);
      x.beginPath(); pts.forEach(([a, c], i) => (i ? x.lineTo(a, c) : x.moveTo(a, c))); x.closePath();
      if (o.fillA) { x.globalAlpha = o.fillA; x.fillStyle = o.fill; x.fill(); }
      if (o.lineA) { x.globalAlpha = o.lineA; x.strokeStyle = colors.line; x.lineWidth = 0.8; x.stroke(); }
      if (o.grid) {
        const end = L * (shape(b.type)[1] as Point)[1], cols = Math.max(2, Math.round(b.w / 16));
        x.globalAlpha = o.grid; x.lineWidth = 0.6; x.beginPath();
        for (let y = 15; y < end - 6; y += 15) { x.moveTo(b.x, y); x.lineTo(b.x + b.w, y); }
        for (let i = 1; i < cols; i++) { const px = b.x + (i / cols) * b.w; x.moveTo(px, 0); x.lineTo(px, end); }
        x.stroke();
      }
      x.globalAlpha = 1;
    }
    // The tips dissolve into the haze, so the city never ends in a hard edge across the page.
    const dissolve = (x: CanvasRenderingContext2D) => {
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#000"); g.addColorStop(0.55, "rgba(0,0,0,.72)"); g.addColorStop(1, "transparent");
      x.globalCompositeOperation = "destination-in"; x.fillStyle = g; x.fillRect(-40, 0, W + 80, H); x.globalCompositeOperation = "source-over";
    };
    function paintTowers() {
      const x = top.getContext("2d") as CanvasRenderingContext2D;
      x.clearRect(-40, 0, W + 80, H);
      for (const t of towers) {
        const L = t.L * (1 + t.grow * 0.22);
        paint(x, t, { fill: colors.sky[0], fillA: 0.75, lineA: Math.min(1, (0.34 + t.grow * 0.6) * strength + t.grow * 0.25), grid: Math.min(0.5, (0.08 + t.grow * 0.2) * strength) }, L);
        if (t.grow > 0.02) { // A slow amber mark at the tip of the tower being pointed at.
          const s = shape(t.type), tip = L * (s[s.length - 1] as Point)[1], cx = t.x + t.w / 2;
          x.globalAlpha = t.grow; x.strokeStyle = colors.accent; x.lineWidth = 1.2;
          x.beginPath(); x.moveTo(cx, tip); x.lineTo(cx, tip + 18 * t.grow); x.stroke(); x.globalAlpha = 1;
        }
      }
    }
    function build() {
      const d = root.dataset;
      colors = palettes[d.palette as PaletteId] ?? palettes.dust;
      strength = STRENGTH[d.strength as keyof typeof STRENGTH] ?? 1;
      depth = PARALLAX[d.parallax as keyof typeof PARALLAX] ?? 1;
      W = city.clientWidth; H = city.clientHeight; D = Math.min(devicePixelRatio || 1, 2);
      if (!W || !H) return;
      const density = DENSITY[d.density as keyof typeof DENSITY] ?? 1, reach = REACH[d.reach as keyof typeof REACH] ?? 1;
      const phone = W < 760 ? 1.4 : 1, width = (min: number, part: number) => (Math.max(min, W / part) * phone) / density;
      const fx = prepare(far), mx = prepare(mid), nx = prepare(near);
      prepare(top);
      skyline(11, width(30, 30), 0.42 * reach, 0.9 * reach, W, H).forEach((b) => paint(fx, b, { fill: colors.line, fillA: 0.05 * strength }));
      skyline(23, width(40, 22), 0.3 * reach, 0.66 * reach, W, H).forEach((b) => paint(mx, b, { fill: colors.line, fillA: 0.05 * strength, lineA: 0.12 * strength }));

      cleanups.forEach((off) => off()); cleanups = [];
      // In Street, each header item marked data-tower owns a building hanging from it.
      const box = city.getBoundingClientRect(), q = seeded(61);
      towers = d.fit !== "street" ? [] : [...document.querySelectorAll<HTMLElement>("[data-tower]")].map((el) => {
        const r = el.getBoundingClientRect(), w = Math.max(56, r.width * 0.9);
        const t: Tower = { x: r.left + r.width / 2 - w / 2 - box.left, w, type: 3, L: H * (0.34 + q() * 0.16) * reach, grow: 0.2, target: 0.2, rest: 0.2 };
        const aim = (v: number) => () => { t.target = v; wake(); };
        const [on, off] = [aim(1), aim(t.rest)];
        el.addEventListener("pointerenter", on); el.addEventListener("pointerleave", off); el.addEventListener("focus", on); el.addEventListener("blur", off);
        cleanups.push(() => { el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off); el.removeEventListener("focus", on); el.removeEventListener("blur", off); });
        return t;
      });
      const taken = towers.map((t): Point => [t.x - 8, t.x + t.w + 8]);
      skyline(41, width(58, 14), 0.14 * reach, 0.36 * reach, W, H)
        .filter((b) => !taken.some(([a, z]) => b.x < z && b.x + b.w > a))
        .forEach((b) => paint(nx, b, { fill: colors.sky[0], fillA: 0.6, lineA: 0.26 * strength, grid: 0.06 * strength }));
      [fx, mx, nx].forEach(dissolve);
      paintTowers();
      shown = -1; wake();
    }
    function frame(now: number) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 2.6);
      ptr.x += (ptr.tx - ptr.x) * k;
      const sc = scroller.scrollTop, gain = reduced ? 0 : depth;
      const move = (c: HTMLCanvasElement, m: number, s: number) => { c.style.transform = `translate3d(${(-ptr.x * m * gain).toFixed(2)}px,${(-sc * (gain ? s : 0.3)).toFixed(1)}px,0)`; };
      move(far, 6, 0.16); move(mid, 12, 0.26); move(near, 20, 0.4); move(top, 20, 0.4);
      let moving = Math.abs(ptr.tx - ptr.x) > 0.0005 || shown !== sc; shown = sc;
      let redraw = false;
      for (const t of towers) if (Math.abs(t.target - t.grow) > 0.002) { t.grow += (t.target - t.grow) * (reduced ? 1 : 1 - Math.exp(-dt * 3.4)); redraw = moving = true; }
      if (redraw) paintTowers();
      if (moving) wake();
    }
    function wake() { if (!raf) raf = requestAnimationFrame(frame); }

    const pointer = (e: PointerEvent) => { if (e.pointerType !== "touch") { ptr.tx = e.clientX / innerWidth - 0.5; wake(); } };
    const scrolled = () => { const on = scroller.scrollTop > 8; if (on !== ("scrolled" in root.dataset)) { if (on) root.dataset.scrolled = ""; else delete root.dataset.scrolled; } wake(); };
    addEventListener("pointermove", pointer);
    scroller.addEventListener("scroll", scrolled, { passive: true });
    const settings = new MutationObserver(build);
    settings.observe(root, { attributes: true, attributeFilter: ["data-palette", "data-fit", "data-density", "data-reach", "data-strength", "data-parallax"] });
    let timer = 0; const sized = new ResizeObserver(() => { clearTimeout(timer); timer = window.setTimeout(build, 120); });
    sized.observe(city);
    void document.fonts?.ready.then(build);
    build(); scrolled();
    return () => {
      removeEventListener("pointermove", pointer); scroller.removeEventListener("scroll", scrolled);
      settings.disconnect(); sized.disconnect(); cleanups.forEach((off) => off()); cancelAnimationFrame(raf); clearTimeout(timer);
    };
  }, []);

  return (
    <div className="city" id="city" aria-hidden="true">
      <canvas id="far" /><div className="mist" /><canvas id="mid" /><div className="mist two" /><canvas id="near" /><canvas id="towers" />
    </div>
  );
}
