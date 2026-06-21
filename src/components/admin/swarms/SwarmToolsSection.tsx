"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { TbPlus, TbStack2, TbX } from "react-icons/tb"
import type { ReferencedSwarmSummary } from "@/data/api/server"
import { swarmToolFunctionName } from "@/lib/swarm-tool-utils"

type Props = {
  swarmTools: string[]
  pickerSwarms: ReferencedSwarmSummary[]
  currentSwarmId: string | null
  onSwarmToolsChange: (next: string[]) => void
  /** Swarm tools require `openai_direct` on api.openai.com */
  openAiDirect: boolean
  /** Generic `run_swarm` is still in agentTools but omitted at runtime. */
  runSwarmInactive?: boolean
  /** Nested under the main Tools list (same content width). */
  nested?: boolean
}

export default function SwarmToolsSection({
  swarmTools,
  pickerSwarms,
  currentSwarmId,
  onSwarmToolsChange,
  openAiDirect,
  runSwarmInactive = false,
  nested = false,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const swarmById = useMemo(
    () => new Map(pickerSwarms.map((row) => [row.id, row])),
    [pickerSwarms],
  )

  const availableSwarms = useMemo(() => {
    const selected = new Set(swarmTools)
    return pickerSwarms
      .filter((row) => row.id !== currentSwarmId && !selected.has(row.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [currentSwarmId, pickerSwarms, swarmTools])

  const canAddAny = openAiDirect && availableSwarms.length > 0

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [menuOpen])

  const addSwarmTool = (swarmId: string) => {
    if (swarmTools.includes(swarmId)) return
    onSwarmToolsChange([...swarmTools, swarmId])
    setMenuOpen(false)
  }

  const removeSwarmTool = (swarmId: string) => {
    onSwarmToolsChange(swarmTools.filter((id) => id !== swarmId))
  }

  return (
    <div
      className={nested ? "tools-subsection" : "tools"}
      ref={rootRef}
      aria-label="Sub-swarm tools"
    >
      <div className={nested ? "tools-sub-head" : "tools-head"}>
        <span className={nested ? "tools-sub-label" : "tools-label"}>Sub-swarms</span>
        <button
          type="button"
          className="tools-add"
          aria-label="Add sub-swarm tool"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          disabled={!canAddAny}
          title={
            !openAiDirect
              ? "Swarm tools require OpenAI Direct (api.openai.com)"
              : !canAddAny
                ? "All available swarms are already enabled"
                : "Add a sub-swarm tool"
          }
          onClick={() => setMenuOpen((open) => !open)}
        >
          <TbPlus size={14} aria-hidden />
        </button>
      </div>

      {swarmTools.length > 0 ? (
        <ul className="tools-list">
          {swarmTools.map((swarmId) => {
            const row = swarmById.get(swarmId)
            const label = row?.name ?? swarmId
            return (
              <li key={swarmId} className="tool-row">
                <span className="tool-icon" aria-hidden>
                  <TbStack2 size={14} />
                </span>
                <div className="tool-meta">
                  <span className="tool-name">{label}</span>
                  <span className="tool-desc">
                    Function · <code>{swarmToolFunctionName(swarmId)}</code>
                    {row && !row.canRun ? " · may not be runnable" : ""}
                  </span>
                </div>
                <button
                  type="button"
                  className="tool-remove"
                  aria-label={`Remove sub-swarm tool ${label}`}
                  onClick={() => removeSwarmTool(swarmId)}
                >
                  <TbX size={14} aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="tools-empty">
          {openAiDirect
            ? "No sub-swarms — use + to let the model call specific child swarms."
            : "Sub-swarm tools are available when the model provider is OpenAI Direct."}
        </p>
      )}

      <p className="tools-hint">
        {nested
          ? runSwarmInactive
            ? "Each sub-swarm gets its own function at inference time. Generic run_swarm is skipped when sub-swarms are listed."
            : "Each sub-swarm gets its own function (swarm_<id>). Prefer this over generic run_swarm when you know which swarms to call."
          : "Each id becomes an OpenAI function at inference time. When sub-swarms are listed, generic run_swarm is not exposed."}
      </p>

      {menuOpen && canAddAny ? (
        <div className="tools-menu" role="menu" aria-label="Add sub-swarm tool">
          {availableSwarms.map((row) => (
            <button
              key={row.id}
              type="button"
              className="menu-item"
              role="menuitem"
              onClick={() => addSwarmTool(row.id)}
            >
              <span className="menu-icon" aria-hidden>
                <TbStack2 size={14} />
              </span>
              <span className="menu-label">
                {row.name}
                {!row.active ? " (inactive)" : ""}
                {row.platformRunnable ? " · platform" : ""}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <style jsx>{`
        .tools,
        .tools-subsection {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .tools-subsection {
          margin: 0.25rem 0 0 6rem;
          padding: 0;
        }
        .tools-head {
          display: grid;
          grid-template-columns: 5.5rem 1fr;
          align-items: center;
          gap: 0.5rem;
        }
        .tools-sub-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .tools-label,
        .tools-sub-label {
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }
        .tools-sub-label {
          font-size: 0.6875rem;
          font-weight: 500;
        }
        .tools-add {
          justify-self: end;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          padding: 0;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          color: var(--app-text-muted);
          cursor: pointer;
        }
        .tools-add:hover:not(:disabled) {
          color: var(--app-text);
          border-color: var(--app-border-strong);
        }
        .tools-add:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .tools-empty {
          margin: 0;
          padding-left: 6rem;
          font-size: 0.625rem;
          color: var(--app-text-faint);
          line-height: 1.4;
        }
        .tools-subsection .tools-empty {
          padding-left: 0;
        }
        .tools-hint {
          margin: 0;
          padding-left: 6rem;
          font-size: 0.5625rem;
          color: var(--app-text-faint);
          line-height: 1.45;
        }
        .tools-subsection .tools-hint {
          padding-left: 0;
        }
        .tools-hint code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.5625rem;
        }
        .tools-list {
          list-style: none;
          margin: 0;
          padding: 0 0 0 6rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .tools-subsection .tools-list {
          padding-left: 0;
        }
        .tool-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
        }
        .tool-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: var(--app-radius);
          background: var(--app-surface-muted);
          color: var(--app-text-muted);
          flex-shrink: 0;
        }
        .tool-meta {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.05rem;
        }
        .tool-name {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--app-text);
        }
        .tool-desc {
          font-size: 0.5625rem;
          color: var(--app-text-faint);
        }
        .tool-desc code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .tool-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.375rem;
          height: 1.375rem;
          padding: 0;
          border: none;
          border-radius: var(--app-radius);
          background: transparent;
          color: var(--app-text-faint);
          cursor: pointer;
        }
        .tool-remove:hover {
          color: var(--app-text);
          background: var(--app-surface-muted);
        }
        .tools-menu {
          position: absolute;
          top: 1.75rem;
          right: 0;
          z-index: 30;
          min-width: 12rem;
          max-height: 14rem;
          overflow-y: auto;
          padding: 0.35rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          width: 100%;
          padding: 0.4rem 0.45rem;
          border: none;
          border-radius: calc(var(--app-radius) - 2px);
          background: transparent;
          font-size: 0.75rem;
          color: var(--app-text);
          cursor: pointer;
          text-align: left;
          font-family: var(--app-font);
        }
        .menu-item:hover {
          background: var(--app-surface-muted);
        }
        .menu-icon {
          display: flex;
          color: var(--app-text-muted);
          flex-shrink: 0;
        }
        .menu-label {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
