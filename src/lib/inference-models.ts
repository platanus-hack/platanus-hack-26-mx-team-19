import type {
  InferenceProviderKind,
  InferenceProviderSetup,
} from "@/data/api/server"

export type ModelPreset = {
  /** Model id sent to the backend (`worker.model.name`). */
  id: string
  /** Display label in the dropdown. */
  label: string
}

export type ProviderPreset = {
  id: InferenceProviderKind | string
  /** Fallback label when the backend setup is unavailable. */
  label: string
  models: ModelPreset[]
}

/**
 * Curated list of provider + model presets shown in the swarm worker config
 * drawer. Mirrors the provider kinds enumerated by `agentatlas-services`
 * (`InferenceProviderKind`) and keeps a small, opinionated set of models per
 * provider — admins can still type a custom model id via the "Custom…" option.
 *
 * Context windows are the documented maximums published by each provider at
 * the time of writing; they are sensible defaults rather than hard limits.
 */
export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "openai_direct",
    label: "OpenAI",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "gpt-4.1-mini", label: "GPT-4.1 mini" },
      { id: "gpt-4.1-nano", label: "GPT-4.1 nano" },
      { id: "gpt-5-mini", label: "GPT-5 mini" },
      { id: "gpt-5-nano", label: "GPT-5 nano" },
    ],
  },
  {
    id: "claude_direct",
    label: "Anthropic Claude",
    models: [
      {
        id: "claude-sonnet-4-5",
        label: "Claude Sonnet 4.5",
      },
      {
        id: "claude-3-5-sonnet-latest",
        label: "Claude 3.5 Sonnet",
      },
      {
        id: "claude-3-5-haiku-latest",
        label: "Claude 3.5 Haiku",
      },
      {
        id: "claude-3-opus-latest",
        label: "Claude 3 Opus",
      },
    ],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    models: [
      {
        id: "openai/gpt-4o-mini",
        label: "OpenAI · GPT-4o mini",
      },
      {
        id: "anthropic/claude-3.5-sonnet",
        label: "Anthropic · Claude 3.5 Sonnet",
      },
      {
        id: "google/gemini-2.5-pro",
        label: "Google · Gemini 2.5 Pro",
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct",
        label: "Meta · Llama 3.3 70B Instruct",
      },
      {
        id: "deepseek/deepseek-chat",
        label: "DeepSeek · Chat",
      },
    ],
  },
  {
    id: "hugging_face",
    label: "Hugging Face",
    models: [
      {
        id: "meta-llama/Llama-3.3-70B-Instruct",
        label: "Llama 3.3 70B Instruct",
      },
      {
        id: "Qwen/Qwen2.5-72B-Instruct",
        label: "Qwen 2.5 72B Instruct",
      },
      {
        id: "mistralai/Mistral-7B-Instruct-v0.3",
        label: "Mistral 7B Instruct v0.3",
      },
    ],
  },
  {
    id: "inference_net",
    label: "Inference.net",
    models: [
      {
        id: "meta-llama/llama-3.1-70b-instruct/fp-16",
        label: "Llama 3.1 70B Instruct (fp16)",
      },
      {
        id: "meta-llama/llama-3.1-8b-instruct/fp-16",
        label: "Llama 3.1 8B Instruct (fp16)",
      },
    ],
  },
  {
    id: "ollama",
    label: "Ollama (local)",
    models: [
      { id: "llama3.1", label: "Llama 3.1" },
      { id: "llama3.2", label: "Llama 3.2" },
      { id: "qwen2.5", label: "Qwen 2.5" },
      { id: "mistral", label: "Mistral" },
    ],
  },
  {
    id: "grok_direct",
    label: "xAI Grok",
    models: [
      { id: "grok-4.3", label: "Grok 4.3" },
      {
        id: "grok-4.20-0309-reasoning",
        label: "Grok 4.20 · Reasoning",
      },
      {
        id: "grok-4.20-0309-non-reasoning",
        label: "Grok 4.20 · Fast",
      },
      { id: "grok-build-0.1", label: "Grok Build (coding)" },
    ],
  },
]

/** Sentinel value used by the "Custom…" option in select inputs. */
export const CUSTOM_OPTION = "__custom__"

/** Maps worker/API aliases to catalog ids (see backend `normalizeInferenceProvider`). */
export function normalizeProviderId(providerId: string): string {
  const raw = providerId.trim().toLowerCase()
  if (raw === "openai" || raw === "openai_direct") return "openai_direct"
  if (raw === "anthropic" || raw === "claude" || raw === "claude_direct") return "claude_direct"
  if (raw === "openrouter") return "openrouter"
  if (raw === "hf" || raw === "huggingface" || raw === "hugging_face") return "hugging_face"
  if (raw === "inference_net" || raw === "inference.net") return "inference_net"
  if (raw === "ollama") return "ollama"
  if (raw === "grok" || raw === "xai" || raw === "grok_direct") return "grok_direct"
  return raw
}

