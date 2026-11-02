"use client";

import { useEffect, useRef } from "react";
import { fitHeight, parseOutline, startFigure, stepFigure, traceFigure, type FigureState, type Outline } from "./rig";

/* The small Batman, ready to stand on any line. Put it inside a positioned element whose bottom edge is the line. It reads the room it has and sizes itself: the space up to the nearest `data-figure-ceiling` in the same section, less a clearance, within the limits.
   A ceiling can say how much of its own box is empty at the bottom, with `data-figure-inset`, as a fraction of its height.
   Decoration only: hidden from screen readers, never takes a click, and asleep whenever it's off screen. */

export type BatFigureProps = {
  /** Where it stands along the line, 0 to 1. */
  anchor: number;
  /** Whether it goes after the pointer. If not it only turns to look. */
  chase: boolean;
  /** Top speed, in body heights per second. */
  pace: number;
  /** How long the pointer rests before it goes back to its anchor. */
  idleMs: number;
  minHeight: number;
  maxHeight: number;
  /** Space to leave under the ceiling, in px. */
  clearance: number;
  motion: boolean;
};

const SRC = "/hero-figure.svg";
let loading: Promise<Outline> | undefined; // Shared, so any number of figures fetch the outline once.
const loadOutline = () => (loading ??= fetch(SRC).then((r) => { if (!r.ok) throw new Error(SRC); return r.text(); }).then((svg) => {
  const box = /viewBox="0 0 (\S+) (\S+)"/.exec(svg), d = / d="([^"]+)"/.exec(svg);
  if (!box || !d) throw new Error(SRC);
  return parseOutline(d[1] as string, Number(box[1]), Number(box[2]));
}));

const QUIET_FPS = 30; // Standing still, nothing moves fast enough to need more.
const RIM = [2, 1].map((n) => n * 15); // Its thickness, in outline units: two steps behind the face.

