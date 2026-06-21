"use client"

import { useControlNodePanelCopy } from "@/i18n/use-control-node-panel-copy"
import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { SwarmNodeData } from "./data"
import SwarmConfigForm from "./SwarmConfigForm"
import { SWARM_NODE_KIND, SWARM_NODE_META } from "./definition"

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
  const copy = useControlNodePanelCopy(SWARM_NODE_KIND, SWARM_NODE_META)

  return (
    <NodeConfigPanelShell
      title={copy.label}
      description={copy.description}
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
