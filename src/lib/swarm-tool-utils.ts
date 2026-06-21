const OBJECT_ID_RE = /^[a-f0-9]{24}$/i

export function isMongoObjectId(value: string): boolean {
  return OBJECT_ID_RE.test(value.trim())
}

/** Mirrors backend `parseSwarmToolIds` — trims, validates ObjectIds, dedupes. */
export function parseSwarmToolIds(raw?: unknown): string[] {
  if (!Array.isArray(raw)) return []

  const ids: string[] = []
  const seen = new Set<string>()

  for (const item of raw) {
    if (typeof item !== "string") continue
    const trimmed = item.trim()
    if (!isMongoObjectId(trimmed) || seen.has(trimmed)) continue
    seen.add(trimmed)
    ids.push(trimmed)
  }

  return ids
}

/** OpenAI function name for a worker `swarmTools` entry. */
export function swarmToolFunctionName(swarmId: string): string {
  return `swarm_${swarmId.trim()}`
}
