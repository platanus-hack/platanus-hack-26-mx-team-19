"use client"

import { useEffect, useState } from "react"
import type {
  AdminAccountTier,
  AdminUpdateUserPayload,
  AdminUser,
  AdminUserRole,
} from "@/data/api/server"

type Props = {
  user: AdminUser | null
  currentUserId: string | null
  saving: boolean
  onClose: () => void
  onSave: (patch: AdminUpdateUserPayload) => Promise<void>
}

type FormState = {
  firstName: string
  lastName: string
  role: AdminUserRole
  accountTier: AdminAccountTier
  isActive: boolean
  isEmailVerified: boolean
  canCreateSwarms: boolean
}

function toFormState(user: AdminUser): FormState {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    accountTier: user.accountTier,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    canCreateSwarms: user.canCreateSwarms,
  }
}

function buildPatch(user: AdminUser, form: FormState): AdminUpdateUserPayload {
  const patch: AdminUpdateUserPayload = {}
  if (form.firstName.trim() !== user.firstName) patch.firstName = form.firstName.trim()
  if (form.lastName.trim() !== user.lastName) patch.lastName = form.lastName.trim()
  if (form.role !== user.role) patch.role = form.role
  if (form.accountTier !== user.accountTier) patch.accountTier = form.accountTier
  if (form.isActive !== user.isActive) patch.isActive = form.isActive
  if (form.isEmailVerified !== user.isEmailVerified) patch.isEmailVerified = form.isEmailVerified
  if (form.canCreateSwarms !== user.canCreateSwarms) patch.canCreateSwarms = form.canCreateSwarms
  return patch
}

export default function AdminUserEditDialog({
  user,
  currentUserId,
  saving,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<FormState | null>(null)

  useEffect(() => {
    if (!user) {
      setForm(null)
      return
    }
    setForm(toFormState(user))
  }, [user])

  useEffect(() => {
    if (!user) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, user])

  if (!user || !form) return null

  const isSelf = user.id === currentUserId
  const busy = saving

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) return
    const patch = buildPatch(user, form)
    if (Object.keys(patch).length === 0) {
      onClose()
      return
    }
    await onSave(patch)
  }

  return (
    <div className="backdrop" role="presentation" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-labelledby="edit-user-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="head">
          <div>
            <h2 id="edit-user-title" className="title">
              Edit user
            </h2>
            <p className="sub">{user.email}</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form className="form" onSubmit={(e) => void onSubmit(e)}>
          <div className="row">
            <label className="field">
              <span className="label">First name</span>
              <input
                className="input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
                autoComplete="off"
              />
            </label>
            <label className="field">
              <span className="label">Last name</span>
              <input
                className="input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
                autoComplete="off"
              />
            </label>
          </div>

          <div className="row">
            <label className="field">
              <span className="label">Role</span>
              <select
                className="input"
                value={form.role}
                disabled={isSelf}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as AdminUserRole })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {isSelf ? <span className="hint">You cannot change your own role.</span> : null}
            </label>
            <label className="field">
              <span className="label">Account tier</span>
              <select
                className="input"
                value={form.accountTier}
                onChange={(e) =>
                  setForm({ ...form, accountTier: e.target.value as AdminAccountTier })
                }
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </label>
          </div>

          <div className="checks">
            <label className="check">
              <input
                type="checkbox"
                checked={form.isActive}
                disabled={isSelf && user.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span>Active account</span>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.isEmailVerified}
                onChange={(e) => setForm({ ...form, isEmailVerified: e.target.checked })}
              />
              <span>Email verified</span>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.canCreateSwarms}
                onChange={(e) => setForm({ ...form, canCreateSwarms: e.target.checked })}
              />
              <span>Can create swarms</span>
            </label>
          </div>
          <p className="help">
            When enabled, the user sees Swarms in the dashboard and may create swarms via the API.
          </p>

          <div className="actions">
            <button type="button" className="btn btn--ghost" disabled={busy} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={busy}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(10, 10, 10, 0.35);
        }
        .dialog {
          width: min(100%, 28rem);
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-lg);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }
        .head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1rem 0.75rem;
          border-bottom: 1px solid var(--app-border);
        }
        .title {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--app-text);
        }
        .sub {
          margin: 0.125rem 0 0;
          font-size: 0.6875rem;
          color: var(--app-text-faint);
        }
        .close {
          width: 1.75rem;
          height: 1.75rem;
          border: none;
          background: none;
          font-size: 1.25rem;
          line-height: 1;
          color: var(--app-text-muted);
          cursor: pointer;
          border-radius: var(--app-radius);
        }
        .close:hover {
          background: var(--app-surface-muted);
          color: var(--app-text);
        }
        .form {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem;
        }
        @media (max-width: 480px) {
          .row {
            grid-template-columns: 1fr;
          }
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .label {
          font-size: 0.6875rem;
          color: var(--app-text-faint);
        }
        .input {
          width: 100%;
          padding: 0.4375rem 0.625rem;
          font-size: 0.8125rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          color: var(--app-text);
          font-family: var(--app-font);
        }
        .input:focus {
          outline: none;
          border-color: var(--app-border-strong);
          box-shadow: var(--app-btn-focus-ring);
        }
        .input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .hint {
          font-size: 0.625rem;
          color: var(--app-text-faint);
        }
        .checks {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .check {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--app-text);
          cursor: pointer;
        }
        .check input {
          accent-color: var(--app-text);
        }
        .help {
          margin: 0;
          font-size: 0.6875rem;
          color: var(--app-text-faint);
          line-height: 1.45;
        }
        .danger-zone {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface-muted);
        }
        .danger-title {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--app-text);
        }
        .btn--danger {
          align-self: flex-start;
          margin-top: 0.25rem;
          color: #991b1b;
          background: #fff5f5;
          border-color: #fecaca;
        }
        .btn--danger:hover:not(:disabled) {
          color: #7f1d1d;
          border-color: #fca5a5;
          background: #fee2e2;
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding-top: 0.25rem;
        }
        .btn {
          padding: 0.4375rem 0.875rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--app-bg);
          background: var(--app-text);
          border: 1px solid var(--app-text);
          border-radius: var(--app-radius);
          cursor: pointer;
          font-family: var(--app-font);
        }
        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .btn--ghost {
          color: var(--app-text-muted);
          background: var(--app-surface);
          border-color: var(--app-border);
        }
        .btn--ghost:hover:not(:disabled) {
          color: var(--app-text);
          border-color: var(--app-border-strong);
        }
      `}</style>
    </div>
  )
}
