"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { currentScene, figureInView, figureLoop, figurePresence, frameLook, lineProgress, panRoom, sceneLook, scenePan, sceneTarget } from "./story-motion";

type StoryDrawing = { mount(canvas: HTMLCanvasElement, options: { chapter: number; count: number; story: () => { progress: number; live: boolean; settled: boolean; restarts: number; from: (number | null)[] }; loop: ((seconds: number) => number) | null }): () => void };

const FIT_STEPS = [{ k: 1, g: 1 }, { k: 1, g: 0.85 }, { k: 0.96, g: 0.7 }, { k: 0.92, g: 0.55 }, { k: 0.88, g: 0.4 }]; // How far a stacked card's type (k) and spacing (g) may tighten. Below this the words get too small to read.
const MIN_WINDOW = 150; // The least of a card worth showing at once. Below this the story stays a plain stack.

/* Turns the story into a film: the stage pins to the screen and the scroll plays it, one scene at a time, and the stops on the line jump between scenes.
   On a screen too small for all of it, the heading scrolls away and a card taller than the sheet slides inside it as you scroll, so nothing is cut. If even that wouldn't fit, or there's no script, or motion isn't welcome, it stays what the server sent: the scenes in order, as plain text, with the stops as ordinary links. */
export function StoryStage({ count, pace, id, figureMotion, children }: { count: number; pace: number; id: string; figureMotion: "scroll" | "loop"; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const clock = useRef({ progress: 0, live: false, settled: false, restarts: 0, from: [] as (number | null)[] }); // The film's place, read by the figure drawing every frame.

  // The figures: blueprint drawings, loaded only once the story is a screen away. Each chapter's canvas shows its part.
  useEffect(() => {
    const canvases = [...(ref.current?.querySelectorAll<HTMLCanvasElement>("canvas[data-chapter]") ?? [])];
    if (!canvases.length) return;
    let stops: (() => void)[] = [], gone = false, close = false, loaded = false;
    // Where the cards are words only, the figures are never fetched, unless a turned phone or a wider window brings them back.
    const load = () => {
      if (loaded || gone || !close || !canvases.some((canvas) => canvas.getClientRects().length)) return;
      loaded = true;
      void import("./drawings/story-figures").then(({ StoryFigures }) => {
        if (gone) return;
        stops = canvases.map((canvas) => (StoryFigures as StoryDrawing).mount(canvas, { chapter: Number(canvas.dataset.chapter), count, story: () => clock.current, loop: figureMotion === "loop" ? figureLoop : null }));
      });
    };
    const near = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      near.disconnect();
      close = true;
      load();
    }, { root: document.getElementById("page"), rootMargin: "100% 0px" });
    near.observe(ref.current as HTMLElement);
    addEventListener("resize", load);
    return () => { gone = true; near.disconnect(); removeEventListener("resize", load); stops.forEach((stop) => stop()); };
  }, [count, figureMotion]);

  useEffect(() => {
    const story = ref.current, page = document.getElementById("page");
    if (!story || !page || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = story.querySelector<HTMLElement>(".story-stage");
    const head = story.querySelector<HTMLElement>(".story-head"), hint = story.querySelector<HTMLElement>(".story-hint");
    const frame = story.querySelector<HTMLElement>(".story-frame"), track = story.querySelector<HTMLElement>(".story-track"), win = story.querySelector<HTMLElement>(".story-window");
    const stacked = matchMedia("(max-width: 860px)"); // Where the cards run top to bottom. The same width as in sections.css.
    const scenes = [...story.querySelectorAll<HTMLElement>("[data-scene]")];
    const marks = [...story.querySelectorAll<HTMLElement>("[data-mark]")];
    const touch = matchMedia("(hover: none) and (pointer: coarse)").matches; // A phone's GPU can't blur a whole card every frame, so there it only fades and moves.
    // Each value is written only on what reads it. Set on the section, it would restyle every element inside on every frame.
    const drawn = story.querySelector<HTMLElement>(".story-rule-drawn"), present = story.querySelector<HTMLElement>(".story-figure");
    const drifting = scenes.map((scene) => [...scene.querySelectorAll<HTMLElement>(".story-wire, .story-canvas")]);

    // Where the stage pins (px from the top), its place in the section, and how much scroll the film takes.
    let raf = 0, on = false, lastHere = -1, pinTop = 0, stageAt = 0, film = 0, sized = innerWidth, headRoom = 0, spare: number[] = [];
    const clear = () => {
      on = false; lastHere = -1; clock.current.live = false;
      headRoom = 0; spare = []; clock.current.from = [];
      delete story.dataset.cine; delete story.dataset.pan; delete story.dataset.slide; delete story.dataset.holdStart; delete story.dataset.holdLength;
      for (const name of ["--stage-top", "--window-h", "height"]) story.style.removeProperty(name);
      drawn?.style.removeProperty("--story-drawn"); present?.style.removeProperty("--now"); hint?.style.removeProperty("--hint");
      for (const el of drifting.flat()) el.style.removeProperty("--drift");
      for (const el of [...scenes, frame, track, head]) el?.removeAttribute("style");
      for (const mark of marks) { delete mark.dataset.state; mark.removeAttribute("aria-current"); }
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
        scene.style.visibility = hidden ? "hidden" : "";
        if (hidden) return;
        scene.style.filter = touch || look.blur < 0.05 ? "none" : `blur(${look.blur.toFixed(2)}px)`;
        const y = look.y - (spare[i] ?? 0) * scenePan(progress, i, count);
        scene.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(${look.scale.toFixed(4)})`;
        for (const el of drifting[i] ?? []) el.style.setProperty("--drift", look.drift.toFixed(3));
      });
      if (head && headRoom) head.style.opacity = Math.min(1, Math.max(0, ahead / headRoom)).toFixed(3); // It's on its way out from under the header, so it fades before it gets there.
      const whole = frameLook(ahead, ahead + film + innerHeight, innerHeight);
      clock.current.settled = whole.opacity > 0.95;
      for (const el of [frame, track]) {
        if (!el) continue;
        el.style.opacity = whole.opacity.toFixed(3);
        el.style.filter = touch || whole.blur < 0.05 ? "none" : `blur(${whole.blur.toFixed(2)}px)`;
        el.style.transform = whole.y < 0.05 ? "none" : `translate3d(0,${whole.y.toFixed(2)}px,0) scale(${whole.scale.toFixed(4)})`;
      }
      drawn?.style.setProperty("--story-drawn", lineProgress(progress, count).toFixed(4));
      present?.style.setProperty("--now", figurePresence(progress, count).toFixed(3));
      hint?.style.setProperty("--hint", (1 - Math.min(1, Math.max(0, (progress - 0.94) / 0.05))).toFixed(3)); // The scroll hint stays through every chapter, and fades only as the last one ends.
      const here = currentScene(progress, count);
      if (here === lastHere) return;
      lastHere = here;
      marks.forEach((mark, i) => {
        mark.dataset.state = i === here ? "here" : i < here ? "past" : "next";
        if (i === here) mark.setAttribute("aria-current", "step"); else mark.removeAttribute("aria-current");
      });
    };
    const onScroll = () => { raf ||= requestAnimationFrame(draw); };
    /** Pins if the whole stage fits below the header, centered there, so the section above sits at the usual distance. If the cards are stacked and it doesn't fit, it pins the sheet alone instead, and the cards slide inside it. */
    const fit = () => {
      if (!stage || !frame || !track || !win) return;
      clear();
      sized = innerWidth;
      story.dataset.cine = "";
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
      let h = stage.offsetHeight;
      const room = innerHeight - header, hintH = hint ? hint.offsetHeight + 6 : 0;
      const tighten = (scene: HTMLElement, { k, g }: (typeof FIT_STEPS)[number]) => { scene.style.setProperty("--story-k", String(k)); scene.style.setProperty("--story-g", String(g)); };
      // Stacked cards tighten together first, if that keeps the heading on screen with them.
      if (stacked.matches) for (const step of FIT_STEPS) {
        scenes.forEach((scene) => tighten(scene, step));
        h = stage.offsetHeight;
        if (h + hintH <= room - 12) break;
      }
      if (h + hintH <= room - 12) pinTop = header + (room - h - hintH) / 2;
      else {
        if (!stacked.matches) { clear(); return; }
        const below = track.getBoundingClientRect().bottom - win.getBoundingClientRect().bottom + hintH;
        const chrome = win.getBoundingClientRect().top - frame.getBoundingClientRect().top + below;
        const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--content-fade")) || 8; // Clear of the page's fade under the header.
        const avail = room - gap - 8 - chrome;
        if (avail < MIN_WINDOW) { clear(); return; }
        story.dataset.pan = ""; // From here each card is its own height, so it can be measured alone.
        // Tighten each card a step at a time until it fits, so a long one doesn't shrink the rest, and a card only slides on a screen too small for that.
        for (const scene of scenes) for (const step of FIT_STEPS) {
          tighten(scene, step);
          if (scene.offsetHeight <= avail) break;
        }
        const shown = Math.min(avail, Math.max(...scenes.map((scene) => scene.offsetHeight)));
        story.style.setProperty("--window-h", `${Math.round(shown)}px`);
        spare = scenes.map((scene) => Math.max(0, scene.offsetHeight - shown));
        story.dataset.slide = String(Math.max(...spare)); // For the responsive gate.
        // A figure below the fold starts its drawing when it slides into view, not before.
        clock.current.from = scenes.map((scene, i) => {
          const fig = scene.querySelector<HTMLElement>(".story-fig");
          if (!fig) return null;
          const box = fig.getBoundingClientRect();
          return figureInView(box.top - scene.getBoundingClientRect().top + box.height * 0.6 - shown, spare[i] ?? 0, i, count);
        });
        h = stage.offsetHeight;
        headRoom = frame.getBoundingClientRect().top - stage.getBoundingClientRect().top;
        pinTop = header + gap + (avail - shown) / 2 - headRoom;
      }
      stageAt = stage.offsetTop;
      film = innerHeight * count * pace;
      // No card slides faster than the finger: a tall card on a small screen gets more scroll.
      const need = Math.max(0, ...spare);
      if (need > panRoom(film / count)) film = (need / panRoom(1)) * count;
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
      clock.current.restarts++;
      const ahead = story.getBoundingClientRect().top + stageAt - pinTop;
      page.scrollTo({ top: page.scrollTop + ahead + film * sceneTarget(Number(mark.dataset.mark), count), behavior: "smooth" });
    };

    fit();
    void document.fonts?.ready.then(fit);
    page.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { if (innerWidth !== sized || !on) fit(); }; // A phone's browser bar coming and going changes only the height, and refitting then would jump the page.
    addEventListener("resize", onResize);
    story.addEventListener("click", jump);
    return () => {
      cancelAnimationFrame(raf);
      page.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      story.removeEventListener("click", jump);
      clear();
    };
  }, [count, pace]);

  return <section ref={ref} id={id} className="story">{children}</section>;
}
