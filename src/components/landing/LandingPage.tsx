"use client"

import LandingHeader from "@/components/landing/LandingHeader"
import ArchitecturesSection from "@/components/landing/ArchitecturesSection"
import HeroDottedBackground from "@/components/landing/HeroDottedBackground"
import HeroSection from "@/components/landing/sections/HeroSection"
import LandingFooter from "@/components/landing/sections/LandingFooter"

/** Catalog header offset from panel top — fixed, not tied to viewport bottom. */
const HEADER_HEIGHT = "3.75rem"
const HERO_STAGE_HEIGHT = `calc(100dvh - ${HEADER_HEIGHT})`
const ARCH_CATALOG_OFFSET = "33rem"
const ARCH_STACK_PULL = `calc(${HERO_STAGE_HEIGHT} - ${ARCH_CATALOG_OFFSET})`

export default function LandingPage() {
  return (
    <div className="page landing-snap">
      <LandingHeader />
      <main className="main">
        <div
          id="landing-architectures-panel"
          className="archStack"
          style={
            {
              "--hero-stage-height": HERO_STAGE_HEIGHT,
              "--arch-stack-pull": ARCH_STACK_PULL,
              "--arch-catalog-offset": ARCH_CATALOG_OFFSET,
            } as React.CSSProperties
          }
        >
          <HeroDottedBackground />
          <HeroSection />
          <div className="archCatalog">
            <ArchitecturesSection />
          </div>
        </div>
        <LandingFooter />
      </main>
      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          html:has(.landing-snap) {
            scroll-snap-type: y proximity;
          }
        }
        .archStack :global(.section--compact) {
          background: transparent;
          padding-top: 0;
        }
      `}</style>
      <style jsx>{`
        .page {
          min-height: 100dvh;
          background: var(--app-bg);
        }
        .main {
          position: relative;
          isolation: isolate;
        }
        .archStack {
          position: relative;
          z-index: 1;
          isolation: isolate;
          overflow: hidden;
          background: var(--app-bg);
        }
        .archStack :global(.hero-content),
        .archStack :global(.section--hero-compact) {
          position: relative;
          z-index: 2;
        }
        .archCatalog {
          position: relative;
          z-index: 3;
          margin-top: calc(-1 * var(--arch-stack-pull));
          padding-top: 0;
        }
      `}</style>
    </div>
  )
}
