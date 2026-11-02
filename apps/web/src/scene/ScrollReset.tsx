"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* The page scrolls inside its own frame, so the router's scroll reset doesn't reach it. New pages start at the top, or at their #section. */
export function ScrollReset() {
  const path = usePathname(), first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const page = document.getElementById("page");
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else page?.scrollTo(0, 0);
    dispatchEvent(new Event("resize")); // So scroll motion finds the new page's blocks.
  }, [path]);
  return null;
}
