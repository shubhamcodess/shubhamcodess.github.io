// Fails if any built page loads more than the JS budget (docs/decisions/001), gzipped, for modern browsers.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const OUT = "apps/web/out", BUDGET_KB = 220;
const pages = readdirSync(OUT, { recursive: true }).map(String).filter((f) => f.endsWith(".html"));
if (!pages.length) throw new Error(`No pages in ${OUT}. Run the build first.`);

let failed = false;
for (const page of pages) {
  const html = readFileSync(join(OUT, page), "utf8");
  const tags = html.match(/<script\b[^>]*>/g) ?? [];
  const files = new Set(tags.filter((t) => !/\bnoModule\b/i.test(t)).map((t) => t.match(/\bsrc="([^"]+)"/)?.[1]).filter(Boolean));
  let bytes = 0;
  for (const src of files) bytes += gzipSync(readFileSync(join(OUT, src.split("?")[0]))).length;
  const kb = bytes / 1024;
  if (kb > BUDGET_KB) failed = true;
  console.log(`${kb > BUDGET_KB ? "OVER" : "ok  "} ${kb.toFixed(1).padStart(7)} KB  ${relative(".", page)}`);
}
if (failed) process.exit(1);
