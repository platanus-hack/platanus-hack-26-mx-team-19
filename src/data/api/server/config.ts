import axios, { type AxiosError } from "axios"
import { toast } from "@/lib/toast"
import auth from "@/data/api/server/auth"
import { NEXT_PUBLIC_API_BASIC_AUTH, NEXT_PUBLIC_API_URL } from "@/config/env"

function basicAuthHeader(credentials: string): string {
  return `Basic ${btoa(credentials)}`
}

const ApiServices = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
})

function getLocaleFromCookie(): string {
  if (typeof document === "undefined") return "en"
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/)
  const raw = match?.[1]?.trim()
  const value = raw && raw.length > 0 ? raw : null
  return value === "es" || value === "en" ? value : "en"
}

const REQUEST_ID_HEADER = "x-request-id"

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

function setupCookie(name: string, value: string, days?: number): void {
  const expires = days
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
    : ""
  if (typeof document === "undefined") return
  const secure =
    typeof window !== "undefined" && window.location?.protocol === "https:"
      ? "; Secure"
      : ""
  document.cookie = `${name}=${value}${expires ? `; expires=${expires}` : ""}; path=/; SameSite=Strict${secure}`
}

ApiServices.interceptors.request.use(
  async (config) => {
    try {
      const token = auth.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else if (NEXT_PUBLIC_API_BASIC_AUTH) {
        config.headers.Authorization = basicAuthHeader(NEXT_PUBLIC_API_BASIC_AUTH)
      }
    } catch {
      console.info("token not available")
    }

    config.headers[REQUEST_ID_HEADER] = generateRequestId()
    const locale = getLocaleFromCookie()
    config.headers["Accept-Language"] = locale
    config.headers["X-Locale"] = locale
    return config
  },
  (error) => Promise.reject(error),
)

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = auth.getRefreshToken()
  if (!refreshToken) {
    auth.logout()
    throw new Error("No refresh token")
  }
  const response = await axios.post(`${NEXT_PUBLIC_API_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  })
  const { access_token, refresh_token, user } = response.data as {
    access_token: string
    refresh_token: string
    user: { role?: string }
  }
  setupCookie("access_token", access_token)
  setupCookie("refresh_token", refresh_token)
  if (user?.role) setupCookie("role", String(user.role))
  return access_token
}

ApiServices.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true
      try {
        const newToken = await refreshAccessToken()
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return ApiServices(originalRequest)
        }
        auth.logout()
        return Promise.reject(error)
      } catch {
        auth.logout()
        return Promise.reject(error)
      }
    }
    if (error.response?.status === 403) {
      toast.error("You are not authorized to access this resource.")
    }
    return Promise.reject(error)
  },
)

export { ApiServices }
