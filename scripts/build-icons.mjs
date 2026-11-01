/* Draws the site icons: the logo's batarang alone, at the angle it's lodged, as big as the square allows.
   Run `pnpm icons` after changing the shape or its angle, and commit the results. */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { BATARANG_OUTLINE, BLADE_ANGLE, BLADE_TILT } from "../apps/web/src/scene/batarang-shape.ts";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../apps/web/src/app");
const RUST = "#8a4a22", PAPER = "#f2eddf"; // Old Gotham, the default theme. Browsers don't theme an icon.

// The outline in place, then scaled and centred to fill the square.
const rad = (BLADE_ANGLE * Math.PI) / 180, [a, b, c, d] = BLADE_TILT;
const placed = BATARANG_OUTLINE.map(([x, y]) => {
  const rx = x * Math.cos(rad) - y * Math.sin(rad), ry = x * Math.sin(rad) + y * Math.cos(rad);
  return [a * rx + c * ry, b * rx + d * ry];
});
const xs = placed.map(([x]) => x), ys = placed.map(([, y]) => y);
const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];

const icon = ({ margin, tile, edge }) => {
  const scale = (64 - margin * 2) / Math.max(maxX - minX, maxY - minY);
  const dx = 32 - ((minX + maxX) / 2) * scale, dy = 32 - ((minY + maxY) / 2) * scale;
  const shape = `M${placed.map(([x, y]) => `${(x * scale + dx).toFixed(2)} ${(y * scale + dy).toFixed(2)}`).join("L")}Z`;
  // No tile in a tab, so it stays large. A paper edge keeps it visible on a dark tab bar.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    ${tile ? `<rect width="64" height="64" fill="${PAPER}"/>` : ""}
    <path d="${shape}" fill="${RUST}" stroke="${PAPER}" stroke-width="${edge}" stroke-linejoin="round" paint-order="stroke"/>
  </svg>`;
};

const sizes = [
  { file: "icon1.png", size: 16, margin: 1.5, edge: 2.5, tile: false },
  { file: "icon2.png", size: 32, margin: 1.5, edge: 3, tile: false },
  { file: "apple-icon.png", size: 180, margin: 8, edge: 0, tile: true }, // phones need a solid background, and round the corners themselves
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
