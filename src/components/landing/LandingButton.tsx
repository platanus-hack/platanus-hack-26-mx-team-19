"use client"

import { useRouter } from "next/navigation"
import type { MouseEvent, ReactNode } from "react"
import { cn } from "@/lib/utils"
import styles from "./landing-button.module.css"

export type LandingButtonVariant = "primary" | "secondary" | "ghost"
export type LandingButtonSize = "md" | "lg"

type Props = {
  /** Route or hash target (e.g. `/sign-up`, `#network`). */
  href: string
  children: ReactNode
  variant?: LandingButtonVariant
  size?: LandingButtonSize
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
  onClick?: () => void
  /** White buttons on dark CTA section */
  inverted?: boolean
}

function variantClass(
  variant: LandingButtonVariant,
  inverted: boolean,
): string | undefined {
  if (inverted) {
    if (variant === "primary") return styles.invertedPrimary
    if (variant === "secondary") return styles.invertedSecondary
    return styles.ghost
  }
  if (variant === "primary") return styles.primary
  if (variant === "secondary") return styles.secondary
  return styles.ghost
}

function navigate(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("#")) {
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    window.location.hash = href
    return
  }
  if (href.startsWith("http://") || href.startsWith("https://") || href.endsWith(".md")) {
    window.open(href, "_blank", "noopener,noreferrer")
    return
  }
  router.push(href)
}

export default function LandingButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className: classNameProp,
  type = "button",
  disabled = false,
  onClick,
  inverted = false,
}: Props) {
  const router = useRouter()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    onClick?.()
    if (type === "button") {
      event.preventDefault()
      navigate(href, router)
    }
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        styles.root,
        variantClass(variant, inverted),
        size === "lg" && styles.lg,
        inverted && styles.inverted,
        classNameProp,
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}
