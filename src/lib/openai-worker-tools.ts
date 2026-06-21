/** Mirrors `agentatlas-services` `OpenAiWorkerToolsConfig`. */
export type OpenAiWorkerToolsConfig = {
  webSearch?: boolean
  webSearchContextSize?: "low" | "medium" | "high"
  webSearchAllowedDomains?: string[]
  toolChoice?: "auto" | "required" | "none"
}

export function parseOpenAiWorkerTools(raw?: Record<string, unknown> | null): OpenAiWorkerToolsConfig {
  if (!raw || typeof raw !== "object") return {}

  const contextSize = raw.webSearchContextSize ?? raw.web_search_context_size
  const toolChoice = raw.toolChoice ?? raw.tool_choice

  return {
    webSearch: raw.webSearch === true || raw.web_search === true,
    webSearchContextSize:
      contextSize === "low" || contextSize === "medium" || contextSize === "high"
        ? contextSize
        : undefined,
    webSearchAllowedDomains: asStringArray(
      raw.webSearchAllowedDomains ?? raw.web_search_allowed_domains,
    ),
    toolChoice:
      toolChoice === "auto" || toolChoice === "required" || toolChoice === "none"
        ? toolChoice
        : undefined,
  }
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const items = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
  return items.length > 0 ? items : undefined
}

/** Payload for `PATCH` agent worker (`openaiTools` on the worker document). */
export function openAiToolsToPayload(
  config: OpenAiWorkerToolsConfig,
  agentTools: string[] = [],
): Record<string, unknown> {
  const hasAgentTools = agentTools.length > 0
  if (!config.webSearch && !hasAgentTools) return {}

  const payload: Record<string, unknown> = {
    toolChoice: config.toolChoice ?? "auto",
  }

  if (config.webSearch) {
    payload.webSearch = true
  }

  if (config.webSearchContextSize) {
    payload.webSearchContextSize = config.webSearchContextSize
  }
  if (config.webSearchAllowedDomains?.length) {
    payload.webSearchAllowedDomains = config.webSearchAllowedDomains
  }

  return payload
}
