import type { SwarmGraphNode, SwarmGraphEdge } from "@/data/api/server"

/**
 * Layered auto-layout for swarm graphs that don't have stored positions yet.
 *
 * Crewy stores `{ position: { x, y } }` per node. When every node sits at (0, 0)
 * (e.g. graphs provisioned by templates), we lay them out left-to-right based on
 * BFS depth from `entryNode`. Otherwise we keep the stored coordinates as-is.
 */

const NODE_WIDTH = 220
const NODE_HEIGHT = 120
const COLUMN_GAP = 64
const ROW_GAP = 32
const PADDING = 40

export type PlacedSwarmNode = SwarmGraphNode & {
  position: { x: number; y: number }
}

function graphNodeKey(node: SwarmGraphNode): string {
  return node.id ?? node.workerId ?? ""
}

function computeLayered(
  nodes: SwarmGraphNode[],
  edges: Pick<SwarmGraphEdge, "from" | "to">[],
  entryNodeId: string,
): PlacedSwarmNode[] {
  const depths = new Map<string, number>()
  const queue: string[] = [entryNodeId]
  depths.set(entryNodeId, 0)

  while (queue.length > 0) {
    const id = queue.shift()!
    const depth = depths.get(id) ?? 0
    for (const edge of edges) {
      if (edge.from !== id) continue
      if (depths.has(edge.to)) continue
      depths.set(edge.to, depth + 1)
      queue.push(edge.to)
    }
  }

  let orphanLevel = 0
  for (const node of nodes) {
    const key = graphNodeKey(node)
    if (!key || depths.has(key)) continue
    orphanLevel += 1
    depths.set(key, orphanLevel)
  }

  const byLevel = new Map<number, SwarmGraphNode[]>()
  for (const node of nodes) {
    const level = depths.get(graphNodeKey(node)) ?? 0
    const group = byLevel.get(level) ?? []
    group.push(node)
    byLevel.set(level, group)
  }

  const placed: PlacedSwarmNode[] = []
  for (const level of [...byLevel.keys()].sort((a, b) => a - b)) {
    const group = byLevel.get(level) ?? []
    group.forEach((node, row) => {
      const stackOffset =
        group.length > 1 ? (row - (group.length - 1) / 2) * (NODE_HEIGHT + ROW_GAP) : 0
      placed.push({
        ...node,
        position: {
          x: PADDING + level * (NODE_WIDTH + COLUMN_GAP),
          y: PADDING + NODE_HEIGHT + stackOffset,
        },
      })
    })
  }

  return placed
}

/** Assign canvas coordinates only when the saved graph is missing positions. */
export function placeSwarmNodes(
  nodes: SwarmGraphNode[],
  edges: Pick<SwarmGraphEdge, "from" | "to">[] = [],
  entryNode?: string,
): PlacedSwarmNode[] {
  if (nodes.length === 0) return []

  const allAtOrigin = nodes.every(
    (n) => (n.position?.x ?? 0) === 0 && (n.position?.y ?? 0) === 0,
  )

  if (!allAtOrigin) {
    return nodes.map((n) => ({
      ...n,
      position: { x: n.position?.x ?? 0, y: n.position?.y ?? 0 },
    }))
  }

  if (entryNode && edges.length > 0 && nodes.some((n) => graphNodeKey(n) === entryNode)) {
    return computeLayered(nodes, edges, entryNode)
  }

  const cols = Math.max(1, Math.ceil(Math.sqrt(nodes.length)))
  return nodes.map((n, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      ...n,
      position: {
        x: PADDING + col * (NODE_WIDTH + COLUMN_GAP),
        y: PADDING + row * (NODE_HEIGHT + ROW_GAP),
      },
    }
  })
}
