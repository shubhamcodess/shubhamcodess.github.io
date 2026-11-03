import { describe, expect, expectTypeOf, it } from "vitest";
import { compact, createStats, TtlCache, visibleStats, type StorageLike } from "@portfolio/stats";
import { allProjects, projectSchema, siteSchema } from "@portfolio/content";
import { site } from "@portfolio/site";

const PKG = "@shubhamcodess/mcp-token-optimizer";
const REPO = "shubhamcodess/mcp-token-optimizer";

/** A fake network: answers by URL, counts calls, and can be told to fail. */
function fakeNet(answers: Record<string, unknown>) {
  const calls: string[] = [];
  let failing = false;
  const fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (failing) throw new Error("offline");
    const hit = Object.entries(answers).find(([part]) => url.includes(part));
    if (!hit) return new Response("{}", { status: 404 });
    return new Response(JSON.stringify(hit[1]), { status: 200 });
  }) as typeof globalThis.fetch;
  return { fetch, calls, fail: (v: boolean) => { failing = v; } };
}
const ANSWERS = {
  "last-week": { downloads: 455 },
  "last-month": { downloads: 1840 },
  "/latest": { version: "0.2.2" },
  "api.github.com": { stargazers_count: 12, forks_count: 2, subscribers_count: 1, open_issues_count: 4, pushed_at: "2026-11-01T15:47:30Z" },
};
function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("stats.get", () => {
  it("returns exactly the numbers asked for, typed", async () => {
    const net = fakeNet(ANSWERS);
    const stats = createStats({ fetch: net.fetch });
    const r = await stats.get({ kind: "npm", pkg: PKG, metrics: ["weekly"] });
    expect(r).toMatchObject({ ok: true, values: { weekly: 455 }, from: "network" });
    if (r.ok) {
      expectTypeOf(r.values).toEqualTypeOf<{ weekly: number }>();
      expect(Object.keys(r.values)).toEqual(["weekly"]);
    }
    expect(net.calls).toHaveLength(1); // monthly and version weren't asked for, so they weren't fetched
  });

  it("reads a GitHub repo in one call", async () => {
    const net = fakeNet(ANSWERS);
    const r = await createStats({ fetch: net.fetch }).get({ kind: "github", repo: REPO, metrics: ["stars", "forks"] });
    expect(r).toMatchObject({ ok: true, values: { stars: 12, forks: 2 } });
    expect(net.calls).toEqual([`https://api.github.com/repos/${REPO}`]);
  });

  it("serves from the cache inside the TTL, and fetches again after it", async () => {
    let now = 0;
    const net = fakeNet(ANSWERS);
    const stats = createStats({ fetch: net.fetch, ttlMs: 1000, now: () => now });
    const q = { kind: "npm", pkg: PKG, metrics: ["weekly", "monthly"] } as const;
    await stats.get(q);
    now = 999;
    expect(await stats.get(q)).toMatchObject({ ok: true, from: "cache" });
    expect(net.calls).toHaveLength(2);
    now = 1000;
    expect(await stats.get(q)).toMatchObject({ ok: true, from: "network" });
    expect(net.calls).toHaveLength(4);
  });

  it("shares one request between callers asking at once, and across queries", async () => {
    const net = fakeNet(ANSWERS);
    const stats = createStats({ fetch: net.fetch });
    await Promise.all([
      stats.get({ kind: "npm", pkg: PKG, metrics: ["weekly"] }),
      stats.get({ kind: "npm", pkg: PKG, metrics: ["weekly", "monthly"] }),
    ]);
    expect(net.calls.filter((c) => c.includes("last-week"))).toHaveLength(1);
  });

  it("never throws: a failure is an answer", async () => {
    const net = fakeNet(ANSWERS);
    net.fail(true);
    const r = await createStats({ fetch: net.fetch }).get({ kind: "npm", pkg: PKG, metrics: ["weekly"] });
    expect(r).toEqual({ ok: false, query: { kind: "npm", pkg: PKG, metrics: ["weekly"] }, error: "offline" });
  });

  it("rejects a response that isn't the expected shape", async () => {
    const net = fakeNet({ "last-week": { downloads: "lots" } });
    const r = await createStats({ fetch: net.fetch }).get({ kind: "npm", pkg: PKG, metrics: ["weekly"] });
    expect(r.ok).toBe(false);
  });

  it("keeps the cache across reloads through storage, and ignores junk in it", async () => {
    const storage = memoryStorage(), net = fakeNet(ANSWERS);
    await createStats({ fetch: net.fetch, storage }).get({ kind: "npm", pkg: PKG, metrics: ["weekly"] });
    const again = await createStats({ fetch: net.fetch, storage }).get({ kind: "npm", pkg: PKG, metrics: ["weekly"] });
    expect(again).toMatchObject({ ok: true, from: "cache", values: { weekly: 455 } });
    expect(net.calls).toHaveLength(1);
    for (const k of storage.data.keys()) storage.data.set(k, JSON.stringify({ at: Date.now(), value: "junk" }));
    expect(await createStats({ fetch: net.fetch, storage }).get({ kind: "npm", pkg: PKG, metrics: ["weekly"] })).toMatchObject({ ok: true, from: "network" });
  });

  it("refresh drops the cache and lets subscribers fetch fresh", async () => {
    const net = fakeNet(ANSWERS);
    const stats = createStats({ fetch: net.fetch });
    const q = { kind: "npm", pkg: PKG, metrics: ["weekly"] } as const;
    await stats.get(q);
    let after: unknown;
    const stop = stats.subscribe(async () => { after = await stats.get(q); });
    await stats.refresh();
    expect(after).toMatchObject({ ok: true, from: "network" });
    expect(net.calls).toHaveLength(2);
    stop();
  });
});

