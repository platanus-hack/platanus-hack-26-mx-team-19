"use client"

import type { InferenceRequestPayload, InferenceTrace, WorkerInferenceMessage } from "@/data/api/server/swarms"
import { summarizeWorkerContext } from "@/lib/worker-context-usage"
import InferenceLogSection, { WorkerTokenBadge } from "./InferenceLogSection"
import WorkerContextSection from "./WorkerContextSection"
import WorkerLogCopyButton from "./WorkerLogCopyButton"

export type WorkerLogCardProps = {
  name: string
  step: number
  status: "running" | "done"
  streamText: string
  meta?: string
  latencyMs?: number
  model?: string
  inference?: InferenceTrace
  messages?: WorkerInferenceMessage[]
  contextInput?: InferenceRequestPayload
}

function contextSummaryLabel(context?: InferenceRequestPayload): string {
  const { globalCount, localCount, hasData } = summarizeWorkerContext(context)
  if (!context) return "Context"
  if (!hasData) return "Context (empty)"
  const parts: string[] = []
  if (localCount > 0) parts.push(`${localCount} local`)
  if (globalCount > 0) parts.push(`${globalCount} global`)
  return `Context (${parts.join(" · ")})`
}

export default function WorkerLogCard({
  name,
  step,
  status,
  streamText,
  meta,
  latencyMs,
  model,
  inference,
  messages,
  contextInput,
}: WorkerLogCardProps) {
  const outputText = streamText || (status === "running" ? "…" : "(no output)")
  const canCopyOutput =
    Boolean(streamText.trim()) && outputText !== "…" && outputText !== "(no output)"
  const hasInference =
    Boolean(model) ||
    Boolean(inference) ||
    (messages?.length ?? 0) > 0

  return (
    <article className={`worker-log worker-log--${status}`}>
      <header className="worker-log-head">
        <span className="worker-log-step">{step}</span>
        <span className="worker-log-kind">worker</span>
        <span className="worker-log-name">{name}</span>
        {latencyMs != null ? (
          <span className="worker-log-dur">{latencyMs} ms</span>
        ) : status === "running" ? (
          <span className="worker-log-dur worker-log-dur--live">running</span>
        ) : null}
        <WorkerTokenBadge inference={inference} messages={messages} />
      </header>

      {meta ? <p className="worker-log-meta">{meta}</p> : null}

      <div className="worker-log-sections">
        <details className="worker-log-section" open={status === "running"}>
          <summary className="worker-log-section-summary">
            <span className="worker-log-chevron" aria-hidden />
            Output
          </summary>
          <div className="worker-log-panel">
            <div className="worker-log-panel-head">
              <WorkerLogCopyButton text={outputText} label="Output" disabled={!canCopyOutput} />
            </div>
            <pre className="worker-log-output">{outputText}</pre>
          </div>
        </details>

        <details className="worker-log-section">
          <summary className="worker-log-section-summary">
            <span className="worker-log-chevron" aria-hidden />
            Inference
            {hasInference ? null : <span className="worker-log-section-hint">(pending)</span>}
          </summary>
          <div className="worker-log-panel">
            <InferenceLogSection
              inference={inference}
              messages={messages}
              fallbackModel={model}
              embedded
            />
          </div>
        </details>

        <details className="worker-log-section">
          <summary className="worker-log-section-summary">
            <span className="worker-log-chevron" aria-hidden />
            {contextSummaryLabel(contextInput)}
          </summary>
          <div className="worker-log-panel">
            <WorkerContextSection context={contextInput} embedded />
          </div>
        </details>
      </div>

      <style jsx>{`
        .worker-log {
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          overflow: hidden;
          min-width: 0;
        }
        .worker-log--running {
          border-color: var(--app-border-strong);
        }
        .worker-log-head {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.5rem;
          background: var(--app-surface-muted);
          border-bottom: 1px solid var(--app-border);
        }
        .worker-log-step {
          font-size: 0.5625rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: var(--app-text-faint);
          min-width: 1rem;
        }
        .worker-log-kind {
          font-size: 0.5rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--app-text-faint);
          padding: 0.05rem 0.25rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-pill);
          background: var(--app-surface);
        }
        .worker-log-name {
          flex: 1;
          min-width: 0;
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--app-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .worker-log-dur {
          font-size: 0.5625rem;
          color: var(--app-text-faint);
          font-variant-numeric: tabular-nums;
          flex-shrink: 0;
        }
        .worker-log-dur--live {
          color: var(--app-text-muted);
          font-style: italic;
        }
        .worker-log-meta {
          margin: 0;
          padding: 0.2rem 0.5rem;
          font-size: 0.5625rem;
          color: var(--app-text-faint);
          border-bottom: 1px solid var(--app-border);
          background: var(--app-bg);
        }
        .worker-log-sections {
          display: flex;
          flex-direction: column;
        }
        .worker-log-section {
          border-top: 1px solid var(--app-border);
        }
        .worker-log-section:first-child {
          border-top: none;
        }
        .worker-log-section-summary {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.5rem;
          font-size: 0.5625rem;
          font-weight: 500;
          color: var(--app-text-muted);
          cursor: pointer;
          list-style: none;
          background: var(--app-bg);
          user-select: none;
        }
        .worker-log-section-summary::-webkit-details-marker {
          display: none;
        }
        .worker-log-section-summary:hover {
          color: var(--app-text);
          background: var(--app-surface-muted);
        }
        .worker-log-chevron {
          flex-shrink: 0;
          width: 0;
          height: 0;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          border-left: 4px solid var(--app-text-faint);
          transition: transform 0.12s ease;
        }
        .worker-log-section[open] .worker-log-chevron {
          transform: rotate(90deg);
        }
        .worker-log-section-hint {
          font-weight: 400;
          color: var(--app-text-faint);
          font-style: italic;
        }
        .worker-log-panel {
          padding: 0 0.5rem 0.45rem;
          background: var(--app-bg);
        }
        .worker-log-panel-head {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 0.25rem;
        }
        .worker-log-output {
          margin: 0;
          padding: 0.375rem 0.45rem;
          max-height: 6rem;
          overflow: auto;
          font-size: 0.5625rem;
          line-height: 1.45;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: #5a6478;
          white-space: pre-wrap;
          word-break: break-word;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface-muted);
        }
        .worker-log--running .worker-log-output {
          color: #3d4656;
        }
      `}</style>
    </article>
  )
}
