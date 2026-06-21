"use client"

import { cn } from "@/lib/utils"
import PixelCanvas from "@/components/ui/PixelCanvas"
import styles from "./pixel-logo-grid.module.css"

type GridCell = {
  id: string
  label: string
  brand: string
  pixelColors: string[]
  row: number
  col: number
}

const PERIMETER_CELLS: GridCell[] = [
  { id: "hiring", label: "Hiring", brand: "#0a0a0a", pixelColors: ["#0a0a0a", "#525866", "#1463ff"], row: 1, col: 1 },
  { id: "procurement", label: "Procurement", brand: "#1463ff", pixelColors: ["#1463ff", "#0f52d9", "#8ab4ff"], row: 1, col: 2 },
  { id: "banking", label: "Banking", brand: "#16a34a", pixelColors: ["#16a34a", "#22c55e", "#86efac"], row: 1, col: 3 },
  { id: "outreach", label: "Outreach", brand: "#0a0a0a", pixelColors: ["#0a0a0a", "#8a8f99", "#d4d4d4"], row: 1, col: 4 },
  { id: "contracts", label: "Contracts", brand: "#525866", pixelColors: ["#525866", "#0a0a0a", "#eaeaea"], row: 1, col: 5 },
  { id: "agents", label: "Agents", brand: "#1463ff", pixelColors: ["#1463ff", "#eef3ff", "#0a0a0a"], row: 2, col: 1 },
  { id: "vendors", label: "Vendors", brand: "#0a0a0a", pixelColors: ["#0a0a0a", "#525866", "#f4f4f2"], row: 3, col: 1 },
  { id: "trials", label: "Trials", brand: "#16a34a", pixelColors: ["#16a34a", "#f0fdf4", "#15803d"], row: 2, col: 5 },
  { id: "rates", label: "Rates", brand: "#1463ff", pixelColors: ["#1463ff", "#0a0a0a", "#a8c7ff"], row: 3, col: 5 },
  { id: "reporting", label: "Reporting", brand: "#525866", pixelColors: ["#525866", "#8a8f99", "#0a0a0a"], row: 4, col: 1 },
  { id: "workflow", label: "Workflow", brand: "#0a0a0a", pixelColors: ["#0a0a0a", "#1463ff", "#eaeaea"], row: 4, col: 2 },
  { id: "money", label: "Money rails", brand: "#16a34a", pixelColors: ["#16a34a", "#0a0a0a", "#bbf7d0"], row: 4, col: 3 },
  { id: "ops", label: "Operations", brand: "#1463ff", pixelColors: ["#1463ff", "#525866", "#ffffff"], row: 4, col: 4 },
  { id: "launch", label: "Launch", brand: "#0a0a0a", pixelColors: ["#0a0a0a", "#16a34a", "#1463ff"], row: 4, col: 5 },
]

function GridCellCard({ cell }: { cell: GridCell }) {
  const { label, brand, pixelColors, row, col } = cell

  return (
    <div
      className={styles.cell}
      style={
        {
          "--brand": brand,
          gridRow: row,
          gridColumn: col,
        } as React.CSSProperties
      }
    >
      <PixelCanvas colors={pixelColors} gap={5} speed={30} />
      <span className={styles.cellLabel}>{label}</span>
    </div>
  )
}

export type HeroPixelGridProps = {
  badge?: string
  heading?: string
  className?: string
}

export function HeroPixelGrid({
  badge = "Swarm lab",
  heading = "Design topology → run → inspect traces",
  className,
}: HeroPixelGridProps) {
  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.grid} role="presentation">
        {PERIMETER_CELLS.map((cell) => (
          <GridCellCard key={cell.id} cell={cell} />
        ))}

        <div className={styles.center}>
          <span className={styles.centerBadge}>{badge}</span>
          <p className={styles.centerTitle}>{heading}</p>
        </div>
      </div>
    </div>
  )
}

/** Alias for drop-in demos / shadcn-style imports. */
export const Component = HeroPixelGrid

export default HeroPixelGrid
