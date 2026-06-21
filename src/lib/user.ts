export function readUserId(user: Record<string, unknown> | null | undefined): string | null {
  if (!user) return null
  const id = user.id ?? user._id
  return typeof id === "string" ? id : null
}
