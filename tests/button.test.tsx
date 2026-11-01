import { readFileSync } from "node:fs";
import { renderToStaticMarkup as html } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@portfolio/design/button";
import { BUTTON_OPTIONS } from "@portfolio/design/button-options";

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
    for (const attr of ['data-texture="hatch"', 'data-shadow="br"', 'data-hover="keycap"', 'data-press="warp"', 'data-sway="off"']) expect(rest).toContain(attr);
    expect(rest).not.toContain("data-face");
    for (const [key, values] of Object.entries(BUTTON_OPTIONS)) {
      for (const value of values) expect(html(<Button {...{ [key]: value }}>Go</Button>)).toContain(`data-${key}="${value}"`);
    }
  });

  it("every option has its styling", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    const skip = new Set(["primary", "md", "clear", "off"]);
    for (const [key, values] of Object.entries(BUTTON_OPTIONS)) {
      for (const value of values) if (!skip.has(value) && !(key === "press" && value !== "warp") && !(key === "sway")) expect(css, `${key}=${value}`).toContain(`[data-${key}="${value}"]`);
    }
    for (const sway of ["soft", "softer"]) expect(css).toContain(`[data-sway="${sway}"]`);
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
