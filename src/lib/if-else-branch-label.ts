/** Human-readable branch label from an if/else node_done output payload. */
export function formatIfElseBranchLabel(output: Record<string, unknown>): string {
  const handle = typeof output.branchHandle === "string" ? output.branchHandle.trim() : ""
  if (handle === "else") return "Else"

  const caseName = typeof output.caseName === "string" ? output.caseName.trim() : ""
  if (caseName) return caseName

  if (handle.startsWith("case-")) return "If matched"

  return handle || "—"
}

export function formatIfElseLogBody(output: Record<string, unknown>): string {
  const lines: string[] = []
  const branch = formatIfElseBranchLabel(output)
  lines.push(`Branch: ${branch}`)

  const condition =
    typeof output.matchedCondition === "string" ? output.matchedCondition.trim() : ""
  if (condition) {
    lines.push(`Condition: ${condition}`)
  }

  const warning =
    typeof output.routingWarning === "string" ? output.routingWarning.trim() : ""
  if (warning) {
    lines.push(`⚠ ${warning}`)
  }

  return lines.join("\n")
}

export function formatIfElseBranchMeta(output: Record<string, unknown>): string {
  return `branch · ${formatIfElseBranchLabel(output)}`
}
