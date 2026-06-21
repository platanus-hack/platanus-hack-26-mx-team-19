/** Static catalog for Instructions → Add global context (see agentatlas-services SWARMS-CONTEXT-PROMPTS.md). */

export type GlobalContextTokenFormat = "mustache" | "bare"

export type GlobalContextSection =
  | "company"
  | "floor"
  | "department"
  | "departments"
  | "hiredAgents"
  | "connectedTools"

export type GlobalContextVariable = {
  token: string
  label: string
  section: GlobalContextSection
}

const SECTION_LABELS: Record<GlobalContextSection, string> = {
  company: "Company",
  floor: "Floor task",
  department: "Department snapshot",
  departments: "Departments",
  hiredAgents: "Hired agents",
  connectedTools: "Connected tools",
}

export function globalContextSectionLabel(section: GlobalContextSection): string {
  return SECTION_LABELS[section]
}

export const GLOBAL_CONTEXT_SECTION_ORDER: GlobalContextSection[] = [
  "company",
  "floor",
  "department",
  "departments",
  "hiredAgents",
  "connectedTools",
]

export type HiredAgentContextSource = {
  hiredAgentId: string
  swarmId: string
  swarmName: string | null
  departmentId: string | null
}

export type DepartmentContextSource = {
  id: string
  name: string
  slug: string | null
}

/** Platform runInput keys — inserted as {{runInput.*}} in Instructions. */
export const GLOBAL_CONTEXT_VARIABLES: GlobalContextVariable[] = [
  { token: "{{runInput.companyName}}", label: "Company name", section: "company" },
  {
    token: "{{runInput.companyMemoryText}}",
    label: "Company context (text)",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory}}",
    label: "Company memory (full JSON)",
    section: "company",
  },
  { token: "{{runInput.companyId}}", label: "Company id", section: "company" },
  { token: "{{runInput.domain}}", label: "Domain", section: "company" },
  { token: "{{runInput.website}}", label: "Website", section: "company" },
  {
    token: "{{runInput.companyMemory.primary_icp}}",
    label: "Primary ICP",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.summary}}",
    label: "Summary",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.problem}}",
    label: "Problem",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.solution}}",
    label: "Solution",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.website}}",
    label: "Profile website",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.stage}}",
    label: "Stage",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.one_liner}}",
    label: "One-liner",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.target_customers}}",
    label: "Target customers",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.differentiator}}",
    label: "Differentiator",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.key_goals}}",
    label: "Key goals",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.products}}",
    label: "Products",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.pain_points}}",
    label: "Pain points",
    section: "company",
  },
  {
    token: "{{runInput.companyMemory.industries}}",
    label: "Industries",
    section: "company",
  },
  { token: "{{runInput.task}}", label: "User task", section: "floor" },
  { token: "{{runInput.floorTaskId}}", label: "Floor task id", section: "floor" },
  { token: "{{runInput.floorId}}", label: "Floor id", section: "floor" },
  { token: "{{runInput.swarmHiringId}}", label: "Swarm hiring id", section: "floor" },
  {
    token: "{{runInput.departmentStatus.summary}}",
    label: "Department summary",
    section: "department",
  },
  {
    token: "{{runInput.departmentStatus.openTasks.todo}}",
    label: "Open to-do count",
    section: "department",
  },
  {
    token: "{{runInput.departmentStatus.openTasks.doing}}",
    label: "In progress count",
    section: "department",
  },
  {
    token: "{{runInput.departmentStatus.activeHiredAgents}}",
    label: "Hired agents count",
    section: "department",
  },
  {
    token: "{{runInput.departmentStatus.departmentName}}",
    label: "Department name",
    section: "department",
  },
  { token: "{{runInput.departmentId}}", label: "Department id", section: "floor" },
  {
    token: "{{runInput.departments}}",
    label: "Departments list (JSON)",
    section: "departments",
  },
  {
    token: "{{runInput.departmentsText}}",
    label: "Departments list (text)",
    section: "departments",
  },
  {
    token: "{{runInput.agentsAvailable}}",
    label: "Hired agents catalog (JSON array)",
    section: "hiredAgents",
  },
  {
    token: "{{runInput.agentsAvailables}}",
    label: "Hired agents catalog (JSON text)",
    section: "hiredAgents",
  },
  {
    token: "{{runInput.toolsAvailable}}",
    label: "Connected tools catalog (JSON array)",
    section: "connectedTools",
  },
  {
    token: "{{runInput.toolsAvailables}}",
    label: "Connected tools catalog (JSON text)",
    section: "connectedTools",
  },
]

