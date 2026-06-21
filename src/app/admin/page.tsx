import { redirect } from "next/navigation"
import { ADMIN_ROUTES } from "@/lib/paths"

export default function AdminIndexPage() {
  redirect(ADMIN_ROUTES.users)
}
