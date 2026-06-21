/** Supported variable types for workflow inputs and state. */
export const START_VARIABLE_TYPES = ["string", "number", "boolean", "object", "array"] as const

export type StartVariableType = (typeof START_VARIABLE_TYPES)[number]

export type StartVariable = {
  id: string
  name: string
  type: StartVariableType
}

export type StartNodeData = {
  /** Caller-facing inputs when the swarm runs — exposed as `runInput.*` to downstream agents. */
  inputVariables: StartVariable[]
  /** Optional cross-step state initialized at entry (`shared.*` at runtime). */
  stateVariables: StartVariable[]
}

export const START_OUTPUT_HANDLE_ID = "output"

export function createStartVariable(
  partial?: Partial<Pick<StartVariable, "name" | "type">>,
): StartVariable {
  return {
    id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: partial?.name ?? "",
    type: partial?.type ?? "string",
  }
}

/** Default workflow input — add more in the Start config panel as needed. */
export function buildStartNodeData(): StartNodeData {
  return {
    inputVariables: [createStartVariable({ name: "message", type: "string" })],
    stateVariables: [],
  }
}

export function summarizeStartNode(data: StartNodeData): string {
  const inputs = data.inputVariables.filter((v) => v.name.trim())
  if (inputs.length === 0) return "No inputs"
  if (inputs.length <= 3) return inputs.map((v) => v.name.trim()).join(", ")
  return `${inputs.length} inputs`
}
