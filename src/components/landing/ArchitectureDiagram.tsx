import type { ArchitectureTopology } from "@/content/landing"
import styles from "./architecture-diagram.module.css"

type Props = {
  topology: ArchitectureTopology
}

const NODE = { r: 10, stroke: "var(--app-border-strong)", fill: "var(--app-surface)" }
const EDGE = { stroke: "var(--app-border-strong)", strokeWidth: 1.5 }
const ACCENT = { stroke: "var(--app-accent)", fill: "var(--app-accent-soft)" }

function Node({
  cx,
  cy,
  accent = false,
  label,
}: {
  cx: number
  cy: number
  accent?: boolean
  label?: string
}) {
  const style = accent ? ACCENT : NODE
  return (
    <g>
      <circle cx={cx} cy={cy} r={NODE.r} fill={style.fill} stroke={style.stroke} strokeWidth={1.5} />
      {label ? (
        <text x={cx} y={cy + 3} textAnchor="middle" className={styles.label}>
          {label}
        </text>
      ) : null}
    </g>
  )
}

function Edge({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} {...EDGE} />
}

function SupervisorDiagram() {
  const hub = { x: 100, y: 62 }
  const spokes = [
    { x: 100, y: 22 },
    { x: 42, y: 92 },
    { x: 158, y: 92 },
  ]

  return (
    <svg viewBox="0 0 200 120" className={styles.svg} aria-hidden>
      {spokes.map((node) => (
        <Edge key={`${node.x}-${node.y}`} x1={hub.x} y1={hub.y} x2={node.x} y2={node.y} />
      ))}
      <Node cx={hub.x} cy={hub.y} accent label="S" />
      {spokes.map((node, index) => (
        <Node key={index} cx={node.x} cy={node.y} label={`A${index + 1}`} />
      ))}
    </svg>
  )
}

function PipelineDiagram() {
  const nodes = [
    { x: 20, y: 50, label: "In" },
    { x: 55, y: 50, label: "Plan" },
    { x: 90, y: 50, label: "Run" },
    { x: 125, y: 50, label: "Crit" },
    { x: 160, y: 50, label: "Out" },
  ]

  return (
    <svg viewBox="0 0 180 100" className={styles.svg} aria-hidden>
      {nodes.slice(0, -1).map((node, index) => {
        const next = nodes[index + 1]
        return <Edge key={node.label} x1={node.x} y1={node.y} x2={next.x} y2={next.y} />
      })}
      {nodes.map((node, index) => (
        <Node key={node.label} cx={node.x} cy={node.y} accent={index === 3} label={node.label} />
      ))}
    </svg>
  )
}

function FanoutDiagram() {
  const start = { x: 100, y: 18 }
  const workers = [
    { x: 44, y: 62 },
    { x: 100, y: 62 },
    { x: 156, y: 62 },
  ]
  const end = { x: 100, y: 102 }

  return (
    <svg viewBox="0 0 200 120" className={styles.svg} aria-hidden>
      {workers.map((node) => (
        <Edge key={`start-${node.x}`} x1={start.x} y1={start.y} x2={node.x} y2={node.y} />
      ))}
      {workers.map((node) => (
        <Edge key={`end-${node.x}`} x1={node.x} y1={node.y} x2={end.x} y2={end.y} />
      ))}
      <Node cx={start.x} cy={start.y} label="In" />
      {workers.map((node, index) => (
        <Node key={index} cx={node.x} cy={node.y} label={`W${index + 1}`} />
      ))}
      <Node cx={end.x} cy={end.y} accent label="Out" />
    </svg>
  )
}

export default function ArchitectureDiagram({ topology }: Props) {
  return (
    <div className={styles.frame}>
      {topology === "supervisor" ? <SupervisorDiagram /> : null}
      {topology === "pipeline" ? <PipelineDiagram /> : null}
      {topology === "fanout" ? <FanoutDiagram /> : null}
    </div>
  )
}
