"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import styles from "./pixel-grid.module.css"

export type PixelGridProps = {
  bgColor?: string
  pixelColor?: string
  pixelSize?: number
  pixelSpacing?: number
  pixelDeathFade?: number
  pixelBornFade?: number
  pixelMaxLife?: number
  pixelMinLife?: number
  pixelMaxOffLife?: number
  pixelMinOffLife?: number
  className?: string
  glow?: boolean
}

type Pixel = {
  xPos: number
  yPos: number
  alpha: number
  maxAlpha: number
  life: number
  offLife: number
  isLit: boolean
  dying: boolean
  deathFade: number
  bornFade: number
  randomizeSelf: () => void
}

export function PixelGrid({
  bgColor = "transparent",
  pixelColor = "#1463ff",
  pixelSize = 3,
  pixelSpacing = 4,
  pixelDeathFade = 10,
  pixelBornFade = 50,
  pixelMaxLife = 500,
  pixelMinLife = 250,
  pixelMaxOffLife = 500,
  pixelMinOffLife = 200,
  glow = false,
  className,
}: PixelGridProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixelsRef = useRef<Pixel[]>([])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducedMotion) return

    const c2d = canvas.getContext("2d", { alpha: true })
    if (!c2d) return

    let rafId = 0
    let disposed = false

    const randomAlpha = () => {
      const rand = Math.random() * 100
      if (rand > 92) return 0.35
      if (rand > 85) return 0.18
      return 0.08
    }

    const randomizePixelAttrs = (x: number, y: number): Pixel => {
      const alpha = randomAlpha()
      const lit = alpha !== 0.08
      return {
        xPos: x * (pixelSize + pixelSpacing),
        yPos: y * (pixelSize + pixelSpacing),
        alpha: 0,
        maxAlpha: alpha,
        life:
          Math.floor(Math.random() * (pixelMaxLife - pixelMinLife + 1)) + pixelMinLife,
        offLife:
          Math.floor(Math.random() * (pixelMaxOffLife - pixelMinOffLife + 1)) +
          pixelMinOffLife,
        isLit: lit,
        dying: false,
        deathFade: pixelDeathFade,
        bornFade: pixelBornFade,
        randomizeSelf() {
          const newAlpha = randomAlpha()
          this.alpha = 0
          this.maxAlpha = newAlpha
          this.life =
            Math.floor(Math.random() * (pixelMaxLife - pixelMinLife + 1)) + pixelMinLife
          this.offLife =
            Math.floor(Math.random() * (pixelMaxOffLife - pixelMinOffLife + 1)) +
            pixelMinOffLife
          this.isLit = newAlpha !== 0.08
          this.dying = false
          this.deathFade = pixelDeathFade
          this.bornFade = pixelBornFade
        },
      }
    }

    const resizeCanvas = () => {
      const { width, height } = wrap.getBoundingClientRect()
      const w = Math.max(1, Math.floor(width))
      const h = Math.max(1, Math.floor(height))
      canvas.width = w
      canvas.height = h

      const cols = Math.ceil(w / (pixelSize + pixelSpacing))
      const rows = Math.ceil(h / (pixelSize + pixelSpacing))
      pixelsRef.current = []
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          pixelsRef.current.push(randomizePixelAttrs(x, y))
        }
      }
    }

    resizeCanvas()

    const drawPixel = (pixel: Pixel) => {
      pixel.alpha = Math.min(Math.max(pixel.alpha, 0.08), pixel.maxAlpha)
      c2d.fillStyle = `${pixelColor}${Math.floor(pixel.alpha * 255)
        .toString(16)
        .padStart(2, "0")}`
      c2d.fillRect(pixel.xPos, pixel.yPos, pixelSize, pixelSize)

      if (pixel.isLit) {
        if (pixel.bornFade <= 0) {
          if (pixel.life <= 0) {
            pixel.dying = true
            if (pixel.deathFade <= 0) pixel.randomizeSelf()
            else {
              pixel.alpha = (pixel.deathFade / pixelDeathFade) * pixel.maxAlpha
              pixel.deathFade--
            }
          } else pixel.life--
        } else {
          pixel.alpha = pixel.maxAlpha - pixel.bornFade / pixelBornFade
          pixel.bornFade--
        }
      } else {
        if (pixel.offLife <= 0) pixel.isLit = true
        pixel.offLife--
      }
    }

    const renderLoop = () => {
      if (disposed) return

      if (bgColor === "transparent") c2d.clearRect(0, 0, canvas.width, canvas.height)
      else {
        c2d.fillStyle = bgColor
        c2d.fillRect(0, 0, canvas.width, canvas.height)
      }

      if (glow) {
        c2d.shadowBlur = 8
        c2d.shadowColor = pixelColor
      } else {
        c2d.shadowBlur = 0
      }

      for (const pixel of pixelsRef.current) drawPixel(pixel)
      rafId = requestAnimationFrame(renderLoop)
    }

    rafId = requestAnimationFrame(renderLoop)

    const resizeObserver = new ResizeObserver(() => resizeCanvas())
    resizeObserver.observe(wrap)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
    }
  }, [
    bgColor,
    pixelColor,
    pixelSize,
    pixelSpacing,
    pixelDeathFade,
    pixelBornFade,
    pixelMaxLife,
    pixelMinLife,
    pixelMaxOffLife,
    pixelMinOffLife,
    glow,
  ])

  return (
    <div ref={wrapRef} className={cn(styles.wrap, className)} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
