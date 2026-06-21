"use client"

import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import { caseHandleId, type IfElseNodeData } from "./data"
import IfElseConfigForm from "./IfElseConfigForm"
import { IF_ELSE_NODE_META } from "./definition"

/** Side config panel for the If/else control node. */
export default function IfElseConfigPanel({
  nodeId,
  data,
  onChange,
  onClose,
  onDeleteNode,
  nodeApi,
  graph,
  workerById,
}: ControlNodeConfigPanelProps<IfElseNodeData>) {
  const handleRemoveCase = (caseId: string) => {
    nodeApi.removeSourceHandleEdges(nodeId, caseHandleId(caseId))
  }

  return (
    <NodeConfigPanelShell
      title={IF_ELSE_NODE_META.label}
      description={IF_ELSE_NODE_META.description}
      onClose={onClose}
      onDeleteNode={onDeleteNode}
    >
      <IfElseConfigForm
        data={data}
        onChange={onChange}
        onRemoveCase={handleRemoveCase}
        graph={graph}
        workerById={workerById}
        nodeId={nodeId}
      />
    </NodeConfigPanelShell>
  )
}
