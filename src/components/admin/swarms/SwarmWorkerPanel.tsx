"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { TbChevronRight, TbX } from "react-icons/tb"
import createServices, {
  type AdminAgentWorker,
  type AdminUpdateAgentWorkerPayload,
  type InferenceProviderSetup,
  type InferenceSetup,
} from "@/data/api/server"
import { ApiServices } from "@/data/api/server/config"
import { toast } from "@/lib/toast"
import { useResizableSidePanelWidth } from "@/lib/resizable-side-panel"
import AgentToolsSection from "./AgentToolsSection"
import ResizablePanelEdge from "./ResizablePanelEdge"
import GrokToolsSection from "./GrokToolsSection"
import InstructionsEditor from "./InstructionsEditor"
import PromptMessagesEditor, {
  promptMessagesFromWorker,
  promptMessagesToPayload,
  type PromptMessageDraft,
} from "./PromptMessagesEditor"
import OutputSchemaEditor from "./OutputSchemaEditor"
import {
  isAgentToolId,
  parseAgentToolIds,
  type AgentToolCatalogEntry,
  type AgentToolId,
} from "@/lib/agent-tools"
import {
  grokToolsToPayload,
  parseGrokWorkerTools,
  type GrokWorkerToolsConfig,
} from "@/lib/grok-worker-tools"
import {
  openAiToolsToPayload,
  parseOpenAiWorkerTools,
  type OpenAiWorkerToolsConfig,
} from "@/lib/openai-worker-tools"
import { parseSwarmToolIds } from "@/lib/swarm-tool-utils"
import {
  buildInstructionsContextVariables,
  buildReferencedSwarmLookup,
  extractSchemaPropertyKeys,
} from "@/lib/swarm-graph-vars"
import {
  mergeGlobalContextVariables,
  formatAgentsAvailablesText,
  formatDepartmentsText,
  formatToolsAvailablesText,
} from "@/lib/swarm-global-context-vars"
import { validateWorkerOutputSchemaUnique } from "@/lib/swarm-output-vars"
import type { SwarmGraph } from "@/data/api/server"
import WorkerModelFields from "./WorkerModelFields"
import { useSwarmEditorDepartments } from "./useSwarmEditorDepartments"
import { useSwarmEditorHiredAgents } from "./useSwarmEditorHiredAgents"
import { useSwarmEditorTools } from "./useSwarmEditorTools"
import { useSwarmEditor } from "./editor/SwarmEditorContext"
import {
  CUSTOM_OPTION,
  buildProviderOptions,
  normalizeProviderId,
  readPersistedWorkerModelName,
  readPersistedWorkerProvider,
  resolveWorkerModelForSave,
  resolveWorkerModelSelection,
  warnIfMongooseModelShape,
} from "@/lib/inference-models"

type Props = {
  worker: AdminAgentWorker
  /** Canvas node id — upstream tokens are keyed by node, not worker name. */
  canvasNodeId: string
  graph: SwarmGraph | null
  workerById: Record<string, AdminAgentWorker>
  saving: boolean
  onClose: () => void
  onSave: (patch: AdminUpdateAgentWorkerPayload) => Promise<AdminAgentWorker | null>
}

/** Keeps text inputs controlled when API fields are missing. */
function asInputString(value: string | undefined | null): string {
  return value ?? ""
}

function asNumberInputString(value: number | undefined | null): string {
  return value != null && Number.isFinite(value) ? String(value) : ""
}

function readParamNumber(params: Record<string, unknown> | undefined, key: string): string {
  const value = params?.[key]
  return typeof value === "number" && Number.isFinite(value) ? String(Math.floor(value)) : ""
}

function schemaToText(schema?: Record<string, unknown>): string {
  if (!schema || Object.keys(schema).length === 0) return ""
  return JSON.stringify(schema, null, 2)
}

function parseSchemaKeysQuiet(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return extractSchemaPropertyKeys(parsed as Record<string, unknown>)
    }
  } catch {
    /* ignore invalid draft JSON */
  }
  return []
}

function textToSchema(text: string): Record<string, unknown> | null {
  const trimmed = text.trim()
  if (!trimmed) return {}
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    toast.error("Schema must be a JSON object")
    return null
  } catch {
    toast.error("Invalid JSON in schema field")
    return null
  }
}

type OutputFormat = "text" | "structured"

type ConfigTab = "instructions" | "tools"

