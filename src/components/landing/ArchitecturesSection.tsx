"use client"

import type React from "react"
import type {
  ArchitectureEntry,
  ArchitectureScale,
  ArchitectureTopology,
} from "@/content/architectures"
import {
  getExtendedArchitectureEntries,
  getFeaturedArchitectureEntries,
} from "@/content/architectures"
import { useLocale, useMessages } from "@/i18n/LocaleProvider"
import { localizeArchitectureCatalog } from "@/i18n/localize-architecture"
import {
  architectureScaleLabels,
  translateArchitectureBadge,
  translateArchitectureCategory,
  translateArchitectureLayer,
} from "@/i18n/architecture-labels"
import LandingContainer from "@/components/landing/LandingContainer"
import LandingSection from "@/components/landing/LandingSection"
import styles from "./architectures-section.module.css"

const NODE = { r: 10, stroke: "var(--app-border-strong)", fill: "var(--app-surface)" }
const EDGE = { stroke: "var(--app-border-strong)", strokeWidth: 1.5 }
const ACCENT = { stroke: "var(--app-accent)", fill: "var(--app-accent-soft)" }

function DiagramNode({
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
  const nodeStyle = accent ? ACCENT : NODE
  return (
    <g>
      <circle cx={cx} cy={cy} r={NODE.r} fill={nodeStyle.fill} stroke={nodeStyle.stroke} strokeWidth={1.5} />
      {label ? (
        <text x={cx} y={cy + 3} textAnchor="middle" className={styles.diagramLabel}>
          {label}
        </text>
      ) : null}
    </g>
  )
}

function DiagramEdge({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
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
    <svg viewBox="0 0 200 120" className={styles.diagramSvg} aria-hidden>
      {spokes.map((node) => (
        <DiagramEdge key={`${node.x}-${node.y}`} x1={hub.x} y1={hub.y} x2={node.x} y2={node.y} />
      ))}
      <DiagramNode cx={hub.x} cy={hub.y} accent label="S" />
      {spokes.map((node, index) => (
        <DiagramNode key={index} cx={node.x} cy={node.y} label={`A${index + 1}`} />
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
    <svg viewBox="0 0 180 100" className={styles.diagramSvg} aria-hidden>
      {nodes.slice(0, -1).map((node, index) => {
        const next = nodes[index + 1]!
        return <DiagramEdge key={node.label} x1={node.x} y1={node.y} x2={next.x} y2={next.y} />
      })}
      {nodes.map((node, index) => (
        <DiagramNode key={node.label} cx={node.x} cy={node.y} accent={index === 3} label={node.label} />
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
    <svg viewBox="0 0 200 120" className={styles.diagramSvg} aria-hidden>
      {workers.map((node) => (
        <DiagramEdge key={`start-${node.x}`} x1={start.x} y1={start.y} x2={node.x} y2={node.y} />
      ))}
      {workers.map((node) => (
        <DiagramEdge key={`end-${node.x}`} x1={node.x} y1={node.y} x2={end.x} y2={end.y} />
      ))}
      <DiagramNode cx={start.x} cy={start.y} label="In" />
      {workers.map((node, index) => (
        <DiagramNode key={index} cx={node.x} cy={node.y} label={`W${index + 1}`} />
      ))}
      <DiagramNode cx={end.x} cy={end.y} accent label="Out" />
    </svg>
  )
}

/** Bio-mimetic organic mesh — 6 agents with local neighbour links, no centre */
function SwarmBioMimeticDiagram() {
  // Irregular hexagon to simulate organic swarm spread
  const nodes = [
    { x: 100, y: 14, label: "A" },
    { x: 155, y: 44, label: "B" },
    { x: 155, y: 86, label: "C" },
    { x: 100, y: 108, label: "D" },
    { x: 45, y: 86, label: "E" },
    { x: 45, y: 44, label: "F" },
  ] as const
  // Ring + two diagonals (local-only, no full mesh)
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [0, 3], [1, 4],
  ]
  return (
    <svg viewBox="0 0 200 122" className={styles.diagramSvg} aria-hidden>
      {edges.map(([a, b], i) => (
        <DiagramEdge key={i} x1={nodes[a]!.x} y1={nodes[a]!.y} x2={nodes[b]!.x} y2={nodes[b]!.y} />
      ))}
      {nodes.map((n, i) => (
        <DiagramNode key={i} cx={n.x} cy={n.y} accent={i % 3 === 0} label={n.label} />
      ))}
    </svg>
  )
}

/** LLM embedded P2P — full bidirectional ring, all peers equal */
function SwarmLlmEmbeddedDiagram() {
  const cx = 100, cy = 62, r = 46
  const count = 5
  const nodes = Array.from({ length: count }, (_, i) => ({
    x: cx + r * Math.cos((2 * Math.PI * i) / count - Math.PI / 2),
    y: cy + r * Math.sin((2 * Math.PI * i) / count - Math.PI / 2),
    label: `L${i + 1}`,
  }))
  // Full mesh (all pairs)
  const edges: [number, number][] = []
  for (let a = 0; a < count; a++)
    for (let b = a + 1; b < count; b++)
      edges.push([a, b])
  return (
    <svg viewBox="0 0 200 124" className={styles.diagramSvg} aria-hidden>
      {edges.map(([a, b], i) => (
        <DiagramEdge key={i}
          x1={nodes[a]!.x} y1={nodes[a]!.y}
          x2={nodes[b]!.x} y2={nodes[b]!.y} />
      ))}
      {nodes.map((n, i) => (
        <DiagramNode key={i} cx={n.x} cy={n.y} accent label={n.label} />
      ))}
    </svg>
  )
}

/** LLM centralised star — one hub LLM pushes to executor leaves */
function SwarmLlmCentralisedDiagram() {
  const hub = { x: 100, y: 55, label: "LLM" }
  const leaves = [
    { x: 40, y: 20, label: "Ex1" },
    { x: 100, y: 15, label: "Ex2" },
    { x: 160, y: 20, label: "Ex3" },
    { x: 165, y: 80, label: "Ex4" },
    { x: 40, y: 80, label: "Ex5" },
  ] as const
  return (
    <svg viewBox="0 0 200 105" className={styles.diagramSvg} aria-hidden>
      {leaves.map((l, i) => (
        <DiagramEdge key={i} x1={hub.x} y1={hub.y} x2={l.x} y2={l.y} />
      ))}
      <DiagramNode cx={hub.x} cy={hub.y} accent label={hub.label} />
      {leaves.map((l, i) => (
        <DiagramNode key={i} cx={l.x} cy={l.y} label={l.label} />
      ))}
    </svg>
  )
}

/** Formal control — bidirectional feedback layer between agents and control filter */
function SwarmFormalControlDiagram() {
  const ctrl = { x: 100, y: 60, label: "Ctrl" }
  const agents = [
    { x: 30, y: 25, label: "N1" },
    { x: 100, y: 14, label: "N2" },
    { x: 170, y: 25, label: "N3" },
    { x: 170, y: 95, label: "N4" },
    { x: 30, y: 95, label: "N5" },
  ] as const
  return (
    <svg viewBox="0 0 200 115" className={styles.diagramSvg} aria-hidden>
      {/* Agent→Control (upward) */}
      {agents.map((a, i) => (
        <DiagramEdge key={`up-${i}`} x1={a.x} y1={a.y} x2={ctrl.x} y2={ctrl.y} />
      ))}
      {/* Neighbour ring */}
      {agents.map((a, i) => {
        const b = agents[(i + 1) % agents.length]!
        return <DiagramEdge key={`ring-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
      })}
      <DiagramNode cx={ctrl.x} cy={ctrl.y} accent label={ctrl.label} />
      {agents.map((a, i) => (
        <DiagramNode key={i} cx={a.x} cy={a.y} label={a.label} />
      ))}
    </svg>
  )
}

/** MARL — two horizontal bands: training cluster (top) ↔ execution agents (bottom) */
function SwarmMarlDiagram() {
  const trainers = [
    { x: 50, y: 22, label: "Tr1" },
    { x: 100, y: 22, label: "Tr2" },
    { x: 150, y: 22, label: "Tr3" },
  ] as const
  const executors = [
    { x: 35, y: 95, label: "Ex1" },
    { x: 80, y: 95, label: "Ex2" },
    { x: 125, y: 95, label: "Ex3" },
    { x: 165, y: 95, label: "Ex4" },
  ] as const
  return (
    <svg viewBox="0 0 200 118" className={styles.diagramSvg} aria-hidden>
      {/* Trainer mesh */}
      <DiagramEdge x1={trainers[0].x} y1={trainers[0].y} x2={trainers[1].x} y2={trainers[1].y} />
      <DiagramEdge x1={trainers[1].x} y1={trainers[1].y} x2={trainers[2].x} y2={trainers[2].y} />
      {/* Async update arrows (trainer → executor) */}
      {trainers.map((t, ti) =>
        executors.map((e, ei) => (
          (ti === ei || ti === ei - 1) && (
            <DiagramEdge key={`${ti}-${ei}`} x1={t.x} y1={t.y} x2={e.x} y2={e.y} />
          )
        ))
      )}
      {trainers.map((t, i) => (
        <DiagramNode key={`t${i}`} cx={t.x} cy={t.y} accent label={t.label} />
      ))}
      {executors.map((e, i) => (
        <DiagramNode key={`e${i}`} cx={e.x} cy={e.y} label={e.label} />
      ))}
    </svg>
  )
}

/** Homogeneous minimal — 3×2 grid lattice, all identical, nearest-neighbour only */
function SwarmHomogeneousDiagram() {
  const cols = 3, rows = 2
  const xs = [44, 100, 156], ys = [35, 88]
  const nodes = ys.flatMap((y, r) => xs.map((x, c) => ({ x, y, label: `H${r * cols + c + 1}` })))
  const edges: [number, number][] = [
    // horizontal
    [0, 1], [1, 2], [3, 4], [4, 5],
    // vertical
    [0, 3], [1, 4], [2, 5],
  ]
  return (
    <svg viewBox="0 0 200 118" className={styles.diagramSvg} aria-hidden>
      {edges.map(([a, b], i) => (
        <DiagramEdge key={i} x1={nodes[a]!.x} y1={nodes[a]!.y} x2={nodes[b]!.x} y2={nodes[b]!.y} />
      ))}
      {nodes.map((n, i) => (
        <DiagramNode key={i} cx={n.x} cy={n.y} label={n.label} />
      ))}
    </svg>
  )
}

/** Hierarchical — root leader, two sub-leaders, leaf followers */
function SwarmHierarchicalDiagram() {
  const root = { x: 100, y: 15, label: "L0" }
  const subs = [
    { x: 55, y: 55, label: "L1" },
    { x: 145, y: 55, label: "L2" },
  ] as const
  const leaves = [
    { x: 25, y: 100, label: "F1" },
    { x: 65, y: 100, label: "F2" },
    { x: 115, y: 100, label: "F3" },
    { x: 170, y: 100, label: "F4" },
  ] as const
  return (
    <svg viewBox="0 0 200 118" className={styles.diagramSvg} aria-hidden>
      {/* Root → sub-leaders */}
      {subs.map((s, i) => (
        <DiagramEdge key={`rs${i}`} x1={root.x} y1={root.y} x2={s.x} y2={s.y} />
      ))}
      {/* Sub-leader → leaves */}
      <DiagramEdge x1={subs[0].x} y1={subs[0].y} x2={leaves[0].x} y2={leaves[0].y} />
      <DiagramEdge x1={subs[0].x} y1={subs[0].y} x2={leaves[1].x} y2={leaves[1].y} />
      <DiagramEdge x1={subs[1].x} y1={subs[1].y} x2={leaves[2].x} y2={leaves[2].y} />
      <DiagramEdge x1={subs[1].x} y1={subs[1].y} x2={leaves[3].x} y2={leaves[3].y} />
      {/* Lateral peer link between sub-leaders */}
      <DiagramEdge x1={subs[0].x} y1={subs[0].y} x2={subs[1].x} y2={subs[1].y} />
      <DiagramNode cx={root.x} cy={root.y} accent label={root.label} />
      {subs.map((s, i) => (
        <DiagramNode key={i} cx={s.x} cy={s.y} accent label={s.label} />
      ))}
      {leaves.map((l, i) => (
        <DiagramNode key={i} cx={l.x} cy={l.y} label={l.label} />
      ))}
    </svg>
  )
}

/** Modular async — three role clusters with async queues between them */
function SwarmModularDiagram() {
  // Scouts cluster (left)
  const scouts = [{ x: 28, y: 30 }, { x: 28, y: 70 }] as const
  // Gatherers cluster (right)
  const gatherers = [{ x: 172, y: 30 }, { x: 172, y: 70 }] as const
  // Coordinator (centre)
  const coord = { x: 100, y: 60, label: "Coord" }
  // Queue midpoints (visual dashes via 2 short lines)
  return (
    <svg viewBox="0 0 200 110" className={styles.diagramSvg} aria-hidden>
      {/* Scouts → Coord */}
      {scouts.map((s, i) => (
        <DiagramEdge key={`sc${i}`} x1={s.x} y1={s.y} x2={coord.x} y2={coord.y} />
      ))}
      {/* Coord → Gatherers */}
      {gatherers.map((g, i) => (
        <DiagramEdge key={`cg${i}`} x1={coord.x} y1={coord.y} x2={g.x} y2={g.y} />
      ))}
      {/* Intra-cluster links */}
      <DiagramEdge x1={scouts[0].x} y1={scouts[0].y} x2={scouts[1].x} y2={scouts[1].y} />
      <DiagramEdge x1={gatherers[0].x} y1={gatherers[0].y} x2={gatherers[1].x} y2={gatherers[1].y} />
      {/* Coord feedback back to scouts */}
      <DiagramEdge x1={coord.x} y1={coord.y} x2={scouts[0].x} y2={scouts[0].y} />
      <DiagramNode cx={coord.x} cy={coord.y} accent label={coord.label} />
      {scouts.map((s, i) => (
        <DiagramNode key={`s${i}`} cx={s.x} cy={s.y} label={`Sc${i + 1}`} />
      ))}
      {gatherers.map((g, i) => (
        <DiagramNode key={`g${i}`} cx={g.x} cy={g.y} label={`Ga${i + 1}`} />
      ))}
    </svg>
  )
}

/** ReAct / Agentic Tool Loop — central agent + tools star with observe loop */
function ReactToolLoopDiagram() {
  const agent = { x: 72, y: 60, label: "Agt" }
  const tools = [
    { x: 148, y: 20, label: "T1" },
    { x: 160, y: 60, label: "T2" },
    { x: 148, y: 100, label: "T3" },
  ] as const
  const input = { x: 18, y: 60, label: "In" }
  const output = { x: 72, y: 110, label: "Out" }
  return (
    <svg viewBox="0 0 200 130" className={styles.diagramSvg} aria-hidden>
      <DiagramEdge x1={input.x} y1={input.y} x2={agent.x} y2={agent.y} />
      {tools.map((t, i) => (
        <DiagramEdge key={`to-${i}`} x1={agent.x} y1={agent.y} x2={t.x} y2={t.y} />
      ))}
      {tools.map((t, i) => (
        <DiagramEdge key={`from-${i}`} x1={t.x} y1={t.y} x2={agent.x} y2={agent.y} />
      ))}
      <DiagramEdge x1={agent.x} y1={agent.y} x2={output.x} y2={output.y} />
      <DiagramNode cx={input.x} cy={input.y} label={input.label} />
      <DiagramNode cx={agent.x} cy={agent.y} accent label={agent.label} />
      {tools.map((t, i) => (
        <DiagramNode key={i} cx={t.x} cy={t.y} label={t.label} />
      ))}
      <DiagramNode cx={output.x} cy={output.y} label={output.label} />
    </svg>
  )
}

/** Debate / Judge — two debaters fan-out to an independent judge */
function DebateJudgeDiagram() {
  const input = { x: 20, y: 60, label: "In" }
  const pro = { x: 80, y: 22, label: "Pro" }
  const con = { x: 80, y: 98, label: "Con" }
  const judge = { x: 148, y: 60, label: "Jdg" }
  const output = { x: 186, y: 60, label: "Out" }
  return (
    <svg viewBox="0 0 210 120" className={styles.diagramSvg} aria-hidden>
      <DiagramEdge x1={input.x} y1={input.y} x2={pro.x} y2={pro.y} />
      <DiagramEdge x1={input.x} y1={input.y} x2={con.x} y2={con.y} />
      <DiagramEdge x1={pro.x} y1={pro.y} x2={judge.x} y2={judge.y} />
      <DiagramEdge x1={con.x} y1={con.y} x2={judge.x} y2={judge.y} />
      <DiagramEdge x1={judge.x} y1={judge.y} x2={output.x} y2={output.y} />
      <DiagramNode cx={input.x} cy={input.y} label={input.label} />
      <DiagramNode cx={pro.x} cy={pro.y} label={pro.label} />
      <DiagramNode cx={con.x} cy={con.y} label={con.label} />
      <DiagramNode cx={judge.x} cy={judge.y} accent label={judge.label} />
      <DiagramNode cx={output.x} cy={output.y} label={output.label} />
    </svg>
  )
}

/** Human-in-the-loop Gate — approval node with approve/reject branches */
function HitlDiagram() {
  const worker = { x: 28, y: 40, label: "Wkr" }
  const gate = { x: 94, y: 40, label: "Gate" }
  const cont = { x: 165, y: 18, label: "Act" }
  const revise = { x: 165, y: 68, label: "Rev" }
  const back = { x: 28, y: 68 }
  return (
    <svg viewBox="0 0 200 95" className={styles.diagramSvg} aria-hidden>
      <DiagramEdge x1={worker.x} y1={worker.y} x2={gate.x} y2={gate.y} />
      <DiagramEdge x1={gate.x} y1={gate.y} x2={cont.x} y2={cont.y} />
      <DiagramEdge x1={gate.x} y1={gate.y} x2={revise.x} y2={revise.y} />
      {/* Reject loop back */}
      <DiagramEdge x1={revise.x} y1={revise.y} x2={back.x} y2={back.y} />
      <DiagramEdge x1={back.x} y1={back.y} x2={worker.x} y2={worker.y} />
      <DiagramNode cx={worker.x} cy={worker.y} label={worker.label} />
      <DiagramNode cx={gate.x} cy={gate.y} accent label={gate.label} />
      <DiagramNode cx={cont.x} cy={cont.y} label={cont.label} />
      <DiagramNode cx={revise.x} cy={revise.y} label={revise.label} />
    </svg>
  )
}

/** Nested Swarm Delegation — orchestrator fans out to child swarms */
function NestedSwarmDiagram() {
  const orch = { x: 28, y: 60, label: "Orch" }
  const swarmA = { x: 90, y: 22, label: "SwA" }
  const swarmB = { x: 90, y: 98, label: "SwB" }
  const merge = { x: 155, y: 60, label: "Mrg" }
  const output = { x: 190, y: 60, label: "Out" }
  return (
    <svg viewBox="0 0 210 120" className={styles.diagramSvg} aria-hidden>
      <DiagramEdge x1={orch.x} y1={orch.y} x2={swarmA.x} y2={swarmA.y} />
      <DiagramEdge x1={orch.x} y1={orch.y} x2={swarmB.x} y2={swarmB.y} />
      <DiagramEdge x1={swarmA.x} y1={swarmA.y} x2={merge.x} y2={merge.y} />
      <DiagramEdge x1={swarmB.x} y1={swarmB.y} x2={merge.x} y2={merge.y} />
      <DiagramEdge x1={merge.x} y1={merge.y} x2={output.x} y2={output.y} />
      <DiagramNode cx={orch.x} cy={orch.y} accent label={orch.label} />
      <DiagramNode cx={swarmA.x} cy={swarmA.y} label={swarmA.label} />
      <DiagramNode cx={swarmB.x} cy={swarmB.y} label={swarmB.label} />
      <DiagramNode cx={merge.x} cy={merge.y} label={merge.label} />
      <DiagramNode cx={output.x} cy={output.y} label={output.label} />
    </svg>
  )
}

const CUSTOM_DIAGRAM: Record<string, React.ReactNode> = {
  // New production patterns (id-based override)
  "react-tool-loop": <ReactToolLoopDiagram />,
  "debate-judge": <DebateJudgeDiagram />,
  "human-in-loop": <HitlDiagram />,
  "nested-swarm": <NestedSwarmDiagram />,
  // Swarm patterns (each with unique topology diagram)
  "swarm-roles-dinamicos": <SwarmBioMimeticDiagram />,
  "swarm-llm-embebido": <SwarmLlmEmbeddedDiagram />,
  "swarm-llm-centralizado": <SwarmLlmCentralisedDiagram />,
  "swarm-control-formal": <SwarmFormalControlDiagram />,
  "swarm-mean-embeddings": <SwarmMarlDiagram />,
  "swarm-homogeneo-minimalista": <SwarmHomogeneousDiagram />,
  "swarm-jerarquico-metaheuristico": <SwarmHierarchicalDiagram />,
  "swarm-modular-asincrono": <SwarmModularDiagram />,
}

function ArchitectureDiagram({ topology, id }: { topology: ArchitectureTopology; id: string }) {
  const custom = CUSTOM_DIAGRAM[id]
  if (custom) return <div className={styles.diagramFrame}>{custom}</div>
  return (
    <div className={styles.diagramFrame}>
      {topology === "supervisor" ? <SupervisorDiagram /> : null}
      {topology === "pipeline" ? <PipelineDiagram /> : null}
      {topology === "fanout" ? <FanoutDiagram /> : null}
    </div>
  )
}

function ScaleMetric({ label, value }: { label: string; value: ArchitectureScale }) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue} aria-label={`${label} ${value} out of 5`}>
        {value}
        <span className={styles.metricMax}>/5</span>
      </span>
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function ArchitectureCard({ entry }: { entry: ArchitectureEntry }) {
  const arch = useMessages().landing.architectures
  const scaleLabels = architectureScaleLabels(arch)
  const scales: Array<{ key: string; value: ArchitectureScale }> = [
    { key: "verification", value: entry.verification },
    { key: "traceability", value: entry.traceability },
    { key: "latency", value: entry.latency },
    { key: "cost", value: entry.cost },
  ]

  const graphSummary = entry.graph.edges
    .map((edge) => (edge.label ? `${edge.from} → ${edge.to} (${edge.label})` : `${edge.from} → ${edge.to}`))
    .join(" · ")

  return (
    <article className={styles.card}>
      <div className={styles.cardChrome} aria-hidden>
        <span className={styles.corner} data-pos="tl" />
        <span className={styles.corner} data-pos="tr" />
        <span className={styles.corner} data-pos="bl" />
        <span className={styles.corner} data-pos="br" />
      </div>
      <ArchitectureDiagram topology={entry.topology} id={entry.id} />
      <div className={styles.cardBody}>
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardName}>{entry.name}</h3>
            <p className={styles.cardCategory}>
              {translateArchitectureCategory(entry.category, arch)} ·{" "}
              {translateArchitectureLayer(entry.layer, arch)}
              {entry.complexity === "research" ? ` · ${arch.researchOnly}` : null}
            </p>
          </div>
          {entry.badge ? (
            <span className={styles.cardBadge}>
              {translateArchitectureBadge(entry.badge, arch)}
            </span>
          ) : null}
        </div>

        <p className={styles.cardSummary}>{entry.summary}</p>
        <p className={styles.cardDescription}>{entry.description}</p>

        <div className={styles.scales} aria-label={arch.operationalProfile}>
          {scales.map(({ key, value }) => (
            <ScaleMetric key={key} label={scaleLabels[key] ?? key} value={value} />
          ))}
        </div>

        <details className={styles.details}>
          <summary className={styles.detailsSummary}>{arch.patternGuide}</summary>
          <div className={styles.detailsBody}>
            <p className={styles.problem}>
              <span className={styles.detailLabel}>{arch.problem}</span>
              {entry.problem}
            </p>

            <div className={styles.detailBlock}>
              <p className={styles.detailLabel}>{arch.whenToUse}</p>
              <BulletList items={entry.when_to_use} />
            </div>

            <div className={styles.detailBlock}>
              <p className={styles.detailLabel}>{arch.whenNotToUse}</p>
              <BulletList items={entry.when_not_to_use} />
            </div>

            <div className={styles.detailBlock}>
              <p className={styles.detailLabel}>{arch.forces}</p>
              <BulletList items={entry.forces} />
            </div>

            <p className={styles.meta}>
              <span className={styles.detailLabel}>{arch.agents}</span>
              {entry.agent_count.sweet_spot} ({arch.agentsTypical}{" "}
              {entry.agent_count.min}–{entry.agent_count.max})
            </p>

            <p className={styles.meta}>
              <span className={styles.detailLabel}>{arch.graph}</span>
              {graphSummary}
            </p>

            {entry.framework_notes ? (
              <div className={styles.detailBlock}>
                <p className={styles.detailLabel}>{arch.frameworkNotes}</p>
                <ul className={styles.list}>
                  {Object.entries(entry.framework_notes).map(([framework, note]) => (
                    <li key={framework}>
                      <strong>{framework}:</strong> {note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {entry.evidence ? (
              <p className={styles.meta}>
                <span className={styles.detailLabel}>{arch.evidence}</span>
                {entry.evidence}
              </p>
            ) : null}
          </div>
        </details>
      </div>
    </article>
  )
}

function ArchitectureGrid({ entries }: { entries: ArchitectureEntry[] }) {
  return (
    <ul className={styles.grid}>
      {entries.map((entry) => (
        <li key={entry.id}>
          <ArchitectureCard entry={entry} />
        </li>
      ))}
    </ul>
  )
}

export default function ArchitecturesSection() {
  const { locale } = useLocale()
  const arch = useMessages().landing.architectures
  const featured = localizeArchitectureCatalog(getFeaturedArchitectureEntries(), locale)
  const extended = localizeArchitectureCatalog(getExtendedArchitectureEntries(), locale)

  return (
    <LandingSection
      id="architectures"
      variant="compact"
      aria-labelledby="landing-architectures-title"
    >
      <div className={styles.catalog}>
        <div className={styles.catalogAtmosphere} aria-hidden />
        <LandingContainer className={styles.catalogInner}>
        <header className={styles.header}>
          <h2 id="landing-architectures-title" className={styles.title}>
            {arch.eyebrow}
          </h2>
        </header>

          <ArchitectureGrid entries={featured} />

          {extended.length > 0 ? (
            <div className={styles.extended}>
              <p className={styles.extendedEyebrow}>{arch.extendedEyebrow}</p>
              <ArchitectureGrid entries={extended} />
            </div>
          ) : null}
        </LandingContainer>
      </div>
    </LandingSection>
  )
}
