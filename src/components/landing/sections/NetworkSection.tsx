import { landingContent } from "@/content/landing"
import NetworkDirectoryPreview from "../NetworkDirectoryPreview"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function NetworkSection() {
  const { network } = landingContent
  const { directory, pillars } = network

  return (
    <LandingSection id={network.id} aria-labelledby="landing-network-title">
      <LandingContainer>
        <div className="layout">
          <header className="header">
            <p className="eyebrow">{network.eyebrow}</p>
            <h2 id="landing-network-title" className="title">
              {network.title}
            </h2>
            <p className="lede">{network.lede}</p>
          </header>

          <div className="preview">
            <NetworkDirectoryPreview
              title={directory.title}
              status={directory.status}
              listings={directory.listings}
            />
          </div>
        </div>

        <ul className="pillars">
          {pillars.map((pillar) => (
            <li key={pillar.title} className="pillar">
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-text">{pillar.description}</p>
            </li>
          ))}
        </ul>
      </LandingContainer>
      <style jsx>{`
        .layout {
          display: grid;
          gap: 2.5rem;
          margin-bottom: 3rem;
        }
        .header {
          max-width: 34rem;
        }
        .eyebrow {
          margin: 0 0 1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: var(--app-tracking-wide);
          text-transform: uppercase;
          color: var(--app-text-muted);
        }
        .title {
          margin: 0 0 1rem;
          font-size: clamp(1.75rem, 4vw, 2.625rem);
          font-weight: 600;
          letter-spacing: var(--app-tracking-tight);
          line-height: 1.06;
          color: var(--app-text);
          text-wrap: balance;
        }
        .lede {
          margin: 0;
          font-size: 1.0625rem;
          line-height: 1.6;
          color: var(--app-text-muted);
          text-wrap: pretty;
        }
        .preview {
          min-width: 0;
        }
        .pillars {
          list-style: none;
          margin: 0;
          padding: 2rem 0 0;
          display: grid;
          gap: 1.5rem 2rem;
          border-top: 1px solid var(--app-border);
          grid-template-columns: 1fr;
        }
        .pillar-title {
          margin: 0 0 0.35rem;
          font-size: 0.9375rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--app-text);
        }
        .pillar-text {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--app-text-muted);
        }
        @media (min-width: 900px) {
          .layout {
            grid-template-columns: minmax(0, 0.95fr) minmax(280px, 1.05fr);
            gap: 3.5rem;
            align-items: start;
          }
          .pillars {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            padding-top: 2.5rem;
          }
        }
      `}</style>
    </LandingSection>
  )
}
