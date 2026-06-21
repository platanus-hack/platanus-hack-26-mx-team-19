export const USER_ROLE = "user" as const
export const ADMIN_ROLE = "admin" as const

export type AppUserRole = typeof USER_ROLE | typeof ADMIN_ROLE

export function isAdminRole(role: string | null | undefined): boolean {
  return role === ADMIN_ROLE
}
