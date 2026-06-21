import { landingContent } from "@/content/landing"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function FeaturesSection() {
  const { features } = landingContent

  return (
    <LandingSection id={features.id} aria-labelledby="landing-features-title">
      <LandingContainer>
        <p className="eyebrow">{features.eyebrow}</p>
        <h2 id="landing-features-title" className="title">
          {features.title}
        </h2>
        <ul className="grid">
          {features.items.map((item) => (
            <li key={item.title} className="card">
              <h3 className="card-title">{item.title}</h3>
              <p className="card-text">{item.description}</p>
            </li>
          ))}
        </ul>
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
        .grid {
          list-style: none;
          margin: 2.5rem 0 0;
          padding: 0;
          display: grid;
          gap: 1px;
          background: var(--app-border);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-lg);
          overflow: hidden;
          grid-template-columns: 1fr;
        }
        .card {
          padding: 1.5rem;
          background: var(--app-surface);
        }
        .card-title {
          margin: 0 0 0.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--app-text);
        }
        .card-text {
          margin: 0;
          font-size: 0.9375rem;
          line-height: 1.55;
          color: var(--app-text-muted);
        }
        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
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
