import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { ScrollMotion } from "@portfolio/design/scroll-motion";
import { ScrollThumb } from "@portfolio/design/scroll-thumb";
import { backgroundBootScript, paletteCss, PALETTE_IDS } from "@portfolio/design";
import { site } from "@portfolio/site";
import { BackgroundPanel } from "@/dev/BackgroundPanel";
import { Batarang } from "@/scene/Batarang";
import { GothamScene } from "@/scene/GothamScene";
import { ScrollHash } from "@/scene/ScrollHash";
import { ScrollReset } from "@/scene/ScrollReset";
import { SiteHeader } from "@/scene/SiteHeader";
import "@portfolio/design/tokens.css";
import "@portfolio/design/environment.css";
import "./globals.css";
import "@/scene/scene.css";
import "@/scene/sections.css";

// Self-hosted at build time. One family everywhere: the page, the buttons and the lettering in the art.
const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", preload: false });

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
};

// Shows the theme button's icon for the active theme, from the first paint and for any theme added later.
const themeIconCss = PALETTE_IDS.map((id) => `[data-palette="${id}"] .site-header .bp.theme-button .theme-icons .theme-icon-${id}{opacity:1;transform:none}`).join("");

export default function RootLayout({ children }: { children: ReactNode }) {
  const { default: palette, onLoad } = site.background;
  const { face, contentFade, depth, sway, haze, dust, density, reach, word } = site.scene;
  const { iconHover, textHover } = site.buttonMotion;
  return (
    // The boot script can change data-palette before React loads, so React shouldn't flag that as a mismatch.
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      data-reveal={site.flags.motion ? site.scroll.reveal : undefined}
      data-hide={site.scroll.hide ? "on" : "off"}
      data-theme="light"
      data-palette={palette}
      data-palette-default={palette}
      data-face={face}
      data-content-fade={contentFade}
      data-depth={depth}
      data-sway={sway}
      data-haze={haze}
      data-dust={dust}
      data-density={density}
      data-reach={reach}
      data-word={word}
      data-icon-hover={iconHover}
      data-text-hover={textHover}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: paletteCss() + themeIconCss }} />
        <script dangerouslySetInnerHTML={{ __html: backgroundBootScript(onLoad) }} />
      </head>
      <body>
        <div className="environment" aria-hidden="true">
          <div className="environment-sky" />
          <div className="environment-sun" />
        </div>
        <GothamScene />
        <main id="page" className="page" tabIndex={-1}><div className="page-inner">{children}</div></main>
        {site.flags.motion && <ScrollMotion target="#page" content=".page-inner" lerp={site.scroll.lerp} lag={site.scroll.lag} parallax={site.scroll.parallax} />}
        <ScrollReset />
        <ScrollHash />
        <SiteHeader />
        <ScrollThumb target="#page"><Batarang /></ScrollThumb>
        <div className="environment-vignette" aria-hidden="true" />
        <div className="environment-grain" aria-hidden="true" />
        {site.flags.backgroundPanel && <BackgroundPanel />}
      </body>
    </html>
  );
}
