"use client";

/**
 * Temporary, for trying background settings while components get wired up. Not part of the site.
 * To remove it: delete this folder, its one line in app/layout.tsx and the backgroundPanel flag.
 */
import { useEffect, useState } from "react";
import { PALETTE_IDS, pickBackground, selectBackground, type BackgroundMode, type PaletteId } from "@portfolio/design";
import "./background-panel.css";

const GRAIN = { Theme: null, Off: "0", Low: ".3", High: ".85" };

export function BackgroundPanel() {
  const [open, setOpen] = useState(true);
  const [palette, setPalette] = useState<PaletteId | null>(null);
  const [grain, setGrain] = useState<keyof typeof GRAIN>("Theme");
  const [sun, setSun] = useState(true);

  useEffect(() => setPalette(document.documentElement.dataset.palette as PaletteId), []);

  const override = (name: string, value: string | null) => {
    const { style } = document.documentElement;
    if (value === null) style.removeProperty(name);
    else style.setProperty(name, value);
  };
  const run = (mode: BackgroundMode) => setPalette(selectBackground(mode));

  return (
    <aside className="background-panel" aria-label="Background controls, temporary">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Hide" : "Background"}</button>
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
        </>
      )}
    </aside>
  );
}
