// Serves the built portfolio (apps/portfolio/dist). Any address with no page gets 404.html with the prototype added,
// the way GitHub Pages answers it, so the not-found page can be felt on the real header, sky and buttons.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)), DIST = join(here, "../../apps/portfolio/dist"), PORT = Number(process.argv[2] ?? 3033);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain", ".md": "text/markdown", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".json": "application/json", ".mp4": "video/mp4", ".xml": "text/xml", ".ico": "image/x-icon" };
const ADD = '<link rel="stylesheet" href="/__proto/not-found.css"><script src="/__proto/not-found.js" defer></script></head>';

createServer((req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  if (path.startsWith("/__proto/")) {
    const file = join(here, path.slice(9));
    res.writeHead(200, { "Content-Type": TYPES[extname(file)], "Cache-Control": "no-store" });
    return res.end(readFileSync(file));
  }
  const file = join(DIST, path.endsWith("/") ? `${path}index.html` : path);
  if (existsSync(file) && !statSync(file).isDirectory()) {
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
    return res.end(readFileSync(file));
  }
  // The CSP in the built page would block the prototype's own files only if they came from elsewhere; they are same-origin.
  res.writeHead(404, { "Content-Type": "text/html", "Cache-Control": "no-store" });
  res.end(readFileSync(join(DIST, "404.html"), "utf8").replace("</head>", ADD));
}).listen(PORT, () => {
  const ip = Object.values(networkInterfaces()).flat().find((a) => a?.family === "IPv4" && !a.internal)?.address;
  console.log(`Computer: http://localhost:${PORT}/nope/\nPhone:    http://${ip}:${PORT}/nope/`);
});
