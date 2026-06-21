import type { AdminAgentWorker, AdminSwarm, SwarmGraph } from "@/data/api/server"

/** DB-shaped export of a swarm workspace (swarm + graph + referenced workers). */
export type SwarmWorkspaceSnapshot = {
  exportedAt: string
  hasUnsavedGraphChanges: boolean
  swarm: AdminSwarm
  graph: SwarmGraph | null
  workers: AdminAgentWorker[]
}

function collectReferencedWorkerIds(swarm: AdminSwarm, graph: SwarmGraph | null): Set<string> {
  const ids = new Set<string>(swarm.workers ?? [])
  if (!graph) return ids

  for (const node of graph.nodes) {
    if (node.workerId) ids.add(node.workerId)
  }

  return ids
}

export function buildSwarmWorkspaceSnapshot(params: {
  swarm: AdminSwarm
  graph: SwarmGraph | null
  workers: AdminAgentWorker[]
  hasUnsavedGraphChanges?: boolean
}): SwarmWorkspaceSnapshot {
  const referenced = collectReferencedWorkerIds(params.swarm, params.graph)
  const workerById = new Map(params.workers.map((worker) => [worker.id, worker]))
  const snapshotWorkers: AdminAgentWorker[] = []

  for (const id of referenced) {
    const worker = workerById.get(id)
    if (worker) snapshotWorkers.push(worker)
  }

  snapshotWorkers.sort((a, b) => a.id.localeCompare(b.id))

  return {
    exportedAt: new Date().toISOString(),
    hasUnsavedGraphChanges: params.hasUnsavedGraphChanges ?? false,
    swarm: params.swarm,
    graph: params.graph,
    workers: snapshotWorkers,
  }
}

export function swarmWorkspaceSnapshotToJson(snapshot: SwarmWorkspaceSnapshot): string {
  return JSON.stringify(snapshot, null, 2)
}
