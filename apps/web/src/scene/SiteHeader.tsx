import Link from "next/link";
import { Button } from "@portfolio/design/button";
import { site } from "@portfolio/site";
import { HeaderMenu, type MenuLink } from "./HeaderMenu";
import { SiteLogo } from "./SiteLogo";
import { ThemeButton } from "./ThemeButton";

/* No bar: the items stand alone as buttons. On a phone the sections fold into one Menu button. */
const style = { ...site.headerButton, size: "sm", variant: "primary" } as const;
const socials: MenuLink[] = site.socials.map((s) => ({ ...s, external: true }));
// Resume has nothing to link to yet, and Projects has no section yet.
const sections: MenuLink[] = [{ label: "Projects", href: "/#projects" }, { label: "Resume", href: "/#resume" }];

export function SiteHeader() {
  return (
    <header className="site-header">
      <SiteLogo />
      <nav aria-label="Main" className="header-nav">
        <div className="header-wide">
          <Button {...style} as={Link} href="/#projects" icon="folder">Projects</Button>
          <Button {...style} as={Link} href="/#resume" icon="page">Resume</Button>
          <HeaderMenu {...style} icon="nodes" label="Socials" links={socials} />
        </div>
        <HeaderMenu {...style} className="header-narrow" icon="menu" label="Menu" links={[...sections, ...socials]} />
        <ThemeButton {...style} initial={site.background.default} />
      </nav>
    </header>
  );
}
