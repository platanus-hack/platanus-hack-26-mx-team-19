"use client"

import { TbFileText, TbPlus, TbTrash } from "react-icons/tb"
import {
  START_VARIABLE_TYPES,
  createStartVariable,
  type StartVariable,
  type StartVariableType,
} from "./data"

type Props = {
  title: string
  variables: StartVariable[]
  onChange: (variables: StartVariable[]) => void
  /** When false, the last variable cannot be removed (e.g. default run input). */
  allowEmpty?: boolean
  addLabel?: string
}

/** Reusable list editor for input / state variables on the Start node. */
export default function VariableListSection({
  title,
  variables,
  onChange,
  allowEmpty = true,
  addLabel = "Add",
}: Props) {
  const patch = (id: string, partial: Partial<StartVariable>) => {
    onChange(variables.map((v) => (v.id === id ? { ...v, ...partial } : v)))
  }

  const remove = (id: string) => {
    if (!allowEmpty && variables.length <= 1) return
    onChange(variables.filter((v) => v.id !== id))
  }

  const add = () => {
    onChange([...variables, createStartVariable()])
  }

  return (
    <section className="section">
      <div className="section-head">
        <h3 className="section-title">{title}</h3>
        <button type="button" className="add-btn" onClick={add}>
          <TbPlus size={13} aria-hidden />
          <span>{addLabel}</span>
        </button>
      </div>

      {variables.length === 0 ? (
        <p className="empty">No variables defined.</p>
      ) : (
        <ul className="list">
          {variables.map((variable) => (
            <li className="row" key={variable.id}>
              <span className="row-icon" aria-hidden>
                <TbFileText size={14} />
              </span>
              <input
                type="text"
                className="name-input"
                placeholder="variable_name"
                value={variable.name}
                onChange={(e) => patch(variable.id, { name: e.target.value })}
              />
              <select
                className="type-select"
                value={variable.type}
                onChange={(e) =>
                  patch(variable.id, { type: e.target.value as StartVariableType })
                }
                aria-label={`Type for ${variable.name || "variable"}`}
              >
                {START_VARIABLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {allowEmpty || variables.length > 1 ? (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => remove(variable.id)}
                  aria-label="Remove variable"
                >
                  <TbTrash size={13} />
                </button>
              ) : (
                <span className="remove-spacer" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .section-title {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--app-text);
        }
        .add-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.55rem;
          font-size: 0.6875rem;
          font-weight: 500;
          font-family: var(--app-font);
          color: var(--app-text);
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-pill);
          cursor: pointer;
          transition:
            background 0.15s ease,
            border-color 0.15s ease;
        }
        .add-btn:hover {
          background: var(--app-surface-muted);
          border-color: var(--app-border-strong);
        }
        .empty {
          margin: 0;
          font-size: 0.6875rem;
          color: var(--app-text-faint);
        }
        .list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .row {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.4rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface-muted);
        }
        .row-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--app-accent);
        }
        .name-input,
        .type-select {
          font-size: 0.6875rem;
          font-family: var(--app-font);
          padding: 0.3rem 0.4rem;
          border: 1px solid var(--app-border);
          border-radius: calc(var(--app-radius) - 2px);
          background: var(--app-bg);
          color: var(--app-text);
          min-width: 0;
        }
        .name-input {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .type-select {
          width: 5.25rem;
          cursor: pointer;
        }
        .name-input:focus,
        .type-select:focus {
          outline: none;
          border-color: var(--app-border-strong);
          box-shadow: var(--app-btn-focus-ring);
        }
        .remove-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.2rem;
          background: transparent;
          border: none;
          color: var(--app-text-faint);
          cursor: pointer;
          border-radius: var(--app-radius);
        }
        .remove-btn:hover {
          color: #b91c1c;
        }
        .remove-spacer {
          width: 1.35rem;
        }
      `}</style>
    </section>
  )
}
