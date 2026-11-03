import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { listedProjects } from "@portfolio/content";
import { MotionText } from "@portfolio/design/motion-text";
import { site } from "@portfolio/site";
import { ProjectCardLink } from "@/scene/ProjectCardLink";

export const metadata: Metadata = { title: "Projects", description: site.projects.description };

export default function ProjectsPage() {
  const { kicker, title, columns } = site.projects;
  return (
    <section className="sec sub-page" data-block>
      <p className="kicker rv" data-layer="a">{kicker}</p>
      <h1 className="sec-title" data-layer="b">
        <MotionText line text={title[0]} />
        <MotionText line className="dim" text={title[1]} after={title[0].length} />
      </h1>
      <div className="project-grid" style={{ "--cols": columns } as CSSProperties}>
        {listedProjects().map((project, i) => (
          <div key={project.slug} className="project-cell rv" data-layer={i % 2 ? "d" : "c"} style={{ "--span": 1, "--i": 3 + i } as CSSProperties}>
            <ProjectCardLink project={project} layout="vertical" headingLevel={2} />
          </div>
        ))}
      </div>
    </section>
  );
}
