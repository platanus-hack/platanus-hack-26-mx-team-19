"use client"

import { createElement, type ComponentType } from "react"
import {
  getControlNodeDefinition,
  type ControlNodeConfigPanelProps,
  type ControlNodeKind,
} from "./nodes/registry"
import type { AdminAgentWorker, SwarmGraph } from "@/data/api/server"
import type { SwarmEditorNodeApi } from "./SwarmEditorContext"

type Props = {
  nodeId: string
  kind: ControlNodeKind
  nodeApi: SwarmEditorNodeApi
  graph: SwarmGraph | null
  workerById: Record<string, AdminAgentWorker>
  onClose: () => void
  onDeleteNode: () => void
  onDataChange: () => void
}

/**
 * Routes the open control node to its isolated config panel (see `nodes/<kind>/`).
 */
export default function SwarmNodeConfigPanel({
  nodeId,
  kind,
  nodeApi,
  graph,
  workerById,
  onClose,
  onDeleteNode,
  onDataChange,
}: Props) {
  const definition = getControlNodeDefinition(kind)
  if (!definition) return null

  const data = nodeApi.getNodeData(nodeId)
  if (data == null) return null

  const Panel = definition.ConfigPanel as ComponentType<
    ControlNodeConfigPanelProps<Record<string, unknown>>
  >

  return createElement(Panel, {
    nodeId,
    data: data as Record<string, unknown>,
    nodeApi,
    graph,
    workerById,
    onClose,
    onDeleteNode,
    onChange: (next: Record<string, unknown>) => {
      nodeApi.setNodeData(nodeId, next)
      onDataChange()
    },
  })
}
