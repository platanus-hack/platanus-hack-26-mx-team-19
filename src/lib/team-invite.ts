export function buildAuthQuery(params: { redirect?: string | null }): string {
  const q = new URLSearchParams()
  if (params.redirect) q.set("redirect", params.redirect)
  const s = q.toString()
  return s ? `?${s}` : ""
}

export function resolvePostAuthPath(redirectPath: string | null): string {
  return redirectPath || "/dashboard"
}

export function buildGoogleOAuthState(redirectPath: string | null): string {
  return btoa(
    JSON.stringify({
      redirect: resolvePostAuthPath(redirectPath),
    }),
  )
}
