import { Hero } from "@/scene/Hero";
import { Shipped } from "@/scene/Shipped";

/* Nothing goes on the page until it's decided. See "How we work" in CLAUDE.md. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Shipped />
    </>
  );
}
