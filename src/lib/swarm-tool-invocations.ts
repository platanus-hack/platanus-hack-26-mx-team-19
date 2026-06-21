import type { SwarmRun } from "@/data/api/server/swarms"

const AGENT_TOOL_SWARM_PREFIX = "agent-tool:swarm:"

export function isAgentToolSubSwarmRun(run: SwarmRun): boolean {
  return (
    run.runKind === "sub_swarm" &&
    Boolean(run.parentNodeId?.startsWith(AGENT_TOOL_SWARM_PREFIX))
  )
}

export function childSwarmIdFromAgentToolNode(
  parentNodeId: string | null | undefined,
): string | null {
  if (!parentNodeId?.startsWith(AGENT_TOOL_SWARM_PREFIX)) return null
  const id = parentNodeId.slice(AGENT_TOOL_SWARM_PREFIX.length).trim()
  return id.length > 0 ? id : null
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function formatSubSwarmToolLogBody(run: SwarmRun): string {
  const lines: string[] = [`status: ${run.status}`]
  if (run.failureReason?.trim()) {
    lines.push(`error: ${run.failureReason.trim()}`)
  }
  if (run.output != null) {
    lines.push(`output:\n${formatJson(run.output)}`)
  } else if (run.status === "done") {
    lines.push("output: (empty)")
  }
  return lines.join("\n")
}

export function subSwarmToolLogMeta(run: SwarmRun): string {
  const parts = ["via agent tool"]
  if (run.parentNodeId) {
    parts.push(run.parentNodeId)
  }
  if (run.depth != null && run.depth > 0) {
    parts.push(`depth ${run.depth}`)
  }
  return parts.join(" · ")
}

/** Finds nested `sub_swarm` runs triggered by worker tool calls on a parent run. */
export async function loadAgentToolSubSwarmRuns(
  parentRunId: string,
  searchableSwarmIds: string[],
  listSwarmRuns: (swarmId: string) => Promise<SwarmRun[]>,
): Promise<SwarmRun[]> {
  if (!parentRunId || searchableSwarmIds.length === 0) return []

  const uniqueIds = [...new Set(searchableSwarmIds)]
  const batches = await Promise.all(
    uniqueIds.map((swarmId) => listSwarmRuns(swarmId).catch(() => [] as SwarmRun[])),
  )

  const byId = new Map<string, SwarmRun>()
  for (const runs of batches) {
    for (const run of runs) {
      if (
        isAgentToolSubSwarmRun(run) &&
        run.parentSwarmRunId === parentRunId &&
        !byId.has(run.id)
      ) {
        byId.set(run.id, run)
      }
    }
  }

  return [...byId.values()].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0
    return ta - tb
  })
}

export function buildSwarmNameLookup(
  rows: Array<{ id: string; name: string }>,
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const row of rows) {
    map[row.id] = row.name
  }
  return map
}
