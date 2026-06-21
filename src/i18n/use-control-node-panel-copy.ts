"use client"

import { useMemo } from "react"
import { useMessages } from "@/i18n/LocaleProvider"
import { controlNodeCopy } from "@/i18n/swarm-editor-nodes"

/** Localized label + description for a control-node config panel. */
export function useControlNodePanelCopy(kind: string, fallback: { label: string; description: string }) {
  const messages = useMessages()
  return useMemo(() => controlNodeCopy(messages, kind) ?? fallback, [messages, kind, fallback])
}
