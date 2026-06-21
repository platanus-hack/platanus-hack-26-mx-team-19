import { NEXT_PUBLIC_API_URL } from "@/config/env"

export function swarmRunUrl(swarmId: string, opts?: { admin?: boolean; stream?: boolean }) {
  const admin = opts?.admin ?? false
  const stream = opts?.stream ?? false
  const path = admin
    ? `/admin/swarms/${swarmId}/run${stream ? "/stream" : ""}`
    : `/swarms/${swarmId}/run${stream ? "/stream" : ""}`
  return `${NEXT_PUBLIC_API_URL}${path}`
}

export function buildSwarmRunCurl(swarmId: string, opts?: { admin?: boolean }) {
  const url = swarmRunUrl(swarmId, { admin: opts?.admin })
  return [
    `curl -X POST '${url}' \\`,
    `  -H 'Authorization: Bearer <access_token>' \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -d '{"input":{}}'`,
  ].join("\n")
}
