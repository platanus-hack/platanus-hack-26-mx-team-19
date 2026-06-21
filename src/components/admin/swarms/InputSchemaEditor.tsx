"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "@/lib/toast"
import {
  createEmptyField,
  fieldsToJsonSchema,
  jsonSchemaToFields,
  schemaToText,
  type InputSchemaField,
} from "@/lib/input-schema-builder"
import SchemaFieldBuilder from "./SchemaFieldBuilder"

type EditorMode = "builder" | "advanced"

type Props = {
  value: string
  onChange: (text: string) => void
  onRunInputKeysChange?: (keys: string[]) => void
}

function parseAdvancedJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim()
  if (!trimmed) return {}
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

export default function InputSchemaEditor({ value, onChange, onRunInputKeysChange }: Props) {
  const initialParsed = useMemo(() => parseAdvancedJson(value), [])
  const initialFields = useMemo(
    () => jsonSchemaToFields(initialParsed ?? undefined),
    [initialParsed],
  )

  const [mode, setMode] = useState<EditorMode>(() =>
    initialFields === null && (initialParsed?.properties || value.trim()) ? "advanced" : "builder",
  )
  const [fields, setFields] = useState<InputSchemaField[]>(() =>
    initialFields === null
      ? [createEmptyField()]
      : initialFields.length > 0
        ? initialFields
        : [createEmptyField()],
  )

  const emitKeys = useCallback(
    (nextFields: InputSchemaField[]) => {
      onRunInputKeysChange?.(
        nextFields.map((f) => f.name.trim()).filter((name) => name.length > 0),
      )
    },
    [onRunInputKeysChange],
  )

  const syncBuilderToText = useCallback(
    (nextFields: InputSchemaField[]) => {
      onChange(schemaToText(fieldsToJsonSchema(nextFields)))
      emitKeys(nextFields)
    },
    [onChange, emitKeys],
  )

  useEffect(() => {
    if (mode !== "builder") return
    syncBuilderToText(fields)
  }, [mode, fields, syncBuilderToText])

  const switchMode = (next: EditorMode) => {
    if (next === "advanced" && mode === "builder") {
      onChange(schemaToText(fieldsToJsonSchema(fields)))
    }
    if (next === "builder" && mode === "advanced") {
      const parsed = parseAdvancedJson(value)
      if (parsed === null && value.trim()) {
        toast.error("Fix JSON syntax before switching to Fields mode")
        return
      }
      const converted = jsonSchemaToFields(parsed ?? undefined)
      if (converted === null) {
        toast.error("Nested schemas need JSON mode — stay on JSON or simplify properties")
        return
      }
      setFields(converted.length > 0 ? converted : [createEmptyField()])
    }
    setMode(next)
  }

  const previewSchema = fieldsToJsonSchema(fields)

  return (
    <div className="editor">
      <div className="mode-tabs" role="tablist" aria-label="Input schema editor mode">
        <button
          type="button"
          role="tab"
          className={`mode-tab${mode === "builder" ? " mode-tab--active" : ""}`}
          aria-selected={mode === "builder"}
          onClick={() => switchMode("builder")}
        >
          Fields
        </button>
        <button
          type="button"
          role="tab"
          className={`mode-tab${mode === "advanced" ? " mode-tab--active" : ""}`}
          aria-selected={mode === "advanced"}
          onClick={() => switchMode("advanced")}
        >
          JSON
        </button>
      </div>

      {mode === "builder" ? (
        <>
          <SchemaFieldBuilder fields={fields} onChange={setFields} showRequired />

          {Object.keys((previewSchema.properties as object) ?? {}).length > 0 ? (
            <details className="preview">
              <summary>Generated JSON Schema</summary>
              <pre>{schemaToText(previewSchema)}</pre>
            </details>
          ) : null}
        </>
      ) : (
        <label className="advanced-field">
          <span>Input schema (JSON)</span>
          <textarea
            className="advanced-text"
            rows={8}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              const parsed = parseAdvancedJson(e.target.value)
              if (parsed !== null) {
                onRunInputKeysChange?.(Object.keys((parsed.properties as object) ?? {}))
              }
            }}
            placeholder={
              '{\n  "type": "object",\n  "properties": {\n    "message": { "type": "string" }\n  }\n}'
            }
          />
        </label>
      )}

      <style jsx>{`
        .editor {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .mode-tabs {
          display: inline-flex;
          gap: 0.125rem;
          padding: 0.125rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface-muted);
          align-self: flex-start;
        }
        .mode-tab {
          padding: 0.25rem 0.5rem;
          font-size: 0.625rem;
          font-weight: 500;
          border: none;
          border-radius: calc(var(--app-radius) - 2px);
          background: transparent;
          color: var(--app-text-muted);
          cursor: pointer;
          font-family: var(--app-font);
        }
        .mode-tab--active {
          background: var(--app-bg);
          color: var(--app-text);
        }
        .preview pre {
          margin: 0.35rem 0 0;
          padding: 0.4rem;
          max-height: 6rem;
          overflow: auto;
          font-size: 0.5625rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          background: #10151d;
          color: #d6deea;
          border-radius: var(--app-radius);
        }
        .advanced-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
        }
        .advanced-text {
          font-size: 0.6875rem;
          padding: 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          resize: vertical;
        }
      `}</style>
    </div>
  )
}
