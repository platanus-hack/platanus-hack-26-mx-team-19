"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5"
import Button from "@/components/ui/Button"
import GoogleAuthButton from "@/components/auth/GoogleAuthButton"
import { useServices } from "@/data/providers/ServicesProvider"
import { useMessages } from "@/i18n/client"
import { NEXT_PUBLIC_API_URL } from "@/config/env"
import {
  buildAuthQuery,
  buildGoogleOAuthState,
  resolvePostAuthPath,
} from "@/lib/team-invite"
import styles from "./auth.module.css"

type FormValues = {
  email: string
  password: string
}

export default function SignInForm() {
  const t = useMessages().auth.signIn
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect")
  const {
    services: { login },
  } = useServices()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const response = await login(data)
      if (!response) {
        setError("root", { type: "manual", message: t.invalidCredentials })
        return
      }

      router.push(resolvePostAuthPath(redirectPath))
    } catch {
      setError("root", { type: "manual", message: t.genericError })
    } finally {
      setIsLoading(false)
    }
  }

  const signUpPath = `/sign-up${buildAuthQuery({ redirect: redirectPath })}`

  const onGoogleLogin = () => {
    const state = buildGoogleOAuthState(redirectPath)
    window.location.assign(
      `${NEXT_PUBLIC_API_URL}/auth/google?state=${encodeURIComponent(state)}`,
    )
  }

  return (
    <div className={styles.form}>
      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.lede}>{t.lede}</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.fields}>
          <div>
            <input
              {...register("email", {
                required: t.emailRequired,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t.emailInvalid,
                },
              })}
              className={styles.input}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
            />
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
          </div>
          <div>
            <div className={styles.passwordWrap}>
              <input
                {...register("password", {
                  required: t.passwordRequired,
                  minLength: { value: 6, message: t.passwordMinLength },
                })}
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
              </button>
            </div>
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          </div>
          {errors.root && <div className={styles.rootError}>{errors.root.message}</div>}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {t.submit}
          </Button>
        </div>
      </form>
      <div className={styles.divider} role="separator">
        <span>{t.divider}</span>
      </div>
      <GoogleAuthButton text={t.google} onClick={onGoogleLogin} />
      <button type="button" className={styles.footerLink} onClick={() => router.push(signUpPath)}>
        {t.createAccount}
      </button>
    </div>
  )
}
