/**
 * Public numbers for GitHub repos and npm packages, portable and typed.
 *
 *   const stats = createStats({ ttlMs: 2 * 60 * 60 * 1000, storage: localStorage });
 *   const r = await stats.get({ kind: "npm", pkg: "@shubhamcodess/mcp-token-optimizer", metrics: ["weekly", "monthly"] });
 *   if (r.ok) r.values.weekly; // number, and only what was asked for is there
 *   visibleStats(r, { min: { weekly: 5 }, monthlyWhenSameAsWeekly: false }); // what's worth showing, written short
 */
export * from "./metrics";
export { TtlCache, type CacheEntry, type StorageLike, type TtlCacheOptions } from "./cache";
export { createStats, DEFAULT_TTL_MS, queryKey, type GithubQuery, type NpmQuery, type Stats, type StatsOptions, type StatsQuery, type StatsResult, type ValuesOf } from "./client";
export { compact, visibleStats, type ShowRules, type ShownStat } from "./display";
