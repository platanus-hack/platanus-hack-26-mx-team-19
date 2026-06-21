"use client"

import { useEffect, useState } from "react"

const TRIGGER_KEY_RE = /^[a-z][a-z0-9_]*$/

function parseTriggersText(raw: string): string[] {
  const tokens = raw
    .split(/[\n,]+/)
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, "_"))
    .filter(Boolean)

  const unique: string[] = []
  for (const token of tokens) {
    if (TRIGGER_KEY_RE.test(token) && !unique.includes(token)) {
      unique.push(token)
    }
  }
  return unique
}

function formatTriggersText(triggers: string[]): string {
  return triggers.join(", ")
}

type Props = {
  triggers: string[]
  disabled?: boolean
  onSave: (triggers: string[]) => Promise<void>
  /** Compact row layout for the swarm editor header. */
  layout?: "stacked" | "inline"
}

/** Comma-separated routing tags shown in `runInput.agentsAvailables`. */
export default function SwarmTriggersField({
  triggers,
  disabled = false,
  onSave,
  layout = "stacked",
}: Props) {
  const [draft, setDraft] = useState(() => formatTriggersText(triggers))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(formatTriggersText(triggers))
  }, [triggers])

  const commit = async () => {
    const next = parseTriggersText(draft)
    const current = formatTriggersText(triggers)
    if (formatTriggersText(next) === current) return

    setSaving(true)
    try {
      await onSave(next)
    } finally {
      setSaving(false)
    }
  }

  const inline = layout === "inline"

  return (
    <label
      className={`triggers${inline ? " triggers--inline" : ""}`}
      title="Lowercase snake_case — used in hired-agent catalogs and routing."
    >
      <span className="label">Routing triggers</span>
      <input
        className="input"
        value={draft}
        disabled={disabled || saving}
        placeholder="contact_lookup, send_message"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            void commit()
          }
        }}
      />
      {inline ? null : (
        <span className="hint">Lowercase snake_case — used in hired-agent catalogs and routing.</span>
      )}
      <style jsx>{`
        .triggers {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin-top: 0.35rem;
        }
        .triggers--inline {
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0;
        }
        .label {
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--app-text-muted);
          white-space: nowrap;
        }
        .triggers--inline .label {
          font-size: 0.6875rem;
          letter-spacing: 0;
          text-transform: none;
          font-weight: 500;
          color: var(--app-text-faint);
        }
        .input {
          width: 100%;
          max-width: 28rem;
          font-size: 0.75rem;
          padding: 0.3rem 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          color: var(--app-text);
          font-family: var(--app-font-mono, ui-monospace, monospace);
        }
        .triggers--inline .input {
          width: 13rem;
          max-width: none;
          font-size: 0.6875rem;
          padding: 0.3rem 0.45rem;
        }
        .hint {
          font-size: 0.625rem;
          color: var(--app-text-muted);
        }
      `}</style>
    </label>
  )
}
