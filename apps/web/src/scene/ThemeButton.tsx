"use client";

import { useEffect, useState } from "react";
import { selectBackground } from "@portfolio/design";
import { Button, SketchIcon, type ButtonProps, type IconName } from "@portfolio/design/button";
import { PALETTE_IDS, palettes, type PaletteId } from "@portfolio/design/palettes";

/* One sun, shifting a little for each theme. A new theme without an entry here simply gets the plain hazy sun. */
const ICON_FOR: Partial<Record<PaletteId, IconName>> = { dust: "sunHaze", sodium: "sunLow", smog: "sunCloud", storm: "sunStorm", oldGotham: "sunCity" };

export function ThemeButton({ initial, ...style }: { initial: PaletteId } & Pick<ButtonProps, "texture" | "shadow" | "hover" | "press" | "sway" | "variant" | "size">) {
  const [current, setCurrent] = useState(initial);

  // Follows the page, not just this button: the boot script or anything else may have set the theme.
  useEffect(() => {
    const root = document.documentElement, sync = () => setCurrent(root.dataset.palette as PaletteId);
    sync();
    const watch = new MutationObserver(sync);
    watch.observe(root, { attributes: true, attributeFilter: ["data-palette"] });
    return () => watch.disconnect();
  }, []);

  const next = PALETTE_IDS[(PALETTE_IDS.indexOf(current) + 1) % PALETTE_IDS.length] as PaletteId;
  return (
    <Button
      {...style}
      className="theme-button"
      onClick={() => selectBackground("next")}
      aria-label={`Theme: ${palettes[current].name}. Switch to ${palettes[next].name}.`}
      title={`Theme: ${palettes[current].name}`}
      glyph={
        <span className="theme-icons">
          {PALETTE_IDS.map((id) => (
            <SketchIcon key={id} name={ICON_FOR[id] ?? "sunHaze"} className={`theme-icon theme-icon-${id}`} />
          ))}
        </span>
      }
    />
  );
}
