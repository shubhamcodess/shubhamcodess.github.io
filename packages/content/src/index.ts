import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { projectSchema, type Project } from "./schema";

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

/** Every project, valid or the build fails. Includes hidden ones; pages use visibleProjects(). */
export function allProjects(): Project[] {
  const folder = join(repoRoot(), "content", "projects");
  const projects = readdirSync(folder)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(readFileSync(join(folder, file), "utf8"));
      const parsed = projectSchema.safeParse(data);
      if (!parsed.success) throw new Error(`content/projects/${file}: ${parsed.error.message}`);
      if (`${parsed.data.slug}.md` !== file) throw new Error(`content/projects/${file}: slug must match the file name`);
      return { ...parsed.data, html: marked.parse(content, { async: false }) };
    });
  return projects.sort((a, b) => a.order - b.order);
}

export const visibleProjects = (): Project[] => allProjects().filter((p) => p.visibility !== "hidden");
