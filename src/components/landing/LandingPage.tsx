"use client"

import LandingHeader from "@/components/landing/LandingHeader"
import ArchitecturesSection from "@/components/landing/sections/ArchitecturesSection"
import HeroSection from "@/components/landing/sections/HeroSection"
import LandingFooter from "@/components/landing/sections/LandingFooter"

export default function LandingPage() {
  return (
    <div className="page">
      <LandingHeader />
      <main>
        <HeroSection />
        <ArchitecturesSection />
      </main>
      <LandingFooter />
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: var(--app-bg);
        }
      `}</style>
    </div>
  )
}
