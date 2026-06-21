"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import {
  type Locale,
  resolveInitialLocale,
  writeLocaleCookie,
} from "@/i18n/locale"

export type Messages = typeof en

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: Messages
}

const bundles = { en, es } as const satisfies Record<Locale, Messages>

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const initial = resolveInitialLocale()
    setLocaleState(initial)
    writeLocaleCookie(initial)
    document.documentElement.lang = initial
    setHydrated(true)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeLocaleCookie(next)
    document.documentElement.lang = next
  }, [])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: bundles[locale],
    }),
    [locale, setLocale],
  )

  if (!hydrated) {
    return (
      <LocaleContext.Provider
        value={{ locale: "en", setLocale, messages: bundles.en }}
      >
        {children}
      </LocaleContext.Provider>
    )
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): Pick<LocaleContextValue, "locale" | "setLocale"> {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return { locale: ctx.locale, setLocale: ctx.setLocale }
}

export function useMessages(): Messages {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useMessages must be used within LocaleProvider")
  }
  return ctx.messages
}
