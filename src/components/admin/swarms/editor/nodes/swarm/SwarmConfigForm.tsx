"use client"

import { useMemo } from "react"
import type { AdminAgentWorker, ReferencedSwarmSummary, SwarmGraph } from "@/data/api/server"
import {
  buildEndOutputFieldOptions,
  buildReferencedSwarmLookup,
} from "@/lib/swarm-graph-vars"
import { useSwarmEditor } from "../../SwarmEditorContext"
import type { SwarmInputField, SwarmNodeData } from "./data"
import SwarmInputFieldBuilder from "./SwarmInputFieldBuilder"

type Props = {
  data: SwarmNodeData
  onChange: (data: SwarmNodeData) => void
  nodeId: string
  graph: SwarmGraph | null
  workerById: Record<string, AdminAgentWorker>
}

function normalizeInputFields(data: SwarmNodeData): SwarmInputField[] {
  const rows = data.inputFields ?? []
  return rows.map((row) => ({
    id: row.id || `swarm-in-${Math.random().toString(36).slice(2, 9)}`,
    key: row.key ?? "",
    source: row.source ?? "upstream",
    valuePath: row.valuePath,
    staticValue: row.staticValue,
  }))
}

/** Sub-swarm fields — mount inside {@link SwarmConfigPanel}. */
export default function SwarmConfigForm({ data, onChange, nodeId, graph, workerById }: Props) {
  const { pickerSwarms, currentSwarmId } = useSwarmEditor()
  const referencedSwarmById = useMemo(
    () => buildReferencedSwarmLookup(pickerSwarms),
    [pickerSwarms],
  )
  const variableOptions = useMemo(
    () => buildEndOutputFieldOptions(nodeId, graph, workerById, referencedSwarmById),
    [nodeId, graph, workerById, referencedSwarmById],
  )

  const selectedSwarm: ReferencedSwarmSummary | undefined = useMemo(() => {
    if (!data.swarmId) return undefined
    return pickerSwarms.find((row) => row.id === data.swarmId)
  }, [data.swarmId, pickerSwarms])

  const sortedPicker = useMemo(
    () => [...pickerSwarms].sort((a, b) => a.name.localeCompare(b.name)),
    [pickerSwarms],
  )

  const patch = (partial: Partial<SwarmNodeData>) => {
    onChange({ ...data, ...partial })
  }

  const inputFields = normalizeInputFields(data)
  const outputKeys =
    selectedSwarm?.outputs && selectedSwarm.outputs.length > 0
      ? selectedSwarm.outputs
      : null

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

      <label className="field field--stack">
        <span className="field-label">Swarm</span>
        <select
          className="field-control"
          value={data.swarmId ?? ""}
          onChange={(e) => patch({ swarmId: e.target.value || undefined })}
        >
          <option value="">Select a swarm…</option>
          {sortedPicker.map((row) => (
            <option key={row.id} value={row.id} disabled={row.id === currentSwarmId}>
              {row.name}
              {!row.active ? " (inactive)" : ""}
              {row.platformRunnable ? " · platform" : ""}
            </option>
          ))}
        </select>
        {data.swarmId && selectedSwarm && !selectedSwarm.canRun ? (
          <span className="field-hint field-hint--warn">
            You may not be able to run this swarm — hire it or mark it platform-runnable.
          </span>
        ) : null}
      </label>

      <label className="toggle">
        <input
          type="checkbox"
          checked={data.passShared === true}
          onChange={(e) => patch({ passShared: e.target.checked })}
        />
        <span>Pass shared state into child swarm</span>
      </label>

      {selectedSwarm ? (
        <SwarmInputFieldBuilder
          fields={inputFields}
          onChange={(next) => patch({ inputFields: next })}
          childInputKeys={selectedSwarm.inputs}
          variableOptions={variableOptions}
        />
      ) : (
        <p className="pick-hint">Select a child swarm to configure input mapping.</p>
      )}

      {selectedSwarm ? (
        <section className="outputs">
          <h3 className="section-title">Available downstream outputs</h3>
          <p className="field-hint">
            On the <strong>Success</strong> branch, connected workers receive the child End output.
            Insert tokens via Add Local Context in Instructions, or copy:
          </p>
          {outputKeys ? (
            <ul className="token-list">
              {outputKeys.map((key) => (
                <li key={key} className="token-row">
                  <code>{`{{upstream.swarm.${key}}}`}</code>
                  <span className="token-or">or</span>
                  <code>{`{{${key}}}`}</code>
                  <span className="token-label">{key}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="field-hint">
              This child swarm has no End output keys declared — use <code>{`{{upstream}}`}</code>{" "}
              for the full JSON payload.
            </p>
          )}
        </section>
      ) : null}

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
        .field--stack {
          grid-template-columns: 1fr;
          gap: 0.35rem;
        }
        .field-label {
          color: var(--app-text-muted);
          padding-top: 0.35rem;
        }
        .field--stack .field-label {
          padding-top: 0;
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
        .field-hint {
          font-size: 0.625rem;
          color: var(--app-text-faint);
          line-height: 1.4;
        }
        .field-hint :global(strong) {
          font-weight: 600;
          color: var(--app-text-muted);
        }
        .field-hint--warn {
          color: color-mix(in srgb, var(--app-text) 70%, orange);
        }
        .field-hint code,
        .token-row code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.5625rem;
        }
        .pick-hint {
          margin: 0;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
        }
        .toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--app-text-muted);
          cursor: pointer;
        }
        .outputs {
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
        .token-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .token-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface-muted);
          font-size: 0.625rem;
        }
        .token-or {
          color: var(--app-text-faint);
        }
        .token-label {
          margin-left: auto;
          color: var(--app-text-muted);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
