"use client";

import { visibleStats, type Metric } from "@portfolio/stats";
import type { StatsSettings } from "@portfolio/content/schema";
import { linkQuery, type LinkStats as LinkStatsConfig } from "./stats-client";
import { useStats } from "./useStats";
import "./stats.css";

/* A link's live numbers, set inside its label: "npm | ↓455 w · ↓1.8k m". Nothing at all until there's something worth showing. */

const DOWN = <svg viewBox="0 0 9 9" aria-hidden="true"><path d="M4.5 1v6.4M1.6 4.8l2.9 2.8 2.9-2.8" /></svg>;
const STAR = <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 .9l1.2 2.6 2.8.3-2.1 1.9.6 2.8L5 7.1 2.5 8.5l.6-2.8L1 3.8l2.8-.3z" /></svg>;

/** How each number is marked: a drawn glyph before it, a short unit after it. */
const MARK: Record<Metric, { glyph?: React.ReactNode; unit?: string }> = {
  weekly: { glyph: DOWN, unit: "w" },
  monthly: { glyph: DOWN, unit: "m" },
  stars: { glyph: STAR },
  forks: { unit: "forks" },
  watchers: { unit: "watching" },
  openIssues: { unit: "issues" },
  pushedAt: {},
  version: {},
};

export function LinkStats({ stats, settings }: { stats: LinkStatsConfig; settings: StatsSettings }) {
  const result = useStats(linkQuery(stats), settings);
  const shown = visibleStats(result, settings);
  if (!shown.length) return null;
  return (
    <span className="link-stats">
      <span className="sr-only">, {shown.map((s) => s.label).join(", ")}</span>
      <span className="link-stats-row" aria-hidden="true">
        {shown.map((s, i) => (
          <span key={s.metric} className="link-stat">
            {i > 0 && <i className="link-stat-dot" />}
            {MARK[s.metric].glyph}
            {s.text}
            {MARK[s.metric].unit && <span className="link-stat-unit">{MARK[s.metric].unit}</span>}
          </span>
        ))}
      </span>
    </span>
  );
}
