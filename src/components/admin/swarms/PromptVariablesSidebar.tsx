"use client"

import { useMemo } from "react"
import { collectUsedPromptTokens } from "@/lib/prompt-token-usage"
import styles from "./PromptVariablesSidebar.module.css"
import type {
  ContextPickerSection,
  ContextPickerUpstreamGroup,
} from "./InstructionsContextPicker"

export type StructuredPromptVariable = {
  token: string
  label: string
}

type VariableItem = {
  token: string
  label: string
}

type Props = {
  localFlatSections: ContextPickerSection[]
  localUpstreamSections: ContextPickerUpstreamGroup[]
  globalFlatSections: ContextPickerSection[]
  structuredVariables?: StructuredPromptVariable[]
  /** Instructions / prompt body — used to mark variables already referenced. */
  sourceText?: string
  onInsert: (token: string) => void
  /** `start` = left column (border on the right); `end` = right column. */
  edge?: "start" | "end"
}

function VariableList({
  items,
  usedTokens,
  onInsert,
}: {
  items: VariableItem[]
  usedTokens: Set<string>
  onInsert: (token: string) => void
}) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const isUsed = usedTokens.has(item.token)
        return (
          <li key={item.token}>
            <button
              type="button"
              className={`${styles.item}${isUsed ? ` ${styles.itemUsed}` : ""}`}
              onClick={() => onInsert(item.token)}
              aria-pressed={isUsed}
            >
              {isUsed ? (
                <span className={styles.usedMark} title="Used in instructions" aria-hidden />
              ) : (
                <span className={styles.usedMarkPlaceholder} aria-hidden />
              )}
              <span className={styles.itemLabel}>{item.label}</span>
              <code className={styles.itemToken}>{item.token}</code>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function FlatSections({
  sections,
  usedTokens,
  onInsert,
}: {
  sections: ContextPickerSection[]
  usedTokens: Set<string>
  onInsert: (token: string) => void
}) {
  return (
    <>
      {sections.map((section) => (
        <div key={section.label} className={styles.group}>
          <span className={styles.groupLabel}>{section.label}</span>
          <VariableList items={section.items} usedTokens={usedTokens} onInsert={onInsert} />
        </div>
      ))}
    </>
  )
}

function collectSidebarTokens(
  localFlatSections: ContextPickerSection[],
  localUpstreamSections: ContextPickerUpstreamGroup[],
  globalFlatSections: ContextPickerSection[],
  structuredVariables: StructuredPromptVariable[],
): string[] {
  const tokens: string[] = []
  for (const section of localFlatSections) {
    for (const item of section.items) tokens.push(item.token)
  }
  for (const group of localUpstreamSections) {
    for (const item of group.items) tokens.push(item.token)
  }
  for (const section of globalFlatSections) {
    for (const item of section.items) tokens.push(item.token)
  }
  for (const item of structuredVariables) tokens.push(item.token)
  return tokens
}

export default function PromptVariablesSidebar({
  localFlatSections,
  localUpstreamSections,
  globalFlatSections,
  structuredVariables = [],
  sourceText = "",
  onInsert,
  edge = "end",
}: Props) {
  const hasLocal =
    localFlatSections.length > 0 || localUpstreamSections.length > 0
  const hasGlobal = globalFlatSections.length > 0
  const hasStructured = structuredVariables.length > 0

  const usedTokens = useMemo(() => {
    const candidates = collectSidebarTokens(
      localFlatSections,
      localUpstreamSections,
      globalFlatSections,
      structuredVariables,
    )
    return collectUsedPromptTokens(sourceText, candidates)
  }, [
    sourceText,
    localFlatSections,
    localUpstreamSections,
    globalFlatSections,
    structuredVariables,
  ])

  const usedCount = usedTokens.size

  return (
    <aside
      className={`${styles.sidebar}${edge === "start" ? ` ${styles.sidebarStart}` : ""}`}
      aria-label="Prompt variables"
    >
      {usedCount > 0 ? (
        <p className={styles.usageLegend}>
          <span className={styles.usedMark} aria-hidden />
          {usedCount} in use
        </p>
      ) : null}

      {hasLocal ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Local context</h3>
          <FlatSections
            sections={localFlatSections}
            usedTokens={usedTokens}
            onInsert={onInsert}
          />
          {localUpstreamSections.map((group) => (
            <div key={group.workerId} className={styles.group}>
              <span className={styles.groupLabel}>{group.workerName}</span>
              <VariableList items={group.items} usedTokens={usedTokens} onInsert={onInsert} />
            </div>
          ))}
        </section>
      ) : null}

      {hasGlobal ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Global context</h3>
          <FlatSections
            sections={globalFlatSections}
            usedTokens={usedTokens}
            onInsert={onInsert}
          />
        </section>
      ) : null}

      {hasStructured ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Output fields</h3>
          <VariableList
            items={structuredVariables}
            usedTokens={usedTokens}
            onInsert={onInsert}
          />
        </section>
      ) : null}

      {!hasLocal && !hasGlobal && !hasStructured ? (
        <p className={styles.empty}>No context variables available for this node.</p>
      ) : null}
    </aside>
  )
}
