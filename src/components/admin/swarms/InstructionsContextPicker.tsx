"use client"

import { useMemo } from "react"
import { TbArrowsDiagonal, TbBraces } from "react-icons/tb"
import { collectUsedPromptTokens } from "@/lib/prompt-token-usage"
import styles from "./InstructionsContextPicker.module.css"

export type ContextPickerItem = {
  token: string
  label: string
}

export type ContextPickerSection = {
  label: string
  items: ContextPickerItem[]
}

export type ContextPickerUpstreamGroup = {
  workerId: string
  workerName: string
  items: ContextPickerItem[]
}

export type ContextMenuKind = "local" | "global"

export type ContextPickerPreviewSection = {
  label: string
  body: string
}

type PanelContent = {
  ariaLabel: string
  hint: string
  emptyMessage?: string
  referencePreviewSections?: ContextPickerPreviewSection[]
  flatSections: ContextPickerSection[]
  upstreamSections: ContextPickerUpstreamGroup[]
}

type PickerLayout = "overlay" | "toolbar"

type Props = {
  openMenu: ContextMenuKind | null
  onToggleMenu: (kind: ContextMenuKind) => void
  showLocalContext?: boolean
  showGlobalContext?: boolean
  layout?: PickerLayout
  localFlatSections: ContextPickerSection[]
  localUpstreamSections: ContextPickerUpstreamGroup[]
  globalFlatSections: ContextPickerSection[]
  localMenuHint: string
  globalMenuHint: string
  globalReferencePreviewSections?: ContextPickerPreviewSection[]
  localEmptyMessage: string
  /** Instructions body — marks variables already referenced in the text. */
  sourceText?: string
  onInsert: (token: string) => void
  showExpand?: boolean
  onExpand?: () => void
  expandAriaLabel?: string
}

function VariableOption({
  variable,
  isUsed,
  onInsert,
}: {
  variable: ContextPickerItem
  isUsed: boolean
  onInsert: (token: string) => void
}) {
  return (
    <li>
      <button
        type="button"
        className={`${styles.item}${isUsed ? ` ${styles.itemUsed}` : ""}`}
        role="option"
        aria-pressed={isUsed}
        onClick={() => onInsert(variable.token)}
      >
        {isUsed ? (
          <span className={styles.usedMark} title="Used in instructions" aria-hidden />
        ) : (
          <span className={styles.usedMarkPlaceholder} aria-hidden />
        )}
        <span className={styles.itemLabel}>{variable.label}</span>
        <code className={styles.itemToken}>{variable.token}</code>
      </button>
    </li>
  )
}

function PickerPanelContent({
  content,
  usedTokens,
  onInsert,
}: {
  content: PanelContent
  usedTokens: Set<string>
  onInsert: (token: string) => void
}) {
  const hasContent =
    content.flatSections.length > 0 || content.upstreamSections.length > 0

  if (!hasContent) {
    return <p className={styles.empty}>{content.emptyMessage}</p>
  }

  const hasReferencePreview =
    content.referencePreviewSections != null && content.referencePreviewSections.length > 0

  return (
    <>
      {hasReferencePreview ? (
        <details className={styles.meta}>
          <summary className={styles.metaSummary}>Info & examples</summary>
          <p className={styles.hint}>{content.hint}</p>
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Example values at run time</span>
            {content.referencePreviewSections!.map((section) => (
              <div key={section.label} className={styles.previewSection}>
                <span className={styles.previewSectionLabel}>{section.label}</span>
                <pre className={styles.previewBody}>{section.body}</pre>
              </div>
            ))}
          </div>
        </details>
      ) : (
        <p className={styles.hint}>{content.hint}</p>
      )}
      {content.flatSections.map((section) => (
        <div key={section.label} className={styles.group}>
          <span className={styles.groupLabel}>{section.label}</span>
          <ul className={styles.list}>
            {section.items.map((variable) => (
              <VariableOption
                key={variable.token}
                variable={variable}
                isUsed={usedTokens.has(variable.token)}
                onInsert={onInsert}
              />
            ))}
          </ul>
        </div>
      ))}
      {content.upstreamSections.map((group) => (
        <div key={group.workerId} className={styles.group}>
          <span className={styles.groupLabel}>{group.workerName}</span>
          <ul className={styles.list}>
            {group.items.map((variable) => (
              <VariableOption
                key={variable.token}
                variable={variable}
                isUsed={usedTokens.has(variable.token)}
                onInsert={onInsert}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

export default function InstructionsContextPicker({
  openMenu,
  onToggleMenu,
  showLocalContext = true,
  showGlobalContext = true,
  layout = "overlay",
  localFlatSections,
  localUpstreamSections,
  globalFlatSections,
  localMenuHint,
  globalMenuHint,
  globalReferencePreviewSections = [],
  localEmptyMessage,
  sourceText = "",
  onInsert,
  showExpand = false,
  onExpand,
  expandAriaLabel = "Open expanded editor",
}: Props) {
  const isToolbar = layout === "toolbar"

  const usedTokens = useMemo(() => {
    const tokens = [
      ...localFlatSections.flatMap((section) => section.items.map((item) => item.token)),
      ...localUpstreamSections.flatMap((group) => group.items.map((item) => item.token)),
      ...globalFlatSections.flatMap((section) => section.items.map((item) => item.token)),
    ]
    return collectUsedPromptTokens(sourceText, tokens)
  }, [sourceText, localFlatSections, localUpstreamSections, globalFlatSections])

  const activePanel: PanelContent | null =
    openMenu === "local"
      ? {
          ariaLabel: "Insert local context variable",
          hint: localMenuHint,
          emptyMessage: localEmptyMessage,
          flatSections: localFlatSections,
          upstreamSections: localUpstreamSections,
        }
      : openMenu === "global"
        ? {
            ariaLabel: "Insert global context variable",
            hint: globalMenuHint,
            referencePreviewSections: globalReferencePreviewSections,
            flatSections: globalFlatSections,
            upstreamSections: [],
          }
        : null

  return (
    <div className={isToolbar ? styles.rootToolbar : styles.root}>
      <div className={isToolbar ? `${styles.actions} ${styles.actionsToolbar}` : styles.actions}>
        {showLocalContext ? (
          <button
            type="button"
            className={`${styles.btn}${openMenu === "local" ? ` ${styles.btnOn}` : ""}`}
            aria-expanded={openMenu === "local"}
            aria-haspopup="listbox"
            onClick={() => onToggleMenu("local")}
          >
            <span>Add Local Context</span>
            <TbBraces size={14} aria-hidden />
          </button>
        ) : null}
        {showGlobalContext ? (
          <button
            type="button"
            className={`${styles.btn}${openMenu === "global" ? ` ${styles.btnOn}` : ""}`}
            aria-expanded={openMenu === "global"}
            aria-haspopup="listbox"
            onClick={() => onToggleMenu("global")}
          >
            <span>Add Global Context</span>
            <TbBraces size={14} aria-hidden />
          </button>
        ) : null}
        {showExpand ? (
          <button
            type="button"
            className={styles.btn}
            onClick={onExpand}
            aria-label={expandAriaLabel}
            title="Open expanded editor"
          >
            <TbArrowsDiagonal size={14} aria-hidden />
          </button>
        ) : null}
      </div>

      {activePanel ? (
        <div
          className={`${styles.panel}${isToolbar ? ` ${styles.panelToolbar}` : ""}`}
          role="listbox"
          aria-label={activePanel.ariaLabel}
        >
          <PickerPanelContent
            content={activePanel}
            usedTokens={usedTokens}
            onInsert={onInsert}
          />
        </div>
      ) : null}
    </div>
  )
}
