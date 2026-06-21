"use client"

import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { SwarmNodeData } from "./data"
import SwarmConfigForm from "./SwarmConfigForm"
import { SWARM_NODE_META } from "./definition"

/** Side config panel for the sub-swarm control node. */
export default function SwarmConfigPanel({
  nodeId,
  data,
  onChange,
  onClose,
  onDeleteNode,
  graph,
  workerById,
}: ControlNodeConfigPanelProps<SwarmNodeData>) {
  return (
    <NodeConfigPanelShell
      title={SWARM_NODE_META.label}
      description={SWARM_NODE_META.description}
      onClose={onClose}
      onDeleteNode={onDeleteNode}
    >
      <SwarmConfigForm
        data={data}
        onChange={onChange}
        nodeId={nodeId}
        graph={graph}
        workerById={workerById}
      />
    </NodeConfigPanelShell>
  )
}
