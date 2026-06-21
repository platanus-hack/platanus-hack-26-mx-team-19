import { landingContent } from "@/content/landing"
import ArchitectureCard from "../ArchitectureCard"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function ArchitecturesSection() {
  const { architectures } = landingContent

  return (
    <LandingSection
      id={architectures.id}
      variant="compact"
      aria-labelledby="landing-architectures-title"
    >
      <LandingContainer>
        <header className="header">
          <p className="eyebrow">{architectures.eyebrow}</p>
          <h2 id="landing-architectures-title" className="sr-only">
            {architectures.eyebrow}
          </h2>
        </header>

        <ul className="grid">
          {architectures.items.map((architecture) => (
            <li key={architecture.name}>
              <ArchitectureCard architecture={architecture} />
            </li>
          ))}
        </ul>
      </LandingContainer>
      <style jsx>{`
        .header {
          margin-bottom: 1.25rem;
        }
        .eyebrow {
          margin: 0;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: var(--app-tracking-wide);
          text-transform: uppercase;
          color: var(--app-text-faint);
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .grid {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1.25rem;
          }
        }
      `}</style>
    </LandingSection>
  )
}
