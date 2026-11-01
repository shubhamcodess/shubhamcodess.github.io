import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import { iconStrokes, type IconName } from "./icons";
import "./button.css";

export type ButtonProps = HTMLAttributes<HTMLElement> & {
  variant?: "primary" | "secondary" | "quiet";
  size?: "sm" | "md" | "lg";
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

export function Button({ variant = "primary", size = "md", icon, href, as, disabled, type = "button", className, children, ...rest }: ButtonProps) {
  const classes = ["bp", variant !== "primary" && variant, size !== "md" && size, className].filter(Boolean).join(" ");
  const Element: ElementType = href ? (as ?? "a") : "button";
  // A disabled link has no href, so it can't be followed, and says so to screen readers.
  const behaviour = href
    ? disabled ? { "aria-disabled": true } : { href }
    : { type, disabled };
  return (
    <Element className={classes} {...behaviour} {...rest}>
      <span className="bp-body">
        <span className="bp-ghost"><i className="g-h" /><i className="g-v" /></span>
        <i className="bp-link l1" /><i className="bp-link l2" /><i className="bp-link l3" />
        <span className="bp-tex" />
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
