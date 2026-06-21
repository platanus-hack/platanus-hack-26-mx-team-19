import type { SwarmGraph, SwarmGraphEdge, SwarmGraphNode } from "@/data/api/server"

/** Canvas state used before the API persist finishes. */
export type SwarmCanvasSnapshot = {
  nodes: SwarmGraphNode[]
  edges: SwarmGraphEdge[]
  entryNode: string | null
  exitNode: string | null
}

/** Prefer live canvas edges/nodes so Add context sees connections immediately. */
export function mergeSwarmGraphWithCanvas(
  saved: SwarmGraph | null,
  canvas: SwarmCanvasSnapshot | null,
  swarmId: string,
): SwarmGraph | null {
  if (!canvas) return saved
  if (!saved && canvas.nodes.length === 0 && canvas.edges.length === 0) {
    return null
  }

  const base: SwarmGraph =
    saved ??
    ({
      id: "draft",
      swarmId,
      nodes: [],
      edges: [],
      entryNode: canvas.entryNode ?? "",
      exitNode: canvas.exitNode ?? "",
    } satisfies SwarmGraph)

  return {
    ...base,
    nodes: canvas.nodes.length > 0 ? canvas.nodes : base.nodes,
    edges: canvas.edges,
    entryNode: canvas.entryNode ?? base.entryNode,
    exitNode: canvas.exitNode ?? base.exitNode,
  }
}
