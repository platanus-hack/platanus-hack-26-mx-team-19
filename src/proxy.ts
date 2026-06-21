import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const PREFIX_LOCALES = /^\/(en|es)(\/.*)?$/i

/**
 * Legacy URLs like /en/sign-in → /sign-in. Locale stays in NEXT_LOCALE cookie for API headers.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const match = pathname.match(PREFIX_LOCALES)
  if (!match?.[1]) return NextResponse.next()

  const locale = match[1].toLowerCase()
  const rest = match[2] ?? ""
  const nextPath = rest && rest !== "/" ? rest : "/"
  const url = request.nextUrl.clone()
  url.pathname = nextPath
  const res = NextResponse.redirect(url)
  res.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "strict" })
  return res
}

export const config = {
  matcher: ["/en", "/en/:path*", "/es", "/es/:path*"],
}
