"use client"

import { useMemo } from "react"

/** agentatlas has no hired-agent marketplace — catalog is empty in the editor. */
export function useSwarmEditorHiredAgents() {
  return useMemo(
    () => ({
      companyId: null as string | null,
      hiredAgents: [] as never[],
      loading: false,
    }),
    [],
  )
}
