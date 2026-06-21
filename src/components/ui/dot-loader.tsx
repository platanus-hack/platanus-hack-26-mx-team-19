"use client"

import { type ComponentProps, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import styles from "./dot-loader.module.css"

type DotLoaderTone = "dark" | "light"

type DotLoaderProps = {
  frames: readonly (readonly number[])[]
  dotTone?: DotLoaderTone
  isPlaying?: boolean
  duration?: number
  repeatCount?: number
  onComplete?: () => void
} & ComponentProps<"div">

export function DotLoader({
  frames,
  isPlaying = true,
  duration = 100,
  dotTone = "dark",
  className,
  repeatCount = -1,
  onComplete,
  ...props
}: DotLoaderProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const currentIndex = useRef(0)
  const repeats = useRef(0)
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)

  const dotClass = dotTone === "light" ? styles.dotLight : styles.dotDark
  const dotActiveClass = dotTone === "light" ? styles.dotLightActive : styles.dotDarkActive

  const applyFrameToDots = useCallback(
    (dots: HTMLDivElement[], frameIndex: number) => {
      const frame = frames[frameIndex]
      if (!frame) return

      dots.forEach((dot, index) => {
        const active = frame.includes(index)
        if (dotActiveClass) {
          dot.classList.toggle(dotActiveClass, active)
        }
      })
    },
    [dotActiveClass],
  )

  useEffect(() => {
    currentIndex.current = 0
    repeats.current = 0
  }, [frames])

  useEffect(() => {
    if (isPlaying) {
      if (currentIndex.current >= frames.length) {
        currentIndex.current = 0
      }
      const dotElements = gridRef.current?.children
      if (!dotElements) return
      const dots = Array.from(dotElements) as HTMLDivElement[]
      interval.current = setInterval(() => {
        applyFrameToDots(dots, currentIndex.current)
        if (currentIndex.current + 1 >= frames.length) {
          if (repeatCount !== -1 && repeats.current + 1 >= repeatCount) {
            if (interval.current) clearInterval(interval.current)
            onComplete?.()
          }
          repeats.current += 1
        }
        currentIndex.current = (currentIndex.current + 1) % frames.length
      }, duration)
    } else if (interval.current) {
      clearInterval(interval.current)
    }

    return () => {
      if (interval.current) clearInterval(interval.current)
    }
  }, [frames, isPlaying, applyFrameToDots, duration, repeatCount, onComplete])

  return (
    <div {...props} ref={gridRef} className={cn(styles.grid, className)}>
      {Array.from({ length: 49 }).map((_, i) => (
        <div key={i} className={cn(styles.dot, dotClass)} />
      ))}
    </div>
  )
}
