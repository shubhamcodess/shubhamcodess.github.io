import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { fullProject, listedProjects } from "@portfolio/content";
import { Button } from "@portfolio/design/button";
import { MotionText } from "@portfolio/design/motion-text";
import { site } from "@portfolio/site";
import { ProjectLinks, projectMeta } from "@/scene/ProjectCardLink";
import { ProjectStage } from "@/scene/ProjectStage";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => listedProjects().map(({ slug }) => ({ slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = fullProject((await params).slug);
  return { title: project.title, description: project.line };
}

/* The full version of a project, from the same file as its card. */
export default async function ProjectPage({ params }: Props) {
  const project = fullProject((await params).slug);
  return (
    <article className="sec sub-page project-page" data-block>
      <div className="rv" data-layer="a">
        <Button {...site.headerButton} as={Link} href="/projects/" variant="quiet" size="sm" icon="folder">All projects</Button>
      </div>
      <header className="project-head">
        <div className="project-head-text">
          <p className="pc-meta rv" style={{ "--i": 1 } as CSSProperties} data-layer="a">
            {projectMeta(project).map((m) => <span key={m.text} className={m.live ? "live" : undefined}>{m.text}</span>)}
          </p>
          <h1 className="sec-title" data-layer="b"><MotionText line text={project.title} /></h1>
          <p className="project-line rv" data-layer="b" style={{ "--i": 3 } as CSSProperties}>{project.line}</p>
          {project.links.length > 0 && <div className="pc-actions rv" style={{ "--i": 4 } as CSSProperties}><ProjectLinks project={project} /></div>}
        </div>
        <div className="project-plate pc-stage rv" data-layer="c" style={{ "--i": 4 } as CSSProperties}>
          <ProjectStage stage={project.stage} facts={project.facts} />
        </div>
      </header>
      <div className="prose rv" style={{ "--i": 5 } as CSSProperties} dangerouslySetInnerHTML={{ __html: project.html }} />
      <p className="project-stack rv" style={{ "--i": 6 } as CSSProperties}>{project.stack.join(" · ")}</p>
    </article>
  );
}
