import { resolve } from "node:path";
import type { NextConfig } from "next";

const root = resolve(process.cwd(), "../..");

/** Addresses a phone on the same network reaches the dev server from. Without them `next dev` refuses its scripts, and the page shows with no JavaScript at all. It only affects `next dev`. */
export const LOCAL_NETWORKS = ["10.*.*.*", "172.*.*.*", "192.168.*.*", "*.local"];

const config: NextConfig = {
  allowedDevOrigins: LOCAL_NETWORKS,
  output: "export", // a plain static folder, for GitHub Pages or Firebase
  trailingSlash: true, // /projects/x/index.html needs no server rewrites
  images: { unoptimized: true },
  transpilePackages: ["@portfolio/content", "@portfolio/design", "@portfolio/site"],
  outputFileTracingRoot: root,
  turbopack: { root },
};

export default config;
