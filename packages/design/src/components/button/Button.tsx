import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import { iconStrokes, type IconName } from "./icons";
import type { ButtonStyle } from "./options";
import "./button.css";

export type ButtonProps = HTMLAttributes<HTMLElement> & Partial<Omit<ButtonStyle, "face">> & {
  /** Leave it out to inherit --bp-face from around the button, or set it for this use. */
  face?: ButtonStyle["face"];
  icon?: IconName;
  /** With an href it's a link, otherwise a button. */
  href?: string;
  /** The link component to use, such as a framework's own. Defaults to a plain <a>. */
  as?: ElementType;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  /** Change one use only, including any token, like { "--off": "12px" }. */
  style?: CSSProperties & Record<`--${string}`, string>;
  children: ReactNode;
};

const seedOf = (name: string) => [...name].reduce((sum, c) => sum + c.charCodeAt(0), 3);

export function Button({ variant = "primary", size = "md", texture = "hatch", shadow = "br", hover = "keycap", press = "warp", sway = "off", face, icon, href, as, disabled, type = "button", className, children, ...rest }: ButtonProps) {
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
      {...behaviour}
      {...rest}
    >
      <span className="bp-ghost"><i className="g-h" /><i className="g-v" /></span>
      <i className="bp-link l1" /><i className="bp-link l2" /><i className="bp-link l3" />
      <span className="bp-body">
        <span className="bp-tex"><i className="t" /><i className="b" /><i className="l" /><i className="r" /></span>
        <span className="bp-crease"><i className="t" /><i className="l" /><i className="r" /><i className="b" /></span>
        <span className="bp-frame" />
        {icon && (
          <svg className="bp-icon" viewBox="0 0 24 24" aria-hidden="true">
            {iconStrokes(icon, seedOf(icon)).map((stroke, i) => (
              <g key={i}>
                <path pathLength={1} d={stroke.main} />
                <path className="second" pathLength={1} d={stroke.second} />
              </g>
            ))}
          </svg>
        )}
        <span className="bp-label">{children}</span>
      </span>
    </Element>
  );
}