export function BatFigure({ anchor, chase, pace, idleMs, minHeight, maxHeight, clearance, motion }: BatFigureProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current, line = canvas?.parentElement, ctx = canvas?.getContext("2d");
    if (!canvas || !line || !ctx) return;
    const still = !motion || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const ceiling = canvas.closest("section")?.querySelector<HTMLElement>("[data-figure-ceiling]") ?? undefined;

    let outline: Outline | undefined, body: FigureState | undefined;
    let width = 0, height = 0, boxW = 0, boxH = 0, ground = 0, dpr = 1, ink = "", edge = "";
    let target = 0, side = 1, pointer: number | undefined, lastMove = -Infinity;
    let raf = 0, last = 0, since = 0, onScreen = true, gone = false;

    const inset = () => height * 0.3 + 4;
    const home = () => (width > inset() * 2 ? inset() + (width - inset() * 2) * anchor : width / 2);
    const onLine = (x: number) => (width > inset() * 2 ? Math.min(width - inset(), Math.max(inset(), x)) : width / 2);
    const inward = () => (anchor > 0.5 ? -1 : 1);

    const paint = () => {
      if (!body || !outline) return;
      canvas.style.transform = `translate3d(${(body.x - boxW / 2).toFixed(2)}px,0,0)`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const k = (height / outline.h) * dpr;
      ctx.setTransform(k, 0, 0, -k, (boxW / 2) * dpr, ground * dpr);
      const fill = (write: (pen: Path2D) => void) => { const p = new Path2D(); write(p); ctx.fill(p); };
      // A soft contact shadow on the line, so it stands on something.
      ctx.fillStyle = edge; ctx.globalAlpha = 0.22;
      ctx.beginPath(); ctx.ellipse(0, 2, 150 + body.drive * 30, 12, 0, 0, Math.PI * 2); ctx.fill();
      // Its edge first, a darker tone stepping back behind the face, which is what makes it read as a solid figurine. Then the face.
      ctx.fillStyle = edge; ctx.globalAlpha = 0.6;
      for (const depth of RIM) traceFigure(fill, outline, body, depth * body.tilt); // Thinner side-on, where less of it shows.
      ctx.globalAlpha = 1; ctx.fillStyle = ink;
      traceFigure(fill, outline, body);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!body || !onScreen || document.hidden) return;
      since += (now - last) / 1000; last = now;
      const quiet = !body.chasing && body.drive < 0.01 && Math.abs(body.turn - side) < 0.01;
      if (!quiet || since >= 1 / QUIET_FPS) {
        if (now - lastMove > idleMs) { target = home(); pointer = undefined; side = inward(); }
        // Big gaps between frames are cut into small steps, so a slow machine sees the same motion.
        for (let left = Math.min(since, 0.2); left > 0; left -= 1 / 60) stepFigure(body, { target, side }, { pace, height }, Math.min(left, 1 / 60));
        since = 0;
        paint();
      }
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (still || raf || !onScreen || document.hidden || !body) return;
      last = performance.now(); since = 0;
      raf = requestAnimationFrame(frame);
    };

    /** The room above the line, down to the ceiling's real bottom edge. */
    const roomAbove = () => {
      if (!ceiling) return undefined;
      const box = ceiling.getBoundingClientRect();
      return line.getBoundingClientRect().bottom - box.bottom + box.height * Number(ceiling.dataset.figureInset ?? 0);
    };
    const measure = () => {
      if (!outline) return;
      const was = home();
      width = line.offsetWidth;
      height = fitHeight(roomAbove(), { min: minHeight, max: maxHeight, clearance });
      // Wider than the figure, for the cape behind it and the shadow under it.
      boxW = height * 3.4; boxH = height * 1.3; ground = height * 1.2;
      dpr = Math.min(3, devicePixelRatio || 1); // It's tiny, so the full density costs little and keeps the edges clean.
      canvas.style.width = `${boxW}px`; canvas.style.height = `${boxH}px`; canvas.style.bottom = `${ground - boxH}px`;
      canvas.width = Math.round(boxW * dpr); canvas.height = Math.round(boxH * dpr);
      if (!body) { side = inward(); target = home(); body = startFigure(target, side); }
      else if (pointer === undefined) { if (!body.chasing) body.x += home() - was; target = home(); } // A change of width in the line mustn't send it running.
      else target = onLine(pointer);
      if (still) { body.x = home(); target = body.x; }
      paint();
    };

    const follow = (clientX: number) => {
      const box = line.getBoundingClientRect();
      if (!box.width || !body) return;
      pointer = ((clientX - box.left) / box.width) * width;
      if (chase) target = onLine(pointer);
      if (Math.abs(pointer - body.x) > height * 0.3) side = pointer > body.x ? 1 : -1;
      lastMove = performance.now();
    };
    const onMove = (e: PointerEvent) => { if (e.pointerType !== "touch") follow(e.clientX); };
    const onDown = (e: PointerEvent) => { if (e.pointerType === "touch") follow(e.clientX); };
    // A finger "leaves" the moment it lifts, so only a mouse leaving the window counts.
    const onLeave = (e: PointerEvent) => { if (e.pointerType !== "touch") lastMove = -Infinity; };
    const onVisible = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else wake(); };
    const readInk = () => {
      const css = getComputedStyle(canvas);
      ink = css.color; edge = css.getPropertyValue("--figure-edge").trim() || ink;
      paint();
    };

    const sizes = new ResizeObserver(measure);
    const themes = new MutationObserver(readInk);
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
      if (onScreen) wake(); else { cancelAnimationFrame(raf); raf = 0; }
    });

    // A failed fetch only means no figure: it's decoration.
    loadOutline().then((shape) => {
      if (gone) return;
      outline = shape;
      readInk();
      measure();
      canvas.dataset.ready = "";
      sizes.observe(line);
      if (ceiling) sizes.observe(ceiling);
      themes.observe(root, { attributes: true, attributeFilter: ["data-palette", "data-theme"] });
      seen.observe(canvas);
      if (still) return;
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pointerdown", onDown, { passive: true });
      root.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", onVisible);
      wake();
    }).catch(() => undefined);

    return () => {
      gone = true;
      cancelAnimationFrame(raf);
      sizes.disconnect(); themes.disconnect(); seen.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [anchor, chase, pace, idleMs, minHeight, maxHeight, clearance, motion]);

  return <canvas ref={ref} className="bat-figure" aria-hidden="true" />;
}
