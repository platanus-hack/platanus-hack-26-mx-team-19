"use client"

import { useEffect, useRef } from "react"
import { TbX } from "react-icons/tb"
import PromptVariablesSidebar, {
  type StructuredPromptVariable,
} from "./PromptVariablesSidebar"
import type {
  ContextPickerSection,
  ContextPickerUpstreamGroup,
} from "./InstructionsContextPicker"
import OutputSchemaEditor from "./OutputSchemaEditor"
import styles from "./PromptProEditorModal.module.css"

export type ProEditorOutputSchema = {
  editorKey: string
  value: string
  onChange: (text: string) => void
  workerName: string
  openAiStructured: boolean
  nonOpenAiHint?: string
}

type Props = {
  open: boolean
  title: string
  subtitle?: string
  value: string
  onChange: (next: string) => void
  onClose: () => void
  placeholder?: string
  mono?: boolean
  localFlatSections: ContextPickerSection[]
  localUpstreamSections: ContextPickerUpstreamGroup[]
  globalFlatSections: ContextPickerSection[]
  structuredVariables?: StructuredPromptVariable[]
  outputSchema?: ProEditorOutputSchema
}

export default function PromptProEditorModal({
  open,
  title,
  subtitle,
  value,
  onChange,
  onClose,
  placeholder,
  mono = false,
  localFlatSections,
  localUpstreamSections,
  globalFlatSections,
  structuredVariables,
  outputSchema,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [open])

  if (!open) return null

  const insertToken = (token: string) => {
    const el = textareaRef.current
    if (!el) {
      onChange(`${value}${token}`)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = `${value.slice(0, start)}${token}${value.slice(end)}`
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + token.length
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-labelledby="prompt-pro-editor-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.head}>
          <div>
            <h2 id="prompt-pro-editor-title" className={styles.title}>
              {title}
            </h2>
            {subtitle ? <p className={styles.sub}>{subtitle}</p> : null}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <TbX size={16} />
          </button>
        </header>

        <div className={`${styles.body}${outputSchema ? ` ${styles.bodyWithSchema}` : ""}`}>
          <PromptVariablesSidebar
            edge="start"
            localFlatSections={localFlatSections}
            localUpstreamSections={localUpstreamSections}
            globalFlatSections={globalFlatSections}
            structuredVariables={structuredVariables}
            sourceText={value}
            onInsert={insertToken}
          />

          <div className={styles.editorPane}>
            <textarea
              ref={textareaRef}
              className={`${styles.textarea}${mono ? ` ${styles.textareaMono}` : ""}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              spellCheck={false}
            />
          </div>

          {outputSchema ? (
            <section className={styles.outputSchemaWrap} aria-label="Output schema">
              <h3 className={styles.outputSchemaTitle}>Output schema</h3>
              <OutputSchemaEditor
                key={outputSchema.editorKey}
                value={outputSchema.value}
                onChange={outputSchema.onChange}
                workerName={outputSchema.workerName}
                openAiStructured={outputSchema.openAiStructured}
              />
              {outputSchema.nonOpenAiHint ? (
                <p className={styles.outputSchemaHint}>{outputSchema.nonOpenAiHint}</p>
              ) : null}
            </section>
          ) : null}
        </div>

        <footer className={styles.foot}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
