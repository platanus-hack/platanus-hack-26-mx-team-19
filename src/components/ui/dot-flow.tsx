"use client"

import { useEffect, useRef, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { cn } from "@/lib/utils"
import { DotLoader } from "@/components/ui/dot-loader"
import styles from "./dot-flow.module.css"

export type DotFlowFrames = readonly (readonly number[])[]

export type DotFlowItem = {
  title: string
  frames: DotFlowFrames
  duration?: number
  repeatCount?: number
}

export type DotFlowProps = {
  items: DotFlowItem[]
  tone?: "dark" | "light"
  className?: string
}

export function DotFlow({ items, tone = "dark", className }: DotFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [textIndex, setTextIndex] = useState(0)

  const { contextSafe } = useGSAP()
  const current = items[index] ?? items[0]
  const currentText = items[textIndex] ?? items[0]

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return

    const newWidth = textRef.current.offsetWidth + 1

    gsap.to(containerRef.current, {
      width: newWidth,
      duration: 0.5,
      ease: "power2.out",
    })
  }, [textIndex, currentText?.title])

  const next = contextSafe(() => {
    const el = containerRef.current
    if (!el || items.length <= 1) return

    gsap.to(el, {
      y: 20,
      opacity: 0,
      filter: "blur(8px)",
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        setTextIndex((prev) => (prev + 1) % items.length)
        gsap.fromTo(
          el,
          { y: -20, opacity: 0, filter: "blur(4px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power2.out",
          },
        )
      },
    })

    setIndex((prev) => (prev + 1) % items.length)
  })

  if (!current || !currentText) return null

  return (
    <div
      className={cn(
        styles.shell,
        tone === "light" ? styles.shellLight : styles.shellDark,
        className,
      )}
    >
      <DotLoader
        frames={current.frames}
        onComplete={items.length > 1 ? next : undefined}
        repeatCount={current.repeatCount ?? (items.length > 1 ? 1 : -1)}
        duration={current.duration ?? 150}
        dotTone={tone}
      />
      <div ref={containerRef} className={styles.textWrap}>
        <div
          ref={textRef}
          className={cn(
            styles.title,
            tone === "light" ? styles.titleLight : styles.titleDark,
          )}
          title={currentText.title}
        >
          {currentText.title}
        </div>
      </div>
    </div>
  )
}
