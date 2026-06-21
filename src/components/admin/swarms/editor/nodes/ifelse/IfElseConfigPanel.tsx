"use client"

import { useControlNodePanelCopy } from "@/i18n/use-control-node-panel-copy"
import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import { caseHandleId, type IfElseNodeData } from "./data"
import IfElseConfigForm from "./IfElseConfigForm"
import { IF_ELSE_NODE_KIND, IF_ELSE_NODE_META } from "./definition"

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
  const copy = useControlNodePanelCopy(IF_ELSE_NODE_KIND, IF_ELSE_NODE_META)

  const handleRemoveCase = (caseId: string) => {
    nodeApi.removeSourceHandleEdges(nodeId, caseHandleId(caseId))
  }

  return (
    <NodeConfigPanelShell
      title={copy.label}
      description={copy.description}
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
