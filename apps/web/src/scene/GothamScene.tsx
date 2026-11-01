"use client";

import { useEffect, useRef } from "react";
import { palettes, type PaletteId } from "@portfolio/design/palettes";
import { mountGotham, SCENE_VALUES, type SceneSettings } from "./gotham/engine";

/** Everything is read from data attributes on <html>, so config and the control panel drive the scene the same way. */
function readSettings(): SceneSettings {
  const d = document.documentElement.dataset;
  const value = <K extends keyof SceneSettings>(key: K) => (SCENE_VALUES[key] as Record<string, number>)[d[key] ?? ""] ?? 1;
  return { depth: value("depth"), sway: value("sway"), haze: value("haze"), dust: value("dust"), density: value("density"), reach: value("reach"), word: value("word") };
}

const WATCHED = ["data-palette", "data-depth", "data-sway", "data-haze", "data-dust", "data-density", "data-reach", "data-word"];

export function GothamScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement, el = host.current, page = document.getElementById("page");
    if (!el || !page) return;
    const family = getComputedStyle(root).getPropertyValue("--font-sans").trim() || "sans-serif";
    const read = () => ({ palette: palettes[root.dataset.palette as PaletteId] ?? palettes.oldGotham, font: `${family}, sans-serif`, settings: readSettings() });
    let scene: ReturnType<typeof mountGotham> | undefined, gone = false;
    let watch: MutationObserver | undefined;
    // The name on Wayne Tower and the word GOTHAM are drawn into the art, so wait for the font.
    // Not forever, and a font that fails to load must never stop the city: the lettering just uses the fallback.
    const ready = Promise.race([document.fonts.load(`700 40px ${family}`).catch(() => undefined), new Promise((done) => setTimeout(done, 1500))]);
    void ready.then(() => {
      if (gone) return;
      scene = mountGotham(el, page, read);
      watch = new MutationObserver(() => scene?.update());
      watch.observe(root, { attributes: true, attributeFilter: WATCHED });
    });
    return () => { gone = true; watch?.disconnect(); scene?.destroy(); };
  }, []);

  return <div ref={host} id="scene" aria-hidden="true" />;
}
