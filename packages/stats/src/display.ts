import type { StatsQuery, StatsResult } from "./client";
import type { CountMetric, Metric } from "./metrics";

/* Deciding which numbers are worth showing, and writing them short. No markup here: whoever shows them decides how. */

export type ShowRules = {
  /** The least a count must be to show. A count with no entry always shows. */
  min: Partial<Record<CountMetric, number>>;
  /** Show monthly downloads even when they equal weekly (a package under a month old). */
  monthlyWhenSameAsWeekly: boolean;
};

export type ShownStat = {
  metric: Metric;
  value: number | string;
  /** Short, for the screen: 455, 1.2k, 12k, 1.2M. Versions get a "v". */
  text: string;
  /** In words, for screen readers: "455 downloads this week". */
  label: string;
};

/** 455, 1.2k, 12k, 1.2M. Rounds down, so it never claims more than the real number. */
export function compact(n: number): string {
  if (n < 1000) return String(Math.floor(n));
  const [unit, suffix] = n < 1e6 ? [1e3, "k"] : n < 1e9 ? [1e6, "M"] : [1e9, "B"];
  const v = n / unit;
  return `${v < 10 ? Math.floor(v * 10) / 10 : Math.floor(v)}${suffix}`;
}

const WORDS: Record<Metric, (v: string) => string> = {
  stars: (v) => `${v} stars`,
  forks: (v) => `${v} forks`,
  watchers: (v) => `${v} watchers`,
  openIssues: (v) => `${v} open issues`,
  pushedAt: (v) => `last pushed ${v.slice(0, 10)}`,
  weekly: (v) => `${v} downloads this week`,
  monthly: (v) => `${v} downloads this month`,
  version: (v) => `version ${v}`,
};

/** The numbers worth showing, in the order the query asked for them. Nothing at all for a failed fetch. */
export function visibleStats<Q extends StatsQuery>(result: StatsResult<Q> | null | undefined, rules: ShowRules): ShownStat[] {
  if (!result?.ok) return [];
  const values = result.values as Partial<Record<Metric, number | string>>;
  return result.query.metrics.flatMap((metric): ShownStat[] => {
    const value = values[metric];
    if (value === undefined) return [];
    if (typeof value === "number") {
      const min = rules.min[metric as CountMetric] ?? 0;
      if (value < min) return [];
      if (metric === "monthly" && !rules.monthlyWhenSameAsWeekly && value === values.weekly) return [];
      return [{ metric, value, text: compact(value), label: WORDS[metric](String(value)) }];
    }
    return [{ metric, value, text: metric === "version" ? `v${value}` : value, label: WORDS[metric](value) }];
  });
}
