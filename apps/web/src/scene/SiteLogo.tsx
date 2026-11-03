"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, type PointerEvent, useEffect, useId, useRef } from "react";
import type { LogoSettings } from "@portfolio/content/schema";

import {
  BLADE, BLADE_ANGLE, BLADE_SHADOW, BLADE_SIDE, BLADE_VISIBLE, CRACKS, ENTRY, FLECK, FLIGHT, FRAME, GEIST, GUIDES, CHIPS,
  LETTER_HATCH, LETTERS, PLATE, PLATE_HATCH, PLATE_SHADOW, SLIT_LINE,
} from "./logo-drawing";
import { BLANK, introScene, isLodged, PLATE_ONLY, pullScene, REST, rethrowScene, throwScene, Timeline, type LogoView, view } from "./logo-motion";

/* The logo: SP on a square blueprint plate, the height of a header button, with a batarang thrown into the P.
   The svg's box is just the plate, so the header lines up, and the batarang hangs outside it.
   Every option is in `site.logo` (content/site.ts), typed by the schema. The geometry is in logo-drawing.ts, the motion in logo-motion.ts. */

type Props = {
  settings: LogoSettings;
  /** The site-wide motion flag. Off, or with reduced motion asked for, the logo stays finished and still. */
  motion: boolean;
};

type Parts = Record<string, SVGElement[]>;
const style = (el: SVGElement | undefined, key: string, value: string | number) => el?.style.setProperty(key, String(value));

/** Puts a view on the drawing. The server's markup is the same view of the finished logo, so the two always agree. */
function paint(p: Parts, v: LogoView) {
  p.frame?.forEach((el, i) => style(el, "stroke-dashoffset", v.frame[i]!));
  style(p.plateShadow?.[0], "opacity", v.plateShadow);
  style(p.plateHatch?.[0], "opacity", v.plateHatch);
  p.guide?.forEach((el, i) => style(el, "stroke-dashoffset", v.guides[i]!));
  style(p.guides?.[0], "opacity", v.guidesOpacity);
  p.letter?.forEach((el, i) => style(el, "stroke-dashoffset", v.letters[i]!));
  style(p.geist?.[0], "opacity", v.geist.opacity);
  p.blur?.[0]?.setAttribute("stdDeviation", String(v.geist.blur));
  p.depth?.[0]?.setAttribute("transform", v.depth.transform);
  style(p.depth?.[0], "opacity", v.depth.opacity);
  style(p.flightMask?.[0], "stroke-dashoffset", v.flight.dash);
  style(p.flight?.[0], "opacity", v.flight.opacity);
  style(p.target?.[0], "opacity", v.target.opacity);
  p.ring?.[0]?.setAttribute("r", String(v.target.r));
  style(p.slit?.[0], "opacity", v.slit);
  p.crack?.forEach((el, i) => { style(el, "stroke-dashoffset", v.cracks[i]!.dash); style(el, "opacity", v.cracks[i]!.opacity); });
  for (const el of [...(p.blade ?? []), ...(p.bladeShadow ?? [])]) { el.setAttribute("transform", v.blade.transform); style(el, "opacity", v.blade.opacity); }
  p.chip?.forEach((el, i) => { el.setAttribute("transform", v.chips[i]!.transform); style(el, "opacity", v.chips[i]!.opacity); });
}

const PART_KEYS = ["frame", "plateShadow", "plateHatch", "guide", "guides", "letter", "geist", "blur", "depth", "flightMask", "flight", "target", "ring", "slit", "crack", "blade", "bladeShadow", "chip"] as const;

