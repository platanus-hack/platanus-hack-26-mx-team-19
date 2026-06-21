"use client"

import { landingContent } from "@/content/landing"
import { useServices } from "@/data/providers/ServicesProvider"
import AppLogo from "@/components/ui/AppLogo"
import LandingButton from "./LandingButton"
import LandingContainer from "./LandingContainer"

export default function LandingHeader() {
  const { isLoggedIn, stateService } = useServices()
  const { brand, header } = landingContent

  return (
    <header className="header">
      <LandingContainer>
        <div className="inner">
        <AppLogo name={brand.name} href="/" size="md" className="brand" />
        {header.nav.length > 0 ? (
          <nav className="nav" aria-label="Main">
            {header.nav.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
        <div className="actions">
          {stateService && isLoggedIn ? (
            <LandingButton href="/dashboard" variant="primary">
              {header.dashboardLabel}
            </LandingButton>
          ) : (
            <>
              <LandingButton href="/sign-in" variant="ghost">
                {header.loginLabel}
              </LandingButton>
              <LandingButton href="/sign-up" variant="primary">
                {header.signupLabel}
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
        .nav {
          display: none;
          align-items: center;
          gap: 1.75rem;
        }
        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--app-text-muted);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .nav-link:hover {
          color: var(--app-text);
          text-decoration: none;
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
        @media (min-width: 768px) {
          .nav {
            display: flex;
          }
          .actions {
            margin-left: 0;
          }
        }
      `}</style>
    </header>
  )
}
