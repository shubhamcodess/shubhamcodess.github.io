"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { seededWaits } from "./seeded";
import "./rotating-text.css";

export type RotatingTextProps = {
  /** Stays still, before the line that changes. */
  prefix?: string;
  /** What it rotates through. The first shows before any script runs. */
  lines: readonly string[];
  /** Stays still, after the line that changes. */
  suffix?: string;
  /** The same seed gives the same rhythm. */
  seed: number;
  /** The shortest and longest wait on one line, in ms. */
  minMs: number;
  maxMs: number;
  /** Size to the showing line, easing between widths, instead of holding the widest. */
  fit?: boolean;
  className?: string;
};

/**
 * One line that quietly changes, on an irregular rhythm. It keeps its space, so nothing around it moves.
 * It pauses while hovered or the tab is hidden, stays still under reduced motion, and screen readers get all the lines once, without announcements.
 */
export function RotatingText({ prefix, lines, suffix, seed, minMs, maxMs, fit, className }: RotatingTextProps) {
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const stage = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!fit || !el) return;
    const size = () => { el.style.width = `${(el.children[active] as HTMLElement).offsetWidth}px`; };
    size();
    document.fonts?.ready.then(size);
  }, [fit, active]);

  useEffect(() => {
    if (lines.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wait = seededWaits(seed, minMs, maxMs);
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      timer = setTimeout(() => {
        if (!paused.current && !document.hidden) setActive((n) => (n + 1) % lines.length);
        tick();
      }, wait());
    };
    tick();
    return () => clearTimeout(timer);
  }, [lines.length, seed, minMs, maxMs]);

  const before = (active - 1 + lines.length) % lines.length;
  return (
    <span className={className ? `rt ${className}` : "rt"} onPointerEnter={() => { paused.current = true; }} onPointerLeave={() => { paused.current = false; }}>
      <span className="rt-sr">{[prefix, lines.join(" / "), suffix].filter(Boolean).join(" ")}</span>
      <span className="rt-seen" aria-hidden="true">
        {prefix && <span className="rt-prefix">{prefix} </span>}
        <span className="rt-stage" ref={stage} data-fit={fit || undefined}>
          {lines.map((line, i) => (
            <span key={line} className="rt-line" data-at={i === active ? "on" : i === before ? "was" : "next"}>{line}</span>
          ))}
        </span>
        {suffix && <span className="rt-suffix">{` ${suffix}`}</span>}
      </span>
    </span>
  );
}