describe("TtlCache", () => {
  it("survives storage that throws", () => {
    const broken: StorageLike = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("full"); }, removeItem: () => { throw new Error("blocked"); } };
    const cache = new TtlCache<number>({ ttlMs: 1000, storage: broken });
    cache.set("a", 1);
    expect(cache.get("a")?.value).toBe(1);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
  });
});

describe("what's shown", () => {
  const rules = { min: { stars: 5, weekly: 5, monthly: 5 }, monthlyWhenSameAsWeekly: false };
  const npm = (weekly: number, monthly: number) => ({ ok: true as const, query: { kind: "npm" as const, pkg: PKG, metrics: ["weekly", "monthly"] as const }, values: { weekly, monthly }, fetchedAt: 0, from: "network" as const });

  it("writes numbers short, never rounding up", () => {
    expect([0, 455, 999, 1000, 1299, 12_999, 999_999, 1_250_000].map(compact)).toEqual(["0", "455", "999", "1k", "1.2k", "12k", "999k", "1.2M"]);
  });
  it("shows weekly and monthly when both clear the threshold", () => {
    expect(visibleStats(npm(455, 1840), rules).map((s) => s.text)).toEqual(["455", "1.8k"]);
  });
  it("leaves monthly off when it equals weekly, unless asked", () => {
    expect(visibleStats(npm(455, 455), rules).map((s) => s.metric)).toEqual(["weekly"]);
    expect(visibleStats(npm(455, 455), { ...rules, monthlyWhenSameAsWeekly: true }).map((s) => s.metric)).toEqual(["weekly", "monthly"]);
  });
  it("leaves off anything under its threshold, and everything for a failure", () => {
    expect(visibleStats(npm(3, 40), rules).map((s) => s.metric)).toEqual(["monthly"]);
    expect(visibleStats(npm(1, 2), rules)).toEqual([]);
    expect(visibleStats({ ok: false, query: npm(0, 0).query, error: "offline" }, rules)).toEqual([]);
    expect(visibleStats(null, rules)).toEqual([]);
  });
  it("labels each number for screen readers", () => {
    expect(visibleStats(npm(455, 1840), rules).map((s) => s.label)).toEqual(["455 downloads this week", "1840 downloads this month"]);
  });
});

describe("the stats config", () => {
  const link = { label: "npm", href: "https://www.npmjs.com/package/x", kind: "package" };
  const project = { slug: "x", title: "X", line: "Line", stack: ["TS"], status: "Live", live: false, since: "2026-01", stage: null, facts: [{ value: "1", label: "One" }], visibility: "listed", order: 9, private: false };
  const parse = (stats: unknown) => projectSchema.safeParse({ ...project, links: [{ ...link, stats }] }).success;

  it("accepts a package or a repo with their own numbers", () => {
    expect(parse({ npm: PKG, show: ["weekly", "monthly"] })).toBe(true);
    expect(parse({ github: REPO, show: ["stars"] })).toBe(true);
  });
  it("rejects numbers that don't belong to the source, repeats, and bad names", () => {
    expect(parse({ npm: PKG, show: ["stars"] })).toBe(false);
    expect(parse({ github: REPO, show: ["weekly"] })).toBe(false);
    expect(parse({ npm: PKG, show: ["weekly", "weekly"] })).toBe(false);
    expect(parse({ github: "not a repo", show: ["stars"] })).toBe(false);
    expect(parse({ npm: PKG, github: REPO, show: ["stars"] })).toBe(false);
  });
  it("rejects a TTL out of range and unknown keys", () => {
    expect(siteSchema.safeParse({ ...site, stats: { ...site.stats, ttlMinutes: 0 } }).success).toBe(false);
    expect(siteSchema.safeParse({ ...site, stats: { ...site.stats, colour: "red" } }).success).toBe(false);
  });
  it("puts weekly and monthly on the featured npm button", () => {
    const mto = allProjects().find((p) => p.slug === "mcp-token-optimizer");
    expect(mto?.links.find((l) => l.kind === "package")?.stats).toEqual({ npm: PKG, show: ["weekly", "monthly"] });
  });
});
