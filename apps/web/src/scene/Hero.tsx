import Link from "next/link";
import type { CSSProperties } from "react";import { Button } from "@portfolio/design/button";
import { RotatingText } from "@portfolio/design/rotating-text";
import { site } from "@portfolio/site";

/* The first screen. The city holds the top and the right; this holds the bottom left, in reading order from who, to what, to where next. */
export function Hero() {
  const { lead, role, hook, cta } = site.hero;
  return (
    <section className="hero" data-block data-state="in">
      <h1 className="hero-title" data-layer="b">
        <span className="ln hero-lead"><span className="rv" style={{ "--i": 0 } as CSSProperties}>{lead}</span></span>
        <span className="ln hero-name"><span className="rv" style={{ "--i": 1 } as CSSProperties}>{site.name}</span></span>
      </h1>
      <p className="hero-role rv" data-layer="b" style={{ "--i": 3 } as CSSProperties}>{role}</p>
      <p className="hero-hook rv" data-layer="c" style={{ "--i": 4 } as CSSProperties}>
        <RotatingText prefix={hook.prefix} lines={hook.lines} seed={hook.seed} minMs={hook.minMs} maxMs={hook.maxMs} />
      </p>
      <div className="hero-cta rv" data-layer="d" style={{ "--i": 5 } as CSSProperties}>
        <Button {...site.headerButton} as={Link} href={cta.href} variant="primary" size="md" icon="arrow">{cta.label}</Button>
      </div>
    </section>
  );
}
