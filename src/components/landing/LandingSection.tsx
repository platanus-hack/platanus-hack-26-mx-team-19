type Variant = "default" | "muted" | "hero" | "hero-compact" | "compact" | "cta"

type Props = {
  children: React.ReactNode
  id?: string
  variant?: Variant
  "aria-labelledby"?: string
}

export default function LandingSection({
  children,
  id,
  variant = "default",
  "aria-labelledby": ariaLabelledby,
}: Props) {
  const className = ["section", variant !== "default" ? `section--${variant}` : ""]
    .filter(Boolean)
    .join(" ")

  return (
    <section id={id} className={className} aria-labelledby={ariaLabelledby}>
      {children}
      <style jsx>{`
        .section {
          padding: 5.5rem 0;
          border-bottom: 1px solid var(--app-border);
        }
        .section:last-of-type {
          border-bottom: none;
        }
        .section--muted {
          background: var(--app-surface-muted);
        }
        .section--hero {
          position: relative;
          padding-top: 5rem;
          padding-bottom: 6rem;
          overflow: hidden;
          text-align: center;
          background: var(--app-bg);
        }
        .section--hero-compact {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-height: var(--hero-stage-height, calc(100dvh - 3.75rem));
          padding-top: clamp(1.5rem, 6vh, 3rem);
          padding-bottom: clamp(2rem, 6vh, 3rem);
          text-align: center;
          background: transparent;
          border-bottom: none;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .section--compact {
          padding-top: 0;
          padding-bottom: 3rem;
          border-bottom: none;
        }
        .section--cta {
          background: var(--app-text);
          border-bottom: none;
        }
        @media (min-width: 1024px) {
          .section {
            padding: 6.5rem 0;
          }
          .section--hero {
            padding-top: 7rem;
            padding-bottom: 8rem;
          }
          .section--hero-compact {
            padding-top: clamp(2rem, 8vh, 4rem);
            padding-bottom: clamp(2.5rem, 7vh, 3.5rem);
          }
          .section--compact {
            padding-bottom: 4rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .section--hero-compact {
            scroll-snap-align: none;
            scroll-snap-stop: normal;
          }
        }
      `}</style>
    </section>
  )
}
