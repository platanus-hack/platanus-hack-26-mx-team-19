"use client"

import { Suspense } from "react"
import AuthGuard from "@/components/auth/AuthGuard"
import SignInForm from "@/components/auth/SignInForm"
import pageStyles from "@/components/auth/auth-page.module.css"
import Loader from "@/components/ui/Loader"

export default function SignInPage() {
  return (
    <AuthGuard>
      <div className={pageStyles.page}>
        <div className={pageStyles.card}>
          <Suspense fallback={<Loader compact />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  )
}
