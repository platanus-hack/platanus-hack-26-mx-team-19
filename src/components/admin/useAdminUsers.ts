"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "@/lib/toast"
import createServices, {
  type AdminUpdateUserPayload,
  type AdminUser,
} from "@/data/api/server"
import { ApiServices } from "@/data/api/server/config"

const PAGE_SIZE = 20

export function useAdminUsers(enabled: boolean) {
  const services = useMemo(() => createServices(ApiServices), [])
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const result = await services.adminListUsers({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      })
      setItems(result.items)
      setTotal(result.total)
    } catch {
      toast.error("Could not load users")
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, enabled, page, services])

  useEffect(() => {
    void load()
  }, [load])

  const updateUser = useCallback(
    async (id: string, patch: AdminUpdateUserPayload) => {
      setUpdatingId(id)
      try {
        const updated = await services.adminUpdateUser(id, patch)
        setItems((prev) => prev.map((u) => (u.id === id ? updated : u)))
        toast.success("User updated")
        return updated
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
            : "Could not update user"
        toast.error(message)
        return null
      } finally {
        setUpdatingId(null)
      }
    },
    [services],
  )

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return {
    loading,
    items,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    updatingId,
    updateUser,
    refresh: load,
  }
}
