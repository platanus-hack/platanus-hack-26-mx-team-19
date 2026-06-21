"use client"

import { useEffect, useMemo, useState } from "react"
import createServices, { type PlatformToolDescriptor } from "@/data/api/server"
import { ApiServices } from "@/data/api/server/config"
import { useServices } from "@/data/providers/ServicesProvider"

/** Loads platform tool catalog for swarm authoring (Global context picker preview). */
export function useSwarmEditorTools() {
  const { isLoggedIn } = useServices()
  const services = useMemo(() => createServices(ApiServices), [])
  const [toolsAvailable, setToolsAvailable] = useState<PlatformToolDescriptor[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      setToolsAvailable([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    services
      .listToolsCatalog()
      .then((catalog) => {
        if (!cancelled) setToolsAvailable(catalog.toolsAvailable)
      })
      .catch(() => {
        if (!cancelled) setToolsAvailable([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isLoggedIn, services])

  return useMemo(
    () => ({
      companyId: null as string | null,
      toolsAvailable,
      loading,
    }),
    [toolsAvailable, loading],
  )
}