function schemaHasOutputFields(schema?: Record<string, unknown>): boolean {
  if (!schema) return false
  const props = schema.properties
  return props != null && typeof props === "object" && Object.keys(props).length > 0
}

function detectOutputFormat(schema?: Record<string, unknown>): OutputFormat {
  return schemaHasOutputFields(schema) ? "structured" : "text"
}

function buildModelParams(input: {
  existingParams: Record<string, unknown> | undefined
  jsonMode: boolean
  maxTokens: string
  modelChanged: boolean
}): Record<string, unknown> {
  const params = { ...(input.existingParams ?? {}) }

  if (input.modelChanged) {
    delete params.model
  }

  if (input.jsonMode) params.jsonMode = true
  else delete params.jsonMode

  const parsedMaxTokens = Number.parseInt(input.maxTokens.trim(), 10)
  if (Number.isFinite(parsedMaxTokens) && parsedMaxTokens >= 1) {
    params.maxTokens = parsedMaxTokens
  } else {
    delete params.maxTokens
  }

  return params
}

/**
 * Lazily-loaded backend setup (`GET /inference/setup`). Cached at module scope
 * so reopening different workers doesn't refetch.
 */
let inferenceSetupCache: InferenceSetup | null | undefined

function useInferenceSetup(): {
  providers: InferenceProviderSetup[] | null
  agentToolsCatalog: AgentToolCatalogEntry[]
  loading: boolean
} {
  const [setup, setSetup] = useState<InferenceSetup | null>(inferenceSetupCache ?? null)
  const [loading, setLoading] = useState<boolean>(inferenceSetupCache === undefined)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (inferenceSetupCache !== undefined) return
    if (fetchedRef.current) return
    fetchedRef.current = true

    const services = createServices(ApiServices)
    setLoading(true)
    services
      .getInferenceSetup()
      .then((next) => {
        inferenceSetupCache = next
        setSetup(next)
      })
      .catch(() => {
        inferenceSetupCache = null
        setSetup(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const agentToolsCatalog = (setup?.agentTools?.catalog ?? []).flatMap((entry) =>
    isAgentToolId(entry.id)
      ? [
          {
            id: entry.id,
            name: entry.name,
            description: entry.description,
            configured: entry.configured,
          },
        ]
      : [],
  )

  return {
    providers: setup?.providers ?? null,
    agentToolsCatalog,
    loading,
  }
}

export default function SwarmWorkerPanel({
  worker,
  canvasNodeId,
  graph,
  workerById,
  saving,
  onClose,
  onSave,
}: Props) {
  const [configTab, setConfigTab] = useState<ConfigTab>("instructions")
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(() =>
    detectOutputFormat(worker.outputSchema),
  )
  const [name, setName] = useState(() => asInputString(worker.name))

  useEffect(() => {
    setName(asInputString(worker.name))
  }, [worker.id, worker.name, worker.updatedAt])

  useEffect(() => {
    setConfigTab("instructions")
  }, [worker.id])
  /** `null` = show the worker saved on the server; non-null = user edit in this session. */
  const [providerDraft, setProviderDraft] = useState<string | null>(null)
  const [modelDraft, setModelDraft] = useState<string | null>(null)
  const [systemPrompt, setSystemPrompt] = useState(() => asInputString(worker.systemPrompt))
  const [promptMessages, setPromptMessages] = useState<PromptMessageDraft[]>(() =>
    promptMessagesFromWorker(worker.promptMessages),
  )
  const [outputSchemaText, setOutputSchemaText] = useState(() => schemaToText(worker.outputSchema))
  const [jsonMode, setJsonMode] = useState(Boolean(worker.model?.params?.jsonMode))
  const [maxTokens, setMaxTokens] = useState(() =>
    readParamNumber(worker.model?.params, "maxTokens"),
  )
  const [maxRetries, setMaxRetries] = useState(() => asNumberInputString(worker.maxRetries))
  const [timeoutMs, setTimeoutMs] = useState(() => asNumberInputString(worker.timeoutMs))
  const [openaiTools, setOpenaiTools] = useState<OpenAiWorkerToolsConfig>(() =>
    parseOpenAiWorkerTools(worker.openaiTools as Record<string, unknown> | undefined),
  )
  const [grokTools, setGrokTools] = useState<GrokWorkerToolsConfig>(() =>
    parseGrokWorkerTools(worker.grokTools as Record<string, unknown> | undefined),
  )
  const [agentTools, setAgentTools] = useState<AgentToolId[]>(() =>
    parseAgentToolIds(worker.agentTools),
  )
  const [swarmTools, setSwarmTools] = useState<string[]>(() =>
    parseSwarmToolIds(worker.swarmTools),
  )

  const { panelStyle, resizeActive, startResize } = useResizableSidePanelWidth()
  const { pickerSwarms, currentSwarmId } = useSwarmEditor()
  const referencedSwarmById = useMemo(
    () => buildReferencedSwarmLookup(pickerSwarms),
    [pickerSwarms],
  )

  const contextVariables = useMemo(
    () =>
      buildInstructionsContextVariables(
        canvasNodeId,
        graph,
        workerById,
        referencedSwarmById,
      ),
    [canvasNodeId, graph, workerById, referencedSwarmById],
  )

  const { departments } = useSwarmEditorDepartments()
  const { hiredAgents } = useSwarmEditorHiredAgents()
  const { toolsAvailable } = useSwarmEditorTools()

  const globalVariables = useMemo(() => mergeGlobalContextVariables(), [])

  const globalReferencePreviewSections = useMemo(() => {
    const sections: Array<{ label: string; body: string }> = []
    if (departments.length > 0) {
      sections.push({
        label: "Departments list (text)",
        body: formatDepartmentsText(departments),
      })
    }
    sections.push({
      label: "Hired agents catalog (JSON text)",
      body: hiredAgents.length > 0 ? formatAgentsAvailablesText(hiredAgents) : "[]",
    })
    sections.push({
      label: "Connected tools catalog (JSON text)",
      body: formatToolsAvailablesText(toolsAvailable),
    })
    return sections
  }, [departments, hiredAgents, toolsAvailable])

  const globalMenuHint = useMemo(() => {
    return "When you run the swarm with a companyId, the API fills company memory, department lists, hired agents, and connected tools automatically. Pick a token to insert it into your instructions."
  }, [])

  const structuredVariables = useMemo(() => {
    if (outputFormat !== "structured") return []
    return parseSchemaKeysQuiet(outputSchemaText).map((key) => ({
      token: `{{${key}}}`,
      label: key,
    }))
  }, [outputFormat, outputSchemaText])

  const { providers: backendProviders, agentToolsCatalog, loading: providersLoading } =
    useInferenceSetup()

  const providerOptions = useMemo(
    () => buildProviderOptions(backendProviders),
    [backendProviders],
  )

  const persistedModelName = readPersistedWorkerModelName(worker.model)
  const persistedProvider =
    readPersistedWorkerProvider(worker.model) ||
    providerOptions[0]?.id ||
    "openai_direct"

  useEffect(() => {
    warnIfMongooseModelShape(worker.id, worker.model)
  }, [worker.id, worker.model])
  const provider = providerDraft ?? persistedProvider
  const modelName = modelDraft ?? persistedModelName

  const modelSelection = useMemo(
    () =>
      resolveWorkerModelSelection({
        provider,
        localModelName: modelName,
        persistedModelName,
        providerOptions,
      }),
    [provider, modelName, persistedModelName, providerOptions],
  )

  const { canonicalProvider, modelSelectValue, modelOptions } = modelSelection

  const serverModelKey = `${readPersistedWorkerProvider(worker.model)}:${persistedModelName}:${worker.updatedAt ?? ""}`

  useEffect(() => {
    setProviderDraft(null)
    setModelDraft(null)
  }, [serverModelKey, worker.id])

  useEffect(() => {
    setPromptMessages(promptMessagesFromWorker(worker.promptMessages))
  }, [worker.id, worker.updatedAt, worker.promptMessages])

  useEffect(() => {
    setAgentTools(parseAgentToolIds(worker.agentTools))
    setSwarmTools(parseSwarmToolIds(worker.swarmTools))
    setOpenaiTools(parseOpenAiWorkerTools(worker.openaiTools as Record<string, unknown> | undefined))
    setGrokTools(parseGrokWorkerTools(worker.grokTools as Record<string, unknown> | undefined))
  }, [worker.id, worker.updatedAt, worker.agentTools, worker.swarmTools, worker.openaiTools, worker.grokTools])

  const handleOutputFormatChange = (next: OutputFormat) => {
    setOutputFormat(next)
    if (next === "text") setOutputSchemaText("")
  }

  const handleSave = async () => {
    const { effectiveModelName } = modelSelection
    const resolvedModel = resolveWorkerModelForSave({
      provider,
      modelName:
        modelSelectValue !== CUSTOM_OPTION ? modelSelectValue : effectiveModelName,
      modelSelectValue,
      modelOptions,
      fallback: {
        provider: readPersistedWorkerProvider(worker.model),
        name: persistedModelName,
      },
    })

    if (!resolvedModel) {
      toast.error("Enter a model name")
      return
    }

    const outputSchema =
      outputFormat === "text" ? {} : textToSchema(outputSchemaText)
    if (outputSchema === null) return

    if (outputFormat === "structured") {
      const conflict = validateWorkerOutputSchemaUnique(
        worker.id,
        outputSchema,
        graph,
        workerById,
      )
      if (conflict) {
        toast.error(conflict)
        return
      }
    }

    const parsedMaxRetries = Number.parseInt(maxRetries, 10)
    const parsedTimeoutMs = Number.parseInt(timeoutMs, 10)
    if (!Number.isFinite(parsedMaxRetries) || parsedMaxRetries < 0) {
      toast.error("Enter a valid max retries value")
      return
    }
    if (!Number.isFinite(parsedTimeoutMs) || parsedTimeoutMs < 1) {
      toast.error("Enter a valid timeout")
      return
    }

    const modelChanged =
      normalizeProviderId(resolvedModel.provider) !==
        normalizeProviderId(readPersistedWorkerProvider(worker.model)) ||
      resolvedModel.name !== persistedModelName

    const params = buildModelParams({
      existingParams: worker.model?.params,
      jsonMode,
      maxTokens,
      modelChanged,
    })

    const updated = await onSave({
      name: name.trim(),
      model: { ...resolvedModel, params },
      systemPrompt,
      promptMessages: promptMessagesToPayload(promptMessages),
      outputSchema,
      maxRetries: parsedMaxRetries,
      timeoutMs: parsedTimeoutMs,
      openaiTools: openAiToolsToPayload(openaiTools, agentTools),
      grokTools: grokToolsToPayload(grokTools),
      agentTools,
      swarmTools,
    })

    if (!updated) return

    setProviderDraft(null)
    setModelDraft(null)
  }

  return (
    <aside
      className={`panel${resizeActive ? " panel--resizing" : ""}`}
      style={panelStyle}
      aria-label="Agent worker configuration"
    >
      <ResizablePanelEdge
        active={resizeActive}
        onMouseDown={startResize}
        ariaLabel="Resize configure agent panel"
      />

      <header className="head">
        <div className="head-text">
          <h2 className="title">Configure agent</h2>
          <input
            className="name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Agent name"
            placeholder="Agent name"
          />
        </div>
        <button type="button" className="close" onClick={onClose} aria-label="Close panel">
          <TbX size={16} />
        </button>
      </header>

      <div
        className="config-tabs"
        role="tablist"
        aria-label="Configure agent sections"
      >
        <button
          type="button"
          role="tab"
          className={`config-tab${configTab === "instructions" ? " config-tab--active" : ""}`}
          aria-selected={configTab === "instructions"}
          onClick={() => setConfigTab("instructions")}
        >
          Instructions
        </button>
        <button
          type="button"
          role="tab"
          className={`config-tab${configTab === "tools" ? " config-tab--active" : ""}`}
          aria-selected={configTab === "tools"}
          onClick={() => setConfigTab("tools")}
        >
          Tools and model
        </button>
      </div>

      <div className="fields">
        {configTab === "instructions" ? (
          <>
            <InstructionsEditor
              variables={contextVariables}
              globalVariables={globalVariables}
              globalMenuHint={globalMenuHint}
              globalReferencePreviewSections={globalReferencePreviewSections}
              structuredVariables={structuredVariables}
              outputSchema={
                outputFormat === "structured"
                  ? {
                      editorKey: worker.id,
                      value: outputSchemaText,
                      onChange: setOutputSchemaText,
                      workerName: name,
                      openAiStructured: canonicalProvider === "openai_direct",
                      nonOpenAiHint:
                        canonicalProvider !== "openai_direct"
                          ? "Enable JSON mode under Advanced for non-OpenAI providers."
                          : undefined,
                    }
                  : undefined
              }
              value={systemPrompt}
              onChange={setSystemPrompt}
            />

            <PromptMessagesEditor
              messages={promptMessages}
              onChange={setPromptMessages}
              variables={contextVariables}
              globalVariables={globalVariables}
              globalMenuHint={globalMenuHint}
              globalReferencePreviewSections={globalReferencePreviewSections}
              structuredVariables={structuredVariables}
            />

            <label className="setting">
              <span className="setting-label">Output format</span>
              <select
                className="setting-control"
                value={outputFormat}
                onChange={(e) => handleOutputFormatChange(e.target.value as OutputFormat)}
              >
                <option value="text">Text</option>
                <option value="structured">Structured (JSON)</option>
              </select>
            </label>

            {outputFormat === "structured" ? (
              <div className="structured-block">
                <OutputSchemaEditor
                  key={worker.id}
                  value={outputSchemaText}
                  onChange={setOutputSchemaText}
                  workerName={name}
                  openAiStructured={canonicalProvider === "openai_direct"}
                />
                {canonicalProvider !== "openai_direct" ? (
                  <p className="hint">Enable JSON mode under Advanced for non-OpenAI providers.</p>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <WorkerModelFields
              provider={provider}
              modelName={modelName}
              persistedModelName={persistedModelName}
              providerOptions={providerOptions}
              providersLoading={providersLoading}
              onProviderChange={setProviderDraft}
              onModelNameChange={setModelDraft}
            />

            {canonicalProvider === "openai_direct" ? (
              <AgentToolsSection
                openaiTools={openaiTools}
                agentTools={agentTools}
                catalog={agentToolsCatalog}
                onOpenaiToolsChange={setOpenaiTools}
                onAgentToolsChange={setAgentTools}
                swarmTools={swarmTools}
                pickerSwarms={pickerSwarms}
                currentSwarmId={currentSwarmId}
                onSwarmToolsChange={setSwarmTools}
                openAiDirect
              />
            ) : null}

            {canonicalProvider === "grok_direct" ? (
              <GrokToolsSection
                grokTools={grokTools}
                onGrokToolsChange={setGrokTools}
                grokDirect
              />
            ) : null}

            {canonicalProvider !== "openai_direct" &&
            canonicalProvider !== "grok_direct" ? (
              <p className="tools-provider-hint">
                Tools are available when the provider is OpenAI Direct or xAI Grok.
              </p>
            ) : null}

            <details className="more">
              <summary className="more-summary">
                <TbChevronRight className="more-summary-icon" size={13} aria-hidden />
                <span>Advanced</span>
              </summary>
              <div className="more-body">
                <label className="field">
                  <span>Max output tokens</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="No limit"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                  />
                  <span className="hint">Leave empty to omit from the API request (no cap).</span>
                </label>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={jsonMode}
                    onChange={(e) => setJsonMode(e.target.checked)}
                  />
                  <span>JSON mode (non-OpenAI structured responses)</span>
                </label>

                <div className="row">
                  <label className="field">
                    <span>Max retries</span>
                    <input
                      type="number"
                      min={0}
                      value={maxRetries}
                      onChange={(e) => setMaxRetries(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Timeout (ms)</span>
                    <input
                      type="number"
                      min={1}
                      value={timeoutMs}
                      onChange={(e) => setTimeoutMs(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </details>
          </>
        )}
      </div>

      <footer className="foot">
        <button type="button" className="save" disabled={saving} onClick={() => void handleSave()}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </footer>

      <style jsx>{`
        .panel {
          position: relative;
          flex-shrink: 0;
          border-left: 1px solid var(--app-border);
          background: var(--app-surface);
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 100%;
          min-height: 0;
          overflow: hidden;
        }
        .panel--resizing {
          transition: none;
        }
        .head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 1rem 1rem 0.75rem;
          border-bottom: 1px solid var(--app-border);
          flex-shrink: 0;
        }
        .head-text {
          min-width: 0;
          flex: 1;
        }
        .title {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--app-text);
        }
        .name-input {
          display: block;
          width: 100%;
          margin: 0.25rem 0 0;
          padding: 0.2rem 0.35rem;
          margin-left: -0.35rem;
          font-size: 0.6875rem;
          font-family: var(--app-font);
          color: var(--app-text-muted);
          background: transparent;
          border: 1px solid transparent;
          border-radius: calc(var(--app-radius) - 2px);
        }
        .name-input:hover {
          color: var(--app-text);
        }
        .name-input:focus {
          outline: none;
          color: var(--app-text);
          background: var(--app-bg);
          border-color: var(--app-border);
          box-shadow: var(--app-btn-focus-ring);
        }
        .name-input::placeholder {
          color: var(--app-text-faint);
        }
        .close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          color: var(--app-text-muted);
          cursor: pointer;
        }
        .close:hover {
          color: var(--app-text);
          border-color: var(--app-border-strong);
        }
        .config-tabs {
          display: flex;
          gap: 0.125rem;
          padding: 0.5rem 1rem 0;
          flex-shrink: 0;
        }
        .config-tab {
          flex: 1;
          padding: 0.375rem 0.5rem;
          font-size: 0.6875rem;
          font-weight: 500;
          font-family: var(--app-font);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface-muted);
          color: var(--app-text-muted);
          cursor: pointer;
        }
        .config-tab--active {
          background: var(--app-bg);
          color: var(--app-text);
          border-color: var(--app-border-strong);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .fields {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-height: 0;
        }
        .setting {
          display: grid;
          grid-template-columns: 5.5rem 1fr;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
        }
        .setting--indent {
          grid-template-columns: 5.5rem 1fr;
          padding-left: 0;
        }
        .setting-label {
          display: inline-flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.25rem;
          color: var(--app-text-muted);
          font-size: 0.75rem;
        }
        .setting-control {
          width: 100%;
          font-size: 0.75rem;
          padding: 0.4375rem 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          color: var(--app-text);
          font-family: var(--app-font);
        }
        .setting-control:focus {
          outline: none;
          border-color: var(--app-border-strong);
          box-shadow: var(--app-btn-focus-ring);
        }
        .setting select.setting-control {
          appearance: none;
          background-image: linear-gradient(
              45deg,
              transparent 50%,
              var(--app-text-muted) 50%
            ),
            linear-gradient(135deg, var(--app-text-muted) 50%, transparent 50%);
          background-position:
            calc(100% - 14px) 50%,
            calc(100% - 9px) 50%;
          background-size:
            5px 5px,
            5px 5px;
          background-repeat: no-repeat;
          padding-right: 1.75rem;
          cursor: pointer;
        }
        .structured-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .tools-provider-hint {
          margin: 0;
          font-size: 0.625rem;
          color: var(--app-text-faint);
          line-height: 1.4;
        }
        .more {
          border-top: 1px solid var(--app-border);
          padding-top: 0.5rem;
        }
        .more-summary {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--app-text-muted);
          cursor: pointer;
          list-style: none;
          user-select: none;
        }
        .more-summary::-webkit-details-marker {
          display: none;
        }
        .more-summary-icon {
          flex-shrink: 0;
          transition: transform 0.12s ease;
        }
        .more[open] .more-summary {
          color: var(--app-text);
          margin-bottom: 0.625rem;
        }
        .more[open] .more-summary-icon {
          transform: rotate(90deg);
        }
        .more-body {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
        }
        .field > span {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }
        .field--full {
          grid-column: 1 / -1;
        }
        .field input,
        .field textarea,
        .field select {
          font-size: 0.75rem;
          padding: 0.4375rem 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-bg);
          color: var(--app-text);
          font-family: var(--app-font);
        }
        .field select {
          appearance: none;
          background-image: linear-gradient(
              45deg,
              transparent 50%,
              var(--app-text-muted) 50%
            ),
            linear-gradient(135deg, var(--app-text-muted) 50%, transparent 50%);
          background-position:
            calc(100% - 14px) 50%,
            calc(100% - 9px) 50%;
          background-size:
            5px 5px,
            5px 5px;
          background-repeat: no-repeat;
          padding-right: 1.75rem;
          cursor: pointer;
        }
        .field .custom-input {
          margin-top: 0.25rem;
        }
        .field textarea {
          resize: vertical;
          min-height: 6rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.6875rem;
          line-height: 1.45;
        }
        .field textarea.schema {
          min-height: 4rem;
        }
        .field .hint,
        .hint {
          font-size: 0.625rem;
          color: var(--app-text-faint);
          line-height: 1.4;
        }
        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          outline: none;
          border-color: var(--app-border-strong);
          box-shadow: var(--app-btn-focus-ring);
        }
        .check {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--app-text-muted);
          cursor: pointer;
        }
        .foot {
          padding: 0.75rem 1rem 1rem;
          border-top: 1px solid var(--app-border);
          flex-shrink: 0;
        }
        .save {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--app-bg);
          background: var(--app-text);
          border: none;
          border-radius: var(--app-radius);
          cursor: pointer;
          font-family: var(--app-font);
        }
        .save:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>
    </aside>
  )
}
