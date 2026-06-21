/** Strips only real locale prefixes (/en, /es), so /sign-in is never mangled. */
export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(en|es)\/(.*)$/i)
  if (m) return `/${m[2]}`
  if (/^\/(en|es)$/i.test(pathname)) return "/"
  return pathname
}

export const DASHBOARD_ROUTES = {
  root: "/dashboard",
  swarms: "/dashboard/swarms",
  swarm: (id: string) => `/dashboard/swarms/${id}`,
} as const

export const ADMIN_ROUTES = {
  root: "/admin",
  users: "/admin/users",
  swarms: "/admin/swarms",
  swarm: (id: string) => `/admin/swarms/${id}`,
} as const

export type AdminNavId = "users" | "swarms"

export const ADMIN_NAV_ITEMS: { id: AdminNavId; href: string; label: string }[] = [
  { id: "users", href: ADMIN_ROUTES.users, label: "Users" },
  { id: "swarms", href: ADMIN_ROUTES.swarms, label: "Swarms" },
]

export function isAdminNavActive(pathname: string, id: AdminNavId): boolean {
  const clean = stripLocale(pathname)
  if (id === "users") {
    return clean === ADMIN_ROUTES.users || clean === ADMIN_ROUTES.root
  }
  if (id === "swarms") {
    return clean === ADMIN_ROUTES.swarms || clean.startsWith(`${ADMIN_ROUTES.swarms}/`)
  }
  return false
}

/** True on `/admin/swarms/:id` workspace (editor), not the list. */
export function isAdminSwarmEditorRoute(pathname: string): boolean {
  const clean = stripLocale(pathname)
  return clean.startsWith(`${ADMIN_ROUTES.swarms}/`) && clean.length > ADMIN_ROUTES.swarms.length + 1
}

/** True on `/dashboard/swarms/:id` workspace (editor), not the list. */
export function isDashboardSwarmEditorRoute(pathname: string): boolean {
  const clean = stripLocale(pathname)
  return (
    clean.startsWith(`${DASHBOARD_ROUTES.swarms}/`) &&
    clean.length > DASHBOARD_ROUTES.swarms.length + 1
  )
}

export function swarmListRoute(apiMode: "admin" | "user"): string {
  return apiMode === "admin" ? ADMIN_ROUTES.swarms : DASHBOARD_ROUTES.swarms
}

export function swarmEditorRoute(apiMode: "admin" | "user", swarmId: string): string {
  return apiMode === "admin" ? ADMIN_ROUTES.swarm(swarmId) : DASHBOARD_ROUTES.swarm(swarmId)
}
