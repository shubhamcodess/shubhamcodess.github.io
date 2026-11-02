import Link from "next/link";
import { Button, type IconName } from "@portfolio/design/button";
import { ProjectCard } from "@portfolio/design/project-card";
import type { ProjectSummary } from "@portfolio/content";
import { site } from "@portfolio/site";
import { ProjectStage } from "./ProjectStage";

const ICONS: Partial<Record<ProjectSummary["links"][number]["kind"], IconName>> = { site: "arrow" };

/** A project's links, the same on its card and its page. */
export function ProjectLinks({ project }: { project: ProjectSummary }) {
  return project.links.map((l) => (
    <Button key={l.href} {...site.headerButton} href={l.href} target="_blank" rel="noopener" variant="secondary" size="sm" icon={ICONS[l.kind]}>{l.label}</Button>
  ));
}

export const projectMeta = (p: ProjectSummary) => [{ text: p.stack.slice(0, 2).join(" · ") }, { text: p.status, live: p.live }];

/** The short version of a project: this reads only the summary, the same source as its full page. */
export function ProjectCardLink({ project, layout, headingLevel }: { project: ProjectSummary; layout: "vertical" | "horizontal"; headingLevel?: 2 | 3 }) {
  return (
    <ProjectCard
      as={Link}
      heading={project.title}
      line={project.line}
      meta={projectMeta(project)}
      href={`/projects/${project.slug}/`}
      layout={layout}
      headingLevel={headingLevel}
      stage={<ProjectStage stage={project.stage} facts={project.facts} />}
      actions={project.links.length ? <ProjectLinks project={project} /> : undefined}
    />
  );
}
