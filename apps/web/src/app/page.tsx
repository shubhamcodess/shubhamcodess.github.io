import { site } from "@portfolio/site";
import { sections } from "@/sections";

export default function HomePage() {
  return (
    <main>
      {site.sections
        .filter((s) => s.enabled)
        .map(({ id }) => {
          const Section = sections[id];
          return <Section key={id} />;
        })}
    </main>
  );
}
