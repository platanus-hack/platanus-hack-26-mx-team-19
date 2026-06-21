"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Loader from "@/components/ui/Loader"
import { useServices } from "@/data/providers/ServicesProvider"
import { stripLocale } from "@/lib/paths"

const publicRoutes = new Set([
  "/",
  "/sign-up",
  "/sign-in",
  "/auth/google/callback",
])

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, stateService } = useServices()
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  const [checking, setChecking] = useState(true)
  const cleanPathname = useMemo(() => stripLocale(pathname), [pathname])

  useEffect(() => {
    if (!stateService) return
    const isPublicRoute = publicRoutes.has(cleanPathname)

    if (!isLoggedIn) {
      if (isPublicRoute) {
        setChecking(false)
      } else {
        router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`)
      }
      return
    }

    if (isPublicRoute && cleanPathname !== "/auth/google/callback") {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get("redirect")

      if (redirect) {
        router.replace(redirect)
      } else {
        router.replace("/dashboard")
      }
      return
    }

    setChecking(false)
  }, [isLoggedIn, stateService, pathname, cleanPathname, router])

  if (checking) return <Loader />
  return <>{children}</>
}
