import { renderToStaticMarkup as html } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@portfolio/design/button";

describe("Button", () => {
  it("is a link with an href, and a button without one", () => {
    expect(html(<Button href="/x">Go</Button>)).toMatch(/^<a class="bp" href="\/x"/);
    expect(html(<Button>Go</Button>)).toMatch(/^<button class="bp" type="button"/);
  });

  it("takes its variant, size and one-place changes as inputs", () => {
    const out = html(<Button variant="quiet" size="lg" className="mine" style={{ "--off": "12px" }}>Go</Button>);
    expect(out).toContain('class="bp quiet lg mine"');
    expect(out).toContain("--off:12px");
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
