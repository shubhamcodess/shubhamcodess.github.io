import { createStats, type RepoName, type Stats, type StatsQuery } from "@portfolio/stats";
import type { ProjectSummary, StatsSettings } from "@portfolio/content/schema";

/* The site's one stats client, made on first use in the browser from `site.stats`, so every link shares one cache. */

let client: Stats | null = null;

export function getStats({ ttlMinutes, persist }: Pick<StatsSettings, "ttlMinutes" | "persist">): Stats {
  if (!client) {
    let storage: Storage | null = null;
    if (persist) try { storage = window.localStorage; } catch { /* blocked: memory only */ }
    client = createStats({ ttlMs: ttlMinutes * 60_000, storage });
  }
  return client;
}

export type LinkStats = NonNullable<ProjectSummary["links"][number]["stats"]>;

/** A link's `stats` from its project file, as a query. */
export const linkQuery = (s: LinkStats): StatsQuery =>
  "npm" in s ? { kind: "npm", pkg: s.npm, metrics: s.show } : { kind: "github", repo: s.github as RepoName, metrics: s.show };
