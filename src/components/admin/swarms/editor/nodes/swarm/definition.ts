import type { NodeProps } from "@xyflow/react"
import type { ComponentType } from "react"
import { TbStack2 } from "react-icons/tb"
import type { ControlNodeDefinition } from "../registry/types"
import { buildSwarmNodeData, type SwarmNodeData } from "./data"
import SwarmCanvasNode from "./SwarmCanvasNode"
import SwarmConfigPanel from "./SwarmConfigPanel"

export const SWARM_NODE_KIND = "swarm" as const
export const SWARM_FLOW_TYPE = "swarm" as const

export const SWARM_NODE_META = {
  label: "Sub-swarm",
  description: "Run another swarm and branch on success or failure",
} as const

export const swarmNodeDefinition: ControlNodeDefinition<SwarmNodeData> = {
  kind: SWARM_NODE_KIND,
  flowType: SWARM_FLOW_TYPE,
  icon: TbStack2,
  ...SWARM_NODE_META,
  buildDefaultData: buildSwarmNodeData,
  CanvasNode: SwarmCanvasNode as ComponentType<NodeProps>,
  ConfigPanel: SwarmConfigPanel,
}
