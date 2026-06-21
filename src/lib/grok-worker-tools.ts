export type GrokWorkerToolsConfig = {
  xSearch?: boolean
  xSearchAllowedHandles?: string[]
  xSearchExcludedHandles?: string[]
  xSearchFromDate?: string
  xSearchToDate?: string
  xSearchEnableImageUnderstanding?: boolean
  xSearchEnableVideoUnderstanding?: boolean
  webSearch?: boolean
  toolChoice?: "auto" | "required" | "none"
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const items = value
    .map((v) => (typeof v === "string" ? v.trim().replace(/^@/, "") : ""))
    .filter((v) => v.length > 0)
  return items.length > 0 ? items.slice(0, 20) : undefined
}

function asIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined
}

export function parseGrokWorkerTools(raw?: Record<string, unknown>): GrokWorkerToolsConfig {
  if (!raw) return {}
  const toolChoice = raw.toolChoice ?? raw.tool_choice
  return {
    xSearch: raw.xSearch === true || raw.x_search === true,
    xSearchAllowedHandles: asStringArray(
      raw.xSearchAllowedHandles ?? raw.x_search_allowed_handles ?? raw.allowed_x_handles,
    ),
    xSearchExcludedHandles: asStringArray(
      raw.xSearchExcludedHandles ?? raw.x_search_excluded_handles ?? raw.excluded_x_handles,
    ),
    xSearchFromDate: asIsoDate(raw.xSearchFromDate ?? raw.x_search_from_date ?? raw.from_date),
    xSearchToDate: asIsoDate(raw.xSearchToDate ?? raw.x_search_to_date ?? raw.to_date),
    xSearchEnableImageUnderstanding:
      raw.xSearchEnableImageUnderstanding === true ||
      raw.x_search_enable_image_understanding === true ||
      raw.enable_image_understanding === true,
    xSearchEnableVideoUnderstanding:
      raw.xSearchEnableVideoUnderstanding === true ||
      raw.x_search_enable_video_understanding === true ||
      raw.enable_video_understanding === true,
    webSearch: raw.webSearch === true || raw.web_search === true,
    toolChoice:
      toolChoice === "auto" || toolChoice === "required" || toolChoice === "none"
        ? toolChoice
        : undefined,
  }
}

export function grokToolsToPayload(config: GrokWorkerToolsConfig): Record<string, unknown> {
  if (!config.xSearch && !config.webSearch) return {}

  const payload: Record<string, unknown> = {}
  if (config.xSearch) payload.xSearch = true
  if (config.webSearch) payload.webSearch = true
  if (config.toolChoice) payload.toolChoice = config.toolChoice
  if (config.xSearchAllowedHandles?.length) {
    payload.xSearchAllowedHandles = config.xSearchAllowedHandles
  }
  if (config.xSearchExcludedHandles?.length) {
    payload.xSearchExcludedHandles = config.xSearchExcludedHandles
  }
  if (config.xSearchFromDate) payload.xSearchFromDate = config.xSearchFromDate
  if (config.xSearchToDate) payload.xSearchToDate = config.xSearchToDate
  if (config.xSearchEnableImageUnderstanding) {
    payload.xSearchEnableImageUnderstanding = true
  }
  if (config.xSearchEnableVideoUnderstanding) {
    payload.xSearchEnableVideoUnderstanding = true
  }
  return payload
}
