import type { NodeProps } from "@xyflow/react"
import type { ComponentType } from "react"
import { TbRepeat } from "react-icons/tb"
import type { ControlNodeDefinition } from "../registry/types"
import { buildWhileNodeData, type WhileNodeData } from "./data"
import WhileCanvasNode from "./WhileCanvasNode"
import WhileConfigPanel from "./WhileConfigPanel"

export const WHILE_NODE_KIND = "while" as const
export const WHILE_FLOW_TYPE = "while" as const

export const WHILE_NODE_META = {
  label: "While",
  description: "Repeat a branch while a condition stays true",
} as const

export const whileNodeDefinition: ControlNodeDefinition<WhileNodeData> = {
  kind: WHILE_NODE_KIND,
  flowType: WHILE_FLOW_TYPE,
  icon: TbRepeat,
  ...WHILE_NODE_META,
  buildDefaultData: buildWhileNodeData,
  CanvasNode: WhileCanvasNode as ComponentType<NodeProps>,
  ConfigPanel: WhileConfigPanel,
}
