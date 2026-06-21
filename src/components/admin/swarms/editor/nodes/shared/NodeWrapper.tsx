"use client"

import type { MouseEvent, ReactNode } from "react"
import { TbSettings, TbTrash } from "react-icons/tb"
import { useSwarmEditor } from "../../SwarmEditorContext"

type Props = {
  id: string
  type: string
  children: ReactNode
  onConfigure?: () => void
  configureAriaLabel?: string
}

/** Card chrome shared by every canvas node (top actions, delete, optional configure). */
export default function NodeWrapper({
  id,
  type,
  children,
  onConfigure,
  configureAriaLabel,
}: Props) {
  const { onDeleteNode, isSaving } = useSwarmEditor()

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (isSaving) return
    onDeleteNode(id)
  }

  const handleConfigure = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (isSaving) return
    onConfigure?.()
  }

  const actionsDisabled = isSaving

  return (
    <div className="node-card-container">
      <div className="node-actions nodrag">
        {onConfigure ? (
          <button
            type="button"
            onClick={handleConfigure}
            className="action-button"
            disabled={actionsDisabled}
            aria-label={configureAriaLabel ?? `Configure ${type} node`}
          >
            <TbSettings size={16} aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleDelete}
          className="action-button action-button--delete"
          disabled={actionsDisabled}
          aria-label={`Delete ${type} node`}
        >
          <TbTrash size={16} aria-hidden />
        </button>
      </div>
      {children}

      <style jsx>{`
        .node-card-container {
          padding: 0.25rem;
          background: #c5bdcd;
          border-radius: var(--app-radius-lg);
          position: relative;
        }
        .node-actions {
          position: absolute;
          top: -18px;
          right: 0.3rem;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 0.125rem;
        }
        .action-button {
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--app-text-faint);
          transition:
            color 0.15s ease,
            transform 0.15s ease;
        }
        .action-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }
        .action-button:hover:not(:disabled) {
          color: var(--app-text);
          transform: scale(1.05);
        }
        .action-button--delete:hover:not(:disabled) {
          color: #b91c1c;
        }
      `}</style>
    </div>
  )
}
