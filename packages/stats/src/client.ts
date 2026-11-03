import { TtlCache, type StorageLike } from "./cache";
import type { GithubMetric, GithubValues, NpmMetric, NpmValues, RepoName } from "./metrics";

/* Fetches public numbers for a GitHub repo or an npm package, through a TTL cache.
   It has no framework and no page access, so anything can call it: a component, a script, a test.
   It never throws: every answer is typed JSON, either the values asked for or the reason there are none. */

export type GithubQuery<M extends GithubMetric = GithubMetric> = { kind: "github"; repo: RepoName; metrics: readonly M[] };
export type NpmQuery<M extends NpmMetric = NpmMetric> = { kind: "npm"; pkg: string; metrics: readonly M[] };
export type StatsQuery = GithubQuery | NpmQuery;

/** Exactly the values a query asked for. */
export type ValuesOf<Q extends StatsQuery> =
  Q extends GithubQuery<infer M> ? Pick<GithubValues, M> : Q extends NpmQuery<infer M> ? Pick<NpmValues, M> : never;

export type StatsResult<Q extends StatsQuery = StatsQuery> =
  | {
      ok: true;
      query: Q;
      values: ValuesOf<Q>;
      /** When the oldest of these numbers was fetched, in ms since the epoch. */
      fetchedAt: number;
      /** "cache" only when every number came from the cache. */
      from: "cache" | "network";
    }
  | { ok: false; query: Q; error: string };

export type StatsOptions = {
  /** How long fetched numbers are kept before they're fetched again. Two hours by default. */
  ttlMs?: number;
  /** Keeps the cache across reloads. Pass `localStorage` in a browser; leave out for memory only. */
  storage?: StorageLike | null;
  fetch?: typeof globalThis.fetch;
  now?: () => number;
};

export const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000;

/** One call to one endpoint, cached under its own key, so asking for weekly and later monthly shares what it can. */
type Unit<V> = {
  key: string;
  url: string;
  /** Reads the endpoint's response. Throws when it isn't the expected shape. */
  read: (json: unknown) => V;
  /** Checks a value from the cache, which may have come from storage. Throws when it isn't the expected shape. */
  check: (value: unknown) => V;
};

const field = (json: unknown, name: string): unknown => (json && typeof json === "object" && name in json ? (json as Record<string, unknown>)[name] : undefined);
const count = (json: unknown, name: string): number => {
  const v = field(json, name);
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) throw new Error(`no ${name} in the response`);
  return v;
};
const text = (json: unknown, name: string): string => {
  const v = field(json, name);
  if (typeof v !== "string" || !v) throw new Error(`no ${name} in the response`);
  return v;
};

const githubUnit = (repo: RepoName): Unit<GithubValues> => ({
  key: `github:${repo}`,
  url: `https://api.github.com/repos/${repo}`,
  read: (j) => ({ stars: count(j, "stargazers_count"), forks: count(j, "forks_count"), watchers: count(j, "subscribers_count"), openIssues: count(j, "open_issues_count"), pushedAt: text(j, "pushed_at") }),
  check: (v) => ({ stars: count(v, "stars"), forks: count(v, "forks"), watchers: count(v, "watchers"), openIssues: count(v, "openIssues"), pushedAt: text(v, "pushedAt") }),
});
const downloads = (pkg: string, period: "week" | "month"): Unit<number> => ({
  key: `npm:${pkg}:${period === "week" ? "weekly" : "monthly"}`,
  url: `https://api.npmjs.org/downloads/point/last-${period}/${pkg}`,
  read: (j) => count(j, "downloads"),
  check: (v) => count({ v }, "v"),
});
const npmUnits = {
  weekly: (pkg: string) => downloads(pkg, "week"),
  monthly: (pkg: string) => downloads(pkg, "month"),
  version: (pkg: string): Unit<string> => ({ key: `npm:${pkg}:version`, url: `https://registry.npmjs.org/${pkg}/latest`, read: (j) => text(j, "version"), check: (v) => text({ v }, "v") }),
} satisfies Record<NpmMetric, (pkg: string) => Unit<unknown>>;

/** A stable key for a query, for caching or comparing queries. */
export const queryKey = (q: StatsQuery) => `${q.kind}:${q.kind === "github" ? q.repo : q.pkg}:${[...q.metrics].sort().join(",")}`;

export type Stats = ReturnType<typeof createStats>;

export function createStats({ ttlMs = DEFAULT_TTL_MS, storage = null, fetch: fetchFn = (...a) => globalThis.fetch(...a), now = () => Date.now() }: StatsOptions = {}) {
  const cache = new TtlCache<unknown>({ ttlMs, storage, now });
  const inflight = new Map<string, Promise<{ value: unknown; at: number }>>();
  const listeners = new Set<() => unknown>();

  /** Fetches one endpoint, or takes it from the cache. Two callers asking at once share one request. */
  async function load<V>(unit: Unit<V>, fresh: boolean): Promise<{ value: V; at: number; cached: boolean }> {
    if (!fresh) {
      const hit = cache.get(unit.key);
      if (hit) {
        try { return { value: unit.check(hit.value), at: hit.at, cached: true }; } catch { cache.delete(unit.key); }
      }
    }
    let pending = inflight.get(unit.key);
    if (!pending) {
      pending = (async () => {
        const res = await fetchFn(unit.url, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`${new URL(unit.url).host} answered ${res.status}`);
        const value = unit.read(await res.json());
        return cache.set(unit.key, value);
      })().finally(() => inflight.delete(unit.key));
      inflight.set(unit.key, pending);
    }
    const entry = await pending;
    return { value: entry.value as V, at: entry.at, cached: false };
  }

  return {
    /** The numbers a query asks for, from the cache while fresh. `fresh` skips the cache. */
    async get<const Q extends StatsQuery>(query: Q, { fresh = false }: { fresh?: boolean } = {}): Promise<StatsResult<Q>> {
      try {
        const metrics = [...new Set<string>(query.metrics)];
        if (!metrics.length) throw new Error("no metrics asked for");
        let values: Record<string, unknown>, parts: { at: number; cached: boolean }[];
        if (query.kind === "github") {
          const got = await load(githubUnit(query.repo), fresh);
          values = Object.fromEntries(metrics.map((m) => [m, got.value[m as GithubMetric]]));
          parts = [got];
        } else {
          const got = await Promise.all(metrics.map((m) => load<unknown>(npmUnits[m as NpmMetric](query.pkg), fresh)));
          values = Object.fromEntries(metrics.map((m, i) => [m, got[i]!.value]));
          parts = got;
        }
        return {
          ok: true, query, values: values as ValuesOf<Q>,
          fetchedAt: Math.min(...parts.map((p) => p.at)),
          from: parts.every((p) => p.cached) ? "cache" : "network",
        };
      } catch (e) {
        return { ok: false, query, error: e instanceof Error ? e.message : String(e) };
      }
    },

    /** Drops everything cached, then lets every subscriber fetch again. Resolves once they've all finished. */
    async refresh() {
      cache.clear();
      await Promise.all([...listeners].map((l) => l()));
    },

    /** Called on each refresh. Returns the way to stop. */
    subscribe(listener: () => unknown) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },

    get ttlMs() { return cache.ttlMs; },
    set ttlMs(ms: number) { cache.ttlMs = ms; },
  };
}
