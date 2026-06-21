"use client"

import { useMemo } from "react"

/** agentatlas has no company context — departments are unavailable in the editor. */
export function useSwarmEditorDepartments() {
  return useMemo(
    () => ({
      companyId: null as string | null,
      departments: [] as never[],
      loading: false,
    }),
    [],
  )
}
