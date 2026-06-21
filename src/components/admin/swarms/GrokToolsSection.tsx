"use client"

import { useEffect, useRef, useState } from "react"
import { TbAt, TbPlus, TbWorld, TbX } from "react-icons/tb"
import type { GrokWorkerToolsConfig } from "@/lib/grok-worker-tools"

type Props = {
  grokTools: GrokWorkerToolsConfig
  onGrokToolsChange: (next: GrokWorkerToolsConfig) => void
  grokDirect: boolean
}

export default function GrokToolsSection({
  grokTools,
  onGrokToolsChange,
  grokDirect,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const xSearchOn = grokTools.xSearch === true
  const webSearchOn = grokTools.webSearch === true
  const canAddXSearch = grokDirect && !xSearchOn
  const canAddWebSearch = grokDirect && !webSearchOn
  const canAddAny = grokDirect && (canAddXSearch || canAddWebSearch)
  const hasAnyTool = xSearchOn || webSearchOn

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

  const enableXSearch = () => {
    onGrokToolsChange({
      ...grokTools,
      xSearch: true,
      toolChoice: grokTools.toolChoice ?? "auto",
    })
    setMenuOpen(false)
  }

  const enableWebSearch = () => {
    onGrokToolsChange({
      ...grokTools,
      webSearch: true,
      toolChoice: grokTools.toolChoice ?? "auto",
    })
    setMenuOpen(false)
  }

  const removeXSearch = () => {
    onGrokToolsChange({
      ...grokTools,
      xSearch: false,
      xSearchAllowedHandles: undefined,
      xSearchExcludedHandles: undefined,
      xSearchFromDate: undefined,
      xSearchToDate: undefined,
      xSearchEnableImageUnderstanding: undefined,
      xSearchEnableVideoUnderstanding: undefined,
    })
  }

  const removeWebSearch = () => {
    onGrokToolsChange({ ...grokTools, webSearch: false })
  }

  const allowedHandlesText = (grokTools.xSearchAllowedHandles ?? []).join(", ")

  return (
    <section className="tools" ref={rootRef} aria-label="Tools">
      <div className="tools-head">
        <span className="tools-label">Tools</span>
        <button
          type="button"
          className="tools-add"
          aria-label="Add Grok tool"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          disabled={!canAddAny}
          title={
            !grokDirect
              ? "Grok tools require provider xAI Grok (grok_direct)"
              : !canAddAny
                ? "All available Grok tools are already enabled"
                : "Add a Grok tool"
          }
          onClick={() => setMenuOpen((open) => !open)}
        >
          <TbPlus size={14} aria-hidden />
        </button>
      </div>

      {hasAnyTool ? (
        <ul className="tools-list">
          {xSearchOn ? (
            <li className="tool-row">
              <span className="tool-icon" aria-hidden>
                <TbAt size={14} />
              </span>
              <div className="tool-meta">
                <span className="tool-name">X search</span>
                <span className="tool-desc">
                  Hosted · keyword &amp; semantic search on X
                </span>
              </div>
              <button
                type="button"
                className="tool-remove"
                aria-label="Remove X search"
                onClick={removeXSearch}
              >
                <TbX size={14} aria-hidden />
              </button>
            </li>
          ) : null}

          {webSearchOn ? (
            <li className="tool-row">
              <span className="tool-icon" aria-hidden>
                <TbWorld size={14} />
              </span>
              <div className="tool-meta">
                <span className="tool-name">Web search</span>
                <span className="tool-desc">Hosted · xAI Responses API</span>
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
        </ul>
      ) : (
        <p className="tools-empty">
          No tools — use + to add X search or web search.
        </p>
      )}

      {xSearchOn ? (
        <details className="xsearch-advanced">
          <summary className="xsearch-advanced-summary">Optional filters</summary>
          <p className="xsearch-advanced-hint">
            Leave empty so Grok chooses queries, accounts, and dates from your instructions.
            Use these only for hard limits (compliance, allowlists).
          </p>
          <label className="tool-option">
            <span>Allowed handles</span>
            <input
              className="tool-input"
              type="text"
              placeholder="xai, elonmusk (comma-separated, max 20)"
              value={allowedHandlesText}
              onChange={(e) => {
                const handles = e.target.value
                  .split(",")
                  .map((h) => h.trim().replace(/^@/, ""))
                  .filter(Boolean)
                  .slice(0, 20)
                onGrokToolsChange({
                  ...grokTools,
                  xSearchAllowedHandles: handles.length > 0 ? handles : undefined,
                  xSearchExcludedHandles: undefined,
                })
              }}
            />
          </label>
          <label className="tool-option">
            <span>From date</span>
            <input
              className="tool-input"
              type="date"
              value={grokTools.xSearchFromDate ?? ""}
              onChange={(e) =>
                onGrokToolsChange({
                  ...grokTools,
                  xSearchFromDate: e.target.value || undefined,
                })
              }
            />
          </label>
          <label className="tool-option">
            <span>To date</span>
            <input
              className="tool-input"
              type="date"
              value={grokTools.xSearchToDate ?? ""}
              onChange={(e) =>
                onGrokToolsChange({
                  ...grokTools,
                  xSearchToDate: e.target.value || undefined,
                })
              }
            />
          </label>
        </details>
      ) : null}

      {menuOpen && canAddAny ? (
        <div className="tools-menu" role="menu" aria-label="Add Grok tool">
          <span className="menu-section">Hosted</span>
          {canAddXSearch ? (
            <button type="button" className="menu-item" role="menuitem" onClick={enableXSearch}>
              <span className="menu-icon" aria-hidden>
                <TbAt size={14} />
              </span>
              <span>X search</span>
            </button>
          ) : null}
          {canAddWebSearch ? (
            <button type="button" className="menu-item" role="menuitem" onClick={enableWebSearch}>
              <span className="menu-icon" aria-hidden>
                <TbWorld size={14} />
              </span>
              <span>Web search</span>
            </button>
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
        .xsearch-advanced {
          margin: 0;
          padding: 0 0 0 6rem;
        }
        .xsearch-advanced-summary {
          font-size: 0.6875rem;
          color: var(--app-text-muted);
          cursor: pointer;
          list-style: none;
        }
        .xsearch-advanced-summary::-webkit-details-marker {
          display: none;
        }
        .xsearch-advanced-hint {
          margin: 0.35rem 0 0.5rem;
          font-size: 0.625rem;
          color: var(--app-text-faint);
          line-height: 1.4;
        }
        .xsearch-advanced .tool-option {
          margin-top: 0.35rem;
        }
        .tool-option {
          display: grid;
          grid-template-columns: 5.5rem 1fr;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
        }
        .tool-input {
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
