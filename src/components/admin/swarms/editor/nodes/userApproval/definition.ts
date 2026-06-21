import type { NodeProps } from "@xyflow/react"
import type { ComponentType } from "react"
import { TbThumbUp } from "react-icons/tb"
import type { ControlNodeDefinition } from "../registry/types"
import { buildUserApprovalNodeData, type UserApprovalNodeData } from "./data"
import UserApprovalCanvasNode from "./UserApprovalCanvasNode"
import UserApprovalConfigPanel from "./UserApprovalConfigPanel"

export const USER_APPROVAL_NODE_KIND = "user_approval" as const
export const USER_APPROVAL_FLOW_TYPE = "user_approval" as const

export const USER_APPROVAL_NODE_META = {
  label: "User approval",
  description: "Pause for a human to approve or reject a step",
} as const

export const userApprovalNodeDefinition: ControlNodeDefinition<UserApprovalNodeData> = {
  kind: USER_APPROVAL_NODE_KIND,
  flowType: USER_APPROVAL_FLOW_TYPE,
  icon: TbThumbUp,
  ...USER_APPROVAL_NODE_META,
  buildDefaultData: buildUserApprovalNodeData,
  CanvasNode: UserApprovalCanvasNode as ComponentType<NodeProps>,
  ConfigPanel: UserApprovalConfigPanel,
}
