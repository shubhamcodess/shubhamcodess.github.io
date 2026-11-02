import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { listedProjects } from "@portfolio/content";
import { site } from "@portfolio/site";
import { ProjectCardLink } from "@/scene/ProjectCardLink";

export const metadata: Metadata = { title: "Projects", description: site.projects.description };

export default function ProjectsPage() {
  const { kicker, title, columns } = site.projects;
  return (
    <section className="sec sub-page" data-block>
      <p className="kicker rv" data-layer="a">{kicker}</p>
      <h1 className="sec-title" data-layer="b">
        <span className="ln"><span className="rv" style={{ "--i": 1 } as CSSProperties}>{title[0]}</span></span>
        <span className="ln"><span className="rv dim" style={{ "--i": 2 } as CSSProperties}>{title[1]}</span></span>
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
