"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./motion-text.css";

export type MotionTextProps = {
  /** The words. Screen readers get them whole; the letters are only for the eye. */
  text: string;
  /** Starts this many letters later, to follow text before it (a heading's second line). */
  after?: number;
  /** A block of its own, like one line of a heading. */
  line?: boolean;
  className?: string;
};

type State = "in" | "below" | "above";

/**
 * Text that arrives with a motion blur: each letter slides in from the left, stretched and blurred, and settles sharp, one after another.
 * Scrolling it out collapses it the other way. Driven by its own place on screen, so it works anywhere on the site.
 * The server sends it plain and visible, and reduced motion keeps it that way.
 */
export function MotionText({ text, after = 0, line = false, className }: MotionTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<State | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Collapses a little before it reaches the edge of the screen, so the leaving is seen.
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      setState(e.isIntersecting ? "in" : e.boundingClientRect.top > 0 ? "below" : "above");
    }, { rootMargin: "-6% 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let n = after;
  const words = text.split(" ");
  const total = after + text.replace(/ /g, "").length;
  return (
    <span ref={ref} className={["mt", line && "mt-line", className].filter(Boolean).join(" ")} data-state={state} aria-label={text} role="text">
      {words.map((word, w) => (
        <span key={w} className="mt-w" aria-hidden="true">
          {[...word].map((ch, c) => <span key={c} className="mt-c" style={{ "--i": n++, "--n": total } as CSSProperties}>{ch}</span>)}
          {w < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
