import auth from "@/data/api/server/auth"
import type {
  DecideSwarmRunApprovalPayload,
  RunSwarmPayload,
  SwarmSseEvent,
} from "@/data/api/server/swarms"
import { NEXT_PUBLIC_API_URL } from "@/config/env"

export type SwarmStreamHandlers = {
  onEvent: (event: SwarmSseEvent) => void
}

function parseSseLine(line: string): SwarmSseEvent | null {
  if (!line.startsWith("data: ")) return null
  try {
    return JSON.parse(line.slice(6)) as SwarmSseEvent
  } catch {
    return null
  }
}

type StreamBody = RunSwarmPayload | DecideSwarmRunApprovalPayload

async function consumeSwarmRunStream(
  url: string,
  body: StreamBody,
  handlers: SwarmStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const token = auth.getToken()
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    signal,
  })

  if (!res.ok) {
    let message = `Stream failed (${res.status})`
    try {
      const errBody = (await res.json()) as { message?: string | string[] }
      if (errBody.message) {
        message = Array.isArray(errBody.message) ? errBody.message.join(", ") : errBody.message
      }
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

  if (!res.body) {
    throw new Error("Stream body unavailable")
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const event = parseSseLine(trimmed)
      if (event) handlers.onEvent(event)
    }
  }

  const tail = buffer.trim()
  if (tail) {
    const event = parseSseLine(tail)
    if (event) handlers.onEvent(event)
  }
}

/** Admin test panel — `POST /admin/swarms/:id/run/stream`. */
export function adminRunSwarmStream(
  swarmId: string,
  body: RunSwarmPayload,
  handlers: SwarmStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return consumeSwarmRunStream(
    `${NEXT_PUBLIC_API_URL}/admin/swarms/${swarmId}/run/stream`,
    body,
    handlers,
    signal,
  )
}

/** Admin test panel — decide + resume SSE (`POST /admin/swarms/swarm-run-approvals/:id/decide/stream`). */
export function adminDecideSwarmRunStream(
  approvalId: string,
  body: DecideSwarmRunApprovalPayload,
  handlers: SwarmStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return consumeSwarmRunStream(
    `${NEXT_PUBLIC_API_URL}/admin/swarms/swarm-run-approvals/${approvalId}/decide/stream`,
    body,
    handlers,
    signal,
  )
}

/** Workspace test panel — `POST /swarms/:id/run/stream`. */
export function runSwarmStream(
  swarmId: string,
  body: RunSwarmPayload,
  handlers: SwarmStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return consumeSwarmRunStream(
    `${NEXT_PUBLIC_API_URL}/swarms/${swarmId}/run/stream`,
    body,
    handlers,
    signal,
  )
}

/** User-facing decide + resume SSE (non-admin routes). */
export function decideSwarmRunStream(
  approvalId: string,
  body: DecideSwarmRunApprovalPayload,
  handlers: SwarmStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return consumeSwarmRunStream(
    `${NEXT_PUBLIC_API_URL}/swarm-run-approvals/${approvalId}/decide/stream`,
    body,
    handlers,
    signal,
  )
}
