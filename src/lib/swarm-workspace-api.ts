import type { ServicesApi } from "@/data/api/server"
import type {
  AdminAgentWorker,
  AdminSwarm,
  AdminUpdateAgentWorkerPayload,
  AdminUpdateSwarmPayload,
  DecideSwarmRunApprovalPayload,
  DecideSwarmRunApprovalResult,
  ReferencedSwarmSummary,
  RunSwarmResult,
  SwarmGraph,
  UpsertSwarmGraphPayload,
} from "@/data/api/server/swarms"
import type { AgentRun, SwarmRun } from "@/data/api/server/swarms"

export type SwarmApiMode = "admin" | "user"

export type SwarmWorkspaceLoad = {
  swarm: AdminSwarm
  graph: SwarmGraph | null
  workers: AdminAgentWorker[]
  referencedSwarms: ReferencedSwarmSummary[]
}

export type SwarmWorkspaceApi = {
  mode: SwarmApiMode
  listSwarms: () => Promise<AdminSwarm[]>
  getGraph: (id: string) => Promise<SwarmGraph | null>
  deleteSwarm: (id: string) => Promise<void>
  duplicateSwarm: (id: string, data?: { name?: string }) => Promise<AdminSwarm>
  setAllSwarmsActive: (active: boolean) => Promise<AdminSwarm[]>
  getSwarm: (id: string) => Promise<AdminSwarm>
  loadWorkspace: (id: string) => Promise<SwarmWorkspaceLoad>
  updateSwarm: (id: string, data: AdminUpdateSwarmPayload) => Promise<AdminSwarm>
  upsertGraph: (id: string, data: UpsertSwarmGraphPayload) => Promise<SwarmGraph>
  getAgentWorker: (id: string) => Promise<AdminAgentWorker>
  updateAgentWorker: (id: string, data: AdminUpdateAgentWorkerPayload) => Promise<AdminAgentWorker>
  listSwarmRuns: (swarmId: string) => Promise<SwarmRun[]>
  getSwarmRun: (runId: string) => Promise<SwarmRun>
  listSwarmRunAgentRuns: (runId: string) => Promise<AgentRun[]>
  decideSwarmRunApproval: (
    approvalId: string,
    data: DecideSwarmRunApprovalPayload,
  ) => Promise<DecideSwarmRunApprovalResult>
  runUsesAdminStream: boolean
}

export function createSwarmWorkspaceApi(services: ServicesApi, mode: SwarmApiMode): SwarmWorkspaceApi {
  if (mode === "admin") {
    return {
      mode,
      listSwarms: async () => {
        const result = await services.adminListSwarms({ limit: 50 })
        return result.items
      },
      getGraph: (id) => services.adminGetSwarmGraph(id).catch(() => null),
      deleteSwarm: (id) => services.adminDeleteSwarm(id),
      duplicateSwarm: async (id, data) => {
        const result = await services.duplicateSwarm(id, data)
        return result.swarm
      },
      setAllSwarmsActive: async (active) => {
        const list = await services.adminListSwarms({ limit: 50 })
        const updated = await Promise.all(
          list.items.map((swarm) => services.adminUpdateSwarm(swarm.id, { active })),
        )
        return updated
      },
      getSwarm: (id) => services.adminGetSwarm(id),
      loadWorkspace: async (id) => {
        const [swarm, graphResult, workspaceExtras] = await Promise.all([
          services.adminGetSwarm(id),
          services.adminGetSwarmGraph(id).catch(() => null as SwarmGraph | null),
          services.getSwarmWorkspace(id).catch(() => null),
        ])
        const graph = graphResult

        const referenced = new Set<string>(swarm.workers ?? [])
        if (graph) {
          for (const n of graph.nodes) {
            if (n.workerId) referenced.add(n.workerId)
          }
          referenced.add(graph.entryNode)
          referenced.add(graph.exitNode)
        }

        const workers: AdminAgentWorker[] = []
        await Promise.all(
          [...referenced]
            .filter((wid) => typeof wid === "string" && wid.length > 0)
            .map(async (wid) => {
              try {
                workers.push(await services.adminGetAgentWorker(wid))
              } catch {
                /* worker no longer accessible */
              }
            }),
        )

        return {
          swarm,
          graph,
          workers,
          referencedSwarms: workspaceExtras?.referencedSwarms ?? [],
        }
      },
      updateSwarm: (id, data) => services.adminUpdateSwarm(id, data),
      upsertGraph: (id, data) => services.adminUpsertSwarmGraph(id, data),
      getAgentWorker: (id) => services.adminGetAgentWorker(id),
      updateAgentWorker: (id, data) => services.adminUpdateAgentWorker(id, data),
      listSwarmRuns: (swarmId) => services.adminListSwarmRuns(swarmId),
      getSwarmRun: (runId) => services.adminGetSwarmRun(runId),
      listSwarmRunAgentRuns: (runId) => services.adminListSwarmRunAgentRuns(runId),
      decideSwarmRunApproval: (approvalId, data) =>
        services.adminDecideSwarmRunApproval(approvalId, data),
      runUsesAdminStream: true,
    }
  }

  return {
    mode,
    listSwarms: () => services.listSwarms(),
    getGraph: (id) =>
      services.getSwarmWorkspace(id).then((workspace) => workspace.graph).catch(() => null),
    deleteSwarm: (id) => services.deleteSwarm(id),
    duplicateSwarm: async (id, data) => {
      const result = await services.duplicateSwarm(id, data)
      return result.swarm
    },
    setAllSwarmsActive: async (active) => {
      const list = await services.listSwarms()
      const updated = await Promise.all(
        list.map((swarm) => services.updateSwarm(swarm.id, { active })),
      )
      return updated
    },
    getSwarm: (id) => services.getSwarm(id),
    loadWorkspace: async (id) => {
      const workspace = await services.getSwarmWorkspace(id)
      return {
        swarm: workspace.swarm,
        graph: workspace.graph,
        workers: workspace.workers,
        referencedSwarms: workspace.referencedSwarms ?? [],
      }
    },
    updateSwarm: (id, data) => services.updateSwarm(id, data),
    upsertGraph: (id, data) => services.upsertSwarmGraph(id, data),
    getAgentWorker: (id) => services.getAgentWorker(id),
    updateAgentWorker: (id, data) => services.updateAgentWorker(id, data),
    listSwarmRuns: (swarmId) => services.listSwarmRuns(swarmId),
    getSwarmRun: (runId) => services.getSwarmRun(runId),
    listSwarmRunAgentRuns: (runId) => services.listSwarmRunAgentRuns(runId),
    decideSwarmRunApproval: (approvalId, data) =>
      services.decideSwarmRunApproval(approvalId, data),
    runUsesAdminStream: false,
  }
}

export type SwarmRunStreamResult = RunSwarmResult
