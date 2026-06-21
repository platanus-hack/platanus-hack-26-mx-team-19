"use client"

import { useEffect, useState } from "react"
import Loader from "@/components/ui/Loader"
import { useServices } from "@/data/providers/ServicesProvider"
import { readCanCreateSwarms } from "@/lib/user-capabilities"

export default function CanCreateSwarmsGuard({ children }: { children: React.ReactNode }) {
  const { user, stateService } = useServices()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!stateService) return
    setChecking(false)
  }, [stateService, user])

  if (checking) return <Loader />
  if (!readCanCreateSwarms(user)) {
    return (
      <div className="denied">
        <p>Your account does not have permission to create swarms yet.</p>
        <style jsx>{`
          .denied {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            font-family: var(--app-font);
            color: var(--app-text-muted);
            text-align: center;
          }
        `}</style>
      </div>
    )
  }
  return <>{children}</>
}
