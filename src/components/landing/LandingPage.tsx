"use client"

import LandingHeader from "@/components/landing/LandingHeader"
import ArchitecturesSection from "@/components/landing/ArchitecturesSection"
import HeroSection from "@/components/landing/sections/HeroSection"
import LandingFooter from "@/components/landing/sections/LandingFooter"

export default function LandingPage() {
  return (
    <div className="page landing-snap">
      <LandingHeader />
      <main className="main">
        <HeroSection />
        <div id="landing-architectures-panel" className="belowHero">
          <ArchitecturesSection />
          <LandingFooter />
        </div>
      </main>
      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          html:has(.landing-snap) {
            scroll-snap-type: y mandatory;
          }
        }
      `}</style>
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: var(--app-bg);
        }
        .main {
          position: relative;
          isolation: isolate;
        }
        .belowHero {
          position: relative;
          z-index: 2;
          min-height: calc(100dvh - 3.75rem);
          padding-top: 3.75rem;
          box-sizing: border-box;
          background: var(--app-bg);
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        @media (prefers-reduced-motion: reduce) {
          .belowHero {
            scroll-snap-align: none;
            scroll-snap-stop: normal;
          }
        }
      `}</style>
    </div>
  )
}
