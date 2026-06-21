"use client"

import { useMemo } from "react"
import type { InferenceTrace, WorkerInferenceMessage } from "@/data/api/server/swarms"
import WorkerLogCopyButton from "./WorkerLogCopyButton"

type TokenUsage = {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

type Props = {
  inference?: InferenceTrace
  messages?: WorkerInferenceMessage[]
  fallbackModel?: string
  /** Light, borderless layout for embedding inside {@link WorkerLogCard}. */
  embedded?: boolean
}

function readUsage(response: Record<string, unknown> | null | undefined): TokenUsage {
  const usage = response?.usage
  if (!usage || typeof usage !== "object") return {}
  const u = usage as Record<string, unknown>
  return {
    promptTokens: typeof u.promptTokens === "number" ? u.promptTokens : undefined,
    completionTokens: typeof u.completionTokens === "number" ? u.completionTokens : undefined,
    totalTokens: typeof u.totalTokens === "number" ? u.totalTokens : undefined,
  }
}

function readModel(
  inference: InferenceTrace | undefined,
  fallbackModel?: string,
): string | undefined {
  const responseModel = inference?.response?.model
  if (typeof responseModel === "string" && responseModel.trim()) return responseModel
  const requestModel = inference?.request?.model
  if (typeof requestModel === "string" && requestModel.trim()) return requestModel
  return fallbackModel
}

function previewContent(content: string, max = 72): string {
  const flat = content.replace(/\s+/g, " ").trim()
  if (flat.length <= max) return flat
  return `${flat.slice(0, max)}…`
}

function formatTokenCount(value?: number): string {
  if (value == null) return "—"
  return value.toLocaleString()
}

export function formatInferenceMessagesForCopy(messages: WorkerInferenceMessage[]): string {
  return messages
    .map((message) => `[${message.role}]\n${message.content}`)
    .join("\n\n")
}

export function extractWorkerTokenUsage(
  inference: InferenceTrace | undefined,
  messages?: WorkerInferenceMessage[],
): TokenUsage {
  const fromResponse = readUsage(inference?.response)
  if (fromResponse.totalTokens != null) return fromResponse

  if (messages?.length) {
    const completionTokens = messages.reduce(
      (sum, message) => sum + (message.tokensUsed ?? 0),
      0,
    )
    if (completionTokens > 0) {
      return { completionTokens, totalTokens: completionTokens }
    }
  }

  return fromResponse
}

export function WorkerTokenBadge({
  inference,
  messages,
}: {
  inference?: InferenceTrace
  messages?: WorkerInferenceMessage[]
}) {
  const usage = extractWorkerTokenUsage(inference, messages)
  if (usage.totalTokens == null) return null

  return (
    <>
      <span className="worker-token-badge" title="Total inference tokens">
        {formatTokenCount(usage.totalTokens)} tok
      </span>
      <style jsx>{`
        .worker-token-badge {
          font-size: 0.5625rem;
          font-weight: 600;
          color: var(--app-text);
          font-variant-numeric: tabular-nums;
          padding: 0.05rem 0.3rem;
          border-radius: var(--app-radius-pill);
          background: var(--app-surface);
          border: 1px solid var(--app-border);
        }
      `}</style>
    </>
  )
}

export default function InferenceLogSection({
  inference,
  messages,
  fallbackModel,
  embedded = false,
}: Props) {
  const model = readModel(inference, fallbackModel)
  const usage = useMemo(
    () => extractWorkerTokenUsage(inference, messages),
    [inference, messages],
  )
  const messageList = messages ?? []
  const messagesCopyText = useMemo(
    () => formatInferenceMessagesForCopy(messageList),
    [messageList],
  )

  if (!model && usage.totalTokens == null && messageList.length === 0) {
    return <p className="inference-empty">(inference trace not available)</p>
  }

  return (
    <div className={`inference-log${embedded ? " inference-log--embedded" : ""}`}>
      {embedded ? null : <span className="inference-label">Inference API request</span>}

      <div className="inference-summary">
        {model ? (
          <div className="inference-row">
            <span className="inference-key">Model</span>
            <span className="inference-val inference-val--model">{model}</span>
          </div>
        ) : null}

        {usage.totalTokens != null ? (
          <div className="inference-row inference-row--tokens">
            <span className="inference-key">Tokens</span>
            <span className="inference-val inference-val--tokens">
              <strong>{formatTokenCount(usage.totalTokens)}</strong>
              {usage.promptTokens != null || usage.completionTokens != null ? (
                <span className="inference-token-split">
                  {usage.promptTokens != null ? `${formatTokenCount(usage.promptTokens)} in` : null}
                  {usage.promptTokens != null && usage.completionTokens != null ? " · " : null}
                  {usage.completionTokens != null
                    ? `${formatTokenCount(usage.completionTokens)} out`
                    : null}
                </span>
              ) : null}
            </span>
          </div>
        ) : null}
      </div>

      {messageList.length > 0 ? (
        <details className="inference-messages">
          <summary className="inference-messages-summary">
            <span className="inference-chevron" aria-hidden />
            Messages ({messageList.length})
            <span
              className="inference-messages-copy"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <WorkerLogCopyButton
                text={messagesCopyText}
                label="Messages"
                title="Copy full conversation"
              />
            </span>
          </summary>
          <ul className="inference-message-list">
            {messageList.map((message, index) => (
              <li key={`${message.role}-${index}`} className="inference-message">
                <details className="inference-message-details">
                  <summary className="inference-message-head">
                    <span className="inference-chevron inference-chevron--sm" aria-hidden />
                    <span className={`inference-role inference-role--${message.role}`}>
                      {message.role}
                    </span>
                    <span className="inference-message-tokens">
                      {formatTokenCount(message.tokensUsed)} tok
                    </span>
                    <span className="inference-message-preview">
                      {previewContent(message.content)}
                    </span>
                  </summary>
                  <pre className="inference-message-body">{message.content}</pre>
                </details>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <style jsx>{`
        .inference-log {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
        }
        .inference-log--embedded {
          gap: 0.3rem;
        }
        .inference-empty {
          margin: 0;
          font-size: 0.5625rem;
          color: var(--app-text-faint);
          font-style: italic;
        }
        .inference-label {
          font-size: 0.5625rem;
          color: var(--app-text-faint);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .inference-summary {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.35rem 0.45rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
        }
        .inference-log--embedded .inference-summary {
          background: var(--app-surface-muted);
        }
        .inference-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          font-size: 0.5625rem;
        }
        .inference-key {
          min-width: 2.75rem;
          color: var(--app-text-faint);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 0.5rem;
        }
        .inference-val {
          color: var(--app-text);
          word-break: break-word;
        }
        .inference-val--model {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 500;
        }
        .inference-val--tokens {
          display: flex;
          align-items: baseline;
          gap: 0.375rem;
          font-variant-numeric: tabular-nums;
        }
        .inference-val--tokens strong {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--app-text);
        }
        .inference-token-split {
          color: var(--app-text-faint);
          font-size: 0.5rem;
        }
        .inference-messages {
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          overflow: hidden;
        }
        .inference-log--embedded .inference-messages {
          background: var(--app-surface);
        }
        .inference-messages-summary {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
          padding: 0.3rem 0.45rem;
          font-size: 0.5625rem;
          font-weight: 500;
          color: var(--app-text-muted);
          list-style: none;
          user-select: none;
        }
        .inference-messages-copy {
          margin-left: auto;
          display: inline-flex;
        }
        .inference-messages-summary::-webkit-details-marker {
          display: none;
        }
        .inference-messages-summary:hover {
          background: var(--app-surface-muted);
        }
        .inference-chevron {
          flex-shrink: 0;
          width: 0;
          height: 0;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          border-left: 4px solid var(--app-text-faint);
          transition: transform 0.12s ease;
        }
        .inference-chevron--sm {
          border-left-width: 3px;
        }
        .inference-messages[open] .inference-messages-summary .inference-chevron,
        .inference-message-details[open] .inference-message-head .inference-chevron {
          transform: rotate(90deg);
        }
        .inference-message-list {
          list-style: none;
          margin: 0;
          padding: 0;
          border-top: 1px solid var(--app-border);
        }
        .inference-message + .inference-message {
          border-top: 1px solid var(--app-border);
        }
        .inference-message-head {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
          padding: 0.25rem 0.45rem;
          cursor: pointer;
          list-style: none;
          font-size: 0.5625rem;
          background: var(--app-surface);
        }
        .inference-message-head::-webkit-details-marker {
          display: none;
        }
        .inference-message-head:hover {
          background: var(--app-surface-muted);
        }
        .inference-role {
          flex-shrink: 0;
          font-size: 0.5rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.05rem 0.25rem;
          border-radius: var(--app-radius-pill);
          border: 1px solid var(--app-border);
          background: var(--app-surface-muted);
        }
        .inference-role--system {
          color: #2563eb;
          border-color: #bfdbfe;
          background: #eff6ff;
        }
        .inference-role--user {
          color: #15803d;
          border-color: #bbf7d0;
          background: #f0fdf4;
        }
        .inference-role--assistant {
          color: #a16207;
          border-color: #fde68a;
          background: #fffbeb;
        }
        .inference-message-tokens {
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
          color: var(--app-text-faint);
          font-size: 0.5rem;
        }
        .inference-message-preview {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--app-text-faint);
        }
        .inference-message-body {
          margin: 0;
          padding: 0.35rem 0.45rem 0.45rem;
          max-height: 8rem;
          overflow: auto;
          font-size: 0.5625rem;
          line-height: 1.4;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: #5a6478;
          white-space: pre-wrap;
          word-break: break-word;
          border-top: 1px dashed var(--app-border);
          background: var(--app-surface-muted);
        }
      `}</style>
    </div>
  )
}
