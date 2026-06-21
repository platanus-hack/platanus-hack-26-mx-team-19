"use client"

import { useControlNodePanelCopy } from "@/i18n/use-control-node-panel-copy"
import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { StartNodeData } from "./data"
import StartConfigForm from "./StartConfigForm"
import { START_NODE_KIND, START_NODE_META } from "./definition"

/** Side config panel for the Start (entry) node. */
export default function StartConfigPanel({
  data,
  onChange,
  onClose,
  onDeleteNode,
}: ControlNodeConfigPanelProps<StartNodeData>) {
  const copy = useControlNodePanelCopy(START_NODE_KIND, START_NODE_META)

  return (
    <NodeConfigPanelShell
      title={copy.label}
      description={copy.description}
      onClose={onClose}
      onDeleteNode={onDeleteNode}
    >
      <StartConfigForm data={data} onChange={onChange} />
    </NodeConfigPanelShell>
  )
}
