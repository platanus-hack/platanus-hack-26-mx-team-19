"use client"

import { Suspense } from "react"
import AuthGuard from "@/components/auth/AuthGuard"
import CanCreateSwarmsGuard from "@/components/auth/CanCreateSwarmsGuard"
import SwarmWorkspaceLayout from "@/components/swarms/SwarmWorkspaceLayout"
import Loader from "@/components/ui/Loader"

function AgentsLayoutFallback() {
  return (
    <div className="loader-wrap">
      <Loader compact />
      <style jsx>{`
        .loader-wrap {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--app-bg);
        }
      `}</style>
    </div>
  )
}

export default function DashboardSwarmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CanCreateSwarmsGuard>
        <Suspense fallback={<AgentsLayoutFallback />}>
          <SwarmWorkspaceLayout>{children}</SwarmWorkspaceLayout>
        </Suspense>
      </CanCreateSwarmsGuard>
    </AuthGuard>
  )
}
