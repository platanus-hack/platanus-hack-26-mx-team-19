import type { NodeProps } from "@xyflow/react"
import type { ComponentType } from "react"
import { TbFlag } from "react-icons/tb"
import type { ControlNodeDefinition } from "../registry/types"
import { buildEndNodeData, type EndNodeData } from "./data"
import EndCanvasNode from "./EndCanvasNode"
import EndConfigPanel from "./EndConfigPanel"

export const END_NODE_KIND = "end" as const
export const END_FLOW_TYPE = "end" as const

export const END_NODE_META = {
  label: "End",
  description:
    "Optional final join — assemble a structured JSON from upstream outputs. Flows may still end on an agent alone.",
} as const

export const endNodeDefinition: ControlNodeDefinition<EndNodeData> = {
  kind: END_NODE_KIND,
  flowType: END_FLOW_TYPE,
  icon: TbFlag,
  ...END_NODE_META,
  buildDefaultData: buildEndNodeData,
  CanvasNode: EndCanvasNode as ComponentType<NodeProps>,
  ConfigPanel: EndConfigPanel,
}
