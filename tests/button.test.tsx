import { readFileSync } from "node:fs";
import { renderToStaticMarkup as html } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@portfolio/design/button";
import { BUTTON_OPTIONS } from "@portfolio/design/button-options";

const attr = (key: string) => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

describe("Button", () => {
  it("is a link with an href, and a button without one", () => {
    expect(html(<Button href="/x">Go</Button>)).toMatch(/^<a class="bp"[^>]* href="\/x"/);
    expect(html(<Button>Go</Button>)).toMatch(/^<button class="bp"[^>]* type="button"/);
  });

  it("takes its variant, size and one-place changes as inputs", () => {
    const out = html(<Button variant="quiet" size="lg" className="mine" style={{ "--off": "12px" }}>Go</Button>);
    expect(out).toContain('class="bp mine"');
    expect(out).toContain('data-variant="quiet"');
    expect(out).toContain('data-size="lg"');
    expect(out).toContain("--off:12px");
  });

  it("defaults to the agreed look, and takes every option as an input", () => {
    const rest = html(<Button>Go</Button>);
    for (const a of ['data-texture="hatch"', 'data-shadow="br"', 'data-hover="none"', 'data-press="warp"', 'data-sway="off"']) expect(rest).toContain(a);
    expect(rest).not.toContain("data-face");
    // No icon or text hover motion is baked into the component: left unset, a button follows the site-wide default.
    expect(rest).not.toContain("data-icon-hover");
    expect(rest).not.toContain("data-text-hover");
    for (const [key, values] of Object.entries(BUTTON_OPTIONS)) {
      for (const value of values) expect(html(<Button {...{ [key]: value }}>Go</Button>)).toContain(`data-${attr(key)}="${value}"`);
    }
  });

  it("every option has its styling", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    const skip = new Set(["primary", "md", "clear", "off", "none"]);
    for (const [key, values] of Object.entries(BUTTON_OPTIONS)) {
      for (const value of values) if (!skip.has(value) && !(key === "press" && value !== "warp") && !(key === "sway")) expect(css, `${key}=${value}`).toContain(`[data-${attr(key)}="${value}"]`);
    }
    for (const sway of ["soft", "softer"]) expect(css).toContain(`[data-sway="${sway}"]`);
  });

  it("icon hover motion never hides the main icon line, whichever option is chosen", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    // The main (non-".second") path only ever gets a stroke-width animation: never opacity or stroke-dashoffset.
    const main = css.match(/@keyframes bp-trace-main\s*{[^}]*}[^}]*}/)?.[0] ?? "";
    expect(main).toMatch(/stroke-width/);
    expect(main).not.toMatch(/opacity|stroke-dashoffset/);
    expect(css).toContain(".bp-icon path:not(.second)");
    // Both the subtle default and the clearly-visible option exist, each ending back at the resting line.
    expect(css).toContain('[data-icon-hover="redraw"]');
    expect(css).toContain('[data-icon-hover="trace"]');
    expect(css).toMatch(/@keyframes bp-redraw\s*{\s*from\s*{[^}]*}\s*to\s*{\s*stroke-dashoffset:0;\s*opacity:\.45;/);
    expect(css).toMatch(/@keyframes bp-trace-second\s*{\s*from\s*{[^}]*}\s*to\s*{\s*stroke-dashoffset:0;\s*opacity:\.45;/);
  });

  it("text hover grows and shrinks, or glitches, with a soft transform rather than font-size, and never shifts layout", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    expect(css).toContain('[data-text-hover="grow"]');
    expect(css).toContain('[data-text-hover="glitch"]');
    const block = css.slice(css.indexOf('[data-text-hover="grow"]'), css.indexOf('[data-text-hover="glitch"]'));
    expect(block).toMatch(/scale:/);
    expect(block).not.toMatch(/font-size/);
    const glitchBlock = css.slice(css.indexOf('[data-text-hover="glitch"]'), css.indexOf("/* The frame is four drafting lines"));
    expect(glitchBlock).toMatch(/translate:/);
    expect(glitchBlock).not.toMatch(/font-size/);
    // Eased by a motion token, not a linear or stepped jump.
    expect(css).toContain("--bp-th var(--dur-small-part) var(--ease-soft)");
  });

  it("both the icon and text hover motion are off under reduced motion, and only on hover:hover devices", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    const iconBlock = css.slice(css.indexOf("@keyframes bp-redraw"), css.indexOf("@media (prefers-reduced-motion:reduce)"));
    expect(iconBlock).toContain("@media (hover:hover) and (prefers-reduced-motion:no-preference)");
    expect(css).toContain("@media (prefers-reduced-motion:no-preference)");
    expect(css).toContain("@media (hover:hover) {\n    .bp:not(:disabled, [aria-disabled=\"true\"]):hover { --bp-th:1; }");
  });

  it("a button left unset follows the site-wide default set on the page's root, not just its own data attribute", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    expect(css).toContain(':root[data-icon-hover="trace"] .bp:not([data-icon-hover])');
    expect(css).toContain(':root[data-text-hover="grow"] .bp:not([data-text-hover])');
  });

  it("draws its icon twice and hides it from screen readers", () => {
    const out = html(<Button icon="arrow">Go</Button>);
    expect(out).toContain('aria-hidden="true"');
    expect(out.match(/class="second"/g)).toHaveLength(2);
  });

  it("a disabled link can't be followed", () => {
    const out = html(<Button href="/x" disabled>Go</Button>);
    expect(out).not.toContain("href");
    expect(out).toContain('aria-disabled="true"');
  });

  it("passes other attributes through, and uses a given link component", () => {
    const Custom = ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a data-custom="" href={href} {...rest}>{children}</a>;
    const out = html(<Button as={Custom} href="/x" aria-label="Home" data-tower="">SP</Button>);
    expect(out).toContain("data-custom");
    expect(out).toContain('aria-label="Home"');
    expect(out).toContain("data-tower");
  });
});
