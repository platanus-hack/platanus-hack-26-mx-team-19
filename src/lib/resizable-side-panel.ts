import { useCallback, useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react"

/** Align with Test swarm panel defaults (448–672px). */
export const SIDE_PANEL_MIN_WIDTH_PX = 448
export const SIDE_PANEL_DEFAULT_WIDTH_PX = 672
export const SIDE_PANEL_MAX_WIDTH_RATIO = 0.55
export const SIDE_PANEL_MAX_WIDTH_CAP_PX = 960

export function clampSidePanelWidth(
  width: number,
  min = SIDE_PANEL_MIN_WIDTH_PX,
  maxRatio = SIDE_PANEL_MAX_WIDTH_RATIO,
  maxCap = SIDE_PANEL_MAX_WIDTH_CAP_PX,
): number {
  const max = Math.min(
    typeof window !== "undefined" ? window.innerWidth * maxRatio : maxCap,
    maxCap,
  )
  return Math.round(Math.min(max, Math.max(min, width)))
}

type Options = {
  defaultWidth?: number
  minWidth?: number
}

export function useResizableSidePanelWidth(options: Options = {}) {
  const defaultWidth = options.defaultWidth ?? SIDE_PANEL_DEFAULT_WIDTH_PX
  const minWidth = options.minWidth ?? SIDE_PANEL_MIN_WIDTH_PX

  const [panelWidthPx, setPanelWidthPx] = useState(defaultWidth)
  const [resizeActive, setResizeActive] = useState(false)

  const startResize = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = panelWidthPx
      setResizeActive(true)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"

      const onMove = (moveEvent: MouseEvent) => {
        setPanelWidthPx(clampSidePanelWidth(startWidth + (startX - moveEvent.clientX), minWidth))
      }

      const onUp = () => {
        setResizeActive(false)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("mouseup", onUp)
      }

      window.addEventListener("mousemove", onMove)
      window.addEventListener("mouseup", onUp)
    },
    [minWidth, panelWidthPx],
  )

  const panelStyle = useMemo(
    (): CSSProperties => ({
      width: panelWidthPx,
      minWidth: panelWidthPx,
      maxWidth: panelWidthPx,
    }),
    [panelWidthPx],
  )

  return { panelWidthPx, panelStyle, resizeActive, startResize }
}
