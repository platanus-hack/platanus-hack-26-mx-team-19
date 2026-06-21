import {
  architectureCatalog,
  architectureCatalogSection,
  type ArchitectureEntry,
  type ArchitectureScale,
} from "@/content/architectures"

function scaleLabel(value: ArchitectureScale): string {
  return String(value)
}

function formatList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n")
}

function formatGraph(entry: ArchitectureEntry): string {
  const nodeLine = entry.graph.nodes.map((n) => n.id).join(", ")
  const edgeLines = entry.graph.edges
    .map((e) => (e.label ? `${e.from} → ${e.to} (${e.label})` : `${e.from} → ${e.to}`))
    .join("; ")
  return `Nodes: ${nodeLine}. Edges: ${edgeLines}.`
}

function formatFrameworkNotes(notes: Record<string, string> | undefined): string {
  if (!notes) return ""
  return Object.entries(notes)
    .map(([framework, note]) => `- **${framework}:** ${note}`)
    .join("\n")
}

function formatEntry(entry: ArchitectureEntry): string {
  const badge = entry.badge ? ` (${entry.badge})` : ""
  const frameworkBlock = entry.framework_notes
    ? `\n**Framework notes:**\n${formatFrameworkNotes(entry.framework_notes)}\n`
    : ""
  const evidenceBlock = entry.evidence ? `\n**Evidence:** ${entry.evidence}\n` : ""
  const refsBlock =
    entry.references && entry.references.length > 0
      ? `\n**References:** ${entry.references.map((r) => (r.url ? `[${r.title}](${r.url})` : r.title)).join("; ")}\n`
      : ""

  return [
    `### ${entry.name}${badge}`,
    "",
    `**Category:** ${entry.category} · **Layer:** ${entry.layer}`,
    "",
    entry.summary,
    "",
    entry.description,
    "",
    `**Problem:** ${entry.problem}`,
    "",
    "**When to use:**",
    formatList(entry.when_to_use),
    "",
    "**When not to use:**",
    formatList(entry.when_not_to_use),
    "",
    "**Forces:**",
    formatList(entry.forces),
    "",
    "| Verification | Traceability | Latency | Cost |",
    "|---|---|---|---|",
    `| ${scaleLabel(entry.verification)} | ${scaleLabel(entry.traceability)} | ${scaleLabel(entry.latency)} | ${scaleLabel(entry.cost)} |`,
    "",
    `**Agents:** ${entry.agent_count.sweet_spot} (typical ${entry.agent_count.min}–${entry.agent_count.max})`,
    "",
    `**Graph:** ${formatGraph(entry)}`,
    frameworkBlock,
    evidenceBlock,
    refsBlock,
  ]
    .join("\n")
}

/** Markdown block for skill docs (between sync markers). */
export function buildArchitectureCatalogMarkdown(): string {
  const { intro, sweetSpot } = architectureCatalogSection
  const landing = architectureCatalog.filter((entry) => entry.featured)
  const extended = architectureCatalog.filter((entry) => !entry.featured)

  const sections = [
    "## Architecture patterns (catalogue)",
    "",
    intro,
    "",
    ...landing.flatMap((entry, index) => {
      const block = formatEntry(entry)
      return index < landing.length - 1 ? [block, "---", ""] : [block]
    }),
  ]

  if (extended.length > 0) {
    sections.push(
      "",
      "---",
      "",
      "## Extended patterns (skill catalogue)",
      "",
      "Additional topologies documented for agents — not shown on the landing grid yet.",
      "",
      ...extended.flatMap((entry, index) => {
        const block = formatEntry(entry)
        return index < extended.length - 1 ? [block, "---", ""] : [block]
      }),
    )
  }

  sections.push("", sweetSpot)

  return sections.join("\n")
}

/** Compact lines for llm.txt / search snapshots. */
export function buildArchitectureCatalogPlainLines(): string[] {
  const formatLine = (entry: ArchitectureEntry) =>
    `- ${entry.name} [${entry.category}] — ${entry.summary}${entry.badge ? ` (${entry.badge})` : ""}`

  const landing = architectureCatalog.filter((entry) => entry.featured).map(formatLine)
  const extended = architectureCatalog.filter((entry) => !entry.featured).map(formatLine)

  if (extended.length === 0) return landing

  return [...landing, "", "Extended patterns:", ...extended]
}
