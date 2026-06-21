import type { NodeProps } from "@xyflow/react"
import type { ComponentType } from "react"
import { TbGitBranch } from "react-icons/tb"
import type { ControlNodeDefinition } from "../registry/types"
import { buildIfElseNodeData, type IfElseNodeData } from "./data"
import IfElseCanvasNode from "./IfElseCanvasNode"
import IfElseConfigPanel from "./IfElseConfigPanel"

export const IF_ELSE_NODE_KIND = "ifelse" as const
export const IF_ELSE_FLOW_TYPE = "ifelse" as const

export const IF_ELSE_NODE_META = {
  label: "If / else",
  description: "Create conditions to branch your workflow",
} as const

export const ifElseNodeDefinition: ControlNodeDefinition<IfElseNodeData> = {
  kind: IF_ELSE_NODE_KIND,
  flowType: IF_ELSE_FLOW_TYPE,
  icon: TbGitBranch,
  ...IF_ELSE_NODE_META,
  buildDefaultData: buildIfElseNodeData,
  CanvasNode: IfElseCanvasNode as ComponentType<NodeProps>,
  ConfigPanel: IfElseConfigPanel,
}
