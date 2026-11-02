import { Hero } from "@/scene/Hero";
import { Shipped } from "@/scene/Shipped";
import { Story } from "@/scene/Story";

/* Nothing goes on the page until it's decided. See "How we work" in CLAUDE.md. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Shipped />
      <Story />
    </>
  );
}
