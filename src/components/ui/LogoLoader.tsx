"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"
import styles from "./logo-loader.module.css"

const ACCENT = "#1463ff"
const ACCENT_SOFT = "#8ab4ff"
const TILE_ANCHOR = { x: 11.25, y: 11.25 }
const TILE_SIZE = 4
const TILE_RX = 1.1

/** Clockwise slot index: 0 TL, 1 TR, 2 BR, 3 BL — matches LogoMark layout. */
const TILES = [
  { start: 0, accent: false },
  { start: 1, accent: false },
  { start: 3, accent: false },
  { start: 2, accent: true },
] as const

const TILE_FROM_CLASS = [
  styles.tileFrom0,
  styles.tileFrom1,
  styles.tileFrom2,
  styles.tileFrom3,
] as const

type Props = {
  size?: number
  className?: string
  /** Filled mark, outline mark, or inner grid only (best for tight inline spots). */
  variant?: "filled" | "outline" | "tiles"
  /** Softer, lighter tiles — good on dark node squares. */
  tone?: "default" | "soft"
  label?: string
}

function InnerFrame({
  filled,
  frameStrokeOpacity,
}: {
  filled: boolean
  frameStrokeOpacity: number
}) {
  return (
    <rect
      x="9"
      y="9"
      width="14"
      height="14"
      rx="3.5"
      fill="none"
      stroke={filled ? "#ffffff" : "currentColor"}
      strokeOpacity={frameStrokeOpacity}
      strokeWidth="1"
    />
  )
}

/** Animated agentatlas mark — floor tiles rotate clockwise through each corner. */
export default function LogoLoader({
  size = 24,
  className,
  variant = "filled",
  tone = "default",
  label = "Loading",
}: Props) {
  const filled = variant === "filled"
  const soft = tone === "soft"
  const gradientId = useId().replace(/:/g, "")
  const frameStrokeOpacity = soft ? (filled ? 0.34 : 0.58) : filled ? 0.22 : 0.35
  const tileFillOpacity = soft ? 0.78 : filled ? 0.38 : 0.45
  const accent = soft ? ACCENT_SOFT : ACCENT

  return (
    <span className={cn(styles.root, className)} role="status" aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {variant === "filled" ? (
          <>
            <rect x="4" y="4" width="24" height="24" rx="7" fill="currentColor" />
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="7"
              fill={`url(#${gradientId})`}
              fillOpacity="0.16"
            />
            <defs>
              <linearGradient id={gradientId} x1="16" y1="4" x2="16" y2="17">
                <stop stopColor="#ffffff" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <InnerFrame filled frameStrokeOpacity={frameStrokeOpacity} />
          </>
        ) : variant === "outline" ? (
          <>
            <rect
              x="5"
              y="5"
              width="22"
              height="22"
              rx="6"
              stroke="currentColor"
              strokeWidth="2.25"
            />
            <InnerFrame filled={false} frameStrokeOpacity={frameStrokeOpacity} />
          </>
        ) : (
          <InnerFrame filled={false} frameStrokeOpacity={frameStrokeOpacity} />
        )}

        {TILES.map((tile) => (
          <g
            key={tile.start}
            className={cn(styles.tile, TILE_FROM_CLASS[tile.start])}
          >
            <rect
              x={TILE_ANCHOR.x}
              y={TILE_ANCHOR.y}
              width={TILE_SIZE}
              height={TILE_SIZE}
              rx={TILE_RX}
              fill={tile.accent ? accent : filled ? "#ffffff" : "currentColor"}
              fillOpacity={tile.accent ? 1 : tileFillOpacity}
            />
          </g>
        ))}
      </svg>
    </span>
  )
}
