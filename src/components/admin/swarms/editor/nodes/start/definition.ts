import type { NodeProps } from "@xyflow/react"
import type { ComponentType } from "react"
import { TbPlayerPlay } from "react-icons/tb"
import type { ControlNodeDefinition } from "../registry/types"
import { buildStartNodeData, type StartNodeData } from "./data"
import StartCanvasNode from "./StartCanvasNode"
import StartConfigPanel from "./StartConfigPanel"

export const START_NODE_KIND = "start" as const
export const START_FLOW_TYPE = "start" as const

export const START_NODE_META = {
  label: "Start",
  description:
    "Workflow entry — declare run inputs (`runInput.*`) and wire one or more agents in parallel from here.",
} as const

export const startNodeDefinition: ControlNodeDefinition<StartNodeData> = {
  kind: START_NODE_KIND,
  flowType: START_FLOW_TYPE,
  icon: TbPlayerPlay,
  ...START_NODE_META,
  buildDefaultData: buildStartNodeData,
  CanvasNode: StartCanvasNode as ComponentType<NodeProps>,
  ConfigPanel: StartConfigPanel,
}
