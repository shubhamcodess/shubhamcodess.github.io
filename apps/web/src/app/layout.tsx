import type { Metadata } from "next";
import { Barlow_Semi_Condensed, Chakra_Petch, Saira_Semi_Condensed } from "next/font/google";
import type { ReactNode } from "react";
import { ScrollThumb } from "@portfolio/design/scroll-thumb";
import { backgroundBootScript, paletteCss } from "@portfolio/design";
import { site } from "@portfolio/site";
import { BackgroundPanel } from "@/dev/BackgroundPanel";
import { Batarang } from "@/scene/Batarang";
import { GothamScene } from "@/scene/GothamScene";
import { SiteHeader } from "@/scene/SiteHeader";
import "@portfolio/design/tokens.css";
import "@portfolio/design/environment.css";
import "./globals.css";
import "@/scene/scene.css";

// Self-hosted at build time. Only the button label font so far: the rest of the type isn't decided.
const label = Barlow_Semi_Condensed({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-label" });
// Only for trying options in the control panel. They load only if picked, and go when the panel goes.
const chakra = Chakra_Petch({ weight: "600", subsets: ["latin"], variable: "--font-chakra", preload: false });
const saira = Saira_Semi_Condensed({ weight: "600", subsets: ["latin"], variable: "--font-saira", preload: false });

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const { default: palette, onLoad } = site.background;
  const { face, contentFade, depth, sway, haze, dust, density, reach, word } = site.scene;
  return (
    // The boot script can change data-palette before React loads, so React shouldn't flag that as a mismatch.
    <html
      lang="en"
      className={`${label.variable} ${chakra.variable} ${saira.variable}`}
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
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: paletteCss() }} />
        <script dangerouslySetInnerHTML={{ __html: backgroundBootScript(onLoad) }} />
      </head>
      <body>
        <div className="environment" aria-hidden="true">
          <div className="environment-sky" />
          <div className="environment-sun" />
        </div>
        <GothamScene />
        <main id="page" className="page" tabIndex={-1}>{children}</main>
        <SiteHeader />
        <ScrollThumb target="#page"><Batarang /></ScrollThumb>
        <div className="environment-vignette" aria-hidden="true" />
        <div className="environment-grain" aria-hidden="true" />
        {site.flags.backgroundPanel && <BackgroundPanel />}
      </body>
    </html>
  );
}
