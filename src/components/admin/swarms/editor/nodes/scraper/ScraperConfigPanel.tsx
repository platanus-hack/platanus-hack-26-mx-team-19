"use client"

import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { ScraperNodeData } from "./data"
import ScraperConfigForm from "./ScraperConfigForm"
import { SCRAPER_NODE_META } from "./definition"

/** Side config panel for the web scrape control node. */
export default function ScraperConfigPanel({
  nodeId,
  data,
  onChange,
  onClose,
  onDeleteNode,
  graph,
  workerById,
}: ControlNodeConfigPanelProps<ScraperNodeData>) {
  return (
    <NodeConfigPanelShell
      title={SCRAPER_NODE_META.label}
      description={SCRAPER_NODE_META.description}
      onClose={onClose}
      onDeleteNode={onDeleteNode}
    >
      <ScraperConfigForm
        data={data}
        onChange={onChange}
        nodeId={nodeId}
        graph={graph}
        workerById={workerById}
      />
    </NodeConfigPanelShell>
  )
}
