"use client"

import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { UserApprovalNodeData } from "./data"
import UserApprovalConfigForm from "./UserApprovalConfigForm"
import { USER_APPROVAL_NODE_META } from "./definition"

export default function UserApprovalConfigPanel({
  data,
  onChange,
  onClose,
  onDeleteNode,
}: ControlNodeConfigPanelProps<UserApprovalNodeData>) {
  return (
    <NodeConfigPanelShell
      title={USER_APPROVAL_NODE_META.label}
      description={USER_APPROVAL_NODE_META.description}
      onClose={onClose}
      onDeleteNode={onDeleteNode}
    >
      <UserApprovalConfigForm data={data} onChange={onChange} />
    </NodeConfigPanelShell>
  )
}
