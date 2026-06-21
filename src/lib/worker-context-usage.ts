import type { InferenceRequestPayload } from "@/data/api/server/swarms"

const PROMPT_TOKEN_RE = /\{\{([^}]+)\}\}/g

const RESERVED_ROOTS = new Set(["goal", "runInput", "input", "shared", "upstream", "output"])

export type WorkerContextEntry = {
  key: string
  label: string
  value: unknown
}

export type WorkerContextUpstreamEntry = {
  key: string
  label: string
  value: unknown
}

export type UsedWorkerContext = {
  globalEntries: WorkerContextEntry[]
  localEntries: WorkerContextUpstreamEntry[]
  globalCount: number
  localCount: number
  hasData: boolean
}

function getNested(root: unknown, path: string[]): unknown {
  if (path.length === 0) return root
  let cur: unknown = root
  for (const key of path) {
    if (cur == null || typeof cur !== "object" || Array.isArray(cur)) return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

function slugifyWorkerName(name: string): string {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9_]/g, "_").replace(/_+/g, "_")
  return cleaned.length > 0 ? cleaned : "worker"
}

function readUpstreamField(output: Record<string, unknown>, key: string): unknown {
  if (key in output) return output[key]
  const wrapped = output.summary
  if (wrapped && typeof wrapped === "object" && !Array.isArray(wrapped)) {
    return (wrapped as Record<string, unknown>)[key]
  }
  return undefined
}

function readUpstreamPath(output: Record<string, unknown>, path: string[]): unknown {
  if (path.length === 0) return output
  const [first, ...rest] = path
  if (!first) return output
  if (rest.length === 0) return readUpstreamField(output, first)
  const direct = getNested(output, [first, ...rest])
  if (direct !== undefined) return direct
  const wrapped = output.summary
  if (wrapped && typeof wrapped === "object" && !Array.isArray(wrapped)) {
    return getNested(wrapped, [first, ...rest])
  }
  return undefined
}

function resolveUpstreamIndex(selector: string, context: InferenceRequestPayload): number {
  const numeric = Number(selector)
  if (
    Number.isInteger(numeric) &&
    numeric >= 0 &&
    numeric < (context.upstream?.length ?? 0)
  ) {
    return numeric
  }

  const meta = context.upstreamMeta ?? []
  for (let i = 0; i < meta.length; i++) {
    const source = meta[i]
    if (!source) continue
    if (source.ref != null && source.ref === selector) return i
    if (source.nodeId != null && source.nodeId === selector) return i
    if (source.workerId === selector) return i
    if (slugifyWorkerName(source.workerName) === selector) return i
  }
  return -1
}

function resolveFlatSwarmFieldPath(
  parts: string[],
  context: InferenceRequestPayload,
): unknown {
  const upstream = context.upstream ?? []
  if (parts.length === 0 || upstream.length === 0) return undefined
  const [root, ...rest] = parts
  if (!root || RESERVED_ROOTS.has(root)) return undefined

  let matchCount = 0
  let value: unknown
  for (const output of upstream) {
    if (!output || typeof output !== "object" || Array.isArray(output)) continue
    const record = output as Record<string, unknown>
    const resolved =
      rest.length === 0 ? readUpstreamField(record, root) : readUpstreamPath(record, parts)
    if (resolved !== undefined) {
      value = resolved
      matchCount += 1
    }
  }
  return matchCount === 1 ? value : undefined
}

function resolveUpstreamPath(path: string[], context: InferenceRequestPayload): unknown {
  const upstream = context.upstream ?? []
  if (path.length === 0 || upstream.length === 0) return undefined

  if (path.length === 1) {
    if (upstream.length !== 1) return undefined
    const output = upstream[0]
    if (!output || typeof output !== "object" || Array.isArray(output)) return undefined
    return readUpstreamPath(output as Record<string, unknown>, path)
  }

  const [selector, ...fieldPath] = path
  if (!selector) return undefined
  const index = resolveUpstreamIndex(selector, context)
  if (index < 0) return undefined

  const output = upstream[index]
  if (!output || typeof output !== "object" || Array.isArray(output)) return undefined
  return readUpstreamPath(output as Record<string, unknown>, fieldPath)
}

