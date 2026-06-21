"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { TbHelpCircle } from "react-icons/tb"
import { toast } from "@/lib/toast"
import {
  createEmptyField,
  fieldsToJsonSchema,
  jsonSchemaToFields,
  schemaToText,
  type OutputSchemaField,
} from "@/lib/output-schema-builder"
import SchemaFieldBuilder from "./SchemaFieldBuilder"

type EditorMode = "builder" | "advanced"

type Props = {
  value: string
  onChange: (text: string) => void
  workerName: string
  /** When true, show OpenAI structured-output hint. */
  openAiStructured?: boolean
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

export default function OutputSchemaEditor({
  value,
  onChange,
  workerName,
  openAiStructured = false,
}: Props) {
  const initialParsed = useMemo(() => parseAdvancedJson(value), [])
  const initialFields = useMemo(
    () => jsonSchemaToFields(initialParsed ?? undefined),
    [initialParsed],
  )

  const [mode, setMode] = useState<EditorMode>(() =>
    initialFields === null && (initialParsed?.properties || value.trim()) ? "advanced" : "builder",
  )
  const [fields, setFields] = useState<OutputSchemaField[]>(() =>
    initialFields === null ? [createEmptyField()] : initialFields.length > 0 ? initialFields : [createEmptyField()],
  )

  const syncBuilderToText = useCallback(
    (nextFields: OutputSchemaField[]) => {
      onChange(schemaToText(fieldsToJsonSchema(nextFields, { allFieldsRequired: true })))
    },
    [onChange],
  )

  useEffect(() => {
    if (mode !== "builder") return
    syncBuilderToText(fields)
  }, [mode, fields, syncBuilderToText])

  const switchMode = (next: EditorMode) => {
    if (next === "advanced" && mode === "builder") {
      onChange(schemaToText(fieldsToJsonSchema(fields, { allFieldsRequired: true })))
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

  const previewSchema = fieldsToJsonSchema(fields, { allFieldsRequired: true })
  const hasProperties =
    previewSchema.properties &&
    typeof previewSchema.properties === "object" &&
    Object.keys(previewSchema.properties as object).length > 0

  const schemaHelpText = [
    "Each field name must be unique across all agents in this swarm (only one summary, one icp, etc.). Reference them in prompts as {{fieldName}} — for example {{summary}}.",
    openAiStructured ? "OpenAI uses this schema as json_schema on each run." : null,
    openAiStructured
      ? "With openai_direct and at least one field, the API sends OpenAI json_schema structured output (like Zod → zodTextFormat) — no need to repeat the JSON shape in the system prompt."
      : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  return (
    <div className="editor">
      <div className="mode-row">
        <div className="mode-tabs" role="tablist" aria-label="Output schema editor mode">
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
        <button
          type="button"
          className="schema-help"
          aria-label="About output schema fields"
          title={schemaHelpText}
        >
          <TbHelpCircle size={14} aria-hidden />
        </button>
      </div>

      {mode === "builder" ? (
        <>
          <SchemaFieldBuilder fields={fields} onChange={setFields} />

          {hasProperties ? (
            <details className="preview">
              <summary>Generated JSON Schema</summary>
              <pre>{schemaToText(previewSchema)}</pre>
            </details>
          ) : null}
        </>
      ) : (
        <label className="advanced-field">
          <span>Output schema (JSON Schema)</span>
          <textarea
            className="advanced-text"
            rows={12}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              '{\n  "type": "object",\n  "properties": {\n    "result": { "type": "string" }\n  }\n}'
            }
          />
          <span className="advanced-hint">
            Use for nested objects or schemas the field builder cannot represent. Schema name on
            the API: <code>{workerName.trim() || "worker"}</code>.
          </span>
        </label>
      )}

      <style jsx>{`
        .editor {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .mode-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .mode-tabs {
          display: inline-flex;
          gap: 0.125rem;
          padding: 0.125rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface-muted);
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
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .schema-help {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.15rem;
          border: none;
          background: transparent;
          color: var(--app-text-faint);
          cursor: help;
        }
        .schema-help:hover {
          color: var(--app-text-muted);
        }
        .preview {
          font-size: 0.625rem;
          color: var(--app-text-faint);
        }
        .preview summary {
          cursor: pointer;
          user-select: none;
        }
        .preview pre {
          margin: 0.35rem 0 0;
          padding: 0.4rem;
          max-height: 8rem;
          overflow: auto;
          font-size: 0.5625rem;
          line-height: 1.4;
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
          color: var(--app-text);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          line-height: 1.45;
          resize: vertical;
        }
        .advanced-hint {
          font-size: 0.625rem;
          color: var(--app-text-faint);
          line-height: 1.4;
        }
        .advanced-hint code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
      `}</style>
    </div>
  )
}
