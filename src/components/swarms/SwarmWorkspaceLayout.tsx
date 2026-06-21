"use client"

import { usePathname, useRouter } from "next/navigation"
import { TbLogout, TbTopologyStar3 } from "react-icons/tb"
import AppLogo from "@/components/ui/AppLogo"
import { useServices } from "@/data/providers/ServicesProvider"
import { DASHBOARD_ROUTES, isDashboardSwarmEditorRoute } from "@/lib/paths"

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

export default function SwarmWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const { user, services } = useServices()
  const hideSidebar = isDashboardSwarmEditorRoute(pathname)
  const onSwarms = pathname.startsWith(DASHBOARD_ROUTES.swarms)

  const onLogout = async () => {
    await services.logout()
    router.replace("/sign-in")
  }

  return (
    <div className={`wrap${hideSidebar ? " wrap--editor" : ""}`}>
      {!hideSidebar ? (
        <aside className="sidebar">
          <div className="top">
            <AppLogo href={DASHBOARD_ROUTES.swarms} size="sm" showWordmark />
            <div className="badge-label">agentatlas</div>
          </div>
          <nav className="nav" aria-label="Workspace">
            <button
              type="button"
              className={onSwarms ? "item item--on" : "item"}
              onClick={() => router.push(DASHBOARD_ROUTES.swarms)}
            >
              <TbTopologyStar3 size={15} aria-hidden />
              <span>Swarms</span>
            </button>
          </nav>
          <div className="bottom">
            <div className="user" aria-label="Signed in account">
              <span className="avatar">{userInitials(user)}</span>
              <span className="name">{displayShortName(user)}</span>
            </div>
            <button type="button" className="sign-out" onClick={() => void onLogout()}>
              <TbLogout size={15} aria-hidden />
              <span>Sign out</span>
            </button>
          </div>
        </aside>
      ) : null}
      <div className="content">{children}</div>
      <style jsx>{`
        .wrap {
          display: flex;
          min-height: 100vh;
          font-family: var(--app-font);
          background: var(--app-bg);
        }
        .wrap--editor .content {
          width: 100%;
        }
        .content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
        }
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
        .name {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--app-text);
          line-height: 1.25;
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
    </div>
  )
}
