"use client"

import { TbCopy } from "react-icons/tb"
import { toast } from "@/lib/toast"

type Props = {
  onCopy: () => string | null
  disabled?: boolean
}

export default function SwarmEditorSnapshotCopyButton({ onCopy, disabled = false }: Props) {
  const handleCopy = async () => {
    const text = onCopy()
    if (!text?.trim()) {
      toast.error("Nothing to copy")
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      toast.success("Swarm snapshot copied")
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  return (
    <>
      <button
        type="button"
        className="snapshot-copy"
        onClick={() => void handleCopy()}
        disabled={disabled}
        aria-label="Copy swarm snapshot (admin)"
        title="Copy full swarm snapshot (graph + workers)"
      >
        <TbCopy size={12} aria-hidden />
        <span>Copy swarm (admin)</span>
      </button>
      <style jsx>{`
        .snapshot-copy {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-pill);
          background: var(--app-surface);
          font-family: var(--app-font);
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .snapshot-copy:hover:not(:disabled) {
          color: var(--app-text);
          border-color: var(--app-border-strong);
          background: var(--app-surface-muted);
        }
        .snapshot-copy:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}
