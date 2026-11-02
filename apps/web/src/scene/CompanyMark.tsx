"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

/* The company's name as a striped wordmark, in the heading's ink. The pen lays its stripes down one by one when it first comes into view.
   It stands in for the official logo until that file and its usage rules are confirmed. */
export function CompanyMark({ name }: { name: string }) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setDrawn(true); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const stripes = Array.from({ length: 8 }, (_, i) => 10 + i * 4.3);
  return (
    <svg ref={ref} className="company-mark" data-drawn={drawn || undefined} viewBox="0 0 120 46" role="img" aria-label={name}>
      <mask id={`m${id}`} maskUnits="userSpaceOnUse">
        {stripes.map((y, i) => <rect key={y} className="company-stripe" x="0" y={y} width="120" height="2.75" fill="#fff" style={{ "--k": i } as CSSProperties} />)}
      </mask>
      <text x="1" y="44" textLength="118" lengthAdjust="spacingAndGlyphs" mask={`url(#m${id})`}>{name}</text>
    </svg>
  );
}
