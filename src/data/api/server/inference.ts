/**
 * Mirror of `GET /api/v1/inference/setup` exposed by `agentatlas-services`.
 * Source: `src/inference/inference-setup.controller.ts` +
 * `src/inference/inference-provider.service.ts` (`listProviderSetup`).
 *
 * The backend defines a fixed set of provider kinds. We mirror them here as
 * a union of string literals so the UI can build dropdowns with confidence,
 * while still tolerating unknown values returned by future backends.
 */
export type InferenceProviderKind =
  | "openai_direct"
  | "claude_direct"
  | "openrouter"
  | "hugging_face"
  | "inference_net"
  | "ollama"
  | "grok_direct"

export type InferenceMode = "auto" | "llm" | "stub"

export type InferenceProviderSetup = {
  id: InferenceProviderKind | string
  label: string
  configured: boolean
  envKeys: string[]
  defaultBaseUrl: string
}

export type InferenceSetup = {
  mode: InferenceMode | string
  defaults: {
    provider: InferenceProviderKind | string
    model: string
    temperature: number
    maxTokens: number | null
    timeoutMs: number
  }
  providers: InferenceProviderSetup[]
  agentTools?: {
    description?: string
    workerField?: string
    catalog?: Array<{
      id: string
      name: string
      description: string
      configured: boolean
    }>
  }
  swarmTools?: {
    description?: string
    workerField?: string
    functionNamePattern?: string
    genericToolId?: string
  }
  workerModelParams?: {
    description?: string
    keys?: string[]
  }
  runInputConvention?: {
    message?: string
  }
  streaming?: Record<string, string>
}
