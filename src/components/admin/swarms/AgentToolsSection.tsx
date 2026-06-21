"use client"

import { useEffect, useRef, useState } from "react"
import { TbBrowser, TbPlus, TbStack2, TbWorld, TbX } from "react-icons/tb"
import type { ReferencedSwarmSummary } from "@/data/api/server"
import type { AgentToolCatalogEntry, AgentToolId } from "@/lib/agent-tools"
import { isAgentToolId, shouldExposeRunSwarmTool } from "@/lib/agent-tools"
import type { OpenAiWorkerToolsConfig } from "@/lib/openai-worker-tools"
import SwarmToolsSection from "./SwarmToolsSection"

type Props = {
  openaiTools: OpenAiWorkerToolsConfig
  agentTools: AgentToolId[]
  catalog: AgentToolCatalogEntry[]
  onOpenaiToolsChange: (next: OpenAiWorkerToolsConfig) => void
  onAgentToolsChange: (next: AgentToolId[]) => void
  swarmTools?: string[]
  pickerSwarms?: ReferencedSwarmSummary[]
  currentSwarmId?: string | null
  onSwarmToolsChange?: (next: string[]) => void
  /** Web search and platform tools require `openai_direct` on api.openai.com */
  openAiDirect: boolean
}

function toolIcon(id: AgentToolId) {
  if (id === "run_swarm") return TbStack2
  if (id === "webpage_scrape") return TbBrowser
  return TbBrowser
}

