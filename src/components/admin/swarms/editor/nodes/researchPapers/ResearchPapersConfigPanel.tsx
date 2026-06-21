"use client"

import { useControlNodePanelCopy } from "@/i18n/use-control-node-panel-copy"
import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { ResearchPapersNodeData } from "./data"
import ResearchPapersConfigForm from "./ResearchPapersConfigForm"
import { RESEARCH_PAPERS_NODE_KIND, RESEARCH_PAPERS_NODE_META } from "./definition"

export default function ResearchPapersConfigPanel({
  nodeId,
  data,
  onChange,
  onClose,
  onDeleteNode,
  graph,
  workerById,
}: ControlNodeConfigPanelProps<ResearchPapersNodeData>) {
  const copy = useControlNodePanelCopy(RESEARCH_PAPERS_NODE_KIND, RESEARCH_PAPERS_NODE_META)

  return (
    <NodeConfigPanelShell
      title={copy.label}
      description={copy.description}
      onClose={onClose}
      onDeleteNode={onDeleteNode}
    >
      <ResearchPapersConfigForm
        data={data}
        onChange={onChange}
        nodeId={nodeId}
        graph={graph}
        workerById={workerById}
      />
    </NodeConfigPanelShell>
  )
}
