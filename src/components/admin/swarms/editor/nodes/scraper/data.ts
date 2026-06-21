export type ScraperUrlSource = "runInput" | "upstream" | "static"

export type ScraperWaitUntil = "load" | "domcontentloaded" | "networkidle0" | "networkidle2"

export type ScraperNodeData = {
  label?: string
  urlSource: ScraperUrlSource
  /** Key under `runInput` when `urlSource` is `runInput`, or field path under `upstream.*`. */
  urlPath?: string
  /** Fixed URL when `urlSource` is `static`. */
  url?: string
  waitUntil?: ScraperWaitUntil
}

export const SCRAPER_SUCCESS_HANDLE = "success"
export const SCRAPER_FAILED_HANDLE = "failed"

export function buildScraperNodeData(): ScraperNodeData {
  return {
    urlSource: "runInput",
    urlPath: "website",
  }
}
