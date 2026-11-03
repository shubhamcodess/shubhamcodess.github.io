// The phone performance gate. Frame rates swing with the machine running them, so this checks what makes a phone slow, which doesn't: anything that costs every frame, and anything loaded or held before it's needed.
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium, devices } from "playwright";

const OUT = "apps/web/out";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain" };
const MAX_CITY_LAYERS = 5;
const MAX_CANVAS_MEGAPIXELS = 6; // Everything held at once in the film.
const MAX_RESTYLED_PER_FRAME = 60; // Elements restyled by one frame of the film: a whole-section restyle is many hundreds.

const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  const file = join(OUT, path.endsWith("/") ? `${path}index.html` : path);
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
}).listen(0);

const browser = await chromium.launch();
const context = await browser.newContext(devices["Pixel 7"]);
const page = await context.newPage();
const failures = [];
const expect = (ok, what) => { if (!ok) failures.push(what); };

const scripts = new Set();
page.on("response", async (r) => { if (r.url().endsWith(".js")) scripts.add(await r.text().catch(() => "")); });
const drawingLoaded = (mark) => [...scripts].some((s) => s.includes(mark));

await page.goto(`http://localhost:${server.address().port}/`, { waitUntil: "load" });
await page.waitForSelector("#scene .g-hero canvas", { state: "attached", timeout: 15000 });
await page.waitForTimeout(800);

const look = await page.evaluate(() => {
  const css = getComputedStyle(document.getElementById("page")), scene = getComputedStyle(document.getElementById("scene"));
  return { mask: css.maskImage, sceneMask: scene.maskImage, layers: document.querySelectorAll("#scene .g-layer").length };
});
expect(look.mask === "none", `the scrolling page has a mask (${look.mask}): the GPU redoes the screen through it every frame`);
expect(look.sceneMask === "none", "the city has a mask");
expect(look.layers <= MAX_CITY_LAYERS, `the city stacks ${look.layers} full-screen layers, over ${MAX_CITY_LAYERS}`);
expect(!drawingLoaded("64.5% FEWER"), "a project drawing loaded before its card was near the screen");
expect(!drawingLoaded("REVIEW · FEEDBACK LOOP"), "the story's figures loaded before the story was near the screen");

// Touch scrolls natively, so nothing should follow the scroll from script.
await page.evaluate(() => { const p = document.getElementById("page"); p.scrollTop = 700; });
await page.waitForTimeout(300);
expect(await page.evaluate(() => [...document.querySelectorAll("[data-layer]")].every((el) => !el.style.translate)), "a layer is moved from script while a finger scrolls");

await page.evaluate(() => document.querySelector(".story").scrollIntoView());
await page.waitForSelector(".story[data-cine]", { timeout: 15000 });
await page.waitForTimeout(1500);
expect(drawingLoaded("REVIEW · FEEDBACK LOOP"), "the story's figures never loaded");

const film = await page.evaluate(async () => {
  const p = document.getElementById("page"), s = document.querySelector(".story");
  p.scrollTop = Number(s.dataset.holdStart) + Number(s.dataset.holdLength) * 0.45;
  await new Promise((done) => setTimeout(done, 700));
  const scenes = [...s.querySelectorAll("[data-scene]")], canvases = [...document.querySelectorAll("canvas")];
  return {
    blurred: [...scenes, s.querySelector(".story-frame"), s.querySelector(".story-track")].filter((el) => el.style.filter && el.style.filter !== "none").length,
    onSection: ["--story-drawn", "--now", "--hint", "--drift"].filter((v) => s.style.getPropertyValue(v)),
    holding: s.querySelectorAll('canvas[data-chapter]').length - [...s.querySelectorAll("canvas[data-chapter]")].filter((c) => c.width === 0).length,
    hiddenHolding: scenes.filter((el) => el.style.visibility === "hidden" && [...el.querySelectorAll("canvas")].some((c) => c.width > 0)).length,
    megapixels: canvases.reduce((sum, c) => sum + c.width * c.height, 0) / 1e6,
  };
});
expect(film.blurred === 0, `${film.blurred} parts of the film blur on a phone`);
expect(!film.onSection.length, `the film writes ${film.onSection.join(", ")} on the whole section, restyling everything inside it every frame`);
expect(film.hiddenHolding === 0, `${film.hiddenHolding} hidden chapters still hold their canvas`);
expect(film.holding <= 2, `${film.holding} chapters hold a canvas at once`);
expect(film.megapixels <= MAX_CANVAS_MEGAPIXELS, `canvases hold ${film.megapixels.toFixed(1)} megapixels, over ${MAX_CANVAS_MEGAPIXELS}`);

// How much one frame of the film restyles, counted by the browser.
const cdp = await context.newCDPSession(page);
await cdp.send("Tracing.start", { transferMode: "ReturnAsStream", categories: "devtools.timeline" }).catch(() => {});
await page.evaluate(async () => {
  const p = document.getElementById("page");
  for (let i = 0; i < 30; i++) { p.scrollTop += 7; await new Promise(requestAnimationFrame); }
});
const events = await new Promise((done) => {
  cdp.once("Tracing.tracingComplete", async ({ stream }) => {
    let text = "", more = true;
    while (more) { const c = await cdp.send("IO.read", { handle: stream }); text += c.data; more = !c.eof; }
    done(JSON.parse(text).traceEvents ?? []);
  });
  void cdp.send("Tracing.end");
});
const restyled = events.filter((e) => e.name === "UpdateLayoutTree").map((e) => e.args?.elementCount ?? 0).sort((a, b) => a - b);
const typical = restyled[Math.floor(restyled.length * 0.9)] ?? 0;
expect(restyled.length > 0, "couldn't count restyles");
expect(typical <= MAX_RESTYLED_PER_FRAME, `one frame of the film restyles ${typical} elements, over ${MAX_RESTYLED_PER_FRAME}`);

await browser.close();
server.close();
if (failures.length) {
  console.error(`Phone performance gate failed:\n${failures.map((f) => `  - ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`Phone performance gate passed: ${look.layers} city layers, ${film.megapixels.toFixed(1)} megapixels held, ${typical} elements restyled per film frame.`);
