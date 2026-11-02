"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { fitHeight } from "./fit-height";

/* A small Batman in the theme's own shades, ready to stand on any line. Put it inside a positioned element whose bottom edge is the line. It reads the room it has and sizes itself: the space up to the nearest `data-figure-ceiling` in the same section, less a clearance, within the limits.
   A ceiling can say how much of its own box is empty at the bottom, with `data-figure-inset`, as a fraction of its height.
   The drawing is one file with its layers at small depths, and the two groups part slightly with the hero's pointer tilt. Decoration only: hidden from screen readers, never takes a click. */

export type BatFigureProps = {
  /** Where it stands along the line, 0 to 1. */
  anchor: number;
  /** Which way it faces. The drawing itself faces right. */
  face: "left" | "right";
  minHeight: number;
  maxHeight: number;
  /** Space to leave under the ceiling, in px. */
  clearance: number;
  /** Off for a still figure. Reduced motion always stills it too. */
  motion: boolean;
};

const VIEW_BOX = "-5.9 37.0 376.0 746.2";
const Layer = ({ id, name }: { id: string; name: string }) => (
  <svg className={`bat-figure-layer bat-figure-${name}`} viewBox={VIEW_BOX} aria-hidden="true"><use href={`/hero-figure.svg#${id}`} /></svg>
);

export function BatFigure({ anchor, face, minHeight, maxHeight, clearance, motion }: BatFigureProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current, line = el?.parentElement;
    if (!el || !line) return;
    const ceiling = el.closest("section")?.querySelector<HTMLElement>("[data-figure-ceiling]") ?? undefined;
    const measure = () => {
      let room: number | undefined;
      if (ceiling) {
        const box = ceiling.getBoundingClientRect();
        room = line.getBoundingClientRect().bottom - box.bottom + box.height * Number(ceiling.dataset.figureInset ?? 0);
      }
      el.style.setProperty("--figure-h", `${fitHeight(room, { min: minHeight, max: maxHeight, clearance })}px`);
    };
    measure();
    const sizes = new ResizeObserver(measure);
    sizes.observe(line);
    if (ceiling) sizes.observe(ceiling);
    return () => sizes.disconnect();
  }, [minHeight, maxHeight, clearance]);

  return (
    <span ref={ref} className="bat-figure" data-face={face} data-still={motion ? undefined : ""} style={{ "--anchor": anchor } as CSSProperties} aria-hidden="true">
      <i className="bat-figure-shadow" />
      <span className="bat-figure-stand">
        <Layer id="back" name="back" />
        <Layer id="front" name="front" />
      </span>
    </span>
  );
}
