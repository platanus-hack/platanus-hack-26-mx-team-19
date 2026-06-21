import type { AdminAgentWorker, CreateAgentWorkerPayload } from "@/data/api/server"

/** Default display/backend name for a new agent — duplicates are allowed. */
export const DEFAULT_AGENT_WORKER_NAME = "Agent"

export function buildNewAgentWorkerPayload(): CreateAgentWorkerPayload {
  return {
    name: DEFAULT_AGENT_WORKER_NAME,
    model: {
      provider: "openai_direct",
      name: "gpt-4o-mini",
      params: { temperature: 0.35 },
    },
    systemPrompt:
      "Follow the swarm goal. Use {{runInput.*}} and upstream context when needed. Respond clearly.",
    maxRetries: 2,
    timeoutMs: 90_000,
  }
}

/** Clone an existing worker for canvas duplicate — keeps name and config. */
export function buildClonedAgentWorkerPayload(
  source: AdminAgentWorker,
): CreateAgentWorkerPayload {
  return {
    name: source.name,
    model: source.model,
    systemPrompt: source.systemPrompt,
    promptMessages: source.promptMessages,
    upstreamFields: source.upstreamFields,
    inputSchema: source.inputSchema,
    outputSchema: source.outputSchema,
    compressOutput: source.compressOutput,
    maxRetries: source.maxRetries,
    timeoutMs: source.timeoutMs,
  }
}
