"use client";

import { useEffect } from "react";
import { startScrollMotion, type ScrollMotionOptions } from "./engine";
import "./scroll-motion.css";

export type ScrollMotionProps = ScrollMotionOptions & {
  /** CSS selector for the element that scrolls. */
  target: string;
  /** CSS selector for the element that holds its content. */
  content: string;
};

/** Runs smooth scroll, layers and reveals on a scrolling element. Put `data-reveal` and `data-hide` on the page's root to choose the reveal. */
export function ScrollMotion({ target, content, lerp, lag, parallax }: ScrollMotionProps) {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(target), inner = document.querySelector<HTMLElement>(content);
    if (!page || !inner) return;
    return startScrollMotion(page, inner, { lerp, lag, parallax });
  }, [target, content, lerp, lag, parallax]);
  return null;
}
