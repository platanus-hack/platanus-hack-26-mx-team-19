"use client"

import type { UserApprovalAssignee, UserApprovalNodeData } from "./data"

type Props = {
  data: UserApprovalNodeData
  onChange: (data: UserApprovalNodeData) => void
}

const ASSIGNEE_OPTIONS: { value: UserApprovalAssignee; label: string }[] = [
  { value: "runner", label: "Run trigger (default)" },
  { value: "owner", label: "Swarm owner" },
]

export default function UserApprovalConfigForm({ data, onChange }: Props) {
  const patch = (partial: Partial<UserApprovalNodeData>) => {
    onChange({ ...data, ...partial })
  }

  return (
    <div className="form">
      <label className="field">
        <span className="field-label">Name</span>
        <input
          className="field-control"
          type="text"
          placeholder="User approval"
          value={data.name ?? ""}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </label>

      <label className="field field--stack">
        <span className="field-label">Message</span>
        <textarea
          className="field-control field-control--area"
          rows={4}
          placeholder="Describe the message to show the user. E.g. ok to proceed?"
          value={data.message ?? ""}
          onChange={(e) => patch({ message: e.target.value })}
        />
      </label>

      <label className="field">
        <span className="field-label">Assignee</span>
        <select
          className="field-control"
          value={data.assignee ?? "runner"}
          onChange={(e) => patch({ assignee: e.target.value as UserApprovalAssignee })}
        >
          {ASSIGNEE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <style jsx>{`
        .form {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
        }
        .field--stack {
          flex: 1;
        }
        .field-label {
          font-weight: 500;
          color: var(--app-text);
        }
        .field-control {
          font-size: 0.6875rem;
          font-family: var(--app-font);
          padding: 0.4rem 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          color: var(--app-text);
        }
        .field-control--area {
          resize: vertical;
          min-height: 4.5rem;
          line-height: 1.45;
        }
        .field-control:focus {
          outline: none;
          border-color: var(--app-border-strong);
          box-shadow: var(--app-btn-focus-ring);
        }
      `}</style>
    </div>
  )
}
