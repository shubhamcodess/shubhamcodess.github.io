import Link from "next/link";
import type { CSSProperties } from "react";
import { featuredProjects } from "@portfolio/content";
import { Button } from "@portfolio/design/button";
import { MotionText } from "@portfolio/design/motion-text";
import { site } from "@portfolio/site";
import { ProjectCardLink } from "./ProjectCardLink";

const LAYERS = ["c", "d", "c", "d", "c", "d"];

/* The first section after the hero. Which projects, their rank, how many columns and each card's shape all come from `shipped` in content/site.ts. */
export function Shipped() {
  const { kicker, title, columns, fit, seeAll } = site.shipped;
  return (
    <section id="featured" className="sec" data-block data-fit={fit}>
      <p className="kicker rv" data-layer="a">{kicker}</p>
      <h2 className="sec-title" data-layer="b">
        <MotionText line text={title[0]} />
        <MotionText line className="dim" text={title[1]} after={title[0].length} />
      </h2>
      <div className="project-grid" style={{ "--cols": columns } as CSSProperties}>
        {featuredProjects(site.shipped.items).map(({ project, layout, span }, i) => (
          <div key={project.slug} className="project-cell rv" data-layer={LAYERS[i]} style={{ "--span": span, "--i": 3 + i * 2 } as CSSProperties}>
            <ProjectCardLink project={project} layout={layout} />
          </div>
        ))}
      </div>
      <div className="sec-more rv" data-layer="b" style={{ "--i": 7 } as CSSProperties}>
        <Button {...site.headerButton} as={Link} href={seeAll.href} variant="primary" size="md" icon="arrow">{seeAll.label}</Button>
      </div>
    </section>
  );
}
