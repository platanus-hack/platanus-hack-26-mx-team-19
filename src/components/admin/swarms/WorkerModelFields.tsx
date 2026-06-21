"use client"

import { useMemo } from "react"
import {
  CUSTOM_OPTION,
  findProviderPreset,
  getEffectiveModelName,
  normalizeProviderId,
  resolveWorkerModelSelection,
  type ProviderPreset,
} from "@/lib/inference-models"

type ProviderOption = ProviderPreset & {
  configured?: boolean
  backendKnown?: boolean
}

type Props = {
  provider: string
  modelName: string
  persistedModelName: string
  providerOptions: ProviderOption[]
  providersLoading: boolean
  onProviderChange: (providerId: string) => void
  onModelNameChange: (modelName: string) => void
}

export default function WorkerModelFields({
  provider,
  modelName,
  persistedModelName,
  providerOptions,
  providersLoading,
  onProviderChange,
  onModelNameChange,
}: Props) {
  const selection = useMemo(
    () =>
      resolveWorkerModelSelection({
        provider,
        localModelName: modelName,
        persistedModelName,
        providerOptions,
      }),
    [provider, modelName, persistedModelName, providerOptions],
  )

  const { effectiveModelName, providerSelectValue, modelOptions, modelSelectValue } =
    selection

  const modelLabel = useMemo(() => {
    if (modelSelectValue === CUSTOM_OPTION || !effectiveModelName) {
      return effectiveModelName || "Custom model"
    }
    const preset = modelOptions.find((m) => m.id === modelSelectValue)
    return preset?.label ?? effectiveModelName
  }, [modelSelectValue, effectiveModelName, modelOptions])

  const handleProviderChange = (next: string) => {
    const canonical = normalizeProviderId(next)
    onProviderChange(canonical)

    const preset = findProviderPreset(canonical)
    if (!preset) return

    const currentName = getEffectiveModelName(modelName, persistedModelName)
    const stillValid = preset.models.some((m) => m.id === currentName)
    if (!stillValid && preset.models.length > 0) {
      const first = preset.models[0]
      if (first) onModelNameChange(first.id)
    }
  }

  const handleModelChange = (next: string) => {
    if (next === CUSTOM_OPTION) {
      onModelNameChange("")
      return
    }
    onModelNameChange(next)
  }

  return (
    <>
      <label className="setting">
        <span className="setting-label">Provider</span>
        <select
          className="setting-control"
          value={providerSelectValue}
          onChange={(e) => handleProviderChange(e.target.value)}
          disabled={providersLoading}
        >
          {providerOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          {providerSelectValue &&
          !providerOptions.some((p) => p.id === providerSelectValue) ? (
            <option value={providerSelectValue}>{providerSelectValue}</option>
          ) : null}
        </select>
      </label>

      <label className="setting">
        <span className="setting-label">Model</span>
        <select
          className="setting-control"
          value={modelSelectValue}
          onChange={(e) => handleModelChange(e.target.value)}
          aria-label={`Model: ${modelLabel}`}
        >
          {modelOptions.length === 0 ? (
            <option value={CUSTOM_OPTION}>No presets — enter a custom model</option>
          ) : null}
          {modelOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
          <option value={CUSTOM_OPTION}>Custom…</option>
        </select>
      </label>

      {(modelSelectValue === CUSTOM_OPTION || modelOptions.length === 0) && (
        <label className="setting setting--indent">
          <span className="setting-label">Model name</span>
          <input
            className="setting-control"
            placeholder="e.g. gpt-4o-mini"
            value={modelName}
            onChange={(e) => onModelNameChange(e.target.value)}
          />
        </label>
      )}

      <style jsx>{`
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
      `}</style>
    </>
  )
}

export { getEffectiveModelName }
