import type { ElementType, ReactNode } from "react";
import { SketchIcon } from "../button/Button";
import { DEFAULT_CARD_DESIGN, type CardDesign, type CardLayout } from "./options";
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
  /** Where the drawing sits against the words, once the card is wide enough for it. See `CARD_OPTIONS`. */
  layout?: CardLayout;
  /** How every card looks: what's behind the words and the drawing, and where the hatch goes. See `CARD_OPTIONS`. */
  design?: CardDesign;
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
export function ProjectCard({ heading, line, meta, href, as: Main = "a", stage, actions, layout = "vertical", design = DEFAULT_CARD_DESIGN, headingLevel = 3, className }: ProjectCardProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={className ? `pc-box ${className}` : "pc-box"}>
      <article className="pc" data-layout={layout} data-hatch={design.hatch}>
        <SheetFrame face={design.face === "frost"} />
        <div className="pc-stage sheet-plate" data-plate={design.plate}>
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
