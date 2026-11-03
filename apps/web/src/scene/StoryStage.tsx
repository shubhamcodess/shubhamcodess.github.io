"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { currentScene, figurePresence, frameLook, lineProgress, sceneLook, sceneTarget } from "./story-motion";

type StoryDrawing = { mount(canvas: HTMLCanvasElement, options: { chapter: number; count: number; story: () => { progress: number; live: boolean } }): () => void };

const pad = (n: number) => String(n).padStart(2, "0");

/* Turns the story into a film: the stage pins to the screen and the scroll plays it, one scene at a time, and the stops on the line jump between scenes.
   If it wouldn't fit on this screen, or there's no script, or motion isn't welcome, it stays what the server sent: the scenes in order, as plain text, with the stops as ordinary links. */
export function StoryStage({ count, pace, id, titles, children }: { count: number; pace: number; id: string; titles: readonly string[]; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const clock = useRef({ progress: 0, live: false }); // The film's place, read by the figure drawing every frame.

  // The figures: blueprint drawings, loaded only when the story is on the page. Each chapter's canvas shows its part.
  useEffect(() => {
    const canvases = [...(ref.current?.querySelectorAll<HTMLCanvasElement>("canvas[data-chapter]") ?? [])];
    if (!canvases.length) return;
    let stops: (() => void)[] = [], gone = false;
    void import("./drawings/story-figures").then(({ StoryFigures }) => {
      if (gone) return;
      stops = canvases.map((canvas) => (StoryFigures as StoryDrawing).mount(canvas, { chapter: Number(canvas.dataset.chapter), count, story: () => clock.current }));
    });
    return () => { gone = true; stops.forEach((stop) => stop()); };
  }, [count]);

  useEffect(() => {
    const story = ref.current, page = document.getElementById("page");
    if (!story || !page || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = story.querySelector<HTMLElement>(".story-stage");
    const frame = story.querySelector<HTMLElement>(".story-frame"), track = story.querySelector<HTMLElement>(".story-track");
    const scenes = [...story.querySelectorAll<HTMLElement>("[data-scene]")];
    const marks = [...story.querySelectorAll<HTMLElement>("[data-mark]")];
    const sheet = story.querySelector<HTMLElement>("[data-sheet]"), strip = story.querySelector<HTMLElement>("[data-strip]");

    // Where the stage pins (px from the top), its place in the section, and how much scroll the film takes.
    let raf = 0, on = false, lastHere = -1, pinTop = 0, stageAt = 0, film = 0;
    const clear = () => {
      on = false; lastHere = -1; clock.current.live = false;
      delete story.dataset.cine; delete story.dataset.holdStart; delete story.dataset.holdLength;
      for (const name of ["--story-drawn", "--now", "--hint", "--stage-top", "height"]) story.style.removeProperty(name);
      for (const el of [...scenes, frame, track]) el?.removeAttribute("style");
      for (const mark of marks) { delete mark.dataset.state; mark.removeAttribute("aria-current"); }
      if (sheet) sheet.textContent = pad(1);
      if (strip) strip.textContent = titles[0] ?? "";
    };
    const draw = () => {
      raf = 0;
      if (!on) return;
      const box = story.getBoundingClientRect();
      if (box.bottom < -60 || box.top > innerHeight + 60 || film <= 0) return; // Off screen: nothing to do.
      const ahead = box.top + stageAt - pinTop; // How far the stage still is from pinning.
      const progress = Math.min(1, Math.max(0, -ahead / film));
      clock.current.progress = progress; clock.current.live = true;
      scenes.forEach((scene, i) => {
        const look = sceneLook(progress, i, count), hidden = look.opacity < 0.004;
        scene.style.opacity = look.opacity.toFixed(3);
        scene.style.pointerEvents = look.opacity > 0.5 ? "auto" : "none";
        if (hidden) return;
        scene.style.filter = look.blur < 0.05 ? "none" : `blur(${look.blur.toFixed(2)}px)`;
        scene.style.transform = `translate3d(0,${look.y.toFixed(2)}px,0) scale(${look.scale.toFixed(4)})`;
        scene.style.setProperty("--drift", look.drift.toFixed(3));
      });
      const whole = frameLook(ahead, ahead + film + innerHeight, innerHeight);
      for (const el of [frame, track]) {
        if (!el) continue;
        el.style.opacity = whole.opacity.toFixed(3);
        el.style.filter = whole.blur < 0.05 ? "none" : `blur(${whole.blur.toFixed(2)}px)`;
        el.style.transform = whole.y < 0.05 ? "none" : `translate3d(0,${whole.y.toFixed(2)}px,0) scale(${whole.scale.toFixed(4)})`;
      }
      story.style.setProperty("--story-drawn", lineProgress(progress, count).toFixed(4));
      story.style.setProperty("--now", figurePresence(progress, count).toFixed(3));
      story.style.setProperty("--hint", (1 - Math.min(1, Math.max(0, (progress - 0.94) / 0.05))).toFixed(3)); // The scroll hint stays through every chapter, and fades only as the last one ends.
      const here = currentScene(progress, count);
      if (here === lastHere) return;
      lastHere = here;
      if (sheet) sheet.textContent = pad(here + 1);
      if (strip) strip.textContent = titles[here] ?? "";
      marks.forEach((mark, i) => {
        mark.dataset.state = i === here ? "here" : i < here ? "past" : "next";
        if (i === here) mark.setAttribute("aria-current", "step"); else mark.removeAttribute("aria-current");
      });
    };
    const onScroll = () => { raf ||= requestAnimationFrame(draw); };
    /** Pins only if the whole stage fits below the header. It pins centered there, so the section above sits at the usual distance. */
    const fit = () => {
      if (!stage) return;
      clear();
      story.dataset.cine = "";
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
      const h = stage.offsetHeight, room = innerHeight - header;
      if (h > room - 12) { clear(); return; }
      pinTop = header + (room - h) / 2;
      stageAt = stage.offsetTop;
      film = innerHeight * count * pace;
      story.style.setProperty("--stage-top", `${pinTop}px`);
      story.style.height = `${stageAt + h + film + parseFloat(getComputedStyle(story).paddingBottom)}px`;
      // The city holds still while the film plays.
      story.dataset.holdStart = String(Math.round(page.scrollTop + story.getBoundingClientRect().top + stageAt - pinTop));
      story.dataset.holdLength = String(Math.round(film));
      on = true;
      draw();
    };
    const jump = (e: MouseEvent) => {
      const mark = (e.target as Element).closest<HTMLElement>("[data-mark]");
      if (!mark || !on) return;
      e.preventDefault();
      e.stopPropagation(); // This is a place in the film, not a place on the page.
      const ahead = story.getBoundingClientRect().top + stageAt - pinTop;
      page.scrollTo({ top: page.scrollTop + ahead + film * sceneTarget(Number(mark.dataset.mark), count), behavior: "smooth" });
    };

    fit();
    void document.fonts?.ready.then(fit);
    page.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", fit);
    story.addEventListener("click", jump);
    return () => {
      cancelAnimationFrame(raf);
      page.removeEventListener("scroll", onScroll);
      removeEventListener("resize", fit);
      story.removeEventListener("click", jump);
      clear();
    };
  }, [count, pace, titles]);

  return <section ref={ref} id={id} className="story">{children}</section>;
}
