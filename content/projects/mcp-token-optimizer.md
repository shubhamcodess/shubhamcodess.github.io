---
slug: mcp-token-optimizer
title: mcp-token-optimizer
line: A self-hosted proxy between your AI agent and its MCP servers. It shrinks every tool response without changing what the agent can do.
stack: [TypeScript, Node.js, MCP, Ollama, TOON]
status: Open source, Apache-2.0
live: false
since: "2026-09"
stage: token-flow
facts:
  - { value: "98.4%", label: "Tokens saved, CI build log" }
  - { value: "64.5%", label: "Tokens saved, GitHub issue list" }
  - { value: "48.7%", label: "Tokens saved, live Kubernetes run" }
visibility: listed
order: 2
private: false
links:
  - { label: Project site, href: "https://shubhamcodess.github.io/mcp-token-optimizer/", kind: site }
  - { label: Code, href: "https://github.com/shubhamcodess/mcp-token-optimizer", kind: code }
  - { label: npm, href: "https://www.npmjs.com/package/@shubhamcodess/mcp-token-optimizer", kind: package, stats: { npm: "@shubhamcodess/mcp-token-optimizer", show: [weekly, monthly] } }
---

Every token an MCP tool returns is paid for and fills the model's context window, and real tool output is mostly noise: null fields, hypermedia URLs, ids, repeated blocks, ANSI and progress-bar spam. This proxy sits between the agent and its MCP servers, and shrinks each response by pruning, TOON encoding and local-LLM summarization.

It's local only. It talks only to your own MCP servers and to a local Ollama, with no telemetry and no cloud model providers.

## Measured results

Reproducible with no LLM involved, using `npm run smoke`. Token counts are a model-agnostic estimate.

| Tool response | Original | Sent to the agent | Saved |
|---|---|---|---|
| GitHub issue list (40 issues, REST JSON) | 37,355 | 13,244 | 64.5% |
| Kubernetes describe and manifest | 3,637 | 1,935 | 46.8% |
| CI build log | 4,926 | 78 | 98.4% |
| HTML runbook page | 1,198 | 863 | 28.0% |
| Real Kubernetes ConfigMap through a live MCP server, Copilot A/B run | 24,616 | 12,617 | 48.7% |

In the live A/B run, the three files the agent wrote from the optimized result were byte-identical to the original data.

## What I built

- **Lossless first:** JSON to TOON is emitted only after a verified round-trip, and duplicate blocks become pointers.
- **Fail-open, never bigger:** any error, timeout or Ollama outage forwards the original, and an optimized result is used only if it's strictly cheaper.
- **`mto_expand`:** notes name exactly what was pruned, and the agent can fetch the exact original on demand.
- **Shadow mode:** measures real savings while forwarding the originals, so it can roll out with zero risk.
- **Any MCP client:** a stdio wrapper and a local HTTP/SSE proxy, which install into VS Code Copilot, Claude, Cursor, Windsurf, Gemini CLI, Cline and Roo.
- **Local dashboard:** overview, live traffic, connections, config editor, eval history, and advisor and drift warnings, with no CDN.
