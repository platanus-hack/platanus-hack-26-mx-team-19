import type { ServicesApi } from "@/data/api/server"
import type { SwarmTemplateDefinition } from "@/lib/swarm-templates/demo-pipeline.template"
import type { UpsertSwarmGraphPayload } from "@/data/api/server"
import { buildNewAgentWorkerPayload } from "@/lib/default-agent-worker"

export async function provisionSwarmFromTemplate(
  services: ServicesApi,
  template: SwarmTemplateDefinition,
): Promise<string> {
  if (template.workers.length < 1) {
    throw new Error("Template must define at least one worker")
  }

  const workerIds: string[] = []
  for (const worker of template.workers) {
    const created = await services.createAgentWorker(worker)
    workerIds.push(created.id)
  }

  const swarm = await services.createSwarm({
    ...template.swarm,
    workers: workerIds,
  })

  const graph = template.buildGraph(workerIds)
  await services.upsertSwarmGraph(swarm.id, graph)

  return swarm.id
}

/** Minimal single-node swarm for quick experiments. */
export async function provisionBlankSwarm(services: ServicesApi): Promise<string> {
  const created = await services.createAgentWorker(
    buildNewAgentWorkerPayload(),
  )
  const swarm = await services.createSwarm({
    name: "New swarm",
    description: "",
    goal: "Help the user with their request",
    topology: "pipeline",
    workers: [created.id],
    version: "1.0.0",
    isPublic: false,
  })

  const graph: UpsertSwarmGraphPayload = {
    nodes: [{ workerId: created.id, type: "worker", position: { x: 200, y: 160 } }],
    edges: [],
    entryNode: created.id,
    exitNode: created.id,
  }

  await services.upsertSwarmGraph(swarm.id, graph)
  return swarm.id
}
