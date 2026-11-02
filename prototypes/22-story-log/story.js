/* The section's content, in the shape it would have as a strict type in production. Change words here and nothing else moves.

   type LogVerb = "owned" | "migrated" | "built" | "replaced" | "made" | "shipped" | "led" | "designed" | "reworked" | "turned";
   type LogEntry = { verb: LogVerb; what: string };                 // one thing that was done, in plain words
   type Tool = "java" | "spring" | "angular" | "react" | "nextjs" | "typescript" | "openshift" | "gke" | "kubernetes" | "helm"
             | "github-actions" | "azure-ad" | "oracle" | "postgresql" | "rabbitmq" | "mcp";    // each gets one hand-drawn logo, once
   type Scene = {
     stop: { kind: "text"; text: string } | { kind: "batarang" };   // the milestone on the line
     label: string; title: string; role: string; line: string;
     figure: string;                                                // the caption for the motion graphic beside it
     log: LogEntry[];                                               // 3 to 5
     tools: Tool[];                                                 // up to 6
   };
*/
window.STORY = {
  kicker: "How I got here",
  scenes: [
    {
      stop: { kind: "text", text: "2020" },
      label: "It started with", title: "Keeping it running.", role: "Associate System Engineer, IBM", figure: "A system that can't stop",
      line: "The global tax engines behind every in-store and online sale of a multinational retailer.",
      log: [
        { verb: "owned", what: "production deployments and high-priority incidents" },
        { verb: "migrated", what: "the platform twice: OpenShift 3 to 4, then OpenShift to GKE" },
        { verb: "replaced", what: "repeated tax-holiday firefighting with an advance-check process" },
        { verb: "built", what: "a unit-testing framework for a legacy Spring codebase that had none" },
      ],
      tools: ["java", "spring", "angular", "openshift", "gke"],
    },
    {
      stop: { kind: "batarang" },
      label: "Then", title: "Building it.", role: "Application Developer, IBM", figure: "Legacy into a modern stack",
      line: "Moving enterprise applications off a legacy stack, starting with the pilot that had to prove it.",
      log: [
        { verb: "built", what: "the pilot's Angular codebase and team standards from scratch; it got the wider migration approved" },
        { verb: "made", what: "a 10,000-item dropdown feel instant" },
        { verb: "built", what: "a multi-day calendar view natively, with no library" },
        { verb: "shipped", what: "the program's first single sign-on" },
        { verb: "led", what: "teams of up to 10 engineers" },
      ],
      tools: ["angular", "typescript", "spring", "java", "openshift", "azure-ad"],
    },
    {
      stop: { kind: "batarang" },
      label: "Then", title: "Leading it.", role: "Team lead and shadow architect, IBM", figure: "One framework, many systems",
      line: "A B2B order platform live in production, with its architecture co-designed alongside the solution architect.",
      log: [
        { verb: "designed", what: "the shared framework every source-system integration runs on" },
        { verb: "reworked", what: "batch processing with bounded concurrency and a tuned thread executor" },
        { verb: "turned", what: "a 20-minute data compile into seconds" },
        { verb: "led", what: "a team to deliver an inventory valuation app a month ahead of schedule" },
      ],
      tools: ["java", "spring", "angular", "oracle", "openshift"],
    },
    {
      stop: { kind: "batarang" },
      label: "Now", title: "Cloud Full Stack Developer.", role: "IBM", figure: "Every layer, with agents on top",
      line: "Products from requirement to production: backend, frontend, schema and deployment. And AI agents for enterprise applications.",
      log: [
        { verb: "designed", what: "a reusable CI/CD framework, adopted across 10+ repositories" },
        { verb: "built", what: "a browser-based Kubernetes fleet control plane, with an MCP server and an AI assistant" },
        { verb: "built", what: "a workflow platform with a visual DAG builder and live run monitoring" },
        { verb: "led", what: "the team: PR reviews, code standards, architecture decisions" },
      ],
      tools: ["java", "react", "kubernetes", "github-actions", "rabbitmq", "mcp"],
    },
  ],
};
