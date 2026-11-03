/* What can be asked for. The lists are the one source: the types, the site's config schema and the tests all read them. */

export const GITHUB_METRICS = ["stars", "forks", "watchers", "openIssues", "pushedAt"] as const;
export const NPM_METRICS = ["weekly", "monthly", "version"] as const;

export type GithubMetric = (typeof GITHUB_METRICS)[number];
export type NpmMetric = (typeof NPM_METRICS)[number];
export type Metric = GithubMetric | NpmMetric;

/** Every GitHub number, from one call to the repo endpoint. */
export type GithubValues = { stars: number; forks: number; watchers: number; openIssues: number; pushedAt: string };
/** npm downloads over the last 7 and 30 days, and the latest published version. Each is its own call, made only when asked for. */
export type NpmValues = { weekly: number; monthly: number; version: string };

/** The metrics that are counts, so they can have a threshold. */
export const COUNT_METRICS = ["stars", "forks", "watchers", "openIssues", "weekly", "monthly"] as const;
export type CountMetric = (typeof COUNT_METRICS)[number];

/** "owner/name". */
export type RepoName = `${string}/${string}`;
export const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/;
/** A package name, scoped or not. */
export const NPM_PATTERN = /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/;
