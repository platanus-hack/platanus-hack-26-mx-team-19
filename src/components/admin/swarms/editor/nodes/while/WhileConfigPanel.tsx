"use client"

import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { WhileNodeData } from "./data"
import WhileConfigForm from "./WhileConfigForm"
import { WHILE_NODE_META } from "./definition"

/** Side config panel for the While control node. */
export default function WhileConfigPanel({
  nodeId,
  data,
  onChange,
  onClose,
  onDeleteNode,
  graph,
  workerById,
}: ControlNodeConfigPanelProps<WhileNodeData>) {
  return (
    <NodeConfigPanelShell
      title={WHILE_NODE_META.label}
      description={WHILE_NODE_META.description}
      onClose={onClose}
      onDeleteNode={onDeleteNode}
    >
      <WhileConfigForm
        data={data}
        onChange={onChange}
        graph={graph}
        workerById={workerById}
        nodeId={nodeId}
      />
    </NodeConfigPanelShell>
  )
}
