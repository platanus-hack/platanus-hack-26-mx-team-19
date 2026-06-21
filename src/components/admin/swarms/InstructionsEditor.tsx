"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { TbArrowsDiagonal } from "react-icons/tb"
import {
  GLOBAL_CONTEXT_SECTION_ORDER,
  buildGlobalContextVariables,
  globalContextSectionLabel,
  type GlobalContextTokenFormat,
  type GlobalContextVariable,
} from "@/lib/swarm-global-context-vars"
import type { PromptVariable } from "@/lib/swarm-graph-vars"
import InstructionsContextPicker, {
  type ContextMenuKind,
  type ContextPickerPreviewSection,
  type ContextPickerSection,
  type ContextPickerUpstreamGroup,
} from "./InstructionsContextPicker"
import PromptProEditorModal, {
  type ProEditorOutputSchema,
} from "./PromptProEditorModal"
import type { StructuredPromptVariable } from "./PromptVariablesSidebar"

type Props = {
  value: string
  onChange: (next: string) => void
  variables: PromptVariable[]
  globalVariables?: GlobalContextVariable[]
  globalTokenFormat?: GlobalContextTokenFormat
  showGlobalContext?: boolean
  rows?: number
  label?: string
  placeholder?: string
  menuHint?: string
  globalMenuHint?: string
  globalReferencePreviewSections?: ContextPickerPreviewSection[]
  structuredVariables?: StructuredPromptVariable[]
  outputSchema?: ProEditorOutputSchema
  proEditorSubtitle?: string
  showProEditor?: boolean
  hideLabel?: boolean
  mono?: boolean
}

type WorkerVariableGroup = {
  workerId: string
  workerName: string
  items: PromptVariable[]
}

function groupLabel(group: PromptVariable["group"]): string {
  if (group === "goal") return "Swarm goal"
  if (group === "runInput") return "Run input"
  if (group === "shared") return "Shared context"
  return "Upstream"
}

const CONTEXT_GROUP_ORDER: PromptVariable["group"][] = [
  "goal",
  "runInput",
  "shared",
  "upstream",
]

type LocalMenuSection =
  | { kind: "flat"; label: string; items: PromptVariable[] }
  | { kind: "upstream"; groups: WorkerVariableGroup[] }

function buildLocalMenuSections(variables: PromptVariable[]): LocalMenuSection[] {
  const sections: LocalMenuSection[] = []

  for (const group of CONTEXT_GROUP_ORDER) {
    if (group === "upstream") {
      const upstreamVars = variables.filter((v) => v.group === "upstream")
      if (upstreamVars.length > 0) {
        sections.push({ kind: "upstream", groups: groupByUpstreamWorker(upstreamVars) })
      }
      continue
    }
    const items = variables.filter((v) => v.group === group)
    if (items.length > 0) {
      sections.push({ kind: "flat", label: groupLabel(group), items })
    }
  }

  return sections
}

function buildGlobalMenuSections(variables: GlobalContextVariable[]): ContextPickerSection[] {
  return GLOBAL_CONTEXT_SECTION_ORDER.flatMap((section) => {
    const items = variables.filter((variable) => variable.section === section)
    if (items.length === 0) return []
    return [{ label: globalContextSectionLabel(section), items }]
  })
}

function groupByUpstreamWorker(variables: PromptVariable[]): WorkerVariableGroup[] {
  const map = new Map<string, WorkerVariableGroup>()

  for (const variable of variables) {
    const workerId = variable.sourceWorkerId ?? "unknown"
    const workerName = variable.sourceWorkerName ?? "Upstream"
    const existing = map.get(workerId)
    if (existing) {
      existing.items.push(variable)
      continue
    }
    map.set(workerId, { workerId, workerName, items: [variable] })
  }

  return [...map.values()]
}