const DEFAULT_MODEL_NAME = "gpt-4o-mini"

export function getModelsForProvider(
  providerId: string,
  providerOptions: Array<Pick<ProviderPreset, "id" | "models">>,
): ModelPreset[] {
  const canonical = normalizeProviderId(providerId)

  const fromOptions = providerOptions.find(
    (p) => p.id === providerId || normalizeProviderId(p.id) === canonical,
  )?.models
  if (fromOptions && fromOptions.length > 0) return fromOptions

  return findProviderPreset(providerId)?.models ?? []
}

export type ResolveWorkerModelInput = {
  provider: string
  modelName: string
  modelSelectValue: string
  modelOptions: ModelPreset[]
  fallback?: {
    provider?: string
    name?: string
  }
}

/** Builds a payload that satisfies backend validation (`AgentWorkerModelDto`). */
export function resolveWorkerModelForSave(
  input: ResolveWorkerModelInput,
): { provider: string; name: string } | null {
  const provider =
    normalizeProviderId(input.provider.trim()) ||
    normalizeProviderId(input.fallback?.provider ?? "") ||
    "openai_direct"

  const trimmedName = input.modelName.trim()
  if (trimmedName) {
    return { provider, name: trimmedName }
  }

  const presetName = input.modelSelectValue.trim()
  if (presetName && presetName !== CUSTOM_OPTION) {
    return { provider, name: presetName }
  }

  const fallbackName = input.fallback?.name?.trim()
  if (fallbackName) return { provider, name: fallbackName }

  const firstPreset = input.modelOptions[0]?.id
  if (firstPreset) return { provider, name: firstPreset }

  return null
}

export function findProviderPreset(
  providerId: string,
): ProviderPreset | undefined {
  const normalized = normalizeProviderId(providerId)
  return PROVIDER_PRESETS.find((p) => p.id === normalized)
}

export function findModelPreset(
  providerId: string,
  modelId: string,
): ModelPreset | undefined {
  return findProviderPreset(providerId)?.models.find((m) => m.id === modelId)
}

/** Catalog provider that owns a preset model id, if any. */
export function findProviderForModelPreset(modelId: string): string | null {
  const trimmed = modelId.trim()
  if (!trimmed) return null
  for (const preset of PROVIDER_PRESETS) {
    if (preset.models.some((m) => m.id === trimmed)) {
      return preset.id
    }
  }
  return null
}

type PersistedWorkerModel = {
  provider?: string
  name?: string
  params?: Record<string, unknown>
}

type MongooseLikeSubdoc = PersistedWorkerModel & {
  _doc?: PersistedWorkerModel
}

/** Unwraps plain or Mongoose-shaped `worker.model` payloads from the API. */
export function normalizeWorkerModel(
  model: unknown,
): PersistedWorkerModel | null {
  if (!model || typeof model !== "object") return null

  const candidate = model as MongooseLikeSubdoc
  if (typeof candidate.name === "string" && typeof candidate.provider === "string") {
    return {
      provider: candidate.provider,
      name: candidate.name,
      params: candidate.params ?? {},
    }
  }

  if (candidate._doc && typeof candidate._doc === "object") {
    return normalizeWorkerModel(candidate._doc)
  }

  const name = typeof candidate.name === "string" ? candidate.name : undefined
  const provider =
    typeof candidate.provider === "string" ? candidate.provider : undefined
  const params =
    candidate.params && typeof candidate.params === "object"
      ? candidate.params
      : undefined

  if (!name && !provider && !params) return null

  return { provider, name, params }
}

/** Reads `model.name`, falling back to legacy `model.params.model`. */
export function readPersistedWorkerModelName(
  model: PersistedWorkerModel | unknown | undefined | null,
): string {
  const normalized = normalizeWorkerModel(model)
  if (!normalized) return ""

  const direct = typeof normalized.name === "string" ? normalized.name.trim() : ""
  if (direct) return direct

  const override = normalized.params?.model
  return typeof override === "string" ? override.trim() : ""
}

/** Reads saved provider or infers it from the persisted model id. */
export function readPersistedWorkerProvider(
  model: PersistedWorkerModel | unknown | undefined | null,
): string {
  const normalized = normalizeWorkerModel(model)
  if (!normalized) return ""

  const saved =
    typeof normalized.provider === "string"
      ? normalizeProviderId(normalized.provider)
      : ""
  if (saved) return saved
  return findProviderForModelPreset(readPersistedWorkerModelName(normalized)) ?? ""
}

/** Dev-only: warn once when API returns an un-normalized Mongoose subdocument. */
let loggedMongooseModelShape = false

