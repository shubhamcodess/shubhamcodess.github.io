"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/* The plate the hero sits on: it rests slightly turned, and follows the pointer a little, so the name reads as a thing with depth.
   The pointer also moves the wireframe shadow the other way, as if a light moved. Only CSS variables change. */
export function HeroStage({ tilt, children }: { tilt: { y: number; x: number; reach: number }; children: ReactNode }) {
  const plate = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = plate.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover)").matches) return;

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, last = 0;
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const k = 1 - Math.exp(-dt * 5);
      x += (tx - x) * k; y += (ty - y) * k;
      el.style.setProperty("--px", x.toFixed(4)); el.style.setProperty("--py", y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1;
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    };
    addEventListener("pointermove", move, { passive: true });
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={plate} className="hero-plate" style={{ "--tilt-y": `${tilt.y}deg`, "--tilt-x": `${tilt.x}deg`, "--tilt-reach": `${tilt.reach}deg` } as CSSProperties}>
      {children}
    </div>
  );
}
