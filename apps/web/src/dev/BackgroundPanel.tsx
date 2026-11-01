"use client";

/**
 * Temporary, for trying settings while components get wired up. Not part of the site.
 * To remove it: delete this folder, its one line in app/layout.tsx and the backgroundPanel flag.
 * Its test text is only here so scrolling can be judged. It never goes on the site.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PALETTE_IDS, pickBackground, selectBackground, type BackgroundMode, type PaletteId } from "@portfolio/design";
import { SCENE_OPTIONS } from "@portfolio/content/scene-options";
import { BUTTON_OPTIONS } from "@portfolio/design/button-options";
import "./background-panel.css";

const GRAIN = { Theme: null, Off: "0", Low: ".3", High: ".85" };
type SceneKey = keyof typeof SCENE_OPTIONS;
const SCENE_KEYS = Object.keys(SCENE_OPTIONS) as SceneKey[];
const LABEL: Record<SceneKey, string> = { fit: "Fit", face: "Face", density: "Density", reach: "Reach", strength: "City", contentFade: "Fade", parallax: "Parallax" };

// Variant and size change only the Projects button, so the logo stays as it is.
const BUTTON_KEYS = ["variant", "size", "texture", "shadow", "hover", "press", "sway"] as const;
type ButtonKey = (typeof BUTTON_KEYS)[number];
const FONTS = {
  barlow: ["var(--font-label)", ".09em", "16px"],
  chakra: ["var(--font-chakra)", ".05em", "14.5px"],
  saira: ["var(--font-saira)", ".07em", "14.5px"],
} as const;

export function BackgroundPanel() {
  const [open, setOpen] = useState(true);
  const [palette, setPalette] = useState<PaletteId | null>(null);
  const [grain, setGrain] = useState<keyof typeof GRAIN>("Theme");
  const [sun, setSun] = useState(true);
  const [text, setText] = useState(true);
  const [scene, setScene] = useState<Partial<Record<SceneKey, string>>>({});
  const [page, setPage] = useState<HTMLElement | null>(null);
  const [button, setButton] = useState<Partial<Record<ButtonKey, string>>>({});
  const [font, setFont] = useState<keyof typeof FONTS>("barlow");

  useEffect(() => {
    const d = document.documentElement.dataset;
    setPalette(d.palette as PaletteId);
    setScene(Object.fromEntries(SCENE_KEYS.map((k) => [k, d[k]])));
    setPage(document.getElementById("page"));
    const projects = document.querySelector<HTMLElement>("[data-tower]");
    setButton(Object.fromEntries(BUTTON_KEYS.map((k) => [k, projects?.dataset[k]])));
  }, []);

  const override = (name: string, value: string | null) => {
    const { style } = document.documentElement;
    if (value === null) style.removeProperty(name);
    else style.setProperty(name, value);
  };
  const run = (mode: BackgroundMode) => setPalette(selectBackground(mode));
  const setSceneOption = (key: SceneKey, value: string) => {
    document.documentElement.dataset[key] = value;
    setScene((s) => ({ ...s, [key]: value }));
  };

  const setButtonOption = (key: ButtonKey, value: string) => {
    const one = key === "variant" || key === "size";
    document.querySelectorAll<HTMLElement>(one ? "[data-tower]" : ".site-header .bp").forEach((el) => { el.dataset[key] = value; });
    setButton((b) => ({ ...b, [key]: value }));
    if (key === "size") document.documentElement.dataset.fit = document.documentElement.dataset.fit; // the tower follows the button's new width
  };
  const pickFont = (name: keyof typeof FONTS) => {
    const [family, track, size] = FONTS[name], { style } = document.querySelector(".site-header") as HTMLElement;
    style.setProperty("--label", `${family}, sans-serif`); style.setProperty("--track", track); style.setProperty("--size", size);
    setFont(name);
  };

  return (
    <aside className="background-panel" aria-label="Background controls, temporary">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Hide" : "Controls"}</button>
      {open && (
        <>
          <div role="group" aria-label="Theme">
            {PALETTE_IDS.map((id) => (
              <button key={id} type="button" aria-pressed={palette === id} onClick={() => setPalette(pickBackground(id))}>{id}</button>
            ))}
          </div>
          <div role="group" aria-label="Rotate">
            <button type="button" onClick={() => run("next")}>Next</button>
            <button type="button" onClick={() => run("random")}>Random</button>
            <button type="button" onClick={() => run("config")}>Default</button>
          </div>
          {SCENE_KEYS.map((key) => (
            <div key={key} role="group" aria-label={LABEL[key]}>
              <span>{LABEL[key]}</span>
              {SCENE_OPTIONS[key].map((value) => (
                <button key={value} type="button" aria-pressed={scene[key] === value} onClick={() => setSceneOption(key, value)}>{value}</button>
              ))}
            </div>
          ))}
          <hr />
          {BUTTON_KEYS.map((key) => (
            <div key={key} role="group" aria-label={`Button ${key}`}>
              <span>{key}</span>
              {BUTTON_OPTIONS[key].map((value) => (
                <button key={value} type="button" aria-pressed={button[key] === value} onClick={() => setButtonOption(key, value)}>{value}</button>
              ))}
            </div>
          ))}
          <div role="group" aria-label="Button font">
            <span>font</span>
            {(Object.keys(FONTS) as (keyof typeof FONTS)[]).map((name) => (
              <button key={name} type="button" aria-pressed={font === name} onClick={() => pickFont(name)}>{name}</button>
            ))}
          </div>
          <hr />
          <div role="group" aria-label="Grain">
            <span>Grain</span>
            {(Object.keys(GRAIN) as (keyof typeof GRAIN)[]).map((level) => (
              <button key={level} type="button" aria-pressed={grain === level} onClick={() => { setGrain(level); override("--grain", GRAIN[level]); }}>{level}</button>
            ))}
          </div>
          <div role="group" aria-label="Sun glow">
            <span>Sun</span>
            <button type="button" aria-pressed={sun} onClick={() => { setSun(true); override("--glow", null); }}>On</button>
            <button type="button" aria-pressed={!sun} onClick={() => { setSun(false); override("--glow", "transparent"); }}>Off</button>
          </div>
          <div role="group" aria-label="Test text">
            <span>Test text</span>
            <button type="button" aria-pressed={text} onClick={() => setText(true)}>On</button>
            <button type="button" aria-pressed={!text} onClick={() => setText(false)}>Off</button>
          </div>
        </>
      )}
      {text && page && createPortal(
        <div className="test-text">
          {Array.from({ length: 120 }, (_, i) => (
            <p key={i}>Test text from the control panel, only to judge how scrolling and the fade behave. It isn&apos;t on the site.</p>
          ))}
        </div>,
        page,
      )}
    </aside>
  );
}
