import { deleteCookie, getCookies } from "cookies-next/client"
import { jwtDecode, type JwtPayload } from "jwt-decode"

type ExpPayload = JwtPayload

const auth: {
  clearToken: () => void
  getToken: () => string | false
  getRefreshToken: () => string | false
  getRole: () => string | false
  logout: () => void
  getDecodeToken: (tokenParam?: string | null) => JwtPayload | null
  isLoggedIn: () => boolean
} = {
  clearToken() {
    deleteCookie("access_token")
    deleteCookie("role")
    deleteCookie("refresh_token")
  },

  getToken() {
    const allCookies = getCookies() ?? {}
    if (
      allCookies.access_token === undefined ||
      allCookies.access_token === "''"
    ) {
      return false
    }
    return allCookies.access_token
  },

  getRefreshToken() {
    const allCookies = getCookies() ?? {}
    if (
      allCookies.refresh_token === undefined ||
      allCookies.refresh_token === "''"
    ) {
      return false
    }
    return allCookies.refresh_token
  },

  getRole() {
    const allCookies = getCookies() ?? {}
    if (allCookies.role === undefined || allCookies.role === "''") {
      return false
    }
    return allCookies.role
  },

  logout() {
    auth.clearToken()
  },

  getDecodeToken(tokenParam) {
    const token = tokenParam == null ? auth.getToken() : tokenParam
    if (!token || typeof token !== "string") return null
    try {
      return jwtDecode<ExpPayload>(token)
    } catch {
      auth.clearToken()
      return null
    }
  },

  isLoggedIn() {
    const token = auth.getToken()
    if (token) {
      if (!isTokenExpired(token)) {
        return true
      }
      auth.clearToken()
      return false
    }
    return false
  },
}

function getTokenExpirationDate(encodedToken: string): Date | false | null {
  try {
    const token = jwtDecode<ExpPayload>(encodedToken)
    if (!token.exp) {
      return null
    }
    const date = new Date(0)
    date.setUTCSeconds(token.exp)
    return date
  } catch {
    auth.clearToken()
    return false
  }
}

function isTokenExpired(token: string): boolean {
  const tokenExpirationDate = getTokenExpirationDate(token)
  if (!(tokenExpirationDate instanceof Date) || tokenExpirationDate >= new Date()) {
    return false
  }

  const refreshToken = auth.getRefreshToken()
  if (!refreshToken || typeof refreshToken !== "string") {
    return true
  }

  const refreshTokenExpirationDate = getTokenExpirationDate(refreshToken)
  return refreshTokenExpirationDate instanceof Date && refreshTokenExpirationDate < new Date()
}

export default auth
