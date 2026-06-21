"use client"

import { useControlNodePanelCopy } from "@/i18n/use-control-node-panel-copy"
import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { UserApprovalNodeData } from "./data"
import UserApprovalConfigForm from "./UserApprovalConfigForm"
import { USER_APPROVAL_NODE_KIND, USER_APPROVAL_NODE_META } from "./definition"

export default function UserApprovalConfigPanel({
  data,
  onChange,
  onClose,
  onDeleteNode,
}: ControlNodeConfigPanelProps<UserApprovalNodeData>) {
  const copy = useControlNodePanelCopy(USER_APPROVAL_NODE_KIND, USER_APPROVAL_NODE_META)

  return (
    <NodeConfigPanelShell
      title={copy.label}
      description={copy.description}
      onClose={onClose}
      onDeleteNode={onDeleteNode}
    >
      <UserApprovalConfigForm data={data} onChange={onChange} />
    </NodeConfigPanelShell>
  )
}
