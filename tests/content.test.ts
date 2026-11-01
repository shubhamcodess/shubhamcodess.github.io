import { describe, expect, it } from "vitest";
import { allProjects, projectSchema, siteSchema } from "@portfolio/content";
import { site } from "@portfolio/site";

const valid = {
  slug: "x", title: "X", line: "Line", stack: ["TS"], status: "Live", since: "2026-01", stage: null,
  visibility: "listed", size: "small", order: 2, private: false, links: [],
};

describe("content", () => {
  it("every project file is valid, with unique order", () => {
    const projects = allProjects();
    expect(projects.length).toBeGreaterThan(0);
    expect(new Set(projects.map((p) => p.order)).size).toBe(projects.length);
  });

  it("the site config is valid", () => {
    expect(site.sections).toHaveLength(6);
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

  it("rejects a section list that is missing or repeats a section", () => {
    const sections = site.sections.slice(0, 5);
    expect(siteSchema.safeParse({ ...site, sections }).success).toBe(false);
    expect(siteSchema.safeParse({ ...site, sections: [...sections, sections[0]] }).success).toBe(false);
  });
});
