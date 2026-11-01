"use client";

import Link from "next/link";
import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/* The logo: a solid 3D SP, with a batarang thrown into it from a short way off. It's lodged in the top of the P. */
const S = [[2, 0], [22, 0], [22, 6], [7, 6], [7, 12], [20, 12], [22, 14], [22, 28], [20, 30], [0, 30], [0, 24], [16, 24], [16, 18], [2, 18], [0, 16], [0, 2]];
const P_OUT = [[25, 0], [44, 0], [47, 3], [47, 16], [44, 19], [31, 19], [31, 30], [25, 30]];
const P_HOLE = [[31, 6], [41, 6], [41, 13], [31, 13]];
const path = (pts: number[][]) => `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
const LETTERS = `${path(S)}${path(P_OUT)}${path(P_HOLE)}`;
const DEPTH = 6; // how far the letters are extruded

const HALF = [[0, -0.13], [0.055, -0.13], [0.075, -0.33], [0.125, -0.12], [0.21, -0.13], [0.3, -0.3], [0.53, -0.35], [0.82, -0.22], [1, 0.03], [0.84, -0.04], [0.74, 0.05], [0.66, 0.22], [0.54, 0.11], [0.42, 0.13], [0.34, 0.32], [0.22, 0.21], [0.12, 0.25], [0, 0.48]] as const;
const BATARANG = [...HALF, ...HALF.slice(1, -1).reverse().map(([x, y]) => [-x, y] as const)].map(([x, y]) => `${(x * 14).toFixed(2)},${(y * 14).toFixed(2)}`).join(" ");

// It flies along its own line, wing tip first. Only that tip ends up buried: the clip below hides it inside the letter.
const FLIGHT = { x: 26, y: -16 };
const TIP = { x: -11.9, y: 7.4 }; // where the wing tip strikes, measured from the batarang's centre
const CRACKS = ["M40.6 1.6L37 -.4", "M40.6 1.6L36 4.4", "M40.6 1.6L43.6 5.4", "M40.6 1.6L33.4 2.4"];
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
        <svg viewBox="-2 -14 68 52" width="68" height="52" aria-hidden="true">
          <defs>
            <clipPath id="logo-outside"><polygon points="61.7,35.3 19.3,-32.5 70.2,-64.3 112.6,3.5" /></clipPath>
          </defs>
          {/* The letters take the blow. */}
          <m.g
            key={`letters-${take}`}
            initial={false}
            animate={playing ? { x: [0, -1.5, 0.8, -0.3, 0], y: [0, 1.1, -0.5, 0.2, 0], rotate: [0, -1.6, 0.8, -0.3, 0] } : undefined}
            transition={{ delay: HIT, duration: 0.46, ease: "easeOut" }}
            style={{ transformOrigin: "24px 15px" }}
          >
            {Array.from({ length: DEPTH }, (_, i) => DEPTH - i).map((d) => (
              <path key={d} d={LETTERS} fillRule="evenodd" fill="var(--line)" transform={`translate(${d * 0.9} ${d * 0.9})`} opacity={d === DEPTH ? 0.55 : 0.85} />
            ))}
            <path d={LETTERS} fillRule="evenodd" fill="var(--ink)" />
            <path d="M0 2L2 0L22 0M25 0L44 0L47 3" fill="none" stroke="var(--sky-0)" strokeOpacity=".45" strokeWidth=".7" />
            {/* The split it leaves, drawn on the instant it lands. */}
            <g className="logo-hit">
              {CRACKS.map((d, i) => (
                <m.path key={`${d}-${take}`} d={d} fill="none" stroke="var(--sky-0)" strokeWidth=".8" initial={playing ? { pathLength: 0, opacity: 0 } : false} animate={{ pathLength: 1, opacity: 0.9 }} transition={{ delay: HIT + i * 0.02, duration: 0.14 }} />
              ))}
            </g>
          </m.g>

          <g className="logo-hit" clipPath="url(#logo-outside)">
            <g transform="translate(49 -4.4)">
              {/* It quivers from the buried tip. The empty square centres this group on the tip, because motion turns a group about its middle. */}
              <m.g
                key={`quiver-${take}`}
                initial={false}
                animate={playing ? { rotate: [0, -7, 5, -3, 1.5, 0] } : undefined}
                transition={{ delay: HIT, duration: 0.6, ease: "easeOut" }}
              >
                <rect x={TIP.x - 60} y={TIP.y - 60} width="120" height="120" fill="none" />
                <m.g
                  key={`flight-${take}`}
                  initial={playing ? { x: FLIGHT.x, y: FLIGHT.y, opacity: 0 } : false}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ x: { duration: HIT, ease: "easeIn" }, y: { duration: HIT, ease: "easeIn" }, opacity: { duration: 0.08 } }}
                >
                  <m.g
                    key={`spin-${take}`}
                    initial={playing ? { rotate: 540 } : false}
                    animate={{ rotate: 0 }}
                    transition={{ duration: HIT, ease: "easeIn" }}
                  >
                    <polygon points={BATARANG} fill="var(--line)" transform="translate(1.1 1.1) rotate(-32)" />
                    <polygon points={BATARANG} fill="var(--accent)" stroke="var(--ink)" strokeWidth=".5" transform="rotate(-32)" />
                  </m.g>
                </m.g>
              </m.g>
            </g>
          </g>

          {/* Chips of the letter, thrown back along the batarang's path. */}
          {playing && CHIPS.map(([dx, dy], i) => (
            <m.polygon key={`${i}-${take}`} points="39.6,1 41.4,1.2 40.4,2.8" fill="var(--ink)" initial={{ opacity: 0, x: 0, y: 0 }} animate={{ opacity: [0, 1, 0], x: dx, y: dy, rotate: 160 }} transition={{ delay: HIT, duration: 0.5, ease: "easeOut" }} style={{ transformOrigin: "40px 2px" }} />
          ))}
        </svg>
      </Link>
    </LazyMotion>
  );
}
