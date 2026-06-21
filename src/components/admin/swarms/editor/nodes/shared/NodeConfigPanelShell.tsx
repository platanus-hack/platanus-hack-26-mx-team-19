"use client"

import type { ReactNode } from "react"
import { TbBook, TbTrash, TbX } from "react-icons/tb"
import ResizablePanelEdge from "@/components/admin/swarms/ResizablePanelEdge"
import { useResizableSidePanelWidth } from "@/lib/resizable-side-panel"

type Props = {
  title: string
  description: string
  onClose: () => void
  onDeleteNode?: () => void
  children: ReactNode
}

/** Shared chrome for control-node config panels (header + scrollable body). */
export default function NodeConfigPanelShell({
  title,
  description,
  onClose,
  onDeleteNode,
  children,
}: Props) {
  const { panelStyle, resizeActive, startResize } = useResizableSidePanelWidth()

  return (
    <aside
      className={`panel${resizeActive ? " panel--resizing" : ""}`}
      style={panelStyle}
      aria-label={`${title} configuration`}
    >
      <ResizablePanelEdge
        active={resizeActive}
        onMouseDown={startResize}
        ariaLabel={`Resize ${title} panel`}
      />

      <header className="head">
        <div className="head-text">
          <h2 className="title">{title}</h2>
          <p className="sub">{description}</p>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Documentation (coming soon)"
            title="Documentation (coming soon)"
            disabled
          >
            <TbBook size={16} />
          </button>
          {onDeleteNode ? (
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={onDeleteNode}
              aria-label={`Delete ${title} node`}
            >
              <TbTrash size={16} />
            </button>
          ) : null}
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close panel">
            <TbX size={16} />
          </button>
        </div>
      </header>

      <div className="body">{children}</div>

      <style jsx>{`
        .panel {
          position: relative;
          flex-shrink: 0;
          border-left: 1px solid var(--app-border);
          background: var(--app-surface);
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 100%;
          min-height: 0;
          overflow: hidden;
        }
        .panel--resizing {
          transition: none;
        }
        .head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 1rem 1rem 0.75rem;
          border-bottom: 1px solid var(--app-border);
          flex-shrink: 0;
        }
        .head-text {
          min-width: 0;
          flex: 1;
        }
        .title {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--app-text);
        }
        .sub {
          margin: 0.25rem 0 0;
          font-size: 0.6875rem;
          color: var(--app-text-faint);
          line-height: 1.4;
        }
        .head-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-shrink: 0;
        }
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          color: var(--app-text-muted);
          cursor: pointer;
          transition:
            color 0.15s ease,
            border-color 0.15s ease;
        }
        .icon-btn:hover:not(:disabled) {
          color: var(--app-text);
          border-color: var(--app-border-strong);
        }
        .icon-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .icon-btn--danger:hover:not(:disabled) {
          color: #b91c1c;
          border-color: #b91c1c;
        }
        .body {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem 1rem 1rem;
          min-height: 0;
        }
      `}</style>
    </aside>
  )
}
