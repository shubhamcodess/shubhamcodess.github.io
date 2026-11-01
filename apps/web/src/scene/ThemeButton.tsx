"use client";

import { useEffect, useRef, useState } from "react";
import { selectBackground } from "@portfolio/design";
import { Button, SketchIcon, type ButtonProps, type IconName } from "@portfolio/design/button";
import { Tooltip } from "@portfolio/design/tooltip";
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

  // A tap has no hover, so the new theme's name shows for a moment after each change.
  const [confirming, setConfirming] = useState(false);
  const pause = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(pause.current), []);
  const change = () => {
    selectBackground("next");
    setConfirming(true);
    clearTimeout(pause.current);
    pause.current = setTimeout(() => setConfirming(false), 1500);
  };

  const next = PALETTE_IDS[(PALETTE_IDS.indexOf(current) + 1) % PALETTE_IDS.length] as PaletteId;
  return (
    <Tooltip label={`Theme: ${palettes[current].name}`} align="end" open={confirming}>
      <Button
        {...style}
        className="theme-button"
        onClick={change}
        aria-label={`Theme: ${palettes[current].name}. Switch to ${palettes[next].name}.`}
        glyph={
          <span className="theme-icons">
            {PALETTE_IDS.map((id) => (
              <SketchIcon key={id} name={ICON_FOR[id] ?? "sunHaze"} className={`theme-icon theme-icon-${id}`} />
            ))}
          </span>
        }
      />
    </Tooltip>
  );
}
