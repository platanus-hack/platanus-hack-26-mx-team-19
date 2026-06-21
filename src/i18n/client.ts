"use client"

import { useEffect, useMemo, useState } from "react"
import en from "@/messages/en.json"
import es from "@/messages/es.json"

export type Locale = "en" | "es"

export const DEFAULT_LOCALE: Locale = "en"

const bundles = { en, es } as const

export type Messages = typeof en

export function readLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE
  const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/)
  const v = m?.[1]?.trim()
  return v === "es" ? "es" : "en"
}

/** Client copy bundle: defaults to English; uses `NEXT_LOCALE` when set to `es` (e.g. legacy `/es/...` links). */
export function useMessages(): Messages {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  useEffect(() => {
    setLocale(readLocaleFromCookie())
  }, [])
  return useMemo(() => bundles[locale], [locale])
}
