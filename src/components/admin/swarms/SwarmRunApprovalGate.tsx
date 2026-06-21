"use client"

import { useMemo, useState } from "react"
import {
  TbChevronDown,
  TbChevronRight,
  TbClockPause,
  TbThumbDown,
  TbThumbUp,
} from "react-icons/tb"
import type { SwarmRunApproval } from "@/data/api/server/swarms"

type Props = {
  approval: SwarmRunApproval
  onDecide: (decision: "approve" | "reject", comment?: string) => void
  disabled?: boolean
}

function formatPassthroughPreview(passthrough: Record<string, unknown>): string | null {
  const keys = Object.keys(passthrough)
  if (keys.length === 0) return null

  const result = passthrough.result
  if (typeof result === "string" && result.trim()) {
    return result
  }

  try {
    return JSON.stringify(passthrough, null, 2)
  } catch {
    return String(passthrough)
  }
}

/** Human gate shown in Test Swarm when a run pauses at a user approval node. */
export default function SwarmRunApprovalGate({ approval, onDecide, disabled = false }: Props) {
  const [comment, setComment] = useState("")
  const [contextOpen, setContextOpen] = useState(true)

  const contextPreview = useMemo(
    () => formatPassthroughPreview(approval.passthrough ?? {}),
    [approval.passthrough],
  )
  const hasContext = Boolean(contextPreview?.trim())

  const decide = (decision: "approve" | "reject") => {
    if (disabled) return
    onDecide(decision, comment.trim() || undefined)
  }

  return (
    <section
      className={`gate${disabled ? " gate--busy" : ""}`}
      aria-label="User approval required"
      aria-busy={disabled}
    >
      <header className="gate-banner">
        <span className="gate-badge">
          {!disabled ? <span className="gate-badge-dot" aria-hidden /> : null}
          {disabled ? "Submitting decision…" : "Awaiting approval"}
        </span>
        <span className="gate-node-id" title="Approval node">
          {approval.nodeId}
        </span>
      </header>

      <div className="gate-body">
        <div className="gate-head">
          <span className="gate-icon" aria-hidden>
            <TbClockPause size={18} />
          </span>
          <div className="gate-text">
            <h3 className="gate-title">{approval.name || "User approval"}</h3>
            <p className="gate-message">
              {approval.message?.trim() || "Review the context below, then approve or reject to continue."}
            </p>
          </div>
        </div>

        {hasContext ? (
          <div className="gate-context">
            <button
              type="button"
              className="gate-context-toggle"
              onClick={() => setContextOpen((open) => !open)}
              aria-expanded={contextOpen}
            >
              {contextOpen ? (
                <TbChevronDown size={13} aria-hidden />
              ) : (
                <TbChevronRight size={13} aria-hidden />
              )}
              <span>Upstream output</span>
            </button>
            {contextOpen ? (
              <pre className="gate-context-body">{contextPreview}</pre>
            ) : null}
          </div>
        ) : null}

        <label className="comment-field">
          <span>Comment (optional)</span>
          <textarea
            rows={2}
            placeholder="Add context for your decision…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={disabled}
          />
        </label>

        <div className="actions">
          <button
            type="button"
            className="btn btn--approve"
            disabled={disabled}
            onClick={() => decide("approve")}
          >
            <TbThumbUp size={15} aria-hidden />
            Approve
          </button>
          <button
            type="button"
            className="btn btn--reject"
            disabled={disabled}
            onClick={() => decide("reject")}
          >
            <TbThumbDown size={15} aria-hidden />
            Reject
          </button>
        </div>

        <p className="gate-hint">
          Approve follows the <strong>Approve</strong> branch; reject follows <strong>Reject</strong>.
        </p>
      </div>

      <style jsx>{`
        .gate {
          flex-shrink: 0;
          border: 1px solid #fdba74;
          border-radius: var(--app-radius);
          background: var(--app-surface);
          overflow: hidden;
          box-shadow: var(--app-shadow-sm);
        }
        .gate--busy {
          opacity: 0.88;
          pointer-events: none;
        }
        .gate-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.4rem 0.55rem;
          background: color-mix(in srgb, #ea580c 12%, var(--app-surface-muted));
          border-bottom: 1px solid #fdba74;
        }
        .gate-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9a3412;
        }
        .gate-badge-dot {
          width: 0.4375rem;
          height: 0.4375rem;
          border-radius: 50%;
          background: #ea580c;
          flex-shrink: 0;
          animation: gate-pulse 1.4s ease-in-out infinite;
        }
        @keyframes gate-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.85);
          }
        }
        .gate-node-id {
          font-size: 0.5625rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: var(--app-text-faint);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 8rem;
        }
        .gate-body {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          padding: 0.6rem 0.65rem 0.65rem;
        }
        .gate-head {
          display: flex;
          gap: 0.55rem;
          align-items: flex-start;
        }
        .gate-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: var(--app-radius);
          background: #ea580c;
          color: #fff7ed;
          flex-shrink: 0;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }
        .gate-text {
          min-width: 0;
          padding-top: 0.05rem;
        }
        .gate-title {
          margin: 0;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: var(--app-tracking-tight);
          color: var(--app-text);
        }
        .gate-message {
          margin: 0.25rem 0 0;
          font-size: 0.6875rem;
          line-height: 1.5;
          color: var(--app-text-muted);
        }
        .gate-context {
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          overflow: hidden;
        }
        .gate-context-toggle {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          width: 100%;
          padding: 0.35rem 0.45rem;
          border: none;
          border-bottom: 1px solid var(--app-border);
          background: var(--app-surface-muted);
          font-family: var(--app-font);
          font-size: 0.625rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--app-text-muted);
          cursor: pointer;
          text-align: left;
        }
        .gate-context-toggle:hover {
          color: var(--app-text);
          background: var(--app-surface);
        }
        .gate-context-body {
          margin: 0;
          padding: 0.45rem 0.5rem;
          max-height: 7.5rem;
          overflow: auto;
          font-size: 0.625rem;
          line-height: 1.45;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: #3d4656;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .comment-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.625rem;
          color: var(--app-text-faint);
        }
        .comment-field textarea {
          font-size: 0.6875rem;
          font-family: var(--app-font);
          padding: 0.45rem 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          color: var(--app-text);
          resize: vertical;
          min-height: 2.75rem;
        }
        .comment-field textarea:focus {
          outline: none;
          border-color: #fdba74;
          box-shadow: 0 0 0 2px color-mix(in srgb, #ea580c 18%, transparent);
        }
        .comment-field textarea:disabled {
          opacity: 0.65;
        }
        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.45rem;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.5rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--app-font);
          border-radius: var(--app-radius);
          border: 1px solid transparent;
          cursor: pointer;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .btn--approve {
          background: var(--app-success);
          border-color: #15803d;
          color: #fff;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }
        .btn--approve:hover:not(:disabled) {
          background: #15803d;
        }
        .btn--reject {
          background: var(--app-danger-bg);
          border-color: var(--app-danger-border);
          color: var(--app-danger);
        }
        .btn--reject:hover:not(:disabled) {
          background: #fee2e2;
          border-color: #fca5a5;
        }
        .gate-hint {
          margin: 0;
          font-size: 0.5625rem;
          line-height: 1.45;
          color: var(--app-text-faint);
        }
        .gate-hint :global(strong) {
          font-weight: 600;
          color: var(--app-text-muted);
        }
        @media (prefers-reduced-motion: reduce) {
          .gate-badge-dot {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
