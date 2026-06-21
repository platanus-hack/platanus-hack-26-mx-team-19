"use client"

import type { StartNodeData } from "./data"
import VariableListSection from "./VariableListSection"

type Props = {
  data: StartNodeData
  onChange: (data: StartNodeData) => void
}

/** Start node configuration: workflow inputs + initial state variables. */
export default function StartConfigForm({ data, onChange }: Props) {
  return (
    <div className="form">
      <p className="hint">
        Agents wired from Start receive these values as <code>{"{{runInput.name}}"}</code>. Connect
        multiple agents to run the first wave in parallel — no entry badge on agents.
      </p>
      <VariableListSection
        title="Input variables"
        variables={data.inputVariables}
        allowEmpty={false}
        onChange={(inputVariables) => onChange({ ...data, inputVariables })}
      />
      <VariableListSection
        title="State variables"
        variables={data.stateVariables}
        onChange={(stateVariables) => onChange({ ...data, stateVariables })}
      />

      <style jsx>{`
        .form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .hint {
          margin: 0;
          font-size: 0.6875rem;
          line-height: 1.45;
          color: var(--app-text-muted);
        }
        .hint :global(code) {
          font-size: 0.625rem;
          padding: 0.1rem 0.25rem;
          border-radius: 3px;
          background: var(--app-surface-muted, rgba(0, 0, 0, 0.04));
        }
      `}</style>
    </div>
  )
}
