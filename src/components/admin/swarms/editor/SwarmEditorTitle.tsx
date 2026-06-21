"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Props = {
  name: string
  onSave: (name: string) => Promise<void>
  disabled?: boolean
}

export default function SwarmEditorTitle({ name, onSave, disabled }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipBlurCommitRef = useRef(false)

  useEffect(() => {
    if (!editing) setDraft(name)
  }, [name, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const cancel = useCallback(() => {
    setDraft(name)
    setEditing(false)
  }, [name])

  const commit = useCallback(async () => {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === name) {
      cancel()
      return
    }

    setSaving(true)
    try {
      await onSave(trimmed)
      setEditing(false)
    } catch {
      inputRef.current?.focus()
      inputRef.current?.select()
    } finally {
      setSaving(false)
    }
  }, [cancel, draft, name, onSave])

  const startEditing = useCallback(() => {
    if (disabled || saving) return
    setDraft(name)
    setEditing(true)
  }, [disabled, name, saving])

  if (editing) {
    return (
      <>
        <input
          ref={inputRef}
          className="title-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (skipBlurCommitRef.current) {
              skipBlurCommitRef.current = false
              return
            }
            void commit()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void commit()
            } else if (e.key === "Escape") {
              e.preventDefault()
              skipBlurCommitRef.current = true
              cancel()
            }
          }}
          disabled={saving || disabled}
          aria-label="Swarm name"
        />
        <style jsx>{`
          .title-input {
            margin: 0;
            padding: 0;
            width: 100%;
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--app-text);
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--app-border-strong);
            border-radius: 0;
            outline: none;
            font-family: var(--app-font);
            line-height: 1.3;
          }
          .title-input:focus {
            border-bottom-color: var(--app-text);
          }
          .title-input:disabled {
            opacity: 0.6;
          }
        `}</style>
      </>
    )
  }

  return (
    <>
      <h1
        className="title title--editable"
        onDoubleClick={startEditing}
        title="Double-click to rename"
      >
        {name}
      </h1>
      <style jsx>{`
        .title {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--app-text);
        }
        .title--editable {
          cursor: text;
          border-radius: var(--app-radius-sm, 4px);
          padding: 0 0.125rem;
          margin: 0 -0.125rem;
        }
        .title--editable:hover {
          background: var(--app-surface-muted);
        }
      `}</style>
    </>
  )
}
