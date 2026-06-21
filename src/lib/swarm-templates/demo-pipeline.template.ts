import type {
  CreateAgentWorkerPayload,
  CreateSwarmPayload,
  SwarmGraphEdge,
  SwarmGraphNode,
  UpsertSwarmGraphPayload,
} from "@/data/api/server"
import { buildNewAgentWorkerPayload } from "@/lib/default-agent-worker"
import { START_CONTROL_KIND } from "@/lib/start-node"

export const DEMO_PIPELINE_TEMPLATE_ID = "demo-pipeline"

const DEMO_START_NODE_ID = "start-demo"
const DEMO_SCRAPER_NODE_ID = "scraper-demo"
const DEMO_WEBSITE_VAR_ID = "var-demo-website"

export type SwarmTemplateDefinition = {
  id: string
  label: string
  description: string
  swarm: Omit<CreateSwarmPayload, "workers">
  workers: CreateAgentWorkerPayload[]
  buildGraph: (workerIds: string[]) => UpsertSwarmGraphPayload
}

export const demoPipelineTemplate: SwarmTemplateDefinition = {
  id: DEMO_PIPELINE_TEMPLATE_ID,
  label: "Demo: Start → Scraper → Agent",
  description:
    'Start declares `website`, a scraper fetches the page, then one agent uses the swarm goal. Run with `{ "website": "https://…" }` in the test panel.',
  swarm: {
    name: "New swarm",
    description: "",
    goal: "Help the user with their request",
    topology: "pipeline",
    version: "1.0.0",
    isPublic: false,
  },
  workers: [buildNewAgentWorkerPayload()],
  buildGraph: (workerIds) => {
    const workerId = workerIds[0]
    if (!workerId) {
      throw new Error("Demo template expects exactly one worker")
    }

    const startNode: SwarmGraphNode = {
      id: DEMO_START_NODE_ID,
      kind: "worker",
      type: "worker",
      position: { x: 18, y: 107.42857142857142 },
      data: {
        controlKind: START_CONTROL_KIND,
        inputVariables: [
          {
            id: DEMO_WEBSITE_VAR_ID,
            name: "website",
            type: "string",
          },
        ],
        stateVariables: [],
        downstreamNodeIds: [DEMO_SCRAPER_NODE_ID],
      },
    }

    const scraperNode: SwarmGraphNode = {
      id: DEMO_SCRAPER_NODE_ID,
      kind: "scraper",
      type: "worker",
      position: { x: 117.42857142857143, y: 108 },
      data: {
        urlSource: "runInput",
        urlPath: "website",
      },
    }

    const workerNode: SwarmGraphNode = {
      id: workerId,
      kind: "worker",
      workerId,
      type: "worker",
      position: { x: 266.2857142857143, y: 97.14285714285711 },
    }

    const edges: SwarmGraphEdge[] = [
      {
        from: DEMO_SCRAPER_NODE_ID,
        to: workerId,
        type: "sequential",
        condition: null,
        sourceHandle: "success",
      },
    ]

    return {
      nodes: [startNode, scraperNode, workerNode],
      edges,
      entryNode: workerId,
      exitNode: workerId,
    }
  },
}

export const SWARM_TEMPLATES = [demoPipelineTemplate] as const
