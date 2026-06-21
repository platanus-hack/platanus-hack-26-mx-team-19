"use client"

import { usePathname, useRouter } from "next/navigation"
import { TbArrowLeft, TbLogout, TbTopologyStar3, TbUsers } from "react-icons/tb"
import AppLogo from "@/components/ui/AppLogo"
import { useServices } from "@/data/providers/ServicesProvider"
import { ADMIN_NAV_ITEMS, ADMIN_ROUTES, DASHBOARD_ROUTES, isAdminNavActive } from "@/lib/paths"

const NAV_ICONS = {
  users: TbUsers,
  swarms: TbTopologyStar3,
} as const

function userInitials(user: Record<string, unknown> | null): string {
  if (!user) return "?"
  const first = typeof user.firstName === "string" ? user.firstName.trim() : ""
  const last = typeof user.lastName === "string" ? user.lastName.trim() : ""
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase()
  if (first) return first.slice(0, 2).toUpperCase()
  const email = typeof user.email === "string" ? user.email : ""
  if (email) return email.slice(0, 2).toUpperCase()
  return "?"
}

function displayShortName(user: Record<string, unknown> | null): string {
  if (!user) return "User"
  const first = typeof user.firstName === "string" ? user.firstName : ""
  const last = typeof user.lastName === "string" ? user.lastName.charAt(0) : ""
  if (first && last) return `${first} ${last}.`
  if (first) return first
  const email = typeof user.email === "string" ? user.email : ""
  return email.split("@")[0] ?? "User"
}

function userEmail(user: Record<string, unknown> | null): string | null {
  const email = user?.email
  return typeof email === "string" && email.length > 0 ? email : null
}

function navClass(active: boolean): string {
  return active ? "item item--on" : "item"
}

export default function AdminSidebar() {
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const { user, services } = useServices()
  const onLogout = async () => {
    await services.logout()
    router.replace("/sign-in")
  }

  const email = userEmail(user)

  return (
    <aside className="sidebar">
      <div className="top">
        <AppLogo href={ADMIN_ROUTES.root} size="sm" showWordmark />
        <div className="badge-label">Admin</div>
      </div>

      <nav className="nav" aria-label="Admin">
        <div className="section">manage</div>
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.id]
          const active = isAdminNavActive(pathname, item.id)
          return (
            <button
              key={item.id}
              type="button"
              className={navClass(active)}
              onClick={() => router.push(item.href)}
            >
              <Icon size={15} aria-hidden />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="bottom">
        <button type="button" className="back" onClick={() => router.push(DASHBOARD_ROUTES.swarms)}>
          <TbArrowLeft size={15} aria-hidden />
          <span>Back to swarms</span>
        </button>
        <div className="user" aria-label="Signed in account">
          <span className="avatar">{userInitials(user)}</span>
          <span className="meta">
            <span className="name">{displayShortName(user)}</span>
            {email ? <span className="email">{email}</span> : null}
          </span>
        </div>
        <button type="button" className="sign-out" onClick={() => void onLogout()}>
          <TbLogout size={15} aria-hidden />
          <span>Sign out</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 11.75rem;
          flex-shrink: 0;
          border-right: 1px solid var(--app-border);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--app-surface);
        }
        .top {
          padding: 1.25rem 1rem 1rem;
          border-bottom: 1px solid var(--app-border);
        }
        .badge-label {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--app-text-faint);
          margin-top: 0.35rem;
        }
        .nav {
          padding: 0.75rem 0;
          flex: 1;
        }
        .section {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--app-text-faint);
          padding: 0.75rem 1rem 0.25rem;
        }
        .item {
          display: flex;
          align-items: center;
          gap: 0.5625rem;
          width: 100%;
          padding: 0.4375rem 1rem;
          font-size: 0.75rem;
          color: var(--app-text-muted);
          background: none;
          border: none;
          font-family: var(--app-font);
          text-align: left;
          cursor: pointer;
          position: relative;
        }
        .item:hover {
          color: var(--app-text);
        }
        .item--on {
          color: var(--app-text);
        }
        .item--on::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.25rem;
          bottom: 0.25rem;
          width: 2px;
          background: var(--app-text);
          border-radius: 0 2px 2px 0;
        }
        .bottom {
          padding: 0.75rem 1rem 1rem;
          border-top: 1px solid var(--app-border);
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .back {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--app-font);
        }
        .back:hover {
          color: var(--app-text);
        }
        .user {
          display: flex;
          align-items: center;
          gap: 0.5625rem;
          min-width: 0;
        }
        .avatar {
          width: 1.625rem;
          height: 1.625rem;
          border-radius: 50%;
          background: var(--app-surface-muted);
          border: 1px solid var(--app-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          font-weight: 500;
          color: var(--app-text-muted);
          flex-shrink: 0;
        }
        .meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .name {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--app-text);
          line-height: 1.25;
        }
        .email {
          font-size: 0.625rem;
          color: var(--app-text-faint);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sign-out {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--app-text-muted);
          background: var(--app-surface);
          border: 1px solid var(--app-border-strong);
          border-radius: var(--app-radius);
          cursor: pointer;
          font-family: var(--app-font);
        }
        .sign-out:hover {
          background: var(--app-surface-muted);
          border-color: var(--app-text);
          color: var(--app-text);
        }
      `}</style>
    </aside>
  )
}
