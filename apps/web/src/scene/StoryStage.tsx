"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { currentScene, figurePresence, lineProgress, sceneLook, sceneTarget } from "./story-motion";

/* Turns the story into a film: the stage pins to the screen and the scroll plays it, one scene at a time, and the batarangs on the line jump between scenes.
   If a scene wouldn't fit on this screen, or there's no script, or motion isn't welcome, it stays what the server sent: the scenes in order, as plain text, with the batarangs as ordinary links. */
export function StoryStage({ count, pace, id, children }: { count: number; pace: number; id: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const story = ref.current, page = document.getElementById("page");
    if (!story || !page || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scenes = [...story.querySelectorAll<HTMLElement>("[data-scene]")];
    const marks = [...story.querySelectorAll<HTMLElement>("[data-mark]")];
    const holder = story.querySelector<HTMLElement>(".story-scenes");

    let frame = 0, on = false;
    const clear = () => {
      on = false;
      delete story.dataset.cine;
      for (const name of ["--story-length", "--story-drawn", "--now"]) story.style.removeProperty(name);
      for (const scene of scenes) scene.removeAttribute("style");
      for (const mark of marks) { delete mark.dataset.state; mark.removeAttribute("aria-current"); }
    };
    const draw = () => {
      frame = 0;
      if (!on) return;
      const box = story.getBoundingClientRect(), travel = box.height - innerHeight;
      if (box.bottom < -40 || box.top > innerHeight + 40 || travel <= 0) return; // Off screen: nothing to do.
      const progress = Math.min(1, Math.max(0, -box.top / travel));
      const approach = 1 - box.top / innerHeight;
      scenes.forEach((scene, i) => {
        const look = sceneLook(progress, i, count, approach);
        scene.style.opacity = look.opacity.toFixed(3);
        scene.style.pointerEvents = look.opacity > 0.5 ? "auto" : "none";
        scene.style.filter = look.blur < 0.05 ? "none" : `blur(${look.blur.toFixed(2)}px)`;
        scene.style.transform = `translate3d(0,${look.y.toFixed(2)}px,0) scale(${look.scale.toFixed(4)})`;
        scene.style.setProperty("--drift", look.drift.toFixed(3));
        scene.style.setProperty("--ink", look.ink.toFixed(3));
      });
      story.style.setProperty("--story-drawn", lineProgress(progress, count).toFixed(4));
      story.style.setProperty("--now", figurePresence(progress, count).toFixed(3));
      const here = currentScene(progress, count);
      marks.forEach((mark, i) => {
        mark.dataset.state = i === here ? "here" : i < here ? "past" : "next";
        if (i === here) mark.setAttribute("aria-current", "step"); else mark.removeAttribute("aria-current");
      });
    };
    const onChange = () => { frame ||= requestAnimationFrame(draw); };
    /** Pins only if every scene fits in the space the stage leaves it. */
    const fit = () => {
      story.dataset.cine = "";
      story.style.setProperty("--story-length", String(count * pace));
      const room = holder?.clientHeight ?? 0;
      if (!holder || scenes.some((scene) => scene.offsetHeight > room)) { clear(); return; }
      on = true;
      draw();
    };
    const jump = (e: MouseEvent) => {
      const mark = (e.target as Element).closest<HTMLElement>("[data-mark]");
      if (!mark || !on) return;
      e.preventDefault();
      e.stopPropagation(); // This is a place in the film, not a place on the page.
      const box = story.getBoundingClientRect(), travel = box.height - innerHeight;
      page.scrollTo({ top: page.scrollTop + box.top + travel * sceneTarget(Number(mark.dataset.mark), count), behavior: "smooth" });
    };

    fit();
    void document.fonts?.ready.then(fit);
    page.addEventListener("scroll", onChange, { passive: true });
    addEventListener("resize", fit);
    story.addEventListener("click", jump);
    return () => {
      cancelAnimationFrame(frame);
      page.removeEventListener("scroll", onChange);
      removeEventListener("resize", fit);
      story.removeEventListener("click", jump);
      clear();
    };
  }, [count, pace]);

  return <section ref={ref} id={id} className="story">{children}</section>;
}