export function SiteLogo({ settings, motion }: Props) {
  const id = `logo${useId().replace(/[^\w-]/g, "")}`;
  const host = useRef<HTMLAnchorElement>(null);
  const hover = useRef<() => void>(() => {});
  const v = view(REST);

  useEffect(() => {
    const el = host.current, svg = el?.querySelector("svg"), page = document.getElementById("page");
    if (!el || !svg || !motion || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const parts: Parts = Object.fromEntries(PART_KEYS.map((k) => [k, Array.from(svg.querySelectorAll<SVGElement>(`[data-r="${k}"]`))]));
    const { intro, spins, speed, scroll } = settings;
    const timeline = new Timeline(intro ? BLANK : PLATE_ONLY);

    let raf = 0, last = 0;
    const frame = (now: number) => {
      const going = timeline.advance((now - last) * speed);
      last = now;
      paint(parts, view(timeline.state));
      raf = going ? requestAnimationFrame(frame) : 0;
    };
    const play = (scene: Parameters<Timeline["play"]>[0]) => {
      timeline.play(scene);
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };

    paint(parts, view(timeline.state));
    el.dataset.live = "";

    const atTopNow = () => (page?.scrollTop ?? 0) < scroll.threshold;
    let atTop = atTopNow();
    // Landing part way down the page, with pull on, draws the plate and leaves the batarang out until the top.
    play(intro ? introScene(spins, atTop || !scroll.pull) : atTop || !scroll.pull ? throwScene(spins) : []);

    const onScroll = () => {
      const top = atTopNow();
      if (top === atTop) return;
      atTop = top;
      if (top) { if (!isLodged(timeline.state)) play(throwScene(spins)); }
      else if (timeline.state.blade > 0 || timeline.busy) play(pullScene());
    };
    if (scroll.pull) page?.addEventListener("scroll", onScroll, { passive: true });
    hover.current = () => { if (settings.hover && !timeline.busy) play(rethrowScene(timeline.state, spins)); };

    return () => {
      cancelAnimationFrame(raf);
      page?.removeEventListener("scroll", onScroll);
      hover.current = () => {};
      delete el.dataset.live;
    };
  }, [settings, motion]);

  // On the home page it glides back to the top; anywhere else it's a plain link home.
  const path = usePathname();
  const toTop = (e: MouseEvent) => {
    if (path !== "/" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const still = !motion || matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("page")?.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
  };
  const onEnter = (e: PointerEvent) => { if (e.pointerType !== "touch") hover.current(); };

  const { w, h } = PLATE;
  const drafted = settings.lettering === "drafted";
  const geistText = { x: GEIST.x, y: GEIST.y, textAnchor: "middle", style: { font: `500 ${GEIST.size}px var(--sans)`, letterSpacing: GEIST.tracking } } as const;
  const dash = (offset: number) => ({ pathLength: 1, strokeDasharray: "1 2", style: { strokeDashoffset: offset } });

  return (
    <Link
      ref={host} href="/" className="site-logo" aria-label="Home" onClick={toTop} onPointerEnter={onEnter}
      data-blade={settings.blade} data-intro={settings.intro && motion ? "" : undefined}
    >
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true" fill="none">
        <defs>
          <linearGradient id={`${id}-rise`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".55" stopColor="#000" />
          </linearGradient>
          <mask id={`${id}-texture`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}><rect width={w} height={h} fill={`url(#${id}-rise)`} /></mask>
          <clipPath id={`${id}-visible`}><polygon points={BLADE_VISIBLE} /></clipPath>
          <clipPath id={`${id}-blade`}><path d={BLADE.shape} /></clipPath>
          {settings.aim && (
            <mask id={`${id}-flight`} maskUnits="userSpaceOnUse" x="-20" y="-40" width="100" height="100">
              <path data-r="flightMask" d={FLIGHT} stroke="#fff" strokeWidth="3" {...dash(v.flight.dash)} />
            </mask>
          )}
          {settings.depth && (drafted ? (
            <>
              <mask id={`${id}-depth-fill`} maskUnits="userSpaceOnUse" x="-5" y="-5" width="50" height="50">
                {LETTERS.map((d) => <path key={d} d={d} stroke="#fff" strokeWidth="1.75" strokeLinejoin="miter" />)}
              </mask>
              <mask id={`${id}-depth-ring`} maskUnits="userSpaceOnUse" x="-5" y="-5" width="50" height="50">
                {LETTERS.map((d) => <path key={d} d={d} stroke="#fff" strokeWidth="2.25" strokeLinejoin="miter" />)}
                {LETTERS.map((d) => <path key={`${d}-in`} d={d} stroke="#000" strokeWidth="1.25" strokeLinejoin="miter" />)}
              </mask>
            </>
          ) : (
            <clipPath id={`${id}-depth-text`}><text {...geistText}>SP</text></clipPath>
          ))}
          {!drafted && <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur data-r="blur" stdDeviation={v.geist.blur} /></filter>}
        </defs>

        {/* The plate. */}
        <path data-r="plateShadow" d={PLATE_SHADOW} stroke="var(--line)" strokeWidth=".75" style={{ opacity: v.plateShadow }} />
        <rect width={w} height={h} fill="var(--bp-face, transparent)" />
        <g data-r="plateHatch" mask={`url(#${id}-texture)`} style={{ opacity: v.plateHatch }}><path d={PLATE_HATCH} stroke="var(--line)" strokeWidth=".55" /></g>
        {FRAME.map((d, i) => <path key={d} data-r="frame" d={d} stroke="var(--line)" strokeWidth="1" {...dash(v.frame[i]!)} />)}

        {settings.guides && (
          <g data-r="guides" style={{ opacity: v.guidesOpacity }}>
            {GUIDES.map((d, i) => <path key={d} data-r="guide" d={d} stroke="var(--line)" strokeWidth=".35" {...dash(v.guides[i]!)} />)}
          </g>
        )}

        {/* The letters' depth: a wireframe copy set back, faintly hatched. */}
        {settings.depth && (
          <g data-r="depth" transform={v.depth.transform} style={{ opacity: v.depth.opacity }}>
            {drafted ? (
              <>
                <rect x="-5" y="-5" width="50" height="50" fill="var(--line)" mask={`url(#${id}-depth-ring)`} opacity=".6" />
                <g mask={`url(#${id}-depth-fill)`}><path d={LETTER_HATCH} stroke="var(--line)" strokeWidth=".3" opacity=".55" /></g>
              </>
            ) : (
              <>
                <text {...geistText} stroke="var(--line)" strokeWidth=".4" opacity=".6">SP</text>
                <g clipPath={`url(#${id}-depth-text)`}><path d={LETTER_HATCH} stroke="var(--line)" strokeWidth=".3" opacity=".55" /></g>
              </>
            )}
          </g>
        )}

        {drafted
          ? LETTERS.map((d, i) => <path key={d} data-r="letter" d={d} stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="butt" strokeLinejoin="miter" {...dash(v.letters[i]!)} />)
          : <text data-r="geist" {...geistText} fill="var(--ink)" filter={`url(#${id}-blur)`} style={{ ...geistText.style, opacity: v.geist.opacity }}>SP</text>}

        {/* The cut it makes in the letter: a pale notch, with splits running back into the stroke. */}
        <g className="logo-hit">
          <path data-r="slit" d={SLIT_LINE} stroke="var(--paper)" strokeWidth=".75" style={{ opacity: v.slit }} />
          {CRACKS.map((d, i) => <path key={d} data-r="crack" d={d} stroke="var(--paper)" strokeWidth=".45" pathLength={1} strokeDasharray="1 2" style={{ strokeDashoffset: v.cracks[i]!.dash, opacity: v.cracks[i]!.opacity }} />)}
        </g>

        {settings.aim && (
          <>
            <g data-r="flight" mask={`url(#${id}-flight)`} style={{ opacity: v.flight.opacity }}><path d={FLIGHT} stroke="var(--line-rest)" strokeWidth=".5" strokeDasharray="1.4 1.2" /></g>
            <g data-r="target" stroke="var(--accent)" strokeWidth=".5" style={{ opacity: v.target.opacity }}>
              <circle data-r="ring" cx={ENTRY.x} cy={ENTRY.y} r={v.target.r} />
              <path d={`M${ENTRY.x - 3.6} ${ENTRY.y}H${ENTRY.x - 2.4}M${ENTRY.x + 2.4} ${ENTRY.y}H${ENTRY.x + 3.6}M${ENTRY.x} ${ENTRY.y - 3.6}V${ENTRY.y - 2.4}M${ENTRY.x} ${ENTRY.y + 2.4}V${ENTRY.y + 3.6}`} />
            </g>
          </>
        )}

        {/* The blade's shadow on the plate, then the blade. Both stop where it goes into the letter. */}
        <g className="logo-hit" clipPath={`url(#${id}-visible)`}>
          <g transform={`matrix(${BLADE_SHADOW})`}>
            <g data-r="bladeShadow" transform={v.blade.transform} style={{ opacity: v.blade.opacity }}>
              <g transform={`rotate(${BLADE_ANGLE})`}>
                <path d={BLADE.shape} fill="var(--line)" opacity=".09" />
                <path d={BLADE.edge} stroke="var(--line)" strokeWidth=".45" opacity=".5" />
              </g>
            </g>
          </g>
        </g>
        <g className="logo-hit" clipPath={`url(#${id}-visible)`}>
          <g data-r="blade" transform={v.blade.transform} style={{ opacity: v.blade.opacity }}>
            <g transform={`rotate(${BLADE_ANGLE})`} strokeLinejoin="round">
              {settings.blade === "outline" ? (
                <>
                  <path d={BLADE.edge} stroke="var(--line)" strokeWidth=".7" opacity=".45" transform="translate(.9 1.2)" />
                  <path d={BLADE.shape} fill="var(--accent)" opacity=".16" />
                  <g clipPath={`url(#${id}-blade)`}><path d={BLADE.hatch} stroke="var(--accent)" strokeWidth=".35" opacity=".3" /></g>
                  <path d={BLADE.bevel} stroke="var(--accent)" strokeWidth=".35" opacity=".45" />
                  <path d={BLADE.edge} stroke="var(--accent)" strokeWidth="1" />
                </>
              ) : (
                <>
                  {/* A solid plate: its side, stacked so the thickness reads as solid, the face, a pale bevel, and a thin edge. */}
                  {BLADE_SIDE.map((t) => <path key={t} d={BLADE.shape} fill="var(--logo-blade-side)" transform={t} />)}
                  <path d={BLADE.shape} fill="var(--logo-blade-face)" />
                  <path d={BLADE.bevel} stroke="var(--logo-blade-bevel)" strokeWidth=".45" />
                  <path d={BLADE.shape} stroke="var(--logo-blade-edge)" strokeWidth=".45" />
                </>
              )}
            </g>
          </g>
        </g>

        {CHIPS.map((_, i) => <path key={i} data-r="chip" d={FLECK} stroke="var(--ink)" strokeWidth=".55" transform={v.chips[i]!.transform} style={{ opacity: v.chips[i]!.opacity }} />)}
      </svg>
    </Link>
  );
}
