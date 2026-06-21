import type { ComponentType, ReactNode } from "react"
import type { NodeProps } from "@xyflow/react"
import type { IconType } from "react-icons"
import type { AdminAgentWorker, SwarmGraph } from "@/data/api/server"
import type { SwarmEditorNodeApi } from "../../SwarmEditorContext"

/** Props every control-node config panel receives from {@link SwarmNodeConfigPanel}. */
export type ControlNodeConfigPanelProps<TData> = {
  nodeId: string
  data: TData
  onChange: (data: TData) => void
  onClose: () => void
  onDeleteNode: () => void
  nodeApi: SwarmEditorNodeApi
  graph: SwarmGraph | null
  workerById: Record<string, AdminAgentWorker>
}

/** Palette + canvas + config panel for one control-flow node kind. */
export type ControlNodeDefinition<TData extends Record<string, unknown> = Record<string, unknown>> = {
  /** Stable id used in palette MIME and editor state. */
  kind: string
  /** React Flow `node.type` key. */
  flowType: string
  label: string
  description: string
  icon: IconType
  buildDefaultData: () => TData
  /** Canvas component registered in React Flow `nodeTypes`. */
  CanvasNode: ComponentType<NodeProps>
  ConfigPanel: ComponentType<ControlNodeConfigPanelProps<TData>>
}

export type ControlNodePaletteItem = {
  kind: string
  type: string
  label: string
  description: string
  icon: IconType
  buildData: () => unknown
}
