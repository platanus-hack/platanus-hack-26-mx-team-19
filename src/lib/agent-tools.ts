/** Mirrors `agentatlas-services` `ToolId`. */
export type AgentToolId = "webpage_scrape" | "run_swarm"

export type AgentToolCatalogEntry = {
  id: AgentToolId
  name: string
  description: string
  configured: boolean
}

export function parseAgentToolIds(raw?: unknown): AgentToolId[] {
  if (!Array.isArray(raw)) return []

  const allowed = new Set<AgentToolId>(["webpage_scrape", "run_swarm"])
  const ids: AgentToolId[] = []

  for (const item of raw) {
    if (typeof item === "string" && allowed.has(item as AgentToolId)) {
      ids.push(item as AgentToolId)
    }
  }

  return ids
}

export function isAgentToolId(value: string): value is AgentToolId {
  return value === "webpage_scrape" || value === "run_swarm"
}

/**
 * Mirrors backend `shouldExposeRunSwarmTool` — generic `run_swarm` is omitted when
 * the worker lists dedicated sub-swarms in `swarmTools`.
 */
export function shouldExposeRunSwarmTool(
  agentTools: AgentToolId[],
  swarmToolIds: string[],
): boolean {
  return agentTools.includes("run_swarm") && swarmToolIds.length === 0
}

