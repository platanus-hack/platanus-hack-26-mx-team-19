import axios from "axios"
import { NEXT_PUBLIC_API_BASIC_AUTH, NEXT_PUBLIC_API_URL } from "@/config/env"
import type { AgentRun, SwarmRun } from "@/data/api/server/swarms"

export type PublicSwarmSummary = {
  id: string
  name: string
  goal: string
}

/** Public agent run — omits inference traces; includes `workerName` for display. */
export type PublicAgentRun = Pick<
  AgentRun,
  "id" | "workerId" | "messages" | "input" | "output" | "status" | "durationMs"
> & {
  workerName?: string
}

export type PublicSwarmRunResponse = {
  swarm: PublicSwarmSummary
  swarmRun: SwarmRun
  agentRuns: PublicAgentRun[]
}

function publicAuditHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  if (NEXT_PUBLIC_API_BASIC_AUTH) {
    headers.Authorization = `Basic ${btoa(NEXT_PUBLIC_API_BASIC_AUTH)}`
  }
  return headers
}

export async function fetchPublicSwarmRun(runId: string): Promise<PublicSwarmRunResponse> {
  const response = await axios.get<PublicSwarmRunResponse>(
    `${NEXT_PUBLIC_API_URL}/public/swarm-runs/${encodeURIComponent(runId)}`,
    { headers: publicAuditHeaders() },
  )
  return response.data
}
