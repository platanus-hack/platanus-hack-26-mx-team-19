const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "mail.com",
  "me.com",
  "msn.com",
])

/** Strip protocol, path, and leading www. */
export function normalizeDomainInput(raw: string): string {
  let value = raw.trim().toLowerCase()
  value = value.replace(/^https?:\/\//, "")
  value = value.split("/")[0] ?? value
  value = value.split("?")[0] ?? value
  value = value.replace(/^www\./, "")
  return value
}

export function isDomainFormatValid(domain: string): boolean {
  if (domain.length < 3 || domain.length > 253) return false
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)
}

export function domainFromEmail(email: string): string | null {
  const at = email.lastIndexOf("@")
  if (at < 0) return null
  const host = email.slice(at + 1).trim().toLowerCase()
  return host.length > 0 ? host : null
}

export function isWorkEmailDomain(domain: string): boolean {
  return !FREE_EMAIL_DOMAINS.has(domain.toLowerCase())
}

export function companyNameFromDomain(domain: string): string {
  const normalized = normalizeDomainInput(domain)
  const base = normalized.split(".")[0] ?? normalized
  if (!base) return normalized
  return base.charAt(0).toUpperCase() + base.slice(1)
}
