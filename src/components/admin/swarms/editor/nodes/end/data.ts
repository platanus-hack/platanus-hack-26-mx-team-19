/** @deprecated Legacy saves only — UI uses `valuePath` only. */
export type EndOutputFieldSource = "field" | "runInput" | "static"

export type EndOutputField = {
  id: string
  /** Key in the assembled JSON object. */
  key: string
  /** Workflow variable, e.g. `summary` or `runInput.message`. */
  valuePath?: string
  /** @deprecated */
  source?: EndOutputFieldSource
  /** @deprecated */
  staticValue?: string
}

export type EndNodeData = {
  label?: string
  /** Structured swarm run output when this node is the workflow sink. */
  fields: EndOutputField[]
}

/** Default JSON key when mapping a workflow variable (e.g. `runInput.message` → `message`). */
export function defaultOutputKeyFromValuePath(valuePath: string): string {
  const trimmed = valuePath.trim()
  if (trimmed.startsWith("runInput.")) {
    return trimmed.slice("runInput.".length)
  }
  const lastDot = trimmed.lastIndexOf(".")
  if (lastDot >= 0) {
    return trimmed.slice(lastDot + 1)
  }
  return trimmed
}

export function fieldFromVariableOption(valuePath: string): EndOutputField {
  return createEndOutputField({
    valuePath,
    key: defaultOutputKeyFromValuePath(valuePath),
  })
}

export function createEndOutputField(
  partial?: Partial<Pick<EndOutputField, "key" | "valuePath">>,
): EndOutputField {
  return {
    id: `end-field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key: partial?.key ?? "",
    valuePath: partial?.valuePath,
  }
}

export function normalizeEndFields(fields: EndOutputField[]): EndOutputField[] {
  return fields.map((row) => {
    let valuePath = row.valuePath?.trim() ?? ""
    if (row.source === "runInput" && valuePath && !valuePath.startsWith("runInput.")) {
      valuePath = `runInput.${valuePath}`
    }
    return {
      id: row.id,
      key: row.key ?? "",
      valuePath: valuePath || undefined,
    }
  })
}

export function buildEndNodeData(): EndNodeData {
  return { fields: [] }
}

/** True when the list is empty or only placeholder rows. */
export function isEndFieldsPlaceholder(fields: EndOutputField[]): boolean {
  return (
    fields.length === 0 ||
    fields.every((row) => !row.key.trim() && !row.valuePath?.trim())
  )
}

export function summarizeEndNode(data: EndNodeData): string {
  const keys = normalizeEndFields(data.fields ?? [])
    .map((f) => f.key.trim())
    .filter(Boolean)
  if (keys.length === 0) return "No output fields"
  if (keys.length <= 3) return keys.join(", ")
  return `${keys.length} fields`
}
