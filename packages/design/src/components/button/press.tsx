"use client";

import { useEffect } from "react";

/** How long a press shows, however quick the click: time for the cap to reach the bottom and be seen there. */
export const PRESS_HOLD_MS = 240;

const installed = new WeakSet<EventTarget>();

/**
 * Keeps a quick press on screen, through one listener for the whole page. CSS can't do this: :active only lasts from
 * pointer down to pointer up, and a tap on a trackpad (or a short click on a busy page) is over before the next frame.
 * A touch counts once it's a tap rather than a scroll, and keyboard activation has no pointer at all, so both show on the click.
 */
export function installPressLatch(root: EventTarget) {
  if (installed.has(root)) return;
  installed.add(root);
  const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>();
  let pointer = "";
  const press = (target: EventTarget | null) => {
    const button = (target as Element | null)?.closest?.(".bp");
    if (!button) return;
    clearTimeout(timers.get(button));
    button.setAttribute("data-pressing", "");
    timers.set(button, setTimeout(() => button.removeAttribute("data-pressing"), PRESS_HOLD_MS));
  };
  root.addEventListener("pointerdown", (e) => {
    const { pointerType, button, target } = e as PointerEvent;
    pointer = pointerType;
    if (pointerType !== "touch" && button === 0) press(target);
  }, { capture: true, passive: true });
  root.addEventListener("click", (e) => {
    if ((e as MouseEvent).detail === 0 || pointer === "touch") press(e.target);
  }, { capture: true, passive: true });
}

/** Rendered by every Button, so using one is enough. It draws nothing. */
export function PressLatch() {
  useEffect(() => installPressLatch(document), []);
  return null;
}
