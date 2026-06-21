"use client"

import { useMemo } from "react"
import { TbMessage, TbPlus, TbTrash } from "react-icons/tb"
import type { AgentWorkerPromptMessage } from "@/data/api/server"
import type { GlobalContextVariable } from "@/lib/swarm-global-context-vars"
import type { PromptVariable } from "@/lib/swarm-graph-vars"
import InstructionsEditor from "./InstructionsEditor"
import type { ContextPickerPreviewSection } from "./InstructionsContextPicker"
import type { StructuredPromptVariable } from "./PromptVariablesSidebar"

export type PromptMessageDraft = AgentWorkerPromptMessage & { id: string }

type Props = {
  messages: PromptMessageDraft[]
  onChange: (messages: PromptMessageDraft[]) => void
  variables: PromptVariable[]
  globalVariables?: GlobalContextVariable[]
  globalMenuHint?: string
  globalReferencePreviewSections?: ContextPickerPreviewSection[]
  structuredVariables?: StructuredPromptVariable[]
}

function createPromptMessage(
  role: AgentWorkerPromptMessage["role"] = "user",
): PromptMessageDraft {
  return {
    id: crypto.randomUUID(),
    role,
    content: "",
  }
}

export function promptMessagesFromWorker(
  messages: AgentWorkerPromptMessage[] | undefined,
): PromptMessageDraft[] {
  return (messages ?? []).map((message) => ({
    id: crypto.randomUUID(),
    role: message.role,
    content: message.content,
  }))
}

export function promptMessagesToPayload(
  messages: PromptMessageDraft[],
): AgentWorkerPromptMessage[] {
  return messages
    .map(({ role, content }) => ({ role, content: content.trim() }))
    .filter((message) => message.content.length > 0)
}

export default function PromptMessagesEditor({
  messages,
  onChange,
  variables,
  globalVariables,
  globalMenuHint,
  globalReferencePreviewSections,
  structuredVariables = [],
}: Props) {
  const roleLabel = useMemo(
    () =>
      ({
        system: "System",
        user: "User",
      }) satisfies Record<AgentWorkerPromptMessage["role"], string>,
    [],
  )

  const patch = (id: string, partial: Partial<PromptMessageDraft>) => {
    onChange(messages.map((message) => (message.id === id ? { ...message, ...partial } : message)))
  }

  const remove = (id: string) => {
    onChange(messages.filter((message) => message.id !== id))
  }

  const add = () => {
    onChange([...messages, createPromptMessage("user")])
  }

  return (
    <section className="messages">
      <div className="head">
        <h3 className="title">Messages</h3>
        <button type="button" className="add-btn" onClick={add}>
          <TbPlus size={13} aria-hidden />
          <span>Add message</span>
        </button>
      </div>

      {messages.length === 0 ? (
        <p className="empty">
          No extra messages — add tokens in Instructions or here when the model should see goal, run
          input, or shared context.
        </p>
      ) : (
        <ul className="list">
          {messages.map((message, index) => (
            <li className="card" key={message.id}>
              <div className="card-head">
                <span className="card-icon" aria-hidden>
                  <TbMessage size={14} />
                </span>
                <span className="card-index">Message {index + 1}</span>
                <select
                  className="role-select"
                  value={message.role}
                  onChange={(e) =>
                    patch(message.id, { role: e.target.value as AgentWorkerPromptMessage["role"] })
                  }
                  aria-label={`Role for message ${index + 1}`}
                >
                  <option value="system">{roleLabel.system}</option>
                  <option value="user">{roleLabel.user}</option>
                </select>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => remove(message.id)}
                  aria-label={`Remove message ${index + 1}`}
                >
                  <TbTrash size={13} />
                </button>
              </div>
              <InstructionsEditor
                hideLabel
                rows={4}
                mono
                label={`Message ${index + 1}`}
                value={message.content}
                onChange={(content) => patch(message.id, { content })}
                variables={variables}
                globalVariables={globalVariables}
                globalMenuHint={globalMenuHint}
                globalReferencePreviewSections={globalReferencePreviewSections}
                structuredVariables={structuredVariables}
                placeholder={
                  message.role === "user"
                    ? "{{runInput.message}}"
                    : "Additional system rules…"
                }
                menuHint="Insert a context token into this message."
              />
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .messages {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 0.25rem;
          border-top: 1px solid var(--app-border);
        }
        .head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .title {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--app-text);
        }
        .add-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          flex-shrink: 0;
          padding: 0.3rem 0.55rem;
          font-size: 0.6875rem;
          font-weight: 500;
          font-family: var(--app-font);
          color: var(--app-text);
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-pill);
          cursor: pointer;
        }
        .add-btn:hover {
          background: var(--app-surface-muted);
          border-color: var(--app-border-strong);
        }
        .empty {
          margin: 0;
          font-size: 0.6875rem;
          color: var(--app-text-faint);
        }
        .list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .card {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 0.5rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface-muted);
        }
        .card-head {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          align-items: center;
          gap: 0.4rem;
        }
        .card-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--app-accent);
        }
        .card-index {
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--app-text-muted);
        }
        .role-select {
          font-size: 0.6875rem;
          font-family: var(--app-font);
          padding: 0.25rem 0.4rem;
          border: 1px solid var(--app-border);
          border-radius: calc(var(--app-radius) - 2px);
          background: var(--app-bg);
          color: var(--app-text);
          cursor: pointer;
        }
        .role-select:focus {
          outline: none;
          border-color: var(--app-border-strong);
          box-shadow: var(--app-btn-focus-ring);
        }
        .remove-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.2rem;
          background: transparent;
          border: none;
          color: var(--app-text-faint);
          cursor: pointer;
          border-radius: var(--app-radius);
        }
        .remove-btn:hover {
          color: #b91c1c;
        }
      `}</style>
    </section>
  )
}
