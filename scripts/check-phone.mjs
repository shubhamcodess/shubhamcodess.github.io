// Loads the running dev server the way a phone does: by this computer's network address, in a phone's browser. `pnpm check` can't, because it tests a build on localhost.
import { networkInterfaces } from "node:os";
import { chromium, webkit, devices } from "playwright";

const ip = Object.values(networkInterfaces()).flat().find((a) => a?.family === "IPv4" && !a.internal)?.address;
if (!ip) { console.error("No network address: this computer isn't on a network."); process.exit(1); }
const url = `http://${ip}:${process.argv[2] ?? 3000}/`;
let failed = false;
for (const [name, type, device] of [["Android", chromium, devices["Pixel 7"]], ["iPhone", webkit, devices["iPhone 13"]]]) {
  const browser = await type.launch();
  const page = await (await browser.newContext(device)).newPage();
  const refused = [];
  page.on("response", (r) => { if (r.status() >= 400 && r.url().includes("/_next/")) refused.push(r.status()); });
  try {
    await page.goto(url, { waitUntil: "load" });
    await page.waitForSelector("#scene .g-hero canvas", { timeout: 15000 });
    await page.evaluate(() => document.querySelector(".story")?.scrollIntoView());
    await page.waitForSelector(".story[data-cine]", { timeout: 15000 });
    await page.waitForSelector(".story-canvas", { timeout: 5000 });
    console.log(`ok    ${name}  ${url}`);
  } catch (e) {
    failed = true;
    console.error(`FAIL  ${name}  ${url}  ${refused.length} scripts refused  ${e.message.split("\n")[0]}`);
  }
  await browser.close();
}
process.exit(failed ? 1 : 0);
