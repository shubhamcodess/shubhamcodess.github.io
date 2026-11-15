/**
 * The tools used across the day job and the builds, for the quick scan on the home page.
 * A tool belongs here only if it was used in real work. Each group is one row.
 */
export interface ToolGroup {
  readonly label: string
  readonly tools: readonly string[]
}

export const toolGroups: readonly ToolGroup[] = [
  {
    label: 'Languages and frameworks',
    tools: ['Java', 'Spring Boot', 'TypeScript', 'Angular', 'React', 'Next.js', 'Node.js', 'Python', 'Rust', 'WebAssembly'],
  },
  {
    label: 'Cloud and delivery',
    tools: ['Kubernetes', 'GKE', 'OpenShift', 'GitHub Actions', 'RabbitMQ', 'Oracle', 'Azure AD', 'Vercel', 'GitHub Pages'],
  },
  {
    label: 'AI',
    tools: ['MCP', 'Claude Code', 'GitHub Copilot', 'Ollama', 'WebLLM', 'WebGPU', 'transformers.js', 'AI agents'],
  },
]
