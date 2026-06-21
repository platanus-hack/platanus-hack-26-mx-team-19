import type { Messages } from "@/i18n/LocaleProvider"

type NodeMessages = Messages["swarmEditor"]["nodes"]
type NodeMessageKey = keyof NodeMessages

const CONTROL_NODE_MSG_KEY: Record<string, NodeMessageKey> = {
  start: "start",
  ifelse: "ifelse",
  while: "while",
  scraper: "scraper",
  research_papers: "researchPapers",
  swarm: "swarm",
  user_approval: "userApproval",
  end: "end",
}

export function controlNodeCopy(
  messages: Messages,
  kind: string,
): { label: string; description: string } | null {
  const key = CONTROL_NODE_MSG_KEY[kind]
  if (!key) return null
  const entry = messages.swarmEditor.nodes[key]
  return { label: entry.label, description: entry.description }
}
