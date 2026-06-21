"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5"
import styles from "./theme-toggle.module.css"

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button type="button" className={styles.toggle} aria-label="Toggle theme" disabled>
        <IoSunnyOutline className={styles.icon} aria-hidden />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"
  const nextTheme = isDark ? "light" : "dark"

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setTheme(nextTheme)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <IoSunnyOutline className={styles.icon} aria-hidden />
      ) : (
        <IoMoonOutline className={styles.icon} aria-hidden />
      )}
    </button>
  )
}
