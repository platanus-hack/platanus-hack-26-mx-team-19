import type { NodeProps } from "@xyflow/react"
import type { ComponentType } from "react"
import { TbWorldWww } from "react-icons/tb"
import type { ControlNodeDefinition } from "../registry/types"
import { buildScraperNodeData, type ScraperNodeData } from "./data"
import ScraperCanvasNode from "./ScraperCanvasNode"
import ScraperConfigPanel from "./ScraperConfigPanel"

export const SCRAPER_NODE_KIND = "scraper" as const
export const SCRAPER_FLOW_TYPE = "scraper" as const

export const SCRAPER_NODE_META = {
  label: "Web scrape",
  description: "Fetch a page as markdown and branch on success or failure",
} as const

export const scraperNodeDefinition: ControlNodeDefinition<ScraperNodeData> = {
  kind: SCRAPER_NODE_KIND,
  flowType: SCRAPER_FLOW_TYPE,
  icon: TbWorldWww,
  ...SCRAPER_NODE_META,
  buildDefaultData: buildScraperNodeData,
  CanvasNode: ScraperCanvasNode as ComponentType<NodeProps>,
  ConfigPanel: ScraperConfigPanel,
}
