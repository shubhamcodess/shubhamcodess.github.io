"use client";

import { useEffect, useRef } from "react";

type Mountable = { mount(canvas: HTMLCanvasElement, options: { pointerHost: Element | null; plays: string; line: string; startAt: number }): unknown };

/* Each drawing is its own file, loaded only when its project nears the screen. Add new ones here, built with the blueprint-motion-graphic skill. */
const DRAWINGS: Record<string, () => Promise<Mountable>> = {
  "newsletter-fold": () => import("./drawings/newsletter-fold").then((m) => m.NewsletterFold as Mountable),
  "token-flow": () => import("./drawings/token-flow").then((m) => m.TokenFlow as Mountable),
};

export type StageFact = { value: string; label: string };

/** A project's plate: its live drawing, or until it has one, its real numbers set out on the plate. */
export function ProjectStage({ stage, facts }: { stage: string | null; facts: readonly StageFact[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const load = stage ? DRAWINGS[stage] : undefined;

  useEffect(() => {
    const el = canvas.current;
    if (!el || !load) return;
    let gone = false;
    // Loaded as it nears the screen, not with the page.
    const near = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      near.disconnect();
      void load().then((drawing) => { if (!gone) drawing.mount(el, { pointerHost: el.closest(".pc"), plays: "always", line: "steady", startAt: 0 }); });
    }, { root: document.getElementById("page"), rootMargin: "20% 0px" });
    near.observe(el);
    return () => { gone = true; near.disconnect(); };
  }, [load]);

  if (load) return <canvas ref={canvas} aria-hidden="true" />;
  return (
    <dl className="stage-facts">
      {facts.map((f) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
