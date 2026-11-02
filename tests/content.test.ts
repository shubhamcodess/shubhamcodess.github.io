import { describe, expect, it } from "vitest";
import { allProjects, featuredProjects, fullProject, listedProjects, projectSchema, siteSchema } from "@portfolio/content";
import { site } from "@portfolio/site";

const valid = {
  slug: "x", title: "X", line: "Line", stack: ["TS"], status: "Live", live: false, since: "2026-01", stage: null,
  facts: [{ value: "1", label: "One" }], visibility: "listed", order: 2, private: false, links: [],
};

describe("content", () => {
  it("every project file is valid, with unique order", () => {
    const projects = allProjects();
    expect(projects.length).toBeGreaterThan(0);
    expect(new Set(projects.map((p) => p.order)).size).toBe(projects.length);
  });

  it("the site config is valid", () => {
    expect(site.name).toBeTruthy();
  });

  it("rejects a private project with links", () => {
    const links = [{ label: "Code", href: "https://example.com", kind: "code" }];
    expect(projectSchema.safeParse({ ...valid, private: true, links }).success).toBe(false);
    expect(projectSchema.safeParse({ ...valid, links }).success).toBe(true);
  });

  it("rejects more than three links and unknown fields", () => {
    const link = { label: "L", href: "https://example.com", kind: "site" };
    expect(projectSchema.safeParse({ ...valid, links: [link, link, link, link] }).success).toBe(false);
    expect(projectSchema.safeParse({ ...valid, featured: true }).success).toBe(false);
  });

  it("a card and a page read the same file, and only the page gets the body", () => {
    for (const summary of listedProjects()) {
      const { html, ...rest } = fullProject(summary.slug);
      expect(rest).toEqual(summary);
      expect(html.length).toBeGreaterThan(0);
      expect(summary).not.toHaveProperty("html");
    }
  });

  it("the homepage's picks exist, keep their rank, and fail the build if they don't", () => {
    expect(featuredProjects(site.shipped.items).map((f) => f.project.slug)).toEqual(site.shipped.items.map((i) => i.slug));
    expect(() => featuredProjects([{ slug: "nope" }])).toThrow(/nope/);
  });

  it("rejects a card wider than the grid, or the same project twice", () => {
    const item = { slug: "a", layout: "vertical", span: 1 };
    const shipped = (columns: number, items: unknown[]) => siteSchema.safeParse({ ...site, shipped: { ...site.shipped, columns, items } }).success;
    expect(shipped(2, [item, { ...item, slug: "b" }])).toBe(true);
    expect(shipped(1, [{ ...item, span: 2 }])).toBe(false);
    expect(shipped(2, [item, item])).toBe(false);
  });
});
