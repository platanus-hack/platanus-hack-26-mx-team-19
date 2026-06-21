"use client"

import { useServices } from "@/data/providers/ServicesProvider"
import { useMessages } from "@/i18n/LocaleProvider"
import AppLogo from "@/components/ui/AppLogo"
import LocaleToggle from "@/components/ui/LocaleToggle"
import { landingContent } from "@/content/landing"
import LandingButton from "./LandingButton"
import LandingContainer from "./LandingContainer"

export default function LandingHeader() {
  const { isLoggedIn, stateService } = useServices()
  const { brand } = landingContent
  const t = useMessages().landing.header

  return (
    <header className="header">
      <LandingContainer>
        <div className="inner">
        <AppLogo name={brand.name} href="/" size="md" className="brand" />
        <div className="actions">
          <LocaleToggle />
          {stateService && isLoggedIn ? (
            <LandingButton href="/dashboard" variant="primary">
              {t.dashboardLabel}
            </LandingButton>
          ) : (
            <>
              <LandingButton href="/sign-in" variant="ghost">
                {t.loginLabel}
              </LandingButton>
              <LandingButton href="/sign-up" variant="primary">
                {t.signupLabel}
              </LandingButton>
            </>
          )}
        </div>
        </div>
      </LandingContainer>
      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 40;
          padding-top: env(safe-area-inset-top, 0);
          background: color-mix(in srgb, var(--app-bg) 72%, transparent);
          border-bottom: 1px solid var(--app-border);
          backdrop-filter: saturate(180%) blur(14px);
          -webkit-backdrop-filter: saturate(180%) blur(14px);
        }
        .inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          min-height: 3.75rem;
        }
        .brand {
          flex-shrink: 0;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
          flex-shrink: 0;
        }
        @media (max-width: 420px) {
          .inner {
            gap: 0.625rem;
          }
          .actions {
            gap: 0.375rem;
          }
        }
      `}</style>
    </header>
  )
}
