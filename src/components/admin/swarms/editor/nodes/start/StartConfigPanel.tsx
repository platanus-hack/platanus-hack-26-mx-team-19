"use client"

import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { StartNodeData } from "./data"
import StartConfigForm from "./StartConfigForm"
import { START_NODE_META } from "./definition"

/** Side config panel for the Start (entry) node. */
export default function StartConfigPanel({
  data,
  onChange,
  onClose,
  onDeleteNode,
}: ControlNodeConfigPanelProps<StartNodeData>) {
  return (
    <NodeConfigPanelShell
      title={START_NODE_META.label}
      description={START_NODE_META.description}
      onClose={onClose}
      onDeleteNode={onDeleteNode}
    >
      <StartConfigForm data={data} onChange={onChange} />
    </NodeConfigPanelShell>
  )
}
