import { landingContent } from "@/content/landing"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function FaqSection() {
  const { faq } = landingContent

  return (
    <LandingSection id={faq.id} aria-labelledby="landing-faq-title">
      <LandingContainer narrow>
        <p className="eyebrow">{faq.eyebrow}</p>
        <h2 id="landing-faq-title" className="title">
          {faq.title}
        </h2>
        <dl className="faq">
          {faq.items.map((item) => (
            <div key={item.question} className="faq-item">
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
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
        .faq {
          margin: 2.5rem 0 0;
        }
        .faq-item {
          padding: 1.25rem 0;
          border-bottom: 1px solid var(--app-border);
        }
        .faq-item:first-child {
          border-top: 1px solid var(--app-border);
        }
        .faq-item :global(dt) {
          margin: 0 0 0.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--app-text);
        }
        .faq-item :global(dd) {
          margin: 0;
          font-size: 0.9375rem;
          line-height: 1.6;
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
