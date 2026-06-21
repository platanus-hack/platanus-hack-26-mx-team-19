"use client"

import { usePathname } from "next/navigation"
import { isAdminSwarmEditorRoute } from "@/lib/paths"
import AdminSidebar from "./AdminSidebar"

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideSidebar = isAdminSwarmEditorRoute(pathname)

  return (
    <div className={`wrap${hideSidebar ? " wrap--editor" : ""}`}>
      {!hideSidebar ? <AdminSidebar /> : null}
      <div className="content">{children}</div>
      <style jsx>{`
        .wrap {
          display: flex;
          min-height: 100vh;
          font-family: var(--app-font);
          background: var(--app-bg);
        }
        .content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
