import HeroDottedBackground from "../HeroDottedBackground"
import { landingContent } from "@/content/landing"
import SkillCopyCommand from "../SkillCopyCommand"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function HeroSection() {
  const { hero } = landingContent

  return (
    <LandingSection variant="hero-compact" aria-labelledby="landing-hero-title">
      <HeroDottedBackground />
      <LandingContainer narrow className="hero-content">
        <div className="inner">
          <p className="badge">{hero.badge}</p>
          <h1 id="landing-hero-title" className="title">
            {hero.title}
          </h1>
          <p className="lede">{hero.lede}</p>
          <SkillCopyCommand />
        </div>
      </LandingContainer>
      <style jsx global>{`
        .hero-content {
          position: relative;
          z-index: 2;
        }
      `}</style>
      <style jsx>{`
        .inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          margin: clamp(2rem, 7vh, 3.5rem) auto 0;
        }
        .badge {
          margin: 0 0 1rem;
          padding: 0.3rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: var(--app-tracking-wide);
          text-transform: uppercase;
          color: var(--app-text-muted);
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--app-border) 70%, transparent);
          border-radius: 999px;
        }
        .title {
          margin: 0 0 0.875rem;
          max-width: 26ch;
          font-size: 1.75rem;
          font-weight: 600;
          letter-spacing: var(--app-tracking-tight);
          line-height: 1.12;
          color: var(--app-text);
          text-wrap: balance;
        }
        .lede {
          margin: 0 0 1.5rem;
          max-width: 36rem;
          font-size: 0.9375rem;
          line-height: 1.55;
          color: var(--app-text-muted);
          text-wrap: pretty;
        }
        @media (min-width: 768px) {
          .title {
            font-size: 2.125rem;
            max-width: 22ch;
          }
        }
        @media (max-width: 639px) {
          .inner {
            margin-top: clamp(1.25rem, 5vh, 2rem);
          }
          .title {
            font-size: 1.625rem;
          }
          .lede {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </LandingSection>
  )
}
