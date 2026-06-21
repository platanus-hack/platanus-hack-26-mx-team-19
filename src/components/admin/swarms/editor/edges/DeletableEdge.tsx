"use client"

import { memo } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react"
import type { MouseEvent } from "react"
import { TbTrash } from "react-icons/tb"
import { useSwarmEditor } from "../SwarmEditorContext"

function DeletableEdgeBase({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  const { deleteElements } = useReactFlow()
  const { isSaving } = useSwarmEditor()

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (isSaving) return
    void deleteElements({ edges: [{ id }] })
  }

  return (
    <>
      <BaseEdge path={path} style={style} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className={selected ? "edge-delete edge-delete--on" : "edge-delete"}
            aria-label="Delete connection"
          >
            <TbTrash size={11} />
          </button>
        </div>
      </EdgeLabelRenderer>
      <style jsx>{`
        :global(.edge-delete) {
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: 50%;
          color: var(--app-text-faint);
          cursor: pointer;
          opacity: 0;
          transition:
            opacity 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease,
            transform 0.15s ease;
        }
        :global(.react-flow__edge:hover .edge-delete),
        :global(.edge-delete--on) {
          opacity: 1;
        }
        :global(.edge-delete:hover) {
          color: #b91c1c;
          border-color: #b91c1c;
          transform: scale(1.05);
        }
      `}</style>
    </>
  )
}

export default memo(DeletableEdgeBase)
