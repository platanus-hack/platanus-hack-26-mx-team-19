"use client"

import type { MouseEvent } from "react"
import { TbCopy } from "react-icons/tb"
import { toast } from "@/lib/toast"

type Props = {
  text: string
  /** Short label for aria-label and toast, e.g. "Output". */
  label: string
  disabled?: boolean
  title?: string
}

export default function WorkerLogCopyButton({
  text,
  label,
  disabled = false,
  title,
}: Props) {
  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const trimmed = text.trim()
    if (!trimmed) return
    try {
      await navigator.clipboard.writeText(trimmed)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  return (
    <>
      <button
        type="button"
        className="worker-log-copy"
        onClick={handleCopy}
        disabled={disabled}
        aria-label={`Copy ${label.toLowerCase()}`}
        title={title ?? `Copy ${label.toLowerCase()}`}
      >
        <TbCopy size={12} aria-hidden />
      </button>
      <style jsx>{`
        .worker-log-copy {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.375rem;
          height: 1.375rem;
          padding: 0;
          border: 1px solid var(--app-border);
          border-radius: calc(var(--app-radius) - 2px);
          background: var(--app-surface);
          color: var(--app-text-faint);
          cursor: pointer;
          flex-shrink: 0;
        }
        .worker-log-copy:hover:not(:disabled) {
          color: var(--app-text);
          border-color: var(--app-border-strong);
          background: var(--app-surface-muted);
        }
        .worker-log-copy:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}
