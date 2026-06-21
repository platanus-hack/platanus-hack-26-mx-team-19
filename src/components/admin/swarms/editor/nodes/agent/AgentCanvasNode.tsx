"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import AgentRobotIcon from "../../icons/AgentRobotIcon"
import NodeWrapper from "../shared/NodeWrapper"
import NodeRunVisual, { nodeRunSquareModifier, useNodeRunState } from "../shared/NodeRunVisual"
import { NODE_RUN_SQUARE_STYLES } from "../shared/nodeRunSquareStyles"
import { useSwarmEditor } from "../../SwarmEditorContext"

export type AgentNodeData = {
  workerId: string
  label?: string
  tag?: "entry" | "exit" | "entry-exit" | null
}

export type AgentNodeType = Node<AgentNodeData, "agent">

/**
 * Worker-backed agent on the canvas. Configuration uses {@link SwarmWorkerPanel}
 * (API-backed), keyed by canvas node id — not worker id.
 */
export default function AgentCanvasNode({ id, data, selected }: NodeProps<AgentNodeType>) {
  const { workerById, onSelectNode, onOpenNode, onUpdateAgentNodeLabel } = useSwarmEditor()
  const runState = useNodeRunState(id)
  const worker = workerById[data.workerId]
  const displayLabel = worker?.name?.trim() || "Agent"

  const [editingLabel, setEditingLabel] = useState(false)
  const [draftLabel, setDraftLabel] = useState(displayLabel)
  const labelInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editingLabel) setDraftLabel(displayLabel)
  }, [displayLabel, editingLabel])

  useEffect(() => {
    if (editingLabel) labelInputRef.current?.select()
  }, [editingLabel])

  const openConfig = () => {
    onSelectNode(id)
    onOpenNode(id)
  }

  const commitLabel = useCallback(() => {
    setEditingLabel(false)
    const trimmed = draftLabel.trim()
    if (!trimmed) {
      setDraftLabel(displayLabel)
      return
    }
    if (trimmed !== displayLabel) {
      void onUpdateAgentNodeLabel(id, trimmed)
    }
  }, [draftLabel, displayLabel, id, onUpdateAgentNodeLabel])

  return (
    <div className="agent-node-root">
      <NodeWrapper
        id={id}
        type="agent"
        onConfigure={openConfig}
        configureAriaLabel="Configure agent"
      >
        <div
          className={`agent-node agent-robot-blink-host${selected ? " agent-node--on" : ""}`}
        >
          <Handle type="target" position={Position.Left} className="agent-handle agent-handle--target" />
          <div className={`square${nodeRunSquareModifier(runState)}`}>
            <NodeRunVisual
              nodeId={id}
              loaderSize="large"
              icon={<AgentRobotIcon size={35} blinkOnHover={runState === "idle"} />}
            />
          </div>
          <Handle type="source" position={Position.Right} className="agent-handle agent-handle--source" />
        </div>
      </NodeWrapper>

      <div className="agent-label-float nodrag">
        {editingLabel ? (
          <input
            ref={labelInputRef}
            className="agent-label-input"
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") {
                e.currentTarget.blur()
              }
              if (e.key === "Escape") {
                setDraftLabel(displayLabel)
                setEditingLabel(false)
              }
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Agent node label"
          />
        ) : (
          <button
            type="button"
            className="agent-label"
            onClick={(e) => {
              e.stopPropagation()
              setEditingLabel(true)
            }}
            title="Click to rename"
          >
            {displayLabel}
          </button>
        )}
      </div>

      <style jsx>{`
        .agent-node-root {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }
        .agent-label-float {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 0.125rem;
          max-width: 6.5rem;
          pointer-events: auto;
        }
        .agent-node {
          position: relative;
          width: 4rem;
        }
        .square {
          --agent-robot-eye-fill: var(--app-text);
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
          border: 1px solid var(--app-border);
          border-radius: calc(var(--app-radius) + 2px);
          background: var(--app-text);
          color: var(--app-bg);
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease,
            color 0.15s ease;
        }
        .agent-node:hover .square {
          border-color: var(--app-border-strong);
        }
        .agent-node--on .square {
          --agent-robot-eye-fill: var(--app-surface);
          border-color: var(--app-text);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--app-text) 18%, transparent);
          background: var(--app-surface);
          color: var(--app-text);
        }
        .agent-label {
          display: block;
          max-width: 6.5rem;
          padding: 0;
          border: none;
          background: none;
          font-size: 0.5625rem;
          font-weight: 500;
          line-height: 1.25;
          letter-spacing: 0.02em;
          text-align: center;
          color: var(--app-text-faint);
          cursor: text;
          font-family: var(--app-font);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-shadow: 0 1px 0 var(--app-surface);
        }
        .agent-label:hover {
          color: var(--app-text-muted);
        }
        .agent-label-input {
          display: block;
          width: 6.5rem;
          max-width: 6.5rem;
          margin: 0;
          padding: 0 0 1px;
          border: none;
          border-bottom: 1px solid var(--app-border-strong);
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          font-size: 0.5625rem;
          font-weight: 500;
          line-height: 1.25;
          letter-spacing: 0.02em;
          text-align: center;
          color: var(--app-text);
          font-family: var(--app-font);
        }
        .agent-label-input:focus {
          outline: none;
          border-bottom-color: var(--app-text-muted);
        }
        :global(.agent-handle) {
          width: 7px;
          height: 7px;
          background: var(--app-border-strong);
          border: 1.5px solid var(--app-surface);
        }
        :global(.agent-handle--target) {
          left: -5px;
        }
        :global(.agent-handle--source) {
          right: -5px;
        }
        .agent-node:hover :global(.agent-handle),
        .agent-node--on :global(.agent-handle) {
          background: var(--app-text);
        }
        ${NODE_RUN_SQUARE_STYLES}
      `}</style>
    </div>
  )
}
