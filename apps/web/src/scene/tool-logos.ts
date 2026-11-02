import type { Tool } from "@portfolio/content/schema";

/* The tools in the story, each as a small plan the same pen draws. Hand-sketched references to each logo, in a 24px square. */

type Plan = number[][][];
const arc = (cx: number, cy: number, rx: number, ry = rx, from = 0, to = 360, turn = 0): number[][] => {
  const n = Math.max(6, Math.round(Math.abs(to - from) / 24)), t = (turn * Math.PI) / 180;
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    return [cx + x * Math.cos(t) - y * Math.sin(t), cy + x * Math.sin(t) + y * Math.cos(t)];
  });
};
const ring = (cx: number, cy: number, r: number, sides: number, start = -90): number[][] => Array.from({ length: sides + 1 }, (_, i) => {
  const a = ((start + (360 * i) / sides) * Math.PI) / 180;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
});
const spokes = (cx: number, cy: number, from: number, to: number, sides: number, start = -90): Plan => Array.from({ length: sides }, (_, i) => {
  const a = ((start + (360 * i) / sides) * Math.PI) / 180;
  return [[cx + Math.cos(a) * from, cy + Math.sin(a) * from], [cx + Math.cos(a) * to, cy + Math.sin(a) * to]];
});
const pill = (cx: number, cy: number, w: number, h: number): number[][] => [...arc(cx + w, cy, h, h, -90, 90), ...arc(cx - w, cy, h, h, 90, 270), [cx + w, cy - h]];

export const TOOL_LOGOS: Record<Tool, { name: string; plan: Plan }> = {
  java: { name: "Java", plan: [[[5.5, 11], [5.8, 17], [8, 20.4], [14.5, 20.4], [16.6, 17], [17, 11], [5.5, 11]], [[17, 12.2], [20.2, 12.4], [20.2, 15.8], [16.7, 16.4]], [[4, 22.4], [18.6, 22.4]], [[9, 8.6], [10.4, 6.6], [8.8, 4.6], [10, 2.6]], [[13.2, 8.6], [14.6, 6.6], [13, 4.6], [14.2, 2.6]]] },
  spring: { name: "Spring", plan: [[[5.2, 19.2], [3.2, 13.5], [5.8, 7.8], [12.4, 4.8], [20.8, 3], [20.8, 10.5], [17.6, 16.6], [11.4, 20.4], [5.2, 19.2]], [[3.2, 21.6], [8.8, 15.6], [15.6, 9.2]]] },
  angular: { name: "Angular", plan: [[[12, 1.8], [21.4, 5.2], [19.8, 17.6], [12, 22.2], [4.2, 17.6], [2.6, 5.2], [12, 1.8]], [[7.2, 17.2], [12, 5.8], [16.8, 17.2]], [[9, 13.2], [15, 13.2]]] },
  react: { name: "React", plan: [arc(12, 12, 1.5), arc(12, 12, 10.6, 4.1, 0, 360, 0), arc(12, 12, 10.6, 4.1, 0, 360, 60), arc(12, 12, 10.6, 4.1, 0, 360, 120)] },
  typescript: { name: "TypeScript", plan: [[[2.6, 2.8], [21.4, 2.6], [21.4, 21.4], [2.6, 21.4], [2.6, 2.8]], [[6.4, 11.2], [12.6, 11.2]], [[9.5, 11.2], [9.5, 18.6]], [[19, 12], [16.4, 11], [14.6, 12.4], [15.6, 14.4], [18.4, 15.6], [18.8, 17.6], [16.6, 18.8], [14.4, 18]]] },
  openshift: { name: "OpenShift", plan: [arc(12, 12, 9, 9, 25, 165), arc(12, 12, 9, 9, 205, 345), arc(12, 12, 5, 5, 25, 165), arc(12, 12, 5, 5, 205, 345), [[1.6, 13.4], [8, 10.6]], [[16, 13.4], [22.4, 10.6]]] },
  gke: { name: "GKE", plan: [ring(12, 12, 10.4, 6), ring(12, 12, 4.2, 6), [[12, 1.6], [12, 7.8]], [[21, 17.2], [15.6, 14.1]], [[3, 17.2], [8.4, 14.1]]] },
  kubernetes: { name: "Kubernetes", plan: [ring(12, 12, 10.6, 7), arc(12, 12, 3), ...spokes(12, 12, 3, 7.6, 7)] },
  "github-actions": { name: "GitHub Actions", plan: [arc(5.6, 5.8, 2.8), [[5.6, 8.6], [5.6, 15.4]], arc(5.6, 18.2, 2.8), [[8.4, 5.8], [13.4, 5.8], [15.6, 8.2]], arc(16.4, 15.4, 6.2), [[14.6, 12.6], [14.6, 18.2], [19.2, 15.4], [14.6, 12.6]]] },
  "azure-ad": { name: "Azure AD", plan: [[[9.6, 3], [2.4, 19.6], [8.2, 19.6], [14.2, 6.6], [9.6, 3]], [[14.6, 7.4], [21.8, 21], [7.4, 21], [15.2, 19.2], [11.4, 14.6]]] },
  oracle: { name: "Oracle", plan: [pill(12, 12, 4.8, 6.4), pill(12, 12, 4.8, 3)] },
  rabbitmq: { name: "RabbitMQ", plan: [[[3.2, 21], [3.2, 3], [7.6, 3], [7.6, 10], [10.6, 10], [10.6, 3], [15, 3], [15, 10], [20.8, 10], [20.8, 21], [3.2, 21]], [[14.2, 13.6], [17.6, 13.6], [17.6, 17], [14.2, 17], [14.2, 13.6]]] },
  mcp: { name: "MCP", plan: [[[2.6, 11.4], [10.8, 3.2], [13.6, 2.6], [16.2, 5], [15.6, 7.8], [7.6, 15.8]], [[9, 9.4], [15.4, 8], [19.4, 8.4], [21.4, 11], [20.4, 13.4], [12.4, 21.4]], [[6.8, 12.6], [12.2, 7.2]], [[12.4, 21.4], [13.6, 22.2]]] },
};
