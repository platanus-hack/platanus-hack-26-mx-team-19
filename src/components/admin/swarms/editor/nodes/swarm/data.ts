export type SwarmInputFieldSource = "upstream" | "runInput" | "shared" | "static" | "field"

export type SwarmInputField = {
  id: string
  key: string
  source: SwarmInputFieldSource
  valuePath?: string
  staticValue?: string
}

export type SwarmNodeData = {
  label?: string
  swarmId?: string
  inputFields?: SwarmInputField[]
  passShared?: boolean
}

export const SWARM_SUCCESS_HANDLE = "success"
export const SWARM_FAILED_HANDLE = "failed"

export function createSwarmInputField(overrides?: Partial<SwarmInputField>): SwarmInputField {
  return {
    id: `swarm-in-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key: "",
    source: "upstream",
    ...overrides,
  }
}

export function buildSwarmNodeData(): SwarmNodeData {
  return {
    inputFields: [],
    passShared: false,
  }
}
