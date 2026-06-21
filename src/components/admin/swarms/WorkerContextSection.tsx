"use client"

import { useMemo } from "react"
import type { InferenceRequestPayload } from "@/data/api/server/swarms"
import {
  buildUsedWorkerContext,
  summarizeWorkerContext,
  type WorkerContextEntry,
  type WorkerContextUpstreamEntry,
} from "@/lib/worker-context-usage"

export { summarizeWorkerContext } from "@/lib/worker-context-usage"

type Props = {
  context?: InferenceRequestPayload
  embedded?: boolean
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function previewValue(value: unknown, max = 56): string {
  if (value === undefined) return "(unresolved)"
  if (value == null) return "—"
  if (typeof value === "string") {
    const flat = value.replace(/\s+/g, " ").trim()
    if (!flat) return "(empty)"
    return flat.length <= max ? flat : `${flat.slice(0, max)}…`
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  const json = formatJson(value).replace(/\s+/g, " ")
  if (json.length <= max) return json
  return `${json.slice(0, max)}…`
}

function ContextValueRow({ entry }: { entry: WorkerContextEntry | WorkerContextUpstreamEntry }) {
  const full = useMemo(() => formatJson(entry.value), [entry.value])
  const preview = previewValue(entry.value)
  const isUnresolved = entry.value === undefined

  return (
    <li className="ctx-row">
      <details className="ctx-row-details">
        <summary className="ctx-row-head">
          <span className="ctx-chevron" aria-hidden />
          <code className="ctx-key">{entry.label}</code>
          <span className={`ctx-preview${isUnresolved ? " ctx-preview--warn" : ""}`}>
            {preview}
          </span>
        </summary>
        <pre className="ctx-body">{full}</pre>
      </details>
      <style jsx>{`
        .ctx-row {
          list-style: none;
        }
        .ctx-row-details {
          border-top: 1px solid var(--app-border);
        }
        .ctx-row-head {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
          padding: 0.25rem 0.45rem;
          cursor: pointer;
          list-style: none;
          font-size: 0.5625rem;
          background: var(--app-surface);
        }
        .ctx-row-head::-webkit-details-marker {
          display: none;
        }
        .ctx-row-head:hover {
          background: var(--app-surface-muted);
        }
        .ctx-chevron {
          flex-shrink: 0;
          width: 0;
          height: 0;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          border-left: 3px solid var(--app-text-faint);
          transition: transform 0.12s ease;
          align-self: center;
        }
        .ctx-row-details[open] .ctx-chevron {
          transform: rotate(90deg);
        }
        .ctx-key {
          flex-shrink: 0;
          font-size: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: var(--app-text-muted);
          background: transparent;
        }
        .ctx-preview {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--app-text-faint);
        }
        .ctx-preview--warn {
          color: #b45309;
          font-style: italic;
        }
        .ctx-body {
          margin: 0;
          padding: 0.35rem 0.45rem 0.45rem;
          max-height: 7rem;
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
    </li>
  )
}

export default function WorkerContextSection({ context, embedded = false }: Props) {
  const used = useMemo(() => buildUsedWorkerContext(context), [context])

  if (!context) {
    return (
      <>
        <p className="ctx-empty">(context snapshot not available)</p>
        <style jsx>{`
          .ctx-empty {
            margin: 0;
            font-size: 0.5625rem;
            color: var(--app-text-faint);
            font-style: italic;
          }
        `}</style>
      </>
    )
  }

  if (!used.hasData) {
    return (
      <>
        <p className="ctx-empty">(no context tokens in instructions)</p>
        <style jsx>{`
          .ctx-empty {
            margin: 0;
            font-size: 0.5625rem;
            color: var(--app-text-faint);
            font-style: italic;
          }
        `}</style>
      </>
    )
  }

  return (
    <div className={`ctx-log${embedded ? " ctx-log--embedded" : ""}`}>
      <p className="ctx-hint">Tokens referenced in instructions</p>
      <div className="ctx-groups">
        {used.globalEntries.length > 0 ? (
          <details className="ctx-group" open={used.globalEntries.length <= 4}>
            <summary className="ctx-group-summary">
              <span className="ctx-chevron" aria-hidden />
              Global
              <span className="ctx-group-count">{used.globalCount}</span>
            </summary>
            <ul className="ctx-list">
              {used.globalEntries.map((entry) => (
                <ContextValueRow key={entry.key} entry={entry} />
              ))}
            </ul>
          </details>
        ) : null}

        {used.localEntries.length > 0 ? (
          <details className="ctx-group" open={used.localEntries.length <= 2}>
            <summary className="ctx-group-summary">
              <span className="ctx-chevron" aria-hidden />
              Local
              <span className="ctx-group-count">{used.localCount}</span>
            </summary>
            <ul className="ctx-list">
              {used.localEntries.map((entry) => (
                <ContextValueRow key={entry.key} entry={entry} />
              ))}
            </ul>
          </details>
        ) : null}
      </div>

      <style jsx>{`
        .ctx-log {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
        }
        .ctx-log--embedded {
          gap: 0.3rem;
        }
        .ctx-hint {
          margin: 0;
          font-size: 0.5rem;
          color: var(--app-text-faint);
          letter-spacing: 0.02em;
        }
        .ctx-empty {
          margin: 0;
          font-size: 0.5625rem;
          color: var(--app-text-faint);
          font-style: italic;
        }
        .ctx-groups {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .ctx-group {
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          overflow: hidden;
        }
        .ctx-group-summary {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.45rem;
          font-size: 0.5625rem;
          font-weight: 600;
          color: var(--app-text);
          cursor: pointer;
          list-style: none;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          background: var(--app-surface-muted);
          user-select: none;
        }
        .ctx-group-summary::-webkit-details-marker {
          display: none;
        }
        .ctx-group-summary:hover {
          background: var(--app-surface);
        }
        .ctx-chevron {
          flex-shrink: 0;
          width: 0;
          height: 0;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          border-left: 3px solid var(--app-text-faint);
          transition: transform 0.12s ease;
        }
        .ctx-group[open] .ctx-group-summary .ctx-chevron {
          transform: rotate(90deg);
        }
        .ctx-group-count {
          margin-left: auto;
          font-size: 0.5rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: var(--app-text-faint);
          padding: 0.05rem 0.3rem;
          border-radius: var(--app-radius-pill);
          border: 1px solid var(--app-border);
          background: var(--app-surface);
          text-transform: none;
          letter-spacing: normal;
        }
        .ctx-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  )
}
