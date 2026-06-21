"use client"

import { AppThemeProvider } from "@/data/providers/AppThemeProvider"
import { ServicesProvider } from "@/data/providers/ServicesProvider"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Slide, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./toastify-theme.css"

function AppToastContainer() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ToastContainer
      position="bottom-right"
      transition={Slide}
      autoClose={4200}
      newestOnTop
      limit={5}
      theme={mounted && resolvedTheme === "dark" ? "dark" : "light"}
      hideProgressBar={false}
      closeOnClick={false}
      pauseOnHover
      draggable={false}
      className="app-toastify-host"
    />
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <ServicesProvider>
        {children}
        <AppToastContainer />
      </ServicesProvider>
    </AppThemeProvider>
  )
}
