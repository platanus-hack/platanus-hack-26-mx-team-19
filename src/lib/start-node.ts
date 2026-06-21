import type { SwarmGraph, SwarmGraphNode } from "@/data/api/server"
import type { StartNodeData, StartVariable } from "@/components/admin/swarms/editor/nodes/start/data"

export const START_FLOW_TYPE = "start"
/** Persisted on graph nodes until backend adds a native Start kind. */
export const START_CONTROL_KIND = "start"

export function isStartGraphNode(node: SwarmGraphNode): boolean {
  if (node.type === START_FLOW_TYPE) return true
  const data = node.data
  if (data && typeof data === "object" && (data as { controlKind?: string }).controlKind === START_CONTROL_KIND) {
    return true
  }
  return false
}

export function findStartGraphNode(graph: SwarmGraph | null | undefined): SwarmGraphNode | null {
  if (!graph) return null
  return graph.nodes.find(isStartGraphNode) ?? null
}

export function parseStartNodeData(node: SwarmGraphNode | null | undefined): StartNodeData | null {
  if (!node?.data || typeof node.data !== "object") return null
  const raw = node.data as Partial<StartNodeData>
  if (!Array.isArray(raw.inputVariables)) return null
  return {
    inputVariables: raw.inputVariables as StartVariable[],
    stateVariables: Array.isArray(raw.stateVariables) ? (raw.stateVariables as StartVariable[]) : [],
  }
}

/** Input variable names declared on the Start node (fallback: `message`). */
export function getStartInputVariableNames(graph: SwarmGraph | null | undefined): string[] {
  const start = findStartGraphNode(graph)
  const data = parseStartNodeData(start)
  if (!data) return ["message"]
  const names = data.inputVariables.map((v) => v.name.trim()).filter(Boolean)
  return names.length > 0 ? names : ["message"]
}

/** Graph node ids of agents directly wired from Start (parallel first wave). */
export function listStartDownstreamNodeIds(
  graph: SwarmGraph | null | undefined,
): string[] {
  const start = findStartGraphNode(graph)
  if (!start?.id) return []
  return graph!.edges.filter((e) => e.from === start.id).map((e) => e.to)
}

export function graphHasStartNode(graph: SwarmGraph | null | undefined): boolean {
  return findStartGraphNode(graph) != null
}
