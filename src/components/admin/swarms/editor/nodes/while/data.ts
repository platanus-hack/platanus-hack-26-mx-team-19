export type WhileNodeData = {
  /** Expression evaluated before each iteration. Loop continues while truthy. */
  condition: string
  /** When true, edit `condition` as a raw expression (Code mode). */
  useCode?: boolean
  /** Optional cap on iterations (orchestrator default when omitted). */
  maxIterations?: number
}

export const WHILE_LOOP_HANDLE = "loop"
export const WHILE_DONE_HANDLE = "done"

export const DEFAULT_WHILE_MAX_ITERATIONS = 50

export function buildWhileNodeData(): WhileNodeData {
  return {
    condition: "",
    maxIterations: DEFAULT_WHILE_MAX_ITERATIONS,
  }
}
