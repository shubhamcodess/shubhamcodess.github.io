import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "@portfolio/design/button";
import { RotatingText } from "@portfolio/design/rotating-text";
import { site } from "@portfolio/site";
import { HeroStage } from "./HeroStage";

const at = (i: number) => ({ "--i": i }) as CSSProperties;
/* The order letters come out of the haze: irregular, but the same every time, so server and browser agree. */
const emerges = (i: number) => ((i * 37 + 11) % 15) / 15;

/* A drawing's title block. Who you are, a dimension line carrying your role, then what you build and where to go next, all held to the width of the name. */
export function Hero() {
  const { lead, role, hook, cta, tilt } = site.hero;
  const letters = [...site.name];
  const copy = letters.map((c, i) => <span key={i} className="hero-char">{c === " " ? " " : c}</span>);
  return (
    <section className="hero" data-block data-state="in">
      <HeroStage tilt={tilt}>
        <h1 className="hero-title" aria-label={`${lead} ${site.name}`} data-layer="b">
          <span className="hero-lead rv" aria-hidden="true" style={at(0)}>{lead}</span>
          <span className="hero-name rv" aria-hidden="true" style={at(0)}>
            <span className="hero-wire hero-wire-hatch">{copy}</span>
            <span className="hero-wire hero-wire-line">{copy}</span>
            <span className="hero-face">
              {letters.map((c, i) => (
                <span key={i} className="hero-char" style={{ "--e": emerges(i) } as CSSProperties}>{c === " " ? " " : c}</span>
              ))}
            </span>
          </span>
        </h1>
        <p className="hero-role rv" data-layer="b" style={at(6)}>
          <i className="hero-dim hero-dim-short" />
          <span>{role}</span>
          <i className="hero-dim hero-dim-long" />
        </p>
        <div className="hero-row">
          <p className="hero-hook rv" data-layer="c" style={at(8)}>
            <RotatingText prefix={hook.prefix} lines={hook.lines} seed={hook.seed} minMs={hook.minMs} maxMs={hook.maxMs} />
          </p>
          <div className="hero-cta rv" data-layer="d" style={at(10)}>
            <Button {...site.headerButton} as={Link} href={cta.href} variant="primary" size="md" icon="arrow">{cta.label}</Button>
          </div>
        </div>
      </HeroStage>
    </section>
  );
}
