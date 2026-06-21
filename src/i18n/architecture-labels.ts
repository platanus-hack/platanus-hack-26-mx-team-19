import type { ArchitectureEntry } from "@/content/architectures"
import type { Messages } from "@/i18n/LocaleProvider"

type ArchLabels = Messages["landing"]["architectures"]

export function translateArchitectureCategory(category: string, labels: ArchLabels): string {
  const map = labels.categories as Record<string, string>
  return map[category] ?? category
}

export function translateArchitectureBadge(badge: string, labels: ArchLabels): string {
  const map = labels.badges as Record<string, string>
  return map[badge] ?? badge
}

export function translateArchitectureLayer(layer: ArchitectureEntry["layer"], labels: ArchLabels): string {
  return labels.layers[layer] ?? layer
}

export function architectureScaleLabels(labels: ArchLabels): Record<string, string> {
  return {
    verification: labels.scaleVerification,
    traceability: labels.scaleTraceability,
    latency: labels.scaleLatency,
    cost: labels.scaleCost,
  }
}
