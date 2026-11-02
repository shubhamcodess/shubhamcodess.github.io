"use client";

import { useEffect, useRef } from "react";
import { drawFigure, presence, REST_LOOK, startRunner, step, type RunnerState } from "./rig";

/* The end of the role's dimension line, with a small Batman living on it. He waits crouched in the middle, turns toward the pointer and runs to it along the line, then goes back when it goes quiet.
   Decoration only: hidden from screen readers, never takes a click, and asleep whenever the hero is off screen. */

const INSET = 13; // How close to either end of the line his feet get, in px.
const QUIET_FPS = 30; // Crouched, nothing moves quickly enough to need more.
const PULSE = 2.8; // Seconds: one breath, one ring along the line.

export function BatRunner({ speed, idleMs, motion }: { speed: number; idleMs: number; motion: boolean }) {
  const trackRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const track = trackRef.current, canvas = canvasRef.current, ctx = canvas?.getContext("2d");
    if (!track || !canvas || !ctx) return;
    const still = !motion || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    let width = 0, boxW = 0, boxH = 0, tall = 0, ground = 0, dpr = 1, ink = "";
    let body: RunnerState | undefined;
    let target = 0, look = REST_LOOK, pointer: number | undefined, lastMove = -Infinity;
    let raf = 0, last = 0, since = 0, onScreen = true;

    const clampOnLine = (x: number) => (width > INSET * 2 ? Math.min(width - INSET, Math.max(INSET, x)) : width / 2);

    const paint = () => {
      if (!body) return;
      canvas.style.transform = `translate3d(${(body.x - boxW / 2).toFixed(2)}px,0,0)`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (width < INSET * 3) return; // The line is too short to stand on.
      const k = (tall / 100) * dpr;
      ctx.setTransform(k, 0, 0, -k, (boxW / 2) * dpr, ground * dpr);
      ctx.fillStyle = ctx.strokeStyle = ink;
      ctx.lineJoin = "round";
      // The pulse: a ring running out along the line under him, as if he's listening. Only while he's crouched.
      if (!still && body.crouch > 0.05) {
        const age = (body.t / PULSE) % 1;
        ctx.globalAlpha = (1 - age) * (1 - age) * 0.5 * body.crouch;
        ctx.lineWidth = 0.9 / (tall / 100);
        ctx.beginPath();
        ctx.ellipse(0, 0, 18 + age * 72, (18 + age * 72) * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = still ? 0.9 : presence(body);
      ctx.lineWidth = 0.7;
      drawFigure(ctx, body);
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!body || !onScreen || document.hidden) return;
      const dt = (now - last) / 1000;
      since += dt; last = now;
      const quiet = !body.running && body.crouch > 0.985 && Math.abs(body.yawV) < 0.01;
      if (!quiet || since >= 1 / QUIET_FPS) {
        if (now - lastMove > idleMs) { target = width / 2; pointer = undefined; }
        if (pointer !== undefined) {
          const gap = pointer - body.x;
          if (Math.abs(gap) > 12) look = Math.sign(gap) * (0.62 + 0.38 * Math.min(1, Math.abs(gap) / 320));
        }
        // Big gaps between frames are cut into small steps, so a slow machine sees the same motion.
        for (let left = since; left > 0; left -= 1 / 60) step(body, { target, look }, { speed, stride: tall * 2.3 }, Math.min(left, 1 / 60));
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

    const measure = () => {
      const was = width;
      width = track.offsetWidth;
      tall = canvas.offsetHeight / 1.25;
      boxW = canvas.offsetWidth; boxH = canvas.offsetHeight;
      ground = boxH - tall * 0.15;
      dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(boxW * dpr); canvas.height = Math.round(boxH * dpr);
      if (!body) body = startRunner(width / 2);
      else if (pointer === undefined && !body.running) body.x += (width - was) / 2; // The role's text changing width mustn't send him running.
      if (pointer === undefined) target = width / 2;
      else target = clampOnLine(target);
      if (still) body.x = width / 2;
      paint();
    };

    const follow = (clientX: number) => {
      const box = track.getBoundingClientRect();
      if (!box.width) return;
      pointer = ((clientX - box.left) / box.width) * width;
      target = clampOnLine(pointer);
      lastMove = performance.now();
    };
    const onMove = (e: PointerEvent) => { if (e.pointerType !== "touch") follow(e.clientX); };
    const onDown = (e: PointerEvent) => { if (e.pointerType === "touch") follow(e.clientX); };
    // A finger "leaves" the moment it lifts, so only a mouse leaving the window counts.
    const onLeave = (e: PointerEvent) => { if (e.pointerType !== "touch") lastMove = -Infinity; };
    const onVisible = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else wake(); };
    const readInk = () => { ink = getComputedStyle(canvas).color; paint(); };

    readInk();
    measure();
    readInk();
    const sizes = new ResizeObserver(measure);
    sizes.observe(track);
    const themes = new MutationObserver(readInk);
    themes.observe(root, { attributes: true, attributeFilter: ["data-palette", "data-theme"] });
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
      if (onScreen) wake(); else { cancelAnimationFrame(raf); raf = 0; }
    });
    seen.observe(canvas);
    if (!still) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pointerdown", onDown, { passive: true });
      root.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", onVisible);
      wake();
    }
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect(); themes.disconnect(); seen.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [speed, idleMs, motion]);

  return (
    <span ref={trackRef} className="hero-track">
      <i className="hero-dim hero-dim-long" />
      <canvas ref={canvasRef} className="hero-bat" aria-hidden="true" />
    </span>
  );
}
