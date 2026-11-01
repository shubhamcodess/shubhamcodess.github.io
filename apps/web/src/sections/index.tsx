import type { ComponentType } from "react";
import Link from "next/link";
import { visibleProjects, type SectionId } from "@portfolio/content";
import { site } from "@portfolio/site";

/* Bare structure for now. Copy for About, Experience and Now comes from the approved facts. */

function Home() {
  return <section id="home"><h1>{site.name}</h1></section>;
}
function About() {
  return <section id="about"><h2>About</h2></section>;
}
function Experience() {
  return <section id="experience"><h2>Experience</h2></section>;
}
function Projects() {
  return (
    <section id="projects">
      <h2>Projects</h2>
      {visibleProjects().map((p) => (
        <article key={p.slug}>
          <h3><Link href={`/projects/${p.slug}/`}>{p.title}</Link></h3>
          <p>{p.line}</p>
        </article>
      ))}
    </section>
  );
}
function Now() {
  return <section id="now"><h2>Now</h2></section>;
}
function Contact() {
  return (
    <section id="contact">
      <h2>Contact</h2>
      <ul>{site.social.map((s) => <li key={s.href}><a href={s.href}>{s.label}</a></li>)}</ul>
    </section>
  );
}

/** Adding a section id without a component here is a type error. */
export const sections: Record<SectionId, ComponentType> = { home: Home, about: About, experience: Experience, projects: Projects, now: Now, contact: Contact };
