import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { projectSchema, type Project, type ProjectSummary } from "./schema";

export * from "./schema";

function repoRoot(): string {
  let dir = process.cwd();
  while (!existsSync(join(dir, "pnpm-workspace.yaml"))) {
    const up = dirname(dir);
    if (up === dir) throw new Error("Could not find the repo root");
    dir = up;
  }
  return dir;
}

/** Every project, valid or the check fails. Each file is the one source for both its card and its page. */
export function allProjects(): Project[] {
  const folder = join(repoRoot(), "content", "projects");
  const projects = readdirSync(folder)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(readFileSync(join(folder, file), "utf8"));
      const parsed = projectSchema.safeParse(data);
      if (!parsed.success) throw new Error(`content/projects/${file}: ${parsed.error.message}`);
      if (`${parsed.data.slug}.md` !== file) throw new Error(`content/projects/${file}: slug must match the file name`);
      if (!content.trim()) throw new Error(`content/projects/${file}: a project needs a body for its full page`);
      return { ...parsed.data, html: marked.parse(content, { async: false }) };
    });
  return projects.sort((a, b) => a.order - b.order);
}

/** A card only gets the short version, so a page can't send every project's full text to one that lists them. */
const summary = ({ html: _html, ...rest }: Project): ProjectSummary => rest;

const onSite = () => allProjects().filter((p) => p.visibility !== "hidden");

/** The /projects page, by rank. */
export const listedProjects = (): ProjectSummary[] => onSite().map(summary);

/** One project's full page. */
export function fullProject(slug: string): Project {
  const project = onSite().find((p) => p.slug === slug);
  if (!project) throw new Error(`No project on the site called "${slug}"`);
  return project;
}

/** The homepage's picks, in the rank and shapes the config gives. A pick that doesn't exist fails the build. */
export function featuredProjects<T extends { slug: string }>(items: readonly T[]) {
  return items.map((item) => ({ ...item, project: summary(fullProject(item.slug)) }));
}
