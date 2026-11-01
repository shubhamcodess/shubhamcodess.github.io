import type { Metadata } from "next";
import type { ReactNode } from "react";
import { backgroundBootScript, paletteCss } from "@portfolio/design";
import { site } from "@portfolio/site";
import "@portfolio/design/tokens.css";
import "@portfolio/design/environment.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const { default: palette, onLoad } = site.background;
  return (
    // The boot script can change data-palette before React loads, so React shouldn't flag that as a mismatch.
    <html lang="en" data-theme="light" data-palette={palette} data-palette-default={palette} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: paletteCss() }} />
        <script dangerouslySetInnerHTML={{ __html: backgroundBootScript(onLoad) }} />
      </head>
      <body>
        <div className="environment" aria-hidden="true">
          <div className="environment-sky" />
          <div className="environment-sun" />
          <div className="environment-grain" />
        </div>
        {children}
      </body>
    </html>
  );
}