export function warnIfMongooseModelShape(
  workerId: string,
  model: unknown,
): void {
  if (loggedMongooseModelShape || process.env.NODE_ENV === "production") return
  if (!model || typeof model !== "object") return

  const candidate = model as MongooseLikeSubdoc
  if (typeof candidate.name === "string" && typeof candidate.provider === "string") {
    return
  }
  if (!candidate._doc) return

  loggedMongooseModelShape = true
  console.warn(
    "[SwarmWorkerPanel] worker.model arrived as a Mongoose subdocument; using _doc fallback.",
    { workerId, modelName: readPersistedWorkerModelName(model) },
  )
}

/** Prefer in-form edits, then the worker persisted in the API/DB. */
export function getEffectiveModelName(
  localName: string,
  persistedName: string | undefined | null,
): string {
  const local = localName.trim()
  if (local) return local
  return (persistedName ?? "").trim()
}

/** Maps persisted worker model state to the select value (preset id or {@link CUSTOM_OPTION}). */
export function resolveModelSelectValue(
  modelName: string,
  providerId: string,
  modelOptions: ModelPreset[],
): string {
  const trimmed = modelName.trim()
  if (!trimmed) return CUSTOM_OPTION
  if (modelOptions.some((m) => m.id === trimmed)) return trimmed
  if (findModelPreset(normalizeProviderId(providerId), trimmed)) return trimmed
  if (findProviderForModelPreset(trimmed)) return trimmed
  return CUSTOM_OPTION
}

/** Ensures the saved/editing model id always appears in the dropdown. */
export function withPersistedModelOption(
  modelOptions: ModelPreset[],
  modelName: string,
): ModelPreset[] {
  const trimmed = modelName.trim()
  if (!trimmed || modelOptions.some((m) => m.id === trimmed)) {
    return modelOptions
  }
  const preset = findModelPreset(
    findProviderForModelPreset(trimmed) ?? "",
    trimmed,
  )
  return [{ id: trimmed, label: preset?.label ?? trimmed }, ...modelOptions]
}

export type WorkerModelSelection = {
  effectiveModelName: string
  canonicalProvider: string
  providerSelectValue: string
  modelOptions: ModelPreset[]
  modelSelectValue: string
}

/** Shared model/provider select state for worker config forms. */
export function resolveWorkerModelSelection(input: {
  provider: string
  localModelName: string
  persistedModelName: string
  providerOptions: Array<Pick<ProviderPreset, "id" | "models">>
}): WorkerModelSelection {
  const effectiveModelName = getEffectiveModelName(
    input.localModelName,
    input.persistedModelName,
  )
  const canonicalProvider = normalizeProviderId(input.provider)
  const providerSelectValue = !canonicalProvider
    ? (input.providerOptions[0]?.id ?? "")
    : input.providerOptions.some((p) => p.id === canonicalProvider)
      ? canonicalProvider
      : canonicalProvider

  const modelOptions = withPersistedModelOption(
    getModelsForProvider(providerSelectValue || canonicalProvider, input.providerOptions),
    effectiveModelName,
  )

  const modelSelectValue = resolveModelSelectValue(
    effectiveModelName,
    providerSelectValue || canonicalProvider,
    modelOptions,
  )

  return {
    effectiveModelName,
    canonicalProvider,
    providerSelectValue,
    modelOptions,
    modelSelectValue,
  }
}

/**
 * Merge backend `providers` (from `GET /inference/setup`) with our curated
 * presets. Backend wins on `id` + `label` + `configured`; presets contribute
 * the model catalog. Providers returned by the backend but not present in
 * the presets get an empty model list (admin can still type a custom id).
 */
export function buildProviderOptions(
  backendProviders: InferenceProviderSetup[] | null,
): Array<ProviderPreset & { configured: boolean; backendKnown: boolean }> {
  if (!backendProviders || backendProviders.length === 0) {
    return PROVIDER_PRESETS.map((p) => ({
      ...p,
      configured: false,
      backendKnown: false,
    }))
  }

  const byCanonical = new Map<
    string,
    ProviderPreset & { configured: boolean; backendKnown: boolean }
  >()

  for (const b of backendProviders) {
    const preset = findProviderPreset(b.id)
    const canonicalId = preset?.id ?? normalizeProviderId(b.id)
    const models = getModelsForProvider(canonicalId, PROVIDER_PRESETS)

    const existing = byCanonical.get(canonicalId)
    byCanonical.set(canonicalId, {
      id: canonicalId,
      label: b.label || preset?.label || existing?.label || canonicalId,
      models: models.length > 0 ? models : (existing?.models ?? []),
      configured: Boolean(b.configured) || Boolean(existing?.configured),
      backendKnown: true,
    })
  }

  for (const preset of PROVIDER_PRESETS) {
    if (byCanonical.has(preset.id)) continue
    byCanonical.set(preset.id, {
      ...preset,
      configured: false,
      backendKnown: false,
    })
  }

  return Array.from(byCanonical.values())
}
