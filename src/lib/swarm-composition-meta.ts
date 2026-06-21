import type { AdminSwarm, SwarmGraph, SwarmGraphNode } from "@/data/api/server"
import { isStartGraphNode } from "@/lib/start-node"

export type SwarmCompositionCounts = {
  workers: number
  subSwarms: number
}

function isSubSwarmGraphNode(node: SwarmGraphNode): boolean {
  return node.kind === "swarm" || node.type === "swarm"
}

/** Counts agent workers and sub-swarm nodes on a saved graph (ignores Start/End/control-only nodes). */
export function countSwarmComposition(graph: SwarmGraph | null | undefined): SwarmCompositionCounts {
  if (!graph) return { workers: 0, subSwarms: 0 }

  let workers = 0
  let subSwarms = 0

  for (const node of graph.nodes) {
    if (isStartGraphNode(node)) continue
    if (isSubSwarmGraphNode(node)) {
      subSwarms++
      continue
    }
    if (node.workerId) workers++
  }

  return { workers, subSwarms }
}

function pluralLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Short meta line for swarm list tiles (workers, sub-swarms, topology). */
export function formatSwarmListMeta(swarm: AdminSwarm, graph?: SwarmGraph | null): string {
  const parts: string[] = []

  if (graph) {
    const { workers, subSwarms } = countSwarmComposition(graph)
    if (workers > 0) parts.push(pluralLabel(workers, "worker", "workers"))
    if (subSwarms > 0) parts.push(pluralLabel(subSwarms, "sub-swarm", "sub-swarms"))
    if (parts.length === 0) {
      parts.push(pluralLabel(0, "worker", "workers"))
    }
  } else {
    parts.push(pluralLabel(swarm.workers.length, "worker", "workers"))
  }

  parts.push(swarm.topology)
  return parts.join(" · ")
}
