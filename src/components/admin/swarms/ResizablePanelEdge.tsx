"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import { TbGripVertical } from "react-icons/tb"
import styles from "./ResizablePanelEdge.module.css"

type Props = {
  active: boolean
  onMouseDown: (event: ReactMouseEvent<HTMLButtonElement>) => void
  ariaLabel?: string
}

export default function ResizablePanelEdge({
  active,
  onMouseDown,
  ariaLabel = "Resize panel width",
}: Props) {
  return (
    <div className={`${styles.resize}${active ? ` ${styles.active}` : ""}`}>
      <button
        type="button"
        className={styles.handle}
        onMouseDown={onMouseDown}
        aria-label={ariaLabel}
        title="Drag to resize panel width"
      >
        <TbGripVertical size={14} aria-hidden />
      </button>
    </div>
  )
}