export default function InstructionsEditor({
  value,
  onChange,
  variables,
  globalVariables,
  globalTokenFormat = "mustache",
  showGlobalContext = true,
  rows = 10,
  label = "Instructions",
  placeholder = "You are a helpful assistant…",
  menuHint = "Choose a field — inserted as {{variable}}. Use JS expressions too, e.g. {{capabilities.length > 0 ? 'required: ' + capabilities : ''}}",
  globalMenuHint = "Company and department tokens use runInput — enable Run input. Pass companyId on the run to auto-load company memory.",
  globalReferencePreviewSections = [],
  structuredVariables = [],
  outputSchema,
  proEditorSubtitle,
  showProEditor = true,
  hideLabel = false,
  mono = false,
}: Props) {
  const [openMenu, setOpenMenu] = useState<ContextMenuKind | null>(null)
  const [proEditorOpen, setProEditorOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const localMenuSections = useMemo(() => buildLocalMenuSections(variables), [variables])
  const resolvedGlobalVariables = useMemo(
    () => globalVariables ?? buildGlobalContextVariables(globalTokenFormat),
    [globalVariables, globalTokenFormat],
  )
  const globalMenuSections = useMemo(
    () => buildGlobalMenuSections(resolvedGlobalVariables),
    [resolvedGlobalVariables],
  )

  const localFlatSections = useMemo(
    (): ContextPickerSection[] =>
      localMenuSections.flatMap((section) =>
        section.kind === "flat" ? [{ label: section.label, items: section.items }] : [],
      ),
    [localMenuSections],
  )
  const localUpstreamSections = useMemo(
    (): ContextPickerUpstreamGroup[] =>
      localMenuSections.flatMap((section) =>
        section.kind === "upstream" ? section.groups : [],
      ),
    [localMenuSections],
  )

  useEffect(() => {
    if (!openMenu) return
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [openMenu])

  const insertToken = (token: string) => {
    const el = textareaRef.current
    if (!el) {
      onChange(`${value}${token}`)
      setOpenMenu(null)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = `${value.slice(0, start)}${token}${value.slice(end)}`
    onChange(next)
    setOpenMenu(null)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + token.length
      el.setSelectionRange(pos, pos)
    })
  }

  const toggleMenu = (kind: ContextMenuKind) => {
    setOpenMenu((current) => (current === kind ? null : kind))
    textareaRef.current?.focus()
  }

  return (
    <div className="instructions" ref={rootRef}>
      {hideLabel ? null : (
        <div className="label-row">
          <span className="label">{label}</span>
          {showProEditor ? (
            <button
              type="button"
              className="pro-btn"
              onClick={() => setProEditorOpen(true)}
              aria-label={`Open expanded ${label.toLowerCase()} editor`}
              title="Open expanded editor"
            >
              <TbArrowsDiagonal size={14} aria-hidden />
            </button>
          ) : null}
        </div>
      )}

      <div className="editor-wrap">
        <textarea
          ref={textareaRef}
          className={`textarea${mono ? " textarea--mono" : ""}`}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />

        <InstructionsContextPicker
          openMenu={openMenu}
          onToggleMenu={toggleMenu}
          showGlobalContext={showGlobalContext}
          localFlatSections={localFlatSections}
          localUpstreamSections={localUpstreamSections}
          globalFlatSections={globalMenuSections}
          localMenuHint={menuHint}
          globalMenuHint={globalMenuHint}
          globalReferencePreviewSections={globalReferencePreviewSections}
          localEmptyMessage="Enable run input or shared context, or connect an upstream node on the canvas."
          sourceText={value}
          onInsert={insertToken}
          showExpand={hideLabel && showProEditor}
          onExpand={() => setProEditorOpen(true)}
          expandAriaLabel={`Open expanded ${label.toLowerCase()} editor`}
        />
      </div>

      <PromptProEditorModal
        open={proEditorOpen}
        title={label}
        subtitle={proEditorSubtitle}
        value={value}
        onChange={onChange}
        onClose={() => setProEditorOpen(false)}
        placeholder={placeholder}
        mono={mono}
        localFlatSections={localFlatSections}
        localUpstreamSections={localUpstreamSections}
        globalFlatSections={globalMenuSections}
        structuredVariables={structuredVariables}
        outputSchema={outputSchema}
      />

      <style jsx>{`
        .instructions {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--app-text);
        }
        .pro-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          padding: 0;
          border: 1px solid var(--app-border);
          border-radius: calc(var(--app-radius) - 2px);
          background: var(--app-surface);
          color: var(--app-text-muted);
          cursor: pointer;
          flex-shrink: 0;
        }
        .pro-btn:hover {
          color: var(--app-text);
          border-color: var(--app-border-strong);
          background: var(--app-surface-muted);
        }
        .editor-wrap {
          position: relative;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
        }
        .editor-wrap:focus-within {
          border-color: var(--app-border-strong);
          box-shadow: var(--app-btn-focus-ring);
        }
        .textarea {
          display: block;
          width: 100%;
          min-height: 9rem;
          padding: 0.625rem 0.625rem 3.25rem;
          border: none;
          background: transparent;
          resize: vertical;
          font-size: 0.8125rem;
          line-height: 1.5;
          color: var(--app-text);
          font-family: var(--app-font);
        }
        .textarea:focus {
          outline: none;
        }
        .textarea--mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.6875rem;
        }
      `}</style>
    </div>
  )
}
