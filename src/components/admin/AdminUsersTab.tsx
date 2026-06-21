"use client"

import { useState } from "react"
import type { AdminUser } from "@/data/api/server"
import { formatRelativeTime } from "@/lib/formatRelativeTime"
import AdminUserEditDialog from "./AdminUserEditDialog"
import type { useAdminUsers } from "./useAdminUsers"

type AdminUsersState = ReturnType<typeof useAdminUsers>

type Props = {
  state: AdminUsersState
  currentUserId: string | null
}

function displayName(user: AdminUser): string {
  const name = `${user.firstName} ${user.lastName}`.trim()
  return name || user.email
}

function roleLabel(role: AdminUser["role"]): string {
  return role === "admin" ? "Admin" : "User"
}

export default function AdminUsersTab({ state, currentUserId }: Props) {
  const {
    loading,
    items,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    updatingId,
    updateUser,
  } = state

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const onSaveEdit = async (patch: Parameters<typeof updateUser>[1]) => {
    if (!editingUser) return
    const updated = await updateUser(editingUser.id, patch)
    if (updated) setEditingUser(null)
  }

  return (
    <div className="panel">
      <div className="toolbar">
        <label className="search-wrap">
          <span className="sr-only">Search users</span>
          <input
            type="search"
            className="search"
            placeholder="Search by email, username, or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </label>
        <span className="count">
          {total} user{total === 1 ? "" : "s"}
        </span>
      </div>

      {loading && items.length === 0 ? (
        <div className="empty">
          <p>Loading users…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <p>{search.trim() ? "No users match your search." : "No users found."}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Tier</th>
                <th>Swarms</th>
                <th>Joined</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((user) => {
                const busy = updatingId === user.id
                return (
                  <tr key={user.id} className={busy ? "row--busy" : undefined}>
                    <td>
                      <span className="name">{displayName(user)}</span>
                      <span className="email">{user.email}</span>
                    </td>
                    <td className="mono muted">{user.username || "—"}</td>
                    <td>
                      <span className={`pill pill--${user.role}`}>{roleLabel(user.role)}</span>
                    </td>
                    <td>
                      <span className={user.isActive ? "status status--on" : "status"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="mono muted">{user.accountTier}</td>
                    <td>
                      <span
                        className={
                          user.canCreateSwarms ? "flag flag--on" : "flag"
                        }
                      >
                        {user.canCreateSwarms ? "Enabled" : "Off"}
                      </span>
                    </td>
                    <td className="mono muted">
                      {user.createdAt ? formatRelativeTime(user.createdAt) : "—"}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="action action--primary"
                          disabled={busy}
                          onClick={() => setEditingUser(user)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="pager">
          <button
            type="button"
            className="pager-btn"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="pager-meta">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="pager-btn"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      ) : null}

      <AdminUserEditDialog
        user={editingUser}
        currentUserId={currentUserId}
        saving={Boolean(editingUser && updatingId === editingUser.id)}
        onClose={() => setEditingUser(null)}
        onSave={onSaveEdit}
      />

      <style jsx>{`
        .panel {
          margin-top: 1.25rem;
        }
        .toolbar {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .search-wrap {
          flex: 1;
          min-width: 12rem;
        }
        .search {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          background: var(--app-surface);
          color: var(--app-text);
          font-family: var(--app-font);
        }
        .search:focus {
          outline: none;
          border-color: var(--app-border-strong);
          box-shadow: var(--app-btn-focus-ring);
        }
        .count {
          font-size: 0.75rem;
          color: var(--app-text-faint);
          white-space: nowrap;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
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
        .table-wrap {
          margin-top: 1rem;
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-lg);
          overflow-x: auto;
          background: var(--app-surface);
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
        }
        th {
          text-align: left;
          padding: 0.625rem 0.75rem;
          font-weight: 500;
          color: var(--app-text-faint);
          border-bottom: 1px solid var(--app-border);
          white-space: nowrap;
        }
        td {
          padding: 0.625rem 0.75rem;
          border-bottom: 1px solid var(--app-border);
          vertical-align: middle;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        .row--busy {
          opacity: 0.6;
        }
        .name {
          display: block;
          font-weight: 500;
          color: var(--app-text);
        }
        .email {
          display: block;
          font-size: 0.6875rem;
          color: var(--app-text-faint);
          margin-top: 0.125rem;
        }
        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .muted {
          color: var(--app-text-muted);
        }
        .pill {
          display: inline-block;
          padding: 0.125rem 0.4375rem;
          border-radius: 999px;
          font-size: 0.625rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          background: var(--app-surface-muted);
          color: var(--app-text-muted);
        }
        .pill--admin {
          background: var(--app-text);
          color: var(--app-bg);
        }
        .status {
          font-size: 0.6875rem;
          color: var(--app-text-faint);
        }
        .status--on {
          color: var(--app-text-muted);
        }
        .flag {
          display: inline-block;
          font-size: 0.6875rem;
          color: var(--app-text-faint);
        }
        .flag--on {
          color: var(--app-text);
          font-weight: 500;
        }
        .actions {
          display: flex;
          gap: 0.375rem;
          justify-content: flex-end;
          white-space: nowrap;
        }
        .action {
          padding: 0.25rem 0.5rem;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          cursor: pointer;
          font-family: var(--app-font);
        }
        .action--primary {
          color: var(--app-text);
          border-color: var(--app-border-strong);
        }
        .action:hover:not(:disabled) {
          color: var(--app-text);
          border-color: var(--app-border-strong);
        }
        .action:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .pager {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }
        .pager-meta {
          font-size: 0.75rem;
          color: var(--app-text-faint);
        }
        .pager-btn {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          color: var(--app-text-muted);
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius);
          cursor: pointer;
          font-family: var(--app-font);
        }
        .pager-btn:hover:not(:disabled) {
          color: var(--app-text);
          border-color: var(--app-border-strong);
        }
        .pager-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
