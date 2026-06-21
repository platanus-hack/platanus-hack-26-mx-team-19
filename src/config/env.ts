const isProduction = process.env.NEXT_PUBLIC_ENV === "production"

export const NEXT_PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isProduction ? "https://[SETUP-REQUIRED]/api/v1" : "http://localhost:3001/api/v1")

/** `username:password` for unauthenticated requests when your API requires HTTP Basic. */
export const NEXT_PUBLIC_API_BASIC_AUTH =
  process.env.NEXT_PUBLIC_API_BASIC_AUTH?.trim() || undefined

export { isProduction }
