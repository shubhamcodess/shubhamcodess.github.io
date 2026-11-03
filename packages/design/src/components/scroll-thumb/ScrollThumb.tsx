"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./scroll-thumb.css";

export type ScrollThumbProps = {
  /** CSS selector for the element that scrolls. */
  target: string;
  /** What the thumb looks like. */
  children: ReactNode;
};

declare const ScrollTimeline: { new (options: { source: Element }): AnimationTimeline };

const SCROLL_KEYS = new Set(["PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

/**
 * Replaces the visible scrollbar with one small draggable shape, which takes up no width.
 * It's for pointers: keyboards, wheels and touch keep scrolling natively, so screen readers can skip it.
 */
export function ScrollThumb({ target, children }: ScrollThumbProps) {
  const thumb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(target), el = thumb.current;
    if (!scroller || !el) return;
    // The shape travels from --scroll-thumb-top down to just above the bottom edge. The hit area around it is larger.
    const GAP = 6;
    const margin = () => (el.offsetHeight - (el.firstElementChild as HTMLElement).offsetHeight) / 2;
    const start = () => (parseFloat(getComputedStyle(el).getPropertyValue("--scroll-thumb-top")) || 0) + GAP - margin();
    const room = () => window.innerHeight - GAP - el.offsetHeight + margin() - start();
    const range = () => scroller.scrollHeight - scroller.clientHeight;
    // A finger scrolls on the browser's own thread, so on touch the browser moves the thumb too, or it would jump behind the scroll.
    const tied = matchMedia("(hover: none) and (pointer: coarse)").matches && "ScrollTimeline" in window;
    let track = "", travel: Animation | undefined;
    const place = () => {
      el.hidden = range() <= 1;
      if (el.hidden) return;
      if (!tied) { el.style.transform = `translateY(${start() + (scroller.scrollTop / Math.max(1, range())) * room()}px)`; return; }
      const from = start(), to = from + room();
      if (track === `${from} ${to}`) return;
      track = `${from} ${to}`;
      travel?.cancel();
      travel = el.animate([{ transform: `translateY(${from}px)` }, { transform: `translateY(${to}px)` }], { timeline: new ScrollTimeline({ source: scroller }), fill: "both" });
    };
    // Scrolling keys should work wherever focus is, except inside something that uses them itself.
    const keys = (e: KeyboardEvent) => {
      const at = e.target as HTMLElement;
      if (SCROLL_KEYS.has(e.key) && !scroller.contains(at) && !at.closest("input,textarea,select")) scroller.focus({ preventScroll: true });
    };
    let grabbedAt = 0, startTop = 0;
    const move = (e: PointerEvent) => { scroller.scrollTop = startTop + ((e.clientY - grabbedAt) / room()) * range(); };
    const down = (e: PointerEvent) => {
      e.preventDefault();
      grabbedAt = e.clientY; startTop = scroller.scrollTop;
      el.setPointerCapture(e.pointerId);
      el.addEventListener("pointermove", move);
      el.dataset.dragging = "";
    };
    const up = () => { el.removeEventListener("pointermove", move); delete el.dataset.dragging; };

    const sized = new ResizeObserver(place);
    sized.observe(scroller);
    window.addEventListener("resize", place);
    if (scroller.firstElementChild) sized.observe(scroller.firstElementChild);
    new MutationObserver(place).observe(scroller, { childList: true, subtree: true });
    if (!tied) scroller.addEventListener("scroll", place, { passive: true });
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    window.addEventListener("keydown", keys);
    scroller.focus({ preventScroll: true });
    place();
    return () => {
      sized.disconnect();
      travel?.cancel();
      window.removeEventListener("resize", place);
      scroller.removeEventListener("scroll", place);
      window.removeEventListener("keydown", keys);
    };
  }, [target]);

  return (
    <div ref={thumb} className="scroll-thumb" aria-hidden="true" hidden>
      <div className="scroll-thumb-shape">{children}</div>
    </div>
  );
}
