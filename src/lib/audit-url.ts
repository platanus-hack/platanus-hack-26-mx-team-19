import { NEXT_PUBLIC_APP_URL } from "@/config/env"

export function buildPublicAuditUrl(runId: string): string {
  const base = NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  return `${base}/audit/${encodeURIComponent(runId)}`
}
