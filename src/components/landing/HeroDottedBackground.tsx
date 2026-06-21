"use client"

import { DottedSurface } from "@/components/ui/dotted-surface"
import styles from "./hero-dotted-background.module.css"

export default function HeroDottedBackground() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <DottedSurface layout="contained" />
      <div className={styles.glow} />
      <div className={styles.fadeBottom} />
    </div>
  )
}
