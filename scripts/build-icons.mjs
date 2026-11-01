/* Draws the site icons from the logo's own shapes. Run `pnpm icons` after changing the letters or the batarang, and commit the results.
   Thin blueprint lines vanish at tab size, so small sizes are recomposed: bigger, solid and tightly cropped. */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { BATARANG_OUTLINE } from "../apps/web/src/scene/batarang-shape.ts";
import { LOGO_LETTERS } from "../apps/web/src/scene/logo-letters.ts";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../apps/web/src/app");
const INK = "#131c1f", RUST = "#8a4a22", PAPER = "#f2eddf"; // Old Gotham, the default theme. Browsers don't theme an icon.

const letters = LOGO_LETTERS.map((s) => `M${s.map(([x, y]) => `${x} ${y}`).join("L")}Z`).join("");
const blade = (r) => `M${BATARANG_OUTLINE.map(([x, y]) => `${(x * r).toFixed(2)} ${(y * r).toFixed(2)}`).join("L")}Z`;

/* Letters low in the square, the batarang large across the top with its wing tip buried in the P. */
const icon = ({ corner, solid, stroke }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${corner}" fill="${PAPER}"/>
  <defs><clipPath id="outside"><polygon points="-60,-90 170,-90 170,90 47.6,90 47.6,.3 -60,.3"/></clipPath></defs>
  <g transform="matrix(1 -.08 .16 1 3.6 28)">
    <path d="${letters}" fill-rule="evenodd" ${solid ? `fill="${INK}"` : `fill="none" stroke="${INK}" stroke-width="${stroke}"`}/>
    <g clip-path="url(#outside)">
      <path d="${blade(21)}" transform="translate(39.5 -10.5) rotate(-14)" fill="${RUST}"/>
    </g>
  </g>
</svg>`;

const sizes = [
  { file: "icon1.png", size: 16, corner: 8, solid: true },
  { file: "icon2.png", size: 32, corner: 9, solid: true },
  { file: "apple-icon.png", size: 180, corner: 0, solid: false, stroke: 1.5 }, // iOS rounds it itself, and this is big enough for the blueprint lines
];

const browser = await chromium.launch();
const page = await (await browser.newContext({ deviceScaleFactor: 1 })).newPage();
for (const { file, size, ...look } of sizes) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;background:transparent">${icon(look).replace("<svg ", `<svg width="${size}" height="${size}" style="display:block" `)}</body>`);
  await page.screenshot({ path: resolve(app, file), omitBackground: true });
  console.log("wrote", file);
}
await browser.close();