export function formatGlobalContextToken(
  token: string,
  format: GlobalContextTokenFormat = "mustache",
): string {
  if (format === "mustache") return token
  if (token.startsWith("{{") && token.endsWith("}}")) return token.slice(2, -2)
  return token
}

export function buildGlobalContextVariables(
  format: GlobalContextTokenFormat = "mustache",
): GlobalContextVariable[] {
  return GLOBAL_CONTEXT_VARIABLES.map((variable) => ({
    ...variable,
    token: formatGlobalContextToken(variable.token, format),
  }))
}

/** Readable preview matching runInput.departmentsText from the API. */
export function formatDepartmentsText(
  departments: ReadonlyArray<DepartmentContextSource>,
): string {
  return departments.map((department) => `${department.name} (id: ${department.id})`).join("\n")
}

export type HiredAgentDescriptorPreview = {
  id: string
  hiredAgentId: string
  swarmId: string
  name: string
  description: string
  departmentId: string | null
  departmentName: string | null
  triggers: string[]
  inputs: string[]
  outputs: string[]
}

/** Fallback preview when only basic hiring rows are available (no graph I/O). */
export function buildHiredAgentDescriptorPreviews(
  agents: ReadonlyArray<HiredAgentContextSource>,
): HiredAgentDescriptorPreview[] {
  return agents.map((row, index) => ({
    id: `a_${String(index + 1).padStart(2, "0")}`,
    hiredAgentId: row.hiredAgentId,
    swarmId: row.swarmId,
    name: row.swarmName?.trim() || "Unnamed agent",
    description: "",
    departmentId: row.departmentId,
    departmentName: null,
    triggers: [],
    inputs: ["message"],
    outputs: [],
  }))
}

export type PlatformToolDescriptorPreview = {
  id: string
  name: string
  covers: string[]
  status: "connected" | "missing"
}

/** Readable preview matching runInput.toolsAvailables from the API. */
export function formatToolsAvailablesText(
  tools: ReadonlyArray<PlatformToolDescriptorPreview>,
): string {
  if (tools.length === 0) return "[]"
  return JSON.stringify(tools, null, 2)
}

/** Readable preview matching runInput.agentsAvailables from the API. */
export function formatAgentsAvailablesText(
  agents: ReadonlyArray<HiredAgentContextSource | HiredAgentDescriptorPreview>,
): string {
  const descriptors =
    agents.length > 0 && "triggers" in agents[0]!
      ? (agents as HiredAgentDescriptorPreview[])
      : buildHiredAgentDescriptorPreviews(agents as HiredAgentContextSource[])
  if (descriptors.length === 0) return ""
  return JSON.stringify(descriptors, null, 2)
}

export function mergeGlobalContextVariables(
  format: GlobalContextTokenFormat = "mustache",
): GlobalContextVariable[] {
  return buildGlobalContextVariables(format)
}

export type GlobalContextPickerSection = {
  label: string
  items: Array<Pick<GlobalContextVariable, "token" | "label">>
}

export function buildGlobalContextPickerSections(
  format: GlobalContextTokenFormat = "mustache",
  excludeTokens: ReadonlySet<string> = new Set(),
): GlobalContextPickerSection[] {
  return GLOBAL_CONTEXT_SECTION_ORDER.flatMap((section) => {
    const items = buildGlobalContextVariables(format).filter(
      (variable) => variable.section === section && !excludeTokens.has(variable.token),
    )
    if (items.length === 0) return []
    return [{ label: globalContextSectionLabel(section), items }]
  })
}
