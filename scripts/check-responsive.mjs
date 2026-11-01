// The responsive gate: every built page, at every width, with no sideways scrolling and no console errors.
import { createServer } from "node:http";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright";

const OUT = "apps/web/out";
const WIDTHS = [[320, 568], [375, 812], [768, 1024], [1024, 768], [1440, 900], [2560, 1440], [812, 375]]; // the last is a phone on its side
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain" };

const pages = readdirSync(OUT, { recursive: true }).map(String)
  .filter((f) => f.endsWith("index.html") && !/^(404|_not-found)\//.test(f))
  .map((f) => `/${f.replace(/index\.html$/, "")}`);

const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  const file = join(OUT, path.endsWith("/") ? `${path}index.html` : path);
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const failures = [];
for (const [width, height] of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => {
      const limit = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll("body *")].find((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > limit + 0.5 || r.left < -0.5); });
      return { scroll: document.documentElement.scrollWidth > limit, wide: wide ? wide.tagName + "." + wide.className : null };
    });
    const ok = !overflow.scroll && !overflow.wide && !errors.length;
    if (!ok) failures.push(`${width}x${height} ${path}: ${JSON.stringify(overflow)} ${errors.join("; ")}`);
    console.log(`${ok ? "ok  " : "FAIL"} ${String(width).padStart(4)}x${height}  ${path}`);
  }
  await page.close();
}
await browser.close();
server.close();
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
