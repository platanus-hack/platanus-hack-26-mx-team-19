import { landingContent } from "@/content/landing"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function SolutionSection() {
  const { solution } = landingContent

  return (
    <LandingSection id={solution.id} aria-labelledby="landing-solution-title">
      <LandingContainer>
        <div className="split">
          <div>
            <p className="eyebrow">{solution.eyebrow}</p>
            <h2 id="landing-solution-title" className="title">
              {solution.title}
            </h2>
            <p className="lede">{solution.lede}</p>
          </div>
          <ul className="checklist">
            {solution.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </LandingContainer>
      <style jsx>{`
        .split {
          display: grid;
          gap: 2.5rem;
          align-items: start;
        }
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
        .lede {
          margin: 0 0 1.5rem;
          max-width: 42rem;
          font-size: 1rem;
          line-height: 1.6;
          color: var(--app-text-muted);
          text-wrap: pretty;
        }
        .checklist {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 0.875rem;
        }
        .checklist :global(li) {
          position: relative;
          padding-left: 1.75rem;
          font-size: 0.9375rem;
          line-height: 1.55;
          color: var(--app-text);
        }
        .checklist :global(li::before) {
          content: "";
          position: absolute;
          left: 0;
          top: 0.5rem;
          width: 0.875rem;
          height: 0.875rem;
          border-radius: 50%;
          background:
            radial-gradient(circle, var(--app-text) 35%, transparent 38%),
            var(--app-surface);
          border: 1px solid var(--app-border-strong);
        }
        @media (min-width: 768px) {
          .split {
            grid-template-columns: 1fr 1fr;
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
