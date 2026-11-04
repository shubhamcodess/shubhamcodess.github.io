// The responsive gate: every built page, at every width, with no sideways scrolling and no console errors.
import { createServer } from "node:http";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright";

const OUT = "apps/web/out";
const WIDTHS = [[320, 568], [375, 812], [768, 1024], [1024, 768], [1440, 900], [2560, 1440], [1440, 800], [1366, 650], [900, 700], [812, 375]]; // short laptops must keep the film pinned, and the last is a phone on its side
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
    await page.waitForSelector("#scene .g-hero canvas", { timeout: 5000 }).catch(() => {});
    const overflow = await page.evaluate(() => {
      const limit = document.documentElement.clientWidth;
      // Decorative art may run past the edge, because it's clipped, and so may what's inside a row built to swipe sideways. Everything else has to fit.
      const inSwipeRow = (el) => { for (let up = el.parentElement; up; up = up.parentElement) if (up.id !== "page" && /auto|scroll/.test(getComputedStyle(up).overflowX)) return true; return false; };
      const wide = [...document.querySelectorAll("body *")].find((el) => { if (el.closest('[aria-hidden="true"]') || inSwipeRow(el)) return false; const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > limit + 0.5 || r.left < -0.5); });
      const page = document.getElementById("page");
      // The scene must actually have drawn something, including Wayne Tower's layer.
      const hero = document.querySelector("#scene .g-hero canvas");
      const drawn = hero ? hero.getContext("2d").getImageData(0, 0, hero.width, hero.height).data.some((v, i) => i % 4 === 3 && v > 0) : false;
      return { drawn, scroll: document.documentElement.scrollWidth > limit || (page ? page.scrollWidth > page.clientWidth : false), wide: wide ? wide.tagName + "." + wide.className : null };
    });
    // Every section below the hero hangs off one left edge. Measured here because it only goes wrong at some widths.
    const edges = await page.evaluate(() => [...new Set([".kicker", ".sec-title"].flatMap((q) => [...document.querySelectorAll(q)]).map((el) => {
      const box = el.getBoundingClientRect();
      return Math.round(box.left / 3) * 3; // Within a hair: the hero's plate is turned slightly.
    }))]);
    if (edges.length > 1) failures.push(`${width}x${height} ${path}: left edges differ: ${edges.join(", ")}`);
    // On the home page the story has to pin on every size here, and its sheet, line and hint all have to be on screen once it has.
    if (path === "/") {
      await page.evaluate(() => document.querySelector(".story")?.scrollIntoView());
      await page.waitForTimeout(300);
      const story = await page.evaluate(() => {
        const s = document.querySelector(".story");
        if (!s) return { cine: true, top: 0, bottom: 0 };
        document.getElementById("page").scrollTop = Number(s.dataset.holdStart) + Number(s.dataset.holdLength) / 2;
        return new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done({ cine: "cine" in s.dataset, top: s.querySelector(".story-frame").getBoundingClientRect().top, bottom: s.querySelector(".story-hint").getBoundingClientRect().bottom, header: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) }))));
      });
      if (!story.cine) failures.push(`${width}x${height}: the story didn't pin`);
      else if (story.top < story.header || story.bottom > height) failures.push(`${width}x${height}: the pinned story runs off the screen: ${JSON.stringify(story)}`);
    }
    const ok = overflow.drawn && !overflow.scroll && !overflow.wide && !errors.length;
    if (!ok) failures.push(`${width}x${height} ${path}: ${JSON.stringify(overflow)} ${errors.join("; ")}`);
    console.log(`${ok ? "ok  " : "FAIL"} ${String(width).padStart(4)}x${height}  ${path}`);
  }
  await page.close();
}
// Common phones, with the browser's bars taking their share: a card must fit its sheet without sliding, and no figure may run past its panel. Sizes the widths above don't cover.
for (const [width, height, slides] of [[412, 790, false], [393, 852, false], [360, 640, true], [320, 568, true]]) {
  const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, isMobile: true });
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const story = await page.evaluate(() => { const s = document.querySelector(".story"); return s ? { start: Number(s.dataset.holdStart), length: Number(s.dataset.holdLength), slide: Number(s.dataset.slide ?? 0) } : null; });
  const problems = [];
  if (!story) problems.push("no story");
  else {
    if (!slides && story.slide > 0) problems.push(`a card slides by ${story.slide}px`);
    const tools = await page.evaluate(() => [...document.querySelectorAll(".story-tools")].map((row) => { const items = [...row.querySelectorAll(".story-tool")], tops = new Set(items.map((i) => i.offsetTop)); return { shown: row.getClientRects().length > 0, rows: tops.size, height: row.offsetHeight }; }));
    if (tools.some((t) => t.shown && t.rows !== 1)) problems.push("a card's tools run past one row");
    if (new Set(tools.filter((t) => t.shown).map((t) => t.height)).size > 1) problems.push("the tools row changes height between cards");
    for (let i = 0; i < 4; i++) {
      await page.evaluate(({ top }) => { document.getElementById("page").scrollTop = top; }, { top: story.start + story.length * (i === 3 ? 1 : (i + 0.79) / 4) });
      await page.waitForTimeout(1500); // Long enough for the drawing to finish coming in.
      const cut = await page.evaluate((n) => {
        const canvas = document.querySelector(`canvas[data-chapter="${n}"]`);
        if (!canvas?.width) return null; // A card can be words only.
        const row = (y) => canvas.getContext("2d").getImageData(0, y, canvas.width, 1).data.some((v, q) => q % 4 === 3 && v > 8);
        return row(0) || row(canvas.height - 1);
      }, i);
      if (cut) problems.push(`chapter ${i + 1}'s figure runs past its panel`);
    }
  }
  if (problems.length) failures.push(`${width}x${height} story: ${problems.join("; ")}`);
  console.log(`${problems.length ? "FAIL" : "ok  "} ${String(width).padStart(4)}x${height}  story fits`);
  await page.close();
}
// Featured fits one screen once its cards sit side by side: a jump to it shows the heading, every card and the link.
for (const [width, height] of [[1920, 1000], [1512, 860], [1440, 800], [1366, 650], [1280, 720], [1024, 768], [900, 700]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const fit = await page.evaluate(() => {
    const sec = document.getElementById("featured"), root = getComputedStyle(document.documentElement);
    document.getElementById("page").scrollTop += sec.getBoundingClientRect().top;
    const parts = [".kicker", ".project-grid", ".sec-more"].map((q) => { const el = sec.querySelector(q); return { top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight }; });
    return { top: Math.min(...parts.map((p) => p.top)), bottom: Math.max(...parts.map((p) => p.bottom)), clear: parseFloat(root.getPropertyValue("--header-h")) + parseFloat(root.getPropertyValue("--content-fade")) };
  });
  const ok = fit.top >= fit.clear - 1 && fit.bottom <= height;
  if (!ok) failures.push(`${width}x${height} featured doesn't fit one screen: ${JSON.stringify(fit)}`);
  console.log(`${ok ? "ok  " : "FAIL"} ${String(width).padStart(4)}x${height}  featured fits`);
  await page.close();
}
// A font that fails to load must not stop the city. This once left phones with a plain background.
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.route("**/*.woff2", (route) => route.abort());
  await page.goto(`${base}/`);
  const drawn = await page.waitForSelector("#scene .g-hero canvas", { timeout: 5000 }).then(() => true, () => false);
  if (!drawn) failures.push("fonts blocked: the scene didn't draw");
  console.log(`${drawn ? "ok  " : "FAIL"} fonts blocked  /`);
  await page.close();
}
await browser.close();
server.close();
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
