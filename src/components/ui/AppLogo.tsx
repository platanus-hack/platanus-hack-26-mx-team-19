import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import LogoMark from "./LogoMark"
import styles from "./app-logo.module.css"

export type AppLogoSize = "sm" | "md" | "lg"

type Props = {
  /** Full brand string, e.g. "agentatlas". Splits at "atlas" when present. */
  name?: string
  /** Set to `null` for static logo (no navigation). Default `/`. */
  href?: string | null
  size?: AppLogoSize
  showWordmark?: boolean
  className?: string
  markVariant?: "filled" | "outline"
  children?: ReactNode
}

const MARK_PX: Record<AppLogoSize, number> = {
  sm: 20,
  md: 24,
  lg: 32,
}

export function splitBrandWordmark(name: string): { prefix: string; suffix: string } {
  const lower = name.toLowerCase()
  for (const suffix of ["atlas"] as const) {
    const idx = lower.indexOf(suffix)
    if (idx !== -1) {
      return {
        prefix: name.slice(0, idx),
        suffix: name.slice(idx),
      }
    }
  }
  return { prefix: name, suffix: "" }
}

export default function AppLogo({
  name = "agentatlas",
  href = "/",
  size = "md",
  showWordmark = true,
  className,
  markVariant = "filled",
  children,
}: Props) {
  const { prefix, suffix } = splitBrandWordmark(name)
  const markSize = MARK_PX[size]

  const content = (
    <>
      <span className={styles.mark}>
        <LogoMark size={markSize} variant={markVariant} />
      </span>
      {showWordmark ? (
        <span className={styles.wordmark}>
          {suffix ? (
            <>
              <span className={styles.prefix}>{prefix}</span>
              <span className={styles.suffix}>{suffix}</span>
            </>
          ) : (
            <span className={styles.suffix}>{name}</span>
          )}
        </span>
      ) : null}
      {children}
    </>
  )

  const rootClass = cn(styles.root, styles[size], className)

  if (href === null) {
    return (
      <span className={rootClass} aria-label={name}>
        {content}
      </span>
    )
  }

  return (
    <Link href={href} className={rootClass} aria-label={name}>
      {content}
    </Link>
  )
}
