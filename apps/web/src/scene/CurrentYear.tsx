"use client";

import { useEffect, useState } from "react";

/* This year. The static page carries the year it was built in, and the browser corrects it, so it never goes stale between deploys. */
export function CurrentYear() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <>{year}</>;
}
