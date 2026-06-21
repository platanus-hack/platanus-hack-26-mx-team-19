"use client"

import { useLocale } from "@/i18n/LocaleProvider"
import { useMessages } from "@/i18n/LocaleProvider"
import type { Locale } from "@/i18n/locale"

type Props = {
  className?: string
}

export default function LocaleToggle({ className = "" }: Props) {
  const { locale, setLocale } = useLocale()
  const t = useMessages().locale

  const pick = (next: Locale) => {
    if (next !== locale) setLocale(next)
  }

  return (
    <div
      className={`locale-toggle${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={t.switchLabel}
    >
      <button
        type="button"
        className={`locale-tag${locale === "en" ? " locale-tag--on" : ""}`}
        aria-pressed={locale === "en"}
        onClick={() => pick("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`locale-tag${locale === "es" ? " locale-tag--on" : ""}`}
        aria-pressed={locale === "es"}
        onClick={() => pick("es")}
      >
        ES
      </button>

      <style jsx>{`
        .locale-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.125rem;
          padding: 0.125rem;
          border: 1px solid var(--app-border);
          border-radius: 999px;
          background: var(--app-surface);
        }
        .locale-tag {
          min-width: 1.75rem;
          padding: 0.2rem 0.45rem;
          border: none;
          border-radius: 999px;
          background: transparent;
          font-family: var(--app-font);
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--app-text-faint);
          cursor: pointer;
          transition:
            background 0.15s ease,
            color 0.15s ease;
        }
        .locale-tag:hover {
          color: var(--app-text-muted);
        }
        .locale-tag--on {
          background: var(--app-text);
          color: var(--app-bg);
        }
        .locale-tag--on:hover {
          color: var(--app-bg);
        }
      `}</style>
    </div>
  )
}
