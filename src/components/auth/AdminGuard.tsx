"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Loader from "@/components/ui/Loader"
import { useServices } from "@/data/providers/ServicesProvider"
import { isAdminRole } from "@/lib/roles"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { role, stateService } = useServices()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!stateService) return

    if (!isAdminRole(role)) {
      router.replace("/dashboard")
      return
    }

    setChecking(false)
  }, [role, stateService, router])

  if (checking) return <Loader />
  return <>{children}</>
}