export default function AgentToolsSection({
  openaiTools,
  agentTools,
  catalog,
  onOpenaiToolsChange,
  onAgentToolsChange,
  swarmTools = [],
  pickerSwarms = [],
  currentSwarmId = null,
  onSwarmToolsChange,
  openAiDirect,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const webSearchOn = openaiTools.webSearch === true
  const availablePlatformTools = catalog.filter(
    (tool) => tool.configured && !agentTools.includes(tool.id),
  )
  const canAddWebSearch = openAiDirect && !webSearchOn
  const canAddAny = openAiDirect && (canAddWebSearch || availablePlatformTools.length > 0)
  const hasAnyTool = webSearchOn || agentTools.length > 0

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

  const enableWebSearch = () => {
    onOpenaiToolsChange({
      ...openaiTools,
      webSearch: true,
      toolChoice: openaiTools.toolChoice ?? "auto",
      webSearchContextSize: openaiTools.webSearchContextSize ?? "medium",
    })
    setMenuOpen(false)
  }

  const removeWebSearch = () => {
    onOpenaiToolsChange({
      ...openaiTools,
      webSearch: false,
    })
  }

  const enableAgentTool = (id: AgentToolId) => {
    if (agentTools.includes(id)) return
    onAgentToolsChange([...agentTools, id])
    onOpenaiToolsChange({
      ...openaiTools,
      toolChoice: openaiTools.toolChoice ?? "auto",
    })
    setMenuOpen(false)
  }

  const removeAgentTool = (id: AgentToolId) => {
    onAgentToolsChange(agentTools.filter((toolId) => toolId !== id))
  }

  const catalogById = new Map(catalog.map((entry) => [entry.id, entry]))
  const runSwarmInactive =
    agentTools.includes("run_swarm") && !shouldExposeRunSwarmTool(agentTools, swarmTools)

  return (
    <section className="tools" ref={rootRef} aria-label="Agent tools">
      <div className="tools-head">
        <span className="tools-label">Tools</span>
        <button
          type="button"
          className="tools-add"
          aria-label="Add tool"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          disabled={!canAddAny}
          title={
            !openAiDirect
              ? "Tools require OpenAI Direct (api.openai.com)"
              : !canAddAny
                ? "All available tools are already enabled"
                : "Add a tool"
          }
          onClick={() => setMenuOpen((open) => !open)}
        >
          <TbPlus size={14} aria-hidden />
        </button>
      </div>

      {hasAnyTool ? (
        <ul className="tools-list">
          {webSearchOn ? (
            <li className="tool-row">
              <span className="tool-icon" aria-hidden>
                <TbWorld size={14} />
              </span>
              <div className="tool-meta">
                <span className="tool-name">Web search</span>
                <span className="tool-desc">Hosted · OpenAI Responses API</span>
              </div>
              <button
                type="button"
                className="tool-remove"
                aria-label="Remove web search"
                onClick={removeWebSearch}
              >
                <TbX size={14} aria-hidden />
              </button>
            </li>
          ) : null}

          {agentTools.map((toolId) => {
            const entry = catalogById.get(toolId)
            const Icon = toolIcon(toolId)
            const inactiveAtRuntime =
              toolId === "run_swarm" && !shouldExposeRunSwarmTool(agentTools, swarmTools)
            return (
              <li
                key={toolId}
                className={`tool-row${inactiveAtRuntime ? " tool-row--inactive" : ""}`}
              >
                <span className="tool-icon" aria-hidden>
                  <Icon size={14} />
                </span>
                <div className="tool-meta">
                  <span className="tool-name">
                    {entry?.name ?? toolId}
                    {inactiveAtRuntime ? (
                      <span className="tool-badge">Not used at runtime</span>
                    ) : null}
                  </span>
                  <span className="tool-desc">
                    {inactiveAtRuntime
                      ? "Sub-swarms below replace generic run_swarm at runtime — remove this tool if you only need specific swarms."
                      : `Platform · ${entry?.description ?? "Agent tool"}`}
                  </span>
                </div>
                <button
                  type="button"
                  className="tool-remove"
                  aria-label={`Remove ${entry?.name ?? toolId}`}
                  onClick={() => removeAgentTool(toolId)}
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
            ? "No tools — use + to add web search or platform tools."
            : "Tools are available when the model provider is OpenAI Direct."}
        </p>
      )}

      {onSwarmToolsChange ? (
        <SwarmToolsSection
          nested
          swarmTools={swarmTools}
          pickerSwarms={pickerSwarms}
          currentSwarmId={currentSwarmId}
          onSwarmToolsChange={onSwarmToolsChange}
          openAiDirect={openAiDirect}
          runSwarmInactive={runSwarmInactive}
        />
      ) : null}

      {webSearchOn ? (
        <label className="tool-option">
          <span>Search context</span>
          <select
            value={openaiTools.webSearchContextSize ?? "medium"}
            onChange={(e) =>
              onOpenaiToolsChange({
                ...openaiTools,
                webSearchContextSize: e.target.value as OpenAiWorkerToolsConfig["webSearchContextSize"],
              })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      ) : null}

      {menuOpen && canAddAny ? (
        <div className="tools-menu" role="menu" aria-label="Add tool">
          {canAddWebSearch ? (
            <>
              <span className="menu-section">Hosted</span>
              <button type="button" className="menu-item" role="menuitem" onClick={enableWebSearch}>
                <span className="menu-icon" aria-hidden>
                  <TbWorld size={14} />
                </span>
                <span>Web search</span>
              </button>
            </>
          ) : null}

          {availablePlatformTools.length > 0 ? (
            <>
              <span className="menu-section">Platform</span>
              {availablePlatformTools.map((tool) => {
                if (!isAgentToolId(tool.id)) return null
                const Icon = toolIcon(tool.id)
                return (
                  <button
                    key={tool.id}
                    type="button"
                    className="menu-item"
                    role="menuitem"
                    onClick={() => enableAgentTool(tool.id)}
                  >
                    <span className="menu-icon" aria-hidden>
                      <Icon size={14} />
                    </span>
                    <span>{tool.name}</span>
                  </button>
                )
              })}
            </>
          ) : null}
        </div>
      ) : null}

      <style jsx>{`
        .tools {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .tools-head {
          display: grid;
          grid-template-columns: 5.5rem 1fr;
          align-items: center;
          gap: 0.5rem;
        }
        .tools-label {
          font-size: 0.75rem;
          color: var(--app-text-muted);
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
        .tools-list {
          list-style: none;
          margin: 0;
          padding: 0 0 0 6rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
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
        .tool-row--inactive {
          opacity: 0.72;
          border-style: dashed;
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
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .tool-badge {
          font-size: 0.5625rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--app-text-faint);
          padding: 0.05rem 0.3rem;
          border: 1px solid var(--app-border);
          border-radius: 999px;
        }
        .tool-desc {
          font-size: 0.5625rem;
          color: var(--app-text-faint);
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
        .tool-option {
          display: grid;
          grid-template-columns: 5.5rem 1fr;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
        }
        .tool-option select {
          font-size: 0.75rem;
          padding: 0.35rem 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          color: var(--app-text);
          font-family: var(--app-font);
        }
        .tools-menu {
          position: absolute;
          top: 1.75rem;
          right: 0;
          z-index: 30;
          min-width: 11rem;
          padding: 0.35rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        .menu-section {
          display: block;
          padding: 0.25rem 0.45rem;
          font-size: 0.5625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--app-text-faint);
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
        }
      `}</style>
    </section>
  )
}
