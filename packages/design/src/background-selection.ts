import { PALETTE_IDS, type PaletteId } from "./palettes";

/**
 * The background selection: which daylight palette light mode is showing.
 * It lives in one place, the `data-palette` attribute on <html>, and CSS does the rest.
 *
 * A selector is one rule for choosing a palette. To add one, such as by time of day or
 * weather, add an entry to `selectors` and any new input it needs to BackgroundContext.
 * Nothing else changes. See docs/decisions/010-background-selection.md.
 */
export type BackgroundContext = {
  current: PaletteId;
  /** The palette named in content/site.ts. */
  configured: PaletteId;
  list: readonly PaletteId[];
};
export type BackgroundSelector = (context: BackgroundContext) => PaletteId;

export const selectors = {
  /** The configured default. */
  config: ({ configured }) => configured,
  /** The next palette in the list, for a visitor's click. */
  next: ({ current, list }) => list[(list.indexOf(current) + 1) % list.length] ?? current,
  /** One random pick that differs from the current palette. It never repeats on its own. */
  random: ({ current, list }) => {
    const others = list.filter((id) => id !== current);
    return others[Math.floor(Math.random() * others.length)] ?? current;
  },
} satisfies Record<string, BackgroundSelector>;

export type BackgroundMode = keyof typeof selectors;

const STORAGE_KEY = "background-selection";

/** Run a selector and show the result. For a future switch in the UI; nothing calls this yet. */
export function selectBackground(mode: BackgroundMode): PaletteId {
  const root = document.documentElement;
  const id = selectors[mode]({
    current: root.dataset.palette as PaletteId,
    configured: root.dataset.paletteDefault as PaletteId,
    list: PALETTE_IDS,
  });
  root.dataset.palette = id;
  try {
    if (mode === "config") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, id);
  } catch { /* storage can be blocked; the choice then lasts for this page only */ }
  return id;
}

/**
 * Runs in <head> before the first paint, so the page opens in the right palette with no flash.
 * A visitor's own choice wins. With onLoad "random" a new visit gets one pick, which holds across
 * its pages. A stored palette that no longer exists is ignored, leaving the configured default.
 */
export const backgroundBootScript = (onLoad: "config" | "random"): string => `(function(){
var list=${JSON.stringify(PALETTE_IDS)},key=${JSON.stringify(STORAGE_KEY)},known=function(p){return list.indexOf(p)>-1},p=null;
try{p=localStorage.getItem(key);
if(!known(p)&&${JSON.stringify(onLoad)}==="random"){p=sessionStorage.getItem(key);
if(!known(p)){p=list[Math.floor(Math.random()*list.length)];sessionStorage.setItem(key,p)}}}catch(e){}
if(known(p))document.documentElement.dataset.palette=p})()`;
