import { landingContent } from "@/content/landing"
import LandingButton from "../LandingButton"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function FinalCtaSection() {
  const { finalCta } = landingContent

  return (
    <LandingSection variant="cta" aria-labelledby="landing-final-cta-title">
      <LandingContainer>
        <div className="cta">
          <h2 id="landing-final-cta-title" className="title">
            {finalCta.title}
          </h2>
          <p className="lede">{finalCta.lede}</p>
          <div className="actions">
            <LandingButton href={finalCta.primaryCta.href} variant="primary" size="lg" inverted>
              {finalCta.primaryCta.label}
            </LandingButton>
            <LandingButton href={finalCta.secondaryCta.href} variant="secondary" size="lg" inverted>
              {finalCta.secondaryCta.label}
            </LandingButton>
          </div>
        </div>
      </LandingContainer>
      <style jsx>{`
        .cta {
          text-align: center;
        }
        .title {
          margin: 0 auto 1rem;
          max-width: 32rem;
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.025em;
          line-height: 1.1;
          color: var(--app-bg);
          text-wrap: balance;
        }
        .lede {
          margin: 0 auto 1.5rem;
          max-width: 32rem;
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          text-wrap: pretty;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.625rem;
        }
        @media (min-width: 1024px) {
          .title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </LandingSection>
  )
}
