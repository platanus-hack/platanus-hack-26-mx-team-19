/**
 * Normalizes user profile payloads (GET /users/me, /auth/me, etc.): nested
 * `user`/`profile`, optional `data` envelope, snake_case → camelCase for UI.
 * Same contract shape as the reference app; settings only maps generic keys.
 */
export function normalizeAuthMeUser(raw: unknown): unknown {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return raw
  }

  let d = raw as Record<string, unknown>
  if (
    d.data != null &&
    typeof d.data === "object" &&
    !Array.isArray(d.data) &&
    d.email == null &&
    d.user == null
  ) {
    d = d.data as Record<string, unknown>
  }

  const nested = (d.user ?? d.profile ?? d.account ?? d.member) as Record<string, unknown> | undefined
  let flat: Record<string, unknown>
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const rest = { ...d }
    delete rest.user
    delete rest.profile
    delete rest.account
    delete rest.member
    flat = { ...rest, ...nested }
  } else {
    flat = { ...d }
  }

  const snakeToCamel: [string, string][] = [
    ["first_name", "firstName"],
    ["last_name", "lastName"],
    ["auth_provider", "authProvider"],
    ["is_email_verified", "isEmailVerified"],
    ["is_active", "isActive"],
    ["wallet_address", "walletAddress"],
    ["google_id", "googleId"],
    ["last_login", "lastLogin"],
    ["created_at", "createdAt"],
    ["updated_at", "updatedAt"],
    ["deleted_at", "deletedAt"],
    ["can_create_swarms", "canCreateSwarms"],
  ]
  for (const [snake, camel] of snakeToCamel) {
    if (flat[snake] !== undefined && flat[camel] === undefined) {
      flat[camel] = flat[snake]
    }
  }

  if (flat.settings != null && typeof flat.settings === "object" && !Array.isArray(flat.settings)) {
    const s = { ...(flat.settings as Record<string, unknown>) }
    if (
      s.notifications_enabled !== undefined &&
      s.notificationsEnabled === undefined
    ) {
      s.notificationsEnabled = s.notifications_enabled
    }
    flat.settings = s
  }

  return flat
}
