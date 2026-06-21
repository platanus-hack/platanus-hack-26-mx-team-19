"use client"

import { useControlNodePanelCopy } from "@/i18n/use-control-node-panel-copy"
import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { WhileNodeData } from "./data"
import WhileConfigForm from "./WhileConfigForm"
import { WHILE_NODE_KIND, WHILE_NODE_META } from "./definition"

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
  const copy = useControlNodePanelCopy(WHILE_NODE_KIND, WHILE_NODE_META)

  return (
    <NodeConfigPanelShell
      title={copy.label}
      description={copy.description}
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
