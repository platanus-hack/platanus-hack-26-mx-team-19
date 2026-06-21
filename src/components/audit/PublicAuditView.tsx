"use client"

import { useEffect, useMemo, useState } from "react"
import { TbExternalLink } from "react-icons/tb"
import WorkerLogCard from "@/components/admin/swarms/WorkerLogCard"
import SwarmRunSummary from "@/components/admin/swarms/SwarmRunSummary"
import LandingContainer from "@/components/landing/LandingContainer"
import LandingFooter from "@/components/landing/sections/LandingFooter"
import LandingHeader from "@/components/landing/LandingHeader"
import { fetchPublicSwarmRun } from "@/data/api/public-audit"
import type { AgentRun } from "@/data/api/server/swarms"
import { buildPublicAuditUrl } from "@/lib/audit-url"
import {
  buildHistoricalSwarmLogs,
  formatHistoricalOutput,
  type HistoricalSwarmLog,
} from "@/lib/swarm-run-history"
import { usageFromSwarmRun } from "@/lib/swarm-run-usage"

type Props = {
  runId: string
}

function formatWhen(value?: string): string {
  if (!value) return "Unknown time"
  return new Date(value).toLocaleString()
}

export default function PublicAuditView({ runId }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [swarmName, setSwarmName] = useState<string | null>(null)
  const [swarmGoal, setSwarmGoal] = useState<string | null>(null)
  const [logs, setLogs] = useState<HistoricalSwarmLog[]>([])
  const [finalOutput, setFinalOutput] = useState("")
  const [runMeta, setRunMeta] = useState<{
    status: string
    durationMs?: number
    failureReason?: string
    createdAt?: string
  } | null>(null)
  const [usageView, setUsageView] = useState<ReturnType<typeof usageFromSwarmRun> | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    void fetchPublicSwarmRun(runId)
      .then((audit) => {
        if (cancelled) return
        setSwarmName(audit.swarm.name)
        setSwarmGoal(audit.swarm.goal || null)
        const workerNameById = Object.fromEntries(
          audit.agentRuns
            .filter((run) => run.workerName?.trim())
            .map((run) => [run.workerId, run.workerName!.trim()]),
        )
        setLogs(
          buildHistoricalSwarmLogs(
            audit.swarmRun,
            audit.agentRuns as AgentRun[],
            {},
            { workerNameById },
          ),
        )
        setFinalOutput(formatHistoricalOutput(audit.swarmRun.output))
        setRunMeta({
          status: audit.swarmRun.status,
          durationMs: audit.swarmRun.durationMs ?? undefined,
          failureReason: audit.swarmRun.failureReason ?? undefined,
          createdAt: audit.swarmRun.createdAt,
        })
        setUsageView(usageFromSwarmRun(audit.swarmRun))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const status = typeof err === "object" && err != null && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined
        if (status === 404) {
          setError("This run is not available — it may still be running or the link is invalid.")
        } else {
          setError("Could not load the run audit.")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [runId])

  const sortedLogs = useMemo(() => [...logs].sort((a, b) => a.step - b.step), [logs])
  const auditUrl = buildPublicAuditUrl(runId)

  return (
    <div className="page">
      <LandingHeader />
      <main className="main">
        <LandingContainer narrow>
          <header className="hero">
            <p className="eyebrow">Public audit</p>
            <h1 className="title">{swarmName ?? "Swarm run"}</h1>
            {swarmGoal ? <p className="goal">{swarmGoal}</p> : null}
            <p className="meta">
              Run <code>{runId}</code>
              {runMeta?.createdAt ? ` · ${formatWhen(runMeta.createdAt)}` : null}
            </p>
            <a className="open-link" href={auditUrl} target="_blank" rel="noreferrer">
              <TbExternalLink size={14} aria-hidden />
              Open audit URL
            </a>
          </header>

          {loading ? <p className="state">Loading audit trail…</p> : null}
          {!loading && error ? <p className="state state--error">{error}</p> : null}

          {!loading && !error ? (
            <div className="content">
              {runMeta ? (
                <SwarmRunSummary
                  status={runMeta.status}
                  durationMs={runMeta.durationMs}
                  usage={usageView}
                  failureReason={runMeta.failureReason}
                />
              ) : null}

              <section className="section" aria-label="Final output">
                <h2 className="section-title">Final output</h2>
                <pre className="output">{finalOutput || "(empty output)"}</pre>
              </section>

              <section className="section" aria-label="Swarm execution logs">
                <h2 className="section-title">Swarm logs</h2>
                {sortedLogs.length === 0 ? (
                  <p className="empty">No swarm steps recorded.</p>
                ) : (
                  <ul className="log-list">
                    {sortedLogs.map((log) =>
                      log.kind === "worker" ? (
                        <li key={log.logId} className="log-list-item">
                          <WorkerLogCard
                            name={log.name}
                            step={log.step}
                            status={log.status}
                            streamText={log.streamText}
                            meta={log.meta}
                            latencyMs={log.latencyMs}
                            model={log.model}
                            inference={log.inference}
                            messages={log.messages}
                            contextInput={log.contextInput}
                          />
                        </li>
                      ) : (
                        <li key={log.logId} className={`log log--${log.status} log--${log.kind}`}>
                          <div className="log-head">
                            <span className="log-step">{log.step}</span>
                            <span className="log-kind">{log.kind}</span>
                            <span className="log-name">{log.name}</span>
                            {log.latencyMs != null ? (
                              <span className="log-dur">{log.latencyMs} ms</span>
                            ) : null}
                          </div>
                          {log.meta ? <p className="log-meta">{log.meta}</p> : null}
                          <pre className="log-body">{log.streamText || "(no output)"}</pre>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </section>
            </div>
          ) : null}
        </LandingContainer>
      </main>
      <LandingFooter />

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: var(--app-bg);
        }
        .main {
          padding: 2.5rem 0 3rem;
        }
        .hero {
          margin-bottom: 2rem;
        }
        .eyebrow {
          margin: 0 0 0.75rem;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--app-accent);
        }
        .title {
          margin: 0;
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: var(--app-text);
        }
        .goal {
          margin: 0.5rem 0 0;
          font-size: 0.9375rem;
          line-height: 1.5;
          color: var(--app-text-muted);
        }
        .meta {
          margin: 0.75rem 0 0;
          font-size: 0.8125rem;
          color: var(--app-text-muted);
        }
        .meta code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.75rem;
        }
        .open-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: var(--app-text-muted);
          text-decoration: none;
        }
        .open-link:hover {
          color: var(--app-text);
        }
        .state {
          margin: 0;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: var(--app-text-muted);
          border: 1px dashed var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
        }
        .state--error {
          color: #b45309;
          border-color: #fdba74;
          background: #fff7ed;
        }
        .content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .section-title {
          margin: 0;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--app-text-faint);
        }
        .output {
          margin: 0;
          padding: 0.75rem;
          min-height: 4rem;
          font-size: 0.75rem;
          line-height: 1.5;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: var(--app-text);
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          white-space: pre-wrap;
          word-break: break-word;
        }
        .empty {
          margin: 0;
          padding: 0.75rem;
          font-size: 0.8125rem;
          color: var(--app-text-faint);
          border: 1px dashed var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
        }
        .log-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .log-list-item {
          list-style: none;
        }
        .log {
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          overflow: hidden;
        }
        .log-head {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.35rem 0.5rem;
          background: var(--app-surface-muted);
          border-bottom: 1px solid var(--app-border);
        }
        .log-step {
          font-size: 0.5625rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: var(--app-text-faint);
          min-width: 1rem;
        }
        .log-kind {
          font-size: 0.5rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--app-text-faint);
          padding: 0.05rem 0.25rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-pill);
          background: var(--app-bg);
        }
        .log-name {
          flex: 1;
          min-width: 0;
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--app-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .log-dur {
          font-size: 0.5625rem;
          color: var(--app-text-faint);
          font-variant-numeric: tabular-nums;
          flex-shrink: 0;
        }
        .log-meta {
          margin: 0;
          padding: 0.25rem 0.5rem;
          font-size: 0.5625rem;
          color: var(--app-text-faint);
          border-bottom: 1px solid var(--app-border);
        }
        .log-body {
          margin: 0;
          padding: 0.5rem;
          max-height: 12rem;
          overflow: auto;
          font-size: 0.6875rem;
          line-height: 1.45;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: var(--app-text-muted);
          white-space: pre-wrap;
          word-break: break-word;
        }
        @media (min-width: 768px) {
          .main {
            padding: 3rem 0 4rem;
          }
        }
      `}</style>
    </div>
  )
}
