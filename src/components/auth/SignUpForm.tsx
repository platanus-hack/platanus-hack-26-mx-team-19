"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5"
import { toast } from "@/lib/toast"
import Button from "@/components/ui/Button"
import GoogleAuthButton from "@/components/auth/GoogleAuthButton"
import { useServices } from "@/data/providers/ServicesProvider"
import { NEXT_PUBLIC_API_URL } from "@/config/env"
import {
  buildAuthQuery,
  buildGoogleOAuthState,
  resolvePostAuthPath,
} from "@/lib/team-invite"
import {
  isUsernameFormatValid,
  normalizeUsername,
  USERNAME_MAX,
  USERNAME_MIN,
} from "@/lib/username"
import type { UsernameAvailabilityResponse } from "@/data/api/server"
import { useMessages } from "@/i18n/client"
import styles from "./auth.module.css"

type FormValues = {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export default function SignUpForm() {
  const signUpCopy = useMessages().auth.signUp
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect")
  const {
    services: { signUp, checkUsernameAvailability },
  } = useServices()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<FormValues>({ defaultValues: { username: "" } })

  const password = watch("password")
  const usernameRaw = watch("username") ?? ""
  const usernameNorm = normalizeUsername(usernameRaw)

  const [availability, setAvailability] = useState<UsernameAvailabilityResponse | null>(null)
  const [availabilityChecking, setAvailabilityChecking] = useState(false)

  useEffect(() => {
    if (usernameNorm.length < USERNAME_MIN || !isUsernameFormatValid(usernameNorm)) {
      setAvailability(null)
      setAvailabilityChecking(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      if (cancelled) return
      setAvailabilityChecking(true)
      void checkUsernameAvailability(usernameNorm)
        .then((res) => {
          if (!cancelled) setAvailability(res)
        })
        .catch(() => {
          if (!cancelled) setAvailability(null)
        })
        .finally(() => {
          if (!cancelled) setAvailabilityChecking(false)
        })
    }, 420)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      setAvailabilityChecking(false)
    }
  }, [usernameNorm, checkUsernameAvailability])

  const onSubmit = async (data: FormValues) => {
    const username = normalizeUsername(data.username)
    if (!isUsernameFormatValid(username)) {
      setError("username", {
        type: "manual",
        message: `Use ${USERNAME_MIN}–${USERNAME_MAX} characters: lowercase a–z, digits, underscore only`,
      })
      return
    }

    setIsLoading(true)
    try {
      const check = await checkUsernameAvailability(username)
      if (!check.valid) {
        setError("username", {
          type: "manual",
          message: check.reason || "Invalid username",
        })
        setIsLoading(false)
        return
      }
      if (!check.available) {
        setError("username", {
          type: "manual",
          message: check.reason || "Username is already taken",
        })
        setIsLoading(false)
        return
      }

      const response = await signUp({
        username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      if (response) {
        toast.success("Account created")
        router.push(resolvePostAuthPath(redirectPath))
      }
    } catch {
      setError("root", {
        type: "manual",
        message: "Could not create your account. Try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signInPath = `/sign-in${buildAuthQuery({ redirect: redirectPath })}`

  const onGoogleSignUp = () => {
    const state = buildGoogleOAuthState(redirectPath)
    window.location.assign(
      `${NEXT_PUBLIC_API_URL}/auth/google?state=${encodeURIComponent(state)}`,
    )
  }

  return (
    <div className={styles.form}>
      <h1 className={styles.title}>Create account</h1>
      <p className={styles.lede}>Create your account to get started.</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.fields}>
          <div>
            <input
              {...register("firstName", { required: "Required" })}
              className={styles.input}
              placeholder="First name"
              autoComplete="given-name"
            />
            {errors.firstName && <p className={styles.error}>{errors.firstName.message}</p>}
          </div>
          <div>
            <input
              {...register("lastName", { required: "Required" })}
              className={styles.input}
              placeholder="Last name"
              autoComplete="family-name"
            />
            {errors.lastName && <p className={styles.error}>{errors.lastName.message}</p>}
          </div>
          <div>
            <input
              {...register("username", {
                required: "Username is required",
                validate: (value) => {
                  const u = normalizeUsername(value)
                  if (u.length < USERNAME_MIN) {
                    return `At least ${USERNAME_MIN} characters`
                  }
                  if (u.length > USERNAME_MAX) {
                    return `At most ${USERNAME_MAX} characters`
                  }
                  if (!isUsernameFormatValid(u)) {
                    return "Only lowercase letters, digits, and underscore (a–z, 0–9, _)"
                  }
                  return true
                },
                onChange: () => clearErrors("username"),
              })}
              className={styles.input}
              placeholder="username"
              autoComplete="username"
              spellCheck={false}
            />
            {errors.username && <p className={styles.error}>{errors.username.message}</p>}
            {!errors.username && usernameNorm.length > 0 && usernameNorm.length < USERNAME_MIN && (
              <p className={styles.hintMuted}>
                {USERNAME_MIN}–{USERNAME_MAX} chars · a–z 0–9 _
              </p>
            )}
            {!errors.username &&
              usernameNorm.length >= USERNAME_MIN &&
              !isUsernameFormatValid(usernameNorm) && (
                <p className={styles.hintWarn}>
                  Invalid characters — use a–z, digits, underscore only
                </p>
              )}
            {!errors.username && isUsernameFormatValid(usernameNorm) && availabilityChecking && (
              <p className={styles.hintMuted}>Checking availability…</p>
            )}
            {!errors.username &&
              isUsernameFormatValid(usernameNorm) &&
              !availabilityChecking &&
              availability &&
              normalizeUsername(availability.username) === usernameNorm &&
              availability.valid &&
              availability.available && (
                <p className={styles.hintOk}>Username available</p>
              )}
            {!errors.username &&
              isUsernameFormatValid(usernameNorm) &&
              !availabilityChecking &&
              availability &&
              normalizeUsername(availability.username) === usernameNorm &&
              (!availability.valid || !availability.available) && (
                <p className={styles.hintWarn}>
                  {availability.reason ||
                    (!availability.available ? "Username taken" : "Invalid username")}
                </p>
              )}
          </div>
          <div>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Enter a valid email",
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
                  required: "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" },
                })}
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
              </button>
            </div>
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          </div>
          <div>
            <div className={styles.passwordWrap}>
              <input
                {...register("confirmPassword", {
                  required: "Confirm your password",
                  validate: (value) => value === password || "Passwords must match",
                })}
                className={styles.input}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className={styles.error}>{errors.confirmPassword.message}</p>
            )}
          </div>
          {errors.root && <div className={styles.rootError}>{errors.root.message}</div>}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            Create account
          </Button>
        </div>
      </form>
      <div className={styles.divider} role="separator">
        <span>Or</span>
      </div>
      <GoogleAuthButton text="Sign up with Google" onClick={onGoogleSignUp} />
      <p className={styles.legalNotice}>
        {signUpCopy.legalNoticePrefix}
        <Link href="/terms" className={styles.legalLink}>
          {signUpCopy.termsLink}
        </Link>
        {signUpCopy.legalNoticeMiddle}
        <Link href="/privacy" className={styles.legalLink}>
          {signUpCopy.privacyLink}
        </Link>
        {signUpCopy.legalNoticeSuffix}
      </p>
      <button type="button" className={styles.footerLink} onClick={() => router.push(signInPath)}>
        Sign in instead
      </button>
    </div>
  )
}
