import { landingContent } from "@/content/landing"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function HowItWorksSection() {
  const { howItWorks } = landingContent

  return (
    <LandingSection id={howItWorks.id} variant="muted" aria-labelledby="landing-how-title">
      <LandingContainer>
        <p className="eyebrow">{howItWorks.eyebrow}</p>
        <h2 id="landing-how-title" className="title">
          {howItWorks.title}
        </h2>
        <ol className="steps">
          {howItWorks.steps.map((step) => (
            <li key={step.step} className="step">
              <span className="step-number">{step.step}</span>
              <div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-text">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
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
        .steps {
          list-style: none;
          margin: 2.5rem 0 0;
          padding: 0;
          display: grid;
          gap: 1px;
          background: var(--app-border);
          border: 1px solid var(--app-border);
          border-radius: var(--app-radius-lg);
          overflow: hidden;
        }
        .step {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: start;
          gap: 1.25rem;
          padding: 1.5rem;
          background: var(--app-surface);
        }
        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--app-text);
          background: var(--app-bg);
          border: 1px solid var(--app-border-strong);
          border-radius: 999px;
        }
        .step-title {
          margin: 0.25rem 0 0.35rem;
          font-size: 0.9375rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--app-text);
        }
        .step-text {
          margin: 0;
          font-size: 0.9375rem;
          line-height: 1.55;
          color: var(--app-text-muted);
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
