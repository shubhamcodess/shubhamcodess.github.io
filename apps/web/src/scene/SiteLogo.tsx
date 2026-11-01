"use client";

import Link from "next/link";
import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { BLADE, BLADE_ANGLE, BLADE_TILT, BLADE_TIP, LOGO, LOGO_DEPTH } from "./logo-drawing";

/* The logo: SP as a blueprint drawing on a skewed plane, with a batarang thrown into the top of the P from a short way off. */
const PLANE = "matrix(1 -.1 .2 1 3 9)";
const HIT_AT = { x: 40, y: 2.6 }; // where the wing tip ends up, inside the top of the P
const LODGED = { x: HIT_AT.x - BLADE_TIP.x, y: HIT_AT.y - BLADE_TIP.y };

// It flies along its own line, wing tip first. Only that tip ends up buried: the clip below hides what's inside the letter.
const FLIGHT = { x: 27, y: -17 };
const CRACKS = ["M39.1 3L36.1 4.8", "M40.5 3.2L42.7 5.4", "M38.1 1.6L34.9 1.8"];
const CHIPS = [[-7, -8], [-2, -11], [5, -9], [-10, -3]] as const;
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
        <svg viewBox="-4 -14 80 58" width="80" height="58" aria-hidden="true" fill="none" strokeLinejoin="round">
          <defs>
            {/* The back of the letters only shows where the front isn't. */}
            <mask id="logo-behind" maskUnits="userSpaceOnUse" x="-20" y="-40" width="140" height="120">
              <rect x="-20" y="-40" width="140" height="120" fill="#fff" />
              <path d={LOGO.face} fill="#000" fillRule="evenodd" />
            </mask>
            <clipPath id="logo-outside"><polygon points="-60,-90 170,-90 170,90 47.6,90 47.6,.3 -60,.3" /></clipPath>
            <clipPath id="logo-blade"><path d={`M${BLADE.outline}Z`} /></clipPath>
          </defs>
          <g transform={PLANE}>
            <path d={LOGO.guides} stroke="var(--line)" strokeWidth=".45" opacity=".38" />
            {/* The letters take the blow. */}
            <m.g
              key={`letters-${take}`}
              initial={false}
              animate={playing ? { x: [0, -1, 0.5, -0.2, 0], y: [0, 0.8, -0.3, 0.1, 0] } : undefined}
              transition={{ delay: HIT, duration: 0.4, ease: "easeOut" }}
            >
              <g mask="url(#logo-behind)">
                <path d={LOGO.back} stroke="var(--line)" strokeWidth=".6" opacity=".6" transform={`translate(${LOGO_DEPTH.x} ${LOGO_DEPTH.y})`} />
              </g>
              <path d={LOGO.frontSecond} stroke="var(--ink)" strokeWidth=".35" opacity=".5" />
              <path d={LOGO.front} stroke="var(--ink)" strokeWidth=".85" strokeLinecap="square" />
              {/* The split it leaves, drawn on the instant it lands. */}
              <g className="logo-hit">
                {CRACKS.map((d, i) => (
                  <m.path key={`${d}-${take}`} d={d} stroke="var(--accent)" strokeWidth=".6" initial={playing ? { pathLength: 0, opacity: 0 } : false} animate={{ pathLength: 1, opacity: 0.9 }} transition={{ delay: HIT + i * 0.02, duration: 0.14 }} />
                ))}
              </g>
            </m.g>

            <g className="logo-hit" clipPath="url(#logo-outside)">
              <g transform={`translate(${LODGED.x.toFixed(2)} ${LODGED.y.toFixed(2)})`}>
                {/* It quivers from the buried tip. The empty square centres this group on the tip, because motion turns a group about its middle. */}
                <m.g
                  key={`quiver-${take}`}
                  initial={false}
                  animate={playing ? { rotate: [0, -6, 4.5, -2.5, 1.2, 0] } : undefined}
                  transition={{ delay: HIT, duration: 0.6, ease: "easeOut" }}
                >
                  <rect x={BLADE_TIP.x - 70} y={BLADE_TIP.y - 70} width="140" height="140" />
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
                          <path d={BLADE.edge} stroke="var(--accent)" strokeWidth=".6" opacity=".5" transform="translate(.9 1.3)" />
                          <g clipPath="url(#logo-blade)">
                            <path d={BLADE.hatch} stroke="var(--accent)" strokeWidth=".35" opacity=".42" />
                          </g>
                          <path d={BLADE.bevel} stroke="var(--accent)" strokeWidth=".4" opacity=".6" />
                          <path d={BLADE.edgeSecond} stroke="var(--accent)" strokeWidth=".4" opacity=".5" />
                          <path d={BLADE.edge} stroke="var(--accent)" strokeWidth=".85" />
                        </g>
                      </m.g>
                    </g>
                  </m.g>
                </m.g>
              </g>
            </g>

            {/* Flecks of the letter, thrown back along the batarang's path. */}
            {playing && CHIPS.map(([dx, dy], i) => (
              <m.path key={`${i}-${take}`} d="M39.5 .2L40.5 1.2" stroke="var(--ink)" strokeWidth=".6" initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: [0, 1, 0], x: dx, y: dy }} transition={{ delay: HIT, duration: 0.5, ease: "easeOut" }} />
            ))}
          </g>
        </svg>
      </Link>
    </LazyMotion>
  );
}
