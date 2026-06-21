import { landingContent } from "@/content/landing"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function SocialProofSection() {
  const { socialProof } = landingContent

  return (
    <LandingSection variant="muted" aria-labelledby="landing-proof-title">
      <LandingContainer>
        <p className="eyebrow">{socialProof.eyebrow}</p>
        <h2 id="landing-proof-title" className="title">
          {socialProof.title}
        </h2>
        <ul className="stats">
          {socialProof.stats.map((stat) => (
            <li key={stat.label} className="stat">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </li>
          ))}
        </ul>
        <blockquote className="quote">
          <p>&ldquo;{socialProof.quote.text}&rdquo;</p>
          <footer>{socialProof.quote.attribution}</footer>
        </blockquote>
      </LandingContainer>
      <style jsx>{`
        .eyebrow {
          display: inline-block;
          margin: 0 0 1rem;
          padding: 0.3125rem 0.6875rem;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: var(--app-text-muted);
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: 999px;
        }
        .title {
          margin: 0 0 1rem;
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.025em;
          line-height: 1.1;
          color: var(--app-text);
          text-wrap: balance;
        }
        .stats {
          list-style: none;
          margin: 2.5rem 0;
          padding: 0;
          display: grid;
          gap: 1px;
          background: var(--app-border);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-lg);
          overflow: hidden;
          grid-template-columns: 1fr;
        }
        .stat {
          padding: 1.5rem;
          background: var(--app-surface);
        }
        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: var(--app-tracking-tight);
          line-height: 1;
          color: var(--app-text);
        }
        .stat-label {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.8125rem;
          line-height: 1.4;
          color: var(--app-text-muted);
        }
        .quote {
          margin: 0;
          padding: 2rem;
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-lg);
        }
        .quote :global(p) {
          margin: 0 0 1rem;
          font-size: 1.125rem;
          line-height: 1.55;
          letter-spacing: -0.015em;
          color: var(--app-text);
          text-wrap: balance;
        }
        .quote :global(footer) {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--app-text-muted);
        }
        @media (min-width: 640px) {
          .stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .title {
            font-size: 2.5rem;
          }
          .stat-value {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </LandingSection>
  )
}
