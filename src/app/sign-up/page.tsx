"use client"

import { Suspense } from "react"
import AuthGuard from "@/components/auth/AuthGuard"
import SignUpForm from "@/components/auth/SignUpForm"
import pageStyles from "@/components/auth/auth-page.module.css"
import Loader from "@/components/ui/Loader"

export default function SignUpPage() {
  return (
    <AuthGuard>
      <div className={pageStyles.page}>
        <div className={pageStyles.card}>
          <Suspense fallback={<Loader compact />}>
            <SignUpForm />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  )
}
