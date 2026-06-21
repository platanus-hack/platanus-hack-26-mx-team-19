"use client"

import { useCallback, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { TbCopy, TbX } from "react-icons/tb"
import { buildPublicAuditUrl } from "@/lib/audit-url"
import { toast } from "@/lib/toast"

type Props = {
  open: boolean
  runId: string
  onClose: () => void
}

export default function AuditQrModal({ open, runId, onClose }: Props) {
  const auditUrl = buildPublicAuditUrl(runId)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, open])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(auditUrl)
      toast.success("Audit link copied")
    } catch {
      toast.error("Could not copy link")
    }
  }, [auditUrl])

  if (!open) return null

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-qr-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="head">
          <div>
            <h2 id="audit-qr-title" className="title">
              Public audit link
            </h2>
            <p className="subtitle">Scan or share to open the run audit trail.</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Close">
            <TbX size={16} aria-hidden />
          </button>
        </header>

        <div className="qr-wrap">
          <QRCodeSVG value={auditUrl} size={176} level="M" includeMargin />
        </div>

        <div className="url-row">
          <code className="url">{auditUrl}</code>
          <button type="button" className="copy" onClick={() => void copyLink()} aria-label="Copy audit link">
            <TbCopy size={14} aria-hidden />
          </button>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(10, 10, 10, 0.45);
        }
        .dialog {
          width: min(100%, 22rem);
          padding: 1rem;
          border: 1px solid var(--app-border);
          border-radius: calc(var(--app-radius) + 2px);
          background: var(--app-surface);
          box-shadow: 0 18px 48px rgba(10, 10, 10, 0.18);
        }
        .head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .title {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--app-text);
        }
        .subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.75rem;
          color: var(--app-text-muted);
        }
        .close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          padding: 0;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          color: var(--app-text-muted);
          cursor: pointer;
          flex-shrink: 0;
        }
        .close:hover {
          border-color: var(--app-border-strong);
          color: var(--app-text);
        }
        .qr-wrap {
          display: flex;
          justify-content: center;
          padding: 0.75rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: #fff;
        }
        .url-row {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin-top: 0.75rem;
        }
        .url {
          flex: 1;
          min-width: 0;
          padding: 0.45rem 0.5rem;
          font-size: 0.625rem;
          line-height: 1.4;
          color: var(--app-text-muted);
          background: var(--app-bg);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .copy {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          padding: 0;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          color: var(--app-text-muted);
          cursor: pointer;
          flex-shrink: 0;
        }
        .copy:hover {
          border-color: var(--app-border-strong);
          color: var(--app-text);
        }
      `}</style>
    </div>
  )
}
