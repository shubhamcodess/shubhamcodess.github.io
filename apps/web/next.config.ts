import { resolve } from "node:path";
import type { NextConfig } from "next";

const root = resolve(process.cwd(), "../..");

const config: NextConfig = {
  output: "export", // a plain static folder, for GitHub Pages or Firebase
  trailingSlash: true, // /projects/x/index.html needs no server rewrites
  images: { unoptimized: true },
  transpilePackages: ["@portfolio/content", "@portfolio/site"],
  outputFileTracingRoot: root,
  turbopack: { root },
};

export default config;
