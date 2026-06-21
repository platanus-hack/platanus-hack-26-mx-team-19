/** A single conditional branch. The first case whose `condition` is truthy wins. */
export type IfElseCase = {
  id: string
  name: string
  /** Expression evaluated by the swarm orchestrator. */
  condition: string
  /** When true, edit `condition` as a raw expression (Code mode). */
  useCode?: boolean
  /** @deprecated Renamed to `useCode`. */
  useCustom?: boolean
}

export type IfElseNodeData = {
  cases: IfElseCase[]
}

export const caseHandleId = (caseId: string) =>
  caseId.startsWith("case-") ? caseId : `case-${caseId}`
export const ELSE_HANDLE_ID = "else"

export function createIfElseCase(): IfElseCase {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    condition: "",
  }
}

export function buildIfElseNodeData(): IfElseNodeData {
  return { cases: [createIfElseCase()] }
}

export function normalizeIfElseCases(cases: IfElseCase[]): IfElseCase[] {
  return cases.length > 0 ? cases : [createIfElseCase()]
}

/** Label shown beside each case handle on the canvas. */
export function ifElseCaseCanvasLabel(caseRow: IfElseCase, index: number): string {
  const trimmed = caseRow.name.trim()
  if (trimmed) return trimmed
  return index === 0 ? "If" : "Else if"
}

export type IfElseConditionOp = "truthy" | "eq" | "neq"

export type ParsedIfElseCondition = {
  field: string
  op: IfElseConditionOp
  value: string
}

function parseConditionLiteral(raw: string): string {
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1)
  }
  return raw
}

/** Parses stored condition strings into simple form fields. */
export function parseIfElseCondition(raw: string): ParsedIfElseCondition {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { field: "", op: "truthy", value: "" }
  }

  const compare = trimmed.match(/^([\w.]+)\s*(==|!=)\s*(.+)$/)
  if (compare?.[1] && compare[2] && compare[3]) {
    return {
      field: compare[1],
      op: compare[2] === "==" ? "eq" : "neq",
      value: parseConditionLiteral(compare[3].trim()),
    }
  }

  return { field: trimmed, op: "truthy", value: "" }
}

/** Builds the backend condition string from simple form fields. */
export function buildIfElseCondition(parts: ParsedIfElseCondition): string {
  const field = parts.field.trim()
  if (!field) return ""

  if (parts.op === "truthy") {
    return field
  }

  const value = parts.value.trim()
  const formatted =
    value === ""
      ? '""'
      : /^(true|false|null|-?\d+(\.\d+)?)$/.test(value)
        ? value
        : `"${value.replace(/"/g, '\\"')}"`

  return parts.op === "eq" ? `${field} == ${formatted}` : `${field} != ${formatted}`
}

/** True when the stored string is not exactly what the simple builder would emit. */
export function shouldUseCodeIfElseCondition(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return false
  return buildIfElseCondition(parseIfElseCondition(trimmed)) !== trimmed
}

/** @deprecated Use {@link shouldUseCodeIfElseCondition}. */
export const shouldUseCustomIfElseCondition = shouldUseCodeIfElseCondition

export function isIfElseCaseCodeMode(caseRow: IfElseCase): boolean {
  if (caseRow.useCode === true || caseRow.useCustom === true) return true
  if (caseRow.useCode === false || caseRow.useCustom === false) return false
  return shouldUseCodeIfElseCondition(caseRow.condition)
}
