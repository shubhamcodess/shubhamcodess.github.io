import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A phone reaches `next dev` by the computer's network address. If that isn't allowed, Next refuses the scripts with a 403 and the page shows with no JavaScript: no skyline, no film, nothing that errors on localhost.
const config = readFileSync(new URL("../apps/web/next.config.ts", import.meta.url), "utf8");
const allowed = [...(config.match(/LOCAL_NETWORKS = \[(.*?)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
const matches = (host: string, pattern: string) => { const a = host.split("."), b = pattern.split("."); return a.length === b.length && b.every((p, i) => p === "*" || p === a[i]); };

describe("the dev server on a phone", () => {
  it("is open to the configured local networks", () => expect(config).toContain("allowedDevOrigins: LOCAL_NETWORKS"));
  it.each(["10.136.217.120", "192.168.1.20", "172.20.10.2"])("allows %s", (host) => {
    expect(allowed.some((pattern) => matches(host, pattern))).toBe(true);
  });
  it("doesn't open up to public addresses", () => {
    expect(allowed.some((pattern) => matches("8.8.8.8", pattern))).toBe(false);
  });
});
