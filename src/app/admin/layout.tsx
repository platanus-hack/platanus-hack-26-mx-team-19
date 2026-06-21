"use client"

import AdminGuard from "@/components/auth/AdminGuard"
import AuthGuard from "@/components/auth/AuthGuard"
import AdminShell from "@/components/admin/AdminShell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </AuthGuard>
  )
}
