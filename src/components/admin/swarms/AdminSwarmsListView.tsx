"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { TbCopy, TbPlus, TbPower, TbTemplate, TbTrash } from "react-icons/tb"
import Loader from "@/components/ui/Loader"
import LogoMark from "@/components/ui/LogoMark"
import createServices, { type AdminSwarm } from "@/data/api/server"
import { ApiServices } from "@/data/api/server/config"
import { createSwarmWorkspaceApi, type SwarmApiMode } from "@/lib/swarm-workspace-api"
import { swarmEditorRoute } from "@/lib/paths"
import { provisionBlankSwarm, provisionSwarmFromTemplate } from "@/lib/provision-swarm"
import { buildSwarmRunCurl, swarmRunUrl } from "@/lib/swarm-api-reference"
import { demoPipelineTemplate } from "@/lib/swarm-templates/demo-pipeline.template"
import { formatSwarmListMeta } from "@/lib/swarm-composition-meta"
import { toast } from "@/lib/toast"

function apiErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "message" in err.response.data
  ) {
    const message = (err.response.data as { message?: string | string[] }).message
    if (Array.isArray(message)) return message.join(", ")
    if (typeof message === "string") return message
  }
  return fallback
}

type Props = {
  apiMode?: SwarmApiMode
}

export default function AdminSwarmsListView({ apiMode = "admin" }: Props) {
  const router = useRouter()
  const services = useMemo(() => createServices(ApiServices), [])
  const swarmApi = useMemo(() => createSwarmWorkspaceApi(services, apiMode), [services, apiMode])
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<AdminSwarm[]>([])
  const [metaBySwarmId, setMetaBySwarmId] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState<"blank" | "template" | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [cloningId, setCloningId] = useState<string | null>(null)
  const [togglingActiveId, setTogglingActiveId] = useState<string | null>(null)
  const [togglingAll, setTogglingAll] = useState(false)
  const [apiSwarm, setApiSwarm] = useState<AdminSwarm | null>(null)

  const copyText = useCallback(async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await swarmApi.listSwarms()
      setItems(list)

      const graphs = await Promise.all(list.map((swarm) => swarmApi.getGraph(swarm.id)))
      const nextMeta: Record<string, string> = {}
      list.forEach((swarm, i) => {
        nextMeta[swarm.id] = formatSwarmListMeta(swarm, graphs[i])
      })
      setMetaBySwarmId(nextMeta)
    } catch {
      toast.error("Could not load swarms")
      setItems([])
      setMetaBySwarmId({})
    } finally {
      setLoading(false)
    }
  }, [swarmApi])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!apiSwarm) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setApiSwarm(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [apiSwarm])

  const openWorkspace = useCallback(
    (swarmId: string) => {
      router.push(swarmEditorRoute(apiMode, swarmId))
    },
    [apiMode, router],
  )

  const handleNewSwarm = useCallback(async () => {
    setCreating("blank")
    try {
      const id = await provisionBlankSwarm(services)
      toast.success("Swarm created")
      openWorkspace(id)
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create swarm"))
    } finally {
      setCreating(null)
    }
  }, [openWorkspace, services])

  const handleLoadTemplate = useCallback(async () => {
    setCreating("template")
    try {
      const id = await provisionSwarmFromTemplate(services, demoPipelineTemplate)
      toast.success('Demo template loaded — run with { "website": "https://…" } in the test panel')
      openWorkspace(id)
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not load template"))
    } finally {
      setCreating(null)
    }
  }, [openWorkspace, services])

  const handleDeleteSwarm = useCallback(
    async (swarm: AdminSwarm) => {
      const confirmed = window.confirm(
        `Delete "${swarm.name}"? This removes the swarm, its graph, and run history. This cannot be undone.`,
      )
      if (!confirmed) return

      setDeletingId(swarm.id)
      try {
        await swarmApi.deleteSwarm(swarm.id)
        setItems((prev) => prev.filter((item) => item.id !== swarm.id))
        toast.success("Swarm deleted")
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not delete swarm"))
      } finally {
        setDeletingId(null)
      }
    },
    [swarmApi],
  )

  const handleCloneSwarm = useCallback(
    async (swarm: AdminSwarm) => {
      setCloningId(swarm.id)
      try {
        const copy = await swarmApi.duplicateSwarm(swarm.id)
        setItems((prev) => [copy, ...prev])
        toast.success(`Cloned as "${copy.name}"`)
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not clone swarm"))
      } finally {
        setCloningId(null)
      }
    },
    [swarmApi],
  )

  const handleToggleSwarmActive = useCallback(
    async (swarm: AdminSwarm) => {
      const nextActive = swarm.active === false
      if (!nextActive) {
        const confirmed = window.confirm(
          `Deactivate "${swarm.name}"? It cannot be run until reactivated.`,
        )
        if (!confirmed) return
      }

      setTogglingActiveId(swarm.id)
      try {
        const updated = await swarmApi.updateSwarm(swarm.id, { active: nextActive })
        setItems((prev) => prev.map((item) => (item.id === swarm.id ? updated : item)))
        toast.success(
          nextActive ? `"${swarm.name}" activated` : `"${swarm.name}" deactivated`,
        )
      } catch (err) {
        toast.error(
          apiErrorMessage(err, `Could not ${nextActive ? "activate" : "deactivate"} swarm`),
        )
      } finally {
        setTogglingActiveId(null)
      }
    },
    [swarmApi],
  )

  const allActive = useMemo(
    () => items.length > 0 && items.every((swarm) => swarm.active !== false),
    [items],
  )

  const handleToggleAllActive = useCallback(async () => {
    const nextActive = !allActive
    const action = nextActive ? "activate" : "deactivate"
    const confirmed = window.confirm(
      nextActive
        ? `Activate all ${items.length} swarm${items.length === 1 ? "" : "s"}? They will be runnable again.`
        : `Deactivate all ${items.length} swarm${items.length === 1 ? "" : "s"}? They cannot be run until reactivated.`,
    )
    if (!confirmed) return

    setTogglingAll(true)
    try {
      const updated = await swarmApi.setAllSwarmsActive(nextActive)
      setItems((prev) => {
        const byId = new Map(updated.map((swarm) => [swarm.id, swarm]))
        return prev.map((swarm) => byId.get(swarm.id) ?? { ...swarm, active: nextActive })
      })
      toast.success(nextActive ? "All swarms activated" : "All swarms deactivated")
    } catch (err) {
      toast.error(apiErrorMessage(err, `Could not ${action} swarms`))
    } finally {
      setTogglingAll(false)
    }
  }, [allActive, items.length, swarmApi])

  const busy =
    creating !== null ||
    deletingId !== null ||
    cloningId !== null ||
    togglingActiveId !== null ||
    togglingAll

  if (loading) {
    return (
      <div className="main">
        <Loader compact />
        <style jsx>{`
          .main {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="main">
      <header className="top">
        <div>
          <h1 className="title">Swarms</h1>
          <p className="sub">Configure agent workers, graph topology, and test runs.</p>
        </div>
        <div className="actions">
          {items.length > 0 ? (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={busy}
              onClick={() => void handleToggleAllActive()}
            >
              <TbPower size={16} aria-hidden />
              <span>
                {togglingAll
                  ? allActive
                    ? "Deactivating…"
                    : "Activating…"
                  : allActive
                    ? "Deactivate all"
                    : "Activate all"}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={() => void handleLoadTemplate()}
          >
            <TbTemplate size={16} aria-hidden />
            <span>{creating === "template" ? "Loading…" : "Load demo template"}</span>
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={busy}
            onClick={() => void handleNewSwarm()}
          >
            <TbPlus size={16} aria-hidden />
            <span>{creating === "blank" ? "Creating…" : "New swarm"}</span>
          </button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="empty">
          <p>No swarms yet. Create one or load the demo template to get a working example.</p>
        </div>
      ) : (
        <ul className="grid">
          {items.map((swarm) => {
            const isActive = swarm.active !== false
            return (
              <li key={swarm.id} className={`tile${isActive ? "" : " tile--inactive"}`}>
                <div className="card">
                  <div className="card-main">
                    <span className="card-icon" aria-hidden>
                      <LogoMark size={32} />
                    </span>
                    <span className="card-body">
                      <span className="name">{swarm.name}</span>
                      <span className="meta">
                        {metaBySwarmId[swarm.id] ??
                          formatSwarmListMeta(swarm)}
                      </span>
                    </span>
                  </div>
                  <div className="card-footer">
                    <button
                      type="button"
                      className="card-action"
                      disabled={busy}
                      onClick={() => openWorkspace(swarm.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="card-action"
                      disabled={busy}
                      onClick={() => setApiSwarm(swarm)}
                    >
                      API
                    </button>
                  </div>
                </div>
                <div className="card-tools">
                  <button
                    type="button"
                    className={`tool-btn tool-btn--power${isActive ? " tool-btn--power-on" : " tool-btn--power-off"}`}
                    disabled={busy}
                    aria-pressed={isActive}
                    aria-label={isActive ? `Deactivate ${swarm.name}` : `Activate ${swarm.name}`}
                    title={isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                    onClick={() => void handleToggleSwarmActive(swarm)}
                  >
                    {togglingActiveId === swarm.id ? (
                      <span className="tool-label">…</span>
                    ) : (
                      <>
                        <span className="power-dot" aria-hidden />
                        <span className="power-text">{isActive ? "On" : "Off"}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="tool-btn"
                    disabled={busy}
                    aria-label={`Clone ${swarm.name}`}
                    title="Clone swarm"
                    onClick={() => void handleCloneSwarm(swarm)}
                  >
                    {cloningId === swarm.id ? (
                      <span className="tool-label">…</span>
                    ) : (
                      <TbCopy size={16} aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    className="tool-btn tool-btn--delete"
                    disabled={busy}
                    aria-label={`Delete ${swarm.name}`}
                    title="Delete swarm"
                    onClick={() => void handleDeleteSwarm(swarm)}
                  >
                    {deletingId === swarm.id ? (
                      <span className="tool-label">…</span>
                    ) : (
                      <TbTrash size={16} aria-hidden />
                    )}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {apiSwarm ? (
        <div className="api-backdrop" role="presentation" onClick={() => setApiSwarm(null)}>
          <div
            className="api-panel"
            role="dialog"
            aria-labelledby="api-panel-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="api-head">
              <h2 id="api-panel-title" className="api-title">
                API · {apiSwarm.name}
              </h2>
              <button
                type="button"
                className="api-close"
                onClick={() => setApiSwarm(null)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <p className="api-lead">
              Run this swarm with a Bearer token. Match <code>input</code> keys to your Start node
              variables.
            </p>
            <div className="api-block">
              <span className="api-label">Run (JSON)</span>
              <code className="api-endpoint">POST {swarmRunUrl(apiSwarm.id)}</code>
            </div>
            <div className="api-block">
              <span className="api-label">Run (SSE stream)</span>
              <code className="api-endpoint">POST {swarmRunUrl(apiSwarm.id, { stream: true })}</code>
            </div>
            <div className="api-block">
              <span className="api-label">Admin run</span>
              <code className="api-endpoint">POST {swarmRunUrl(apiSwarm.id, { admin: true })}</code>
            </div>
            <pre className="api-curl">
              {buildSwarmRunCurl(apiSwarm.id, { admin: apiMode === "admin" })}
            </pre>
            <div className="api-actions">
              <button
                type="button"
                className="api-btn"
                onClick={() =>
                  void copyText(buildSwarmRunCurl(apiSwarm.id), "cURL copied to clipboard")
                }
              >
                Copy cURL
              </button>
              <button
                type="button"
                className="api-btn api-btn--ghost"
                onClick={() =>
                  void copyText(swarmRunUrl(apiSwarm.id), "Endpoint copied to clipboard")
                }
              >
                Copy endpoint
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .main {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 1.75rem;
          background: var(--app-bg);
        }
        .top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .top .title {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          color: var(--app-text);
        }
        .sub {
          margin: 0.125rem 0 0;
          font-size: 0.75rem;
          color: var(--app-text-faint);
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          border-radius: var(--app-radius-md);
          font-family: var(--app-font);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            opacity 0.15s ease;
        }
        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .btn--primary {
          background: var(--app-text);
          color: var(--app-surface);
          border-color: var(--app-text);
        }
        .btn--primary:hover:not(:disabled) {
          opacity: 0.9;
        }
        .btn--ghost {
          background: var(--app-surface);
          color: var(--app-text);
          border-color: var(--app-border-strong);
        }
        .btn--ghost:hover:not(:disabled) {
          background: var(--app-surface-muted);
        }
        .empty {
          margin-top: 1.25rem;
          border: 1px dashed var(--app-border-strong);
          border-radius: var(--app-radius-lg);
          padding: 1.25rem;
          background: var(--app-surface);
        }
        .empty p {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--app-text-muted);
        }
        .grid {
          list-style: none;
          margin: 1.25rem 0 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
          gap: 0.75rem;
        }
        .tile {
          position: relative;
          min-width: 0;
        }
        .card {
          width: 100%;
          min-height: 8.5rem;
          border: 1px solid var(--app-border-strong);
          border-radius: 0;
          background: var(--app-surface);
          font-family: var(--app-font);
          display: flex;
          flex-direction: column;
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }
        .tile:hover .card {
          border-color: var(--app-text);
        }
        .tile--inactive .card {
          background: var(--app-surface-muted);
        }
        .tile--inactive:hover .card {
          border-color: var(--app-border-strong);
        }
        .card-main {
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.875rem 0.75rem 0.625rem;
          min-width: 0;
        }
        .card-footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-top: 1px solid var(--app-border-strong);
        }
        .card-action {
          padding: 0.4375rem 0.5rem;
          border: none;
          border-radius: 0;
          background: var(--app-surface);
          color: var(--app-text);
          font-family: var(--app-font);
          font-size: 0.6875rem;
          font-weight: 500;
          cursor: pointer;
          transition:
            background 0.15s ease,
            color 0.15s ease;
        }
        .card-action + .card-action {
          border-left: 1px solid var(--app-border-strong);
        }
        .card-action:hover:not(:disabled) {
          background: var(--app-surface-muted);
        }
        .card-action:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .card-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0a;
          line-height: 0;
        }
        .card-body {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding-top: 0.125rem;
          padding-right: 6.75rem;
        }
        .name {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--app-text);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .meta {
          font-size: 0.75rem;
          color: var(--app-text-faint);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-tools {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 1;
          display: inline-flex;
          align-items: stretch;
          border: 1px solid var(--app-border-strong);
          border-top: none;
          border-right: none;
          background: var(--app-surface);
          box-shadow: inset 1px 0 0 var(--app-border);
        }
        .tile--inactive .card-tools {
          background: var(--app-surface-muted);
        }
        .tool-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          margin: 0;
          padding: 0;
          border: none;
          border-radius: 0;
          background: transparent;
          color: var(--app-text-muted);
          cursor: pointer;
          font-family: var(--app-font);
          transition:
            background 0.15s ease,
            color 0.15s ease;
        }
        .tool-btn:not(:last-child) {
          border-right: 1px solid var(--app-border-strong);
        }
        .tool-btn--power {
          width: auto;
          min-width: 2.875rem;
          gap: 0.3125rem;
          padding: 0 0.5rem;
        }
        .tool-btn--power-on {
          background: #ecfdf5;
          color: #166534;
        }
        .tool-btn--power-off {
          background: var(--app-surface-muted);
          color: var(--app-text-faint);
        }
        .power-dot {
          width: 0.4375rem;
          height: 0.4375rem;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .tool-btn--power-on .power-dot {
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.22);
        }
        .tool-btn--power-off .power-dot {
          background: #9ca3af;
        }
        .power-text {
          font-size: 0.5625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .tool-btn:hover:not(:disabled) {
          background: var(--app-surface-muted);
          color: var(--app-text);
        }
        .tool-btn--power-on:hover:not(:disabled) {
          background: #dcfce7;
          color: #166534;
        }
        .tool-btn--power-off:hover:not(:disabled) {
          background: var(--app-surface);
          color: var(--app-text-muted);
        }
        .tool-btn--delete:hover:not(:disabled) {
          background: #fff5f5;
          color: #c62828;
        }
        .tile:hover .card-tools {
          border-color: color-mix(in srgb, var(--app-text) 22%, var(--app-border-strong));
        }
        .tile--inactive:hover .card-tools {
          border-color: var(--app-border-strong);
        }
        .tool-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .tool-label {
          font-size: 0.625rem;
          font-weight: 500;
          line-height: 1;
        }
        .api-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(10, 10, 10, 0.35);
        }
        .api-panel {
          width: min(100%, 28rem);
          max-height: min(90vh, 32rem);
          overflow: auto;
          padding: 1rem 1rem 1.125rem;
          border: 1px solid var(--app-border-strong);
          border-radius: 0;
          background: var(--app-surface);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }
        .api-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .api-title {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--app-text);
          line-height: 1.35;
        }
        .api-close {
          flex-shrink: 0;
          width: 1.75rem;
          height: 1.75rem;
          padding: 0;
          border: 1px solid var(--app-border-strong);
          border-radius: 0;
          background: var(--app-surface);
          color: var(--app-text-muted);
          font-size: 1.125rem;
          line-height: 1;
          cursor: pointer;
        }
        .api-close:hover {
          background: var(--app-surface-muted);
          color: var(--app-text);
        }
        .api-lead {
          margin: 0.5rem 0 0.875rem;
          font-size: 0.75rem;
          color: var(--app-text-muted);
          line-height: 1.45;
        }
        .api-lead :global(code) {
          font-size: 0.6875rem;
        }
        .api-block {
          margin-bottom: 0.625rem;
        }
        .api-label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.625rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--app-text-faint);
        }
        .api-endpoint {
          display: block;
          font-size: 0.6875rem;
          line-height: 1.4;
          word-break: break-all;
          color: var(--app-text);
        }
        .api-curl {
          margin: 0.75rem 0;
          padding: 0.625rem 0.75rem;
          border: 1px solid var(--app-border);
          border-radius: 0;
          background: var(--app-surface-muted);
          font-size: 0.6875rem;
          line-height: 1.45;
          white-space: pre-wrap;
          word-break: break-all;
          color: var(--app-text);
        }
        .api-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .api-btn {
          padding: 0.4375rem 0.75rem;
          border: 1px solid var(--app-text);
          border-radius: 0;
          background: var(--app-text);
          color: var(--app-surface);
          font-family: var(--app-font);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
        }
        .api-btn:hover {
          opacity: 0.9;
        }
        .api-btn--ghost {
          background: var(--app-surface);
          color: var(--app-text);
          border-color: var(--app-border-strong);
        }
        .api-btn--ghost:hover {
          background: var(--app-surface-muted);
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
