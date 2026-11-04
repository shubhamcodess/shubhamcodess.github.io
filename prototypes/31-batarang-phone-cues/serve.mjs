// Serves the built site with the prototype added to every page, so it can be felt on the real sections.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)), OUT = join(here, "../../apps/web/out"), PORT = Number(process.argv[2] ?? 3031);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".xml": "text/xml" };
const ADD = '<link rel="stylesheet" href="/__proto/nav.css"><script src="/__proto/nav.js" defer></script></head>';

createServer((req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  const file = path.startsWith("/__proto/") ? join(here, path.slice(9)) : join(OUT, path.endsWith("/") ? `${path}index.html` : path);
  if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
  const type = TYPES[extname(file)] ?? "application/octet-stream";
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type === "text/html" ? readFileSync(file, "utf8").replace("</head>", ADD) : readFileSync(file));
}).listen(PORT, () => {
  const ip = Object.values(networkInterfaces()).flat().find((a) => a?.family === "IPv4" && !a.internal)?.address;
  console.log(`Computer: http://localhost:${PORT}\nPhone:    http://${ip}:${PORT}`);
});
