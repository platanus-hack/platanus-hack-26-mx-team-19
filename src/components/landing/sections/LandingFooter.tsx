import Link from "next/link"
import { landingContent } from "@/content/landing"
import AppLogo from "@/components/ui/AppLogo"
import LandingContainer from "../LandingContainer"

export default function LandingFooter() {
  const { brand, footer } = landingContent
  const year = new Date().getFullYear()
  const copyright = footer.copyright.replace("{year}", String(year))

  return (
    <footer className="footer">
      <LandingContainer>
        <div className="inner">
          <div>
            <AppLogo name={brand.name} href="/" size="md" className="brand" />
            <p className="tagline">{footer.tagline}</p>
          </div>
          <nav className="links" aria-label="Footer">
            {footer.links.map((link) => (
              <Link key={link.label} href={link.href} className="link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </LandingContainer>
      <LandingContainer>
        <p className="copy">{copyright}</p>
      </LandingContainer>
      <style jsx>{`
        .footer {
          padding: 3rem 0 2.25rem;
          background: var(--app-bg);
          border-top: 1px solid var(--app-border);
        }
        .inner {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .brand {
          display: inline-flex;
          margin: 0 0 0.5rem;
        }
        .tagline {
          margin: 0;
          font-size: 0.875rem;
          color: var(--app-text-muted);
          max-width: 28rem;
        }
        .links {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
        }
        .link {
          font-size: 0.875rem;
          color: var(--app-text-muted);
          text-decoration: none;
        }
        .link:hover {
          color: var(--app-text);
          text-decoration: none;
        }
        .copy {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--app-text-faint);
        }
        @media (min-width: 768px) {
          .inner {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }
        }
      `}</style>
    </footer>
  )
}
