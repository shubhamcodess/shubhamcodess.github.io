"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./tooltip.css";

export type TooltipProps = {
  /** The words. Plain, short and true. */
  label: ReactNode;
  children: ReactNode;
  /** Which edge of the thing it lines up with. Use "end" near the right of the screen. */
  align?: "start" | "center" | "end";
  /** Holds it open from outside, for example to confirm a tap on a touch screen. */
  open?: boolean;
  className?: string;
};

/**
 * Replaces the browser's own `title` tooltip. It shows on mouse hover and keyboard focus, stays while the pointer is on it, and Escape dismisses it.
 * It's only visual, so whatever it points at still needs its own accessible name.
 */
export function Tooltip({ label, children, align = "center", open = false, className }: TooltipProps) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const leaving = useRef<ReturnType<typeof setTimeout>>(undefined);

  const shown = open || ((hover || focus) && !dismissed);

  useEffect(() => {
    if (!shown) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setDismissed(true); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [shown]);
  useEffect(() => () => clearTimeout(leaving.current), []);

  return (
    <span
      className={className ? `bp-tip-anchor ${className}` : "bp-tip-anchor"}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") { clearTimeout(leaving.current); setHover(true); } }}
      // A short grace, so the pointer can cross the gap onto the tooltip.
      onPointerLeave={(e) => { if (e.pointerType === "mouse") leaving.current = setTimeout(() => { setHover(false); setDismissed(false); }, 140); }}
      onFocus={(e) => { if (e.target.matches(":focus-visible")) setFocus(true); }}
      onBlur={() => { setFocus(false); setDismissed(false); }}
    >
      {children}
      <span className="bp-tip" data-align={align} data-open={shown || undefined} aria-hidden="true">{label}</span>
    </span>
  );
}
