export type ToolConnectionStatus = "connected" | "missing"

/** Public catalog row for prompts and `runInput.toolsAvailable`. */
export type PlatformToolDescriptor = {
  id: string
  name: string
  covers: string[]
  status: ToolConnectionStatus
}

export type ToolsCatalog = {
  toolsAvailable: PlatformToolDescriptor[]
  toolsAvailables: string
}

export type ToolIntegration = PlatformToolDescriptor & {
  key: string
}

export type ToolIntegrationsResponse = {
  tools: ToolIntegration[]
}
