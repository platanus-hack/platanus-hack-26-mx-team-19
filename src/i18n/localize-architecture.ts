import type { ArchitectureEntry } from "@/content/architectures"
import type { Locale } from "./locale"
import { ARCHITECTURE_OVERRIDES, type ArchitectureTextOverride } from "./architecture-overrides"

function applyOverride(entry: ArchitectureEntry, o: ArchitectureTextOverride): ArchitectureEntry {
  return {
    ...entry,
    name: o.name,
    summary: o.summary,
    description: o.description,
    problem: o.problem,
    when_to_use: o.when_to_use,
    when_not_to_use: o.when_not_to_use,
    forces: o.forces,
    agent_count: { ...entry.agent_count, sweet_spot: o.sweet_spot },
    ...(o.evidence !== undefined ? { evidence: o.evidence } : {}),
  }
}

export function localizeArchitectureEntry(entry: ArchitectureEntry, locale: Locale): ArchitectureEntry {
  const override = ARCHITECTURE_OVERRIDES[locale]?.[entry.id]
  return override ? applyOverride(entry, override) : entry
}

export function localizeArchitectureCatalog(entries: ArchitectureEntry[], locale: Locale): ArchitectureEntry[] {
  return entries.map((e) => localizeArchitectureEntry(e, locale))
}
