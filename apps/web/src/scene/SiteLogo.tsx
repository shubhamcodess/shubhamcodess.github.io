"use client";

import Link from "next/link";
import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { BLADE, BLADE_ANGLE, BLADE_TILT, BLADE_VISIBLE, CRACKS, FLECK, LODGED, LOGO, PLATE, SLIT_LINE } from "./logo-drawing";

/* The logo: SP on a blueprint plate the same height as a header button, with a batarang thrown into its face from a short way off.
   The svg's box is just the plate, so the header lines up, and the batarang hangs outside it. */

// It flies along its own wing line, tip first.
const FLIGHT = { x: 26, y: -18 };
const CHIPS = [[-5, -7], [1, -9], [6, -6], [-8, -2]] as const;
const HIT = 0.46; // seconds until it strikes

export function SiteLogo() {
  const still = useReducedMotion();
  const [take, setTake] = useState(0);
  // The server sends the finished logo, so it's right before any script runs. The throw plays once it's here.
  useEffect(() => { if (!still) setTake(1); }, [still]);
  const replay = () => { if (!still) setTake((n) => n + 1); };

  const playing = take > 0;
  return (
    <LazyMotion features={domAnimation}>
      <Link href="/" className="site-logo" aria-label="Home" data-thrown={playing || undefined} onPointerEnter={(e) => { if (e.pointerType !== "touch") replay(); }}>
        <svg viewBox={`0 0 ${PLATE.w} ${PLATE.h}`} width={PLATE.w} height={PLATE.h} aria-hidden="true" fill="none" strokeLinejoin="round">
          <defs>
            <linearGradient id="logo-rise" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#fff" />
              <stop offset=".55" stopColor="#000" />
            </linearGradient>
            <mask id="logo-texture" maskUnits="userSpaceOnUse" x="0" y="0" width={PLATE.w} height={PLATE.h}>
              <rect width={PLATE.w} height={PLATE.h} fill="url(#logo-rise)" />
            </mask>
            <clipPath id="logo-visible"><polygon points={BLADE_VISIBLE} /></clipPath>
            <clipPath id="logo-blade"><path d={BLADE.shape} /></clipPath>
          </defs>

          {/* The plate takes the blow. */}
          <m.g
            key={`plate-${take}`}
            initial={false}
            animate={playing ? { x: [0, -1, 0.5, -0.2, 0], y: [0, 0.8, -0.3, 0.1, 0] } : undefined}
            transition={{ delay: HIT, duration: 0.4, ease: "easeOut" }}
          >
            <path d={LOGO.shadow} stroke="var(--line)" strokeWidth=".75" opacity=".5" />
            <rect width={PLATE.w} height={PLATE.h} fill="var(--bp-face, transparent)" />
            <g mask="url(#logo-texture)">
              <path d={LOGO.hatch} stroke="var(--line)" strokeWidth=".6" opacity=".55" />
            </g>
            <path d={LOGO.frame} stroke="var(--line)" strokeWidth="1" />
            <text className="site-logo-text" x="7" y="28.4">SP</text>
            {/* The mark it leaves, drawn on the instant it lands. */}
            <g className="logo-hit">
              <m.path key={`slit-${take}`} d={SLIT_LINE} stroke="var(--ink)" strokeWidth="1.2" initial={playing ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: HIT, duration: 0.05 }} />
              {CRACKS.map((d, i) => (
                <m.path key={`${d}-${take}`} d={d} stroke="var(--ink)" strokeWidth=".7" initial={playing ? { pathLength: 0, opacity: 0 } : false} animate={{ pathLength: 1, opacity: 0.85 }} transition={{ delay: HIT + i * 0.02, duration: 0.14 }} />
              ))}
            </g>
          </m.g>

          <g className="logo-hit" clipPath="url(#logo-visible)">
            <g transform={`translate(${LODGED.x.toFixed(2)} ${LODGED.y.toFixed(2)})`}>
              {/* It quivers from its buried tip. The tip is about a wing's length from the centre, and this group turns about its own middle. */}
              <m.g
                key={`quiver-${take}`}
                initial={false}
                animate={playing ? { rotate: [0, -5, 3.5, -2, 1, 0] } : undefined}
                transition={{ delay: HIT, duration: 0.6, ease: "easeOut" }}
              >
                <rect x={-16 - 70} y={7 - 70} width="140" height="140" />
                <m.g
                  key={`flight-${take}`}
                  initial={playing ? { x: FLIGHT.x, y: FLIGHT.y, opacity: 0 } : false}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ x: { duration: HIT, ease: "easeIn" }, y: { duration: HIT, ease: "easeIn" }, opacity: { duration: 0.08 } }}
                >
                  <g transform={`matrix(${BLADE_TILT.join(" ")} 0 0)`}>
                    <m.g
                      key={`spin-${take}`}
                      initial={playing ? { rotate: 540 } : false}
                      animate={{ rotate: 0 }}
                      transition={{ duration: HIT, ease: "easeIn" }}
                    >
                      <rect x="-40" y="-40" width="80" height="80" />
                      <g transform={`rotate(${BLADE_ANGLE})`}>
                        {/* Its thickness, then the face: a faint tint, faint hatching, a bevel and a clean edge. */}
                        <path d={BLADE.edge} stroke="var(--line)" strokeWidth=".7" opacity=".45" transform="translate(.9 1.2)" />
                        <path d={BLADE.shape} fill="var(--accent)" opacity=".16" />
                        <g clipPath="url(#logo-blade)">
                          <path d={BLADE.hatch} stroke="var(--accent)" strokeWidth=".35" opacity=".3" />
                        </g>
                        <path d={BLADE.bevel} stroke="var(--accent)" strokeWidth=".45" opacity=".65" />
                        <path d={BLADE.edge} stroke="var(--accent)" strokeWidth="1.2" />
                      </g>
                    </m.g>
                  </g>
                </m.g>
              </m.g>
            </g>
          </g>

          {/* Flecks of the plate, thrown back along the batarang's path. */}
          {playing && CHIPS.map(([dx, dy], i) => (
            <m.path key={`${i}-${take}`} d={FLECK} stroke="var(--ink)" strokeWidth=".6" initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: [0, 1, 0], x: dx, y: dy }} transition={{ delay: HIT, duration: 0.5, ease: "easeOut" }} />
          ))}
        </svg>
      </Link>
    </LazyMotion>
  );
}
