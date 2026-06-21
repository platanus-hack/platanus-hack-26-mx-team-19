"use client"

import { TbChevronRight } from "react-icons/tb"
import type { SwarmRunUsageView } from "@/lib/swarm-run-usage"
import {
  formatCostUsd,
  formatDurationMs,
  formatProviderLabel,
  formatTokenCount,
  previewUrl,
} from "@/lib/swarm-run-usage"

export type SwarmRunSummaryProps = {
  status: string
  durationMs?: number
  usage?: SwarmRunUsageView | null
  failureReason?: string
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ")
}

export default function SwarmRunSummary({
  status,
  durationMs,
  usage,
  failureReason,
}: SwarmRunSummaryProps) {
  const scrapeRequests = usage?.scrapeUsage.requests ?? []
  const hasModelBreakdown = (usage?.usageByModel.length ?? 0) > 0
  const hasScrapeBreakdown = scrapeRequests.length > 0
  const hasBreakdown = hasModelBreakdown || hasScrapeBreakdown
  const hasLlmUsage = (usage?.totalTokens ?? 0) > 0
  const hasScrapeUsage = (usage?.scrapeUsage.requestCount ?? 0) > 0
  const statusClass = status === "done" || status === "failed" ? status : "other"

  return (
    <section className="run-summary" aria-label="Run summary">
      <header className="run-summary-head">
        <div className="run-summary-head-main">
          <span className={`run-summary-status run-summary-status--${statusClass}`}>
            {statusLabel(status)}
          </span>
          {durationMs != null ? (
            <span className="run-summary-duration" title="Wall-clock run time">
              {formatDurationMs(durationMs)}
            </span>
          ) : null}
        </div>
        {usage ? (
          <div className="run-summary-cost" title="Estimated total run cost">
            <span className="run-summary-cost-value">{formatCostUsd(usage.totalCostUsd)}</span>
            <span className="run-summary-cost-label">total</span>
          </div>
        ) : null}
      </header>

      {usage ? (
        <div className="run-summary-body">
          <ul className="run-summary-lines">
            {hasLlmUsage ? (
              <li className="run-summary-line">
                <span className="run-summary-line-key">LLM</span>
                <span className="run-summary-line-val">
                  <span>{formatTokenCount(usage.totalTokens)} tok</span>
                  <span className="run-summary-line-sub">
                    {formatTokenCount(usage.promptTokens)} in ·{" "}
                    {formatTokenCount(usage.completionTokens)} out
                  </span>
                  <span className="run-summary-line-cost">{formatCostUsd(usage.costUsd)}</span>
                </span>
              </li>
            ) : null}
            {hasScrapeUsage ? (
              <li className="run-summary-line">
                <span className="run-summary-line-key">Scrape</span>
                <span className="run-summary-line-val">
                  <span>
                    {usage.scrapeUsage.requestCount} request
                    {usage.scrapeUsage.requestCount === 1 ? "" : "s"}
                  </span>
                  <span className="run-summary-line-sub">
                    {formatDurationMs(usage.scrapeUsage.browserDurationMs)} browser
                  </span>
                  <span className="run-summary-line-cost">
                    {formatCostUsd(usage.scrapeCostUsd)}
                  </span>
                </span>
              </li>
            ) : null}
            {!hasLlmUsage && !hasScrapeUsage ? (
              <li className="run-summary-line run-summary-line--muted">
                <span className="run-summary-line-key">Usage</span>
                <span className="run-summary-line-val">No metered usage recorded</span>
              </li>
            ) : null}
          </ul>

          {hasBreakdown ? (
            <details className="run-summary-breakdown">
              <summary className="run-summary-details-toggle">
                <TbChevronRight className="run-summary-details-icon" size={13} aria-hidden />
                <span>Details</span>
              </summary>
              {hasModelBreakdown ? (
                <div className="run-summary-table-block">
                  <p className="run-summary-table-title">Models</p>
                  <div className="run-summary-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">Model</th>
                          <th scope="col">Tokens</th>
                          <th scope="col">Cost</th>
                          <th scope="col">Runs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usage.usageByModel.map((line) => (
                          <tr key={`${line.provider}:${line.model}`}>
                            <td>
                              <span className="run-summary-cell-primary">{line.model}</span>
                              <span className="run-summary-cell-secondary">
                                {formatProviderLabel(line.provider)}
                              </span>
                            </td>
                            <td>
                              <span>{formatTokenCount(line.totalTokens)}</span>
                              <span className="run-summary-cell-secondary">
                                {formatTokenCount(line.promptTokens)} /{" "}
                                {formatTokenCount(line.completionTokens)}
                              </span>
                            </td>
                            <td>{formatCostUsd(line.costUsd)}</td>
                            <td className="run-summary-cell-num">{line.agentRunCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
              {hasScrapeBreakdown ? (
                <div className="run-summary-table-block">
                  <p className="run-summary-table-title">Scrapes</p>
                  <div className="run-summary-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">URL</th>
                          <th scope="col">Time</th>
                          <th scope="col">Cost</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scrapeRequests.map((line) => (
                          <tr key={line.scrapeRequestId}>
                            <td className="run-summary-cell-url" title={line.url}>
                              {previewUrl(line.url)}
                            </td>
                            <td>{formatDurationMs(line.latencyMs)}</td>
                            <td>{formatCostUsd(line.costUsd)}</td>
                            <td className="run-summary-cell-status">{line.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </details>
          ) : null}
        </div>
      ) : null}

      {failureReason ? <p className="run-summary-error">{failureReason}</p> : null}

      <style jsx>{`
        .run-summary {
          flex-shrink: 0;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          overflow: hidden;
        }
        .run-summary-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.45rem 0.55rem;
          background: var(--app-surface-muted);
          border-bottom: 1px solid var(--app-border);
        }
        .run-summary-head-main {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          min-width: 0;
        }
        .run-summary-status {
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.15rem 0.45rem;
          border-radius: 999px;
          background: var(--app-bg);
          color: var(--app-text-muted);
          border: 1px solid var(--app-border);
        }
        .run-summary-status--done {
          background: var(--app-text);
          color: var(--app-bg);
          border-color: var(--app-text);
        }
        .run-summary-status--failed {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .run-summary-duration {
          font-size: 0.6875rem;
          color: var(--app-text-muted);
          font-variant-numeric: tabular-nums;
        }
        .run-summary-cost {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          flex-shrink: 0;
        }
        .run-summary-cost-value {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--app-text);
          font-variant-numeric: tabular-nums;
        }
        .run-summary-cost-label {
          font-size: 0.5625rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--app-text-faint);
        }
        .run-summary-body {
          padding: 0.45rem 0.55rem 0.5rem;
        }
        .run-summary-lines {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .run-summary-line {
          display: grid;
          grid-template-columns: 3.25rem 1fr;
          gap: 0.5rem;
          align-items: start;
        }
        .run-summary-line--muted .run-summary-line-val {
          color: var(--app-text-faint);
          font-size: 0.625rem;
        }
        .run-summary-line-key {
          font-size: 0.5625rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--app-text-faint);
          padding-top: 0.1rem;
        }
        .run-summary-line-val {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          color: var(--app-text);
          font-variant-numeric: tabular-nums;
        }
        .run-summary-line-sub {
          font-size: 0.625rem;
          color: var(--app-text-faint);
        }
        .run-summary-line-cost {
          margin-left: auto;
          font-weight: 500;
        }
        .run-summary-breakdown {
          margin: 0.5rem 0 0;
          padding-top: 0.45rem;
          border-top: 1px solid var(--app-border);
        }
        .run-summary-details-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.625rem;
          color: var(--app-text-muted);
          cursor: pointer;
          list-style: none;
          user-select: none;
        }
        .run-summary-details-toggle::-webkit-details-marker {
          display: none;
        }
        .run-summary-details-icon {
          flex-shrink: 0;
          transition: transform 0.12s ease;
        }
        .run-summary-breakdown[open] .run-summary-details-icon {
          transform: rotate(90deg);
        }
        .run-summary-table-block {
          margin-top: 0.4rem;
        }
        .run-summary-table-block + .run-summary-table-block {
          margin-top: 0.55rem;
        }
        .run-summary-table-title {
          margin: 0 0 0.25rem;
          font-size: 0.5625rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--app-text-faint);
        }
        .run-summary-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--app-border);
          border-radius: calc(var(--app-radius) - 1px);
        }
        .run-summary-table-wrap :global(table) {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.625rem;
        }
        .run-summary-table-wrap :global(th) {
          text-align: left;
          font-weight: 500;
          color: var(--app-text-faint);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 0.5625rem;
          padding: 0.28rem 0.4rem;
          border-bottom: 1px solid var(--app-border);
          background: var(--app-surface-muted);
        }
        .run-summary-table-wrap :global(td) {
          padding: 0.32rem 0.4rem;
          border-bottom: 1px solid var(--app-border);
          vertical-align: top;
          color: var(--app-text);
          font-variant-numeric: tabular-nums;
        }
        .run-summary-table-wrap :global(tr:last-child td) {
          border-bottom: none;
        }
        .run-summary-cell-primary {
          display: block;
          font-weight: 500;
        }
        .run-summary-cell-secondary {
          display: block;
          font-size: 0.5625rem;
          color: var(--app-text-faint);
          margin-top: 0.08rem;
        }
        .run-summary-cell-num {
          text-align: right;
          color: var(--app-text-muted);
        }
        .run-summary-cell-url {
          max-width: 9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .run-summary-cell-status {
          color: var(--app-text-muted);
          text-transform: lowercase;
        }
        .run-summary-error {
          margin: 0;
          padding: 0.4rem 0.55rem;
          font-size: 0.6875rem;
          color: #b91c1c;
          border-top: 1px solid #fecaca;
          background: #fef2f2;
        }
      `}</style>
    </section>
  )
}
