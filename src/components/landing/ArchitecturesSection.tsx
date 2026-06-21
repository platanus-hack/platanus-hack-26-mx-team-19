import type {
  ArchitectureEntry,
  ArchitectureScale,
  ArchitectureTopology,
} from "@/content/architectures"
import {
  getExtendedArchitectureEntries,
  getFeaturedArchitectureEntries,
} from "@/content/architectures"
import { landingContent } from "@/content/landing"
import LandingContainer from "@/components/landing/LandingContainer"
import LandingSection from "@/components/landing/LandingSection"
import styles from "./architectures-section.module.css"

const SCALE_LABELS: Record<string, string> = {
  verification: "Verify",
  traceability: "Trace",
  latency: "Speed",
  cost: "Cost",
}

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

function ArchitectureDiagram({ topology }: { topology: ArchitectureTopology }) {
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
      <ArchitectureDiagram topology={entry.topology} />
      <div className={styles.cardBody}>
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardName}>{entry.name}</h3>
            <p className={styles.cardCategory}>
              {entry.category} · {entry.layer}
            </p>
          </div>
          {entry.badge ? <span className={styles.cardBadge}>{entry.badge}</span> : null}
        </div>

        <p className={styles.cardSummary}>{entry.summary}</p>
        <p className={styles.cardDescription}>{entry.description}</p>

        <div className={styles.scales} aria-label="Operational profile">
          {scales.map(({ key, value }) => (
            <ScaleMetric key={key} label={SCALE_LABELS[key] ?? key} value={value} />
          ))}
        </div>

        <details className={styles.details}>
          <summary className={styles.detailsSummary}>Pattern guide</summary>
          <div className={styles.detailsBody}>
            <p className={styles.problem}>
              <span className={styles.detailLabel}>Problem</span>
              {entry.problem}
            </p>

            <div className={styles.detailBlock}>
              <p className={styles.detailLabel}>When to use</p>
              <BulletList items={entry.when_to_use} />
            </div>

            <div className={styles.detailBlock}>
              <p className={styles.detailLabel}>When not to use</p>
              <BulletList items={entry.when_not_to_use} />
            </div>

            <div className={styles.detailBlock}>
              <p className={styles.detailLabel}>Forces</p>
              <BulletList items={entry.forces} />
            </div>

            <p className={styles.meta}>
              <span className={styles.detailLabel}>Agents</span>
              {entry.agent_count.sweet_spot} (typical {entry.agent_count.min}–{entry.agent_count.max})
            </p>

            <p className={styles.meta}>
              <span className={styles.detailLabel}>Graph</span>
              {graphSummary}
            </p>

            {entry.framework_notes ? (
              <div className={styles.detailBlock}>
                <p className={styles.detailLabel}>Framework notes</p>
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
                <span className={styles.detailLabel}>Evidence</span>
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
  const { architectures } = landingContent
  const featured = getFeaturedArchitectureEntries()
  const extended = getExtendedArchitectureEntries()

  return (
    <LandingSection
      id={architectures.id}
      variant="compact"
      aria-labelledby="landing-architectures-title"
    >
      <div className={styles.catalog}>
        <div className={styles.catalogAtmosphere} aria-hidden />
        <LandingContainer className={styles.catalogInner}>
        <header className={styles.header}>
          <h2 id="landing-architectures-title" className={styles.title}>
            {architectures.eyebrow}
          </h2>
        </header>

          <ArchitectureGrid entries={featured} />

          {extended.length > 0 ? (
            <div className={styles.extended}>
              <p className={styles.extendedEyebrow}>{architectures.extendedEyebrow}</p>
              <ArchitectureGrid entries={extended} />
            </div>
          ) : null}
        </LandingContainer>
      </div>
    </LandingSection>
  )
}
