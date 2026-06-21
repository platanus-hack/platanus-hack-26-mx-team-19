"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { toast } from "@/lib/toast"
import createServices, {
  normalizeAuthMeUser,
  type AuthSessionPayload,
  type UsernameAvailabilityResponse,
} from "@/data/api/server"
import { ApiServices } from "@/data/api/server/config"
import auth from "@/data/api/server/auth"

type UserProfile = Record<string, unknown> | null

type ServicesContextValue = {
  stateService: boolean
  isLoggedIn: boolean
  role: string | null
  user: UserProfile
  services: {
    signUp: (payload: {
      username: string
      firstName: string
      lastName: string
      email: string
      password: string
    }) => Promise<AuthSessionPayload | false>
    checkUsernameAvailability: (
      username: string,
    ) => Promise<UsernameAvailabilityResponse>
    login: (payload: { email: string; password: string }) => Promise<AuthSessionPayload | false>
    loginGoogle: (payload: {
      access_token: string
      refresh_token: string
      role?: string | null
    }) => Promise<void>
    logout: () => Promise<void>
    getUser: () => Promise<Record<string, unknown> | false | null>
    refreshUser: () => Promise<Record<string, unknown> | false | null>
  }
}

const ServicesContext = createContext<ServicesContextValue | undefined>(undefined)

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [stateService, setStateService] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile>(null)
  const Services = useMemo(() => createServices(ApiServices), [])

  const setupCookie = useCallback((name: string, value: string, days?: number) => {
    const expires = days
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
      : ""
    if (typeof document === "undefined") return
    const secure =
      typeof window !== "undefined" && window.location?.protocol === "https:"
        ? "; Secure"
        : ""
    document.cookie = `${name}=${value}${expires ? `; expires=${expires}` : ""}; path=/; SameSite=Strict${secure}`
  }, [])

  const getUser = useCallback(async () => {
    try {
      return await Services.getUser()
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String((err.response.data as { message?: string }).message)
          : "An error occurred while getting user"
      toast.error(message)
      return false
    }
  }, [Services])

  const applyUserRecord = useCallback((userData: Record<string, unknown>) => {
    setUser(userData)
    setRole(userData.role != null ? String(userData.role) : null)
  }, [])

  const refreshUser = useCallback(async () => {
    const userData = await getUser()
    if (userData && typeof userData === "object") {
      applyUserRecord(userData)
    }
    return userData
  }, [applyUserRecord, getUser])

  const checkUsernameAvailability = useCallback(
    async (username: string) => Services.checkUsernameAvailability(username),
    [Services],
  )

  const signUp = useCallback(
    async (payload: {
      username: string
      firstName: string
      lastName: string
      email: string
      password: string
    }) => {
      try {
        const data = await Services.signUp(payload)
        setupCookie("access_token", data.access_token)
        setupCookie("refresh_token", data.refresh_token)
        setupCookie("role", String(data.user.role ?? ""))
        setIsLoggedIn(true)
        setRole(data.user.role != null ? String(data.user.role) : null)
        const normalized = normalizeAuthMeUser(data.user)
        setUser(
          normalized != null && typeof normalized === "object" && !Array.isArray(normalized)
            ? (normalized as Record<string, unknown>)
            : null,
        )
        return data
      } catch {
        toast.error("Sign up failed")
        return false
      }
    },
    [Services, setupCookie],
  )

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      try {
        const data = await Services.login(payload)
        setupCookie("access_token", data.access_token)
        setupCookie("refresh_token", data.refresh_token)
        setupCookie("role", String(data.user.role ?? ""))
        setIsLoggedIn(true)
        setRole(data.user.role != null ? String(data.user.role) : null)
        const normalized = normalizeAuthMeUser(data.user)
        setUser(
          normalized != null && typeof normalized === "object" && !Array.isArray(normalized)
            ? (normalized as Record<string, unknown>)
            : null,
        )
        return data
      } catch {
        toast.error("Invalid email or password")
        return false
      }
    },
    [Services, setupCookie],
  )

  const loginGoogle = useCallback(
    async (payload: {
      access_token: string
      refresh_token: string
      role?: string | null
    }) => {
      setupCookie("access_token", payload.access_token)
      setupCookie("refresh_token", payload.refresh_token)
      setupCookie("role", payload.role != null ? String(payload.role) : "")
      setIsLoggedIn(true)
      void getUser().then((userData) => {
        if (userData && typeof userData === "object") {
          setUser(userData)
          setRole(userData.role != null ? String(userData.role) : null)
        }
      })
    },
    [getUser, setupCookie],
  )

  const logout = useCallback(async () => {
    try {
      await Services.logout()
    } catch {
      // ignore (e.g. already invalid token)
    }
    auth.logout()
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear()
    }
    setIsLoggedIn(false)
    setRole(null)
    setUser(null)
  }, [Services])

  const refreshData = useCallback(async () => {
    const isLogged = auth.isLoggedIn()
    if (isLogged) {
      setIsLoggedIn(true)
      const userData = await getUser()
      if (userData && typeof userData === "object") {
        setUser(userData)
        setRole(userData.role != null ? String(userData.role) : null)
      }
    } else {
      setUser(null)
      setRole(null)
      setIsLoggedIn(false)
    }
    setStateService(true)
  }, [getUser])

  useEffect(() => {
    void refreshData()
  }, [refreshData])

  const value = useMemo<ServicesContextValue>(
    () => ({
      stateService,
      isLoggedIn,
      role,
      user,
      services: {
        signUp,
        checkUsernameAvailability,
        login,
        loginGoogle,
        logout,
        getUser,
        refreshUser,
      },
    }),
    [
      stateService,
      isLoggedIn,
      role,
      user,
      signUp,
      checkUsernameAvailability,
      login,
      loginGoogle,
      logout,
      getUser,
      refreshUser,
    ],
  )

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>
}

export function useServices(): ServicesContextValue {
  const ctx = useContext(ServicesContext)
  if (ctx === undefined) {
    throw new Error("useServices must be used within ServicesProvider")
  }
  return ctx
}
