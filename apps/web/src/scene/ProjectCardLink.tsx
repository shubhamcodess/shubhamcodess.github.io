import Link from "next/link";
import { Button, type IconName } from "@portfolio/design/button";
import { ProjectCard } from "@portfolio/design/project-card";
import type { CardLayout } from "@portfolio/design/project-card-options";
import type { ProjectSummary } from "@portfolio/content";
import { site } from "@portfolio/site";
import { LinkStats } from "../stats/LinkStats";
import { StatsRefresh } from "../stats/StatsRefresh";
import { ProjectStage } from "./ProjectStage";

const ICONS: Record<ProjectSummary["links"][number]["kind"], IconName> = { site: "browser", code: "github", feed: "rss", package: "npm" };

/** A project's links, the same on its card and its page. A link with `stats` shows its live numbers, and then the refresh ring follows the links. */
export function ProjectLinks({ project }: { project: ProjectSummary }) {
  const live = project.links.some((l) => l.stats);
  return (
    <>
      {project.links.map((l) => (
        <Button key={l.href} {...site.headerButton} href={l.href} target="_blank" rel="noopener" variant="secondary" size="xs" icon={ICONS[l.kind]} iconEnd="arrowOut">
          {l.label}
          {l.stats && <LinkStats stats={l.stats} settings={site.stats} />}
          <span className="sr-only"> (opens in a new tab)</span>
        </Button>
      ))}
      {live && site.stats.refresh && <StatsRefresh settings={site.stats} />}
    </>
  );
}

export const projectMeta = (p: ProjectSummary) => [{ text: p.stack.slice(0, 2).join(" · ") }, { text: p.status, live: p.live }];

/** The short version of a project: this reads only the summary, the same source as its full page. */
export function ProjectCardLink({ project, layout, headingLevel }: { project: ProjectSummary; layout: CardLayout; headingLevel?: 2 | 3 }) {
  return (
    <ProjectCard
      as={Link}
      heading={project.title}
      line={project.line}
      meta={projectMeta(project)}
      href={`/projects/${project.slug}/`}
      layout={layout}
      design={site.cards}
      headingLevel={headingLevel}
      stage={<ProjectStage stage={project.stage} facts={project.facts} />}
      actions={project.links.length ? <ProjectLinks project={project} /> : undefined}
    />
  );
}
