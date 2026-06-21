"use client"

import LandingContainer from "@/components/landing/LandingContainer"
import LandingFooter from "@/components/landing/sections/LandingFooter"
import LandingHeader from "@/components/landing/LandingHeader"

type Props = {
  title: string
  eyebrow: string
  children: React.ReactNode
}

export default function LegalDocumentShell({ title, eyebrow, children }: Props) {
  return (
    <div className="page">
      <LandingHeader />
      <main className="main">
        <LandingContainer narrow>
          <header className="hero">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="title">{title}</h1>
          </header>
          <article className="article">{children}</article>
        </LandingContainer>
      </main>
      <LandingFooter />
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: var(--app-bg);
        }
        .main {
          padding: 2.5rem 0 3rem;
        }
        .hero {
          margin-bottom: 2rem;
        }
        .eyebrow {
          margin: 0 0 0.75rem;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--app-accent);
        }
        .title {
          margin: 0;
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: var(--app-text);
        }
        .article {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          font-size: 0.9375rem;
          line-height: 1.65;
          color: var(--app-text-muted);
        }
        .article :global(p) {
          margin: 0;
        }
        .article :global(ul) {
          margin: 0;
          padding-left: 1.25rem;
        }
        .article :global(li + li) {
          margin-top: 0.5rem;
        }
        @media (min-width: 768px) {
          .main {
            padding: 3rem 0 4rem;
          }
          .hero {
            margin-bottom: 2.5rem;
          }
        }
      `}</style>
    </div>
  )
}
