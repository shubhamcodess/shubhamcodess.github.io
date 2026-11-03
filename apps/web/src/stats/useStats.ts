"use client";

import { useEffect, useState } from "react";
import { queryKey, type StatsQuery, type StatsResult } from "@portfolio/stats";
import type { StatsSettings } from "@portfolio/content/schema";
import { getStats } from "./stats-client";

/**
 * The numbers for one query, fetched after the page loads, and again whenever the stats are refreshed.
 * null until the first answer. A failed refresh keeps the last good numbers instead of dropping them.
 */
export function useStats<const Q extends StatsQuery>(query: Q | null, settings: Pick<StatsSettings, "ttlMinutes" | "persist">): StatsResult<Q> | null {
  const [result, setResult] = useState<StatsResult<Q> | null>(null);
  const key = query ? queryKey(query) : null;
  const { ttlMinutes, persist } = settings;

  useEffect(() => {
    if (!query) return;
    const stats = getStats({ ttlMinutes, persist });
    let live = true;
    const run = (fresh: boolean) => stats.get(query, { fresh }).then((next) => {
      if (live) setResult((prev) => (prev?.ok && !next.ok ? prev : next));
    });
    void run(false);
    const stop = stats.subscribe(() => run(true));
    return () => { live = false; stop(); };
    // The query is compared by its key, so a new object with the same contents doesn't fetch again.
  }, [key, ttlMinutes, persist]);

  return result;
}
