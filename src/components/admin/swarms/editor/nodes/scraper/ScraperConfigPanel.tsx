"use client"

import { useControlNodePanelCopy } from "@/i18n/use-control-node-panel-copy"
import NodeConfigPanelShell from "../shared/NodeConfigPanelShell"
import type { ControlNodeConfigPanelProps } from "../registry/types"
import type { ScraperNodeData } from "./data"
import ScraperConfigForm from "./ScraperConfigForm"
import { SCRAPER_NODE_KIND, SCRAPER_NODE_META } from "./definition"

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
  const copy = useControlNodePanelCopy(SCRAPER_NODE_KIND, SCRAPER_NODE_META)

  return (
    <NodeConfigPanelShell
      title={copy.label}
      description={copy.description}
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
