"use client";

import { useEffect } from "react";

/* The address follows the reader: scrolling into a section with an id shows its #id, and back above every one clears it. Replaces, never pushes, so Back still leaves the page. */
export function ScrollHash() {
  useEffect(() => {
    const page = document.getElementById("page");
    if (!page) return;
    let timer = 0;
    const update = () => {
      timer = 0;
      const line = innerHeight * 0.4;
      let id = "";
      for (const s of document.querySelectorAll<HTMLElement>("#page section[id]")) if (s.getBoundingClientRect().top <= line) id = s.id;
      const hash = id ? `#${id}` : "";
      if (hash !== location.hash) history.replaceState(history.state, "", `${location.pathname}${location.search}${hash}`);
    };
    const onScroll = () => { timer ||= window.setTimeout(update, 150); }; // Never in a scroll frame: reading positions there forces a restyle of everything that frame changed.
    page.addEventListener("scroll", onScroll, { passive: true });
    return () => { page.removeEventListener("scroll", onScroll); clearTimeout(timer); };
  }, []);
  return null;
}
