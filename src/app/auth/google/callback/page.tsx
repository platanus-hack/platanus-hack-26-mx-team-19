"use client"

import { Suspense, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/lib/toast"
import AuthGuard from "@/components/auth/AuthGuard"
import Loader from "@/components/ui/Loader"
import { useServices } from "@/data/providers/ServicesProvider"
import styles from "./page.module.css"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    services: { loginGoogle },
  } = useServices()
  const processedRef = useRef(false)

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (processedRef.current) return
      processedRef.current = true

      const token = searchParams.get("token")
      const refresh = searchParams.get("refresh")
      const role = searchParams.get("role")
      if (!token || !refresh) {
        toast.error("No tokens received from Google login")
        router.push("/sign-in")
        return
      }

      await loginGoogle({
        access_token: token,
        refresh_token: refresh,
        role,
      })

      const redirect = searchParams.get("redirect")
      const stateParam = searchParams.get("state")
      let finalRedirect = "/dashboard"

      if (stateParam) {
        try {
          const decodedState = JSON.parse(atob(stateParam)) as {
            redirect?: string
          }
          if (decodedState.redirect) finalRedirect = decodedState.redirect
        } catch {
          // Keep default redirect when state cannot be parsed.
        }
      } else if (redirect) {
        finalRedirect = redirect
      }

      router.push(finalRedirect)
    }

    void handleGoogleCallback()
  }, [searchParams, router, loginGoogle])

  return <p className={styles.status}>Signing you in…</p>
}

export default function GoogleCallbackPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<Loader />}>
        <GoogleCallbackContent />
      </Suspense>
    </AuthGuard>
  )
}
