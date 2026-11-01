import Link from "next/link";
import { Button } from "@portfolio/design/button";

/* Placeholder logo and one link, for now. There's no bar: the items stand alone as buttons. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <Button as={Link} href="/" variant="secondary" size="sm" aria-label="Home">SP</Button>
      <nav aria-label="Main">
        <Button as={Link} href="/#projects" size="sm" icon="arrow" data-tower="">Projects</Button>
      </nav>
    </header>
  );
}
