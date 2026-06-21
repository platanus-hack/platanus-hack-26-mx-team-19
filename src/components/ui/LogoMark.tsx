import { useId } from "react"
import { cn } from "@/lib/utils"

const ACCENT = "#1463ff"

/** Hub-and-spoke graph inside the mark (viewBox 0 0 32 32). */
const HUB = { x: 16, y: 16.5, r: 2.35 }
const SPOKES = [
  { x: 16, y: 10.75 },
  { x: 10.25, y: 20.25 },
  { x: 21.75, y: 20.25 },
] as const
const SPOKE_R = 1.85

type Props = {
  size?: number
  className?: string
  /** Filled tile (default) or hairline outline */
  variant?: "filled" | "outline"
}

function SwarmGraph({ filled }: { filled: boolean }) {
  const edgeColor = filled ? "#ffffff" : "currentColor"
  const edgeOpacity = filled ? 0.28 : 0.38
  const nodeColor = filled ? "#ffffff" : "currentColor"
  const nodeOpacity = filled ? 0.42 : 0.55

  return (
    <>
      {SPOKES.map((node) => (
        <line
          key={`${node.x}-${node.y}`}
          x1={HUB.x}
          y1={HUB.y}
          x2={node.x}
          y2={node.y}
          stroke={edgeColor}
          strokeOpacity={edgeOpacity}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      ))}
      {SPOKES.map((node) => (
        <circle
          key={`node-${node.x}-${node.y}`}
          cx={node.x}
          cy={node.y}
          r={SPOKE_R}
          fill={nodeColor}
          fillOpacity={nodeOpacity}
        />
      ))}
      <circle cx={HUB.x} cy={HUB.y} r={HUB.r} fill={ACCENT} />
    </>
  )
}

/** Flat mark: rounded square with swarm graph — use inside AppLogo or alone. */
export default function LogoMark({ size = 24, className, variant = "filled" }: Props) {
  const filled = variant !== "outline"
  const gradientId = useId().replace(/:/g, "")

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden
    >
      {filled ? (
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
          <SwarmGraph filled />
        </>
      ) : (
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
          <SwarmGraph filled={false} />
        </>
      )}
    </svg>
  )
}
