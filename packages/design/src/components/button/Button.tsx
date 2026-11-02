import type { CSSProperties, ElementType, AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { iconStrokes, type IconName } from "./icons";
import { PressLatch } from "./press";

export { ICON_NAMES, iconStrokes, planStrokes, sketch } from "./icons";

export type { IconName };
import type { ButtonStyle } from "./options";
import "./button.css";

export type ButtonProps = HTMLAttributes<HTMLElement> & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> & Partial<Omit<ButtonStyle, "face" | "iconHover" | "textHover">> & {
  /** Leave it out to inherit --bp-face from around the button, or set it for this use. */
  face?: ButtonStyle["face"];
  /** Leave it out to inherit the site-wide default (a data attribute on the page's root), or set it for this use. */
  iconHover?: ButtonStyle["iconHover"];
  /** Leave it out to inherit the site-wide default (a data attribute on the page's root), or set it for this use. */
  textHover?: ButtonStyle["textHover"];
  icon?: IconName;
  /** A small second icon after the label, such as an arrow for a link that leaves the site. */
  iconEnd?: IconName;
  /** Your own icon, in place of a sketched one. Give an aria-label if the button has no text. */
  glyph?: ReactNode;
  /** With an href it's a link, otherwise a button. */
  href?: string;
  /** The link component to use, such as a framework's own. Defaults to a plain <a>. */
  as?: ElementType;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  /** Change one use only, including any token, like { "--off": "12px" }. */
  style?: CSSProperties & Record<`--${string}`, string>;
  children?: ReactNode;
};

const seedOf = (name: string) => [...name].reduce((sum, c) => sum + c.charCodeAt(0), 3);

/** A sketched icon on its own, drawn with the same pen as a button's. */
export function SketchIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={className ? `bp-icon ${className}` : "bp-icon"} viewBox="0 0 24 24" aria-hidden="true">
      {iconStrokes(name, seedOf(name)).map((stroke, i) => (
        <g key={i} style={{ "--bp-from": stroke.from, "--bp-span": stroke.span } as CSSProperties}>
          <path pathLength={1} d={stroke.main} />
          <path className="second" pathLength={1} d={stroke.second} />
        </g>
      ))}
    </svg>
  );
}

export function Button({ variant = "primary", size = "md", texture = "hatch", shadow = "br", hover = "none", press = "warp", sway = "off", face, iconHover, textHover, icon, iconEnd, glyph, href, as, disabled, type = "button", className, children, ...rest }: ButtonProps) {
  const Element: ElementType = href ? (as ?? "a") : "button";
  // A disabled link has no href, so it can't be followed, and says so to screen readers.
  const behaviour = href
    ? disabled ? { "aria-disabled": true } : { href }
    : { type, disabled };
  return (
    <Element
      className={className ? `bp ${className}` : "bp"}
      data-variant={variant}
      data-size={size}
      data-texture={texture}
      data-shadow={shadow}
      data-hover={hover}
      data-press={press}
      data-sway={sway}
      data-face={face}
      data-icon-hover={iconHover}
      data-text-hover={textHover}
      {...behaviour}
      {...rest}
    >
      <PressLatch />
      <span className="bp-ghost"><i className="g-h" /><i className="g-v" /></span>
      <i className="bp-link l1" /><i className="bp-link l2" /><i className="bp-link l3" />
      <span className="bp-body">
        <span className="bp-tex"><i className="t" /><i className="b" /><i className="l" /><i className="r" /></span>
        <span className="bp-crease"><i className="t" /><i className="l" /><i className="r" /><i className="b" /></span>
        <span className="bp-frame" />
        {glyph ?? (icon && <SketchIcon name={icon} />)}
        {children != null && <span className="bp-label">{children}</span>}
        {iconEnd && <SketchIcon name={iconEnd} className="bp-icon-end" />}
      </span>
    </Element>
  );
}
