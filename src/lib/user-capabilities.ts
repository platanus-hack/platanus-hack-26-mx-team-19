/** Reads `canCreateSwarms` from normalized auth user payloads. */
export function readCanCreateSwarms(user: Record<string, unknown> | null | undefined): boolean {
  if (!user) return false
  const value = user.canCreateSwarms
  return value === true || value === "true"
}
