import { readFileSync } from "node:fs";
import { renderToStaticMarkup as html } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Button, ICON_NAMES, iconStrokes, SketchIcon } from "@portfolio/design/button";
import { BUTTON_OPTIONS } from "@portfolio/design/button-options";
import { installPressLatch, PRESS_HOLD_MS } from "../packages/design/src/components/button/press";

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

  it("every sketched icon has a pen run: strokes in order, one at a time, all inside the run, and even a short mark gets time", () => {
    for (const name of ICON_NAMES) {
      let end = 0;
      for (const { from, span } of iconStrokes(name, 7)) {
        expect(from, name).toBeGreaterThanOrEqual(end);
        expect(span, name).toBeGreaterThan(0.04);
        end = from + span;
      }
      expect(end, name).toBeLessThanOrEqual(1.002);
      expect(end, name).toBeGreaterThan(0.99);
    }
    expect(html(<SketchIcon name="arrow" />)).toMatch(/<g style="--bp-from:0;--bp-span:[\d.]+"><path pathLength="1"/);
  });

  it("the redraw can't leave an icon blank: its offset is scaled by the lift, which is 0 at rest, and only hover lifts it", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    expect(css).toMatch(/@property --bp-lift \{[^}]*initial-value:0;/);
    expect(css).toMatch(/stroke-dashoffset:calc\(\(1 - [^;]*\) \* var\(--bp-gone\) \* 1\.02px\);/);
    expect(css).toContain("--bp-gone:var(--bp-lift);");
    // Leaving: the ink returns softly, and the pen only resets once it has.
    expect(css).toContain(".bp-icon > g { transition:--bp-lift var(--dur-small-part) var(--ease-soft), --bp-pen 0s linear var(--dur-small-part); }");
    // Set on the strokes rather than the svg, so a page's own transition on the svg (the theme button's sun) can't cancel it.
    expect(css.match(/--bp-lift:var\(--bp-lift-to, 1\); --bp-pen:1;/g)).toHaveLength(1);
    expect(css).toContain("--bp-pen var(--dur-icon) linear var(--dur-press)");
  });

  it("each pen choice has a rule at both levels, and nothing shakes the icon", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    for (const value of BUTTON_OPTIONS.iconHover) {
      expect(css).toContain(`:root[data-icon-hover="${value}"] .bp-icon`);
      expect(css).toContain(`.bp[data-icon-hover="${value}"] .bp-icon`);
    }
    // The old sway on each stroke is what read as the text glitch happening on the icon.
    expect(css).not.toMatch(/\.bp-icon[^{]*>\s*g[^{]*\{[^}]*(animation|transform):/);
  });

  it("text hover grows and shrinks, or glitches, on the label alone, with a transform rather than font-size", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    const label = css.slice(css.indexOf(".bp-label {"), css.indexOf("/* The frame is four drafting lines"));
    expect(label).toMatch(/scale:calc\(\(1 \+ var\(--bp-grow, 0\) \* var\(--bp-th\)\)/);
    expect(label).toMatch(/translate:calc\(sin\(var\(--bp-th\)/);
    expect(label).not.toMatch(/font-size/);
    // The values that drive it are only set by rules that end in .bp-label.
    for (const line of css.split("\n").filter((l) => /--bp-(grow|glitch):/.test(l))) expect(line).toMatch(/\) \.bp-label \{/);
    expect(css).not.toMatch(/\.bp-icon[^{]*\{[^}]*--bp-(th|grow|glitch)/);
  });

  it("no option can drop a value from the button's transition, so every press type keeps its label motion", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    const lists = css.match(/[^\n]*transition:--bp-h[^\n]*/g) ?? [];
    expect(lists).toHaveLength(1);
    expect(lists[0]).toContain("--bp-th var(--dur-small-part) var(--ease-soft)");
    expect(css).toContain('.bp[data-press="keycap"] { --bp-p-dur:.55s; }');
    expect(css).toContain('.bp[data-press="warp"] { --bp-p-dur:1.25s; }');
  });

  it("both the icon and text hover motion are off under reduced motion, and the icon's only runs on hover:hover devices", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    const on = css.indexOf("--bp-lift:var(--bp-lift-to, 1)");
    expect(css.lastIndexOf("@media (hover:hover) and (prefers-reduced-motion:no-preference)", on)).toBeGreaterThan(-1);
    expect(css.indexOf("@media (prefers-reduced-motion:reduce)", css.lastIndexOf("@media (hover:hover) and (prefers-reduced-motion:no-preference)", on))).toBeGreaterThan(on);
    expect(css).toContain("@media (prefers-reduced-motion:no-preference)");
    expect(css).toContain("@media (hover:hover) {\n    .bp:not(:disabled, [aria-disabled=\"true\"]):hover { --bp-th:1; }");
  });

  it("a button left unset follows the site-wide default set on the page's root", () => {
    const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
    expect(css).toContain(':root[data-text-hover="grow"] .bp:not([data-text-hover])');
    // Same specificity, so the button's own rule has to come after the root's to win.
    expect(css.indexOf('.bp[data-icon-hover="none"] .bp-icon')).toBeGreaterThan(css.indexOf(':root[data-icon-hover="trace"] .bp-icon'));
  });

  describe("press latch", () => {
    const setup = () => {
      const root = new EventTarget(), attrs = new Set<string>();
      const button = { setAttribute: (a: string) => attrs.add(a), removeAttribute: (a: string) => attrs.delete(a) };
      const fire = (type: string, props: Record<string, unknown>, onButton = true) => {
        const event = Object.defineProperty(Object.assign(new Event(type), props), "target", { value: { closest: () => (onButton ? button : null) } });
        root.dispatchEvent(event);
      };
      installPressLatch(root);
      return { attrs, fire };
    };

    it("a quick mouse click holds the press on, even with no time between down and up", () => {
      vi.useFakeTimers();
      const { attrs, fire } = setup();
      fire("pointerdown", { pointerType: "mouse", button: 0 });
      fire("click", { detail: 1 });
      expect(attrs.has("data-pressing")).toBe(true);
      vi.advanceTimersByTime(PRESS_HOLD_MS - 1);
      expect(attrs.has("data-pressing")).toBe(true);
      vi.advanceTimersByTime(1);
      expect(attrs.has("data-pressing")).toBe(false);
      vi.useRealTimers();
    });

    it("a mouse's release doesn't press again, and a right click doesn't press", () => {
      vi.useFakeTimers();
      const { attrs, fire } = setup();
      fire("pointerdown", { pointerType: "mouse", button: 2 });
      expect(attrs.size).toBe(0);
      fire("pointerdown", { pointerType: "mouse", button: 0 });
      vi.advanceTimersByTime(PRESS_HOLD_MS + 500); // held down, which :active covers
      fire("click", { detail: 1 });
      expect(attrs.size).toBe(0);
      vi.useRealTimers();
    });

    it("a touch only presses once it's a tap, not at the start of a scroll, and the keyboard presses on click", () => {
      vi.useFakeTimers();
      const { attrs, fire } = setup();
      fire("pointerdown", { pointerType: "touch", button: 0 });
      expect(attrs.size).toBe(0);
      fire("click", { detail: 1 });
      expect(attrs.has("data-pressing")).toBe(true);
      vi.advanceTimersByTime(PRESS_HOLD_MS);
      fire("pointerdown", { pointerType: "mouse", button: 0 });
      vi.advanceTimersByTime(PRESS_HOLD_MS);
      fire("click", { detail: 0 });
      expect(attrs.has("data-pressing")).toBe(true);
      vi.useRealTimers();
    });

    it("ignores anything that isn't a button", () => {
      const { attrs, fire } = setup();
      fire("pointerdown", { pointerType: "mouse", button: 0 }, false);
      expect(attrs.size).toBe(0);
    });

    it("CSS keeps :active too, and a press that's off or disabled stays still", () => {
      const css = readFileSync("packages/design/src/components/button/button.css", "utf8");
      expect(css).toContain('.bp.bp:not([data-press="none"], :disabled, [aria-disabled="true"]):is(:active, [data-pressing]) { --bp-p:1;');
    });
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
