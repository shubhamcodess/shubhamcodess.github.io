"use client";

import { useState } from "react";
import { Tooltip } from "@portfolio/design/tooltip";
import type { StatsSettings } from "@portfolio/content/schema";
import { getStats } from "./stats-client";
import "./stats.css";

/** A small dotted ring that drops the cached numbers and fetches them fresh, for every link on the page. */
export function StatsRefresh({ settings }: { settings: StatsSettings }) {
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    if (busy) return;
    setBusy(true);
    try { await getStats(settings).refresh(); } finally { setBusy(false); }
  };
  return (
    <Tooltip label={busy ? "Fetching" : "Refresh numbers"}>
      <button type="button" className="stats-refresh" aria-label="Refresh the live numbers" aria-busy={busy} data-busy={busy || undefined} onClick={refresh}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path className="stats-refresh-ring" d="M13.2 5.2A5.6 5.6 0 1 0 13.6 9" />
          <path className="stats-refresh-head" d="M13.6 2.2v3.2h-3.2" />
        </svg>
      </button>
    </Tooltip>
  );
}
