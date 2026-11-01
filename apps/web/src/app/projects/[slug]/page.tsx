import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { visibleProjects } from "@portfolio/content";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => visibleProjects().map(({ slug }) => ({ slug }));

const find = async ({ params }: Props) => {
  const { slug } = await params;
  return visibleProjects().find((p) => p.slug === slug);
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const project = await find(props);
  return project ? { title: project.title, description: project.line } : {};
}

export default async function ProjectPage(props: Props) {
  const project = await find(props);
  if (!project) notFound();
  return (
    <main>
      <Link href="/">All projects</Link>
      <h1>{project.title}</h1>
      <p>{project.status}</p>
      <ul>
        {project.links.map((link) => (
          <li key={link.href}><a href={link.href}>{link.label}</a></li>
        ))}
      </ul>
      {/* The project's own Markdown from this repo, so it is trusted. */}
      <div dangerouslySetInnerHTML={{ __html: project.html }} />
      <p>{project.stack.join(" · ")}</p>
    </main>
  );
}
