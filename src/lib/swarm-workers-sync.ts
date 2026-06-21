import type { AdminAgentWorker, AdminSwarm, SwarmGraph } from "@/data/api/server"
import type { SwarmCanvasSnapshot } from "@/lib/merge-swarm-graph"

/** Worker ids referenced by agent nodes on a saved graph or live canvas snapshot. */
export function collectWorkerIdsFromGraph(graph: SwarmGraph | null | undefined): string[] {
  if (!graph) return []
  const ids = new Set<string>()
  for (const node of graph.nodes) {
    if (node.workerId) ids.add(node.workerId)
  }
  return [...ids]
}

export function collectWorkerIdsFromSnapshot(snapshot: SwarmCanvasSnapshot): string[] {
  const ids = new Set<string>()
  for (const node of snapshot.nodes) {
    if (node.workerId) ids.add(node.workerId)
  }
  return [...ids]
}

export function pruneWorkerIdsList(current: string[], activeIds: string[]): string[] {
  const active = new Set(activeIds)
  return current.filter((id) => active.has(id))
}

export function workerIdsNeedSync(current: string[], activeIds: string[]): boolean {
  const active = new Set(activeIds)
  if (current.length !== active.size) return true
  return current.some((id) => !active.has(id))
}

export function filterWorkersToIds(
  workers: AdminAgentWorker[],
  activeIds: string[],
): AdminAgentWorker[] {
  const active = new Set(activeIds)
  return workers.filter((worker) => active.has(worker.id))
}
