/** Mirrors backend: RegisterDto + UsernameService format (lowercase a-z, 0-9, _). */

export const USERNAME_MIN = 3
export const USERNAME_MAX = 30

/** Full validation on normalized value. */
export const USERNAME_VALID = new RegExp(
  `^[a-z0-9_]{${USERNAME_MIN},${USERNAME_MAX}}$`,
)

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isUsernameFormatValid(normalized: string): boolean {
  return USERNAME_VALID.test(normalized)
}
