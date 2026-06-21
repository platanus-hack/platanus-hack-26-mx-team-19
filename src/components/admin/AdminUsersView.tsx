"use client"

import { useServices } from "@/data/providers/ServicesProvider"
import { readUserId } from "@/lib/user"
import AdminUsersTab from "./AdminUsersTab"
import { useAdminUsers } from "./useAdminUsers"

export default function AdminUsersView() {
  const { user } = useServices()
  const usersState = useAdminUsers(true)

  return (
    <div className="main">
      <header className="top">
        <div>
          <h1 className="title">Users</h1>
          <p className="sub">Manage platform accounts, roles, and access.</p>
        </div>
      </header>

      <AdminUsersTab state={usersState} currentUserId={readUserId(user)} />

      <style jsx>{`
        .main {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 1.75rem;
          background: var(--app-bg);
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
      `}</style>
    </div>
  )
}
