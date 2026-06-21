import type {
  SwarmRun,
  SwarmRunModelUsage,
  SwarmRunScrapeUsage,
  SwarmSseEvent,
} from "@/data/api/server/swarms"

export type SwarmRunUsageView = {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costUsd: number | null
  scrapeCostUsd: number
  totalCostUsd: number
  usageByModel: SwarmRunModelUsage[]
  scrapeUsage: SwarmRunScrapeUsage
}

const EMPTY_SCRAPE_USAGE: SwarmRunScrapeUsage = {
  requestCount: 0,
  browserDurationMs: 0,
  costUsd: 0,
  requests: [],
}

export function normalizeScrapeUsage(raw?: SwarmRunScrapeUsage | null): SwarmRunScrapeUsage {
  if (!raw) return EMPTY_SCRAPE_USAGE
  return {
    requestCount: raw.requestCount ?? 0,
    browserDurationMs: raw.browserDurationMs ?? 0,
    costUsd: raw.costUsd ?? 0,
    requests: raw.requests ?? [],
  }
}

export function formatTokenCount(value?: number | null): string {
  if (value == null) return "—"
  return value.toLocaleString()
}

export function formatCostUsd(value?: number | null): string {
  if (value == null) return "—"
  return `$${value.toFixed(4)}`
}

export function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatProviderLabel(provider: string): string {
  if (provider === "openai_direct") return "OpenAI"
  if (provider === "grok_direct") return "xAI Grok"
  return provider.replace(/_/g, " ")
}

export function previewUrl(url: string, max = 48): string {
  const flat = url.trim()
  if (flat.length <= max) return flat
  return `${flat.slice(0, max)}…`
}

function resolveTotalCostUsd(llmCostUsd: number | null, scrapeCostUsd: number, explicit?: number): number {
  if (explicit != null) return explicit
  return (llmCostUsd ?? 0) + scrapeCostUsd
}

function buildUsageView(params: {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costUsd: number | null
  scrapeCostUsd: number
  totalCostUsd?: number
  usageByModel: SwarmRunModelUsage[]
  scrapeUsage: SwarmRunScrapeUsage
}): SwarmRunUsageView {
  const scrapeUsage = normalizeScrapeUsage(params.scrapeUsage)
  const scrapeCostUsd = params.scrapeCostUsd || scrapeUsage.costUsd
  return {
    promptTokens: params.promptTokens,
    completionTokens: params.completionTokens,
    totalTokens: params.totalTokens,
    costUsd: params.costUsd,
    scrapeCostUsd,
    totalCostUsd: resolveTotalCostUsd(params.costUsd, scrapeCostUsd, params.totalCostUsd),
    usageByModel: params.usageByModel,
    scrapeUsage,
  }
}

export function usageFromSwarmRun(run: SwarmRun): SwarmRunUsageView | null {
  const usageByModel = run.usageByModel ?? []
  const scrapeUsage = normalizeScrapeUsage(run.scrapeUsage)
  const totalTokens = run.totalTokens ?? 0
  const promptTokens = run.promptTokens ?? 0
  const completionTokens = run.completionTokens ?? 0

  if (totalTokens === 0 && usageByModel.length === 0 && scrapeUsage.requestCount === 0) {
    return null
  }

  return buildUsageView({
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd: run.costUsd ?? null,
    scrapeCostUsd: run.scrapeCostUsd ?? scrapeUsage.costUsd,
    totalCostUsd: run.totalCostUsd,
    usageByModel,
    scrapeUsage,
  })
}

export function usageFromSwarmDone(
  event: Extract<SwarmSseEvent, { type: "swarm_done" }>,
): SwarmRunUsageView | null {
  const fromRun = usageFromSwarmRun(event.swarmRun)
  if (fromRun) return fromRun

  const scrapeUsage = normalizeScrapeUsage(event.swarmRun.scrapeUsage)
  if (event.totalTokens === 0 && scrapeUsage.requestCount === 0) return null

  return buildUsageView({
    promptTokens: event.promptTokens,
    completionTokens: event.completionTokens,
    totalTokens: event.totalTokens,
    costUsd: event.costUsd,
    scrapeCostUsd: event.scrapeCostUsd,
    totalCostUsd: event.totalCostUsd,
    usageByModel: event.swarmRun.usageByModel ?? [],
    scrapeUsage,
  })
}
