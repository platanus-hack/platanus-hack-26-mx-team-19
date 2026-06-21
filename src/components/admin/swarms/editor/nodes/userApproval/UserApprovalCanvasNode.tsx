"use client"

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { TbThumbUp } from "react-icons/tb"
import NodeWrapper from "../shared/NodeWrapper"
import { CANVAS_NODE_CIRCLE_RADIUS } from "../shared/canvasNodeShapeStyles"
import NodeRunVisual, { nodeRunSquareModifier, useNodeRunState } from "../shared/NodeRunVisual"
import { NODE_RUN_SQUARE_STYLES } from "../shared/nodeRunSquareStyles"
import { useSwarmEditor } from "../../SwarmEditorContext"
import { useMessages } from "@/i18n/LocaleProvider"
import {
  USER_APPROVAL_APPROVE_HANDLE,
  USER_APPROVAL_REJECT_HANDLE,
  type UserApprovalNodeData,
} from "./data"

export type UserApprovalNodeType = Node<UserApprovalNodeData, "user_approval">

function sourceHandleTop(index: number, total: number): string {
  if (total <= 1) return "50%"
  const step = 100 / (total + 1)
  return `${step * (index + 1)}%`
}

/** User approval gate — approve / reject branches (same layout as scraper). */
export default function UserApprovalCanvasNode({ id, selected }: NodeProps<UserApprovalNodeType>) {
  const { onSelectNode, onOpenNode } = useSwarmEditor()
  const approval = useMessages().swarmEditor.approval
  const runState = useNodeRunState(id)
  const outputCount = 2

  const openConfig = () => {
    onSelectNode(id)
    onOpenNode(id)
  }

  return (
    <NodeWrapper
      id={id}
      type="user approval"
      onConfigure={openConfig}
      configureAriaLabel="Configure user approval node"
    >
      <div className={`approval-node${selected ? " approval-node--on" : ""}`}>
        <Handle
          type="target"
          position={Position.Left}
          className="approval-handle approval-handle--target"
        />
        <div className={`square${nodeRunSquareModifier(runState)}`}>
          <NodeRunVisual nodeId={id} icon={<TbThumbUp size={28} aria-hidden />} />
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id={USER_APPROVAL_APPROVE_HANDLE}
          className="approval-handle approval-handle--source"
          style={{ top: sourceHandleTop(0, outputCount) }}
        />
        <span
          className="branch-label branch-label--approve"
          style={{ top: sourceHandleTop(0, outputCount) }}
        >
          {approval.approve}
        </span>
        <Handle
          type="source"
          position={Position.Right}
          id={USER_APPROVAL_REJECT_HANDLE}
          className="approval-handle approval-handle--source"
          style={{ top: sourceHandleTop(1, outputCount) }}
        />
        <span
          className="branch-label branch-label--reject"
          style={{ top: sourceHandleTop(1, outputCount) }}
        >
          {approval.reject}
        </span>
      </div>

      <style jsx>{`
        .approval-node {
          position: relative;
          width: 4rem;
        }
        .square {
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
          border: 1px solid #c2410c;
          border-radius: ${CANVAS_NODE_CIRCLE_RADIUS};
          background: #ea580c;
          color: #fff7ed;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease,
            color 0.15s ease;
        }
        .approval-node:hover .square {
          border-color: #9a3412;
        }
        .approval-node--on .square {
          border-color: #ea580c;
          box-shadow: 0 0 0 2px color-mix(in srgb, #ea580c 28%, transparent);
          background: var(--app-surface);
          color: #ea580c;
        }
        :global(.approval-handle) {
          width: 7px;
          height: 7px;
          background: var(--app-border-strong);
          border: 1.5px solid var(--app-surface);
        }
        :global(.approval-handle--target) {
          left: -5px;
        }
        :global(.approval-handle--source) {
          right: -5px;
        }
        .approval-node:hover :global(.approval-handle),
        .approval-node--on :global(.approval-handle) {
          background: #ea580c;
        }
        .branch-label {
          position: absolute;
          left: calc(100% + 0.4rem);
          transform: translateY(-50%);
          font-size: 0.5rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        }
        .branch-label--approve {
          color: var(--app-text-muted);
        }
        .branch-label--reject {
          color: var(--app-text-faint);
        }
        .square--run-running,
        .square--run-waiting {
          animation: node-run-pulse-approval 1.2s ease-in-out infinite;
        }
        .square--run-done {
          box-shadow: 0 0 0 2px color-mix(in srgb, #16a34a 35%, transparent);
        }
        .square--run-skipped {
          opacity: 0.42;
          filter: grayscale(0.35);
        }
        @keyframes node-run-pulse-approval {
          0%,
          100% {
            box-shadow: 0 0 0 0 color-mix(in srgb, #ea580c 18%, transparent);
          }
          50% {
            box-shadow: 0 0 0 4px color-mix(in srgb, #ea580c 10%, transparent);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .square--run-running,
          .square--run-waiting {
            animation: none;
          }
        }
      `}</style>
    </NodeWrapper>
  )
}
