import { seededWaits } from "@portfolio/design/rotating-text";

export type HeroBatsOptions = { seed: number; count: number; minMs: number; maxMs: number };

type Bat = { lag: number; size: number; drop: number; phase: number };

/* Now and then a few bats cross the name. They know where the letters are: they weave in front of one and behind the next, dip and rise
   between them, and each letter gives a little as they pass. The letters are real page text, so this works by stacking order: every
   second letter sits above the bats' canvas, which needs no redrawing of the type. Nothing runs between crossings. */
export function startHeroBats(plate: HTMLElement, options: HeroBatsOptions) {
  const name = plate.querySelector<HTMLElement>(".hero-name"), canvas = plate.querySelector<HTMLCanvasElement>(".hero-bats");
  const ctx = canvas?.getContext("2d");
  if (!options.count || !name || !canvas || !ctx) return () => {};
  const letters = [...name.querySelectorAll<HTMLElement>("[data-char]")];
  const wait = seededWaits(options.seed, options.minMs, options.maxMs), roll = seededWaits(options.seed + 1, 0, 1000);

  let raf = 0, timer: ReturnType<typeof setTimeout>;
  const PAD = 70;

  const drawBat = (x: number, y: number, size: number, flap: number, bank: number, ink: string, edge: string) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(bank); ctx.scale(size, size * (0.45 + flap * 0.55));
    ctx.fillStyle = ink; ctx.beginPath();
    // One shape: ears, shoulders, and two wings with scalloped trailing edges.
    ctx.moveTo(0, -0.1); ctx.lineTo(0.05, -0.28); ctx.lineTo(0.1, -0.1);
    ctx.quadraticCurveTo(0.5, -0.5 * flap - 0.1, 1, -0.2 * flap);
    ctx.quadraticCurveTo(0.8, 0.02, 0.68, 0.22); ctx.quadraticCurveTo(0.5, 0.06, 0.34, 0.2); ctx.quadraticCurveTo(0.2, 0.1, 0, 0.36);
    ctx.quadraticCurveTo(-0.2, 0.1, -0.34, 0.2); ctx.quadraticCurveTo(-0.5, 0.06, -0.68, 0.22); ctx.quadraticCurveTo(-0.8, 0.02, -1, -0.2 * flap);
    ctx.quadraticCurveTo(-0.5, -0.5 * flap - 0.1, -0.1, -0.1); ctx.lineTo(-0.05, -0.28); ctx.closePath();
    // A hair of paper around it, so a bat in front of a dark letter still shows as a bat.
    ctx.lineWidth = 1.5 / size; ctx.strokeStyle = edge; ctx.stroke(); ctx.fill();
    ctx.restore();
  };

  const cross = () => {
    const box = name.getBoundingClientRect(), w = name.offsetWidth, h = name.offsetHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (box.bottom < 0 || box.top > innerHeight || document.hidden) return schedule();
    canvas.width = (w + PAD * 2) * dpr; canvas.height = (h + PAD * 2) * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ink = getComputedStyle(name).color, edge = getComputedStyle(name).getPropertyValue("--paper").trim();

    // Each letter's middle, where it stands. Which side of the bats it's on alternates, and starts differently each time.
    const flip = roll() % 2;
    const spots = letters.map((el, i) => {
      el.style.zIndex = (i + flip) % 2 ? "3" : "1";
      return { el, mid: el.offsetLeft + el.offsetWidth / 2, nudge: 0 };
    });
    const fromLeft = roll() % 2 === 0;
    const scale = Math.min(1.25, Math.max(0.55, h / 110));
    const speed = (250 + roll() * 0.11) * scale; // px per second
    const bats: Bat[] = Array.from({ length: options.count }, (_, i) => ({ lag: i * (54 + roll() * 0.04) * scale, size: (17 - i * 2 + (roll() / 1000) * 4) * scale, drop: (i % 2 ? 1 : -1) * Math.min(i, 2) * 7 * scale, phase: roll() / 160 }));
    const span = w + PAD * 2 + bats[bats.length - 1]!.lag + 60;
    const swing = h * 0.3;
    const start = performance.now(); let last = start;

    const frame = (now: number) => {
      const t = (now - start) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
      const lead = speed * t;
      ctx.clearRect(0, 0, w + PAD * 2, h + PAD * 2);
      const pushes = new Array<number>(spots.length).fill(0);
      for (const b of bats) {
        const along = lead - b.lag - 30;
        const px = fromLeft ? along - PAD : w + PAD - along;
        // Dip and rise once per letter or so, tied to the letters' own spacing, plus a nervous flutter.
        const letterAt = (px / w) * spots.length;
        const py = h * 0.5 + b.drop + Math.sin(letterAt * Math.PI + b.phase) * swing + Math.sin(t * 9 + b.phase) * 2.4 * scale;
        const slope = Math.cos(letterAt * Math.PI + b.phase) * swing * (Math.PI * spots.length / w) * (fromLeft ? 1 : -1);
        drawBat(px + PAD, py + PAD, b.size, 0.68 + 0.32 * Math.sin(t * 24 + b.phase * 3), Math.atan(slope) * 0.5, ink, edge);
        spots.forEach((s, i) => { const d = Math.abs(s.mid - px); if (d < 34 * scale) pushes[i] = Math.max(pushes[i]!, (1 - d / (34 * scale)) * (fromLeft ? 1 : -1) * (px < s.mid ? 1 : 0.6)); });
      }
      // A letter gives way a little as a bat brushes it, then settles.
      spots.forEach((s, i) => {
        s.nudge += (pushes[i]! - s.nudge) * (1 - Math.exp(-dt * 11));
        s.el.style.translate = Math.abs(s.nudge) > 0.004 ? `${(s.nudge * 2.6 * scale).toFixed(2)}px ${(-Math.abs(s.nudge) * 2 * scale).toFixed(2)}px` : "";
      });
      if (lead < span) raf = requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, w + PAD * 2, h + PAD * 2); for (const s of spots) s.el.style.translate = ""; schedule(); }
    };
    raf = requestAnimationFrame(frame);
  };

  function schedule() { timer = setTimeout(cross, wait()); }
  timer = setTimeout(cross, 3200); // After the name has resolved.
  return () => { clearTimeout(timer); cancelAnimationFrame(raf); for (const el of letters) { el.style.translate = ""; el.style.zIndex = ""; } };
}
