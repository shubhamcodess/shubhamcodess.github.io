import type { Palette } from "@portfolio/design/palettes";
import type { Random } from "./color";

export type EffectSetup = { phone: boolean };
export type EffectFrame = { W: number; H: number; t: number; wind: number; scroll: number; cam: number; amount: number; palette: Palette };

/** An effect is a plugin: it sets up its particles, then draws them each frame. Wind and the like slot in here. */
export type Effect = (r: Random, setup: EffectSetup) => (x: CanvasRenderingContext2D, f: EffectFrame) => void;

const dust: Effect = (r, { phone }) => {
  const motes = Array.from({ length: phone ? 55 : 110 }, () => ({ x: r(), y: r(), d: 0.25 + r() * 0.75, s: 0.5 + r() * 1.5, o: r() * 7, a: 0.12 + r() * 0.34 }));
  return (x, f) => {
    x.fillStyle = "#fff6e0";
    for (const p of motes) {
      const px = (((p.x + f.t * 0.006 * p.d * f.wind + Math.sin(f.t * 0.23 + p.o) * 0.006) % 1) + 1) % 1;
      const py = (((p.y - (f.scroll / f.H) * p.d * 0.35 + Math.sin(f.t * 0.17 + p.o) * 0.012) % 1) + 1) % 1;
      x.globalAlpha = p.a * f.amount * (0.6 + 0.4 * Math.sin(f.t * 0.6 + p.o));
      x.beginPath(); x.arc(px * f.W + f.cam * p.d * 26, py * f.H, p.s * (0.6 + p.d), 0, 7); x.fill();
    }
    x.globalAlpha = 1;
  };
};

/* Bats at three distances. Far ones are specks among the towers, a few cross the open sky, and two pass close to the lens. */
const bats: Effect = (r, { phone }) => {
  const make = (s0: number, s1: number, y0: number, y1: number, a: number, speed: number) => ({
    s: s0 + r() * (s1 - s0), u: r(), v: y0 + r() * (y1 - y0), a, dir: r() < 0.72 ? 1 : -1, sp: speed * (0.7 + r() * 0.6),
    f: 7 + r() * 4, o: r() * 7, glide: 0.12 + r() * 0.2, wander: 5 + r() * 16, d: s0 / 8,
  });
  const many = (n: number, ...a: Parameters<typeof make>) => Array.from({ length: n }, () => make(...a));
  const flock = [
    ...many(phone ? 3 : 5, 1.1, 1.8, 0.18, 0.56, 0.38, 0.006), // among the towers, small and hazy
    ...many(phone ? 2 : 4, 1.4, 3, 0.6, 0.92, 0.5, 0.009), // out in the open sky
    ...many(phone ? 3 : 5, 2.4, 3.8, 0.22, 0.78, 0.6, 0.012),
    make(5.4, 6.6, 0.3, 0.62, 0.74, 0.021), make(6.2, 8, 0.55, 0.85, 0.8, 0.026), // close, and rare
  ];
  return (x, f) => {
    x.strokeStyle = x.fillStyle = f.palette.ink; x.lineWidth = 1;
    for (const b of flock) {
      const run = (((b.u + f.t * b.sp * b.dir) % 1.3) + 1.3) % 1.3 - 0.15;
      const px = run * f.W + f.cam * b.s * 3, py = b.v * f.H + Math.sin(f.t * (0.32 + b.d) + b.o) * b.wander - f.scroll * (0.16 + b.d * 0.5);
      // They flap in bursts and glide between them, which is what makes a bat look alive rather than mechanical.
      const burst = Math.max(b.glide, Math.sin(f.t * 0.55 + b.o * 3) * 0.5 + 0.5), fl = Math.sin(f.t * b.f + b.o) * b.s * 0.62 * burst;
      x.globalAlpha = b.a * Math.min(1, f.amount + 0.3);
      if (b.s < 2.2) { x.beginPath(); x.moveTo(px - b.s * 1.6, py - fl); x.lineTo(px, py); x.lineTo(px + b.s * 1.6, py - fl); x.stroke(); continue; }
      const s = b.s;
      const wing = (k: number): [number, number][] => [[k * s * 2.2, -fl - s * 0.1], [k * s * 1.25, -fl * 0.45 - s * 0.42], [k * s * 0.36, -s * 0.3], [k * s * 0.2, -s * 0.62]];
      const under = (k: number): [number, number][] => [[k * s * 1.45, -fl * 0.52 + s * 0.22], [k * s * 0.92, -fl * 0.26 - s * 0.02], [k * s * 0.56, s * 0.24]];
      const pts = [...wing(-1), [0, -s * 0.32] as [number, number], ...wing(1).reverse(), ...under(1), [0, s * 0.62] as [number, number], ...under(-1).reverse()];
      x.beginPath(); pts.forEach(([a, e], i) => (i ? x.lineTo(px + a, py + e) : x.moveTo(px + a, py + e))); x.closePath(); x.fill();
    }
    x.globalAlpha = 1;
  };
};

export const EFFECTS: Record<string, Effect> = { dust, bats };

/** How fast an effect rises with the city, where the browser moves it (see `link` in the engine). Dust stays where it is. */
export const EFFECT_RISE: Record<string, number> = { bats: 0.3 };
