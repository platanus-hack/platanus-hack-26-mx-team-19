"use client"

import { useMemo } from "react"
import type { AdminAgentWorker, SwarmGraph } from "@/data/api/server"
import { buildEndOutputFieldOptions, buildReferencedSwarmLookup } from "@/lib/swarm-graph-vars"
import { useSwarmEditor } from "../../SwarmEditorContext"
import EndOutputFieldBuilder from "./EndOutputFieldBuilder"
import { normalizeEndFields, type EndNodeData } from "./data"

type Props = {
  data: EndNodeData
  onChange: (data: EndNodeData) => void
  nodeId: string
  graph: SwarmGraph | null
  workerById: Record<string, AdminAgentWorker>
}

/** End node fields — mount inside {@link EndConfigPanel}. */
export default function EndConfigForm({ data, onChange, nodeId, graph, workerById }: Props) {
  const fields = useMemo(() => normalizeEndFields(data.fields ?? []), [data.fields])
  const { pickerSwarms } = useSwarmEditor()
  const referencedSwarmById = useMemo(
    () => buildReferencedSwarmLookup(pickerSwarms),
    [pickerSwarms],
  )
  const variableOptions = useMemo(
    () => buildEndOutputFieldOptions(nodeId, graph, workerById, referencedSwarmById),
    [nodeId, graph, workerById, referencedSwarmById],
  )

  const patch = (partial: Partial<EndNodeData>) => {
    onChange({ ...data, ...partial })
  }

  return (
    <div className="form">
      <label className="field">
        <span className="field-label">Label</span>
        <input
          className="field-control"
          type="text"
          placeholder="Optional"
          value={data.label ?? ""}
          onChange={(e) => patch({ label: e.target.value })}
        />
      </label>

      <section className="output-section">
        <h3 className="section-title">Output</h3>
        <p className="hint">
          Pick a variable to add it (JSON key defaults to the variable name — edit if needed). Use
          Add Local Context for workflow variables or Add Global Context for company and department
          runInput paths.
        </p>

        <EndOutputFieldBuilder
          fields={fields}
          onChange={(next) => patch({ fields: next })}
          variableOptions={variableOptions}
        />

        {variableOptions.length === 0 ? (
          <p className="hint hint--warn">
            Connect upstream nodes into End to populate variables.
          </p>
        ) : null}
      </section>

      <style jsx>{`
        .form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .field {
          display: grid;
          grid-template-columns: 5.5rem 1fr;
          align-items: start;
          gap: 0.5rem;
          font-size: 0.75rem;
        }
        .field-label {
          color: var(--app-text-muted);
          padding-top: 0.35rem;
        }
        .field-control {
          width: 100%;
          box-sizing: border-box;
          font-size: 0.75rem;
          padding: 0.4375rem 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          color: var(--app-text);
          font-family: var(--app-font);
        }
        .field-control:focus {
          outline: none;
          border-color: var(--app-border-strong);
          box-shadow: var(--app-btn-focus-ring);
        }
        .output-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--app-border);
        }
        .section-title {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--app-text);
        }
        .hint {
          margin: 0;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
          line-height: 1.45;
        }
        .hint--warn {
          color: var(--app-text-faint);
        }
      `}</style>
    </div>
  )
}
