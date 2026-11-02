/* The section's content, in the shape it would have as a strict type in production. Change words here and nothing else moves.

   type ProofCell = { label: string; value: string; claim: string };   // value is short and is the thing you read first
   type Scene = {
     stop: { kind: "text"; text: string } | { kind: "batarang" };      // the milestone on the line
     label: string;                                                    // "It started with", "Then", "Now"
     title: string;
     role: string;
     line: string;
     figure: string;                                                   // the caption for the motion graphic beside it
     proof: [ProofCell, ProofCell, ProofCell];                         // always exactly three, so the title block never changes shape
   };
*/
window.STORY = {
  kicker: "How I got here",
  scenes: [
    {
      stop: { kind: "text", text: "2020" },
      label: "It started with", title: "Keeping it running.", role: "Associate System Engineer, IBM", figure: "A system that can't stop",
      line: "My first system was one that couldn't stop: the global tax engines behind every in-store and online sale of a multinational retailer.",
      proof: [
        { label: "Production", value: "Owned", claim: "Deployments and high-priority incidents." },
        { label: "Platform migrations", value: "2", claim: "OpenShift 3 to 4, then OpenShift to GKE." },
        { label: "Legacy codebase", value: "From none", claim: "A unit-testing framework for a Spring codebase that had no tests." },
      ],
    },
    {
      stop: { kind: "batarang" },
      label: "Then", title: "Building it.", role: "Application Developer, IBM", figure: "Legacy into a modern stack",
      line: "Moved enterprise applications off a legacy stack and onto Spring Boot, Angular and OpenShift, starting with the pilot that had to prove it.",
      proof: [
        { label: "The pilot", value: "From scratch", claim: "Angular codebase and team standards. Its success got the wider migration approved." },
        { label: "Dropdown items", value: "10,000", claim: "Made to feel instant: virtualized rendering, pre-fetching, indexed in-memory search." },
        { label: "Single sign-on", value: "First", claim: "The program's first, on Azure AD." },
      ],
    },
    {
      stop: { kind: "batarang" },
      label: "Then", title: "Leading it.", role: "Team lead and shadow architect, IBM", figure: "One framework, many systems",
      line: "Led teams of up to 10 engineers, then a B2B order platform live in production, co-designing its architecture with the solution architect.",
      proof: [
        { label: "Integrations", value: "1 framework", claim: "Every source system runs on it. A new integration means writing tasks, not new plumbing." },
        { label: "Data compile", value: "20 min to seconds", claim: "With a scheduled materialized view." },
        { label: "Delivery", value: "A month early", claim: "Led a team to ship an inventory valuation app ahead of schedule." },
      ],
    },
    {
      stop: { kind: "batarang" },
      label: "Now", title: "Cloud Full Stack Developer.", role: "IBM", figure: "Every layer, with agents on top",
      line: "I take products from requirement to production: backend, frontend, schema and deployment. And I build AI agents for enterprise applications.",
      proof: [
        { label: "CI/CD framework", value: "10+ repos", claim: "Reusable GitHub Actions, adopted across them." },
        { label: "Fleet control plane", value: "Kubernetes + AI", claim: "Browser-based, with an MCP server and an AI assistant on top." },
        { label: "Workflow platform", value: "Java 21", claim: "Visual DAG builder, live run monitoring, RabbitMQ and virtual threads." },
      ],
    },
  ],
};
