import type { ElementType, ReactNode } from "react";
import { SketchIcon } from "../button/Button";
import "./project-card.css";

export type ProjectCardProps = {
  heading: string;
  /** One description. */
  line: string;
  /** Short notes above the title. A `live` one gets a small breathing square. */
  meta: readonly { text: string; live?: boolean }[];
  /** Where the whole card goes. */
  href: string;
  /** What renders that link, for a router's own link component. */
  as?: ElementType;
  /** The drafting plate's contents. */
  stage: ReactNode;
  /** Buttons that sit above the card's link. */
  actions?: ReactNode;
  /** `horizontal` puts the plate beside the text, once the card is wide enough for it. */
  layout?: "vertical" | "horizontal";
  /** Keeps headings in order on the page it's used on. */
  headingLevel?: 2 | 3;
  className?: string;
};

/** The drawn frame every sheet shares: lines past the corners, a texture rising from below, and the hover. Put it first inside an element with the `pc` class. `face` adds a soft paper behind; without it the sheet is clear, like a button. */
export function SheetFrame({ face = true }: { face?: boolean }) {
  return (
    <>
      {face && <span className="pc-face" aria-hidden="true" />}
      <span className="pc-frame" aria-hidden="true" />
      <span className="pc-tex" aria-hidden="true" />
      <span className="pc-ghost" aria-hidden="true"><i className="g-h" /><i className="g-v" /></span>
      <i className="pc-link l1" aria-hidden="true" /><i className="pc-link l2" aria-hidden="true" /><i className="pc-link l3" aria-hidden="true" />
    </>
  );
}

/** A project as a drawn sheet. The whole card is one link, and `actions` stay separately clickable. */
export function ProjectCard({ heading, line, meta, href, as: Main = "a", stage, actions, layout = "vertical", headingLevel = 3, className }: ProjectCardProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={className ? `pc-box ${className}` : "pc-box"}>
      <article className="pc" data-layout={layout}>
        <SheetFrame />
        <div className="pc-stage">
          <span className="pc-reg tl" aria-hidden="true" /><span className="pc-reg tr" aria-hidden="true" />
          {stage}
        </div>
        <div className="pc-sheet">
          <p className="pc-meta">
            {meta.map((m) => <span key={m.text} className={m.live ? "live" : undefined}>{m.text}</span>)}
          </p>
          <Heading className="pc-title">
            <Main className="pc-main" href={href}>{heading}</Main>
            <SketchIcon name="arrow" className="pc-go" />
          </Heading>
          <p className="pc-line">{line}</p>
          {actions && <div className="pc-actions">{actions}</div>}
        </div>
      </article>
    </div>
  );
}
