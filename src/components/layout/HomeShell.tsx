"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth/AuthGuard"
import Loader from "@/components/ui/Loader"
import { DASHBOARD_ROUTES } from "@/lib/paths"

export default function HomeShell() {
  const router = useRouter()

  useEffect(() => {
    router.replace(DASHBOARD_ROUTES.swarms)
  }, [router])

  return (
    <AuthGuard>
      <Loader />
    </AuthGuard>
  )
}