/** Mirrors backend `resolvePromptPath` for display in swarm logs. */
export function resolveWorkerPromptPath(
  path: string,
  context: InferenceRequestPayload,
): unknown {
  const parts = path
    .split(".")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
  if (parts.length === 0) return undefined

  const [root, ...rest] = parts
  switch (root) {
    case "goal":
      return rest.length === 0 ? context.goal : undefined
    case "runInput":
      return getNested(context.runInput, rest)
    case "shared":
      return getNested(context.shared, rest)
    case "upstream":
      if (rest.length === 0) {
        return (context.upstream?.length ?? 0) > 0 ? context.upstream : undefined
      }
      return resolveUpstreamPath(rest, context)
    default:
      return resolveFlatSwarmFieldPath(parts, context)
  }
}

export function extractPromptTokenPaths(...texts: Array<string | undefined>): string[] {
  const paths = new Set<string>()
  for (const text of texts) {
    if (!text?.includes("{{")) continue
    const re = new RegExp(PROMPT_TOKEN_RE.source, "g")
    let match: RegExpExecArray | null
    while ((match = re.exec(text)) !== null) {
      const path = match[1]?.trim()
      if (path) paths.add(path)
    }
  }
  return [...paths]
}

function collectWorkerPromptTexts(context: InferenceRequestPayload): string[] {
  const texts = [context.systemPrompt ?? ""]
  for (const message of context.promptMessages ?? []) {
    texts.push(message.content ?? "")
  }
  return texts
}

function upstreamLabel(context: InferenceRequestPayload, index: number): string {
  const meta = context.upstreamMeta?.[index]
  return (
    (typeof meta?.workerName === "string" && meta.workerName.trim()) ||
    (typeof meta?.ref === "string" && meta.ref.trim()) ||
    `Upstream ${index + 1}`
  )
}

/** Context variables referenced in worker instructions (not the full enriched runInput). */
export function buildUsedWorkerContext(context?: InferenceRequestPayload): UsedWorkerContext {
  const empty: UsedWorkerContext = {
    globalEntries: [],
    localEntries: [],
    globalCount: 0,
    localCount: 0,
    hasData: false,
  }
  if (!context) return empty

  const paths = extractPromptTokenPaths(...collectWorkerPromptTexts(context))
  if (paths.length === 0) return empty

  const globalEntries: WorkerContextEntry[] = []
  const localEntries: WorkerContextUpstreamEntry[] = []
  const seenGlobal = new Set<string>()
  const seenLocal = new Set<string>()

  for (const path of paths) {
    const parts = path.split(".").filter(Boolean)
    const root = parts[0]
    const value = resolveWorkerPromptPath(path, context)

    if (root === "goal") {
      if (!seenGlobal.has("goal")) {
        seenGlobal.add("goal")
        globalEntries.push({ key: "goal", label: "goal", value: value ?? context.goal ?? null })
      }
      continue
    }

    if (root === "runInput") {
      const label = parts.slice(1).join(".") || "runInput"
      const key = `runInput.${label}`
      if (!seenGlobal.has(key)) {
        seenGlobal.add(key)
        globalEntries.push({ key, label, value: value ?? null })
      }
      continue
    }

    if (root === "shared") {
      const label = parts.slice(1).join(".") || "shared"
      const key = `shared.${label}`
      if (!seenGlobal.has(key)) {
        seenGlobal.add(key)
        globalEntries.push({ key, label, value: value ?? null })
      }
      continue
    }

    if (root === "upstream") {
      if (parts.length === 1) {
        const upstream = context.upstream ?? []
        upstream.forEach((item, index) => {
          const label = upstreamLabel(context, index)
          const key = `upstream:${label}`
          if (seenLocal.has(key)) return
          seenLocal.add(key)
          localEntries.push({
            key,
            label,
            value:
              item && typeof item === "object" && !Array.isArray(item)
                ? (item as Record<string, unknown>)
                : item,
          })
        })
      } else if (!seenLocal.has(path)) {
        seenLocal.add(path)
        localEntries.push({ key: path, label: path, value: value ?? null })
      }
      continue
    }

    if (!seenLocal.has(path)) {
      seenLocal.add(path)
      localEntries.push({ key: path, label: path, value: value ?? null })
    }
  }

  return {
    globalEntries,
    localEntries,
    globalCount: globalEntries.length,
    localCount: localEntries.length,
    hasData: globalEntries.length > 0 || localEntries.length > 0,
  }
}

export function summarizeWorkerContext(context?: InferenceRequestPayload): {
  globalCount: number
  localCount: number
  hasData: boolean
} {
  const used = buildUsedWorkerContext(context)
  return {
    globalCount: used.globalCount,
    localCount: used.localCount,
    hasData: used.hasData,
  }
}
